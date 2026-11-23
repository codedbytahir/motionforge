'use client';

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Sequence,
  Rotate3D,
  Perspective3D,
  Cube3D,
} from '../index';

// Animated background with gradient
const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const gradientAngle = interpolate(frame, [0, 360], [0, 360]);
  const colorShift = Math.sin(frame * 0.02) * 20;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(20, 184, 166, 0.3) 0%, transparent 50%),
          linear-gradient(${gradientAngle}deg, 
            rgb(10, 10, 10) 0%, 
            rgb(15, 23, 22) 50%, 
            rgb(10, 10, 10) 100%)
        `,
      }}
    />
  );
};

// Title card for 3D section
const SectionTitle: React.FC<{
  title: string;
  subtitle: string;
  startFrame: number;
}> = ({ title, subtitle, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame - startFrame,
    [0, 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const slideY = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const translateY = interpolate(slideY, [0, 1], [30, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: 'center',
        marginBottom: 40,
      }}
    >
      <h2
        style={{
          fontSize: 56,
          fontWeight: 'bold',
          color: '#10b981',
          textShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 24,
          color: '#6ee7b7',
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

// Rotating card demo
const RotatingCardDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotateY = interpolate(frame, [0, 180], [0, 360], {
    extrapolateRight: 'extend',
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
    }}>
      <div
        style={{
          width: 250,
          height: 160,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 20px 40px rgba(16, 185, 129, 0.3),
            0 0 60px rgba(16, 185, 129, 0.2)
          `,
          transform: `rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
      >
        <span style={{
          fontSize: 48,
          color: 'white',
          fontWeight: 'bold',
          backfaceVisibility: 'hidden',
        }}>
          3D Card
        </span>
      </div>
      <p style={{
        marginTop: 30,
        fontSize: 18,
        color: '#6ee7b7',
      }}>
        Continuous Y-axis rotation
      </p>
    </div>
  );
};

// Perspective container demo
const PerspectiveDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotateX = Math.sin(frame * 0.03) * 25;
  const rotateY = Math.cos(frame * 0.03) * 25;

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
    }}>
      <div style={{
        perspective: 800,
      }}>
        <div
          style={{
            width: 300,
            height: 180,
            background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 30px 60px rgba(16, 185, 129, 0.4)',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{
            fontSize: 36,
            color: 'white',
            fontWeight: 'bold',
          }}>
            Perspective
          </span>
        </div>
      </div>
      <p style={{
        marginTop: 30,
        fontSize: 18,
        color: '#6ee7b7',
      }}>
        Interactive 3D tilt effect
      </p>
    </div>
  );
};

// Multiple rotating cubes demo
const MultiCubeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
    }}>
      <div style={{
        display: 'flex',
        gap: 60,
        alignItems: 'center',
      }}>
        <Cube3D size={80} durationInFrames={120} />
        <Cube3D
          size={100}
          durationInFrames={150}
          colors={{
            front: '#34d399',
            back: '#059669',
            left: '#047857',
            right: '#065f46',
            top: '#6ee7b7',
            bottom: '#10b981',
          }}
        />
        <Cube3D size={70} durationInFrames={100} />
      </div>
      <p style={{
        marginTop: 50,
        fontSize: 18,
        color: '#6ee7b7',
      }}>
        Multiple 3D cubes with CSS transforms
      </p>
    </div>
  );
};

// Orbiting elements demo
const OrbitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const orbitItems = [
    { label: 'React', color: '#61DAFB' },
    { label: 'Video', color: '#10b981' },
    { label: 'Motion', color: '#34d399' },
    { label: '3D', color: '#059669' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
    }}>
      <div style={{
        position: 'relative',
        width: 300,
        height: 300,
        perspective: 1000,
      }}>
        {/* Center element */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.5)',
        }}>
          Motion
        </div>

        {/* Orbiting elements */}
        {orbitItems.map((item, index) => {
          const angle = (frame * 2 + index * 90) * (Math.PI / 180);
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.3; // Elliptical orbit
          const z = Math.sin(angle) * 50; // Z-depth

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                width: 60,
                height: 60,
                background: item.color,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                color: index === 0 ? '#0a0a0a' : 'white',
                opacity: 0.5 + (y + radius * 0.3) / (radius * 0.6) * 0.5,
                zIndex: Math.round(y),
                boxShadow: `0 ${5 + z * 0.1}px ${15 + z * 0.2}px rgba(0,0,0,0.3)`,
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      <p style={{
        marginTop: 20,
        fontSize: 18,
        color: '#6ee7b7',
      }}>
        3D orbital animation
      </p>
    </div>
  );
};

// Flip card animation demo
const FlipCardDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flipProgress = interpolate(frame % 120, [0, 60], [0, 180], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
    }}>
      <div style={{ perspective: 1000 }}>
        <div
          style={{
            position: 'relative',
            width: 280,
            height: 180,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${flipProgress}deg)`,
            transition: 'transform 0.1s',
          }}
        >
          {/* Front */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Front Side
          </div>
          {/* Back */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 'bold',
              color: 'white',
              transform: 'rotateY(180deg)',
            }}
          >
            Back Side
          </div>
        </div>
      </div>
      <p style={{
        marginTop: 30,
        fontSize: 18,
        color: '#6ee7b7',
      }}>
        Flip card transition
      </p>
    </div>
  );
};

// Main composition
export const DemoComposition3: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <AnimatedBackground />

      <AbsoluteFill style={{ padding: 60, justifyContent: 'center', alignItems: 'center' }}>
        <Sequence from={0} durationInFrames={180}>
          <div style={{ textAlign: 'center' }}>
            <SectionTitle
              title="3D Transform Effects"
              subtitle="Create stunning 3D animations with CSS transforms"
              startFrame={0}
            />
            <RotatingCardDemo />
          </div>
        </Sequence>

        <Sequence from={180} durationInFrames={180}>
          <div style={{ textAlign: 'center' }}>
            <SectionTitle
              title="Perspective Effects"
              subtitle="Add depth with 3D perspective"
              startFrame={180}
            />
            <PerspectiveDemo />
          </div>
        </Sequence>

        <Sequence from={360} durationInFrames={180}>
          <div style={{ textAlign: 'center' }}>
            <SectionTitle
              title="3D Cubes"
              subtitle="True 3D objects with CSS"
              startFrame={360}
            />
            <MultiCubeDemo />
          </div>
        </Sequence>

        <Sequence from={540} durationInFrames={180}>
          <div style={{ textAlign: 'center' }}>
            <SectionTitle
              title="Orbital Animation"
              subtitle="Objects orbiting in 3D space"
              startFrame={540}
            />
            <OrbitDemo />
          </div>
        </Sequence>

        <Sequence from={720} durationInFrames={180}>
          <div style={{ textAlign: 'center' }}>
            <SectionTitle
              title="Flip Card"
              subtitle="Classic card flip transition"
              startFrame={720}
            />
            <FlipCardDemo />
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default DemoComposition3;
