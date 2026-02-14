'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/context';
import { spring, interpolate, Easing, measureSpring } from '../utils/animation';

// Re-export animation utilities
export { spring, interpolate, Easing, measureSpring };

// Use Spring Hook
interface UseSpringOptions {
  fps?: number;
  frame?: number;
  config?: {
    damping?: number;
    mass?: number;
    stiffness?: number;
    overshootClamping?: boolean;
  };
  from?: number;
  to?: number;
  durationInFrames?: number;
}

export const useSpring = (options: UseSpringOptions = {}) => {
  const currentFrame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();
  
  const {
    fps = videoFps,
    frame = currentFrame,
    config = {},
    from = 0,
    to = 1,
    durationInFrames,
  } = options;
  
  return spring({
    frame,
    fps,
    config,
    from,
    to,
    durationInFrames,
  });
};

// Use Interpolate Hook
export const useInterpolate = (
  inputRange: number[],
  outputRange: number[],
  options?: {
    extrapolateLeft?: 'clamp' | 'extend' | 'identity';
    extrapolateRight?: 'clamp' | 'extend' | 'identity';
    easing?: (t: number) => number;
  }
) => {
  const frame = useCurrentFrame();
  return interpolate(frame, inputRange, outputRange, options);
};

// Use Cycle Hook - cycles through an array of values
export const useCycle = <T,>(items: T[], frame: number, durationPerItem: number): T => {
  const index = Math.floor(frame / durationPerItem) % items.length;
  return items[index];
};

// Use Duration Helper
export const useDurationInFrames = (seconds: number): number => {
  const { fps } = useVideoConfig();
  return Math.round(seconds * fps);
};

// Use Delay - delays animation start
export const useDelay = (delayInFrames: number): boolean => {
  const frame = useCurrentFrame();
  return frame >= delayInFrames;
};

// Use Progress - returns 0-1 progress through video
export const useProgress = (): number => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return frame / (durationInFrames - 1);
};

// Use Loop - loops animation
export const useLoop = (loopDuration: number): number => {
  const frame = useCurrentFrame();
  return frame % loopDuration;
};

// Use Timeline - get timeline info
export const useTimeline = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  
  return {
    frame,
    durationInFrames,
    fps,
    progress: frame / (durationInFrames - 1),
    timeInSeconds: frame / fps,
    durationInSeconds: durationInFrames / fps,
    remainingFrames: durationInFrames - frame - 1,
    remainingTimeInSeconds: (durationInFrames - frame - 1) / fps,
  };
};

// Use Windowed Frame - only renders when frame is in window
export const useWindowedFrame = (
  startFrame: number,
  endFrame: number
): { isInWindow: boolean; relativeFrame: number } => {
  const frame = useCurrentFrame();
  const isInWindow = frame >= startFrame && frame < endFrame;
  const relativeFrame = frame - startFrame;
  
  return { isInWindow, relativeFrame: isInWindow ? relativeFrame : 0 };
};

// Use Animation - tracks animation state
interface AnimationState {
  isAnimating: boolean;
  isComplete: boolean;
  progress: number;
  direction: 'forward' | 'backward' | 'none';
}

export const useAnimation = (
  startFrame: number,
  endFrame: number
): AnimationState => {
  const frame = useCurrentFrame();
  const isAnimating = frame >= startFrame && frame < endFrame;
  const isComplete = frame >= endFrame;
  const progress = isAnimating 
    ? (frame - startFrame) / (endFrame - startFrame)
    : isComplete ? 1 : 0;
  
  return {
    isAnimating,
    isComplete,
    progress,
    direction: frame < startFrame ? 'forward' : frame >= endFrame ? 'none' : 'forward',
  };
};

// Use Keyframe State - manages keyframe-based animations
interface KeyframeState<T> {
  current: T;
  previous: T | null;
  next: T | null;
  progress: number;
}

