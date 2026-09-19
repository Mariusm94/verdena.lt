/**
 * Sync static gallery / videos / missing news into Prisma DB.
 * Replaces gallery albums and video items so public pages show expanded content.
 */
import { PrismaClient } from "@prisma/client";
import { galleryAlbums, videos } from "../src/data/gallery";
import { news } from "../src/data/news";

const prisma = new PrismaClient();

async function syncGallery() {
  await prisma.galleryPhoto.deleteMany();
  await prisma.galleryAlbum.deleteMany();
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
  console.log(`Gallery: ${galleryAlbums.length} albums, ${galleryAlbums.reduce((n, a) => n + a.photos.length, 0)} photos`);
}

async function syncVideos() {
  await prisma.videoItem.deleteMany();
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
  console.log(`Videos: ${videos.length}`);
}

async function syncNews() {
  let upserted = 0;
  for (const item of news) {
    await prisma.newsPost.upsert({
      where: { slug: item.slug },
      update: {
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
    upserted += 1;
  }
  console.log(`News upserted: ${upserted}`);
}

async function main() {
  await syncGallery();
  await syncVideos();
  await syncNews();
  const members = await prisma.clubMember.count();
  console.log(`ClubMember remains: ${members}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
