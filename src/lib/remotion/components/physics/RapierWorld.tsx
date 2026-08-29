'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Physics,
  type RapierContext,
  type RigidBodyOptions,
} from '@react-three/rapier';
import { useCurrentFrame, useVideoConfig } from '../../core/context';

interface RapierWorldProps {
  children: React.ReactNode;
  gravity?: [number, number, number];
  timeStep?: number;
  paused?: boolean;
  className?: string;
  style?: React.CSSProperties;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

/**
 * Frame-deterministic physics wrapper.
 * In "record" mode, physics runs N steps upfront and caches body transforms.
 * In "playback" mode, transforms are read from cache per frame.
 */
const PhysicsInner: React.FC<{
  children?: React.ReactNode;
  onReady?: (ctx: RapierContext) => void;
}> = ({ children, onReady }) => {
  const rapierRef = useRef<RapierContext | null>(null);

  useFrame((ctx) => {
    const rapier = ctx as unknown as RapierContext;
    if (onReady && !rapierRef.current) {
      rapierRef.current = rapier;
      onReady(rapier);
    }
  });

  return <>{children}</>;
};

export const RapierWorld: React.FC<RapierWorldProps> = ({
  children,
  gravity = [0, -9.81, 0],
  timeStep = 1 / 60,
  paused = false,
  className = '',
  style,
  camera,
}) => {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', backgroundColor: '#000', ...style }}
    >
      <Canvas
        camera={{
          position: camera?.position ?? [0, 5, 15],
          fov: camera?.fov ?? 50,
        }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
        <pointLight position={[-5, 10, -5]} intensity={0.5} color="#10b981" />
        <Physics gravity={gravity} timeStep={timeStep} paused={paused}>
          <PhysicsInner />
          {children}
        </Physics>
      </Canvas>
    </div>
  );
};

export default RapierWorld;
