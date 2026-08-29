/**
 * Forge Studio - Starter Templates
 * Pre-built composition templates for quick project creation.
 */

export interface StudioTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  code: string;
}

export const templates: StudioTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty composition',
    icon: '✦',
    color: '#10b981',
    code: `'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'motionforge';

export default function MyComposition() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.easeOutCubic,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: 72,
          fontWeight: 900,
          opacity,
          transform: \`scale(\${interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: 'clamp' })})\`,
        }}
      >
        Hello, <span style={{ color: '#10b981' }}>MotionForge</span>
      </h1>
    </AbsoluteFill>
  );
}`,
  },
  {
    id: 'physics-falling',
    name: 'Falling Objects',
    description: 'Physics simulation with RapierJS — objects falling under gravity',
    icon: '⚛',
    color: '#3b82f6',
    code: `'use client';

import React from 'react';
import { AbsoluteFill } from 'motionforge';
import { PhysicsScene, RigidBody, PhysicsPresets } from 'motionforge/physics';
import { CuboidCollider } from '@react-three/rapier';

export default function FallingPhysics() {
  return (
    <AbsoluteFill>
      <PhysicsScene gravity={[0, -9.81, 0]} camera={{ position: [0, 8, 20], fov: 50 }}>
        <PhysicsPresets.Ground />
        
        {/* Falling balls */}
        {[0, 1, 2, 3, 4].map((i) => (
          <RigidBody
            key={i}
            position={[(i - 2) * 2, 8 + i * 1.5, (Math.random() - 0.5) * 4]}
            colliders="ball"
            restitution={0.7}
          >
            <PhysicsPresets.BouncyBall
              radius={0.4 + i * 0.1}
              color={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i]}
            />
          </RigidBody>
        ))}

        {/* Ground collider */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[30, 0.5, 30]} position={[0, -0.5, 0]} />
        </RigidBody>
      </PhysicsScene>
    </AbsoluteFill>
  );
}`,
  },
  {
    id: 'kinetic-text',
    name: 'Kinetic Typography',
    description: 'Animated text with velocity-based staggering',
    icon: 'T',
    color: '#f59e0b',
    code: `'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'motionforge';

export default function KineticText() {
  const frame = useCurrentFrame();
  const words = ['BUILD', 'CINEMATIC', 'VIDEOS'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {words.map((word, i) => {
        const delay = i * 8;
        const progress = interpolate(frame - delay, [0, 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.easeOutExpo,
        });

        const y = interpolate(progress, [0, 1], [100, 0]);
        const opacity = progress;

        return (
          <div
            key={i}
            style={{
              fontSize: 96,
              fontWeight: 900,
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: -4,
              color: i === 1 ? '#10b981' : 'white',
              transform: \`translateY(\${y}px)\`,
              opacity,
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}`,
  },
  {
    id: 'particle-burst',
    name: 'Particle Burst',
    description: 'Colorful particle explosion effect',
    icon: '✦',
    color: '#ec4899',
    code: `'use client';

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'motionforge';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  life: number;
}

export default function ParticleBurst() {
  const frame = useCurrentFrame();
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const particles = useMemo(() => {
    return Array.from({ length: 100 }).map(() => ({
      x: 960, y: 540,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30 - 5,
      size: 4 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 30 + Math.random() * 60,
    }));
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
      {particles.map((p, i) => {
        const t = Math.min(frame / p.life, 1);
        const x = p.x + p.vx * frame + Math.sin(frame * 0.1) * 20;
        const y = p.y + p.vy * frame + 0.5 * 0.3 * frame * frame;
        const opacity = 1 - t;
        const scale = 1 - t * 0.5;

        if (opacity <= 0) return null;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity,
              transform: \`scale(\${scale})\`,
              boxShadow: \`0 0 \${p.size}px \${p.color}\`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}`,
  },
  {
    id: 'glitch-reveal',
    name: 'Glitch Reveal',
    description: 'Text reveal with RGB split glitch effect',
    icon: '⚡',
    color: '#ef4444',
    code: `'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'motionforge';

export default function GlitchReveal() {
  const frame = useCurrentFrame();
  const text = 'MOTIONFORGE';
  
  const revealProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.easeOutCubic,
  });
  
  const glitchIntensity = frame < 40 ? Math.sin(frame * 2) * 10 * (1 - revealProgress) : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Red channel offset */}
      <div
        style={{
          position: 'absolute',
          fontSize: 120,
          fontWeight: 900,
          fontFamily: 'system-ui',
          color: 'rgba(255, 0, 0, 0.5)',
          transform: \`translate(\${glitchIntensity}px, \${-glitchIntensity * 0.5}px)\`,
          opacity: glitchIntensity !== 0 ? 1 : 0,
        }}
      >
        {text}
      </div>
      
      {/* Blue channel offset */}
      <div
        style={{
          position: 'absolute',
          fontSize: 120,
          fontWeight: 900,
          fontFamily: 'system-ui',
          color: 'rgba(0, 100, 255, 0.5)',
          transform: \`translate(\${-glitchIntensity}px, \${glitchIntensity * 0.5}px)\`,
          opacity: glitchIntensity !== 0 ? 1 : 0,
        }}
      >
        {text}
      </div>
      
      {/* Main text */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          fontFamily: 'system-ui',
          color: 'white',
          clipPath: \`inset(0 \${(1 - revealProgress) * 100}% 0 0)\`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}`,
  },
];

export const getTemplate = (id: string) => templates.find((t) => t.id === id) || templates[0];

export default templates;
