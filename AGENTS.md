# 🤖 Agent Guidelines for MotionForge

## 🎨 Creative Engineering Principles
- **Deterministic First**: Always drive animations using `useCurrentFrame()`. Never use `Date.now()` or unsynchronized `setInterval`.
- **Cinematic Polish**: Use organic easing (e.g., `easeOutExpo`, `easeInOutQuart`) and staggered delays for a premium feel.
- **WebGL Integration**: When using `@react-three/fiber`, ensure the scene state is derived from the frame number for frame-perfect exports.
- **Tailwind 4**: Leverage Tailwind 4 features for styling components within the `packages/motionforge` directory.

## 📁 Monorepo Structure
- `packages/motionforge/src`: Core library source. **This is the source of truth.**
- `src/lib/remotion`: Local mirror for development and demo purposes. Sync changes from `packages/` to this directory.
- `src/app`: The documentation and demo web application.

## 🚀 Skills & Tools
- **Three.js / R3F**: Expert-level shader and 3D scene implementation.
- **SVG Animations**: Mastery of clipPaths and complex SVG paths for masking.
- **FLIP Technique**: Proficient in coordinating transitions between different layout states.
- **Video Export**: Understanding of the `CanvasRenderer` and how it snapshots DOM/WebGL elements.
