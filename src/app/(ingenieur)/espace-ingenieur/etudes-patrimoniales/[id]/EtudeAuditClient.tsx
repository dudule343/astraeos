"use client";

/**
 * Coquille interactive du DOCUMENT D'AUDIT (espace ingénieur · /[id]).
 *
 * Porte la mécanique JS de la maquette en React : navigation fluide (sommaire +
 * table des matières), repli/dépli des sections, mode de vue (Ingénieur /
 * Client / PDF / Word), volet de révision, sélection de bloc, surlignage de
 * phrase, toasts, tiroir d'aide.
 *
 * Honnête de bout en bout :
 *  - VALIDATION, ÉDITION manuelle et TRANSFORMATIONS IA = REELLES (server
 *    actions → etude_blocs ; transformerTexte appelle le modèle du cabinet) ;
 *  - le rattachement de sources reste un aperçu « bientôt » explicitement
 *    signalé, jamais de fausse référence appliquée.
 *
 * Frontière client/serveur : ce composant n'importe que le module pur
 * (structure), le système de blocs et les server actions (stubs RPC). Aucune
 * lecture serveur ici — les données arrivent en props depuis la page.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import type { BlocState } from "../../../_data/etudes-patrimoniales";
import {
  editBloc,
  transformerTexte,
  unvalidateBloc as unvalidateBlocAction,
  validateAll,
  validateBloc,
} from "../actions";
import { BlocProvider, type BlocContextValue, type ViewMode } from "./Bloc";
import { ValeurProvider } from "./ValeurEditable";
import { readBlocHtml, readBlocText } from "./sanitize";
import { getCertifPanel, type CertifDet, type CertifPanel } from "./certif-data";
import type { AuditSection, TocEntry } from "./etude-audit-structure";
import { useEtudeBehaviors } from "./use-etude-behaviors";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type CoverData = {
  /** titre du document (fixe : « Étude Patrimoniale »). */
  titre: string;
  /** sous-titre honnête dérivé du statut de l'étude. */
  sousTitre: string;
  /** noms du foyer (un par personne) ; vide → état « À compléter ». */
  noms: string[];
};

export type SectionInput = {
  id: string;
  /** suréchelon affiché (« Audit patrimonial »). */
  tag: string;
  title: string;
  /** contenu de la section (slot) — pour l'instant un emplacement honnête. */
  body: ReactNode;
};

export type EtudeAuditClientProps = {
  etudeId: string;
  clientNom: string;
  cover: CoverData;
  sommaire: AuditSection[];
  todo: string[];
  toc: TocEntry[];
  blocs: BlocState[];
  sections: SectionInput[];
};

type BlocLocalState = { valide: boolean; valideAt: string | null; contenu: string | null };

// ---------------------------------------------------------------------------
// Descriptions des actions du volet (texte simple, sans HTML)
// ---------------------------------------------------------------------------

type ActDesc = { d: string; r: string };

const ACTS: Record<string, ActDesc> = {
  Reformuler: {
    d: "Réécrit le passage dans un style plus clair, sans en changer le sens.",
    r: "Propose une nouvelle formulation, plus fluide et précise, que vous validez ou ajustez.",
  },
  Approfondir: {
    d: "Ajoute du contexte et des précisions, sans modifier la conclusion.",
    r: "Enrichit le passage de détails et d'exemples pertinents, dans le périmètre du dossier.",
  },
  Simplifier: {
    d: "Resserre le passage : phrases plus courtes, propos plus direct.",
    r: "Propose une version condensée et plus accessible, l'idée étant préservée.",
  },
  Corriger: {
    d: "Corrige fautes, incohérences et imprécisions repérées.",
    r: "Signale et corrige les points fautifs ou imprécis du passage.",
  },
  Compléter: {
    d: "Comble les informations manquantes signalées dans le passage.",
    r: "Ajoute les éléments manquants identifiés, dans le périmètre du dossier.",
  },
  Ajuster: {
    d: "Affine le ton et l'accentuation (plus prudent, plus affirmatif…).",
    r: "Propose une version au ton ajusté selon votre intention.",
  },
  "Ajouter des sources": {
    d: "Rattache des références juridiques vérifiées de la base ASTRAEOS.",
    r: "Sélectionnez les références à rattacher au passage.",
  },
  "Modifier manuellement": {
    d: "Passe le passage en édition libre : vous écrivez directement.",
    r: "Le bloc devient éditable immédiatement dans le document.",
  },
};

const IA_ACTIONS = ["Reformuler", "Approfondir", "Simplifier", "Corriger", "Compléter", "Ajuster"];

// ---------------------------------------------------------------------------
// Icônes (chemins SVG repris de la maquette)
// ---------------------------------------------------------------------------

const ACT_ICON: Record<string, ReactNode> = {
  Reformuler: (
    <>
      <path d="M4 12a8 8 0 0 1 14-5l2 2" />
      <path d="M20 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-14 5l-2-2" />
      <path d="M4 20v-5h5" />
    </>
  ),
  Approfondir: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </>
  ),
  Simplifier: (
    <>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </>
  ),
  Corriger: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />,
  Compléter: <path d="M12 5v14M5 12h14" />,
  Ajuster: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
  "Ajouter des sources": (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  "Modifier manuellement": (
    <>
      <path d="M3 21v-4l11-11 4 4L7 21z" />
      <path d="M14 6l4 4" />
    </>
  ),
};

function Vsvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  );
}

