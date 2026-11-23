'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from '../index';
import { DepthGallery3D } from '../components/animations/DepthGallery3D';
import { ShaderImageReveal } from '../components/animations/ShaderImageReveal';
import { DitheringEffect } from '../components/animations/DitheringEffect';

const IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80',
];

export const DemoWebGL: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={300}>
        <DepthGallery3D images={IMAGES} />
      </Sequence>

      <Sequence from={300} durationInFrames={120}>
        <ShaderImageReveal src={IMAGES[0]} />
      </Sequence>

      <Sequence from={420} durationInFrames={120}>
        <DitheringEffect src={IMAGES[1]} />
      </Sequence>
    </AbsoluteFill>
  );
};
