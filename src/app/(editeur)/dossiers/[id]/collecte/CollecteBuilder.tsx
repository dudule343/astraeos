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
  /** Id du dossier (footer · passage à l'étape suivante). */
  dossierId: string;
  /** Participant pré-rempli depuis le dossier (modifiable avant envoi). */
  defaultParticipant: Participant;
  /** Statuts de dépôt par id de pièce (mode suivi). Absent = composition. */
  statusByItemId?: Record<string, DepotStatus>;
}

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

  const [participant, setParticipant] = useState<Participant>(defaultParticipant);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

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
    return [...byId.values()];
  }, [derived, forcedOn, forcedOff, fullCatalog]);

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

  async function send() {
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
      const res = await fetch("/api/collecte/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: [{ nom: participant.nom, email: participant.email }],
          items,
          mode: participant.email ? "email" : "link",
          dossier_id: dossierId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        results?: Array<{ depotUrl: string | null; error: string | null }>;
      };
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? `Erreur HTTP ${res.status}` });
        return;
      }
      const first = data.results?.[0];
      if (first?.error) {
        setResult({ ok: false, message: first.error });
        return;
      }
      setResult({
        ok: true,
        message: first?.depotUrl
          ? `Collecte envoyée. Lien de dépôt : ${first.depotUrl}`
          : "Collecte envoyée.",
      });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Échec de l'envoi" });
    } finally {
      setSending(false);
    }
  }

  const canSend = !sending && selectedCount > 0 && participant.nom.trim().length > 0;

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
          <button
            type="button"
            onClick={() => setFactsOpen((v) => !v)}
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
          >
            {factsOpen ? "Masquer la situation" : "Modifier la situation"}
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-[11.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Envoi…" : "Envoyer la collecte"}
          </button>
        </div>
      </div>

      {result && (
        <div
          className={`rounded-md px-3 py-2 text-[11.5px] ${
            result.ok
              ? "bg-[var(--green-bg)] text-[var(--green-text)]"
              : "bg-[var(--red-bg)] text-[var(--red-text)]"
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Destinataire (composition) */}
      <div className="grid grid-cols-1 gap-2 rounded-md border border-[var(--navy-100)] bg-white p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-[var(--navy-300)]">
            Destinataire
          </label>
          <input
            type="text"
            value={participant.nom}
            onChange={(e) => setParticipant((p) => ({ ...p, nom: e.target.value }))}
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
            value={participant.email}
            onChange={(e) => setParticipant((p) => ({ ...p, email: e.target.value }))}
            placeholder="client@exemple.fr"
            className="w-full rounded-md border border-[var(--navy-100)] px-2.5 py-1.5 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
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
                { key: "excluded", label: "Non incluses", count: TOTAL_PIECES - selectedCount },
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
            <button
              type="button"
              onClick={toggleAllThemes}
              className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              Tout replier / déplier
            </button>
          </div>

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
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <a
            href={`/dossiers/${dossierId}`}
            className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2.5 text-[12px] font-semibold text-[var(--navy)] transition hover:border-[var(--gold)]"
          >
            ← Retour à la fiche
          </a>
          <form action={moveDossierStage.bind(null, dossierId, "next")}>
            <button
              type="submit"
              className="rounded-md bg-[var(--navy)] px-4 py-2.5 text-[12px] font-bold text-white transition hover:brightness-125"
            >
              Passer à l&apos;étude (étape 04) →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
