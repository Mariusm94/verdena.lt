import Image from "next/image";
import { sponsors } from "@/data/site";

export default function Sponsors({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "border-t border-line bg-paper py-10" : "border-t border-line bg-paper py-14"}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-center text-sm font-semibold tracking-[0.25em] text-court uppercase">
          Klubo rėmėjai
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sponsors.map((sponsor) => {
            const inner = (
              <Image
                src={sponsor.src}
                alt={sponsor.name}
                width={140}
                height={56}
                className="max-h-10 w-auto object-contain"
              />
            );
            return (
              <div
                key={sponsor.name}
                className="flex h-20 items-center justify-center rounded-2xl border border-line bg-white px-3 transition hover:border-court/40"
              >
                {sponsor.href ? (
                  <a
                    href={sponsor.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={sponsor.name}
                    className="flex h-full w-full items-center justify-center"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
