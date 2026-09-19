import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import MembershipRequestForm from "@/components/MembershipRequestForm";
import PageHeader from "@/components/PageHeader";
import { getBoard, getClub } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/naryste");
}
export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const [board, club] = await Promise.all([getBoard(), getClub()]);

  return (
    <div>
      <PageHeader
        eyebrow="Narystė"
        title="Kaip tapti klubo nariu"
        text="Norėdami įstoti į Kauno teniso klubą, užpildykite prašymo formą ir perduokite ją vienam iš valdybos narių."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-10">
          <ol className="space-y-8">
            {[
              {
                n: "01",
                title: "Užpildykite prašymą",
                text: "Užpildykite narystės prašymą žemiau — atsidarys laiškas klubui. Formą taip pat galite paprašyti administracijoje.",
              },
              {
                n: "02",
                title: "Perduokite valdybai",
                text: "Užpildytą formą paduokite vienam iš valdybos narių.",
              },
              {
                n: "03",
                title: "Prisijunkite prie žaidimo",
                text: "Po patvirtinimo galėsite registruotis į turnyrus, matyti lenteles ir dalyvauti klubo gyvenime.",
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-5">
                <span className="font-display text-3xl text-gold-deep">{step.n}</span>
                <div>
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                  <p className="mt-2 leading-7 text-ink-soft">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="#prasymas"
            className="mt-10 inline-flex rounded-full bg-court px-6 py-3 font-semibold text-white"
          >
            Pildyti prašymą
          </Link>
          <MembershipRequestForm email={club.email} />
        </div>
        <aside className="rounded-[2rem] bg-court-deep p-8 text-white">
          <h2 className="font-display text-3xl">Valdybos nariai</h2>
          <p className="mt-3 text-white/70">Prašymą galite paduoti:</p>
          <ul className="mt-6 space-y-4">
            {board.map((person) => (
              <li key={person.name} className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-white/60">{person.role}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
