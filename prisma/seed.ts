import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { news } from "../src/data/news";
import { tournaments } from "../src/data/tournaments";
import { hegelmannDraws } from "../src/data/hegelmannDraws";
import { hegelmannBrackets } from "../src/data/hegelmannBrackets";
import { hegelmannMatches } from "../src/data/hegelmannSchedule";
import { members } from "../src/data/members";
import { rankingTables, playerStats } from "../src/data/rankings";
import { club, stats, board } from "../src/data/site";
import { defaultSeo } from "../src/data/seo";
import { galleryAlbums, videos, pressItems, timeline } from "../src/data/gallery";
import { serializeTournamentFields } from "../src/lib/tournamentStore";

const prisma = new PrismaClient();

async function seedContent() {
  if ((await prisma.clubMember.count()) === 0) {
    await prisma.clubMember.createMany({
      data: members.map((name) => ({
        name,
        sortName: name,
        published: true,
      })),
    });
  }

  if ((await prisma.rankingTable.count()) === 0) {
    for (const [index, table] of rankingTables.entries()) {
      await prisma.rankingTable.create({
        data: {
          externalKey: table.id,
          title: table.title,
          unit: table.unit,
          sortOrder: index,
          rows: {
            create: table.rows.map((row) => ({
              rank: row.rank,
              name: row.name,
              value: row.value,
            })),
          },
        },
      });
    }
  }

  await prisma.siteSetting.upsert({
    where: { key: "club" },
    update: { value: JSON.stringify(club) },
    create: { key: "club", value: JSON.stringify(club) },
  });
  await prisma.siteSetting.upsert({
    where: { key: "stats" },
    update: { value: JSON.stringify(stats) },
    create: { key: "stats", value: JSON.stringify(stats) },
  });
  await prisma.siteSetting.upsert({
    where: { key: "board" },
    update: { value: JSON.stringify(board) },
    create: { key: "board", value: JSON.stringify(board) },
  });
  await prisma.siteSetting.upsert({
    where: { key: "playerStats" },
    update: {},
    create: { key: "playerStats", value: JSON.stringify(playerStats) },
  });
  await prisma.siteSetting.upsert({
    where: { key: "seo" },
    update: { value: JSON.stringify(defaultSeo) },
    create: { key: "seo", value: JSON.stringify(defaultSeo) },
  });

  if ((await prisma.galleryAlbum.count()) === 0) {
    for (const [index, album] of galleryAlbums.entries()) {
      await prisma.galleryAlbum.create({
        data: {
          year: album.year,
          title: album.title,
          sortOrder: index,
          photos: {
            create: album.photos.map((photo, photoIndex) => ({
              url: photo.src,
              alt: photo.alt,
              sortOrder: photoIndex,
            })),
          },
        },
      });
    }
  }

  if ((await prisma.videoItem.count()) === 0) {
    await prisma.videoItem.createMany({
      data: videos.map((video, index) => ({
        title: video.title,
        description: video.description,
        youtubeId: video.youtubeId,
        image: video.image,
        sortOrder: index,
        published: Boolean(video.youtubeId),
      })),
    });
  }

  if ((await prisma.pressItem.count()) === 0) {
    await prisma.pressItem.createMany({
      data: pressItems.map((item, index) => ({
        title: item.title,
        excerpt: item.text,
        href: item.href ?? null,
        sortOrder: index,
      })),
    });
  }

  await prisma.timelineEvent.deleteMany();
  await prisma.timelineEvent.createMany({
    data: timeline.map((item, index) => ({
      year: item.year,
      title: item.title,
      text: item.text,
      sortOrder: index,
    })),
  });
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@verdena.lt").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Verdena1991!";
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", name: "Administratorius" },
    create: {
      name: "Administratorius",
      email,
      passwordHash,
      role: "admin",
    },
  });

  // Demo narys (tik jei nustatytas MEMBER_EMAIL)
  const memberEmail = (process.env.MEMBER_EMAIL ?? "").toLowerCase();
  if (memberEmail) {
    const memberPassword = process.env.MEMBER_PASSWORD ?? "NarysVerdena!";
    await prisma.user.upsert({
      where: { email: memberEmail },
      update: { role: "narys", name: "Demo narys", playerName: "Demo narys" },
      create: {
        name: "Demo narys",
        email: memberEmail,
        passwordHash: await hash(memberPassword, 12),
        role: "narys",
        playerName: "Demo narys",
      },
    });
  }

  for (const item of news) {
    await prisma.newsPost.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        slug: item.slug,
        title: item.title,
        date: item.date,
        dateLabel: item.dateLabel,
        excerpt: item.excerpt,
        image: item.image,
        body: JSON.stringify(item.body),
        tag: item.tag,
        published: true,
        online: Boolean(item.online),
        relatedHref: item.relatedHref ?? null,
        relatedLabel: item.relatedLabel ?? null,
      },
    });
  }

  for (const item of tournaments) {
    await prisma.tournament.upsert({
      where: { slug: item.slug },
      update: serializeTournamentFields(item),
      create: serializeTournamentFields(item),
    });
  }

  const hegelmann = await prisma.tournament.findUnique({ where: { slug: "hegelmann-2026" } });
  if (hegelmann) {
    for (const draw of hegelmannDraws) {
      const row = await prisma.leagueDraw.upsert({
        where: {
          tournamentId_externalKey: { tournamentId: hegelmann.id, externalKey: draw.id },
        },
        update: {
          groupName: draw.group,
          title: draw.title,
          teams: JSON.stringify(draw.teams),
          points: JSON.stringify(draw.points),
          places: JSON.stringify(draw.places),
          scores: JSON.stringify(draw.scores),
        },
        create: {
          tournamentId: hegelmann.id,
          externalKey: draw.id,
          groupName: draw.group,
          title: draw.title,
          teams: JSON.stringify(draw.teams),
          points: JSON.stringify(draw.points),
          places: JSON.stringify(draw.places),
          scores: JSON.stringify(draw.scores),
        },
      });

      const brackets = hegelmannBrackets.filter((b) => b.drawId === draw.id);
      for (const bracket of brackets) {
        await prisma.knockoutBracket.upsert({
          where: { drawId_externalId: { drawId: row.id, externalId: bracket.id } },
          update: {
            title: bracket.title,
            league: bracket.league,
            groupName: bracket.group ?? "",
            payload: JSON.stringify(bracket),
          },
          create: {
            drawId: row.id,
            externalId: bracket.id,
            title: bracket.title,
            league: bracket.league,
            groupName: bracket.group ?? "",
            payload: JSON.stringify(bracket),
          },
        });
      }

      const matches = hegelmannMatches.filter((m) => m.drawId === draw.id);
      if (matches.length) {
        const existing = await prisma.match.count({ where: { drawId: row.id } });
        if (existing === 0) {
          await prisma.match.createMany({
            data: matches.map((m) => ({
              drawId: row.id,
              home: m.home,
              away: m.away,
              score: m.score ?? "",
              stage: m.stage ?? "",
              playedAt: m.date ?? null,
              status: "confirmed",
            })),
          });
        }
      }
    }
  }

  await seedContent();

  // Fill archived / non-Hegelmann league tables from JSON dumps
  const { spawnSync } = await import("node:child_process");
  const sync = spawnSync(process.execPath, ["scripts/sync-tournament-tables.mjs"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
  if (sync.status !== 0) {
    throw new Error("sync-tournament-tables failed");
  }

  console.log(`Admin: ${email}`);
  if (memberEmail) console.log(`Narys demo: ${memberEmail}`);
  console.log(`Naujienos: ${news.length}`);
  console.log(`Turnyrai: ${tournaments.length}`);
  console.log(`Klubo nariai: ${await prisma.clubMember.count()}`);
  console.log(`Reitingų lentelės: ${await prisma.rankingTable.count()}`);
  console.log(`Galerijos albumai: ${await prisma.galleryAlbum.count()}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
