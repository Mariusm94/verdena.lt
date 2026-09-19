"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  deleteRegistrationEntry,
  getOrCreateRegistration,
  updateRegistrationConfig,
} from "@/lib/registrationStore";

function revalidateRegistration(slug: string) {
  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath(`/admin/turnyrai/${slug}/registracija`);
  revalidatePath("/admin/turnyrai");
}

export async function saveRegistrationConfigAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || "Registracija";
  const intro = String(formData.get("intro") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const allowPartner = formData.get("allowPartner") === "on";

  if (!slug) return;

  const tournament = await prisma.tournament.findUnique({ where: { slug } });
  if (!tournament) return;

  const reg = await getOrCreateRegistration(tournament.id);
  await updateRegistrationConfig(reg.id, { title, intro, enabled, allowPartner });

  revalidateRegistration(slug);
}

export async function deleteRegistrationEntryAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const entryId = String(formData.get("entryId") ?? "").trim();
  if (!slug || !entryId) return;

  await deleteRegistrationEntry(entryId);
  revalidateRegistration(slug);
}
