import { prisma } from "@/lib/prisma";
import { members as staticMembers } from "@/data/members";
import {
  rankingTables as staticRankingTables,
  playerStats as staticPlayerStats,
  type RankingRow,
} from "@/data/rankings";
import { defaultSeo, type SeoSettings } from "@/data/seo";
import { club as staticClub, stats as staticStats, board as staticBoard } from "@/data/site";
import {
  galleryAlbums as staticGalleryAlbums,
  videos as staticVideos,
  pressItems as staticPressItems,
  timeline as staticTimeline,
} from "@/data/gallery";
import {
  getOrRecomputePlayerCareerCache,
  playerStatsMapFromCareer,
  rankingTablesFromCareer,
  resolvePlayerNameFromSlug,
  type CareerStats,
} from "@/lib/playerCareer";

export type ClubInfo = typeof staticClub;
export type StatItem = (typeof staticStats)[number];
export type BoardMember = (typeof staticBoard)[number];
export type { SeoSettings };
export type RankingTableView = {
  id: string;
  title: string;
  unit: string;
  rows: RankingRow[];
};
export type PlayerStatsMap = typeof staticPlayerStats;
export type { CareerStats };
export type GalleryAlbumView = {
  year: string;
  title: string;
  photos: { src: string; alt: string }[];
};
export type VideoView = {
  id?: string;
  title: string;
  description: string;
  youtubeId: string;
  image: string;
};
export type PressView = {
  title: string;
  text: string;
  href?: string;
  source?: string;
  dateLabel?: string;
};
export type TimelineView = {
  year: string;
  title: string;
  text: string;
};

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function listMembers(): Promise<string[]> {
  if (!dbReady()) return staticMembers;
  try {
    const rows = await prisma.clubMember.findMany({
      where: { published: true },
      orderBy: [{ sortName: "asc" }, { name: "asc" }],
    });
    return rows.length ? rows.map((row) => row.name) : staticMembers;
  } catch {
    return staticMembers;
  }
}

export async function listRankingTables(): Promise<RankingTableView[]> {
  if (!dbReady()) return staticRankingTables;
  try {
    const cache = await getOrRecomputePlayerCareerCache();
    const tables = rankingTablesFromCareer(cache.byName);
    if (!tables.some((t) => t.rows.length)) return staticRankingTables;
    return tables;
  } catch {
    return staticRankingTables;
  }
}

export async function getPlayerStats(): Promise<PlayerStatsMap> {
  if (!dbReady()) return staticPlayerStats;
  try {
    const cache = await getOrRecomputePlayerCareerCache();
    const mapped = playerStatsMapFromCareer(cache.byName);
    return Object.keys(mapped).length ? mapped : staticPlayerStats;
  } catch {
    return staticPlayerStats;
  }
}

export async function getPlayerCareerByName(name: string): Promise<CareerStats | null> {
  if (!dbReady()) return null;
  try {
    const cache = await getOrRecomputePlayerCareerCache();
    return cache.byName[name] ?? null;
  } catch {
    return null;
  }
}

export async function getPlayerBySlug(slug: string): Promise<{
  slug: string;
  name: string;
  career: CareerStats | null;
} | null> {
  const members = await listMembers();
  let cache: Awaited<ReturnType<typeof getOrRecomputePlayerCareerCache>> | null = null;
  if (dbReady()) {
    try {
      cache = await getOrRecomputePlayerCareerCache();
    } catch {
      cache = null;
    }
  }
  const byName = cache?.byName ?? {};
  const name = resolvePlayerNameFromSlug(slug, members, byName);
  if (!name) return null;
  return {
    slug,
    name,
    career: byName[name] ?? null,
  };
}

export async function getClub(): Promise<ClubInfo> {
  if (!dbReady()) return staticClub;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "club" } });
    if (!row) return staticClub;
    return { ...staticClub, ...parseJson(row.value, staticClub) };
  } catch {
    return staticClub;
  }
}

export async function getSeo(): Promise<SeoSettings> {
  if (!dbReady()) return defaultSeo;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "seo" } });
    if (!row) return defaultSeo;
    const parsed = parseJson<Partial<SeoSettings>>(row.value, {});
    return {
      ...defaultSeo,
      ...parsed,
      pages: { ...defaultSeo.pages, ...(parsed.pages ?? {}) },
    };
  } catch {
    return defaultSeo;
  }
}

