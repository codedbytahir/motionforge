# 🎬 MotionForge Professional AI Video Engineering Guide (Google Gemini)

## 🚀 Framework Overview

MotionForge is a high-performance, programmatic video creation framework built on React. It enables the creation of cinematic videos using React components, frame-accurate rendering, and advanced physics-based animations. This guide is optimized for **Google Gemini (Pro/Ultra)** to architect, develop, and optimize professional video content.

## 💎 Core Philosophy: Video as a Function of Time

In MotionForge, **Video = ƒ(frame)**. Every visual element is a pure React component that derives its state from the current frame. This deterministic approach ensures:

- **Frame-Perfect Accuracy**: Zero jitter, guaranteed consistency across renders.
- **Parametric Design**: Videos can be generated dynamically from any data source.
- **Cinematic Motion**: Native support for spring physics, interpolation, and easing.
- **Web-First**: Uses modern web technologies (Canvas, SVG, WebCodecs) for maximum performance.

## Project Structure

```
motionforge/
├── src/
│   └── lib/
│       └── remotion/
│           ├── core/           # Core types and context
│           ├── components/     # Video components
│           ├── utils/          # Animation utilities
│           ├── hooks/          # React hooks
│           ├── player/         # Timeline player
│           ├── renderer/       # Video rendering
│           └── icons/          # Icon library
```

## Fundamental APIs

### useCurrentFrame()

The most fundamental hook. Returns the current frame number (0-indexed).

```typescript
import { useCurrentFrame } from 'motionforge';

const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Use frame to calculate animations
  const progress = frame / 100;
  
  return <div style={{ opacity: progress }}>Frame {frame}</div>;
};
```

### useVideoConfig()

Returns video configuration:

```typescript
interface VideoConfig {
  fps: number;              // Frames per second
  durationInFrames: number; // Total frames
  width: number;            // Canvas width (pixels)
  height: number;           // Canvas height (pixels)
}

const config = useVideoConfig();
```

## Component Reference

### AbsoluteFill

The foundational container component. Creates a positioned div that fills the entire canvas.

```typescript
import { AbsoluteFill } from 'motionforge';

// Basic usage
<AbsoluteFill>
  {/* Content fills entire canvas */}
</AbsoluteFill>

// With positioning
<AbsoluteFill style={{
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#0a0a0a'
}}>
  <Content />
</AbsoluteFill>

// Layering (stack order)
<AbsoluteFill>
  <AbsoluteFill style={{ zIndex: 0 }}>Background</AbsoluteFill>
  <AbsoluteFill style={{ zIndex: 1 }}>Foreground</AbsoluteFill>
</AbsoluteFill>
```

### Sequence

Renders children during a specific frame range. Essential for scene management.

```typescript
import { Sequence } from 'motionforge';

<Sequence 
  from={0}              // Start frame (inclusive)
  durationInFrames={60} // Duration in frames
  name="intro"          // Optional debug name
>
  <IntroScene />
</Sequence>
```

**Behavior:**
- Children are not rendered outside the frame range
- Sequences can overlap for transitions
- Nested sequences are supported

**Example - Scene Transition:**

```typescript
const VideoWithTransitions = () => (
  <AbsoluteFill>
    {/* Scene 1: fades out while Scene 2 fades in */}
    <Sequence from={0} durationInFrames={90}>
      <Scene1 />
    </Sequence>
    <Sequence from={60} durationInFrames={90}>
      <Scene2 />
    </Sequence>
  </AbsoluteFill>
);
```

### Loop

Loops content infinitely or for a specific number of iterations.

```typescript
<Loop durationInFrames={30} times={Infinity}>
  <Spinner />
</Loop>

// Finite loop
<Loop durationInFrames={20} times={3}>
  <BounceAnimation />
</Loop>
```

### Freeze

Pauses rendering at a specific frame.

```typescript
<Freeze frame={15} durationInFrames={60}>
  <StaticContent />
</Freeze>
```

### Retiming

Changes the playback speed of wrapped content.

```typescript
<Retiming playbackRate={2.0}>
  {/* Plays at 2x speed */}
</Retiming>

<Retiming playbackRate={(frame) => frame < 30 ? 1 : 2}>
  {/* Variable speed */}
</Retiming>
```

