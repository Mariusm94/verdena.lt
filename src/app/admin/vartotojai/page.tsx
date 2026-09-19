import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteUserAction } from "./actions";
import CreateUserForm from "./CreateUserForm";

export const metadata: Metadata = { title: "Vartotojai — valdymas" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      playerName: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div>
        <h1 className="font-display text-4xl">Vartotojai</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Narių ir administratorių paskyros. Žaidėjo vardas (playerName) naudojamas mačų paieškai zonai „Mano mačai“.
        </p>
      </div>

      <CreateUserForm />

      <div className="mt-8 overflow-x-auto rounded-[1.75rem] bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="bg-court-deep text-white">
            <tr>
              <th className="px-5 py-3 text-sm font-medium">Vardas</th>
              <th className="px-5 py-3 text-sm font-medium">El. paštas</th>
              <th className="px-5 py-3 text-sm font-medium">Žaidėjas</th>
              <th className="px-5 py-3 text-sm font-medium">Rolė</th>
              <th className="px-5 py-3 text-sm font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-soft">
                  Kol kas nėra vartotojų.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = user.id === session.user.id;
                return (
                  <tr key={user.id} className="border-t border-line">
                    <td className="px-5 py-3 font-medium">{user.name}</td>
                    <td className="px-5 py-3 text-sm text-ink-soft">{user.email}</td>
                    <td className="px-5 py-3 text-sm">{user.playerName || "—"}</td>
                    <td className="px-5 py-3 text-sm">{user.role}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3 text-sm font-semibold">
                        <Link href={`/admin/vartotojai/${user.id}`} className="text-court">
                          Taisyti
                        </Link>
                        {isSelf ? (
                          <span className="text-ink-soft" title="Savęs trinti negalima">
                            —
                          </span>
                        ) : (
                          <form action={deleteUserAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <button type="submit" className="text-red-700">
                              Trinti
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
