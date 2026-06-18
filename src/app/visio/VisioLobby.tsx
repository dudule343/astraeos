"use client";

import { useMemo, useState } from "react";

/** Identifiant de salle lisible "rdv-XXXX" (4 chars base36, sans 0/O/1/I/L). */

/** Origine publique : jamais une URL de déploiement Vercel (protégée par SSO). */
function publicOrigin(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname;
  if (h.endsWith(".vercel.app") && h !== "astraeos.vercel.app") {
    return "https://astraeos.vercel.app";
  }
  return window.location.origin;
}

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

type SendStatus = "idle" | "sending" | "sent" | "error";

export default function VisioLobby() {
  // Ce composant n'est jamais rendu côté serveur (dynamic ssr:false) :
  // l'initialiseur peut générer l'aléatoire directement.
  const [room] = useState<string>(() => makeRoomId());
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [sendError, setSendError] = useState<string | null>(null);

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

  // Lien à partager au client : la salle intégrée, en vue client.
  const clientLink = useMemo(() => {
    if (!room) return "";
    const q = new URLSearchParams({ role: "client" });
    if (prospect) q.set("prospect", prospect);
    const path = `/visio/${room}?${q.toString()}`;
    if (typeof window === "undefined") return path;
    return `${publicOrigin()}${path}`;
  }, [room, prospect]);

  const canStart = Boolean(room);

  function startAsEngineer() {
    if (!canStart) return;
    const q = new URLSearchParams({ role: "engineer" });
    if (prospect) q.set("prospect", prospect);
    if (nom) q.set("nom", nom);
    window.location.href = `/visio/${room}?${q.toString()}`;
  }

  async function sendByEmail() {
    const mail = email.trim();
    if (!mail || sendStatus === "sending") return;
    setSendStatus("sending");
    setSendError(null);
    try {
      const res = await fetch("/api/visio/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail, room, prospect, nom }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSendStatus("error");
        setSendError(data.error || "Envoi impossible.");
        return;
      }
      setSendStatus("sent");
    } catch {
      setSendStatus("error");
      setSendError("Erreur réseau.");
    }
  }

  async function copyClientLink() {
    if (!clientLink) return;
    try {
      await navigator.clipboard.writeText(clientLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById(
        "client-link-input",
      ) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A1F38] via-[#0d243f] to-[#13294a] px-5 py-10">
      <div className="w-full max-w-lg">
        {/* Marque */}
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C68E0E] text-base font-extrabold text-white">
            P
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/90">
            PRI<span className="font-extrabold text-[#f0c869]">VEOS</span>
            <span className="ml-2 font-normal text-white/50">· Visio</span>
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* En-tête */}
          <div className="border-b border-slate-100 px-8 pb-6 pt-8">
            <h1 className="text-2xl font-bold text-[#0A1F38]">
              Démarrer un entretien
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {nom ? (
                <>
                  Entretien avec{" "}
                  <span className="font-semibold text-[#0A1F38]">{nom}</span>.
                </>
              ) : (
                "Entretien visio hébergé par PRIVEOS. Aucun client préchargé : le dossier se remplit pendant l'échange."
              )}
            </p>
          </div>

          {/* Étape 1 · Ingénieur */}
          <div className="px-8 pt-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#C68E0E]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C68E0E]/15 text-[11px]">
                1
              </span>
              Vous, l&apos;ingénieur
            </div>
            <button
              type="button"
              onClick={startAsEngineer}
              disabled={!canStart}
              className="w-full rounded-xl bg-[#0A1F38] px-4 py-3.5 text-sm font-semibold text-white transition hover:brightness-125 disabled:opacity-40"
            >
              Rejoindre l&apos;entretien maintenant →
            </button>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Votre cockpit s&apos;ouvre&nbsp;: transcription en direct, DCI et
              conseils IA pendant l&apos;échange.
            </p>
          </div>

          {/* Étape 2 · Client */}
          <div className="mt-6 border-t border-slate-100 bg-slate-50/60 px-8 py-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#1F5A36]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F5A36]/15 text-[11px]">
                2
              </span>
              Votre client
            </div>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
              Envoyez-lui ce lien&nbsp;: il rejoint la même salle avec une vue
              épurée, sans votre cockpit.
            </p>
            <div className="flex gap-2">
              <input
                id="client-link-input"
                type="text"
                readOnly
                value={clientLink}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs text-slate-600"
              />
              <button
                type="button"
                onClick={copyClientLink}
                disabled={!clientLink}
                className="shrink-0 rounded-lg bg-[#1F5A36] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
              >
                {copied ? "Copié ✓" : "Copier"}
              </button>
            </div>

            {/* Envoi direct par e-mail (Resend) */}
            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs text-slate-500">Ou envoyez-le directement par e-mail :</p>
              {sendStatus === "sent" ? (
                <p className="rounded-lg bg-[#1F5A36]/10 px-3 py-2.5 text-xs font-semibold text-[#1F5A36]">
                  ✓ Invitation envoyée à {email.trim()}.
                </p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (sendStatus === "error") setSendStatus("idle");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && sendByEmail()}
                      placeholder="email@client.fr"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={sendByEmail}
                      disabled={!email.trim() || sendStatus === "sending"}
                      className="shrink-0 rounded-lg bg-[#0A1F38] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-125 disabled:opacity-40"
                    >
                      {sendStatus === "sending" ? "Envoi…" : "Envoyer"}
                    </button>
                  </div>
                  {sendStatus === "error" && sendError && (
                    <p className="mt-2 text-xs text-[#C0392B]">{sendError}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pied : salle */}
          <div className="flex items-center justify-center gap-1.5 px-8 py-3 text-[11px] text-slate-400">
            Salle
            <span className="font-mono font-semibold text-slate-500">
              {room ?? "…"}
            </span>
            <span className="text-slate-300">· générée automatiquement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
