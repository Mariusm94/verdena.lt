import { prisma } from "@/lib/prisma";
import { news, type NewsItem } from "@/data/news";

function toNewsItem(row: {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  excerpt: string;
  image: string;
  body: string;
  tag: string;
  online: boolean;
  relatedHref: string | null;
  relatedLabel: string | null;
}): NewsItem {
  let body: string[] = [];
  try {
    const parsed = JSON.parse(row.body);
    body = Array.isArray(parsed) ? parsed.map(String) : [String(row.body)];
  } catch {
    body = row.body.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  }

  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    dateLabel: row.dateLabel,
    excerpt: row.excerpt,
    image: row.image,
    body,
    tag: row.tag,
    online: row.online || undefined,
    relatedHref: row.relatedHref || undefined,
    relatedLabel: row.relatedLabel || undefined,
  };
}

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listPublishedNews(): Promise<NewsItem[]> {
  if (!dbReady()) return news;
  try {
    const rows = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    });
    return rows.length ? rows.map(toNewsItem) : news;
  } catch {
    return news;
  }
}

export async function getPublishedNews(slug: string): Promise<NewsItem | undefined> {
  if (!dbReady()) return news.find((item) => item.slug === slug);
  try {
    const row = await prisma.newsPost.findFirst({
      where: { slug, published: true },
    });
    return row ? toNewsItem(row) : news.find((item) => item.slug === slug);
  } catch {
    return news.find((item) => item.slug === slug);
  }
}

export function bodyFromText(value: string) {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("lt")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function dateLabelFromIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "sausio",
    "vasario",
    "kovo",
    "balandžio",
    "gegužės",
    "birželio",
    "liepos",
    "rugpjūčio",
    "rugsėjo",
    "spalio",
    "lapkričio",
    "gruodžio",
  ];
  if (!year || !month || !day) return iso;
  return `${year} m. ${months[month - 1]} ${day} d.`;
}
