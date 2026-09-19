"use client";

import { useEffect, useState } from "react";
import { photoFolders, type PhotoFolder } from "@/lib/admin";

type Photo = { id: string; url: string; alt: string; folder: string };

export default function PhotoLibrary() {
  const [folder, setFolder] = useState<PhotoFolder>("galerija");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const current = photoFolders.find((item) => item.id === folder);

  async function load(next = folder) {
    const response = await fetch(`/api/admin/nuotraukos?folder=${next}`);
    const data = await response.json();
    setPhotos(data.photos ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Nepavyko parodyti nuotraukų."));
  }, [folder]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    body.set("folder", folder);
    body.set("alt", file.name);
    const response = await fetch("/api/admin/nuotraukos", { method: "POST", body });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Nepavyko įkelti.");
      return;
    }
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm("Ištrinti šią nuotrauką?")) return;
    await fetch(`/api/admin/nuotraukos?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photoFolders.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFolder(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              folder === item.id ? "bg-court text-white" : "border border-line bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-ink-soft">{current?.hint}</p>
      <label className="mt-6 inline-flex cursor-pointer rounded-full bg-court px-5 py-3 font-semibold text-white">
        {busy ? "Keliama…" : "Pasirinkti nuotrauką iš kompiuterio"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={busy}
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
      </label>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="truncate text-ink-soft">{photo.alt}</span>
              <button type="button" onClick={() => onDelete(photo.id)} className="font-semibold text-red-700">
                Trinti
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
      {!photos.length ? <p className="mt-8 text-ink-soft">Šiame aplanke dar tuščia — įkelkite pirmą nuotrauką.</p> : null}
    </div>
  );
}
