'use client';

import React, { useState } from 'react';
import { Player } from '@/lib/remotion';
import { DemoComposition } from '@/lib/remotion/demo/DemoComposition';
import { DemoComposition2 } from '@/lib/remotion/demo/DemoComposition2';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Demo compositions configuration
const demoCompositions = [
  {
    id: 'main',
    name: 'Main Demo',
    description: 'Particles, charts, and animations',
    component: DemoComposition,
    durationInFrames: 330,
  },
  {
    id: 'effects',
    name: 'Effects Demo',
    description: 'Typewriter, counter, neon effects',
    component: DemoComposition2,
    durationInFrames: 540,
  },
];

// Code examples
const codeExamples = {
  basic: `import { AbsoluteFill, useCurrentFrame, interpolate } from 'motionforge';

const MyVideo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, fontSize: 72 }}>Hello World!</div>
    </AbsoluteFill>
  );
};`,

  sequence: `import { AbsoluteFill, Sequence, useCurrentFrame } from 'motionforge';

const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={30}>
        <TitleSlide />
      </Sequence>
      <Sequence from={30} durationInFrames={60}>
        <ContentSlide />
      </Sequence>
      <Sequence from={90} durationInFrames={30}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};`,

  animation: `import { spring, interpolate, Easing } from 'motionforge';

const AnimatedComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Spring animation
  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  
  // Interpolated animation
  const x = interpolate(frame, [0, 60], [0, 100], {
    easing: Easing.easeOutCubic,
  });
  
  return <div style={{ transform: \`scale(\${scale}) translateX(\${x}px)\` }} />;
};`,
};

const features = [
  {
    title: 'Composition',
    description: 'Define your video with dimensions, frame rate, and duration',
    icon: '🎬',
  },
  {
    title: 'Sequence',
    description: 'Organize your video into timed sequences and scenes',
    icon: '🎞️',
  },
  {
    title: 'Spring Animations',
    description: 'Natural physics-based animations with customizable damping',
    icon: '🌊',
  },
  {
    title: 'Interpolation',
    description: 'Smooth transitions between values with easing functions',
    icon: '📈',
  },
  {
    title: 'Timeline Player',
    description: 'Real-time preview with play, pause, and seek controls',
    icon: '▶️',
  },
  {
    title: 'Video Rendering',
    description: 'Export your compositions to MP4, WebM, or GIF',
    icon: '🎥',
  },
];

