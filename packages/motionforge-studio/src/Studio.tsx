import React from 'react';
import { TimelineView, type SequenceTrack } from './TimelineView';
import { Player } from 'motionforge';

export const Studio: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <header className="h-14 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-black">M</div>
          <h1 className="text-lg font-semibold">MotionForge Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-medium transition-colors">
            Render
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Composition Picker */}
        <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Compositions</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <button className="w-full text-left px-3 py-2 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 text-sm">
              MyVideo
            </button>
          </div>
        </aside>

        {/* Center - Preview */}
        <section className="flex-1 flex flex-col bg-gray-900">
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
             {/* Player would go here */}
             <div className="text-gray-600 italic">Select a composition to preview</div>
          </div>

          {/* Bottom - Timeline */}
          <div className="h-64 border-t border-gray-800 bg-gray-950 p-4">
             <TimelineView
               sequences={[]}
               currentFrame={0}
               totalFrames={300}
               fps={30}
               onSeek={() => {}}
             />
          </div>
        </section>

        {/* Right Sidebar - Props Editor */}
        <aside className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Props Editor</h2>
          </div>
          <div className="flex-1 p-4">
            <textarea
              className="w-full h-full bg-gray-900 border border-gray-800 rounded p-3 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500/50"
              defaultValue={`{\n  "title": "Hello World"\n}`}
            />
          </div>
        </aside>
      </main>
    </div>
  );
};
