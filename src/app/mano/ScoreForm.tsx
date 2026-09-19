"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitMatchScoreAction } from "./actions";

export default function ScoreForm({
  matchId,
  defaultScore,
  label,
}: {
  matchId: string;
  defaultScore: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(submitMatchScoreAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4">
      <input type="hidden" name="matchId" value={matchId} />
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
        <span className="font-medium">{label}</span>
        <input
          name="score"
          required
          defaultValue={defaultScore}
          placeholder="pvz. 6:4 6:3"
          className="rounded-xl border border-line bg-paper px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-court px-5 py-2.5 text-sm font-semibold text-white hover:bg-court-deep disabled:opacity-60"
      >
        {pending ? "Siunčiama…" : "Pateikti patvirtinimui"}
      </button>
      {state?.error ? <p className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state?.ok ? <p className="w-full text-sm text-court">Rezultatas pateiktas patvirtinimui.</p> : null}
    </form>
  );
}
