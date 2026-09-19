import type { Metadata } from "next";
import NewsForm from "@/app/admin/naujienos/NewsForm";

export const metadata: Metadata = { title: "Nauja naujiena" };

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">Nauja naujiena</h1>
      <NewsForm published={false} />
    </div>
  );
}
