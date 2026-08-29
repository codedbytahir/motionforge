'use client';

import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';

const FallingBall = ({ index }: { index: number }) => {
  const color = useMemo(() => ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5], [index]);
  const position = useMemo(
    () => [(index - 2) * 2.5, 8 + index * 2, ((index * 7 + 3) % 10 - 5) * 0.6] as [number, number, number],
    [index],
  );

  return (
    <RigidBody position={position} colliders="ball" restitution={0.6} mass={0.8}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
    </RigidBody>
  );
};

export default function HeroPhysicsScene() {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0, 6, 18], fov: 45 }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} />
      <pointLight position={[-5, 10, -5]} intensity={0.8} color="#10b981" />
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#3b82f6" />
      <fog attach="fog" args={['#0a0a0a', 15, 35]} />

      <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60}>
        {Array.from({ length: 8 }).map((_, i) => (
          <FallingBall key={i} index={i} />
        ))}

        {/* Ground */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[20, 0.5, 20]} position={[0, -1, 0]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.9} transparent opacity={0.8} />
          </mesh>
        </RigidBody>

        {/* Back wall */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[20, 10, 0.5]} position={[0, 5, -8]} />
        </RigidBody>
      </Physics>
    </Canvas>
  );
}
