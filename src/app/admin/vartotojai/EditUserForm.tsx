"use client";

import { useActionState } from "react";
import { updateUserAction } from "./actions";

type UserFields = {
  id: string;
  name: string;
  email: string;
  role: string;
  playerName: string | null;
};

export default function EditUserForm({ user }: { user: UserFields }) {
  const [state, action, pending] = useActionState(updateUserAction, null);

  return (
    <form action={action} className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={user.id} />
      <p className="text-sm text-ink-soft">El. paštas: {user.email}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Vardas
          <input
            required
            name="name"
            defaultValue={user.name}
            className="rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Rolė
          <select
            name="role"
            defaultValue={user.role === "admin" ? "admin" : "narys"}
            className="rounded-xl border border-line bg-paper px-3 py-2"
          >
            <option value="narys">narys</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Žaidėjo vardas (playerName)
          <input
            name="playerName"
            defaultValue={user.playerName ?? ""}
            placeholder="Kaip mačų lentelėse"
            className="rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Naujas slaptažodis (nebūtina)
          <input
            type="password"
            name="password"
            minLength={8}
            placeholder="Palikite tuščią, jei nekeičiate"
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
        {pending ? "Saugoma…" : "Išsaugoti"}
      </button>
    </form>
  );
}
