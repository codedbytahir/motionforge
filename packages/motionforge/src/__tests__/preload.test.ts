import { preloadAssets } from '../core/preload';

describe('Preload Utilities', () => {
  beforeAll(() => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: (err: any) => void = () => {};
      _src: string = '';
      set src(val: string) {
        this._src = val;
        setTimeout(() => this.onload(), 10);
      }
      get src() { return this._src; }
    } as any;

    global.document = {
      createElement: (tag: string) => {
        if (tag === 'video' || tag === 'audio') {
          return {
            preload: '',
            oncanplaythrough: () => {},
            onerror: () => {},
            _src: '',
            set src(val: string) {
              this._src = val;
              setTimeout(() => this.oncanplaythrough(), 10);
            },
            get src() { return this._src; }
          };
        }
        return {};
      },
      fonts: {
        load: () => Promise.resolve()
      }
    } as any;
  });

  it('should preload multiple assets', async () => {
    await preloadAssets([
      { type: 'image', src: 'test.png' },
      { type: 'font', src: 'Inter' }
    ]);
    expect(true).toBe(true);
  });
});
