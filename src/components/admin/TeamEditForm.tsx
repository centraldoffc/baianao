"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Team = {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  foundedYear: number | null;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
};

export default function TeamEditForm({ team }: { team: Team }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: team.name,
    shortName: team.shortName,
    city: team.city,
    foundedYear: team.foundedYear?.toString() ?? "",
    description: team.description ?? "",
    logoUrl: team.logoUrl ?? "",
    primaryColor: team.primaryColor ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/teams/${team.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
        logoUrl: form.logoUrl || null,
        primaryColor: form.primaryColor || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Nome do time"
        className="admin-input"
      />
      <input
        value={form.shortName}
        onChange={(e) => setForm({ ...form, shortName: e.target.value })}
        placeholder="Sigla"
        maxLength={5}
        className="admin-input"
      />
      <input
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        placeholder="Cidade"
        className="admin-input"
      />
      <input
        value={form.foundedYear}
        onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
        placeholder="Ano de fundação"
        className="admin-input"
      />
      <input
        value={form.logoUrl}
        onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        placeholder="URL do escudo (opcional)"
        className="admin-input sm:col-span-2"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Descrição/história do clube"
        rows={3}
        className="admin-input sm:col-span-2"
      />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" className="admin-button">
          Salvar alterações
        </button>
        {saved && <span className="text-sm text-turquoise">Salvo!</span>}
        {error && <span className="text-sm text-coral">{error}</span>}
      </div>
    </form>
  );
}
