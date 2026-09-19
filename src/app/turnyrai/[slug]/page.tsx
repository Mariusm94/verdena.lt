import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TournamentRegistrationForm from "@/app/turnyrai/[slug]/TournamentRegistrationForm";
import MatchList from "@/components/MatchList";
import PageHeader from "@/components/PageHeader";
import TournamentExplorer from "@/components/TournamentExplorer";
import { getClub } from "@/lib/contentStore";
import { listDraws } from "@/lib/leagueStore";
import { getRegistrationByTournamentSlug } from "@/lib/registrationStore";
import { getTournament } from "@/lib/tournamentStore";
import { listUpcomingMatches } from "@/lib/upcomingMatches";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getTournament(slug);
  return { title: item?.title ?? "Turnyras" };
}

const labels = {
  vyksta: "Vyksta",
  registracija: "Registracija atidaryta",
  archyvas: "Archyvas",
};

export default async function TournamentPage({ params }: Props) {
  const { slug } = await params;
  const [item, club, regBundle, upcoming] = await Promise.all([
    getTournament(slug),
    getClub(),
    getRegistrationByTournamentSlug(slug),
    listUpcomingMatches(slug),
  ]);
  if (!item) notFound();

  const mail = `mailto:${club.email}?subject=${encodeURIComponent(item.registerSubject ?? `Turnyras: ${item.title}`)}`;
  const draws = await listDraws(item.slug);
  const hasLeagueDraws = draws.length > 0;
  const registration = regBundle?.registration;
  const formTitle = registration?.title?.trim() || `Registracija — ${item.title}`;
  const formIntro =
    registration?.intro?.trim() ||
    "Užpildykite formą — vardas, pavardė, el. paštas ir telefonas. Jei žaidžiate dvejetus, galite iškart pridėti partnerį.";
  const allowPartner = registration?.allowPartner ?? true;
  // Status „registracija“ = forma vieša. DB įrašas kuriamas automatiškai / submit metu.
  const showOnlineForm = item.status === "registracija";

  return (
    <div>
      <PageHeader eyebrow={item.season} title={item.title} text={item.description} />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <Link href="/turnyrai" className="text-sm font-semibold text-court">
          ← Visi turnyrai
        </Link>
        <p className="mt-6">
          <span className="rounded-full bg-court px-3 py-1 text-xs font-semibold text-white">
            {labels[item.status]}
          </span>
          <span className="ml-3 text-sm text-ink-soft">{item.format}</span>
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          <a href="#nuostatai" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Nuostatai
          </a>
          <a href="#lenteles" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Lentelės
          </a>
          <a href="#artimiausi" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Artimiausi
          </a>
          <a href="#tvarkarastis" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Tvarkaraštis
          </a>
          {item.status === "registracija" ? (
            <a href="#registracija" className="rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
              Registracija
            </a>
          ) : null}
        </nav>

        <section id="lenteles" className="mt-14 scroll-mt-28">
          <h2 className="font-display text-3xl">Turnyrinės lentelės</h2>
          {hasLeagueDraws ? (
            <>
              <p className="mt-4 max-w-3xl leading-7 text-ink-soft">
                Pasirink lygą ir spausk <strong>Atidaryti lentelę</strong> — ten taškai, rezultatai ir playoff.
              </p>
              <div className="mt-8">
                <TournamentExplorer slug={item.slug} draws={draws} />
              </div>
            </>
          ) : (
            <>
              {item.tablesNote ? <p className="mt-4 leading-7 text-ink-soft">{item.tablesNote}</p> : null}
              {item.tables.length ? (
                item.tables.map((table) => (
                  <div key={table.title} className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
                    <h3 className="bg-court-deep px-5 py-3 font-semibold text-white">{table.title}</h3>
                    <ul className="divide-y divide-line">
                      {table.rows.map((row) => (
                        <li key={`${table.title}-${row.name}`} className="flex gap-4 px-5 py-3">
                          <span className="w-8 font-display text-xl text-gold-deep">{row.place}</span>
                          <span>
                            {row.name}
                            {row.note ? <span className="block text-sm text-ink-soft">{row.note}</span> : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="mt-4 leading-7 text-ink-soft">Šiam turnyrui lygų dar nėra.</p>
              )}
            </>
          )}
        </section>

        <section id="artimiausi" className="mt-14 scroll-mt-28">
          <h2 className="font-display text-3xl">Artimiausi žaidimai</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">Planuojami mačai — rezultatas dar neįvestas.</p>
          <div className="mt-6">
            <MatchList
              matches={upcoming.map((match) => ({
                id: match.id,
                date: match.date,
                group: match.group,
                league: match.league,
                stage: match.stage,
                kind: "grupe",
                home: match.home,
                away: match.away,
                score: "",
              }))}
              empty="Artimiausių žaidimų kol kas nėra."
            />
          </div>
        </section>

        <section id="tvarkarastis" className="mt-14 scroll-mt-28">
          <h2 className="font-display text-3xl">Tvarkaraštis</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-ink-soft">
            {item.schedule.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section id="nuostatai" className="mt-14 scroll-mt-28">
          <h2 className="font-display text-3xl">Nuostatai</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-ink-soft">
            {item.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        {item.status === "registracija" ? (
          <section id="registracija" className="mt-14 scroll-mt-28 rounded-[2rem] bg-court-deep p-8 text-white">
            {showOnlineForm ? (
              <TournamentRegistrationForm
                slug={item.slug}
                title={formTitle}
                intro={formIntro}
                allowPartner={allowPartner}
              />
            ) : (
              <>
                <h2 className="font-display text-3xl">Registracija</h2>
                <p className="mt-3 text-white/75">
                  Online forma šiuo metu laikinai nepasiekiama. Galite registruotis el. paštu.
                </p>
                <a
                  href={mail}
                  className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 font-semibold text-court-deep"
                >
                  Rašyti {club.email}
                </a>
              </>
            )}
          </section>
        ) : null}
      </section>
    </div>
  );
}
