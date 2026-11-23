'use client';

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  LetterByLetter,
  WordByWord,
  WaveText,
  RainbowText,
  GradientText,
  NeonGlow,
  Scale,
  Fade,
} from '../index';

// Animated background
const TextBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const gradientAngle = interpolate(frame, [0, 300], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 30% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 70%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
          linear-gradient(${gradientAngle}deg, rgb(10, 10, 10) 0%, rgb(15, 25, 20) 100%)
        `,
      }}
    />
  );
};

// Section title component
const TextSectionTitle: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
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
        marginBottom: 60,
      }}
    >
      <h2
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: '#10b981',
          textShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 20,
          color: '#6ee7b7',
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

// Letter by letter fade demo
const LetterFadeDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Letter by Letter"
          subtitle="Each character appears with a fade effect"
        />
        <LetterByLetter
          text="MotionForge"
          durationInFrames={60}
          delayPerLetter={3}
          animation="fade"
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#10b981',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Letter by letter scale demo
const LetterScaleDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Scale Animation"
          subtitle="Letters scale up from nothing"
        />
        <LetterByLetter
          text="ANIMATION"
          durationInFrames={60}
          delayPerLetter={4}
          animation="scale"
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#34d399',
            letterSpacing: 8,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Letter by letter slide demo
const LetterSlideDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Slide Effect"
          subtitle="Letters slide in from below"
        />
        <LetterByLetter
          text="Creative Motion"
          durationInFrames={60}
          delayPerLetter={3}
          animation="slide"
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#6ee7b7',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Word by word demo
const WordByWordDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center', maxWidth: 900 }}>
        <TextSectionTitle
          title="Word by Word"
          subtitle="Entire words appear together"
        />
        <WordByWord
          text="Create stunning videos with React components"
          durationInFrames={90}
          delayPerWord={12}
          animation="fade"
          style={{
            fontSize: 48,
            fontWeight: '600',
            color: '#10b981',
            justifyContent: 'center',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Wave text demo
const WaveTextDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Wave Animation"
          subtitle="Letters wave up and down continuously"
        />
        <WaveText
          text="Wave Hello!"
          amplitude={20}
          frequency={0.4}
          speed={0.12}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
          }}
          letterStyle={{
            color: '#10b981',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Rainbow text demo
const RainbowTextDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Rainbow Colors"
          subtitle="Cycling through the color spectrum"
        />
        <RainbowText
          text="Colorful Animation"
          speed={4}
          saturation={80}
          lightness={60}
          style={{
            fontSize: 68,
            fontWeight: 'bold',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Gradient text demo
const GradientTextDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Gradient Animation"
          subtitle="Moving gradient colors"
        />
        <GradientText
          text="MotionForge"
          colors={['#10b981', '#34d399', '#14b8a6', '#6ee7b7', '#10b981']}
          speed={3}
          angle={90}
          style={{
            fontSize: 80,
            fontWeight: 'bold',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Neon glow text demo
const NeonGlowDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' }}>
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Neon Glow"
          subtitle="Pulsing neon effect"
        />
        <NeonGlow color="#10b981" intensity={1.5}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#10b981',
            }}
          >
            NEON
          </span>
        </NeonGlow>
      </div>
    </AbsoluteFill>
  );
};

// Combined effects demo
const CombinedEffectsDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Combined Effects"
          subtitle="Multiple effects working together"
        />

        {/* Neon glow with wave */}
        <div style={{ marginBottom: 40 }}>
          <NeonGlow color="#10b981" intensity={1.2}>
            <WaveText
              text="MotionForge"
              amplitude={8}
              frequency={0.3}
              speed={0.1}
              style={{
                fontSize: 64,
                fontWeight: 'bold',
              }}
              letterStyle={{
                color: '#10b981',
              }}
            />
          </NeonGlow>
        </div>

        {/* Rainbow with letter animation */}
        <div style={{ marginBottom: 40 }}>
          <LetterByLetter
            text="Video Creation"
            durationInFrames={45}
            delayPerLetter={2}
            animation="scale"
            style={{
              fontSize: 48,
              justifyContent: 'center',
            }}
            letterStyle={{
              color: '#34d399',
            }}
          />
        </div>

        {/* Gradient text */}
        <GradientText
          text="Made with React"
          colors={['#059669', '#10b981', '#34d399', '#6ee7b7', '#10b981']}
          speed={2}
          style={{
            fontSize: 36,
            fontWeight: '500',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Typing reveal demo
const TypingRevealDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const text = "Building videos frame by frame...";

  const visibleChars = Math.min(
    Math.floor(interpolate(frame, [0, 60], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })),
    text.length
  );

  const displayText = text.slice(0, visibleChars);
  const showCursor = frame % 30 < 15;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Typing Effect"
          subtitle="Characters appear one at a time"
        />
        <div
          style={{
            fontSize: 42,
            fontFamily: 'monospace',
            color: '#10b981',
          }}
        >
          {displayText}
          {showCursor && <span style={{ color: '#6ee7b7' }}>|</span>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scrolling marquee demo
const MarqueeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const text = "MotionForge • Create Videos with React • Frame by Frame Animation • ";
  const textWidth = text.length * 24;
  const offset = (frame * 8) % textWidth;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextBackground />
      <div style={{ textAlign: 'center' }}>
        <TextSectionTitle
          title="Marquee Effect"
          subtitle="Scrolling text banner"
        />
        <div
          style={{
            overflow: 'hidden',
            width: 800,
            whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              transform: `translateX(${-offset}px)`,
              fontSize: 36,
              color: '#10b981',
            }}
          >
            {text}
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main composition
export const DemoComposition5: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <Sequence from={0} durationInFrames={120}>
        <LetterFadeDemo />
      </Sequence>

      <Sequence from={120} durationInFrames={120}>
        <LetterScaleDemo />
      </Sequence>

      <Sequence from={240} durationInFrames={120}>
        <LetterSlideDemo />
      </Sequence>

      <Sequence from={360} durationInFrames={150}>
        <WordByWordDemo />
      </Sequence>

      <Sequence from={510} durationInFrames={150}>
        <WaveTextDemo />
      </Sequence>

      <Sequence from={660} durationInFrames={150}>
        <RainbowTextDemo />
      </Sequence>

      <Sequence from={810} durationInFrames={150}>
        <GradientTextDemo />
      </Sequence>

      <Sequence from={960} durationInFrames={150}>
        <NeonGlowDemo />
      </Sequence>

      <Sequence from={1110} durationInFrames={150}>
        <TypingRevealDemo />
      </Sequence>

      <Sequence from={1260} durationInFrames={150}>
        <MarqueeDemo />
      </Sequence>

      <Sequence from={1410} durationInFrames={180}>
        <CombinedEffectsDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

export default DemoComposition5;
