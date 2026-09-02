import { interpolate, spring, Easing } from '../utils/animation';

describe('Animation Utilities', () => {
  describe('interpolate', () => {
    it('should wrap values when extrapolateRight is wrap', () => {
      const result = interpolate(45, [0, 30], [0, 100], { extrapolateRight: 'wrap' });
      expect(result).toBe(50); // (45-0) % 30 = 15; 15/30 * 100 = 50
    });

    it('should apply per-segment easing', () => {
      const result = interpolate(15, [0, 30, 60], [0, 100, 200], {
        easing: [Easing.easeInQuad, Easing.linear]
      });
      // 15/30 = 0.5; easeInQuad(0.5) = 0.25; 0.25 * 100 = 25
      expect(result).toBe(25);
    });

    it('should posterize input', () => {
      const result = interpolate(15, [0, 30], [0, 100], { posterize: 10 });
      // Math.floor(15/10)*10 = 10; 10/30 * 100 = 33.33...
      expect(result).toBeCloseTo(33.33);
    });
  });

  describe('spring', () => {
    it('should respect delay', () => {
      const result = spring({ frame: 5, fps: 30, delay: 10, from: 0, to: 1 });
      expect(result).toBe(0);
    });

    it('should work in reverse', () => {
      const result = spring({ frame: 100, fps: 30, reverse: true, from: 0, to: 1 });
      expect(result).toBeLessThan(0.5); // Should be moving towards 0
    });
  });
});
