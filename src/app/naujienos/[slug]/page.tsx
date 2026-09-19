import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedNews } from "@/lib/newsStore";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedNews(slug);
  return { title: item?.title ?? "Aktualija" };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedNews(slug);
  if (!item) notFound();

  return (
    <article className="pt-28">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <Link href="/naujienos" className="text-sm font-semibold text-court">
          ← Visos aktualijos
        </Link>
        <p className="mt-6 text-sm tracking-widest text-gold-deep uppercase">{item.dateLabel}</p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl">{item.title}</h1>
      </div>
      <div className="mx-auto mt-10 max-w-5xl px-4 md:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem]">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 64rem, 100vw"
            priority
          />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {item.body.map((paragraph) => (
          <p key={paragraph} className="mb-5 text-lg leading-8 text-ink-soft">
            {paragraph}
          </p>
        ))}
        {item.relatedHref ? (
          <Link href={item.relatedHref} className="mt-4 inline-flex font-semibold text-court">
            {item.relatedLabel ?? "Turnyro puslapis"} →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
