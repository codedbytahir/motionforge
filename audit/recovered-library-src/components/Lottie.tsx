'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { useCurrentFrame } from '../core/context';
import { useRelativeCurrentFrame } from './Sequence';

export interface LottieProps {
  /**
   * Source of the Lottie animation. Can be a URL to a JSON file or an imported JSON object.
   */
  src: string | object;
  /**
   * The frame at which the Lottie animation should start playing.
   * Default is 0.
   */
  frameStart?: number;
  /**
   * The frame at which the Lottie animation should end playing.
   * Default is the last frame of the Lottie animation.
   */
  frameEnd?: number;
  /**
   * Playback rate of the Lottie animation.
   * Default is 1.
   */
  playbackRate?: number;
  /**
   * Whether the Lottie animation should loop.
   * Default is false.
   */
  loop?: boolean;
  /**
   * Width of the Lottie container.
   */
  width?: number | string;
  /**
   * Height of the Lottie container.
   */
  height?: number | string;
  /**
   * Style overrides for the Lottie container.
   */
  style?: React.CSSProperties;
  /**
   * CSS class name for the Lottie container.
   */
  className?: string;
}

/**
 * Lottie Component for MotionForge.
 *
 * Provides production-grade Lottie support with deterministic frame synchronization.
 * Synchronizes with the MotionForge frame system instead of using time-based playback.
 */
export const Lottie: React.FC<LottieProps> = ({
  src,
  frameStart = 0,
  frameEnd,
  playbackRate = 1,
  loop = false,
  width,
  height,
  style,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const absoluteFrame = useCurrentFrame();
  const relativeFrame = useRelativeCurrentFrame();

  // Use relative frame if inside a Sequence, otherwise use absolute frame
  const currentFrame = relativeFrame !== null ? relativeFrame : absoluteFrame;

  // Handle initialization
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let isCancelled = false;

    const params: any = {
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      rendererSettings: {
        progressiveLoad: false,
        hideOnTransparent: true,
      }
    };

    if (typeof src === 'string') {
      params.path = src;
    } else {
      params.animationData = src;
    }

    try {
      const anim = lottie.loadAnimation(params);
      animationRef.current = anim;

      const onLoaded = () => {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      };

      // Both events can be useful depending on how Lottie is loaded
      anim.addEventListener('DOMLoaded', onLoaded);
      anim.addEventListener('data_ready', onLoaded);

      return () => {
        isCancelled = true;
        anim.destroy();
        animationRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return () => {};
    }
  }, [src]);

  // Handle frame synchronization
  useEffect(() => {
    if (!animationRef.current || !isLoaded) return;

    const anim = animationRef.current;

    // totalFrames is available once loaded
    const totalLottieFrames = anim.totalFrames;

    // Determine the range of frames to play
    const start = frameStart;
    const end = frameEnd ?? totalLottieFrames;
    const duration = end - start;

    if (duration <= 0) return;

    // Map MotionForge currentFrame to Lottie frame
    // playbackRate affects how fast we move through the Lottie timeline
    let targetFrame = currentFrame * playbackRate;

    if (loop) {
      targetFrame = targetFrame % duration;
    } else {
      targetFrame = Math.min(targetFrame, duration - 0.01);
    }

    // finalFrame is relative to the Lottie's original timeline
    const finalFrame = start + targetFrame;

    // goToAndStop(value, isFrame) - second arg true means it's a frame number, not time
    anim.goToAndStop(finalFrame, true);
  }, [currentFrame, isLoaded, frameStart, frameEnd, playbackRate, loop]);

  const containerStyle: React.CSSProperties = useMemo(() => ({
    width: width ?? '100%',
    height: height ?? '100%',
    ...style,
  }), [width, height, style]);

  if (error) {
    return (
      <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
        <strong>Lottie Error:</strong> {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={className}
      data-lottie-loaded={isLoaded}
    />
  );
};