export const useKeyframeState = <T extends number>(
  keyframes: { frame: number; value: T }[]
): KeyframeState<T> => {
  const frame = useCurrentFrame();
  
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }
  
  const progress = frame <= prev.frame ? 0 : frame >= next.frame ? 1 : 
    (frame - prev.frame) / (next.frame - prev.frame);
  
  return {
    current: prev.value + progress * (next.value - prev.value) as T,
    previous: prev !== sorted[0] ? prev.value : null,
    next: next !== sorted[sorted.length - 1] ? next.value : null,
    progress,
  };
};

// Use Transform - apply transforms based on frame
interface TransformOptions {
  translateX?: (frame: number) => number;
  translateY?: (frame: number) => number;
  scale?: (frame: number) => number;
  rotate?: (frame: number) => number;
  opacity?: (frame: number) => number;
}

export const useTransform = (options: TransformOptions): React.CSSProperties => {
  const frame = useCurrentFrame();
  
  const transforms: string[] = [];
  
  if (options.translateX) {
    transforms.push(`translateX(${options.translateX(frame)}px)`);
  }
  if (options.translateY) {
    transforms.push(`translateY(${options.translateY(frame)}px)`);
  }
  if (options.scale) {
    transforms.push(`scale(${options.scale(frame)})`);
  }
  if (options.rotate) {
    transforms.push(`rotate(${options.rotate(frame)}deg)`);
  }
  
  const style: React.CSSProperties = {};
  
  if (transforms.length > 0) {
    style.transform = transforms.join(' ');
  }
  if (options.opacity) {
    style.opacity = options.opacity(frame);
  }
  
  return style;
};

// Use Fade - simple fade in/out
export const useFade = (
  fadeInDuration: number,
  fadeOutDuration: number,
  options?: { startFrame?: number; endFrame?: number }
): number => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const startFrame = options?.startFrame ?? 0;
  const endFrame = options?.endFrame ?? durationInFrames;
  
  // Fade in
  if (frame < startFrame + fadeInDuration) {
    return interpolate(
      frame,
      [startFrame, startFrame + fadeInDuration],
      [0, 1],
      { extrapolateRight: 'clamp' }
    );
  }
  
  // Fade out
  if (frame > endFrame - fadeOutDuration) {
    return interpolate(
      frame,
      [endFrame - fadeOutDuration, endFrame],
      [1, 0],
      { extrapolateLeft: 'clamp' }
    );
  }
  
  return 1;
};

// Use Slide - simple slide animation
export const useSlide = (
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number,
  duration: number,
  startFrame: number = 0
): { transform: string } => {
  const frame = useCurrentFrame();
  
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const easedProgress = Easing.easeOutCubic(progress);
  
  let transform = '';
  const offset = distance * (1 - easedProgress);
  
  switch (direction) {
    case 'left':
      transform = `translateX(${-offset}px)`;
      break;
    case 'right':
      transform = `translateX(${offset}px)`;
      break;
    case 'up':
      transform = `translateY(${-offset}px)`;
      break;
    case 'down':
      transform = `translateY(${offset}px)`;
      break;
  }
  
  return { transform };
};

// Use Shake - shake animation
export const useShake = (
  intensity: number,
  duration: number,
  startFrame: number = 0
): { transform: string } => {
  const frame = useCurrentFrame();
  
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const currentIntensity = intensity * (1 - progress);
  const shakeX = Math.sin(frame * 0.5) * currentIntensity;
  const shakeY = Math.cos(frame * 0.7) * currentIntensity;
  
  return { transform: `translate(${shakeX}px, ${shakeY}px)` };
};

// Use Pulse - pulsing animation
export const usePulse = (
  minScale: number,
  maxScale: number,
  frequency: number
): { transform: string } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = (Math.sin((frame / fps) * frequency * Math.PI * 2) + 1) / 2;
  const scale = interpolate(progress, [0, 1], [minScale, maxScale]);
  
  return { transform: `scale(${scale})` };
};
