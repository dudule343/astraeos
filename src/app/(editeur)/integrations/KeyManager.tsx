"use client";

import { useEffect, useState } from "react";

type Status = { connected: boolean; maskedKey: string | null; model?: string };

type ProviderConfig = {
  id: "ia" | "stt";
  title: string;
  desc: string;
  endpoint: string;
  placeholder: string;
  docUrl: string;
  usedFor: string;
};

const PROVIDERS: ProviderConfig[] = [
  {
    id: "ia",
    title: "Anthropic (Claude)",
    desc: "Conseils patrimoniaux en direct pendant l'entretien, remplissage automatique du DCI et compte-rendu de fin d'entretien.",
    endpoint: "/api/ia-settings",
    placeholder: "sk-ant-...",
    docUrl: "https://console.anthropic.com/settings/keys",
    usedFor: "Cockpit visio · conseils IA · DCI auto · compte-rendu",
  },
  {
    id: "stt",
    title: "Deepgram (transcription)",
    desc: "Transcription de la voix en temps réel pendant la visioconférence.",
    endpoint: "/api/visio/stt-settings",
    placeholder: "Clé API Deepgram",
    docUrl: "https://console.deepgram.com/",
    usedFor: "Cockpit visio · transcription temps réel",
  },
];

function KeyCard({ provider }: { provider: ProviderConfig }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyInput, setKeyInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function loadStatus() {
    try {
      const r = await fetch(provider.endpoint, { cache: "no-store" });
      const d = (await r.json().catch(() => ({}))) as {
        connected?: boolean;
        masked_key?: string | null;
        model?: string;
      };
      setStatus({
        connected: Boolean(d.connected ?? d.masked_key),
        maskedKey: d.masked_key ?? null,
        model: d.model,
      });
    } catch {
      setStatus({ connected: false, maskedKey: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // loadStatus ne setState qu'après le fetch (différé) — faux positif de la règle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!keyInput.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(provider.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: keyInput.trim() }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setMsg({ ok: false, text: d.error ?? `Erreur HTTP ${r.status}` });
        return;
      }
      setKeyInput("");
      setMsg({ ok: true, text: "Clé validée et enregistrée." });
      await loadStatus();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Échec de l'enregistrement" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMsg(null);
    try {
      await fetch(provider.endpoint, { method: "DELETE" });
      setMsg({ ok: true, text: "Clé supprimée." });
      await loadStatus();
    } catch {
      setMsg({ ok: false, text: "Échec de la suppression" });
    } finally {
      setBusy(false);
    }
  }

  const connected = status?.connected;

  return (
    <div className="rounded-xl border border-[var(--navy-100)] bg-white p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-bold text-[var(--navy)]">{provider.title}</h3>
        {loading ? (
          <span className="text-[11px] text-[var(--navy-300)]">…</span>
        ) : connected ? (
          <span className="rounded-full bg-[var(--green-bg)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--green-text)]">
            ✓ Connectée
          </span>
        ) : (
          <span className="rounded-full bg-[var(--navy-100)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--navy-300)]">
            Non connectée
          </span>
        )}
      </div>
      <p className="mb-1 text-[12.5px] leading-relaxed text-[var(--navy-300)]">{provider.desc}</p>
      <p className="mb-4 text-[11px] text-[var(--navy-200)]">{provider.usedFor}</p>

      {connected ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-[var(--ivory)] px-3 py-2.5">
          <span className="font-mono text-[12px] text-[var(--navy)]">
            {status?.maskedKey ?? "••••••••"}
            {status?.model ? (
              <span className="ml-2 text-[11px] text-[var(--navy-300)]">· {status.model}</span>
            ) : null}
          </span>
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--red-text)] transition hover:border-[var(--red-text)] disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={provider.placeholder}
            className="flex-1 rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 font-mono text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
          />
          <button
            onClick={save}
            disabled={busy || !keyInput.trim()}
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Validation…" : "Valider et enregistrer"}
          </button>
        </div>
      )}

      {msg && (
        <p
          className={`mt-3 text-[12px] font-medium ${
            msg.ok ? "text-[var(--green-text)]" : "text-[var(--red-text)]"
          }`}
        >
          {msg.text}
        </p>
      )}

      <a
        href={provider.docUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-[11px] font-semibold text-[var(--navy-300)] underline transition hover:text-[var(--gold)]"
      >
        Obtenir une clé →
      </a>
    </div>
  );
}

export function KeyManager() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {PROVIDERS.map((p) => (
        <KeyCard key={p.id} provider={p} />
      ))}
    </div>
  );
}
