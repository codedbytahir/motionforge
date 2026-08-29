'use client';

import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RigidBody, Physics, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from '../core/context';
import { interpolate, Easing } from '../utils/animation';
import { AbsoluteFill } from '../index';

/* ──────────── Helper: animated floor grid ──────────── */
const FloorGrid: React.FC = () => {
  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0f0f1a" roughness={0.9} />
      </mesh>
      <gridHelper
        args={[60, 60, '#1a3a2a', '#0d1f16']}
        position={[0, 0.01, 0]}
      />
    </group>
  );
};

/* ──────────── Scene 1: Falling Shapes ──────────── */
const FallingShapesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shapes = useMemo(() => {
    const items: Array<{ position: [number, number, number]; size: number; color: string; rotation: [number, number, number]; shape: number; delay: number }> = [];
    for (let i = 0; i < 12; i++) {
      const delay = i * 3;
      items.push({
        position: [
          (Math.random() - 0.5) * 12,
          8 + i * 2,
          (Math.random() - 0.5) * 8,
        ] as [number, number, number],
        size: 0.4 + Math.random() * 0.6,
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        shape: i % 3, // 0=box, 1=sphere, 2=capsule
        delay,
      });
    }
    return items;
  }, []);

  return (
    <>
      <FloorGrid />
      {shapes.map((shape, i) => (
        <RigidBody
          key={i}
          position={shape.position}
          rotation={shape.rotation}
          colliders="hull"
          mass={1 + shape.size}
          restitution={0.6}
          friction={0.3}
        >
          {shape.shape === 0 && (
            <mesh castShadow>
              <boxGeometry args={[shape.size, shape.size, shape.size]} />
              <meshStandardMaterial
                color={shape.color}
                roughness={0.3}
                metalness={0.2}
                emissive={shape.color}
                emissiveIntensity={0.1}
              />
            </mesh>
          )}
          {shape.shape === 1 && (
            <mesh castShadow>
              <sphereGeometry args={[shape.size / 2, 24, 24]} />
              <meshStandardMaterial
                color={shape.color}
                roughness={0.2}
                metalness={0.4}
                emissive={shape.color}
                emissiveIntensity={0.15}
              />
            </mesh>
          )}
          {shape.shape === 2 && (
            <mesh castShadow>
              <capsuleGeometry args={[shape.size / 3, shape.size / 2, 8, 16]} />
              <meshStandardMaterial
                color={shape.color}
                roughness={0.35}
                metalness={0.15}
                emissive={shape.color}
                emissiveIntensity={0.1}
              />
            </mesh>
          )}
        </RigidBody>
      ))}

      {/* Ground collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[30, 0.5, 30]} position={[0, -0.5, 0]} />
      </RigidBody>

      {/* Back wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[30, 5, 0.5]} position={[0, 5, -10]} />
      </RigidBody>
    </>
  );
};

/* ──────────── Scene 2: Newton's Cradle ──────────── */
const NewtonCradle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const NUM_BALLS = 5;
  const SPACING = 1.0;
  const STRING_LENGTH = 4;
  const BALL_RADIUS = 0.4;

  return (
    <>
      <FloorGrid />

      {/* Support bar */}
      <mesh position={[0, STRING_LENGTH + 1.5, 0]} castShadow>
        <boxGeometry args={[NUM_BALLS * SPACING + 2, 0.2, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pendulum balls */}
      {Array.from({ length: NUM_BALLS }).map((_, i) => {
        const x = (i - (NUM_BALLS - 1) / 2) * SPACING;
        // The leftmost ball swings in
        const isLeftBall = i === 0;
        const swingAngle = isLeftBall
          ? interpolate(
              frame % (fps * 2),
              [0, fps * 0.5, fps, fps * 1.5, fps * 2],
              [0.6, 0, 0, 0, 0.6],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            )
          : 0;

        return (
          <RigidBody
            key={i}
            position={[x + swingAngle * STRING_LENGTH, STRING_LENGTH - 0.5, 0]}
            colliders="ball"
            mass={1}
            restitution={0.99}
            friction={0}
            linearDamping={0}
            angularDamping={0}
          >
            <group>
              {/* String visual */}
              <mesh position={[0, STRING_LENGTH / 2 + 0.5, 0]}>
                <cylinderGeometry args={[0.02, 0.02, STRING_LENGTH]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              {/* Ball */}
              <mesh castShadow>
                <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
                <meshStandardMaterial
                  color="#10b981"
                  metalness={0.9}
                  roughness={0.1}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          </RigidBody>
        );
      })}

      {/* Ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[30, 0.5, 30]} position={[0, -0.5, 0]} />
      </RigidBody>
    </>
  );
};

/* ──────────── Scene 3: Stacking Tower ──────────── */
const StackingTower: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const NUM_LAYERS = 8;
  const BLOCK_SIZE = 1.2;

  return (
    <>
      <FloorGrid />

      {Array.from({ length: NUM_LAYERS }).map((_, i) => {
        const isEven = i % 2 === 0;
        return (
          <RigidBody
            key={i}
            position={[0, BLOCK_SIZE * i + BLOCK_SIZE / 2 + 0.1, 0]}
            rotation={[0, isEven ? 0 : Math.PI / 2, 0]}
            colliders="hull"
            mass={2}
            restitution={0.3}
            friction={0.8}
          >
            <mesh castShadow>
              <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE * 0.3, BLOCK_SIZE]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#10b981' : '#0d9668'}
                roughness={0.4}
                metalness={0.15}
                emissive={i % 2 === 0 ? '#10b981' : '#0d9668'}
                emissiveIntensity={0.05}
              />
            </mesh>
          </RigidBody>
        );
      })}

      {/* Ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[30, 0.5, 30]} position={[0, -0.5, 0]} />
      </RigidBody>
    </>
  );
};

/* ──────────── Scene 4: Physics Explosion ──────────── */
const PhysicsExplosion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const explosionFrame = fps * 2; // Explode after 2 seconds

  const objects = useMemo(() => {
    const items: Array<{ restPosition: [number, number, number]; color: string; size: number }> = [];
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      const radius = 1 + Math.random() * 0.5;
      items.push({
        restPosition: [
          Math.cos(angle) * radius,
          0.5 + Math.random() * 4,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 4],
        size: 0.3 + Math.random() * 0.4,
      });
    }
    return items;
  }, []);

  return (
    <>
      <FloorGrid />

      {objects.map((obj, i) => (
        <RigidBody
          key={i}
          position={obj.restPosition}
          colliders="hull"
          mass={0.5 + Math.random()}
          restitution={0.7}
          friction={0.4}
        >
          <mesh castShadow>
            <boxGeometry args={[obj.size, obj.size, obj.size]} />
            <meshStandardMaterial
              color={obj.color}
              roughness={0.3}
              metalness={0.3}
              emissive={obj.color}
              emissiveIntensity={0.2}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[30, 0.5, 30]} position={[0, -0.5, 0]} />
      </RigidBody>

      {/* Glowing center sphere (the "explosion origin") */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={2}
          transparent
          opacity={frame < explosionFrame ? 1 : Math.max(0, 1 - (frame - explosionFrame) / 30)}
        />
      </mesh>
    </>
  );
};

/* ──────────── Camera Animation ──────────── */
const AnimatedCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { camera } = useThree();

  const progress = frame / durationInFrames;

  // Smooth orbiting camera
  const angle = progress * Math.PI * 2;
  const radius = interpolate(progress, [0, 0.25, 0.5, 0.75, 1], [20, 15, 18, 12, 20]);
  const height = interpolate(progress, [0, 0.5, 1], [8, 12, 8]);

  useFrame(() => {
    camera.position.set(
      Math.sin(angle) * radius,
      height,
      Math.cos(angle) * radius
    );
    camera.lookAt(0, 2, 0);
  });

  return null;
};

/**
 * Scene sequencer — renders the appropriate scene based on the current frame.
 * Uses frame-based conditionals instead of Sequence (which renders <div> elements
 * that are incompatible inside R3F's <Canvas>).
 */
const SceneSequencer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sceneDuration = Math.floor(durationInFrames / 4);

  if (frame < sceneDuration) {
    return <FallingShapesScene />;
  }
  if (frame < sceneDuration * 2) {
    return <NewtonCradle />;
  }
  if (frame < sceneDuration * 3) {
    return <StackingTower />;
  }
  return <PhysicsExplosion />;
};

/* ──────────── Main Demo Composition ──────────── */
export const DemoPhysics: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <Canvas camera={{ position: [0, 8, 20], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
        <fog attach="fog" args={['#0a0a0a', 25, 50]} />
        <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60}>
          <AnimatedCamera />
          <SceneSequencer />
        </Physics>
      </Canvas>
    </AbsoluteFill>
  );
};

export default DemoPhysics;
