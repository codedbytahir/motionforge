import React, { useCallback, useRef, useState } from 'react';

export interface SequenceTrack {
  id: string;
  label: string;
  startFrame: number;
  durationInFrames: number;
  color: string;
  type: 'video' | 'audio' | 'image' | 'container';
  depth: number;
  parentId?: string;
}

interface TimelineViewProps {
  sequences: SequenceTrack[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
  onSeek: (frame: number) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  sequences,
  currentFrame,
  totalFrames,
  fps,
  onSeek,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const formatTime = (frame: number): string => {
    const seconds = frame / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    const timelineWidth = rect.width * zoom;
    const frame = Math.round((x / timelineWidth) * totalFrames);
    onSeek(Math.max(0, Math.min(frame, totalFrames - 1)));
  }, [totalFrames, zoom, onSeek]);

  return (
    <div className="timeline-view bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      {/* Time ruler */}
      <div className="h-6 bg-gray-900 border-b border-gray-800 relative flex items-end">
        {Array.from({ length: Math.ceil(totalFrames / fps) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute text-[10px] text-gray-500"
            style={{ left: `${(i * fps / totalFrames) * 100}%` }}
          >
            {formatTime(i * fps)}
          </div>
        ))}
      </div>

      {/* Sequence tracks */}
      <div ref={timelineRef} className="relative min-h-[100px] overflow-x-auto">
        <div style={{ width: `${100 * zoom}%`, position: 'relative' }}>
          {sequences.map(seq => (
            <div
              key={seq.id}
              className={`absolute h-6 rounded-sm flex items-center px-2 text-[11px] text-white truncate cursor-pointer hover:brightness-110`}
              style={{
                left: `${(seq.startFrame / totalFrames) * 100}%`,
                width: `${(seq.durationInFrames / totalFrames) * 100}%`,
                top: `${seq.depth * 28 + 4}px`,
                backgroundColor: seq.color,
                opacity: currentFrame >= seq.startFrame && currentFrame < seq.startFrame + seq.durationInFrames ? 1 : 0.5,
              }}
            >
              {seq.label}
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          />
        </div>
      </div>

      {/* Click overlay */}
      <div
        className="absolute inset-0 cursor-crosshair"
        onClick={handleClick}
        style={{ top: 24 }} // Below time ruler
      />
    </div>
  );
};
