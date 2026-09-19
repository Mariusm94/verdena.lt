"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PlayoffBracket } from "@/data/hegelmannBrackets";
import { linesToList, requireAdmin } from "@/lib/admin";
import {
  applyMatchResult,
  buildEmptyTreeBracket,
  isBracketSize,
  normalizeSlots,
  parseBracketSize,
  rebuildRoundsFromSlots,
  sizeLabel,
} from "@/lib/bracketBuilder";
import { emptyScores } from "@/lib/leagueStore";
import { prisma } from "@/lib/prisma";
import { recomputePlayerCareerStats } from "@/lib/playerCareer";
import { recomputeAndSaveDrawStandings } from "@/lib/standings";
import { tournamentSlugify } from "@/lib/tournamentStore";

function revalidateLeaguePaths(slug: string, externalKey?: string) {
  revalidatePath(`/turnyrai/${slug}`);
  revalidatePath(`/admin/turnyrai/${slug}/lygos`);
  revalidatePath("/reitingai");
  revalidatePath("/zaidejai");
  if (externalKey) {
    revalidatePath(`/turnyrai/${slug}/lenteles/${externalKey}`);
    revalidatePath(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
  }
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("\0");
}

export async function createLeagueDrawAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const groupName = String(formData.get("groupName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  let externalKey = String(formData.get("externalKey") ?? "").trim();
  const teams = linesToList(String(formData.get("teams") ?? ""));

  if (!slug || !groupName || !title || !teams.length) return;

  const tournament = await prisma.tournament.findUnique({ where: { slug } });
  if (!tournament) return;

  if (!externalKey) externalKey = tournamentSlugify(`${groupName}-${title}`);
  const exists = await prisma.leagueDraw.findUnique({
    where: { tournamentId_externalKey: { tournamentId: tournament.id, externalKey } },
  });
  if (exists) externalKey = `${externalKey}-${Date.now().toString().slice(-4)}`;

  const points = teams.map(() => 0);
  const places = teams.map((_, index) => index + 1);
  const scores = emptyScores(teams.length);

  await prisma.leagueDraw.create({
    data: {
      tournamentId: tournament.id,
      externalKey,
      groupName,
      title,
      teams: JSON.stringify(teams),
      points: JSON.stringify(points),
      places: JSON.stringify(places),
      scores: JSON.stringify(scores),
    },
  });

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function updateLeagueDrawAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const groupName = String(formData.get("groupName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const teams = linesToList(String(formData.get("teams") ?? ""));

  if (!slug || !externalKey || !groupName || !title || !teams.length) return;

  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
  });
  if (!draw) return;

  await prisma.leagueDraw.update({
    where: { id: draw.id },
    data: {
      groupName,
      title,
      teams: JSON.stringify(teams),
    },
  });

  await recomputeAndSaveDrawStandings(draw.id);

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function deleteLeagueDrawAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  if (!slug || !externalKey) return;

  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
  });
  if (!draw) return;

  await prisma.leagueDraw.delete({ where: { id: draw.id } });
  revalidateLeaguePaths(slug);
  redirect(`/admin/turnyrai/${slug}/lygos`);
}

