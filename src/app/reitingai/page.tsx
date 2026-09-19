import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import RankingsView from "@/app/reitingai/RankingsView";
import { listRankingTables } from "@/lib/contentStore";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/reitingai");
}
export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const tables = await listRankingTables();
  return <RankingsView tables={tables} />;
}
