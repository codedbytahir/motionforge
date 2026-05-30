'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from '../index';
import { KineticTypography } from '../components/animations/KineticTypography';
import { LiquidText } from '../components/animations/LiquidText';
import { TextStack3D } from '../components/animations/TextStack3D';

export const DemoCinematicTypography: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Sequence from={0} durationInFrames={90}>
        <KineticTypography
          text="KINETIC MOTION"
          type="velocity"
          fontSize={120}
        />
      </Sequence>

      <Sequence from={90} durationInFrames={90}>
        <KineticTypography
          text="STRETCHY TEXT"
          type="stretching"
          fontSize={120}
          color="#10b981"
        />
      </Sequence>

      <Sequence from={180} durationInFrames={90}>
        <LiquidText
          text="LIQUID"
          fontSize={200}
        />
      </Sequence>

      <Sequence from={270} durationInFrames={120}>
        <TextStack3D
          text="EVOLVED"
          fontSize={150}
          layers={12}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
