"use client";

import Link from "next/link";
import { useActionState } from "react";
import PageHeader from "@/components/PageHeader";
import PasswordField from "@/components/PasswordField";
import { registerAction } from "@/app/auth-actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null | undefined, formData: FormData) => {
      return (await registerAction(formData)) ?? null;
    },
    null as { error?: string } | null,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Paskyra"
        title="Svetainės paskyra"
        text="Sukurkite paskyrą svetainėje. Klubo narystę valdyba tvirtina atskirai per „Tapti nariu“."
      />
      <section className="mx-auto max-w-xl px-4 py-16">
        <form action={action} className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Vardas ir pavardė
              <input required name="name" autoComplete="name" className="rounded-2xl border border-line px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              El. paštas
              <input required type="email" name="email" autoComplete="email" className="rounded-2xl border border-line px-4 py-3" />
            </label>
            <PasswordField
              name="password"
              label="Slaptažodis"
              autoComplete="new-password"
              minLength={8}
            />
            <PasswordField
              name="confirm"
              label="Pakartokite slaptažodį"
              autoComplete="new-password"
              minLength={8}
            />
            {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-court px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Kuriama…" : "Sukurti paskyrą"}
            </button>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Jau turite paskyrą?{" "}
            <Link href="/prisijungti" className="font-semibold text-court">
              Prisijungti
            </Link>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Narystės prašymas valdybai:{" "}
            <Link href="/naryste" className="font-semibold text-court">
              kaip tapti nariu
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
