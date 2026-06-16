import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    take: 200,
    include: {
      squadMemberships: {
        orderBy: { season: { year: "desc" } },
        take: 1,
        include: { team: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-sand">Jogadores</h1>
      <p className="text-sm text-slate-light">
        Para adicionar um jogador, vá até a página do time em{" "}
        <Link href="/admin/times" className="text-turquoise hover:underline">
          Times
        </Link>{" "}
        e use o gerenciador de elenco.
      </p>

      <div className="flex flex-col gap-2">
        {players.map((p) => (
          <Link
            key={p.id}
            href={`/jogadores/${p.id}`}
            className="flex items-center justify-between rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm transition hover:border-coral/50"
          >
            <span className="text-sand">{p.name}</span>
            <span className="text-xs text-slate-light">
              {p.squadMemberships[0]?.team.name ?? "Sem clube"}
            </span>
          </Link>
        ))}
        {players.length === 0 && (
          <p className="text-sm text-slate-light">Nenhum jogador cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
