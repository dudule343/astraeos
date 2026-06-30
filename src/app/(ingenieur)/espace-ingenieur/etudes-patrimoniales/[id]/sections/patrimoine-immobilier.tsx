/**
 * Sous-section « Patrimoine immobilier » du document d'audit (maquette, module
 * .immo-mod, lignes 1762-2263 de la partie Audit).
 *
 * Portage fidèle de la maquette (mêmes rubriques, mêmes libellés, mêmes classes,
 * mêmes SVG, mêmes états repliés .modfold / .acc / .ablock.fold pour que le JS
 * d'accordéon global s'y raccroche ensuite). Server Component : aucun gestionnaire
 * JS ici, les comportements (toggles, graphiques, panneaux CERTIF) sont câblés
 * après par le document.
 *
 * Branchement au RÉEL :
 * - les dix data-block de la maquette (intro de thème, sept analyses
 *   risque/opportunité/optimisation, capacité de refinancement, coût
 *   d'opportunité) sont enveloppés dans <Bloc> avec leur clé byte-exacte, donc
 *   sélectionnables, éditables et validables ;
 * - les noms du foyer viennent de `donnees` ;
 * - tous les MONTANTS du patrimoine immobilier (valorisations, répartition,
 *   loyers, capital restant dû, charges, plus-values, parts de propriété, dates
 *   d'acquisition) n'existent pas en base : ils sont lus dans `donnees.valeurs`
 *   (nuls par défaut) et rendus « — » (état vide honnête, éditable) plutôt que
 *   recopiés depuis les chiffres-exemple de la maquette.
 *
 * Sont conservés verbatim : les libellés, les textes éditoriaux et
 * méthodologiques, les niveaux de confiance des analyses (CERTIF), les
 * références juridiques et fiscales, ainsi que les seuils et taux réglementaires
 * (seuil LMP, amendes maximales, taux de plus-value, quotités d'hypothèse).
 */

import type { ReactNode } from "react";

import { Bloc } from "../Bloc";
import {
  householdNameFromDonnees,
  type EtudeDonnees,
} from "../../../../_data/etudes-patrimoniales";
import "../../../../_styles/sections/patrimoine-immobilier.css";

const DASH = "—";

/** Montant éditable du patrimoine : lu dans `donnees.valeurs`, « — » si absent. */
function montant(donnees: EtudeDonnees, key: string): string {
  const v = donnees.valeurs[key];
  if (v == null || v === "") return DASH;
  if (typeof v === "number") return `${new Intl.NumberFormat("fr-FR").format(v)} €`;
  return v;
}

// ---------------------------------------------------------------------------
// Icônes (chemins SVG repris tels quels de la maquette)
// ---------------------------------------------------------------------------

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ConstatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
    </svg>
  );
}

function ImpactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 15l5-4 4 3 7-7" />
    </svg>
  );
}

function JustifIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function FondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3v18M5 21h14M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
    </svg>
  );
}

function FootArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function FinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21h18M4 10h16M5 10l7-6 7 6M6 10v11M18 10v11M10 10v11M14 10v11" />
    </svg>
  );
}

function OwnersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16 6a3 3 0 0 1 0 6M21 20c0-2.6-1.7-4.3-4-4.8" />
    </svg>
  );
}

function CarrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LawBookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 4a1 1 0 0 1 1-1h13v18H6a1 1 0 0 1-1-1z" />
      <path d="M9 3v18" />
    </svg>
  );
}

function LawFileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4M7 21h10a2 2 0 0 0 2-2V8l-5-5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function LawCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function LawScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3v18M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
    </svg>
  );
}

function InfoNoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 16v-5" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Fragments réutilisés
// ---------------------------------------------------------------------------

function Cert({ label, variant }: { label: string; variant: "c-forte" | "c-moy" }) {
  return (
    <span className={`cert ${variant} eng-only`}>
      <span>{label}</span>
      <span className="co">
        <EyeIcon />
      </span>
    </span>
  );
}

function Law({
  icon,
  kind,
  children,
}: {
  icon: ReactNode;
  kind: string;
  children: ReactNode;
}) {
  return (
    <div className="lawchip">
      <span className="k">
        {icon}
        {kind}
      </span>
      <span className="lt">{children}</span>
    </div>
  );
}

