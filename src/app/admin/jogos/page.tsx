import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MatchCreateForm from "@/components/admin/MatchCreateForm";
import { formatMatchDate, statusLabels, divisionLabels } from "@/lib/utils";

export default async function AdminMatchesPage() {
  const [matches, teams, seasons] = await Promise.all([
    prisma.match.findMany({
      orderBy: { matchDateTime: "desc" },
      take: 50,
      include: {
        homeTeam: true,
        awayTeam: true,
        round: true,
        season: { include: { competition: true } },
      },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.season.findMany({
      include: { competition: true, rounds: { orderBy: { number: "asc" } } },
      orderBy: { year: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-sand">Jogos</h1>

      <div className="rounded-ticket border border-ink-border bg-ink-light/40 p-4">
        <p className="mb-3 text-sm text-slate-light">Adicionar novo jogo</p>
        <MatchCreateForm
          teams={teams}
          seasons={seasons.map((s) => ({
            id: s.id,
            label: `${divisionLabels[s.competition.division]} ${s.year}`,
            rounds: s.rounds,
          }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/admin/jogos/${m.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm transition hover:border-coral/50"
          >
            <span className="text-sand">
              {m.homeTeam.name} x {m.awayTeam.name}
            </span>
            <span className="text-xs text-slate-light">
              {m.round.name} · {formatMatchDate(m.matchDateTime)} · {statusLabels[m.status]}
            </span>
          </Link>
        ))}
        {matches.length === 0 && <p className="text-sm text-slate-light">Nenhum jogo cadastrado.</p>}
      </div>
    </div>
  );
}
