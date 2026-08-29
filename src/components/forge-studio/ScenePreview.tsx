'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { compileCode, clearCompileCache, type CompileResult } from '@/lib/remotion/studio/compiler';
import { Player } from '@/lib/remotion';
import { Loader2Icon, WarningIcon } from '@/lib/remotion/icons';

interface ScenePreviewProps {
  code: string;
  isPlaying: boolean;
  frame: number;
  fps: number;
  durationInFrames: number;
  onFrameChange: (frame: number) => void;
  onError?: (error: string) => void;
}

/**
 * Live preview panel that compiles and renders the composition in real-time.
 */
export const ScenePreview: React.FC<ScenePreviewProps> = ({
  code,
  isPlaying,
  frame,
  fps,
  durationInFrames,
  onFrameChange,
  onError,
}) => {
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced compilation
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsCompiling(true);
      clearCompileCache(); // Force recompile on code change

      const result = await compileCode(code);
      setCompileResult(result);
      setIsCompiling(false);

      if (result.success) {
        setPreviewError(null);
        onError?.('');
      } else {
        setPreviewError(result.error || 'Unknown error');
        onError?.(result.error || 'Unknown error');
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, onError]);

  // Compiled component
  const CompiledComponent = compileResult?.component;

  // Show loading state
  if (isCompiling) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon size={24} className="text-emerald-500 animate-spin" />
          <span className="text-xs text-white/40">Compiling...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (previewError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3 max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <WarningIcon size={24} className="text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-400 mb-1">Compilation Error</h4>
            <p className="text-xs text-white/30 font-mono">{previewError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!CompiledComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <span className="text-2xl">✦</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/40">Write some code to see a preview</p>
            <p className="text-xs text-white/20 mt-1">Select a template or start typing</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the compiled component with the Player
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 shadow-2xl shadow-black/50">
      <Player
        component={CompiledComponent}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        controls={false}
        loop
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ScenePreview;
