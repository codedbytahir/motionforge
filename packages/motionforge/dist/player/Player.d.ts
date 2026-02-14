import React from 'react';

interface PlayerProps {
    component: React.ComponentType<Record<string, unknown>>;
    durationInFrames: number;
    fps?: number;
    width?: number;
    height?: number;
    defaultProps?: Record<string, unknown>;
    controls?: boolean;
    loop?: boolean;
    autoPlay?: boolean;
    style?: React.CSSProperties;
    className?: string;
}
declare const Player: React.FC<PlayerProps>;

export { Player, type PlayerProps, Player as default };
