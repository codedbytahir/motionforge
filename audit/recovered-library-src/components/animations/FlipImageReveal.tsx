'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from '../../core/context';
import { interpolate, Easing } from '../../utils/animation';

interface FlipImageRevealProps {
  src: string;
  thumbnailRect: { x: number; y: number; width: number; height: number };
  durationInFrames?: number;
  startFrame?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const FlipImageReveal: React.FC<FlipImageRevealProps> = ({
  src,
  thumbnailRect,
  durationInFrames = 60,
  startFrame = 0,
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const { width: videoWidth, height: videoHeight } = useVideoConfig();

  const progress = interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeInOutQuart }
  );

  // Interpolate position and size
  const x = interpolate(progress, [0, 1], [thumbnailRect.x, 0]);
  const y = interpolate(progress, [0, 1], [thumbnailRect.y, 0]);
  const width = interpolate(progress, [0, 1], [thumbnailRect.width, videoWidth]);
  const height = interpolate(progress, [0, 1], [thumbnailRect.height, videoHeight]);

  const borderRadius = interpolate(progress, [0, 1], [12, 0]);
  const opacity = interpolate(progress, [0, 0.2], [0, 1]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        opacity,
        ...style,
      }}
    >
      <img
        src={src}
        alt="Reveal"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Overlay content appearing at the end */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          opacity: interpolate(progress, [0.8, 1], [0, 1]),
          transform: `translateY(${interpolate(progress, [0.8, 1], [20, 0])}px)`,
        }}
      >
        <h2 style={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}>Cinematic Reveal</h2>
        <p style={{ color: '#ccc', fontSize: '18px' }}>Smooth FLIP transition between states.</p>
      </div>
    </div>
  );
};
