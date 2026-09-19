"use server";

import { revalidatePath } from "next/cache";
import { foldText } from "@/data/hegelmannSchedule";
import { requireMember } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/** Bent vienas setas: skaičius:skaičius arba skaičius-skaičius (ne export — "use server" failas). */
function isValidMatchScore(score: string) {
  return /\d+\s*[:\-]\s*\d+/.test(score.trim());
}

export async function submitMatchScoreAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireMember();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const score = String(formData.get("score") ?? "").trim();
  if (!matchId || !score) {
    return { error: "Įveskite mačo rezultatą." };
  }
  if (!isValidMatchScore(score)) {
    return {
      error: "Neteisingas rezultato formatas. Naudokite pvz. 6:4 6:3 arba 6-4 6-3.",
    };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { draw: { include: { tournament: { select: { slug: true } } } } },
  });
  if (!match) {
    return { error: "Mačas nerastas." };
  }

  if (match.status === "confirmed" && match.score.trim()) {
    return { error: "Patvirtinto rezultato keisti negalima. Kreipkitės į administraciją." };
  }

  const playerName = session.user.playerName?.trim() || session.user.name || "";
  const needle = foldText(playerName);
  const inMatch =
    Boolean(needle) &&
    (foldText(match.home).includes(needle) || foldText(match.away).includes(needle));
  if (!inMatch) {
    return { error: "Šis mačas nepriklauso jūsų žaidėjo vardui." };
  }

  const previousScore = match.status === "pending" ? match.previousScore : match.score;

  await prisma.match.update({
    where: { id: matchId },
    data: {
      previousScore,
      score,
      status: "pending",
      submittedByUserId: session.user.id,
    },
  });

  const slug = match.draw.tournament.slug;
  const key = match.draw.externalKey;
  revalidatePath("/mano");
  revalidatePath("/admin/rezultatai");
  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath(`/turnyrai/${slug}/lenteles/${key}`);

  return { ok: true };
}
