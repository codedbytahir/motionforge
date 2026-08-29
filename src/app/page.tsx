'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Player } from '@/lib/remotion';
import { DemoCinematicTypography } from '@/lib/remotion/demo/DemoCinematicTypography';
const DemoWebGL = dynamic(() => import('@/lib/remotion/demo/DemoWebGL').then(m => ({ default: m.DemoWebGL })), { ssr: false });
const DemoComposition = dynamic(() => import('@/lib/remotion/demo/DemoComposition').then(m => ({ default: m.DemoComposition })), { ssr: false });
import {
  PlayIcon,
  SparkleIcon,
  LayersIcon,
  VideoIcon,
  ArrowRightIcon,
  CameraIcon,
  ClockIcon,
  SettingsIcon,
  HeartIcon,
  ZapIcon,
  BoxIcon,
  TypeIcon,
} from '@/lib/remotion/icons';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the physics demo
const DemoPhysics = dynamic(
  () => import('@/lib/remotion/demo/DemoPhysics'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);



// Demo compositions configuration
const demoCompositions = [
  {
    id: 'cinematic-text',
    name: 'Cinematic Typography',
    description: 'Next-gen text animations with velocity-based staggering',
    component: DemoCinematicTypography,
    durationInFrames: 390,
    color: '#10b981',
    icon: <TypeIcon size={20} />,
  },
  {
    id: 'webgl',
    name: 'WebGL & Shaders',
    description: 'Immersive 3D environments with custom shaders',
    component: DemoWebGL,
    durationInFrames: 540,
    color: '#3b82f6',
    icon: <BoxIcon size={20} />,
  },
  {
    id: 'physics',
    name: 'RapierJS Physics',
    description: 'Real-time 3D physics simulation — falling, bouncing, colliding',
    component: DemoPhysics,
    durationInFrames: 600,
    color: '#8b5cf6',
    icon: <ZapIcon size={20} />,
  },
  {
    id: 'particles',
    name: 'Particle Effects',
    description: 'Dynamic particle systems and motion graphics',
    component: DemoComposition,
    durationInFrames: 330,
    color: '#f59e0b',
    icon: <SparkleIcon size={20} />,
  },
];

const features = [
  {
    icon: <ZapIcon size={24} />,
    title: 'Deterministic Rendering',
    description:
      'Frame-accurate rendering with useCurrentFrame() — what you see in preview is exactly what you get in export. No surprises.',
    color: '#10b981',
  },
  {
    icon: <BoxIcon size={24} />,
    title: 'Native WebGL & Three.js',
    description:
      'Seamlessly integrate Three.js, R3F, custom shaders, and now RapierJS physics into your video compositions.',
    color: '#3b82f6',
  },
  {
    icon: <TypeIcon size={24} />,
    title: 'Kinetic Typography',
    description:
      'Advanced text animation engine with velocity-based staggering, liquid morphs, and organic motion presets.',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
    ),
    title: 'RapierJS Physics',
    description:
      'Real-time and pre-recorded 3D physics. Gravity, collisions, constraints — all frame-perfect and export-ready.',
    color: '#8b5cf6',
  },
  {
    icon: <VideoIcon size={24} />,
    title: 'Forge Studio',
    description:
      'Browser-based code editor with live preview. Write TSX, see results instantly. Templates for common patterns.',
    color: '#ec4899',
  },
  {
    icon: <SparkleIcon size={24} />,
    title: 'AI Agent Ready',
    description:
      'Built for the age of AI. Agents can generate compositions, control physics, and render videos autonomously.',
    color: '#06b6d4',
  },
];

const techStack = [
  { name: 'Next.js 16', color: '#fff' },
  { name: 'React 19', color: '#61dafb' },
  { name: 'Three.js', color: '#049ef4' },
  { name: 'RapierJS', color: '#10b981' },
  { name: 'Tailwind 4', color: '#38bdf8' },
  { name: 'Framer Motion', color: '#f59e0b' },
  { name: 'Monaco Editor', color: '#007acc' },
  { name: 'TypeScript', color: '#3178c6' },
];