### Reverse

Plays content in reverse.

```typescript
<Reverse durationInFrames={60}>
  <Animation />
</Reverse>
```

## Animation Functions

### interpolate()

Maps input values to output values with optional easing.

```typescript
import { interpolate, Easing } from 'motionforge';

// Basic interpolation
const opacity = interpolate(
  frame,           // Input value
  [0, 30],        // Input range
  [0, 1]          // Output range
);

// With options
const position = interpolate(
  frame,
  [0, 60, 120],          // Multiple points
  [0, 100, 50],          // Corresponding outputs
  {
    extrapolateLeft: 'clamp',    // Handle values below range
    extrapolateRight: 'clamp',   // Handle values above range
    easing: Easing.easeOutCubic  // Easing function
  }
);
```

**Extrapolation Options:**
- `'clamp'`: Clamp to output range boundaries
- `'extend'`: Continue linear extrapolation
- `'identity'`: Return input value unchanged

**Multi-point Interpolation:**

```typescript
// Create complex motion paths
const x = interpolate(
  frame,
  [0, 30, 60, 90, 120],
  [0, 100, 200, 150, 300],
  { easing: Easing.easeInOutCubic }
);
```

### spring()

Physics-based spring animation.

```typescript
import { spring } from 'motionforge';

const value = spring({
  frame: currentFrame,
  fps: 30,
  config: {
    damping: 10,           // 1-100, lower = more oscillation
    stiffness: 100,        // 1-1000, higher = faster
    mass: 1,               // Animation weight
    overshootClamping: false  // Prevent overshooting
  },
  from: 0,                 // Start value
  to: 1                    // End value
});
```

**Spring Presets:**

```typescript
// Gentle
{ damping: 20, stiffness: 80 }

// Bouncy
{ damping: 5, stiffness: 150 }

// Snappy
{ damping: 15, stiffness: 200 }

// Slow
{ damping: 30, stiffness: 50 }
```

### Easing Functions

```typescript
import { Easing } from 'motionforge';

// Quadratic
Easing.easeInQuad
Easing.easeOutQuad
Easing.easeInOutQuad

// Cubic
Easing.easeInCubic
Easing.easeOutCubic
Easing.easeInOutCubic

// Quartic
Easing.easeInQuart
Easing.easeOutQuart
Easing.easeInOutQuart

// Quintic
Easing.easeInQuint
Easing.easeOutQuint
Easing.easeInOutQuint

// Sinusoidal
Easing.easeInSine
Easing.easeOutSine
Easing.easeInOutSine

// Exponential
Easing.easeInExpo
Easing.easeOutExpo
Easing.easeInOutExpo

// Circular
Easing.easeInCirc
Easing.easeOutCirc
Easing.easeInOutCirc

// Back (overshoot)
Easing.easeInBack
Easing.easeOutBack
Easing.easeInOutBack

// Elastic
Easing.easeInElastic
Easing.easeOutElastic
Easing.easeInOutElastic

// Bounce
Easing.easeInBounce
Easing.easeOutBounce
Easing.easeInOutBounce

// Bezier curve
Easing.bezier(x1, y1, x2, y2)
```

### interpolateColors()

Smooth color transitions.

```typescript
import { interpolateColors } from 'motionforge';

const color = interpolateColors(
  frame,
  [0, 30, 60],
  ['#000000', '#10b981', '#ffffff']
);
```

## Effect Components

### Fade

```typescript
<Fade durationInFrames={30} startFrame={0}>
  <Content />
</Fade>
```

### Scale

```typescript
<Scale 
  from={0} 
  to={1} 
  durationInFrames={30}
  easing={Easing.easeOutBack}
>
  <Content />
</Scale>
```

### Slide

```typescript
<Slide 
  direction="left"  // 'left' | 'right' | 'up' | 'down'
  distance={100}
  durationInFrames={30}
>
  <Content />
</Slide>
```

### Rotate

```typescript
<Rotate degrees={360} durationInFrames={60}>
  <Content />
</Rotate>
```

### Typewriter

```typescript
<Typewriter
  text="Hello World"
  durationInFrames={45}
  startFrame={0}
  cursor={true}
  cursorChar="|"
  style={{ fontSize: 48, color: '#10b981' }}
/>
```

