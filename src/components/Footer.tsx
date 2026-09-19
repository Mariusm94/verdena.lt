import Image from "next/image";
import Link from "next/link";
import { nav } from "@/data/site";
import { getClub } from "@/lib/contentStore";

export default async function Footer() {
  const club = await getClub();

  return (
    <footer className="bg-court-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt={club.name}
              width={180}
              height={57}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
            {club.name} — turnyrai, narystė ir bendruomenė Šilutėje.
          </p>
          {club.facebook ? (
            <a
              href={club.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${club.name} Facebook`}
              className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-gold hover:bg-white/10 hover:text-gold"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M14 8.5h2.5V5.2c-.4-.1-1.7-.2-3.1-.2-3.1 0-5.2 1.9-5.2 5.3V13H5.5v3.7H8.2V23h3.7v-6.3H14.7l.5-3.7h-3.3V10.7c0-1.1.3-1.8 1.8-1.8Z" />
              </svg>
            </a>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">Navigacija</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">Klubas</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/naryste" className="hover:text-white">
                Tapti nariu
              </Link>
            </li>
            <li>
              <Link href="/parama" className="hover:text-white">
                Parama 2%
              </Link>
            </li>
            <li>
              <Link href="/istorija" className="hover:text-white">
                Istorija
              </Link>
            </li>
            <li>
              <Link href="/registracija" className="hover:text-white">
                Svetainės paskyra
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">Kontaktai</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>{club.company}</li>
            <li>{club.address}</li>
            <li>
              <a href={`mailto:${club.email}`} className="hover:text-white">
                {club.email}
              </a>
            </li>
            {club.phone ? (
              <li>
                <a href={`tel:${club.phone.replace(/\s+/g, "")}`} className="hover:text-white">
                  {club.phone}
                </a>
              </li>
            ) : null}
            <li>Įm. kodas {club.code}</li>
            <li>
              {club.iban}
              <br />
              {club.bank}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/50 md:px-6">
        <p>© {new Date().getFullYear()} {club.name}. Visos teisės saugomos.</p>
        <p className="mt-2">
          Svetainę sukūrė{" "}
          <a
            href="https://mmwebs.lt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 underline-offset-2 hover:text-gold hover:underline"
          >
            mmwebs.lt
          </a>
        </p>
      </div>
    </footer>
  );
}
