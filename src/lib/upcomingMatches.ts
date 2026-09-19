import { prisma } from "@/lib/prisma";

export type UpcomingMatch = {
  id: string;
  home: string;
  away: string;
  date: string;
  stage: string;
  group: string;
  league: string;
  drawKey: string;
};

/** Matches without a confirmed score — shown as upcoming on tournament pages. */
export async function listUpcomingMatches(tournamentSlug: string, limit = 40): Promise<UpcomingMatch[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await prisma.match.findMany({
      where: {
        draw: { tournament: { slug: tournamentSlug } },
        OR: [{ status: "scheduled" }, { AND: [{ status: "confirmed" }, { score: "" }] }],
      },
      orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }],
      take: limit,
      include: {
        draw: { select: { externalKey: true, groupName: true, title: true } },
      },
    });
    return rows.map((item) => ({
      id: item.id,
      home: item.home,
      away: item.away,
      date: item.playedAt ?? "",
      stage: item.stage,
      group: item.draw.groupName,
      league: item.draw.title,
      drawKey: item.draw.externalKey,
    }));
  } catch {
    return [];
  }
}
