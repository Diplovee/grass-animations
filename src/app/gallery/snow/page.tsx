import Link from 'next/link';

const flakes = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 43 + i * i * 7 + 3) % 96 + 1,
  size: 2 + (i % 5),
  dur: 3 + (i % 6) * 0.8,
  delay: -(i * 0.35),
  drift: (i % 2 === 0 ? 1 : -1) * (5 + (i % 5) * 4),
  opacity: 0.4 + (i % 4) * 0.15,
  layer: i % 3,
}));

export default function SnowPage() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 40%, #334155 80%, #475569 100%)' }}
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
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>
      </nav>

      {/* ── Snowflakes ── */}
      {flakes.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: f.size,
            height: f.size,
            left: `${f.x}%`,
            top: '-2%',
            opacity: f.opacity,
            filter: f.layer === 0 ? 'blur(1px)' : 'none',
            animation: `snow-fall ${f.dur}s linear infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}

      {/* ── Snowy ground ── */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Ground base */}
        <div style={{ height: '18%', background: 'linear-gradient(to top, #e2e8f0, #cbd5e1)' }} />
        {/* Snow drifts */}
        <svg
          className="absolute bottom-[17%] left-0 w-full"
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          style={{ height: 40 }}
        >
          <path
            d="M0 12 Q5 4 12 8 Q20 2 28 7 Q36 3 44 8 Q52 1 60 7 Q68 4 76 8 Q84 2 92 6 Q96 4 100 8 L100 12 Z"
            fill="#e2e8f0"
          />
        </svg>
      </div>

      {/* ── Far buildings (city silhouette) ── */}
      <svg
        className="absolute bottom-[16%] left-0 w-full"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{ height: 100 }}
      >
        {[
          [2, 25], [7, 18], [13, 28], [18, 15], [22, 22],
          [28, 12], [34, 20], [40, 16], [44, 25], [50, 10],
          [55, 22], [60, 14], [65, 28], [70, 18], [75, 12],
          [80, 22], [85, 16], [90, 26], [95, 12], [98, 20],
        ].map(([x, h], i) => (
          <rect key={i} x={x} y={30 - h} width={4 + (i % 3)} height={h} fill="rgba(15,23,42,0.8)" />
        ))}
        {/* Snow caps on buildings */}
        {[
          [2, 25], [7, 18], [13, 28], [18, 15], [22, 22],
          [28, 12], [34, 20], [40, 16], [44, 25], [50, 10],
        ].map(([x, h], i) => (
          <rect key={i} x={x} y={30 - h} width={4 + (i % 3)} height={1.5} fill="rgba(255,255,255,0.7)" />
        ))}
      </svg>

      {/* ── Faint moon ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: 48, height: 48,
          top: '10%', left: '15%',
          background: 'rgba(248,250,252,0.15)',
          boxShadow: '0 0 30px 8px rgba(248,250,252,0.08)',
        }}
      />

      {/* ── Hero text ── */}
      <div className="absolute bottom-24 left-10 z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-400/25 bg-slate-800/40 px-3 py-1 text-xs text-slate-300 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Particles · CSS
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-2">Snowfall</h1>
        <p className="text-white/40 text-base">60 CSS flakes drifting over a winter city.</p>
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
