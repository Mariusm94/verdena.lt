import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { formatMatchDate } from "@/data/hegelmannSchedule";
import { requireMember } from "@/lib/admin";
import { listMatchesForPlayer } from "@/lib/memberMatches";
import ScoreForm from "./ScoreForm";

export const metadata: Metadata = { title: "Mano mačai" };

export default async function ManoPage() {
  const session = await requireMember();
  const displayName = session.user.name ?? "";
  const playerName = session.user.playerName?.trim() || displayName;
  const matches = await listMatchesForPlayer(playerName);

  const withoutScore = matches.filter((m) => m.status !== "pending" && !m.score.trim());
  const waiting = matches.filter((m) => m.status === "pending");
  const confirmed = matches.filter((m) => m.status === "confirmed" && m.score.trim());

  return (
    <div>
      <PageHeader
        eyebrow="Nario zona"
        title="Mano mačai"
        text={`Sveiki, ${displayName}. Čia matote mačus, kuriuose žaidžiate (${playerName}), ir galite pateikti rezultatą administratoriui patvirtinti.`}
      />
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 md:px-6">
        {!matches.length ? (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nerasta mačų su jūsų žaidėjo vardu. Jei trūksta — parašykite administracijai.
          </p>
        ) : null}

        {withoutScore.length ? (
          <MatchSection
            title="Be rezultato"
            description="Įveskite rezultatą — jis bus pateiktas administratoriui patvirtinti."
            matches={withoutScore}
            mode="editable"
          />
        ) : null}

        {waiting.length ? (
          <MatchSection
            title="Laukia"
            description="Šie rezultatai dar nerodomi viešai kaip nauji — laukia admin patvirtinimo. Galite pataisyti, kol nepatvirtinta."
            matches={waiting}
            mode="pending"
          />
        ) : null}

        {confirmed.length ? (
          <MatchSection
            title="Patvirtinta"
            description="Patvirtintų rezultatų keisti čia negalima — kreipkitės į administraciją."
            matches={confirmed}
            mode="locked"
          />
        ) : null}
      </section>
    </div>
  );
}

function MatchSection({
  title,
  description,
  matches,
  mode,
}: {
  title: string;
  description: string;
  matches: Awaited<ReturnType<typeof listMatchesForPlayer>>;
  mode: "editable" | "pending" | "locked";
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="text-ink-soft">{description}</p>
      <ul className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} mode={mode} />
        ))}
      </ul>
    </div>
  );
}

function MatchCard({
  match,
  mode,
}: {
  match: Awaited<ReturnType<typeof listMatchesForPlayer>>[number];
  mode: "editable" | "pending" | "locked";
}) {
  return (
    <li className="rounded-[1.75rem] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-soft">
            {match.tournamentTitle} · {match.groupName}
            {match.leagueTitle ? ` · ${match.leagueTitle}` : ""}
          </p>
          <p className="mt-1 font-medium">
            {match.home} <span className="text-ink-soft">–</span> {match.away}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {formatMatchDate(match.playedAt)}
            {match.stage ? ` · ${match.stage}` : ""}
          </p>
        </div>
        <div className="text-right">
          {mode === "pending" ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800 uppercase">
              Laukia admin
            </span>
          ) : mode === "locked" ? (
            <span className="rounded-full bg-court/10 px-3 py-1 text-xs font-semibold tracking-wide text-court uppercase">
              Patvirtinta
            </span>
          ) : (
            <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Be rezultato
            </span>
          )}
          <p className="mt-2 font-display text-2xl text-court">{match.score.trim() || "—"}</p>
          {mode === "pending" && match.previousScore ? (
            <p className="text-xs text-ink-soft">Viešai kol kas: {match.previousScore}</p>
          ) : null}
        </div>
      </div>

      {mode !== "locked" ? (
        <ScoreForm
          matchId={match.id}
          defaultScore={match.score}
          label={mode === "pending" ? "Pataisyti rezultatą" : "Įvesti rezultatą"}
        />
      ) : null}

      <div className={`${mode !== "locked" ? "mt-3" : "mt-5 border-t border-line pt-4"}`}>
        <Link
          href={`/turnyrai/${match.tournamentSlug}/lenteles/${match.drawExternalKey}`}
          className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold"
        >
          Lyga
        </Link>
      </div>
    </li>
  );
}
