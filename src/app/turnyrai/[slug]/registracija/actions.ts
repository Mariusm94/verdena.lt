"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createRegistrationEntry,
  ensureOpenRegistration,
  ensureRegistrationSchema,
} from "@/lib/registrationStore";
import { rateLimit } from "@/lib/rateLimit";

export type RegistrationSubmitState = {
  ok: boolean;
  message: string;
};

export async function submitTournamentRegistrationAction(
  _prev: RegistrationSubmitState,
  formData: FormData,
): Promise<RegistrationSubmitState> {
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const withPartner = formData.get("withPartner") === "on";
  const partnerFirstName = String(formData.get("partnerFirstName") ?? "").trim();
  const partnerLastName = String(formData.get("partnerLastName") ?? "").trim();
  const partnerEmail = String(formData.get("partnerEmail") ?? "").trim();
  const partnerPhone = String(formData.get("partnerPhone") ?? "").trim();

  if (!slug) {
    return { ok: false, message: "Nepavyko nustatyti turnyro." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const limited = rateLimit(`tournament-reg:${slug}:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return { ok: false, message: "Per daug bandymų. Bandykite vėliau." };
  }

  try {
    await ensureRegistrationSchema();
  } catch {
    return { ok: false, message: "Registracijos sistema laikinai nepasiekiama. Bandykite vėliau." };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
  });

  if (!tournament || !tournament.published) {
    return { ok: false, message: "Turnyras nerastas." };
  }
  if (tournament.status !== "registracija") {
    return { ok: false, message: "Registracija šiuo metu uždaryta." };
  }

  const registration = await ensureOpenRegistration(tournament);
  if (!registration) {
    return { ok: false, message: "Nepavyko atidaryti registracijos formos. Bandykite vėliau." };
  }

  if (!firstName || !lastName || !email || !phone) {
    return { ok: false, message: "Užpildykite visus savo duomenų laukus." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Neteisingas el. pašto adresas." };
  }

  const allowPartner = registration.allowPartner;
  if (withPartner && allowPartner) {
    if (!partnerFirstName || !partnerLastName || !partnerEmail || !partnerPhone) {
      return { ok: false, message: "Užpildykite visus partnerio duomenų laukus." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
      return { ok: false, message: "Neteisingas partnerio el. pašto adresas." };
    }
  }

  try {
    await createRegistrationEntry({
      registrationId: registration.id,
      firstName,
      lastName,
      email,
      phone,
      partnerFirstName: withPartner && allowPartner ? partnerFirstName : null,
      partnerLastName: withPartner && allowPartner ? partnerLastName : null,
      partnerEmail: withPartner && allowPartner ? partnerEmail : null,
      partnerPhone: withPartner && allowPartner ? partnerPhone : null,
    });
  } catch {
    return { ok: false, message: "Nepavyko išsaugoti registracijos. Bandykite dar kartą." };
  }

  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath(`/admin/turnyrai/${slug}/registracija`);

  return { ok: true, message: "Registracija sėkminga. Iki pasimatymo aikštelėje!" };
}
