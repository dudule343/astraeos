/**
 * Section « Analyse de la fiscalité » du document d'audit (maquette, partie
 * Audit, lignes 3426-3479).
 *
 * Portage fidèle de la maquette (mêmes rubriques, mêmes libellés, même
 * disposition : cadre de module, tableau de composition, indicateurs fiscaux,
 * accordéons « Risques & opportunités », synthèse du thème, annexe client),
 * branché sur le RÉEL. Chaque fragment marqué `data-block` dans la maquette est
 * enveloppé d'un <Bloc> dont la clé reprend EXACTEMENT la valeur data-block
 * (apostrophes courbes comprises), donc sélectionnable, éditable et validable
 * par le volet de révision.
 *
 * Branchement honnête :
 * - Le taux marginal d'imposition (KPI 3 et synthèse) est dérivé du RÉEL :
 *   EtudeDonnees.foyer.personnes[].tmi. Sinon « — ».
 * - Les MONTANTS du patrimoine fiscal (taxes foncières, impôt sur le revenu,
 *   sous-totaux, totaux, assiette IFI, valeur du bien étranger…) n'existent pas
 *   en base : ils sont affichés « — », éditables, jamais recopiés des chiffres
 *   d'exemple de la maquette.
 * - Les textes méthodologiques et les panneaux de confiance (CERTIF) décrivent
 *   la méthode d'analyse : ils sont reproduits fidèlement comme contenu de
 *   blocs éditables ; les chiffres nominatifs qu'ils citaient deviennent « — ».
 *
 * Les comportements JS (repli des accordéons, infobulles, ouverture des
 * panneaux CERTIF, édition des cellules) sont câblés ensuite par le script
 * global qui se raccroche aux classes exactes de la maquette : ce composant ne
 * produit que le markup.
 */

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

import "../../../../_styles/sections/fiscalite.css";

const DASH = "—";

/**
 * Taux marginal d'imposition du foyer, dérivé du réel. Le foyer fiscal partage
 * un TMI : on retient le plus élevé des taux renseignés. « — » si aucun.
 */
function foyerTmi(donnees: EtudeDonnees): number | null {
  const taux = donnees.foyer.personnes
    .map((p) => p.tmi)
    .filter((t): t is number => t != null);
  return taux.length ? Math.max(...taux) : null;
}

// ---------------------------------------------------------------------------
// Tableau de composition de la fiscalité
// ---------------------------------------------------------------------------

/** Une ligne du tableau : libellé éditable + présence d'un montant par colonne. */
type LigneFisc = {
  designation: string;
  monsieur: boolean;
  madame: boolean;
  commun: boolean;
  total: boolean;
  strong?: boolean;
};

/**
 * Lignes reprises de la maquette comme amorces ÉDITABLES. Les libellés sont
 * conservés (textes méthodologiques), mais aucun montant d'exemple n'est
 * recopié : chaque cellule chiffrée présente affiche « — ».
 */
const LIGNES_IMPOTS: LigneFisc[] = [
  { designation: "Taxe foncière – Résidence principale", monsieur: true, madame: true, commun: false, total: true },
  { designation: "Impôt sur le revenu", monsieur: false, madame: false, commun: true, total: true },
  { designation: "Taxe foncière – Parking Monsieur", monsieur: true, madame: false, commun: false, total: true },
  { designation: "Taxe foncière – Parking Madame", monsieur: false, madame: true, commun: false, total: true },
  { designation: "Taxe foncière – Appartement 1", monsieur: true, madame: true, commun: false, total: true },
  { designation: "Taxe foncière – Appartement 2", monsieur: true, madame: true, commun: false, total: true },
  { designation: "Taxe foncière – Appartement 3", monsieur: true, madame: true, commun: false, total: true },
];

const SOUS_TOTAL_IMPOTS: LigneFisc = {
  designation: "Sous-total impôts et taxes",
  monsieur: true,
  madame: true,
  commun: true,
  total: true,
  strong: true,
};

const TOTAL_CHARGES: LigneFisc = {
  designation: "Total des charges",
  monsieur: true,
  madame: true,
  commun: true,
  total: true,
  strong: true,
};

/** Cellule chiffrée : « — » honnête si la colonne porte un montant, sinon vide. */
function NumCell({ present, strong }: { present: boolean; strong?: boolean }) {
  if (!present) return <td className="num" />;
  return (
    <td className="num">
      <div className="cell" data-fmt="txt">
        {strong ? <strong>{DASH}</strong> : DASH}
      </div>
    </td>
  );
}

