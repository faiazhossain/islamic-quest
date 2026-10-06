import type { NextConfig } from "next";

/**
 * Content-Security-Policy for an app that is same-origin except for one
 * deliberate third party: Plausible, a cookieless, privacy-friendly
 * analytics service (script + its /api/event beacon). Everything else -
 * styles, fonts, images - is same-origin (next/font self-hosts at build
 * time).
 *
 * 'unsafe-inline' is required and deliberate:
 * - script-src: the root layout's pre-paint theme script and Next's own
 *   bootstrap inline scripts run on statically rendered pages.
 * - style-src: the app sets inline style attributes throughout.
 *
 * A nonce-based policy would force every page into dynamic rendering and
 * break the offline shell - the service worker caches navigations, and a
 * cached page's nonce is invalid on the offline fallback, which would
 * leave offline users with a page whose scripts are all blocked. Nonce
 * CSP only becomes an option if the app ever moves to dynamic rendering.
 *
 * Exported for the security regression tests (src/lib/server/security-headers.test.ts).
 */
const PLAUSIBLE_HOST = "https://plausible.nsuone.com";

export function contentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    // 'unsafe-eval' is a dev-only need (React's debugging eval); never in production.
    `script-src 'self' 'unsafe-inline' ${PLAUSIBLE_HOST}${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${PLAUSIBLE_HOST}`,
    // The service worker is a same-origin classic script.
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Ignored outside secure contexts (e.g. plain-http localhost), harmless otherwise.
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Security headers applied to every route; exported for the regression tests. */
export function securityHeaders(isDev: boolean): Array<{
  key: string;
  value: string;
}> {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
    // Redundant with frame-ancestors for legacy browsers only.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    // No `preload`: the domain is not submitted to the HSTS preload list.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}

const nextConfig: NextConfig = {
  // No reason to advertise the framework.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders(process.env.NODE_ENV === "development"),
      },
    ];
  },
};

export default nextConfig;
