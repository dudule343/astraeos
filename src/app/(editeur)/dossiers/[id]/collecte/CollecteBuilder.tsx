"use client";

import { useMemo, useState } from "react";

import { buildItems } from "@/lib/collecte-catalog";
import type { CatalogEntry, Facts } from "@/lib/collecte-catalog/types";

import { FACTS_META, FACT_CATEGORY_ORDER, type FactMeta } from "./facts-meta";
import { moveDossierStage } from "../../actions";

/** Total de référence du catalogue (286 pièces du référentiel documentaire). */
const TOTAL_PIECES = 286;

/**
 * Ordre d'affichage des 11 thèmes du référentiel (clés = CatalogEntry.category,
 * source de vérité). Toute catégorie non listée tombe à la fin.
 */
const THEME_ORDER = [
  "Identité et situation familiale",
  "Budget",
  "Fiscalité",
  "Patrimoine professionnel",
  "Immobilier",
  "Actifs financiers",
  "Passifs et créances",
  "Retraite",
  "Mutuelle et prévoyance",
  "Succession et donation",
  "Informations complémentaires",
] as const;

type Participant = { nom: string; email: string };

/** Nombre maxi de destinataires aligné sur l'API (MAX_PARTICIPANTS côté /api/collecte/send). */
const MAX_PARTICIPANTS = 50;

/** Étapes du wizard d'envoi (présentation seulement, la logique reste partagée). */
type Step = 1 | 2 | 3;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Composition des pièces" },
  { n: 2, label: "Destinataires" },
  { n: 3, label: "Envoi & confirmation" },
];

/**
 * Statut de dépôt d'une pièce (dimension SUIVI). En composition pré-envoi rien
 * n'est encore déposé : le statut par défaut est « à demander ». Après envoi,
 * `statusByItemId` (alimenté par l'API de dépôt quand elle existera) surclasse
 * pièce par pièce. Optionnel → aucune régression tant que la table n'existe pas.
 */
type DepotStatus = "depose" | "attval" | "manquant" | "alerte";

interface Props {
  /** Faits initiaux dérivés du DCI côté serveur (deriveFacts). */
  initialFacts: Facts;
  /** Id du dossier (footer · passage à l'étape suivante). Absent = demande de
   *  collecte LIBRE (à n'importe qui, sans dossier rattaché). */
  dossierId?: string;
  /** Participant pré-rempli depuis le dossier (modifiable avant envoi). */
  defaultParticipant: Participant;
  /** Statuts de dépôt par id de pièce (mode suivi). Absent = composition. */
  statusByItemId?: Record<string, DepotStatus>;
}

/**
 * Pièce libre ajoutée à la main par l'ingénieur, hors référentiel (286 pièces).
 * Réutilise la forme CatalogEntry pour transiter dans toute la machinerie
 * existante (groupage, filtres, mapping d'envoi) ; `isCustom` la distingue
 * pour l'affichage (badge) et la suppression définitive.
 */
type CustomItem = CatalogEntry & { isCustom: true };

/** Thème par défaut d'une pièce libre sans catégorie saisie. */
const CUSTOM_THEME = "Informations complémentaires";

/** État d'un fait pour l'affichage : coché, décoché, ou inconnu (« à confirmer »). */
type TriState = "on" | "off" | "unknown";

function triStateOf(facts: Facts, key: FactMeta["key"]): TriState {
  const v = facts[key];
  if (v === true) return "on";
  if (v === false) return "off";
  return "unknown";
}

/** Filtres de la toolbar v40 (adaptés au mode composition). */
type CiFilter = "all" | "selected" | "excluded";

/** Regroupe des pièces par catégorie puis sous-rubrique (ordre d'insertion). */
function groupItems(items: CatalogEntry[]) {
  const byCategory = new Map<string, Map<string, CatalogEntry[]>>();
  for (const item of items) {
    const cat = byCategory.get(item.category) ?? new Map<string, CatalogEntry[]>();
    const subKey = item.sub ?? "";
    const bucket = cat.get(subKey) ?? [];
    bucket.push(item);
    cat.set(subKey, bucket);
    byCategory.set(item.category, cat);
  }
  return byCategory;
}

