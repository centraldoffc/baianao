import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import { Division } from "@prisma/client";
import { divisionLabels } from "@/lib/utils";

const slugToDivision: Record<string, Division> = {
  "serie-a": Division.SERIE_A,
  "serie-b": Division.SERIE_B,
};

export const revalidate = 60;

export default async function CampeonatoPage({
  params,
}: {
  params: { divisao: string };
}) {
  const division = slugToDivision[params.divisao];
  if (!division) return notFound();

  const year = new Date().getFullYear();

  const season = await prisma.season.findFirst({
    where: { year, competition: { division } },
    include: {
      standings: {
        orderBy: { position: "asc" },
        include: {
          team: { select: { name: true, shortName: true, slug: true, logoUrl: true } },
        },
      },
      rounds: {
        orderBy: { number: "asc" },
        include: {
          matches: {
            include: {
              homeTeam: { select: { name: true, shortName: true, slug: true } },
              awayTeam: { select: { name: true, shortName: true, slug: true } },
              broadcasts: true,
              round: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">
          Campeonato Baiano {year}
        </span>
        <h1 className="font-display text-3xl text-sand md:text-4xl">
          {divisionLabels[division]}
        </h1>
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Classificação</h2>
        <StandingsTable rows={season?.standings ?? []} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-sand">Rodadas</h2>
        {!season || season.rounds.length === 0 ? (
          <p className="text-sm text-slate-light">
            O calendário de jogos ainda não foi cadastrado para esta temporada.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {season.rounds.map((round) => (
              <div key={round.id}>
                <h3 className="mb-3 text-sm uppercase tracking-wide text-slate-light">
                  {round.name}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {round.matches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                  {round.matches.length === 0 && (
                    <p className="text-sm text-slate-light">Sem jogos cadastrados.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
