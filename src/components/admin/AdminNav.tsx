"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: { label?: string; items: { href: string; label: string; badgeKey?: "pending" }[] }[] = [
  {
    items: [{ href: "/admin", label: "Pradžia" }],
  },
  {
    label: "Turnyrai",
    items: [
      { href: "/admin/turnyrai", label: "Turnyrai" },
      { href: "/admin/rezultatai", label: "Rezultatai", badgeKey: "pending" },
    ],
  },
  {
    label: "Turinys",
    items: [
      { href: "/admin/naujienos", label: "Naujienos" },
      { href: "/admin/nuotraukos", label: "Nuotraukos" },
      { href: "/admin/galerija", label: "Galerija" },
      { href: "/admin/video", label: "Video" },
      { href: "/admin/spauda", label: "Spauda" },
      { href: "/admin/istorija", label: "Istorija" },
    ],
  },
  {
    label: "Klubas",
    items: [
      { href: "/admin/klubo-nariai", label: "Nariai" },
      { href: "/admin/reitingai", label: "Reitingai" },
      { href: "/admin/nustatymai", label: "Nustatymai" },
      { href: "/admin/vartotojai", label: "Vartotojai" },
    ],
  },
];

export default function AdminNav({
  name,
  pendingCount = 0,
}: {
  name?: string | null;
  pendingCount?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-widest text-gold-deep uppercase">Svetainės valdymas</p>
            <p className="font-semibold">{name ?? "Administratorius"}</p>
          </div>
          <Link href="/" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Į svetainę
          </Link>
        </div>
        <nav className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.label ?? "home"} className="flex flex-wrap items-center gap-2">
              {group.label ? (
                <span className="mr-1 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                  {group.label}
                </span>
              ) : null}
              {group.items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const showBadge = item.badgeKey === "pending" && pendingCount > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      active ? "bg-court text-white" : "border border-line"
                    }`}
                  >
                    {item.label}
                    {showBadge ? (
                      <span
                        className={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs ${
                          active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {pendingCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
