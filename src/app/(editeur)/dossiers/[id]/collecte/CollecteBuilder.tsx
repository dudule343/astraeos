"use client";

import { useMemo, useState } from "react";

import { buildItems } from "@/lib/collecte-catalog";
import type { CatalogEntry, Facts } from "@/lib/collecte-catalog/types";

import { FACTS_META, FACT_CATEGORY_ORDER, type FactMeta } from "./facts-meta";

/** Total de référence du catalogue (286 pièces du référentiel documentaire). */
const TOTAL_PIECES = 286;

type Participant = { nom: string; email: string };

interface Props {
  /** Faits initiaux dérivés du DCI côté serveur (deriveFacts). */
  initialFacts: Facts;
  /** Participant pré-rempli depuis le dossier (modifiable avant envoi). */
  defaultParticipant: Participant;
}

/** État d'un fait pour l'affichage : coché, décoché, ou inconnu (« à confirmer »). */
type TriState = "on" | "off" | "unknown";

function triStateOf(facts: Facts, key: FactMeta["key"]): TriState {
  const v = facts[key];
  if (v === true) return "on";
  if (v === false) return "off";
  return "unknown";
}

/** Regroupe les pièces actives par catégorie puis sous-rubrique. */
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

export function CollecteBuilder({ initialFacts, defaultParticipant }: Props) {
  // Source de vérité de la situation : un seul état facts, tout en dérive.
  const [facts, setFacts] = useState<Facts>(initialFacts);
  // Forçages manuels d'une pièce : son id dans `forcedOn` l'ajoute, dans
  // `forcedOff` la retire — pour les cas non dérivables d'un fait.
  const [forcedOn, setForcedOn] = useState<Set<string>>(() => new Set());
  const [forcedOff, setForcedOff] = useState<Set<string>>(() => new Set());

  const [participant, setParticipant] = useState<Participant>(defaultParticipant);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Recalcul pur de la liste de pièces à chaque bascule de fait (sans réseau).
  const derived = useMemo(() => buildItems(facts), [facts]);

  // Liste finale = pièces dérivées (moins les forçages -), plus les forçages +.
  const activeItems = useMemo(() => {
    const byId = new Map<string, CatalogEntry>();
    for (const e of derived) {
      if (!forcedOff.has(e.id)) byId.set(e.id, e);
    }
    if (forcedOn.size > 0) {
      // On va rechercher les forçages + dans le catalogue complet.
      for (const e of buildItems({})) {
        if (forcedOn.has(e.id)) byId.set(e.id, e);
      }
    }
    return [...byId.values()];
  }, [derived, forcedOn, forcedOff]);

  const activeIds = useMemo(() => new Set(activeItems.map((e) => e.id)), [activeItems]);
  // On affiche TOUT le catalogue (286) : les pièces pré-cochées par les règles
  // ET les pièces exclues, que l'ingénieur peut cocher à la main.
  const allGrouped = useMemo(() => groupItems(buildItems({})), []);

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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* GAUCHE — checklist des faits */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Situation du foyer
            </div>
            <div className="text-[15px] font-semibold text-[var(--navy)]">
              Faits dérivés du DCI
            </div>
          </div>
          <div className="text-[11px] text-[var(--navy-300)]">
            Coché = oui · décoché = non · ambre = à confirmer
          </div>
        </div>

        <div className="flex flex-col gap-4">
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

      {/* DROITE — liste live des pièces */}
      <section>
        <div className="sticky top-[60px]">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                Pièces à demander
              </div>
              <div className="text-[15px] font-semibold text-[var(--navy)]">
                Collecte conditionnelle
              </div>
            </div>
            <div className="rounded-md bg-[var(--navy)] px-3 py-1.5 text-[12px] font-bold text-white">
              {activeItems.length} pièces sur {TOTAL_PIECES}
            </div>
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto rounded-md border border-[var(--navy-100)] bg-white">
            {[...allGrouped.entries()].map(([category, subs]) => (
              <div key={category} className="border-b border-[var(--navy-100)] last:border-b-0">
                <div className="bg-[var(--light-blue)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--navy)]">
                  {category}
                </div>
                {[...subs.entries()].map(([sub, items]) => (
                  <div key={sub || "_"}>
                    {sub && (
                      <div className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                        {sub}
                      </div>
                    )}
                    {items.map((item) => {
                      const active = activeIds.has(item.id);
                      return (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-start gap-2.5 px-3 py-1.5 hover:bg-[var(--ivory)] ${active ? "" : "opacity-45"}`}
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
                        <span
                          className={`flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] ${
                            item.type === "Document"
                              ? "bg-[var(--gold-200)] text-[var(--medium-400)]"
                              : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                          }`}
                        >
                          {item.type}
                        </span>
                      </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
            {activeItems.length === 0 && (
              <div className="p-6 text-center text-[12px] text-[var(--navy-300)]">
                Aucune pièce sélectionnée.
              </div>
            )}
          </div>

          {/* Envoi */}
          <div className="mt-4 rounded-md border border-[var(--navy-100)] bg-white p-4">
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                  E-mail (optionnel)
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

            <button
              type="button"
              onClick={send}
              disabled={sending || activeItems.length === 0 || !participant.nom.trim()}
              className="w-full rounded-md bg-[var(--gold)] px-3 py-2.5 text-[12.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Envoi en cours…" : `Envoyer la collecte (${activeItems.length} pièces)`}
            </button>

            {result && (
              <div
                className={`mt-3 rounded-md px-3 py-2 text-[11.5px] ${
                  result.ok
                    ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                    : "bg-[var(--red-bg)] text-[var(--red-text)]"
                }`}
              >
                {result.message}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
