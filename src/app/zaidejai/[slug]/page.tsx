import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlayerProfileView from "@/app/zaidejai/[slug]/PlayerProfileView";
import { getPlayerBySlug } from "@/lib/contentStore";
import { listMatchesForPlayer } from "@/lib/memberMatches";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  return { title: player?.name ?? "Žaidėjas" };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const matches = await listMatchesForPlayer(player.name);
  const recent = matches
    .filter((m) => m.status === "confirmed" && m.score.trim())
    .slice(-12)
    .reverse();

  return (
    <PlayerProfileView name={player.name} career={player.career} recentMatches={recent} />
  );
}
