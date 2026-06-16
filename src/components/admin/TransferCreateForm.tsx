"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Team = { id: string; name: string };
type PlayerOption = { id: string; name: string };

const TYPES = ["CONTRATACAO", "EMPRESTIMO", "RETORNO_EMPRESTIMO", "LIVRE", "ENCERRAMENTO_CONTRATO"];

export default function TransferCreateForm({ teams }: { teams: Team[] }) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [playerOptions, setPlayerOptions] = useState<PlayerOption[]>([]);
  const [form, setForm] = useState({
    playerId: "",
    fromTeamId: "",
    toTeamId: "",
    type: "CONTRATACAO",
    transferDate: "",
    feeValue: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function searchPlayers(value: string) {
    setPlayerName(value);
    setForm({ ...form, playerId: "" });
    if (value.length < 2) {
      setPlayerOptions([]);
      return;
    }
    const res = await fetch(`/api/players?search=${encodeURIComponent(value)}`);
    const data = await res.json();
    setPlayerOptions(data.players ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.playerId) {
      setError("Selecione um jogador existente na lista de sugestões.");
      return;
    }

    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: form.playerId,
        fromTeamId: form.fromTeamId || null,
        toTeamId: form.toTeamId || null,
        type: form.type,
        transferDate: form.transferDate,
        feeValue: form.feeValue ? Number(form.feeValue) : null,
        feeCurrency: "BRL",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(JSON.stringify(data.error ?? "Erro ao registrar transferência."));
      return;
    }

    setPlayerName("");
    setForm({ playerId: "", fromTeamId: "", toTeamId: "", type: "CONTRATACAO", transferDate: "", feeValue: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="flex flex-col gap-1 sm:col-span-2">
        <input
          required
          placeholder="Buscar jogador..."
          value={playerName}
          onChange={(e) => searchPlayers(e.target.value)}
          className="admin-input"
        />
        {playerOptions.length > 0 && !form.playerId && (
          <ul className="rounded-lg border border-ink-border bg-ink-light text-sm">
            {playerOptions.map((p) => (
              <li
                key={p.id}
                className="cursor-pointer px-3 py-1.5 hover:bg-ink"
                onClick={() => {
                  setForm({ ...form, playerId: p.id });
                  setPlayerName(p.name);
                  setPlayerOptions([]);
                }}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <select
        value={form.fromTeamId}
        onChange={(e) => setForm({ ...form, fromTeamId: e.target.value })}
        className="admin-input"
      >
        <option value="">Saiu de... (opcional)</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        value={form.toTeamId}
        onChange={(e) => setForm({ ...form, toTeamId: e.target.value })}
        className="admin-input"
      >
        <option value="">Foi para... (opcional)</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="admin-input"
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        required
        type="date"
        value={form.transferDate}
        onChange={(e) => setForm({ ...form, transferDate: e.target.value })}
        className="admin-input"
      />
      <input
        placeholder="Valor (R$, opcional)"
        type="number"
        value={form.feeValue}
        onChange={(e) => setForm({ ...form, feeValue: e.target.value })}
        className="admin-input"
      />

      <button type="submit" className="admin-button col-span-full sm:w-fit">
        Registrar
      </button>
      {error && <p className="col-span-full text-sm text-coral">{error}</p>}
    </form>
  );
}
