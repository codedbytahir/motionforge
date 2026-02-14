# MotionForge AI Agent Guidelines for GLM AI

## Introduction

MotionForge is a React-based framework for creating videos programmatically. This guide will help GLM AI understand and use the framework effectively to create stunning video compositions.

## Core Concepts

### 1. Frame-Based Rendering

MotionForge renders videos frame by frame. Each component receives the current frame number through the `useCurrentFrame()` hook. This is the foundation of all animations.

```tsx
import { useCurrentFrame } from 'motionforge';

const MyComponent = () => {
  const frame = useCurrentFrame();
  // frame is 0-indexed, starts at 0
  return <div>Current frame: {frame}</div>;
};
```

### 2. Video Configuration

Every composition needs configuration for dimensions, frame rate, and duration:

```tsx
import { useVideoConfig } from 'motionforge';

const MyComponent = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  return null;
};
```

### 3. Composition Structure

Videos are defined as React components wrapped in composition containers:

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'motionforge';

const MyVideo = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Your content here */}
    </AbsoluteFill>
  );
};
```

## Essential Components

### AbsoluteFill

Container that fills the entire canvas. Always use this as the root container:

```tsx
<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
  <div>Centered content</div>
</AbsoluteFill>
```

**Props:**
- `style`: CSS properties for positioning and styling
- `children`: Nested components

### Sequence

Renders children only during a specific frame range:

```tsx
<Sequence from={0} durationInFrames={30}>
  <TitleSlide />
</Sequence>
<Sequence from={30} durationInFrames={60}>
  <ContentSlide />
</Sequence>
```

**Props:**
- `from`: Starting frame number
- `durationInFrames`: How many frames to display
- `offset`: Additional frame offset (optional)
- `name`: Debug name (optional)

### Loop

Loops content infinitely or for a specified number of times:

```tsx
<Loop durationInFrames={30} times={Infinity}>
  <AnimatedIcon />
</Loop>
```

### Freeze

Freezes the content at a specific frame:

```tsx
<Freeze frame={15} durationInFrames={60}>
  <PausedContent />
</Freeze>
```

## Animation Functions

### interpolate()

Maps a value from one range to another:

```tsx
import { interpolate, Easing } from 'motionforge';

const opacity = interpolate(
  frame,
  [0, 30],           // Input range
  [0, 1],            // Output range
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.easeOutCubic
  }
);
```

**Options:**
- `extrapolateLeft`: 'clamp' | 'extend' | 'identity'
- `extrapolateRight`: 'clamp' | 'extend' | 'identity'
- `easing`: Easing function

### spring()

Physics-based spring animations:

```tsx
import { spring } from 'motionforge';

const scale = spring({
  frame,
  fps,
  config: {
    damping: 10,      // Lower = more bounce
    stiffness: 100,   // Higher = faster
    mass: 1,
    overshootClamping: false
  }
});
```

**Spring Config Options:**
- `damping`: Controls oscillation (1-100, default: 10)
- `stiffness`: Spring tension (1-1000, default: 100)
- `mass`: Animation weight (default: 1)
- `overshootClamping`: Prevent overshooting (default: false)

### Easing Functions

```tsx
import { Easing } from 'motionforge';

// Available easing functions:
Easing.linear
Easing.easeInQuad / easeOutQuad / easeInOutQuad
Easing.easeInCubic / easeOutCubic / easeInOutCubic
Easing.easeInQuart / easeOutQuart / easeInOutQuart
Easing.easeInQuint / easeOutQuint / easeInOutQuint
Easing.easeInSine / easeOutSine / easeInOutSine
Easing.easeInExpo / easeOutExpo / easeInOutExpo
Easing.easeInCirc / easeOutCirc / easeInOutCirc
Easing.easeInBack / easeOutBack / easeInOutBack
Easing.easeInElastic / easeOutElastic / easeInOutElastic
Easing.easeInBounce / easeOutBounce / easeInOutBounce
```

## Pre-built Effect Components

### Fade

```tsx
<Fade durationInFrames={30} startFrame={0}>
  <Content />
</Fade>
```

### Scale

```tsx
<Scale from={0} to={1} durationInFrames={30} startFrame={0}>
  <Content />
</Scale>
```

### Slide

```tsx
<Slide direction="left" distance={100} durationInFrames={30}>
  <Content />
</Slide>
```

### Rotate

```tsx
<Rotate degrees={360} durationInFrames={60}>
  <Content />
</Rotate>
```

### Typewriter

```tsx
<Typewriter
  text="Hello World"
  durationInFrames={45}
  startFrame={0}
  cursor
  cursorChar="|"
/>
```

### Counter

```tsx
<Counter
  from={0}
  to={1000000}
  durationInFrames={60}
  format={(v) => v.toLocaleString()}
/>
```

### NeonGlow

```tsx
<NeonGlow color="#10b981" intensity={1.5}>
  <span style={{ fontSize: 72 }}>Glowing Text</span>
</NeonGlow>
```

## Media Components

### Img

```tsx
<Img src="/path/to/image.png" style={{ width: '100%' }} />
```

### Video

```tsx
<Video
  src="/path/to/video.mp4"
  startFrom={30}
  volume={0.5}
  muted
/>
```

### Audio

```tsx
<Audio
  src="/path/to/audio.mp3"
  volume={(frame) => interpolate(frame, [0, 30], [0, 1])}
/>
```

## SVG Components

```tsx
import { SVG, Rect, Circle, Path, G } from 'motionforge';