const HELP_ROWS: { d: string; title: string; desc: string }[] = [
  {
    d: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
    title: "Sélectionnez",
    desc: "Cliquez un bloc de texte, ou surlignez une phrase, pour cibler précisément ce que vous voulez réviser.",
  },
  {
    d: "M4 12a8 8 0 0 1 14-5l2 2M20 4v5h-5",
    title: "Transformations IA",
    desc: "Six retouches du texte : reformuler, approfondir, simplifier, corriger, compléter, ajuster. Chacune propose un aperçu réel que vous appliquez ou annulez.",
  },
  {
    d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    title: "Ajouter des sources",
    desc: "Rattache des références juridiques vérifiées, issues de la base ASTRAEOS — jamais de texte légal généré librement.",
  },
  {
    d: "M3 21v-4l11-11 4 4L7 21z",
    title: "Modifier manuellement",
    desc: "Rend le bloc éditable : vous écrivez, complétez ou corrigez le texte à la main, puis terminez pour enregistrer.",
  },
  {
    d: "M5 12l5 5L20 7",
    title: "Valider",
    desc: "Horodate et signe le bloc. « Validation globale » valide tous les blocs en une seule fois.",
  },
  {
    d: "M13 5l7 7-7 7M20 12H4",
    title: "Bloc suivant",
    desc: "Passe au bloc suivant pour poursuivre la relecture dans l'ordre du document.",
  },
];

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

type Target =
  | { kind: "none" }
  | { kind: "bloc"; label: string }
  | { kind: "phrase"; text: string };

type Preview =
  | {
      kind: "ia";
      action: string;
      status: "loading" | "ready" | "error";
      /** texte transformé renvoyé par le modèle (status « ready »). */
      result?: string;
      /** raison honnête en cas d'échec (status « error »). */
      message?: string;
    }
  | { kind: "sources" }
  | { kind: "edit" }
  | null;

/** Cible figée au moment où l'on lance une transformation IA. */
type IaCapture =
  | { kind: "phrase"; range: Range; blocKey: string; text: string }
  | { kind: "bloc"; blocKey: string; text: string };

/**
 * Remplace tout le contenu visible d'un bloc par un texte (nœud texte, jamais
 * d'HTML), en préservant le tampon de validation rendu par React.
 */
function replaceBlocContent(el: HTMLElement, text: string) {
  const badge = el.querySelector(".validated-badge");
  Array.from(el.childNodes).forEach((n) => {
    if (n !== badge) el.removeChild(n);
  });
  const tn = document.createTextNode(text);
  if (badge) el.insertBefore(tn, badge);
  else el.appendChild(tn);
}

