import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import { divisionLabels, transferLabels, formatCurrency } from "@/lib/utils";

export const revalidate = 30;

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      squadMemberships: {
        include: { team: true, season: { include: { competition: true } } },
        orderBy: { season: { year: "desc" } },
      },
      transfers: {
        include: { fromTeam: true, toTeam: true },
        orderBy: { transferDate: "desc" },
      },
    },
  });

  if (!player) return notFound();

  const currentTeam = player.squadMemberships[0];
  const age = player.birthDate
    ? Math.floor((Date.now() - new Date(player.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 rounded-ticket border border-ink-border bg-ink-light/40 p-6 md:flex-row md:items-center md:gap-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink font-display text-3xl text-slate-light">
          {player.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-3xl text-sand">{player.name}</h1>
          <p className="text-sm text-slate-light">
            {currentTeam ? (
              <Link href={`/times/${currentTeam.team.slug}`} className="text-turquoise hover:underline">
                {currentTeam.team.name}
              </Link>
            ) : (
              "Sem clube atual"
            )}
            {currentTeam ? ` · ${currentTeam.position}` : ""}
            {currentTeam?.jerseyNumber ? ` · #${currentTeam.jerseyNumber}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-light">
            {age != null && <Badge>{age} anos</Badge>}
            {player.nationality && <Badge>{player.nationality}</Badge>}
            {player.heightCm && <Badge>{player.heightCm} cm</Badge>}
            {player.preferredFoot && <Badge>Pé {player.preferredFoot.toLowerCase()}</Badge>}
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Histórico de clubes</h2>
        <div className="flex flex-col gap-2">
          {player.squadMemberships.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm"
            >
              <Link href={`/times/${m.team.slug}`} className="text-sand hover:text-turquoise">
                {m.team.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-light">
                <Badge>{m.position}</Badge>
                <Badge variant="turquoise">
                  {divisionLabels[m.season.competition.division]} · {m.season.year}
                </Badge>
              </div>
            </div>
          ))}
          {player.squadMemberships.length === 0 && (
            <p className="text-sm text-slate-light">Sem histórico cadastrado.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Transferências</h2>
        <div className="flex flex-col gap-2">
          {player.transfers.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm"
            >
              <span className="text-sand">
                {t.fromTeam ? t.fromTeam.name : "Sem clube"}{" "}
                <span className="text-slate-light">→</span> {t.toTeam ? t.toTeam.name : "Sem clube"}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="gold">{transferLabels[t.type]}</Badge>
                <span className="font-mono text-xs text-slate-light">
                  {formatCurrency(t.feeValue, t.feeCurrency ?? "BRL")}
                </span>
              </div>
            </div>
          ))}
          {player.transfers.length === 0 && (
            <p className="text-sm text-slate-light">Sem transferências registradas.</p>
          )}
        </div>
      </section>
    </div>
  );
}
