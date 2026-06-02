'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { CompositionProps as CompositionType, VideoConfig } from '../core/types';
import { FrameProvider, FrameContext, useVideoConfig as useVideoConfigContext } from '../core/context';
import { getInputProps, resolveProps } from '../core/input-props';

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

interface CalculateMetadataResult {
  fps?: number;
  width?: number;
  height?: number;
  durationInFrames?: number;
  props?: Record<string, unknown>;
}

interface CalculateMetadataOptions {
  defaultProps: Record<string, unknown>;
  abortSignal: AbortSignal;
}

interface CompositionProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames: number;
  defaultProps?: Record<string, unknown>;
  inputProps?: Record<string, unknown>;
  calculateMetadata?: (options: CalculateMetadataOptions) => Promise<CalculateMetadataResult>;
  schema?: any;
  children?: ReactNode;
}

// Composition wrapper (for registration)
export const Composition: React.FC<CompositionProps> = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames: defaultDurationInFrames,
  defaultProps = {},
  inputProps,
  calculateMetadata,
  schema,
}) => {
  const [resolvedConfig, setResolvedConfig] = useState({
    width,
    height,
    fps,
    durationInFrames: defaultDurationInFrames,
    props: inputProps ? { ...defaultProps, ...inputProps } : { ...defaultProps, ...getInputProps() },
  });
  const [isResolving, setIsResolving] = useState(!!calculateMetadata);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const resolveMetadata = async () => {
      if (!calculateMetadata) {
        setIsResolving(false);
        return;
      }

      setIsResolving(true);
      setError(null);

      try {
        const result = await calculateMetadata({
          defaultProps: inputProps ? { ...defaultProps, ...inputProps } : defaultProps,
          abortSignal: abortController.signal,
        });

        if (abortController.signal.aborted) return;

        setResolvedConfig(prev => ({
          width: result.width ?? prev.width,
          height: result.height ?? prev.height,
          fps: result.fps ?? prev.fps,
          durationInFrames: result.durationInFrames ?? prev.durationInFrames,
          props: result.props ?? prev.props,
        }));
      } catch (err) {
        if (abortController.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!abortController.signal.aborted) {
          setIsResolving(false);
        }
      }
    };

    resolveMetadata();
    return () => abortController.abort();
  }, [calculateMetadata, JSON.stringify(defaultProps), JSON.stringify(inputProps)]);

  // Zod validation (F14)
  useEffect(() => {
    if (schema && resolvedConfig.props) {
      try {
        // Dynamic import to avoid hard dependency
        import('zod').then(({ z }) => {
          if (schema && typeof schema.parse === 'function') {
            schema.parse(resolvedConfig.props);
          }
        }).catch(() => {
          // zod not installed — skip validation
        });
      } catch {
        // Ignore
      }
    }
  }, [schema, resolvedConfig.props]);

  if (isResolving) {
    return null;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red', fontFamily: 'monospace', backgroundColor: '#000' }}>
        calculateMetadata error: {error.message}
      </div>
    );
  }

  return (
    <CompositionContext.Provider
      value={{
        id,
        config: {
          width: resolvedConfig.width,
          height: resolvedConfig.height,
          fps: resolvedConfig.fps,
          durationInFrames: resolvedConfig.durationInFrames
        },
      }}
    >
      <FrameProvider
        fps={resolvedConfig.fps}
        durationInFrames={resolvedConfig.durationInFrames}
        width={resolvedConfig.width}
        height={resolvedConfig.height}
      >
        <Component {...resolvedConfig.props} />
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
  inputProps?: Record<string, unknown>;
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
  inputProps,
  frame,
  playing = false,
  playbackRate = 1,
}) => {
  const resolvedProps = inputProps
    ? { ...defaultProps, ...inputProps }
    : { ...defaultProps, ...getInputProps() };

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
        <Component {...resolvedProps} />
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

interface StillProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  defaultProps?: Record<string, unknown>;
  inputProps?: Record<string, unknown>;
  schema?: any; // Zod schema — for future F14 integration
}

export const Still: React.FC<StillProps> = ({
  id,
  component,
  width = 1920,
  height = 1080,
  defaultProps = {},
  inputProps,
}) => {
  return (
    <Composition
      id={id}
      component={component}
      width={width}
      height={height}
      fps={1}
      durationInFrames={1}
      defaultProps={defaultProps}
      inputProps={inputProps}
    />
  );
};

// Export types
export type { CompositionProps };
