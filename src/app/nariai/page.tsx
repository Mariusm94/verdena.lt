import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import MembersView from "@/app/nariai/MembersView";
import { listMembers } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/nariai");
}
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await listMembers();
  return <MembersView members={members} />;
}
