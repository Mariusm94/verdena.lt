"use client";

import { useActionState, useState } from "react";
import {
  submitTournamentRegistrationAction,
  type RegistrationSubmitState,
} from "@/app/turnyrai/[slug]/registracija/actions";

const initial: RegistrationSubmitState = { ok: false, message: "" };

function Field({
  name,
  label,
  type = "text",
  required = true,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-white/90">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

export default function TournamentRegistrationForm({
  slug,
  title,
  intro,
  allowPartner,
}: {
  slug: string;
  title: string;
  intro: string;
  allowPartner: boolean;
}) {
  const [state, action, pending] = useActionState(submitTournamentRegistrationAction, initial);
  const [withPartner, setWithPartner] = useState(false);

  if (state.ok) {
    return (
      <div className="rounded-[1.5rem] border border-gold/40 bg-white/10 px-6 py-8">
        <p className="font-display text-2xl text-gold">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="tournamentSlug" value={slug} />
      <div>
        <h2 className="font-display text-3xl">{title}</h2>
        {intro ? <p className="mt-3 text-white/75">{intro}</p> : null}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold tracking-wide text-gold uppercase">Jūsų duomenys</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field name="firstName" label="Vardas" autoComplete="given-name" />
          <Field name="lastName" label="Pavardė" autoComplete="family-name" />
          <Field name="email" label="El. paštas" type="email" autoComplete="email" />
          <Field name="phone" label="Tel. nr." type="tel" autoComplete="tel" />
        </div>
      </div>

      {allowPartner ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-white">
            <input
              type="checkbox"
              name="withPartner"
              checked={withPartner}
              onChange={(event) => setWithPartner(event.target.checked)}
              className="h-4 w-4"
            />
            Pridėti partnerį
          </label>

          {withPartner ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field name="partnerFirstName" label="Partnerio vardas" />
              <Field name="partnerLastName" label="Partnerio pavardė" />
              <Field name="partnerEmail" label="Partnerio el. paštas" type="email" />
              <Field name="partnerPhone" label="Partnerio tel. nr." type="tel" />
            </div>
          ) : null}
        </div>
      ) : null}

      {state.message && !state.ok ? (
        <p className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold px-6 py-3 font-semibold text-court-deep disabled:opacity-60"
      >
        {pending ? "Siunčiama…" : "Registruotis"}
      </button>
    </form>
  );
}
