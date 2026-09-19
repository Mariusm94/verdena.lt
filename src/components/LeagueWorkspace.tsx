"use client";

import Link from "next/link";
import CrosstabTable from "@/components/CrosstabTable";
import KnockoutBracket from "@/components/KnockoutBracket";
import MatchList from "@/components/MatchList";
import type { LeagueDraw } from "@/data/hegelmannDraws";
import type { PlayoffBracket } from "@/data/hegelmannBrackets";

type WorkspaceMatch = {
  id: string;
  date: string;
  group: string;
  league: string;
  stage: string;
  kind: "grupe" | "finalas" | "paguoda" | "trecia" | "pusfinalis" | "lentele";
  home: string;
  away: string;
  score: string;
};

export default function LeagueWorkspace({
  slug,
  draw,
  brackets,
  matches,
}: {
  slug: string;
  draw: LeagueDraw;
  brackets: PlayoffBracket[];
  matches: WorkspaceMatch[];
}) {
  return (
    <div className="space-y-10">
      <CrosstabTable draw={draw} />

      {brackets.length ? (
        <div className="space-y-8">
          {brackets.map((bracket) => (
            <KnockoutBracket key={bracket.id} bracket={bracket} />
          ))}
        </div>
      ) : null}

      {matches.length ? (
        <div className="space-y-4">
          <h2 className="font-display text-3xl">Mačai</h2>
          <MatchList matches={matches} empty="Šioje lygoje mačų dar nėra." />
        </div>
      ) : null}

      <p className="text-sm text-ink-soft">
        <Link href={`/turnyrai/${slug}#lenteles`} className="font-semibold text-court">
          ← visos lygos
        </Link>
      </p>
    </div>
  );
}
