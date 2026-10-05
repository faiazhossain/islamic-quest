import postgres from "postgres";

let client: postgres.Sql | null = null;

/**
 * Lazily-created Postgres client. Returns null until DATABASE_URL exists,
 * so routes can degrade to "sync not configured" instead of crashing.
 */
export function getSql(): postgres.Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= postgres(url, { prepare: false, max: 5 });
  return client;
}
