'use client';

import React from 'react';

/**
 * Pre-built collider shapes for quick physics object creation.
 * Use these inside RigidBody children.
 */

export interface BoxColliderProps {
  args?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const BoxCollider: React.FC<BoxColliderProps> = ({
  args = [1, 1, 1],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  return (
    <mesh position={position} rotation={rotation} visible={false}>
      <boxGeometry args={args} />
    </mesh>
  );
};

export interface SphereColliderProps {
  args?: [number];
  position?: [number, number, number];
}

export const SphereCollider: React.FC<SphereColliderProps> = ({
  args = [0.5],
  position = [0, 0, 0],
}) => {
  return (
    <mesh position={position} visible={false}>
      <sphereGeometry args={args} />
    </mesh>
  );
};

export interface CapsuleColliderProps {
  args?: [number, number];
  position?: [number, number, number];
}

export const CapsuleCollider: React.FC<CapsuleColliderProps> = ({
  args = [0.5, 0.5],
  position = [0, 0, 0],
}) => {
  return (
    <mesh position={position} visible={false}>
      <capsuleGeometry args={args} />
    </mesh>
  );
};

/** A collection of preset objects for demos */
export const PhysicsPresets = {
  /** A floor/ground plane */
  Ground: ({ size = 50 }: { size?: number }) => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
    </mesh>
  ),

  /** A bouncy ball */
  BouncyBall: ({
    position = [0, 5, 0],
    radius = 0.5,
    color = '#10b981',
  }: {
    position?: [number, number, number];
    radius?: number;
    color?: string;
  }) => (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  ),

  /** A falling box/cube */
  FallingBox: ({
    position = [0, 5, 0],
    size = 1,
    color = '#3b82f6',
    rotation = [0, 0, 0],
  }: {
    position?: [number, number, number];
    size?: number;
    color?: string;
    rotation?: [number, number, number];
  }) => (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
    </mesh>
  ),

  /** A capsule */
  Capsule: ({
    position = [0, 5, 0],
    color = '#f59e0b',
  }: {
    position?: [number, number, number];
    color?: string;
  }) => (
    <mesh position={position} castShadow>
      <capsuleGeometry args={[0.3, 1, 8, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  ),
};

export default PhysicsPresets;
