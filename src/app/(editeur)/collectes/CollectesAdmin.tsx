"use client";

// Revue ingénieur des collectes de documents : liste cabinet + détail d'une
// collecte (pièces déposées, statut d'analyse IA, téléchargement, ré-analyse,
// fil de messages). Consomme /api/collecte-admin/*.
import { useCallback, useEffect, useState } from "react";

type ListItem = {
  token: string;
  client_nom: string;
  client_email: string;
  created_at: string;
  email_sent_at: string | null;
  opened_at: string | null;
  total: number;
  done: number;
  messages: number;
  last_client_message_at: string | null;
};

type Verdict = "valide" | "refuse" | "a_revoir";
type StructItem = {
  label: string;
  type?: "Document" | "Question";
  theme?: string;
  sub?: string;
  removed?: boolean;
  // Verdict humain de l'ingénieur (coexiste avec le verdict IA des analyses).
  verdict?: Verdict | null;
  verdict_at?: string;
  verdict_by?: string;
};
type Depot = {
  item_index: number;
  label: string;
  file_name: string | null;
  file_size: number | null;
  reponse: string | null;
  created_at: string;
  storage_path: string | null;
};
type Analyse = {
  item_index: number;
  status: string | null;
  resume: string | null;
  detail: string | null;
  updated_at: string;
};
type Message = {
  id: string;
  item_index: number | null;
  author: string;
  body: string;
  created_at: string;
};
type Gravite = "bloquante" | "majeure" | "mineure";
type Incoherence = {
  champ: string;
  sources: string[];
  constat: string;
  gravite: Gravite;
};
// Statut local de revue d'une incohérence par l'ingénieur (non persisté côté
// serveur : le croisement est rejoué à la demande). On horodate l'action.
type IncoherenceReview = { state: "valide" | "annule"; at: string };
type Detail = {
  client_nom: string;
  client_email: string;
  created_at: string;
  opened_at: string | null;
  structure: StructItem[];
  depots: Depot[];
  messages: Message[];
  analyses: Analyse[];
  progress: { done: number; total: number };
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function analyseBadge(status: string | null): { label: string; bg: string; fg: string } {
  switch (status) {
    case "conforme":
      return { label: "✓ Conforme", bg: "var(--green-bg,#e6f4ec)", fg: "var(--green-text,#1F5A36)" };
    case "illisible":
    case "non_conforme":
      return { label: "⚠ À revoir", bg: "rgba(192,57,43,0.1)", fg: "#C0392B" };
    case "erreur":
      return { label: "Erreur d'analyse", bg: "rgba(192,57,43,0.08)", fg: "#C0392B" };
    case "en_cours":
      return { label: "Analyse…", bg: "var(--gold-100)", fg: "var(--gold-deep)" };
    default:
      return { label: "Non analysé", bg: "var(--navy-100)", fg: "var(--navy-300)" };
  }
}

function graviteBadge(g: Gravite): { label: string; bg: string; fg: string } {
  switch (g) {
    case "bloquante":
      return { label: "Bloquante", bg: "rgba(192,57,43,0.12)", fg: "#C0392B" };
    case "majeure":
      return { label: "Majeure", bg: "var(--gold-100)", fg: "var(--gold-deep)" };
    default:
      return { label: "Mineure", bg: "var(--navy-100)", fg: "var(--navy-300)" };
  }
}

const VERDICT_OPTIONS: { key: Verdict; label: string; bg: string; fg: string }[] = [
  { key: "valide", label: "Validé", bg: "var(--green-bg,#e6f4ec)", fg: "var(--green-text,#1F5A36)" },
  { key: "refuse", label: "Refusé", bg: "rgba(192,57,43,0.1)", fg: "#C0392B" },
  { key: "a_revoir", label: "À revoir", bg: "var(--gold-100)", fg: "var(--gold-deep)" },
];

// Aperçu d'une pièce : on déduit le mode (image / PDF / autre) du nom de fichier.
type PreviewTarget = { url: string; fileName: string };

function previewKind(fileName: string): "image" | "pdf" | "other" {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (["jpg", "jpeg", "png", "heic", "webp", "gif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

export function CollectesAdmin() {
  const [list, setList] = useState<ListItem[] | null>(null);
  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  const [listErr, setListErr] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [addItemErr, setAddItemErr] = useState<string | null>(null);
  const [relanceMsg, setRelanceMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Sélection de pièces à relancer (par item_index). Vide = aucune cochée.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // Contrôle de cohérence croisée (DCI ↔ entretien ↔ pièces).
  const [coherence, setCoherence] = useState<Incoherence[] | null>(null);
  const [coherenceErr, setCoherenceErr] = useState<string | null>(null);
  const [coherenceReviews, setCoherenceReviews] = useState<Record<number, IncoherenceReview>>({});

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/collecte-admin/list", { cache: "no-store" });
      if (!res.ok) {
        setListErr("Lecture impossible. Êtes-vous connecté ?");
        return;
      }
      const json = await res.json();
      setList(json.collectes ?? []);
    } catch {
      setListErr("Erreur réseau.");
    }
  }, []);

  const loadDetail = useCallback(async (token: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      if (res.ok) setDetail(await res.json());
      else setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (activeToken) loadDetail(activeToken);
    else setDetail(null);
    // Réinitialise le formulaire d'ajout de pièce au changement de collecte.
    setShowAddItem(false);
    setNewItemLabel("");
    setAddItemErr(null);
    setRelanceMsg(null);
    setSelected(new Set());
    setCoherence(null);
    setCoherenceErr(null);
    setCoherenceReviews({});
  }, [activeToken, loadDetail]);

  const addItem = async () => {
    if (!activeToken || !newItemLabel.trim()) return;
    setBusy("add-item");
    setAddItemErr(null);
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_item", item: { label: newItemLabel.trim() } }),
      });
      if (res.ok) {
        setNewItemLabel("");
        setShowAddItem(false);
        loadDetail(activeToken);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setAddItemErr(data.error ?? `Erreur HTTP ${res.status}`);
      }
    } catch {
      setAddItemErr("Erreur réseau.");
    } finally {
      setBusy(null);
    }
  };

  const removeItem = async (itemIndex: number) => {
    if (!activeToken) return;
    setBusy(`rm-${itemIndex}`);
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "flag_removed", item_index: itemIndex }),
      });
      if (res.ok) loadDetail(activeToken);
    } finally {
      setBusy(null);
    }
  };

  // Verdict humain par pièce : toggle (re-cliquer le même verdict le retire).
  const setVerdict = async (itemIndex: number, verdict: Verdict) => {
    if (!activeToken) return;
    const current = detail?.structure[itemIndex]?.verdict ?? null;
    const next: Verdict | null = current === verdict ? null : verdict;
    setBusy(`vd-${itemIndex}`);
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_verdict", item_index: itemIndex, verdict: next }),
      });
      if (res.ok) loadDetail(activeToken);
    } finally {
      setBusy(null);
    }
  };

  // Relance par sélection : si des pièces sont cochées, on ne rappelle QUE
  // celles-ci ; sinon (scope === "all") on relance sur toutes les pièces encore
  // demandées (comportement historique).
  const relancer = async (scope: "selected" | "all") => {
    if (!activeToken) return;
    const indexes = scope === "selected" ? [...selected] : null;
    if (scope === "selected" && indexes!.length === 0) return;
    setBusy("relance");
    setRelanceMsg(null);
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}/relance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: indexes ? JSON.stringify({ item_index: indexes }) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; to?: string };
      if (res.ok) {
        const count = indexes ? indexes.length : null;
        setRelanceMsg({
          ok: true,
          text:
            count != null
              ? `Rappel de ${count} pièce(s) envoyé à ${data.to ?? "le client"}.`
              : `Rappel envoyé à ${data.to ?? "le client"}.`,
        });
        if (scope === "selected") setSelected(new Set());
        loadDetail(activeToken);
      } else {
        setRelanceMsg({ ok: false, text: data.error ?? `Erreur HTTP ${res.status}` });
      }
    } catch {
      setRelanceMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setBusy(null);
    }
  };

  const toggleSelected = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const analyseCoherence = async () => {
    if (!activeToken) return;
    setBusy("coherence");
    setCoherenceErr(null);
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}/coherence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        incoherences?: Incoherence[];
      };
      if (res.ok) {
        setCoherence(data.incoherences ?? []);
        setCoherenceReviews({});
      } else {
        setCoherenceErr(data.error ?? `Erreur HTTP ${res.status}`);
      }
    } catch {
      setCoherenceErr("Erreur réseau.");
    } finally {
      setBusy(null);
    }
  };

  const reviewIncoherence = (idx: number, state: "valide" | "annule") => {
    setCoherenceReviews((prev) => {
      const next = { ...prev };
      // Re-cliquer le même état le retire (toggle).
      if (next[idx]?.state === state) delete next[idx];
      else next[idx] = { state, at: new Date().toISOString() };
      return next;
    });
  };

  const reanalyse = async (itemIndex: number) => {
    if (!activeToken) return;
    setBusy(`re-${itemIndex}`);
    try {
      await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}/reanalyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_index: itemIndex }),
      });
      // L'analyse tourne en post-réponse : on rafraîchit après un court délai.
      setTimeout(() => loadDetail(activeToken), 2500);
    } finally {
      setBusy(null);
    }
  };

  const sendReply = async (itemIndex: number | null) => {
    if (!activeToken || !reply.trim()) return;
    setBusy("reply");
    try {
      const res = await fetch(`/api/collecte-admin/${encodeURIComponent(activeToken)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim(), item_index: itemIndex }),
      });
      if (res.ok) {
        setReply("");
        loadDetail(activeToken);
      }
    } finally {
      setBusy(null);
    }
  };

  const depotByIndex = new Map<number, Depot>();
  const analyseByIndex = new Map<number, Analyse>();
  detail?.depots.forEach((d) => depotByIndex.set(d.item_index, d));
  detail?.analyses.forEach((a) => analyseByIndex.set(a.item_index, a));

  return (
    <div style={{ display: "flex", gap: 20, padding: "0 28px 40px", alignItems: "flex-start" }}>
      {/* Colonne liste */}
      <div style={{ width: 360, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", margin: "0 0 12px" }}>
          Collectes {list ? `· ${list.length}` : ""}
        </div>
        {listErr && <div style={{ fontSize: 13, color: "#C0392B" }}>{listErr}</div>}
        {!list && !listErr && (
          <div style={{ fontSize: 13, color: "var(--navy-300)" }}>Chargement…</div>
        )}
        {list?.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--navy-300)" }}>
            Aucune collecte envoyée pour l&apos;instant.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list?.map((c) => {
            const isActive = c.token === activeToken;
            const hasNewMsg =
              c.last_client_message_at !== null &&
              (!c.email_sent_at || c.last_client_message_at > (c.email_sent_at ?? ""));
            return (
              <button
                key={c.token}
                onClick={() => setActiveToken(c.token)}
                style={{
                  textAlign: "left",
                  background: isActive ? "var(--gold-100)" : "#fff",
                  border: `1px solid ${isActive ? "var(--gold-200)" : "var(--ivory-deep,#e7e1d4)"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--navy)" }}>
                    {c.client_nom || c.client_email || "Client"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--navy-300)" }}>
                    {c.done}/{c.total}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--navy-300)", marginTop: 4 }}>
                  Envoyé {fmtDate(c.email_sent_at)}
                  {c.opened_at ? " · ouvert" : " · non ouvert"}
                </div>
                {hasNewMsg && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold-deep)", marginTop: 4 }}>
                    ● nouveau message client
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colonne détail */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: "#fff",
          border: "1px solid var(--ivory-deep,#e7e1d4)",
          borderRadius: 12,
          padding: 24,
          minHeight: 400,
        }}
      >
        {!activeToken && (
          <div style={{ color: "var(--navy-300)", fontSize: 14, padding: "60px 0", textAlign: "center" }}>
            Sélectionnez une collecte pour voir les pièces déposées.
          </div>
        )}
        {activeToken && detailLoading && !detail && (
          <div style={{ color: "var(--navy-300)", fontSize: 14 }}>Chargement…</div>
        )}
        {detail && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
                  {detail.client_nom || detail.client_email}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--navy-300)", marginTop: 2 }}>
                  {detail.client_email} · créée {fmtDate(detail.created_at)}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                  {detail.progress.done}/{detail.progress.total} pièces
                </div>
                <button
                  onClick={() => relancer("all")}
                  disabled={busy === "relance" || !detail.client_email}
                  title={
                    detail.client_email
                      ? "Renvoyer un e-mail de rappel pour toutes les pièces encore demandées"
                      : "Aucune adresse e-mail sur cette collecte"
                  }
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    color: detail.client_email ? "var(--navy)" : "var(--navy-300)",
                    background: "var(--gold-100)",
                    border: "1px solid var(--gold-200)",
                    borderRadius: 8,
                    padding: "7px 14px",
                    cursor: detail.client_email && busy !== "relance" ? "pointer" : "default",
                    opacity: detail.client_email && busy !== "relance" ? 1 : 0.6,
                  }}
                >
                  {busy === "relance" ? "Envoi…" : "Relancer (tout)"}
                </button>
              </div>
            </div>
            {relanceMsg && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: relanceMsg.ok ? "var(--green-text,#1F5A36)" : "#C0392B",
                }}
              >
                {relanceMsg.text}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "20px 0" }}>
              {detail.structure.map((item, idx) => {
                const dep = depotByIndex.get(idx);
                const ana = analyseByIndex.get(idx);
                const badge = analyseBadge(ana?.status ?? null);
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--navy-100)",
                      borderRadius: 9,
                      padding: "12px 14px",
                      opacity: item.removed ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        {/* Case de relance : pour les pièces encore demandées et
                            non déposées (en attente du client). */}
                        {!item.removed && !dep && (
                          <input
                            type="checkbox"
                            checked={selected.has(idx)}
                            onChange={() => toggleSelected(idx)}
                            title="Inclure cette pièce dans la relance"
                            style={{ marginTop: 2, cursor: "pointer", accentColor: "var(--gold)" }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--navy)",
                            textDecoration: item.removed ? "line-through" : "none",
                          }}
                        >
                          {item.label}
                          {item.removed && (
                            <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 700, color: "var(--navy-300)" }}>
                              (retirée)
                            </span>
                          )}
                        </div>
                        {(item.theme || item.sub) && (
                          <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 2 }}>
                            {[item.theme, item.sub].filter(Boolean).join(" · ")}
                          </div>
                        )}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 999,
                            background: badge.bg,
                            color: badge.fg,
                            height: "fit-content",
                          }}
                        >
                          {badge.label}
                        </span>
                        {!item.removed && (
                          <button
                            onClick={() => removeItem(idx)}
                            disabled={busy === `rm-${idx}`}
                            title="Retirer cette pièce de la demande"
                            style={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              color: "var(--navy-300)",
                              background: "transparent",
                              border: "1px solid var(--navy-100)",
                              borderRadius: 6,
                              padding: "3px 8px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {busy === `rm-${idx}` ? "…" : "Retirer"}
                          </button>
                        )}
                      </div>
                    </div>

                    {dep ? (
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {dep.file_name ? (
                          <>
                            <button
                              onClick={() =>
                                setPreview({
                                  url: `/api/collecte-admin/${encodeURIComponent(activeToken!)}/file?item_index=${idx}`,
                                  fileName: dep.file_name!,
                                })
                              }
                              title="Prévisualiser la pièce"
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--navy)",
                                background: "transparent",
                                textDecoration: "none",
                                border: "1px solid var(--navy-100)",
                                borderRadius: 7,
                                padding: "5px 10px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              👁 Aperçu
                            </button>
                            <a
                              href={`/api/collecte-admin/${encodeURIComponent(activeToken!)}/file?item_index=${idx}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--gold-deep)",
                                textDecoration: "none",
                                border: "1px solid var(--gold-200)",
                                borderRadius: 7,
                                padding: "5px 10px",
                              }}
                            >
                              ⬇ {dep.file_name}
                            </a>
                          </>
                        ) : (
                          <span style={{ fontSize: 12.5, color: "var(--navy)" }}>
                            Réponse : {dep.reponse || "—"}
                          </span>
                        )}
                        {dep.file_name && (
                          <button
                            onClick={() => reanalyse(idx)}
                            disabled={busy === `re-${idx}`}
                            style={{
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: "var(--navy-300)",
                              background: "transparent",
                              border: "1px solid var(--navy-100)",
                              borderRadius: 7,
                              padding: "5px 10px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {busy === `re-${idx}` ? "…" : "Relancer l'analyse"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--navy-300)" }}>
                        En attente du client
                      </div>
                    )}
                    {ana?.resume && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--navy)", lineHeight: 1.5 }}>
                        {ana.resume}
                      </div>
                    )}

                    {/* Verdict humain de l'ingénieur (coexiste avec le verdict IA). */}
                    {!item.removed && (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--navy-300)" }}>
                          Verdict ingénieur :
                        </span>
                        {VERDICT_OPTIONS.map((v) => {
                          const selected = item.verdict === v.key;
                          return (
                            <button
                              key={v.key}
                              onClick={() => setVerdict(idx, v.key)}
                              disabled={busy === `vd-${idx}`}
                              title={v.label}
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "4px 10px",
                                borderRadius: 999,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                border: `1px solid ${selected ? v.fg : "var(--navy-100)"}`,
                                background: selected ? v.bg : "transparent",
                                color: selected ? v.fg : "var(--navy-300)",
                                opacity: busy === `vd-${idx}` ? 0.6 : 1,
                              }}
                            >
                              {v.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Relance par sélection : ne rappelle au client QUE les pièces cochées. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "0 0 20px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => relancer("selected")}
                disabled={busy === "relance" || selected.size === 0 || !detail.client_email}
                title={
                  !detail.client_email
                    ? "Aucune adresse e-mail sur cette collecte"
                    : selected.size === 0
                      ? "Cochez au moins une pièce en attente"
                      : "Envoyer un rappel ciblé sur les pièces cochées"
                }
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  color: "#fff",
                  background: "var(--gold)",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 16px",
                  cursor:
                    selected.size > 0 && detail.client_email && busy !== "relance"
                      ? "pointer"
                      : "default",
                  opacity:
                    selected.size > 0 && detail.client_email && busy !== "relance" ? 1 : 0.5,
                }}
              >
                {busy === "relance"
                  ? "Envoi…"
                  : `Relancer les pièces cochées${selected.size ? ` (${selected.size})` : ""}`}
              </button>
              {selected.size > 0 && (
                <button
                  onClick={() => setSelected(new Set())}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    color: "var(--navy-300)",
                    background: "transparent",
                    border: "1px solid var(--navy-100)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Décocher tout
                </button>
              )}
            </div>

            {/* Contrôle de cohérence croisée : DCI ↔ entretien ↔ pièces déposées. */}
            <div
              style={{
                border: "1px solid var(--navy-100)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 20,
                background: "var(--ivory,#faf7f0)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                    Contrôle de cohérence
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--navy-300)", marginTop: 2 }}>
                    Croise le DCI déclaré, l&apos;entretien et les pièces déposées.
                  </div>
                </div>
                <button
                  onClick={analyseCoherence}
                  disabled={busy === "coherence"}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    color: "var(--navy)",
                    background: "var(--gold-100)",
                    border: "1px solid var(--gold-200)",
                    borderRadius: 8,
                    padding: "8px 14px",
                    cursor: busy === "coherence" ? "default" : "pointer",
                    opacity: busy === "coherence" ? 0.6 : 1,
                  }}
                >
                  {busy === "coherence" ? "Analyse…" : "Analyser la cohérence"}
                </button>
              </div>

              {coherenceErr && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: "#C0392B" }}>{coherenceErr}</div>
              )}

              {coherence !== null && coherence.length === 0 && !coherenceErr && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--green-text,#1F5A36)",
                  }}
                >
                  ✓ Aucune incohérence détectée entre les sources.
                </div>
              )}

              {coherence !== null && coherence.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {coherence.map((inc, i) => {
                    const review = coherenceReviews[i];
                    const gb = graviteBadge(inc.gravite);
                    return (
                      <div
                        key={i}
                        style={{
                          border: "1px solid var(--navy-100)",
                          borderRadius: 9,
                          padding: "12px 14px",
                          background: "#fff",
                          opacity: review?.state === "annule" ? 0.55 : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "var(--navy)",
                              textDecoration: review?.state === "annule" ? "line-through" : "none",
                            }}
                          >
                            {inc.champ}
                          </span>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 999,
                              background: gb.bg,
                              color: gb.fg,
                              flexShrink: 0,
                            }}
                          >
                            {gb.label}
                          </span>
                        </div>
                        {inc.constat && (
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "var(--navy)",
                              lineHeight: 1.5,
                              marginTop: 6,
                            }}
                          >
                            {inc.constat}
                          </div>
                        )}
                        {inc.sources.length > 0 && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--navy-300)",
                              marginTop: 6,
                            }}
                          >
                            Sources : {inc.sources.join(" · ")}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {(["valide", "annule"] as const).map((st) => {
                            const on = review?.state === st;
                            const isValide = st === "valide";
                            return (
                              <button
                                key={st}
                                onClick={() => reviewIncoherence(i, st)}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "4px 11px",
                                  borderRadius: 999,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  border: `1px solid ${
                                    on
                                      ? isValide
                                        ? "var(--green-text,#1F5A36)"
                                        : "#C0392B"
                                      : "var(--navy-100)"
                                  }`,
                                  background: on
                                    ? isValide
                                      ? "var(--green-bg,#e6f4ec)"
                                      : "rgba(192,57,43,0.1)"
                                    : "transparent",
                                  color: on
                                    ? isValide
                                      ? "var(--green-text,#1F5A36)"
                                      : "#C0392B"
                                    : "var(--navy-300)",
                                }}
                              >
                                {isValide ? "Valider" : "Annuler"}
                              </button>
                            );
                          })}
                          {review && (
                            <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>
                              {review.state === "valide" ? "Validée" : "Annulée"} ·{" "}
                              {fmtDate(review.at)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collecte adaptative : demander une pièce complémentaire après l'envoi */}
            <div style={{ marginBottom: 20 }}>
              {!showAddItem ? (
                <button
                  onClick={() => {
                    setShowAddItem(true);
                    setAddItemErr(null);
                  }}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--gold-deep)",
                    background: "transparent",
                    border: "1px dashed var(--gold-200)",
                    borderRadius: 8,
                    padding: "9px 14px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Demander une pièce complémentaire
                </button>
              ) : (
                <div
                  style={{
                    border: "1px solid var(--gold-200)",
                    borderRadius: 9,
                    padding: 14,
                    background: "var(--gold-100)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
                    Nouvelle pièce à demander
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addItem()}
                      placeholder="Libellé de la pièce (ex. Dernier avis d'imposition)"
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        border: "1px solid var(--navy-100)",
                        borderRadius: 8,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={addItem}
                      disabled={busy === "add-item" || !newItemLabel.trim()}
                      style={{
                        padding: "10px 18px",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        color: "#fff",
                        background: "var(--gold)",
                        border: "none",
                        borderRadius: 8,
                        cursor: newItemLabel.trim() ? "pointer" : "default",
                        opacity: newItemLabel.trim() && busy !== "add-item" ? 1 : 0.6,
                      }}
                    >
                      {busy === "add-item" ? "…" : "Ajouter"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddItem(false);
                        setNewItemLabel("");
                        setAddItemErr(null);
                      }}
                      style={{
                        padding: "10px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        color: "var(--navy-300)",
                        background: "transparent",
                        border: "1px solid var(--navy-100)",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                  {addItemErr && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#C0392B" }}>{addItemErr}</div>
                  )}
                </div>
              )}
            </div>

            {/* Fil de messages */}
            <div style={{ borderTop: "1px solid var(--navy-100)", paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>
                Conversation
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {detail.messages.length === 0 && (
                  <div style={{ fontSize: 12.5, color: "var(--navy-300)" }}>Aucun message.</div>
                )}
                {detail.messages.map((m) => {
                  const mine = m.author !== "client";
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "75%",
                        background: mine ? "var(--navy)" : "var(--ivory)",
                        color: mine ? "#fff" : "var(--navy)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12.5,
                        lineHeight: 1.45,
                      }}
                    >
                      {m.body}
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 3 }}>
                        {mine ? "Vous" : "Client"} · {fmtDate(m.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply(null)}
                  placeholder="Répondre au client…"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    border: "1px solid var(--navy-100)",
                    borderRadius: 8,
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => sendReply(null)}
                  disabled={busy === "reply" || !reply.trim()}
                  style={{
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    color: "#fff",
                    background: "var(--gold)",
                    border: "none",
                    borderRadius: 8,
                    cursor: reply.trim() ? "pointer" : "default",
                    opacity: reply.trim() ? 1 : 0.6,
                  }}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {preview && <PreviewModal target={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

// Modale d'aperçu : image dans une balise <img>, PDF dans un <iframe>,
// repli téléchargement pour les autres formats. La route /file redirige vers
// une URL signée, exploitable directement comme src.
function PreviewModal({
  target,
  onClose,
}: {
  target: PreviewTarget;
  onClose: () => void;
}) {
  const kind = previewKind(target.fileName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(11,28,53,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "min(900px, 100%)",
          height: "min(85vh, 100%)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(11,28,53,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            borderBottom: "1px solid var(--navy-100)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--navy)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {target.fileName}
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer l'aperçu"
            style={{
              border: "none",
              background: "var(--navy-100)",
              color: "var(--navy)",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, background: "var(--ivory)" }}>
          {kind === "image" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                overflow: "auto",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={target.url}
                alt={target.fileName}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          )}
          {kind === "pdf" && (
            <iframe
              src={target.url}
              title={target.fileName}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
          {kind === "other" && (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 24,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--navy-300)" }}>
                Aperçu indisponible pour ce format.
              </span>
              <a
                href={target.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--gold-deep)",
                  border: "1px solid var(--gold-200)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  textDecoration: "none",
                }}
              >
                ⬇ Télécharger {target.fileName}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
