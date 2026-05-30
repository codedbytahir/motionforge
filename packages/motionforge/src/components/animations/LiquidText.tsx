'use client';

import React from 'react';
import { useCurrentFrame } from '../../core/context';

interface LiquidTextProps {
  text: string;
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  speed?: number;
  amplitude?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LiquidText: React.FC<LiquidTextProps> = ({
  text,
  width = 800,
  height = 300,
  fillColor = '#10b981',
  strokeColor = '#059669',
  strokeWidth = 2,
  fontSize = 150,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 'bold',
  speed = 0.05,
  amplitude = 20,
  className = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, '');

  const wavePath = React.useMemo(() => {
    let path = `M 0 ${height}`;
    for (let x = 0; x <= width; x += 10) {
      const y = Math.sin(frame * speed + x * 0.02) * amplitude + amplitude;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${width} ${height} Z`;
    return path;
  }, [frame, width, height, speed, amplitude]);

  return (
    <div className={className} style={{ width, height, position: 'relative', ...style }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <clipPath id={`text-clip-${id}`}>
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
            >
              {text}
            </text>
          </clipPath>
        </defs>

        {/* Background / Stroke */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity="0.3"
        >
          {text}
        </text>

        {/* Liquid Fill */}
        <g clipPath={`url(#text-clip-${id})`}>
          <path d={wavePath} fill={fillColor} />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth}
          >
            {text}
          </text>
        </g>
      </svg>
    </div>
  );
};
