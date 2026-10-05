const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window limiter keyed per user. Per-instance only; the documented
 * production upgrade is a shared store (Redis or Postgres) if the app is
 * ever served from multiple instances.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
