import type { Metadata } from "next";
import Link from "next/link";
import { formatMatchDate } from "@/data/hegelmannSchedule";
import { requireAdmin } from "@/lib/admin";
import { listPendingMatches } from "@/lib/memberMatches";
import { confirmPendingMatchAction, rejectPendingMatchAction } from "./actions";

export const metadata: Metadata = { title: "Laukiantys rezultatai" };

export default async function AdminRezultataiPage() {
  await requireAdmin();
  const pending = await listPendingMatches();

  return (
    <div>
      <h1 className="font-display text-4xl">Laukiantys rezultatai</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-ink-soft">
        Nariai pateikė šiuos mačų rezultatus. Patvirtinus jie matysis viešose lygų lentelėse; atmetus grąžinamas ankstesnis
        patvirtintas rezultatas.
      </p>

      {!pending.length ? (
        <p className="mt-10 rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
          Šiuo metu nėra laukiančių rezultatų.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {pending.map((match) => (
            <li key={match.id} className="rounded-[1.75rem] bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-soft">
                    {match.draw.tournament.title} · {match.draw.groupName}
                    {match.draw.title ? ` · ${match.draw.title}` : ""}
                  </p>
                  <p className="mt-1 text-lg font-medium">
                    {match.home} <span className="text-ink-soft">–</span> {match.away}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatMatchDate(match.playedAt ?? "")}
                    {match.stage ? ` · ${match.stage}` : ""}
                  </p>
                  <p className="mt-2 text-sm">
                    Pateikė:{" "}
                    <span className="font-semibold">{match.submittedBy?.name ?? "—"}</span>
                    {match.submittedBy?.email ? (
                      <span className="text-ink-soft"> ({match.submittedBy.email})</span>
                    ) : null}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs tracking-wide text-ink-soft uppercase">Siūlomas</p>
                  <p className="font-display text-3xl text-court">{match.score.trim() || "—"}</p>
                  {match.previousScore ? (
                    <p className="mt-1 text-sm text-ink-soft">Ankstesnis: {match.previousScore}</p>
                  ) : (
                    <p className="mt-1 text-sm text-ink-soft">Ankstesnio nebuvo</p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-4">
                <form action={confirmPendingMatchAction}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-court px-5 py-2.5 text-sm font-semibold text-white hover:bg-court-deep"
                  >
                    Patvirtinti
                  </button>
                </form>
                <form action={rejectPendingMatchAction}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-paper"
                  >
                    Atmesti
                  </button>
                </form>
                <Link
                  href={`/admin/turnyrai/${match.draw.tournament.slug}/lygos/${match.draw.externalKey}`}
                  className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold"
                >
                  Atidaryti lygą
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
