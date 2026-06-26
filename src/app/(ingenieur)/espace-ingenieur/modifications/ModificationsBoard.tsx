"use client";

// Board des signalements « Modifications » de l'espace ingénieur.
// Liste/board groupés par section, cartes avec statut éditable
// (nouveau -> en_cours -> en_revue -> resolu), fils de discussion / itérations,
// pièces jointes et suppression. Le formulaire de création est replié par défaut.
// Toutes les données passent par les server actions de @/lib/bug-reports-actions.

import { useState } from "react";

import { BugReportForm } from "./BugReportForm";
import { ScreenshotDropzone } from "./ScreenshotDropzone";
import {
  addBugFeedback,
  addBugThreadMessage,
  deleteBugReport,
  getBugAttachmentsMap,
  getBugThreadsMap,
  listBugReports,
  removeBugAttachment,
  updateBugReportStatus,
  uploadBugAttachment,
  validateBugReport,
  type BugAttachment,
  type BugReport,
  type ThreadKind,
  type ThreadMessage,
} from "@/lib/bug-reports-actions";

type AttachmentsMap = Record<string, BugAttachment[]>;
type ThreadsMap = Record<string, ThreadMessage[]>;
type Status = BugReport["status"];

const STATUS: Record<Status, { label: string }> = {
  nouveau: { label: "Nouveau" },
  en_cours: { label: "En cours" },
  en_revue: { label: "À valider" },
  resolu: { label: "Résolu" },
};

const TYPE_LABEL: Record<BugReport["type"], string> = {
  bug: "🐛 Bug",
  amelioration: "✨ Amélioration",
};

const KPI_CARDS: { key: Status | null; label: string; cls: string }[] = [
  { key: null, label: "Total", cls: "mod-kpi-total" },
  { key: "nouveau", label: "Nouveau", cls: "mod-kpi-nouveau" },
  { key: "en_cours", label: "En cours", cls: "mod-kpi-en_cours" },
  { key: "en_revue", label: "À valider", cls: "mod-kpi-en_revue" },
  { key: "resolu", label: "Résolu", cls: "mod-kpi-resolu" },
];

// Garde anti-XSS : on n'affiche en href que des URLs http(s).
function isSafeUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === "https:" || p.protocol === "http:";
  } catch {
    return false;
  }
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CardField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="mod-card-field">
      <div className="mod-card-field-label">{label}</div>
      <div className="mod-card-field-value">{value}</div>
    </div>
  );
}

type CardProps = {
  report: BugReport;
  attachments?: BugAttachment[];
  thread?: ThreadMessage[];
  isNew: boolean;
  onStatus: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
  onEdit: (report: BugReport) => void;
  onValidate: (report: BugReport) => void;
  onAttach: (id: string, file: File) => Promise<void>;
  onRemoveAttachment: (id: string, url: string) => void;
  onFeedback: (
    id: string,
    fields: { probleme: string; attendu: string; ou: string; author: string; screenshots: string[] },
  ) => Promise<void>;
  onPrecision: (id: string, body: string, kind: ThreadKind) => Promise<void>;
};

