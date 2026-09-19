"use client";

import { useEffect, useState } from "react";
import { photoFolders, type PhotoFolder } from "@/lib/admin";

type Photo = { id: string; url: string; alt: string; folder: string };

export default function PhotoPicker({
  name,
  folder,
  value,
}: {
  name: string;
  folder: PhotoFolder;
  value?: string;
}) {
  const [url, setUrl] = useState(value ?? "");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const label = photoFolders.find((item) => item.id === folder)?.label ?? folder;

  async function load() {
    const response = await fetch(`/api/admin/nuotraukos?folder=${folder}`);
    const data = await response.json();
    setPhotos(data.photos ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Nepavyko įkelti nuotraukų sąrašo."));
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
    setUrl(data.photo.url);
    await load();
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={url} />
      <p className="text-sm font-medium">Nuotrauka</p>
      <p className="text-sm text-ink-soft">
        Įkelkite naują arba pasirinkite iš aplanko „{label}“. Jei nieko nepasirinksite — liks tuščia.
      </p>
      {url ? (
        <div className="relative h-40 overflow-hidden rounded-2xl bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <label className="inline-flex w-fit cursor-pointer rounded-full bg-court px-4 py-2 text-sm font-semibold text-white">
        {busy ? "Keliama…" : "Įkelti nuotrauką iš kompiuterio"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={busy}
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {photos.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setUrl(photo.url)}
              className={`overflow-hidden rounded-xl border-2 ${
                url === photo.url ? "border-gold" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">Šiame aplanke dar nėra nuotraukų.</p>
      )}
    </div>
  );
}
