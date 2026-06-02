import React from 'react';
import { AbsoluteFill, shouldOmitStyleProperty } from '../components/Media';
import { Series, SeriesSequence } from '../components/Sequence';

describe('AbsoluteFill', () => {
  it('should exist', () => {
    expect(AbsoluteFill).toBeDefined();
  });

  describe('shouldOmitStyleProperty', () => {
    it('should identify Tailwind conflicts', () => {
      expect(shouldOmitStyleProperty(['w-1/2'], 'width')).toBe(true);
      expect(shouldOmitStyleProperty(['top-0'], 'top')).toBe(true);
      expect(shouldOmitStyleProperty(['flex'], 'display')).toBe(true);
      expect(shouldOmitStyleProperty(['p-4'], 'width')).toBe(false);
      expect(shouldOmitStyleProperty(['inset-0'], 'top')).toBe(true);
      expect(shouldOmitStyleProperty(['inset-0'], 'bottom')).toBe(true);
    });
  });
});

describe('Series', () => {
  it('should exist', () => {
    expect(Series).toBeDefined();
    expect(SeriesSequence).toBeDefined();
  });
});
