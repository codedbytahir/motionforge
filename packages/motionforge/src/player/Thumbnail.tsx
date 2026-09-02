'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FrameContext } from '../core/context';

export interface ThumbnailProps {
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames?: number;
  frameToDisplay?: number;
  defaultProps?: Record<string, unknown>;
  style?: React.CSSProperties;
  className?: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames = 1,
  frameToDisplay = 0,
  defaultProps = {},
  style,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const scale = containerWidth / width;
  const displayHeight = height * scale;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <FrameContext.Provider
          value={{
            frame: frameToDisplay,
            fps,
            durationInFrames,
            width,
            height,
            playing: false,
            playbackRate: 1,
            setFrame: () => {},
            setPlaying: () => {},
            setPlaybackRate: () => {},
          }}
        >
          <Component {...defaultProps} />
        </FrameContext.Provider>
      </div>
    </div>
  );
};