export default function EtudeAuditClient({
  etudeId,
  clientNom,
  cover,
  sommaire,
  todo,
  toc,
  blocs,
  sections,
}: EtudeAuditClientProps) {
  const [view, setView] = useState<ViewMode>("ing");
  const [voletClosed, setVoletClosed] = useState(false);
  const [mode, setMode] = useState<"bloc" | "glob">("bloc");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [target, setTarget] = useState<Target>({ kind: "none" });
  const [preview, setPreview] = useState<Preview>(null);
  const [hintAction, setHintAction] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sommaire.length ? [sommaire[0].id] : []),
  );
  const [activeSomm, setActiveSomm] = useState<string | null>(sommaire[0]?.id ?? null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [certKey, setCertKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [blocStates, setBlocStates] = useState<Record<string, BlocLocalState>>(() => {
    const init: Record<string, BlocLocalState> = {};
    for (const b of blocs) {
      init[b.blocKey] = { valide: b.valide, valideAt: b.valideAt, contenu: b.contenuEdite };
    }
    return init;
  });

  const docwrapRef = useRef<HTMLDivElement | null>(null);
  const blocEls = useRef<Map<string, HTMLElement>>(new Map());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Phrase surlignée capturée au relâché de souris (Range + bloc contenant),
  // pour rester valide même si la sélection se vide en cliquant une action.
  const phraseRangeRef = useRef<{ range: Range; blocKey: string } | null>(null);
  // Cible figée au lancement d'une transformation IA, réutilisée à « Appliquer ».
  const iaCaptureRef = useRef<IaCapture | null>(null);
  // Jeton de révision par bloc : incrémenté à chaque application IA pour forcer
  // le remontage de l'élément de lecture (le contenu a été muté hors React).
  const blocRevRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // Comportements interactifs de la maquette (replis internes, graphiques,
  // synthèse des risques, badges de confiance) câblés sur le conteneur du
  // document. Ouvre le tiroir de confiance via setCertKey.
  const { collapseInternal, expandInternal } = useEtudeBehaviors(docwrapRef, {
    etudeId,
    onOpenCert: setCertKey,
  });

  const attachEl = useCallback((key: string, el: HTMLElement | null) => {
    if (el) blocEls.current.set(key, el);
    else blocEls.current.delete(key);
  }, []);

  // --- sélection / cible -------------------------------------------------
  const selectBloc = useCallback(
    (key: string) => {
      if (view !== "ing" || mode !== "bloc" || editingKey) return;
      setSelectedKey(key);
      setTarget({ kind: "bloc", label: key });
      setPreview(null);
    },
    [view, mode, editingKey],
  );

  function onDocMouseUp() {
    if (view !== "ing" || mode !== "bloc" || editingKey) return;
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    const t = (sel?.toString() ?? "").trim();
    if (t.length <= 3 || !sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const blocOf = (node: Node | null): HTMLElement | null => {
      const el = node && node.nodeType === 1 ? (node as HTMLElement) : node?.parentElement ?? null;
      return el?.closest<HTMLElement>("[data-block]") ?? null;
    };
    const startBloc = blocOf(range.startContainer);
    const endBloc = blocOf(range.endContainer);
    // On n'agit que sur une phrase contenue dans un seul bloc : ailleurs la
    // sélection n'est pas une cible exploitable.
    if (!startBloc || startBloc !== endBloc) return;
    const key = startBloc.getAttribute("data-block");
    if (!key) return;

    phraseRangeRef.current = { range: range.cloneRange(), blocKey: key };
    setTarget({ kind: "phrase", text: t.length > 120 ? `${t.slice(0, 120)}…` : t });
    setSelectedKey(null);
    setPreview(null);
  }

  const hasTarget = target.kind === "bloc" || target.kind === "phrase";

  // --- volet : mode de validation ---------------------------------------
  function changeMode(m: "bloc" | "glob") {
    if (editingKey) {
      showToast("Terminez d'abord l'édition en cours");
      return;
    }
    setMode(m);
    setPreview(null);
    if (m === "glob") {
      setSelectedKey(null);
      setTarget({ kind: "none" });
    }
  }

  // --- volet : actions ---------------------------------------------------
  function vAction(a: string) {
    if (mode !== "bloc" || editingKey) return;
    if (!hasTarget) {
      showToast("Sélectionnez d'abord un bloc ou une phrase");
      return;
    }
    if (a === "Modifier manuellement") {
      startEdit();
      return;
    }
    if (a === "Ajouter des sources") {
      setPreview({ kind: "sources" });
      return;
    }
    void runIa(a);
  }

  /** Fige la cible (phrase surlignée prioritaire, sinon bloc) au lancement IA. */
  function captureCible(): IaCapture | null {
    if (target.kind === "phrase") {
      const cap = phraseRangeRef.current;
      if (
        cap &&
        cap.range.startContainer.isConnected &&
        cap.range.endContainer.isConnected
      ) {
        const text = cap.range.toString().trim();
        if (text) return { kind: "phrase", range: cap.range, blocKey: cap.blocKey, text };
      }
      return null;
    }
    if (target.kind === "bloc" && selectedKey) {
      const el = blocEls.current.get(selectedKey);
      const text = el ? readBlocText(el) : "";
      if (text) return { kind: "bloc", blocKey: selectedKey, text };
    }
    return null;
  }

  async function runIa(action: string) {
    const cap = captureCible();
    if (!cap) {
      showToast("Sélectionnez à nouveau un bloc ou une phrase");
      return;
    }
    iaCaptureRef.current = cap;
    setPreview({ kind: "ia", action, status: "loading" });
    const res = await transformerTexte(action, cap.text);
    // L'ingénieur peut avoir fermé l'aperçu ou lancé une autre action entre-temps.
    setPreview((prev) => {
      if (!prev || prev.kind !== "ia" || prev.action !== action || prev.status !== "loading") {
        return prev;
      }
      if (res.ok && res.texte) {
        return { kind: "ia", action, status: "ready", result: res.texte };
      }
      return {
        kind: "ia",
        action,
        status: "error",
        message: res.raison ?? "La transformation a échoué.",
      };
    });
  }

  /** Applique réellement le résultat IA : remplace la sélection puis persiste. */
  function applyIa() {
    const cap = iaCaptureRef.current;
    if (!cap || !preview || preview.kind !== "ia" || preview.status !== "ready" || !preview.result) {
      return;
    }
    const result = preview.result;
    const key = cap.blocKey;
    const el = blocEls.current.get(key);
    if (!el) {
      showToast("Bloc introuvable");
      return;
    }
    const previousContenu = blocStates[key]?.contenu ?? null;

    if (cap.kind === "phrase") {
      if (!cap.range.startContainer.isConnected || !cap.range.toString().trim()) {
        showToast("La sélection n'est plus valide, recommencez");
        return;
      }
      // Remplacement en NŒUD TEXTE : aucune injection HTML possible.
      cap.range.deleteContents();
      cap.range.insertNode(document.createTextNode(result));
    } else {
      replaceBlocContent(el, result);
    }

    // innerHTML relu après mutation (tampon écarté, enveloppe dé-emballée) :
    // c'est la source persistée et ré-affichée.
    const html = readBlocHtml(el);
    // Le contenu visible vient d'être muté hors React (deleteContents /
    // remplacement de nœud). On bascule la clé de l'élément de lecture pour le
    // remonter proprement, au lieu de laisser React réconcilier des nœuds déjà
    // détachés (ce qui ferait échouer removeChild).
    blocRevRef.current.set(key, (blocRevRef.current.get(key) ?? 0) + 1);
    setBlocStates((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { valide: false, valideAt: null, contenu: null }), contenu: html || null },
    }));
    setPreview(null);
    setTarget({ kind: "bloc", label: key });
    setSelectedKey(key);
    phraseRangeRef.current = null;
    iaCaptureRef.current = null;
    if (typeof window !== "undefined") window.getSelection()?.removeAllRanges();

    startTransition(async () => {
      const res = await editBloc(etudeId, key, html);
      if (res.ok) {
        showToast("Transformation appliquée");
      } else {
        setBlocStates((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] ?? { valide: false, valideAt: null, contenu: null }),
            contenu: previousContenu,
          },
        }));
        showToast(res.error ?? "Échec de l'enregistrement");
      }
    });
  }

  function startEdit() {
    if (!selectedKey) {
      showToast("Cliquez un bloc pour l'éditer librement");
      return;
    }
    setEditingKey(selectedKey);
    setSelectedKey(null);
    setPreview({ kind: "edit" });
  }

  function finishEdit(save: boolean) {
    const key = editingKey;
    if (!key) return;
    if (save) {
      const el = blocEls.current.get(key);
      // innerHTML (et non innerText) pour préserver la mise en forme saisie.
      const html = el ? readBlocHtml(el) : "";
      const previousContenu = blocStates[key]?.contenu ?? null;
      // Mise à jour optimiste : on affiche le contenu saisi tout de suite (pas de
      // retour visuel à l'original le temps de l'aller-retour serveur).
      setBlocStates((prev) => ({
        ...prev,
        [key]: { ...(prev[key] ?? { valide: false, valideAt: null, contenu: null }), contenu: html || null },
      }));
      startTransition(async () => {
        const res = await editBloc(etudeId, key, html);
        if (res.ok) {
          showToast("Modifications enregistrées");
        } else {
          // échec : on revient au contenu précédent.
          setBlocStates((prev) => ({
            ...prev,
            [key]: { ...(prev[key] ?? { valide: false, valideAt: null, contenu: null }), contenu: previousContenu },
          }));
          showToast(res.error ?? "Échec de l'enregistrement");
        }
      });
    } else {
      showToast("Édition annulée");
    }
    setEditingKey(null);
    setPreview(null);
  }

  function vValidate() {
    if (editingKey) {
      showToast("Terminez d'abord l'édition en cours");
      return;
    }
    if (mode === "glob") {
      validateEverything();
      return;
    }
    if (selectedKey) {
      stampBloc(selectedKey);
    } else {
      showToast("Sélectionnez d'abord un bloc");
    }
  }

  function stampBloc(key: string) {
    startTransition(async () => {
      const res = await validateBloc(etudeId, key);
      if (res.ok) {
        const at = new Date().toISOString();
        setBlocStates((prev) => ({
          ...prev,
          [key]: { ...(prev[key] ?? { contenu: null }), valide: true, valideAt: at },
        }));
        showToast(`Bloc « ${key} » validé · horodaté`);
      } else {
        showToast(res.error ?? "Échec de la validation");
      }
    });
  }

  function validateEverything() {
    const keys = Array.from(blocEls.current.keys());
    if (keys.length === 0) {
      showToast("Aucun bloc à valider pour l'instant");
      return;
    }
    startTransition(async () => {
      const res = await validateAll(etudeId, keys);
      if (res.ok) {
        const at = new Date().toISOString();
        setBlocStates((prev) => {
          const next = { ...prev };
          for (const k of keys) {
            next[k] = { ...(next[k] ?? { contenu: null }), valide: true, valideAt: at };
          }
          return next;
        });
        showToast("Étude validée · horodatée et signée");
      } else {
        showToast(res.error ?? "Échec de la validation globale");
      }
    });
  }

  const handleUnvalidate = useCallback(
    (key: string) => {
      startTransition(async () => {
        const res = await unvalidateBlocAction(etudeId, key);
        if (res.ok) {
          setBlocStates((prev) => ({
            ...prev,
            [key]: { ...(prev[key] ?? { contenu: null }), valide: false, valideAt: null },
          }));
          showToast(`Validation du bloc « ${key} » retirée`);
        } else {
          showToast(res.error ?? "Échec du retrait de validation");
        }
      });
    },
    [etudeId, showToast],
  );

  function nextBlock() {
    if (editingKey) {
      showToast("Terminez d'abord l'édition");
      return;
    }
    const dw = docwrapRef.current;
    if (!dw) return;
    const els = Array.from(dw.querySelectorAll<HTMLElement>("[data-block]"));
    if (!els.length) return;
    const idx = selectedKey
      ? els.findIndex((e) => e.getAttribute("data-block") === selectedKey)
      : -1;
    const nxt = els[idx + 1];
    if (!nxt) {
      showToast("Dernier bloc disponible");
      return;
    }
    const key = nxt.getAttribute("data-block");
    if (!key) return;
    setSelectedKey(key);
    setTarget({ kind: "bloc", label: key });
    setPreview(null);
    nxt.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // --- navigation / repli ------------------------------------------------
  function navTo(id: string) {
    setOpenSections((prev) => {
      const n = new Set(prev);
      n.add(id);
      return n;
    });
    setActiveSomm(id);
    requestAnimationFrame(() => {
      const dw = docwrapRef.current;
      if (!dw) return;
      const el = dw.querySelector<HTMLElement>(`[data-sect="${id}"]`);
      if (!el) return;
      const top = dw.scrollTop + (el.getBoundingClientRect().top - dw.getBoundingClientRect().top) - 22;
      dw.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }

  function toggleSection(id: string) {
    if (view !== "ing") return;
    setOpenSections((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function collapseAll() {
    setOpenSections(new Set());
    collapseInternal();
  }

  function goHome() {
    docwrapRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setActiveSomm(null);
  }

  function changeView(v: ViewMode) {
    if (editingKey) {
      setEditingKey(null);
    }
    setPreview(null);
    setSelectedKey(null);
    setTarget({ kind: "none" });
    setCertKey(null);
    setView(v);
    // Vues Client / PDF / Word : tout déplier (sections + replis internes),
    // comme la maquette. Le masquage du volet et des éléments .eng-only est
    // assuré par le CSS via data-view.
    if (v !== "ing") {
      setOpenSections(new Set(sommaire.map((s) => s.id)));
      requestAnimationFrame(() => expandInternal());
    }
  }

  function toggleVolet() {
    setVoletClosed((v) => !v);
  }

  // --- contexte des blocs ------------------------------------------------
  const ctxValue: BlocContextValue = useMemo(
    () => ({
      mode,
      view,
      selectedKey,
      editingKey,
      isValidated: (k) => !!blocStates[k]?.valide,
      validatedAt: (k) => blocStates[k]?.valideAt ?? null,
      editedContent: (k) => blocStates[k]?.contenu ?? null,
      editedRev: (k) => blocRevRef.current.get(k) ?? 0,
      selectBloc,
      unvalidateBloc: handleUnvalidate,
      attachEl,
    }),
    [mode, view, selectedKey, editingKey, blocStates, selectBloc, handleUnvalidate, attachEl],
  );

  const wrapperClass = `maq-etude${voletClosed ? " vclosed" : ""}`;

  return (
    <BlocProvider value={ctxValue}>
      <ValeurProvider etudeId={etudeId}>
      <div className={wrapperClass} data-view={view}>
        {/* ===== TOPBAR ===== */}
        <div className="topbar">
          <div className="crumb">
            <Link
              href="/espace-ingenieur/etudes-patrimoniales"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Espace ingénieur
            </Link>
            <span className="sep">·</span>
            <b>{clientNom}</b>
          </div>
          <div className="topbar-right">
            <div className="tnote">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 1v22M5 5l14 14" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Niveau de confiance IA &amp; outils de révision non exportés
            </div>
          </div>
        </div>

        <div className="app">
          {/* ===== SOMMAIRE ===== */}
          <nav className="somm">
            <div className="somm-nav">
              <button type="button" className="somm-act" onClick={goHome}>
                <svg viewBox="0 0 24 24">
                  <path d="M3 11l9-8 9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
                Accueil
              </button>
              <button type="button" className="somm-act" onClick={collapseAll}>
                <svg viewBox="0 0 24 24">
                  <path d="M6 11l6-6 6 6" />
                  <path d="M6 18l6-6 6 6" />
                </svg>
                Tout replier
              </button>
              <div className="somm-view">
                <span className="lbl">Aperçu du document</span>
                {(
                  [
                    ["ing", "Ingénieur"],
                    ["client", "Client"],
                    ["pdf", "PDF"],
                    ["word", "Word"],
                  ] as [ViewMode, string][]
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={view === v ? "on" : ""}
                    onClick={() => changeView(v)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="somm-h">Sommaire</div>
            <div className="somm-doc">Étude patrimoniale</div>
            <div className="somm-part">Audit patrimonial</div>
            {sommaire.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`s1${activeSomm === s.id ? " active" : ""}`}
                onClick={() => navTo(s.id)}
              >
                {s.title}
              </button>
            ))}
            <div className="somm-part">Ingénierie patrimoniale</div>
            {todo.map((t) => (
              <button key={t} type="button" className="s1 todo" disabled>
                {t}
              </button>
            ))}
          </nav>

          {/* ===== DOCUMENT ===== */}
          <div className="docwrap" ref={docwrapRef} onMouseUp={onDocMouseUp}>
            <Cover cover={cover} />
            <TableMatieres toc={toc} onNav={navTo} />
            {sections.map((s) => (
              <EtudeSection
                key={s.id}
                id={s.id}
                tag={s.tag}
                title={s.title}
                open={openSections.has(s.id)}
                interactive={view === "ing"}
                onToggle={() => toggleSection(s.id)}
              >
                {s.body}
              </EtudeSection>
            ))}
          </div>

          {/* ===== VOLET DE RÉVISION ===== */}
          <aside className="volet">
            <div className="vhead">
              <span className="t">
                Volet de révision
                <button
                  type="button"
                  className="help"
                  onClick={() => setHelpOpen(true)}
                  title="Comment ça marche ?"
                >
                  ?
                </button>
              </span>
              <span className="cl" onClick={toggleVolet} title="Refermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </div>

            <div className="vmode">
              <span className={mode === "bloc" ? "on" : ""} onClick={() => changeMode("bloc")}>
                Validation par bloc
              </span>
              <span className={mode === "glob" ? "on" : ""} onClick={() => changeMode("glob")}>
                Validation globale
              </span>
            </div>

            <div className="vconsigne">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 11l3 3 8-8" />
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
              </svg>
              <span>
                <b>Sélectionnez un bloc</b> ou <b>surlignez une phrase</b> avant d&apos;utiliser les
                outils.
              </span>
            </div>

            <div className="vtarget">
              <VTarget mode={mode} target={target} />
            </div>

            <div className="vhint">
              {hintAction ? (
                <>
                  <b>{hintAction}</b> — {ACTS[hintAction]?.d}
                </>
              ) : (
                "Survolez une action pour voir ce qu'elle produit, puis cliquez pour l'appliquer à la sélection."
              )}
            </div>

            {preview ? (
              <PreviewBox
                preview={preview}
                pending={pending}
                onClose={() => setPreview(null)}
                onFinishEdit={finishEdit}
                onApplyIa={applyIa}
              />
            ) : null}

            <div className="vacts">
              <div className="vfam-t">Transformations IA</div>
              {IA_ACTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`vact${mode === "glob" ? " disabled" : ""}`}
                  onClick={() => vAction(a)}
                  onMouseEnter={() => setHintAction(a)}
                  onMouseLeave={() => setHintAction(null)}
                >
                  <Vsvg>{ACT_ICON[a]}</Vsvg> {a}
                </button>
              ))}
              <div className="vfam-t">Sources</div>
              <button
                type="button"
                className={`vact full${mode === "glob" ? " disabled" : ""}`}
                onClick={() => vAction("Ajouter des sources")}
                onMouseEnter={() => setHintAction("Ajouter des sources")}
                onMouseLeave={() => setHintAction(null)}
              >
                <Vsvg>{ACT_ICON["Ajouter des sources"]}</Vsvg> Ajouter des sources
              </button>
              <div className="vfam-t">Édition manuelle</div>
              <button
                type="button"
                className={`vact full${mode === "glob" ? " disabled" : ""}`}
                onClick={() => vAction("Modifier manuellement")}
                onMouseEnter={() => setHintAction("Modifier manuellement")}
                onMouseLeave={() => setHintAction(null)}
              >
                <Vsvg>{ACT_ICON["Modifier manuellement"]}</Vsvg> Modifier manuellement
              </button>
            </div>

            <button type="button" className="vprime" onClick={vValidate} disabled={pending}>
              <Vsvg>
                <path d="M5 12l5 5L20 7" />
              </Vsvg>
              {mode === "glob" ? "Valider toute l'étude" : "Valider ce bloc"}
            </button>
            <button type="button" className="vnext" onClick={nextBlock}>
              <Vsvg>
                <path d="M13 5l7 7-7 7M20 12H4" />
              </Vsvg>
              Bloc suivant
            </button>

            <div className="vfoot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 17l4 4 4-4M7 21V11" />
                <path d="M14 7h7M14 11h4" />
              </svg>
              Chaque validation est horodatée et signée — journal des décisions.
            </div>
          </aside>
        </div>

        {/* ===== ONGLET DE RÉOUVERTURE ===== */}
        <button type="button" className="reopen" onClick={toggleVolet}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ width: 14, height: 14, verticalAlign: -2 }}
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>{" "}
          Volet
        </button>

        {/* ===== TOAST ===== */}
        <div className={`toast${toast ? " on" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12l5 5L20 7" />
          </svg>
          <span>{toast}</span>
        </div>

        {/* ===== AIDE + CONFIANCE (tiroirs) ===== */}
        <div
          className={`backdrop${helpOpen || certKey ? " on" : ""}`}
          onClick={() => {
            setHelpOpen(false);
            setCertKey(null);
          }}
        />
        <CertifDrawer certKey={certKey} onClose={() => setCertKey(null)} />
        <div className={`drawer${helpOpen ? " open" : ""}`}>
          <span className="dx" onClick={() => setHelpOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </span>
          <h3>Le volet de révision, pas à pas</h3>
          {HELP_ROWS.map((row) => (
            <div className="helprow" key={row.title}>
              <div className="hi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d={row.d} />
                </svg>
              </div>
              <div>
                <div className="ht">{row.title}</div>
                <div className="hd">{row.desc}</div>
              </div>
            </div>
          ))}
          <div className="callout">
            Vos annotations et validations restent internes : elles ne figurent pas dans le document
            remis au client.
          </div>
        </div>
      </div>
      </ValeurProvider>
    </BlocProvider>
  );
}

// ---------------------------------------------------------------------------
// Cible du volet (vtarget)
// ---------------------------------------------------------------------------

function VTarget({ mode, target }: { mode: "bloc" | "glob"; target: Target }) {
  if (mode === "glob") {
    return (
      <>
        <span className="lbl">Validation globale</span>
        <span>Tous les blocs de l&apos;étude seront validés en une fois.</span>
      </>
    );
  }
  if (target.kind === "bloc") {
    return (
      <>
        <span className="lbl">Bloc sélectionné</span>
        <strong>{target.label}</strong>
      </>
    );
  }
  if (target.kind === "phrase") {
    return (
      <>
        <span className="lbl">Phrase surlignée</span>
        <span className="sel-txt">« {target.text} »</span>
      </>
    );
  }
  return (
    <>
      <span className="lbl">Sélection</span>
      <span className="empty">Cliquez un bloc de texte, ou surlignez une phrase pour agir dessus.</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Aperçu du volet (vprev) — IA réelle (aperçu + Appliquer/Annuler), édition
// réelle, sources « bientôt »
// ---------------------------------------------------------------------------

function PreviewBox({
  preview,
  pending,
  onClose,
  onFinishEdit,
  onApplyIa,
}: {
  preview: NonNullable<Preview>;
  pending: boolean;
  onClose: () => void;
  onFinishEdit: (save: boolean) => void;
  onApplyIa: () => void;
}) {
  if (preview.kind === "edit") {
    return (
      <div className="vprev">
        <span className="pl">Édition libre en cours</span>
        <div className="pb">
          Modifiez le texte directement dans le document, puis terminez pour enregistrer.
        </div>
        <div className="pa">
          <button type="button" className="ap" onClick={() => onFinishEdit(true)} disabled={pending}>
            {pending ? "Enregistrement…" : "Terminer"}
          </button>
          <button type="button" className="ca" onClick={() => onFinishEdit(false)} disabled={pending}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (preview.kind === "sources") {
    return (
      <div className="vprev">
        <span className="pl">Sources · base ASTRAEOS</span>
        <div className="vsrc">
          <label>
            <input type="checkbox" disabled /> Art. 757 du Code civil — droits du conjoint survivant
          </label>
          <label>
            <input type="checkbox" disabled /> CGI, art. 150 U — plus-values immobilières des
            particuliers
          </label>
          <label>
            <input type="checkbox" disabled /> Décision D-HCSF-2021-7 — taux d&apos;effort maximal
          </label>
        </div>
        <div className="pnote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 8v4m0 4h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Rattachement des sources vérifiées — bientôt disponible.
        </div>
        <div className="pa">
          <button type="button" className="ca" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // preview.kind === "ia"
  if (preview.status === "loading") {
    return (
      <div className="vprev">
        <span className="pl">Aperçu · {preview.action}</span>
        <div className="pb">{ACTS[preview.action]?.r}</div>
        <div className="pnote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 8v4m0 4h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Transformation en cours…
        </div>
        <div className="pa">
          <button type="button" className="ca" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (preview.status === "error") {
    return (
      <div className="vprev">
        <span className="pl">Aperçu · {preview.action}</span>
        <div className="pnote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 8v4m0 4h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          {preview.message ?? "La transformation a échoué."}
        </div>
        <div className="pa">
          <button type="button" className="ca" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // status === "ready" : aperçu réel du texte transformé.
  return (
    <div className="vprev">
      <span className="pl">Aperçu · {preview.action}</span>
      <div className="pb" style={{ whiteSpace: "pre-wrap" }}>
        {preview.result}
      </div>
      <div className="pnote">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 11l3 3 8-8" />
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
        </svg>
        « Appliquer » remplace la sélection dans le document, puis enregistre.
      </div>
      <div className="pa">
        <button type="button" className="ap" onClick={onApplyIa} disabled={pending}>
          {pending ? "Application…" : "Appliquer"}
        </button>
        <button type="button" className="ca" onClick={onClose} disabled={pending}>
          Annuler
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section (head repliable + corps = slot)
// ---------------------------------------------------------------------------

function EtudeSection({
  id,
  tag,
  title,
  open,
  interactive,
  onToggle,
  children,
}: {
  id: string;
  tag: string;
  title: string;
  open: boolean;
  interactive: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`sect${open ? " foldopen" : ""}`} id={id} data-sect={id}>
      <div className="sect-head" onClick={interactive ? onToggle : undefined}>
        <span className="sect-tag">{tag}</span>
        <div className="sect-hrow">
          <h2>
            {title}
            <span className="bar" />
          </h2>
          <div className="sect-hctrl">
            <span className="sect-chev">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div className="sect-body">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page de garde
// ---------------------------------------------------------------------------

function Cover({ cover }: { cover: CoverData }) {
  return (
    <section className="cover">
      <div className="leaf-bg">
        <svg
          viewBox="0 0 900 1180"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <g id="lf">
              <path
                d="M0 0 C-7 -13 -7 -30 0 -42 C7 -30 7 -13 0 0 Z"
                fill="var(--gold-100)"
              />
              <path d="M0 -2 L0 -40" stroke="var(--gold-300)" strokeWidth={1} opacity={0.5} />
            </g>
          </defs>
          <g opacity={0.7}>
            <use href="#lf" transform="translate(70 60) rotate(20) scale(1.3)" />
            <use href="#lf" transform="translate(150 120) rotate(-35) scale(1.1)" />
            <use href="#lf" transform="translate(60 180) rotate(60) scale(.9)" />
            <use href="#lf" transform="translate(220 70) rotate(10) scale(1.2)" />
            <use href="#lf" transform="translate(300 150) rotate(-20) scale(.8)" />
            <use href="#lf" transform="translate(820 70) rotate(-25) scale(1.3)" />
            <use href="#lf" transform="translate(740 130) rotate(40) scale(1)" />
            <use href="#lf" transform="translate(850 180) rotate(-60) scale(.9)" />
            <use href="#lf" transform="translate(660 80) rotate(-10) scale(1.1)" />
            <use href="#lf" transform="translate(600 160) rotate(25) scale(.8)" />
            <use href="#lf" transform="translate(80 1080) rotate(200) scale(1.2)" />
            <use href="#lf" transform="translate(170 1010) rotate(150) scale(1)" />
            <use href="#lf" transform="translate(50 980) rotate(250) scale(.9)" />
            <use href="#lf" transform="translate(260 1090) rotate(190) scale(1.1)" />
            <use href="#lf" transform="translate(330 1010) rotate(220) scale(.8)" />
            <use href="#lf" transform="translate(840 1080) rotate(160) scale(1.3)" />
            <use href="#lf" transform="translate(750 1010) rotate(210) scale(1)" />
            <use href="#lf" transform="translate(860 970) rotate(130) scale(.9)" />
            <use href="#lf" transform="translate(650 1090) rotate(180) scale(1.1)" />
            <use href="#lf" transform="translate(580 1000) rotate(230) scale(.8)" />
          </g>
        </svg>
      </div>

      <div className="cover-inner">
        <svg
          className="logo-tree"
          viewBox="0 0 120 130"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="ASTRAEOS"
        >
          <path
            d="M60 130 L60 78 M60 96 L46 84 M60 96 L74 84 M60 110 L50 102 M60 110 L70 102"
            stroke="var(--gold-deep)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <path d="M55 130 L65 130 L63 86 L57 86 Z" fill="var(--gold-deep)" />
          <g fill="var(--gold-300)">
            <circle cx="60" cy="42" r="20" />
            <circle cx="42" cy="50" r="15" />
            <circle cx="78" cy="50" r="15" />
            <circle cx="50" cy="34" r="13" />
            <circle cx="72" cy="34" r="13" />
            <circle cx="60" cy="58" r="14" />
            <circle cx="35" cy="40" r="10" />
            <circle cx="85" cy="40" r="10" />
          </g>
          <g fill="var(--gold)">
            <circle cx="56" cy="40" r="3.4" />
            <circle cx="66" cy="46" r="3.4" />
            <circle cx="48" cy="46" r="3" />
            <circle cx="72" cy="40" r="3" />
            <circle cx="60" cy="50" r="3.4" />
            <circle cx="52" cy="56" r="2.8" />
            <circle cx="68" cy="56" r="2.8" />
            <circle cx="44" cy="38" r="2.6" />
            <circle cx="76" cy="38" r="2.6" />
            <circle cx="60" cy="32" r="3" />
          </g>
        </svg>
        <div className="logo-word">ASTRAEOS</div>

        <div className="title-box">
          <div className="tt">{cover.titre}</div>
          <div className="dd">{cover.sousTitre}</div>
          <div className="nm">
            {cover.noms.length > 0
              ? cover.noms.map((n, i) => (
                  <span key={i}>
                    {n}
                    {i < cover.noms.length - 1 ? <br /> : null}
                  </span>
                ))
              : "À compléter"}
          </div>
        </div>
      </div>

      <div className="cover-foot">
        <div className="cf-row">
          <span className="cf-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span>
            <b>Adresse :</b> À compléter
          </span>
        </div>
        <div className="cf-row">
          <span className="cf-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <span>
            <b>Adresse électronique :</b> À compléter
          </span>
        </div>
        <div className="cf-row">
          <span className="cf-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
            </svg>
          </span>
          <span>
            <b>Téléphone :</b> À compléter
          </span>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Table des matières
// ---------------------------------------------------------------------------

function TableMatieres({ toc, onNav }: { toc: TocEntry[]; onNav: (id: string) => void }) {
  return (
    <section className="toc-page" id="toc">
      <h2 className="toc-title">Table des matières</h2>
      <div className="toc-list">
        {toc.map((entry, i) => {
          if (entry.kind === "part") {
            return (
              <div className="toc-part" key={`p-${i}`}>
                <span className="t">{entry.label}</span>
                <span className="dots" />
              </div>
            );
          }
          if (entry.kind === "lvl1") {
            return (
              <div
                className="toc-row lvl1"
                key={`l1-${i}`}
                onClick={() => onNav(entry.go)}
                role="button"
                tabIndex={0}
              >
                <span className="t">{entry.label}</span>
                <span className="dots" />
              </div>
            );
          }
          if (entry.kind === "lvl1-todo") {
            return (
              <div className="toc-row lvl1" key={`lt-${i}`} style={{ color: "var(--navy-200)", cursor: "default" }}>
                <span className="t">{entry.label}</span>
                <span className="dots" />
              </div>
            );
          }
          return (
            <div className="toc-row lvl2" key={`l2-${i}`}>
              <span className="t">{entry.label}</span>
              <span className="dots" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tiroir de confiance (CERTIF / SECT) — porte openCertif / openSect de la
// maquette. Rendu unifié : les champs présents décident des blocs affichés
// (les entrées SECT portent un « Périmètre analysé », les entrées CERTIF les
// documents / données / textes de loi / conclusion).
// ---------------------------------------------------------------------------

function MIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d={d} />
    </svg>
  );
}

function Mblock({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="mblock">
      <div className="mh">
        <MIcon d={icon} /> {title}
      </div>
      {children}
    </div>
  );
}

function PanelList({ items }: { items?: string[] }) {
  if (items && items.length) {
    return (
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  }
  return <p className="note">Aucun texte spécifique mobilisé pour ce constat.</p>;
}

function certifColor(p: number) {
  return p >= 90 ? "#3E8E5A" : p >= 80 ? "#C68E0E" : "#B5673A";
}

function Cdet({ det }: { det?: CertifDet[] }) {
  if (!det || !det.length) return null;
  return (
    <Mblock icon="M4 20h16M7 20v-6M12 20V8M17 20v-9" title="Décomposition de la confiance">
      <div className="cdet">
        {det.map((x, i) => (
          <div className="cdrow" key={i}>
            <span className="cdl">{x.l}</span>
            <span className="cdbar">
              <i style={{ width: `${x.p}%`, background: certifColor(x.p) }} />
            </span>
            <span className="cdp" style={{ color: certifColor(x.p) }}>
              {x.p} %
            </span>
          </div>
        ))}
        <div className="cdnote">
          La confiance globale est la moyenne pondérée de ces composantes : un constat factuel
          (inventaire, relevés) pèse davantage qu&rsquo;une estimation ou une projection.
        </div>
      </div>
    </Mblock>
  );
}

function Cfia({ fia, ver }: { fia?: string[]; ver?: string[] }) {
  const hasF = !!(fia && fia.length);
  const hasV = !!(ver && ver.length);
  if (!hasF && !hasV) return null;
  return (
    <Mblock icon="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7z" title="Fiabilité du constat">
      <div className="cfia">
        {hasF ? (
          <div className="cfia-col cfia-ok">
            <div className="cfia-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Ce qui est fiable
            </div>
            <ul>
              {fia!.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {hasV ? (
          <div className="cfia-col cfia-warn">
            <div className="cfia-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3" />
                <path d="M12 8.5v5M12 16h.01" />
              </svg>
              Ce qui reste à vérifier
            </div>
            <ul>
              {ver!.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Mblock>
  );
}

function CertifDrawer({ certKey, onClose }: { certKey: string | null; onClose: () => void }) {
  const panel: CertifPanel | null = certKey ? getCertifPanel(certKey) : null;
  const isSect = !!panel?.scope;
  return (
    <div className={`drawer${certKey ? " open" : ""}`}>
      <span className="dx" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
      {panel ? (
        <>
          <span className="tag t-gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>{" "}
            {panel.lvl}
          </span>
          <h3>{panel.h}</h3>
          <div className="note" style={{ marginBottom: 12 }}>
            {isSect
              ? "Ce qui a été analysé et le niveau de confiance — visible côté ingénieur uniquement."
              : "Comment l’IA est arrivée à cette conclusion — visible côté ingénieur uniquement."}
          </div>
          {panel.scope ? (
            <Mblock icon="M4 6h16M4 12h10M4 18h16" title="Périmètre analysé">
              {panel.scope.length ? (
                <ul>
                  {panel.scope.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              ) : null}
            </Mblock>
          ) : null}
          <Mblock icon="M4 19V5M4 15l5-4 4 3 7-7" title="Logique de raisonnement">
            <p>{panel.rais}</p>
          </Mblock>
          <Cdet det={panel.det} />
          <Cfia fia={panel.fia} ver={panel.ver} />
          {panel.docs ? (
            <Mblock
              icon="M14 3v4a1 1 0 0 0 1 1h4 M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7z"
              title="Documents analysés"
            >
              <PanelList items={panel.docs} />
            </Mblock>
          ) : null}
          {panel.data ? (
            <Mblock icon="M3 3v18h18 M7 14l3-3 3 3 4-5" title="Données prises en compte">
              <PanelList items={panel.data} />
            </Mblock>
          ) : null}
          {panel.loi ? (
            <Mblock icon="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7z" title="Textes de loi mobilisés">
              <PanelList items={panel.loi} />
            </Mblock>
          ) : null}
          {panel.concl ? (
            <Mblock
              icon="M9 12l2 2 4-4 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"
              title="Éléments de conclusion"
            >
              <p>{panel.concl}</p>
            </Mblock>
          ) : null}
          {!isSect ? (
            <div className="callout">
              Vous pouvez ajuster l’analyse via le volet de révision (Approfondir, Corriger,
              Justifier…) ; la décision finale reste celle de l’ingénieur.
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
