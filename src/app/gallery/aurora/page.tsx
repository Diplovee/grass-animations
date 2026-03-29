import Link from 'next/link';

const curtains = [
  { left: '5%',  w: '35%', top: '5%',  h: '60%', colors: '#4ade80, #06b6d4, #818cf8', dur: 8,  delay: 0 },
  { left: '25%', w: '45%', top: '8%',  h: '65%', colors: '#a78bfa, #4ade80, #06b6d4', dur: 11, delay: -3 },
  { left: '55%', w: '40%', top: '3%',  h: '55%', colors: '#06b6d4, #818cf8, #4ade80', dur: 9,  delay: -5 },
  { left: '70%', w: '32%', top: '10%', h: '50%', colors: '#4ade80, #a78bfa, #22d3ee', dur: 13, delay: -2 },
];

export default function AuroraPage() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #000814 0%, #001830 60%, #001020 100%)' }}
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

      {/* ── Stars ── */}
      {Array.from({ length: 80 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${0.8 + (i % 3) * 0.5}px`,
            height: `${0.8 + (i % 3) * 0.5}px`,
            left: `${(i * 41 + i * i * 7) % 99}%`,
            top: `${(i * 23 + 5) % 70}%`,
            opacity: 0.2 + (i % 5) * 0.12,
            animation: `glow-pulse ${2 + (i % 7) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      {/* ── Aurora curtains ── */}
      {curtains.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: c.left, top: c.top,
            width: c.w, height: c.h,
            background: `linear-gradient(180deg, transparent 0%, ${c.colors.split(', ').map((col, j) => `${col}${j === 0 ? '00' : j === 1 ? 'aa' : '55'}`).join(', ')}, transparent 100%)`,
            filter: 'blur(18px)',
            borderRadius: '40% 60% 60% 40% / 30% 30% 70% 70%',
            animation: `aurora-shift ${c.dur}s ease-in-out infinite`,
            animationDelay: `${c.delay}s`,
            opacity: 0.75,
          }}
        />
      ))}

      {/* Soft overlay gradient — aurora fades at very top and bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,8,20,0.7) 0%, transparent 20%, transparent 80%, rgba(0,8,20,0.9) 100%)',
        }}
      />

      {/* ── Horizon snow-covered ground ── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '14%', background: 'linear-gradient(to top, #001428, #002040)' }}
      />
      <div
        className="absolute bottom-[13%] left-0 right-0"
        style={{ height: '3%', background: 'rgba(200,230,255,0.07)', filter: 'blur(4px)' }}
      />

      {/* ── Hero text ── */}
      <div className="absolute bottom-20 left-10 z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-900/20 px-3 py-1 text-xs text-violet-300 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Flat · CSS Gradient
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-2">Aurora Borealis</h1>
        <p className="text-white/40 text-base">Shifting northern lights with animated curtains.</p>
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
