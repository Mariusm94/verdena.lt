"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidateRankings() {
  revalidatePath("/admin/reitingai");
  revalidatePath("/reitingai");
  revalidatePath("/zaidejai");
}

export async function createRankingTableAction(formData: FormData) {
  await requireAdmin();
  const externalKey = String(formData.get("externalKey") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  const title = String(formData.get("title") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  if (!externalKey || !title || !unit) return;

  const max = await prisma.rankingTable.aggregate({ _max: { sortOrder: true } });
  await prisma.rankingTable.create({
    data: {
      externalKey,
      title,
      unit,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidateRankings();
}

export async function updateRankingTableAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  if (!id || !title || !unit) return;
  await prisma.rankingTable.update({ where: { id }, data: { title, unit } });
  revalidateRankings();
}

export async function deleteRankingTableAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.rankingTable.delete({ where: { id } });
  revalidateRankings();
}

export async function createRankingRowAction(formData: FormData) {
  await requireAdmin();
  const tableId = String(formData.get("tableId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rank = Number(formData.get("rank") ?? 0);
  const value = Number(formData.get("value") ?? 0);
  if (!tableId || !name || !rank) return;
  await prisma.rankingRow.create({
    data: { tableId, name, rank, value: Number.isFinite(value) ? value : 0 },
  });
  revalidateRankings();
}

export async function updateRankingRowAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rank = Number(formData.get("rank") ?? 0);
  const value = Number(formData.get("value") ?? 0);
  if (!id || !name || !rank) return;
  await prisma.rankingRow.update({
    where: { id },
    data: { name, rank, value: Number.isFinite(value) ? value : 0 },
  });
  revalidateRankings();
}

export async function deleteRankingRowAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.rankingRow.delete({ where: { id } });
  revalidateRankings();
}
