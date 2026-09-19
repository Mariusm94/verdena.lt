import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import PlayersView from "@/app/zaidejai/PlayersView";
import { getPlayerStats, listMembers } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/zaidejai");
}
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [members, playerStats] = await Promise.all([listMembers(), getPlayerStats()]);
  return <PlayersView members={members} playerStats={playerStats} />;
}
