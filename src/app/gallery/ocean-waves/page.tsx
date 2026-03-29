import Link from 'next/link';

const waves = [
  { bottom: '42%', height: 80, color: 'rgba(186,230,253,0.18)', dur: 7,   delay: 0,   dir: 1 },
  { bottom: '34%', height: 70, color: 'rgba(125,211,252,0.22)', dur: 9,   delay: -2,  dir: -1 },
  { bottom: '26%', height: 60, color: 'rgba(56,189,248,0.28)',  dur: 11,  delay: -4,  dir: 1 },
  { bottom: '18%', height: 55, color: 'rgba(14,165,233,0.35)',  dur: 8.5, delay: -1,  dir: -1 },
  { bottom: '10%', height: 50, color: 'rgba(2,132,199,0.45)',   dur: 10,  delay: -3,  dir: 1 },
];

export default function OceanWavesPage() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0c1445 0%, #0a3060 40%, #0e4d8a 70%, #0369a1 100%)' }}
    >

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
        <div className="hidden sm:flex items-center gap-7 text-sm text-white/60">
          <Link href="/" className="hover:text-white transition-colors">3D</Link>
          <Link href="/gallery/flat-grass" className="hover:text-white transition-colors">Flat</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>
      </nav>

      {/* ── Stars ── */}
      {Array.from({ length: 55 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${1 + (i % 3) * 0.5}px`,
            height: `${1 + (i % 3) * 0.5}px`,
            left: `${(i * 37 + i * i * 3) % 97}%`,
            top: `${(i * 19 + 7) % 45}%`,
            opacity: 0.3 + (i % 4) * 0.15,
            animation: `glow-pulse ${2 + (i % 5) * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}

      {/* ── Moon ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: 56, height: 56,
          top: '12%', right: '14%',
          background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fde68a)',
          boxShadow: '0 0 40px 12px rgba(253,230,138,0.2)',
        }}
      />

      {/* ── Moon reflection ── */}
      <div
        className="absolute"
        style={{
          width: 12, height: '20%',
          left: 'calc(86% + 22px)',
          bottom: '8%',
          background: 'linear-gradient(to bottom, rgba(253,230,138,0.35), transparent)',
          filter: 'blur(4px)',
          borderRadius: '50%',
        }}
      />

      {/* ── Waves ── */}
      {waves.map((w, i) => (
        <div
          key={i}
          className="absolute left-0 w-[200%]"
          style={{
            bottom: w.bottom,
            height: w.height,
            background: w.color,
            borderRadius: '50% 50% 0 0',
            animation: `wave-slide ${w.dur}s linear infinite`,
            animationDelay: `${w.delay}s`,
            animationDirection: w.dir === -1 ? 'reverse' : 'normal',
          }}
        />
      ))}

      {/* ── Deep ocean floor ── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '12%', background: 'linear-gradient(to top, #082f49, #0c4a6e)' }}
      />

      {/* ── Foam dots ── */}
      {Array.from({ length: 18 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            width: `${3 + (i % 4)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${(i * 29 + 5) % 95}%`,
            bottom: `${38 + (i % 6) * 2}%`,
            animation: `glow-pulse ${1.2 + (i % 3) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}

      {/* ── Hero text ── */}
      <div className="absolute bottom-24 left-10 z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-900/20 px-3 py-1 text-xs text-sky-300 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Flat · CSS Layers
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-2 drop-shadow-lg">Ocean Waves</h1>
        <p className="text-white/50 text-base">Layered CSS waves with depth and moonlight.</p>
      </div>

      <Link href="/gallery" className="absolute top-6 right-8 z-20 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h10M4 18h7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Gallery
      </Link>
    </div>
  );
}
