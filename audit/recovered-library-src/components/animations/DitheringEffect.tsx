'use client';

import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useCurrentFrame } from '../../core/context';
import * as THREE from 'three';

interface DitheringEffectProps {
  src: string;
  intensity?: number;
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
  uniform float uIntensity;
  varying vec2 vUv;

  float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    float brightness = luma(texColor.rgb);

    // Bayer Matrix 4x4
    float bayer[16];
    bayer[0] = 0.0/16.0; bayer[1] = 8.0/16.0; bayer[2] = 2.0/16.0; bayer[3] = 10.0/16.0;
    bayer[4] = 12.0/16.0; bayer[5] = 4.0/16.0; bayer[6] = 14.0/16.0; bayer[7] = 6.0/16.0;
    bayer[8] = 3.0/16.0; bayer[9] = 11.0/16.0; bayer[10] = 1.0/16.0; bayer[11] = 9.0/16.0;
    bayer[12] = 15.0/16.0; bayer[13] = 7.0/16.0; bayer[14] = 13.0/16.0; bayer[15] = 5.0/16.0;

    int x = int(mod(gl_FragCoord.x, 4.0));
    int y = int(mod(gl_FragCoord.y, 4.0));
    float threshold = bayer[y * 4 + x];

    float final = brightness > (threshold * uIntensity) ? 1.0 : 0.0;

    gl_FragColor = vec4(vec3(final), texColor.a);
  }
`;

const DitheringPlane = ({ src, intensity }: { src: string, intensity: number }) => {
  const texture = useTexture(src);
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uIntensity: { value: intensity }
  }), [texture, intensity]);

  uniforms.uIntensity.value = intensity;

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export const DitheringEffect: React.FC<DitheringEffectProps> = ({
  src,
  intensity = 1.0,
  className = '',
  style,
}) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas orthographic camera={{ zoom: 100 }}>
        <Suspense fallback={null}>
          <DitheringPlane src={src} intensity={intensity} />
        </Suspense>
      </Canvas>
    </div>
  );
};
