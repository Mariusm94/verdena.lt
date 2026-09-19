import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeagueWorkspace from "@/components/LeagueWorkspace";
import PageHeader from "@/components/PageHeader";
import { getDraw, listBrackets, listMatches } from "@/lib/leagueStore";
import { getTournament } from "@/lib/tournamentStore";

type Props = {
  params: Promise<{ slug: string; draw: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, draw } = await params;
  const tournament = await getTournament(slug);
  const table = await getDraw(slug, draw);
  if (!tournament || !table) return { title: "Lentelė" };
  return { title: `${table.group} · ${table.title}` };
}

export default async function DrawPage({ params }: Props) {
  const { slug, draw } = await params;
  const tournament = await getTournament(slug);
  const table = await getDraw(slug, draw);
  if (!tournament || !table) notFound();

  const [brackets, matches] = await Promise.all([listBrackets(slug, draw), listMatches(slug, draw)]);

  return (
    <div>
      <PageHeader
        eyebrow={tournament.title}
        title={`${table.group} — ${table.title}`}
        text="Grupės lentelė su taškais ir rezultatais, po ja — playoff lentelės."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <Link href={`/turnyrai/${slug}#lenteles`} className="text-sm font-semibold text-court">
          ← visos {tournament.title} lygos
        </Link>
        <div className="mt-8">
          <LeagueWorkspace slug={slug} draw={table} brackets={brackets} matches={matches} />
        </div>
      </section>
    </div>
  );
}
