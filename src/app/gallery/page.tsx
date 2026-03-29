'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const GrassMiniPreview = dynamic(() => import('@/components/GrassMiniPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-sky-400 to-green-900 animate-pulse" />
  ),
});

const Logo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 3 C10 3 8 5 8 8 C8 11 10 14 12 22 C14 14 16 11 16 8 C16 5 14 3 12 3Z" fill="#4ade80" opacity="0.9" />
    <path d="M12 8 C10 6 7 6 5 8 C7 10 10 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M12 8 C14 6 17 6 19 8 C17 10 14 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </svg>
);

type Category = 'All' | '3D' | 'Particles';

const animations = [
  {
    id: 'grass-3d',
    title: '3D Grass Field',
    description: '7 000 instanced blades with GLSL wind shaders and real-time per-blade bending',
    tags: ['3D', 'WebGL', 'GLSL'],
    category: '3D' as Category,
    href: '/gallery/grass-3d',
    ready: true,
    preview: 'grass',
  },
  {
    id: 'ocean-3d',
    title: '3D Ocean',
    description: 'Real-time vertex-displaced water surface with reflections and foam',
    tags: ['3D', 'WebGL', 'GLSL'],
    category: '3D' as Category,
    href: '#',
    ready: false,
    preview: 'ocean-3d',
  },
  {
    id: 'fire-3d',
    title: '3D Fire',
    description: 'GPU particle system with heat distortion and volumetric glow',
    tags: ['3D', 'Particles', 'GLSL'],
    category: '3D' as Category,
    href: '#',
    ready: false,
    preview: 'fire-3d',
  },
  {
    id: 'forest-3d',
    title: '3D Forest',
    description: 'Dense tree field with per-branch wind shader and ambient occlusion',
    tags: ['3D', 'WebGL', 'GLSL'],
    category: '3D' as Category,
    href: '#',
    ready: false,
    preview: 'forest-3d',
  },
  {
    id: 'fireflies',
    title: 'Fireflies',
    description: 'Glowing drifting particles in a dark forest at night',
    tags: ['Particles', 'CSS'],
    category: 'Particles' as Category,
    href: '/gallery/fireflies',
    ready: true,
    preview: 'fireflies',
  },
  {
    id: 'snow',
    title: 'Snowfall',
    description: 'Gentle CSS snowflakes drifting with variable speed and opacity',
    tags: ['Particles', 'CSS'],
    category: 'Particles' as Category,
    href: '/gallery/snow',
    ready: true,
    preview: 'snow',
  },
];

function PreviewGrass3D() {
  return (
    <div className="w-full h-full">
      <GrassMiniPreview />
    </div>
  );
}

function PreviewOcean3D() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center">
      <div className="absolute inset-0 opacity-20"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(56,189,248,0.3) 8px, rgba(56,189,248,0.3) 9px)' }} />
      <span className="text-sky-400/40 text-xs font-mono tracking-widest uppercase">Coming Soon</span>
    </div>
  );
}

function PreviewFire3D() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute bottom-4 rounded-full"
          style={{
            width: `${6 + (i % 3) * 4}px`,
            height: `${20 + (i % 4) * 10}px`,
            left: `${30 + i * 5}%`,
            background: `radial-gradient(ellipse at bottom, ${i % 2 === 0 ? '#f97316' : '#fbbf24'} 0%, transparent 100%)`,
            filter: 'blur(3px)',
            animation: `float-up ${0.8 + (i % 3) * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.15}s`,
            opacity: 0.7,
          }}
        />
      ))}
      <span className="relative text-orange-500/40 text-xs font-mono tracking-widest uppercase">Coming Soon</span>
    </div>
  );
}

