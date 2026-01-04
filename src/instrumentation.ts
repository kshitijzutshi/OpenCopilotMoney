// This file runs during Next.js server startup (before any request handling)
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Polyfill localStorage for Node.js 22+ which has a broken experimental implementation
  if (typeof globalThis !== "undefined" && typeof window === "undefined") {
    const storage = new Map<string, string>();

    const localStoragePolyfill = {
      getItem: (key: string): string | null => {
        return storage.get(key) ?? null;
      },
      setItem: (key: string, value: string): void => {
        storage.set(key, String(value));
      },
      removeItem: (key: string): void => {
        storage.delete(key);
      },
      clear: (): void => {
        storage.clear();
      },
      key: (index: number): string | null => {
        const keys = Array.from(storage.keys());
        return keys[index] ?? null;
      },
      get length(): number {
        return storage.size;
      },
    };

    try {
      Object.defineProperty(globalThis, "localStorage", {
        value: localStoragePolyfill,
        writable: true,
        configurable: true,
      });
    } catch {
      // @ts-expect-error - Polyfilling globalThis.localStorage
      globalThis.localStorage = localStoragePolyfill;
    }
  }
}

