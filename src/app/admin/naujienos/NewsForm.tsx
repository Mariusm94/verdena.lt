"use client";

import Link from "next/link";
import { useActionState } from "react";
import PhotoPicker from "@/components/admin/PhotoPicker";
import { createNewsAction, updateNewsAction } from "@/app/admin/naujienos/actions";
import type { NewsItem } from "@/data/news";

export default function NewsForm({
  item,
  published = false,
}: {
  item?: NewsItem;
  published?: boolean;
}) {
  const action = item ? updateNewsAction : createNewsAction;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => action(formData),
    null,
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="grid gap-5 rounded-[2rem] bg-white p-8 shadow-sm">
      {item ? <input type="hidden" name="currentSlug" value={item.slug} /> : null}
      <p className="rounded-2xl bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">
        Parašykite tekstą ir įkelkite nuotrauką. <strong>Juodraštis</strong> matomas tik čia.{" "}
        <strong>Skelbti visiems</strong> — tada straipsnis atsiras Aktualijose.
      </p>
      <label className="grid gap-2 text-sm font-medium">
        Antraštė
        <input required name="title" defaultValue={item?.title} className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Data
          <input required type="date" name="date" defaultValue={item?.date ?? today} className="rounded-2xl border border-line px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Rubrika
          <input name="tag" defaultValue={item?.tag ?? "Aktualijos"} className="rounded-2xl border border-line px-4 py-3" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Trumpai (1–2 sakiniai sąrašui)
        <textarea required name="excerpt" rows={3} defaultValue={item?.excerpt} className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <PhotoPicker name="image" folder="naujienos" value={item?.image} />
      <label className="grid gap-2 text-sm font-medium">
        Visas tekstas
        <textarea
          required
          name="body"
          rows={10}
          defaultValue={item?.body.join("\n\n")}
          placeholder="Kiekviena pastraipa — nuo naujos eilutės, palikus tuščią eilutę."
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Nuoroda į turnyrą (nebūtina)
        <input
          name="relatedHref"
          defaultValue={item?.relatedHref}
          placeholder="pvz. /turnyrai/hegelmann-2026"
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Nuorodos užrašas (nebūtina)
        <input name="relatedLabel" defaultValue={item?.relatedLabel} className="rounded-2xl border border-line px-4 py-3" />
      </label>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="rounded-full border border-line px-6 py-3 font-semibold disabled:opacity-60"
        >
          {pending ? "Saugoma…" : "Išsaugoti juodraštį"}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="rounded-full bg-court px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saugoma…" : published ? "Išsaugoti ir palikti viešą" : "Skelbti visiems"}
        </button>
        <Link href="/admin/naujienos" className="rounded-full px-6 py-3 font-semibold text-ink-soft">
          Atšaukti
        </Link>
      </div>
    </form>
  );
}
