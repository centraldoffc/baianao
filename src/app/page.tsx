import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import { Division } from "@prisma/client";

export const revalidate = 60;

async function getHomeData() {
  const year = new Date().getFullYear();

  const [seasonA, seasonB, nextMatches] = await Promise.all([
    prisma.season.findFirst({
      where: { year, competition: { division: Division.SERIE_A } },
      include: {
        standings: {
          orderBy: { position: "asc" },
          take: 6,
          include: { team: { select: { name: true, shortName: true, slug: true, logoUrl: true } } },
        },
      },
    }),
    prisma.season.findFirst({
      where: { year, competition: { division: Division.SERIE_B } },
      include: {
        standings: {
          orderBy: { position: "asc" },
          take: 6,
          include: { team: { select: { name: true, shortName: true, slug: true, logoUrl: true } } },
        },
      },
    }),
    prisma.match.findMany({
      where: { status: "AGENDADO" },
      orderBy: { matchDateTime: "asc" },
      take: 4,
      include: {
        homeTeam: { select: { name: true, shortName: true, slug: true } },
        awayTeam: { select: { name: true, shortName: true, slug: true } },
        round: true,
        broadcasts: true,
      },
    }),
  ]);

  return { seasonA, seasonB, nextMatches };
}

export default async function HomePage() {
  const { seasonA, seasonB, nextMatches } = await getHomeData();

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="grid gap-6 rounded-ticket border border-ink-border bg-gradient-to-br from-ink-light to-ink p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.3em] text-turquoise">
            Campeonato Baiano {new Date().getFullYear()}
          </span>
          <h1 className="font-display text-4xl leading-tight text-sand md:text-6xl">
            Tudo sobre o
            <br />
            <span className="text-coral">Baianão</span> num só lugar.
          </h1>
          <p className="max-w-md text-sm text-slate-light md:text-base">
            Tabela atualizada, escalações, elenco completo dos times, onde
            assistir cada jogo e o mercado de transferências da Série A e B.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/campeonato/serie-a"
              className="rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-coral-dark"
            >
              Ver tabela da Série A
            </Link>
            <Link
              href="/times"
              className="rounded-full border border-ink-border px-5 py-2.5 text-sm text-sand transition hover:border-turquoise hover:text-turquoise"
            >
              Explorar times
            </Link>
          </div>
        </div>

        {/* Próximo jogo em destaque */}
        <div className="flex flex-col justify-center gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-light">
            Próximo jogo
          </span>
          {nextMatches[0] ? (
            <MatchCard match={nextMatches[0]} />
          ) : (
            <div className="ticket-card px-5 py-8 text-center text-sm text-slate-light">
              Nenhum jogo agendado por enquanto.
            </div>
          )}
        </div>
      </section>

      {/* Tabelas */}
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-sand">Série A</h2>
            <Link href="/campeonato/serie-a" className="text-sm text-turquoise hover:underline">
              Ver tabela completa
            </Link>
          </div>
          <StandingsTable rows={seasonA?.standings ?? []} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-sand">Série B</h2>
            <Link href="/campeonato/serie-b" className="text-sm text-turquoise hover:underline">
              Ver tabela completa
            </Link>
          </div>
          <StandingsTable rows={seasonB?.standings ?? []} />
        </div>
      </section>

      {/* Próximos jogos */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-sand">Próximos jogos</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nextMatches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
          {nextMatches.length === 0 && (
            <p className="text-sm text-slate-light">Nenhum jogo agendado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
