"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["AGENDADO", "EM_ANDAMENTO", "FINALIZADO", "ADIADO", "CANCELADO"];

export default function MatchResultForm({
  matchId,
  initial,
}: {
  matchId: string;
  initial: { status: string; homeScore: number | null; awayScore: number | null };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    status: initial.status,
    homeScore: initial.homeScore?.toString() ?? "",
    awayScore: initial.awayScore?.toString() ?? "",
  });
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.status,
        homeScore: form.homeScore === "" ? null : Number(form.homeScore),
        awayScore: form.awayScore === "" ? null : Number(form.awayScore),
      }),
    });
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm text-slate-light">
        Status
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="admin-input"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-light">
        Placar casa
        <input
          type="number"
          min={0}
          value={form.homeScore}
          onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
          className="admin-input w-24"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-light">
        Placar visitante
        <input
          type="number"
          min={0}
          value={form.awayScore}
          onChange={(e) => setForm({ ...form, awayScore: e.target.value })}
          className="admin-input w-24"
        />
      </label>
      <button type="submit" className="admin-button">
        Salvar
      </button>
      {saved && <span className="text-sm text-turquoise">Salvo!</span>}
    </form>
  );
}
