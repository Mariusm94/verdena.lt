"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidateVideos() {
  revalidatePath("/admin/video");
  revalidatePath("/video");
}

export async function createVideoAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const youtubeId = String(formData.get("youtubeId") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const published = formData.get("published") === "on";
  if (!title) return;
  const max = await prisma.videoItem.aggregate({ _max: { sortOrder: true } });
  await prisma.videoItem.create({
    data: {
      title,
      description,
      youtubeId,
      image,
      published,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidateVideos();
}

export async function updateVideoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const youtubeId = String(formData.get("youtubeId") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const published = formData.get("published") === "on";
  if (!id || !title) return;
  await prisma.videoItem.update({
    where: { id },
    data: { title, description, youtubeId, image, published },
  });
  revalidateVideos();
}

export async function deleteVideoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.videoItem.delete({ where: { id } });
  revalidateVideos();
}