function DimHead({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="dh">
      {icon} {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function PatrimoineImmobilier({ donnees }: { donnees: EtudeDonnees }) {
  const noms = householdNameFromDonnees(donnees);
  const crd = montant(donnees, "credit_capital_restant");
  const rapport = montant(donnees, "immobilier_locatif");
  const usage = montant(donnees, "residence_principale");

  return (
    <div className="immo-mod">
      <div className="page modfold">
        <div className="shead">
          <div className="pic">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V8l7-5 7 5v13" />
              <path d="M9 21v-6h6v6" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Analyse des classes d’actifs</div>
            <h1>Patrimoine immobilier</h1>
          </div>{" "}
          <Cert label="Confiance forte · 88 %" variant="c-forte" />
          <span className="modchev eng-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>

        <div className="mod-body">
          <Bloc blocKey="Texte d'introduction du thème" className="lead">
            L’immobilier appelle une vision à long terme : compréhension des marchés locaux,
            évaluation des implications fiscales et de la liquidité, et arbitrage entre détention
            d’usage et de rapport pour servir les objectifs du foyer.
          </Bloc>
          <span className="leadreset eng-only" id="leadreset" style={{ display: "none" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>{" "}
            Réinitialiser le texte d’origine
          </span>

          {/* SYNTHÈSE */}
          <div className="subttl anchor" id="synthese">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M3 21h18" />
              <path d="M5 21V8l7-5 7 5v13" />
            </svg>{" "}
            Synthèse du patrimoine immobilier
          </div>
          <div className="kpirow">
            <div className="kpi">
              <div className="kv" id="kpi-tot">{DASH}</div>
              <div className="kl">
                Valeur totale
                <span className="kinfo" title="Hors sociétés — les biens détenus en SCI sont traités dans le thème Sociétés">i</span>
              </div>
            </div>
            <div className="kpi">
              <div className="kv" id="kpi-usage">{usage}</div>
              <div className="kl">Immobilier d’usage</div>
            </div>
            <div className="kpi">
              <div className="kv" id="kpi-rapport">{rapport}</div>
              <div className="kl">Immobilier de rapport</div>
            </div>
            <div className="kpi">
              <div className="kv">{DASH}</div>
              <div className="kl">du patrimoine global</div>
            </div>
          </div>
          <div className="subttl">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 19V5M4 15l5-4 4 3 7-7" />
            </svg>{" "}
            Revenus &amp; rendement locatif{" "}
            <span style={{ fontSize: "11px", color: "var(--navy-300)", fontWeight: 400 }}>
              — biens en location
            </span>
          </div>
          <div className="rpgrid">
            <div className="rpc">
              <div className="rl">Revenus locatifs bruts</div>
              <div className="rv" id="rp-loy">{DASH}</div>
              <div className="rs">loyers annuels, hors charges</div>
            </div>
            <div className="rpc">
              <div className="rl">Rendement locatif net moyen</div>
              <div className="rv">{DASH}</div>
              <div className="rs">avant impôt, biens loués</div>
            </div>
            <div className="rpc glob">
              <div className="rl">Capital restant dû</div>
              <div className="rv">{crd}</div>
              <div className="rs">financements en cours</div>
            </div>
          </div>

          {/* RÉPARTITION */}
          <div className="subttl anchor" id="repartition">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 3v9l6 4" />
              <circle cx="12" cy="12" r="9" />
            </svg>{" "}
            Répartition du patrimoine immobilier
            <span className="rep-tot">{DASH}</span>
          </div>
          <div className="charts">
            <div className="chartc">
              <div className="ct-row">
                <span className="ct">Par destination</span>
              </div>
              <div className="donutwrap">
                <div className="donutbox" id="box-dest">
                  <svg className="donut" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth="16" />
                    <g transform="rotate(-90 70 70)" fill="none" strokeWidth="16">
                      <circle className="seg" id="seg-dest-0" cx="70" cy="70" r="54" stroke="#102D50" strokeDasharray="181.1 158.2" strokeDashoffset="0" />
                      <circle className="seg" id="seg-dest-1" cx="70" cy="70" r="54" stroke="#C68E0E" strokeDasharray="158.2 181.1" strokeDashoffset="-181.1" />
                    </g>
                  </svg>
                  <div className="donut-tip" id="tip-dest">
                    <div className="dt-v">{DASH}</div>
                  </div>
                </div>
                <div className="leg">
                  <div className="lr" id="leg-dest-0">
                    <span className="sw" style={{ background: "#102D50" }} />
                    <span className="ll">Immobilier d’usage</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-dest-1">
                    <span className="sw" style={{ background: "#C68E0E" }} />
                    <span className="ll">Immobilier de rapport</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chartc">
              <div className="ct-row">
                <span className="ct">Par bien</span>
              </div>
              <div className="donutwrap">
                <div className="donutbox" id="box-bien">
                  <svg className="donut" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth="16" />
                    <g transform="rotate(-90 70 70)" fill="none" strokeWidth="16">
                      <circle className="seg" id="seg-bien-0" cx="70" cy="70" r="54" stroke="#102D50" strokeDasharray="145.4 193.9" strokeDashoffset="0" />
                      <circle className="seg" id="seg-bien-1" cx="70" cy="70" r="54" stroke="#C68E0E" strokeDasharray="145.4 193.9" strokeDashoffset="-145.4" />
                      <circle className="seg" id="seg-bien-2" cx="70" cy="70" r="54" stroke="#708196" strokeDasharray="35.8 303.5" strokeDashoffset="-290.7" />
                      <circle className="seg" id="seg-bien-3" cx="70" cy="70" r="54" stroke="#DDBB6E" strokeDasharray="12.8 326.5" strokeDashoffset="-326.5" />
                    </g>
                  </svg>
                  <div className="donut-tip" id="tip-bien">
                    <div className="dt-v">{DASH}</div>
                  </div>
                </div>
                <div className="leg">
                  <div className="lr" id="leg-bien-0">
                    <span className="sw" style={{ background: "#102D50" }} />
                    <span className="ll">Résidence principale</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-bien-1">
                    <span className="sw" style={{ background: "#C68E0E" }} />
                    <span className="ll">Appartement meublé (LMNP)</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-bien-2">
                    <span className="sw" style={{ background: "#708196" }} />
                    <span className="ll">Appartement nu</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-bien-3">
                    <span className="sw" style={{ background: "#DDBB6E" }} />
                    <span className="ll">Parkings</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DÉTAIL DES BIENS */}
          <div className="subttl anchor" id="contrats">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
            </svg>{" "}
            Détail bien par bien — donnée collectée, modifiable
          </div>

          {/* Résidence principale */}
          <div className="acc" id="acc-rp">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M3 11l9-7 9 7" />
                  <path d="M5 10v10h14V10" />
                  <path d="M10 20v-6h4v6" />
                </svg>
              </div>
              <div className="nm">
                Résidence principale
                <span className="sub">appartement · résidence principale · immobilier d’usage</span>
              </div>
              <div className="amt">
                <span>{DASH}</span>
              </div>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="acc-b">
              <div className="acc-in">
                <table className="et">
                  <colgroup>
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Bien</th>
                      <th className="num">Acquisition</th>
                      <th>Détention</th>
                      <th className="num">Valeur de marché</th>
                      <th className="num">Coût d’acq. corrigé</th>
                      <th className="num">
                        <span className="lbl-info" title="Gain potentiel non réalisé : valeur de marché moins coût d'acquisition corrigé">
                          Plus-value latente
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-val" data-fmt="eur" data-cat="usage">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="owners">
                  <OwnersIcon />
                  <span className="ok">Répartition de la propriété</span>
                  <span className="ov">{DASH}</span>
                  <span className="osep">·</span>
                  <span className="ov">{DASH}</span>
                </div>
                <div className="regul r4">
                  <div className="rc"><div className="rl">Stratégie</div><div className="rv">Résidence principale</div></div>
                  <div className="rc"><div className="rl">Capital restant dû</div><div className="rv">{DASH}</div></div>
                  <div className="rc rc-click"><div className="rl">Charges annuelles</div><div className="rv">{DASH} <span style={{ color: "var(--gold-deep)" }}>›</span></div></div>
                  <div className="rc"><div className="rl">Plus-value</div><div className="rv">Exonérée</div></div>
                </div>
                <div className="finbox">
                  <div className="fh"><FinIcon /> Financement</div>
                  <div className="finrow">
                    <div className="fc"><div className="fk">Capital restant dû</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Statut</div><div className="fv">Prêt amortissable soldé</div></div>
                    <div className="fc"><div className="fk">Encours bancaire</div><div className="fv">Aucun</div></div>
                  </div>
                  <div className="note" style={{ marginTop: "9px", fontSize: "10.5px" }}>
                    Le détail du prêt (établissement, taux, durée, mensualité) s’affiche dès qu’un
                    financement est en cours — voir le thème « Sociétés » pour les biens financés via
                    la SCI.
                  </div>
                </div>
                <div className="consq">
                  <strong>Plus-value exonérée</strong> au titre de la résidence principale. Bien non
                  loué — charges annuelles de {DASH} (taxe foncière et charges courantes). En cas de
                  revente, retour de trésorerie estimé à {DASH}.
                </div>
              </div>
            </div>
          </div>

          {/* Appartement locatif nu */}
          <div className="acc" id="acc-appnu">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <rect x="4" y="3" width="16" height="18" rx="1" />
                  <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6" />
                </svg>
              </div>
              <div className="nm">
                Appartement — location nue
                <span className="sub">appartement · location nue · pleine propriété</span>
              </div>
              <div className="amt">
                <span>{DASH}</span>
              </div>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="acc-b">
              <div className="acc-in">
                <table className="et">
                  <colgroup>
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "21%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Bien</th>
                      <th className="num">Acquisition</th>
                      <th>Détention</th>
                      <th className="num">Valeur de marché</th>
                      <th className="num" title="Loyer annuel hors charges">Loyer annuel (HC)</th>
                      <th className="num">Rendement net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-val" data-fmt="eur" data-cat="usage">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-loy" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="pct">{DASH}</div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="owners">
                  <OwnersIcon />
                  <span className="ok">Répartition de la propriété</span>
                  <span className="ov">{DASH}</span>
                </div>
                <div className="regul r4">
                  <div className="rc"><div className="rl">Stratégie</div><div className="rv">Location nue</div></div>
                  <div className="rc"><div className="rl">Rendement brut</div><div className="rv">{DASH}</div></div>
                  <div className="rc rc-click"><div className="rl">Charges annuelles</div><div className="rv">{DASH} <span style={{ color: "var(--gold-deep)" }}>›</span></div></div>
                  <div className="rc"><div className="rl">Cashflow avant impôt</div><div className="rv">{DASH}</div></div>
                </div>
                <div className="finbox">
                  <div className="fh"><FinIcon /> Financement — {DASH}</div>
                  <div className="finrow">
                    <div className="fc"><div className="fk">Capital initial</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Capital restant dû</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Taux</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Durée restante</div><div className="fv">{DASH}</div></div>
                  </div>
                  <div className="finrow" style={{ marginTop: "11px" }}>
                    <div className="fc"><div className="fk">Mensualité</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Quotité d’assurance</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Type de prêt</div><div className="fv">Amortissable</div></div>
                    <div className="fc"><div className="fk" title="Mensualité × 12 : capital, intérêts et assurance remboursés sur l'année">Service annuel de la dette</div><div className="fv">{DASH}</div></div>
                  </div>
                </div>
                <div className="consq">
                  Acquisition récente, louée nue. Revenus fonciers imposés au barème de l’impôt sur le
                  revenu et aux prélèvements sociaux ; régime micro-foncier ou réel selon optimisation.{" "}
                  <span className="miss eng-only">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3" />
                      <path d="M12 8.5v7M8.5 12h7" />
                    </svg>{" "}
                    Information manquante
                    <svg className="mchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appartement locatif meublé LMNP */}
          <div className="acc" id="acc-lmnp">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M3 12h18M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M4 12v6M20 12v6M7 12v-2h10v2" />
                </svg>
              </div>
              <div className="nm">
                Appartement — location meublée (LMNP)
                <span className="sub">appartement · location meublée · immobilier de rapport</span>
              </div>
              <div className="amt">
                <span>{DASH}</span>
              </div>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="acc-b">
              <div className="acc-in">
                <table className="et">
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "19%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "14%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Bien</th>
                      <th className="num">Acquisition</th>
                      <th>Détention</th>
                      <th className="num">Valeur</th>
                      <th className="num">Prix d’achat</th>
                      <th className="num" title="Loyer annuel hors charges">Loyer annuel (HC)</th>
                      <th className="num">Rendement net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-val" data-fmt="eur" data-cat="rapport">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-loy" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="pct">{DASH}</div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="owners">
                  <OwnersIcon />
                  <span className="ok">Répartition de la propriété</span>
                  <span className="ov">{DASH}</span>
                  <span className="osep">·</span>
                  <span className="ov">{DASH}</span>
                </div>
                <div className="regul r4">
                  <div className="rc"><div className="rl">Stratégie</div><div className="rv">Location meublée</div></div>
                  <div className="rc"><div className="rl">Rendement brut</div><div className="rv">{DASH}</div></div>
                  <div className="rc rc-click"><div className="rl">Charges annuelles</div><div className="rv">{DASH} <span style={{ color: "var(--gold-deep)" }}>›</span></div></div>
                  <div className="rc"><div className="rl">Cashflow avant impôt</div><div className="rv">{DASH}</div></div>
                </div>
                <div className="finbox">
                  <div className="fh"><FinIcon /> Financement — {DASH}</div>
                  <div className="finrow">
                    <div className="fc"><div className="fk">Capital initial</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Capital restant dû</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Taux</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Durée restante</div><div className="fv">{DASH}</div></div>
                  </div>
                  <div className="finrow" style={{ marginTop: "11px" }}>
                    <div className="fc"><div className="fk">Mensualité</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Quotité d’assurance</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Type de prêt</div><div className="fv">Amortissable</div></div>
                    <div className="fc"><div className="fk" title="Mensualité × 12 : capital, intérêts et assurance remboursés sur l'année">Service annuel de la dette</div><div className="fv">{DASH}</div></div>
                  </div>
                </div>
                <div className="consq">
                  <strong>
                    <span className="lbl-info" title="Gain potentiel non réalisé : valeur de marché moins coût d'acquisition corrigé">
                      Plus-value latente
                    </span>{" "}
                    estimée {DASH}
                  </strong>{" "}
                  (avec réintégration des amortissements à date) — impôt sur la plus-value estimé{" "}
                  {DASH}, soit une plus-value nette de {DASH} et un retour de trésorerie de {DASH} en
                  cas de revente.{" "}
                  <span className="eye eng-only">
                    <EyeIcon /> détail des charges
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parkings */}
          <div className="acc" id="acc-park">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M9 16V8h3.5a2.5 2.5 0 0 1 0 5H9" />
                </svg>
              </div>
              <div className="nm">
                Parkings
                <span className="sub">lots de stationnement · immobilier de rapport</span>
              </div>
              <div className="amt">
                <span>{DASH}</span>
              </div>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="acc-b">
              <div className="acc-in">
                <table className="et">
                  <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Bien</th>
                      <th>Titulaire</th>
                      <th className="num">Acquisition</th>
                      <th>Détention</th>
                      <th className="num">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-val" data-fmt="eur" data-cat="rapport">{DASH}</div></td>
                    </tr>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed bien-val" data-fmt="eur" data-cat="rapport">{DASH}</div></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4}><div className="cell">Total parkings</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="finbox">
                  <div className="fh"><FinIcon /> Financement</div>
                  <div className="finrow">
                    <div className="fc"><div className="fk">Capital restant dû</div><div className="fv">{DASH}</div></div>
                    <div className="fc"><div className="fk">Statut</div><div className="fv">Acquisition comptant</div></div>
                    <div className="fc"><div className="fk">Encours bancaire</div><div className="fv">Aucun</div></div>
                  </div>
                  <div className="note" style={{ marginTop: "9px", fontSize: "10.5px" }}>
                    Le détail du prêt (établissement, taux, durée, mensualité) s’affiche dès qu’un
                    financement est en cours — voir le thème « Sociétés » pour les biens financés via
                    la SCI.
                  </div>
                </div>
                <div className="consq">
                  Non loués à ce jour — charges minimes (taxe foncière {DASH} et {DASH}). Légère
                  moins-value latente par rapport au coût d’acquisition corrigé.
                </div>
              </div>
            </div>
          </div>

          {/* INDICATEURS */}
          <div className="subttl anchor" id="indic">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 3a9 9 0 1 0 9 9" />
              <path d="M12 12l5-3" />
            </svg>{" "}
            Indicateurs clés — rentabilité &amp; structure
          </div>
          <div className="kpirow">
            <div className="kpi">
              <div className="kv">{crd}</div>
              <div className="kl">Capital restant dû</div>
              <div className="kf">ensemble du parc immobilier</div>
            </div>
            <div className="kpi">
              <div className="kv">{DASH}</div>
              <div className="kl">
                Service annuel de la dette
                <span className="kinfo" title="Définition et calcul">i</span>
              </div>
              <div className="kf">prêts amortissables</div>
            </div>
            <div className="kpi">
              <div className="kv">{DASH}</div>
              <div className="kl">
                Rendement locatif net
                <span className="kinfo" title="Définition et calcul">i</span>
              </div>
              <div className="kf">moyen avant impôt</div>
            </div>
            <div className="kpi">
              <div className="kv">{DASH}</div>
              <div className="kl">
                Plus-values latentes
                <span className="kinfo" title="Définition et calcul">i</span>
              </div>
              <div className="kf">dont {DASH} exonérés</div>
            </div>
          </div>
          <div className="rappel">
            <InfoNoteIcon />
            <span>
              <b>Rappel synthétique</b> — le capital restant dû et la part de l’immobilier dans le
              patrimoine global restent à compléter. Le détail des charges et du budget locatif
              figure dans la section « Budget ».
            </span>
          </div>

          {/* ANALYSE 3 DIMENSIONS */}
          <div className="subttl anchor" id="analyse">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 4v16h16" />
              <path d="M4 15l4-4 4 3 5-6" />
            </svg>{" "}
            Risques · Opportunités · Optimisations
          </div>

          {/* Refinancement */}
          <Bloc blocKey="Potentiel de refinancement" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#102D50" />
                  <path d="M7.5 10.2a4.6 4.6 0 0 1 8-1.6" fill="none" stroke="#FAF8F3" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M16.5 13.8a4.6 4.6 0 0 1-8 1.6" fill="none" stroke="#FAF8F3" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M15.8 5.6l.4 3.3-3.3.4" fill="none" stroke="#C68E0E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.2 18.4l-.4-3.3 3.3-.4" fill="none" stroke="#C68E0E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="tt">Potentiel de refinancement</span>
              <Cert label="Confiance forte · 95 %" variant="c-forte" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>La résidence principale et les parkings (<strong>{DASH}</strong>) sont libres de toute hypothèque ; le capital restant dû total s’élève à <strong>{DASH}</strong> sur les deux appartements.</li>
                  <li>Le service annuel de la dette reste modéré au regard de la valeur du parc.</li>
                  <li>La valeur nette immobilisée demeure importante — une capacité de levier bancaire <strong>partiellement exploitée</strong>, encore largement disponible.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>Une valeur « inerte » : un capital immobilisé qui ne travaille pas et ne génère pas de nouveaux revenus.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Utiliser ces biens en garantie (hypothèque de second rang, crédit lombard) pour financer de nouveaux investissements <strong>sans apport personnel</strong>.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Mobiliser une quotité prudente de la valeur du parc pour amorcer une nouvelle phase de diversification, immobilière ou financière.</div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <DimHead icon={<ImpactIcon />}>Impact quantifié</DimHead>
                <p>À une quotité prudente de 60 à 70 %, et après déduction du capital restant dû ({DASH}), la capacité de refinancement mobilisable s’élève à <strong>{DASH}</strong>, déployable sans céder le moindre actif (voir module ci-dessous).</p>
              </div>
              <div className="dim">
                <DimHead icon={<JustifIcon />}>Justification<span className="fn client-only">¹</span></DimHead>
                <p>Valeurs de marché de l’inventaire ; capital restant dû des financements en cours. <span className="eye eng-only"><EyeIcon /> 2 sources</span></p>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawBookIcon />} kind="Texte de loi">Hypothèque conventionnelle — <b>Code civil, art. 2385 et s.</b></Law>
                <Law icon={<LawFileIcon />} kind="Pratique bancaire">Quotité de financement (60 à 70 %)</Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Optimisation chiffrée :</b> capacité de refinancement (ci-dessous) · <b>Préconisation :</b> crédit hypothécaire sur la résidence principale.</span>
            </div>
          </Bloc>

          {/* Contribution sur les revenus locatifs */}
          <Bloc blocKey="Contribution sur les revenus locatifs" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <rect x="4.5" y="3" width="15" height="18" rx="2" fill="#102D50" />
                  <path d="M9 9l6 6" stroke="#FAF8F3" strokeWidth="1.7" strokeLinecap="round" />
                  <circle cx="9.6" cy="9.4" r="1.15" fill="#FAF8F3" />
                  <circle cx="14.4" cy="14.6" r="1.15" fill="#FAF8F3" />
                </svg>
              </span>
              <span className="tt">Contribution sur les revenus locatifs</span>
              <Cert label="Confiance forte · 87 %" variant="c-forte" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>Une <strong>Contribution sur les revenus locatifs</strong> est acquittée pour deux appartements ({DASH} et {DASH}).</li>
                  <li>Cette contribution vise principalement les revenus perçus par des personnes morales soumises à l’impôt sur les sociétés.</li>
                  <li>Or ces biens sont détenus par des <strong>personnes physiques</strong> — l’assujettissement ne paraît pas juridiquement fondé.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>Une charge indue, modérée à l’unité mais récurrente, qui pèse sur la rentabilité nette des biens concernés.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Engager une démarche de régularisation pour solliciter le remboursement des sommes versées sur les exercices non prescrits.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Cesser le règlement et récupérer les montants des trois dernières années auprès de l’administration fiscale.</div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <DimHead icon={<ImpactIcon />}>Impact quantifié</DimHead>
                <p>Économie pérenne de <strong>{DASH}</strong>, et remboursement potentiel d’environ <strong>{DASH}</strong> au titre des trois derniers exercices.</p>
              </div>
              <div className="dim">
                <DimHead icon={<JustifIcon />}>Justification<span className="fn client-only">²</span></DimHead>
                <p>Avis d’imposition et comptes locatifs ; régime juridique de la contribution. <span className="eye eng-only"><EyeIcon /> 2 sources</span></p>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawBookIcon />} kind="Texte de loi"><b>CGI, art. 234 nonies à 234 quindecies</b></Law>
                <Law icon={<LawFileIcon />} kind="Doctrine"><b>BOI-RFPI-CTRL-20</b></Law>
                <Law icon={<LawCheckIcon />} kind="Procédure">Réclamation — <b>LPF, art. L.190 et R.196-1</b></Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Préconisation :</b> régularisation auprès de l’administration fiscale et demande de remboursement.</span>
            </div>
          </Bloc>

          {/* Diagnostic de performance énergétique */}
          <Bloc blocKey="Diagnostic de performance énergétique" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <rect x="3.5" y="3" width="17" height="18" rx="2.5" fill="#102D50" />
                  <path d="M6.8 7.5h6.5M6.8 11h8.4M6.8 14.5h4.5" stroke="#FAF8F3" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M15 13l3.2-5v3.4h1.8l-3.2 5v-3.4z" fill="#C68E0E" />
                </svg>
              </span>
              <span className="tt">Absence de diagnostic de performance énergétique</span>
              <Cert label="Confiance forte · 89 %" variant="c-forte" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>Plusieurs actifs ne disposent d’aucun <strong>diagnostic de performance énergétique</strong> en cours de validité.</li>
                  <li>La réglementation impose un diagnostic opposable pour toute mise en location, renouvellement de bail ou vente.</li>
                  <li>L’absence de classification empêche de mesurer l’exposition aux futures interdictions de louer.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>Nullité possible du bail ou de la vente, amende administrative (jusqu’à 3 000 € pour une personne physique, 15 000 € pour une SCI), loyer gelé si le bien est classé F ou G.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Anticiper les diagnostics permet de sécuriser les baux, de fiabiliser les valeurs et d’identifier d’éventuels travaux d’amélioration.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Réaliser les diagnostics manquants avant toute relocation ou cession, et budgéter les éventuels travaux de rénovation énergétique.</div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <DimHead icon={<ImpactIcon />}>Impact quantifié</DimHead>
                <p>Risque réglementaire et de dépréciation : un classement défavorable contraindrait à des travaux non budgétés et gèlerait les loyers, pesant sur le rendement et la valeur vénale.</p>
              </div>
              <div className="dim">
                <DimHead icon={<JustifIcon />}>Justification<span className="fn client-only">³</span></DimHead>
                <p>Dossier locatif ; réglementation sur la décence énergétique. <span className="eye eng-only"><EyeIcon /> 2 sources</span></p>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawBookIcon />} kind="Texte de loi"><b>CCH, art. L.126-26 et s.</b> — loi Climat et Résilience</Law>
                <Law icon={<LawBookIcon />} kind="Texte de loi">Gel des loyers (classes F et G)</Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Préconisation :</b> réalisation des diagnostics de performance énergétique sur les biens concernés.</span>
            </div>
          </Bloc>

          {/* Niveau des charges locatives */}
          <Bloc blocKey="Niveau des charges locatives" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M6 2.6h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" fill="#102D50" />
                  <path d="M9 7.5h6M9 11h6M9 14.5h4" stroke="#FAF8F3" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="tt">Niveau des charges locatives — vigilance et optimisation</span>
              <Cert label="Confiance forte · 86 %" variant="c-forte" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>Sur l’appartement meublé détenu en nom propre, les charges représentent <strong>{DASH}</strong>, soit ≈ <strong>{DASH}</strong> du chiffre d’affaires — un poste à surveiller.</li>
                  <li>Sur les studios détenus en <strong>SCI</strong>, ce ratio atteint près de <strong>{DASH}</strong> (honoraires comptables, copropriété, assurances, frais d’agence) — analysé dans le thème « Sociétés ».</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>L’empilement de frais fixes capte près de la moitié des loyers avant même l’imposition des associés, ralentissant la performance.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Renégocier les postes les plus lourds (honoraires, agence) et rationaliser les protections assurantielles.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Revue ligne à ligne des charges pour rehausser le rendement net sans toucher au capital.</div>
                </div>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawBookIcon />} kind="Texte de loi">Charges déductibles — <b>CGI, art. 39 ; BOI-BIC-CHAMP-40-20</b></Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Préconisation :</b> audit et renégociation des charges d’exploitation locatives.</span>
            </div>
          </Bloc>

          {/* ANALYSE DE RÉGIME : LMNP */}
          <Bloc blocKey="Régime de la location meublée non professionnelle" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill="#102D50" />
                  <path d="M14.4 11.7a3 3 0 1 0 0 4.6M9.2 13.1h4.6M9.2 14.9h4.6" stroke="#FAF8F3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <span className="tt">Régime de la location meublée non professionnelle (LMNP)</span>
              <Cert label="Confiance forte · 90 %" variant="c-forte" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>L’appartement meublé est exploité en location meublée non professionnelle : les recettes ({DASH}) restent inférieures à 23 000 € et aux autres revenus du foyer.</li>
                  <li>Ce régime relève des bénéfices industriels et commerciaux, au régime réel, avec amortissement du bien et du mobilier.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>À la cession, les amortissements pratiqués sont désormais <strong>réintégrés dans la plus-value</strong> (réforme 2025), ce qui alourdit l’imposition. Un franchissement durable des seuils ferait <strong>basculer le bien en LMP</strong> — changement de régime de plus-value et affiliation sociale.</div>
                  <div className="it o"><span className="lab">Opportunité</span>L’amortissement du bien et du mobilier, au régime réel, <strong>neutralise tout ou partie de l’imposition des loyers</strong> pendant la phase de détention ; les déficits s’imputent et se reportent.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Arbitrer la durée de détention au regard de la réforme, et piloter le niveau des recettes pour conserver, le cas échéant, le statut non professionnel.</div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <DimHead icon={<ImpactIcon />}>Impact quantifié</DimHead>
                <p>Loyers de <b>{DASH}</b> par an largement neutralisés par l’amortissement pendant la détention ; en contrepartie, plus-value brute portée à <b>{DASH}</b> à la cession après réintégration des amortissements (voir le coût d’opportunité immobilier).</p>
              </div>
              <div className="dim">
                <DimHead icon={<JustifIcon />}>Justification<span className="fn client-only">⁶</span></DimHead>
                <p>Régime des bénéfices industriels et commerciaux, seuils du statut et réforme de la plus-value. <span className="eye eng-only"><EyeIcon /> sources</span></p>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawBookIcon />} kind="Texte de loi">Seuils LMNP / LMP — <b>CGI, art. 155, IV</b></Law>
                <Law icon={<LawBookIcon />} kind="Texte de loi">Régime réel BIC — <b>BOI-BIC-CHAMP-40-20</b></Law>
                <Law icon={<LawBookIcon />} kind="Texte de loi">Réintégration des amortissements — <b>CGI, art. 150 VB III</b></Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Préconisation :</b> arbitrer la stratégie de détention (LMNP / LMP) au regard de la réforme de 2025 et de la trajectoire des recettes.</span>
            </div>
          </Bloc>

          {/* ANALYSE AVANCÉE : assurance emprunteur */}
          <Bloc blocKey="Assurance emprunteur — remboursement et fiscalité" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <path d="M8.5 12l2.3 2.3 4.4-4.8" stroke="#FAF8F3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="tt">Assurance emprunteur (décès / perte totale et irréversible d’autonomie) — remboursement du prêt et fiscalité</span>
              <Cert label="Confiance modérée · 78 %" variant="c-moy" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>Pour les biens financés par emprunt — détenus via la SCI, ou en location meublée non professionnelle (LMNP) et professionnelle (LMP) — une assurance emprunteur garantit le remboursement du prêt en cas de décès ou de perte totale et irréversible d’autonomie d’un assuré.</li>
                  <li>Le remboursement anticipé par l’assureur a un effet fiscal qui dépend du <strong>régime de la structure</strong>.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>En SCI à l’impôt sur les sociétés, le capital remboursé par l’assurance constitue un <strong>produit exceptionnel imposable</strong> (accroissement de l’actif net) — une charge fiscale parfois inattendue. <strong>Le même mécanisme s’applique en location meublée au régime réel</strong> (LMNP ou LMP).</div>
                  <div className="it o"><span className="lab">Opportunité</span>Anticiper le traitement et, le cas échéant, opter pour l’<strong>étalement</strong> du produit sur cinq exercices ; choisir le régime (impôt sur le revenu ou sur les sociétés) en connaissance de cause.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Calibrer les têtes assurées et les quotités d’assurance, et documenter le régime applicable, pour maîtriser l’impact fiscal de la garantie.</div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <DimHead icon={<ImpactIcon />}>Impact quantifié</DimHead>
                <p><b>SCI à l’impôt sur les sociétés :</b> produit = capital restant dû remboursé (à titre d’illustration, ≈ {DASH} sur le local financé), imposé à l’impôt sur les sociétés, <b>étalable sur 5 ans</b>. <b>SCI à l’impôt sur le revenu :</b> l’indemnité constitue des <b>recettes foncières</b> dès lors que les intérêts ont été déduits. <b>Location meublée au réel (LMNP ou LMP) :</b> le capital remboursé constitue un <b>produit imposable au titre des bénéfices industriels et commerciaux</b>, étalable sur cinq exercices.</p>
              </div>
              <div className="dim">
                <DimHead icon={<JustifIcon />}>Justification<span className="fn client-only">⁴</span></DimHead>
                <p>Qualification de l’indemnité d’assurance selon le régime de la structure. <span className="eye eng-only"><EyeIcon /> sources</span></p>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawScaleIcon />} kind="Jurisprudence"><b>Conseil d’État, 6 août 2008, n°301336</b></Law>
                <Law icon={<LawBookIcon />} kind="Texte de loi">Produit exceptionnel, étalement — <b>CGI, art. 38 et 38 quater</b></Law>
                <Law icon={<LawFileIcon />} kind="Doctrine">Société à l’IR : recettes foncières — <b>BOI-RFPI-BASE-20-80</b></Law>
                <Law icon={<LawBookIcon />} kind="Texte de loi">Location meublée au réel (BIC) — <b>CGI, art. 38 et 38 quater</b></Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Préconisation :</b> cadrer le régime fiscal de l’assurance emprunteur et la stratégie d’étalement, pour la SCI comme pour la location meublée (analyse détaillée dans le thème « Sociétés »).</span>
            </div>
          </Bloc>

          {/* ANALYSE AVANCÉE : multiplicité des banques / déchéance du terme */}
          <Bloc blocKey="Multiplicité des banques — déchéance du terme" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5 2.8 7.5h18.4z" fill="#102D50" />
                  <rect x="4.2" y="9" width="2.5" height="7.5" fill="#102D50" />
                  <rect x="10.75" y="9" width="2.5" height="7.5" fill="#102D50" />
                  <rect x="17.3" y="9" width="2.5" height="7.5" fill="#102D50" />
                  <rect x="2.8" y="18" width="18.4" height="2.2" rx="1" fill="#102D50" />
                </svg>
              </span>
              <span className="tt">Multiplicité des banques — risque de déchéance du terme</span>
              <Cert label="Confiance modérée · 75 %" variant="c-moy" />
            </div>
            <div className="ab-grid">
              <div className="dim">
                <DimHead icon={<ConstatIcon />}>Constat &amp; origine</DimHead>
                <ul className="dlist">
                  <li>Plusieurs établissements financent ou pourraient financer les différents actifs du foyer et de ses structures.</li>
                  <li>Chaque prêt comporte des <strong>obligations déclaratives</strong> sur les engagements existants auprès des autres prêteurs.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>L’omission ou l’inexactitude d’une déclaration d’engagement peut caractériser une fausse déclaration et entraîner la <strong>déchéance du terme</strong> — exigibilité immédiate du capital restant dû.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Cartographier l’ensemble des engagements et fiabiliser les déclarations sécurise les financements et la relation bancaire.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Tenir un tableau de bord des prêts (établissement, encours, sûretés, clauses) et respecter scrupuleusement les obligations d’information.</div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <DimHead icon={<ImpactIcon />}>Impact quantifié</DimHead>
                <p>Exigibilité anticipée des prêts concernés, dégradation de la relation bancaire et surcoût de refinancement en urgence — un risque de liquidité disproportionné au regard du manquement.</p>
              </div>
              <div className="dim">
                <DimHead icon={<JustifIcon />}>Justification<span className="fn client-only">⁵</span></DimHead>
                <p>Clauses des contrats de prêt et obligations de sincérité des déclarations. <span className="eye eng-only"><EyeIcon /> sources</span></p>
              </div>
            </div>
            <div className="fond">
              <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
              <div className="chips">
                <Law icon={<LawBookIcon />} kind="Texte de loi">Déchéance du terme — <b>Code civil, art. 1103 et 1104</b></Law>
                <Law icon={<LawCheckIcon />} kind="Obligation">Sincérité des déclarations d’engagements</Law>
              </div>
            </div>
            <div className="ab-foot">
              <FootArrowIcon />
              <span><b>Préconisation :</b> cartographie consolidée des engagements bancaires et mise en conformité déclarative.</span>
            </div>
          </Bloc>

          {/* MODULE CAPACITÉ DE REFINANCEMENT */}
          <div className="subttl anchor" id="cout">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M3 21h18M5 21V8l7-5 7 5v13" />
              <path d="M9 21v-6h6v6" />
            </svg>{" "}
            Capacité de refinancement
          </div>
          <div className="coppintro">
            <b>De quoi s’agit-il ?</b> Le parc immobilier étant faiblement endetté, sa valeur nette
            (après capital restant dû) peut servir de garantie pour obtenir de nouveaux financements
            sans céder d’actif. <b>Méthode :</b> nous appliquons une quotité de financement prudente à
            la valeur de marché du parc ; le résultat constitue la capacité mobilisable.{" "}
            <b>Hypothèse :</b> une quotité de 60 à 70 % reflète les pratiques bancaires usuelles d’un
            crédit hypothécaire de qualité.{" "}
            <span className="srcbtn">
              <ShieldIcon /> Méthode &amp; justification détaillées
            </span>
          </div>
          <Bloc blocKey="Capacité de refinancement" className="copp ablock">
            <div className="ch">
              <div className="t">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 21h18M5 21V9l7-5 7 5v12" />
                </svg>{" "}
                Capacité mobilisable
              </div>
              <div className="hyprow eng-only">
                <span className="hl">Quotité :</span>
                <button className="hbtn">50 %</button>
                <button className="hbtn">60 %</button>
                <button className="hbtn on">70 %</button>
              </div>
              <span className="hyp-client" id="refi-client">Quotité retenue : 70 %</span>
              <svg className="cch" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="copp-body">
              <div className="compare">
                <div className="cstate now"><div className="cl">Valeur du parc immobilier</div><div className="cv" id="cmp-parc">{DASH}</div><div className="cd">&nbsp;</div></div>
                <div className="carrow"><CarrowIcon /></div>
                <div className="cstate cur"><div className="cl">Capital restant dû</div><div className="cv">{crd}</div><div className="cd">financements en cours</div></div>
                <div className="carrow"><CarrowIcon /></div>
                <div className="cstate opt"><div className="cl">Mobilisable à <span id="cmp-l">70</span> %</div><div className="cv" id="cmp-capa">{DASH}</div><div className="cd">sans cession d’actif</div></div>
              </div>
              <div className="gapband">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3v18M5 10l7-7 7 7" />
                </svg>{" "}
                Capacité de refinancement mobilisable : <b id="gap-v">{DASH}</b>
              </div>
              <div className="note">
                <InfoNoteIcon /> Capacité indicative, sous réserve de l’accord bancaire et de la
                capacité de remboursement.{" "}
                <span className="srcbtn eng-only" style={{ marginLeft: "4px" }}>Méthode &amp; sources</span>
              </div>
            </div>
          </Bloc>

          {/* COÛT D'OPPORTUNITÉ IMMOBILIER */}
          <div className="subttl anchor" id="coutimmo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 19V5M4 15l5-4 4 3 7-7" />
              <circle cx="20" cy="8" r="0" />
            </svg>{" "}
            Coût d’opportunité immobilier
          </div>
          <div className="coppintro">
            <b>De quoi s’agit-il ?</b> Comparer le rendement actuel d’un bien à ce que produirait le
            réinvestissement du capital après cession, fiscalité comprise. <b>Méthode :</b> nous
            confrontons le revenu net annuel du bien conservé au revenu qu’offrirait le produit net de
            la vente replacé à un taux cible. <b>Hypothèse :</b> la plus-value est calculée selon le
            régime du bien — ici location meublée non professionnelle, avec réintégration des
            amortissements.{" "}
            <span className="srcbtn">
              <ShieldIcon /> Fiscalité de la plus-value
            </span>
          </div>
          <Bloc blocKey="Coût d'opportunité immobilier" className="copp ablock">
            <div className="ch">
              <div className="t">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 12h18M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M4 12v6M20 12v6" />
                </svg>{" "}
                Appartement meublé (LMNP) — conserver ou arbitrer
              </div>
              <div className="hyprow eng-only">
                <span className="hl">Taux cible :</span>
                <button className="hbtn">3 %</button>
                <button className="hbtn on">5 %</button>
                <button className="hbtn">8 %</button>
              </div>
              <span className="hyp-client" id="arb-client">Taux cible retenu : 5 %</span>
              <svg className="cch" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="copp-body">
              <div className="compare">
                <div className="cstate now"><div className="cl">Conserver le bien</div><div className="cv">{DASH}</div><div className="cd">revenu net annuel · rendement {DASH}</div></div>
                <div className="carrow"><CarrowIcon /></div>
                <div className="cstate cur"><div className="cl">Produit net de cession</div><div className="cv">{DASH}</div><div className="cd">après impôt sur la plus-value</div></div>
                <div className="carrow"><CarrowIcon /></div>
                <div className="cstate opt"><div className="cl">Réinvesti à&nbsp;<span id="arb-l">5</span>&nbsp;%</div><div className="cv" id="arb-rev">{DASH}</div><div className="cd">revenu net annuel potentiel</div></div>
              </div>
              <div className="pvacc">
                <div className="pvacc-h">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                    <path d="M9 7h6M9 11h6M9 15h4M5 3h14v18H5z" />
                  </svg>
                  <span className="pvt">Calcul de la plus-value de cession — Appartement meublé (LMNP)</span>
                  <svg className="pvchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                <div className="pvacc-body">
                  <table className="et">
                    <colgroup>
                      <col style={{ width: "64%" }} />
                      <col style={{ width: "36%" }} />
                    </colgroup>
                    <tbody>
                      <tr><td>Valeur de marché (cession)</td><td className="num">{DASH}</td></tr>
                      <tr><td>Coût d’acquisition corrigé (prix, frais et travaux)</td><td className="num">{DASH}</td></tr>
                      <tr><td>Amortissements cumulés réintégrés <span className="pvnote">(réforme 2025)</span></td><td className="num">{DASH}</td></tr>
                      <tr className="pvsub"><td>Base d’acquisition nette retenue</td><td className="num">{DASH}</td></tr>
                      <tr><td>Plus-value brute imposable</td><td className="num">{DASH}</td></tr>
                      <tr><td>Impôt sur la plus-value (19&nbsp;% + 17,2&nbsp;%, après abattements pour durée de détention)</td><td className="num">{DASH}</td></tr>
                      <tr><td>Plus-value nette</td><td className="num">{DASH}</td></tr>
                    </tbody>
                    <tfoot>
                      <tr><td>Produit net de cession (retour de trésorerie)</td><td className="num">{DASH}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="consq" style={{ marginTop: "14px" }}>
                La conservation présente un <strong>coût d’opportunité</strong> : le rendement net du
                bien ({DASH}) est inférieur à ce qu’offrirait le réinvestissement du produit de
                cession. L’arbitrage doit toutefois être mis en balance avec la <strong>fiscalité de
                la plus-value</strong> ({DASH}), la perte de l’effet de levier futur, le potentiel
                d’appréciation du bien et les <strong>conséquences patrimoniales et
                successorales</strong> de la sortie de l’actif.
              </div>

              <div className="fond" style={{ marginLeft: 0, marginRight: 0 }}>
                <div className="fl"><FondIcon /> Fondements juridiques &amp; fiscaux</div>
                <div className="chips">
                  <Law icon={<LawBookIcon />} kind="Texte de loi">Réintégration des amortissements — <b>CGI, art. 150 VB III</b> (loi n°2025-127)</Law>
                  <Law icon={<LawBookIcon />} kind="Texte de loi">Abattements pour durée de détention — <b>CGI, art. 150 VC</b></Law>
                </div>
              </div>

              <div className="note">
                <InfoNoteIcon /> Projection indicative. Le réinvestissement à un taux cible suppose
                une allocation diversifiée nette de frais ; le scénario retenu est tracé dans le
                rapport.{" "}
                <span className="srcbtn eng-only" style={{ marginLeft: "4px" }}>Méthode &amp; sources</span>
              </div>
            </div>
          </Bloc>

          {/* SYNTHÈSE DU THÈME */}
          <div className="synthacc">
            <div className="subttl anchor synth-h" id="synthese-theme">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                <path d="M9 11l3 3 8-8" />
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
              </svg>{" "}
              Synthèse du thème
              <svg className="synthchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="synthprose">
              <div className="sp-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                  <path d="M8 8h6M8 12h8M8 16h5" />
                </svg>{" "}
                Patrimoine immobilier — lecture stratégique
              </div>
              <div className="synth-cert sc-green eng-only">
                <span className="sc-ico"><EyeIcon /></span>
                <span><b>Confiance forte · 90 %</b> · synthèse fondée sur les constats du thème</span>
                <span className="sc-link">Voir le détail</span>
              </div>
              <p>Le patrimoine immobilier de {noms}, d’un montant de <b>{DASH}</b>, constitue l’un des socles du patrimoine global du foyer. Il se partage entre immobilier d’usage (<b>{DASH}</b>) et immobilier de rapport (<b>{DASH}</b>), et se distingue par la qualité de ses actifs comme par une dette à préciser : la résidence principale et les emplacements de stationnement sont détenus libres de tout financement, tandis que les appartements de rapport portent un capital restant dû de <b>{DASH}</b>. Cette structure dégage une valeur nette et une capacité de refinancement estimée à <b>{DASH}</b>, à ce jour largement inexploitée.</p>
              <p>Le cabinet relève plusieurs points forts. La résidence principale recèle une plus-value latente de <b>{DASH}</b>, intégralement exonérée ; l’appartement meublé porte une plus-value latente significative et bénéficie, sous le régime réel, d’un amortissement qui neutralise l’imposition des loyers pendant la phase de détention. L’ensemble offre une assise patrimoniale solide et un effet de levier mobilisable sans cession d’actif.</p>
              <p>La principale fragilité tient au rendement locatif. Modeste en brut (<b>{DASH}</b>), il devient négatif en trésorerie sous l’effet des financements en cours, et se trouve grevé par un niveau de charges élevé sur la location meublée. S’y ajoutent des points de conformité à régulariser : des diagnostics de performance énergétique manquants, qui exposent les biens concernés au gel des loyers et à une décote, ainsi qu’une contribution sur les revenus locatifs acquittée alors qu’elle n’est pas due par des personnes physiques.</p>
              <p>Plusieurs leviers se dégagent de cette lecture. La capacité de refinancement autoriserait une diversification du patrimoine sans céder d’actif ; l’arbitrage de l’appartement meublé, à faible rendement, mérite d’être étudié au regard de la fiscalité de sa plus-value, désormais alourdie par la réintégration des amortissements ; la dimension fiscale et assurantielle des structures gagnerait enfin à être sécurisée, notamment quant au traitement d’un éventuel produit exceptionnel en cas de décès ou d’invalidité d’un emprunteur. Les principaux enjeux à surveiller portent sur la fiabilisation des valorisations, aujourd’hui forfaitaires, et sur le suivi rigoureux des obligations déclaratives entre établissements, dont dépend la stabilité des financements.</p>
              <div className="sp-recap">
                <div className="spr spr-r">
                  <div className="spr-h">Principaux risques</div>
                  <ul>
                    <li>Rentabilité locative négative en trésorerie sous l’effet des financements en cours.</li>
                    <li>Conformité à régulariser : diagnostics de performance énergétique manquants, contribution sur les revenus locatifs acquittée à tort.</li>
                    <li>Studio en résidence services (illustration) : dépendance à un gestionnaire unique et risque de vacance.</li>
                  </ul>
                </div>
                <div className="spr spr-o">
                  <div className="spr-h">Principales opportunités</div>
                  <ul>
                    <li>Capacité de refinancement importante, à mobiliser sans cession d’actif.</li>
                    <li>Arbitrage envisageable de l’appartement meublé à faible rendement.</li>
                    <li>Sécurisation du traitement fiscal et assurantiel des structures financées.</li>
                  </ul>
                </div>
                <div className="spr spr-opt">
                  <div className="spr-h">Principales optimisations</div>
                  <ul>
                    <li>Mobiliser la capacité de refinancement par un crédit hypothécaire, sans cession d’actif.</li>
                    <li>Étaler la déductibilité de l’assurance emprunteur (BIC) sur la durée des financements.</li>
                    <li>Régulariser le DPE et sécuriser la déclaration des revenus locatifs.</li>
                  </ul>
                </div>
              </div>
              <div className="sp-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>{" "}
                <span>Ces leviers seront chiffrés, arbitrés et hiérarchisés dans la partie « Préconisations » de l’étude.</span>
              </div>
            </div>
          </div>

          {/* ANNEXE CLIENT */}
          <div className="appendix client-only">
            <h2>Sources &amp; méthode</h2>
            <div className="appref"><span className="n">¹</span><span><b>Potentiel de refinancement.</b> Valeurs de marché issues de l’inventaire des actifs immobiliers ; capital restant dû nul constaté sur les biens en nom propre.</span></div>
            <div className="appref"><span className="n">²</span><span><b>Contribution sur les revenus locatifs.</b> Avis d’imposition et comptes locatifs ; régime juridique de la contribution (assujettissement des personnes morales à l’impôt sur les sociétés).</span></div>
            <div className="appref"><span className="n">³</span><span><b>Diagnostic de performance énergétique.</b> Dossier locatif ; réglementation relative à la décence énergétique et à l’opposabilité du diagnostic.</span></div>
            <div className="appref"><span className="n">⁴</span><span><b>Assurance emprunteur — produit exceptionnel.</b> Contrats de prêt et d’assurance ; qualification de l’indemnité selon le régime de la structure (CE 6 août 2008 n°301336 ; CGI art. 38 et 38 quater ; BOI-RFPI-BASE-20-80).</span></div>
            <div className="appref"><span className="n">⁵</span><span><b>Multiplicité des banques.</b> Clauses des contrats de prêt et obligations de sincérité des déclarations d’engagements (Code civil, art. 1103 et 1104).</span></div>
            <div className="appref"><span className="n">⁶</span><span><b>Régime de la location meublée non professionnelle.</b> Liasse fiscale et avis d’imposition ; seuils du statut (CGI art. 155, IV), régime réel BIC (BOI-BIC-CHAMP-40-20) et réintégration des amortissements (CGI art. 150 VB III).</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
