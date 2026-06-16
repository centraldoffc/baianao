"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Status = "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "LOADING";

export default function CollaboratorRequestButton({ teamSlug }: { teamSlug: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<Status>("LOADING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) { setStatus("NONE"); return; }
    fetch(`/api/teams/${teamSlug}/collaborator-request`)
      .then((r) => r.json())
      .then((data) => setStatus(data.status ?? "NONE"))
      .catch(() => setStatus("NONE"));
  }, [session, sessionStatus, teamSlug]);

  async function handleRequest() {
    setError(null);
    setStatus("LOADING");
    const res = await fetch(`/api/teams/${teamSlug}/collaborator-request`, { method: "POST" });
    if (res.ok) {
      setStatus("PENDING");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível enviar a solicitação.");
      setStatus("NONE");
    }
  }

  if (sessionStatus === "loading" || status === "LOADING") {
    return <div className="h-9 w-56 animate-pulse rounded-full bg-ink-light" />;
  }

  if (!session) {
    return (
      <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-ink-border px-4 py-2 text-sm text-sand transition hover:border-turquoise hover:text-turquoise">
        Entrar para ser colaborador deste time
      </Link>
    );
  }

  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-turquoise/30 bg-turquoise/10 px-4 py-2 text-sm text-turquoise">
        ✓ Você é colaborador deste time
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
        Solicitação em análise
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleRequest}
        className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-ink transition hover:bg-coral-dark"
      >
        Quero ser colaborador deste time
      </button>
      {status === "REJECTED" && (
        <span className="text-xs text-slate-light">
          Sua última solicitação não foi aprovada. Você pode tentar novamente.
        </span>
      )}
      {error && <span className="text-xs text-coral">{error}</span>}
    </div>
  );
}
