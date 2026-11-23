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

// ============================================
// 3D TRANSFORM EFFECTS
// ============================================

// Rotate3D - Full 3D rotation effect
interface Rotate3DProps {
  children: React.ReactNode;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  durationInFrames?: number;
  startFrame?: number;
  perspective?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
}

export const Rotate3D: React.FC<Rotate3DProps> = ({
  children,
  rotateX = 0,
  rotateY = 360,
  rotateZ = 0,
  durationInFrames = 60,
  startFrame = 0,
  perspective = 1000,
  easing = Easing.easeInOutCubic,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  const rx = rotateX * progress;
  const ry = rotateY * progress;
  const rz = rotateZ * progress;

  return (
    <div style={{ perspective, ...style }}>
      <div
        style={{
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Flip3D - 3D flip card effect
interface Flip3DProps {
  children: React.ReactNode;
  front: React.ReactNode;
  back: React.ReactNode;
  durationInFrames?: number;
  startFrame?: number;
  direction?: 'horizontal' | 'vertical';
  perspective?: number;
  style?: React.CSSProperties;
}

export const Flip3D: React.FC<Flip3DProps> = ({
  children,
  front,
  back,
  durationInFrames = 60,
  startFrame = 0,
  direction = 'horizontal',
  perspective = 1000,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 180],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeInOutCubic }
  );

  const rotateAxis = direction === 'horizontal' ? 'rotateY' : 'rotateX';

  return (
    <div style={{ perspective, ...style }}>
      <div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `${rotateAxis}(${progress}deg)`,
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
          }}
        >
          {front}
        </div>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: `${rotateAxis}(180deg)`,
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};

// Perspective3D - 3D perspective container
interface Perspective3DProps {
  children: React.ReactNode;
  rotateX?: number;
  rotateY?: number;
  perspective?: number;
  durationInFrames?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Perspective3D: React.FC<Perspective3DProps> = ({
  children,
  rotateX = 20,
  rotateY = 20,
  perspective = 800,
  durationInFrames = 60,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeOutCubic }
  );

  return (
    <div style={{ perspective, ...style }}>
      <div
        style={{
          transform: `rotateX(${rotateX * progress}deg) rotateY(${rotateY * progress}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Cube3D - 3D rotating cube
interface Cube3DProps {
  size?: number;
  durationInFrames?: number;
  colors?: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  style?: React.CSSProperties;
}

export const Cube3D: React.FC<Cube3DProps> = ({
  size = 100,
  durationInFrames = 120,
  colors = {
    front: '#10b981',
    back: '#059669',
    left: '#047857',
    right: '#065f46',
    top: '#34d399',
    bottom: '#6ee7b7',
  },
  style,
}) => {
  const frame = useCurrentFrame();

  const rotateY = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: 'extend',
  });
  const rotateX = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: 'extend',
  });

  const halfSize = size / 2;

  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.3,
    fontWeight: 'bold',
    color: 'white',
    backfaceVisibility: 'visible',
    border: '2px solid rgba(255,255,255,0.3)',
  };

  return (
    <div style={{ perspective: 600, ...style }}>
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        <div style={{ ...faceStyle, backgroundColor: colors.front, transform: `translateZ(${halfSize}px)` }}>Front</div>
        <div style={{ ...faceStyle, backgroundColor: colors.back, transform: `rotateY(180deg) translateZ(${halfSize}px)` }}>Back</div>
        <div style={{ ...faceStyle, backgroundColor: colors.left, transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}>Left</div>
        <div style={{ ...faceStyle, backgroundColor: colors.right, transform: `rotateY(90deg) translateZ(${halfSize}px)` }}>Right</div>
        <div style={{ ...faceStyle, backgroundColor: colors.top, transform: `rotateX(90deg) translateZ(${halfSize}px)` }}>Top</div>
        <div style={{ ...faceStyle, backgroundColor: colors.bottom, transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}>Bottom</div>
      </div>
    </div>
  );
};

// ============================================
// PARTICLE SYSTEM EFFECT
// ============================================

interface ParticleConfig {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleSystemProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  speed?: number;
  direction?: 'random' | 'up' | 'down' | 'left' | 'right' | 'explode';
  fadeOut?: boolean;
  style?: React.CSSProperties;
  particleShape?: 'circle' | 'square' | 'star' | 'triangle';
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 50,
  colors = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857'],
  minSize = 3,
  maxSize = 15,
  speed = 2,
  direction = 'random',
  fadeOut = true,
  particleShape = 'circle',
  style,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate deterministic particles based on index
  const particles: ParticleConfig[] = React.useMemo(() => {
    const seed = (n: number) => {
      const x = Math.sin(n * 9999) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }, (_, i) => {
      const rand = seed(i);
      const rand2 = seed(i + 1000);
      const rand3 = seed(i + 2000);
      const rand4 = seed(i + 3000);
      const rand5 = seed(i + 4000);

      let vx = 0;
      let vy = 0;

      switch (direction) {
        case 'up':
          vx = (rand2 - 0.5) * speed;
          vy = -rand3 * speed * 2 - speed;
          break;
        case 'down':
          vx = (rand2 - 0.5) * speed;
          vy = rand3 * speed * 2 + speed;
          break;
        case 'left':
          vx = -rand2 * speed * 2 - speed;
          vy = (rand3 - 0.5) * speed;
          break;
        case 'right':
          vx = rand2 * speed * 2 + speed;
          vy = (rand3 - 0.5) * speed;
          break;
        case 'explode':
          const angle = rand2 * Math.PI * 2;
          const mag = rand3 * speed * 3 + speed;
          vx = Math.cos(angle) * mag;
          vy = Math.sin(angle) * mag;
          break;
        default: // random
          vx = (rand2 - 0.5) * speed * 2;
          vy = (rand3 - 0.5) * speed * 2;
      }

      return {
        x: rand * width,
        y: rand2 * height,
        size: minSize + rand3 * (maxSize - minSize),
        speedX: vx,
        speedY: vy,
        color: colors[Math.floor(rand4 * colors.length)],
        opacity: 0.5 + rand5 * 0.5,
        rotation: rand4 * 360,
        rotationSpeed: (rand5 - 0.5) * 10,
      };
    });
  }, [count, colors, minSize, maxSize, speed, direction, width, height]);

  const renderParticle = (p: ParticleConfig, index: number) => {
    const x = (p.x + p.speedX * frame) % width;
    const y = (p.y + p.speedY * frame) % height;
    const adjustedX = x < 0 ? x + width : x;
    const adjustedY = y < 0 ? y + height : y;

    const opacity = fadeOut
      ? p.opacity * (1 - Math.abs(frame % 120 - 60) / 60)
      : p.opacity;

    const rotation = p.rotation + p.rotationSpeed * frame;

    const shapeStyle: React.CSSProperties = {
      position: 'absolute',
      left: adjustedX,
      top: adjustedY,
      width: p.size,
      height: p.size,
      backgroundColor: particleShape === 'circle' ? p.color : undefined,
      borderRadius: particleShape === 'circle' ? '50%' : particleShape === 'triangle' ? 0 : 2,
      opacity: Math.max(0.1, Math.min(1, opacity)),
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      boxShadow: `0 0 ${p.size}px ${p.color}`,
    };

    if (particleShape === 'star') {
      return (
        <div key={index} style={{ ...shapeStyle, backgroundColor: 'transparent' }}>
          <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill={p.color}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      );
    }

    if (particleShape === 'triangle') {
      return (
        <div key={index} style={{ ...shapeStyle, backgroundColor: 'transparent' }}>
          <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill={p.color}>
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
        </div>
      );
    }

    return <div key={index} style={shapeStyle} />;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      {particles.map(renderParticle)}
    </div>
  );
};

// ============================================
// TEXT ANIMATION EFFECTS
// ============================================

// LetterByLetter - Animate text letter by letter
interface LetterByLetterProps {
  text: string;
  durationInFrames?: number;
  startFrame?: number;
  delayPerLetter?: number;
  animation?: 'fade' | 'scale' | 'slide' | 'rotate' | 'bounce';
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  letterStyle?: React.CSSProperties;
}

export const LetterByLetter: React.FC<LetterByLetterProps> = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  delayPerLetter = 2,
  animation = 'fade',
  easing = Easing.easeOutCubic,
  style,
  letterStyle,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', ...style }}>
      {text.split('').map((char, index) => {
        const letterStart = startFrame + index * delayPerLetter;
        const progress = interpolate(
          frame,
          [letterStart, letterStart + durationInFrames / text.length],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
        );

        let transform = '';
        let opacity = progress;

        switch (animation) {
          case 'scale':
            transform = `scale(${progress})`;
            break;
          case 'slide':
            transform = `translateY(${(1 - progress) * 30}px)`;
            break;
          case 'rotate':
            transform = `rotate(${(1 - progress) * 90}deg)`;
            break;
          case 'bounce':
            const bounce = progress < 0.5 ? progress * 2 : 2 - progress * 2;
            transform = `scale(${0.5 + bounce * 0.5})`;
            break;
        }

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              opacity,
              transform,
              ...letterStyle,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};

// WordByWord - Animate text word by word
interface WordByWordProps {
  text: string;
  durationInFrames?: number;
  startFrame?: number;
  delayPerWord?: number;
  animation?: 'fade' | 'scale' | 'slide' | 'pop';
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}

export const WordByWord: React.FC<WordByWordProps> = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  delayPerWord = 10,
  animation = 'fade',
  style,
  wordStyle,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', ...style }}>
      {words.map((word, index) => {
        const wordStart = startFrame + index * delayPerWord;
        const progress = interpolate(
          frame,
          [wordStart, wordStart + 15],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeOutBack }
        );

        let transform = '';

        switch (animation) {
          case 'scale':
            transform = `scale(${progress})`;
            break;
          case 'slide':
            transform = `translateY(${(1 - progress) * 20}px)`;
            break;
          case 'pop':
            const popScale = 1 + (1 - progress) * 0.3;
            transform = `scale(${progress < 0.5 ? progress * 2 * popScale : popScale - (progress - 0.5) * 2 * (popScale - 1)})`;
            break;
        }

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              opacity: progress,
              transform,
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// WaveText - Wave animation on text
interface WaveTextProps {
  text: string;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  style?: React.CSSProperties;
  letterStyle?: React.CSSProperties;
}

export const WaveText: React.FC<WaveTextProps> = ({
  text,
  amplitude = 10,
  frequency = 0.3,
  speed = 0.15,
  style,
  letterStyle,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }}>
      {text.split('').map((char, index) => {
        const offset = Math.sin(frame * speed + index * frequency) * amplitude;

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transform: `translateY(${offset}px)`,
              ...letterStyle,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};

// RainbowText - Rainbow color cycling text
interface RainbowTextProps {
  text: string;
  speed?: number;
  saturation?: number;
  lightness?: number;
  style?: React.CSSProperties;
  letterStyle?: React.CSSProperties;
}

export const RainbowText: React.FC<RainbowTextProps> = ({
  text,
  speed = 5,
  saturation = 70,
  lightness = 60,
  style,
  letterStyle,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', ...style }}>
      {text.split('').map((char, index) => {
        const hue = (frame * speed + index * 20) % 360;
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              color,
              ...letterStyle,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};

// GradientText - Animated gradient text
interface GradientTextProps {
  text: string;
  colors?: string[];
  speed?: number;
  angle?: number;
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  colors = ['#10b981', '#34d399', '#6ee7b7', '#14b8a6', '#10b981'],
  speed = 2,
  angle = 90,
  style,
}) => {
  const frame = useCurrentFrame();
  const offset = (frame * speed) % 100;

  const gradientStops = colors
    .map((color, i) => {
      const position = (i * 100 / (colors.length - 1) + offset) % 100;
      return `${color} ${position}%`;
    })
    .join(', ');

  return (
    <span
      style={{
        background: `linear-gradient(${angle}deg, ${gradientStops})`,
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        ...style,
      }}
    >
      {text}
    </span>
  );
};

// Blur - Blur effect animation
interface BlurProps {
  children: React.ReactNode;
  from?: number;
  to?: number;
  durationInFrames?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Blur: React.FC<BlurProps> = ({
  children,
  from = 20,
  to = 0,
  durationInFrames = 30,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const blur = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ filter: `blur(${blur}px)`, ...style }}>
      {children}
    </div>
  );
};

// Bounce - Bounce animation effect
interface BounceProps {
  children: React.ReactNode;
  height?: number;
  durationInFrames?: number;
  startFrame?: number;
  times?: number;
  damping?: number;
  style?: React.CSSProperties;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  height = 50,
  durationInFrames = 60,
  startFrame = 0,
  times = 3,
  damping = 0.7,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Bounce formula with damping
  const bounceCount = times;
  const t = progress * bounceCount * Math.PI;
  const amplitude = height * Math.pow(damping, progress * bounceCount);
  const y = Math.abs(Math.sin(t)) * amplitude * (1 - progress);

  return (
    <div style={{ transform: `translateY(${-y}px)`, ...style }}>
      {children}
    </div>
  );
};

// Pulse - Pulse/scale breathing effect
interface PulseProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  speed?: number;
  style?: React.CSSProperties;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  speed = 0.1,
  style,
}) => {
  const frame = useCurrentFrame();

  const scale = minScale + (maxScale - minScale) * (0.5 + Math.sin(frame * speed) * 0.5);

  return (
    <div style={{ transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
};

// Swing - Swing/pendulum effect
interface SwingProps {
  children: React.ReactNode;
  angle?: number;
  speed?: number;
  damping?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}

export const Swing: React.FC<SwingProps> = ({
  children,
  angle = 30,
  speed = 0.15,
  damping = 0.995,
  durationInFrames = 120,
  style,
}) => {
  const frame = useCurrentFrame();

  const dampFactor = Math.pow(damping, frame);
  const rotation = Math.sin(frame * speed) * angle * dampFactor;

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'top center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Confetti - Falling confetti particles
interface ConfettiProps {
  count?: number;
  colors?: string[];
  style?: React.CSSProperties;
}

export const Confetti: React.FC<ConfettiProps> = ({
  count = 100,
  colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'],
  style,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const confettiPieces = React.useMemo(() => {
    const seed = (n: number) => {
      const x = Math.sin(n * 9999) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }, (_, i) => ({
      x: seed(i) * width,
      startY: -50 - seed(i + 100) * 200,
      speed: 2 + seed(i + 200) * 4,
      rotation: seed(i + 300) * 360,
      rotationSpeed: (seed(i + 400) - 0.5) * 20,
      size: 8 + seed(i + 500) * 8,
      color: colors[Math.floor(seed(i + 600) * colors.length)],
      wobble: seed(i + 700) * Math.PI * 2,
      wobbleSpeed: 0.02 + seed(i + 800) * 0.05,
    }));
  }, [count, colors, width]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      {confettiPieces.map((piece, i) => {
        const y = piece.startY + piece.speed * frame;
        const x = piece.x + Math.sin(frame * piece.wobbleSpeed + piece.wobble) * 30;
        const rotation = piece.rotation + piece.rotationSpeed * frame;

        if (y > height + 50) return null;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              transform: `rotate(${rotation}deg)`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
};
