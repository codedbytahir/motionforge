/**
 * delayRender / continueRender — Synchronization protocol for async operations
 * during video rendering.
 *
 * When delayRender() is called, the renderer waits before capturing the frame.
 * When continueRender() is called with the returned handle, the delay is lifted.
 * When ALL delays are cleared, the frame is considered ready for capture.
 */

const delayHandles: Set<number> = new Set();
let renderReady: boolean = true;

/**
 * Signal that an async operation is in progress and the renderer should wait
 * before capturing this frame.
 *
 * @param timeoutMessage - Message shown if continueRender is never called
 * @returns A handle that must be passed to continueRender()
 */
export function delayRender(timeoutMessage?: string): number {
  const handle = Math.random();
  delayHandles.add(handle);
  renderReady = false;

  if (typeof window !== 'undefined') {
    (window as any).__MOTIONFORGE_RENDER_READY = false;
  }

  // Safety timeout: if continueRender is never called within 30 seconds,
  // log an error so the render doesn't hang forever
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      if (delayHandles.has(handle)) {
        console.error(
          `[MotionForge] delayRender() was called but continueRender() was never called.` +
          (timeoutMessage ? `\n  Context: ${timeoutMessage}` : '') +
          `\n  Handle: ${handle}`
        );
      }
    }, 30000);
  }

  return handle;
}

/**
 * Signal that an async operation has completed and the renderer may proceed.
 *
 * @param handle - The handle returned by the corresponding delayRender() call
 */
export function continueRender(handle: number): void {
  delayHandles.delete(handle);
  if (delayHandles.size === 0) {
    renderReady = true;
    if (typeof window !== 'undefined') {
      (window as any).__MOTIONFORGE_RENDER_READY = true;
    }
  }
}

/**
 * Check if all delays have been cleared and the frame is ready for capture.
 * Used by the renderer to determine when to capture.
 */
export function isRenderReady(): boolean {
  return delayHandles.size === 0;
}

/**
 * Reset the render ready state. Called by the renderer at the start of each frame.
 */
export function resetRenderReady(): void {
  // Do NOT clear existing handles — they represent genuine in-flight operations.
  // Only reset the flag so the next frame's delayRender calls take effect.
  if (delayHandles.size > 0) {
    renderReady = false;
    if (typeof window !== 'undefined') {
      (window as any).__MOTIONFORGE_RENDER_READY = false;
    }
  }
}

/**
 * Get the number of pending delay handles (for debugging).
 */
export function getPendingDelayCount(): number {
  return delayHandles.size;
}

/**
 * Cancel all pending delays (used for cleanup on unmount).
 */
export function cancelAllDelays(): void {
  delayHandles.clear();
  renderReady = true;
  if (typeof window !== 'undefined') {
    (window as any).__MOTIONFORGE_RENDER_READY = true;
  }
}
