import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import GalleryView from "@/app/galerija/GalleryView";
import { listGalleryAlbums } from "@/lib/contentStore";
import { listGalleryPhotos } from "@/lib/photos";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/galerija");
}
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryAlbums = await listGalleryAlbums();
  let uploaded: { url: string; alt: string }[] = [];
  try {
    uploaded = await listGalleryPhotos();
  } catch {
    uploaded = [];
  }

  const albums = [...galleryAlbums];
  if (uploaded.length) {
    albums.unshift({
      year: "naujos",
      title: "Naujausios nuotraukos",
      photos: uploaded.map((photo) => ({ src: photo.url, alt: photo.alt })),
    });
  }

  return <GalleryView albums={albums} />;
}
