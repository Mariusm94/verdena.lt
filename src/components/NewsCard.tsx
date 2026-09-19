import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "@/data/news";

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/naujienos/${item.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-court-deep">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-court-deep/85 px-3 py-1 text-xs font-semibold text-gold">
              {item.tag}
            </span>
            {item.online ? (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">Online</span>
            ) : null}
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs tracking-wide text-ink-soft uppercase">{item.dateLabel}</p>
          <h3 className="mt-2 font-display text-2xl leading-tight text-ink">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-ink-soft">{item.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
