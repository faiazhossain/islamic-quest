// Plain status counts for the outreach store. Deliberately minimal: the
// workflow tracks where a post has been shared and what is still pending;
// it does not measure funnels, conversion, or engagement.

import type { Community, OutreachStatus } from "./types.ts";
import { STATUSES } from "./types.ts";

export interface StoreStats {
  total: number;
  counts: Record<OutreachStatus, number>;
}

export function computeStats(communities: Community[]): StoreStats {
  const counts = {} as Record<OutreachStatus, number>;
  for (const status of STATUSES) counts[status] = 0;
  for (const community of communities) counts[community.status] += 1;
  return { total: communities.length, counts };
}