### Counter

```typescript
<Counter
  from={0}
  to={1000000}
  durationInFrames={60}
  startFrame={0}
  format={(value) => `$${value.toLocaleString()}`}
  easing={Easing.easeOutCubic}
  style={{ fontSize: 64, color: '#10b981' }}
/>
```

### ProgressBar

```typescript
<ProgressBar
  progress={0.75}  // 0-1
  width={300}
  height={8}
  backgroundColor="#064e3b"
  fillColor="#10b981"
  borderRadius={4}
/>
```

### Glitch

```typescript
<Glitch intensity={10}>
  <Content />
</Glitch>
```

### NeonGlow

```typescript
<NeonGlow color="#10b981" intensity={1.5}>
  <span style={{ fontSize: 72 }}>Glowing Text</span>
</NeonGlow>
```

### ShakeEffect

```typescript
<ShakeEffect intensity={5} active={true}>
  <Content />
</ShakeEffect>
```

## Media Components

### Img

```typescript
<Img 
  src="/path/to/image.png"
  style={{ width: '100%', objectFit: 'cover' }}
/>
```

### Video

```typescript
<Video
  src="/path/to/video.mp4"
  startFrom={0}
  endAt={300}
  volume={0.5}
  playbackRate={1.0}
  muted={false}
/>
```

### Audio

```typescript
<Audio
  src="/path/to/audio.mp3"
  volume={(frame) => interpolate(frame, [0, 30], [0, 1])}
/>
```

## SVG Components

```typescript
import { SVG, Rect, Circle, Path, G } from 'motionforge';

<SVG width={200} height={200} viewBox="0 0 100 100">
  {/* Rectangle */}
  <Rect 
    x={10} 
    y={10} 
    width={80} 
    height={80} 
    fill="#10b981"
    rx={4}
  />
  
  {/* Circle */}
  <Circle 
    cx={50} 
    cy={50} 
    r={40} 
    fill="#059669"
    stroke="#10b981"
    strokeWidth={2}
  />
  
  {/* Path */}
  <Path 
    d="M10,50 Q50,10 90,50 T90,90" 
    fill="none"
    stroke="#10b981"
  />
  
  {/* Group with transform */}
  <G transform="translate(10, 10)">
    <Circle cx={40} cy={40} r={30} fill="#34d399" />
  </G>
</SVG>
```

## Icon Library

MotionForge includes a comprehensive icon library. Always use icons instead of emojis for professional results.

```typescript
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SettingsIcon,
  VolumeIcon,
  MuteIcon,
  FullscreenIcon,
  RewindIcon,
  ForwardIcon,
  CheckIcon,
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  HeartIcon,
  // ... many more
} from 'motionforge/icons';

// Usage
<PlayIcon size={24} color="#10b981" />
<PauseIcon size={32} className="custom-class" />
```

## Transition Effects

```typescript
import { transitions, fade, slide, wipe, zoom, flip } from 'motionforge';

// Preset transitions
const { enter, exit } = transitions.fade;

// Manual application
const enterStyle = enter(progress);
const exitStyle = exit(progress);

// Available presets:
transitions.fade
transitions.slideRight
transitions.slideLeft
transitions.slideUp
transitions.slideDown
transitions.scale
transitions.zoom
transitions.flipX
transitions.flipY
```

## Hooks Reference

### useSpring

```typescript
const scale = useSpring({
  fps: 30,
  config: { damping: 10, stiffness: 100 }
});
```

### useInterpolate

```typescript
const opacity = useInterpolate([0, 30], [0, 1]);
```

### useProgress

```typescript
const progress = useProgress(); // 0 to 1
```

### useLoop

```typescript
const loopedFrame = useLoop(30); // Loops every 30 frames
```

### useTimeline

```typescript
const { frame, durationInFrames, fps, progress, timeInSeconds } = useTimeline();
```

### useFade

```typescript
const opacity = useFade(
  fadeInDuration,   // Frames to fade in
  fadeOutDuration,  // Frames to fade out
  { startFrame: 0, endFrame: 120 }
);
```

### useSlide

```typescript
const { transform } = useSlide(
  'left',    // direction
  100,       // distance
  30,        // duration
  0          // startFrame
);
```

