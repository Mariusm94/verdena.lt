import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import { getClub } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/parama");
}
export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const club = await getClub();

  return (
    <div>
      <PageHeader
        eyebrow="Parama"
        title={`Skirkite 2% GPM ${club.name}`}
        text="Gautas lėšas panaudosime teniso renginių organizavimui ir klubo veiklos vystymui."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-lg leading-8 text-ink-soft">
            Jei dar niekam neskyrėte 2% gyventojų pajamų mokesčio ir esate neabejingi tenisui, kviečiame juos
            skirti Šilutės teniso klubui „Verdena“.
          </p>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            Paskirti lėšas galite užpildę prašymo formą FR0512 ir pateikę ją Valstybinei mokesčių inspekcijai.
          </p>
          <ul className="mt-6 space-y-3 text-ink">
            <li className="rounded-2xl bg-white px-5 py-4">Tiesiogiai įteikti VMI darbuotojui</li>
            <li className="rounded-2xl bg-white px-5 py-4">Išsiųsti paštu</li>
            <li className="rounded-2xl bg-white px-5 py-4">
              Pateikti elektroniniu būdu per{" "}
              <a
                href="https://deklaravimas.vmi.lt/"
                className="font-semibold text-court"
                target="_blank"
                rel="noreferrer"
              >
                VMI EDS
              </a>
            </li>
          </ul>
          <p className="mt-6 text-sm text-ink-soft">
            Forma FR0512 ir instrukcija:{" "}
            <a
              href="https://www.vmi.lt/evmi/paramos-skyrimas"
              className="font-semibold text-court"
              target="_blank"
              rel="noreferrer"
            >
              vmi.lt — paramos skyrimas
            </a>
            .
          </p>
        </div>
        <aside className="rounded-[2rem] bg-court-deep p-8 text-white">
          <h2 className="font-display text-3xl">Paramos gavėjas</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-white/50">Organizacija</dt>
              <dd className="mt-1 text-lg">{club.company}</dd>
            </div>
            <div>
              <dt className="text-white/50">Kodas</dt>
              <dd className="mt-1 text-lg">{club.code}</dd>
            </div>
            <div>
              <dt className="text-white/50">Adresas</dt>
              <dd className="mt-1 text-lg">{club.address}</dd>
            </div>
            <div>
              <dt className="text-white/50">Sąskaita</dt>
              <dd className="mt-1 text-lg">{club.iban}</dd>
              <dd className="text-white/70">{club.bank}</dd>
            </div>
          </dl>
          <p className="mt-8 text-gold">Iš anksto dėkojame. Klubo administracija.</p>
        </aside>
      </section>
    </div>
  );
}
