"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidateGallery() {
  revalidatePath("/admin/galerija");
  revalidatePath("/galerija");
}

export async function createAlbumAction(formData: FormData) {
  await requireAdmin();
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!year || !title) return;
  const max = await prisma.galleryAlbum.aggregate({ _max: { sortOrder: true } });
  await prisma.galleryAlbum.create({
    data: { year, title, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  revalidateGallery();
}

export async function updateAlbumAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !year || !title) return;
  await prisma.galleryAlbum.update({ where: { id }, data: { year, title } });
  revalidateGallery();
}

export async function deleteAlbumAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.galleryAlbum.delete({ where: { id } });
  revalidateGallery();
}

export async function createPhotoAction(formData: FormData) {
  await requireAdmin();
  const albumId = String(formData.get("albumId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  if (!albumId || !url) return;
  const max = await prisma.galleryPhoto.aggregate({
    where: { albumId },
    _max: { sortOrder: true },
  });
  await prisma.galleryPhoto.create({
    data: {
      albumId,
      url,
      alt,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidateGallery();
}

export async function updatePhotoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  if (!id || !url) return;
  await prisma.galleryPhoto.update({ where: { id }, data: { url, alt } });
  revalidateGallery();
}

export async function deletePhotoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.galleryPhoto.delete({ where: { id } });
  revalidateGallery();
}