## 🏆 Professional Workflow & Best Practices

### 1. Advanced Component Architecture

Always use `AbsoluteFill` as your primary container to ensure proper layering and positioning.

```typescript
/**
 * ✅ PROFESSIONAL PATTERN: Layered Composition
 */
const CinematicComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden' }}>
      {/* Layer 0: Background/Ambient */}
      <Sequence from={0} name="Background">
        <DynamicBackground />
      </Sequence>

      {/* Layer 1: Content/Visuals */}
      <Sequence from={30} durationInFrames={120} name="MainVisual">
        <Transition.Fade>
          <HeroGraphic />
        </Transition.Fade>
      </Sequence>

      {/* Layer 2: Overlays/UI/Text */}
      <Sequence from={60} name="Typography">
        <AnimatedTitle text="MOTIONFORGE" />
      </Sequence>

      {/* Layer 3: Post-Processing/Vignette */}
      <Vignette intensity={0.5} />
    </AbsoluteFill>
  );
};
```

### 2. Cinematic Animation Mastery

Professional video requires "natural" movement. Avoid linear animations unless intentional.

```typescript
// 🟢 RECOMMENDED: Spring with Damping for "Pop"
const popScale = spring({
  frame: frame - delay,
  fps,
  config: { stiffness: 200, damping: 12, mass: 0.5 }
});

// 🟢 RECOMMENDED: Interpolation with Cubic Easing for Smoothness
const smoothX = interpolate(frame, [0, 60], [-100, 0], {
  easing: Easing.easeOutCubic,
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp'
});
```

### 3. Staggered Animations (The "Pro" Look)

Use index-based delays to create sophisticated reveal patterns.

```typescript
const StaggeredReveal: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {items.map((text, i) => {
        const delay = i * 4; // 4-frame stagger
        const progress = spring({ frame: frame - delay, fps });

        return (
          <div style={{
            opacity: progress,
            transform: `translateY(${(1 - progress) * 20}px)`
          }}>
            {text}
          </div>
        );
      })}
    </div>
  );
};
```

### 4. 3D Space & Depth

MotionForge supports 3D transforms. Use them to create depth.

```typescript
<Perspective3D perspective={1000}>
  <Rotate3D y={frame} x={15}>
    <Card3D />
  </Rotate3D>
</Perspective3D>
```

## 🛠️ High-Performance Export System

MotionForge features a high-speed, frame-accurate export system.

### How to Trigger Export Programmatically

```typescript
import { renderCompositionToVideo, downloadVideo } from 'motionforge';

const startExport = async () => {
  const blob = await renderCompositionToVideo(
    (frame) => console.log(`Rendering frame ${frame}`),
    document.getElementById('video-element'),
    { width: 1920, height: 1080, fps: 30, durationInFrames: 300 }
  );

  if (blob) {
    downloadVideo(blob, 'my-professional-video.webm');
  }
};
```

## 💡 AI Prompting Tips for Gemini

When asking Gemini to generate videos, use these keywords for better results:
- **"Create a cinematic sequence with staggered animations"**
- **"Use spring physics with overshoot for the title reveal"**
- **"Apply a neon glow effect with hue-cycling background"**
- **"Implement a 3D rotating cube transition between scenes"**
- **"Use interpolation with Easing.bezier(0.25, 0.1, 0.25, 1) for professional timing"**

### 3. Scene Organization

```typescript
// CORRECT: Well-organized scenes
<AbsoluteFill>
  <Sequence from={0} durationInFrames={60} name="intro">
    <IntroScene />
  </Sequence>
  <Sequence from={60} durationInFrames={120} name="main">
    <MainScene />
  </Sequence>
  <Sequence from={180} durationInFrames={60} name="outro">
    <OutroScene />
  </Sequence>
</AbsoluteFill>
```

### 4. Icon Usage

```typescript
// CORRECT: Use icon components
import { PlayIcon, PauseIcon } from 'motionforge/icons';
<PlayIcon size={24} color="#10b981" />

// WRONG: Don't use emojis
<span>▶️</span>
```

### 5. Type Safety

```typescript
// CORRECT: Use TypeScript types
import type { VideoConfig, SequenceProps, SpringConfig } from 'motionforge';

const config: SpringConfig = {
  damping: 10,
  stiffness: 100
};
```

