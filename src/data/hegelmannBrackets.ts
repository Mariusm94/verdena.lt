import bracketsFile from "@/data/hegelmannBrackets.json";
import { foldText, matchesQuery } from "@/data/hegelmannSchedule";

export type BracketMatch = {
  home: string;
  away: string;
  score: string;
  winner: string;
};

export type BracketRound = {
  label: string;
  matches: BracketMatch[];
};

export type PlayoffBracket = {
  id: string;
  title: string;
  group: string;
  drawId: string;
  league: string;
  kind: string;
  layout: "tree" | "matrix";
  size: string;
  slots?: string[];
  rounds?: BracketRound[];
  champion?: string;
  teams?: string[];
  scores?: string[][];
  points?: number[];
  places?: number[];
};

export const hegelmannBrackets = bracketsFile.brackets as PlayoffBracket[];

export function bracketsFor(drawId?: string, group?: string, query = "") {
  return hegelmannBrackets.filter((item) => {
    if (drawId && item.drawId !== drawId) return false;
    if (group && group !== "visos" && item.group !== group) return false;
    if (!query.trim()) return true;
    const haystack = [
      item.title,
      item.league,
      item.champion,
      ...(item.slots ?? []),
      ...(item.teams ?? []),
      ...(item.rounds ?? []).flatMap((round) => round.matches.flatMap((match) => [match.home, match.away])),
    ].join(" ");
    return matchesQuery(haystack, query);
  });
}

export function isBye(name: string) {
  const value = foldText(name.trim());
  return !value || value === "x" || value === "-" || value === "—";
}
