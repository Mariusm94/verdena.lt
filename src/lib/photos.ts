import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { isPhotoFolder, type PhotoFolder } from "@/lib/admin";

const uploadRoot = path.join(process.cwd(), "public", "uploads");

function safeFileName(name: string) {
  const base = name
    .toLocaleLowerCase("lt")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "nuotrauka";
}

export async function listPhotos(folder?: string) {
  return prisma.photo.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function listGalleryPhotos() {
  return prisma.photo.findMany({
    where: { folder: "galerija" },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveUploadedPhoto(file: File, folder: PhotoFolder, alt: string) {
  if (!isPhotoFolder(folder)) throw new Error("Nežinomas aplankas");
  const type = file.type.toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type)) {
    throw new Error("Tinka tik JPG, PNG, WEBP arba GIF.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Nuotrauka per didelė — iki 8 MB.");
  }

  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : type === "image/gif" ? "gif" : "jpg";
  const name = `${Date.now()}-${safeFileName(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
  const dir = path.join(uploadRoot, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/${folder}/${name}`;
  return prisma.photo.create({
    data: { url, folder, alt: alt.trim() || file.name },
  });
}

export async function deletePhoto(id: string) {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;
  const filePath = path.join(process.cwd(), "public", photo.url.replace(/^\//, ""));
  try {
    await unlink(filePath);
  } catch {
    // file may already be gone
  }
  await prisma.photo.delete({ where: { id } });
}
