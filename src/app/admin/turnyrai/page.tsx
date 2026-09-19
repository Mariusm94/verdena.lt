import type { Metadata } from "next";
import Link from "next/link";
import { deleteTournamentAction } from "@/app/admin/turnyrai/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Turnyrai — valdymas" };

const statusLabel: Record<string, string> = {
  registracija: "Registracija",
  vyksta: "Vyksta",
  archyvas: "Archyvas",
};

export default async function AdminTournamentsPage() {
  const rows = await prisma.tournament.findMany({ orderBy: [{ season: "desc" }, { title: "asc" }] });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Turnyrai</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Sukurkite naują turnyrą arba pataisykite esamą. Juodraščio lankytojai nematys.
          </p>
        </div>
        <Link href="/admin/turnyrai/naujas" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Sukurti turnyrą
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-[1.75rem] bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="bg-court-deep text-white">
            <tr>
              <th className="px-5 py-3 text-sm font-medium">Sezonas</th>
              <th className="px-5 py-3 text-sm font-medium">Pavadinimas</th>
              <th className="px-5 py-3 text-sm font-medium">Būsena</th>
              <th className="px-5 py-3 text-sm font-medium">Svetainėje</th>
              <th className="px-5 py-3 text-sm font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-soft">
                  Kol kas nėra turnyrų. Sukurkite pirmą.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-5 py-3 text-sm text-ink-soft">{row.season}</td>
                  <td className="px-5 py-3 font-medium">{row.title}</td>
                  <td className="px-5 py-3 text-sm">{statusLabel[row.status] ?? row.status}</td>
                  <td className="px-5 py-3 text-sm">{row.published ? "Viešas" : "Juodraštis"}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      {row.published ? (
                        <Link href={`/turnyrai/${row.slug}`} className="text-ink-soft">
                          Žiūrėti
                        </Link>
                      ) : null}
                      <Link href={`/admin/turnyrai/${row.slug}/lygos`} className="text-ink-soft">
                        Lygos
                      </Link>
                      <Link href={`/admin/turnyrai/${row.slug}/registracija`} className="text-ink-soft">
                        Registracija
                      </Link>
                      <Link href={`/admin/turnyrai/${row.slug}`} className="text-court">
                        Taisyti
                      </Link>
                      <form action={deleteTournamentAction}>
                        <input type="hidden" name="slug" value={row.slug} />
                        <button type="submit" className="text-red-700">
                          Trinti
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
