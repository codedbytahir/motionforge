'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { CompositionProps as CompositionType, VideoConfig } from '../core/types';
import { FrameProvider, FrameContext, useVideoConfig as useVideoConfigContext } from '../core/context';

// Composition Context
const CompositionContext = createContext<{
  id: string;
  config: VideoConfig;
} | null>(null);

export const useComposition = () => {
  const context = useContext(CompositionContext);
  if (!context) {
    throw new Error('useComposition must be used within a Composition');
  }
  return context;
};

// Re-export useVideoConfig for convenience
export const useVideoConfig = () => useVideoConfigContext();

interface CompositionProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames: number;
  defaultProps?: Record<string, unknown>;
  children?: ReactNode;
}

// Composition wrapper (for registration)
export const Composition: React.FC<CompositionProps> = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames,
  defaultProps = {},
}) => {
  return (
    <CompositionContext.Provider
      value={{
        id,
        config: { width, height, fps, durationInFrames },
      }}
    >
      <FrameProvider
        fps={fps}
        durationInFrames={durationInFrames}
        width={width}
        height={height}
      >
        <Component {...defaultProps} />
      </FrameProvider>
    </CompositionContext.Provider>
  );
};

// Player Composition - for preview with controlled frame
interface PlayerCompositionProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames: number;
  defaultProps?: Record<string, unknown>;
  frame: number;
  playing?: boolean;
  playbackRate?: number;
}

export const PlayerComposition: React.FC<PlayerCompositionProps> = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames,
  defaultProps = {},
  frame,
  playing = false,
  playbackRate = 1,
}) => {
  return (
    <CompositionContext.Provider
      value={{
        id,
        config: { width, height, fps, durationInFrames },
      }}
    >
      <StaticFrameProvider
        fps={fps}
        durationInFrames={durationInFrames}
        width={width}
        height={height}
        frame={frame}
        playing={playing}
        playbackRate={playbackRate}
      >
        <Component {...defaultProps} />
      </StaticFrameProvider>
    </CompositionContext.Provider>
  );
};

// Static Frame Provider - for controlled frame playback
interface StaticFrameProviderProps {
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  frame: number;
  playing: boolean;
  playbackRate: number;
  children: ReactNode;
}

const StaticFrameProvider: React.FC<StaticFrameProviderProps> = ({
  fps,
  durationInFrames,
  width,
  height,
  frame,
  playing,
  playbackRate,
  children,
}) => {
  const value = {
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
  };

  return (
    <FrameContext.Provider value={value}>
      {children}
    </FrameContext.Provider>
  );
};

// Export types
export type { CompositionProps };
