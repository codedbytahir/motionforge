'use client';

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Lottie,
  useCurrentFrame,
} from '../index';

// Simple rotating square Lottie JSON for local testing
const simpleLottie = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 30,
  "w": 100,
  "h": 100,
  "nm": "Simple Square",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 1,
      "nm": "Solid",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100, "ix": 11 },
        "r": { "a": 1, "k": [{ "t": 0, "s": [0] }, { "t": 30, "s": [360] }], "ix": 10 },
        "p": { "a": 0, "k": [50, 50, 0], "ix": 2 },
        "a": { "a": 0, "k": [50, 50, 0], "ix": 1 },
        "s": { "a": 0, "k": [100, 100, 100], "ix": 6 }
      },
      "ao": 0,
      "sw": 100,
      "sh": 100,
      "sc": "#10b981",
      "ip": 0,
      "op": 30,
      "st": 0,
      "bm": 0
    }
  ]
};

/**
 * Demo Composition showcasing Lottie integration in MotionForge.
 */
export const DemoLottie: React.FC = () => {
  const frame = useCurrentFrame();

  const backgroundHue = (frame * 0.5) % 360;

  return (
    <AbsoluteFill style={{ backgroundColor: `hsl(${backgroundHue}, 20%, 10%)`, overflow: 'hidden' }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 50,
        width: '100%',
        textAlign: 'center',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        <h1 style={{ fontSize: 64, margin: 0, fontWeight: 'bold' }}>Lottie Support</h1>
        <p style={{ fontSize: 24, opacity: 0.7, marginTop: 10 }}>Production-grade, deterministic animations</p>
      </div>

      {/* Main Lottie - Direct JSON */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 400, height: 400, background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20 }}>
            <Lottie
              src={simpleLottie}
              playbackRate={1}
              loop
            />
          </div>
          <div style={{ marginTop: 20, color: '#aaa', fontSize: 18 }}>Direct JSON (Rotating Square)</div>
        </AbsoluteFill>
      </Sequence>

      {/* Remote Lottie - 2x Speed */}
      <Sequence from={60} durationInFrames={120}>
        <div style={{ position: 'absolute', left: 150, top: '55%', transform: 'translateY(-50%)' }}>
          <div style={{ width: 250, height: 250 }}>
            <Lottie
              src="https://assets10.lottiefiles.com/packages/lf20_u4j3X6.json"
              playbackRate={2}
              loop
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, color: '#aaa', fontSize: 18 }}>Remote URL (2x Speed)</div>
        </div>
      </Sequence>

      {/* Sliced Lottie */}
      <Sequence from={90} durationInFrames={120}>
        <div style={{ position: 'absolute', right: 150, top: '55%', transform: 'translateY(-50%)' }}>
          <div style={{ width: 250, height: 250 }}>
            <Lottie
              src={simpleLottie}
              frameStart={10}
              frameEnd={20}
              loop
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, color: '#aaa', fontSize: 18 }}>Sliced (Frames 10-20)</div>
        </div>
      </Sequence>

      {/* Footer info */}
      <div style={{
        position: 'absolute',
        bottom: 50,
        width: '100%',
        textAlign: 'center',
        color: '#666',
        fontSize: 18,
        fontFamily: 'monospace'
      }}>
        MotionForge Frame: {frame} | Deterministic Rendering: Enabled
      </div>
    </AbsoluteFill>
  );
};

export default DemoLottie;
