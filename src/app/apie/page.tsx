import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
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
        eyebrow="Kauno teniso klubas"
        title="Seniausias ir brandžiausias teniso klubas Lietuvoje"
        text={`Įkurtas ${club.foundedDate} ${club.foundersGenitive} iniciatyva.`}
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:px-6">
        <div className="prose-like max-w-2xl text-lg leading-8 text-ink-soft">
          <p>
            Tarpukariu klubas aktyviai plėtojo tenisą Kaune ir jo priemiesčiuose, o nuo 1936 m. — ir Palangoje.
            KTK vadovavo teniso sąjūdžiui Lietuvoje iki 1932 m., kol buvo įkurta Teniso sąjunga, vėliau tapo jos
            aktyviu nariu.
          </p>
          <p className="mt-5">
            Vienas svarbiausių klubo tikslų buvo teniso aikščių įrengimas, varžybų organizavimas ir dalyvavimas
            tarptautiniuose turnyruose. 1929 m. klubas surengė pirmąjį tarptautinį turnyrą. 1931 m. KTK turėjo
            keturias teniso aikštes, medinį paviljoną ir 88 narius — 1924 m. jų buvo apie 30.
          </p>
          <p className="mt-5">
            Klube augo ir brendo geriausi to meto Lietuvos tenisininkai: J. ir V. Ščiukauskaitės, J. Smetona,
            A. Remeikis, V. Kačergis, A. Katilius, A. Jakutis, A. Galvydis, A. Kuprevičius, V. Gerulaitis ir kiti.
          </p>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-[2rem]">
          <Image
            src="/images/hero/group.jpg"
            alt="Klubo nariai"
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
          <Link href="/spauda" className="rounded-full border border-line px-5 py-3 font-semibold">
            Istorija spaudoje
          </Link>
        </div>
      </section>
    </div>
  );
}
