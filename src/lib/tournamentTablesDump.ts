import type { LeagueDraw } from "@/data/hegelmannDraws";
import type { PlayoffBracket } from "@/data/hegelmannBrackets";
import cheatless from "@/data/tournament-tables/cheatless-2026-27.json";
import dextera from "@/data/tournament-tables/dextera-2026-27.json";
import hegelmann2025 from "@/data/tournament-tables/hegelmann-2025.json";
import hegelmann2026 from "@/data/tournament-tables/hegelmann-2026.json";
import kalviu from "@/data/tournament-tables/kalviu-taure.json";
import neodenta from "@/data/tournament-tables/neodenta-2025-26.json";
import termopalas from "@/data/tournament-tables/termopalas-2026-27.json";
import vasara from "@/data/tournament-tables/vasara-belvilyje.json";

export type DumpMatch = {
  home: string;
  away: string;
  score?: string;
  previousScore?: string;
  stage?: string;
  playedAt?: string | null;
  status?: string;
};

export type DumpBracket = {
  externalId: string;
  title: string;
  league: string;
  groupName?: string;
  payload: string;
};

export type DumpDraw = {
  externalKey: string;
  groupName: string;
  title: string;
  teams: string;
  points: string;
  places: string;
  scores: string;
  matches?: DumpMatch[];
  brackets?: DumpBracket[];
};

export type TournamentDump = {
  slug: string;
  title?: string;
  season?: string;
  status?: string;
  draws: DumpDraw[];
};

const dumps: Record<string, TournamentDump> = {
  "cheatless-2026-27": cheatless as TournamentDump,
  "dextera-2026-27": dextera as TournamentDump,
  "hegelmann-2025": hegelmann2025 as TournamentDump,
  "hegelmann-2026": hegelmann2026 as TournamentDump,
  "kalviu-taure": kalviu as TournamentDump,
  "neodenta-2025-26": neodenta as TournamentDump,
  "termopalas-2026-27": termopalas as TournamentDump,
  "vasara-belvilyje": vasara as TournamentDump,
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadTournamentDump(slug: string): TournamentDump | null {
  return dumps[slug] ?? null;
}

export function dumpDraws(slug: string): LeagueDraw[] {
  const dump = loadTournamentDump(slug);
  if (!dump?.draws?.length) return [];
  return dump.draws.map((row) => ({
    id: row.externalKey,
    group: row.groupName,
    title: row.title,
    teams: parseJson<string[]>(row.teams, []),
    points: parseJson<number[]>(row.points, []),
    places: parseJson<number[]>(row.places, []),
    scores: parseJson<string[][]>(row.scores, []),
  }));
}

export function dumpDraw(slug: string, externalKey: string): LeagueDraw | undefined {
  return dumpDraws(slug).find((item) => item.id === externalKey);
}

export function dumpBrackets(slug: string, externalKey: string): PlayoffBracket[] {
  const dump = loadTournamentDump(slug);
  const draw = dump?.draws.find((item) => item.externalKey === externalKey);
  if (!draw?.brackets?.length) return [];
  return draw.brackets.map((row) => {
    const parsed = parseJson<PlayoffBracket | null>(row.payload, null);
    if (parsed?.id) return parsed;
    return {
      id: row.externalId,
      title: row.title,
      group: row.groupName ?? "",
      drawId: externalKey,
      league: row.league,
      kind: "lentele" as const,
      layout: "tree" as const,
      size: "",
    };
  });
}

export function dumpMatches(
  slug: string,
  externalKey: string,
  guessKind: (stage: string) => "grupe" | "finalas" | "paguoda" | "trecia" | "pusfinalis" | "lentele",
) {
  const dump = loadTournamentDump(slug);
  const draw = dump?.draws.find((item) => item.externalKey === externalKey);
  if (!draw?.matches?.length) return [];
  return draw.matches.map((item, index) => ({
    id: `dump-${slug}-${externalKey}-${index}`,
    drawId: externalKey,
    group: draw.groupName,
    league: draw.title,
    stage: item.stage ?? "",
    kind: guessKind(item.stage ?? ""),
    home: item.home,
    away: item.away,
    date: item.playedAt ?? "",
    score: item.score ?? "",
    status: item.status || "confirmed",
  }));
}