function LigneTbody({ l }: { l: LigneFisc }) {
  return (
    <tr>
      <td>
        <div className="cell ed" data-fmt="txt">
          {l.strong ? <strong>{l.designation}</strong> : l.designation}
        </div>
      </td>
      <td>
        <div className="cell ed" data-fmt="txt" />
      </td>
      <NumCell present={l.monsieur} strong={l.strong} />
      <NumCell present={l.madame} strong={l.strong} />
      <NumCell present={l.commun} strong={l.strong} />
      <NumCell present={l.total} strong={l.strong} />
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function FiscaliteSection({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  const tmi = foyerTmi(donnees);
  const tmiLabel = tmi != null ? `${tmi} %` : DASH;
  const tmiBareme =
    tmi != null
      ? `Tranche à ${tmi} % du barème de l'impôt sur le revenu.`
      : "Tranche correspondante du barème de l'impôt sur le revenu, à déterminer.";

  return (
    <div className="immo-mod">
      <div className="page">
        <div className="shead">
          <div className="pic">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C68E0E"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M3.5 10l8.5-6 8.5 6" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Audit patrimonial</div>
            <h1>Analyse de la fiscalité</h1>
          </div>
        </div>

        <div className="mod-body">
          <Bloc blocKey="Texte d’introduction de la fiscalité" className="lead">
            L’étude de la fiscalité permet d’appréhender le poids des impôts et taxes dans la gestion
            du budget et la constitution du patrimoine. Nous considérons l’impôt sur le revenu, les
            impôts fonciers, les contributions sociales, les taxes sur les plus-values immobilières
            et financières, l’impôt sur la fortune immobilière ainsi que d’éventuelles spécificités
            selon les informations transmises.
          </Bloc>

          <Bloc blocKey="Objet de l’analyse fiscale">
            <p>
              En examinant ces éléments, nous pouvons identifier les leviers d’optimisation et
              suggérer des stratégies d’adaptation en cas d’évolutions législatives susceptibles
              d’affecter la charge fiscale future.
            </p>
            <p>
              Nous intégrons par ailleurs dans notre accompagnement une veille réglementaire qui
              pourrait influencer la stratégie fiscale afin qu’elle soit toujours efficiente.
            </p>
          </Bloc>

          <div className="subttl anchor" id="compo-fisc">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 5h16M4 12h16M4 19h16" />
            </svg>{" "}
            Composition de la fiscalité
          </div>
          <table className="et et-fisc">
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "14.25%" }} />
              <col style={{ width: "14.25%" }} />
              <col style={{ width: "14.25%" }} />
              <col style={{ width: "14.25%" }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2}>Désignation des charges</th>
                <th rowSpan={2}>Date d’échéance</th>
                <th colSpan={4} style={{ textAlign: "center" }}>
                  Montant
                </th>
              </tr>
              <tr>
                <th className="num">Monsieur</th>
                <th className="num">Madame</th>
                <th className="num">Commun</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    background: "var(--light-blue)",
                    color: "var(--navy)",
                    fontWeight: 700,
                    fontSize: "11px",
                    letterSpacing: "0.3px",
                    padding: "7px 11px",
                  }}
                >
                  Impôts et taxes
                </td>
              </tr>
              {LIGNES_IMPOTS.map((l) => (
                <LigneTbody key={l.designation} l={l} />
              ))}
              <LigneTbody l={SOUS_TOTAL_IMPOTS} />
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <div className="cell" data-fmt="txt">
                    <strong>{TOTAL_CHARGES.designation}</strong>
                  </div>
                </td>
                <td>
                  <div className="cell" data-fmt="txt" />
                </td>
                <NumCell present={TOTAL_CHARGES.monsieur} strong />
                <NumCell present={TOTAL_CHARGES.madame} strong />
                <NumCell present={TOTAL_CHARGES.commun} strong />
                <NumCell present={TOTAL_CHARGES.total} strong />
              </tr>
            </tfoot>
          </table>

          <div className="subttl anchor" id="indic-fisc">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round">
              <path d="M4 19V5M4 13l4-3 4 2 8-7" />
            </svg>{" "}
            Indicateurs fiscaux
          </div>
          <div className="kpirow" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="kpi">
              <div className="kv">{DASH}</div>
              <div className="kl">
                Total des impôts et taxes
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Total des impôts et taxes</span>
                    <span className="ktd">
                      Ensemble des impôts et taxes supportés par le foyer sur une année.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Calcul</span>
                      Somme des taxes foncières et de l’impôt sur le revenu du foyer.
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="kpi">
              <div className="kv">{DASH}</div>
              <div className="kl">
                Taux de pression fiscale
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Taux de pression fiscale</span>
                    <span className="ktd">
                      Part des impôts et taxes dans les revenus annuels du foyer.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Calcul</span>
                      Total des impôts et taxes ÷ revenus annuels du foyer.
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="kpi">
              <div className="kv">{tmiLabel}</div>
              <div className="kl">
                Taux marginal d’imposition
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Taux marginal d’imposition (TMI)</span>
                    <span className="ktd">
                      Taux appliqué à la dernière tranche de revenu imposable ; il mesure l’impôt
                      supporté sur chaque euro supplémentaire gagné.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Barème</span>
                      {tmiBareme}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="subttl anchor" id="risk-fiscalite">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>{" "}
            Risques &amp; opportunités
          </div>

          <Bloc blocKey="Impôt sur la fortune immobilière (IFI)" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <path
                    d="M7 17v-4l5-3.5 5 3.5v4"
                    stroke="#FAF8F3"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinejoin="round"
                  />
                  <path d="M11 12.5h2.4M11 14h2" stroke="#FAF8F3" strokeWidth={1.3} />
                </svg>
              </span>
              <span className="tt">
                Impôt sur la fortune immobilière : un seuil de déclenchement à surveiller
              </span>
              <span className="cert c-moy eng-only">
                <span>Confiance modérée · 78 %</span>
                <span className="co">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="ab-grid">
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4" />
                  </svg>{" "}
                  Constat &amp; origine
                </div>
                <ul className="dlist">
                  <li>
                    Au 1<sup>er</sup> janvier de l’année en cours, le patrimoine net taxable à l’IFI
                    s’élève à <strong>{DASH}</strong> (à compléter, le cas échéant en y intégrant un
                    bien situé à l’étranger).
                  </li>
                  <li>
                    Une telle situation s’explique le plus souvent par l’absence de dettes
                    déductibles sur le parc immobilier personnel.
                  </li>
                  <li>
                    Un éventuel local professionnel détenu en société peut être exonéré, mais son
                    amortissement et surtout la cessation d’activité future réintégreraient cet actif
                    (montant à chiffrer) dans l’assiette.
                  </li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r">
                    <span className="lab">Risque</span>
                    Le foyer devient redevable de l’IFI dès que l’assiette franchit le seuil légal.
                    Une non-imposition qui ne reposerait que sur la non-déclaration d’un bien
                    étranger exposerait, en cas d’identification, à l’IFI majoré d’intérêts de retard
                    et de pénalités.
                  </div>
                  <div className="it o">
                    <span className="lab">Opportunité</span>
                    Anticiper permet d’organiser l’assiette : recours à l’endettement déductible,
                    démembrement de propriété ou donations réduisent légalement la base taxable.
                  </div>
                  <div className="it opt">
                    <span className="lab">Optimisation</span>
                    Structurer un passif déductible et anticiper la réintégration du bien
                    professionnel pour contenir l’assiette.
                  </div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19V5M4 15l5-4 4 3 7-7" />
                  </svg>{" "}
                  Impact quantifié
                </div>
                <p>
                  L’absence de passif déductible rend l’assiette perméable à toute hausse des prix de
                  l’immobilier. À l’arrêt de l’activité, le patrimoine taxable ({DASH}, à compléter)
                  peut basculer dans une tranche d’IFI supérieure sans passif pour contrebalancer.
                </p>
              </div>
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>{" "}
                  Justification
                </div>
                <p>
                  Composition du patrimoine immobilier et règles de l’impôt sur la fortune
                  immobilière.
                </p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span>
                <b>Préconisation :</b> régulariser la situation et structurer l’assiette IFI (partie
                « Préconisations »).
              </span>
            </div>
          </Bloc>

          <Bloc blocKey="Bien détenu à l’étranger – mise en conformité" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <path
                    d="M12 8.5v4M12 15h.01"
                    stroke="#FAF8F3"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="tt">
                Bien détenu à l’étranger : un risque de redressement à neutraliser
              </span>
              <span className="cert c-moy eng-only">
                <span>Confiance modérée · 76 %</span>
                <span className="co">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="ab-grid">
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4" />
                  </svg>{" "}
                  Constat &amp; origine
                </div>
                <ul className="dlist">
                  <li>
                    Maintenir un appartement étranger (estimé à <strong>{DASH}</strong>) hors des
                    déclarations fiscales, et organiser une mise en location sans déclarer les
                    revenus perçus, exposerait le foyer à une fragilité juridique.
                  </li>
                  <li>
                    Ce risque serait démultiplié si les loyers étaient encaissés sur un compte
                    bancaire étranger lui-même non déclaré à l’administration française.
                  </li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r">
                    <span className="lab">Risque</span>
                    Les flux financiers issus d’une location, identifiés via l’Échange automatique
                    d’informations (EAI) entre l’État de situation du bien et la France,
                    déclencheraient une alerte automatique auprès de l’administration.
                  </div>
                  <div className="it o">
                    <span className="lab">Opportunité</span>
                    La régularisation spontanée (déclaration du bien, des comptes et des revenus)
                    sécurise durablement la situation et écarte tout risque de redressement.
                  </div>
                  <div className="it opt">
                    <span className="lab">Optimisation</span>
                    Déclarer l’appartement et les comptes étrangers, et régulariser les revenus
                    locatifs auprès de l’administration française.
                  </div>
                </div>
              </div>
            </div>
            <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19V5M4 15l5-4 4 3 7-7" />
                  </svg>{" "}
                  Impact quantifié
                </div>
                <p>
                  Un compte étranger non déclaré expose à une amende de 1 500 € par an, à une
                  taxation d’office des revenus locatifs majorée d’intérêts et de pénalités pouvant
                  atteindre 40 %, voire 80 % en cas de manœuvres frauduleuses. Pour les avoirs non
                  déclarés à l’étranger, le délai de reprise de l’administration passe de 3 à 10 ans.
                </p>
              </div>
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>{" "}
                  Justification
                </div>
                <p>
                  Règles de déclaration des biens et comptes détenus à l’étranger et dispositif
                  d’échange automatique d’informations.
                </p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span>
                <b>Préconisation :</b> régulariser sans délai la déclaration de l’appartement et des
                comptes étrangers (partie « Préconisations »).
              </span>
            </div>
          </Bloc>

          <div className="synthacc">
            <div className="subttl anchor synth-h" id="synthese-theme-fiscalite">
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
                Analyse de la fiscalité — lecture stratégique
              </div>
              <div className="synth-cert sc-green eng-only">
                <span className="sc-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <span>
                  <b>Confiance forte · 87 %</b> · synthèse fondée sur les constats du thème
                </span>
                <span className="sc-link">Voir le détail</span>
              </div>
              <p>
                Les impôts et taxes du foyer s’élèvent à <b>{DASH}</b> par an, l’impôt sur le revenu
                en constituant généralement la part prépondérante. Le taux de pression fiscale
                ressort à <b>{DASH}</b> et le taux marginal d’imposition à <b>{tmiLabel}</b>.
              </p>
              <p>
                Le principal enjeu fiscal est l’<b>impôt sur la fortune immobilière</b> : il convient
                de chiffrer l’assiette taxable et d’apprécier sa proximité avec le seuil légal.
                L’absence de passif déductible la rendrait très sensible à toute hausse de
                l’immobilier, et la cessation d’activité ferait mécaniquement progresser le
                patrimoine taxable.
              </p>
              <p>
                Un point de vigilance majeur porte sur la <b>mise en conformité</b> : un éventuel
                appartement situé à l’étranger et les revenus locatifs associés doivent être déclarés
                pour écarter tout risque de redressement. La régularisation et la structuration de
                l’assiette IFI constituent les leviers prioritaires, développés dans le volet
                préconisations.
              </p>
              <div className="sp-recap">
                <div className="spr spr-r">
                  <div className="spr-h">Principaux risques</div>
                  <ul>
                    <li>Franchissement possible du seuil de l’IFI, accentué à la retraite.</li>
                    <li>Assiette IFI sans passif déductible, perméable à la hausse des prix.</li>
                    <li>Risque de redressement sur un bien et des comptes détenus à l’étranger.</li>
                  </ul>
                </div>
                <div className="spr spr-o">
                  <div className="spr-h">Principales opportunités</div>
                  <ul>
                    <li>Structuration de l’assiette IFI (endettement, démembrement, donations).</li>
                    <li>Régularisation spontanée sécurisant durablement la situation.</li>
                    <li>Veille réglementaire intégrée à l’accompagnement.</li>
                  </ul>
                </div>
                <div className="spr spr-opt">
                  <div className="spr-h">Principales optimisations</div>
                  <ul>
                    <li>Régularisation du bien et des comptes étrangers.</li>
                    <li>Constitution d’un passif déductible sur le parc immobilier.</li>
                    <li>Anticipation de la réintégration du bien professionnel.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="appendix client-only">
            <div className="ap-h">Sources et pièces analysées</div>
            <ul>
              <li>Avis d’imposition sur le revenu</li>
              <li>Avis de taxe foncière</li>
              <li>État du patrimoine immobilier et règles IFI applicables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
