import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import { transferLabels, formatCurrency } from "@/lib/utils";

export const revalidate = 30;

export default async function TransfersPage() {
  const transfers = await prisma.transfer.findMany({
    orderBy: { transferDate: "desc" },
    take: 50,
    include: { player: true, fromTeam: true, toTeam: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">Mercado</span>
        <h1 className="font-display text-3xl text-sand md:text-4xl">Transferências</h1>
      </div>

      <div className="overflow-x-auto rounded-ticket border border-ink-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-border bg-ink-light text-left text-xs uppercase tracking-wide text-slate-light">
              <th className="px-3 py-3 font-medium">Jogador</th>
              <th className="px-3 py-3 font-medium">De</th>
              <th className="px-3 py-3 font-medium">Para</th>
              <th className="px-3 py-3 font-medium">Tipo</th>
              <th className="px-3 py-3 font-medium">Valor</th>
              <th className="px-3 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id} className="border-b border-ink-border/60 last:border-0">
                <td className="px-3 py-2.5">
                  <Link href={`/jogadores/${t.player.id}`} className="text-sand hover:text-turquoise">
                    {t.player.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-slate-light">
                  {t.fromTeam ? (
                    <Link href={`/times/${t.fromTeam.slug}`} className="hover:text-turquoise">
                      {t.fromTeam.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-light">
                  {t.toTeam ? (
                    <Link href={`/times/${t.toTeam.slug}`} className="hover:text-turquoise">
                      {t.toTeam.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant="gold">{transferLabels[t.type]}</Badge>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs">
                  {formatCurrency(t.feeValue, t.feeCurrency ?? "BRL")}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-slate-light">
                  {new Intl.DateTimeFormat("pt-BR").format(new Date(t.transferDate))}
                </td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-light">
                  Nenhuma transferência registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
