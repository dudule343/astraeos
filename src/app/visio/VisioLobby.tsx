"use client";

import { useMemo, useState } from "react";

/** Identifiant de salle lisible "rdv-XXXX" (4 chars base36, sans 0/O/1/I/L). */
function makeRoomId(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return `rdv-${id}`;
}

/** Slug prospect : [a-z0-9-], borné à 64 chars. */
function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64);
}

/** Nom affichable : trim + borné à 80 chars. */
function sanitizeNom(raw: string): string {
  return raw.trim().slice(0, 80);
}

export default function VisioLobby() {
  // Ce composant n'est jamais rendu côté serveur (dynamic ssr:false) :
  // l'initialiseur peut générer l'aléatoire directement.
  const [room] = useState<string>(() => makeRoomId());
  const [copied, setCopied] = useState(false);

  // ?prospect=<slug>&nom=<display name> dans l'URL du lobby → propagés vers
  // l'entretien (bouton ingénieur + lien client). ssr:false → window dispo.
  const { prospect, nom } = useMemo(() => {
    if (typeof window === "undefined") return { prospect: "", nom: "" };
    const p = new URLSearchParams(window.location.search);
    return {
      prospect: sanitizeSlug(p.get("prospect") ?? ""),
      nom: sanitizeNom(p.get("nom") ?? ""),
    };
  }, []);

  const clientLink = useMemo(() => {
    if (!room) return "";
    // Le client n'a pas besoin du nom affichable : seul le prospect_slug le lie au dossier.
    const q = new URLSearchParams({ role: "client" });
    if (prospect) q.set("prospect", prospect);
    const path = `/visio/${room}?${q.toString()}`;
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [room, prospect]);

  function startAsEngineer() {
    if (!room) return;
    const q = new URLSearchParams({ role: "engineer" });
    if (prospect) q.set("prospect", prospect);
    if (nom) q.set("nom", nom);
    window.location.href = `/visio/${room}?${q.toString()}`;
  }

  async function copyClientLink() {
    if (!clientLink) return;
    try {
      await navigator.clipboard.writeText(clientLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refusé : on sélectionne le champ pour copie manuelle.
      const input = document.getElementById("client-link-input") as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1F38] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#1F5A36]">
          PRIVEOS · Visio
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#0A1F38]">
          Nouvel entretien
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          Une salle privée vient d&apos;être générée. Démarrez côté ingénieur, puis
          partagez le lien d&apos;invitation à votre client.
        </p>

        <div className="mb-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Salle&nbsp;:{" "}
          <span className="font-mono font-semibold text-[#0A1F38]">
            {room ?? "…"}
          </span>
        </div>

        <button
          type="button"
          onClick={startAsEngineer}
          disabled={!room}
          className="mb-6 w-full rounded-lg bg-[#0A1F38] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
        >
          Démarrer l&apos;entretien (ingénieur) →
        </button>

        <label
          htmlFor="client-link-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
        >
          Lien à partager au client
        </label>
        <div className="flex gap-2">
          <input
            id="client-link-input"
            type="text"
            readOnly
            value={clientLink}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
          />
          <button
            type="button"
            onClick={copyClientLink}
            disabled={!clientLink}
            className="rounded-lg bg-[#1F5A36] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
          >
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
      </div>
    </div>
  );
}
