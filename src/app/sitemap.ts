import type { MetadataRoute } from "next";
import { publicQuests } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * sitemap.xml: the static content pages plus every citation-verified
 * quest detail page. Personal views (journey, challenge, settings) are
 * left out on purpose - they render from on-device data, so a crawler
 * sees an empty shell, and the sitemap should list index-worthy URLs.
 * lastModified is omitted: without a real per-page change date, a build
 * timestamp would just teach crawlers to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/support`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/feedback`, changeFrequency: "yearly", priority: 0.3 },
  ];
  const quests: MetadataRoute.Sitemap = publicQuests().map((quest) => ({
    url: `${SITE_URL}/quest/${quest.id}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...pages, ...quests];
}
