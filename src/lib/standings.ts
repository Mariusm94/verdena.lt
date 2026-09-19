import { emptyScores } from "@/lib/leagueStore";
import { prisma } from "@/lib/prisma";

export type StandingsMatch = {
  home: string;
  away: string;
  score: string;
  status: string;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Apverčia setų rezultatus: `6:4 6:2` → `4:6 2:6`. */
export function flipScore(score: string): string {
  return score
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((set) => {
      const colon = set.indexOf(":");
      const dash = set.indexOf("-");
      let sep = ":";
      let left = "";
      let right = "";
      if (colon >= 0) {
        sep = ":";
        left = set.slice(0, colon);
        right = set.slice(colon + 1);
      } else if (dash >= 0) {
        sep = "-";
        left = set.slice(0, dash);
        right = set.slice(dash + 1);
      } else {
        return set;
      }
      return `${right}${sep}${left}`;
    })
    .join(" ");
}

/**
 * Laimėtojas = daugiau laimėtų setų.
 * Score visada namų (home) perspektyva: `6:4 3:6 10:8`.
 */
export function parseTennisMatchWinner(
  score: string,
  _home?: string,
  _away?: string,
): "home" | "away" | null {
  const trimmed = score.trim();
  if (!trimmed) return null;

  let homeSets = 0;
  let awaySets = 0;

  for (const set of trimmed.split(/\s+/).filter(Boolean)) {
    const parts = set.split(/[:\-]/);
    if (parts.length !== 2) continue;
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    if (a > b) homeSets += 1;
    else if (b > a) awaySets += 1;
  }

  if (homeSets > awaySets) return "home";
  if (awaySets > homeSets) return "away";
  return null;
}

export function computeStandingsFromMatches(
  teams: string[],
  matches: StandingsMatch[],
): { points: number[]; places: number[]; scores: string[][] } {
  const n = teams.length;
  const points = teams.map(() => 0);
  const scores = emptyScores(n);
  const cellParts: string[][][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => [] as string[]),
  );

  const indexOf = (name: string) => teams.indexOf(name);

  for (const match of matches) {
    if (match.status !== "confirmed") continue;
    const score = match.score.trim();
    if (!score) continue;

    const homeIndex = indexOf(match.home);
    const awayIndex = indexOf(match.away);
    if (homeIndex < 0 || awayIndex < 0 || homeIndex === awayIndex) continue;

    cellParts[homeIndex][awayIndex].push(score);
    cellParts[awayIndex][homeIndex].push(flipScore(score));

    const winner = parseTennisMatchWinner(score, match.home, match.away);
    if (winner === "home") points[homeIndex] += 1;
    else if (winner === "away") points[awayIndex] += 1;
  }

  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if (i === j) {
        scores[i][j] = "";
      } else if (cellParts[i][j].length === 0) {
        scores[i][j] = "0";
      } else {
        scores[i][j] = cellParts[i][j].join(" · ");
      }
    }
  }

  const order = teams.map((_, index) => index).sort((a, b) => {
    if (points[b] !== points[a]) return points[b] - points[a];
    return a - b;
  });
  const places = teams.map(() => 0);
  order.forEach((teamIndex, rank) => {
    places[teamIndex] = rank + 1;
  });

  return { points, places, scores };
}

/** Perskaičiuoja points / places / scores iš confirmed mačų ir įrašo į LeagueDraw. */
export async function recomputeAndSaveDrawStandings(drawId: string) {
  const draw = await prisma.leagueDraw.findUnique({
    where: { id: drawId },
    include: { matches: true },
  });
  if (!draw) return;

  const teams = parseJson<string[]>(draw.teams, []);
  const { points, places, scores } = computeStandingsFromMatches(teams, draw.matches);

  await prisma.leagueDraw.update({
    where: { id: drawId },
    data: {
      points: JSON.stringify(points),
      places: JSON.stringify(places),
      scores: JSON.stringify(scores),
    },
  });
}
