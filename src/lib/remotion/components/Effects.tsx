'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/context';
import { interpolate, Easing } from '../utils/animation';

// Fade component
interface FadeProps {
  children: React.ReactNode;
  durationInFrames?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  durationInFrames = 30,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ opacity, ...style }}>
      {children}
    </div>
  );
};

// Scale component
interface ScaleProps {
  children: React.ReactNode;
  from?: number;
  to?: number;
  durationInFrames?: number;
  startFrame?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
}

export const Scale: React.FC<ScaleProps> = ({
  children,
  from = 0,
  to = 1,
  durationInFrames = 30,
  startFrame = 0,
  easing = Easing.easeOutCubic,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  const scale = from + (to - from) * progress;

  return (
    <div style={{ transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
};

// Slide component
interface SlideProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  durationInFrames?: number;
  startFrame?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
}

export const Slide: React.FC<SlideProps> = ({
  children,
  direction,
  distance = 100,
  durationInFrames = 30,
  startFrame = 0,
  easing = Easing.easeOutCubic,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  let transform = '';
  const offset = distance * (1 - progress);

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

  return (
    <div style={{ transform, ...style }}>
      {children}
    </div>
  );
};

// Rotate component
interface RotateProps {
  children: React.ReactNode;
  degrees?: number;
  durationInFrames?: number;
  startFrame?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
}

export const Rotate: React.FC<RotateProps> = ({
  children,
  degrees = 360,
  durationInFrames = 60,
  startFrame = 0,
  easing = Easing.linear,
  style,
}) => {
  const frame = useCurrentFrame();

  const rotation = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, degrees],
    { extrapolateLeft: 'clamp', extrapolateRight: 'extend', easing }
  );

  return (
    <div style={{ transform: `rotate(${rotation}deg)`, ...style }}>
      {children}
    </div>
  );
};

// Typewriter component
interface TypewriterProps {
  text: string;
  durationInFrames?: number;
  startFrame?: number;
  style?: React.CSSProperties;
  cursor?: boolean;
  cursorChar?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  style,
  cursor = true,
  cursorChar = '|',
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, text.length],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const displayText = text.slice(0, Math.floor(progress));
  const showCursor = cursor && (frame % 30 < 15);

  return (
    <span style={style}>
      {displayText}
      {showCursor && cursorChar}
    </span>
  );
};

// Counter component
interface CounterProps {
  from?: number;
  to: number;
  durationInFrames?: number;
  startFrame?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  format?: (value: number) => string;
}

export const Counter: React.FC<CounterProps> = ({
  from = 0,
  to,
  durationInFrames = 60,
  startFrame = 0,
  easing = Easing.easeOutCubic,
  style,
  format = (v) => Math.round(v).toLocaleString(),
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  return (
    <span style={style}>
      {format(value)}
    </span>
  );
};

// Progress Bar component
interface ProgressBarProps {
  progress: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = 200,
  height = 10,
  backgroundColor = '#333',
  fillColor = '#3b82f6',
  borderRadius = 5,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        borderRadius,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          backgroundColor: fillColor,
          transition: 'width 0.1s ease',
        }}
      />
    </div>
  );
};

// Glitch effect component
interface GlitchProps {
  children: React.ReactNode;
  intensity?: number;
  style?: React.CSSProperties;
}

export const Glitch: React.FC<GlitchProps> = ({
  children,
  intensity = 10,
  style,
}) => {
  const frame = useCurrentFrame();

  const shouldGlitch = frame % 10 < 3;
  const offset = shouldGlitch ? Math.random() * intensity : 0;
  const colorOffset = shouldGlitch ? Math.random() * 2 - 1 : 0;

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Red channel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: offset,
          opacity: shouldGlitch ? 0.8 : 0,
          color: 'red',
          mixBlendMode: 'screen',
        }}
      >
        {children}
      </div>
      {/* Cyan channel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -offset,
          opacity: shouldGlitch ? 0.8 : 0,
          color: 'cyan',
          mixBlendMode: 'screen',
        }}
      >
        {children}
      </div>
      {/* Main content */}
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};

// Trail effect component
interface TrailProps {
  children: React.ReactNode;
  trailLength?: number;
  opacityDecay?: number;
  style?: React.CSSProperties;
}

export const Trail: React.FC<TrailProps> = ({
  children,
  trailLength = 5,
  opacityDecay = 0.2,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: 'relative', ...style }}>
      {Array.from({ length: trailLength }, (_, i) => {
        const trailFrame = frame - i * 2;
        if (trailFrame < 0) return null;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 1 - i * opacityDecay,
              pointerEvents: 'none',
            }}
          >
            {children}
          </div>
        );
      })}
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};

// Shake effect wrapper
interface ShakeEffectProps {
  children: React.ReactNode;
  intensity?: number;
  active?: boolean;
  style?: React.CSSProperties;
}

export const ShakeEffect: React.FC<ShakeEffectProps> = ({
  children,
  intensity = 5,
  active = true,
  style,
}) => {
  const frame = useCurrentFrame();

  if (!active) {
    return <div style={style}>{children}</div>;
  }

  const x = Math.sin(frame * 0.8) * intensity;
  const y = Math.cos(frame * 1.2) * intensity;

  return (
    <div style={{ transform: `translate(${x}px, ${y}px)`, ...style }}>
      {children}
    </div>
  );
};

// Highlight effect
interface HighlightProps {
  children: React.ReactNode;
  color?: string;
  progress?: number;
  style?: React.CSSProperties;
}

export const Highlight: React.FC<HighlightProps> = ({
  children,
  color = '#ffeb3b',
  progress = 1,
  style,
}) => {
  return (
    <span
      style={{
        background: `linear-gradient(90deg, ${color} ${progress * 100}%, transparent ${progress * 100}%)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Mask reveal component
interface MaskRevealProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  progress: number;
  style?: React.CSSProperties;
}

export const MaskReveal: React.FC<MaskRevealProps> = ({
  children,
  direction,
  progress,
  style,
}) => {
  let clipPath = '';

  switch (direction) {
    case 'left':
      clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
      break;
    case 'right':
      clipPath = `inset(0 0 0 ${(1 - progress) * 100}%)`;
      break;
    case 'up':
      clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;
      break;
    case 'down':
      clipPath = `inset(${(1 - progress) * 100}% 0 0 0)`;
      break;
  }

  return (
    <div style={{ clipPath, ...style }}>
      {children}
    </div>
  );
};

// Neon glow effect
interface NeonGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  style?: React.CSSProperties;
}

export const NeonGlow: React.FC<NeonGlowProps> = ({
  children,
  color = '#00ff00',
  intensity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const pulseIntensity = 0.8 + Math.sin(frame * 0.1) * 0.2;

  return (
    <div
      style={{
        textShadow: `
          0 0 ${5 * intensity}px ${color},
          0 0 ${10 * intensity}px ${color},
          0 0 ${20 * intensity}px ${color},
          0 0 ${40 * intensity}px ${color}
        `,
        opacity: pulseIntensity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
