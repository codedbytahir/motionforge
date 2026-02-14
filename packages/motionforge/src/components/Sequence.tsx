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
}

// Sequence Component - renders children only during specified frame range
export const Sequence: React.FC<SequenceProps> = ({
  from,
  durationInFrames,
  offset = 0,
  name,
  children,
  layout = 'absolute-fill',
}) => {
  const currentFrame = useCurrentFrame();
  const startFrame = from + offset;
  const endFrame = durationInFrames !== undefined ? startFrame + durationInFrames : Infinity;
  
  // Calculate relative frame
  const relativeFrame = currentFrame - startFrame;
  
  // Check if sequence is active
  const isActive = currentFrame >= startFrame && currentFrame < endFrame;
  
  const contextValue: SequenceContextValue = {
    relativeFrom: startFrame,
    durationInFrames,
    isActive,
    startFrame,
    endFrame,
  };

  // Don't render children if not active (optimization)
  if (!isActive) {
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
const RelativeFrameContext = createContext<number>(0);

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
  durationInFrames: number;
  children: ReactNode;
  name?: string;
}

export const Freeze: React.FC<FreezeProps> = ({
  frame: freezeFrame,
  durationInFrames,
  children,
}) => {
  const currentFrame = useCurrentFrame();
  
  // Calculate which frame to show
  const displayFrame = currentFrame < durationInFrames ? freezeFrame : currentFrame - durationInFrames + freezeFrame;

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

// Series Component - plays sequences in series
interface SeriesProps {
  children: ReactNode;
}

export const Series: React.FC<SeriesProps> = ({ children }) => {
  const currentFrame = useCurrentFrame();
  
  // Calculate cumulative frames for each child
  let accumulatedFrames = 0;
  let activeChildIndex = -1;
  let relativeFrame = currentFrame;

  const childArray = React.Children.toArray(children);
  
  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (React.isValidElement<{ durationInFrames?: number }>(child) && child.props.durationInFrames) {
      const childDuration = child.props.durationInFrames;
      
      if (currentFrame >= accumulatedFrames && currentFrame < accumulatedFrames + childDuration) {
        activeChildIndex = i;
        relativeFrame = currentFrame - accumulatedFrames;
        break;
      }
      
      accumulatedFrames += childDuration;
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

export { SequenceContext };
