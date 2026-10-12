// Canonical URLs and dedup keys for discovered communities.
//
// The same Facebook group shows up under many spellings (www/m/mbasic
// hosts, /about or /members suffixes, tracking query params, slug casing).
// One group must always collapse to one dedup key so repeated discoveries
// never create duplicate records.

import type { Platform } from "./types.ts";

export interface CanonicalTarget {
  canonicalUrl: string;
  dedupKey: string;
  platform: Platform;
  // Facebook numeric group id when the URL carried one (facebook.com/
  // groups/<numeric-id>); used to cross-check slug-form duplicates.
  fbGroupId: string | null;
}

// Host prefixes Facebook serves the same content on.
const FB_HOST_PREFIXES = new Set([
  "www.",
  "m.",
  "mbasic.",
  "web.",
  "free.",
  "d.",
  "l.",
  "touch.",
]);

// First path segments that identify Facebook system pages, not
// communities. A bare facebook.com/<segment> only counts as a Page when
// the segment is not one of these.
const FB_RESERVED_SEGMENTS = new Set([
  "groups",
  "pages",
  "people",
  "pg",
  "profile.php",
  "watch",
  "share",
  "login",
  "help",
  "policies",
  "events",
  "marketplace",
  "search",
  "hashtag",
  "reels",
  "photo",
  "story.php",
  "permalink.php",
  "media",
  "notes",
  "friends",
  "feed",
  "notifications",
  "settings",
  "support",
]);

// Query params that never affect identity. Everything starting with
// utm_, __cft__ or __xts__ is also dropped.
const TRACKING_PARAMS = new Set([
  "fbclid",
  "mibextid",
  "rdid",
  "share_id",
  "extid",
  "extid_s",
  "gclid",
  "msclkid",
  "dclid",
  "igshid",
  "si",
  "ref",
  "refsrc",
  "comment_id",
  "comment_tracking",
  "_rdr",
  "pnref",
  "locale",
]);

function isTrackingParam(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    TRACKING_PARAMS.has(lower) ||
    lower.startsWith("utm_") ||
    lower.startsWith("__cft__") ||
    lower.startsWith("__xts__")
  );
}

function normalizeFacebookHost(host: string): string | null {
  const lower = host.toLowerCase();
  if (lower === "facebook.com" || lower === "fb.com") return "facebook.com";
  if (lower.endsWith(".facebook.com")) {
    const prefix = lower.slice(0, -".facebook.com".length + 1);
    if (FB_HOST_PREFIXES.has(prefix)) return "facebook.com";
  }
  if (lower.endsWith(".fb.com") && lower.startsWith("www.")) {
    return "facebook.com";
  }
  return null;
}

export function stripTrackingParams(
  params: URLSearchParams,
): [string, string][] {
  const kept: [string, string][] = [];
  for (const [name, value] of params) {
    if (!isTrackingParam(name)) kept.push([name, value]);
  }
  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return kept;
}

function genericTarget(url: URL): CanonicalTarget {
  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice("www.".length);
  let path = url.pathname.replace(/\/index\.html$/, "");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  const params = stripTrackingParams(url.searchParams);
  const query = params.map(([k, v]) => `${k}=${v}`).join("&");
  const canonicalUrl = `https://${host}${path}${query ? `?${query}` : ""}`;
  return {
    canonicalUrl,
    dedupKey: `url:${host}${path}`,
    platform: "web",
    fbGroupId: null,
  };
}

function facebookTarget(url: URL): CanonicalTarget | null {
  const segments = url.pathname.split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });

  // facebook.com/groups/<slug>[/<anything>][?<anything>]
  if (segments[0] === "groups" && segments[1]) {
    const slug = segments[1];
    const isNumericId = /^\d+$/.test(slug);
    return {
      canonicalUrl: `https://facebook.com/groups/${slug}`,
      dedupKey: `fb:group:${slug.toLowerCase()}`,
      platform: "facebook_group",
      fbGroupId: isNumericId ? slug : null,
    };
  }

  // facebook.com/pages/<Name>/<id> and facebook.com/people/<Name>/<id>
  if ((segments[0] === "pages" || segments[0] === "people") && segments[2]) {
    const id = segments[2];
    return {
      canonicalUrl: `https://facebook.com/${segments[0]}/${segments[1]}/${id}`,
      dedupKey: `fb:page:${id}`,
      platform: "facebook_page",
      fbGroupId: null,
    };
  }

  // facebook.com/profile.php?id=<id>
  if (segments[0] === "profile.php") {
    const id = url.searchParams.get("id");
    if (id && /^\d+$/.test(id)) {
      return {
        canonicalUrl: `https://facebook.com/profile.php?id=${id}`,
        dedupKey: `fb:page:${id}`,
        platform: "facebook_page",
        fbGroupId: null,
      };
    }
    return null;
  }

  // facebook.com/<PageSlug> for anything that is not a system path.
  if (segments.length >= 1 && !FB_RESERVED_SEGMENTS.has(segments[0])) {
    const slug = segments[0];
    return {
      canonicalUrl: `https://facebook.com/${slug}`,
      dedupKey: `fb:page:${slug.toLowerCase()}`,
      platform: "facebook_page",
      fbGroupId: null,
    };
  }

  return null;
}

// Reduce a pasted URL to its canonical form and stable dedup key.
// Returns null for URLs that cannot identify a community (malformed
// input, or Facebook system pages such as /watch and /share).
export function canonicalize(rawUrl: string): CanonicalTarget | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const fbHost = normalizeFacebookHost(url.hostname);
  if (fbHost !== null) {
    // l.facebook.com/l.php?u=<encoded> is Facebook's outbound shim;
    // unwrap it so shared links dedup against the real target.
    if (url.pathname === "/l.php") {
      const wrapped = url.searchParams.get("u");
      if (wrapped) return canonicalize(wrapped);
    }
    return facebookTarget(url);
  }
  return genericTarget(url);
}
