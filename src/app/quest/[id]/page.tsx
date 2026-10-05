import { MissingQuest } from "@/components/missing-quest";
import { assertLaunchReady, getPublicQuest, publicQuests } from "@/lib/content";
import { QuestDetail } from "./quest-detail";

export function generateStaticParams() {
  // Tripwire first: a production build with nothing scholar-reviewed must
  // fail loudly here instead of deploying an empty catalog.
  assertLaunchReady();
  return publicQuests().map((quest) => ({ id: quest.id }));
}

export default async function QuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // The public gate applies to deep links too, not just the Explore list,
  // so unreviewed content is unreachable in production.
  return getPublicQuest(id) ? <QuestDetail questId={id} /> : <MissingQuest />;
}