<SVG width={200} height={200} viewBox="0 0 100 100">
  <Circle cx={50} cy={50} r={40} fill="#10b981" />
  <Rect x={10} y={10} width={80} height={80} fill="#059669" />
</SVG>
```

## Best Practices for GLM AI

### 1. Always Start with AbsoluteFill

Every composition must have `AbsoluteFill` as the root container:

```tsx
// CORRECT
const MyVideo = () => (
  <AbsoluteFill>
    {/* content */}
  </AbsoluteFill>
);

// WRONG
const MyVideo = () => (
  <div>
    {/* content */}
  </div>
);
```

### 2. Use Sequence for Scene Management

Break videos into scenes using `Sequence`:

```tsx
<AbsoluteFill>
  <Sequence from={0} durationInFrames={90}>
    <IntroScene />
  </Sequence>
  <Sequence from={90} durationInFrames={120}>
    <MainScene />
  </Sequence>
  <Sequence from={210} durationInFrames={60}>
    <OutroScene />
  </Sequence>
</AbsoluteFill>
```

### 3. Animate with interpolate and spring

Use `interpolate` for linear animations and `spring` for natural physics:

```tsx
// Linear animation
const opacity = interpolate(frame, [0, 30], [0, 1]);

// Physics-based animation
const scale = spring({ frame, fps, config: { damping: 12 } });
```

### 4. Clamp Values Appropriately

Always use extrapolation options to prevent unexpected values:

```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp'
});
```

### 5. Use Icons, Not Emojis

MotionForge includes an icon library. Use icons for professional results:

```tsx
import { PlayIcon, PauseIcon, SettingsIcon } from 'motionforge/icons';

// CORRECT
<PlayIcon size={24} color="#10b981" />

// WRONG
<span>▶️</span>
```

## Common Patterns

### Fade In Text

```tsx
const FadeInText = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const translateY = interpolate(
    frame,
    [delay, delay + 20],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};
```

### Animated Progress Bar

```tsx
const ProgressBar = ({ progress, width = 200 }) => (
  <div style={{ width, height: 8, backgroundColor: '#064e3b', borderRadius: 4 }}>
    <div
      style={{
        width: `${progress * 100}%`,
        height: '100%',
        backgroundColor: '#10b981',
        borderRadius: 4
      }}
    />
  </div>
);
```

### Animated Number Counter

```tsx
<Counter
  from={0}
  to={1000000}
  durationInFrames={60}
  format={(v) => `$${v.toLocaleString()}`}
/>
```

## Sample Compositions

### Simple Title Card

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'motionforge';

const TitleCard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a'
      }}
    >
      <h1
        style={{
          fontSize: 72,
          color: '#10b981',
          opacity,
          transform: `scale(${scale})`
        }}
      >
        MotionForge
      </h1>
    </AbsoluteFill>
  );
};
```

### Multi-Scene Video

```tsx
import { AbsoluteFill, Sequence, Fade, Scale } from 'motionforge';

const MultiSceneVideo = () => (
  <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
    <Sequence from={0} durationInFrames={60}>
      <Fade durationInFrames={20}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: '#10b981', fontSize: 64 }}>Welcome</h1>
        </AbsoluteFill>
      </Fade>
    </Sequence>
    
    <Sequence from={60} durationInFrames={90}>
      <Scale from={0.8} to={1} durationInFrames={20}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: '#6ee7b7', fontSize: 32 }}>Create amazing videos</p>
        </AbsoluteFill>
      </Scale>
    </Sequence>
  </AbsoluteFill>
);
```

## GLM AI Specific Instructions

1. **Always import from 'motionforge'**: Use the single import path for all components
2. **Never use emojis**: Use the icon library for visual elements
3. **Structure compositions properly**: Start with AbsoluteFill, use Sequence for scenes
4. **Apply animations thoughtfully**: Use spring for organic motion, interpolate for precise control
5. **Handle frame boundaries**: Always clamp or handle edge cases in interpolations
6. **Test frame by frame**: Consider how each frame will render

## Error Prevention

### Common Errors to Avoid

```tsx
// WRONG: Missing AbsoluteFill
const Video = () => <div>Hello</div>;

// CORRECT:
const Video = () => <AbsoluteFill><div>Hello</div></AbsoluteFill>;

// WRONG: Unclamped interpolation
const opacity = interpolate(frame, [0, 30], [0, 1]);

// CORRECT:
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp'
});

// WRONG: Missing fps in spring
const scale = spring({ frame });

// CORRECT:
const scale = spring({ frame, fps });
```

## Quick Reference

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `AbsoluteFill` | Root container | `style` |
| `Sequence` | Time-based rendering | `from`, `durationInFrames` |
| `Loop` | Infinite/timed loops | `durationInFrames`, `times` |
| `Freeze` | Pause at frame | `frame`, `durationInFrames` |
| `Fade` | Fade effect | `durationInFrames`, `startFrame` |
| `Scale` | Scale animation | `from`, `to`, `durationInFrames` |
| `Slide` | Slide effect | `direction`, `distance` |
| `Rotate` | Rotation animation | `degrees`, `durationInFrames` |
| `Typewriter` | Typing effect | `text`, `durationInFrames` |
| `Counter` | Number animation | `from`, `to`, `durationInFrames` |

| Function | Purpose | Returns |
|----------|---------|---------|
| `useCurrentFrame()` | Get current frame | `number` |
| `useVideoConfig()` | Get video config | `{ fps, width, height, durationInFrames }` |
| `interpolate()` | Map values | `number` |
| `spring()` | Physics animation | `number` |

---

**Version:** 1.0.0
**Framework:** MotionForge
**Target AI:** GLM AI
