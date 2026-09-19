import { prisma } from "@/lib/prisma";
import { getTournament as getStaticTournament, tournaments as staticTournaments, type Tournament } from "@/data/tournaments";
import { slugify } from "@/lib/newsStore";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toTournament(row: {
  slug: string;
  title: string;
  season: string;
  status: string;
  format: string;
  sponsor: string | null;
  description: string;
  rules: string;
  schedule: string;
  tables: string;
  tablesNote: string | null;
  registerSubject: string | null;
  links: string;
  coverImage: string | null;
}): Tournament {
  const status = row.status as Tournament["status"];
  return {
    slug: row.slug,
    title: row.title,
    season: row.season,
    status: status === "vyksta" || status === "registracija" || status === "archyvas" ? status : "archyvas",
    format: row.format,
    sponsor: row.sponsor || undefined,
    description: row.description,
    rules: parseJson<string[]>(row.rules, []),
    schedule: parseJson<string[]>(row.schedule, []),
    tables: parseJson<Tournament["tables"]>(row.tables, []),
    tablesNote: row.tablesNote || undefined,
    registerSubject: row.registerSubject || undefined,
    coverImage: row.coverImage || undefined,
    links: parseJson<Tournament["links"]>(row.links, []),
  };
}

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listTournaments(): Promise<Tournament[]> {
  if (!dbReady()) return staticTournaments;
  try {
    const rows = await prisma.tournament.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
    });
    return rows.length ? rows.map(toTournament) : staticTournaments;
  } catch {
    return staticTournaments;
  }
}

export async function listAllTournamentsAdmin() {
  return prisma.tournament.findMany({ orderBy: [{ season: "desc" }, { title: "asc" }] });
}

export async function getTournament(slug: string): Promise<Tournament | undefined> {
  if (!dbReady()) return getStaticTournament(slug);
  try {
    const row = await prisma.tournament.findFirst({
      where: { slug, published: true },
    });
    if (row) return toTournament(row);
    return getStaticTournament(slug);
  } catch {
    return getStaticTournament(slug);
  }
}

export async function getTournamentAdmin(slug: string) {
  return prisma.tournament.findUnique({ where: { slug } });
}

export function tournamentSlugify(value: string) {
  return slugify(value);
}

export function serializeTournamentFields(item: Tournament) {
  return {
    slug: item.slug,
    title: item.title,
    season: item.season,
    status: item.status,
    format: item.format,
    sponsor: item.sponsor ?? null,
    description: item.description,
    rules: JSON.stringify(item.rules),
    schedule: JSON.stringify(item.schedule),
    tables: JSON.stringify(item.tables),
    tablesNote: item.tablesNote ?? null,
    registerSubject: item.registerSubject ?? null,
    coverImage: item.coverImage ?? null,
    links: JSON.stringify(item.links),
    published: true,
  };
}

/** Keep open-registration tournaments aligned with static content (forms, copy, status). */
export async function syncOpenTournamentContent() {
  if (!dbReady()) return 0;
  try {
    let count = 0;
    for (const item of staticTournaments) {
      if (item.status !== "registracija") continue;
      const fields = serializeTournamentFields(item);
      await prisma.tournament.upsert({
        where: { slug: item.slug },
        create: fields,
        update: {
          title: fields.title,
          season: fields.season,
          status: fields.status,
          format: fields.format,
          sponsor: fields.sponsor,
          description: fields.description,
          rules: fields.rules,
          schedule: fields.schedule,
          tablesNote: fields.tablesNote,
          registerSubject: fields.registerSubject,
          links: fields.links,
          published: true,
        },
      });
      count += 1;
    }
    return count;
  } catch (error) {
    console.error("[tournaments] syncOpenTournamentContent failed:", error);
    return 0;
  }
}
