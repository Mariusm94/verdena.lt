import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { listTimeline } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/istorija");
}
export const dynamic = "force-dynamic";

const archives = [
  { src: "/images/history/cover.jpg", alt: "Istorijos knygos viršelis" },
  { src: "/images/history/p01.jpg", alt: "Archyvinis puslapis" },
  { src: "/images/history/p02.jpg", alt: "Rankraštis" },
  { src: "/images/history/p03.jpg", alt: "Istorinis dokumentas" },
];

export default async function HistoryPage() {
  const timeline = await listTimeline();

  return (
    <div>
      <PageHeader
        eyebrow="Nuo 1924"
        title="Istorija, faktai, įvykiai, žmonės"
        text="Klubo archyvas — nuo pirmųjų aikščių ir tarptautinių turnyrų iki šimtmečio šventės."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <ol className="relative border-l border-line pl-8">
          {timeline.map((item) => (
            <li key={`${item.year}-${item.title}`} className="mb-12">
              <span className="absolute -left-2.5 mt-1.5 h-5 w-5 rounded-full border-4 border-cream bg-gold" />
              <p className="text-sm font-semibold tracking-widest text-gold-deep uppercase">{item.year}</p>
              <h2 className="mt-1 font-display text-3xl">{item.title}</h2>
              <p className="mt-3 leading-7 text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-4xl">Archyviniai dokumentai</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Originalūs klubo istorijos puslapiai — rankraščiai, faktai ir įvykiai, kuriuos saugome iki šiol.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {archives.map((item) => (
              <div key={item.src} className="overflow-hidden rounded-3xl bg-white p-3 shadow-sm">
                <div className="relative aspect-[3/4]">
                  <Image src={item.src} alt={item.alt} fill className="rounded-2xl object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
