'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeOfDay = 'day' | 'sunset' | 'night';
type Quality   = 'ultralow' | 'low' | 'medium' | 'high';

interface SceneConfig {
  windStrength: number;
  windSpeed: number;
  bladeScale: number;
  timeOfDay: TimeOfDay;
  autoRotate: boolean;
  fog: boolean;
  quality: Quality;
}

// ─── Quality presets ─────────────────────────────────────────────────────────

const QUALITY: Record<Quality, {
  blades: number;
  segments: number;
  antialias: boolean;
  simpleWind: boolean;        // 1 sin call vs 3
  label: string;
  description: string;
}> = {
  ultralow: { blades: 300,  segments: 2, antialias: false, simpleWind: true,  label: 'Ultra Low', description: '300 blades' },
  low:      { blades: 1200, segments: 3, antialias: false, simpleWind: true,  label: 'Low',       description: '1 200 blades' },
  medium:   { blades: 3500, segments: 4, antialias: false, simpleWind: false, label: 'Medium',    description: '3 500 blades' },
  high:     { blades: 7000, segments: 6, antialias: true,  simpleWind: false, label: 'High',      description: '7 000 blades' },
};

// ─── Sky / lighting presets ───────────────────────────────────────────────────

const SKY: Record<TimeOfDay, {
  sunPosition: [number, number, number];
  turbidity: number; rayleigh: number;
  ambientColor: string; ambientIntensity: number;
  dirColor: string;   dirIntensity: number;
  dirPosition: [number, number, number];
  fogColor: string;   bg: string;
}> = {
  day: {
    sunPosition: [80, 35, 60], turbidity: 5, rayleigh: 0.9,
    ambientColor: '#e8f5e9', ambientIntensity: 1.4,
    dirColor: '#fffbe8',    dirIntensity: 2.8, dirPosition: [10, 20, 8],
    fogColor: '#b4d9f0', bg: '#87ceeb',
  },
  sunset: {
    sunPosition: [8, 4, 80], turbidity: 12, rayleigh: 2.5,
    ambientColor: '#ffe5cc', ambientIntensity: 0.9,
    dirColor: '#ff9a4a',    dirIntensity: 2.2, dirPosition: [20, 5, 10],
    fogColor: '#e8a070', bg: '#d4704a',
  },
  night: {
    sunPosition: [-80, -10, 60], turbidity: 20, rayleigh: 0.1,
    ambientColor: '#1a2a4a', ambientIntensity: 0.3,
    dirColor: '#c8d8f0',    dirIntensity: 0.6, dirPosition: [5, 15, 5],
    fogColor: '#050d18', bg: '#050d18',
  },
};

// ─── Shaders ──────────────────────────────────────────────────────────────────

