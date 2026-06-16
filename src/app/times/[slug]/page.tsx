import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CollaboratorRequestButton from "@/components/CollaboratorRequestButton";
import MatchCard from "@/components/MatchCard";
import Badge from "@/components/Badge";
import { divisionLabels, transferLabels, formatCurrency } from "@/lib/utils";

export const revalidate = 30;

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: { stadium: true },
  });

  if (!team) return notFound();

  const latestSquadEntry = await prisma.squadMembership.findFirst({
    where: { teamId: team.id },
    orderBy: { season: { year: "desc" } },
    include: { season: { include: { competition: true } } },
  });

  const [squad, matches, transfers] = await Promise.all([
    latestSquadEntry
      ? prisma.squadMembership.findMany({
          where: { teamId: team.id, seasonId: latestSquadEntry.seasonId },
          include: { player: true },
          orderBy: [{ position: "asc" }, { jerseyNumber: "asc" }],
        })
      : Promise.resolve([]),
    prisma.match.findMany({
      where: { OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }] },
      orderBy: { matchDateTime: "desc" },
      take: 6,
      include: {
        homeTeam: { select: { name: true, shortName: true, slug: true } },
        awayTeam: { select: { name: true, shortName: true, slug: true } },
        round: true,
        broadcasts: true,
      },
    }),
    prisma.transfer.findMany({
      where: { OR: [{ fromTeamId: team.id }, { toTeamId: team.id }] },
      orderBy: { transferDate: "desc" },
      take: 6,
      include: { player: true, fromTeam: true, toTeam: true },
    }),
  ]);

  const positionGroups = groupSquadByPosition(squad);

  return (
    <div className="flex flex-col gap-10">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 rounded-ticket border border-ink-border bg-ink-light/40 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink font-display text-2xl text-slate-light">
            {team.shortName.slice(0, 3).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-3xl text-sand">{team.name}</h1>
            <p className="text-sm text-slate-light">
              {team.city}
              {team.stadium ? ` · ${team.stadium.name}` : ""}
              {team.foundedYear ? ` · Fundado em ${team.foundedYear}` : ""}
            </p>
            {latestSquadEntry && (
              <Badge variant="turquoise" className="mt-2">
                {divisionLabels[latestSquadEntry.season.competition.division]} ·{" "}
                {latestSquadEntry.season.year}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {team.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-slate-light">{team.description}</p>
      )}

      {/* Elenco */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl text-sand">Elenco</h2>
          <CollaboratorRequestButton teamSlug={team.slug} />
        </div>

        {squad.length === 0 ? (
          <p className="text-sm text-slate-light">
            Elenco ainda não cadastrado. Que tal ajudar como colaborador?
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {positionGroups.map(([position, players]) => (
              <div key={position}>
                <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-light">
                  {position}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {players.map((m) => (
                    <Link
                      key={m.id}
                      href={`/jogadores/${m.player.id}`}
                      className="flex items-center gap-3 rounded-lg border border-ink-border bg-ink-light/40 p-3 transition hover:border-coral/50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-mono text-sm text-gold">
                        {m.jerseyNumber ?? "-"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-sand">{m.player.name}</p>
                        {m.status !== "ATIVO" && (
                          <p className="text-xs text-coral">{statusLabel(m.status)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Jogos recentes */}
      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Jogos recentes e próximos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
          {matches.length === 0 && (
            <p className="text-sm text-slate-light">Nenhum jogo cadastrado.</p>
          )}
        </div>
      </section>

      {/* Transferências */}
      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Movimentações recentes</h2>
        <div className="flex flex-col gap-2">
          {transfers.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm"
            >
              <span className="text-sand">
                <Link href={`/jogadores/${t.player.id}`} className="hover:text-turquoise">
                  {t.player.name}
                </Link>{" "}
                <span className="text-slate-light">
                  {t.fromTeam ? `de ${t.fromTeam.name}` : "sem clube"} para{" "}
                  {t.toTeam ? t.toTeam.name : "sem clube"}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="gold">{transferLabels[t.type]}</Badge>
                <span className="font-mono text-xs text-slate-light">
                  {formatCurrency(t.feeValue, t.feeCurrency ?? "BRL")}
                </span>
              </div>
            </div>
          ))}
          {transfers.length === 0 && (
            <p className="text-sm text-slate-light">Nenhuma movimentação registrada.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function groupSquadByPosition<T extends { position: string }>(squad: T[]) {
  const order = ["Goleiro", "Zagueiro", "Lateral", "Meio-campo", "Atacante"];
  const groups = new Map<string, T[]>();
  for (const m of squad) {
    if (!groups.has(m.position)) groups.set(m.position, []);
    groups.get(m.position)!.push(m);
  }
  return [...groups.entries()].sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    LESIONADO: "Lesionado",
    SUSPENSO: "Suspenso",
    EMPRESTADO: "Emprestado",
  };
  return map[status] ?? status;
}
