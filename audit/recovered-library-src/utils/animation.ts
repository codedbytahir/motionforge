// Animation utilities for Remotion-like framework

import { SpringConfig, InterpolateOptions, EasingFunction, Keyframe } from '../core/types';

// Easing functions
export const Easing = {
  linear: (t: number): number => t,
  
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => 
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => 
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  easeInQuint: (t: number): number => t * t * t * t * t,
  easeOutQuint: (t: number): number => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number): number => 
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
  
  easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number): number => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t: number): number => 
    t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number): number => 
    t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
  
  // Bezier curve easing
  bezier: (x1: number, y1: number, x2: number, y2: number): EasingFunction => {
    const epsilon = 1e-6;
    
    const sampleCurveX = (t: number): number => 
      3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t;
    
    const sampleCurveY = (t: number): number =>
      3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
    
    const solveCurveX = (x: number): number => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const xEst = sampleCurveX(t) - x;
        if (Math.abs(xEst) < epsilon) return t;
        const d = (3 * x1 * (1 - t) * (1 - t) + 6 * x2 * t * (1 - t) + 3 * t * t);
        if (Math.abs(d) < epsilon) break;
        t -= xEst / d;
      }
      return t;
    };
    
    return (t: number): number => sampleCurveY(solveCurveX(t));
  },
};

// Spring animation
export const spring = ({
  frame,
  fps,
  config = {},
  from = 0,
  to = 1,
  durationInFrames,
  durationRestThreshold = 0.005,
}: SpringConfig): number => {
  const {
    damping = 10,
    mass = 1,
    stiffness = 100,
    overshootClamping = false,
  } = config;

  // Calculate natural frequency and damping ratio
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  
  // Calculate duration if not provided
  const actualDuration = durationInFrames ?? Math.ceil(fps * 2);
  
  // Normalize time
  const t = Math.min(frame / actualDuration, 1);
  const time = t * actualDuration / fps;
  
  let value: number;
  
  if (zeta < 1) {
    // Underdamped
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    value = 1 - Math.exp(-zeta * omega * time) * (
      Math.cos(omegaD * time) + (zeta * omega / omegaD) * Math.sin(omegaD * time)
    );
  } else if (zeta === 1) {
    // Critically damped
    value = 1 - (1 + omega * time) * Math.exp(-omega * time);
  } else {
    // Overdamped
    const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const c2 = (1 - r1 / (r1 - r2)) / (r1 - r2);
    const c1 = 1 / (r1 - r2) - c2;
    value = 1 - c1 * Math.exp(r1 * time) - c2 * Math.exp(r2 * time);
  }
  
  // Clamp overshoot if needed
  if (overshootClamping) {
    value = Math.max(0, Math.min(1, value));
  }
  
  return from + (to - from) * value;
};

// Interpolate function
export const interpolate = (
  input: number,
  inputRange: number[],
  outputRange: number[],
  options: InterpolateOptions = {}
): number => {
  const {
    extrapolateLeft = 'clamp',
    extrapolateRight = 'clamp',
    easing,
  } = options;

  if (inputRange.length !== outputRange.length) {
    throw new Error('inputRange and outputRange must have the same length');
  }

  if (inputRange.length < 2) {
    throw new Error('inputRange must have at least 2 elements');
  }

  // Check if input is outside the range
  if (input < inputRange[0]) {
    if (extrapolateLeft === 'clamp') {
      return outputRange[0];
    } else if (extrapolateLeft === 'identity') {
      return input;
    }
    // extend - continue the linear extrapolation
  }

  if (input > inputRange[inputRange.length - 1]) {
    if (extrapolateRight === 'clamp') {
      return outputRange[outputRange.length - 1];
    } else if (extrapolateRight === 'identity') {
      return input;
    }
    // extend - continue the linear extrapolation
  }

  // Find the segment
  let segmentIndex = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (input <= inputRange[i]) {
      segmentIndex = i - 1;
      break;
    }
  }

  const inputStart = inputRange[segmentIndex];
  const inputEnd = inputRange[segmentIndex + 1];
  const outputStart = outputRange[segmentIndex];
  const outputEnd = outputRange[segmentIndex + 1];

  // Calculate progress
  let progress = (input - inputStart) / (inputEnd - inputStart);
  
  // Apply easing
  if (easing) {
    progress = easing(progress);
  }

  return outputStart + progress * (outputEnd - outputStart);
};

