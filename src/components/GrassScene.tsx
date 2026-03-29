'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

const BLADE_COUNT = 7000;
const FIELD_RADIUS = 22;

const grassVertexShader = `
  uniform float uTime;

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

    // Wind animation — only the upper part bends
    float windInfluence = pow(vHeight, 1.8);
    float phase = wx * 0.45 + wz * 0.32;

    float wind = sin(uTime * 1.4 + phase) * 0.28;
    wind += sin(uTime * 2.7 + wx * 1.1) * 0.07;
    wind += cos(uTime * 0.8 + wz * 0.55) * 0.09;

    pos.x += wind * windInfluence;
    pos.z += wind * windInfluence * 0.22;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

const grassFragmentShader = `
  varying vec2 vUv;
  varying float vHeight;
  varying vec2 vWorldXZ;

  void main() {
    vec3 rootColor = vec3(0.04, 0.18, 0.03);
    vec3 midColor  = vec3(0.15, 0.46, 0.08);
    vec3 tipColor  = vec3(0.46, 0.74, 0.17);

    vec3 color = mix(rootColor, midColor, smoothstep(0.0, 0.5, vHeight));
    color = mix(color, tipColor, smoothstep(0.5, 1.0, vHeight));

    // Per-blade color variation: some dry/yellower blades
    float hash = fract(sin(vWorldXZ.x * 13.745 + vWorldXZ.y * 7.312) * 43758.553);
    vec3 dryColor = vec3(0.62, 0.66, 0.18);
    color = mix(color, dryColor, hash * 0.18 * vHeight);

    // Thin edge darkening — simulates the blade's narrow sides
    float edgeFade = abs(vUv.x * 2.0 - 1.0);
    color *= (1.0 - edgeFade * 0.3);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createBladeGeometry(): THREE.BufferGeometry {
  const SEGS = 6;
  const W = 0.052;
  const H = 1.0;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS;
    const y = t * H;
    const w = W * (1.0 - t * 0.9);
    const lean = t * t * 0.08; // natural subtle lean

    positions.push(-w / 2, y, lean);
    positions.push(w / 2, y, lean);
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

function GrassField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geo = useMemo(createBladeGeometry, []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        uniforms: { uTime: { value: 0.0 } },
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < BLADE_COUNT; i++) {
      // Natural radial distribution: denser toward center
      const r = Math.sqrt(Math.random()) * FIELD_RADIUS;
      const angle = Math.random() * Math.PI * 2;

      dummy.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(
        0.8 + Math.random() * 0.5,
        0.5 + Math.random() * 1.3,
        0.8 + Math.random() * 0.5
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, BLADE_COUNT]}
      frustumCulled={false}
    />
  );
}

export default function GrassScene() {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 14], fov: 55 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#b4d9f0', 28, 70]} />

      <Sky
        distance={450000}
        sunPosition={[80, 35, 60]}
        turbidity={5}
        rayleigh={0.9}
      />

      <ambientLight intensity={1.4} color="#e8f5e9" />
      <directionalLight position={[10, 20, 8]} intensity={2.8} color="#fffbe8" />
      <hemisphereLight args={['#87ceeb', '#2a5c10', 0.7]} />

      {/* Earthy ground disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[FIELD_RADIUS + 6, 72]} />
        <meshStandardMaterial color="#1a2c0d" roughness={1} />
      </mesh>

      {/* Far background ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0e1a08" roughness={1} />
      </mesh>

      <GrassField />

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.08}
        minPolarAngle={0.08}
        minDistance={3}
        maxDistance={32}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </Canvas>
  );
}
