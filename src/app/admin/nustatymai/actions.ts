"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { board as staticBoard, club as staticClub, stats as staticStats } from "@/data/site";
import { defaultSeo, type SeoSettings } from "@/data/seo";
import { playerStats as staticPlayerStats } from "@/data/rankings";

function revalidateSettings() {
  revalidatePath("/admin/nustatymai");
  revalidatePath("/");
  revalidatePath("/apie");
  revalidatePath("/kontaktai");
  revalidatePath("/parama");
  revalidatePath("/naryste");
  revalidatePath("/zaidejai");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}

async function saveSetting(key: string, value: unknown) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}

export async function saveClubSettingsAction(formData: FormData) {
  await requireAdmin();
  const foundersRaw = String(formData.get("founders") ?? "");
  const founders = foundersRaw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const club = {
    ...staticClub,
    name: String(formData.get("name") ?? "").trim() || staticClub.name,
    shortName: String(formData.get("shortName") ?? "").trim() || staticClub.shortName,
    founded: Number(formData.get("founded") ?? staticClub.founded) || staticClub.founded,
    foundedDate: String(formData.get("foundedDate") ?? "").trim() || staticClub.foundedDate,
    email: String(formData.get("email") ?? "").trim() || staticClub.email,
    phone: String(formData.get("phone") ?? "").trim(),
    facebook: String(formData.get("facebook") ?? "").trim() || staticClub.facebook,
    address: String(formData.get("address") ?? "").trim() || staticClub.address,
    company: String(formData.get("company") ?? "").trim() || staticClub.company,
    code: String(formData.get("code") ?? "").trim() || staticClub.code,
    bank: String(formData.get("bank") ?? "").trim() || staticClub.bank,
    iban: String(formData.get("iban") ?? "").trim() || staticClub.iban,
    founders: founders.length ? founders : staticClub.founders,
    foundersGenitive:
      String(formData.get("foundersGenitive") ?? "").trim() || staticClub.foundersGenitive,
  };

  await saveSetting("club", club);
  revalidateSettings();
}

export async function saveSeoSettingsAction(formData: FormData) {
  await requireAdmin();

  let pages: SeoSettings["pages"] = { ...defaultSeo.pages };
  const pagesRaw = String(formData.get("pagesJson") ?? "").trim();
  if (pagesRaw) {
    try {
      const parsed = JSON.parse(pagesRaw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        pages = parsed as SeoSettings["pages"];
      }
    } catch {
      return;
    }
  }

  const seo: SeoSettings = {
    siteUrl: String(formData.get("siteUrl") ?? "").trim() || defaultSeo.siteUrl,
    titleDefault: String(formData.get("titleDefault") ?? "").trim() || defaultSeo.titleDefault,
    titleTemplate: String(formData.get("titleTemplate") ?? "").trim() || defaultSeo.titleTemplate,
    description: String(formData.get("description") ?? "").trim() || defaultSeo.description,
    keywords: String(formData.get("keywords") ?? "").trim() || defaultSeo.keywords,
    ogImage: String(formData.get("ogImage") ?? "").trim() || defaultSeo.ogImage,
    pages,
  };

  await saveSetting("seo", seo);
  revalidateSettings();
}

export async function saveStatsSettingsAction(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("statsJson") ?? "");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    await saveSetting("stats", parsed);
    revalidateSettings();
  } catch {
    /* ignore invalid JSON */
  }
}

export async function saveBoardSettingsAction(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("boardJson") ?? "");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    await saveSetting("board", parsed);
    revalidateSettings();
  } catch {
    /* ignore invalid JSON */
  }
}

export async function savePlayerStatsAction(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("playerStatsJson") ?? "");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    await saveSetting("playerStats", parsed);
    revalidateSettings();
  } catch {
    /* ignore invalid JSON */
  }
}

export async function resetSettingsDefaultsAction() {
  await requireAdmin();
  await saveSetting("club", staticClub);
  await saveSetting("stats", staticStats);
  await saveSetting("board", staticBoard);
  await saveSetting("playerStats", staticPlayerStats);
  await saveSetting("seo", defaultSeo);
  revalidateSettings();
}
