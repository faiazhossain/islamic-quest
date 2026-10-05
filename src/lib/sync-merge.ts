import type { ProgressEventType } from "./db/db";

/** Wire shape of a progress event as it travels to and from the server. */
export interface SyncEvent {
  id: string;
  type: ProgressEventType;
  questId: string;
  delta: number;
  at: number;
}

/**
 * Returns the server events missing from the local log, matched by the
 * client-generated uuid. On the (practically impossible) id collision with
 * different content, local wins - sync never overwrites local history.
 */
export function diffServerEvents(
  localIds: ReadonlySet<string>,
  serverEvents: SyncEvent[],
): SyncEvent[] {
  return serverEvents.filter((event) => !localIds.has(event.id));
}
