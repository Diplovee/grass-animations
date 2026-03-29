import Link from 'next/link';

export default function FlatGrassPage() {
  const blades = Array.from({ length: 40 }, (_, i) => ({
    x: i * 2.6,
    h: 12 + Math.abs(Math.sin(i * 0.9)) * 18,
    delay: i * 0.07,
    dur: 1.6 + (i % 5) * 0.25,
    color: i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#15803d' : '#22c55e',
    layer: i % 3,
  }));

  const bgBlades = Array.from({ length: 28 }, (_, i) => ({
    x: i * 3.6 + 1,
    h: 8 + (i % 4) * 5,
    delay: i * 0.11,
    dur: 2 + (i % 4) * 0.3,
  }));

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'linear-gradient(to bottom, #bfdbfe 0%, #93c5fd 35%, #60a5fa 55%, #1d4ed8 100%)' }}>

      {/* ── Nav ── */}
      <nav className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <path d="M12 3 C10 3 8 5 8 8 C8 11 10 14 12 22 C14 14 16 11 16 8 C16 5 14 3 12 3Z" fill="#4ade80" opacity="0.9" />
            <path d="M12 8 C10 6 7 6 5 8 C7 10 10 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M12 8 C14 6 17 6 19 8 C17 10 14 11 12 13" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="text-white font-semibold text-base tracking-tight drop-shadow">Grass Animations</span>
        </Link>
        <div className="hidden sm:flex items-center gap-7 text-sm text-white/70">
          <Link href="/" className="hover:text-white transition-colors">3D</Link>
          
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>
      </nav>

      {/* ── Clouds ── */}
      {[
        { top: '12%', left: '8%',  w: 120, op: 0.7, dur: 28 },
        { top: '22%', left: '55%', w: 90,  op: 0.5, dur: 35 },
        { top: '8%',  left: '75%', w: 70,  op: 0.4, dur: 42 },
      ].map((c, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            top: c.top, left: c.left,
            width: c.w, height: c.w * 0.38,
            background: `rgba(255,255,255,${c.op})`,
            filter: 'blur(6px)',
            animation: `wave-slide ${c.dur}s linear infinite`,
          }}
        />
      ))}

      {/* ── Far background grass (darker, smaller) ── */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '55%' }}
        viewBox="0 0 104 40"
        preserveAspectRatio="none"
      >
        {bgBlades.map((b, i) => (
          <g key={i} style={{ animation: `sway ${b.dur}s ease-in-out infinite`, animationDelay: `${b.delay}s`, transformOrigin: `${b.x}px 40px` }}>
            <path
              d={`M${b.x} 40 Q${b.x - 2} ${40 - b.h * 0.55} ${b.x - 0.8} ${40 - b.h}`}
              stroke="rgba(20,83,45,0.6)"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      {/* ── Ground ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '22%', background: 'linear-gradient(to top, #14532d, #166534)' }} />

      {/* ── Foreground grass ── */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '65%' }}
        viewBox="0 0 104 50"
        preserveAspectRatio="none"
      >
        {blades.map((b, i) => (
          <g key={i} style={{ animation: `sway ${b.dur}s ease-in-out infinite`, animationDelay: `${b.delay}s`, transformOrigin: `${b.x}px 50px` }}>
            <path
              d={`M${b.x} 50 Q${b.x - 3} ${50 - b.h * 0.55} ${b.x - 1} ${50 - b.h}`}
              stroke={b.color}
              strokeWidth={b.layer === 0 ? '1.8' : b.layer === 1 ? '1.5' : '2.2'}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      {/* ── Hero text ── */}
      <div className="absolute bottom-[28%] left-10 z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Flat · SVG · CSS
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
          Flat Grass
        </h1>
        <p className="text-white/70 text-base">SVG blades with organic CSS sway.</p>
      </div>

      {/* ── Back button ── */}
      <Link
        href="/gallery"
        className="absolute top-6 right-8 z-20 flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h10M4 18h7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Gallery
      </Link>
    </div>
  );
}
