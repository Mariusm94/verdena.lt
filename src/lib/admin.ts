import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/prisijungti?callbackUrl=/admin");
  }
  return session;
}

export async function getAdminSession() {
  const session = await auth();
  if (session?.user?.role !== "admin") return null;
  return session;
}

/** Narys arba admin — nario zonai `/mano`. */
export async function requireMember() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "narys" && role !== "admin")) {
    redirect("/prisijungti?callbackUrl=/mano");
  }
  return session;
}

export const photoFolders = [
  { id: "naujienos", label: "Naujienoms", hint: "Viršeliai straipsniams" },
  { id: "turnyrai", label: "Turnyrams", hint: "Turnyrų nuotraukos" },
  { id: "galerija", label: "Galerijai", hint: "Matysis visiems svetainėje" },
  { id: "kita", label: "Kitos", hint: "Atsarginis aplankas" },
] as const;

export type PhotoFolder = (typeof photoFolders)[number]["id"];

export function isPhotoFolder(value: string): value is PhotoFolder {
  return photoFolders.some((folder) => folder.id === value);
}

export function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
