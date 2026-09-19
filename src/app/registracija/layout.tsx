import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/registracija");
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
