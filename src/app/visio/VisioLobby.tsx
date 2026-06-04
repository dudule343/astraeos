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

type Tool = "integre" | "meet" | "zoom";

/** Valide un lien externe : http(s), ≤ 300 chars, hostname autorisé. */
function isValidExternalLink(raw: string, kind: "meet" | "zoom"): boolean {
  const v = raw.trim();
  if (!v || v.length > 300) return false;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase();
  if (kind === "meet") return host === "meet.google.com";
  return host === "zoom.us" || host.endsWith(".zoom.us");
}

export default function VisioLobby() {
  // Ce composant n'est jamais rendu côté serveur (dynamic ssr:false) :
  // l'initialiseur peut générer l'aléatoire directement.
  const [room] = useState<string>(() => makeRoomId());
  const [copied, setCopied] = useState(false);

  const [tool, setTool] = useState<Tool>("integre");
  const [meetLink, setMeetLink] = useState("");
  const [meetBusy, setMeetBusy] = useState(false);
  const [meetError, setMeetError] = useState<string | null>(null);
  const [meetNotConnected, setMeetNotConnected] = useState(false);
  const [zoomLink, setZoomLink] = useState("");

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

  // Lien externe effectif retenu pour le mode compagnon (selon l'outil choisi).
  const externalLink = useMemo(() => {
    if (tool === "meet") return meetLink.trim();
    if (tool === "zoom") return zoomLink.trim();
    return "";
  }, [tool, meetLink, zoomLink]);

  const externalLinkValid = useMemo(() => {
    if (tool === "meet") return isValidExternalLink(externalLink, "meet");
    if (tool === "zoom") return isValidExternalLink(externalLink, "zoom");
    return false;
  }, [tool, externalLink]);

  // Lien à partager au client : la salle intégrée pour le mode PRIVEOS, le lien
  // Meet/Zoom directement pour les modes compagnon (le client va sur l'outil).
  const clientLink = useMemo(() => {
    if (tool === "meet" || tool === "zoom") {
      return externalLinkValid ? externalLink : "";
    }
    if (!room) return "";
    const q = new URLSearchParams({ role: "client" });
    if (prospect) q.set("prospect", prospect);
    const path = `/visio/${room}?${q.toString()}`;
    if (typeof window === "undefined") return path;
    return `${publicOrigin()}${path}`;
  }, [tool, externalLink, externalLinkValid, room, prospect]);

  const canStart = Boolean(room) && (tool === "integre" || externalLinkValid);

  function startAsEngineer() {
    if (!canStart) return;
    const q = new URLSearchParams({ role: "engineer" });
    if (prospect) q.set("prospect", prospect);
    if (nom) q.set("nom", nom);
    if (tool === "meet" || tool === "zoom") {
      q.set("tool", tool);
      q.set("lien", externalLink);
    }
    window.location.href = `/visio/${room}?${q.toString()}`;
  }

  async function generateMeetLink() {
    setMeetBusy(true);
    setMeetError(null);
    setMeetNotConnected(false);
    try {
      const res = await fetch("/api/calendar/meet-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: nom ? `Entretien · ${nom}` : undefined }),
      });
      if (res.status === 409) {
        setMeetNotConnected(true);
        return;
      }
      if (!res.ok) {
        setMeetError(
          "Génération du lien Meet impossible. Réessayez ou collez un lien manuellement.",
        );
        return;
      }
      const data = (await res.json()) as { meet_link?: string };
      if (data.meet_link) {
        setMeetLink(data.meet_link);
      } else {
        setMeetError("Réponse Google inattendue. Collez un lien Meet manuellement.");
      }
    } catch {
      setMeetError("Réseau indisponible. Collez un lien Meet manuellement.");
    } finally {
      setMeetBusy(false);
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

  const cardBase = "w-full text-left rounded-xl border p-4 transition cursor-pointer";
  function cardClass(active: boolean) {
    return active
      ? `${cardBase} border-[#0A1F38] bg-[#0A1F38]/[0.04] ring-1 ring-[#0A1F38]`
      : `${cardBase} border-slate-200 hover:border-slate-300`;
  }
  function dotClass(active: boolean) {
    return `h-3.5 w-3.5 flex-none rounded-full border ${
      active ? "border-[#0A1F38] bg-[#0A1F38]" : "border-slate-300"
    }`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1F38] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#1F5A36]">
          PRIVEOS · Visio
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#0A1F38]">Nouvel entretien</h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          Choisissez l&apos;outil de visio. PRIVEOS vous fournit le cockpit
          (transcription, DCI, conseils) quel que soit l&apos;outil retenu.
        </p>

        <div className="mb-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Salle&nbsp;:{" "}
          <span className="font-mono font-semibold text-[#0A1F38]">
            {room ?? "…"}
          </span>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {/* 1 · Salle PRIVEOS intégrée */}
          <button
            type="button"
            onClick={() => setTool("integre")}
            className={cardClass(tool === "integre")}
          >
            <div className="flex items-center gap-2">
              <span className={dotClass(tool === "integre")} />
              <span className="text-sm font-semibold text-[#0A1F38]">
                Salle PRIVEOS intégrée
              </span>
            </div>
            <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-500">
              Visio hébergée par PRIVEOS, vue client épurée incluse. Recommandé.
            </p>
          </button>

          {/* 2 · Google Meet */}
          <button
            type="button"
            onClick={() => setTool("meet")}
            className={cardClass(tool === "meet")}
          >
            <div className="flex items-center gap-2">
              <span className={dotClass(tool === "meet")} />
              <span className="text-sm font-semibold text-[#0A1F38]">
                Google Meet
              </span>
            </div>
            <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-500">
              Générez un lien Meet ou collez-en un. Le cockpit PRIVEOS
              accompagne l&apos;entretien.
            </p>
          </button>

          {/* 3 · Zoom */}
          <button
            type="button"
            onClick={() => setTool("zoom")}
            className={cardClass(tool === "zoom")}
          >
            <div className="flex items-center gap-2">
              <span className={dotClass(tool === "zoom")} />
              <span className="text-sm font-semibold text-[#0A1F38]">Zoom</span>
            </div>
            <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-500">
              Collez votre lien Zoom. Le cockpit PRIVEOS accompagne
              l&apos;entretien.
            </p>
          </button>
        </div>

        {/* Panneau Meet : génération + saisie manuelle */}
        {tool === "meet" && (
          <div className="mb-6 rounded-xl border border-slate-200 p-4">
            <button
              type="button"
              onClick={generateMeetLink}
              disabled={meetBusy}
              className="mb-3 w-full rounded-lg bg-[#1F5A36] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {meetBusy ? "Génération…" : "Générer le lien Meet"}
            </button>
            {meetNotConnected && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                Connectez Google Calendar dans l&apos;Espace Ingénieur, ou collez
                un lien Meet manuellement ci-dessous.
              </p>
            )}
            {meetError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                {meetError}
              </p>
            )}
            <label
              htmlFor="meet-link-input"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Lien Google Meet
            </label>
            <input
              id="meet-link-input"
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
            />
            {meetLink && !externalLinkValid && (
              <p className="mt-1.5 text-xs text-red-600">
                Lien Meet invalide (attendu : https://meet.google.com/…).
              </p>
            )}
          </div>
        )}

        {/* Panneau Zoom : saisie du lien */}
        {tool === "zoom" && (
          <div className="mb-6 rounded-xl border border-slate-200 p-4">
            <label
              htmlFor="zoom-link-input"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Lien Zoom
            </label>
            <input
              id="zoom-link-input"
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://us02web.zoom.us/j/..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
            />
            {zoomLink && !externalLinkValid && (
              <p className="mt-1.5 text-xs text-red-600">
                Lien Zoom invalide (attendu : https://*.zoom.us/…).
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={startAsEngineer}
          disabled={!canStart}
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
            placeholder={
              tool === "integre" ? "" : "Le lien apparaîtra une fois l'outil renseigné"
            }
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
