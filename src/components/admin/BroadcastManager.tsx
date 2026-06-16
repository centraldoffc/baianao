"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Broadcast = { channelName: string; type: string; url?: string | null };

const TYPES = ["TV_ABERTA", "TV_FECHADA", "STREAMING", "RADIO"];

export default function BroadcastManager({
  matchId,
  initial,
}: {
  matchId: string;
  initial: Broadcast[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Broadcast[]>(initial);
  const [draft, setDraft] = useState<Broadcast>({ channelName: "", type: "TV_ABERTA", url: "" });
  const [saved, setSaved] = useState(false);

  function addDraft() {
    if (!draft.channelName) return;
    setItems([...items, draft]);
    setDraft({ channelName: "", type: "TV_ABERTA", url: "" });
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSave() {
    await fetch(`/api/matches/${matchId}/broadcast`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        broadcasts: items.map((b) => ({ ...b, url: b.url || undefined })),
      }),
    });
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {items.map((b, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 rounded-lg border border-ink-border bg-ink-light/30 px-3 py-2 text-sm"
          >
            <span className="text-sand">
              {b.channelName} <span className="text-slate-light">· {b.type}</span>
            </span>
            <button onClick={() => removeItem(i)} className="text-xs text-coral hover:underline">
              Remover
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-slate-light">Nenhuma transmissão definida ainda.</p>
        )}
      </ul>

      <div className="grid gap-2 sm:grid-cols-[2fr_1.5fr_2fr_auto]">
        <input
          placeholder="Canal (ex: TV Bahia)"
          value={draft.channelName}
          onChange={(e) => setDraft({ ...draft, channelName: e.target.value })}
          className="admin-input"
        />
        <select
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          className="admin-input"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          placeholder="Link (opcional)"
          value={draft.url ?? ""}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          className="admin-input"
        />
        <button type="button" onClick={addDraft} className="admin-button-ghost">
          + Adicionar
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="admin-button">
          Salvar transmissões
        </button>
        {saved && <span className="text-sm text-turquoise">Salvo!</span>}
      </div>
    </div>
  );
}
