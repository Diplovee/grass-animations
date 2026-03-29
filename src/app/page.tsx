import Link from 'next/link';
import GrassCanvas from '@/components/GrassCanvas';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0e1a08]">

      {/* 3D canvas — fills the entire viewport */}
      <div className="absolute inset-0">
        <GrassCanvas />
      </div>

      {/* Top gradient veil */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)' }}
      />

      {/* Bottom gradient veil */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
      />

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 3 C10 3 8 5 8 8 C8 11 10 14 12 22 C14 14 16 11 16 8 C16 5 14 3 12 3Z"
                fill="#4ade80"
                opacity="0.9"
              />
              <path
                d="M12 8 C10 6 7 6 5 8 C7 10 10 11 12 13"
                stroke="#86efac"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M12 8 C14 6 17 6 19 8 C17 10 14 11 12 13"
                stroke="#86efac"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">
            Grass Animations
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-7 text-sm text-zinc-400">
          <span className="text-white font-medium">3D</span>
          <Link href="/gallery/flat-grass" className="hover:text-white transition-colors duration-150">Flat</Link>
          <Link href="/gallery" className="hover:text-white transition-colors duration-150">Gallery</Link>
          <a href="#" className="hover:text-white transition-colors duration-150">About</a>
        </div>
      </nav>

      {/* ── Hero text ────────────────────────────────────────────── */}
      <div className="absolute bottom-16 left-10 z-20 max-w-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-900/20 px-3 py-1 text-xs text-green-400 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Real-time 3D · WebGL
        </div>

        <h1
          className="text-5xl font-bold leading-tight text-white mb-3"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
        >
          3D Grass
        </h1>

        <p
          className="text-zinc-400 text-base leading-relaxed"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
        >
          7 000 instanced blades animated with<br />
          custom GLSL wind shaders.
        </p>
      </div>

      {/* ── Controls hint ────────────────────────────────────────── */}
      <div className="absolute bottom-10 right-8 z-20 flex flex-col items-end gap-1.5 text-xs text-zinc-500">
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

    </div>
  );
}
