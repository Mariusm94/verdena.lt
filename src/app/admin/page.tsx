import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Svetainės valdymas" };

function todayVilnius(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vilnius" }).format(new Date());
}

async function safeCount(run: () => Promise<number>) {
  try {
    return await run();
  } catch {
    return 0;
  }
}

export default async function AdminPage() {
  const today = todayVilnius();

  const [
    newsCount,
    draftNews,
    tournaments,
    draftTournaments,
    photos,
    pendingResults,
    users,
    clubMembers,
    rankingTables,
    galleryAlbums,
    videos,
    press,
    timeline,
    todaysMatches,
  ] = await Promise.all([
    safeCount(() => prisma.newsPost.count()),
    safeCount(() => prisma.newsPost.count({ where: { published: false } })),
    safeCount(() => prisma.tournament.count()),
    safeCount(() => prisma.tournament.count({ where: { published: false } })),
    safeCount(() => prisma.photo.count()),
    safeCount(() => prisma.match.count({ where: { status: "pending" } })),
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.clubMember.count()),
    safeCount(() => prisma.rankingTable.count()),
    safeCount(() => prisma.galleryAlbum.count()),
    safeCount(() => prisma.videoItem.count()),
    safeCount(() => prisma.pressItem.count()),
    safeCount(() => prisma.timelineEvent.count()),
    prisma.match
      .findMany({
        where: { playedAt: today },
        take: 10,
        orderBy: { createdAt: "asc" },
        include: {
          draw: {
            select: {
              externalKey: true,
              groupName: true,
              title: true,
              tournament: { select: { slug: true, title: true } },
            },
          },
        },
      })
      .catch(() => []),
  ]);

  const cards = [
    {
      href: "/admin/turnyrai",
      title: "Turnyrai",
      text: "Turnyrai, nuostatai ir lygos (mačai, lentelės, playoff).",
      meta: `${tournaments} turnyrai · ${draftTournaments} juodraščiai`,
    },
    {
      href: "/admin/rezultatai",
      title: "Rezultatai",
      text: "Narių pateikti mačų rezultatai — patvirtinti arba atmesti.",
      meta: pendingResults > 0 ? `${pendingResults} laukia` : "Eilė tuščia",
      highlight: pendingResults > 0,
    },
    {
      href: "/admin/vartotojai",
      title: "Vartotojai",
      text: "Narių ir administratorių paskyros, žaidėjo vardai mačams.",
      meta: `${users} paskyros`,
    },
    {
      href: "/admin/klubo-nariai",
      title: "Klubo nariai",
      text: "Viešas narių sąrašas — pridėti, pervadinti, trinti.",
      meta: `${clubMembers} narių`,
    },
    {
      href: "/admin/reitingai",
      title: "Reitingai",
      text: "Top lentelės ir eilutės viešam reitingų puslapiui.",
      meta: `${rankingTables} lentelės`,
    },
    {
      href: "/admin/nustatymai",
      title: "Nustatymai",
      text: "Klubo kontaktai, statistika, valdyba, žaidėjų stats.",
      meta: "Kontaktai · statistika · valdyba",
    },
    {
      href: "/admin/galerija",
      title: "Galerija",
      text: "Albumai ir nuotraukų URL viešai galerijai.",
      meta: `${galleryAlbums} albumai`,
    },
    {
      href: "/admin/video",
      title: "Video",
      text: "YouTube įrašai video galerijai.",
      meta: `${videos} įrašai`,
    },
    {
      href: "/admin/spauda",
      title: "Spauda",
      text: "Istorijos spaudoje straipsniai ir nuorodos.",
      meta: `${press} įrašai`,
    },
    {
      href: "/admin/istorija",
      title: "Istorija",
      text: "Laiko juostos įvykiai nuo 1924 m.",
      meta: `${timeline} įvykiai`,
    },
    {
      href: "/admin/nuotraukos",
      title: "Nuotraukos",
      text: "Įkelti failus: naujienoms, turnyrams ir galerijai.",
      meta: `${photos} nuotraukos`,
    },
    {
      href: "/admin/naujienos",
      title: "Naujienos",
      text: "Rašyti, redaguoti, skelbti arba slėpti straipsnius.",
      meta: `${newsCount} įrašai · ${draftNews} juodraščiai`,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Ką norite padaryti?</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-ink-soft">
        Čia valdote svetainę paprastai: parašote, įkeliate nuotrauką, tada skelbiate. Kol įrašas juodraštis —
        lankytojai jo nemato.
      </p>

      {todaysMatches.length > 0 ? (
        <section className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl">Šiandienos mačai</h2>
          <p className="mt-1 text-sm text-ink-soft">Data {today} · iki 10 mačų</p>
          <ul className="mt-4 divide-y divide-line">
            {todaysMatches.map((match) => {
              const leagueHref = `/admin/turnyrai/${match.draw.tournament.slug}/lygos/${match.draw.externalKey}`;
              return (
                <li key={match.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-ink-soft">
                      {match.draw.tournament.title}
                      {match.draw.groupName ? ` · ${match.draw.groupName}` : ""}
                      {match.draw.title ? ` · ${match.draw.title}` : ""}
                    </p>
                    <p className="font-medium">
                      {match.home} <span className="text-ink-soft">–</span> {match.away}
                      {match.score.trim() ? (
                        <span className="ml-2 font-semibold text-court">{match.score}</span>
                      ) : null}
                    </p>
                  </div>
                  <Link
                    href={leagueHref}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
                  >
                    Atidaryti lygą
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-[1.75rem] p-6 shadow-sm transition hover:bg-paper ${
              card.highlight ? "bg-amber-50 ring-1 ring-amber-200" : "bg-white"
            }`}
          >
            <h2 className="font-display text-3xl">{card.title}</h2>
            <p className="mt-2 leading-7 text-ink-soft">{card.text}</p>
            <p className={`mt-4 text-sm font-semibold ${card.highlight ? "text-amber-900" : "text-court"}`}>
              {card.meta}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
