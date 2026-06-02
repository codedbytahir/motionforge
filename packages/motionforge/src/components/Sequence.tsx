'use client';

import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useCurrentFrame } from '../core/context';

// Sequence Context
interface SequenceContextValue {
  relativeFrom: number;
  durationInFrames?: number;
  isActive: boolean;
  startFrame: number;
  endFrame: number;
}

const SequenceContext = createContext<SequenceContextValue>({
  relativeFrom: 0,
  isActive: true,
  startFrame: 0,
  endFrame: Infinity,
});

export const useSequence = () => useContext(SequenceContext);

interface SequenceProps {
  from: number;
  durationInFrames?: number;
  offset?: number;
  name?: string;
  children: ReactNode;
  showInTimeline?: boolean;
  layout?: 'absolute-fill' | 'none';
  premountFor?: number;  // NEW: number of frames to premount before `from`
}

// Sequence Component - renders children only during specified frame range
export const Sequence: React.FC<SequenceProps> = ({
  from,
  durationInFrames,
  offset = 0,
  name,
  children,
  layout = 'absolute-fill',
  premountFor = 0,  // NEW
}) => {
  const currentFrame = useCurrentFrame();
  const startFrame = from + offset;
  const endFrame = durationInFrames !== undefined ? startFrame + durationInFrames : Infinity;

  // Check if sequence is active
  const isActive = currentFrame >= startFrame && currentFrame < endFrame;

  // Premounting: render children before the sequence starts, but invisible
  const premountStart = startFrame - premountFor;
  const isPremounted = premountFor > 0 && currentFrame >= premountStart && currentFrame < startFrame;
  const shouldRender = isActive || isPremounted;

  // Calculate relative frame
  const relativeFrame = isActive ? currentFrame - startFrame : 0;
  
  const contextValue: SequenceContextValue = {
    relativeFrom: startFrame,
    durationInFrames,
    isActive,
    startFrame,
    endFrame,
  };

  // Don't render children if not active (optimization)
  if (!shouldRender) {
    return null;
  }

  return (
    <SequenceContext.Provider value={contextValue}>
      <div
        data-sequence-name={name}
        data-sequence-from={startFrame}
        data-sequence-duration={durationInFrames}
        style={{
          position: layout === 'absolute-fill' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          // Premounted: invisible but rendered for audio preloading
          opacity: isPremounted ? 0 : 1,
          pointerEvents: isPremounted ? 'none' : 'auto',
        }}
      >
        <SequenceFrameProvider relativeFrame={relativeFrame}>
          {children}
        </SequenceFrameProvider>
      </div>
    </SequenceContext.Provider>
  );
};

// Frame provider for sequences that shifts frame numbers
interface SequenceFrameProviderProps {
  relativeFrame: number;
  children: ReactNode;
}

const SequenceFrameProvider: React.FC<SequenceFrameProviderProps> = ({
  relativeFrame,
  children,
}) => {
  // This would need to integrate with the main frame context
  // For now, we pass the relative frame through context
  return (
    <RelativeFrameContext.Provider value={relativeFrame}>
      {children}
    </RelativeFrameContext.Provider>
  );
};

// Relative Frame Context
const RelativeFrameContext = createContext<number | null>(null);

export const useRelativeCurrentFrame = () => useContext(RelativeFrameContext);

// Loop Component - loops a sequence for specified number of times
interface LoopProps {
  durationInFrames: number;
  times?: number;
  children: ReactNode;
  name?: string;
}

export const Loop: React.FC<LoopProps> = ({
  durationInFrames,
  times = Infinity,
  children,
  name,
}) => {
  const currentFrame = useCurrentFrame();
  
  // Calculate looped frame
  const totalFrames = times === Infinity ? durationInFrames : durationInFrames * times;
  const loopedFrame = currentFrame % durationInFrames;
  const currentLoop = Math.floor(currentFrame / durationInFrames);
  
  // Check if within total duration
  if (times !== Infinity && currentFrame >= totalFrames) {
    return null;
  }

  return (
    <LoopContext.Provider value={{ loopedFrame, currentLoop, durationInFrames }}>
      <SequenceFrameProvider relativeFrame={loopedFrame}>
        {children}
      </SequenceFrameProvider>
    </LoopContext.Provider>
  );
};

