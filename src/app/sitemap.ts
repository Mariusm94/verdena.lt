import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSeo } from "@/lib/contentStore";
import { resolveSiteUrl } from "@/lib/seo";

const staticPaths = [
  "/",
  "/apie",
  "/istorija",
  "/nariai",
  "/naryste",
  "/spauda",
  "/parama",
  "/turnyrai",
  "/naujienos",
  "/galerija",
  "/video",
  "/reitingai",
  "/zaidejai",
  "/kontaktai",
  "/prisijungti",
  "/registracija",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeo();
  const base = (await resolveSiteUrl(seo.siteUrl)).replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/naujienos" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/turnyrai" ? 0.9 : 0.7,
  }));

  try {
    const [tournaments, news, members] = await Promise.all([
      prisma.tournament.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.newsPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.clubMember.findMany({
        where: { published: true },
        select: { name: true },
        take: 500,
      }),
    ]);

    for (const row of tournaments) {
      entries.push({
        url: `${base}/turnyrai/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const row of news) {
      entries.push({
        url: `${base}/naujienos/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    for (const row of members) {
      const slug = row.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (!slug) continue;
      entries.push({
        url: `${base}/zaidejai/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    /* DB gali būti nepasiekiama build metu */
  }

  return entries;
}
