import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  createClubMemberAction,
  deleteClubMemberAction,
  renameClubMemberAction,
} from "./actions";

export const metadata: Metadata = { title: "Klubo nariai — valdymas" };

export default async function AdminClubMembersPage() {
  const members = await prisma.clubMember.findMany({
    orderBy: [{ sortName: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Klubo nariai</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Viešas sąrašas /nariai. Pridėkite, pervadinkite arba ištrinkite.
      </p>

      <form action={createClubMemberAction} className="mt-8 flex flex-wrap gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm">
        <input
          name="name"
          required
          placeholder="Vardas Pavardė"
          className="min-w-[16rem] flex-1 rounded-2xl border border-line px-4 py-3"
        />
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Pridėti
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-[1.75rem] bg-white shadow-sm">
        <table className="w-full min-w-[28rem] text-left">
          <thead className="bg-court-deep text-white">
            <tr>
              <th className="px-5 py-3 text-sm font-medium">Vardas</th>
              <th className="px-5 py-3 text-sm font-medium" />
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-10 text-center text-ink-soft">
                  Kol kas nėra klubo narių. Pridėkite pirmą aukščiau.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <form action={renameClubMemberAction} className="flex flex-wrap gap-2">
                      <input type="hidden" name="id" value={member.id} />
                      <input
                        name="name"
                        defaultValue={member.name}
                        className="min-w-[14rem] flex-1 rounded-xl border border-line px-3 py-2"
                      />
                      <button type="submit" className="rounded-full px-3 py-1.5 text-sm font-semibold text-court">
                        Išsaugoti
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteClubMemberAction}>
                      <input type="hidden" name="id" value={member.id} />
                      <button type="submit" className="text-sm font-semibold text-red-700">
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
      <p className="mt-4 text-sm text-ink-soft">{members.length} narių</p>
    </div>
  );
}
