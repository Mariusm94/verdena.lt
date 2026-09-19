import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createTimelineAction, deleteTimelineAction, updateTimelineAction } from "./actions";

export const metadata: Metadata = { title: "Istorija — valdymas" };

export default async function AdminTimelinePage() {
  const events = await prisma.timelineEvent.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-4xl">Istorija</h1>
      <p className="mt-2 max-w-xl text-ink-soft">Laiko juostos įvykiai /istorija puslapiui.</p>

      <form action={createTimelineAction} className="mt-8 grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="year" required placeholder="Metai" className="rounded-2xl border border-line px-4 py-3" />
          <input name="title" required placeholder="Pavadinimas" className="rounded-2xl border border-line px-4 py-3" />
        </div>
        <textarea name="text" rows={3} placeholder="Tekstas" className="rounded-2xl border border-line px-4 py-3" />
        <button type="submit" className="w-fit rounded-full bg-court px-5 py-3 font-semibold text-white">
          Pridėti įvykį
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {events.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nėra istorijos įvykių. Pridėkite pirmą aukščiau.
          </p>
        ) : (
          events.map((event) => (
            <form
              key={event.id}
              action={updateTimelineAction}
              className="grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="id" value={event.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <input name="year" defaultValue={event.year} className="rounded-2xl border border-line px-4 py-3" />
                <input name="title" defaultValue={event.title} className="rounded-2xl border border-line px-4 py-3" />
              </div>
              <textarea
                name="text"
                rows={3}
                defaultValue={event.text}
                className="rounded-2xl border border-line px-4 py-3"
              />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
                  Išsaugoti
                </button>
                <button formAction={deleteTimelineAction} type="submit" className="text-sm font-semibold text-red-700">
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
