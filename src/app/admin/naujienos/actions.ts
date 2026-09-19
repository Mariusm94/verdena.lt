"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { bodyFromText, dateLabelFromIso, slugify } from "@/lib/newsStore";

function fieldsFrom(formData: FormData, published: boolean) {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim() || "Aktualijos";
  const body = JSON.stringify(bodyFromText(String(formData.get("body") ?? "")));
  const relatedHref = String(formData.get("relatedHref") ?? "").trim() || null;
  const relatedLabel = String(formData.get("relatedLabel") ?? "").trim() || null;

  return {
    title,
    slug: slugify(String(formData.get("currentSlug") ?? "") || title),
    date,
    dateLabel: dateLabelFromIso(date),
    excerpt,
    image: image || "/images/news/hegelmann-results.png",
    tag,
    body,
    relatedHref,
    relatedLabel,
    published,
    online: formData.get("online") === "on",
  };
}

export async function createNewsAction(formData: FormData) {
  await requireAdmin();
  const published = String(formData.get("intent")) === "publish";
  const data = fieldsFrom(formData, published);
  if (!data.title || !data.date || !data.excerpt) {
    return { error: "Užpildykite pavadinimą, datą ir trumpą aprašymą." };
  }

  const exists = await prisma.newsPost.findUnique({ where: { slug: data.slug } });
  if (exists) {
    data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
  }

  await prisma.newsPost.create({ data });
  revalidatePath("/");
  revalidatePath("/naujienos");
  revalidatePath(`/naujienos/${data.slug}`);
  redirect("/admin/naujienos");
}

export async function updateNewsAction(formData: FormData) {
  await requireAdmin();
  const currentSlug = String(formData.get("currentSlug") ?? "");
  const published = String(formData.get("intent")) === "publish";
  const data = fieldsFrom(formData, published);
  data.slug = currentSlug;
  if (!currentSlug || !data.title || !data.date || !data.excerpt) {
    return { error: "Užpildykite pavadinimą, datą ir trumpą aprašymą." };
  }

  await prisma.newsPost.update({
    where: { slug: currentSlug },
    data,
  });
  revalidatePath("/");
  revalidatePath("/naujienos");
  revalidatePath(`/naujienos/${currentSlug}`);
  redirect("/admin/naujienos");
}

export async function deleteNewsAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await prisma.newsPost.delete({ where: { slug } });
  revalidatePath("/");
  revalidatePath("/naujienos");
  revalidatePath(`/naujienos/${slug}`);
  redirect("/admin/naujienos");
}
