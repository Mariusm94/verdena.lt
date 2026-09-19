"use client";

import { isBye, type BracketMatch, type PlayoffBracket } from "@/data/hegelmannBrackets";

function displayName(name: string) {
  if (isBye(name)) return "×";
  return name;
}

function TeamSlot({ name, winner }: { name: string; winner?: boolean }) {
  const bye = isBye(name);
  return (
    <div
      className={`min-w-52 max-w-64 rounded-lg border px-3 py-2 text-sm leading-5 ${
        bye
          ? "border-dashed border-line text-ink-soft"
          : winner
            ? "border-gold bg-gold/10 font-semibold text-court-deep"
            : "border-line bg-white"
      }`}
    >
      {displayName(name)}
    </div>
  );
}

function MatchStack({ match }: { match: BracketMatch }) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-1">
        <TeamSlot name={match.home} winner={Boolean(match.winner) && match.winner === match.home} />
        {match.score ? (
          <p className="px-1 text-center text-xs font-semibold tracking-wide text-gold-deep">{match.score}</p>
        ) : (
          <span className="h-4" />
        )}
        <TeamSlot name={match.away} winner={Boolean(match.winner) && match.winner === match.away} />
      </div>
      <div className="ml-1 h-12 w-5 rounded-r-lg border-y border-r border-line" />
    </div>
  );
}

function TreeView({ bracket }: { bracket: PlayoffBracket }) {
  const rounds = bracket.rounds ?? [];
  return (
    <div className="overflow-x-auto px-4 py-8">
      <div className="flex min-w-max items-stretch gap-6">
        {rounds.map((round) => (
          <div key={round.label} className="flex flex-col">
            <p className="mb-4 text-center text-xs font-semibold tracking-[0.2em] text-gold-deep uppercase">
              {round.label}
            </p>
            <div className="flex flex-1 flex-col justify-around gap-8">
              {round.matches.map((match, index) => (
                <MatchStack key={`${round.label}-${index}`} match={match} />
              ))}
            </div>
          </div>
        ))}
        {bracket.champion ? (
          <div className="flex flex-col">
            <p className="mb-4 text-center text-xs font-semibold tracking-[0.2em] text-gold-deep uppercase">Nugalėtojai</p>
            <div className="flex flex-1 items-center">
              <TeamSlot name={bracket.champion} winner />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MatrixView({ bracket }: { bracket: PlayoffBracket }) {
  const teams = bracket.teams ?? [];
  const scores = bracket.scores ?? [];
  const points = bracket.points ?? [];
  const places = bracket.places ?? [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-center text-sm">
        <thead>
          <tr className="bg-paper text-ink-soft">
            <th className="px-3 py-2 text-left font-medium">Komanda</th>
            {teams.map((_, index) => (
              <th key={index} className="px-2 py-2 font-semibold">
                {index + 1}
              </th>
            ))}
            <th className="px-3 py-2 font-medium">Taškai</th>
            <th className="px-3 py-2 font-medium">Vieta</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, row) => (
            <tr key={team} className="border-t border-line">
              <th className="bg-white px-3 py-2 text-left font-medium">
                <span className="mr-2 text-gold-deep">{row + 1}</span>
                {team}
              </th>
              {teams.map((_, col) => {
                const self = row === col;
                const value = scores[row]?.[col] ?? "";
                const empty = !value || value === "0";
                return (
                  <td key={col} className={`px-2 py-2 ${self ? "bg-court/10" : empty ? "text-ink-soft/40" : ""}`}>
                    {self ? "" : empty ? "—" : value}
                  </td>
                );
              })}
              <td className="px-3 py-2 font-semibold">{points[row] ?? 0}</td>
              <td className="px-3 py-2 font-display text-lg text-gold-deep">{places[row] || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KnockoutBracket({ bracket }: { bracket: PlayoffBracket }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
      <div className="bg-court-deep px-5 py-4 text-white">
        <p className="text-xs tracking-widest text-gold uppercase">
          {bracket.size}
          {bracket.league ? ` · ${bracket.group} ${bracket.league}` : ` · ${bracket.group}`}
        </p>
        <h3 className="font-display text-2xl md:text-3xl">{bracket.title}</h3>
      </div>
      {bracket.layout === "tree" ? <TreeView bracket={bracket} /> : <MatrixView bracket={bracket} />}
    </section>
  );
}
