'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeOfDay = 'day' | 'sunset' | 'night';

interface SceneConfig {
  windStrength: number;   // 0–1
  windSpeed: number;      // 0.2–3
  bladeScale: number;     // 0.4–2
  timeOfDay: TimeOfDay;
  autoRotate: boolean;
  fog: boolean;
}

// ─── Sky presets ─────────────────────────────────────────────────────────────

const skyPresets: Record<TimeOfDay, {
  sunPosition: [number, number, number];
  turbidity: number;
  rayleigh: number;
  ambientColor: string;
  ambientIntensity: number;
  dirColor: string;
  dirIntensity: number;
  dirPosition: [number, number, number];
  fogColor: string;
  bg: string;
}> = {
  day: {
    sunPosition: [80, 35, 60],
    turbidity: 5, rayleigh: 0.9,
    ambientColor: '#e8f5e9', ambientIntensity: 1.4,
    dirColor: '#fffbe8', dirIntensity: 2.8,
    dirPosition: [10, 20, 8],
    fogColor: '#b4d9f0', bg: '#87ceeb',
  },
  sunset: {
    sunPosition: [8, 4, 80],
    turbidity: 12, rayleigh: 2.5,
    ambientColor: '#ffe5cc', ambientIntensity: 0.9,
    dirColor: '#ff9a4a', dirIntensity: 2.2,
    dirPosition: [20, 5, 10],
    fogColor: '#e8a070', bg: '#d4704a',
  },
  night: {
    sunPosition: [-80, -10, 60],
    turbidity: 20, rayleigh: 0.1,
    ambientColor: '#1a2a4a', ambientIntensity: 0.3,
    dirColor: '#c8d8f0', dirIntensity: 0.6,
    dirPosition: [5, 15, 5],
    fogColor: '#050d18', bg: '#050d18',
  },
};

// ─── Shaders ─────────────────────────────────────────────────────────────────

const vertexShader = `
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

    float windInfluence = pow(vHeight, 1.8) * uWindStrength;
    float phase = wx * 0.45 + wz * 0.32;
    float t = uTime * uWindSpeed;
    float wind = sin(t * 1.4 + phase) * 0.28;
    wind += sin(t * 2.7 + wx * 1.1) * 0.07;
    wind += cos(t * 0.8 + wz * 0.55) * 0.09;
    pos.x += wind * windInfluence;
    pos.z += wind * windInfluence * 0.22;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vHeight;
  varying vec2 vWorldXZ;

  void main() {
    vec3 rootColor = vec3(0.04, 0.18, 0.03);
    vec3 midColor  = vec3(0.15, 0.46, 0.08);
    vec3 tipColor  = vec3(0.46, 0.74, 0.17);
    vec3 color = mix(rootColor, midColor, smoothstep(0.0, 0.5, vHeight));
    color = mix(color, tipColor, smoothstep(0.5, 1.0, vHeight));
    float hash = fract(sin(vWorldXZ.x * 13.745 + vWorldXZ.y * 7.312) * 43758.553);
    color = mix(color, vec3(0.62, 0.66, 0.18), hash * 0.18 * vHeight);
    float edgeFade = abs(vUv.x * 2.0 - 1.0);
    color *= (1.0 - edgeFade * 0.3);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Blade geometry ───────────────────────────────────────────────────────────

function createBladeGeometry(): THREE.BufferGeometry {
  const SEGS = 6;
  const W = 0.052, H = 1.0;
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS, y = t * H;
    const w = W * (1 - t * 0.9), lean = t * t * 0.08;
    positions.push(-w / 2, y, lean, w / 2, y, lean);
    uvs.push(0, t, 1, t);
    if (i < SEGS) {
      const b = i * 2;
      indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─── Grass field ─────────────────────────────────────────────────────────────

const BLADE_COUNT = 7000;
const FIELD_RADIUS = 22;

function GrassField({ config }: { config: SceneConfig }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(createBladeGeometry, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader, fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uWindStrength: { value: config.windStrength },
      uWindSpeed: { value: config.windSpeed },
      uBladeScale: { value: config.bladeScale },
    },
    side: THREE.DoubleSide,
  }), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < BLADE_COUNT; i++) {
      const r = Math.sqrt(Math.random()) * FIELD_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(0.8 + Math.random() * 0.5, 0.5 + Math.random() * 1.3, 0.8 + Math.random() * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uWindStrength.value = config.windStrength;
    mat.uniforms.uWindSpeed.value = config.windSpeed;
    mat.uniforms.uBladeScale.value = config.bladeScale;
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, BLADE_COUNT]} frustumCulled={false} />;
}

// ─── Lighting that reacts to time-of-day ─────────────────────────────────────

function SceneLighting({ config }: { config: SceneConfig }) {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    const p = skyPresets[config.timeOfDay];
    if (ambRef.current) {
      ambRef.current.color.set(p.ambientColor);
      ambRef.current.intensity = p.ambientIntensity;
    }
    if (dirRef.current) {
      dirRef.current.color.set(p.dirColor);
      dirRef.current.intensity = p.dirIntensity;
      dirRef.current.position.set(...p.dirPosition);
    }
    scene.background = new THREE.Color(p.bg);
    if (scene.fog) (scene.fog as THREE.Fog).color.set(p.fogColor);
  }, [config.timeOfDay, scene]);

  const p = skyPresets[config.timeOfDay];
  return (
    <>
      <ambientLight ref={ambRef} color={p.ambientColor} intensity={p.ambientIntensity} />
      <directionalLight ref={dirRef} position={p.dirPosition} color={p.dirColor} intensity={p.dirIntensity} />
      <hemisphereLight args={['#87ceeb', '#2a5c10', 0.7]} />
    </>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────

function GrassScene({ config }: { config: SceneConfig }) {
  const p = skyPresets[config.timeOfDay];
  return (
    <Canvas camera={{ position: [0, 2.5, 14], fov: 55 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={[p.bg]} />
      {config.fog && <fog attach="fog" args={[p.fogColor, 28, 70]} />}
      <Sky distance={450000} sunPosition={p.sunPosition} turbidity={p.turbidity} rayleigh={p.rayleigh} />
      <SceneLighting config={config} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[FIELD_RADIUS + 6, 72]} />
        <meshStandardMaterial color="#1a2c0d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0e1a08" roughness={1} />
      </mesh>
      <GrassField config={config} />
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

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step, unit = '',
  onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300 font-mono tabular-nums">{value.toFixed(step < 0.1 ? 2 : 1)}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-green-400"
        style={{ background: `linear-gradient(to right, #4ade80 ${((value - min) / (max - min)) * 100}%, #27272a ${((value - min) / (max - min)) * 100}%)` }}
      />
    </div>
  );
}

