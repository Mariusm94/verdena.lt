import type { Metadata } from "next";
import { headers } from "next/headers";
import { defaultSeo, type SeoSettings } from "@/data/seo";
import { getSeo } from "@/lib/contentStore";

/** Prefer request host, then env, then configured/default SEO site URL. */
export async function resolveSiteUrl(configured?: string) {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0]?.trim();
    const proto = (h.get("x-forwarded-proto") || "https").split(",")[0]?.trim() || "https";
    if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
    if (host?.startsWith("localhost") || host?.startsWith("127.0.0.1")) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    /* headers() unavailable outside request */
  }

  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const configuredUrl = (configured || "").trim().replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;
  return defaultSeo.siteUrl.replace(/\/$/, "");
}

function absoluteUrl(siteUrl: string, path: string) {
  const base = siteUrl.replace(/\/$/, "");
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function keywordsList(value?: string) {
  if (!value?.trim()) return undefined;
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function shareImagePath(seo: SeoSettings) {
  const raw = (seo.ogImage || "").trim();
  // Old logo.png is too small / square for messengers — prefer dedicated share card.
  if (!raw || raw === "/images/logo.png" || raw.endsWith("/logo.png")) {
    return "/images/og-share.png";
  }
  return raw;
}

function ogImageMeta(siteUrl: string, seo: SeoSettings) {
  const url = absoluteUrl(siteUrl, shareImagePath(seo));
  return {
    url,
    alt: seo.titleDefault,
    width: 1200,
    height: 630,
    type: "image/png" as const,
  };
}

export async function buildPageMetadata(
  path: string,
  fallback?: { title?: string; description?: string },
): Promise<Metadata> {
  const seo = await getSeo();
  return metadataFromSeo(seo, path, fallback);
}

export async function metadataFromSeo(
  seo: SeoSettings,
  path: string,
  fallback?: { title?: string; description?: string },
): Promise<Metadata> {
  const page = seo.pages[path] ?? {};
  const title = page.title || fallback?.title || seo.titleDefault;
  const description = page.description || fallback?.description || seo.description;
  const keywords = keywordsList(page.keywords || seo.keywords);
  const siteUrl = await resolveSiteUrl(seo.siteUrl);
  const url = absoluteUrl(siteUrl, path === "/" ? "" : path);
  const image = ogImageMeta(siteUrl, seo);
  const isHome = path === "/";

  return {
    metadataBase: new URL(siteUrl),
    title: isHome ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: url || siteUrl },
    openGraph: {
      type: "website",
      locale: "lt_LT",
      url: url || siteUrl,
      siteName: seo.titleDefault,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function rootMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const siteUrl = await resolveSiteUrl(seo.siteUrl);
  const image = ogImageMeta(siteUrl, seo);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.titleDefault,
      template: seo.titleTemplate || defaultSeo.titleTemplate,
    },
    description: seo.description,
    keywords: keywordsList(seo.keywords),
    icons: {
      icon: [{ url: "/images/logo.png", type: "image/png" }],
      apple: [{ url: "/images/logo.png" }],
    },
    openGraph: {
      type: "website",
      locale: "lt_LT",
      siteName: seo.titleDefault,
      title: seo.titleDefault,
      description: seo.description,
      url: siteUrl,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.titleDefault,
      description: seo.description,
      images: [image.url],
    },
  };
}
