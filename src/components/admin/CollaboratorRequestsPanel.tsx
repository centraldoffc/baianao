"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Request = {
  id: string;
  status: string;
  requestedAt: string;
  message: string | null;
  user: { name: string; email: string };
  team: { name: string };
};

export default function CollaboratorRequestsPanel({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleReview(id: string, status: "APPROVED" | "REJECTED") {
    setLoadingId(id);
    await fetch(`/api/admin/collaborator-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (requests.length === 0) {
    return <p className="text-sm text-slate-light">Nenhuma solicitação pendente.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <div
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-border bg-ink-light/30 px-4 py-3 text-sm"
        >
          <div>
            <p className="text-sand">
              {r.user.name} <span className="text-slate-light">({r.user.email})</span>
            </p>
            <p className="text-xs text-slate-light">
              quer ser colaborador de <span className="text-turquoise">{r.team.name}</span>
            </p>
            {r.message && <p className="mt-1 text-xs text-slate-light">"{r.message}"</p>}
          </div>
          <div className="flex gap-2">
            <button
              disabled={loadingId === r.id}
              onClick={() => handleReview(r.id, "APPROVED")}
              className="rounded-lg border border-turquoise/30 bg-turquoise/10 px-3 py-1.5 text-xs text-turquoise transition hover:bg-turquoise/20"
            >
              Aprovar
            </button>
            <button
              disabled={loadingId === r.id}
              onClick={() => handleReview(r.id, "REJECTED")}
              className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-1.5 text-xs text-coral transition hover:bg-coral/20"
            >
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