export async function createMatchAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const home = String(formData.get("home") ?? "").trim();
  const away = String(formData.get("away") ?? "").trim();
  const score = String(formData.get("score") ?? "").trim();
  const stage = String(formData.get("stage") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "confirmed").trim() || "confirmed";
  const status =
    statusRaw === "pending" ? "pending" : statusRaw === "scheduled" ? "scheduled" : "confirmed";
  const playedAt = String(formData.get("playedAt") ?? "").trim() || null;

  if (!slug || !externalKey || !home || !away) return;

  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
  });
  if (!draw) return;

  await prisma.match.create({
    data: {
      drawId: draw.id,
      home,
      away,
      score,
      stage,
      status: !score && status === "confirmed" ? "scheduled" : status,
      playedAt,
    },
  });

  await recomputeAndSaveDrawStandings(draw.id);
  await recomputePlayerCareerStats();

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function updateMatchAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const home = String(formData.get("home") ?? "").trim();
  const away = String(formData.get("away") ?? "").trim();
  const score = String(formData.get("score") ?? "").trim();
  const stage = String(formData.get("stage") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "confirmed").trim() || "confirmed";
  const status =
    statusRaw === "pending" ? "pending" : statusRaw === "scheduled" ? "scheduled" : "confirmed";
  const playedAt = String(formData.get("playedAt") ?? "").trim() || null;

  if (!matchId || !home || !away) return;

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      home,
      away,
      score,
      stage,
      status,
      playedAt,
    },
  });

  await recomputeAndSaveDrawStandings(match.drawId);
  await recomputePlayerCareerStats();

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function deleteMatchAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "").trim();
  if (!matchId) return;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  await prisma.match.delete({ where: { id: matchId } });
  await recomputeAndSaveDrawStandings(match.drawId);
  await recomputePlayerCareerStats();

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function generateRoundRobinMatchesAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  if (!slug || !externalKey) return;

  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
    include: { matches: { select: { home: true, away: true } } },
  });
  if (!draw) return;

  let teams: string[] = [];
  try {
    teams = JSON.parse(draw.teams) as string[];
  } catch {
    teams = [];
  }
  if (teams.length < 2) {
    revalidateLeaguePaths(slug, externalKey);
    redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
  }

  const existing = new Set(draw.matches.map((m) => pairKey(m.home, m.away)));
  const toCreate: {
    drawId: string;
    home: string;
    away: string;
    score: string;
    stage: string;
    status: string;
  }[] = [];

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      const home = teams[i];
      const away = teams[j];
      if (existing.has(pairKey(home, away))) continue;
      toCreate.push({
        drawId: draw.id,
        home,
        away,
        score: "",
        stage: "Grupė",
        status: "confirmed",
      });
    }
  }

  if (toCreate.length) {
    await prisma.match.createMany({ data: toCreate });
    await recomputeAndSaveDrawStandings(draw.id);
  }

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function createKnockoutBracketAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || "Finalas";
  const sizeRaw = Number.parseInt(String(formData.get("size") ?? "8"), 10);
  const slots = linesToList(String(formData.get("slots") ?? ""));

  if (!slug || !externalKey || !isBracketSize(sizeRaw)) return;

  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
  });
  if (!draw) return;

  const size = sizeRaw;
  const externalId = tournamentSlugify(`${title}-${size}`) || `playoff-${size}-${Date.now().toString().slice(-4)}`;
  const payload = buildEmptyTreeBracket({
    id: externalId,
    title,
    group: draw.groupName,
    drawId: draw.externalKey,
    league: draw.title,
    size,
    slots,
  });

  await prisma.knockoutBracket.upsert({
    where: { drawId_externalId: { drawId: draw.id, externalId } },
    update: {
      title: payload.title,
      league: payload.league,
      groupName: payload.group,
      payload: JSON.stringify(payload),
    },
    create: {
      drawId: draw.id,
      externalId,
      title: payload.title,
      league: payload.league,
      groupName: payload.group,
      payload: JSON.stringify(payload),
    },
  });

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}#playoff`);
}

export async function updateBracketSlotsAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const bracketId = String(formData.get("bracketId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slots = linesToList(String(formData.get("slots") ?? ""));

  if (!slug || !externalKey || !bracketId || !title) return;

  const bracket = await prisma.knockoutBracket.findUnique({ where: { id: bracketId } });
  if (!bracket) return;

  let existing: PlayoffBracket;
  try {
    existing = JSON.parse(bracket.payload) as PlayoffBracket;
  } catch {
    return;
  }

  const size = parseBracketSize(existing.size, existing.slots?.length || slots.length);
  const normalized = normalizeSlots(slots, size);
  const rounds = rebuildRoundsFromSlots(normalized, size);
  const final = rounds[rounds.length - 1]?.matches[0];
  const payload: PlayoffBracket = {
    ...existing,
    title,
    size: sizeLabel(size),
    layout: "tree",
    slots: normalized,
    rounds,
    champion: final?.winner?.trim() || undefined,
  };

  await prisma.knockoutBracket.update({
    where: { id: bracketId },
    data: {
      title,
      payload: JSON.stringify(payload),
    },
  });

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}#playoff`);
}

