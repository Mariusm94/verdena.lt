"use client";

import Link from "next/link";
import { useActionState } from "react";
import PhotoPicker from "@/components/admin/PhotoPicker";
import { createTournamentAction, updateTournamentAction } from "@/app/admin/turnyrai/actions";

type TournamentFormValues = {
  slug?: string;
  title: string;
  season: string;
  status: string;
  format: string;
  sponsor?: string | null;
  description: string;
  rules: string[];
  schedule: string[];
  tablesNote?: string | null;
  coverImage?: string | null;
  published?: boolean;
  /** Papildomos nuorodos (ne auto #nuostatai / #lenteles / …), formatas label|href */
  extraLinks?: string[];
};

export default function TournamentForm({ item }: { item?: TournamentFormValues }) {
  const action = item?.slug ? updateTournamentAction : createTournamentAction;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => action(formData),
    null,
  );

  return (
    <form action={formAction} className="grid gap-5 rounded-[2rem] bg-white p-8 shadow-sm">
      {item?.slug ? <input type="hidden" name="slug" value={item.slug} /> : null}
      <p className="rounded-2xl bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">
        Užpildykite kaip skelbimą lentoje. Juodraštis lieka tik čia. Kai viskas gerai — skelbkite visiems.
      </p>
      <label className="grid gap-2 text-sm font-medium">
        Turnyro pavadinimas
        <input required name="title" defaultValue={item?.title} className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Sezonas
          <input required name="season" defaultValue={item?.season} placeholder="pvz. 2026 / 27" className="rounded-2xl border border-line px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Kas dabar vyksta
          <select name="status" defaultValue={item?.status ?? "registracija"} className="rounded-2xl border border-line px-4 py-3">
            <option value="registracija">Registracija atidaryta</option>
            <option value="vyksta">Vyksta</option>
            <option value="archyvas">Archyvas (jau pasibaigė)</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Kaip žaidžiama
        <input required name="format" defaultValue={item?.format} placeholder="pvz. Tęstinis dvejetų turnyras" className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Rėmėjas (jei yra)
        <input name="sponsor" defaultValue={item?.sponsor ?? ""} className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Trumpai apie turnyrą
        <textarea required name="description" rows={4} defaultValue={item?.description} className="rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Nuostatai
        <textarea
          name="rules"
          rows={5}
          defaultValue={item?.rules.join("\n")}
          placeholder="Kiekviena taisyklė — naujoje eilutėje."
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Tvarkaraštis
        <textarea
          name="schedule"
          rows={4}
          defaultValue={item?.schedule.join("\n")}
          placeholder="Kiekviena data ar pastaba — naujoje eilutėje."
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Ką parašyti prie lentelių
        <textarea
          name="tablesNote"
          rows={3}
          defaultValue={item?.tablesNote ?? ""}
          placeholder="Pvz. Lentelės pildomos prasidėjus mačams."
          className="rounded-2xl border border-line px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Papildomos nuorodos
        <textarea
          name="extraLinks"
          rows={3}
          defaultValue={item?.extraLinks?.join("\n") ?? ""}
          placeholder={"Kiekviena eilutė: Etiketė|/kelias-arba-url\npvz. Registracija Google|https://forms.gle/…"}
          className="rounded-2xl border border-line px-4 py-3"
        />
        <span className="font-normal text-ink-soft">
          Automatinės nuorodos (Nuostatai, Lentelės, Tvarkaraštis, Registracija) lieka. Čia — tik papildomos.
        </span>
      </label>
      <PhotoPicker name="coverImage" folder="turnyrai" value={item?.coverImage ?? undefined} />
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
          {pending ? "Saugoma…" : item?.published ? "Išsaugoti ir palikti viešą" : "Skelbti visiems"}
        </button>
        <Link href="/admin/turnyrai" className="rounded-full px-6 py-3 font-semibold text-ink-soft">
          Atšaukti
        </Link>
      </div>
    </form>
  );
}
