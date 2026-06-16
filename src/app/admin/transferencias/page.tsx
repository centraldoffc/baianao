import { prisma } from "@/lib/prisma";
import TransferCreateForm from "@/components/admin/TransferCreateForm";
import { transferLabels, formatCurrency } from "@/lib/utils";

export default async function AdminTransfersPage() {
  const [transfers, teams] = await Promise.all([
    prisma.transfer.findMany({
      orderBy: { transferDate: "desc" },
      take: 50,
      include: { player: true, fromTeam: true, toTeam: true },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-sand">Transferências</h1>

      <div className="rounded-ticket border border-ink-border bg-ink-light/40 p-4">
        <p className="mb-3 text-sm text-slate-light">Registrar movimentação</p>
        <TransferCreateForm teams={teams} />
      </div>

      <div className="flex flex-col gap-2">
        {transfers.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm"
          >
            <span className="text-sand">
              {t.player.name}{" "}
              <span className="text-slate-light">
                {t.fromTeam ? `de ${t.fromTeam.name}` : "sem clube"} para{" "}
                {t.toTeam ? t.toTeam.name : "sem clube"}
              </span>
            </span>
            <span className="text-xs text-slate-light">
              {transferLabels[t.type]} · {formatCurrency(t.feeValue, t.feeCurrency ?? "BRL")}
            </span>
          </div>
        ))}
        {transfers.length === 0 && (
          <p className="text-sm text-slate-light">Nenhuma transferência registrada.</p>
        )}
      </div>
    </div>
  );
}
