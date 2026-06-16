"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Team = { id: string; name: string };
type Round = { id: string; name: string; seasonId: string };
type Season = { id: string; label: string; rounds: Round[] };

export default function MatchCreateForm({ teams, seasons }: { teams: Team[]; seasons: Season[] }) {
  const router = useRouter();
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const [form, setForm] = useState({
    roundId: "",
    homeTeamId: "",
    awayTeamId: "",
    matchDateTime: "",
  });
  const [error, setError] = useState<string | null>(null);

  const rounds = seasons.find((s) => s.id === seasonId)?.rounds ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.homeTeamId === form.awayTeamId) {
      setError("Os times da casa e visitante devem ser diferentes.");
      return;
    }

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasonId, ...form }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(JSON.stringify(data.error ?? "Erro ao criar jogo."));
      return;
    }

    setForm({ roundId: "", homeTeamId: "", awayTeamId: "", matchDateTime: "" });
    router.refresh();
  }

  if (seasons.length === 0) {
    return (
      <p className="text-sm text-slate-light">
        Cadastre uma temporada e suas rodadas no banco antes de criar jogos.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)} className="admin-input">
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        required
        value={form.roundId}
        onChange={(e) => setForm({ ...form, roundId: e.target.value })}
        className="admin-input"
      >
        <option value="">Rodada</option>
        {rounds.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <select
        required
        value={form.homeTeamId}
        onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
        className="admin-input"
      >
        <option value="">Time da casa</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        required
        value={form.awayTeamId}
        onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
        className="admin-input"
      >
        <option value="">Time visitante</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <input
        required
        type="datetime-local"
        value={form.matchDateTime}
        onChange={(e) => setForm({ ...form, matchDateTime: e.target.value })}
        className="admin-input"
      />
      <button type="submit" className="admin-button col-span-full sm:w-fit">
        Criar jogo
      </button>
      {error && <p className="col-span-full text-sm text-coral">{error}</p>}
    </form>
  );
}
