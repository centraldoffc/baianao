import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamCreateForm from "@/components/admin/TeamCreateForm";

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-sand">Times</h1>

      <div className="rounded-ticket border border-ink-border bg-ink-light/40 p-4">
        <p className="mb-3 text-sm text-slate-light">Adicionar novo time</p>
        <TeamCreateForm />
      </div>

      <div className="flex flex-col gap-2">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/admin/times/${team.slug}`}
            className="flex items-center justify-between rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm transition hover:border-coral/50"
          >
            <span className="text-sand">{team.name}</span>
            <span className="text-xs text-slate-light">{team.city} · /{team.slug}</span>
          </Link>
        ))}
        {teams.length === 0 && (
          <p className="text-sm text-slate-light">Nenhum time cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
