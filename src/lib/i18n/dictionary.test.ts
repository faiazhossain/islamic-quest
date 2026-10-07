import { describe, expect, it } from "vitest";
import { BN, EN, copyFor, navLabels } from "./dictionary";
import { localized } from "./localized";

/** Collects every string value in the copy tree, including function output. */
function collectStrings(value: unknown, path: string): string[] {
  if (typeof value === "string") return [`${path}=${value}`];
  if (typeof value === "function") {
    // Exercise function copy with plausible params (formatted strings).
    try {
      return [`${path}()=${String((value as (a?: string, b?: string) => string)("1", "2"))}`];
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      collectStrings(item, `${path}.${key}`),
    );
  }
  return [];
}

function keyPaths(value: unknown, path = ""): string[] {
  if (typeof value === "function") return [`${path}()`];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      keyPaths(item, path ? `${path}.${key}` : key),
    );
  }
  return [path];
}

describe("UI dictionary", () => {
  it("has complete EN/BN key parity (compile-enforced shape, runtime-checked)", () => {
    expect(keyPaths(BN).sort()).toEqual(keyPaths(EN).sort());
  });

  it("leaves no copy empty in either language", () => {
    for (const [lang, table] of [["en", EN], ["bn", BN]] as const) {
      for (const entry of collectStrings(table, lang)) {
        const value = entry.slice(entry.indexOf("=") + 1);
        expect(value.trim(), entry).not.toBe("");
      }
    }
  });

  it("writes Bangla copy in Bengali script (brand names excepted)", () => {
    const pureLatin = /[\p{Script=Bengali}]/u;
    for (const entry of collectStrings(BN, "bn")) {
      const path = entry.slice(0, entry.indexOf("="));
      const value = entry.slice(entry.indexOf("=") + 1);
      // Deliberate Latin exceptions: the brand, the host, a login
      // provider whose name users read in Latin, payment brands users
      // read in Latin (bKash, EBL, Visa), and the product nouns "Quest"
      // and "Journey of Light", which stay English in Bangla copy
      // (terminology map).
      if (
        /amalyn|sunnah|ihadis|google|emailplaceholder|pathoflight|bkash|ebl|visa/i.test(path) ||
        /English/.test(value) ||
        value === "Quest"
      ) {
        continue;
      }
      expect(pureLatin.test(value), `not Bengali: ${entry}`).toBe(true);
    }
  });

  it("resolves copy by setting, falling back to English while unset", () => {
    expect(copyFor("bn")).toBe(BN);
    expect(copyFor("en")).toBe(EN);
    expect(copyFor(null)).toBe(EN);
  });

  it("keeps nav labels aligned with the routes they point to", () => {
    const en = navLabels("en");
    expect(en["/"]).toBe(EN.navHome);
    expect(en["/settings"]).toBe(EN.navSettings);
    const bn = navLabels("bn");
    expect(bn["/explore"]).toBe(BN.navExplore);
  });

  it("interpolates without leaking placeholders into Bangla", () => {
    expect(BN.questsComplete("৩", "২০")).toContain("২০");
    expect(BN.daysInARow("৫")).toContain("৫");
    expect(EN.dayCount("1")).toContain("day");
  });
});

describe("localized()", () => {
  it("falls back to English when the Bangla field is absent", () => {
    expect(localized({ en: "Only English" }, "bn")).toBe("Only English");
    expect(localized({ en: "Both", bn: "উভয়" }, "bn")).toBe("উভয়");
    expect(localized({ en: "Both", bn: "উভয়" }, "en")).toBe("Both");
  });
});