// Full quality (med/high) — 3 oscillation terms
const vertexFull = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindSpeed;
  uniform float uBladeScale;
  varying vec2 vUv;
  varying float vHeight;
  varying vec2 vWorldXZ;
  void main() {
    vUv = uv;
    vHeight = uv.y;
    float wx = instanceMatrix[3][0];
    float wz = instanceMatrix[3][2];
    vWorldXZ = vec2(wx, wz);
    vec3 pos = position;
    pos.y *= uBladeScale;
    float wi = pow(vHeight, 1.8) * uWindStrength;
    float t  = uTime * uWindSpeed;
    float w  = sin(t * 1.4 + wx * 0.45 + wz * 0.32) * 0.28;
    w += sin(t * 2.7 + wx * 1.1) * 0.07;
    w += cos(t * 0.8 + wz * 0.55) * 0.09;
    pos.x += w * wi;
    pos.z += w * wi * 0.22;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

// Low quality — single sin, cheaper
const vertexSimple = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindSpeed;
  uniform float uBladeScale;
  varying vec2 vUv;
  varying float vHeight;
  varying vec2 vWorldXZ;
  void main() {
    vUv = uv;
    vHeight = uv.y;
    float wx = instanceMatrix[3][0];
    float wz = instanceMatrix[3][2];
    vWorldXZ = vec2(wx, wz);
    vec3 pos = position;
    pos.y *= uBladeScale;
    float wi = pow(vHeight, 2.0) * uWindStrength;
    float w  = sin(uTime * uWindSpeed * 1.4 + wx * 0.45 + wz * 0.32) * 0.28;
    pos.x += w * wi;
    pos.z += w * wi * 0.22;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vHeight;
  varying vec2 vWorldXZ;
  void main() {
    vec3 root = vec3(0.04, 0.18, 0.03);
    vec3 mid  = vec3(0.15, 0.46, 0.08);
    vec3 tip  = vec3(0.46, 0.74, 0.17);
    vec3 col  = mix(root, mid, smoothstep(0.0, 0.5, vHeight));
    col = mix(col, tip, smoothstep(0.5, 1.0, vHeight));
    float hash = fract(sin(vWorldXZ.x * 13.745 + vWorldXZ.y * 7.312) * 43758.553);
    col = mix(col, vec3(0.62, 0.66, 0.18), hash * 0.18 * vHeight);
    col *= (1.0 - abs(vUv.x * 2.0 - 1.0) * 0.3);
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── Blade geometry ───────────────────────────────────────────────────────────

function createBladeGeometry(segs: number): THREE.BufferGeometry {
  const W = 0.055, H = 1.0;
  const pos: number[] = [], uvs: number[] = [], idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, y = t * H;
    const w = W * (1 - t * 0.9), lean = t * t * 0.08;
    pos.push(-w / 2, y, lean, w / 2, y, lean);
    uvs.push(0, t, 1, t);
    if (i < segs) {
      const b = i * 2;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ─── FPS monitor — auto-suggests downgrade once ───────────────────────────────

function FPSMonitor({ quality, onSlow }: { quality: Quality; onSlow: () => void }) {
  const frames = useRef(0);
  const lastT  = useRef(performance.now());
  const fired  = useRef(false);

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    const elapsed = now - lastT.current;
    if (elapsed >= 2500) {
      const fps = (frames.current / elapsed) * 1000;
      frames.current = 0;
      lastT.current  = now;
      if (!fired.current && fps < 28 && quality !== 'ultralow') {
        fired.current = true;
        onSlow();
      }
    }
  });
  return null;
}

// ─── Grass field (keyed on quality so it remounts on preset change) ───────────

const FIELD_RADIUS = 22;

function GrassField({ config }: { config: SceneConfig }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const qp = QUALITY[config.quality];

  const geo = useMemo(() => createBladeGeometry(qp.segments), [config.quality]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: qp.simpleWind ? vertexSimple : vertexFull,
    fragmentShader,
    uniforms: {
      uTime:          { value: 0 },
      uWindStrength:  { value: config.windStrength },
      uWindSpeed:     { value: config.windSpeed },
      uBladeScale:    { value: config.bladeScale },
    },
    side: THREE.DoubleSide,
  }), [config.quality]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < qp.blades; i++) {
      const r = Math.sqrt(Math.random()) * FIELD_RADIUS;
      const a = Math.random() * Math.PI * 2;
      dummy.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(0.8 + Math.random() * 0.5, 0.5 + Math.random() * 1.3, 0.8 + Math.random() * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.usage = THREE.StaticDrawUsage;
    mesh.instanceMatrix.needsUpdate = true;
  }, [config.quality]);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value         = clock.elapsedTime;
    mat.uniforms.uWindStrength.value = config.windStrength;
    mat.uniforms.uWindSpeed.value    = config.windSpeed;
    mat.uniforms.uBladeScale.value   = config.bladeScale;
  });

  return (
    <instancedMesh
      ref={meshRef}
      key={config.quality}            // remount when preset changes
      args={[geo, mat, qp.blades]}
      frustumCulled={false}
    />
  );
}

// ─── Reactive lighting ────────────────────────────────────────────────────────

