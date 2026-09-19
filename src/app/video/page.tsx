import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { listVideos } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/video");
}
export const dynamic = "force-dynamic";

export default async function VideoPage() {
  const videos = (await listVideos(true)).filter((item) => item.youtubeId);

  if (!videos.length) {
    return (
      <div>
        <PageHeader
          eyebrow="Video"
          title="Video galerija"
          text="Viešų video įrašų šiuo metu nėra. Turnyrų akimirkas rasite nuotraukų galerijoje."
        />
        <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
          <div className="rounded-[2rem] border border-line bg-white p-8 md:p-12">
            <h2 className="font-display text-3xl">Įrašų dar nėra</h2>
            <p className="mt-4 leading-7 text-ink-soft">
              Klubas video archyvą pildo. Čia neįdėjome tuščio grotuvo — kai atsiras viešų įrašų, jie bus šiame
              puslapyje.
            </p>
            <Link href="/galerija" className="mt-8 inline-flex rounded-full bg-court px-5 py-3 font-semibold text-white">
              Nuotraukų galerija
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Video"
        title="Video galerija"
        text="Turnyrų akimirkos, apdovanojimai ir klubo gyvenimas aikštelėje."
      />
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-16 md:px-6">
        {videos.map((video) => (
          <article key={video.id ?? video.youtubeId} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="aspect-video bg-ink">
              <iframe
                title={video.title}
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6 md:p-8">
              <h2 className="font-display text-3xl">{video.title}</h2>
              {video.description ? <p className="mt-3 leading-7 text-ink-soft">{video.description}</p> : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
