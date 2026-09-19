import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/prisijungti");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
