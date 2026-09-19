import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createLeagueDrawAction,
  deleteLeagueDrawAction,
} from "@/app/admin/turnyrai/[slug]/lygos/actions";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await prisma.tournament.findUnique({ where: { slug } });
  return { title: row ? `Lygos · ${row.title}` : "Lygos" };
}

export default async function AdminTournamentLeaguesPage({ params }: Props) {
  const { slug } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      draws: {
        orderBy: [{ groupName: "asc" }, { title: "asc" }],
        include: { _count: { select: { matches: true, brackets: true } } },
      },
    },
  });
  if (!tournament) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">
            <Link href="/admin/turnyrai" className="font-semibold text-court">
              ← Turnyrai
            </Link>
            {" · "}
            <Link href={`/admin/turnyrai/${slug}`} className="font-semibold text-court">
              Taisyti turnyrą
            </Link>
          </p>
          <h1 className="mt-2 font-display text-4xl">Lygos — {tournament.title}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Kiekviena lyga = grupės lentelė + mačai + playoff (4 / 8 / 16 / 32). Spausk lygą ir viską
            sutvarkysi paprastai.
          </p>
        </div>
        <Link href={`/turnyrai/${slug}`} className="rounded-full border border-line px-5 py-3 text-sm font-semibold">
          Žiūrėti viešai
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {tournament.draws.length ? (
          tournament.draws.map((draw) => (
            <article key={draw.id} className="flex flex-col gap-4 rounded-[1.75rem] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs tracking-widest text-gold-deep uppercase">{draw.groupName}</p>
                <h2 className="font-display text-2xl">{draw.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {draw._count.matches} mačai · {draw._count.brackets} playoff
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/turnyrai/${slug}/lygos/${draw.externalKey}`}
                  className="rounded-full bg-court px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Valdyti
                </Link>
                <Link
                  href={`/turnyrai/${slug}/lenteles/${draw.externalKey}`}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold"
                >
                  Viešai
                </Link>
                <form action={deleteLeagueDrawAction}>
                  <input type="hidden" name="tournamentSlug" value={slug} />
                  <input type="hidden" name="externalKey" value={draw.externalKey} />
                  <button type="submit" className="rounded-full px-3 py-2.5 text-sm font-semibold text-red-700">
                    Trinti
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-[1.75rem] bg-white px-5 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nėra lygų — sukurkite pirmą žemiau.
          </p>
        )}
      </div>

      <form action={createLeagueDrawAction} className="mt-10 grid gap-4 rounded-[2rem] bg-white p-8 shadow-sm">
        <input type="hidden" name="tournamentSlug" value={slug} />
        <h2 className="font-display text-3xl">Nauja lyga</h2>
        <p className="text-sm text-ink-soft">
          Pvz. grupė „Moterys dvejetai“, pavadinimas „POWER“. Po sukūrimo pridėsite mačus ir playoff
          lentelę.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Grupė
            <input required name="groupName" placeholder="pvz. Mixai / Vyrai dvejetai" className="rounded-2xl border border-line px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Lygos pavadinimas
            <input required name="title" placeholder="pvz. Masters / POWER / Middle" className="rounded-2xl border border-line px-4 py-3" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Komandos / poros (po vieną eilutėje)
          <textarea required name="teams" rows={6} placeholder={"Vardas / Partneris\nKita pora\n…"} className="rounded-2xl border border-line px-4 py-3" />
        </label>
        <button type="submit" className="justify-self-start rounded-full bg-court px-5 py-3 font-semibold text-white">
          Sukurti lygą
        </button>
      </form>
    </div>
  );
}
