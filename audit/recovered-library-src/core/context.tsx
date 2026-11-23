'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { FrameContextValue, CompositionProps, TimelineState } from './types';

// Frame Context - provides current frame information to all children
const FrameContext = createContext<FrameContextValue | null>(null);

export const useCurrentFrame = (): number => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error('useCurrentFrame must be used within a FrameContext.Provider');
  }
  return context.frame;
};

export const useVideoConfig = () => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error('useVideoConfig must be used within a FrameContext.Provider');
  }
  return {
    fps: context.fps,
    durationInFrames: context.durationInFrames,
    width: context.width,
    height: context.height,
  };
};

export const useTimelineState = () => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error('useTimelineState must be used within a FrameContext.Provider');
  }
  return {
    frame: context.frame,
    playing: context.playing,
    playbackRate: context.playbackRate,
    setFrame: context.setFrame,
    setPlaying: context.setPlaying,
    setPlaybackRate: context.setPlaybackRate,
  };
};

// Composition Manager Context
interface CompositionManagerContextValue {
  compositions: Map<string, CompositionProps>;
  currentComposition: CompositionProps | null;
  registerComposition: (composition: CompositionProps) => void;
  unregisterComposition: (id: string) => void;
  setCurrentComposition: (id: string) => void;
}

const CompositionManagerContext = createContext<CompositionManagerContextValue | null>(null);

export const useCompositionManager = () => {
  const context = useContext(CompositionManagerContext);
  if (!context) {
    throw new Error('useCompositionManager must be used within CompositionManagerProvider');
  }
  return context;
};

// Player Context for timeline playback control
interface PlayerContextValue extends TimelineState {
  durationInFrames: number;
  fps: number;
  seek: (frame: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  frameRef: React.MutableRefObject<number>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Frame Provider Component
interface FrameProviderProps {
  fps?: number;
  durationInFrames: number;
  width: number;
  height: number;
  children: React.ReactNode;
  initialFrame?: number;
}

export const FrameProvider: React.FC<FrameProviderProps> = ({
  fps = 30,
  durationInFrames,
  width,
  height,
  children,
  initialFrame = 0,
}) => {
  const [frame, setFrameState] = useState(initialFrame);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(initialFrame);

  const setFrame = useCallback((newFrame: number) => {
    const clampedFrame = Math.max(0, Math.min(newFrame, durationInFrames - 1));
    setFrameState(clampedFrame);
    frameRef.current = clampedFrame;
  }, [durationInFrames]);

  useEffect(() => {
    if (playing) {
      const frameDuration = 1000 / (fps * playbackRate);
      
      const animate = (currentTime: number) => {
        if (currentTime - lastTimeRef.current >= frameDuration) {
          frameRef.current += 1;
          
          if (frameRef.current >= durationInFrames) {
            frameRef.current = 0;
            setFrameState(0);
            lastTimeRef.current = currentTime;
          } else {
            setFrameState(frameRef.current);
            lastTimeRef.current = currentTime;
          }
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [playing, fps, playbackRate, durationInFrames]);

  const value: FrameContextValue = {
    frame,
    fps,
    durationInFrames,
    width,
    height,
    playing,
    playbackRate,
    setFrame,
    setPlaying,
    setPlaybackRate,
  };

  return (
    <FrameContext.Provider value={value}>
      {children}
    </FrameContext.Provider>
  );
};

// Composition Manager Provider
interface CompositionManagerProviderProps {
  children: React.ReactNode;
}

export const CompositionManagerProvider: React.FC<CompositionManagerProviderProps> = ({ children }) => {
  const [compositions] = useState(() => new Map<string, CompositionProps>());
  const [currentCompositionId, setCurrentCompositionId] = useState<string | null>(null);

  const registerComposition = useCallback((composition: CompositionProps) => {
    compositions.set(composition.id, composition);
  }, [compositions]);

  const unregisterComposition = useCallback((id: string) => {
    compositions.delete(id);
  }, [compositions]);

  const setCurrentComposition = useCallback((id: string) => {
    if (compositions.has(id)) {
      setCurrentCompositionId(id);
    }
  }, [compositions]);

  const currentComposition = currentCompositionId ? compositions.get(currentCompositionId) || null : null;

  return (
    <CompositionManagerContext.Provider
      value={{
        compositions,
        currentComposition,
        registerComposition,
        unregisterComposition,
        setCurrentComposition,
      }}
    >
      {children}
    </CompositionManagerContext.Provider>
  );
};

// Player Provider
interface PlayerProviderProps {
  durationInFrames: number;
  fps?: number;
  children: React.ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({
  durationInFrames,
  fps = 30,
  children,
}) => {
  const [frame, setFrameState] = useState(0);
  const [playing, setPlayingState] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const seek = useCallback((targetFrame: number) => {
    const clampedFrame = Math.max(0, Math.min(targetFrame, durationInFrames - 1));
    frameRef.current = clampedFrame;
    setFrameState(clampedFrame);
  }, [durationInFrames]);

  const play = useCallback(() => setPlayingState(true), []);
  const pause = useCallback(() => setPlayingState(false), []);
  const toggle = useCallback(() => setPlayingState(p => !p), []);
  const restart = useCallback(() => {
    frameRef.current = 0;
    setFrameState(0);
  }, []);

  useEffect(() => {
    if (playing) {
      const frameDuration = 1000 / (fps * playbackRate);
      
      const animate = (currentTime: number) => {
        if (currentTime - lastTimeRef.current >= frameDuration) {
          frameRef.current += 1;
          
          if (frameRef.current >= durationInFrames) {
            frameRef.current = 0;
            setFrameState(0);
          } else {
            setFrameState(frameRef.current);
          }
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
  }, [playing, fps, playbackRate, durationInFrames]);

  return (
    <PlayerContext.Provider
      value={{
        frame,
        playing,
        playbackRate,
        durationInFrames,
        fps,
        seek,
        play,
        pause,
        toggle,
        restart,
        frameRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export { FrameContext, CompositionManagerContext, PlayerContext };
