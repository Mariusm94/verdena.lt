"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import PageHeader from "@/components/PageHeader";
import PasswordField from "@/components/PasswordField";
import { loginAction } from "@/app/auth-actions";

export default function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null | undefined, formData: FormData) => {
      return (await loginAction(formData)) ?? null;
    },
    null as { error?: string } | null,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Paskyra"
        title="Prisijungti"
        text="Narių ir administratorių prisijungimas prie klubo svetainės."
      />
      <section className="mx-auto max-w-md px-4 py-16">
        <form action={action} className="rounded-[2rem] bg-white p-8 shadow-sm">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              El. paštas
              <input required type="email" name="email" autoComplete="email" className="rounded-2xl border border-line px-4 py-3" />
            </label>
            <PasswordField name="password" label="Slaptažodis" autoComplete="current-password" />
            {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-court px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Jungiamasi…" : "Prisijungti"}
            </button>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Neturite paskyros?{" "}
            <Link href="/registracija" className="font-semibold text-court">
              Sukurti paskyrą
            </Link>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Norite tapti klubo nariu?{" "}
            <Link href="/naryste" className="font-semibold text-court">
              Narystės prašymas
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
