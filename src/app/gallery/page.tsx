'use client';

import { useState } from 'react';
import Link from 'next/link';

const Logo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 3 C10 3 8 5 8 8 C8 11 10 14 12 22 C14 14 16 11 16 8 C16 5 14 3 12 3Z" fill="#4ade80" opacity="0.9" />
    <path d="M12 8 C10 6 7 6 5 8 C7 10 10 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M12 8 C14 6 17 6 19 8 C17 10 14 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </svg>
);

type Category = 'All' | '3D' | 'Flat' | 'Particles';

const animations = [
  {
    id: 'grass-3d',
    title: '3D Grass Field',
    description: '7 000 instanced blades with GLSL wind shaders and real-time per-blade bending',
    tags: ['3D', 'WebGL', 'GLSL'],
    category: '3D' as Category,
    href: '/',
    ready: true,
    preview: 'grass',
  },
  {
    id: 'flat-grass',
    title: 'Flat Grass Wave',
    description: 'SVG grass blades with organic CSS sway animation and layered depth',
    tags: ['Flat', 'SVG', 'CSS'],
    category: 'Flat' as Category,
    href: '/gallery/flat-grass',
    ready: true,
    preview: 'flat-grass',
  },
  {
    id: 'ocean-waves',
    title: 'Ocean Waves',
    description: 'Layered CSS waves with depth, foam, and ambient motion',
    tags: ['Flat', 'CSS'],
    category: 'Flat' as Category,
    href: '/gallery/ocean-waves',
    ready: true,
    preview: 'ocean',
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
    id: 'aurora',
    title: 'Aurora Borealis',
    description: 'Shifting northern lights with animated gradient curtains',
    tags: ['Flat', 'CSS', 'Gradient'],
    category: 'Flat' as Category,
    href: '/gallery/aurora',
    ready: true,
    preview: 'aurora',
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
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-green-900 to-green-800" />
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className="absolute bottom-8 origin-bottom"
          style={{
            left: `${6 + i * 7}%`,
            height: `${40 + Math.sin(i * 1.7) * 20}px`,
            width: '3px',
            background: `linear-gradient(to top, #166534, #4ade80)`,
            borderRadius: '2px',
            animation: `sway ${1.8 + (i % 3) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
            transformOrigin: 'bottom center',
          }}
        />
      ))}
    </div>
  );
}

function PreviewFlatGrass() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-emerald-200 to-emerald-400">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-emerald-700" />
      <svg className="absolute bottom-4 left-0 w-full" viewBox="0 0 200 60" preserveAspectRatio="none">
        {[...Array(20)].map((_, i) => {
          const x = i * 10 + 3;
          const h = 25 + (i % 3) * 12;
          return (
            <g key={i} style={{ animation: `sway ${1.5 + (i % 4) * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.1}s`, transformOrigin: `${x}px 60px` }}>
              <path d={`M${x} 60 Q${x - 4} ${60 - h / 2} ${x - 2} ${60 - h}`} stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PreviewOcean() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-500 to-blue-900">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute left-0 w-[200%]"
          style={{
            bottom: `${10 + i * 14}%`,
            height: `${24 - i * 4}px`,
            background: `rgba(56, 189, 248, ${0.25 - i * 0.05})`,
            borderRadius: '50% 50% 0 0',
            animation: `wave-slide ${3 + i * 0.8}s linear infinite`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-blue-900" />
    </div>
  );
}

function PreviewFireflies() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#030a03] to-[#0a1a0a]">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '4px',
            height: '4px',
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

function PreviewAurora() {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0520, #0d1b2a, #051a10)',
      }}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: 'linear-gradient(170deg, #4ade80 0%, #06b6d4 25%, #a855f7 50%, #4ade80 75%, #06b6d4 100%)',
          backgroundSize: '300% 300%',
          animation: 'aurora-shift 6s ease infinite',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </div>
  );
}

function PreviewSnow() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-700">
      <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-white/20 rounded-t-[50%]" />
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${(i * 31 + 5) % 90}%`,
            top: `-5%`,
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
  'flat-grass': PreviewFlatGrass,
  ocean: PreviewOcean,
  fireflies: PreviewFireflies,
  aurora: PreviewAurora,
  snow: PreviewSnow,
};

const categoryColors: Record<Category, string> = {
  All: '',
  '3D': 'text-violet-400 bg-violet-900/30 border-violet-500/30',
  Flat: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30',
  Particles: 'text-amber-400 bg-amber-900/30 border-amber-500/30',
};

export default function GalleryPage() {
  const [active, setActive] = useState<Category>('All');

  const filtered = active === 'All' ? animations : animations.filter((a) => a.category === active);

  return (
    <div className="min-h-screen bg-[#080f08] text-white">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#080f08]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7"><Logo /></div>
          <span className="font-semibold text-base tracking-tight text-white">Grass Animations</span>
        </Link>

        <div className="hidden sm:flex items-center gap-7 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">3D</Link>
          <Link href="/gallery/flat-grass" className="hover:text-white transition-colors">Flat</Link>
          <span className="text-white font-medium">Gallery</span>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
      </nav>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-8 pt-12 pb-8 max-w-6xl mx-auto">
        <p className="text-xs text-green-400 font-mono tracking-widest uppercase mb-3">Animation Library</p>
        <h1 className="text-4xl font-bold mb-2">Browse Animations</h1>
        <p className="text-zinc-500 text-base">Click any animation to view it fullscreen.</p>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────── */}
      <div className="px-8 pb-8 max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
        {(['All', '3D', 'Flat', 'Particles'] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
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

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <div className="px-8 pb-20 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((anim) => {
          const Preview = previews[anim.preview];
          return (
            <Link
              key={anim.id}
              href={anim.href}
              className="group block rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 bg-zinc-950"
            >
              {/* Preview area */}
              <div className="relative h-44 overflow-hidden">
                <Preview />
                {/* Category badge */}
                <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[anim.category]}`}>
                  {anim.category}
                </span>
              </div>

              {/* Info area */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-base text-white leading-snug">{anim.title}</h2>
                  <svg
                    className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 shrink-0 mt-0.5"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
