'use client';

import React, { useState } from 'react';
import { Player } from '@/lib/remotion';
import { DemoCinematicTypography } from '@/lib/remotion/demo/DemoCinematicTypography';
import { DemoWebGL } from '@/lib/remotion/demo/DemoWebGL';
import { DemoComposition } from '@/lib/remotion/demo/DemoComposition';
import {
  PlayIcon,
  SparkleIcon,
  LayersIcon,
  VideoIcon,
  ArrowRightIcon,
  ImageIcon,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

// Demo compositions configuration
const demoCompositions = [
  {
    id: 'cinematic-text',
    name: 'Cinematic Typography',
    description: 'Next-gen text animations',
    component: DemoCinematicTypography,
    durationInFrames: 390,
    color: '#10b981',
  },
  {
    id: 'webgl',
    name: 'WebGL & Shaders',
    description: 'Immersive 3D environments',
    component: DemoWebGL,
    durationInFrames: 540,
    color: '#3b82f6',
  },
  {
    id: 'particles',
    name: 'Classic Effects',
    description: 'Particles and motion graphics',
    component: DemoComposition,
    durationInFrames: 330,
    color: '#f59e0b',
  },
];

export default function Home() {
  const [activeDemo, setActiveDemo] = useState(demoCompositions[0].id);

  const currentDemo = demoCompositions.find(d => d.id === activeDemo) || demoCompositions[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <VideoIcon size={18} color="black" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Motion<span className="text-emerald-500">Forge</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demos" className="hover:text-white transition-colors">Demos</a>
            <a href="#docs" className="hover:text-white transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              GitHub
            </Button>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 border-emerald-500/20 text-emerald-400 py-1.5 px-4 bg-emerald-500/5">
                Introducing Cinematic Engine v2.0
              </Badge>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-none">
                BUILD CINEMATIC VIDEOS WITH REACT
              </h1>
              <p className="text-xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
                A high-performance framework for deterministic, frame-perfect video creation.
                Now with native WebGL effects and Kinetic Typography.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="h-14 px-8 bg-white text-black hover:bg-white/90 text-lg font-bold">
                  Start Building Free
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 text-lg font-medium">
                  Read Documentation
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Player Section */}
      <section id="demos" className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/3 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Interactive Showcase</h2>
              <p className="text-white/40">Explore our new suite of cinematic components. Every animation is deterministic and export-ready.</p>

              <div className="space-y-3">
                {demoCompositions.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                      activeDemo === demo.id
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeDemo === demo.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40'
                      }`}>
                        {demo.id === 'cinematic-text' ? <TypeIcon size={20} /> : demo.id === 'webgl' ? <BoxIcon size={20} /> : <ZapIcon size={20} />}
                      </div>
                      <div>
                        <h3 className={`font-bold ${activeDemo === demo.id ? 'text-emerald-400' : 'text-white'}`}>{demo.name}</h3>
                        <p className="text-xs text-white/40">{demo.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3 w-full">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
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

      {/* Features Grid */}
      <section id="features" className="py-32 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Engineered for Performance</h2>
            <p className="text-white/40 max-w-xl mx-auto">Modern tools for modern creators. Built on top of Next.js 15 and Tailwind CSS 4.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ZapIcon size={24} />}
              title="Deterministic Rendering"
              description="Frame-accurate rendering ensures what you see in the preview is exactly what you get in the final export."
            />
            <FeatureCard
              icon={<BoxIcon size={24} />}
              title="Native WebGL Support"
              description="Seamlessly integrate Three.js and custom shaders into your video compositions with automatic frame synchronization."
            />
            <FeatureCard
              icon={<TypeIcon size={24} />}
              title="Kinetic Typography"
              description="Advanced text animation engine with velocity-based staggering and fluid organic motion presets."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-6 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:opacity-100 transition-all duration-500">
          <span className="text-2xl font-bold">Next.js 15</span>
          <span className="text-2xl font-bold">React 19</span>
          <span className="text-2xl font-bold">Tailwind 4</span>
          <span className="text-2xl font-bold">Three.js</span>
          <span className="text-2xl font-bold">Framer Motion</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
              <VideoIcon size={14} color="white" />
            </div>
            <span className="font-bold">MotionForge</span>
          </div>
          <p className="text-white/20 text-sm">© 2025 MotionForge Team. Built by Jules.</p>
          <div className="flex gap-6">
            <HeartIcon size={18} className="text-emerald-500" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
