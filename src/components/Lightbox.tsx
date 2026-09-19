"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 p-4 md:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Uždaryti nuotrauką"
        className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"
        onClick={onClose}
      >
        Uždaryti
      </button>
      <div className="relative h-[80vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <Image src={src} alt={alt} fill className="object-contain" sizes="90vw" />
      </div>
    </div>,
    document.body,
  );
}
