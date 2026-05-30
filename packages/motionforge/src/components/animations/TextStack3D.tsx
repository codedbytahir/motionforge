'use client';

import React from 'react';
import { useCurrentFrame } from '../../core/context';
import { interpolate, Easing } from '../../utils/animation';

interface TextStack3DProps {
  text: string;
  layers?: number;
  depth?: number;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  mainColor?: string;
  layerColor?: string;
  durationInFrames?: number;
  startFrame?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TextStack3D: React.FC<TextStack3DProps> = ({
  text,
  layers = 8,
  depth = 5,
  fontSize = 120,
  fontWeight = '900',
  fontFamily = 'Inter, system-ui, sans-serif',
  mainColor = '#ffffff',
  layerColor = '#10b981',
  durationInFrames = 60,
  startFrame = 0,
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeInOutCubic }
  );

  const rotateX = interpolate(progress, [0, 1], [0, 25]);
  const rotateY = interpolate(progress, [0, 1], [0, -25]);

  return (
    <div
      className={className}
      style={{
        perspective: '1000px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          fontSize,
          fontWeight,
          fontFamily,
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {/* Render bottom layers first */}
        {Array.from({ length: layers }).map((_, i) => {
          const layerDepth = (i + 1) * depth * progress;
          const isTop = i === layers - 1;

          return (
            <span
              key={i}
              style={{
                position: isTop ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                color: isTop ? mainColor : layerColor,
                transform: `translateZ(${layerDepth}px)`,
                WebkitTextStroke: isTop ? 'none' : `1px ${layerColor}`,
                opacity: isTop ? 1 : 1 - i / layers,
                pointerEvents: 'none',
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
