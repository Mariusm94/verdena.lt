import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import { listPressItems } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/spauda");
}
export const dynamic = "force-dynamic";

export default async function PressPage() {
  const pressItems = await listPressItems();

  return (
    <div>
      <PageHeader
        eyebrow="Spauda"
        title="Teniso istorija spaudoje"
        text="Medžiaga apie „Verdeną“ ir teniso gyvenimą Šilutės krašte. Puslapis pildomas."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <div className="grid gap-4">
          {pressItems.length === 0 ? (
            <p className="rounded-3xl border border-line bg-white p-8 text-ink-soft">
              Spaudos archyvas ruošiamas — greitai čia atsiras straipsniai ir reportažai.
            </p>
          ) : null}
          {pressItems.map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-3xl border border-line bg-white p-6 md:p-8">
              <p className="text-sm text-gold-deep">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
              {item.dateLabel || item.source ? (
                <p className="mt-2 text-sm text-ink-soft">
                  {[item.source, item.dateLabel].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              <p className="mt-3 leading-7 text-ink-soft">{item.text}</p>
              {item.href ? (
                <a href={item.href} className="mt-4 inline-flex font-semibold text-court" target="_blank" rel="noreferrer">
                  Skaityti šaltinį →
                </a>
              ) : (
                <p className="mt-4 text-sm text-ink-soft">Skaitmeninės kopijos viešai nėra — tema saugoma klubo archyve.</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
