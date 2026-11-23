'use client';

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from '../index';

// ============================================================
// Animated Text Component
// ============================================================
interface AnimatedTextProps {
  children: string;
  startFrame: number;
  style?: React.CSSProperties;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ children, startFrame, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clamp the relative frame to avoid negative values
  const relativeFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(progress, [0, 1], [50, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================
// Animated Circle Component
// ============================================================
interface AnimatedCircleProps {
  color: string;
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startFrame: number;
  duration: number;
}

const AnimatedCircle: React.FC<AnimatedCircleProps> = ({
  color,
  size,
  startX,
  startY,
  endX,
  endY,
  startFrame,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.easeOutCubic }
  );

  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);

  const relativeFrame = Math.max(0, frame - startFrame);
  const scaleValue = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        transform: `scale(${scaleValue})`,
        boxShadow: `0 0 30px ${color}50`,
      }}
    />
  );
};

// ============================================================
// Particle Effect Component
// ============================================================
interface ParticleEffectProps {
  count: number;
  startFrame: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ count, startFrame }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Pre-generate particle data for consistency
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 1234.5678;
      return {
        seed,
        angle: (seed % 360) * (Math.PI / 180),
        distance: 100 + (seed % 300),
        size: 4 + (seed % 12),
        delay: i % 20,
        hue: seed % 360,
      };
    });
  }, [count]);

  return (
    <>
      {particles.map((particle, i) => {
        const relativeFrame = Math.max(0, frame - startFrame - particle.delay);
        const progress = spring({
          frame: relativeFrame,
          fps,
          config: { damping: 15, stiffness: 60 },
        });

        const startX = width / 2;
        const startY = height / 2;
        const endX = startX + Math.cos(particle.angle) * particle.distance;
        const endY = startY + Math.sin(particle.angle) * particle.distance;

        const opacity = interpolate(
          frame,
          [startFrame + particle.delay, startFrame + 60 + particle.delay],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const x = interpolate(progress, [0, 1], [startX, endX]);
        const y = interpolate(progress, [0, 1], [startY, endY]);
        const color = `hsl(${particle.hue}, 70%, 60%)`;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

// ============================================================
// Background Gradient Component
// ============================================================
const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const hue1 = (frame * 0.5) % 360;
  const hue2 = (hue1 + 60) % 360;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, hsl(${hue1}, 70%, 20%) 0%, hsl(${hue2}, 70%, 15%) 100%)`,
      }}
    />
  );
};

// ============================================================
// Bar Chart Animation Component
// ============================================================
interface BarChartAnimationProps {
  data: number[];
  startFrame: number;
  barWidth: number;
  gap: number;
  height: number;
}

const BarChartAnimation: React.FC<BarChartAnimationProps> = ({
  data,
  startFrame,
  barWidth,
  gap,
  height,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, height }}>
      {data.map((value, i) => {
        const relativeFrame = Math.max(0, frame - startFrame - i * 3);
        const progress = spring({
          frame: relativeFrame,
          fps,
          config: { damping: 12, stiffness: 80 },
        });

        const barHeight = value * progress * height;
        const hue = (i * 30 + frame) % 360;

        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: `hsl(${hue}, 70%, 50%)`,
              borderRadius: 4,
              boxShadow: `0 0 10px hsl(${hue}, 70%, 50%)50`,
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================================
// Rotating Logo Component
// ============================================================
interface RotatingLogoProps {
  size: number;
  startFrame: number;
}

const RotatingLogo: React.FC<RotatingLogoProps> = ({ size, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = Math.max(0, frame - startFrame);
  const scaleValue = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const rotation = interpolate(relativeFrame, [0, 120], [0, 360], {
    extrapolateRight: 'extend',
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${scaleValue}) rotate(${rotation}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <polygon
          points="50,5 95,30 95,70 50,95 5,70 5,30"
          fill="url(#logoGrad)"
          strokeWidth={2}
          stroke="#34d399"
        />
        <polygon
          points="50,20 75,35 75,65 50,80 25,65 25,35"
          fill="rgba(52, 211, 153, 0.3)"
        />
      </svg>
    </div>
  );
};

// ============================================================
// Waveform Animation
// ============================================================
interface WaveformAnimationProps {
  startFrame: number;
  bars: number;
  width: number;
  height: number;
}

const WaveformAnimation: React.FC<WaveformAnimationProps> = ({
  startFrame,
  bars,
  width,
  height,
}) => {
  const frame = useCurrentFrame();

  const barWidth = width / bars - 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height, width }}>
      {Array.from({ length: bars }, (_, i) => {
        const phase = frame * 0.1 + i * 0.3;
        const amplitude = Math.sin(phase) * 0.5 + 0.5;
        const barHeight = height * amplitude * 0.8 + height * 0.1;

        const hue = 140 + (i % 20); // Green hue range

        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: `hsl(${hue}, 70%, 50%)`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================================
// Main Demo Composition
// ============================================================
export const DemoComposition: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
      <AnimatedBackground />

      {/* Intro sequence */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <RotatingLogo size={200} startFrame={0} />
        </AbsoluteFill>
      </Sequence>

      {/* Title sequence */}
      <Sequence from={30} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 20 }}>
          <AnimatedText
            startFrame={5}
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#10b981',
              textShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
            }}
          >
            MotionForge
          </AnimatedText>
          <AnimatedText
            startFrame={15}
            style={{ fontSize: 24, color: '#6ee7b7' }}
          >
            Create videos with React
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* Particle explosion */}
      <Sequence from={60} durationInFrames={90}>
        <ParticleEffect count={100} startFrame={0} />
      </Sequence>

      {/* Animated circles */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill>
          <AnimatedCircle
            color="#10b981"
            size={80}
            startX={100}
            startY={100}
            endX={width - 100}
            endY={height - 100}
            startFrame={0}
            duration={60}
          />
          <AnimatedCircle
            color="#34d399"
            size={60}
            startX={width - 100}
            startY={100}
            endX={100}
            endY={height - 100}
            startFrame={10}
            duration={60}
          />
          <AnimatedCircle
            color="#6ee7b7"
            size={70}
            startX={width / 2}
            startY={0}
            endX={width / 2}
            endY={height}
            startFrame={20}
            duration={60}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Bar chart */}
      <Sequence from={150} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <AnimatedText
              startFrame={0}
              style={{ fontSize: 36, fontWeight: 'bold', color: '#10b981' }}
            >
              Data Visualization
            </AnimatedText>
          </div>
          <BarChartAnimation
            data={[0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 1]}
            startFrame={10}
            barWidth={40}
            gap={15}
            height={200}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Waveform */}
      <Sequence from={210} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 20 }}>
          <AnimatedText
            startFrame={0}
            style={{ fontSize: 36, fontWeight: 'bold', color: '#10b981' }}
          >
            Audio Visualization
          </AnimatedText>
          <WaveformAnimation startFrame={10} bars={60} width={600} height={100} />
        </AbsoluteFill>
      </Sequence>

      {/* End card */}
      <Sequence from={270} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 30 }}>
          <AnimatedText
            startFrame={0}
            style={{ fontSize: 48, fontWeight: 'bold', color: '#10b981' }}
          >
            Built with React
          </AnimatedText>
          <AnimatedText
            startFrame={10}
            style={{ fontSize: 24, color: '#6ee7b7' }}
          >
            100% programmatic video creation
          </AnimatedText>
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            <div
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: 8,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Spring Animations
            </div>
            <div
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                borderRadius: 8,
                color: '#0a0a0a',
                fontWeight: 'bold',
              }}
            >
              Sequences
            </div>
            <div
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
                borderRadius: 8,
                color: '#0a0a0a',
                fontWeight: 'bold',
              }}
            >
              Easing
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export default DemoComposition;
