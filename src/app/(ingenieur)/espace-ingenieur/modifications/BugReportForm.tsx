"use client";

// Formulaire de signalement (bug ou amélioration de l'espace ingénieur).
// Deux modes :
//   - création (initial = null) : formulaire ouvert, brouillon auto-sauvegardé,
//     page_url pré-remplie avec l'URL courante.
//   - édition (initial = un signalement) : pré-rempli, sans brouillon, boutons
//     Enregistrer / Annuler.
// Pas de login individuel ici, l'auteur se choisit dans TESTERS.

import { useEffect, useRef, useState } from "react";

import { AttachmentsField } from "./AttachmentsField";
import { ScreenshotDropzone } from "./ScreenshotDropzone";
import {
  createBugReport,
  updateBugReport,
  uploadBugAttachment,
  type BugReport,
  type NewBugReport,
} from "@/lib/bug-reports-actions";

// Personnes habilitées à signaler. À compléter au besoin.
const TESTERS = ["Luc THILLIEZ", "Marvin MOUTON", "Bertrand ALEXANDRE"];

// Sections / modules de l'espace ingénieur, pour regrouper les signalements.
const SECTIONS = [
  "Tableau de bord",
  "Prospects",
  "Conformité",
  "Collectes",
  "Études",
  "Études restituées",
  "Clients",
  "Clients · Suivi",
  "Dossiers",
  "Assets",
  "Agenda",
  "Référentiel",
  "Simulateurs",
  "Partenaires",
  "Marketplace",
  "Profil",
  "Intégrations",
];

const DRAFT_KEY = "astraeos_signalement_draft";

type FormState = {
  type: "bug" | "amelioration";
  title: string;
  reporter: string;
  section: string;
  page_url: string;
  problem: string;
  expected: string;
  intention: string;
  annoyance: string;
};

const EMPTY: FormState = {
  type: "bug",
  title: "",
  reporter: "",
  section: "",
  page_url: "",
  problem: "",
  expected: "",
  intention: "",
  annoyance: "",
};

const fromReport = (r: BugReport): FormState => ({
  type: r.type || "bug",
  title: r.title || "",
  reporter: r.reporter || "",
  section: r.section || "",
  page_url: r.page_url || "",
  problem: r.problem || "",
  expected: r.expected || "",
  intention: r.intention || "",
  annoyance: r.annoyance || "",
});

