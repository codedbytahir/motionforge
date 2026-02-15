'use client';

import React, { useRef, useEffect, useState, VideoHTMLAttributes, AudioHTMLAttributes, ImgHTMLAttributes } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/context';
import { interpolate } from '../utils/animation';

// Absolute Fill - Container component
interface AbsoluteFillProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const AbsoluteFill: React.FC<AbsoluteFillProps> = ({
  children,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Video Component
interface VideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string;
  startFrom?: number;
  endAt?: number;
  volume?: number | ((frame: number) => number);
  playbackRate?: number;
  muted?: boolean;
  style?: React.CSSProperties;
  pauseOnFrame?: boolean;
}

export const Video: React.FC<VideoProps> = ({
  src,
  startFrom = 0,
  endAt,
  volume = 1,
  playbackRate = 1,
  muted = true,
  style,
  pauseOnFrame = true,
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [loaded, setLoaded] = useState(false);

  // Calculate video time based on frame
  useEffect(() => {
    if (videoRef.current && loaded) {
      const time = (startFrom + currentFrame) / fps;
      if (Math.abs(videoRef.current.currentTime - time) > 0.05) {
        videoRef.current.currentTime = time;
      }
    }
  }, [currentFrame, fps, startFrom, loaded]);

  // Handle volume
  useEffect(() => {
    if (videoRef.current) {
      const vol = typeof volume === 'function' ? volume(currentFrame) : volume;
      videoRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, [currentFrame, volume]);

  // Handle playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleLoadedData = () => {
    setLoaded(true);
    if (props.onLoadedData) {
      props.onLoadedData({} as React.SyntheticEvent<HTMLVideoElement>);
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      muted={muted}
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
      onLoadedData={handleLoadedData}
      {...props}
    />
  );
};

// Audio Component
interface AudioProps extends Omit<AudioHTMLAttributes<HTMLAudioElement>, 'src'> {
  src: string;
  startFrom?: number;
  endAt?: number;
  volume?: number | ((frame: number) => number);
  playbackRate?: number;
  muted?: boolean;
}

export const Audio: React.FC<AudioProps> = ({
  src,
  startFrom = 0,
  endAt,
  volume = 1,
  playbackRate = 1,
  muted = false,
  ...props
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [loaded, setLoaded] = useState(false);

  // Calculate audio time based on frame
  useEffect(() => {
    if (audioRef.current && loaded) {
      const time = (startFrom + currentFrame) / fps;
      if (Math.abs(audioRef.current.currentTime - time) > 0.05) {
        audioRef.current.currentTime = time;
      }
    }
  }, [currentFrame, fps, startFrom, loaded]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      const vol = typeof volume === 'function' ? volume(currentFrame) : volume;
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, [currentFrame, volume]);

  // Handle playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleLoadedData = () => {
    setLoaded(true);
    if (props.onLoadedData) {
      props.onLoadedData({} as React.SyntheticEvent<HTMLAudioElement>);
    }
  };

  return (
    <audio
      ref={audioRef}
      src={src}
      muted={muted}
      onLoadedData={handleLoadedData}
      {...props}
    />
  );
};

// Image Component
interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  style?: React.CSSProperties;
  startFrom?: number;
  endAt?: number;
}

export const Img: React.FC<ImgProps> = ({
  src,
  style,
  startFrom,
  endAt,
  ...props
}) => {
  const currentFrame = useCurrentFrame();
  
  // Check if should render based on frame range
  if (startFrom !== undefined && currentFrame < startFrom) {
    return null;
  }
  if (endAt !== undefined && currentFrame > endAt) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
      {...props}
    />
  );
};

// StaticFile component - for local static assets
export const staticFile = (path: string): string => {
  // In a real implementation, this would resolve to a static file path
  return `/static/${path}`;
};

// Text Component
interface TextProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// SVG Components
interface SVGProps {
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const SVG: React.FC<SVGProps> = ({
  width = '100%',
  height = '100%',
  viewBox = '0 0 100 100',
  children,
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      style={{
        overflow: 'visible',
        ...style,
      }}
    >
      {children}
    </svg>
  );
};

// Rect Component
interface RectProps {
  width: number | string;
  height: number | string;
  x?: number;
  y?: number;
  rx?: number;
  ry?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Rect: React.FC<RectProps> = ({
  width,
  height,
  x = 0,
  y = 0,
  rx = 0,
  ry = 0,
  fill = 'black',
  stroke,
  strokeWidth,
  style,
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      ry={ry}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
};

// Circle Component
interface CircleProps {
  r: number;
  cx?: number;
  cy?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Circle: React.FC<CircleProps> = ({
  r,
  cx = 0,
  cy = 0,
  fill = 'black',
  stroke,
  strokeWidth,
  style,
}) => {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
};

// Path Component
interface PathProps {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Path: React.FC<PathProps> = ({
  d,
  fill = 'black',
  stroke,
  strokeWidth,
  style,
}) => {
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
};

// G (Group) Component
interface GroupProps {
  children: React.ReactNode;
  transform?: string;
  style?: React.CSSProperties;
}

export const G: React.FC<GroupProps> = ({
  children,
  transform,
  style,
}) => {
  return (
    <g transform={transform} style={style}>
      {children}
    </g>
  );
};

export { AbsoluteFill as Div };
