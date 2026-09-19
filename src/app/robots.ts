import type { MetadataRoute } from "next";
import { getSeo } from "@/lib/contentStore";
import { resolveSiteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo();
  const base = (await resolveSiteUrl(seo.siteUrl)).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/mano", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
