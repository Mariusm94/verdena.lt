import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createKnockoutBracketAction,
  createMatchAction,
  deleteBracketAction,
  deleteMatchAction,
  generateRoundRobinMatchesAction,
  updateBracketMatchAction,
  updateBracketSlotsAction,
  updateLeagueDrawAction,
  updateMatchAction,
} from "@/app/admin/turnyrai/[slug]/lygos/actions";
import type { PlayoffBracket } from "@/data/hegelmannBrackets";
import { BRACKET_SIZES, parseBracketSize } from "@/lib/bracketBuilder";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string; externalKey: string }> };

function parsePayload(raw: string): PlayoffBracket | null {
  try {
    return JSON.parse(raw) as PlayoffBracket;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, externalKey } = await params;
  return { title: `Lyga · ${externalKey} · ${slug}` };
}

export default async function AdminLeagueDrawPage({ params }: Props) {
  const { slug, externalKey } = await params;
  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
    include: {
      tournament: true,
      matches: { orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }] },
      brackets: { orderBy: { title: "asc" } },
    },
  });
  if (!draw) notFound();

  let teams: string[] = [];
  try {
    teams = JSON.parse(draw.teams) as string[];
  } catch {
    teams = [];
  }

  const upcoming = draw.matches.filter((m) => m.status === "scheduled" || (!m.score.trim() && m.status !== "pending"));
  const played = draw.matches.filter((m) => !upcoming.includes(m));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-ink-soft">
          <Link href={`/admin/turnyrai/${slug}/lygos`} className="font-semibold text-court">
            ← Visos lygos
          </Link>
          {" · "}
          <Link href={`/turnyrai/${slug}/lenteles/${externalKey}`} className="font-semibold text-court">
            Vieša lentelė
          </Link>
        </p>
        <h1 className="mt-2 font-display text-4xl">
          {draw.groupName} — {draw.title}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          1) Komandos · 2) Mačai / artimiausi · 3) Playoff lentelė (4 / 8 / 16 / 32). Viskas iškart matosi
          viešai.
        </p>
      </div>

      {/* 1. Teams */}
      <form action={updateLeagueDrawAction} className="grid gap-4 rounded-[2rem] bg-white p-8 shadow-sm">
        <input type="hidden" name="tournamentSlug" value={slug} />
        <input type="hidden" name="externalKey" value={externalKey} />
        <h2 className="font-display text-3xl">1. Komandos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Grupė
            <input required name="groupName" defaultValue={draw.groupName} className="rounded-2xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Lygos pavadinimas
            <input required name="title" defaultValue={draw.title} className="rounded-2xl border border-line px-4 py-3" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Komandos / poros (po vieną eilutėje)
          <textarea required name="teams" rows={8} defaultValue={teams.join("\n")} className="rounded-2xl border border-line px-4 py-3" />
        </label>
        <button type="submit" className="justify-self-start rounded-full bg-court px-5 py-3 font-semibold text-white">
          Išsaugoti komandas
        </button>
      </form>

      {/* 2. Matches */}
      <section className="space-y-4 rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">2. Mačai ir artimiausi</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Be rezultato = artimiausias žaidimas. Su rezultatu = įskaičiuojama į lentelę.
            </p>
          </div>
          <form action={generateRoundRobinMatchesAction}>
            <input type="hidden" name="tournamentSlug" value={slug} />
            <input type="hidden" name="externalKey" value={externalKey} />
            <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
              Sugeneruoti visus ratų mačus
            </button>
          </form>
        </div>

        <form action={createMatchAction} className="grid gap-3 rounded-2xl bg-paper p-4 md:grid-cols-3">
          <input type="hidden" name="tournamentSlug" value={slug} />
          <input type="hidden" name="externalKey" value={externalKey} />
          <input required name="home" placeholder="Komanda A" list="team-options" className="rounded-xl border border-line px-3 py-2" />
          <input required name="away" placeholder="Komanda B" list="team-options" className="rounded-xl border border-line px-3 py-2" />
          <input name="playedAt" placeholder="Data YYYY-MM-DD" className="rounded-xl border border-line px-3 py-2" />
          <input name="score" placeholder="Rezultatas (palik tuščią = artimiausias)" className="rounded-xl border border-line px-3 py-2 md:col-span-2" />
          <input name="stage" placeholder="Etapas" defaultValue="Grupė" className="rounded-xl border border-line px-3 py-2" />
          <input type="hidden" name="status" value="scheduled" />
          <datalist id="team-options">
            {teams.map((team) => (
              <option key={team} value={team} />
            ))}
          </datalist>
          <button type="submit" className="rounded-full bg-court px-4 py-2 font-semibold text-white md:col-span-3 md:justify-self-start">
            Pridėti mačą / artimiausią
          </button>
        </form>

        {upcoming.length ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-gold-deep uppercase">Artimiausi ({upcoming.length})</h3>
            {upcoming.map((match) => (
              <MatchEditRow key={match.id} slug={slug} externalKey={externalKey} match={match} />
            ))}
          </div>
        ) : null}

        {played.length ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Sužaisti ({played.length})</h3>
            {played.map((match) => (
              <MatchEditRow key={match.id} slug={slug} externalKey={externalKey} match={match} />
            ))}
          </div>
        ) : null}

        {!draw.matches.length ? (
          <p className="rounded-2xl bg-paper px-4 py-6 text-center text-ink-soft">Mačų dar nėra — pridėkite aukščiau.</p>
        ) : null}
      </section>

      {/* 3. Playoff */}
      <section id="playoff" className="scroll-mt-28 space-y-6 rounded-[2rem] bg-white p-8 shadow-sm">
        <div>
          <h2 className="font-display text-3xl">3. Playoff lentelė</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pasirink dydį (4 / 8 / 16 / 32), įrašyk vardus eilės tvarka. Tuščia vieta = bye (x).
          </p>
        </div>

        <form action={createKnockoutBracketAction} className="grid gap-4 rounded-2xl border border-line p-5">
          <input type="hidden" name="tournamentSlug" value={slug} />
          <input type="hidden" name="externalKey" value={externalKey} />
          <label className="grid gap-2 text-sm font-medium">
            Pavadinimas
            <input name="title" defaultValue="Finalas" placeholder="pvz. Finalas / Paguoda" className="rounded-xl border border-line px-3 py-2" />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Lentelės dydis</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {BRACKET_SIZES.map((size) => (
                <label
                  key={size}
                  className="cursor-pointer rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold has-[:checked]:border-court has-[:checked]:bg-court has-[:checked]:text-white"
                >
                  <input type="radio" name="size" value={size} defaultChecked={size === 8} className="sr-only" />
                  {size} lentelė
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-medium">
            Dalyviai (po vieną eilutėje, iš viršaus į apačią)
            <textarea
              name="slots"
              rows={8}
              placeholder={"Porą 1\nPorą 2\n…\n(trūkstamas = bye)"}
              defaultValue={teams.slice(0, 8).join("\n")}
              className="rounded-xl border border-line px-3 py-2"
            />
          </label>
          <button type="submit" className="justify-self-start rounded-full bg-court px-5 py-3 font-semibold text-white">
            Sukurti playoff lentelę
          </button>
        </form>

        {draw.brackets.map((row) => {
          const payload = parsePayload(row.payload);
          if (!payload || payload.layout === "matrix") {
            return (
              <div key={row.id} className="rounded-2xl border border-line p-4">
                <p className="font-semibold">{row.title}</p>
                <p className="text-sm text-ink-soft">Ši lentelė ne medžio formato — redaguokite per seną JSON, jei reikia.</p>
                <form action={deleteBracketAction} className="mt-2">
                  <input type="hidden" name="tournamentSlug" value={slug} />
                  <input type="hidden" name="externalKey" value={externalKey} />
                  <input type="hidden" name="bracketId" value={row.id} />
                  <button type="submit" className="text-sm font-semibold text-red-700">
                    Trinti
                  </button>
                </form>
              </div>
            );
          }

          const size = parseBracketSize(payload.size, payload.slots?.length);
          const slots = payload.slots ?? [];

          return (
            <div key={row.id} className="space-y-5 rounded-2xl border border-line p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl">{payload.title}</h3>
                  <p className="text-sm text-ink-soft">
                    {size} lentelė
                    {payload.champion ? ` · Nugalėtojai: ${payload.champion}` : ""}
                  </p>
                </div>
                <form action={deleteBracketAction}>
                  <input type="hidden" name="tournamentSlug" value={slug} />
                  <input type="hidden" name="externalKey" value={externalKey} />
                  <input type="hidden" name="bracketId" value={row.id} />
                  <button type="submit" className="text-sm font-semibold text-red-700">
                    Trinti lentelę
                  </button>
                </form>
              </div>

              <form action={updateBracketSlotsAction} className="grid gap-3">
                <input type="hidden" name="tournamentSlug" value={slug} />
                <input type="hidden" name="externalKey" value={externalKey} />
                <input type="hidden" name="bracketId" value={row.id} />
                <label className="grid gap-2 text-sm font-medium">
                  Pavadinimas
                  <input name="title" defaultValue={payload.title} className="rounded-xl border border-line px-3 py-2" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Dalyviai eilės tvarka ({size} vietų — trūkstamas = x)
                  <textarea name="slots" rows={Math.min(size, 12)} defaultValue={slots.join("\n")} className="rounded-xl border border-line px-3 py-2" />
                </label>
                <button type="submit" className="justify-self-start rounded-full border border-line px-4 py-2 text-sm font-semibold">
                  Atnaujinti sąrašą ir perbraižyti medį
                </button>
              </form>

              <div className="space-y-6">
                {(payload.rounds ?? []).map((round, roundIndex) => (
                  <div key={`${row.id}-${round.label}`}>
                    <h4 className="mb-3 text-sm font-semibold tracking-wide text-gold-deep uppercase">{round.label}</h4>
                    <div className="space-y-3">
                      {round.matches.map((match, matchIndex) => {
                        const options = [match.home, match.away].filter((name) => name && name !== "x");
                        return (
                          <form
                            key={`${roundIndex}-${matchIndex}`}
                            action={updateBracketMatchAction}
                            className="grid gap-2 rounded-xl bg-paper p-3 md:grid-cols-[1fr_1fr_8rem_1fr_auto]"
                          >
                            <input type="hidden" name="tournamentSlug" value={slug} />
                            <input type="hidden" name="externalKey" value={externalKey} />
                            <input type="hidden" name="bracketId" value={row.id} />
                            <input type="hidden" name="roundIndex" value={roundIndex} />
                            <input type="hidden" name="matchIndex" value={matchIndex} />
                            <p className="rounded-lg border border-line bg-white px-3 py-2 text-sm">{match.home}</p>
                            <p className="rounded-lg border border-line bg-white px-3 py-2 text-sm">{match.away}</p>
                            <input
                              name="score"
                              defaultValue={match.score}
                              placeholder="6:4 6:2"
                              className="rounded-lg border border-line px-3 py-2 text-sm"
                            />
                            <select name="winner" defaultValue={match.winner || ""} className="rounded-lg border border-line px-3 py-2 text-sm">
                              <option value="">Nugalėtojas…</option>
                              {options.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="rounded-full bg-court px-3 py-2 text-xs font-semibold text-white">
                              Saugoti
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function MatchEditRow({
  slug,
  externalKey,
  match,
}: {
  slug: string;
  externalKey: string;
  match: {
    id: string;
    home: string;
    away: string;
    score: string;
    stage: string;
    status: string;
    playedAt: string | null;
  };
}) {
  return (
    <div className="rounded-xl border border-line p-3">
      <form action={updateMatchAction} className="grid gap-2 md:grid-cols-6">
        <input type="hidden" name="tournamentSlug" value={slug} />
        <input type="hidden" name="externalKey" value={externalKey} />
        <input type="hidden" name="matchId" value={match.id} />
        <input name="home" defaultValue={match.home} className="rounded-lg border border-line px-3 py-2 text-sm" />
        <input name="away" defaultValue={match.away} className="rounded-lg border border-line px-3 py-2 text-sm" />
        <input name="score" defaultValue={match.score} placeholder="Rezultatas" className="rounded-lg border border-line px-3 py-2 text-sm" />
        <input name="playedAt" defaultValue={match.playedAt ?? ""} placeholder="Data" className="rounded-lg border border-line px-3 py-2 text-sm" />
        <select name="status" defaultValue={match.status} className="rounded-lg border border-line px-3 py-2 text-sm">
          <option value="scheduled">Artimiausias</option>
          <option value="confirmed">Sužaistas</option>
          <option value="pending">Laukia patvirtinimo</option>
        </select>
        <input type="hidden" name="stage" value={match.stage || "Grupė"} />
        <button type="submit" className="rounded-full bg-court px-3 py-2 text-xs font-semibold text-white">
          Saugoti
        </button>
      </form>
      <form action={deleteMatchAction} className="mt-1">
        <input type="hidden" name="tournamentSlug" value={slug} />
        <input type="hidden" name="externalKey" value={externalKey} />
        <input type="hidden" name="matchId" value={match.id} />
        <button type="submit" className="text-xs font-semibold text-red-700">
          Trinti
        </button>
      </form>
    </div>
  );
}
