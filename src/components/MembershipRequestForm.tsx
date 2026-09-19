"use client";

import { FormEvent } from "react";
import { clubMailto } from "@/lib/mail";

export default function MembershipRequestForm({ email }: { email: string }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const userEmail = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const about = String(data.get("about") ?? "").trim();

    window.location.href = clubMailto(
      `Prašymas tapti klubo nariu — ${name}`,
      [
        "Sveiki,",
        "",
        "Norėčiau tapti Kauno teniso klubo nariu.",
        "",
        `Vardas ir pavardė: ${name}`,
        `El. paštas: ${userEmail}`,
        `Telefonas: ${phone || "—"}`,
        "",
        "Trumpai apie save:",
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
        <input
          required
          name="name"
          autoComplete="name"
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        El. paštas
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Telefonas
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Trumpai apie save
        <textarea
          name="about"
          rows={4}
          placeholder="Žaidimo patirtis, lygis, kodėl norite prisijungti…"
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <button type="submit" className="rounded-full bg-court px-6 py-3 font-semibold text-white">
        Siųsti prašymą klubui
      </button>
      <p className="text-sm text-ink-soft">
        Atsidarys jūsų el. pašto programa su užpildytu laišku. Jei to neatsitinka — rašykite tiesiogiai{" "}
        <a href={`mailto:${email}`} className="font-semibold text-court hover:underline">
          {email}
        </a>
        .
      </p>
    </form>
  );
}
