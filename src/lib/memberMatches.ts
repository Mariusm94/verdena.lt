import { foldText } from "@/data/hegelmannSchedule";
import { prisma } from "@/lib/prisma";

export type MemberMatch = {
  id: string;
  home: string;
  away: string;
  score: string;
  previousScore: string;
  stage: string;
  playedAt: string;
  status: string;
  groupName: string;
  leagueTitle: string;
  tournamentTitle: string;
  tournamentSlug: string;
  drawExternalKey: string;
};

function playerInSide(side: string, playerName: string) {
  const needle = foldText(playerName.trim());
  if (!needle) return false;
  return foldText(side).includes(needle);
}

export async function listMatchesForPlayer(playerName: string): Promise<MemberMatch[]> {
  if (!playerName.trim()) return [];

  const rows = await prisma.match.findMany({
    orderBy: [{ playedAt: "asc" }, { updatedAt: "desc" }],
    include: {
      draw: {
        include: { tournament: { select: { title: true, slug: true } } },
      },
    },
  });

  return rows
    .filter((row) => playerInSide(row.home, playerName) || playerInSide(row.away, playerName))
    .map((row) => ({
      id: row.id,
      home: row.home,
      away: row.away,
      score: row.score,
      previousScore: row.previousScore,
      stage: row.stage,
      playedAt: row.playedAt ?? "",
      status: row.status,
      groupName: row.draw.groupName,
      leagueTitle: row.draw.title,
      tournamentTitle: row.draw.tournament.title,
      tournamentSlug: row.draw.tournament.slug,
      drawExternalKey: row.draw.externalKey,
    }));
}

export async function listPendingMatches() {
  return prisma.match.findMany({
    where: { status: "pending" },
    orderBy: { updatedAt: "desc" },
    include: {
      submittedBy: { select: { id: true, name: true, email: true } },
      draw: {
        include: { tournament: { select: { title: true, slug: true } } },
      },
    },
  });
}

