'use client';

import React, { forwardRef, useRef, useEffect } from 'react';
import {
  RigidBody as RapierRigidBody,
  type RigidBodyProps as RapierRigidBodyProps,
} from '@react-three/rapier';
import { useCurrentFrame, useVideoConfig } from '../../core/context';

export interface PhysicsBodyProps extends RapierRigidBodyProps {
  /** Optional label for debugging and recording */
  label?: string;
  /** Starting position */
  initialPosition?: [number, number, number];
  /** Starting rotation as euler angles */
  initialRotation?: [number, number, number];
}

/**
 * Enhanced RigidBody that integrates with MotionForge's frame system.
 * Wraps @react-three/rapier's RigidBody with additional frame-aware features.
 */
export const RigidBody = forwardRef<
  React.ComponentRef<typeof RapierRigidBody>,
  PhysicsBodyProps
>(({ label, initialPosition, initialRotation, children, ...props }, ref) => {
  const bodyRef = useRef<React.ComponentRef<typeof RapierRigidBody> | null>(null);

  // Set initial transform if provided
  useEffect(() => {
    if (bodyRef.current) {
      if (initialPosition) {
        bodyRef.current.setTranslation(
          { x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] },
          true
        );
      }
      if (initialRotation) {
        // Convert euler degrees to radians for rapier
        const rad = initialRotation.map((d) => (d * Math.PI) / 180);
        bodyRef.current.setRotation(
          { x: rad[0], y: rad[1], z: rad[2], w: 1 },
          true
        );
      }
    }
  }, [initialPosition, initialRotation]);

  return (
    <RapierRigidBody
      ref={(instance) => {
        (bodyRef as React.MutableRefObject<any>).current = instance;
        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref) {
          (ref as React.MutableRefObject<any>).current = instance;
        }
      }}
      {...props}
    >
      {children}
    </RapierRigidBody>
  );
});

RigidBody.displayName = 'RigidBody';

export default RigidBody;
