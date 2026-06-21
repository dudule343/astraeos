"use client";

// Bouton de connexion Google Agenda (façon Calendly) avec ÉTAT RÉEL.
// - Non connecté → « Connecter mon agenda Google » → mire OAuth Google.
// - Connecté → « Agenda connecté · <email> » + déconnexion.
// Lit /api/calendar/status au montage ; connecte via /api/auth/google/start.

import { useEffect, useState } from "react";

type Status = { connected: boolean; email: string | null };

const CheckIcon = () => (
  <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12 L 11 15 L 16 9" />
  </svg>
);

const PlugIcon = () => (
  <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export function GoogleSyncButton() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/calendar/status")
      .then((r) => r.json())
      .then((d) => alive && setStatus({ connected: Boolean(d.connected), email: d.email ?? null }))
      .catch(() => alive && setStatus({ connected: false, email: null }));
    return () => {
      alive = false;
    };
  }, []);

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/calendar/disconnect", { method: "POST" });
    } finally {
      window.location.reload();
    }
  }

  // État inconnu (chargement) : bouton neutre, pas de scintillement.
  if (status === null) {
    return (
      <span className="btn btn-ghost btn-sm" style={{ opacity: 0.6 }}>
        <PlugIcon />
        <span>Google Agenda…</span>
      </span>
    );
  }

  if (status.connected) {
    return (
      <span
        className="btn btn-sm"
        style={{
          background: "#E8F5EE",
          color: "#1F8049",
          border: "1px solid #BfE3CD",
          gap: 8,
          cursor: "default",
        }}
        title={`Google Agenda connecté${status.email ? " · " + status.email : ""}`}
      >
        <CheckIcon />
        <span>Agenda connecté{status.email ? ` · ${status.email}` : ""}</span>
        <button
          type="button"
          onClick={disconnect}
          disabled={busy}
          style={{
            marginLeft: 4,
            background: "none",
            border: "none",
            color: "#1F8049",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 11,
            padding: 0,
          }}
        >
          {busy ? "…" : "Déconnecter"}
        </button>
      </span>
    );
  }

  return (
    <a
      className="btn btn-sm"
      href="/api/auth/google/start"
      title="Autoriser Astraeos à synchroniser votre Google Agenda (une seule fois)"
      style={{ background: "#C9A24B", color: "#1a1a2e", border: "1px solid #C9A24B", fontWeight: 600, gap: 8 }}
    >
      <PlugIcon />
      <span>Connecter mon agenda Google</span>
    </a>
  );
}
