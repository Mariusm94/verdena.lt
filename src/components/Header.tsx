"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccountLinks from "@/components/AccountLinks";
import { nav } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const loggedIn = Boolean(session?.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const next: Record<string, boolean> = {};
    for (const item of nav) {
      if (!item.children?.length) continue;
      const childActive = item.children.some(
        (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
      );
      const parentActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (childActive || parentActive) next[item.href] = true;
    }
    setExpanded(next);
  }, [open, pathname]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previous || "";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const targets = [document.querySelector("main"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );

    for (const el of targets) {
      if (open) {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    }

    return () => {
      for (const el of targets) {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const solid = scrolled || open || pathname !== "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all ${
        solid ? "bg-court-deep/95 shadow-lg shadow-black/20 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="Verdėnos teniso klubas Šilutė"
        >
          <Image
            src="/images/logo.png"
            alt="TK Verdena Šilutė"
            width={200}
            height={63}
            className="h-10 w-auto shrink-0 object-contain sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Pagrindinė navigacija">
          {nav.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-white/10 text-gold"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
              {item.children ? (
                <div className="absolute left-0 top-full z-10 hidden pt-2 group-hover:block group-focus-within:block">
                  <div className="min-w-52 rounded-2xl border border-white/10 bg-court-deep p-2 shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AccountLinks />
          {!loggedIn ? (
            <Link
              href="/naryste"
              className="inline-flex rounded-full bg-gold px-2.5 py-1.5 text-xs font-semibold text-court-deep hover:bg-gold-deep sm:px-4 sm:py-2 sm:text-sm"
            >
              Tapti nariu
            </Link>
          ) : null}
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-white transition sm:h-11 sm:w-11 lg:hidden ${
              open
                ? "border-gold bg-gold/20 text-gold"
                : "border-white/30 bg-white/10 hover:border-gold/60 hover:bg-gold/10"
            }`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path stroke="currentColor" strokeWidth="2.2" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path stroke="currentColor" strokeWidth="2.2" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-court-deep px-4 py-5 lg:hidden"
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">Meniu</p>
          <div className="grid gap-1 pb-4">
            {nav.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isOpen = Boolean(expanded[item.href]);
              const panelId = `mobile-sub-${item.href.replace(/\W+/g, "-")}`;

              return (
                <div key={item.href}>
                  <div className="flex items-stretch gap-1">
                    <Link
                      href={item.href}
                      className={`min-w-0 flex-1 rounded-xl px-3 py-3 text-base font-medium ${
                        isActive(item.href) ? "bg-white/10 text-gold" : "text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {hasChildren ? (
                      <button
                        type="button"
                        className={`inline-flex w-11 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 ${
                          isOpen ? "bg-white/10 text-gold" : ""
                        }`}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-label={isOpen ? `Suskleisti: ${item.label}` : `Išskleisti: ${item.label}`}
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [item.href]: !prev[item.href] }))
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                        >
                          <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  {hasChildren && isOpen ? (
                    <div id={panelId} className="mb-2 ml-2 grid border-l border-white/15 pl-2">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white ${
                            isActive(child.href) ? "bg-white/10 text-gold" : "text-white/70"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="grid gap-2 border-t border-white/10 pt-4">
            <AccountLinks mobile />
            {!loggedIn ? (
              <Link
                href="/naryste"
                className="rounded-full bg-gold px-4 py-3 text-center text-base font-semibold text-court-deep"
              >
                Tapti nariu
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
