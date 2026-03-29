'use client';

import dynamic from 'next/dynamic';

const GrassScene = dynamic(() => import('@/components/GrassScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#0e1a08]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin" />
        <span className="text-green-400/70 text-sm font-mono tracking-widest uppercase">
          Growing…
        </span>
      </div>
    </div>
  ),
});

export default function GrassCanvas() {
  return <GrassScene />;
}
