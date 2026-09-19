import type { Metadata } from "next";
import PhotoLibrary from "@/app/admin/nuotraukos/PhotoLibrary";

export const metadata: Metadata = { title: "Nuotraukos — valdymas" };

export default function AdminPhotosPage() {
  return (
    <div>
      <h1 className="font-display text-4xl">Nuotraukos</h1>
      <p className="mt-3 max-w-2xl leading-7 text-ink-soft">
        Pasirinkite aplanką ir kelkite kaip į kompiuterio folderį. Galerijos aplanko nuotraukos iškart matomos
        svetainės skiltyje Galerija.
      </p>
      <div className="mt-8">
        <PhotoLibrary />
      </div>
    </div>
  );
}
