import Image from "next/image";
import Link from "next/link";
import { nav } from "@/data/site";
import { getClub } from "@/lib/contentStore";

export default async function Footer() {
  const club = await getClub();
  const tagline =
    "tagline" in club && typeof club.tagline === "string" && club.tagline
      ? club.tagline
      : `Tenisas Šilutėje nuo ${club.founded} m.`;

  return (
    <footer className="bg-court-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-6">
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt={club.name}
              width={180}
              height={57}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">{tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">Navigacija</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/" className="hover:text-white">
                Pagrindinis
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/naryste" className="hover:text-white">
                Prisijungti
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">Kontaktai</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>{club.company}</li>
            {club.address ? <li>{club.address}</li> : null}
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
            {club.code ? <li>Įm. kodas {club.code}</li> : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/50 md:px-6">
        <p>
          © {new Date().getFullYear()} {club.name}
        </p>
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
