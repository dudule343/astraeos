"use client";

/**
 * Comportements interactifs du DOCUMENT D'AUDIT portés depuis la maquette
 * (« 4 - Etude_Patrimoniale_Partie Audit.html », bloc <script> 3898-5119).
 *
 * Ce hook s'attache au conteneur (.docwrap) du document et câble, par
 * délégation sur les CLASSES de la maquette (préservées par les sections), tout
 * le JS non géré par React :
 *
 *  1. Replis internes — .shead → .page.modfold (toggleMod), .ab-h → .ablock.open
 *     (toggleAb), .sub-h → .subacc.open (toggleSub), .synth-h → .synthacc.open
 *     (toggleSynth), .acc-h → .acc.open (toggleAcc, enveloppes « Détail par
 *     enveloppe »), .pvacc-h → .pvacc.open (plus-value immobilière), .ch →
 *     .copp.foldopen (toggleCopp, coût d'opportunité), lignes de dette
 *     (.grp-dette → toggleDetteRows). Le repli de SECTION reste géré par
 *     EtudeSection côté React.
 *  2. Graphiques — anneaux à segments (.donutbox / .seg) et anneaux à légende
 *     (.donut-block, initDonuts) en survol ; bascule Monsieur / Madame des
 *     barres divergentes (.diverge-wrap, initDiverge). Aucune valeur-exemple
 *     n'est injectée : les chiffres restent ceux du document (« — » si vide).
 *  3. Synthèse des risques — cycle de gravité (.prio → cyclePrio, persistance
 *     localStorage), filtres par thématique / priorité, « Tout déplier », « Tout
 *     afficher », et COMPTEURS recalculés depuis les cartes réellement présentes
 *     dans le DOM (jamais un nombre figé).
 *  4. Tiroir de confiance — clic sur un badge .cert / .synth-cert (data-certif)
 *     → ouverture du panneau via le callback `onOpenCert` (rendu côté React à
 *     partir de certif-data.ts).
 *
 * Le hook expose `collapseInternal()` et `expandInternal()` pour que la coquille
 * (bouton « Tout replier », bascule de mode de vue) pilote les replis internes
 * en cohérence avec l'état React des sections.
 *
 * Frontière client/serveur : fichier « use client », aucun import serveur.
 */

import { useCallback, useEffect, useRef } from "react";

type Behaviors = {
  /** Replie tous les replis internes (pages, accordéons) — sans toucher aux sections. */
  collapseInternal: () => void;
  /** Déplie tous les replis internes — utilisé par les vues Client / PDF / Word. */
  expandInternal: () => void;
};

type Options = {
  etudeId: string;
  /** ouvre le tiroir de confiance pour une clé CERTIF / SECT. */
  onOpenCert: (key: string) => void;
};

const PRIO_ORDER = ["todo", "haute", "moy", "faible"] as const;
const PRIO_LABELS: Record<string, string> = {
  todo: "Priorité à définir",
  haute: "Priorité élevée",
  moy: "Priorité moyenne",
  faible: "Priorité faible",
};

