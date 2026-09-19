"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import Lightbox from "@/components/Lightbox";
import PageHeader from "@/components/PageHeader";

type Photo = { src: string; alt: string };
type Album = { year: string; title: string; photos: Photo[] };

export default function GalleryView({ albums }: { albums: Album[] }) {
  const [active, setActive] = useState<Photo | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <div>
      <PageHeader
        eyebrow="Galerija"
        title="Nuotraukų archyvas"
        text="Turnyrai, šventės ir klubo gyvenimas — nuo šiandienos iki istorinių dokumentų."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        {albums.length === 0 ? (
          <p className="rounded-3xl border border-line bg-white p-8 text-ink-soft">
            Galerija ruošiama — netrukus čia atsiras „Verdenos“ turnyrų ir bendruomenės nuotraukos.
          </p>
        ) : null}
        {albums.map((album) => (
          <div key={`${album.year}-${album.title}`} className="mb-14">
            <h2 className="font-display text-4xl">{album.title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {album.photos.map((photo) => (
                <button
                  key={`${album.year}-${album.title}-${photo.src}`}
                  type="button"
                  aria-label={`Atidaryti nuotrauką: ${photo.alt}`}
                  onClick={() => setActive(photo)}
                  className="relative aspect-[4/3] overflow-hidden rounded-3xl"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
      {active ? <Lightbox src={active.src} alt={active.alt} onClose={close} /> : null}
    </div>
  );
}
