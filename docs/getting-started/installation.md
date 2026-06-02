# Installation

To get started with MotionForge, you can either bootstrap a new project using our CLI or install the core library into an existing React/Next.js project.

## 🚀 Bootstrap a New Project

The easiest way to start is using `create-motionforge`:

```bash
npx create-motionforge@latest my-video
```

This will create a new directory `my-video` with a complete Next.js project structure, including:
- Pre-configured `Composition.tsx`
- Tailwind CSS 4 setup
- MotionForge development server
- Example animations

## 📦 Manual Installation

If you want to add MotionForge to an existing project:

```bash
npm install motionforge
```

### Peer Dependencies

MotionForge requires the following peer dependencies:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei framer-motion
```

### TypeScript Setup

Make sure your `tsconfig.json` includes `react-jsx`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

## 🎥 Production Rendering

For server-side rendering, you'll also need the renderer:

```bash
npm install @motionforge/renderer
```

And ensure **FFmpeg** is installed on your system:
- **macOS**: `brew install ffmpeg`
- **Ubuntu**: `sudo apt install ffmpeg`
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
