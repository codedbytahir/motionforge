type EventMap = {
  play: undefined;
  pause: undefined;
  seek: { frame: number };
  seeked: { frame: number };
  ended: undefined;
  error: { error: Error };
  ratechange: { playbackRate: number };
  volumechange: { volume: number };
  timeupdate: { frame: number; timeInSeconds: number };
  progress: { progress: number };
  exportstart: undefined;
  exportcomplete: { blob: Blob };
  exportprogress: { progress: number };
  exporterror: { error: Error };
};

type EventKey = keyof EventMap;

export class PlayerEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on<K extends EventKey>(event: K, listener: (data: EventMap[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  once<K extends EventKey>(event: K, listener: (data: EventMap[K]) => void): () => void {
    const unsubscribe = this.on(event, (data) => {
      listener(data as any);
      unsubscribe();
    });
    return unsubscribe;
  }

  emit<K extends EventKey>(event: K, data?: EventMap[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  removeAllListeners(event?: EventKey): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
