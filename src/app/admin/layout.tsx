import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  let pendingCount = 0;
  try {
    pendingCount = await prisma.match.count({ where: { status: "pending" } });
  } catch {
    pendingCount = 0;
  }

  return (
    <div className="min-h-screen bg-paper pt-24">
      <AdminNav name={session.user?.name} pendingCount={pendingCount} />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">{children}</div>
    </div>
  );
}
