import { db } from "./db/db";
import {
  getUnsyncedEvents,
  markEventsSynced,
  recomputeProgress,
} from "./db/events";
import { diffServerEvents, type SyncEvent } from "./sync-merge";

export interface SyncStatus {
  enabled: boolean;
  signedIn: boolean;
  email: string | null;
}

export type SyncResult =
  | "synced"
  | "offline"
  | "disabled"
  | "signed-out"
  | "error";

// Once the server says sync is not configured, stop retrying this session.
let disabledCached = false;

export async function fetchSyncStatus(): Promise<SyncStatus | null> {
  try {
    const response = await fetch("/api/sync", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as SyncStatus;
  } catch {
    return null;
  }
}

/**
 * Pushes unsynced local events and pulls the server snapshot.
 * The local event log remains the source of truth; pulls only add
 * events missing locally, then rebuild the affected quests' progress.
 */
export async function syncNow(): Promise<SyncResult> {
  if (disabledCached) return "disabled";
  try {
    const unsynced = await getUnsyncedEvents();
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: unsynced.map((event) => ({
          id: event.id,
          type: event.type,
          questId: event.questId,
          delta: event.delta,
          at: event.at,
        })),
      }),
    });
    if (response.status === 503) {
      disabledCached = true;
      return "disabled";
    }
    if (response.status === 401) return "signed-out";
    if (!response.ok) return "error";

    const data = (await response.json()) as {
      synced: string[];
      serverEvents: SyncEvent[];
    };

    if (data.synced.length > 0) {
      await markEventsSynced(data.synced);
    }

    const localIds = new Set((await db.events.toArray()).map((event) => event.id));
    const missing = diffServerEvents(localIds, data.serverEvents ?? []);
    if (missing.length > 0) {
      await db.events.bulkPut(
        missing.map((event) => ({ ...event, synced: 1 as const })),
      );
      const questIds = [...new Set(missing.map((event) => event.questId))];
      for (const questId of questIds) {
        await recomputeProgress(questId);
      }
    }
    return "synced";
  } catch {
    return "offline";
  }
}
