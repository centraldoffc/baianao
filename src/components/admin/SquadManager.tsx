"use client";

import { useEffect, useState } from "react";

type Season = { id: string; label: string };

type SquadMember = {
  id: string;
  jerseyNumber: number | null;
  position: string;
  status: string;
  player: { id: string; name: string };
};

const POSITIONS = ["Goleiro", "Zagueiro", "Lateral", "Meio-campo", "Atacante"];
const STATUSES = ["ATIVO", "LESIONADO", "SUSPENSO", "EMPRESTADO"];

export default function SquadManager({ teamSlug, seasons }: { teamSlug: string; seasons: Season[] }) {
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({ name: "", position: "Atacante", jerseyNumber: "" });

  async function loadSquad(season: string) {
    if (!season) return;
    setLoading(true);
    const res = await fetch(`/api/teams/${teamSlug}/squad?seasonId=${season}`);
    const data = await res.json();
    setSquad(data.squad ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSquad(seasonId);
  }, [seasonId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/teams/${teamSlug}/squad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seasonId,
        position: newPlayer.position,
        jerseyNumber: newPlayer.jerseyNumber ? Number(newPlayer.jerseyNumber) : null,
        player: { name: newPlayer.name },
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(JSON.stringify(data.error ?? "Erro ao adicionar jogador."));
      return;
    }
    setNewPlayer({ name: "", position: "Atacante", jerseyNumber: "" });
    loadSquad(seasonId);
  }

  async function handleUpdate(membershipId: string, field: string, value: string | number | null) {
    await fetch(`/api/teams/${teamSlug}/squad`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId, [field]: value }),
    });
    loadSquad(seasonId);
  }

  async function handleRemove(membershipId: string) {
    await fetch(`/api/teams/${teamSlug}/squad?membershipId=${membershipId}`, { method: "DELETE" });
    loadSquad(seasonId);
  }

  if (seasons.length === 0) {
    return (
      <p className="text-sm text-slate-light">
        Cadastre uma temporada (Competição → Temporada) antes de montar o elenco.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex max-w-xs flex-col gap-1 text-sm text-slate-light">
        Temporada
        <select
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
          className="admin-input"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[2fr_1.5fr_1fr_auto]">
        <input
          required
          placeholder="Nome do jogador"
          value={newPlayer.name}
          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          className="admin-input"
        />
        <select
          value={newPlayer.position}
          onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
          className="admin-input"
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          placeholder="Camisa"
          type="number"
          value={newPlayer.jerseyNumber}
          onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })}
          className="admin-input"
        />
        <button type="submit" className="admin-button">
          Adicionar
        </button>
      </form>
      {error && <p className="text-sm text-coral">{error}</p>}

      <div className="overflow-x-auto rounded-ticket border border-ink-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-border bg-ink-light text-left text-xs uppercase tracking-wide text-slate-light">
              <th className="px-3 py-2">Jogador</th>
              <th className="px-3 py-2">Posição</th>
              <th className="px-3 py-2">Camisa</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {squad.map((m) => (
              <tr key={m.id} className="border-b border-ink-border/60 last:border-0">
                <td className="px-3 py-2 text-sand">{m.player.name}</td>
                <td className="px-3 py-2">
                  <select
                    value={m.position}
                    onChange={(e) => handleUpdate(m.id, "position", e.target.value)}
                    className="admin-input"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    defaultValue={m.jerseyNumber ?? ""}
                    onBlur={(e) =>
                      handleUpdate(m.id, "jerseyNumber", e.target.value ? Number(e.target.value) : null)
                    }
                    className="admin-input w-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdate(m.id, "status", e.target.value)}
                    className="admin-input"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => handleRemove(m.id)} className="text-xs text-coral hover:underline">
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {!loading && squad.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-light">
                  Nenhum jogador no elenco desta temporada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
