'use client';

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  ParticleSystem,
  Confetti,
} from '../index';

// Animated background
const ParticleBackground: React.FC<{ hue: number }> = ({ hue }) => {
  const frame = useCurrentFrame();

  const baseColor = `hsl(${hue}, 80%, 8%)`;
  const glowColor = `hsla(${hue}, 70%, 50%, 0.2)`;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, ${glowColor} 0%, transparent 40%),
          radial-gradient(ellipse at 80% 20%, ${glowColor} 0%, transparent 40%),
          ${baseColor}
        `,
      }}
    />
  );
};

// Title component
const ParticleTitle: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        textAlign: 'center',
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <h2
        style={{
          fontSize: 56,
          fontWeight: 'bold',
          color: '#10b981',
          textShadow: '0 0 40px rgba(16, 185, 129, 0.6)',
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 22,
          color: '#6ee7b7',
          opacity: 0.9,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

// Floating particles demo
const FloatingParticlesDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={160} />
      <ParticleTitle
        title="Floating Particles"
        subtitle="Gentle floating motion with random movement"
      />
      <ParticleSystem
        count={80}
        colors={['#10b981', '#34d399', '#6ee7b7', '#059669', '#14b8a6']}
        minSize={4}
        maxSize={20}
        speed={1.5}
        direction="random"
        fadeOut={false}
        particleShape="circle"
      />
    </AbsoluteFill>
  );
};

// Rising particles demo
const RisingParticlesDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={150} />
      <ParticleTitle
        title="Rising Particles"
        subtitle="Particles floating upward like bubbles"
      />
      <ParticleSystem
        count={60}
        colors={['#10b981', '#34d399', '#6ee7b7']}
        minSize={6}
        maxSize={18}
        speed={2}
        direction="up"
        fadeOut={false}
        particleShape="circle"
      />
    </AbsoluteFill>
  );
};

// Star field demo
const StarFieldDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={170} />
      <ParticleTitle
        title="Star Field"
        subtitle="Star-shaped particles creating a galaxy effect"
      />
      <ParticleSystem
        count={100}
        colors={['#ffffff', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']}
        minSize={3}
        maxSize={12}
        speed={0.8}
        direction="random"
        fadeOut={false}
        particleShape="star"
      />
    </AbsoluteFill>
  );
};

// Explosion demo
const ExplosionDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={140} />
      <ParticleTitle
        title="Explosion Effect"
        subtitle="Particles bursting outward from center"
      />
      <ParticleSystem
        count={150}
        colors={['#10b981', '#fbbf24', '#f97316', '#ef4444', '#34d399']}
        minSize={4}
        maxSize={16}
        speed={3}
        direction="explode"
        fadeOut={true}
        particleShape="triangle"
      />
    </AbsoluteFill>
  );
};

// Confetti celebration demo
const ConfettiDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <ParticleBackground hue={155} />
      <ParticleTitle
        title="Confetti Celebration"
        subtitle="Falling confetti with rotation and wobble"
      />
      <Confetti
        count={120}
        colors={['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: '#10b981',
            fontWeight: 'bold',
          }}
        >
          {frame > 30 ? 'Celebration!' : ''}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Multi-layer particles demo
const MultiLayerDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={165} />
      <ParticleTitle
        title="Multi-Layer System"
        subtitle="Combined particle layers for depth"
      />
      {/* Background layer - slow, large, faint */}
      <ParticleSystem
        count={30}
        colors={['rgba(16, 185, 129, 0.3)']}
        minSize={15}
        maxSize={30}
        speed={0.5}
        direction="random"
        fadeOut={false}
        particleShape="circle"
      />
      {/* Middle layer - medium speed */}
      <ParticleSystem
        count={50}
        colors={['rgba(52, 211, 153, 0.5)']}
        minSize={8}
        maxSize={16}
        speed={1.2}
        direction="up"
        fadeOut={false}
        particleShape="circle"
      />
      {/* Foreground layer - fast, small, bright */}
      <ParticleSystem
        count={80}
        colors={['#10b981', '#34d399', '#6ee7b7']}
        minSize={3}
        maxSize={8}
        speed={2}
        direction="random"
        fadeOut={false}
        particleShape="circle"
      />
    </AbsoluteFill>
  );
};

// Snowfall demo
const SnowfallDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={200} />
      <ParticleTitle
        title="Snowfall Effect"
        subtitle="Gentle falling particles with drift"
      />
      <ParticleSystem
        count={100}
        colors={['#ffffff', '#e0f2fe', '#bae6fd', '#7dd3fc']}
        minSize={4}
        maxSize={14}
        speed={1.5}
        direction="down"
        fadeOut={false}
        particleShape="circle"
      />
    </AbsoluteFill>
  );
};

// Fire particles demo
const FireParticlesDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <ParticleBackground hue={30} />
      <ParticleTitle
        title="Fire Particles"
        subtitle="Upward rising flames simulation"
      />
      <ParticleSystem
        count={80}
        colors={['#ef4444', '#f97316', '#fbbf24', '#f59e0b']}
        minSize={6}
        maxSize={22}
        speed={3.5}
        direction="up"
        fadeOut={true}
        particleShape="circle"
      />
    </AbsoluteFill>
  );
};

// Main composition
export const DemoComposition4: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <Sequence from={0} durationInFrames={180}>
        <FloatingParticlesDemo />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <RisingParticlesDemo />
      </Sequence>

      <Sequence from={360} durationInFrames={180}>
        <StarFieldDemo />
      </Sequence>

      <Sequence from={540} durationInFrames={180}>
        <ExplosionDemo />
      </Sequence>

      <Sequence from={720} durationInFrames={180}>
        <ConfettiDemo />
      </Sequence>

      <Sequence from={900} durationInFrames={180}>
        <MultiLayerDemo />
      </Sequence>

      <Sequence from={1080} durationInFrames={180}>
        <SnowfallDemo />
      </Sequence>

      <Sequence from={1260} durationInFrames={180}>
        <FireParticlesDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

export default DemoComposition4;
