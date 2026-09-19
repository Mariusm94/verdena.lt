"use client";

import {
  formatMatchDate,
  kindLabel,
  type MatchKind,
} from "@/data/hegelmannSchedule";

type MatchRow = {
  id: string;
  date: string;
  group: string;
  league: string;
  stage: string;
  kind: MatchKind | string;
  home: string;
  away: string;
  score: string;
};

export default function MatchList({
  matches,
  empty = "Mačų pagal šią paiešką nėra.",
  framed = true,
}: {
  matches: MatchRow[];
  empty?: string;
  framed?: boolean;
}) {
  if (!matches.length) {
    return <p className="px-5 py-8 text-center text-ink-soft">{empty}</p>;
  }

  return (
    <div className={framed ? "overflow-x-auto rounded-[1.75rem] bg-white shadow-sm" : "overflow-x-auto"}>
      <table className="w-full min-w-[44rem] text-left">
        <thead className="bg-court-deep text-sm text-white">
          <tr>
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Lyga</th>
            <th className="px-4 py-3 font-medium">Komandos</th>
            <th className="px-4 py-3 font-medium">Rezultatas</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((item) => (
            <tr key={item.id} className="border-t border-line align-top">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-soft">{formatMatchDate(item.date)}</td>
              <td className="px-4 py-3 text-sm">
                <span className="font-medium">{item.group}</span>
                {item.league ? <span className="text-ink-soft"> · {item.league}</span> : null}
                {item.kind !== "grupe" ? (
                  <span className="mt-1 block text-xs font-semibold tracking-wide text-gold-deep uppercase">
                    {item.stage || kindLabel(item.kind as MatchKind)}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{item.home}</p>
                <p className="text-sm text-ink-soft">{item.away}</p>
              </td>
              <td className="px-4 py-3 font-display text-lg leading-6 text-court">{formatScore(item.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatScore(score: string | undefined | null) {
  const trimmed = String(score ?? "").trim();
  if (!trimmed || trimmed === "0") return "—";
  return trimmed;
}
