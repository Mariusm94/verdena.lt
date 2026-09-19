"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidatePress() {
  revalidatePath("/admin/spauda");
  revalidatePath("/spauda");
}

export async function createPressAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const dateLabel = String(formData.get("dateLabel") ?? "").trim() || null;
  if (!title) return;
  const max = await prisma.pressItem.aggregate({ _max: { sortOrder: true } });
  await prisma.pressItem.create({
    data: {
      title,
      excerpt,
      href,
      source,
      dateLabel,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidatePress();
}

export async function updatePressAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const dateLabel = String(formData.get("dateLabel") ?? "").trim() || null;
  if (!id || !title) return;
  await prisma.pressItem.update({
    where: { id },
    data: { title, excerpt, href, source, dateLabel },
  });
  revalidatePress();
}

export async function deletePressAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.pressItem.delete({ where: { id } });
  revalidatePress();
}
