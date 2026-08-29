'use client';

import dynamic from 'next/dynamic';
import { AbsoluteFill } from '@/lib/remotion';

const Player = dynamic(() => import('@/lib/remotion/player/Player').then(m => m.Player), { ssr: false });
const DemoCinematicTypography = dynamic(() => import('@/lib/remotion/demo/DemoCinematicTypography').then(m => m.DemoCinematicTypography), { ssr: false });

export default function TypographyDemoPage() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Cinematic Typography Demo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Kinetic text animations, liquid fills, and 3D text stacking
          </p>
        </div>
        <Player
          component={DemoCinematicTypography}
          durationInFrames={390}
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
