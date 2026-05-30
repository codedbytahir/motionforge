'use client';

import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useCurrentFrame } from '../../core/context';
import * as THREE from 'three';

interface ShaderImageRevealProps {
  src: string;
  durationInFrames?: number;
  startFrame?: number;
  className?: string;
  style?: React.CSSProperties;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uProgress;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float n = noise(vUv * 10.0);
    float threshold = uProgress * 1.2;
    float alpha = smoothstep(threshold - 0.1, threshold, n);

    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = vec4(color.rgb, color.a * (1.0 - alpha));
  }
`;

const RevealPlane = ({ src, progress }: { src: string, progress: number }) => {
  const texture = useTexture(src);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uProgress: { value: progress }
  }), [texture]);

  uniforms.uProgress.value = progress;

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial
        transparent
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export const ShaderImageReveal: React.FC<ShaderImageRevealProps> = ({
  src,
  durationInFrames = 60,
  startFrame = 0,
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, Math.min(1, (frame - startFrame) / durationInFrames));

  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas orthographic camera={{ zoom: 100 }}>
        <Suspense fallback={null}>
          <RevealPlane src={src} progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
};