// ─── Config Panel ─────────────────────────────────────────────────────────────

function ConfigPanel({ config, onChange }: { config: SceneConfig; onChange: (c: SceneConfig) => void }) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof SceneConfig>(key: K, val: SceneConfig[K]) =>
    onChange({ ...config, [key]: val });

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-6 h-16 rounded-l-lg bg-black/60 border border-r-0 border-white/10 text-zinc-400 hover:text-white transition-all"
        style={{ right: open ? 288 : 0 }}
      >
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-0' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className="absolute top-0 right-0 bottom-0 z-20 flex flex-col overflow-y-auto transition-transform duration-300"
        style={{
          width: 288,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          background: 'rgba(8,8,8,0.75)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Panel header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <p className="text-[10px] text-green-400 font-mono tracking-widest uppercase mb-1">Configure</p>
          <h2 className="text-white font-semibold text-sm">3D Grass Field</h2>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">

          {/* Wind */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Wind</p>
            <div className="flex flex-col gap-4">
              <Slider label="Strength" value={config.windStrength} min={0} max={1} step={0.01}
                onChange={(v) => set('windStrength', v)} />
              <Slider label="Speed" value={config.windSpeed} min={0.1} max={3} step={0.05}
                onChange={(v) => set('windSpeed', v)} />
            </div>
          </div>

          {/* Blades */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Blades</p>
            <Slider label="Height scale" value={config.bladeScale} min={0.3} max={2.5} step={0.05}
              onChange={(v) => set('bladeScale', v)} />
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
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Camera */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Camera</p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-zinc-400">Auto-rotate</span>
              <div
                onClick={() => set('autoRotate', !config.autoRotate)}
                className={`relative w-9 h-5 rounded-full transition-colors ${config.autoRotate ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.autoRotate ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>

          {/* Fog */}
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-3">Scene</p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-zinc-400">Distance fog</span>
              <div
                onClick={() => set('fog', !config.fog)}
                className={`relative w-9 h-5 rounded-full transition-colors ${config.fog ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.fog ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange(defaultConfig)}
            className="mt-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-left"
          >
            ↺ Reset to defaults
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Default config ───────────────────────────────────────────────────────────

const defaultConfig: SceneConfig = {
  windStrength: 0.9,
  windSpeed: 1.0,
  bladeScale: 1.0,
  timeOfDay: 'day',
  autoRotate: true,
  fog: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Grass3DPage() {
  const [config, setConfig] = useState<SceneConfig>(defaultConfig);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0e1a08]">

      {/* 3D canvas */}
      <div className="absolute inset-0">
        <GrassScene config={config} />
      </div>

      {/* Gradient veils */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />

      {/* ── Nav ── */}
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

      {/* ── Title overlay ── */}
      <div className="absolute bottom-10 left-10 z-10 pointer-events-none">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-900/20 px-3 py-1 text-xs text-green-400 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Real-time 3D · WebGL
        </div>
        <h1 className="text-4xl font-bold text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          3D Grass Field
        </h1>
      </div>

      {/* ── Controls hint ── */}
      <div className="absolute bottom-10 z-10 pointer-events-none flex flex-col items-end gap-1.5 text-xs text-zinc-500"
        style={{ right: config ? 300 : 16 }}>
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

      {/* ── Config panel ── */}
      <ConfigPanel config={config} onChange={setConfig} />
    </div>
  );
}