const easingFunctions = [
  'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
  'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
  'easeInElastic', 'easeOutElastic', 'easeInBounce',
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('player');
  const [activeDemo, setActiveDemo] = useState('main');

  const currentDemo = demoCompositions.find(d => d.id === activeDemo) || demoCompositions[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Animated background grid */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <header className="border-b border-emerald-900/50 backdrop-blur-sm bg-[#0a0a0a]/80 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  MotionForge
                </h1>
                <p className="text-xs text-emerald-600">Create videos with React</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-emerald-600 text-emerald-400 bg-emerald-950/50">
                v1.0.0
              </Badge>
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                Open Source
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#0f0f0f] border border-emerald-900/50">
            <TabsTrigger 
              value="player" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-emerald-400"
            >
              ▶️ Player
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-emerald-400"
            >
              ✨ Features
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-emerald-400"
            >
              📚 API
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-emerald-400"
            >
              💻 Examples
            </TabsTrigger>
          </TabsList>

          {/* Player Tab */}
          <TabsContent value="player" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Interactive Video Player
              </h2>
              <p className="text-emerald-600 max-w-2xl mx-auto">
                Preview your composition in real-time. Use keyboard shortcuts: 
                <span className="text-emerald-400 mx-1">Space</span> (play/pause), 
                <span className="text-emerald-400 mx-1">Arrow keys</span> (frame step)
              </p>
            </div>

            {/* Demo selector */}
            <div className="flex justify-center gap-3 mb-4">
              {demoCompositions.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeDemo === demo.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50'
                  }`}
                >
                  {demo.name}
                </button>
              ))}
            </div>

            {/* Player container with glow effect */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 rounded-2xl blur-xl" />
              <div className="relative bg-[#0f0f0f] rounded-xl border border-emerald-900/50 p-4">
                <Player
                  key={currentDemo.id}
                  component={currentDemo.component}
                  durationInFrames={currentDemo.durationInFrames}
                  fps={30}
                  width={1920}
                  height={1080}
                  controls
                  loop
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: '🎨', title: 'Animated Background', desc: 'Dynamic gradient that shifts colors over time' },
                { icon: '✨', title: 'Particle Effects', desc: '100 particles with spring-based physics' },
                { icon: '📊', title: 'Data Visualization', desc: 'Animated charts and waveform displays' },
              ].map((item, i) => (
                <Card key={i} className="bg-[#0f0f0f] border-emerald-900/50 p-5 hover:border-emerald-600/50 transition-all duration-300 group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-400">{item.title}</h3>
                  <p className="text-sm text-emerald-700">{item.desc}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Core Features
              </h2>
              <p className="text-emerald-600">
                Everything you need to create programmatic videos with React
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-[#0f0f0f] border-emerald-900/50 p-6 hover:border-emerald-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/20 group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-400">{feature.title}</h3>
                  <p className="text-sm text-emerald-700">{feature.description}</p>
                </Card>
              ))}
            </div>

            <Separator className="my-8 bg-emerald-900/50" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#0f0f0f] border-emerald-900/50 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-emerald-400">
                  <span>🌊</span> Spring Physics
                </h3>
                <div className="space-y-3 text-sm text-emerald-300">
                  <p>Spring animations provide natural, physics-based motion. Configure:</p>
                  <ul className="list-disc list-inside space-y-1 text-emerald-600">
                    <li><code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">damping</code> - Controls oscillation decay</li>
                    <li><code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">mass</code> - Affects animation weight</li>
                    <li><code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">stiffness</code> - Controls spring tension</li>
                    <li><code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">overshootClamping</code> - Prevents overshoot</li>
                  </ul>
                </div>
              </Card>

              <Card className="bg-[#0f0f0f] border-emerald-900/50 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-emerald-400">
                  <span>📈</span> Easing Functions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {easingFunctions.map((fn) => (
                    <Badge 
                      key={fn} 
                      variant="outline" 
                      className="border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                    >
                      {fn}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                API Reference
              </h2>
              <p className="text-emerald-600">
                Complete documentation for all components and hooks
              </p>
            </div>

            <ScrollArea className="h-[600px] rounded-lg border border-emerald-900/50 bg-[#0f0f0f] p-6">
              <div className="space-y-8">
                {/* Components */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-emerald-400">Components</h3>
                  <div className="space-y-4">
                    <ApiItem
                      name="AbsoluteFill"
                      description="Container component that fills the entire composition area"
                      props={[
                        { name: 'children', type: 'ReactNode', description: 'Child elements' },
                        { name: 'style', type: 'CSSProperties', description: 'Additional styles' },
                      ]}
                    />
                    <ApiItem
                      name="Sequence"
                      description="Renders children only during specified frame range"
                      props={[
                        { name: 'from', type: 'number', description: 'Starting frame' },
                        { name: 'durationInFrames', type: 'number', description: 'Duration in frames' },
                        { name: 'offset', type: 'number', description: 'Frame offset (default: 0)' },
                        { name: 'name', type: 'string', description: 'Sequence name for debugging' },
                        { name: 'children', type: 'ReactNode', description: 'Child elements' },
                      ]}
                    />
                    <ApiItem
                      name="Loop"
                      description="Loops content for specified number of times"
                      props={[
                        { name: 'durationInFrames', type: 'number', description: 'Loop duration' },
                        { name: 'times', type: 'number', description: 'Number of loops (default: Infinity)' },
                        { name: 'children', type: 'ReactNode', description: 'Child elements' },
                      ]}
                    />
                    <ApiItem
                      name="Video"
                      description="Video component for embedding video files"
                      props={[
                        { name: 'src', type: 'string', description: 'Video source URL' },
                        { name: 'startFrom', type: 'number', description: 'Start frame' },
                        { name: 'volume', type: 'number | function', description: 'Volume level' },
                        { name: 'muted', type: 'boolean', description: 'Mute audio' },
                      ]}
                    />
                  </div>
                </section>

                {/* Hooks */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-teal-400">Hooks</h3>
                  <div className="space-y-4">
                    <ApiItem
                      name="useCurrentFrame"
                      description="Returns the current frame number"
                      returns="number"
                    />
                    <ApiItem
                      name="useVideoConfig"
                      description="Returns video configuration object"
                      returns="{ fps, durationInFrames, width, height }"
                    />
                    <ApiItem
                      name="useSpring"
                      description="Creates spring-based animations"
                      props={[
                        { name: 'frame', type: 'number', description: 'Current frame' },
                        { name: 'fps', type: 'number', description: 'Frames per second' },
                        { name: 'config', type: 'object', description: 'Spring configuration' },
                        { name: 'from', type: 'number', description: 'Start value (default: 0)' },
                        { name: 'to', type: 'number', description: 'End value (default: 1)' },
                      ]}
                    />
                  </div>
                </section>

                {/* Animation Utilities */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-emerald-300">Animation Utilities</h3>
                  <div className="space-y-4">
                    <ApiItem
                      name="interpolate"
                      description="Interpolates a value from input range to output range"
                      props={[
                        { name: 'input', type: 'number', description: 'Input value' },
                        { name: 'inputRange', type: 'number[]', description: 'Input range' },
                        { name: 'outputRange', type: 'number[]', description: 'Output range' },
                        { name: 'options', type: 'object', description: 'Interpolation options' },
                      ]}
                    />
                    <ApiItem
                      name="spring"
                      description="Calculates spring animation value"
                      props={[
                        { name: 'frame', type: 'number', description: 'Current frame' },
                        { name: 'fps', type: 'number', description: 'Frames per second' },
                        { name: 'config', type: 'object', description: 'Spring configuration' },
                      ]}
                    />
                    <ApiItem
                      name="Easing"
                      description="Collection of easing functions"
                      props={easingFunctions.map(fn => ({
                        name: fn,
                        type: '(t: number) => number',
                        description: `${fn} easing function`,
                      }))}
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="code" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Code Examples
              </h2>
              <p className="text-emerald-600">
                Learn how to use MotionForge with practical examples
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#0f0f0f] border-emerald-900/50 overflow-hidden">
                <div className="bg-emerald-950/50 px-4 py-2 border-b border-emerald-900/50">
                  <h3 className="font-medium text-emerald-400">Basic Animation</h3>
                </div>
                <pre className="p-4 text-sm overflow-x-auto text-emerald-300">
                  <code>{codeExamples.basic}</code>
                </pre>
              </Card>

              <Card className="bg-[#0f0f0f] border-emerald-900/50 overflow-hidden">
                <div className="bg-emerald-950/50 px-4 py-2 border-b border-emerald-900/50">
                  <h3 className="font-medium text-teal-400">Sequences</h3>
                </div>
                <pre className="p-4 text-sm overflow-x-auto text-emerald-300">
                  <code>{codeExamples.sequence}</code>
                </pre>
              </Card>

              <Card className="bg-[#0f0f0f] border-emerald-900/50 overflow-hidden lg:col-span-2">
                <div className="bg-emerald-950/50 px-4 py-2 border-b border-emerald-900/50">
                  <h3 className="font-medium text-emerald-300">Advanced Animations</h3>
                </div>
                <pre className="p-4 text-sm overflow-x-auto text-emerald-300">
                  <code>{codeExamples.animation}</code>
                </pre>
              </Card>
            </div>

            <Separator className="my-8 bg-emerald-900/50" />

            <Card className="bg-gradient-to-r from-emerald-950/50 via-teal-950/50 to-emerald-950/50 border-emerald-900/50 p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-400">Pro Tips</h3>
                  <ul className="space-y-2 text-sm text-emerald-300">
                    <li>• Use <code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">Sequence</code> components to organize your video into scenes</li>
                    <li>• Combine <code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">spring</code> and <code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">interpolate</code> for complex animations</li>
                    <li>• Pre-calculate values outside of render for better performance</li>
                    <li>• Use <code className="text-emerald-400 bg-emerald-950/50 px-1 rounded">useVideoConfig</code> to make responsive compositions</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/50 mt-16 relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <div className="flex items-center gap-2">
              <span>Built with</span>
              <span className="text-emerald-400">❤</span>
              <span>using React & TypeScript</span>
            </div>
            <div className="flex items-center gap-4">
              <span>MotionForge Framework</span>
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                Open Source
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// API Item Component
const ApiItem: React.FC<{
  name: string;
  description: string;
  props?: { name: string; type: string; description: string }[];
  returns?: string;
}> = ({ name, description, props, returns }) => (
  <div className="bg-[#0a0a0a] rounded-lg p-4 border border-emerald-900/30">
    <div className="flex items-start justify-between mb-2">
      <code className="text-emerald-400 font-mono font-semibold">{name}</code>
      {returns && (
        <code className="text-teal-400 text-sm">→ {returns}</code>
      )}
    </div>
    <p className="text-sm text-emerald-600 mb-3">{description}</p>
    {props && props.length > 0 && (
      <div className="space-y-2">
        {props.map((prop, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <code className="text-emerald-300 min-w-[100px]">{prop.name}</code>
            <code className="text-teal-400">{prop.type}</code>
            <span className="text-emerald-700">- {prop.description}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