// Interpolate colors
export const interpolateColors = (
  input: number,
  inputRange: number[],
  outputRange: string[]
): string => {
  // Parse color to RGB
  const parseColor = (color: string): [number, number, number, number] => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
          255,
        ];
      }
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255,
      ];
    }
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match) {
        return [
          parseInt(match[0]),
          parseInt(match[1]),
          parseInt(match[2]),
          match[3] ? parseInt(match[3]) : 255,
        ];
      }
    }
    return [0, 0, 0, 255];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Find segment
  let segmentIndex = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (input <= inputRange[i]) {
      segmentIndex = i - 1;
      break;
    }
  }

  const inputStart = inputRange[segmentIndex];
  const inputEnd = inputRange[segmentIndex + 1];
  const colorStart = parseColor(outputRange[segmentIndex]);
  const colorEnd = parseColor(outputRange[segmentIndex + 1]);

  const progress = (input - inputStart) / (inputEnd - inputStart);

  const r = colorStart[0] + progress * (colorEnd[0] - colorStart[0]);
  const g = colorStart[1] + progress * (colorEnd[1] - colorStart[1]);
  const b = colorStart[2] + progress * (colorEnd[2] - colorStart[2]);

  return rgbToHex(r, g, b);
};

// Keyframe animation
export const useKeyframes = (
  keyframes: Keyframe[],
  frame: number
): number | string => {
  if (keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  // Sort keyframes by frame
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Find surrounding keyframes
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  if (frame <= prev.frame) return prev.value;
  if (frame >= next.frame) return next.value;

  // Calculate progress
  let progress = (frame - prev.frame) / (next.frame - prev.frame);

  // Apply easing
  if (next.easing) {
    progress = next.easing(progress);
  } else if (prev.easing) {
    progress = prev.easing(progress);
  }

  // Interpolate values
  if (typeof prev.value === 'number' && typeof next.value === 'number') {
    return prev.value + progress * (next.value - prev.value);
  }

  // For strings, just return the previous or next based on progress
  return progress < 0.5 ? prev.value : next.value;
};

// Measure spring duration
export const measureSpring = ({
  fps,
  config = {},
  threshold = 0.005,
}: {
  fps: number;
  config?: SpringConfig['config'];
  threshold?: number;
}): number => {
  const { damping = 10, mass = 1, stiffness = 100 } = config;
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  
  // Estimate time to settle
  let time = 0;
  const dt = 1 / fps;
  const maxTime = 10; // 10 seconds max
  
  while (time < maxTime) {
    let value: number;
    
    if (zeta < 1) {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      value = 1 - Math.exp(-zeta * omega * time) * (
        Math.cos(omegaD * time) + (zeta * omega / omegaD) * Math.sin(omegaD * time)
      );
    } else if (zeta === 1) {
      value = 1 - (1 + omega * time) * Math.exp(-omega * time);
    } else {
      const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
      const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
      const c2 = (1 - r1 / (r1 - r2)) / (r1 - r2);
      const c1 = 1 / (r1 - r2) - c2;
      value = 1 - c1 * Math.exp(r1 * time) - c2 * Math.exp(r2 * time);
    }
    
    if (Math.abs(value - 1) < threshold) {
      return Math.ceil(time * fps);
    }
    
    time += dt;
  }
  
  return Math.ceil(maxTime * fps);
};

// Calculate frames from seconds
export const getFramesFromSeconds = (seconds: number, fps: number): number => {
  return Math.round(seconds * fps);
};

// Calculate seconds from frames
export const getSecondsFromFrames = (frames: number, fps: number): number => {
  return frames / fps;
};

// Range utility
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};

// Random with seed (for reproducibility)
export const random = (seed: string | number, min: number = 0, max: number = 1): number => {
  const str = typeof seed === 'number' ? seed.toString() : seed;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const normalized = (Math.abs(hash) % 10000) / 10000;
  return min + normalized * (max - min);
};

// Noise function (simple implementation)
export const noise2D = (x: number, y: number): number => {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  
  const u = x * x * (3 - 2 * x);
  const v = y * y * (3 - 2 * y);
  
  const A = (X + Y * 256) % 256;
  const B = (X + 1 + Y * 256) % 256;
  const C = (X + (Y + 1) * 256) % 256;
  const D = (X + 1 + (Y + 1) * 256) % 256;
  
  const a = Math.sin(A * 12.9898 + 78.233) * 43758.5453 % 1;
  const b = Math.sin(B * 12.9898 + 78.233) * 43758.5453 % 1;
  const c = Math.sin(C * 12.9898 + 78.233) * 43758.5453 % 1;
  const d = Math.sin(D * 12.9898 + 78.233) * 43758.5453 % 1;
  
  return a + u * (b - a + v * (d - b - (d - c))) + v * (c - a);
};

export { Easing as easing };