function PreviewForest3D() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-emerald-950 to-green-950 flex items-center justify-center">
      {[10, 25, 40, 55, 70, 85].map((x, i) => (
        <div key={i} className="absolute bottom-0" style={{ left: `${x}%` }}>
          <div className="absolute" style={{
            width: 20 + (i % 3) * 8, height: 50 + (i % 4) * 15,
            bottom: '100%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(5,46,22,0.9)',
            borderRadius: '50% 50% 20% 20%',
            clipPath: 'ellipse(50% 50% at 50% 60%)',
            animation: `sway ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            transformOrigin: 'bottom center',
          }} />
          <div style={{ width: 4, height: 18, background: '#1c3a1c' }} />
        </div>
      ))}
      <span className="relative text-green-500/40 text-xs font-mono tracking-widest uppercase z-10">Coming Soon</span>
    </div>
  );
}

function PreviewFireflies() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#030a03] to-[#0a1a0a]">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: '4px', height: '4px',
            left: `${10 + (i * 37 + i * i * 7) % 80}%`,
            bottom: `${20 + (i * 23 + 11) % 65}%`,
            background: `radial-gradient(circle, #bef264 0%, #86efac 50%, transparent 100%)`,
            boxShadow: '0 0 6px 2px #86efac88',
            animation: `glow-pulse ${1.5 + (i % 5) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function PreviewSnow() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-700">
      <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-white/20 rounded-t-[50%]" />
      {[...Array(14)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
            left: `${(i * 31 + 5) % 90}%`, top: `-5%`,
            opacity: 0.7 + (i % 3) * 0.1,
            animation: `snow-fall ${2 + (i % 4) * 0.6}s linear infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

const previews: Record<string, React.FC> = {
  grass: PreviewGrass3D,
  'ocean-3d': PreviewOcean3D,
  'fire-3d': PreviewFire3D,
  'forest-3d': PreviewForest3D,
  fireflies: PreviewFireflies,
  snow: PreviewSnow,
};

const categoryColors: Record<Category, string> = {
  All: '',
  '3D': 'text-violet-400 bg-violet-900/30 border-violet-500/30',
  Particles: 'text-amber-400 bg-amber-900/30 border-amber-500/30',
};

export default function GalleryPage() {
  const [active, setActive] = useState<Category>('All');

  const filtered = active === 'All' ? animations : animations.filter((a) => a.category === active);

  return (
    <div className="min-h-screen bg-[#080f08] text-white">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#080f08]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7"><Logo /></div>
          <span className="font-semibold text-base tracking-tight text-white">Grass Animations</span>
        </Link>
        <div className="hidden sm:flex items-center gap-7 text-sm text-zinc-400">
          <span className="text-white font-medium">Gallery</span>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="px-8 pt-12 pb-8 max-w-6xl mx-auto">
        <p className="text-xs text-green-400 font-mono tracking-widest uppercase mb-3">Animation Library</p>
        <h1 className="text-4xl font-bold mb-2">Browse Animations</h1>
        <p className="text-zinc-500 text-base">Click any animation to view it fullscreen.</p>
      </div>

      {/* ── Filter tabs ── */}
      <div className="px-8 pb-8 max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
        {(['All', '3D', 'Particles'] as Category[]).map((cat) => (
          <button key={cat} onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-150 cursor-pointer ${
              active === cat
                ? 'bg-green-500 border-green-400 text-black font-semibold'
                : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-600">{filtered.length} animation{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Grid ── */}
      <div className="px-8 pb-20 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((anim) => {
          const Preview = previews[anim.preview];
          const isComingSoon = !anim.ready;
          return (
            <Link
              key={anim.id}
              href={anim.href}
              onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
              className={`group block rounded-2xl overflow-hidden border transition-all duration-200 bg-zinc-950 ${
                isComingSoon
                  ? 'border-white/5 cursor-default opacity-60'
                  : 'border-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50'
              }`}
            >
              {/* Preview */}
              <div className="relative h-44 overflow-hidden pointer-events-none">
                <Preview />
                <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[anim.category]}`}>
                  {anim.category}
                </span>
                {isComingSoon && (
                  <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full border border-white/10 bg-black/40 text-zinc-500 backdrop-blur-sm">
                    Coming soon
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-base text-white leading-snug">{anim.title}</h2>
                  {!isComingSoon && (
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 shrink-0 mt-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M7 17L17 7M17 7H7M17 7v10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed mb-3">{anim.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {anim.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-500 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
