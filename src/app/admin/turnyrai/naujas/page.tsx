import type { Metadata } from "next";
import TournamentForm from "@/app/admin/turnyrai/TournamentForm";

export const metadata: Metadata = { title: "Naujas turnyras" };

export default function NewTournamentPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">Naujas turnyras</h1>
      <TournamentForm />
    </div>
  );
}
