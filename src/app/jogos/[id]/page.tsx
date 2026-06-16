import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LineupField from "@/components/LineupField";
import Badge from "@/components/Badge";
import { formatMatchDate, statusLabels, broadcastLabels } from "@/lib/utils";

export const revalidate = 30;

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      homeTeam: true,
      awayTeam: true,
      stadium: true,
      round: true,
      season: { include: { competition: true } },
      broadcasts: true,
      lineups: { include: { player: true } },
    },
  });

  if (!match) return notFound();

  const hasScore = match.homeScore != null && match.awayScore != null;
  const homeLineup = match.lineups.filter((l) => l.teamId === match.homeTeamId);
  const awayLineup = match.lineups.filter((l) => l.teamId === match.awayTeamId);

  return (
    <div className="flex flex-col gap-10">
      {/* Cabeçalho do jogo */}
      <div className="ticket-card flex flex-col items-center gap-4 px-6 py-8 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">
          {match.season.competition.name} · {match.round.name}
        </span>

        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
          <TeamBlock name={match.homeTeam.name} align="right" />
          <div className="flex flex-col items-center">
            {hasScore ? (
              <span className="font-display text-5xl text-sand">
                {match.homeScore} <span className="text-slate-light">x</span> {match.awayScore}
              </span>
            ) : (
              <span className="font-display text-3xl text-slate-light">VS</span>
            )}
          </div>
          <TeamBlock name={match.awayTeam.name} align="left" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-light">
          <Badge variant={match.status === "EM_ANDAMENTO" ? "coral" : "neutral"}>
            {statusLabels[match.status]}
          </Badge>
          <span>{formatMatchDate(match.matchDateTime)}</span>
          {match.stadium && <span>· {match.stadium.name}</span>}
        </div>
      </div>

      {/* Onde assistir */}
      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Onde assistir</h2>
        {match.broadcasts.length === 0 ? (
          <p className="text-sm text-slate-light">
            Transmissão ainda não divulgada para esta partida.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {match.broadcasts.map((b) => (
              <Badge key={b.id} variant="turquoise">
                {b.channelName} · {broadcastLabels[b.type] ?? b.type}
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* Escalações */}
      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Escalações</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <LineupField teamName={match.homeTeam.name} players={homeLineup} />
          <LineupField teamName={match.awayTeam.name} players={awayLineup} />
        </div>
      </section>
    </div>
  );
}

function TeamBlock({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${
        align === "right" ? "md:items-end" : "md:items-start"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-light font-display text-sm text-slate-light">
        {name.slice(0, 3).toUpperCase()}
      </span>
      <span className="text-sm text-sand">{name}</span>
    </div>
  );
}
