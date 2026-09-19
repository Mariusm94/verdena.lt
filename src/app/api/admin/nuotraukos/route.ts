import { NextResponse } from "next/server";
import { getAdminSession, isPhotoFolder } from "@/lib/admin";
import { deletePhoto, listPhotos, saveUploadedPhoto } from "@/lib/photos";

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Reikia prisijungti." }, { status: 401 });
  }
  const folder = new URL(request.url).searchParams.get("folder") ?? undefined;
  const photos = await listPhotos(folder || undefined);
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Reikia prisijungti." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "kita");
  const alt = String(form.get("alt") ?? "");
  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ error: "Pasirinkite nuotrauką." }, { status: 400 });
  }
  if (!isPhotoFolder(folder)) {
    return NextResponse.json({ error: "Pasirinkite aplanką." }, { status: 400 });
  }
  try {
    const photo = await saveUploadedPhoto(file, folder, alt);
    return NextResponse.json({ photo });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nepavyko įkelti." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Reikia prisijungti." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Nėra nuotraukos." }, { status: 400 });
  await deletePhoto(id);
  return NextResponse.json({ ok: true });
}
