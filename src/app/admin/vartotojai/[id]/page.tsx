import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import EditUserForm from "../EditUserForm";

export const metadata: Metadata = { title: "Redaguoti vartotoją" };

export default async function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, playerName: true },
  });
  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/vartotojai" className="text-sm font-semibold text-court">
        ← Visi vartotojai
      </Link>
      <h1 className="mt-4 font-display text-4xl">Redaguoti vartotoją</h1>
      <EditUserForm user={user} />
    </div>
  );
}
