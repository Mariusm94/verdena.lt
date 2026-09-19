"use client";

import { useActionState } from "react";
import { createUserAction } from "./actions";

export default function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, null);

  return (
    <form action={action} className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm">
      <h2 className="font-display text-2xl">Sukurti vartotoją</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Vardas
          <input required name="name" className="rounded-xl border border-line bg-paper px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          El. paštas
          <input required type="email" name="email" className="rounded-xl border border-line bg-paper px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Slaptažodis
          <input
            required
            type="password"
            name="password"
            minLength={8}
            className="rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Rolė
          <select name="role" defaultValue="narys" className="rounded-xl border border-line bg-paper px-3 py-2">
            <option value="narys">narys</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Žaidėjo vardas (playerName)
          <input
            name="playerName"
            placeholder="Kaip mačų lentelėse"
            className="rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
      </div>
      {state?.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-court px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Kuriama…" : "Sukurti"}
      </button>
    </form>
  );
}
