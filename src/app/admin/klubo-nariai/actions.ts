"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function createClubMemberAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.clubMember.create({
    data: { name, sortName: name, published: true },
  });
  revalidatePath("/admin/klubo-nariai");
  revalidatePath("/nariai");
  revalidatePath("/zaidejai");
}

export async function renameClubMemberAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  await prisma.clubMember.update({
    where: { id },
    data: { name, sortName: name },
  });
  revalidatePath("/admin/klubo-nariai");
  revalidatePath("/nariai");
  revalidatePath("/zaidejai");
}

export async function deleteClubMemberAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.clubMember.delete({ where: { id } });
  revalidatePath("/admin/klubo-nariai");
  revalidatePath("/nariai");
  revalidatePath("/zaidejai");
}
