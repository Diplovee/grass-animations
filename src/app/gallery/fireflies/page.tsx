import Link from 'next/link';

const flies = Array.from({ length: 32 }, (_, i) => ({
  x: (i * 47 + i * i * 13 + 5) % 88 + 4,
  y: (i * 31 + 17) % 72 + 8,
  size: 3 + (i % 4),
  dur: 1.4 + (i % 7) * 0.35,
  floatDur: 5 + (i % 5) * 2.2,
  delay: i * 0.22,
  floatDelay: i * 0.18,
  hue: i % 3 === 0 ? '#bef264' : i % 3 === 1 ? '#86efac' : '#d9f99d',
}));

const treeTrunks = [2, 12, 22, 35, 48, 58, 70, 82, 92];

export default function FirefliesPage() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #020c02 0%, #041504 50%, #031003 100%)' }}
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
        <div className="hidden sm:flex items-center gap-7 text-sm text-white/40">
          <Link href="/" className="hover:text-white transition-colors">3D</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>
      </nav>

      {/* ── Tree silhouettes ── */}
      {treeTrunks.map((x, i) => {
        const h = 35 + (i % 4) * 15;
        const w = 12 + (i % 3) * 6;
        return (
          <div key={i} className="absolute bottom-0" style={{ left: `${x}%`, width: w, bottom: '20%' }}>
            {/* Crown */}
            <div
              className="absolute"
              style={{
                width: w * 2.5, height: h,
                left: '50%', transform: 'translateX(-50%)',
                bottom: '100%',
                background: 'rgba(2,8,2,0.95)',
                borderRadius: '50% 50% 20% 20%',
                clipPath: 'ellipse(50% 50% at 50% 60%)',
              }}
            />
            {/* Trunk */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{ width: 5, height: 30, background: '#050d05' }}
            />
          </div>
        );
      })}

      {/* ── Ground ── */}
      <div className="absolute bottom-0 left-0 right-0"
        style={{ height: '22%', background: 'linear-gradient(to top, #010801, #031403)' }} />

      {/* ── Faint moonlight glow ── */}
      <div
        className="absolute"
        style={{
          width: 300, height: 300,
          top: '5%', right: '20%',
          background: 'radial-gradient(circle, rgba(255,255,200,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* ── Fireflies ── */}
      {flies.map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            animation: `float-up ${f.floatDur}s ease-in-out infinite alternate`,
            animationDelay: `${f.floatDelay}s`,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: f.size,
              height: f.size,
              background: `radial-gradient(circle, ${f.hue} 0%, transparent 100%)`,
              boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${f.hue}88`,
              animation: `glow-pulse ${f.dur}s ease-in-out infinite`,
              animationDelay: `${f.delay}s`,
            }}
          />
        </div>
      ))}

      {/* ── Hero text ── */}
      <div className="absolute bottom-20 left-10 z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-500/25 bg-lime-900/20 px-3 py-1 text-xs text-lime-400 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          Particles · CSS
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-2">Fireflies</h1>
        <p className="text-white/40 text-base">32 glowing particles in a dark forest.</p>
      </div>

      <Link href="/gallery" className="absolute top-6 right-8 z-20 flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h10M4 18h7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Gallery
      </Link>
    </div>
  );
}
