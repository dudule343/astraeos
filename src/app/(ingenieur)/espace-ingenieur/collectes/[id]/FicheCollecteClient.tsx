"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type PieceVM = {
  itemIndex: number;
  label: string;
  declaratif: boolean;
  status: "depose" | "attval" | "manquant" | "alerte" | "refuse";
  statusLabel: string;
  hasDepot: boolean;
  fileName: string | null;
  reponse: string | null;
  ia: { status: string | null; resume: string | null; detail: string | null } | null;
  commentCount: number;
};

export type SousVM = { title: string; pieces: PieceVM[]; received: number; total: number };

export type ThemeVM = {
  title: string;
  sous: SousVM[];
  total: number;
  received: number;
  manquant: number;
  alertes: number;
  pct: number;
  subCount: number;
};

export type FicheData = {
  token: string;
  title: string;
  themeCount: number;
  pct: number;
  received: number;
  total: number;
  opened: boolean;
  themes: ThemeVM[];
  counts: {
    all: number;
    depose: number;
    attval: number;
    alerte: number;
    manquant: number;
    comment: number;
  };
};

type FilterKey = "all" | "depose" | "attval" | "alerte" | "manquant" | "comment";

type Incoherence = {
  champ: string;
  sources: string[];
  constat: string;
  gravite: "bloquante" | "majeure" | "mineure";
};

type Message = {
  id: string;
  item_index: number | null;
  author: string;
  body: string;
  created_at: string;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "depose", label: "Validés" },
  { key: "attval", label: "En attente de validation" },
  { key: "alerte", label: "Incohérences IA" },
  { key: "manquant", label: "Manquants" },
  { key: "comment", label: "Avec commentaires" },
];