## Common Patterns

### Animated Text Reveal

```typescript
const AnimatedText: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 }
  });
  
  const opacity = interpolate(
    frame,
    [delay, delay + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const translateY = interpolate(progress, [0, 1], [30, 0]);
  
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {text}
    </div>
  );
};
```

### Staggered List Animation

```typescript
const StaggeredList: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, index) => {
        const delay = index * 5;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 10 }
        });
        
        return (
          <div
            key={index}
            style={{
              opacity: progress,
              transform: `translateX(${(1 - progress) * 50}px)`
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};
```

### Animated Background

```typescript
const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const hue1 = (frame * 0.5) % 360;
  const hue2 = (hue1 + 60) % 360;
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, 
          hsl(${hue1}, 70%, 20%) 0%, 
          hsl(${hue2}, 70%, 15%) 100%)`
      }}
    />
  );
};
```

## Debugging Tips

### Frame Display

```typescript
const DebugOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      padding: '5px 10px',
      background: 'rgba(0,0,0,0.7)',
      color: '#10b981',
      fontFamily: 'monospace',
      fontSize: 12
    }}>
      Frame: {frame} / {durationInFrames} ({(frame / fps).toFixed(2)}s)
    </div>
  );
};
```

## Sample Complete Composition

```typescript
import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Fade,
  Scale,
  Typewriter,
  Counter,
  NeonGlow
} from 'motionforge';
import { PlayIcon, StarIcon, HeartIcon } from 'motionforge/icons';

const MotionForgeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, 
            hsl(${(frame * 0.5) % 360}, 70%, 15%) 0%, 
            hsl(${((frame * 0.5) + 60) % 360}, 70%, 10%) 100%)`
        }}
      />
      
      {/* Scene 1: Title */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Fade durationInFrames={20}>
            <Scale from={0.5} to={1} durationInFrames={30} easing={Easing.easeOutBack}>
              <NeonGlow color="#10b981" intensity={1.5}>
                <h1 style={{ fontSize: 72, color: '#10b981', fontWeight: 'bold' }}>
                  MotionForge
                </h1>
              </NeonGlow>
            </Scale>
          </Fade>
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 2: Features */}
      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          <Typewriter
            text="Create videos with React"
            durationInFrames={40}
            style={{ fontSize: 32, color: '#6ee7b7' }}
          />
          
          <Counter
            from={0}
            to={1000000}
            durationInFrames={60}
            format={(v) => `${v.toLocaleString()}+ Users`}
            style={{ fontSize: 48, color: '#10b981' }}
          />
          
          <div style={{ display: 'flex', gap: 20 }}>
            <FeatureIcon Icon={PlayIcon} label="Play" delay={0} />
            <FeatureIcon Icon={StarIcon} label="Rate" delay={10} />
            <FeatureIcon Icon={HeartIcon} label="Like" delay={20} />
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const FeatureIcon: React.FC<{
  Icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  delay: number;
}> = ({ Icon, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 100 }
  });
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      transform: `scale(${scale})`
    }}>
      <Icon size={32} color="#10b981" />
      <span style={{ color: '#6ee7b7', fontSize: 14 }}>{label}</span>
    </div>
  );
};

export default MotionForgeDemo;
```

## Quick Reference Card

| API | Purpose | Key Parameters |
|-----|---------|----------------|
| `useCurrentFrame()` | Get frame number | None |
| `useVideoConfig()` | Get config | None |
| `interpolate()` | Value mapping | `input, inputRange, outputRange, options` |
| `spring()` | Physics animation | `frame, fps, config` |
| `AbsoluteFill` | Container | `style` |
| `Sequence` | Scene timing | `from, durationInFrames` |
| `Loop` | Loop content | `durationInFrames, times` |
| `Fade` | Fade effect | `durationInFrames, startFrame` |
| `Scale` | Scale effect | `from, to, durationInFrames` |
| `Slide` | Slide effect | `direction, distance` |
| `Typewriter` | Type effect | `text, durationInFrames` |
| `Counter` | Count effect | `from, to, durationInFrames` |

---

**Framework Version:** 1.0.0  
**Target AI System:** Google AI (Gemini)  
**Last Updated:** 2024
