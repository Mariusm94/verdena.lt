import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsForm from "@/app/admin/naujienos/NewsForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.newsPost.findUnique({ where: { slug } });
  return { title: post ? `Redaguoti · ${post.title}` : "Naujiena" };
}

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.newsPost.findUnique({ where: { slug } });
  if (!post) notFound();

  let body: string[] = [];
  try {
    const parsed = JSON.parse(post.body);
    body = Array.isArray(parsed) ? parsed.map(String) : [post.body];
  } catch {
    body = [post.body];
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">Redaguoti įrašą</h1>
      <NewsForm
        published={post.published}
        item={{
          slug: post.slug,
          title: post.title,
          date: post.date,
          dateLabel: post.dateLabel,
          excerpt: post.excerpt,
          image: post.image,
          body,
          tag: post.tag,
          online: post.online,
          relatedHref: post.relatedHref ?? undefined,
          relatedLabel: post.relatedLabel ?? undefined,
        }}
      />
    </div>
  );
}