/* — Icônes (géométrie identique à la maquette v40) — */
function IcoTriangle() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IcoCheck() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IcoX() {
  return (
    <svg viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IcoEye() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IcoRelance() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function IcoReanalyse() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}
function IcoMsg() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function StatusIcon({ status }: { status: PieceVM["status"] }) {
  if (status === "depose")
    return (
      <svg viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  if (status === "attval")
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
    );
  if (status === "alerte") return <IcoTriangle />;
  if (status === "refuse")
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/** Libellé lisible du verdict IA brut (collecte_analyses.status). */
function iaVerdictLabel(status: string | null): string {
  switch (status) {
    case "conforme":
      return "Analyse IA · Conforme";
    case "incoherence":
      return "Analyse IA · Incohérence détectée";
    case "illisible":
      return "Analyse IA · Document illisible";
    case "erreur":
      return "Analyse IA · Erreur d'analyse";
    case "en_cours":
      return "Analyse IA · en cours…";
    default:
      return "Analyse IA";
  }
}

function iaBannerClass(status: string | null): string {
  switch (status) {
    case "conforme":
      return "is-conforme";
    case "illisible":
      return "is-illisible";
    case "erreur":
      return "is-erreur";
    case "en_cours":
      return "is-encours";
    default:
      return "is-conforme";
  }
}

export function FicheCollecteClient({
  data,
  dossierId,
}: {
  data: FicheData;
  dossierId: string;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Set<number>>(
    () => new Set(data.themes.map((_, i) => i).filter((i) => i !== 0)),
  );
  const [filter, setFilter] = useState<FilterKey>("all");
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; err?: boolean } | null>(null);

  // Aperçu document
  const [preview, setPreview] = useState<{ index: number; label: string } | null>(null);
  // Messagerie par pièce
  const [chat, setChat] = useState<{ index: number; label: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatBody, setChatBody] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  // Cohérence IA (à la demande, résolution locale comme la maquette)
  const [coherence, setCoherence] = useState<Incoherence[] | null>(null);
  const [cohBusy, setCohBusy] = useState(false);
  const [cohResolved, setCohResolved] = useState<Set<number>>(new Set());

  const showToast = useCallback((text: string, err?: boolean) => {
    setToast({ text, err });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const toggleTheme = (i: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const toggleAll = () =>
    setCollapsed((prev) =>
      prev.size === data.themes.length ? new Set() : new Set(data.themes.map((_, i) => i)),
    );

  const pieceVisible = useCallback(
    (p: PieceVM): boolean => {
      switch (filter) {
        case "all":
          return true;
        case "depose":
          return p.status === "depose";
        case "attval":
          return p.status === "attval";
        case "alerte":
          return p.status === "alerte" || p.ia?.status === "incoherence";
        case "manquant":
          return p.status === "manquant";
        case "comment":
          return p.commentCount > 0;
        default:
          return true;
      }
    },
    [filter],
  );

  /* — Actions back-end — */
  const callAdmin = useCallback(
    async (path: string, init: RequestInit, okMsg: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/collecte-admin/${data.token}/${path}`, init);
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          showToast(json.error ?? `Erreur ${res.status}`, true);
          return false;
        }
        showToast(okMsg);
        return true;
      } catch {
        showToast("Action impossible (réseau).", true);
        return false;
      }
    },
    [data.token, showToast],
  );

  const setVerdict = async (itemIndex: number, verdict: "valide" | "refuse" | null) => {
    setBusyIndex(itemIndex);
    const ok = await callAdmin(
      "",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_verdict", item_index: itemIndex, verdict }),
      },
      verdict === "valide"
        ? "Pièce validée."
        : verdict === "refuse"
          ? "Pièce refusée."
          : "Décision réinitialisée.",
    );
    setBusyIndex(null);
    if (ok) router.refresh();
  };

  const reanalyse = async (itemIndex: number) => {
    setBusyIndex(itemIndex);
    const ok = await callAdmin(
      "reanalyse",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_index: itemIndex }),
      },
      "Ré-analyse IA lancée…",
    );
    setBusyIndex(null);
    if (ok) window.setTimeout(() => router.refresh(), 1500);
  };

  const relance = async (itemIndexes?: number[]) => {
    const ok = await callAdmin(
      "relance",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: itemIndexes ? JSON.stringify({ item_index: itemIndexes }) : "{}",
      },
      "Relance envoyée au client.",
    );
    if (ok) router.refresh();
  };

  const runCoherence = async () => {
    setCohBusy(true);
    try {
      const res = await fetch(`/api/collecte-admin/${data.token}/coherence`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as {
        incoherences?: Incoherence[];
        error?: string;
      };
      if (!res.ok) {
        showToast(json.error ?? `Erreur ${res.status}`, true);
        setCoherence([]);
      } else {
        setCoherence(json.incoherences ?? []);
        setCohResolved(new Set());
      }
    } catch {
      showToast("Contrôle de cohérence impossible.", true);
      setCoherence([]);
    }
    setCohBusy(false);
  };

  /* — Aperçu — */
  const fileUrl = (index: number) => `/api/collecte-admin/${data.token}/file?item_index=${index}`;

  /* — Messagerie — */
  const openChat = async (index: number, label: string) => {
    setChat({ index, label });
    setMessages([]);
    try {
      const res = await fetch(`/api/collecte-admin/${data.token}`);
      const json = (await res.json().catch(() => ({}))) as { messages?: Message[] };
      setMessages((json.messages ?? []).filter((m) => m.item_index === index));
    } catch {
      /* fil vide */
    }
  };

  const sendMessage = async () => {
    if (!chat || !chatBody.trim()) return;
    setChatBusy(true);
    try {
      const res = await fetch(`/api/collecte-admin/${data.token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: chatBody.trim(), item_index: chat.index }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: Message; error?: string };
      if (res.ok && json.message) {
        setMessages((prev) => [...prev, json.message!]);
        setChatBody("");
      } else {
        showToast(json.error ?? "Envoi impossible.", true);
      }
    } catch {
      showToast("Envoi impossible (réseau).", true);
    }
    setChatBusy(false);
  };

  const statusTxt = useMemo(() => {
    if (data.pct >= 100) return "Collecte complète";
    if (data.opened) return "Collecte en cours";
    return "Collecte ouverte";
  }, [data.pct, data.opened]);

  return (
    <>
      {/* HERO ci-fiche */}
      <div className="ci-fiche-header">
        <div className="ci-fiche-left">
          <div className="ci-fiche-eyebrow">Étape 03 · Collecte de documents</div>
          <h1 className="ci-fiche-title">{data.title}</h1>
          <div className="ci-fiche-detect">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
            </svg>
            {data.themeCount} rubrique{data.themeCount > 1 ? "s" : ""} ouverte
            {data.themeCount > 1 ? "s" : ""} automatiquement par l&apos;IA selon le DCI
          </div>
        </div>
      </div>

      {/* Barre de suivi */}
      <div className="ci-suivi-bar">
        <div className="ci-suivi-ring" style={{ "--pct": data.pct } as React.CSSProperties}>
          <span>
            {data.pct}
            <small>%</small>
          </span>
        </div>
        <div className="ci-suivi-txt">
          <span className="ci-suivi-status">{statusTxt}</span>
          <span className="ci-suivi-sep">·</span>
          <span className="ci-suivi-count">
            {data.received} document{data.received > 1 ? "s" : ""} reçu
            {data.received > 1 ? "s" : ""} sur {data.total}
          </span>
        </div>
        <div className="ci-suivi-acts">
          <Link href={`/espace-ingenieur/collectes/${dossierId}/modifier`} className="btn btn-gold btn-sm">
            Modifier la rubrique
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={() => relance()} type="button">
            Relancer le client
          </button>
        </div>
      </div>

      {/* Cohérence IA */}
      <div className="ci-coh-section">
        <div className="ci-coh-head">
          <span className="ci-coh-head-icon">
            <IcoTriangle />
          </span>
          <div>
            <div className="ci-coh-head-title">
              Contrôle de cohérence IA
              {coherence !== null
                ? ` · ${coherence.length} point(s) à clarifier`
                : ""}
            </div>
            <div className="ci-coh-head-sub">
              L&apos;IA croise l&apos;entretien initial, le document de collecte et les pièces
              déposées. La loupe ouvre le document concerné ; « Valider » archive le point
              (réversible).
            </div>
          </div>
          <button className="ci-coh-run" onClick={runCoherence} disabled={cohBusy} type="button">
            {cohBusy ? "Analyse…" : coherence === null ? "Lancer le contrôle" : "Relancer"}
          </button>
        </div>

        {coherence !== null && coherence.length === 0 ? (
          <div className="ci-coh-empty">
            Aucune incohérence détectée entre l&apos;entretien, le DCI et les pièces déposées.
          </div>
        ) : null}

        {(coherence ?? []).map((inc, i) => {
          const resolved = cohResolved.has(i);
          return (
            <div key={i} className={`ci-coh-card${resolved ? " resolved" : ""}`}>
              <div className="ci-coh-icon">
                <IcoTriangle />
              </div>
              <div className="ci-coh-body">
                <div className="ci-coh-title">{inc.champ}</div>
                {inc.sources.length > 0 ? (
                  <div className="ci-coh-cross">{inc.sources.join(" ↔ ")}</div>
                ) : null}
                <div className="ci-coh-msg">{inc.constat}</div>
                <div className="ci-coh-resolved-tag">
                  Validé · à l&apos;instant ·
                  <button
                    className="ci-coh-undo"
                    type="button"
                    onClick={() =>
                      setCohResolved((prev) => {
                        const next = new Set(prev);
                        next.delete(i);
                        return next;
                      })
                    }
                  >
                    Annuler
                  </button>
                </div>
              </div>
              <div className="ci-coh-actions">
                <button
                  className="ci-actx ax-view"
                  title="Voir les pièces concernées"
                  type="button"
                  onClick={() => {
                    document.getElementById("maq-themes")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <IcoSearch />
                </button>
                <button
                  className="ci-actx ax-ok"
                  title="Valider"
                  type="button"
                  onClick={() => setCohResolved((prev) => new Set(prev).add(i))}
                >
                  <IcoCheck />
                </button>
                <button
                  className="ci-actx ax-no"
                  title="Signaler non résolu"
                  type="button"
                  onClick={() =>
                    setCohResolved((prev) => {
                      const next = new Set(prev);
                      next.delete(i);
                      return next;
                    })
                  }
                >
                  <IcoX />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="ci-toolbar">
        <div className="ci-toolbar-filters">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? data.counts.all
                : f.key === "depose"
                  ? data.counts.depose
                  : f.key === "attval"
                    ? data.counts.attval
                    : f.key === "alerte"
                      ? data.counts.alerte
                      : f.key === "manquant"
                        ? data.counts.manquant
                        : data.counts.comment;
            return (
              <button
                key={f.key}
                type="button"
                className={`ci-tf${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span>{count}</span>
              </button>
            );
          })}
        </div>
        <button className="ci-toolbar-collapse" type="button" onClick={toggleAll}>
          Tout replier / déplier
        </button>
      </div>

      {/* Thèmes */}
      <div className="ci-themes" id="maq-themes">
        {data.themes.map((theme, ti) => {
          const isCollapsed = collapsed.has(ti);
          return (
            <div key={ti} className={`ci-theme${isCollapsed ? " collapsed" : ""}`}>
              <div className="ci-theme-head" onClick={() => toggleTheme(ti)}>
                <span className="ci-theme-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 9 L 13 9 L 15.5 12 L 22 12 L 22 20 L 4 20 Z" />
                    <line x1="4" y1="13" x2="22" y2="13" />
                  </svg>
                </span>
                <div className="ci-theme-titlezone">
                  <div className="ci-theme-title">{theme.title}</div>
                  <div className="ci-theme-sub">
                    {theme.subCount} sous-rubrique{theme.subCount > 1 ? "s" : ""} · {theme.total}{" "}
                    élément{theme.total > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="ci-theme-meta">
                  {theme.manquant > 0 ? (
                    <>
                      <span className="ci-tm-manq">{theme.manquant} à fournir</span>
                      <span className="ci-tm-sep">·</span>
                    </>
                  ) : null}
                  {theme.alertes > 0 ? (
                    <>
                      <span className="ci-tm-alert">
                        {theme.alertes} incohérence{theme.alertes > 1 ? "s" : ""}
                      </span>
                      <span className="ci-tm-sep">·</span>
                    </>
                  ) : null}
                  <span className="ci-tm-pct">{theme.pct} %</span>
                  <span className="ci-tm-sep">·</span>
                  <span>
                    {theme.received} sur {theme.total} reçus
                  </span>
                </div>
                <span className="ci-theme-caret">▾</span>
              </div>
              <div className="ci-theme-body">
                {theme.sous.map((sous, si) => {
                  const visiblePieces = sous.pieces.filter(pieceVisible);
                  if (visiblePieces.length === 0) return null;
                  return (
                    <div className="ci-sous" key={si}>
                      <div className="ci-sous-head">
                        <span className="ci-sous-title">{sous.title}</span>
                        <span className="ci-sous-count">
                          {sous.received}/{sous.total}
                        </span>
                      </div>
                      <div className="ci-col-header">
                        <div className="ci-statuscol">Statut</div>
                        <div className="ci-namecol">Document / Information</div>
                        <div className="ci-actioncol">Actions</div>
                      </div>
                      <div className="ci-sous-items">
                        {visiblePieces.map((p) => (
                          <PieceRow
                            key={p.itemIndex}
                            piece={p}
                            busy={busyIndex === p.itemIndex}
                            onView={() => setPreview({ index: p.itemIndex, label: p.label })}
                            onValidate={() => setVerdict(p.itemIndex, "valide")}
                            onRefuse={() => setVerdict(p.itemIndex, "refuse")}
                            onReset={() => setVerdict(p.itemIndex, null)}
                            onReanalyse={() => reanalyse(p.itemIndex)}
                            onRelance={() => relance([p.itemIndex])}
                            onChat={() => openChat(p.itemIndex, p.label)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer passage étape */}
      <div className="ci-footer">
        <div>
          <div className="ci-footer-title">
            Passage à l&apos;étape 04 · Réalisation de l&apos;étude patrimoniale
          </div>
          <div className="ci-footer-sub">
            L&apos;ingénieur décide du passage à l&apos;étude. Les{" "}
            <strong>{data.counts.alerte} incohérence{data.counts.alerte > 1 ? "s" : ""}</strong> et
            les <strong>{data.counts.manquant} élément{data.counts.manquant > 1 ? "s" : ""} manquant
            {data.counts.manquant > 1 ? "s" : ""}</strong> sont signalés à titre indicatif.
          </div>
        </div>
        <div className="ci-footer-actions">
          <Link href="/espace-ingenieur/etudes" className="btn btn-gold">
            Passer à l&apos;étape suivante
          </Link>
        </div>
      </div>

      {/* Modale aperçu */}
      {preview ? (
        <div className="prep-overlay open" onClick={() => setPreview(null)}>
          <div className="prep-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prep-head">
              <div>
                <div className="prep-eyebrow">Pièce déposée</div>
                <h3 className="prep-title">{preview.label}</h3>
              </div>
              <button className="prep-close" type="button" onClick={() => setPreview(null)}>
                ✕
              </button>
            </div>
            <div className="prep-body">
              <iframe className="prep-viewer" src={fileUrl(preview.index)} title={preview.label} />
            </div>
            <div className="prep-footer">
              <a className="btn btn-ghost btn-sm" href={fileUrl(preview.index)} target="_blank" rel="noreferrer">
                Ouvrir dans un nouvel onglet
              </a>
              <a className="btn btn-gold btn-sm" href={fileUrl(preview.index)} download>
                Télécharger
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Drawer messagerie */}
      {chat ? (
        <div className="chat-overlay open" onClick={() => setChat(null)}>
          <div className="chat-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="chat-head">
              <div>
                <div className="chat-eyebrow">Conversation · pièce</div>
                <div className="chat-doc-name">{chat.label}</div>
              </div>
              <button className="chat-close" type="button" onClick={() => setChat(null)}>
                ✕
              </button>
            </div>
            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <p>Aucun échange</p>
                  <span>Demandez une précision au client sur cette pièce.</span>
                </div>
              ) : (
                messages.map((m) => {
                  const ing = m.author === "conseiller";
                  return (
                    <div key={m.id} className={`chat-msg ${ing ? "ing" : "cli"}`}>
                      <div className="chat-bubble">{m.body}</div>
                      <div className="chat-meta">
                        {ing ? "Vous" : "Client"} ·{" "}
                        {new Date(m.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="chat-input">
              <textarea
                value={chatBody}
                onChange={(e) => setChatBody(e.target.value)}
                placeholder="Écrire un message au client…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button className="chat-send" type="button" onClick={() => void sendMessage()} disabled={chatBusy}>
                Envoyer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className={`ci-toast${toast.err ? " err" : ""}`}>{toast.text}</div> : null}
    </>
  );
}

/** Une ligne document : statut · libellé (+ verdict IA) · actions selon l'état. */
function PieceRow({
  piece,
  busy,
  onView,
  onValidate,
  onRefuse,
  onReset,
  onReanalyse,
  onRelance,
  onChat,
}: {
  piece: PieceVM;
  busy: boolean;
  onView: () => void;
  onValidate: () => void;
  onRefuse: () => void;
  onReset: () => void;
  onReanalyse: () => void;
  onRelance: () => void;
  onChat: () => void;
}) {
  const s = piece.status;
  const slClass =
    s === "depose"
      ? "sl-depose"
      : s === "attval"
        ? "sl-attval"
        : s === "alerte"
          ? "sl-alerte"
          : s === "refuse"
            ? "sl-refuse"
            : "sl-manquant";

  const isFileDoc = piece.hasDepot && Boolean(piece.fileName);
  const showReanalyse = isFileDoc;

  return (
    <div className={`ci-item ci-st-${s}`}>
      <div className="ci-item-row">
        <div className="ci-statuscol">
          <span className={`ci-status ${slClass}`}>
            <StatusIcon status={s} />
            <span className="ci-status-txt">{piece.statusLabel}</span>
          </span>
        </div>
        <div className="ci-namecol">
          <span className="ci-item-label">{piece.label}</span>
          {piece.declaratif ? (
            <span className="ci-decl-tag" title="Information déclarative · aucun justificatif requis">
              Sans justificatif
            </span>
          ) : null}
          {piece.commentCount > 0 ? (
            <button className="ci-comment-chip" type="button" onClick={onChat} title="Voir la conversation">
              <IcoMsg />
              <span>
                {piece.commentCount} échange{piece.commentCount > 1 ? "s" : ""}
              </span>
            </button>
          ) : null}
        </div>
        <div className="ci-actioncol">
          <div className="ci-actions-row">
            {piece.hasDepot ? (
              <button className="ci-actx ax-view" type="button" title="Consulter le document" onClick={onView}>
                <IcoEye />
              </button>
            ) : null}

            {(s === "attval" || s === "alerte") && (
              <>
                <button
                  className="ci-actx ax-ok"
                  type="button"
                  title="Valider"
                  disabled={busy}
                  onClick={onValidate}
                >
                  <IcoCheck />
                </button>
                <button
                  className="ci-actx ax-no"
                  type="button"
                  title="Refuser"
                  disabled={busy}
                  onClick={onRefuse}
                >
                  <IcoX />
                </button>
              </>
            )}

            {(s === "depose" || s === "refuse") && (
              <button
                className="ci-actx ax-edit"
                type="button"
                title="Modifier la décision"
                disabled={busy}
                onClick={onReset}
              >
                <IcoReanalyse />
              </button>
            )}

            {showReanalyse && (
              <button
                className="ci-actx ax-reanalyse"
                type="button"
                title="Relancer l'analyse IA"
                disabled={busy}
                onClick={onReanalyse}
              >
                <IcoReanalyse />
              </button>
            )}

            {s === "manquant" ? (
              <button className="ci-actx ax-relance" type="button" title="Relancer le client" onClick={onRelance}>
                <IcoRelance />
              </button>
            ) : null}

            <button className="ci-actx ax-msg" type="button" title="Demander une précision" onClick={onChat}>
              <IcoMsg />
            </button>
          </div>
        </div>
      </div>

      {/* Verdict IA de la pièce déposée */}
      {piece.status === "alerte" && piece.ia ? (
        <div className="ci-alert-banner">
          <div className="ci-alert-cross">Incohérence détectée par l&apos;IA</div>
          <div className="ci-alert-msg">{piece.ia.resume || piece.ia.detail || "Incohérence relevée."}</div>
        </div>
      ) : isFileDoc && piece.ia ? (
        <div className={`ci-analyse-banner ${iaBannerClass(piece.ia.status)}`}>
          <div className="ci-analyse-verdict">{iaVerdictLabel(piece.ia.status)}</div>
          {piece.ia.resume ? <div className="ci-analyse-msg">{piece.ia.resume}</div> : null}
        </div>
      ) : isFileDoc && !piece.ia ? (
        <div className="ci-analyse-banner is-encours">
          <div className="ci-analyse-verdict">Analyse IA · en cours…</div>
          <div className="ci-analyse-msg">
            L&apos;analyse de fiabilité de cette pièce est en cours. Relancez-la si besoin.
          </div>
        </div>
      ) : piece.declaratif && piece.hasDepot && piece.reponse ? (
        <div className="ci-analyse-banner is-conforme">
          <div className="ci-analyse-verdict">Réponse du client</div>
          <div className="ci-analyse-msg">{piece.reponse}</div>
        </div>
      ) : null}
    </div>
  );
}
