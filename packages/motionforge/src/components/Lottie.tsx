'use client';

import React, { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem, AnimationConfigWithData, AnimationConfigWithPath } from 'lottie-web';
import { useCurrentFrame, useVideoConfig } from '../core/context';
import { useRelativeCurrentFrame } from './Sequence';
import { LottieAnimationProps } from '../core/types';

/**
 * LottieAnimation Component
 *
 * Renders a Lottie animation synchronized with the MotionForge frame system.
 * This component is deterministic and does not use requestAnimationFrame for playback.
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
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

  // Use relative frame if inside a Sequence, otherwise use absolute frame
  const relativeFrame = useRelativeCurrentFrame();
  const absoluteFrame = useCurrentFrame();
  const currentFrame = relativeFrame !== null ? relativeFrame : absoluteFrame;

  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Lottie instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container to prevent duplicate renders
    containerRef.current.innerHTML = '';

    const commonConfig = {
      container: containerRef.current,
      renderer: 'svg' as const,
      loop: false, // We control playback manually
      autoplay: false, // We control playback manually
    };

    let anim: AnimationItem;

    if (typeof src === 'string') {
      anim = lottie.loadAnimation({
        ...commonConfig,
        path: src,
      } as AnimationConfigWithPath);
    } else {
      // Create a deep copy of animationData to prevent lottie-web from mutating it
      anim = lottie.loadAnimation({
        ...commonConfig,
        animationData: JSON.parse(JSON.stringify(src)),
      } as AnimationConfigWithData);
    }

    animationRef.current = anim;

    const handleLoaded = () => {
      setIsLoaded(true);
    };

    // Lottie emits DOMLoaded when the SVG elements are added to the DOM
    anim.addEventListener('DOMLoaded', handleLoaded);

    return () => {
      anim.removeEventListener('DOMLoaded', handleLoaded);
      anim.destroy();
      animationRef.current = null;
    };
  }, [src]);

  // Synchronize Lottie frame with MotionForge frame
  useEffect(() => {
    if (!animationRef.current || !isLoaded) return;

    const anim = animationRef.current;

    // totalFrames is the number of frames in the Lottie animation
    const totalLottieFrames = anim.totalFrames;

    // Determine the effective end frame for the animation window
    const end = frameEnd !== undefined ? frameEnd : totalLottieFrames;
    const duration = end - frameStart;

    // Calculate the target frame in the Lottie animation
    let lottieFrame = (currentFrame * playbackRate) + frameStart;

    if (loop && duration > 0) {
      // Loop within the specified window [frameStart, end]
      lottieFrame = frameStart + ((lottieFrame - frameStart) % duration);
    } else {
      // Clamp to the end frame if not looping
      lottieFrame = Math.min(lottieFrame, end);
    }

    // Go to the calculated frame and stop (prevent internal playback)
    // The second parameter 'true' indicates we are using frame numbers, not time.
    anim.goToAndStop(lottieFrame, true);
  }, [currentFrame, isLoaded, frameStart, frameEnd, playbackRate, loop]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: width || '100%',
        height: height || '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default LottieAnimation;
