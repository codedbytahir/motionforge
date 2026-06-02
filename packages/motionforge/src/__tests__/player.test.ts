import { PlayerEmitter } from '../player/player-emitter';
import { calculateCanvasTransformation } from '../player/internals';

describe('Player Emitter', () => {
  it('should register and emit events', () => {
    const emitter = new PlayerEmitter();
    let called = false;
    emitter.on('play', () => {
      called = true;
    });
    emitter.emit('play');
    expect(called).toBe(true);
  });

  it('should handle data in events', () => {
    const emitter = new PlayerEmitter();
    let frame = -1;
    emitter.on('seek', (data) => {
      frame = data.frame;
    });
    emitter.emit('seek', { frame: 42 });
    expect(frame).toBe(42);
  });

  it('should unsubscribe', () => {
    const emitter = new PlayerEmitter();
    let count = 0;
    const unsub = emitter.on('play', () => {
      count++;
    });
    emitter.emit('play');
    unsub();
    emitter.emit('play');
    expect(count).toBe(1);
  });

  it('should handle once', () => {
    const emitter = new PlayerEmitter();
    let count = 0;
    emitter.once('play', () => {
      count++;
    });
    emitter.emit('play');
    emitter.emit('play');
    expect(count).toBe(1);
  });
});

describe('Player Internals', () => {
  it('should calculate canvas transformation correctly', () => {
    const result = calculateCanvasTransformation(1920, 1080, 960, 540);
    expect(result.scale).toBe(0.5);
    expect(result.width).toBe(960);
    expect(result.height).toBe(540);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('should center the canvas when aspect ratios differ', () => {
    const result = calculateCanvasTransformation(1920, 1080, 1000, 1000);
    expect(result.scale).toBeCloseTo(1000 / 1920);
    expect(result.width).toBeCloseTo(1000);
    expect(result.height).toBeCloseTo(1080 * (1000 / 1920));
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeGreaterThan(0);
  });
});
