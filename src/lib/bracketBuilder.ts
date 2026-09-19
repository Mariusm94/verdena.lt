import type { BracketMatch, BracketRound, PlayoffBracket } from "@/data/hegelmannBrackets";

export const BRACKET_SIZES = [4, 8, 16, 32] as const;
export type BracketSize = (typeof BRACKET_SIZES)[number];

const ROUND_LABELS: Record<BracketSize, string[]> = {
  4: ["Pusfinalis", "Finalas"],
  8: ["Ketvirtfinalis", "Pusfinalis", "Finalas"],
  16: ["1/8 finalas", "Ketvirtfinalis", "Pusfinalis", "Finalas"],
  32: ["1/16 finalas", "1/8 finalas", "Ketvirtfinalis", "Pusfinalis", "Finalas"],
};

export function isBracketSize(value: number): value is BracketSize {
  return (BRACKET_SIZES as readonly number[]).includes(value);
}

export function emptyMatch(home = "x", away = "x"): BracketMatch {
  return { home, away, score: "", winner: "" };
}

/** Build first-round pairings from ordered slots (bye = "x"). */
export function pairSlots(slots: string[]): BracketMatch[] {
  const matches: BracketMatch[] = [];
  for (let i = 0; i < slots.length; i += 2) {
    const home = (slots[i] || "x").trim() || "x";
    const away = (slots[i + 1] || "x").trim() || "x";
    const match = emptyMatch(home, away);
    // Auto-advance bye
    if (home !== "x" && away === "x") match.winner = home;
    if (away !== "x" && home === "x") match.winner = away;
    matches.push(match);
  }
  return matches;
}

export function rebuildRoundsFromSlots(slots: string[], size: BracketSize): BracketRound[] {
  const labels = ROUND_LABELS[size];
  const first = pairSlots(slots.slice(0, size));
  const rounds: BracketRound[] = [{ label: labels[0], matches: first }];

  let prev = first;
  for (let r = 1; r < labels.length; r += 1) {
    const matches: BracketMatch[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const home = prev[i]?.winner?.trim() || "x";
      const away = prev[i + 1]?.winner?.trim() || "x";
      const match = emptyMatch(home === "" ? "x" : home, away === "" ? "x" : away);
      if (match.home !== "x" && match.away === "x") match.winner = match.home;
      if (match.away !== "x" && match.home === "x") match.winner = match.away;
      matches.push(match);
    }
    rounds.push({ label: labels[r], matches });
    prev = matches;
  }
  return rounds;
}

export function normalizeSlots(raw: string[], size: BracketSize): string[] {
  const slots = raw.map((s) => s.trim() || "x").slice(0, size);
  while (slots.length < size) slots.push("x");
  return slots;
}

export function buildEmptyTreeBracket(input: {
  id: string;
  title: string;
  group: string;
  drawId: string;
  league: string;
  size: BracketSize;
  slots?: string[];
}): PlayoffBracket {
  const slots = normalizeSlots(input.slots ?? [], input.size);
  const rounds = rebuildRoundsFromSlots(slots, input.size);
  const final = rounds[rounds.length - 1]?.matches[0];
  return {
    id: input.id,
    title: input.title,
    group: input.group,
    drawId: input.drawId,
    league: input.league,
    kind: "finalas",
    layout: "tree",
    size: `${input.size} lentelė`,
    slots,
    rounds,
    champion: final?.winner?.trim() || undefined,
  };
}

export function parseBracketSize(sizeLabel: string | undefined, slotCount?: number): BracketSize {
  const fromLabel = Number.parseInt(String(sizeLabel ?? "").replace(/\D/g, ""), 10);
  if (isBracketSize(fromLabel)) return fromLabel;
  if (slotCount && isBracketSize(slotCount)) return slotCount;
  return 8;
}

/** Update one match and propagate winners into later rounds. */
export function applyMatchResult(
  bracket: PlayoffBracket,
  roundIndex: number,
  matchIndex: number,
  score: string,
  winner: string,
): PlayoffBracket {
  const size = parseBracketSize(bracket.size, bracket.slots?.length);
  const rounds = (bracket.rounds ?? []).map((round) => ({
    ...round,
    matches: round.matches.map((match) => ({ ...match })),
  }));

  if (!rounds[roundIndex]?.matches[matchIndex]) return bracket;

  const match = rounds[roundIndex].matches[matchIndex];
  match.score = score.trim();
  match.winner = winner.trim();

  // Rebuild later rounds from winners (keeps earlier rounds intact)
  for (let r = roundIndex + 1; r < rounds.length; r += 1) {
    const prev = rounds[r - 1].matches;
    const next = rounds[r].matches;
    for (let i = 0; i < next.length; i += 1) {
      const homeSrc = prev[i * 2];
      const awaySrc = prev[i * 2 + 1];
      const home = homeSrc?.winner?.trim() || "x";
      const away = awaySrc?.winner?.trim() || "x";
      const existing = next[i];
      const samePair = existing.home === home && existing.away === away;
      next[i] = {
        home,
        away,
        score: samePair ? existing.score : "",
        winner: samePair ? existing.winner : "",
      };
      if (next[i].home !== "x" && next[i].away === "x") next[i].winner = next[i].home;
      if (next[i].away !== "x" && next[i].home === "x") next[i].winner = next[i].away;
    }
  }

  const final = rounds[rounds.length - 1]?.matches[0];
  return {
    ...bracket,
    size: `${size} lentelė`,
    rounds,
    champion: final?.winner?.trim() || undefined,
  };
}

export function sizeLabel(size: BracketSize) {
  return `${size} lentelė`;
}
