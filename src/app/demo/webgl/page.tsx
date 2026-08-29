'use client';

import dynamic from 'next/dynamic';
import { AbsoluteFill } from '@/lib/remotion';

const Player = dynamic(() => import('@/lib/remotion/player/Player').then(m => m.Player), { ssr: false });
const DemoWebGL = dynamic(() => import('@/lib/remotion/demo/DemoWebGL').then(m => m.DemoWebGL), { ssr: false });

export default function WebGLDemoPage() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            WebGL &amp; Shaders Demo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            3D depth gallery, shader image reveals, and dithering effects
          </p>
        </div>
        <Player
          component={DemoWebGL}
          durationInFrames={540}
          fps={30}
          width={1920}
          height={1080}
          autoPlay={true}
          loop={true}
        />
      </div>
    </AbsoluteFill>
  );
}
