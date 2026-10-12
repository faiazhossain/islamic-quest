import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { publicQuests } from "./content";
import { SITE_URL } from "./site";

describe("SITE_URL", () => {
  it("is an https origin without a trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });
});

describe("robots", () => {
  it("allows all crawlers except /api/ and advertises the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});

describe("sitemap", () => {
  it("lists only absolute URLs on the site origin, without duplicates", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const url of urls) {
      expect(url.startsWith(`${SITE_URL}/`) || url === SITE_URL).toBe(true);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("covers the static content pages and every public quest", () => {
    const urls = new Set(sitemap().map((entry) => entry.url));
    for (const path of ["", "/explore", "/about", "/support", "/feedback"]) {
      expect(urls.has(`${SITE_URL}${path}`)).toBe(true);
    }
    for (const quest of publicQuests()) {
      expect(urls.has(`${SITE_URL}/quest/${quest.id}`)).toBe(true);
    }
  });

  it("does not list personal app views", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const url of urls) {
      expect(url).not.toMatch(/\/(journey|challenge|settings)$/);
    }
  });
});