function ReportCard({
  report,
  attachments,
  thread,
  isNew,
  onStatus,
  onDelete,
  onEdit,
  onValidate,
  onAttach,
  onRemoveAttachment,
  onFeedback,
  onPrecision,
}: CardProps) {
  const [attaching, setAttaching] = useState(false);
  const [showFb, setShowFb] = useState(false);
  const [fb, setFb] = useState({ probleme: "", attendu: "", ou: "", author: report.reporter || "" });
  const [fbShots, setFbShots] = useState<string[]>([]);
  const [fbSaving, setFbSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgSaving, setMsgSaving] = useState(false);
  const files = attachments || [];
  const messages = thread || [];

  const submitFeedback = async () => {
    if (!fb.probleme.trim()) return;
    setFbSaving(true);
    try {
      await onFeedback(report.id, { ...fb, screenshots: fbShots });
      setFb({ probleme: "", attendu: "", ou: "", author: fb.author });
      setFbShots([]);
      setShowFb(false);
    } finally {
      setFbSaving(false);
    }
  };

  const submitMsg = async (kind: ThreadKind) => {
    if (!msg.trim()) return;
    setMsgSaving(true);
    try {
      await onPrecision(report.id, msg.trim(), kind);
      setMsg("");
    } finally {
      setMsgSaving(false);
    }
  };

  return (
    <div className={`mod-card${isNew ? " is-new" : ""}`}>
      <div className={`mod-card-accent mod-acc-${report.status}`} />
      <div className="mod-card-top">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="mod-card-tags">
            <span className={`mod-tag mod-tag-${report.type}`}>{TYPE_LABEL[report.type]}</span>
            {report.section && (
              <span className="mod-tag mod-tag-section">📁 {report.section}</span>
            )}
            {report.reporter && <span className="mod-meta">par {report.reporter}</span>}
            <span className="mod-meta">· {fmtDate(report.created_at)}</span>
          </div>
          <div className="mod-card-title">{report.title}</div>
          {report.page_url && <div className="mod-card-url">📍 {report.page_url}</div>}
          {report.status === "en_revue" && (
            <div className="mod-card-note">
              🔧 Corrigé et déployé — vérifie puis clique « Valider »
            </div>
          )}
          {report.status === "resolu" && report.validated_at && (
            <div className="mod-card-validated">
              ✅ Validé{report.validated_by ? ` par ${report.validated_by}` : ""} le{" "}
              {new Date(report.validated_at).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>

        <div className="mod-card-actions">
          {report.status === "en_revue" && (
            <button
              type="button"
              className="mod-validate-btn"
              onClick={() => onValidate(report)}
              title="Valider la correction"
            >
              ✅ Valider
            </button>
          )}
          {report.status === "en_revue" && (
            <button
              type="button"
              className="mod-reprise-btn"
              onClick={() => setShowFb((v) => !v)}
              title="Ce n'est pas conforme — demander une reprise"
            >
              🔄 Reprise
            </button>
          )}
          <select
            className={`mod-status-select mod-st-${report.status}`}
            value={report.status}
            onChange={(e) => onStatus(report.id, e.target.value as Status)}
          >
            {(Object.keys(STATUS) as Status[]).map((k) => (
              <option key={k} value={k}>
                {STATUS[k].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="mod-icon-btn"
            onClick={() => onEdit(report)}
            aria-label="Modifier"
            title="Modifier"
          >
            ✏️
          </button>
          <button
            type="button"
            className="mod-icon-btn"
            onClick={() => onDelete(report.id)}
            aria-label="Supprimer"
            title="Supprimer"
          >
            🗑
          </button>
        </div>
      </div>

      <CardField label="LE PROBLÈME / LA DEMANDE" value={report.problem} />
      <CardField label="CE QUE ÇA DEVRAIT FAIRE" value={report.expected} />
      <CardField label="L'INTENTION" value={report.intention} />
      <CardField label="POURQUOI C'EST GÊNANT" value={report.annoyance} />

      {report.screenshots?.length > 0 && (
        <div className="mod-shots">
          {report.screenshots.filter(isSafeUrl).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" title="Ouvrir la capture">
              <span className="mod-shot" style={{ backgroundImage: `url(${url})` }} />
            </a>
          ))}
        </div>
      )}

      {report.fix_screenshots?.length > 0 && (
        <div className="mod-fix">
          <div className="mod-fix-label">📸 APERÇU DE LA CORRECTION (APRÈS)</div>
          <div className="mod-shots">
            {report.fix_screenshots.filter(isSafeUrl).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" title="Ouvrir l'aperçu">
                <span className="mod-shot-fix" style={{ backgroundImage: `url(${url})` }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Pièces jointes de référence (Excel, PPT, PDF…). */}
      <div className="mod-attach-block">
        <div className="mod-block-label">📎 FICHIERS JOINTS</div>
        {files.length > 0 && (
          <div className="mod-attach-list">
            {files
              .filter((f) => isSafeUrl(f.url))
              .map((f) => (
                <div key={f.url} className="mod-attach-row">
                  <a
                    className="mod-attach-link"
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 {f.name}
                  </a>
                  <button
                    type="button"
                    className="mod-attach-remove"
                    onClick={() => onRemoveAttachment(report.id, f.url)}
                    title="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        )}
        <label
          className="mod-attach-add"
          style={{ cursor: attaching ? "wait" : "pointer" }}
        >
          {attaching ? "Envoi…" : "+ Joindre un fichier (Excel, PPT, PDF…)"}
          <input
            type="file"
            disabled={attaching}
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setAttaching(true);
              try {
                await onAttach(report.id, file);
              } finally {
                setAttaching(false);
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>

      {/* Itérations : feedback cadré (reprise) + discussion. */}
      {(showFb || messages.length > 0 || report.status !== "resolu") && (
        <div className="mod-thread">
          <div className="mod-block-label">💬 ÉCHANGES &amp; ITÉRATIONS</div>

          {messages.length > 0 && (
            <div className="mod-thread-msgs">
              {messages.map((m) => {
                const tag =
                  m.kind === "feedback"
                    ? "🔄 Reprise demandée"
                    : m.kind === "precision_q"
                      ? "❓ Précision demandée"
                      : "💬 Message";
                return (
                  <div key={m.id} className={`mod-msg kind-${m.kind}`}>
                    <div className="mod-msg-head">
                      {tag} · {m.author} · {fmtDate(m.created_at)}
                    </div>
                    <div className="mod-msg-body">{m.body}</div>
                    {m.screenshots && m.screenshots.length > 0 && (
                      <div className="mod-msg-shots">
                        {m.screenshots.filter(isSafeUrl).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir la capture"
                          >
                            <span
                              className="mod-msg-shot"
                              style={{ backgroundImage: `url(${url})` }}
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {showFb && (
            <div className="mod-fb">
              <div className="mod-fb-title">
                Ce n&apos;est pas conforme ? Décris précisément la reprise (pour éviter toute
                mauvaise interprétation)
              </div>
              <textarea
                className="mod-fb-input"
                value={fb.probleme}
                onChange={(e) => setFb({ ...fb, probleme: e.target.value })}
                placeholder="❌ Ce qui ne va pas, concrètement (obligatoire)"
                rows={2}
              />
              <textarea
                className="mod-fb-input"
                value={fb.attendu}
                onChange={(e) => setFb({ ...fb, attendu: e.target.value })}
                placeholder="✅ Le résultat attendu, précis (ex : « le bouton doit ouvrir un volet »)"
                rows={2}
              />
              <input
                className="mod-fb-input"
                value={fb.ou}
                onChange={(e) => setFb({ ...fb, ou: e.target.value })}
                placeholder="📍 Où exactement ? (page / élément / étape)"
              />
              <div className="mod-fb-shots-label">
                📸 Capture de CE QUI NE VA PAS (fortement conseillé)
              </div>
              <ScreenshotDropzone value={fbShots} onChange={setFbShots} />
              <div className="mod-fb-actions">
                <input
                  className="mod-fb-input"
                  style={{ marginBottom: 0, flex: "0 0 140px" }}
                  value={fb.author}
                  onChange={(e) => setFb({ ...fb, author: e.target.value })}
                  placeholder="Ton nom"
                />
                <button
                  type="button"
                  className="mod-fb-submit"
                  onClick={submitFeedback}
                  disabled={fbSaving || !fb.probleme.trim()}
                >
                  {fbSaving ? "Envoi…" : "Renvoyer en reprise"}
                </button>
                <span className="mod-fb-hint">→ la carte repasse « en cours »</span>
              </div>
            </div>
          )}

          <div className="mod-discuss">
            <input
              className="mod-fb-input"
              style={{ marginBottom: 0, flex: 1 }}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitMsg("precision_q");
              }}
              placeholder="Une question / précision sur cette demande ?"
            />
            <button
              type="button"
              className="mod-discuss-send"
              onClick={() => submitMsg("precision_q")}
              disabled={msgSaving || !msg.trim()}
            >
              💬 Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModificationsBoard({
  initialReports,
  initialAttachments,
  initialThreads,
}: {
  initialReports: BugReport[];
  initialAttachments: AttachmentsMap;
  initialThreads: ThreadsMap;
}) {
  const [reports, setReports] = useState<BugReport[]>(initialReports);
  const [attachments, setAttachments] = useState<AttachmentsMap>(initialAttachments);
  const [threads, setThreads] = useState<ThreadsMap>(initialThreads);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BugReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [sectionFilter, setSectionFilter] = useState("");
  const [reporterFilter, setReporterFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "err" } | null>(null);

  const notify = (message: string, kind: "ok" | "err" = "ok") => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 4500);
  };

  const refresh = async () => {
    try {
      const [reps, map, thr] = await Promise.all([
        listBugReports(),
        getBugAttachmentsMap(),
        getBugThreadsMap(),
      ]);
      setReports(reps);
      setAttachments(map || {});
      setThreads(thr || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    }
  };

  const onAttach = async (id: string, file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const list = await uploadBugAttachment(id, fd);
      setAttachments((prev) => ({ ...prev, [id]: list }));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Échec de l'envoi du fichier", "err");
    }
  };

  const onRemoveAttachment = async (id: string, url: string) => {
    try {
      const list = await removeBugAttachment(id, url);
      setAttachments((prev) => ({ ...prev, [id]: list }));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "err");
    }
  };

  const onStatus = async (id: string, status: Status) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateBugReportStatus(id, status);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "err");
      refresh();
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Supprimer ce signalement ?")) return;
    const prev = reports;
    setReports((r) => r.filter((x) => x.id !== id));
    try {
      await deleteBugReport(id);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "err");
      setReports(prev);
    }
  };

  const onCreated = (row: BugReport) => {
    setReports((prev) => [row, ...prev]);
    setNewId(row.id);
    setStatusFilter(null);
    setFormOpen(false);
    window.setTimeout(() => setNewId((v) => (v === row.id ? null : v)), 2500);
  };

  const onSaved = (row: BugReport) => {
    setReports((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setEditing(null);
  };

  const onValidate = async (report: BugReport) => {
    const by = prompt("Validé par ? (ton nom)", "");
    if (by === null) return;
    const at = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id ? { ...r, status: "resolu", validated_by: by || null, validated_at: at } : r,
      ),
    );
    notify("Correction validée ✅");
    try {
      await validateBugReport(report.id, by);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "err");
      refresh();
    }
  };

  const onFeedback = async (
    id: string,
    fields: { probleme: string; attendu: string; ou: string; author: string; screenshots: string[] },
  ) => {
    try {
      const list = await addBugFeedback(id, fields);
      setThreads((prev) => ({ ...prev, [id]: list }));
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "en_cours" } : r)));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "err");
    }
  };

  const onPrecision = async (id: string, body: string, kind: ThreadKind) => {
    try {
      const list = await addBugThreadMessage(id, { body, kind });
      setThreads((prev) => ({ ...prev, [id]: list }));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "err");
    }
  };

  const counts = reports.reduce(
    (a, r) => {
      a.total += 1;
      a[r.status] += 1;
      return a;
    },
    { total: 0, nouveau: 0, en_cours: 0, en_revue: 0, resolu: 0 } as Record<string, number>,
  );

  const sectionsPresent = Array.from(
    new Set(reports.map((r) => r.section || "Sans section")),
  ).sort((a, b) => a.localeCompare(b, "fr"));
  const reportersPresent = Array.from(
    new Set(reports.map((r) => r.reporter).filter((x): x is string => !!x)),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  const visible = reports
    .filter((r) => (statusFilter ? r.status === statusFilter : true))
    .filter((r) => (sectionFilter ? (r.section || "Sans section") === sectionFilter : true))
    .filter((r) => (reporterFilter ? r.reporter === reporterFilter : true));

  const groups: Record<string, BugReport[]> = {};
  visible.forEach((r) => {
    const k = r.section || "Sans section";
    (groups[k] = groups[k] || []).push(r);
  });
  const groupKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <>
      {/* Formulaire de création replié par défaut. */}
      {formOpen ? (
        <div style={{ marginBottom: 24 }}>
          <div className="mod-collapse-row">
            <button
              type="button"
              className="mod-collapse-link"
              onClick={() => setFormOpen(false)}
            >
              ✕ Replier le formulaire
            </button>
          </div>
          <BugReportForm onCreated={onCreated} notify={notify} />
        </div>
      ) : (
        <button type="button" className="mod-open-btn" onClick={() => setFormOpen(true)}>
          ✏️ Signaler un bug ou une amélioration
        </button>
      )}

      {error && (
        <div className="mod-error">
          {error}
          <div style={{ marginTop: 6, fontSize: 11 }}>
            Vérifie que la table <code>bug_reports</code> existe et que la clé service role est
            définie.
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="mod-empty">
          <div className="mod-empty-title">Aucun signalement</div>
          <div style={{ fontSize: 12.5 }}>
            Clique sur « Signaler un bug ou une amélioration » ci-dessus pour remonter le premier.
          </div>
        </div>
      ) : (
        <>
          <div className="mod-kpis">
            {KPI_CARDS.map((s) => {
              const n = s.key ? counts[s.key] : counts.total;
              const active = statusFilter === s.key;
              return (
                <button
                  key={s.label}
                  type="button"
                  className={`mod-kpi ${s.cls}${active ? " active" : ""}`}
                  onClick={() => setStatusFilter(active ? null : s.key)}
                >
                  <div className="mod-kpi-n">{n}</div>
                  <div className="mod-kpi-label">{s.label}</div>
                </button>
              );
            })}
          </div>

          <div className="mod-filters">
            <span className="mod-filter-label">Section :</span>
            <select
              className={`mod-filter-select${sectionFilter ? " active" : ""}`}
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="">Toutes</option>
              {sectionsPresent.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="mod-filter-label">Auteur :</span>
            <select
              className={`mod-filter-select${reporterFilter ? " active" : ""}`}
              value={reporterFilter}
              onChange={(e) => setReporterFilter(e.target.value)}
            >
              <option value="">Tous</option>
              {reportersPresent.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {(statusFilter || sectionFilter || reporterFilter) && (
              <button
                type="button"
                className="mod-filter-clear"
                onClick={() => {
                  setStatusFilter(null);
                  setSectionFilter("");
                  setReporterFilter("");
                }}
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="mod-loading">Aucun signalement pour ce filtre.</div>
          ) : (
            <div className="mod-groups">
              {groupKeys.map((key) => {
                const items = groups[key];
                const done = items.filter((r) => r.status === "resolu").length;
                const finished = items.length > 0 && done === items.length;
                return (
                  <div key={key}>
                    <div className="mod-group-head">
                      <span className="mod-group-title">📁 {key}</span>
                      <span className="mod-group-meta">
                        {done}/{items.length} résolu{items.length > 1 ? "s" : ""}
                      </span>
                      {finished && <span className="mod-group-done">✅ Terminé</span>}
                    </div>
                    <div className="mod-cards">
                      {items.map((r) => (
                        <ReportCard
                          key={r.id}
                          report={r}
                          attachments={attachments[r.id]}
                          thread={threads[r.id]}
                          isNew={newId === r.id}
                          onStatus={onStatus}
                          onDelete={onDelete}
                          onEdit={setEditing}
                          onValidate={onValidate}
                          onAttach={onAttach}
                          onRemoveAttachment={onRemoveAttachment}
                          onFeedback={onFeedback}
                          onPrecision={onPrecision}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="mod-modal-overlay" onClick={() => setEditing(null)}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mod-modal-title">Modifier le signalement</div>
            <BugReportForm
              initial={editing}
              onSaved={onSaved}
              onCancel={() => setEditing(null)}
              notify={notify}
            />
          </div>
        </div>
      )}

      {toast && (
        <div className={`mod-toast${toast.kind === "err" ? " err" : ""}`} role="status">
          {toast.message}
        </div>
      )}
    </>
  );
}
