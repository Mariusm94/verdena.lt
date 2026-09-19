"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { linesToList, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ensureOpenRegistration } from "@/lib/registrationStore";
import { tournamentSlugify } from "@/lib/tournamentStore";

function fieldsFrom(formData: FormData, published: boolean, slug: string) {
  const title = String(formData.get("title") ?? "").trim();
  const season = String(formData.get("season") ?? "").trim();
  const status = String(formData.get("status") ?? "registracija");
  const format = String(formData.get("format") ?? "").trim();
  const sponsor = String(formData.get("sponsor") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const rules = JSON.stringify(linesToList(String(formData.get("rules") ?? "")));
  const schedule = JSON.stringify(linesToList(String(formData.get("schedule") ?? "")));
  const tablesNote = String(formData.get("tablesNote") ?? "").trim() || null;
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const links = [
    { label: "Nuostatai", href: `/turnyrai/${slug}#nuostatai` },
    { label: "Lentelės", href: `/turnyrai/${slug}#lenteles` },
    { label: "Tvarkaraštis", href: `/turnyrai/${slug}#tvarkarastis` },
  ];
  if (status === "registracija") {
    links.unshift({ label: "Registracija", href: `/turnyrai/${slug}#registracija` });
  }

  const autoHrefs = new Set(links.map((link) => link.href));
  for (const line of linesToList(String(formData.get("extraLinks") ?? ""))) {
    const sep = line.indexOf("|");
    if (sep < 0) continue;
    const label = line.slice(0, sep).trim();
    const href = line.slice(sep + 1).trim();
    if (!label || !href || autoHrefs.has(href)) continue;
    links.push({ label, href });
    autoHrefs.add(href);
  }

  return {
    title,
    slug,
    season,
    status,
    format,
    sponsor,
    description,
    rules,
    schedule,
    tablesNote,
    coverImage,
    registerSubject: title ? `Registracija — ${title}` : null,
    links: JSON.stringify(links),
    published,
  };
}

async function syncRegistrationForStatus(tournamentId: string, title: string, status: string) {
  if (status !== "registracija") return;
  await ensureOpenRegistration({ id: tournamentId, title, status });
}

export async function createTournamentAction(formData: FormData) {
  await requireAdmin();
  const published = String(formData.get("intent")) === "publish";
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Įrašykite turnyro pavadinimą." };

  let slug = tournamentSlugify(title);
  if (await prisma.tournament.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }
  const data = fieldsFrom(formData, published, slug);
  if (!data.season || !data.format || !data.description) {
    return { error: "Užpildykite sezoną, formatą ir trumpą aprašymą." };
  }

  const created = await prisma.tournament.create({ data });
  await syncRegistrationForStatus(created.id, created.title, created.status);
  revalidatePath("/turnyrai");
  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath("/");
  redirect("/admin/turnyrai");
}

export async function updateTournamentAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const published = String(formData.get("intent")) === "publish";
  if (!slug) return { error: "Nerastas turnyras." };
  const data = fieldsFrom(formData, published, slug);
  if (!data.title || !data.season || !data.format || !data.description) {
    return { error: "Užpildykite pavadinimą, sezoną, formatą ir aprašymą." };
  }

  const updated = await prisma.tournament.update({
    where: { slug },
    data: { ...data, slug },
  });
  await syncRegistrationForStatus(updated.id, updated.title, updated.status);
  revalidatePath("/turnyrai");
  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath("/");
  redirect("/admin/turnyrai");
}

export async function deleteTournamentAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await prisma.tournament.delete({ where: { slug } });
  revalidatePath("/turnyrai");
  revalidatePath("/");
  redirect("/admin/turnyrai");
}
