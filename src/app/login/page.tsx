"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Não foi possível criar a conta.");
        }
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("E-mail ou senha inválidos.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Algo deu errado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">Conta</span>
        <h1 className="font-display text-3xl text-sand">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-slate-light">
          Crie uma conta para solicitar ser colaborador de um time e ajudar a manter os dados
          atualizados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <Field label="Nome">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
        )}
        <Field label="E-mail">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Senha">
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-coral-dark disabled:opacity-60"
        >
          {loading ? "Enviando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-sm text-turquoise hover:underline"
      >
        {mode === "login" ? "Não tem conta? Criar uma agora" : "Já tem conta? Entrar"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-light">
      {label}
      {children}
    </label>
  );
}
