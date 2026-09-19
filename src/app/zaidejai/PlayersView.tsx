"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import type { PlayerStatsMap } from "@/lib/contentStore";
import { playerHref } from "@/data/playerSlugs";

export default function PlayersView({
  members,
  playerStats,
}: {
  members: string[];
  playerStats: PlayerStatsMap;
}) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((name) => name.toLowerCase().includes(q))
      .map((name) => ({ name, ...(playerStats[name] ?? {}) }));
  }, [members, playerStats, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Žaidėjai"
        title="Žaidėjų katalogas"
        text="Statistika skaičiuojama iš confirmed mačų rezultatų — pergalės, setai, geimai ir sužaisti mačai."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ieškoti žaidėjo..."
          className="w-full max-w-md rounded-full border border-line bg-white px-5 py-3 outline-none ring-gold focus:ring-2"
        />
        {rows.length === 0 ? (
          <p className="mt-10 rounded-3xl bg-white px-6 py-10 text-ink-soft">
            Nieko nerasta. Pabandykite kitą vardą ar pavardę.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-[2rem] bg-white shadow-sm">
            <table className="min-w-full text-left">
              <thead className="bg-court-deep text-white">
                <tr>
                  <th className="px-5 py-4">Žaidėjas</th>
                  <th className="px-5 py-4">Pergalės</th>
                  <th className="px-5 py-4">Setai</th>
                  <th className="px-5 py-4">Geimai</th>
                  <th className="px-5 py-4">Mačai</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-t border-line">
                    <td className="px-5 py-3 font-medium">
                      <Link href={playerHref(row.name)} className="text-court hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{row.wins ?? "—"}</td>
                    <td className="px-5 py-3">{row.sets ?? "—"}</td>
                    <td className="px-5 py-3">{row.games ?? "—"}</td>
                    <td className="px-5 py-3">{row.matches ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-6 text-sm text-ink-soft">
          Pilnos reitingų lentelės —{" "}
          <Link href="/reitingai" className="font-semibold text-court">
            reitingų puslapyje
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
