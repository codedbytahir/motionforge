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
  Loop,
  Freeze,
  Typewriter,
  Counter,
  ProgressBar,
  NeonGlow,
} from '../index';

// ============================================================
// Typewriter Demo Component
// ============================================================
const TypewriterDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Typewriter
          text="MotionForge"
          durationInFrames={45}
          startFrame={0}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#10b981',
          }}
          cursor
          cursorChar="|"
        />
        <div style={{ height: 20 }} />
        <Typewriter
          text="Create stunning videos with React"
          durationInFrames={40}
          startFrame={30}
          style={{
            fontSize: 24,
            color: '#6ee7b7',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Counter Demo Component
// ============================================================
const CounterDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        backgroundColor: '#0a0a0a',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#6ee7b7', marginBottom: 10 }}>
          Users Worldwide
        </div>
        <Counter
          from={0}
          to={1000000}
          durationInFrames={60}
          startFrame={0}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#10b981',
          }}
          format={(v) => v.toLocaleString()}
        />
      </div>

      <div style={{ width: 300 }}>
        <div style={{ fontSize: 14, color: '#6ee7b7', marginBottom: 8 }}>
          Loading Progress
        </div>
        <ProgressBar
          progress={interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' })}
          width={300}
          height={8}
          fillColor="#10b981"
          backgroundColor="#064e3b"
        />
      </div>

      <div style={{ display: 'flex', gap: 60, marginTop: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <Counter
            from={0}
            to={99.9}
            durationInFrames={50}
            style={{ fontSize: 48, color: '#34d399' }}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <div style={{ fontSize: 14, color: '#6ee7b7' }}>Uptime</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Counter
            from={0}
            to={500}
            durationInFrames={45}
            style={{ fontSize: 48, color: '#34d399' }}
            format={(v) => `${Math.round(v)}+`}
          />
          <div style={{ fontSize: 14, color: '#6ee7b7' }}>Features</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Spring Demo Component
// ============================================================
const SpringDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Multiple spring animations with different configs
  const scale1 = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const scale2 = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const scale3 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 5, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        backgroundColor: '#0a0a0a',
      }}
    >
      <div style={{ fontSize: 36, color: '#10b981', marginBottom: 30 }}>
        Spring Physics Demo
      </div>
      <div style={{ display: 'flex', gap: 30 }}>
        {[
          { scale: scale1, label: 'Damping: 10', color: '#10b981' },
          { scale: scale2, label: 'Damping: 20', color: '#34d399' },
          { scale: scale3, label: 'Damping: 5', color: '#6ee7b7' },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: item.color,
                transform: `scale(${item.scale})`,
                boxShadow: `0 0 30px ${item.color}50`,
              }}
            />
            <div style={{ fontSize: 12, color: '#6ee7b7', marginTop: 10 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Easing Demo Component
// ============================================================
const EasingDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const easings = [
    { name: 'linear', fn: Easing.linear },
    { name: 'easeInQuad', fn: Easing.easeInQuad },
    { name: 'easeOutCubic', fn: Easing.easeOutCubic },
    { name: 'easeInOutQuart', fn: Easing.easeInOutQuart },
    { name: 'easeOutElastic', fn: Easing.easeOutElastic },
    { name: 'easeOutBounce', fn: Easing.easeOutBounce },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#0a0a0a',
      }}
    >
      <div style={{ fontSize: 36, color: '#10b981', marginBottom: 40 }}>
        Easing Functions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '80%' }}>
        {easings.map((easing, i) => {
          const progress = interpolate(
            frame,
            [0, 60],
            [0, 100],
            { extrapolateRight: 'clamp', easing: easing.fn }
          );

          return (
            <div key={i} style={{ marginBottom: 15 }}>
              <div style={{ fontSize: 12, color: '#6ee7b7', marginBottom: 5 }}>
                {easing.name}
              </div>
              <div
                style={{
                  width: '100%',
                  height: 6,
                  backgroundColor: '#064e3b',
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Loop Demo Component
// ============================================================
const LoopDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div style={{ fontSize: 36, color: '#10b981', marginBottom: 30 }}>
        Loop & Freeze Demo
      </div>
      <div style={{ display: 'flex', gap: 60 }}>
        <Loop durationInFrames={30} times={Infinity}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#10b981',
                borderRadius: 10,
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ fontSize: 14, color: '#6ee7b7', marginTop: 10 }}>
              Looping
            </div>
          </div>
        </Loop>

        <Freeze frame={15} durationInFrames={Infinity}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#34d399',
                borderRadius: 10,
              }}
            />
            <div style={{ fontSize: 14, color: '#6ee7b7', marginTop: 10 }}>
              Frozen at frame 15
            </div>
          </div>
        </Freeze>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Neon Text Demo
// ============================================================
const NeonTextDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <NeonGlow color="#10b981" intensity={1.5}>
        <span style={{ fontSize: 72, fontWeight: 'bold' }}>MOTIONFORGE</span>
      </NeonGlow>
      <div style={{ height: 40 }} />
      <NeonGlow color="#34d399" intensity={1}>
        <span style={{ fontSize: 24 }}>Create stunning video effects</span>
      </NeonGlow>
    </AbsoluteFill>
  );
};

// ============================================================
// Main Demo Composition 2
// ============================================================
export const DemoComposition2: React.FC = () => {
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
      {/* Typewriter Demo */}
      <Sequence from={0} durationInFrames={90}>
        <TypewriterDemo />
      </Sequence>

      {/* Counter Demo */}
      <Sequence from={90} durationInFrames={90}>
        <CounterDemo />
      </Sequence>

      {/* Spring Demo */}
      <Sequence from={180} durationInFrames={90}>
        <SpringDemo />
      </Sequence>

      {/* Easing Demo */}
      <Sequence from={270} durationInFrames={90}>
        <EasingDemo />
      </Sequence>

      {/* Loop Demo */}
      <Sequence from={360} durationInFrames={90}>
        <LoopDemo />
      </Sequence>

      {/* Neon Demo */}
      <Sequence from={450} durationInFrames={90}>
        <NeonTextDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

export default DemoComposition2;
