'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CompositionProps } from '../core/types';
import { renderCompositionToVideo, downloadVideo, RenderProgress } from '../renderer';
import { DownloadIcon, VideoIcon, ClockIcon, Loader2Icon } from '../icons';

// Player Context
import { PlayerProvider, usePlayer, FrameContext } from '../core/context';

// Timeline component
const Timeline: React.FC<{
  durationInFrames: number;
  frame: number;
  onSeek: (frame: number) => void;
  marks?: number[];
  fps: number;
}> = ({ durationInFrames, frame, onSeek, marks = [], fps }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(Math.floor(percentage * durationInFrames));
  }, [durationInFrames, onSeek]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleClick(e as React.MouseEvent<HTMLDivElement>);
  }, [handleClick]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      onSeek(Math.floor(percentage * durationInFrames));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, durationInFrames, onSeek]);

  const progress = (frame / (durationInFrames - 1)) * 100;
  const timeInSeconds = frame / fps;
  const durationInSeconds = durationInFrames / fps;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div
        ref={timelineRef}
        className="relative h-2 bg-emerald-950 rounded-full cursor-pointer group border border-emerald-900/50"
        onMouseDown={handleMouseDown}
      >
        {/* Progress bar */}
        <div
          className="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full shadow-lg shadow-emerald-500/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white"
          style={{ left: `calc(${progress}% - 8px)` }}
        />

        {/* Markers */}
        {marks.map((mark, i) => (
          <div
            key={i}
            className="absolute top-0 w-0.5 h-full bg-emerald-400"
            style={{ left: `${(mark / durationInFrames) * 100}%` }}
          />
        ))}
      </div>

      {/* Time display */}
      <div className="flex justify-between mt-2 text-xs text-emerald-500 font-mono">
        <span>{formatTime(timeInSeconds)}</span>
        <span>{formatTime(durationInSeconds)}</span>
      </div>
    </div>
  );
};

