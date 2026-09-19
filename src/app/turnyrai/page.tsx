import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { tournamentTraditions } from "@/data/site";
import { listTournaments } from "@/lib/tournamentStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/turnyrai");
}

const labels = {
  vyksta: "Vyksta",
  registracija: "Registracija atidaryta",
  archyvas: "Tradicija",
};

export default async function TournamentsPage() {
  const tournaments = await listTournaments();
  const live = tournaments.filter((item) => item.status !== "archyvas");
  const archive = tournaments.filter((item) => item.status === "archyvas");

  return (
    <div>
      <PageHeader
        eyebrow="Turnyrai"
        title="Varžybos — Verdenos DNR"
        text="Nuo pat klubo įkūrimo turnyrai — viena svarbiausių „Verdenos“ veiklos dalių: vienetai, dvejetai, mišrios poros, reitinginiai ir bendruomeniniai renginiai."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div id="tradicijos" className="scroll-mt-28">
          <h2 className="font-display text-4xl">Klubo turnyrų tradicijos</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {tournamentTraditions.map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-line bg-white p-7">
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-3 leading-7 text-ink-soft">{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        {live.length > 0 ? (
          <>
            <h2 className="mt-16 font-display text-4xl">Vykstantys turnyrai</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {live.map((item) => (
                <article
                  id={item.slug}
                  key={item.slug}
                  className="scroll-mt-28 rounded-[2rem] border border-line bg-white p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm tracking-widest text-gold-deep uppercase">{item.season}</p>
                    <span className="rounded-full bg-court px-3 py-1 text-xs font-semibold text-white">
                      {labels[item.status]}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-3xl">
                    <Link href={`/turnyrai/${item.slug}`} className="hover:text-court">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft">{item.format}</p>
                  <p className="mt-4 leading-7 text-ink-soft">{item.description}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}

        <h2 className="mt-16 font-display text-4xl">Turnyrų puslapiai</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Sezono lenteles, registraciją ir rezultatus pildysime čia. Kol kas — tradicijų aprašymai.
        </p>
        <div className="mt-8 grid gap-4">
          {archive.map((item) => (
            <article
              id={item.slug}
              key={item.slug}
              className="flex scroll-mt-28 flex-col justify-between gap-4 rounded-3xl bg-paper p-6 md:flex-row md:items-center"
            >
              <div>
                <p className="text-xs tracking-widest text-gold-deep uppercase">{item.season}</p>
                <h3 className="mt-1 font-display text-2xl">
                  <Link href={`/turnyrai/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">{item.description}</p>
              </div>
              <Link href={`/turnyrai/${item.slug}`} className="shrink-0 font-semibold text-court">
                Plačiau →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