export async function updateBracketMatchAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const bracketId = String(formData.get("bracketId") ?? "").trim();
  const roundIndex = Number.parseInt(String(formData.get("roundIndex") ?? ""), 10);
  const matchIndex = Number.parseInt(String(formData.get("matchIndex") ?? ""), 10);
  const score = String(formData.get("score") ?? "").trim();
  const winner = String(formData.get("winner") ?? "").trim();

  if (!slug || !externalKey || !bracketId || !Number.isFinite(roundIndex) || !Number.isFinite(matchIndex)) return;

  const bracket = await prisma.knockoutBracket.findUnique({ where: { id: bracketId } });
  if (!bracket) return;

  let existing: PlayoffBracket;
  try {
    existing = JSON.parse(bracket.payload) as PlayoffBracket;
  } catch {
    return;
  }

  const payload = applyMatchResult(existing, roundIndex, matchIndex, score, winner);

  await prisma.knockoutBracket.update({
    where: { id: bracketId },
    data: { payload: JSON.stringify(payload) },
  });

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}#playoff`);
}

export async function upsertBracketPayloadAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const bracketId = String(formData.get("bracketId") ?? "").trim();
  const externalId = String(formData.get("externalId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const league = String(formData.get("league") ?? "").trim();
  const groupName = String(formData.get("groupName") ?? "").trim();
  const payloadRaw = String(formData.get("payload") ?? "").trim();

  if (!slug || !externalKey || !externalId || !title) return;

  let payloadObj: Record<string, unknown> = {};
  if (payloadRaw) {
    try {
      payloadObj = JSON.parse(payloadRaw) as Record<string, unknown>;
    } catch {
      return;
    }
  }

  const draw = await prisma.leagueDraw.findFirst({
    where: { externalKey, tournament: { slug } },
  });
  if (!draw) return;

  const resolvedGroup = groupName || draw.groupName;
  const resolvedLeague = league || draw.title;
  const payload = JSON.stringify({
    ...payloadObj,
    id: externalId,
    title,
    group: resolvedGroup,
    drawId: draw.externalKey,
    league: resolvedLeague,
    kind: payloadObj.kind ?? "lentele",
    layout: payloadObj.layout ?? "tree",
    size: payloadObj.size ?? "",
  });

  if (bracketId) {
    await prisma.knockoutBracket.update({
      where: { id: bracketId },
      data: {
        externalId,
        title,
        league: resolvedLeague,
        groupName: resolvedGroup,
        payload,
      },
    });
  } else {
    await prisma.knockoutBracket.upsert({
      where: { drawId_externalId: { drawId: draw.id, externalId } },
      update: {
        title,
        league: resolvedLeague,
        groupName: resolvedGroup,
        payload,
      },
      create: {
        drawId: draw.id,
        externalId,
        title,
        league: resolvedLeague,
        groupName: resolvedGroup,
        payload,
      },
    });
  }

  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}

export async function deleteBracketAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("tournamentSlug") ?? "").trim();
  const externalKey = String(formData.get("externalKey") ?? "").trim();
  const bracketId = String(formData.get("bracketId") ?? "").trim();
  if (!bracketId) return;

  await prisma.knockoutBracket.delete({ where: { id: bracketId } });
  revalidateLeaguePaths(slug, externalKey);
  redirect(`/admin/turnyrai/${slug}/lygos/${externalKey}`);
}
