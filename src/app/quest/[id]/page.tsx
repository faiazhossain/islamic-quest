import { QUESTS } from "@/lib/content";
import { QuestDetail } from "./quest-detail";

export function generateStaticParams() {
  return QUESTS.map((quest) => ({ id: quest.id }));
}

export default async function QuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestDetail questId={id} />;
}
