# 🎥 MotionForge

**The Cinematic Programmatic Video Engine**

<div align="center">
  <video src="./public/demo-cinematic.webm" width="100%" autoplay muted loop></video>
</div>

MotionForge is a high-performance framework for creating videos programmatically using React, Next.js, and WebGL. It provides a deterministic, frame-accurate rendering engine that allows you to build complex motion graphics with the power of modern web technologies.

---

## ✨ New in v2.0: Cinematic Suite

We've integrated a suite of high-end animations designed for modern video production:

### 🖋️ Cinematic Typography
- **KineticTypography**: Staggered, velocity-based character animations with fluid organic motion.
- **LiquidText**: SVG-based liquid fill animations for high-impact headings.
- **TextStack3D**: Multi-layered 3D text effects with deep perspective.

### 🌐 WebGL & Shaders (Powered by Three.js)
- **DepthGallery3D**: Immersive 3D environments with distance-based fog and depth-of-field.
- **ShaderImageReveal**: Perlin noise-based threshold reveals for cinematic transitions.
- **DitheringEffect**: Real-time Ordered/Floyd-Steinberg dithering for a stylized aesthetic.

### 📐 Layout & Transitions
- **StickyGridScroll**: Smooth, frame-accurate grid transitions.
- **FlipImageReveal**: Seamless thumbnail-to-fullscreen expansions using the FLIP technique.
- **CardExpansionMask**: Circular SVG mask reveals for focus-driven content.

---

## 🚀 Quick Start

```bash
npx create-motionforge@latest my-video
```

Or install in an existing project:

```bash
npm install motionforge
```

### Basic Usage

```tsx
import { AbsoluteFill, KineticTypography } from 'motionforge';

export const MyComposition = () => {
  return (
    <AbsoluteFill className="bg-black flex items-center justify-center">
      <KineticTypography
        text="HELLO WORLD"
        type="velocity"
        fontSize={120}
      />
    </AbsoluteFill>
  );
};
```

---

## 🛠️ Tech Stack

- **React 19**: The latest rendering capabilities.
- **Next.js 15**: Robust application framework.
- **Three.js & R3F**: Industry-standard 3D rendering.
- **Tailwind CSS 4**: Modern, lightning-fast styling.
- **Framer Motion**: Complex physics and layout animations.

---

## 📜 Principles

1. **Deterministic**: Every frame is calculated based on its number, ensuring perfect exports.
2. **Modular**: Only import what you need. Light and fast by default.
3. **Cinematic**: Built-in effects that look like they were made in After Effects.

---

Built with ❤️ by the MotionForge Team.
