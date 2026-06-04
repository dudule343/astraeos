"use client";

import { useState, type FormEvent } from "react";

const NAVY = "#0B1C35";
const GOLD = "#C8A55C";

/** Normalise ?next= : chemin interne uniquement (commence par "/", pas "//"). */
function safeNext(raw: string | null): string {
  if (!raw) return "/ingenieur";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/ingenieur";
  return raw;
}

export default function ConnexionPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const params = new URLSearchParams(window.location.search);
        window.location.replace(safeNext(params.get("next")));
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Connexion impossible. Réessayez.");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{ background: NAVY }}
      className="flex min-h-screen items-center justify-center p-6"
    >
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div
            className="text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            PRIVEOS
          </div>
          <h1
            className="mt-2 text-[20px] font-semibold"
            style={{ color: NAVY }}
          >
            Connexion
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: NAVY }}
            >
              Code d&apos;accès
            </label>
            <input
              id="code"
              name="code"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-transparent focus:ring-2"
              style={{ ["--tw-ring-color" as string]: GOLD }}
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !code}
            style={{ background: GOLD }}
            className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Entrer"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-slate-400">
          Espace réservé au cabinet
        </p>
      </div>
    </main>
  );
}
