import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt for crawlers. All worshipper data stays on-device, so the
 * only server-side surface is /api/ - endpoints, not pages - and crawlers
 * have no business there. Everything else is public and crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
