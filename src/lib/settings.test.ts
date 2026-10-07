import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyLanguage, useSettings } from "./settings";

describe("language setting", () => {
  const realLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    // Minimal in-memory localStorage: node's test env has none.
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    };
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: realLocalStorage,
      configurable: true,
    });
  });

  it("starts unset so the first-visit chooser can ask", () => {
    expect(useSettings.getState().language).toBeNull();
  });

  it("keeps applyLanguage a safe no-op outside the browser", () => {
    expect(() => applyLanguage("bn")).not.toThrow();
  });

  it("persists the choice through the store", () => {
    useSettings.getState().setLanguage("bn");
    expect(useSettings.getState().language).toBe("bn");
    useSettings.getState().setLanguage("en");
    expect(useSettings.getState().language).toBe("en");
  });
});