export async function getStats(): Promise<StatItem[]> {
  if (!dbReady()) return staticStats;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "stats" } });
    if (!row) return staticStats;
    const parsed = parseJson(row.value, staticStats);
    return Array.isArray(parsed) && parsed.length ? parsed : staticStats;
  } catch {
    return staticStats;
  }
}

export async function getBoard(): Promise<BoardMember[]> {
  if (!dbReady()) return staticBoard;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "board" } });
    if (!row) return staticBoard;
    const parsed = parseJson(row.value, staticBoard);
    return Array.isArray(parsed) && parsed.length ? parsed : staticBoard;
  } catch {
    return staticBoard;
  }
}

export async function listGalleryAlbums(): Promise<GalleryAlbumView[]> {
  if (!dbReady()) return staticGalleryAlbums;
  try {
    const albums = await prisma.galleryAlbum.findMany({
      orderBy: { sortOrder: "asc" },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    });
    if (!albums.length) return staticGalleryAlbums;
    return albums.map((album) => ({
      year: album.year,
      title: album.title,
      photos: album.photos.map((photo) => ({ src: photo.url, alt: photo.alt })),
    }));
  } catch {
    return staticGalleryAlbums;
  }
}

export async function listVideos(publishedOnly = true): Promise<VideoView[]> {
  if (!dbReady()) {
    return staticVideos.filter((v) => (publishedOnly ? Boolean(v.youtubeId) : true));
  }
  try {
    const rows = await prisma.videoItem.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) {
      return staticVideos.filter((v) => (publishedOnly ? Boolean(v.youtubeId) : true));
    }
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      youtubeId: row.youtubeId,
      image: row.image,
    }));
  } catch {
    return staticVideos.filter((v) => (publishedOnly ? Boolean(v.youtubeId) : true));
  }
}

export async function listPressItems(): Promise<PressView[]> {
  if (!dbReady()) {
    return staticPressItems.map((item) => ({
      title: item.title,
      text: item.text,
      href: item.href,
    }));
  }
  try {
    const rows = await prisma.pressItem.findMany({ orderBy: { sortOrder: "asc" } });
    if (!rows.length) {
      return staticPressItems.map((item) => ({
        title: item.title,
        text: item.text,
        href: item.href,
      }));
    }
    return rows.map((row) => ({
      title: row.title,
      text: row.excerpt ?? "",
      href: row.href ?? undefined,
      source: row.source ?? undefined,
      dateLabel: row.dateLabel ?? undefined,
    }));
  } catch {
    return staticPressItems.map((item) => ({
      title: item.title,
      text: item.text,
      href: item.href,
    }));
  }
}

export async function listTimeline(): Promise<TimelineView[]> {
  if (!dbReady()) return staticTimeline;
  try {
    const rows = await prisma.timelineEvent.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.length
      ? rows.map((row) => ({ year: row.year, title: row.title, text: row.text }))
      : staticTimeline;
  } catch {
    return staticTimeline;
  }
}

/** Boot sync — užrašo brand / SEO / timeline iš static duomenų (Hostinger). */
export async function syncClubContentFromStatic() {
  if (!dbReady()) return;
  try {
    await prisma.siteSetting.upsert({
      where: { key: "club" },
      update: { value: JSON.stringify(staticClub) },
      create: { key: "club", value: JSON.stringify(staticClub) },
    });
    await prisma.siteSetting.upsert({
      where: { key: "stats" },
      update: { value: JSON.stringify(staticStats) },
      create: { key: "stats", value: JSON.stringify(staticStats) },
    });
    await prisma.siteSetting.upsert({
      where: { key: "board" },
      update: { value: JSON.stringify(staticBoard) },
      create: { key: "board", value: JSON.stringify(staticBoard) },
    });
    await prisma.siteSetting.upsert({
      where: { key: "seo" },
      update: { value: JSON.stringify(defaultSeo) },
      create: { key: "seo", value: JSON.stringify(defaultSeo) },
    });
    await prisma.timelineEvent.deleteMany();
    await prisma.timelineEvent.createMany({
      data: staticTimeline.map((item, index) => ({
        year: item.year,
        title: item.title,
        text: item.text,
        sortOrder: index,
      })),
    });

    await prisma.galleryAlbum.deleteMany();
    for (const [index, album] of staticGalleryAlbums.entries()) {
      await prisma.galleryAlbum.create({
        data: {
          year: album.year,
          title: album.title,
          sortOrder: index,
          photos: {
            create: album.photos.map((photo, photoIndex) => ({
              url: photo.src,
              alt: photo.alt,
              sortOrder: photoIndex,
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error("[content] syncClubContentFromStatic failed:", error);
  }
}
