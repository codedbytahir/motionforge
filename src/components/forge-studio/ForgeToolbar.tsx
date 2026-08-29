'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  PlayIcon,
  PauseIcon,
  DownloadIcon,
  SparkleIcon,
  EditIcon,
  BoxIcon,
  LayersIcon,
  Loader2Icon,
} from '@/lib/remotion/icons';

interface ForgeToolbarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  frame: number;
  totalFrames: number;
  fps: number;
  onExport: () => void;
  onTemplateClick: () => void;
  compileError: string | null;
}

export const ForgeToolbar: React.FC<ForgeToolbarProps> = ({
  isPlaying,
  onPlayPause,
  onRestart,
  frame,
  totalFrames,
  fps,
  onExport,
  onTemplateClick,
  compileError,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-white/5">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-xs font-bold text-black">MF</span>
          </div>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-emerald-400">Forge</span>
            <span className="text-white/40 ml-1">Studio</span>
          </span>
        </div>

        <Separator orientation="vertical" className="h-5 bg-white/10" />

        {/* Templates button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTemplateClick}
          className="text-xs text-white/50 hover:text-white gap-1.5 h-7"
        >
          <LayersIcon size={14} />
          Templates
        </Button>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-2">
        {/* Restart */}
        <button
          onClick={onRestart}
          className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all"
          title="Restart (Home)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Step Back */}
        <button
          onClick={() => {}}
          className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all"
          title="Previous frame"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <PauseIcon size={16} color="white" />
          ) : (
            <PlayIcon size={16} color="white" />
          )}
        </button>

        {/* Step Forward */}
        <button
          onClick={() => {}}
          className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all"
          title="Next frame"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
          </svg>
        </button>

        <Separator orientation="vertical" className="h-5 bg-white/10" />

        {/* Frame Counter */}
        <div className="px-2.5 py-1 bg-emerald-950/50 rounded-md border border-emerald-900/50">
          <span className="text-xs text-emerald-400 font-mono">
            <span className="text-emerald-300">{frame + 1}</span>
            <span className="text-emerald-600 mx-0.5">/</span>
            <span className="text-emerald-500">{totalFrames}</span>
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        {compileError ? (
          <Badge variant="outline" className="text-[10px] py-0.5 px-2 border-red-500/20 text-red-400">
            Error
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] py-0.5 px-2 border-emerald-500/20 text-emerald-400">
            Ready
          </Badge>
        )}

        <Separator orientation="vertical" className="h-5 bg-white/10" />

        {/* Export */}
        <Button
          onClick={onExport}
          size="sm"
          className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium gap-1.5"
        >
          <DownloadIcon size={14} />
          Export
        </Button>
      </div>
    </div>
  );
};

export default ForgeToolbar;
