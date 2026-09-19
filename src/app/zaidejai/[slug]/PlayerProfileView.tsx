import Link from "next/link";
import type { CareerStats } from "@/lib/playerCareer";
import { pct } from "@/lib/playerCareer";
import type { MemberMatch } from "@/lib/memberMatches";
import PageHeader from "@/components/PageHeader";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white px-5 py-5 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{label}</p>
      <p className="mt-2 font-display text-4xl text-court">{value}</p>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
    </div>
  );
}

function emptyCareer(name: string): CareerStats {
  return {
    name,
    matches: 0,
    wins: 0,
    losses: 0,
    singlesMatches: 0,
    doublesMatches: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
  };
}

export default function PlayerProfileView({
  name,
  career,
  recentMatches,
}: {
  name: string;
  career: CareerStats | null;
  recentMatches: MemberMatch[];
}) {
  const stats = career ?? emptyCareer(name);
  const hasCareer = stats.matches > 0;
  const decided = stats.wins + stats.losses;
  const setTotal = stats.setsWon + stats.setsLost;
  const gameTotal = stats.gamesWon + stats.gamesLost;

  return (
    <div>
      <PageHeader eyebrow="Žaidėjas" title={name} />
      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        {hasCareer ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Mačai" value={stats.matches} />
              <StatCard
                label="Pergalės"
                value={stats.wins}
                hint={`${pct(stats.wins, decided)} % · pralaimėjimai ${stats.losses}`}
              />
              <StatCard
                label="Setai"
                value={`${stats.setsWon}–${stats.setsLost}`}
                hint={`${pct(stats.setsWon, setTotal)} % laimėta`}
              />
              <StatCard
                label="Geimai"
                value={`${stats.gamesWon}–${stats.gamesLost}`}
                hint={`${pct(stats.gamesWon, gameTotal)} % laimėta`}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Vienetai"
                value={stats.singlesMatches}
                hint={`${pct(stats.singlesMatches, stats.matches)} % mačų`}
              />
              <StatCard
                label="Dvejetai"
                value={stats.doublesMatches}
                hint={`${pct(stats.doublesMatches, stats.matches)} % mačų`}
              />
            </div>
          </>
        ) : (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-ink-soft shadow-sm">
            Kol kas nėra confirmed mačų su rezultatu šiam žaidėjui mūsų duomenų bazėje.
          </p>
        )}

        {recentMatches.length > 0 ? (
          <div className="mt-12">
            <h2 className="font-display text-3xl">Paskutiniai mačai</h2>
            <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-court-deep text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Turnyras</th>
                    <th className="px-4 py-3 font-medium">Mačas</th>
                    <th className="px-4 py-3 font-medium">Rezultatas</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMatches.map((match) => (
                    <tr key={match.id} className="border-t border-line">
                      <td className="px-4 py-3">
                        <Link
                          href={`/turnyrai/${match.tournamentSlug}`}
                          className="font-medium text-court hover:underline"
                        >
                          {match.tournamentTitle}
                        </Link>
                        <p className="text-ink-soft">{match.leagueTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        {match.home} — {match.away}
                      </td>
                      <td className="px-4 py-3 font-medium">{match.score || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <p className="mt-8 text-sm text-ink-soft">
          <Link href="/zaidejai" className="font-semibold text-court hover:underline">
            ← Grįžti į žaidėjų katalogą
          </Link>
          {" · "}
          <Link href="/reitingai" className="font-semibold text-court hover:underline">
            Reitingai
          </Link>
        </p>
      </section>
    </div>
  );
}
