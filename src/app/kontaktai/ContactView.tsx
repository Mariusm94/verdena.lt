"use client";

import { FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { clubMailto } from "@/lib/mail";
import type { ClubInfo } from "@/lib/contentStore";

export default function ContactView({ club }: { club: ClubInfo }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    window.location.href = clubMailto(
      `Žinutė iš ${name}`,
      `Nuo: ${name} <${email}>\n\n${message}`,
      club.email,
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Kontaktai"
        title="Susisiekite su klubu"
        text="Rašykite el. paštu arba apsilankykite Sporto gatvėje. Atsakome dėl narystės, turnyrų ir rėmimo."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
        <form onSubmit={onSubmit} className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="font-display text-3xl">Žinutė klubui</h2>
          <p className="mt-3 text-sm text-ink-soft">
            Mygtukas atidarys jūsų pašto programą laiškui {club.email}. Svetainė laiško neišsiunčia pati.
          </p>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Vardas
              <input required name="name" className="rounded-2xl border border-line px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              El. paštas
              <input required type="email" name="email" className="rounded-2xl border border-line px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Žinutė
              <textarea required name="message" rows={5} className="rounded-2xl border border-line px-4 py-3" />
            </label>
            <button type="submit" className="rounded-full bg-court px-6 py-3 font-semibold text-white">
              Atidaryti laišką
            </button>
          </div>
        </form>
        <div>
          <div className="rounded-[2rem] bg-court-deep p-8 text-white">
            <h2 className="font-display text-3xl">{club.name}</h2>
            <ul className="mt-6 space-y-3 text-white/80">
              <li>{club.company}</li>
              <li>{club.address}</li>
              <li>
                <a href={`mailto:${club.email}`} className="text-gold">
                  {club.email}
                </a>
              </li>
              <li>Įmonės kodas {club.code}</li>
              <li>
                {club.iban}
                <br />
                {club.bank}
              </li>
            </ul>
          </div>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-line bg-white">
            <iframe
              title="Kauno teniso klubas žemėlapyje"
              src="https://www.google.com/maps?q=Sporto+g.+3,+Kaunas&output=embed"
              className="h-72 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
