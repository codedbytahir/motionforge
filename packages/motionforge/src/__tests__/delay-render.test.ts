import { delayRender, continueRender, isRenderReady, cancelAllDelays } from '../core/delay-render';

describe('delayRender protocol', () => {
  beforeEach(() => {
    cancelAllDelays();
  });

  it('should not be ready when a delay is active', () => {
    const handle = delayRender();
    expect(isRenderReady()).toBe(false);
    continueRender(handle);
    expect(isRenderReady()).toBe(true);
  });

  it('should handle multiple delays', () => {
    const h1 = delayRender();
    const h2 = delayRender();
    expect(isRenderReady()).toBe(false);
    continueRender(h1);
    expect(isRenderReady()).toBe(false);
    continueRender(h2);
    expect(isRenderReady()).toBe(true);
  });
});
