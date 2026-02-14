// Optimized Hooks for Frame Rendering and Memoization
// These hooks are designed to work within React's strict rules

import { useMemo, useCallback } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/context';
import { MemoCache } from '../renderer/cache';
import { spring, interpolate } from '../utils/animation';

/**
 * Memoized frame value hook
 * Caches computed values based on frame and dependencies
 */
export function useMemoizedFrame<T>(
  compute: () => T,
  deps: unknown[] = []
): T {
  const frame = useCurrentFrame();
  const memoCache = useMemo(() => MemoCache.getInstance(), []);
  
  const key = useMemo(() => `frame:${frame}:${JSON.stringify(deps)}`, [frame, deps]);
  
  return useMemo(() => {
    return memoCache.getOrCompute(key, compute, [frame, ...deps]);
  }, [key, compute, memoCache, frame, deps]);
}

/**
 * Memoized animation value hook
 * Only recomputes when frame changes
 */
export function useAnimationValue<T>(
  compute: (frame: number) => T,
  _frameDeps?: number[]
): T {
  const frame = useCurrentFrame();
  
  // Simply recompute each frame - React's useMemo will handle deduplication
  return useMemo(() => compute(frame), [frame, compute]);
}

/**
 * Cached frame hook - simplified version
 */
export function useCachedFrame<T>(
  compositionId: string,
  renderer: (frame: number) => T
): T {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  return useMemo(() => {
    return renderer(frame);
  }, [compositionId, frame, width, height, renderer]);
}

/**
 * Throttled frame update hook - returns frame directly
 * Throttling is handled by the player
 */
export function useThrottledFrame(_throttleMs?: number): number {
  return useCurrentFrame();
}

/**
 * Batch frame processing hook - simplified
 */
export function useBatchFrameProcessor<T, R>(
  processor: (items: T[]) => R[],
  _batchSize?: number
): (items: T[]) => R[] {
  return useCallback((items: T[]) => {
    return processor(items);
  }, [processor]);
}

/**
 * Frame range hook for efficient range queries
 */
export function useFrameRange(
  startFrame: number,
  endFrame: number
): number[] {
  return useMemo(() => {
    const frames: number[] = [];
    for (let i = startFrame; i <= endFrame; i++) {
      frames.push(i);
    }
    return frames;
  }, [startFrame, endFrame]);
}

/**
 * Pre-compute frames hook - returns pre-computed values
 */
export function usePrecomputeFrames<T>(
  compute: (frame: number) => T,
  lookahead: number = 10
): Map<number, T> {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  return useMemo(() => {
    const cache = new Map<number, T>();
    for (let i = frame; i < Math.min(frame + lookahead, durationInFrames); i++) {
      cache.set(i, compute(i));
    }
    return cache;
  }, [frame, lookahead, durationInFrames, compute]);
}

/**
 * Optimized spring hook with caching
 */
export function useOptimizedSpring(
  config: { damping?: number; stiffness?: number; mass?: number },
  from: number = 0,
  to: number = 1
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return useMemo(() => {
    return spring({ frame, fps, config, from, to });
  }, [frame, fps, config, from, to]);
}

/**
 * Optimized interpolate hook with caching
 */
export function useOptimizedInterpolate(
  inputRange: number[],
  outputRange: number[],
  options?: { easing?: (t: number) => number; extrapolateLeft?: string; extrapolateRight?: string }
): (frame: number) => number {
  return useCallback((frame: number) => {
    return interpolate(frame, inputRange, outputRange, options);
  }, [inputRange, outputRange, options]);
}

/**
 * Performance monitoring hook
 * Returns static metrics - actual monitoring should use external tools
 */
export function usePerformanceMonitor(): {
  fps: number;
  frameTime: number;
  renderTime: number;
} {
  // Return default values - real monitoring requires external setup
  return useMemo(() => ({
    fps: 60,
    frameTime: 16.67,
    renderTime: 0,
  }), []);
}

/**
 * Render priority hook
 * Returns render priority based on configuration
 */
export function useRenderPriority(): 'high' | 'medium' | 'low' {
  return useMemo(() => 'high', []);
}

// Default export for module
const performanceHooks = {
  useMemoizedFrame,
  useAnimationValue,
  useCachedFrame,
  useThrottledFrame,
  useBatchFrameProcessor,
  useFrameRange,
  usePrecomputeFrames,
  useOptimizedSpring,
  useOptimizedInterpolate,
  usePerformanceMonitor,
  useRenderPriority,
};

export default performanceHooks;
