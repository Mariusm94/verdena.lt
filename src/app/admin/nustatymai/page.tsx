import type { Metadata } from "next";
import { getBoard, getClub, getPlayerStats, getSeo, getStats } from "@/lib/contentStore";
import {
  resetSettingsDefaultsAction,
  saveBoardSettingsAction,
  saveClubSettingsAction,
  savePlayerStatsAction,
  saveSeoSettingsAction,
  saveStatsSettingsAction,
} from "./actions";

export const metadata: Metadata = { title: "Nustatymai — valdymas" };

export default async function AdminSettingsPage() {
  const [club, stats, board, playerStats, seo] = await Promise.all([
    getClub(),
    getStats(),
    getBoard(),
    getPlayerStats(),
    getSeo(),
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl">Nustatymai</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Klubo kontaktai, SEO (raktazodžiai, aprašymai), statistika, valdyba ir žaidėjų duomenys.
      </p>

      <form action={saveClubSettingsAction} className="mt-8 space-y-4 rounded-[1.75rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl">Klubas</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["name", "Pavadinimas", club.name],
            ["shortName", "Trumpinys", club.shortName],
            ["founded", "Įkūrimo metai", String(club.founded)],
            ["foundedDate", "Įkūrimo data (tekstas)", club.foundedDate],
            ["email", "El. paštas", club.email],
            ["phone", "Telefonas", club.phone],
            ["facebook", "Facebook URL", club.facebook],
            ["address", "Adresas", club.address],
            ["company", "Organizacija", club.company],
            ["code", "Kodas", club.code],
            ["bank", "Bankas", club.bank],
            ["iban", "IBAN", club.iban],
            ["founders", "Steigėjai (kableliais)", club.founders.join(", ")],
            ["foundersGenitive", "Steigėjai (kilmininkas)", club.foundersGenitive],
          ].map(([name, label, value]) => (
            <label key={name} className="grid gap-1 text-sm">
              {label}
              <input name={name} defaultValue={value} className="rounded-xl border border-line px-3 py-2" />
            </label>
          ))}
        </div>
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Išsaugoti klubą
        </button>
      </form>

      <form action={saveSeoSettingsAction} className="mt-8 space-y-4 rounded-[1.75rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl">SEO</h2>
        <p className="text-sm text-ink-soft">
          Čia valdote svetainės pavadinimą, aprašymą, raktazodžius ir atskirų puslapių SEO. Po domain
          paleidimo įrašykite tikrąjį <strong>Site URL</strong> (pvz. https://verdena.lt).
        </p>
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Site URL (canonical / sitemap)
            <input
              name="siteUrl"
              defaultValue={seo.siteUrl}
              placeholder="https://verdena.lt"
              className="rounded-xl border border-line px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Numatytasis title
            <input name="titleDefault" defaultValue={seo.titleDefault} className="rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Title šablonas (%s — puslapio pavadinimas)
            <input
              name="titleTemplate"
              defaultValue={seo.titleTemplate}
              className="rounded-xl border border-line px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Meta description
            <textarea
              name="description"
              rows={3}
              defaultValue={seo.description}
              className="rounded-xl border border-line px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Raktazodžiai (kableliais)
            <textarea
              name="keywords"
              rows={3}
              defaultValue={seo.keywords}
              className="rounded-xl border border-line px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Open Graph paveikslėlis (kelias, pvz. /images/logo.png)
            <input name="ogImage" defaultValue={seo.ogImage} className="rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Puslapių SEO (JSON) — kelias → title / description / keywords
            <textarea
              name="pagesJson"
              rows={16}
              defaultValue={JSON.stringify(seo.pages, null, 2)}
              className="w-full rounded-2xl border border-line px-4 py-3 font-mono text-sm"
            />
          </label>
        </div>
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Išsaugoti SEO
        </button>
      </form>

      <form action={saveStatsSettingsAction} className="mt-8 space-y-4 rounded-[1.75rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl">Statistika (JSON)</h2>
        <textarea
          name="statsJson"
          rows={10}
          defaultValue={JSON.stringify(stats, null, 2)}
          className="w-full rounded-2xl border border-line px-4 py-3 font-mono text-sm"
        />
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Išsaugoti statistiką
        </button>
      </form>

      <form action={saveBoardSettingsAction} className="mt-8 space-y-4 rounded-[1.75rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl">Valdyba (JSON)</h2>
        <textarea
          name="boardJson"
          rows={8}
          defaultValue={JSON.stringify(board, null, 2)}
          className="w-full rounded-2xl border border-line px-4 py-3 font-mono text-sm"
        />
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Išsaugoti valdybą
        </button>
      </form>

      <form action={savePlayerStatsAction} className="mt-8 space-y-4 rounded-[1.75rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl">Žaidėjų statistika (JSON)</h2>
        <textarea
          name="playerStatsJson"
          rows={12}
          defaultValue={JSON.stringify(playerStats, null, 2)}
          className="w-full rounded-2xl border border-line px-4 py-3 font-mono text-sm"
        />
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Išsaugoti žaidėjų statistiką
        </button>
      </form>

      <form action={resetSettingsDefaultsAction} className="mt-6">
        <button type="submit" className="text-sm font-semibold text-red-700">
          Atstatyti visus nustatymus iš pradinių failų
        </button>
      </form>
    </div>
  );
}
