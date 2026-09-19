"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LeagueDraw } from "@/data/hegelmannDraws";
import { matchesQuery } from "@/data/hegelmannSchedule";
import { ltTeams } from "@/lib/lt";

function findPlayerDrawsIn(draws: LeagueDraw[], query: string): { draw: LeagueDraw; place: number }[] {
  if (!query.trim()) return [];
  return draws
    .map((draw) => {
      const index = draw.teams.findIndex((name) => matchesQuery(name, query));
      if (index < 0) return null;
      return { draw, place: draw.places[index] ?? index + 1 };
    })
    .filter((item): item is { draw: LeagueDraw; place: number } => Boolean(item));
}

export default function TournamentExplorer({ slug, draws }: { slug: string; draws: LeagueDraw[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("visos");

  const groups = useMemo(
    () => ["visos", ...Array.from(new Set(draws.map((item) => item.group)))],
    [draws],
  );

  const playerDraws = useMemo(() => findPlayerDrawsIn(draws, query), [draws, query]);
  const filteredDraws = draws.filter((draw) => {
    if (group !== "visos" && draw.group !== group) return false;
    if (!query.trim()) return true;
    if (playerDraws.some((item) => item.draw.id === draw.id)) return true;
    return matchesQuery(`${draw.group} ${draw.title} ${draw.teams.join(" ")}`, query);
  });

  if (!draws.length) {
    return (
      <p className="rounded-[1.75rem] bg-white px-5 py-8 text-center text-ink-soft shadow-sm">
        Šiam turnyrui lygų dar nėra.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <label className="block text-sm font-semibold text-ink-soft" htmlFor="zaidejo-paieska">
          Rask savo lygą
        </label>
        <input
          id="zaidejo-paieska"
          suppressHydrationWarning
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pvz. Kavolienė, Masters, Žaliūnas"
          className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-lg outline-none ring-gold focus:ring-2"
        />
        {playerDraws.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {playerDraws.map(({ draw, place }) => (
              <Link
                key={draw.id}
                href={`/turnyrai/${slug}/lenteles/${draw.id}`}
                className="rounded-full bg-court px-3 py-1.5 text-sm font-semibold text-white"
              >
                {draw.group} {draw.title} · {place} vieta
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGroup(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              group === item ? "bg-court-deep text-white" : "border border-line bg-white"
            }`}
          >
            {item === "visos" ? "Visos grupės" : item}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredDraws.map((draw) => {
          const place = playerDraws.find((item) => item.draw.id === draw.id)?.place;
          return (
            <Link
              key={draw.id}
              href={`/turnyrai/${slug}/lenteles/${draw.id}`}
              className="flex flex-col gap-2 rounded-[1.75rem] bg-white px-5 py-4 shadow-sm transition hover:bg-paper md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs tracking-widest text-gold-deep uppercase">{draw.group}</p>
                <h3 className="font-display text-2xl">{draw.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {ltTeams(draw.teams.length)}
                  {place ? ` · tavo vieta ${place}` : ""}
                </p>
              </div>
              <span className="font-semibold text-court">Atidaryti lentelę →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
