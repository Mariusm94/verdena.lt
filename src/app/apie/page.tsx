import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { people } from "@/data/site";
import { getClub, getStats } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/apie");
}
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [club, stats] = await Promise.all([getClub(), getStats()]);

  return (
    <div>
      <PageHeader
        eyebrow="Apie mus"
        title="Mus vienija tenisas"
        text="„Verdena“ — viena ilgiausias tradicijas turinčių Šilutės krašto teniso bendruomenių."
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:px-6">
        <div className="max-w-2xl text-lg leading-8 text-ink-soft">
          <p>
            Klubo istorija prasidėjo {club.founded} metais, kai grupė Šilutės teniso entuziastų
            nusprendė suburti šios sporto šakos mėgėjus į bendrą klubą.
          </p>
          <p className="mt-5">
            Vienas klubo įkūrėjų Viktoras Bučius prieš pasirinkdamas lauko tenisą pats aktyviai
            žaidė stalo tenisą. Vėliau didžioji raketė tapo svarbia jo gyvenimo dalimi, o kartu su
            bendraminčiais pradėta kurti „Verdenos“ istorija.
          </p>
          <p className="mt-5">
            Per daugelį metų aplink klubą susiformavo stipri teniso bendruomenė. Mus vienija ne amžius
            ar žaidimo lygis. Mus vienija meilė tenisui.
          </p>
          <p className="mt-8 font-display text-2xl text-court">
            Skirtingos kartos. Skirtingas žaidimo lygis. Vienas klubas.
          </p>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-[2rem]">
          <Image
            src="/images/hero/outdoor.jpg"
            alt="TK Verdena"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-4 md:px-6">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white p-6">
              <p className="font-display text-4xl text-court">{item.value}</p>
              <p className="mt-1 text-sm font-semibold tracking-wide text-gold-deep uppercase">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl gap-4 px-4 md:px-6">
          <Link href="/istorija" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
            Klubo istorija
          </Link>
          <Link href="/naryste" className="rounded-full border border-line px-5 py-3 font-semibold">
            Prisijungti
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <p className="text-sm font-semibold tracking-[0.28em] text-court uppercase">Klubo žmonės</p>
        <h2 className="mt-2 font-display text-4xl">Žmonės, nuo kurių prasidėjo istorija</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {people.map((person) => (
            <article key={person.name} className="rounded-[2rem] border border-line bg-white p-7">
              <h3 className="font-display text-3xl">{person.name}</h3>
              <p className="mt-2 text-sm font-semibold tracking-wide text-gold-deep uppercase">
                {person.role}
              </p>
              <p className="mt-4 leading-7 text-ink-soft">{person.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
