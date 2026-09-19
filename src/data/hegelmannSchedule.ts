import schedule from "@/data/hegelmannSchedule.json";
import { hegelmannDraws, type LeagueDraw } from "@/data/hegelmannDraws";

export type MatchKind = "grupe" | "finalas" | "paguoda" | "trecia" | "pusfinalis" | "lentele";

export type HegelmannMatch = {
  id: string;
  drawId: string;
  group: string;
  league: string;
  stage: string;
  kind: MatchKind;
  home: string;
  away: string;
  date: string;
  score: string;
};

export type PlayoffStage = {
  id: string;
  title: string;
  group: string;
  drawId: string;
  league: string;
  kind: MatchKind;
  size: string;
  matchIds: string[];
};

export const hegelmannMatches = schedule.matches as HegelmannMatch[];
export const hegelmannStages = schedule.stages as PlayoffStage[];

const matchById = new Map(hegelmannMatches.map((item) => [item.id, item]));

export function foldText(value: string) {
  return value
    .toLocaleLowerCase("lt")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesQuery(haystack: string, query: string) {
  const needle = foldText(query.trim());
  if (!needle) return true;
  return foldText(haystack).includes(needle);
}

export function filterMatches(query: string, group?: string, drawId?: string) {
  return hegelmannMatches.filter((item) => {
    if (group && group !== "visos" && item.group !== group) return false;
    if (drawId && item.drawId !== drawId) return false;
    if (!query.trim()) return true;
    return matchesQuery(`${item.home} ${item.away} ${item.league} ${item.stage}`, query);
  });
}

export function stagesFor(drawId?: string, group?: string) {
  return hegelmannStages.filter((stage) => {
    if (drawId && stage.drawId !== drawId) return false;
    if (group && group !== "visos" && stage.group !== group) return false;
    return true;
  });
}

export function stageMatches(stage: PlayoffStage) {
  return stage.matchIds.map((id) => matchById.get(id)).filter((item): item is HegelmannMatch => Boolean(item));
}

export function matchesForDraw(drawId: string) {
  return hegelmannMatches.filter((item) => item.drawId === drawId);
}

export function formatMatchDate(iso: string) {
  if (!iso || iso === "0") return "—";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const months = [
    "sausio",
    "vasario",
    "kovo",
    "balandžio",
    "gegužės",
    "birželio",
    "liepos",
    "rugpjūčio",
    "rugsėjo",
    "spalio",
    "lapkričio",
    "gruodžio",
  ];
  return `${months[month - 1]} ${day} d.`;
}

export function kindLabel(kind: MatchKind) {
  const labels: Record<MatchKind, string> = {
    grupe: "Grupė",
    finalas: "Finalas",
    paguoda: "Paguoda",
    trecia: "Dėl 3 vietos",
    pusfinalis: "Pusfinalis",
    lentele: "Lentelė",
  };
  return labels[kind] ?? kind;
}

export function findPlayerDraws(query: string): { draw: LeagueDraw; place: number }[] {
  if (!query.trim()) return [];
  return hegelmannDraws
    .map((draw) => {
      const index = draw.teams.findIndex((name) => matchesQuery(name, query));
      if (index < 0) return null;
      return { draw, place: draw.places[index] };
    })
    .filter((item): item is { draw: LeagueDraw; place: number } => Boolean(item));
}
