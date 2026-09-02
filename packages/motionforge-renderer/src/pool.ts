import type { Page } from 'puppeteer-core';

/**
 * Resource pool for concurrent frame rendering.
 * Manages a fixed set of browser pages and distributes them to render tasks.
 */
export class Pool {
  private resources: Page[];
  private waiters: Array<{ resolve: (page: Page) => void }> = [];

  constructor(pages: Page[]) {
    this.resources = [...pages];
  }

  /** Acquire a page from the pool. Waits if none are available. */
  async acquire(): Promise<Page> {
    if (this.resources.length > 0) {
      return this.resources.pop()!;
    }
    return new Promise<Page>((resolve) => {
      this.waiters.push({ resolve });
    });
  }

  /** Release a page back to the pool. */
  release(page: Page): void {
    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!;
      waiter.resolve(page);
    } else {
      this.resources.push(page);
    }
  }
}
