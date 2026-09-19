import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteRegistrationEntryAction,
  saveRegistrationConfigAction,
} from "@/app/admin/turnyrai/[slug]/registracija/actions";
import { prisma } from "@/lib/prisma";
import { getOrCreateRegistration, listRegistrationEntries } from "@/lib/registrationStore";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await prisma.tournament.findUnique({ where: { slug } });
  return { title: row ? `Registracija · ${row.title}` : "Registracija" };
}

export default async function AdminTournamentRegistrationPage({ params }: Props) {
  const { slug } = await params;
  const tournament = await prisma.tournament.findUnique({ where: { slug } });
  if (!tournament) notFound();

  const registration = await getOrCreateRegistration(tournament.id);
  const entries = await listRegistrationEntries(registration.id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">
            <Link href={`/admin/turnyrai/${slug}`} className="font-semibold text-court">
              ← {tournament.title}
            </Link>
          </p>
          <h1 className="mt-2 font-display text-4xl">Registracijos forma</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Kai turnyro statusas „Registracija atidaryta“, forma įjungiama automatiškai. Čia galite
            pakeisti tekstus, partnerio laukus arba laikinai išjungti formą.
          </p>
        </div>
        <Link
          href={`/turnyrai/${slug}#registracija`}
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold"
        >
          Viešas puslapis
        </Link>
      </div>

      <form
        action={saveRegistrationConfigAction}
        className="space-y-5 rounded-[1.75rem] bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="tournamentSlug" value={slug} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            Formos pavadinimas
            <input
              name="title"
              defaultValue={registration.title}
              className="mt-1 w-full rounded-2xl border border-line px-4 py-3"
            />
          </label>
          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="enabled" defaultChecked={registration.enabled} className="h-4 w-4" />
              Forma įjungta (matoma viešai)
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="allowPartner"
                defaultChecked={registration.allowPartner}
                className="h-4 w-4"
              />
              Leisti pridėti partnerį
            </label>
          </div>
        </div>
        <label className="block text-sm">
          Įvadinis tekstas
          <textarea
            name="intro"
            rows={3}
            defaultValue={registration.intro}
            className="mt-1 w-full rounded-2xl border border-line px-4 py-3"
            placeholder="Trumpos instrukcijos dalyviams…"
          />
        </label>

        <div className="rounded-2xl border border-line bg-cream/50 p-4 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Fiksuoti formos laukai</p>
          <p className="mt-2">
            <strong>Žaidėjas:</strong> Vardas, Pavardė, El. paštas, Tel. nr.
          </p>
          <p className="mt-1">
            <strong>Partneris (jei įjungta):</strong> Vardas, Pavardė, El. paštas, Tel. nr.
          </p>
        </div>

        <button type="submit" className="rounded-full bg-court px-6 py-3 font-semibold text-white">
          Išsaugoti nustatymus
        </button>
      </form>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Paraiškos ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="mt-4 rounded-3xl bg-white px-6 py-8 text-ink-soft shadow-sm">
            Dar nėra užpildytų registracijų.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-[1.75rem] bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-court-deep text-white">
                <tr>
                  <th className="px-4 py-3">Žaidėjas</th>
                  <th className="px-4 py-3">Kontaktai</th>
                  <th className="px-4 py-3">Partneris</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 font-medium">
                      {entry.firstName} {entry.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${entry.email}`} className="text-court hover:underline">
                        {entry.email}
                      </a>
                      <p className="text-ink-soft">{entry.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {entry.partnerFirstName ? (
                        <>
                          <p className="font-medium">
                            {entry.partnerFirstName} {entry.partnerLastName}
                          </p>
                          <p>
                            <a
                              href={`mailto:${entry.partnerEmail ?? ""}`}
                              className="text-court hover:underline"
                            >
                              {entry.partnerEmail}
                            </a>
                          </p>
                          <p className="text-ink-soft">{entry.partnerPhone}</p>
                        </>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {entry.createdAt.toLocaleString("lt-LT")}
                    </td>
                    <td className="px-4 py-3">
                      <form action={deleteRegistrationEntryAction}>
                        <input type="hidden" name="tournamentSlug" value={slug} />
                        <input type="hidden" name="entryId" value={entry.id} />
                        <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">
                          Trinti
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
