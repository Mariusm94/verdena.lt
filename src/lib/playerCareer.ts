import { foldText } from "@/data/hegelmannSchedule";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/newsStore";
import { playerSlugByName } from "@/data/playerSlugs";

export const PLAYER_CAREER_CACHE_KEY = "playerCareerCache";

export type CareerStats = {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  singlesMatches: number;
  doublesMatches: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
};

export type PlayerCareerCache = {
  updatedAt: string;
  byName: Record<string, CareerStats>;
};

export type CareerMatchInput = {
  home: string;
  away: string;
  score: string;
  status?: string;
};

export type ScoreDetail = {
  homeSets: number;
  awaySets: number;
  homeGames: number;
  awayGames: number;
  winner: "home" | "away" | null;
};

/** Split "A / B" doubles side into player names. */
export function splitSide(side: string): string[] {
  return side
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseScoreDetail(score: string): ScoreDetail | null {
  const trimmed = score.trim();
  if (!trimmed) return null;

  let homeSets = 0;
  let awaySets = 0;
  let homeGames = 0;
  let awayGames = 0;
  let parsedSets = 0;

  for (const set of trimmed.split(/\s+/).filter(Boolean)) {
    const parts = set.split(/[:\-]/);
    if (parts.length !== 2) continue;
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    parsedSets += 1;
    homeGames += a;
    awayGames += b;
    if (a > b) homeSets += 1;
    else if (b > a) awaySets += 1;
  }

  if (parsedSets === 0) return null;

  let winner: "home" | "away" | null = null;
  if (homeSets > awaySets) winner = "home";
  else if (awaySets > homeSets) winner = "away";

  return { homeSets, awaySets, homeGames, awayGames, winner };
}

function emptyStats(name: string): CareerStats {
  return {
    name,
    matches: 0,
    wins: 0,
    losses: 0,
    singlesMatches: 0,
    doublesMatches: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
  };
}

function applyMatchToPlayers(
  byFold: Map<string, CareerStats>,
  names: string[],
  won: boolean,
  isDoubles: boolean,
  setsWon: number,
  setsLost: number,
  gamesWon: number,
  gamesLost: number,
  canonicalByFold: Map<string, string>,
) {
  for (const raw of names) {
    const fold = foldText(raw);
    if (!fold) continue;
    const canonical = canonicalByFold.get(fold) ?? raw.trim();
    let stats = byFold.get(fold);
    if (!stats) {
      stats = emptyStats(canonical);
      byFold.set(fold, stats);
    }
    stats.matches += 1;
    if (won) stats.wins += 1;
    else stats.losses += 1;
    if (isDoubles) stats.doublesMatches += 1;
    else stats.singlesMatches += 1;
    stats.setsWon += setsWon;
    stats.setsLost += setsLost;
    stats.gamesWon += gamesWon;
    stats.gamesLost += gamesLost;
  }
}

/** Aggregate career stats from match rows. Optional canonical names (ClubMember). */
export function aggregateCareerStats(
  matches: CareerMatchInput[],
  canonicalNames: string[] = [],
): Record<string, CareerStats> {
  const canonicalByFold = new Map<string, string>();
  for (const name of canonicalNames) {
    const fold = foldText(name);
    if (fold && !canonicalByFold.has(fold)) canonicalByFold.set(fold, name);
  }

  const byFold = new Map<string, CareerStats>();

  for (const match of matches) {
    if (match.status && match.status !== "confirmed") continue;
    const detail = parseScoreDetail(match.score);
    if (!detail || !detail.winner) continue;

    const homePlayers = splitSide(match.home);
    const awayPlayers = splitSide(match.away);
    if (!homePlayers.length || !awayPlayers.length) continue;

    const isDoubles = homePlayers.length > 1 || awayPlayers.length > 1;
    const homeWon = detail.winner === "home";

    applyMatchToPlayers(
      byFold,
      homePlayers,
      homeWon,
      isDoubles,
      detail.homeSets,
      detail.awaySets,
      detail.homeGames,
      detail.awayGames,
      canonicalByFold,
    );
    applyMatchToPlayers(
      byFold,
      awayPlayers,
      !homeWon,
      isDoubles,
      detail.awaySets,
      detail.homeSets,
      detail.awayGames,
      detail.homeGames,
      canonicalByFold,
    );
  }

  const byName: Record<string, CareerStats> = {};
  for (const stats of byFold.values()) {
    byName[stats.name] = stats;
  }
  return byName;
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function rankingTablesFromCareer(byName: Record<string, CareerStats>) {
  const players = Object.values(byName).filter((p) => p.matches > 0);

  function table(
    id: string,
    title: string,
    unit: string,
    valueOf: (p: CareerStats) => number,
  ) {
    const rows = [...players]
      .sort((a, b) => valueOf(b) - valueOf(a) || a.name.localeCompare(b.name, "lt"))
      .map((p, index) => ({
        rank: index + 1,
        name: p.name,
        value: valueOf(p),
      }));
    return { id, title, unit, rows };
  }

  return [
    table("wins", "Daugiausiai pasiekta pergalių", "Pergalės", (p) => p.wins),
    table("sets", "Daugiausiai laimėta setų", "Setai", (p) => p.setsWon),
    table("games", "Daugiausiai laimėta geimų", "Geimai", (p) => p.gamesWon),
    table("matches", "Daugiausiai sužaista mačų", "Mačai", (p) => p.matches),
  ];
}

export function playerStatsMapFromCareer(byName: Record<string, CareerStats>) {
  const out: Record<string, { wins?: number; sets?: number; games?: number; matches?: number }> =
    {};
  for (const [name, stats] of Object.entries(byName)) {
    out[name] = {
      wins: stats.wins,
      sets: stats.setsWon,
      games: stats.gamesWon,
      matches: stats.matches,
    };
  }
  return out;
}

export function resolvePlayerNameFromSlug(
  slug: string,
  members: string[],
  byName: Record<string, CareerStats>,
): string | null {
  const fromMap = Object.entries(playerSlugByName).find(([, value]) => value === slug)?.[0];
  if (fromMap) return fromMap;
  const fromCareer = Object.keys(byName).find((name) => slugify(name) === slug);
  if (fromCareer) return fromCareer;
  return members.find((member) => slugify(member) === slug) ?? null;
}

export async function loadPlayerCareerCache(): Promise<PlayerCareerCache | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: PLAYER_CAREER_CACHE_KEY } });
    if (!row) return null;
    const parsed = JSON.parse(row.value) as PlayerCareerCache;
    if (!parsed?.byName || typeof parsed.byName !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function recomputePlayerCareerStats(): Promise<PlayerCareerCache> {
  const [matches, members] = await Promise.all([
    prisma.match.findMany({
      where: { status: "confirmed", NOT: { score: "" } },
      select: { home: true, away: true, score: true, status: true },
    }),
    prisma.clubMember.findMany({
      where: { published: true },
      select: { name: true },
    }),
  ]);

  const byName = aggregateCareerStats(
    matches,
    members.map((m) => m.name),
  );

  const cache: PlayerCareerCache = {
    updatedAt: new Date().toISOString(),
    byName,
  };

  await prisma.siteSetting.upsert({
    where: { key: PLAYER_CAREER_CACHE_KEY },
    update: { value: JSON.stringify(cache) },
    create: { key: PLAYER_CAREER_CACHE_KEY, value: JSON.stringify(cache) },
  });

  return cache;
}

export async function getOrRecomputePlayerCareerCache(): Promise<PlayerCareerCache> {
  const existing = await loadPlayerCareerCache();
  if (existing && Object.keys(existing.byName).length > 0) return existing;
  return recomputePlayerCareerStats();
}
