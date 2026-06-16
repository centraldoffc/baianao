"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const POSITIONS = ["Goleiro", "Zagueiro", "Lateral", "Meio-campo", "Atacante"];

type SquadOption = {
  playerId: string;
  name: string;
  position: string;
  jerseyNumber: number | null;
};

type LineupEntry = {
  playerId: string;
  isStarter: boolean;
  position: string;
  shirtNumber?: number | null;
};

type RowState = {
  included: boolean;
  isStarter: boolean;
  position: string;
  shirtNumber: string;
};

export default function LineupManager({
  matchId,
  teamId,
  teamName,
  squad,
  currentLineup,
}: {
  matchId: string;
  teamId: string;
  teamName: string;
  squad: SquadOption[];
  currentLineup: LineupEntry[];
}) {
  const router = useRouter();

  const initial: Record<string, RowState> = {};
  for (const p of squad) {
    const existing = currentLineup.find((l) => l.playerId === p.playerId);
    initial[p.playerId] = {
      included: !!existing,
      isStarter: existing?.isStarter ?? true,
      position: existing?.position ?? p.position,
      shirtNumber: (existing?.shirtNumber ?? p.jerseyNumber ?? "").toString(),
    };
  }

  const [rows, setRows] = useState(initial);
  const [saved, setSaved] = useState(false);

  function update(playerId: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [playerId]: { ...prev[playerId], ...patch } }));
  }

  async function handleSave() {
    const players = Object.entries(rows)
      .filter(([, r]) => r.included)
      .map(([playerId, r]) => ({
        playerId,
        isStarter: r.isStarter,
        position: r.position,
        shirtNumber: r.shirtNumber ? Number(r.shirtNumber) : null,
      }));

    await fetch(`/api/matches/${matchId}/lineup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, players }),
    });
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <h3 className="mb-2 font-display text-lg text-sand">{teamName}</h3>
      {squad.length === 0 ? (
        <p className="text-sm text-slate-light">
          Este time ainda não tem elenco cadastrado para a temporada.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-ticket border border-ink-border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-border bg-ink-light text-left text-xs uppercase tracking-wide text-slate-light">
                <th className="px-3 py-2">Na escalação</th>
                <th className="px-3 py-2">Jogador</th>
                <th className="px-3 py-2">Posição</th>
                <th className="px-3 py-2">Camisa</th>
                <th className="px-3 py-2">Titular</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((p) => {
                const r = rows[p.playerId];
                return (
                  <tr key={p.playerId} className="border-b border-ink-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={r.included}
                        onChange={(e) => update(p.playerId, { included: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2 text-sand">{p.name}</td>
                    <td className="px-3 py-2">
                      <select
                        value={r.position}
                        onChange={(e) => update(p.playerId, { position: e.target.value })}
                        className="admin-input"
                      >
                        {POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={r.shirtNumber}
                        onChange={(e) => update(p.playerId, { shirtNumber: e.target.value })}
                        className="admin-input w-20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={r.isStarter}
                        onChange={(e) => update(p.playerId, { isStarter: e.target.checked })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button onClick={handleSave} className="admin-button">
          Salvar escalação
        </button>
        {saved && <span className="text-sm text-turquoise">Salvo!</span>}
      </div>
    </div>
  );
}
