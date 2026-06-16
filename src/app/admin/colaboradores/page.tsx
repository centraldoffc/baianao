import { prisma } from "@/lib/prisma";
import CollaboratorRequestsPanel from "@/components/admin/CollaboratorRequestsPanel";

export default async function AdminCollaboratorsPage() {
  const [pending, reviewed] = await Promise.all([
    prisma.collaboratorRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true, team: true },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.collaboratorRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: true, team: true },
      orderBy: { reviewedAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-sand">Colaboradores</h1>
        <p className="mt-1 text-sm text-slate-light">
          Aprove pedidos para que torcedores e equipes possam editar elenco, escalação e
          transferências dos respectivos times.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Pendentes</h2>
        <CollaboratorRequestsPanel
          requests={pending.map((r) => ({
            id: r.id,
            status: r.status,
            requestedAt: r.requestedAt.toISOString(),
            message: r.message,
            user: { name: r.user.name, email: r.user.email },
            team: { name: r.team.name },
          }))}
        />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Histórico</h2>
        <div className="flex flex-col gap-2">
          {reviewed.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm"
            >
              <span className="text-sand">
                {r.user.name} · {r.team.name}
              </span>
              <span
                className={`text-xs ${r.status === "APPROVED" ? "text-turquoise" : "text-coral"}`}
              >
                {r.status === "APPROVED" ? "Aprovado" : "Rejeitado"}
              </span>
            </div>
          ))}
          {reviewed.length === 0 && (
            <p className="text-sm text-slate-light">Nenhuma solicitação revisada ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
