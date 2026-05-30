'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from '../../core/context';
import { interpolate, Easing } from '../../utils/animation';

interface StickyGridScrollProps {
  items: React.ReactNode[];
  columns?: number;
  gap?: number;
  padding?: number;
  scrollDuration?: number;
  startFrame?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const StickyGridScroll: React.FC<StickyGridScrollProps> = ({
  items,
  columns = 3,
  gap = 20,
  padding = 40,
  scrollDuration = 300,
  startFrame = 0,
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  const progress = interpolate(
    frame - startFrame,
    [0, scrollDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear }
  );

  const totalHeight = (Math.ceil(items.length / columns) * (height / 2)) + (padding * 2);
  const scrollY = progress * (totalHeight - height);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#050505',
        ...style,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          padding: `${padding}px`,
          transform: `translateY(${-scrollY}px)`,
        }}
      >
        {items.map((item, i) => {
          const itemRow = Math.floor(i / columns);
          const itemY = itemRow * (height / 2) + padding;
          const relativeY = itemY - scrollY;

          // Animate items based on their visibility in the viewport
          const viewportProgress = interpolate(
            relativeY,
            [height, height * 0.8, height * 0.2, 0],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={i}
              style={{
                height: height / 2.5,
                opacity: viewportProgress,
                transform: `scale(${0.8 + 0.2 * viewportProgress}) translateY(${(1 - viewportProgress) * 50}px)`,
                transition: 'transform 0.1s linear',
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
