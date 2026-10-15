import "@testing-library/jest-dom/vitest";

// Newer Node versions ship a half-working global `localStorage` that shadows
// jsdom's. Replace both stores with simple in-memory ones.
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  const store = new MemoryStorage();
  Object.defineProperty(globalThis, name, { value: store, configurable: true, writable: true });
  Object.defineProperty(window, name, { value: store, configurable: true, writable: true });
}

// Browser APIs jsdom doesn't provide.
window.scrollTo = () => {};
window.matchMedia ??= ((query: string) => ({
  matches: false, media: query, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
Element.prototype.scrollIntoView ??= () => {};
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
globalThis.IntersectionObserver ??= class {
  observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
} as unknown as typeof IntersectionObserver;
