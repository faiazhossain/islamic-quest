/**
 * Production origin. Resolves every relative URL in share metadata
 * (og:image, og:url) and in robots.txt / sitemap.xml to an absolute URL,
 * which scrapers and crawlers require. Update it if the app moves off
 * its Vercel domain.
 */
export const SITE_URL = "https://amalyn.vercel.app";
