import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import NewsCard from "@/components/NewsCard";
import PageHeader from "@/components/PageHeader";
import { listPublishedNews } from "@/lib/newsStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/naujienos");
}

export default async function NewsPage() {
  const items = await listPublishedNews();
  return (
    <div>
      <PageHeader
        eyebrow="Aktualijos"
        title="Klubo naujienos"
        text="Rezultatai, registracijos, gala vakarai ir viskas, kas vyksta aikštelėje."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
