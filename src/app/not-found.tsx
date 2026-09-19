import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Puslapis nerastas" };

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-28 text-center">
      <p className="text-sm tracking-[0.3em] text-gold-deep uppercase">404</p>
      <h1 className="mt-3 font-display text-5xl">Puslapis nerastas</h1>
      <p className="mt-4 max-w-md text-ink-soft">Šis maršrutas dar neegzistuoja. Grįžkite į pradžią arba atidarykite turnyrus.</p>
      <Link href="/" className="mt-8 rounded-full bg-court px-6 py-3 font-semibold text-white">
        Į pradžią
      </Link>
    </section>
  );
}
