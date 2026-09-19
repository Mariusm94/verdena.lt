import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TournamentForm from "@/app/admin/turnyrai/TournamentForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await prisma.tournament.findUnique({ where: { slug } });
  return { title: row ? `Turnyras · ${row.title}` : "Turnyras" };
}

export default async function EditTournamentPage({ params }: Props) {
  const { slug } = await params;
  const row = await prisma.tournament.findUnique({ where: { slug } });
  if (!row) notFound();

  let rules: string[] = [];
  let schedule: string[] = [];
  let links: { label: string; href: string }[] = [];
  try {
    rules = JSON.parse(row.rules);
    schedule = JSON.parse(row.schedule);
  } catch {
    rules = [];
    schedule = [];
  }
  try {
    links = JSON.parse(row.links) as { label: string; href: string }[];
  } catch {
    links = [];
  }

  const autoPrefixes = [
    `/turnyrai/${slug}#registracija`,
    `/turnyrai/${slug}#nuostatai`,
    `/turnyrai/${slug}#lenteles`,
    `/turnyrai/${slug}#tvarkarastis`,
  ];
  const extraLinks = links
    .filter((link) => !autoPrefixes.includes(link.href))
    .map((link) => `${link.label}|${link.href}`);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Taisyti turnyrą</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/turnyrai/${slug}/registracija`}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold"
          >
            Registracijos forma
          </Link>
          <Link
            href={`/admin/turnyrai/${slug}/lygos`}
            className="rounded-full bg-court px-5 py-3 text-sm font-semibold text-white"
          >
            Lygos · mačai · playoff
          </Link>
        </div>
      </div>
      <TournamentForm
        item={{
          slug: row.slug,
          title: row.title,
          season: row.season,
          status: row.status,
          format: row.format,
          sponsor: row.sponsor,
          description: row.description,
          rules,
          schedule,
          tablesNote: row.tablesNote,
          coverImage: row.coverImage,
          published: row.published,
          extraLinks,
        }}
      />
    </div>
  );
}
