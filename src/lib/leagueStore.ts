import { hegelmannBrackets, type PlayoffBracket } from "@/data/hegelmannBrackets";
import { hegelmannDraws, type LeagueDraw } from "@/data/hegelmannDraws";
import { hegelmannMatches, matchesQuery } from "@/data/hegelmannSchedule";
import { prisma } from "@/lib/prisma";
import {
  dumpBrackets,
  dumpDraw,
  dumpDraws,
  dumpMatches,
  loadTournamentDump,
} from "@/lib/tournamentTablesDump";

export type { LeagueDraw, PlayoffBracket };

export type LeagueMatch = {
  id: string;
  drawId: string;
  group: string;
  league: string;
  stage: string;
  kind: "grupe" | "finalas" | "paguoda" | "trecia" | "pusfinalis" | "lentele";
  home: string;
  away: string;
  date: string;
  score: string;
  status: string;
};

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toDraw(row: {
  externalKey: string;
  groupName: string;
  title: string;
  teams: string;
  points: string;
  places: string;
  scores: string;
}): LeagueDraw {
  return {
    id: row.externalKey,
    group: row.groupName,
    title: row.title,
    teams: parseJson<string[]>(row.teams, []),
    points: parseJson<number[]>(row.points, []),
    places: parseJson<number[]>(row.places, []),
    scores: parseJson<string[][]>(row.scores, []),
  };
}

function toBracket(row: { payload: string; externalId: string; title: string; league: string; groupName: string }): PlayoffBracket {
  const parsed = parseJson<PlayoffBracket | null>(row.payload, null);
  if (parsed && parsed.id) return parsed;
  return {
    id: row.externalId,
    title: row.title,
    group: row.groupName,
    drawId: "",
    league: row.league,
    kind: "lentele",
    layout: "tree",
    size: "",
  };
}

function guessKind(stage: string): LeagueMatch["kind"] {
  const value = stage.toLocaleLowerCase("lt");
  if (value.includes("final") && value.includes("3")) return "trecia";
  if (value.includes("final")) return "finalas";
  if (value.includes("paguod")) return "paguoda";
  if (value.includes("pusfinal") || value.includes("1/2")) return "pusfinalis";
  if (value.includes("lentel") || value.includes("matrix")) return "lentele";
  if (!value || value.includes("grup")) return "grupe";
  return "lentele";
}

function staticDraws(): LeagueDraw[] {
  return hegelmannDraws;
}

function staticBrackets(drawId: string): PlayoffBracket[] {
  return hegelmannBrackets.filter((item) => item.drawId === drawId);
}

function staticMatches(draw: LeagueDraw): LeagueMatch[] {
  return hegelmannMatches
    .filter((item) => item.drawId === draw.id)
    .map((item) => ({
      id: item.id,
      drawId: item.drawId,
      group: item.group,
      league: item.league,
      stage: item.stage,
      kind: item.kind,
      home: item.home,
      away: item.away,
      date: item.date,
      score: item.score,
      status: "confirmed",
    }));
}

async function dbDrawRows(tournamentSlug: string) {
  if (!dbReady()) return null;
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: tournamentSlug },
      include: { draws: { orderBy: [{ groupName: "asc" }, { title: "asc" }] } },
    });
    if (!tournament) return null;
    return tournament.draws;
  } catch {
    return null;
  }
}

/** Fallback: Hegelmann static bundle, then JSON dumps shipped in repo. */
function fileFallbackDraws(tournamentSlug: string): LeagueDraw[] {
  if (tournamentSlug === "hegelmann-2026") return staticDraws();
  return dumpDraws(tournamentSlug);
}

function hasFileFallback(tournamentSlug: string) {
  return tournamentSlug === "hegelmann-2026" || Boolean(loadTournamentDump(tournamentSlug));
}

export async function listDraws(tournamentSlug: string): Promise<LeagueDraw[]> {
  const rows = await dbDrawRows(tournamentSlug);
  if (rows && rows.length) return rows.map(toDraw);
  return fileFallbackDraws(tournamentSlug);
}

