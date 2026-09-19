"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

function emailOf(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

async function clientKey(prefix: string) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  return `${prefix}:${ip}`;
}

export async function loginAction(formData: FormData) {
  const email = emailOf(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/") || "/";

  if (!email || !password) return { error: "Įveskite el. paštą ir slaptažodį." };

  const limited = rateLimit(await clientKey(`login:${email}`), 12, 15 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Per daug bandymų. Palaukite ~${limited.retryAfterSec} s.` };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Neteisingas el. paštas arba slaptažodis." };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = emailOf(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const limited = rateLimit(await clientKey("register"), 6, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Per daug registracijų iš šio tinklo. Palaukite ~${Math.ceil(limited.retryAfterSec / 60)} min.` };
  }

  if (!name || !email || !password) {
    return { error: "Užpildykite vardą, el. paštą ir slaptažodį." };
  }
  if (password.length < 8) {
    return { error: "Slaptažodis turi būti bent 8 simbolių." };
  }
  if (password !== confirm) {
    return { error: "Slaptažodžiai nesutampa." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Toks el. paštas jau registruotas. Bandykite prisijungti." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 12),
      role: "narys",
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Paskyra sukurta, bet prisijungti nepavyko. Bandykite prisijungimo puslapyje." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
