import { Pool } from '../pool';

describe('Pool', () => {
  it('should acquire and release resources', async () => {
    const pages = ['page1', 'page2'] as any;
    const pool = new Pool(pages);

    const p1 = await pool.acquire();
    expect(p1).toBe('page2');

    const p2 = await pool.acquire();
    expect(p2).toBe('page1');

    pool.release(p1);
    const p3 = await pool.acquire();
    expect(p3).toBe('page2');
  });

  it('should wait for resources when pool is empty', async () => {
    const pool = new Pool(['page1'] as any);
    const p1 = await pool.acquire();

    let acquired = false;
    pool.acquire().then(() => {
      acquired = true;
    });

    expect(acquired).toBe(false);

    pool.release(p1);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(acquired).toBe(true);
  });
});
