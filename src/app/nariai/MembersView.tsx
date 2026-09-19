"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function MembersView({ members }: { members: string[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((name) => name.toLowerCase().includes(q));
  }, [members, query]);

  const letters = [...new Set(filtered.map((name) => name[0].toUpperCase()))];

  return (
    <div>
      <PageHeader
        eyebrow="Bendruomenė"
        title="Klubo nariai"
        text={`${members.length} narių — žmonės, kurie žaidžia, organizuoja ir saugo Kauno teniso klubo ritmą.`}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ieškoti nario..."
          className="w-full max-w-md rounded-full border border-line bg-white px-5 py-3 outline-none ring-gold focus:ring-2"
        />
        <p className="mt-4 text-sm text-ink-soft">
          Rodoma {filtered.length} {filtered.length === 1 ? "narys" : "narių"}
        </p>
        {filtered.length === 0 ? (
          <p className="mt-10 rounded-3xl bg-white px-6 py-10 text-ink-soft">
            Nieko nerasta. Pabandykite kitą vardą ar pavardę.
          </p>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {letters.map((letter) => (
              <div key={letter}>
                <h2 className="font-display text-3xl text-gold-deep">{letter}</h2>
                <ul className="mt-3 space-y-2">
                  {filtered
                    .filter((name) => name[0].toUpperCase() === letter)
                    .map((name) => (
                      <li key={name} className="rounded-xl bg-white px-4 py-3 text-ink">
                        {name}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
