'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Monaco and R3F
const ForgeStudio = dynamic(
  () => import('@/components/forge-studio/ForgeStudio'),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl">✦</span>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-emerald-400">Loading Forge Studio</h3>
            <p className="text-sm text-white/30 mt-1">Initializing editor components...</p>
          </div>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  return <ForgeStudio />;
}
