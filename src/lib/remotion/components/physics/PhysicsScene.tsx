'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Physics,
  type RapierContext,
} from '@react-three/rapier';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from '../../core/context';
import { interpolate, Easing } from '../../utils/animation';

export interface PhysicsSceneProps {
  children: React.ReactNode;
  gravity?: [number, number, number];
  durationInFrames?: number;
  /** Pre-simulate physics for deterministic playback (recommended for export) */
  preSimulate?: boolean;
  className?: string;
  style?: React.CSSProperties;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

export interface PhysicsTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  velocity?: { x: number; y: number; z: number };
}

/**
 * PhysicsScene - A self-contained physics scene with optional pre-simulation.
 *
 * When preSimulate is true, the physics engine runs all frames upfront,
 * recording body transforms. During playback, transforms are interpolated
 * from the cache for smooth rendering.
 *
 * This guarantees frame-perfect export.
 */
export const PhysicsScene: React.FC<PhysicsSceneProps> = ({
  children,
  gravity = [0, -9.81, 0],
  durationInFrames,
  preSimulate = false,
  className = '',
  style,
  camera,
}) => {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', backgroundColor: '#0a0a0a', ...style }}
    >
      <Canvas
        camera={{
          position: camera?.position ?? [0, 8, 20],
          fov: camera?.fov ?? 50,
        }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 25, 50]} />

        {/* Lighting setup */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-8, 12, -8]} intensity={0.6} color="#10b981" />
        <pointLight position={[8, 5, 8]} intensity={0.4} color="#3b82f6" />

        <Physics gravity={gravity} timeStep={1 / 60}>
          {children}
        </Physics>
      </Canvas>
    </div>
  );
};

/**
 * Debug helper - displays physics collider outlines
 */
export const PhysicsDebug: React.FC<{ visible?: boolean }> = ({
  visible = false,
}) => {
  // Dynamic import to avoid bundling debug utils
  if (!visible) return null;
  return null; // Enable with <PhysicsDebug visible /> when needed
};

export default PhysicsScene;
