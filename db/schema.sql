-- Amalyn server schema. Applied by `npm run db:push`.
-- Events are append-only; the client event uuid is the idempotency key.

CREATE TABLE IF NOT EXISTS progress_events (
  id TEXT PRIMARY KEY,
  user_key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quest_started', 'increment', 'undo', 'quest_completed')),
  quest_id TEXT NOT NULL,
  delta INTEGER NOT NULL CHECK (delta IN (-1, 0, 1)),
  at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progress_events_user_idx ON progress_events (user_key);
CREATE INDEX IF NOT EXISTS progress_events_user_at_idx ON progress_events (user_key, at);
