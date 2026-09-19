import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createPressAction, deletePressAction, updatePressAction } from "./actions";

export const metadata: Metadata = { title: "Spauda — valdymas" };

export default async function AdminPressPage() {
  const items = await prisma.pressItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-4xl">Spauda</h1>
      <p className="mt-2 max-w-xl text-ink-soft">Istorijos spaudoje įrašai.</p>

      <form action={createPressAction} className="mt-8 grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm">
        <input name="title" required placeholder="Pavadinimas" className="rounded-2xl border border-line px-4 py-3" />
        <textarea name="excerpt" rows={3} placeholder="Trumpas tekstas" className="rounded-2xl border border-line px-4 py-3" />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="source" placeholder="Šaltinis" className="rounded-2xl border border-line px-4 py-3" />
          <input name="dateLabel" placeholder="Data (tekstas)" className="rounded-2xl border border-line px-4 py-3" />
          <input name="href" placeholder="Nuoroda" className="rounded-2xl border border-line px-4 py-3" />
        </div>
        <button type="submit" className="w-fit rounded-full bg-court px-5 py-3 font-semibold text-white">
          Pridėti
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {items.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nėra spaudos įrašų. Pridėkite pirmą aukščiau.
          </p>
        ) : (
          items.map((item) => (
            <form key={item.id} action={updatePressAction} className="grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm">
              <input type="hidden" name="id" value={item.id} />
              <input name="title" defaultValue={item.title} className="rounded-2xl border border-line px-4 py-3" />
              <textarea
                name="excerpt"
                rows={3}
                defaultValue={item.excerpt ?? ""}
                className="rounded-2xl border border-line px-4 py-3"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="source"
                  defaultValue={item.source ?? ""}
                  className="rounded-2xl border border-line px-4 py-3"
                />
                <input
                  name="dateLabel"
                  defaultValue={item.dateLabel ?? ""}
                  className="rounded-2xl border border-line px-4 py-3"
                />
                <input
                  name="href"
                  defaultValue={item.href ?? ""}
                  className="rounded-2xl border border-line px-4 py-3"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
                  Išsaugoti
                </button>
                <button formAction={deletePressAction} type="submit" className="text-sm font-semibold text-red-700">
                  Trinti
                </button>
              </div>
            </form>
          ))
        )}
      </div>
    </div>
  );
}
