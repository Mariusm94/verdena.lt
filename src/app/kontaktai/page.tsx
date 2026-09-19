import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import ContactView from "@/app/kontaktai/ContactView";
import { getClub } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/kontaktai");
}
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const club = await getClub();
  return <ContactView club={club} />;
}
