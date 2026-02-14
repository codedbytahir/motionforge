# MotionForge

<div align="center">
  <img src="https://img.shields.io/npm/v/motionforge?color=10b981&label=npm&style=for-the-badge" alt="npm version" />
  <img src="https://img.shields.io/npm/dt/motionforge?color=10b981&style=for-the-badge" alt="downloads" />
  <img src="https://img.shields.io/github/license/motionforge/motionforge?color=10b981&style=for-the-badge" alt="license" />
</div>

<div align="center">
  <h3>Create stunning videos programmatically with React</h3>
  <p>Build animations, motion graphics, and videos using React components and frame-perfect control.</p>
</div>

---

## ✨ Features

- 🎬 **Frame-Based Rendering** - Precise control over every frame
- 🎨 **70+ Effect Components** - Fade, Scale, Slide, 3D transforms, particles, and more
- 🌊 **Spring Physics** - Natural, physics-based animations
- 📊 **Interpolation System** - Smooth transitions with 20+ easing functions
- 🎮 **Interactive Player** - Real-time preview with timeline controls
- 📦 **Frame Caching** - LRU cache for optimized performance
- 🎥 **Video Export** - WebM encoding with MediaRecorder API
- 🎯 **TypeScript First** - Full type safety out of the box

## 📦 Installation

```bash
# npm
npm install motionforge

# yarn
yarn add motionforge

# pnpm
pnpm add motionforge

# bun
bun add motionforge
```

## 🚀 Quick Start

```tsx
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate,
  spring,
  Player 
} from 'motionforge';

// Create a video composition
const MyVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Spring animation
  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 }
  });
  
  // Interpolation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp'
  });
  
  return (
    <AbsoluteFill 
      style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#0a0a0a'
      }}
    >
      <h1 style={{ 
        opacity, 
        transform: `scale(${scale})`,
        fontSize: 72,
        color: '#10b981'
      }}>
        Hello MotionForge!
      </h1>
    </AbsoluteFill>
  );
};

// Use with Player
const App = () => (
  <Player
    component={MyVideo}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    controls
    loop
  />
);
```

## 🎨 Available Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `AbsoluteFill` | Full-screen container with absolute positioning |
| `Sequence` | Time-based rendering for scene management |
| `Loop` | Loop content infinitely or for a set number of times |
| `Freeze` | Pause content at a specific frame |
| `Retiming` | Variable speed playback |
| `Reverse` | Play content backwards |
| `Series` | Sequential scene management |

### Effect Components

```tsx
import { 
  Fade, Scale, Slide, Rotate,
  Typewriter, Counter, NeonGlow,
  Rotate3D, Cube3D, Perspective3D,
  ParticleSystem, Confetti,
  LetterByLetter, WaveText, RainbowText
} from 'motionforge';

// Example: 3D rotating cube
<Cube3D size={100} durationInFrames={120} />

// Example: Letter by letter animation
<LetterByLetter 
  text="Hello World" 
  animation="scale" 
  delayPerLetter={3} 
/>

// Example: Particle system
<ParticleSystem 
  count={100} 
  direction="up" 
  colors={['#10b981', '#34d399']} 
/>
```

### Animation Functions

```tsx
import { spring, interpolate, Easing } from 'motionforge';

// Spring physics
const value = spring({
  frame: 30,
  fps: 30,
  config: { damping: 10, stiffness: 100, mass: 1 }
});

// Interpolation with easing
const progress = interpolate(frame, [0, 60], [0, 100], {
  easing: Easing.easeOutCubic,
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp'
});

// Available easing functions
Easing.linear
Easing.easeInQuad, Easing.easeOutQuad, Easing.easeInOutQuad
Easing.easeInCubic, Easing.easeOutCubic, Easing.easeInOutCubic
Easing.easeInElastic, Easing.easeOutElastic
Easing.easeInBounce, Easing.easeOutBounce
// ... and more!
```

## 🎥 Video Export

```tsx
import { 
  VideoExportManager, 
  downloadVideo,
  checkEncodingSupport 
} from 'motionforge';

// Check browser support
const support = checkEncodingSupport();
console.log('WebM support:', support.webm);
console.log('Available codecs:', support.codecs);

// Export video
const manager = new VideoExportManager();
const result = await manager.exportFromCanvas(canvas, {
  config: { width: 1920, height: 1080, fps: 30, durationInFrames: 150 },
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentage.toFixed(1)}%`);
  }
});

if (result.success && result.blob) {
  downloadVideo(result.blob, 'my-video.webm');
}
```

## 🎯 Performance Optimization

```tsx
import { 
  useMemoizedFrame,
  useOptimizedSpring,
  usePrecomputeFrames,
  FrameCache 
} from 'motionforge';

// Memoize expensive computations
const value = useMemoizedFrame(() => expensiveCalculation(), [deps]);

// Pre-compute upcoming frames
const frameCache = usePrecomputeFrames(
  (frame) => computeValue(frame),
  10 // lookahead
);

// Cached spring animation
const scale = useOptimizedSpring({ damping: 10 }, 0, 1);
```

## 📚 API Reference

### Hooks

| Hook | Description |
|------|-------------|
| `useCurrentFrame()` | Returns the current frame number |
| `useVideoConfig()` | Returns video configuration `{ fps, width, height, durationInFrames }` |
| `useSpring(config)` | Creates spring-based animations |
| `useInterpolate(inputRange, outputRange, options)` | Interpolates values with easing |

### Utility Functions

| Function | Description |
|----------|-------------|
| `spring({ frame, fps, config })` | Calculate spring animation value |
| `interpolate(input, inputRange, outputRange, options)` | Map values between ranges |
| `interpolateColors(input, inputRange, outputRange)` | Smooth color transitions |
| `random(seed)` | Deterministic random number generator |
| `noise2D(x, y)` | Perlin noise function |

## 🎨 Theming

MotionForge uses a dark theme by default with emerald green accents. Customize colors using CSS variables:

```css
:root {
  --mf-primary: #10b981;
  --mf-secondary: #34d399;
  --mf-background: #0a0a0a;
  --mf-surface: #0f0f0f;
  --mf-border: rgba(16, 185, 129, 0.3);
}
```

## 📖 Documentation

- [Getting Started](https://motionforge.dev/docs/getting-started)
- [API Reference](https://motionforge.dev/docs/api)
- [Examples](https://motionforge.dev/examples)
- [Guides](https://motionforge.dev/guides)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Inspired by [Remotion](https://remotion.dev) - The original React video framework.

---

<div align="center">
  Made with ❤️ by the MotionForge Team
</div>
