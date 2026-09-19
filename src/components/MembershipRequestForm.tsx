"use client";

import { FormEvent } from "react";
import { clubMailto } from "@/lib/mail";

const levels = ["Pradedantysis", "Mėgėjas", "Pažengęs", "Turnyrinis žaidėjas"] as const;

export default function MembershipRequestForm({ email }: { email: string }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const userEmail = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const level = String(data.get("level") ?? "").trim();
    const about = String(data.get("about") ?? "").trim();

    window.location.href = clubMailto(
      `Prašymas tapti TK Verdena nariu — ${name}`,
      [
        "Sveiki,",
        "",
        "Norėčiau prisijungti prie Šilutės teniso klubo „Verdena“.",
        "",
        `Vardas ir pavardė: ${name}`,
        `Telefonas: ${phone || "—"}`,
        `El. paštas: ${userEmail}`,
        `Žaidimo lygis: ${level || "—"}`,
        "",
        "Žinutė:",
        about || "—",
        "",
        "Ačiū!",
      ].join("\n"),
      email,
    );
  }

  return (
    <form id="prasymas" onSubmit={onSubmit} className="mt-10 grid scroll-mt-28 gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Vardas ir pavardė
        <input required name="name" autoComplete="name" className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Telefono numeris
        <input required type="tel" name="phone" autoComplete="tel" className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        El. paštas
        <input required type="email" name="email" autoComplete="email" className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Žaidimo lygis</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {levels.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-cream/40 px-4 py-3 text-sm"
            >
              <input type="radio" name="level" value={level} required className="h-4 w-4 accent-[var(--color-court)]" />
              {level}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        Žinutė
        <textarea
          name="about"
          rows={4}
          placeholder="Trumpai apie save, patirtį ar klausimus…"
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <button type="submit" className="rounded-full bg-court px-6 py-3 font-semibold text-white">
        Siųsti
      </button>
      <p className="text-sm text-ink-soft">
        Atsidarys el. pašto programa su užpildytu laišku. Jei to neatsitinka — rašykite{" "}
        <a href={`mailto:${email}`} className="font-semibold text-court hover:underline">
          {email}
        </a>
        .
      </p>
    </form>
  );
}
