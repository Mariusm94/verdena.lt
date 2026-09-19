"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function emailOf(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function parseRole(value: FormDataEntryValue | null) {
  const role = String(value ?? "").trim();
  return role === "admin" ? "admin" : "narys";
}

export async function createUserAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = emailOf(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));
  const playerName = String(formData.get("playerName") ?? "").trim() || null;

  if (!name || !email || !password) {
    return { error: "Užpildykite vardą, el. paštą ir slaptažodį." };
  }
  if (password.length < 8) {
    return { error: "Slaptažodis turi būti bent 8 simbolių." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Toks el. paštas jau naudojamas." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 12),
      role,
      playerName,
    },
  });

  revalidatePath("/admin/vartotojai");
  revalidatePath("/admin");
  redirect("/admin/vartotojai");
}

export async function updateUserAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = parseRole(formData.get("role"));
  const playerName = String(formData.get("playerName") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");

  if (!id || !name) {
    return { error: "Užpildykite vardą." };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return { error: "Vartotojas nerastas." };
  }

  if (password && password.length < 8) {
    return { error: "Naujas slaptažodis turi būti bent 8 simbolių." };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      role,
      playerName,
      ...(password ? { passwordHash: await hash(password, 12) } : {}),
    },
  });

  revalidatePath("/admin/vartotojai");
  revalidatePath(`/admin/vartotojai/${id}`);
  revalidatePath("/admin");
  redirect("/admin/vartotojai");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  if (id === session.user.id) {
    return;
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/vartotojai");
  revalidatePath("/admin");
}
