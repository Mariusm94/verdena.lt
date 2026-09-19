"use client";

import type { LeagueDraw } from "@/data/hegelmannDraws";

function cellLabel(value: string, isSelf: boolean) {
  if (isSelf) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "0") return "—";
  return trimmed.replaceAll(" · ", "\n").replaceAll(" ", "\n");
}

export default function CrosstabTable({ draw }: { draw: LeagueDraw }) {
  const scoreCols = Math.max(draw.teams.length, 1);

  return (
    <div className="w-full overflow-x-auto rounded-[2rem] bg-white shadow-sm">
      <table className="w-full min-w-[42rem] table-fixed border-collapse text-center text-xs">
        <colgroup>
          <col className="w-[26%]" />
          {draw.teams.map((_, index) => (
            <col key={index} style={{ width: `${52 / scoreCols}%` }} />
          ))}
          <col className="w-[7%]" />
          <col className="w-[7%]" />
        </colgroup>
        <thead>
          <tr className="bg-court-deep text-white">
            <th className="sticky left-0 z-10 bg-court-deep px-3 py-3 text-left text-sm font-medium">Komanda</th>
            {draw.teams.map((_, index) => (
              <th key={index} className="px-1 py-3 font-semibold">
                {index + 1}
              </th>
            ))}
            <th className="px-2 py-3 text-sm font-medium">Taškai</th>
            <th className="px-2 py-3 text-sm font-medium">Vieta</th>
          </tr>
        </thead>
        <tbody>
          {draw.teams.map((team, rowIndex) => (
            <tr key={`${team}-${rowIndex}`} className="border-t border-line">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left text-sm font-medium break-words text-ink">
                <span className="mr-2 text-gold-deep">{rowIndex + 1}</span>
                {team}
              </th>
              {(draw.scores[rowIndex] ?? []).map((value, colIndex) => {
                const self = rowIndex === colIndex;
                const label = cellLabel(value, self);
                return (
                  <td
                    key={colIndex}
                    className={`px-1 py-2 whitespace-pre-line leading-4 ${
                      self ? "bg-court/15" : label === "—" ? "text-ink-soft/50" : "text-ink"
                    }`}
                  >
                    {self ? "" : label}
                  </td>
                );
              })}
              <td className="px-2 py-2 font-semibold text-gold-deep">{draw.points[rowIndex]}</td>
              <td className="px-2 py-2 font-display text-lg text-gold-deep">{draw.places[rowIndex]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
