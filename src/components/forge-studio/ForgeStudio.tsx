'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EditIcon,
  BoxIcon,
} from '@/lib/remotion/icons';
import { templates, type StudioTemplate } from '@/lib/remotion/studio/templates';
import CodeEditor from './CodeEditor';
import ScenePreview from './ScenePreview';
import ForgeToolbar from './ForgeToolbar';

interface ForgeStudioProps {
  initialCode?: string;
}

export const ForgeStudio: React.FC<ForgeStudioProps> = ({ initialCode }) => {
  const [code, setCode] = useState(initialCode || templates[0].code);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>('blank');
  const [showTemplates, setShowTemplates] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [fps] = useState(30);
  const [durationInFrames] = useState(300);
  const [activeTab, setActiveTab] = useState<'code' | 'settings'>('code');

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setCompileError(null);
  }, []);

  const handleCompileError = useCallback((error: string) => {
    setCompileError(error);
  }, []);

  const handleTemplateSelect = useCallback((template: StudioTemplate) => {
    setCode(template.code);
    setActiveTemplate(template.id);
    setShowTemplates(false);
    setFrame(0);
  }, []);

  const handleExport = useCallback(() => {
    // Trigger export via the player
    alert('Export feature coming soon! Use the Player export for now.');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Top Toolbar */}
      <ForgeToolbar
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onRestart={() => { setFrame(0); setIsPlaying(true); }}
        frame={frame}
        totalFrames={durationInFrames}
        fps={fps}
        onExport={handleExport}
        onTemplateClick={() => setShowTemplates(!showTemplates)}
        compileError={compileError}
      />

      {/* Template Gallery Dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5 bg-[#0d0d0d]"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    activeTemplate === template.id
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-2"
                    style={{ backgroundColor: template.color + '20', color: template.color }}
                  >
                    {template.icon}
                  </div>
                  <h4 className="font-bold text-sm">{template.name}</h4>
                  <p className="text-xs text-white/40 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col border-r border-white/5">
          {/* Panel Header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border-b border-white/5">
            <EditIcon size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-white/60">Composition.tsx</span>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/20 text-emerald-400">
                TSX
              </Badge>
              {compileError && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-red-500/20 text-red-400">
                  Error
                </Badge>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              onCompileError={handleCompileError}
            />
          </div>

          {/* Error Bar */}
          <AnimatePresence>
            {compileError && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-red-500/20 bg-red-500/5"
              >
                <div className="px-4 py-3 text-xs font-mono text-red-400 max-h-24 overflow-y-auto">
                  {compileError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border-b border-white/5">
            <BoxIcon size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-white/60">Preview</span>
            <div className="ml-auto flex items-center gap-2 text-[10px] text-white/30 font-mono">
              <span>1920 × 1080</span>
              <span>•</span>
              <span>{fps} FPS</span>
              <span>•</span>
              <span>{durationInFrames} frames</span>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <ScenePreview
              code={code}
              isPlaying={isPlaying}
              frame={frame}
              fps={fps}
              durationInFrames={durationInFrames}
              onFrameChange={setFrame}
              onError={handleCompileError}
            />
          </div>

          {/* Timeline */}
          <div className="px-4 py-3 bg-[#0d0d0d] border-t border-white/5">
            <div className="relative">
              <input
                type="range"
                min={0}
                max={durationInFrames - 1}
                value={frame}
                onChange={(e) => setFrame(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-950 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-emerald-500
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-emerald-500/30"
              />
              <div className="flex justify-between mt-1.5 text-[10px] text-white/30 font-mono">
                <span>{formatFrameTime(frame, fps)}</span>
                <span>{formatFrameTime(durationInFrames, fps)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatFrameTime(frame: number, fps: number): string {
  const seconds = frame / fps;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export default ForgeStudio;
