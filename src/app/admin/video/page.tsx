import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createVideoAction, deleteVideoAction, updateVideoAction } from "./actions";

export const metadata: Metadata = { title: "Video — valdymas" };

export default async function AdminVideoPage() {
  const videos = await prisma.videoItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-4xl">Video</h1>
      <p className="mt-2 max-w-xl text-ink-soft">YouTube įrašai viešam /video puslapiui.</p>

      <form action={createVideoAction} className="mt-8 grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm md:grid-cols-2">
        <input name="title" required placeholder="Pavadinimas" className="rounded-2xl border border-line px-4 py-3 md:col-span-2" />
        <input name="youtubeId" placeholder="YouTube ID" className="rounded-2xl border border-line px-4 py-3" />
        <input name="image" placeholder="Nuotraukos URL" className="rounded-2xl border border-line px-4 py-3" />
        <textarea name="description" rows={3} placeholder="Aprašymas" className="rounded-2xl border border-line px-4 py-3 md:col-span-2" />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="published" defaultChecked />
          Skelbti viešai
        </label>
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white md:col-span-2 md:w-fit">
          Pridėti video
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {videos.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nėra video įrašų. Pridėkite pirmą aukščiau.
          </p>
        ) : (
          videos.map((video) => (
            <form
              key={video.id}
              action={updateVideoAction}
              className="grid gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm md:grid-cols-2"
            >
              <input type="hidden" name="id" value={video.id} />
              <input
                name="title"
                defaultValue={video.title}
                className="rounded-2xl border border-line px-4 py-3 md:col-span-2"
              />
              <input
                name="youtubeId"
                defaultValue={video.youtubeId}
                className="rounded-2xl border border-line px-4 py-3"
              />
              <input
                name="image"
                defaultValue={video.image}
                className="rounded-2xl border border-line px-4 py-3"
              />
              <textarea
                name="description"
                rows={3}
                defaultValue={video.description}
                className="rounded-2xl border border-line px-4 py-3 md:col-span-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked={video.published} />
                Skelbti viešai
              </label>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <button type="submit" className="rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
                  Išsaugoti
                </button>
                <button formAction={deleteVideoAction} type="submit" className="text-sm font-semibold text-red-700">
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
