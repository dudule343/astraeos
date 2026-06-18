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

type StructItem = { label: string; type?: "Document" | "Question"; theme?: string; sub?: string };
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

export function CollectesAdmin() {
  const [list, setList] = useState<ListItem[] | null>(null);
  const [listErr, setListErr] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

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
  }, [activeToken, loadDetail]);

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
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                {detail.progress.done}/{detail.progress.total} pièces
              </div>
            </div>

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
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
                          {item.label}
                        </div>
                        {(item.theme || item.sub) && (
                          <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 2 }}>
                            {[item.theme, item.sub].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
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
                    </div>

                    {dep ? (
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {dep.file_name ? (
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
                  </div>
                );
              })}
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
    </div>
  );
}
