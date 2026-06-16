"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    slug: "",
    city: "",
    foundedYear: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(JSON.stringify(data.error ?? "Erro ao criar time."));
      return;
    }
    setForm({ name: "", shortName: "", slug: "", city: "", foundedYear: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        required
        placeholder="Nome do time"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="admin-input"
      />
      <input
        required
        placeholder="Sigla (ex: BAH)"
        maxLength={5}
        value={form.shortName}
        onChange={(e) => setForm({ ...form, shortName: e.target.value })}
        className="admin-input"
      />
      <input
        required
        placeholder="slug (ex: ec-bahia)"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        className="admin-input"
      />
      <input
        required
        placeholder="Cidade"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        className="admin-input"
      />
      <input
        placeholder="Ano de fundação"
        value={form.foundedYear}
        onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
        className="admin-input"
      />
      <button
        type="submit"
        disabled={loading}
        className="col-span-full rounded-lg bg-coral px-4 py-2 text-sm font-medium text-ink transition hover:bg-coral-dark disabled:opacity-60 sm:w-fit"
      >
        {loading ? "Salvando..." : "Adicionar time"}
      </button>
      {error && <p className="col-span-full text-sm text-coral">{error}</p>}
    </form>
  );
}
