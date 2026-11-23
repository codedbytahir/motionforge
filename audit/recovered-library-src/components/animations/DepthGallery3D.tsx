'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, ScrollControls, Scroll, useScroll, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from '../../core/context';

interface DepthGallery3DProps {
  images: string[];
  durationInFrames?: number;
  startFrame?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Deterministic rendering driven by progress prop
const DeterministicScene = ({ images, progress }: { images: string[], progress: number }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {images.map((url, i) => {
        const z = -i * 10 + (progress * images.length * 10);
        const opacity = Math.max(0, 1 - Math.abs(z) / 15);

        if (opacity <= 0) return null;

        return (
          <group key={i} position={[Math.sin(i * 1.5) * 3, Math.cos(i * 0.8) * 2, z]}>
            <Image
              url={url}
              scale={[6, 4]}
              transparent
              opacity={opacity}
            />
            <Text
              position={[0, -2.5, 0.1]}
              fontSize={0.5}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Art Piece {i + 1}
            </Text>
          </group>
        );
      })}
      <fog attach="fog" args={['#000', 5, 20]} />
    </>
  );
};

export const DepthGallery3D: React.FC<DepthGallery3DProps> = ({
  images,
  durationInFrames = 300,
  startFrame = 0,
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, (frame - startFrame) / durationInFrames);

  return (
    <div className={className} style={{ width: '100%', height: '100%', backgroundColor: '#000', ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <DeterministicScene images={images} progress={progress} />
      </Canvas>
    </div>
  );
};