// Loop Context
const LoopContext = createContext<{
  loopedFrame: number;
  currentLoop: number;
  durationInFrames: number;
}>({
  loopedFrame: 0,
  currentLoop: 0,
  durationInFrames: 0,
});

export const useLoop = () => useContext(LoopContext);

// Freeze Component - freezes a frame for specified duration
interface FreezeProps {
  frame: number;
  durationInFrames?: number;
  active?: boolean | ((frame: number) => boolean);  // NEW
  children: ReactNode;
  name?: string;
}

export const Freeze: React.FC<FreezeProps> = ({
  frame: freezeFrame,
  durationInFrames,
  active = true,  // NEW: default to always active
  children,
}) => {
  const currentFrame = useCurrentFrame();

  // Evaluate active state
  const isActive = typeof active === 'function' ? active(currentFrame) : active;

  // If not active, pass through the current frame unchanged
  if (!isActive) {
    return <>{children}</>;
  }

  // Calculate which frame to show when frozen
  const displayFrame = durationInFrames !== undefined
    ? (currentFrame < durationInFrames ? freezeFrame : currentFrame - durationInFrames + freezeFrame)
    : freezeFrame;

  return (
    <SequenceFrameProvider relativeFrame={displayFrame}>
      {children}
    </SequenceFrameProvider>
  );
};

// Retiming Component - changes playback speed
interface RetimingProps {
  children: ReactNode;
  playbackRate: number | ((frame: number) => number);
  name?: string;
}

export const Retiming: React.FC<RetimingProps> = ({
  children,
  playbackRate,
  name,
}) => {
  const currentFrame = useCurrentFrame();
  
  // Calculate retimed frame
  const rate = typeof playbackRate === 'function' ? playbackRate(currentFrame) : playbackRate;
  const retimedFrame = Math.floor(currentFrame * rate);

  return (
    <SequenceFrameProvider relativeFrame={retimedFrame}>
      {children}
    </SequenceFrameProvider>
  );
};

// Reverse Component - plays frames in reverse
interface ReverseProps {
  children: ReactNode;
  durationInFrames: number;
}

export const Reverse: React.FC<ReverseProps> = ({
  children,
  durationInFrames,
}) => {
  const currentFrame = useCurrentFrame();
  const reversedFrame = durationInFrames - 1 - (currentFrame % durationInFrames);

  return (
    <SequenceFrameProvider relativeFrame={reversedFrame}>
      {children}
    </SequenceFrameProvider>
  );
};

// Series Component - plays sequences in series with optional gaps/overlaps
interface SeriesProps {
  children: ReactNode;
}

// Add Series.Sequence sub-component for typed children
interface SeriesSequenceProps {
  durationInFrames: number;
  offset?: number;  // NEW: positive = gap, negative = overlap
  children: ReactNode;
}

export const SeriesSequence: React.FC<SeriesSequenceProps> = ({ children }) => {
  // This component is just a container — the Series parent reads its props
  return <>{children}</>;
};

export const Series: React.FC<SeriesProps> = ({ children }) => {
  const currentFrame = useCurrentFrame();

  // Calculate cumulative frames for each child
  let accumulatedFrames = 0;
  let activeChildIndex = -1;
  let relativeFrame = currentFrame;

  const childArray = React.Children.toArray(children);

  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (React.isValidElement(child)) {
      const childDuration = (child.props as any).durationInFrames ?? 0;
      const childOffset = (child.props as any).offset ?? 0;

      if (childDuration > 0 && currentFrame >= accumulatedFrames && currentFrame < accumulatedFrames + childDuration) {
        activeChildIndex = i;
        relativeFrame = currentFrame - accumulatedFrames;
        break;
      }

      accumulatedFrames += childDuration + childOffset;
    }
  }

  if (activeChildIndex === -1) {
    return null;
  }

  const activeChild = childArray[activeChildIndex];

  return (
    <SequenceFrameProvider relativeFrame={relativeFrame}>
      {activeChild}
    </SequenceFrameProvider>
  );
};

// Attach SeriesSequence as a sub-component
export const SeriesWithSequence = Object.assign(Series, { Sequence: SeriesSequence });

export { SequenceContext };
