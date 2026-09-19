import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import MembershipRequestForm from "@/components/MembershipRequestForm";
import PageHeader from "@/components/PageHeader";
import { getClub } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/naryste");
}
export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const club = await getClub();

  return (
    <div>
      <PageHeader
        eyebrow="Prisijunk prie Verdenos"
        title="Tenisas prasideda nuo pirmo smūgio"
        text="Nesvarbu, ar tenisą žaidi daugelį metų, ar raketę į rankas paimsi pirmą kartą — „Verdenoje“ svarbiausia noras žaisti ir būti teniso bendruomenės dalimi."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-10">
          <h2 className="font-display text-3xl">Tapti klubo nariu</h2>
          <p className="mt-3 leading-7 text-ink-soft">
            Užpildykite formą — atsidarys laiškas klubui. Susisieksime dėl tolesnių žingsnių.
          </p>
          <MembershipRequestForm email={club.email} />
        </div>
        <aside className="rounded-[2rem] bg-court-deep p-8 text-white">
          <h2 className="font-display text-3xl">Kontaktai</h2>
          <ul className="mt-6 space-y-3 text-white/80">
            <li>{club.company}</li>
            {"contactPerson" in club && club.contactPerson ? <li>{String(club.contactPerson)}</li> : null}
            <li>{club.address}</li>
            <li>
              <a href={`mailto:${club.email}`} className="text-gold">
                {club.email}
              </a>
            </li>
            {club.phone ? (
              <li>
                <a href={`tel:${club.phone.replace(/\s+/g, "")}`} className="text-gold">
                  {club.phone}
                </a>
              </li>
            ) : null}
            {club.code ? <li>Įm. kodas {club.code}</li> : null}
          </ul>
          <p className="mt-8 text-sm text-white/60">
            Tenisas Šilutėje nuo {club.founded} m. — 35 metai kartu korte.
          </p>
        </aside>
      </section>
    </div>
  );
}