export async function getDraw(tournamentSlug: string, externalKey: string): Promise<LeagueDraw | undefined> {
  const rows = await dbDrawRows(tournamentSlug);
  if (rows && rows.length) {
    const row = rows.find((item) => item.externalKey === externalKey);
    return row ? toDraw(row) : undefined;
  }
  if (tournamentSlug === "hegelmann-2026") {
    return hegelmannDraws.find((item) => item.id === externalKey);
  }
  return dumpDraw(tournamentSlug, externalKey);
}

export async function listBrackets(tournamentSlug: string, externalKey: string): Promise<PlayoffBracket[]> {
  if (!dbReady()) {
    if (tournamentSlug === "hegelmann-2026") return staticBrackets(externalKey);
    return dumpBrackets(tournamentSlug, externalKey);
  }
  try {
    const draw = await prisma.leagueDraw.findFirst({
      where: {
        externalKey,
        tournament: { slug: tournamentSlug },
      },
      include: { brackets: { orderBy: { title: "asc" } } },
    });
    if (draw?.brackets.length) return draw.brackets.map(toBracket);
    if (tournamentSlug === "hegelmann-2026") return staticBrackets(externalKey);
    return dumpBrackets(tournamentSlug, externalKey);
  } catch {
    if (tournamentSlug === "hegelmann-2026") return staticBrackets(externalKey);
    return dumpBrackets(tournamentSlug, externalKey);
  }
}

export async function listMatches(tournamentSlug: string, externalKey: string): Promise<LeagueMatch[]> {
  if (!dbReady()) {
    if (tournamentSlug === "hegelmann-2026") {
      const draw = hegelmannDraws.find((item) => item.id === externalKey);
      return draw ? staticMatches(draw) : [];
    }
    return dumpMatches(tournamentSlug, externalKey, guessKind);
  }
  try {
    const draw = await prisma.leagueDraw.findFirst({
      where: {
        externalKey,
        tournament: { slug: tournamentSlug },
      },
      include: { matches: { orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }] } },
    });
    if (draw && draw.matches.length) {
      // Viešai: confirmed + scheduled (artimiausi); pending rodo seną score.
      return draw.matches
        .filter((item) => item.status === "confirmed" || item.status === "pending" || item.status === "scheduled")
        .map((item) => ({
          id: item.id,
          drawId: draw.externalKey,
          group: draw.groupName,
          league: draw.title,
          stage: item.stage,
          kind: guessKind(item.stage),
          home: item.home,
          away: item.away,
          date: item.playedAt ?? "",
          score:
            item.status === "pending"
              ? (item.previousScore ?? "")
              : item.status === "scheduled"
                ? ""
                : (item.score ?? ""),
          status: item.status === "pending" ? "confirmed" : item.status,
        }));
    }
    // DB has draw row but no matches (or no draw) — use JSON dump / static
    if (draw && !draw.matches.length) {
      if (tournamentSlug === "hegelmann-2026") {
        const staticDraw = hegelmannDraws.find((item) => item.id === externalKey);
        return staticDraw ? staticMatches(staticDraw) : [];
      }
      return dumpMatches(tournamentSlug, externalKey, guessKind);
    }
    if (tournamentSlug === "hegelmann-2026") {
      const staticDraw = hegelmannDraws.find((item) => item.id === externalKey);
      return staticDraw ? staticMatches(staticDraw) : [];
    }
    return dumpMatches(tournamentSlug, externalKey, guessKind);
  } catch {
    if (tournamentSlug === "hegelmann-2026") {
      const staticDraw = hegelmannDraws.find((item) => item.id === externalKey);
      return staticDraw ? staticMatches(staticDraw) : [];
    }
    return dumpMatches(tournamentSlug, externalKey, guessKind);
  }
}

export function findPlayerDrawsIn(draws: LeagueDraw[], query: string): { draw: LeagueDraw; place: number }[] {
  if (!query.trim()) return [];
  return draws
    .map((draw) => {
      const index = draw.teams.findIndex((name) => matchesQuery(name, query));
      if (index < 0) return null;
      return { draw, place: draw.places[index] ?? index + 1 };
    })
    .filter((item): item is { draw: LeagueDraw; place: number } => Boolean(item));
}

export function emptyScores(size: number): string[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? "" : "0")),
  );
}

export function parseNumberList(value: string): number[] {
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((n) => Number.isFinite(n));
}

export { matchesQuery, hasFileFallback };
