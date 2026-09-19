"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import type { RankingTableView } from "@/lib/contentStore";
import { playerHref } from "@/data/playerSlugs";

export default function RankingsView({ tables }: { tables: RankingTableView[] }) {
  const [activeId, setActiveId] = useState(tables[0]?.id ?? "");
  const active = useMemo(
    () => tables.find((table) => table.id === activeId) ?? tables[0],
    [tables, activeId],
  );

  if (!tables.length || !active) {
    return (
      <div>
        <PageHeader eyebrow="Statistika" title="Reitingai" text="Lentelių kol kas nėra." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Statistika"
        title="Reitingai"
        text="Reitingai skaičiuojami iš confirmed mačų — pergalės, setai, geimai ir sužaisti mačai."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap gap-2">
          {tables.map((table) => {
            const selected = table.id === active.id;
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => setActiveId(table.id)}
                className={
                  selected
                    ? "rounded-full bg-court-deep px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft hover:border-court hover:text-court"
                }
              >
                {table.title}
              </button>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-sm">
          <div className="border-b border-line px-6 py-5">
            <h2 className="font-display text-3xl">{active.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{active.rows.length} žaidėjai</p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-court-deep text-white">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">Nr.</th>
                  <th className="px-6 py-4 text-sm font-medium">Žaidėjas</th>
                  <th className="px-6 py-4 text-sm font-medium">{active.unit}</th>
                </tr>
              </thead>
              <tbody>
                {active.rows.map((row) => (
                  <tr key={`${active.id}-${row.rank}-${row.name}`} className="border-t border-line">
                    <td className="px-6 py-3 font-display text-xl text-gold-deep">{row.rank}</td>
                    <td className="px-6 py-3 font-medium">
                      <Link href={playerHref(row.name)} className="text-court hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          Pilną žaidėjų katalogą rasite{" "}
          <Link href="/zaidejai" className="font-semibold text-court">
            žaidėjų puslapyje
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
