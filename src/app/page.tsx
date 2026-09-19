import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { getClub, getStats } from "@/lib/contentStore";
import { listPublishedNews } from "@/lib/newsStore";
import { buildPageMetadata } from "@/lib/seo";
import { listTournaments } from "@/lib/tournamentStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}

export default async function HomePage() {
  const [club, stats, latestNewsAll, tournaments] = await Promise.all([
    getClub(),
    getStats(),
    listPublishedNews(),
    listTournaments(),
  ]);
  const latestNews = latestNewsAll.slice(0, 3);
  const activeTournaments = tournaments.filter((item) => item.status !== "archyvas");
  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden bg-court-deep text-white">
        <Image
          src="/images/hero/group.jpg"
          alt="Kauno teniso klubo nariai"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-court-deep via-court-deep/80 to-court-deep/25" />
        <div className="absolute inset-0 court-grid opacity-40" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-36 md:px-6">
          <p className="text-sm font-semibold tracking-[0.35em] text-gold uppercase">
            Seniausias teniso klubas Lietuvoje
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl">
            Kauno teniso klubas
            <span className="block text-gold">nuo {club.founded}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
            Turnyrai, reitingai ir bendruomenė, kuri žaidžia Kaune jau daugiau kaip šimtą metų.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/turnyrai"
              className="rounded-full bg-gold px-6 py-3 font-semibold text-court-deep hover:bg-gold-deep"
            >
              Vykstantys turnyrai
            </Link>
            <Link
              href="/naryste"
              className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Tapti nariu
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
            src="/images/hero/outdoor.jpg"
            alt="Teniso aikštynas"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[0.28em] text-court uppercase">Apie klubą</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Bendruomenė, kuri išlaikė tenisą Kaune</h2>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            Kauno teniso klubas įkurtas {club.foundedDate} K. Blažio, B. Navickienės ir V. Žadeikos iniciatyva.
            Tarpukariu klubas vadovavo teniso sąjūdžiui Lietuvoje, o šiandien teberengia turnyrus,
            saugo istoriją ir kviečia žaisti visus sezonus.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apie" className="rounded-full bg-court px-5 py-3 font-semibold text-white hover:bg-court-deep">
              Skaityti istoriją
            </Link>
            <Link href="/nariai" className="rounded-full border border-line px-5 py-3 font-semibold text-ink">
              Klubo nariai
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.28em] text-court uppercase">Aktualijos</p>
              <h2 className="mt-2 font-display text-4xl">Naujausios žinios</h2>
            </div>
            <Link href="/naujienos" className="hidden font-semibold text-court md:inline">
              Visos aktualijos →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {latestNews.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
          <Link href="/naujienos" className="mt-8 inline-flex font-semibold text-court md:hidden">
            Visos aktualijos →
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <Image src="/images/hero/indoor.jpg" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-court-deep/80" />
        <div className="relative mx-auto max-w-7xl px-4 text-white md:px-6">
          <p className="text-sm font-semibold tracking-[0.28em] text-gold uppercase">Turnyrai</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl">Sekite, registruokitės, žaiskite</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {activeTournaments.map((item) => (
              <Link
                key={item.slug}
                href={`/turnyrai/${item.slug}`}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur hover:bg-white/15"
              >
                <p className="text-xs tracking-widest text-gold uppercase">{item.season}</p>
                <h3 className="mt-3 font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.format}</p>
                <span className="mt-5 inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold text-court-deep">
                  {item.status === "registracija" ? "Registracija" : "Vyksta"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:grid-cols-2 md:px-6">
        <div className="rounded-[2rem] bg-court p-8 text-white md:p-12">
          <h2 className="font-display text-4xl">Tapkite klubo nariu</h2>
          <p className="mt-4 max-w-md text-white/80">
            Užpildykite prašymą ir perduokite jį valdybos nariui. Prisijunkite prie bendruomenės, kuri žaidžia nuo 1924 m.
          </p>
          <Link
            href="/naryste"
            className="mt-8 inline-flex rounded-full bg-gold px-5 py-3 font-semibold text-court-deep"
          >
            Kaip tapti nariu
          </Link>
        </div>
        <div className="rounded-[2rem] border border-line bg-white p-8 md:p-12">
          <h2 className="font-display text-4xl">Skirkite 2% GPM</h2>
          <p className="mt-4 max-w-md text-ink-soft">
            Jei dar niekam neskyrėte 2% gyventojų pajamų mokesčio, kviečiame juos skirti Kauno teniso klubui.
          </p>
          <Link href="/parama" className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 font-semibold text-white">
            Paramos instrukcija
          </Link>
        </div>
      </section>
    </div>
  );
}