/** Ordonne les catégories selon THEME_ORDER, le reste en fin. */
function orderedCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    const ia = THEME_ORDER.indexOf(a as (typeof THEME_ORDER)[number]);
    const ib = THEME_ORDER.indexOf(b as (typeof THEME_ORDER)[number]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export function CollecteBuilder({
  initialFacts,
  dossierId,
  defaultParticipant,
  statusByItemId,
}: Props) {
  // Source de vérité de la situation : un seul état facts, tout en dérive.
  const [facts, setFacts] = useState<Facts>(initialFacts);
  // Forçages manuels d'une pièce : son id dans `forcedOn` l'ajoute, dans
  // `forcedOff` la retire — pour les cas non dérivables d'un fait.
  const [forcedOn, setForcedOn] = useState<Set<string>>(() => new Set());
  const [forcedOff, setForcedOff] = useState<Set<string>>(() => new Set());

  // Pièces libres saisies par l'ingénieur (hors référentiel). Compteur dédié
  // pour des id stables et uniques ("custom-1", "custom-2"…).
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [customSeq, setCustomSeq] = useState(0);
  // Mini-formulaire d'ajout (replié par défaut).
  const [addingCustom, setAddingCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customTheme, setCustomTheme] = useState("");

  // Destinataires de la collecte. Le participant pré-rempli (issu du dossier)
  // amorce la liste s'il porte un nom ; sinon on démarre vide et un brouillon
  // sert à la saisie. L'API /api/collecte/send accepte participants[] (jusqu'à
  // MAX_PARTICIPANTS) : on génère une collecte + un lien de dépôt par personne.
  const [participants, setParticipants] = useState<Participant[]>(() =>
    defaultParticipant.nom.trim() ? [defaultParticipant] : [],
  );
  const [draft, setDraft] = useState<Participant>(() =>
    defaultParticipant.nom.trim() ? { nom: "", email: "" } : defaultParticipant,
  );

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<
    { ok: boolean; message: string; lines?: string[] } | null
  >(null);

  // Wizard : étape courante (présentation), modale de passage à l'étude.
  const [step, setStep] = useState<Step>(1);
  const [confirmStage, setConfirmStage] = useState(false);

  // UI : colonne des faits repliable, accordéon des thèmes, filtre actif.
  const [factsOpen, setFactsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState<CiFilter>("all");

  // Recalcul pur de la liste de pièces à chaque bascule de fait (sans réseau).
  const derived = useMemo(() => buildItems(facts), [facts]);

  // Catalogue complet (286) — mémoïsé une fois.
  const fullCatalog = useMemo(() => buildItems({}), []);

  // Liste finale = pièces dérivées (moins les forçages -), plus les forçages +.
  const activeItems = useMemo(() => {
    const byId = new Map<string, CatalogEntry>();
    for (const e of derived) {
      if (!forcedOff.has(e.id)) byId.set(e.id, e);
    }
    if (forcedOn.size > 0) {
      for (const e of fullCatalog) {
        if (forcedOn.has(e.id)) byId.set(e.id, e);
      }
    }
    // Pièces libres : actives tant qu'elles ne sont pas explicitement décochées.
    for (const c of customItems) {
      if (!forcedOff.has(c.id)) byId.set(c.id, c);
    }
    return [...byId.values()];
  }, [derived, forcedOn, forcedOff, fullCatalog, customItems]);

  const activeIds = useMemo(() => new Set(activeItems.map((e) => e.id)), [activeItems]);

  // On affiche TOUT le catalogue (286), groupé en 11 thèmes : pièces pré-cochées
  // par les règles ET pièces exclues, que l'ingénieur peut cocher à la main.
  const allGrouped = useMemo(() => groupItems(fullCatalog), [fullCatalog]);
  const themeKeys = useMemo(
    () => orderedCategories([...allGrouped.keys()]),
    [allGrouped],
  );

  // Faits groupés par catégorie pour la colonne gauche.
  const factsByCategory = useMemo(() => {
    const map = new Map<string, FactMeta[]>();
    for (const meta of FACTS_META) {
      const bucket = map.get(meta.category) ?? [];
      bucket.push(meta);
      map.set(meta.category, bucket);
    }
    return map;
  }, []);

  // Anneau de suivi : en composition, % de pièces sélectionnées sur 286.
  const selectedCount = activeItems.length;
  const pct = Math.round((selectedCount / TOTAL_PIECES) * 100);

  function cycleFact(key: FactMeta["key"]) {
    setFacts((prev) => {
      const next = { ...prev };
      const state = triStateOf(prev, key);
      // Cycle : à confirmer -> coché -> décoché -> à confirmer.
      if (state === "unknown") next[key] = true;
      else if (state === "on") next[key] = false;
      else delete next[key];
      return next;
    });
  }

  function toggleItem(id: string, currentlyActive: boolean) {
    if (currentlyActive) {
      setForcedOff((prev) => new Set(prev).add(id));
      setForcedOn((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } else {
      setForcedOn((prev) => new Set(prev).add(id));
      setForcedOff((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  }

  function addCustomItem() {
    const label = customLabel.trim();
    if (!label) return;
    const seq = customSeq + 1;
    const id = `custom-${seq}`;
    const theme = customTheme.trim() || CUSTOM_THEME;
    setCustomItems((prev) => [
      ...prev,
      { id, category: theme, label, type: "Document", isCustom: true },
    ]);
    setCustomSeq(seq);
    // Une pièce qu'on vient de créer doit être active : on purge un éventuel
    // forçage - résiduel sur cet id (ne peut pas arriver avec un seq croissant,
    // garde-fou de cohérence).
    setForcedOff((prev) => {
      if (!prev.has(id)) return prev;
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setCustomLabel("");
    setCustomTheme("");
    setAddingCustom(false);
  }

  function removeCustomItem(id: string) {
    setCustomItems((prev) => prev.filter((c) => c.id !== id));
    setForcedOff((prev) => {
      if (!prev.has(id)) return prev;
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function addParticipant() {
    const nom = draft.nom.trim();
    if (!nom || participants.length >= MAX_PARTICIPANTS) return;
    const email = draft.email.trim();
    setParticipants((prev) => [...prev, { nom, email }]);
    setDraft({ nom: "", email: "" });
  }

  function removeParticipant(index: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateParticipant(index: number, patch: Partial<Participant>) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }

  function toggleTheme(cat: string) {
    setCollapsed((prev) => {
      const n = new Set(prev);
      if (n.has(cat)) n.delete(cat);
      else n.add(cat);
      return n;
    });
  }

  function toggleAllThemes() {
    setCollapsed((prev) => (prev.size > 0 ? new Set() : new Set(themeKeys)));
  }

  /** Une pièce passe-t-elle le filtre courant ? */
  function passesFilter(active: boolean): boolean {
    if (filter === "selected") return active;
    if (filter === "excluded") return !active;
    return true;
  }

  // Destinataires effectifs : la liste validée, plus le brouillon courant s'il
  // porte un nom (confort : on n'oublie pas une saisie non « ajoutée »). Const
  // dérivée pure : la mémoïsation est laissée au React Compiler.
  const recipients: Participant[] = [...participants];
  if (draft.nom.trim()) {
    recipients.push({ nom: draft.nom.trim(), email: draft.email.trim() });
  }

  async function send() {
    if (recipients.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      // Mapping UI : CatalogEntry('Information') -> Item('Question'), attendu par l'API.
      const items = activeItems.map((e) => ({
        theme: e.category,
        sub: e.sub,
        label: e.label,
        type: e.type === "Document" ? ("Document" as const) : ("Question" as const),
      }));
      // Mode global : e-mail dès qu'au moins un destinataire a une adresse, sinon
      // lien à partager. Un destinataire sans adresse en mode "both" reçoit son
      // lien sans e-mail (l'API gère ce cas par participant).
      const anyEmail = recipients.some((p) => p.email.trim().length > 0);
      const allEmail = recipients.every((p) => p.email.trim().length > 0);
      const mode = !anyEmail ? "link" : allEmail ? "email" : "both";
      const res = await fetch("/api/collecte/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: recipients.map((p) => ({ nom: p.nom.trim(), email: p.email.trim() })),
          items,
          mode,
          dossier_id: dossierId ?? null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        results?: Array<{
          email: string | null;
          depotUrl: string | null;
          error: string | null;
        }>;
      };
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? `Erreur HTTP ${res.status}` });
        return;
      }
      const results = data.results ?? [];
      const failures = results.filter((r) => r.error);
      const lines = results.map((r, i) => {
        const who = r.email || recipients[i]?.nom || "destinataire";
        if (r.error) return `✗ ${who} : ${r.error}`;
        return r.depotUrl ? `✓ ${who} · ${r.depotUrl}` : `✓ ${who}`;
      });
      if (failures.length === results.length) {
        setResult({ ok: false, message: "Aucun envoi n'a abouti.", lines });
        return;
      }
      setResult({
        ok: true,
        message:
          failures.length > 0
            ? `Collecte envoyée à ${results.length - failures.length}/${results.length} destinataire(s).`
            : `Collecte envoyée à ${results.length} destinataire(s).`,
        lines,
      });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Échec de l'envoi" });
    } finally {
      setSending(false);
    }
  }

  const recipientsValid =
    recipients.length > 0 &&
    recipients.every(
      (p) => p.nom.trim().length > 0 && (p.email.trim() === "" || EMAIL_RE.test(p.email.trim())),
    );

  const canSend = !sending && selectedCount > 0 && recipientsValid;

  return (
    <div className="flex flex-col gap-5">
      {/* BARRE DE SUIVI v40 · ci-suivi-bar (anneau + compteur + actions d'envoi) */}
      <div className="flex flex-wrap items-center gap-5 rounded-md border border-[var(--navy-100)] bg-white px-6 py-4">
        <div
          className="relative flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--gold) ${pct * 3.6}deg, var(--navy-100) 0deg)`,
          }}
        >
          <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white">
            <span className="text-[16px] font-bold leading-none text-[var(--navy)]">
              {pct}
              <small className="text-[10px] font-semibold text-[var(--navy-300)]">%</small>
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="text-[13px] font-semibold text-[var(--navy)]">
            Composition de la collecte
            <span className="mx-1.5 text-[var(--navy-300)]">·</span>
            <span className="font-bold text-[var(--gold-deep)]">
              {selectedCount} pièce{selectedCount > 1 ? "s" : ""} sur {TOTAL_PIECES}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
            Le moteur conditionnel a pré-sélectionné les pièces pertinentes selon le DCI · ajustez à la main avant l&apos;envoi.
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {step === 1 && (
            <button
              type="button"
              onClick={() => setFactsOpen((v) => !v)}
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              {factsOpen ? "Masquer la situation" : "Modifier la situation"}
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 1 ? 2 : 3) as Step)}
              disabled={step === 1 ? selectedCount === 0 : !recipientsValid}
              className="rounded-md bg-[var(--navy)] px-4 py-2 text-[11.5px] font-bold text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === 1 ? "Continuer · destinataires →" : "Continuer · envoi →"}
            </button>
          ) : (
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="rounded-md bg-[var(--gold)] px-4 py-2 text-[11.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Envoi…" : "Envoyer la collecte"}
            </button>
          )}
        </div>
      </div>

      {/* STEPPER — 3 étapes (composition → destinataires → envoi) */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--navy-100)] bg-white px-4 py-3">
        {STEPS.map((s, i) => {
          const isCurrent = step === s.n;
          const isDone = step > s.n;
          // On peut revenir en arrière librement ; avancer exige les pré-requis.
          const reachable =
            s.n <= step ||
            (s.n === 2 && selectedCount > 0) ||
            (s.n === 3 && selectedCount > 0 && recipientsValid);
          return (
            <div key={s.n} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => reachable && setStep(s.n)}
                disabled={!reachable}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition disabled:cursor-not-allowed ${
                  isCurrent
                    ? "bg-[var(--navy)] text-white"
                    : isDone
                      ? "text-[var(--gold-deep)] hover:bg-[var(--gold-100)]"
                      : "text-[var(--navy-300)] hover:bg-[var(--ivory)] disabled:opacity-50"
                }`}
              >
                <span
                  className={`flex h-[20px] w-[20px] items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? "bg-white text-[var(--navy)]"
                      : isDone
                        ? "bg-[var(--gold)] text-white"
                        : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                  }`}
                >
                  {isDone ? "✓" : s.n}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <span className="text-[var(--navy-300)]">→</span>
              )}
            </div>
          );
        })}
      </div>

      {result && (
        <div
          className={`rounded-md px-3 py-2 text-[11.5px] ${
            result.ok
              ? "bg-[var(--green-bg)] text-[var(--green-text)]"
              : "bg-[var(--red-bg)] text-[var(--red-text)]"
          }`}
        >
          <div className="font-semibold">{result.message}</div>
          {result.lines && result.lines.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {result.lines.map((l, i) => (
                <li key={i} className="break-all font-mono text-[10.5px] leading-snug">
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ÉTAPE 2 — DESTINATAIRES (multi-participant) */}
      {step === 2 && (
        <section className="rounded-md border border-[var(--navy-100)] bg-white p-4">
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Étape 02
            </div>
            <div className="text-[15px] font-semibold text-[var(--navy)]">
              À qui envoyer la collecte ?
            </div>
            <div className="mt-1 text-[11px] text-[var(--navy-300)]">
              Ajoutez un ou plusieurs destinataires. Chacun reçoit sa propre collecte et son lien de
              dépôt. Sans e-mail, seul le lien à partager est généré (jusqu&apos;à {MAX_PARTICIPANTS}{" "}
              destinataires).
            </div>
          </div>

          {/* Liste des destinataires déjà ajoutés (éditables / supprimables) */}
          {participants.length > 0 && (
            <div className="mb-3 flex flex-col gap-2">
              {participants.map((p, i) => {
                const emailKo = p.email.trim() !== "" && !EMAIL_RE.test(p.email.trim());
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-2.5 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      type="text"
                      value={p.nom}
                      onChange={(e) => updateParticipant(i, { nom: e.target.value })}
                      placeholder="Nom du destinataire"
                      className="w-full rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
                    />
                    <input
                      type="email"
                      value={p.email}
                      onChange={(e) => updateParticipant(i, { email: e.target.value })}
                      placeholder="e-mail (optionnel)"
                      className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)] ${
                        emailKo ? "border-[var(--red-text)]" : "border-[var(--navy-100)]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipant(i)}
                      aria-label="Retirer ce destinataire"
                      className="justify-self-end rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--navy-300)] hover:border-[var(--red-text)] hover:text-[var(--red-text)]"
                    >
                      Retirer
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Brouillon d'ajout */}
          {participants.length < MAX_PARTICIPANTS && (
            <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-[var(--navy-300)]">
                  Destinataire
                </label>
                <input
                  type="text"
                  value={draft.nom}
                  onChange={(e) => setDraft((d) => ({ ...d, nom: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addParticipant();
                    }
                  }}
                  placeholder="Nom du client"
                  className="w-full rounded-md border border-[var(--navy-100)] px-2.5 py-1.5 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-[var(--navy-300)]">
                  E-mail (optionnel · sinon lien de dépôt)
                </label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addParticipant();
                    }
                  }}
                  placeholder="client@exemple.fr"
                  className="w-full rounded-md border border-[var(--navy-100)] px-2.5 py-1.5 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
                />
              </div>
              <button
                type="button"
                onClick={addParticipant}
                disabled={!draft.nom.trim()}
                className="rounded-md border border-dashed border-[var(--gold)] bg-[var(--gold-100)] px-4 py-1.5 text-[11.5px] font-bold text-[var(--gold-deep)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Ajouter
              </button>
            </div>
          )}

          {participants.length >= MAX_PARTICIPANTS && (
            <div className="text-[11px] font-semibold text-[var(--orange-text)]">
              Maximum de {MAX_PARTICIPANTS} destinataires atteint.
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-[var(--navy-100)] pt-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              ← Composition
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!recipientsValid}
              className="rounded-md bg-[var(--navy)] px-4 py-2 text-[11.5px] font-bold text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuer · envoi →
            </button>
          </div>
        </section>
      )}

      {/* ÉTAPE 3 — ENVOI & CONFIRMATION (récapitulatif) */}
      {step === 3 && (
        <section className="rounded-md border border-[var(--navy-100)] bg-white p-4">
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Étape 03
            </div>
            <div className="text-[15px] font-semibold text-[var(--navy)]">
              Vérifier et envoyer
            </div>
            <div className="mt-1 text-[11px] text-[var(--navy-300)]">
              Relisez la composition et les destinataires avant l&apos;envoi.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--navy-300)]">
                Composition
              </div>
              <div className="mt-1 text-[20px] font-bold text-[var(--navy)]">
                {selectedCount}{" "}
                <span className="text-[12px] font-semibold text-[var(--navy-300)]">
                  pièce{selectedCount > 1 ? "s" : ""} sur {TOTAL_PIECES}
                </span>
              </div>
              {customItems.length > 0 && (
                <div className="mt-1 text-[11px] text-[var(--gold-deep)]">
                  dont {customItems.filter((c) => activeIds.has(c.id)).length} pièce(s) hors référentiel
                </div>
              )}
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--navy-300)]">
                Destinataires
              </div>
              <ul className="mt-1 flex flex-col gap-0.5">
                {recipients.map((p, i) => (
                  <li key={i} className="text-[12px] text-[var(--navy)]">
                    <span className="font-semibold">{p.nom}</span>
                    <span className="ml-1.5 text-[var(--navy-300)]">
                      {p.email.trim() ? p.email.trim() : "· lien de dépôt"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--navy-100)] pt-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              ← Destinataires
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="rounded-md bg-[var(--gold)] px-5 py-2 text-[11.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Envoi…"
                : `Envoyer à ${recipients.length} destinataire${recipients.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </section>
      )}

      {/* ÉTAPE 1 — COMPOSITION (faits + référentiel) */}
      <div
        className={`grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr] ${step === 1 ? "" : "hidden"}`}
      >
        {/* GAUCHE — checklist des faits (pilote du moteur), repliable */}
        {factsOpen && (
          <section>
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                Situation du foyer
              </div>
              <div className="text-[15px] font-semibold text-[var(--navy)]">
                Faits dérivés du DCI
              </div>
              <div className="mt-1 text-[11px] text-[var(--navy-300)]">
                Coché = oui · décoché = non · ambre = à confirmer. La liste de pièces se recalcule à chaque bascule.
              </div>
            </div>

            <div className="flex max-h-[calc(100vh-160px)] flex-col gap-3 overflow-y-auto pr-1">
              {FACT_CATEGORY_ORDER.map((category) => {
                const metas = factsByCategory.get(category) ?? [];
                if (metas.length === 0) return null;
                return (
                  <div key={category} className="rounded-md border border-[var(--navy-100)] bg-white p-3">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--navy)]">
                      {category}
                    </div>
                    <div className="flex flex-col gap-1">
                      {metas.map((meta) => {
                        const state = triStateOf(facts, meta.key);
                        return (
                          <button
                            key={meta.key}
                            type="button"
                            onClick={() => cycleFact(meta.key)}
                            className="flex w-full items-center gap-2.5 rounded-[5px] px-2 py-1.5 text-left transition-colors hover:bg-[var(--light-blue)]"
                          >
                            <span
                              className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] border text-[11px] font-bold leading-none ${
                                state === "on"
                                  ? "border-[var(--gold)] bg-[var(--gold)] text-white"
                                  : state === "unknown"
                                    ? "border-[var(--orange-text)] bg-[var(--orange-bg)] text-[var(--orange-text)]"
                                    : "border-[var(--navy-100)] bg-white text-transparent"
                              }`}
                            >
                              {state === "on" ? "✓" : state === "unknown" ? "?" : ""}
                            </span>
                            <span className="flex-1 text-[12.5px] leading-tight text-[var(--navy)]">
                              {meta.label}
                            </span>
                            {state === "unknown" && (
                              <span className="rounded-sm bg-[var(--orange-bg)] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-[var(--orange-text)]">
                                À confirmer
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* DROITE — 11 thèmes en accordéon v40 */}
        <section>
          {/* TOOLBAR de filtres v40 · ci-toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--navy-100)] bg-white px-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              {([
                { key: "all", label: "Toutes", count: TOTAL_PIECES },
                { key: "selected", label: "Sélectionnées", count: selectedCount },
                { key: "excluded", label: "Non incluses", count: Math.max(0, TOTAL_PIECES - selectedCount) },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    filter === f.key
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[9.5px] font-bold ${
                      filter === f.key
                        ? "bg-white/20 text-white"
                        : "bg-[var(--ivory-deep)] text-[var(--navy-300)]"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAddingCustom((v) => !v)}
                className="rounded-md border border-dashed border-[var(--gold)] bg-[var(--gold-100)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--gold-deep)] hover:brightness-95"
              >
                + Ajouter une pièce
              </button>
              <button
                type="button"
                onClick={toggleAllThemes}
                className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                Tout replier / déplier
              </button>
            </div>
          </div>

          {/* Mini-formulaire d'ajout d'une pièce libre (hors référentiel) */}
          {addingCustom && (
            <div className="mb-3 rounded-md border border-[var(--gold)] bg-[var(--gold-100)] p-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--gold-deep)]">
                Nouvelle pièce hors référentiel
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomItem();
                    }
                  }}
                  placeholder="Libellé de la pièce (ex. Attestation employeur)"
                  className="flex-1 rounded-md border border-[var(--navy-100)] px-2.5 py-1.5 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
                />
                <select
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--navy)] outline-none focus:border-[var(--gold)] sm:w-[220px]"
                >
                  <option value="">Thème (optionnel)</option>
                  {THEME_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCustomItem}
                  disabled={!customLabel.trim()}
                  className="rounded-md bg-[var(--gold)] px-4 py-1.5 text-[11.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
              <div className="mt-1.5 text-[10.5px] text-[var(--navy-300)]">
                La pièce sera demandée au client comme un document à fournir. Sans thème, elle ira dans « {CUSTOM_THEME} ».
              </div>
            </div>
          )}

          {/* Pièces libres ajoutées (hors référentiel) */}
          {customItems.length > 0 && (
            <div className="mb-2.5 overflow-hidden rounded-md border border-[var(--gold)] bg-white">
              <div className="flex items-center justify-between bg-[var(--gold-100)] px-4 py-2.5">
                <div>
                  <div className="text-[13.5px] font-bold text-[var(--navy)]">Pièces ajoutées à la main</div>
                  <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
                    Hors référentiel · saisies par l&apos;ingénieur
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[var(--gold-deep)]">
                  {customItems.filter((c) => activeIds.has(c.id)).length}/{customItems.length} sélectionnées
                </span>
              </div>
              <div className="border-t border-[var(--navy-100)]">
                {customItems.map((item) => {
                  const active = activeIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2.5 border-b border-[var(--navy-100)] px-4 py-1.5 last:border-b-0 hover:bg-[var(--ivory)] ${
                        active ? "" : "opacity-45"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleItem(item.id, active)}
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-[var(--gold)]"
                      />
                      <span className="flex-1 text-[12px] leading-tight text-[var(--navy)]">
                        {item.label}
                        <span className="ml-1.5 text-[10.5px] text-[var(--navy-300)]">· {item.category}</span>
                      </span>
                      <span className="flex-shrink-0 rounded-sm bg-[var(--gold-200)] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-[var(--medium-400)]">
                        Pièce libre
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomItem(item.id)}
                        aria-label="Supprimer cette pièce"
                        className="flex-shrink-0 rounded-sm px-1 text-[13px] leading-none text-[var(--navy-300)] hover:text-[var(--red-text)]"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {themeKeys.map((category) => {
              const subs = allGrouped.get(category);
              if (!subs) return null;
              const allItems = [...subs.values()].flat();
              const total = allItems.length;
              const selected = allItems.filter((i) => activeIds.has(i.id)).length;
              const themePct = total ? Math.round((selected / total) * 100) : 0;
              const isOpen = !collapsed.has(category);

              // Sous-rubriques visibles après filtrage (pièces qui passent le filtre).
              const visibleSubs = [...subs.entries()]
                .map(([sub, items]) => ({
                  sub,
                  items: items.filter((i) => passesFilter(activeIds.has(i.id))),
                }))
                .filter((s) => s.items.length > 0);

              return (
                <div
                  key={category}
                  className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white"
                >
                  {/* head */}
                  <button
                    type="button"
                    onClick={() => toggleTheme(category)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--ivory)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-bold text-[var(--navy)]">{category}</div>
                      <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
                        {subs.size} sous-rubrique{subs.size > 1 ? "s" : ""} · {total} élément
                        {total > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2 text-[11px] font-semibold">
                      <span className="text-[var(--gold-deep)]">{selected} sélectionnées</span>
                      <span className="text-[var(--navy-300)]">·</span>
                      <span className="text-[var(--navy-300)]">{themePct} %</span>
                      <span className="text-[var(--navy-300)]">·</span>
                      <span className="text-[var(--navy-300)]">
                        {selected}/{total}
                      </span>
                    </div>
                    <span
                      className={`flex-shrink-0 text-[12px] text-[var(--navy-300)] transition-transform ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {/* body */}
                  {isOpen && (
                    <div className="border-t border-[var(--navy-100)]">
                      {visibleSubs.length === 0 ? (
                        <div className="px-4 py-3 text-[11px] text-[var(--navy-300)]">
                          Aucune pièce pour ce filtre.
                        </div>
                      ) : (
                        visibleSubs.map(({ sub, items }) => {
                          const subSelected = items.filter((i) => activeIds.has(i.id)).length;
                          return (
                            <div
                              key={sub || "_"}
                              className="border-b border-[var(--navy-100)] last:border-b-0"
                            >
                              <div className="flex items-center justify-between bg-[var(--light-blue)] px-4 py-1.5">
                                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy)]">
                                  {sub || "Pièces du thème"}
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--navy-300)]">
                                  {subSelected}/{items.length}
                                </span>
                              </div>
                              {items.map((item) => {
                                const active = activeIds.has(item.id);
                                const isDecl = item.type === "Information";
                                const depot = statusByItemId?.[item.id];
                                return (
                                  <label
                                    key={item.id}
                                    className={`flex cursor-pointer items-start gap-2.5 px-4 py-1.5 hover:bg-[var(--ivory)] ${
                                      active ? "" : "opacity-45"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={active}
                                      onChange={() => toggleItem(item.id, active)}
                                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-[var(--gold)]"
                                    />
                                    <span className="flex-1 text-[12px] leading-tight text-[var(--navy)]">
                                      {item.label}
                                    </span>
                                    {isDecl ? (
                                      <span
                                        title="Information déclarative · aucun justificatif requis"
                                        className="flex-shrink-0 rounded-sm bg-[var(--navy-100)] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]"
                                      >
                                        Sans justificatif
                                      </span>
                                    ) : (
                                      <span className="flex-shrink-0 rounded-sm bg-[var(--gold-200)] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-[var(--medium-400)]">
                                        Document
                                      </span>
                                    )}
                                    {depot && (
                                      <span
                                        className={`flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] ${
                                          depot === "depose"
                                            ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                                            : depot === "alerte"
                                              ? "bg-[var(--red-bg)] text-[var(--red-text)]"
                                              : depot === "manquant"
                                                ? "bg-[var(--orange-bg)] text-[var(--orange-text)]"
                                                : "bg-[var(--gold-100)] text-[var(--gold-deep)]"
                                        }`}
                                      >
                                        {depot === "depose"
                                          ? "Validé"
                                          : depot === "attval"
                                            ? "En attente de validation"
                                            : depot === "manquant"
                                              ? "En attente du client"
                                              : "Incohérence IA"}
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* FOOTER v40 · passage à l'étape suivante */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-[var(--navy-100)] bg-white px-6 py-4">
        <div>
          <div className="text-[14px] font-bold text-[var(--navy)]">
            Passage à l&apos;étape 04 · Réalisation de l&apos;étude patrimoniale
          </div>
          <div className="mt-1 max-w-xl text-[11.5px] leading-relaxed text-[var(--navy-300)]">
            L&apos;ingénieur décide du passage à l&apos;étude.{" "}
            <strong className="text-[var(--navy)]">{selectedCount} pièces</strong> composent la
            collecte envoyée au client.
          </div>
        </div>
        {dossierId && (
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <a
              href={`/dossiers/${dossierId}`}
              className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2.5 text-[12px] font-semibold text-[var(--navy)] transition hover:border-[var(--gold)]"
            >
              ← Retour à la fiche
            </a>
            <button
              type="button"
              onClick={() => setConfirmStage(true)}
              className="rounded-md bg-[var(--navy)] px-4 py-2.5 text-[12px] font-bold text-white transition hover:brightness-125"
            >
              Passer à l&apos;étude (étape 04) →
            </button>
          </div>
        )}
      </div>

      {/* MODALE de confirmation du passage à l'étude (étape 04). Le clic ne
          déclenche moveDossierStage qu'après confirmation explicite. */}
      {dossierId && confirmStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-stage-title"
          onClick={() => setConfirmStage(false)}
        >
          <div
            className="w-full max-w-md rounded-md border border-[var(--navy-100)] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="confirm-stage-title"
              className="text-[16px] font-bold text-[var(--navy)]"
            >
              Confirmer le passage à l&apos;étude ?
            </div>
            <div className="mt-2 text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Le dossier passera à l&apos;étape 04 · Réalisation de l&apos;étude patrimoniale.{" "}
              <strong className="text-[var(--navy)]">{selectedCount} pièce{selectedCount > 1 ? "s" : ""}</strong>{" "}
              composent la collecte. Assurez-vous d&apos;avoir envoyé la collecte au client si nécessaire.
            </div>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmStage(false)}
                className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                Annuler
              </button>
              <form action={moveDossierStage.bind(null, dossierId, "next")}>
                <button
                  type="submit"
                  className="rounded-md bg-[var(--navy)] px-4 py-2 text-[12px] font-bold text-white transition hover:brightness-125"
                >
                  Confirmer le passage
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