export function useEtudeBehaviors(
  rootRef: React.RefObject<HTMLElement | null>,
  { etudeId, onOpenCert }: Options,
): Behaviors {
  // Drapeau « tout déplié » de la synthèse des risques (équiv. synrExp maquette).
  const synrExpanded = useRef(false);
  // Callback stable référencé depuis l'effet de câblage (monté une seule fois).
  const onOpenCertRef = useRef(onOpenCert);
  useEffect(() => {
    onOpenCertRef.current = onOpenCert;
  }, [onOpenCert]);

  const prioStoreKey = useCallback(
    (pi: string | null) => `astraeos:synr-prio:${etudeId}:${pi ?? ""}`,
    [etudeId],
  );

  // --- Synthèse des risques : compteurs + gravité ------------------------
  const synrBoard = useCallback((root: HTMLElement) => {
    const counts: Record<string, number> = { todo: 0, haute: 0, moy: 0, faible: 0 };
    root.querySelectorAll<HTMLElement>("#risques .prio").forEach((el) => {
      const k = el.getAttribute("data-prio") || "todo";
      counts[k] = (counts[k] ?? 0) + 1;
    });
    (["todo", "haute", "moy", "faible"] as const).forEach((k) => {
      const e = root.querySelector<HTMLElement>(`#synrp-${k}`);
      if (e) e.textContent = String(counts[k] ?? 0);
    });
  }, []);

  const setPrio = useCallback((el: HTMLElement, v: string) => {
    el.setAttribute("data-prio", v);
    el.className = `prio prio-${v} eng-only`;
    const lab = el.querySelector<HTMLElement>(".plab");
    if (lab) lab.textContent = PRIO_LABELS[v] ?? PRIO_LABELS.todo;
  }, []);

  const cyclePrio = useCallback(
    (root: HTMLElement, el: HTMLElement) => {
      const current = el.getAttribute("data-prio") || "todo";
      const next = PRIO_ORDER[(PRIO_ORDER.indexOf(current as never) + 1) % PRIO_ORDER.length];
      setPrio(el, next);
      try {
        localStorage.setItem(prioStoreKey(el.getAttribute("data-pi")), next);
      } catch {
        /* localStorage indisponible : la gravité reste de session */
      }
      synrBoard(root);
    },
    [prioStoreKey, setPrio, synrBoard],
  );

  // --- Synthèse des risques : filtres ------------------------------------
  const synrModules = (root: HTMLElement) =>
    Array.from(root.querySelectorAll<HTMLElement>('#risques [id^="synr-t-"]'));
  const synrFiches = (root: HTMLElement) =>
    Array.from(root.querySelectorAll<HTMLElement>('#risques [id^="synr-t-"] .ablock'));

  const synrEnsureOpen = (root: HTMLElement) => {
    root.querySelector<HTMLElement>("#risques")?.classList.add("foldopen");
  };

  const synrFilterReset = useCallback((root: HTMLElement) => {
    synrModules(root).forEach((m) => {
      m.style.display = "";
      m.querySelector<HTMLElement>(".page")?.classList.add("modfold");
    });
    synrFiches(root).forEach((a) => {
      a.style.display = "";
      a.classList.add("fold");
    });
    root.querySelectorAll<HTMLElement>("#risques .filt.on").forEach((e) => e.classList.remove("on"));
    root.querySelector<HTMLElement>("#synrReset")?.setAttribute("hidden", "");
  }, []);

  const synrFilterTheme = useCallback(
    (root: HTMLElement, n: string) => {
      synrFilterReset(root);
      synrEnsureOpen(root);
      synrModules(root).forEach((m) => {
        m.style.display = m.id === `synr-t-${n}` ? "" : "none";
      });
      const mod = root.querySelector<HTMLElement>(`#synr-t-${n}`);
      if (mod) {
        mod.querySelector<HTMLElement>(".page")?.classList.remove("modfold");
        mod.querySelectorAll<HTMLElement>(".ablock").forEach((a) => a.classList.remove("fold"));
      }
      root.querySelector<HTMLElement>(`#risques .synr-tcard[data-ft="${n}"]`)?.classList.add("on");
      root.querySelector<HTMLElement>("#synrReset")?.removeAttribute("hidden");
      root.querySelector<HTMLElement>("#risques")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [synrFilterReset],
  );

  const synrFilterPrio = useCallback(
    (root: HTMLElement, level: string) => {
      synrFilterReset(root);
      synrEnsureOpen(root);
      synrFiches(root).forEach((a) => {
        const pr = a.querySelector<HTMLElement>(".prio");
        const v = pr ? pr.getAttribute("data-prio") : "todo";
        if (v === level) {
          a.style.display = "";
          a.classList.remove("fold");
        } else {
          a.style.display = "none";
        }
      });
      synrModules(root).forEach((m) => {
        const any = Array.from(m.querySelectorAll<HTMLElement>(".ablock")).some(
          (a) => a.style.display !== "none",
        );
        m.style.display = any ? "" : "none";
        if (any) m.querySelector<HTMLElement>(".page")?.classList.remove("modfold");
      });
      root.querySelector<HTMLElement>(`#risques .synr-pill[data-fp="${level}"]`)?.classList.add("on");
      root.querySelector<HTMLElement>("#synrReset")?.removeAttribute("hidden");
      root.querySelector<HTMLElement>("#risques")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [synrFilterReset],
  );

  const synrToggleAll = useCallback((root: HTMLElement, btn: HTMLElement) => {
    synrExpanded.current = !synrExpanded.current;
    const exp = synrExpanded.current;
    root.querySelector<HTMLElement>("#risques")?.classList.add("foldopen");
    root.querySelectorAll<HTMLElement>("#risques .page").forEach((p) => {
      p.classList.toggle("modfold", !exp);
    });
    root.querySelectorAll<HTMLElement>("#risques .ablock").forEach((a) => {
      a.classList.toggle("fold", !exp);
    });
    btn.textContent = exp ? "Tout replier" : "Tout déplier";
  }, []);

  // --- Replis internes ---------------------------------------------------
  const collapseInternal = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".page").forEach((p) => p.classList.add("modfold"));
    root.querySelectorAll<HTMLElement>(".ablock").forEach((a) => a.classList.add("fold"));
    synrExpanded.current = false;
  }, [rootRef]);

  const expandInternal = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".page").forEach((p) => p.classList.remove("modfold"));
    root.querySelectorAll<HTMLElement>(".ablock").forEach((a) => a.classList.remove("fold"));
    root.querySelectorAll<HTMLElement>(".synthacc").forEach((s) => s.classList.add("open"));
    synrExpanded.current = true;
  }, [rootRef]);

  // --- Câblage des écouteurs (monté une fois, après rendu des sections) --
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];

    // Délégation des clics : replis, badges de confiance, board des risques.
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;

      const badge = t.closest<HTMLElement>("[data-certif]");
      if (badge && root.contains(badge)) {
        e.stopPropagation();
        const key = badge.getAttribute("data-certif");
        if (key) onOpenCertRef.current(key);
        return;
      }

      const prio = t.closest<HTMLElement>(".prio");
      if (prio && root.contains(prio)) {
        e.stopPropagation();
        cyclePrio(root, prio);
        return;
      }

      const tcard = t.closest<HTMLElement>(".synr-tcard.filt");
      if (tcard && root.contains(tcard)) {
        e.preventDefault();
        e.stopPropagation();
        const ft = tcard.getAttribute("data-ft");
        if (ft) synrFilterTheme(root, ft);
        return;
      }

      const pill = t.closest<HTMLElement>(".synr-pill.filt");
      if (pill && root.contains(pill)) {
        e.stopPropagation();
        const fp = pill.getAttribute("data-fp");
        if (fp) synrFilterPrio(root, fp);
        return;
      }

      if (t.closest("#synrReset")) {
        e.stopPropagation();
        synrFilterReset(root);
        return;
      }

      const synrBtn = t.closest<HTMLElement>(".synr-btn:not(.synr-btn-reset)");
      if (synrBtn && root.contains(synrBtn)) {
        e.stopPropagation();
        synrToggleAll(root, synrBtn);
        return;
      }

      // Lignes de dette regroupées (table du passif).
      const detteHead = t.closest<HTMLElement>(".grp-dette");
      if (detteHead && root.contains(detteHead)) {
        toggleDetteRows(detteHead);
        return;
      }

      // Enveloppes « Détail par enveloppe » (.acc) — financier, immobilier,
      // passif. Clic sur .acc-h → bascule .acc.open (le chevron .acc-h .chev
      // pivote via le CSS .acc.open). Les enveloppes marquées .empty ne se
      // déplient pas, à l'identique de toggleAcc() dans la maquette.
      const accHead = t.closest<HTMLElement>(".acc-h");
      if (accHead && root.contains(accHead)) {
        const acc = accHead.closest<HTMLElement>(".acc");
        if (acc && !acc.classList.contains("empty")) acc.classList.toggle("open");
        return;
      }

      // Plus-value immobilière (.pvacc) : clic sur .pvacc-h → bascule
      // .pvacc.open (chevron .pvchev piloté par le CSS), comme la maquette
      // (onclick="this.parentElement.classList.toggle('open')").
      const pvaccHead = t.closest<HTMLElement>(".pvacc-h");
      if (pvaccHead && root.contains(pvaccHead)) {
        pvaccHead.parentElement?.classList.toggle("open");
        return;
      }

      // Coût d'opportunité / capacité de refinancement (.copp) : clic sur
      // l'en-tête .ch → bascule .copp.foldopen (chevron .cch). Reproduit
      // toggleCopp() : seuls les blocs munis d'un chevron .cch sont repliables
      // (le bloc financier « Projection sur 10 ans » est figé ouvert, sans
      // chevron, donc non câblé) et un clic sur les boutons d'hypothèse
      // (.hbtn) ou les liens de méthode (.srcbtn) ne replie pas le bloc.
      const coppHead = t.closest<HTMLElement>(".ch");
      if (
        coppHead &&
        root.contains(coppHead) &&
        coppHead.parentElement?.classList.contains("copp") &&
        coppHead.querySelector(".cch")
      ) {
        if (!t.closest(".hbtn, .srcbtn")) coppHead.parentElement.classList.toggle("foldopen");
        return;
      }

      // Replis internes (ne stoppent PAS la propagation : un clic sur l'en-tête
      // d'un bloc le déplie ET le sélectionne pour révision, comme la maquette).
      const synthH = t.closest<HTMLElement>(".synth-h");
      if (synthH && root.contains(synthH)) {
        synthH.closest(".synthacc")?.classList.toggle("open");
        return;
      }
      const subH = t.closest<HTMLElement>(".sub-h");
      if (subH && root.contains(subH)) {
        subH.closest(".subacc")?.classList.toggle("open");
        return;
      }
      const abH = t.closest<HTMLElement>(".ab-h");
      if (abH && root.contains(abH)) {
        abH.parentElement?.classList.toggle("open");
        return;
      }
      const shead = t.closest<HTMLElement>(".shead");
      if (shead && root.contains(shead)) {
        shead.closest(".page")?.classList.toggle("modfold");
        return;
      }
    };
    root.addEventListener("click", onClick);
    cleanups.push(() => root.removeEventListener("click", onClick));

    // Anneaux à segments (.donutbox / .seg) : survol = mise en avant, sans
    // toucher aux valeurs du centre (qui restent honnêtes « — » si non saisies).
    root.querySelectorAll<HTMLElement>(".donutbox").forEach((box) => {
      const segs = Array.from(box.querySelectorAll<HTMLElement>("circle.seg"));
      const boxId = box.id.replace(/^box-/, "");
      const enter = (seg: HTMLElement) => {
        box.classList.add("hovering");
        segs.forEach((s) => s.classList.remove("hot"));
        seg.classList.add("hot");
        const i = seg.id.replace(`seg-${boxId}-`, "");
        const legRoot = box.closest(".donutwrap") ?? box.parentElement ?? root;
        legRoot.querySelectorAll<HTMLElement>(".leg .lr.hot").forEach((l) => l.classList.remove("hot"));
        legRoot.querySelector<HTMLElement>(`#leg-${boxId}-${i}`)?.classList.add("hot");
      };
      const leave = () => {
        box.classList.remove("hovering");
        segs.forEach((s) => s.classList.remove("hot"));
        const legRoot = box.closest(".donutwrap") ?? box.parentElement ?? root;
        legRoot.querySelectorAll<HTMLElement>(".leg .lr.hot").forEach((l) => l.classList.remove("hot"));
      };
      segs.forEach((seg) => {
        const onEnter = () => enter(seg);
        seg.addEventListener("mouseenter", onEnter);
        cleanups.push(() => seg.removeEventListener("mouseenter", onEnter));
      });
      box.addEventListener("mouseleave", leave);
      cleanups.push(() => box.removeEventListener("mouseleave", leave));
    });

    // Anneaux à légende (.donut-block, variante initDonuts de la maquette).
    root.querySelectorAll<HTMLElement>(".donut-block").forEach((blk) => {
      const svg = blk.querySelector("svg");
      if (!svg) return;
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
      const texts = svg.querySelectorAll("text");
      const ctop = texts[0] ?? null;
      const cval = texts[1] ?? null;
      const rows = Array.from(blk.querySelectorAll<HTMLElement>(".donut-legend .lg"));
      if (!paths.length) return;
      const dTop = ctop?.textContent ?? "";
      const dVal = cval?.textContent ?? "";
      const hi = (i: number) => {
        paths.forEach((p, j) => {
          if (j === i) {
            p.style.opacity = "1";
            p.style.stroke = "#FAF8F3";
            p.style.strokeWidth = "2";
          } else {
            p.style.opacity = ".3";
            p.style.stroke = "none";
          }
        });
        rows.forEach((r, j) => r.classList.toggle("hot", j === i));
        if (rows[i] && ctop && cval) {
          const lp = rows[i].querySelector(".lp");
          const lv = rows[i].querySelector(".lv");
          ctop.textContent = lp ? (lp.textContent ?? "").trim() : dTop;
          cval.textContent = lv ? (lv.textContent ?? "").trim() : dVal;
        }
      };
      const reset = () => {
        paths.forEach((p) => {
          p.style.opacity = "1";
          p.style.stroke = "none";
        });
        rows.forEach((r) => r.classList.remove("hot"));
        if (ctop) ctop.textContent = dTop;
        if (cval) cval.textContent = dVal;
      };
      paths.forEach((p, i) => {
        const onEnter = () => hi(i);
        p.addEventListener("mouseenter", onEnter);
        p.addEventListener("mouseleave", reset);
        cleanups.push(() => {
          p.removeEventListener("mouseenter", onEnter);
          p.removeEventListener("mouseleave", reset);
        });
      });
      rows.forEach((r, i) => {
        const onEnter = () => hi(i);
        r.addEventListener("mouseenter", onEnter);
        r.addEventListener("mouseleave", reset);
        cleanups.push(() => {
          r.removeEventListener("mouseenter", onEnter);
          r.removeEventListener("mouseleave", reset);
        });
      });
    });

    // Barres divergentes (.diverge-wrap) : isolation Monsieur / Madame au survol.
    root.querySelectorAll<HTMLElement>(".diverge-wrap").forEach((w) => {
      const hm = w.querySelector<HTMLElement>('[data-side="m"]');
      const hf = w.querySelector<HTMLElement>('[data-side="mme"]');
      if (hm) {
        const on = () => w.classList.add("iso-m");
        const off = () => w.classList.remove("iso-m");
        hm.addEventListener("mouseenter", on);
        hm.addEventListener("mouseleave", off);
        cleanups.push(() => {
          hm.removeEventListener("mouseenter", on);
          hm.removeEventListener("mouseleave", off);
        });
      }
      if (hf) {
        const on = () => w.classList.add("iso-mme");
        const off = () => w.classList.remove("iso-mme");
        hf.addEventListener("mouseenter", on);
        hf.addEventListener("mouseleave", off);
        cleanups.push(() => {
          hf.removeEventListener("mouseenter", on);
          hf.removeEventListener("mouseleave", off);
        });
      }
    });

    // Synthèse des risques : restaurer les gravités enregistrées, puis compter.
    root.querySelectorAll<HTMLElement>("#risques .prio").forEach((el) => {
      try {
        const v = localStorage.getItem(prioStoreKey(el.getAttribute("data-pi")));
        if (v) setPrio(el, v);
      } catch {
        /* localStorage indisponible */
      }
    });
    synrBoard(root);

    return () => {
      cleanups.forEach((fn) => fn());
    };
    // Câblage unique : les helpers sont stables (useCallback), les sections ne
    // se re-montent pas (replis = bascules de classes, pas de re-render React).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef]);

  return { collapseInternal, expandInternal };
}

/** Déplie/replie les lignes détaillées d'un groupe de dettes (table du passif). */
function toggleDetteRows(head: HTMLElement) {
  const open = head.classList.toggle("open");
  const chev = head.querySelector<HTMLElement>(".dette-chev");
  if (chev) chev.style.transform = open ? "rotate(180deg)" : "";
  let row = head.nextElementSibling as HTMLElement | null;
  while (row && row.classList.contains("dette-row")) {
    row.style.display = open ? "table-row" : "none";
    row = row.nextElementSibling as HTMLElement | null;
  }
}