export default function Home() {
  const [activeDemo, setActiveDemo] = useState(demoCompositions[0].id);
  const currentDemo = demoCompositions.find((d) => d.id === activeDemo) || demoCompositions[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ═══════════════════════ DYNAMIC AMBIENT BACKGROUND ═══════════════════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/8 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ═══════════════════════ NAVIGATION ═══════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <VideoIcon size={18} color="black" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Motion<span className="text-emerald-500">Forge</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#physics" className="hover:text-white transition-colors">
              Physics
            </a>
            <a href="#demos" className="hover:text-white transition-colors">
              Demos
            </a>
            <a href="#tech" className="hover:text-white transition-colors">
              Tech
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/codedbytahir/motionforge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </a>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 shadow-[0_0_20px_rgba(16,185,129,0.2)] gap-1.5"
              onClick={() => (window.location.href = '/editor')}
            >
              Open Studio
              <ArrowRightIcon size={14} />
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Hero Animated Gradient Background */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Badge
                variant="outline"
                className="mb-6 border-emerald-500/20 text-emerald-400 py-1.5 px-4 bg-emerald-500/5 text-xs"
              >
                <SparkleIcon size={12} className="mr-1.5" />
                Now with RapierJS 3D Physics Engine
              </Badge>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  BUILD
                </span>
                <br />
                <span className="bg-gradient-to-b from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  CINEMATIC
                </span>
                <br />
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  VIDEOS
                </span>
              </h1>

              <p className="text-lg text-white/40 mb-10 max-w-lg leading-relaxed">
                The open-source, agent-first video framework for React. Create deterministic, 
                frame-perfect videos with WebGL, physics, and kinetic typography — all in code.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] gap-2"
                  onClick={() => (window.location.href = '/editor')}
                >
                  Start Building Free
                  <ArrowRightIcon size={18} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 border-white/10 hover:bg-white/5 text-lg font-medium"
                  onClick={() => document.getElementById('demos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <PlayIcon size={18} className="mr-2" />
                  Watch Demos
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/5">
                <div>
                  <div className="text-2xl font-bold text-white">70+</div>
                  <div className="text-xs text-white/30">Components</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">MIT</div>
                  <div className="text-xs text-white/30">License</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">∞</div>
                  <div className="text-xs text-white/30">Free Forever</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PHYSICS SHOWCASE ═══════════════════════ */}
      <section id="physics" className="py-32 border-t border-white/5 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              className="lg:w-1/2 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge
                variant="outline"
                className="border-purple-500/20 text-purple-400 py-1 px-3 bg-purple-500/5 text-xs w-fit"
              >
                New in v2.0
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Real Physics.
                <br />
                <span className="text-purple-400">Real-time & Deterministic.</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed">
                RapierJS brings production-grade 3D physics to MotionForge. Simulate gravity, collisions, 
                constraints, and rigid bodies — then replay them frame-by-frame for perfect export. 
                From robotic simulations to cinematic object interactions.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  'WASM-powered Rust physics engine — blazing fast',
                  'Pre-simulation mode for deterministic export',
                  'Seamless @react-three/rapier integration',
                  'Frame-perfect recording and playback',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                    </div>
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Physics Demo */}
            <motion.div
              className="lg:w-1/2 w-full"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <Player
                    component={DemoPhysics}
                    durationInFrames={600}
                    fps={30}
                    width={1920}
                    height={1080}
                    controls
                    loop
                    style={{ width: '100%', height: '100%' }}
                  />
                </Suspense>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES GRID ═══════════════════════ */}
      <section id="features" className="py-32 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Engineered for{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Performance
              </span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">
              Modern tools for modern creators. Built on the latest web stack for maximum flexibility and speed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: feature.color + '15',
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ EDITOR PREVIEW ═══════════════════════ */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-pink-500/20 text-pink-400 py-1 px-3 bg-pink-500/5 text-xs"
            >
              Forge Studio
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Write Code.
              <br />
              <span className="text-pink-400">See Results Instantly.</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">
              Browser-based code editor with live preview. Write TSX, see your composition update in real-time.
              Export to WebM with one click.
            </p>
          </motion.div>

          {/* Editor Screenshot Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0d0d] border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-black">MF</span>
                  </div>
                  <span className="text-xs font-medium text-white/50">Forge Studio</span>
                  <span className="text-[10px] text-white/20">|</span>
                  <span className="text-[10px] text-emerald-500">Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded">
                    1/300
                  </span>
                  <span className="text-[10px] text-emerald-400">✓ Ready</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-medium">
                    Export
                  </span>
                </div>
              </div>

              {/* Split Pane Mockup */}
              <div className="flex h-[400px]">
                {/* Code Side - Simulated code lines */}
                <div className="w-1/2 border-r border-white/5 p-5 font-mono text-[11px] leading-[18px] overflow-hidden bg-[#0a0a0a]">
                  {[
                    { indent: 0, color: 'text-emerald-400', text: "'use client'" },
                    { indent: 0, color: '', text: '' },
                    { indent: 0, color: 'text-purple-400', text: 'import', suffix: <><span className="text-white">AbsoluteFill</span>, <span className="text-white">useCurrentFrame</span>, <span className="text-white">interpolate</span> <span className="text-purple-400">from</span> <span className="text-amber-400">'motionforge'</span>;</> },
                    { indent: 0, color: 'text-purple-400', text: 'export default function ', suffix: <><span className="text-emerald-400">MyComposition</span>() {'{'}</> },
                    { indent: 2, color: 'text-purple-400', text: 'const ', suffix: <>frame = <span className="text-emerald-400">useCurrentFrame</span>();</> },
                    { indent: 2, color: 'text-purple-400', text: 'const ', suffix: <>opacity = <span className="text-emerald-400">interpolate</span>(</> },
                    { indent: 4, color: 'text-white/40', text: 'frame, [0, 30], [0, 1]' },
                    { indent: 2, color: 'text-white/60', text: ');' },
                    { indent: 2, color: 'text-purple-400', text: 'return (' },
                    { indent: 4, color: 'text-blue-400', text: '<AbsoluteFill', suffix: <> style={'{'}backgroundColor: <span className="text-amber-400">'#0a0a0a'</span>{'}'}{'>'}</> },
                    { indent: 6, color: 'text-blue-400', text: '<h1', suffix: <>{' '}style={'{'}{'{'} opacity {'}'}{'}'}{'>'}</> },
                    { indent: 8, color: 'text-white/60', text: 'Hello, MotionForge' },
                    { indent: 6, color: 'text-blue-400', text: '</h1>' },
                    { indent: 4, color: 'text-blue-400', text: '</AbsoluteFill>' },
                    { indent: 2, color: 'text-white/60', text: ');' },
                    { indent: 0, color: 'text-emerald-400', text: '}' },
                  ].map((line, i) => (
                    <div key={i} className={line.color}>
                      {line.indent > 0 && <span>{' '.repeat(line.indent)}</span>}
                      {line.text}{line.suffix}
                    </div>
                  ))}
                </div>

                {/* Preview Side */}
                <div className="w-1/2 flex items-center justify-center bg-black p-4">
                  <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 flex items-center justify-center bg-[#0a0a0a]">
                    <div className="text-center">
                      <div
                        className="text-5xl font-black text-white mb-2"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Hello, MotionForge
                      </div>
                      <div className="text-xs text-white/30 font-mono">Live Preview</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-4 py-2.5 bg-[#0d0d0d] border-t border-white/5">
                <div className="h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold gap-2"
                onClick={() => (window.location.href = '/editor')}
              >
                Open Forge Studio
                <ArrowRightIcon size={16} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ DEMO SHOWCASE ═══════════════════════ */}
      <section id="demos" className="py-32 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              See What's{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Possible
              </span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">
              Every animation is deterministic, frame-perfect, and export-ready. Click any demo to see it in action.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Demo Selector */}
            <div className="lg:w-1/3 space-y-3">
              {demoCompositions.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                    activeDemo === demo.id
                      ? 'bg-white/[0.05] border-white/10'
                      : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activeDemo === demo.id ? 'text-white' : 'text-white/30 group-hover:text-white/50'
                      }`}
                      style={{
                        backgroundColor:
                          activeDemo === demo.id ? demo.color + '20' : 'transparent',
                        color: activeDemo === demo.id ? demo.color : undefined,
                      }}
                    >
                      {demo.icon}
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm transition-colors ${
                          activeDemo === demo.id ? 'text-white' : 'text-white/60'
                        }`}
                      >
                        {demo.name}
                      </h3>
                      <p className="text-xs text-white/30">{demo.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Player */}
            <div className="lg:w-2/3 w-full">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <Player
                  key={currentDemo.id}
                  component={currentDemo.component}
                  durationInFrames={currentDemo.durationInFrames}
                  fps={30}
                  width={1920}
                  height={1080}
                  controls
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TECH STACK ═══════════════════════ */}
      <section id="tech" className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-white/30 uppercase tracking-widest mb-4">Built on the best</p>
          </motion.div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 opacity-30 hover:opacity-80 transition-opacity duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 0.3, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tech.color }}
                />
                <span className="text-lg font-bold" style={{ color: tech.color }}>
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA SECTION ═══════════════════════ */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Forge?
              </span>
            </h2>
            <p className="text-xl text-white/30 mb-10 max-w-lg mx-auto">
              Start creating cinematic videos with React. No credit card. No limits. Just code.
            </p>
            <Button
              size="lg"
              className="h-16 px-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] gap-2"
              onClick={() => (window.location.href = '/editor')}
            >
              Open Forge Studio
              <ArrowRightIcon size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="py-16 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <VideoIcon size={16} color="black" />
              </div>
              <span className="text-lg font-bold">
                Motion<span className="text-emerald-500">Forge</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex gap-8 text-sm text-white/30">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#demos" className="hover:text-white transition-colors">
                Demos
              </a>
              <a href="https://github.com/codedbytahir/motionforge" className="hover:text-white transition-colors">
                GitHub
              </a>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-white/20">
              <span>© 2025 MotionForge Team</span>
              <HeartIcon size={14} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
