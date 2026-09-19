/**
 * Upsert league draws + matches + brackets from src/data/tournament-tables/*.json
 * Safe for Hostinger: fills empty tournaments; use FORCE_TOURNAMENT_SYNC=1 to replace.
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tablesDir = join(root, "src/data/tournament-tables");
const force = process.env.FORCE_TOURNAMENT_SYNC === "1";

const prisma = new PrismaClient();

function loadIndex() {
  const indexPath = join(tablesDir, "index.json");
  if (!existsSync(indexPath)) {
    console.log("No tournament-tables/index.json — skip");
    return [];
  }
  return JSON.parse(readFileSync(indexPath, "utf8"));
}

async function ensureTournament(meta) {
  const tablesNote = "Visos lygos, vietos ir mačai — ieškokite pagal vardą arba naršykite grupes.";
  const links = JSON.stringify([
    { label: "Lentelės", href: `/turnyrai/${meta.slug}#lenteles` },
    { label: "Nuostatai", href: `/turnyrai/${meta.slug}#nuostatai` },
  ]);
  const base = {
    title: meta.title || meta.slug,
    season: meta.season || "",
    status: meta.status || "archyvas",
    tablesNote,
    links,
    published: true,
  };

  const existing = await prisma.tournament.findUnique({ where: { slug: meta.slug } });
  if (existing) {
    return prisma.tournament.update({
      where: { id: existing.id },
      data: base,
    });
  }

  return prisma.tournament.create({
    data: {
      slug: meta.slug,
      ...base,
      format: "Lygos ir mačai",
      description: `${meta.title || meta.slug} — lygos, vietos ir sužaisti mačai.`,
      rules: "[]",
      schedule: "[]",
      tables: "[]",
    },
  });
}

async function syncTournament(slug) {
  const file = join(tablesDir, `${slug}.json`);
  if (!existsSync(file)) {
    console.log(`  skip ${slug}: file missing`);
    return;
  }
  const payload = JSON.parse(readFileSync(file, "utf8"));
  const tournament = await ensureTournament(payload);

  if (force) {
    const draws = await prisma.leagueDraw.findMany({ where: { tournamentId: tournament.id }, select: { id: true } });
    for (const d of draws) {
      await prisma.match.deleteMany({ where: { drawId: d.id } });
      await prisma.knockoutBracket.deleteMany({ where: { drawId: d.id } });
    }
    await prisma.leagueDraw.deleteMany({ where: { tournamentId: tournament.id } });
  }

  let drawsUpserted = 0;
  let matchesCreated = 0;
  let bracketsUpserted = 0;

  for (const draw of payload.draws || []) {
    const row = await prisma.leagueDraw.upsert({
      where: {
        tournamentId_externalKey: { tournamentId: tournament.id, externalKey: draw.externalKey },
      },
      update: {
        groupName: draw.groupName,
        title: draw.title,
        teams: draw.teams,
        points: draw.points,
        places: draw.places,
        scores: draw.scores,
      },
      create: {
        tournamentId: tournament.id,
        externalKey: draw.externalKey,
        groupName: draw.groupName,
        title: draw.title,
        teams: draw.teams,
        points: draw.points,
        places: draw.places,
        scores: draw.scores,
      },
    });
    drawsUpserted += 1;

    const existingMatches = await prisma.match.count({ where: { drawId: row.id } });
    if (existingMatches === 0 && Array.isArray(draw.matches) && draw.matches.length) {
      await prisma.match.createMany({
        data: draw.matches.map((m) => ({
          drawId: row.id,
          home: m.home || "",
          away: m.away || "",
          score: m.score || "",
          previousScore: m.previousScore || "",
          stage: m.stage || "",
          playedAt: m.playedAt || null,
          status: m.status || "confirmed",
        })),
      });
      matchesCreated += draw.matches.length;
    }

    for (const bracket of draw.brackets || []) {
      await prisma.knockoutBracket.upsert({
        where: { drawId_externalId: { drawId: row.id, externalId: bracket.externalId } },
        update: {
          title: bracket.title,
          league: bracket.league,
          groupName: bracket.groupName || "",
          payload: bracket.payload,
        },
        create: {
          drawId: row.id,
          externalId: bracket.externalId,
          title: bracket.title,
          league: bracket.league,
          groupName: bracket.groupName || "",
          payload: bracket.payload,
        },
      });
      bracketsUpserted += 1;
    }
  }

  console.log(
    `  ${slug}: draws=${drawsUpserted} matches+${matchesCreated} brackets=${bracketsUpserted}${force ? " (forced)" : ""}`,
  );
}

async function main() {
  const index = loadIndex();
  if (!index.length) return;

  console.log(`Syncing ${index.length} tournament table dumps…`);
  for (const item of index) {
    await syncTournament(item.slug);
  }
}

main()
  .catch((err) => {
    console.error("sync-tournament-tables failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
