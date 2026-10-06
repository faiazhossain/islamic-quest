/**
 * CSRF defense-in-depth for cookie-authenticated mutations. The session
 * cookie is SameSite=Lax and every mutation requires a JSON body (which a
 * cross-site form cannot forge), so cross-site writes are already blocked
 * twice; this check additionally rejects any request whose explicit Origin
 * does not match the deployment host.
 *
 * A missing Origin is allowed: non-browser clients (curl, native apps) and
 * some older browsers omit it, including on same-origin requests.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  // Behind a proxy the public host arrives in x-forwarded-host (possibly a
  // comma list); fall back to the direct Host header.
  const forwarded = request.headers.get("x-forwarded-host");
  const host =
    forwarded?.split(",")[0]?.trim() || request.headers.get("host");
  return host !== null && originHost === host;
}