// Controls component
const Controls: React.FC<{
  playing: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  frame: number;
  totalFrames: number;
  onExport: () => void;
  isExporting: boolean;
}> = ({
  playing,
  onPlayPause,
  onRestart,
  onStepBack,
  onStepForward,
  playbackRate,
  onPlaybackRateChange,
  frame,
  totalFrames,
  onExport,
  isExporting,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speeds = [0.25, 0.5, 1, 1.5, 2];

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Restart button */}
      <button
        onClick={onRestart}
        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 hover:scale-110"
        title="Restart"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Step back button */}
      <button
        onClick={onStepBack}
        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 hover:scale-110"
        title="Previous frame (←)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
      </button>

      {/* Play/Pause button */}
      <button
        onClick={onPlayPause}
        className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg shadow-emerald-500/30"
        title={playing ? 'Pause (Space)' : 'Play (Space)'}
      >
        {playing ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Step forward button */}
      <button
        onClick={onStepForward}
        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 hover:scale-110"
        title="Next frame (→)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
        </svg>
      </button>

      {/* Speed selector */}
      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 min-w-[55px] font-mono border border-emerald-900/50"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-[#0a0a0a] rounded-lg shadow-xl border border-emerald-900/50 py-1 min-w-[65px] overflow-hidden">
            {speeds.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onPlaybackRateChange(speed);
                  setShowSpeedMenu(false);
                }}
                className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                  playbackRate === speed
                    ? 'text-emerald-400 bg-emerald-950/50'
                    : 'text-emerald-500 hover:text-emerald-300 hover:bg-emerald-950/30'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Frame counter */}
      <div className="ml-2 px-3 py-1 bg-emerald-950/50 rounded-lg border border-emerald-900/50">
        <span className="text-sm text-emerald-400 font-mono">
          <span className="text-emerald-300">{frame + 1}</span>
          <span className="text-emerald-600 mx-1">/</span>
          <span className="text-emerald-500">{totalFrames}</span>
        </span>
      </div>

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className={`ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium ${isExporting ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
        title="Export Video"
      >
        {isExporting ? (
          <>
            <Loader2Icon size={18} />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <DownloadIcon size={18} />
            <span>Export</span>
          </>
        )}
      </button>
    </div>
  );
};

// Canvas component - renders the video composition
const Canvas: React.FC<{
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  component: React.ComponentType<Record<string, unknown>>;
  width: number;
  height: number;
  frame: number;
  fps: number;
  durationInFrames: number;
  playing: boolean;
  playbackRate: number;
  defaultProps?: Record<string, unknown>;
}> = ({
  canvasRef,
  component: Component,
  width,
  height,
  frame,
  fps,
  durationInFrames,
  playing,
  playbackRate,
  defaultProps = {},
}) => {
  const scale = Math.min(1, 800 / width);

  return (
    <div
      ref={canvasRef as any}
      className="relative rounded-xl overflow-hidden shadow-2xl shadow-emerald-900/30 border border-emerald-900/30"
      style={{
        width: width * scale,
        height: height * scale,
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Canvas border glow effect */}
      <div
        className="absolute -inset-px rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), transparent, rgba(20, 184, 166, 0.2))',
          zIndex: -1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <FrameContext.Provider
          value={{
            frame,
            fps,
            durationInFrames,
            width,
            height,
            playing,
            playbackRate,
            setFrame: () => {},
            setPlaying: () => {},
            setPlaybackRate: () => {},
          }}
        >
          <Component {...defaultProps} />
        </FrameContext.Provider>
      </div>
    </div>
  );
};

// Main Player component
export interface PlayerProps {
  component: React.ComponentType<Record<string, unknown>>;
  durationInFrames: number;
  fps?: number;
  width?: number;
  height?: number;
  defaultProps?: Record<string, unknown>;
  controls?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Player: React.FC<PlayerProps> = ({
  component,
  durationInFrames,
  fps = 30,
  width = 1920,
  height = 1080,
  defaultProps = {},
  controls = true,
  loop = true,
  autoPlay = false,
  style,
  className,
}) => {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Animation loop
  useEffect(() => {
    if (playing) {
      const frameDuration = 1000 / (fps * playbackRate);

      const animate = (currentTime: number) => {
        if (currentTime - lastTimeRef.current >= frameDuration) {
          setFrame((prevFrame) => {
            const nextFrame = prevFrame + 1;
            if (nextFrame >= durationInFrames) {
              if (loop) {
                return 0;
              }
              setPlaying(false);
              return prevFrame;
            }
            return nextFrame;
          });
          lastTimeRef.current = currentTime;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [playing, fps, playbackRate, durationInFrames, loop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFrame((f) => Math.max(0, f - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFrame((f) => Math.min(durationInFrames - 1, f + 1));
          break;
        case 'Home':
          setFrame(0);
          break;
        case 'End':
          setFrame(durationInFrames - 1);
          break;
        case 'j':
        case 'J':
          setFrame((f) => Math.max(0, f - 10));
          break;
        case 'l':
        case 'L':
          setFrame((f) => Math.min(durationInFrames - 1, f + 10));
          break;
        case 'k':
        case 'K':
          setPlaying((p) => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [durationInFrames]);

  const handleSeek = useCallback((targetFrame: number) => {
    setFrame(Math.max(0, Math.min(targetFrame, durationInFrames - 1)));
  }, [durationInFrames]);

  const handlePlayPause = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const handleRestart = useCallback(() => {
    setFrame(0);
    setPlaying(true);
  }, []);

  const handleStepBack = useCallback(() => {
    setFrame((f) => Math.max(0, f - 1));
  }, []);

  const handleStepForward = useCallback(() => {
    setFrame((f) => Math.min(durationInFrames - 1, f + 1));
  }, [durationInFrames]);

  const handleExport = async () => {
    if (isExporting || !canvasRef.current) return;

    setIsExporting(true);
    setExportProgress(0);
    setPlaying(false);

    try {
      // The canvas element we want to capture is the inner div that has the scale transform
      const elementToCapture = canvasRef.current.querySelector('div') as HTMLElement;

      const blob = await renderCompositionToVideo(
        (f) => setFrame(f),
        elementToCapture,
        { width, height, fps, durationInFrames },
        {
          onProgress: (progress) => setExportProgress(progress),
        }
      );

      if (blob) {
        downloadVideo(blob, `motionforge-export-${Date.now()}.webm`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#0a0a0a] rounded-2xl p-5 border border-emerald-900/30 ${className || ''}`}
      style={style}
    >
      {/* Export Progress Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0f0f0f] border border-emerald-900/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <VideoIcon size={24} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-400">Exporting Video</h3>
                  <p className="text-sm text-emerald-700">High Quality Render</p>
                </div>
              </div>
              <Loader2Icon size={24} className="text-emerald-500" />
            </div>

            <div className="space-y-4">
              <div className="h-4 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900/30">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-sm font-mono">
                <span className="text-emerald-500">Progress</span>
                <span className="text-emerald-400">{Math.round(exportProgress)}%</span>
              </div>

              <div className="pt-4 border-t border-emerald-900/20 grid grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/10 text-center">
                  <div className="text-xs text-emerald-700 uppercase mb-1">Resolution</div>
                  <div className="text-sm text-emerald-400">{width}x{height}</div>
                </div>
                <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/10 text-center">
                  <div className="text-xs text-emerald-700 uppercase mb-1">Frames</div>
                  <div className="text-sm text-emerald-400">{durationInFrames}</div>
                </div>
              </div>

              <p className="text-xs text-center text-emerald-800 italic pt-2">
                Please keep this tab active for faster rendering.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex justify-center mb-5">
        <Canvas
          canvasRef={canvasRef}
          component={component}
          width={width}
          height={height}
          frame={frame}
          fps={fps}
          durationInFrames={durationInFrames}
          playing={playing}
          playbackRate={playbackRate}
          defaultProps={defaultProps}
        />
      </div>

      {/* Controls */}
      {controls && (
        <div className="space-y-4">
          <Controls
            playing={playing}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
            onStepBack={handleStepBack}
            onStepForward={handleStepForward}
            playbackRate={playbackRate}
            onPlaybackRateChange={setPlaybackRate}
            frame={frame}
            totalFrames={durationInFrames}
            onExport={handleExport}
            isExporting={isExporting}
          />
          <Timeline
            durationInFrames={durationInFrames}
            frame={frame}
            onSeek={handleSeek}
            fps={fps}
          />
        </div>
      )}
    </div>
  );
};

export default Player;
