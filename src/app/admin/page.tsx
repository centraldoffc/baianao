import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [teams, players, matches, pendingRequests] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.match.count(),
    prisma.collaboratorRequest.count({ where: { status: "PENDING" } }),
  ]);

  const cards = [
    { label: "Times cadastrados", value: teams, href: "/admin/times" },
    { label: "Jogadores cadastrados", value: players, href: "/admin/jogadores" },
    { label: "Jogos cadastrados", value: matches, href: "/admin/jogos" },
    { label: "Solicitações pendentes", value: pendingRequests, href: "/admin/colaboradores" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-sand">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-ticket border border-ink-border bg-ink-light/40 p-4 transition hover:border-coral/50"
          >
            <p className="font-display text-3xl text-sand">{c.value}</p>
            <p className="text-xs text-slate-light">{c.label}</p>
          </Link>
        ))}
      </div>

      {pendingRequests > 0 && (
        <div className="rounded-ticket border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
          Você tem {pendingRequests} solicitação(ões) de colaborador esperando análise.{" "}
          <Link href="/admin/colaboradores" className="underline">
            Revisar agora
          </Link>
        </div>
      )}
    </div>
  );
}
