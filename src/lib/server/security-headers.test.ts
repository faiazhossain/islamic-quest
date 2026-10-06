import { describe, expect, it } from "vitest";
import {
  contentSecurityPolicy,
  securityHeaders,
} from "../../../next.config";

/**
 * Boundary tests for the deployed security headers: whatever refactors
 * happen to next.config, a deploy must never ship without framing
 * protection, MIME sniffing protection, or a CSP that confines the app to
 * its own origin.
 */
function header(
  headers: Array<{ key: string; value: string }>,
  key: string,
): string | undefined {
  return headers.find((entry) => entry.key === key)?.value;
}

describe("contentSecurityPolicy", () => {
  it("confines the app to its own origin", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("font-src 'self'");
    expect(csp).not.toMatch(/https?:\/\//);
  });

  it("denies framing, plugins, and base hijacking", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  it("allows eval only in development", () => {
    expect(contentSecurityPolicy(false)).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy(true)).toContain("unsafe-eval");
  });

  it("keeps the inline allowances the static architecture requires", () => {
    const csp = contentSecurityPolicy(false);
    // The pre-paint theme script and inline style attributes are part of
    // the design; these assertions document that the policy is deliberate.
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });
});

describe("securityHeaders", () => {
  it("applies the full header set in production", () => {
    const headers = securityHeaders(false);
    expect(header(headers, "X-Frame-Options")).toBe("DENY");
    expect(header(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(headers, "Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(header(headers, "Permissions-Policy")).toContain("camera=()");
    expect(header(headers, "Strict-Transport-Security")).toContain(
      "includeSubDomains",
    );
    expect(header(headers, "Content-Security-Policy")).toBeDefined();
  });
});
