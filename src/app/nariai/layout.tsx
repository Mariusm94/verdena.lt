import type { Metadata } from "next";

export const metadata: Metadata = { title: "Klubo nariai" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
