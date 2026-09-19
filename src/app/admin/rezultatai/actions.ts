"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { recomputePlayerCareerStats } from "@/lib/playerCareer";
import { recomputeAndSaveDrawStandings } from "@/lib/standings";

async function revalidateMatchPaths(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { draw: { include: { tournament: { select: { slug: true } } } } },
  });
  if (!match) return;
  const slug = match.draw.tournament.slug;
  const key = match.draw.externalKey;
  revalidatePath("/mano");
  revalidatePath("/admin/rezultatai");
  revalidatePath("/reitingai");
  revalidatePath("/zaidejai");
  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath(`/turnyrai/${slug}/lenteles/${key}`);
  revalidatePath(`/admin/turnyrai/${slug}/lygos/${key}`);
}

export async function confirmPendingMatchAction(formData: FormData) {
  await requireAdmin();
  const matchId = String(formData.get("matchId") ?? "").trim();
  if (!matchId) return;

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: "confirmed",
      previousScore: "",
      submittedByUserId: null,
    },
  });

  await recomputeAndSaveDrawStandings(match.drawId);
  await recomputePlayerCareerStats();
  await revalidateMatchPaths(matchId);
}

export async function rejectPendingMatchAction(formData: FormData) {
  await requireAdmin();
  const matchId = String(formData.get("matchId") ?? "").trim();
  if (!matchId) return;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      score: match.previousScore,
      previousScore: "",
      status: "confirmed",
      submittedByUserId: null,
    },
  });

  await recomputeAndSaveDrawStandings(updated.drawId);
  await recomputePlayerCareerStats();
  await revalidateMatchPaths(matchId);
}
