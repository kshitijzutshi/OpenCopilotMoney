// Polyfill for Node.js experimental localStorage that doesn't have all browser methods
// This is needed because Node.js 22+ has a partial localStorage implementation
// that causes issues with libraries like next-themes

// We need to check and polyfill BEFORE any other code runs
if (typeof globalThis !== "undefined" && typeof window === "undefined") {
  // We're in a server environment (Node.js)
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

  // Force override localStorage in server environment
  // Node.js v22+ has a broken experimental localStorage
  try {
    Object.defineProperty(globalThis, "localStorage", {
      value: localStoragePolyfill,
      writable: true,
      configurable: true,
    });
  } catch {
    // If defineProperty fails, try direct assignment
    // @ts-expect-error - Polyfilling globalThis.localStorage
    globalThis.localStorage = localStoragePolyfill;
  }
}

export {};
