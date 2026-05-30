'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from '../../core/context';
import { interpolate, spring, Easing } from '../../utils/animation';

interface KineticTypographyProps {
  text: string;
  durationInFrames?: number;
  startFrame?: number;
  stagger?: number;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  color?: string;
  className?: string;
  type?: 'velocity' | 'stretching' | 'glitch' | 'reveal';
  style?: React.CSSProperties;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  stagger = 3,
  fontSize = 80,
  fontWeight = 'bold',
  fontFamily = 'Inter, system-ui, sans-serif',
  color = 'white',
  className = '',
  type = 'velocity',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const characters = text.split('');

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        fontSize,
        fontWeight,
        fontFamily,
        color,
        ...style,
      }}
    >
      {characters.map((char, i) => {
        const relativeStart = startFrame + i * stagger;
        const charFrame = frame - relativeStart;

        // Progress 0 to 1 for the whole animation of this character
        const progress = interpolate(
          charFrame,
          [0, durationInFrames],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeOutExpo }
        );

        let charStyle: React.CSSProperties = {
          display: 'inline-block',
          whiteSpace: 'pre',
        };

        if (type === 'velocity') {
          const y = interpolate(charFrame, [0, 20], [100, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.easeOutBack,
          });
          const opacity = interpolate(charFrame, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const blur = interpolate(charFrame, [0, 10], [20, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          charStyle = {
            ...charStyle,
            transform: `translateY(${y}px)`,
            opacity,
            filter: `blur(${blur}px)`,
          };
        } else if (type === 'stretching') {
          const scaleY = spring({
            frame: charFrame,
            fps,
            config: { damping: 12, stiffness: 200 },
            from: 0,
            to: 1,
          });
          const scaleX = spring({
            frame: charFrame,
            fps,
            config: { damping: 15, stiffness: 150 },
            from: 2,
            to: 1,
          });

          charStyle = {
            ...charStyle,
            transform: `scale(${scaleX}, ${scaleY})`,
            transformOrigin: 'bottom',
            opacity: progress,
          };
        } else if (type === 'glitch') {
          // Deterministic random based on frame and index
          const seed = charFrame + i * 1000;
          const randomVal = (Math.sin(seed) * 10000) % 1;
          const isGlitched = charFrame > 0 && charFrame < 15 && Math.abs(randomVal) > 0.8;
          const xOffset = isGlitched ? ((Math.sin(seed + 1) * 10000) % 1) * 20 : 0;
          const colorShift = isGlitched ? 'cyan' : color;

          charStyle = {
            ...charStyle,
            transform: `translateX(${xOffset}px)`,
            color: colorShift,
            opacity: progress,
          };
        } else if (type === 'reveal') {
          const clipWidth = interpolate(charFrame, [0, 20], [0, 100], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          charStyle = {
            ...charStyle,
            clipPath: `inset(0 ${100 - clipWidth}% 0 0)`,
            opacity: progress > 0 ? 1 : 0,
          };
        }

        return (
          <span key={i} style={charStyle}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};
