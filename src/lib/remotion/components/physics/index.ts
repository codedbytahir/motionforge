/**
 * MotionForge Physics Components
 *
 * RapierJS integration for deterministic 3D physics simulation.
 * Built on top of @react-three/rapier and the Rapier WASM physics engine.
 */

// Core components
export { RapierWorld, default as RapierWorldDefault } from './RapierWorld';
export { RigidBody, default as RigidBodyDefault } from './RigidBody';
export { PhysicsScene, PhysicsDebug, default as PhysicsSceneDefault } from './PhysicsScene';

// Presets
export {
  BoxCollider,
  SphereCollider,
  CapsuleCollider,
  PhysicsPresets,
  default as PhysicsPresetsDefault,
} from './ColliderPresets';

// Hooks
export { usePhysicsRecorder } from './usePhysicsRecorder';

// Types
export type { PhysicsBodyProps } from './RigidBody';
export type { PhysicsSceneProps, PhysicsTransform } from './PhysicsScene';
export type { RecordedFrame, PhysicsRecorderOptions } from './usePhysicsRecorder';
