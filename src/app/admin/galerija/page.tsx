import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  createAlbumAction,
  createPhotoAction,
  deleteAlbumAction,
  deletePhotoAction,
  updateAlbumAction,
  updatePhotoAction,
} from "./actions";

export const metadata: Metadata = { title: "Galerija — valdymas" };

export default async function AdminGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { sortOrder: "asc" },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Galerija</h1>
      <p className="mt-2 max-w-xl text-ink-soft">Albumai ir nuotraukų URL / alt viešai galerijai.</p>

      <form action={createAlbumAction} className="mt-8 flex flex-wrap gap-3 rounded-[1.75rem] bg-white p-5 shadow-sm">
        <input name="year" required placeholder="Metai / raktas" className="rounded-2xl border border-line px-4 py-3" />
        <input name="title" required placeholder="Albumo pavadinimas" className="min-w-[14rem] flex-1 rounded-2xl border border-line px-4 py-3" />
        <button type="submit" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Pridėti albumą
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {albums.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-ink-soft shadow-sm">
            Kol kas nėra albumų. Pridėkite pirmą aukščiau.
          </p>
        ) : (
          albums.map((album) => (
            <section key={album.id} className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <form action={updateAlbumAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={album.id} />
                <label className="grid gap-1 text-sm">
                  Metai
                  <input name="year" defaultValue={album.year} className="rounded-xl border border-line px-3 py-2" />
                </label>
                <label className="grid gap-1 text-sm">
                  Pavadinimas
                  <input
                    name="title"
                    defaultValue={album.title}
                    className="min-w-[14rem] rounded-xl border border-line px-3 py-2"
                  />
                </label>
                <button type="submit" className="rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
                  Išsaugoti
                </button>
                <button formAction={deleteAlbumAction} type="submit" className="text-sm font-semibold text-red-700">
                  Trinti albumą
                </button>
              </form>

              <ul className="mt-6 space-y-3">
                {album.photos.length === 0 ? (
                  <li className="py-4 text-center text-sm text-ink-soft">Kol kas nėra nuotraukų šiame albume.</li>
                ) : (
                  album.photos.map((photo) => (
                    <li key={photo.id}>
                      <form action={updatePhotoAction} className="flex flex-wrap gap-2">
                        <input type="hidden" name="id" value={photo.id} />
                        <input
                          name="url"
                          defaultValue={photo.url}
                          className="min-w-[16rem] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
                        />
                        <input
                          name="alt"
                          defaultValue={photo.alt}
                          className="min-w-[10rem] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
                        />
                        <button type="submit" className="rounded-full px-3 py-1.5 text-sm font-semibold text-court">
                          Išsaugoti
                        </button>
                        <button
                          formAction={deletePhotoAction}
                          type="submit"
                          className="text-sm font-semibold text-red-700"
                        >
                          Trinti
                        </button>
                      </form>
                    </li>
                  ))
                )}
              </ul>

              <form action={createPhotoAction} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="albumId" value={album.id} />
                <input
                  name="url"
                  required
                  placeholder="/images/..."
                  className="min-w-[16rem] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
                />
                <input
                  name="alt"
                  placeholder="Alt tekstas"
                  className="min-w-[10rem] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
                  Pridėti nuotrauką
                </button>
              </form>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