export function BugReportForm({
  onCreated,
  initial = null,
  onSaved,
  onCancel,
  notify,
}: {
  onCreated?: (row: BugReport) => void;
  initial?: BugReport | null;
  onSaved?: (row: BugReport) => void;
  onCancel?: () => void;
  notify?: (message: string, kind?: "ok" | "err") => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<FormState>(() => (initial ? fromReport(initial) : EMPTY));
  const [reporterMode, setReporterMode] = useState<"list" | "autre">(() =>
    initial && initial.reporter && !TESTERS.includes(initial.reporter) ? "autre" : "list",
  );
  const [sectionMode, setSectionMode] = useState<"list" | "autre">(() =>
    initial && initial.section && !SECTIONS.includes(initial.section) ? "autre" : "list",
  );
  const [screenshots, setScreenshots] = useState<string[]>(() => initial?.screenshots || []);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);

  // Restaure le brouillon au montage (création uniquement), sinon pré-remplit
  // page_url avec l'URL courante du dashboard. Lecture client-only (localStorage
  // / window) impossible à faire dans l'initialiseur sans casser l'hydratation,
  // donc setState dans l'effet est volontaire ici.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isEdit) {
      hydrated.current = true;
      return;
    }
    let restored = false;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.form) {
          setForm((f) => ({ ...f, ...d.form }));
          restored = true;
        }
        if (Array.isArray(d.screenshots)) setScreenshots(d.screenshots);
        if (d.reporterMode) setReporterMode(d.reporterMode);
      }
    } catch {
      /* brouillon illisible : on ignore */
    }
    if (!restored && typeof window !== "undefined") {
      const here = window.location.pathname + window.location.search;
      setForm((f) => ({ ...f, page_url: f.page_url || here }));
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sauvegarde du brouillon à chaque changement (création uniquement).
  useEffect(() => {
    if (isEdit || !hydrated.current) return;
    const isEmpty =
      screenshots.length === 0 &&
      Object.entries(form).every(([k, v]) =>
        k === "type" ? v === "bug" : k === "page_url" ? false : !v,
      ) &&
      !form.title &&
      !form.problem;
    try {
      if (isEmpty) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, screenshots, reporterMode }));
    } catch {
      /* quota plein / mode privé : pas bloquant */
    }
  }, [form, screenshots, reporterMode, isEdit]);

  const set =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onReporterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__autre__") {
      setReporterMode("autre");
      setForm((f) => ({ ...f, reporter: "" }));
    } else {
      setReporterMode("list");
      setForm((f) => ({ ...f, reporter: v }));
    }
  };

  const onSectionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__autre__") {
      setSectionMode("autre");
      setForm((f) => ({ ...f, section: "" }));
    } else {
      setSectionMode("list");
      setForm((f) => ({ ...f, section: v }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notify?.("Le titre est obligatoire.", "err");
      return;
    }
    setSaving(true);
    const payload: NewBugReport = {
      ...form,
      screenshots: screenshots.filter((s) => s && s.trim()),
    };
    const uploadAttachments = async (reportId: string) => {
      for (const f of attachFiles) {
        const fd = new FormData();
        fd.append("file", f);
        await uploadBugAttachment(reportId, fd);
      }
    };
    try {
      if (isEdit && initial) {
        const row = await updateBugReport(initial.id, payload);
        if (attachFiles.length) await uploadAttachments(initial.id);
        setAttachFiles([]);
        notify?.("Modifications enregistrées");
        onSaved?.(row);
      } else {
        const row = await createBugReport(payload);
        if (attachFiles.length && row?.id) await uploadAttachments(row.id);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        notify?.("Signalement envoyé — merci, c'est bien reçu !");
        setForm(EMPTY);
        setReporterMode("list");
        setScreenshots([]);
        setAttachFiles([]);
        onCreated?.(row);
      }
    } catch (err) {
      notify?.(err instanceof Error ? err.message : "Erreur à l'enregistrement", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="mod-form" onSubmit={submit}>
      <div className="mod-form-types">
        <button
          type="button"
          className={`mod-type-btn${form.type === "bug" ? " active" : ""}`}
          onClick={() => setForm((f) => ({ ...f, type: "bug" }))}
        >
          🐛 Bug
        </button>
        <button
          type="button"
          className={`mod-type-btn${form.type === "amelioration" ? " active" : ""}`}
          onClick={() => setForm((f) => ({ ...f, type: "amelioration" }))}
        >
          ✨ Amélioration
        </button>
      </div>

      <div className="mod-field">
        <span className="mod-field-label">Titre</span>
        <span className="mod-field-hint">
          [Où] + le problème en quelques mots — ex : [Conformité] Le bouton Valider ne fait rien
        </span>
        <input
          className="mod-input"
          value={form.title}
          onChange={set("title")}
          placeholder="[Page] Ce qui ne va pas en quelques mots"
        />
      </div>

      <div className="mod-grid-2">
        <div className="mod-field">
          <span className="mod-field-label">Qui signale ?</span>
          {reporterMode === "autre" ? (
            <input
              className="mod-input"
              value={form.reporter}
              onChange={set("reporter")}
              placeholder="Ton prénom"
              autoFocus
            />
          ) : (
            <select className="mod-select" value={form.reporter} onChange={onReporterSelect}>
              <option value="">— Choisir —</option>
              {TESTERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="__autre__">Autre…</option>
            </select>
          )}
        </div>
        <div className="mod-field">
          <span className="mod-field-label">Section / module</span>
          <span className="mod-field-hint">Pour regrouper et suivre l&apos;avancement</span>
          {sectionMode === "autre" ? (
            <input
              className="mod-input"
              value={form.section}
              onChange={set("section")}
              placeholder="Nom de la section"
              autoFocus
            />
          ) : (
            <select className="mod-select" value={form.section} onChange={onSectionSelect}>
              <option value="">— Choisir —</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__autre__">Autre…</option>
            </select>
          )}
        </div>
      </div>

      <div className="mod-field">
        <span className="mod-field-label">Page concernée</span>
        <span className="mod-field-hint">L&apos;adresse ou le nom de la page (pré-remplie)</span>
        <input
          className="mod-input"
          value={form.page_url}
          onChange={set("page_url")}
          placeholder="ex : /espace-ingenieur/conformite"
        />
      </div>

      <div className="mod-field">
        <span className="mod-field-label">🐛 Le problème ou la demande</span>
        <span className="mod-field-hint">
          Qu&apos;est-ce qui ne marche pas, ou qu&apos;est-ce que tu veux changer ?
        </span>
        <textarea className="mod-textarea" value={form.problem} onChange={set("problem")} />
      </div>

      <div className="mod-field">
        <span className="mod-field-label">✅ Ce que ça devrait faire</span>
        <span className="mod-field-hint">Le résultat attendu, concrètement</span>
        <textarea className="mod-textarea" value={form.expected} onChange={set("expected")} />
      </div>

      <div className="mod-field">
        <span className="mod-field-label">🎯 L&apos;intention — le pourquoi</span>
        <span className="mod-field-hint">Ce que tu cherches à obtenir au final</span>
        <textarea className="mod-textarea" value={form.intention} onChange={set("intention")} />
      </div>

      <div className="mod-field">
        <span className="mod-field-label">⚠️ Pourquoi c&apos;est gênant</span>
        <span className="mod-field-hint">En quoi ça te bloque ou ça gêne le client ?</span>
        <input className="mod-input" value={form.annoyance} onChange={set("annoyance")} />
      </div>

      <div className="mod-field">
        <span className="mod-field-label">📸 Captures d&apos;écran</span>
        <ScreenshotDropzone value={screenshots} onChange={setScreenshots} />
      </div>

      <div className="mod-field">
        <span className="mod-field-label">📎 Pièces jointes</span>
        <span className="mod-field-hint">Excel, PDF, Word, PowerPoint, images — avec aperçu</span>
        <AttachmentsField files={attachFiles} onChange={setAttachFiles} />
      </div>

      <div className="mod-form-actions">
        <button type="submit" className="mod-btn-primary" disabled={saving}>
          {saving
            ? "Enregistrement…"
            : isEdit
              ? "Enregistrer les modifications"
              : "Envoyer le signalement"}
        </button>
        {isEdit && (
          <button type="button" className="mod-btn-ghost" onClick={onCancel} disabled={saving}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
