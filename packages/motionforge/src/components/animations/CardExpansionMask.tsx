'use client';

import React from 'react';
import { useCurrentFrame } from '../../core/context';
import { interpolate, Easing } from '../../utils/animation';

interface CardExpansionMaskProps {
  children: React.ReactNode;
  durationInFrames?: number;
  startFrame?: number;
  centerX?: number;
  centerY?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CardExpansionMask: React.FC<CardExpansionMaskProps> = ({
  children,
  durationInFrames = 60,
  startFrame = 0,
  centerX = 50, // percentage
  centerY = 50, // percentage
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, '');

  const progress = interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeInOutCubic }
  );

  // Use a large enough radius to cover the screen
  const radius = progress * 150; // percentage

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        clipPath: `circle(${radius}% at ${centerX}% ${centerY}%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
