'use client';

import dynamic from 'next/dynamic';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from '@/lib/remotion';

const Player = dynamic(() => import('@/lib/remotion/player/Player').then(m => m.Player), { ssr: false });

const ParticleComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const particles = Array.from({ length: 40 }, (_, i) => {
    const seed = i * 137.508;
    const angle = (seed % 360) * (Math.PI / 180);
    const speed = 1 + (i % 5) * 0.5;
    const baseRadius = 50 + (i % 8) * 40;
    
    const t = frame / fps;
    const radius = baseRadius + Math.sin(t * speed + seed) * 30;
    const x = 960 + Math.cos(angle + t * 0.5) * radius;
    const y = 540 + Math.sin(angle + t * 0.7) * radius;
    
    const opacity = interpolate(
      frame,
      [0, 30, 270, 300],
      [0, 0.8, 0.8, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    const size = 2 + Math.sin(t * 2 + i) * 1.5;
    
    const hue = (i * 4 + t * 30) % 360;
    const saturation = 70 + Math.sin(t + i * 0.1) * 20;
    const lightness = 50 + Math.sin(t * 1.5 + i * 0.2) * 15;
    
    return { x, y, opacity, size, hue, saturation, lightness, i };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505' }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {particles.map((p) => (
          <circle
            key={p.i}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={`hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.opacity})`}
            filter="url(#glow)"
          />
        ))}
        
        {/* Connection lines between nearby particles */}
        {particles.slice(0, 30).map((p, i) => {
          const next = particles[(i + 1) % 30];
          const dist = Math.hypot(p.x - next.x, p.y - next.y);
          if (dist > 200) return null;
          return (
            <line
              key={`line-${i}`}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke={`rgba(16, 185, 129, ${p.opacity * 0.3})`}
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default function ParticlesDemoPage() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Particle Effects Demo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Animated particle systems with connection lines and glow effects
          </p>
        </div>
        <Player
          component={ParticleComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          autoPlay={true}
          loop={true}
        />
      </div>
    </AbsoluteFill>
  );
}
