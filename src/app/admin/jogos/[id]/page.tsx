import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MatchResultForm from "@/components/admin/MatchResultForm";
import BroadcastManager from "@/components/admin/BroadcastManager";
import LineupManager from "@/components/admin/LineupManager";
import { formatMatchDate } from "@/lib/utils";

export default async function AdminMatchPage({ params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      homeTeam: true,
      awayTeam: true,
      round: true,
      season: true,
      broadcasts: true,
      lineups: true,
    },
  });
  if (!match) return notFound();

  const [homeSquad, awaySquad] = await Promise.all([
    prisma.squadMembership.findMany({
      where: { teamId: match.homeTeamId, seasonId: match.seasonId },
      include: { player: true },
    }),
    prisma.squadMembership.findMany({
      where: { teamId: match.awayTeamId, seasonId: match.seasonId },
      include: { player: true },
    }),
  ]);

  const toOptions = (squad: typeof homeSquad) =>
    squad.map((s) => ({
      playerId: s.playerId,
      name: s.player.name,
      position: s.position,
      jerseyNumber: s.jerseyNumber,
    }));

  const toLineupEntries = (teamId: string) =>
    match.lineups
      .filter((l) => l.teamId === teamId)
      .map((l) => ({
        playerId: l.playerId,
        isStarter: l.isStarter,
        position: l.position,
        shirtNumber: l.shirtNumber,
      }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">
          {match.round.name} · {formatMatchDate(match.matchDateTime)}
        </span>
        <h1 className="font-display text-2xl text-sand">
          {match.homeTeam.name} x {match.awayTeam.name}
        </h1>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Placar e status</h2>
        <MatchResultForm
          matchId={match.id}
          initial={{ status: match.status, homeScore: match.homeScore, awayScore: match.awayScore }}
        />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Onde assistir</h2>
        <BroadcastManager matchId={match.id} initial={match.broadcasts} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Escalações</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <LineupManager
            matchId={match.id}
            teamId={match.homeTeamId}
            teamName={match.homeTeam.name}
            squad={toOptions(homeSquad)}
            currentLineup={toLineupEntries(match.homeTeamId)}
          />
          <LineupManager
            matchId={match.id}
            teamId={match.awayTeamId}
            teamName={match.awayTeam.name}
            squad={toOptions(awaySquad)}
            currentLineup={toLineupEntries(match.awayTeamId)}
          />
        </div>
      </section>
    </div>
  );
}
