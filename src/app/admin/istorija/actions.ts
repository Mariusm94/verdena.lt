"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidateTimeline() {
  revalidatePath("/admin/istorija");
  revalidatePath("/istorija");
}

export async function createTimelineAction(formData: FormData) {
  await requireAdmin();
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  if (!year || !title) return;
  const max = await prisma.timelineEvent.aggregate({ _max: { sortOrder: true } });
  await prisma.timelineEvent.create({
    data: { year, title, text, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  revalidateTimeline();
}

export async function updateTimelineAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  if (!id || !year || !title) return;
  await prisma.timelineEvent.update({ where: { id }, data: { year, title, text } });
  revalidateTimeline();
}

export async function deleteTimelineAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.timelineEvent.delete({ where: { id } });
  revalidateTimeline();
}
