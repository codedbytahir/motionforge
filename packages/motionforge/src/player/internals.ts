import React, { useRef, useEffect, useState } from 'react';
import { PlayerEmitter } from './player-emitter';

/**
 * Player Internals — Low-level APIs for building custom player UIs.
 */

export { PlayerEmitter };

export interface PlaybackOptions {
  fps: number;
  durationInFrames: number;
  playing: boolean;
  playbackRate: number;
  loop: boolean;
  onFrame: (frame: number) => void;
  onEnded: () => void;
}

/**
 * Hook for managing playback animation loop.
 */
export function usePlayback(options: PlaybackOptions) {
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!options.playing) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const frameDuration = 1000 / (options.fps * options.playbackRate);

    const animate = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= frameDuration) {
        options.onFrame(1); // Placeholder for frame increment
        lastTimeRef.current = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [options.playing, options.fps, options.playbackRate, options.onFrame]);
}

/**
 * Calculate the scale and positioning for a video canvas within a container.
 */
export function calculateCanvasTransformation(
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number
): { scale: number; x: number; y: number; width: number; height: number } {
  const scale = Math.min(
    containerWidth / videoWidth,
    containerHeight / videoHeight
  );

  const width = videoWidth * scale;
  const height = videoHeight * scale;
  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;

  return { scale, x, y, width, height };
}

/**
 * Hook for observing container element size changes.
 */
export function useElementSize(
  ref: React.RefObject<HTMLElement | null>
): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
