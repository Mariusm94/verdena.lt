import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { tournamentTraditions } from "@/data/site";
import { getClub, getStats } from "@/lib/contentStore";
import { listPublishedNews } from "@/lib/newsStore";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}

export default async function HomePage() {
  const [club, stats, latestNewsAll] = await Promise.all([
    getClub(),
    getStats(),
    listPublishedNews(),
  ]);
  const latestNews = latestNewsAll.slice(0, 3);

  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden bg-court-deep text-white">
        <Image
          src="/images/hero/outdoor-v2.jpg"
          alt="Tenisas Šilutėje — TK Verdena"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-court-deep via-court-deep/85 to-court-deep/30" />
        <div className="absolute inset-0 court-grid opacity-30" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-36 md:px-6">
          <p className="text-sm font-semibold tracking-[0.35em] text-gold uppercase">
            Tenisas Šilutėje nuo {club.founded} m.
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl">
            TK Verdena
            <span className="mt-2 block text-2xl font-sans font-semibold tracking-[0.12em] text-gold md:text-3xl">
              Tradicija. Bendruomenė. Tenisas.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
            Jau 35 metus vienijame Šilutės krašto teniso mėgėjus — nuo pirmųjų žingsnių korte iki
            atkaklių turnyrinių kovų.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/naryste"
              className="rounded-full bg-gold px-6 py-3 font-semibold text-court-deep hover:bg-gold-deep"
            >
              Prisijungti prie klubo
            </Link>
            <Link
              href="/turnyrai"
              className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Turnyrai
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper py-8">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-4 md:px-6">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-line bg-white p-6">
              <p className="font-display text-4xl text-court">{item.value}</p>
              <p className="mt-1 text-sm font-semibold tracking-wide text-gold-deep uppercase">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
          <Image
            src="/images/hero/group-v3.jpg"
            alt="Verdenos bendruomenė"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[0.28em] text-court uppercase">35 metai</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">35 metai teniso istorijos</h2>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            Šilutės lauko teniso klubas „Verdena“ savo istoriją pradėjo {club.foundedDate}. Vienas
            pagrindinių klubo kūrėjų ir ilgametis jo puoselėtojas — Viktoras Bučius, vadovavęs klubui
            1991–2008 m. ir vėliau tapęs klubo garbės prezidentu.
          </p>
          <p className="mt-4 text-lg leading-8 text-ink-soft">
            Per daugiau nei tris dešimtmečius „Verdena“ tapo ne tik vieta žaisti tenisą, bet ir
            skirtingas kartas vienijančia bendruomene — jaunimas, šeimos, mėgėjai, veteranai ir
            turnyrų žaidėjai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/istorija" className="rounded-full bg-court px-5 py-3 font-semibold text-white hover:bg-court-deep">
              Klubo istorija
            </Link>
            <Link href="/apie" className="rounded-full border border-line px-5 py-3 font-semibold text-ink">
              Apie mus
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-court-deep py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-semibold tracking-[0.28em] text-gold uppercase">Bendruomenė</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl">Daugiau nei teniso klubas</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
            „Verdenos“ istoriją kūrė ne vien pavieniai žaidėjai — tenisą kartu žaidė ištisos šeimos.
            Istoriniuose šaltiniuose minimos Steponkų, Mėgelaičių, Šveikauskų, Pranaičių, Sūdžių ir
            Česnulių šeimos.
          </p>
          <p className="mt-8 font-display text-2xl text-gold md:text-3xl">
            Skirtingos kartos. Skirtingas žaidimo lygis. Vienas klubas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <p className="text-sm font-semibold tracking-[0.28em] text-court uppercase">Turnyrai</p>
        <h2 className="mt-2 font-display text-4xl">Varžybos — Verdenos DNR</h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Nuo pat įkūrimo turnyrai — viena svarbiausių klubo veiklos dalių: vienetai, dvejetai, mišrios
          poros, reitinginiai ir bendruomeniniai renginiai.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tournamentTraditions.map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-line bg-white p-7">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-3 leading-7 text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
        <Link href="/turnyrai" className="mt-8 inline-flex font-semibold text-court">
          Visi turnyrai →
        </Link>
      </section>

      {latestNews.length > 0 ? (
        <section className="bg-paper py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.28em] text-court uppercase">Naujienos</p>
                <h2 className="mt-2 font-display text-4xl">Naujausios žinios</h2>
              </div>
              <Link href="/naujienos" className="hidden font-semibold text-court md:inline">
                Visos naujienos →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {latestNews.map((item) => (
                <NewsCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="rounded-[2rem] bg-court p-8 text-white md:p-12">
          <p className="text-sm font-semibold tracking-[0.28em] text-gold uppercase">Prisijunk</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Tenisas prasideda nuo pirmo smūgio</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            Nesvarbu, ar tenisą žaidi daugelį metų, ar raketę į rankas paimsi pirmą kartą — „Verdenoje“
            svarbiausia noras žaisti ir būti teniso bendruomenės dalimi.
          </p>
          <Link
            href="/naryste"
            className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-court-deep hover:bg-gold-deep"
          >
            Tapti klubo nariu
          </Link>
        </div>
      </section>
    </div>
  );
}
