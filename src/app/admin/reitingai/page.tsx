import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  createRankingRowAction,
  createRankingTableAction,
  deleteRankingRowAction,
  deleteRankingTableAction,
  updateRankingRowAction,
  updateRankingTableAction,
} from "./actions";

export const metadata: Metadata = { title: "Reitingai — valdymas" };

export default async function AdminRankingsPage() {
  const tables = await prisma.rankingTable.findMany({
    orderBy: { sortOrder: "asc" },
    include: { rows: { orderBy: { rank: "asc" } } },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Reitingai</h1>
      <p className="mt-2 max-w-xl text-ink-soft">Lentelės ir eilutės viešam /reitingai puslapiui.</p>

      <form
        action={createRankingTableAction}
        className="mt-8 grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm md:grid-cols-4"
      >
        <input name="externalKey" required placeholder="raktas (pvz. wins)" className="rounded-2xl border border-line px-4 py-3" />
        <input name="title" required placeholder="Pavadinimas" className="rounded-2xl border border-line px-4 py-3" />
        <input name="unit" required placeholder="Vienetas" className="rounded-2xl border border-line px-4 py-3" />
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Pridėti lentelę
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {tables.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nėra reitingų lentelių. Sukurkite pirmą aukščiau.
          </p>
        ) : (
          tables.map((table) => (
            <section key={table.id} className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <form action={updateRankingTableAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={table.id} />
                <label className="grid gap-1 text-sm">
                  Pavadinimas
                  <input name="title" defaultValue={table.title} className="rounded-xl border border-line px-3 py-2" />
                </label>
                <label className="grid gap-1 text-sm">
                  Vienetas
                  <input name="unit" defaultValue={table.unit} className="rounded-xl border border-line px-3 py-2" />
                </label>
                <p className="text-sm text-ink-soft">Raktas: {table.externalKey}</p>
                <button type="submit" className="rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
                  Išsaugoti lentelę
                </button>
                <button formAction={deleteRankingTableAction} type="submit" className="text-sm font-semibold text-red-700">
                  Trinti lentelę
                </button>
              </form>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-ink-soft">
                      <th className="py-2 pr-3">Nr.</th>
                      <th className="py-2 pr-3">Žaidėjas</th>
                      <th className="py-2 pr-3">Reikšmė</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-ink-soft">
                          Kol kas nėra eilučių šioje lentelėje.
                        </td>
                      </tr>
                    ) : (
                      table.rows.map((row) => (
                        <tr key={row.id} className="border-b border-line">
                          <td className="py-2 pr-3" colSpan={4}>
                            <form action={updateRankingRowAction} className="flex flex-wrap items-center gap-2">
                              <input type="hidden" name="id" value={row.id} />
                              <input
                                name="rank"
                                type="number"
                                defaultValue={row.rank}
                                className="w-16 rounded-lg border border-line px-2 py-1"
                              />
                              <input
                                name="name"
                                defaultValue={row.name}
                                className="min-w-[12rem] flex-1 rounded-lg border border-line px-2 py-1"
                              />
                              <input
                                name="value"
                                type="number"
                                defaultValue={row.value}
                                className="w-24 rounded-lg border border-line px-2 py-1"
                              />
                              <button type="submit" className="rounded-full px-3 py-1 font-semibold text-court">
                                Išsaugoti
                              </button>
                              <button
                                formAction={deleteRankingRowAction}
                                type="submit"
                                className="font-semibold text-red-700"
                              >
                                Trinti
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <form action={createRankingRowAction} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="tableId" value={table.id} />
                <input
                  name="rank"
                  type="number"
                  required
                  placeholder="Nr."
                  className="w-16 rounded-lg border border-line px-2 py-2"
                />
                <input
                  name="name"
                  required
                  placeholder="Žaidėjas"
                  className="min-w-[12rem] flex-1 rounded-lg border border-line px-3 py-2"
                />
                <input
                  name="value"
                  type="number"
                  required
                  placeholder="Reikšmė"
                  className="w-28 rounded-lg border border-line px-2 py-2"
                />
                <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
                  Pridėti eilutę
                </button>
              </form>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