function SceneLighting({ config }: { config: SceneConfig }) {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    const p = SKY[config.timeOfDay];
    ambRef.current?.color.set(p.ambientColor);
    if (ambRef.current) ambRef.current.intensity = p.ambientIntensity;
    dirRef.current?.color.set(p.dirColor);
    if (dirRef.current) {
      dirRef.current.intensity = p.dirIntensity;
      dirRef.current.position.set(...p.dirPosition);
    }
    scene.background = new THREE.Color(p.bg);
    if (scene.fog) (scene.fog as THREE.Fog).color.set(p.fogColor);
  }, [config.timeOfDay, scene]);

  const p = SKY[config.timeOfDay];
  return (
    <>
      <ambientLight    ref={ambRef} color={p.ambientColor} intensity={p.ambientIntensity} />
      <directionalLight ref={dirRef} position={p.dirPosition} color={p.dirColor} intensity={p.dirIntensity} />
      <hemisphereLight args={['#87ceeb', '#2a5c10', 0.5]} />
    </>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────

function GrassScene({ config, onSlow }: { config: SceneConfig; onSlow: () => void }) {
  const p  = SKY[config.timeOfDay];
  const qp = QUALITY[config.quality];

  return (
    <Canvas
      camera={{ position: [0, 2.5, 14], fov: 55 }}
      gl={{ antialias: qp.antialias, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      {/* AdaptiveDpr lowers pixel ratio automatically when FPS drops */}
      <AdaptiveDpr pixelated />

      <color attach="background" args={[p.bg]} />
      {config.fog && <fog attach="fog" args={[p.fogColor, 28, 70]} />}
      <Sky distance={450000} sunPosition={p.sunPosition} turbidity={p.turbidity} rayleigh={p.rayleigh} />
      <SceneLighting config={config} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[FIELD_RADIUS + 6, qp.antialias ? 72 : 48]} />
        <meshStandardMaterial color="#1a2c0d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0e1a08" roughness={1} />
      </mesh>

      <GrassField config={config} />
      <FPSMonitor quality={config.quality} onSlow={onSlow} />

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.08}
        minPolarAngle={0.08}
        minDistance={3}
        maxDistance={32}
        autoRotate={config.autoRotate}
        autoRotateSpeed={0.35}
      />
    </Canvas>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300 font-mono tabular-nums">{value.toFixed(step < 0.1 ? 2 : 1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-green-400"
        style={{ background: `linear-gradient(to right, #4ade80 ${pct}%, #27272a ${pct}%)` }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs text-zinc-400">{label}</span>
      <div onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-zinc-700'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

function ConfigPanel({ config, onChange, perfWarning, onDismissWarning }: {
  config: SceneConfig;
  onChange: (c: SceneConfig) => void;
  perfWarning: boolean;
  onDismissWarning: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = useCallback(<K extends keyof SceneConfig>(key: K, val: SceneConfig[K]) =>
    onChange({ ...config, [key]: val }), [config, onChange]);

  return (
    <>
      {/* Collapse tab */}
      <button onClick={() => setOpen((o) => !o)}
        className="absolute z-30 flex items-center justify-center w-6 h-16 rounded-l-lg bg-black/60 border border-r-0 border-white/10 text-zinc-400 hover:text-white transition-all duration-300"
        style={{ right: open ? 288 : 0, top: '50%', transform: 'translateY(-50%)' }}>
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Panel */}
      <div className="absolute top-0 right-0 bottom-0 z-20 flex flex-col overflow-y-auto transition-transform duration-300"
        style={{
          width: 288,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          background: 'rgba(8,8,8,0.78)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}>

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <p className="text-[10px] text-green-400 font-mono tracking-widest uppercase mb-1">Configure</p>
          <h2 className="text-white font-semibold text-sm">3D Grass Field</h2>
        </div>

        {/* Low-perf warning */}
        {perfWarning && (
          <div className="mx-4 mt-4 rounded-xl border border-amber-500/30 bg-amber-900/20 p-3 text-xs text-amber-300">
            <div className="flex justify-between items-start gap-2">
              <p>Low FPS detected — switched to <strong>{QUALITY[config.quality].label}</strong> quality automatically.</p>
              <button onClick={onDismissWarning} className="shrink-0 text-amber-500 hover:text-amber-300 mt-0.5">✕</button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 px-5 py-5">

          {/* Quality */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Quality</p>
            <div className="grid grid-cols-2 gap-2">
              {(['ultralow', 'low', 'medium', 'high'] as Quality[]).map((q) => (
                <button key={q} onClick={() => set('quality', q)}
                  className={`py-1.5 rounded-lg border text-xs transition-all ${
                    config.quality === q
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : 'border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                  }`}>
                  {QUALITY[q].label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5">{QUALITY[config.quality].description} · segments {QUALITY[config.quality].segments}</p>
          </div>

          {/* Wind */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Wind</p>
            <div className="flex flex-col gap-4">
              <Slider label="Strength" value={config.windStrength} min={0} max={1} step={0.01} onChange={(v) => set('windStrength', v)} />
              <Slider label="Speed"    value={config.windSpeed}    min={0.1} max={3} step={0.05} onChange={(v) => set('windSpeed', v)} />
            </div>
          </div>

          {/* Blades */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Blades</p>
            <Slider label="Height scale" value={config.bladeScale} min={0.3} max={2.5} step={0.05} onChange={(v) => set('bladeScale', v)} />
          </div>

          {/* Lighting */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Lighting</p>
            <div className="flex gap-2">
              {(['day', 'sunset', 'night'] as TimeOfDay[]).map((t) => (
                <button key={t} onClick={() => set('timeOfDay', t)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border capitalize transition-all ${
                    config.timeOfDay === t
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : 'border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Scene</p>
            <div className="flex flex-col gap-3">
              <Toggle label="Auto-rotate"    value={config.autoRotate} onChange={(v) => set('autoRotate', v)} />
              <Toggle label="Distance fog"   value={config.fog}        onChange={(v) => set('fog', v)} />
            </div>
          </div>

          {/* Reset */}
          <button onClick={() => onChange(DEFAULT_CONFIG)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-left">
            ↺ Reset to defaults
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SceneConfig = {
  windStrength: 0.9,
  windSpeed: 1.0,
  bladeScale: 1.0,
  timeOfDay: 'day',
  autoRotate: true,
  fog: true,
  quality: 'high',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Grass3DPage() {
  const [config, setConfig]           = useState<SceneConfig>(DEFAULT_CONFIG);
  const [perfWarning, setPerfWarning] = useState(false);

  const handleSlow = useCallback(() => {
    setConfig((c) => {
      const step: Record<Quality, Quality> = { high: 'medium', medium: 'low', low: 'ultralow', ultralow: 'ultralow' };
      return { ...c, quality: step[c.quality] };
    });
    setPerfWarning(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0e1a08]">

      <div className="absolute inset-0">
        <GrassScene config={config} onSlow={handleSlow} />
      </div>

      {/* Top veil */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />

      {/* Nav */}
      <nav className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <path d="M12 3 C10 3 8 5 8 8 C8 11 10 14 12 22 C14 14 16 11 16 8 C16 5 14 3 12 3Z" fill="#4ade80" opacity="0.9" />
            <path d="M12 8 C10 6 7 6 5 8 C7 10 10 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M12 8 C14 6 17 6 19 8 C17 10 14 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="text-white font-semibold text-base tracking-tight">Grass Animations</span>
        </Link>
        <div className="hidden sm:flex items-center gap-7 text-sm text-zinc-400">
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
      </nav>

      {/* Title */}
      <div className="absolute bottom-10 left-10 z-10 pointer-events-none">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-900/20 px-3 py-1 text-xs text-green-400 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {QUALITY[config.quality].description} · WebGL
        </div>
        <h1 className="text-4xl font-bold text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          3D Grass Field
        </h1>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-10 z-10 pointer-events-none flex flex-col items-end gap-1.5 text-xs text-zinc-500"
        style={{ right: 300 }}>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path d="M8 12h8M12 8l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Drag to rotate
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 5v14M8 9l4-4 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Scroll to zoom
        </span>
      </div>

      {/* Config panel */}
      <ConfigPanel
        config={config}
        onChange={setConfig}
        perfWarning={perfWarning}
        onDismissWarning={() => setPerfWarning(false)}
      />
    </div>
  );
}
