import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">Clubes</span>
        <h1 className="font-display text-3xl text-sand md:text-4xl">Times do Baianão</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/times/${team.slug}`}
            className="flex flex-col items-center gap-3 rounded-ticket border border-ink-border bg-ink-light/40 p-5 text-center transition hover:border-coral/50 hover:bg-ink-light"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink font-display text-lg text-slate-light">
              {team.shortName.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-sand">{team.name}</span>
            <span className="text-xs text-slate-light">{team.city}</span>
          </Link>
        ))}
        {teams.length === 0 && (
          <p className="col-span-full text-sm text-slate-light">
            Nenhum time cadastrado ainda. Acesse o painel admin para adicionar.
          </p>
        )}
      </div>
    </div>
  );
}
