'use client';

import React from 'react';
import { AbsoluteFill, Sequence, LottieAnimation, Text } from '../index';
import sampleLottie from './sample-lottie.json';

export const LottieDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 48, color: '#10b981', marginBottom: 20 }}>Lottie Integration</h1>
        <p style={{ fontSize: 20, color: '#94a3b8' }}>
          Production-grade Lottie animations with frame-perfect synchronization.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 40, justifyContent: 'center' }}>
        {/* Basic Usage */}
        <div style={{ width: 300, textAlign: 'center' }}>
          <div style={{ height: 200, background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
            <LottieAnimation src={sampleLottie} />
          </div>
          <Text style={{ fontSize: 16 }}>Basic Playback</Text>
        </div>

        {/* Custom Start/End */}
        <div style={{ width: 300, textAlign: 'center' }}>
          <div style={{ height: 200, background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
            <LottieAnimation
              src={sampleLottie}
              frameStart={0}
              frameEnd={30}
              loop
            />
          </div>
          <Text style={{ fontSize: 16 }}>Partial Window (Looping)</Text>
        </div>

        {/* Playback Rate */}
        <div style={{ width: 300, textAlign: 'center' }}>
          <div style={{ height: 200, background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
            <LottieAnimation
              src={sampleLottie}
              playbackRate={0.5}
            />
          </div>
          <Text style={{ fontSize: 16 }}>Slow Motion (0.5x)</Text>
        </div>

        {/* Inside a Sequence */}
        <div style={{ width: 300, textAlign: 'center' }}>
          <Sequence from={60} durationInFrames={120}>
            <div style={{ height: 200, background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
              <LottieAnimation
                src={sampleLottie}
                loop
              />
            </div>
            <Text style={{ fontSize: 16 }}>Inside Sequence (Starts at frame 60)</Text>
          </Sequence>
        </div>
      </div>

      <AbsoluteFill style={{ pointerEvents: 'none', justifyContent: 'flex-end', padding: 40 }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: 20, alignSelf: 'center' }}>
          <Text style={{ color: '#10b981', fontWeight: 'bold' }}>Deterministic Rendering System</Text>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default LottieDemo;
