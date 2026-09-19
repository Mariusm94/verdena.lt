import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { listTimeline } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/istorija");
}
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const timeline = await listTimeline();

  return (
    <div>
      <PageHeader
        eyebrow="Nuo 1991"
        title="Mūsų istorija"
        text="35 metai žmonių, turnyrų ir teniso Šilutėje — chronologija nuo Verdenos pradžios iki šiandien."
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
        <p className="mt-8 rounded-3xl border border-line bg-white p-6 text-sm leading-7 text-ink-soft">
          Dalis chronologijos remiasi viešais šaltiniais ir publikacijomis. Pilnesnei 1991–2011 m.
          istorijai vertingas Albino Navicko leidinys „Teniso pašaukti“ (2011) — jei klube turite
          archyvą, papildysime timeline dar tiksliau.
        </p>
        <Link href="/apie" className="mt-8 inline-flex font-semibold text-court">
          ← Apie mus
        </Link>
      </section>
    </div>
  );
}
