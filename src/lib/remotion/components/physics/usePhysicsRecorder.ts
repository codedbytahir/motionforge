'use client';

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RapierContext } from '@react-three/rapier';
import { useCurrentFrame, useVideoConfig } from '../../core/context';

export interface RecordedFrame {
  frame: number;
  bodies: Map<string, {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
  }>;
}

export interface PhysicsRecorderOptions {
  /** Whether recording is active */
  enabled?: boolean;
  /** Callback when a frame is recorded */
  onFrameRecorded?: (frame: number) => void;
}

/**
 * Records physics body transforms for each frame.
 * Useful for deterministic playback and export.
 *
 * Usage:
 * ```tsx
 * const { getRecordedFrames, clearRecording } = usePhysicsRecorder({ enabled: isRecording });
 * // After simulation completes:
 * const frames = getRecordedFrames();
 * ```
 */
export function usePhysicsRecorder(options: PhysicsRecorderOptions = {}) {
  const { enabled = false, onFrameRecorded } = options;
  const frame = useCurrentFrame();
  const framesRef = useRef<Map<number, Map<string, {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
  }>>>(new Map());

  const recordFrame = useCallback(
    (rapierCtx: RapierContext) => {
      if (!enabled) return;

      const world = rapierCtx.world;
      const bodies = new Map<string, {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number; w: number };
      }>();

      // Iterate through all rigid bodies and record their transforms
      // Note: This requires the bodies to have been tagged with identifiers
      // In a production implementation, we'd maintain a registry of tracked bodies
      const bodyMap = (rapierCtx as any).bodies;
      if (bodyMap) {
        bodyMap.forEach((body: any, handle: number) => {
          const translation = body.translation();
          const rotation = body.rotation();
          bodies.set(String(handle), {
            position: { x: translation.x, y: translation.y, z: translation.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
          });
        });
      }

      framesRef.current.set(frame, bodies);
      onFrameRecorded?.(frame);
    },
    [enabled, frame, onFrameRecorded]
  );

  const getRecordedFrames = useCallback(() => {
    return framesRef.current;
  }, []);

  const getTransformAtFrame = useCallback(
    (targetFrame: number) => {
      return framesRef.current.get(targetFrame) || new Map();
    },
    []
  );

  const clearRecording = useCallback(() => {
    framesRef.current.clear();
  }, []);

  return {
    recordFrame,
    getRecordedFrames,
    getTransformAtFrame,
    clearRecording,
    totalFramesRecorded: framesRef.current.size,
  };
}

export default usePhysicsRecorder;
