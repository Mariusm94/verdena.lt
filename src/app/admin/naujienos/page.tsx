import type { Metadata } from "next";
import Link from "next/link";
import { deleteNewsAction } from "@/app/admin/naujienos/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Naujienos — valdymas" };

export default async function AdminNewsPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Naujienos</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Juodraštis matomas tik jums. Kai pasiruošite — spauskite „Skelbti visiems“.
          </p>
        </div>
        <Link href="/admin/naujienos/nauja" className="rounded-full bg-court px-5 py-3 font-semibold text-white">
          Rašyti naujieną
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-[1.75rem] bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-left">
          <thead className="bg-court-deep text-white">
            <tr>
              <th className="px-5 py-3 text-sm font-medium">Data</th>
              <th className="px-5 py-3 text-sm font-medium">Antraštė</th>
              <th className="px-5 py-3 text-sm font-medium">Ar mato žmonės?</th>
              <th className="px-5 py-3 text-sm font-medium" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-ink-soft">
                  Kol kas nėra naujienų. Parašykite pirmą.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-t border-line">
                  <td className="px-5 py-3 text-sm text-ink-soft">{post.date}</td>
                  <td className="px-5 py-3 font-medium">{post.title}</td>
                  <td className="px-5 py-3 text-sm">{post.published ? "Taip, vieša" : "Ne, juodraštis"}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      {post.published ? (
                        <Link href={`/naujienos/${post.slug}`} className="text-ink-soft">
                          Žiūrėti
                        </Link>
                      ) : null}
                      <Link href={`/admin/naujienos/${post.slug}`} className="text-court">
                        Taisyti
                      </Link>
                      <form action={deleteNewsAction}>
                        <input type="hidden" name="slug" value={post.slug} />
                        <button type="submit" className="text-red-700">
                          Trinti
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
