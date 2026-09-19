"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/app/auth-actions";

export default function AccountLinks({ mobile = false }: { mobile?: boolean }) {
  const { data, status } = useSession();

  if (status === "loading") {
    return mobile ? null : <span className="inline-block h-8 w-20 sm:h-10 sm:w-28" aria-hidden />;
  }

  if (!data?.user) {
    if (mobile) {
      return (
        <Link
          href="/prisijungti"
          className="mt-2 rounded-full border-2 border-gold bg-gold/15 px-4 py-3 text-center text-base font-semibold text-gold"
        >
          Prisijungti
        </Link>
      );
    }
    return (
      <Link
        href="/prisijungti"
        className="inline-flex items-center rounded-full border border-gold/70 px-2.5 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/15 sm:px-4 sm:py-2 sm:text-sm"
      >
        Prisijungti
      </Link>
    );
  }

  const admin = data.user.role === "admin";

  if (mobile) {
    return (
      <div className="mt-2 grid gap-2 border-t border-white/10 pt-4">
        <Link
          href="/mano"
          className="rounded-full border-2 border-gold bg-gold/15 px-4 py-3 text-center text-base font-semibold text-gold"
        >
          Mano mačai
        </Link>
        {admin ? (
          <Link
            href="/admin"
            className="rounded-full border border-gold/50 px-4 py-3 text-center font-semibold text-gold"
          >
            Administravimas
          </Link>
        ) : null}
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-full px-4 py-3 text-center font-medium text-white/75 hover:bg-white/10"
          >
            Atsijungti
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href="/mano"
        className="inline-flex items-center rounded-full border border-gold/70 px-2.5 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/15 sm:px-4 sm:py-2 sm:text-sm"
      >
        Mano mačai
      </Link>
      {admin ? (
        <Link
          href="/admin"
          className="hidden rounded-full border border-gold/50 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/15 sm:inline-flex"
        >
          Admin
        </Link>
      ) : null}
      <form action={logoutAction} className="hidden sm:block">
        <button
          type="submit"
          className="rounded-full px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
        >
          Atsijungti
        </button>
      </form>
    </div>
  );
}
