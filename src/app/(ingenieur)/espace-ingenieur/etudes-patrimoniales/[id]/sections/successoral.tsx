/**
 * Section « Analyse successorale » du document d'audit (maquette, partie Audit,
 * lignes 3592-3601).
 *
 * Portage fidèle de la maquette (mêmes modules à ascenseur, mêmes sous-rubriques,
 * mêmes libellés, mêmes tableaux, mêmes encarts « Risques & opportunités », même
 * synthèse du thème), branché sur le RÉEL. Chaque fragment marqué `data-block`
 * dans la maquette est enveloppé d'un <Bloc> dont la clé reprend EXACTEMENT la
 * valeur data-block (apostrophes courbes et tirets compris), donc sélectionnable,
 * éditable et validable par le volet de révision.
 *
 * Branchement honnête :
 * - Régime matrimonial et date de mariage : dérivés du RÉEL
 *   (EtudeDonnees.foyer.maritalRegime / marriageDate). Sinon formulation neutre.
 * - Identité des membres du foyer : les conjoints sont nommés à partir du RÉEL
 *   (personnes person_a/person_b) ; les enfants, dont les prénoms n'existent pas
 *   en base, sont désignés par des libellés neutres (« Premier enfant »…). Aucun
 *   nom d'exemple de la maquette (« Delaunay », « Hugo », « Léa ») n'est recopié.
 * - Tous les MONTANTS du calcul successoral (masses transmises/taxables, droits,
 *   assurance-vie, coûts globaux, parts taxables, droits par tranche, totaux de
 *   synthèse…) n'existent pas en base : ils sont affichés « — », éditables,
 *   jamais recopiés des chiffres d'exemple de la maquette.
 * - Les constantes LÉGALES qui décrivent la méthode (abattements 100 000 € /
 *   152 500 €, barème et seuils du tableau I, taux de réversion, articles du
 *   Code) sont conservées : elles ne sont pas propres au client.
 *
 * Les comportements JS (repli des modules et des accordéons, ouverture des
 * « Détail du calcul », panneaux CERTIF) sont câblés ensuite par le script
 * global qui se raccroche aux classes/identifiants exacts de la maquette : ce
 * composant ne produit que le markup.
 */

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import { MARITAL_REGIME_LABELS, formatFicheDate } from "../../../../_data/fiche-client";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

import "../../../../_styles/sections/successoral.css";

const DASH = "—";

// ---------------------------------------------------------------------------
// Dérivations honnêtes depuis le réel
// ---------------------------------------------------------------------------

/** « Monsieur Untel » / « Madame Untel » à partir du foyer réel (sinon civilité seule). */
function civilNom(donnees: EtudeDonnees, role: "person_a" | "person_b", civil: string): string {
  const p = donnees.foyer.personnes.find((x) => x.role === role);
  const nom = (p?.nom ?? "").trim();
  return nom ? `${civil} ${nom}` : civil;
}

function regimeLabel(donnees: EtudeDonnees): string | null {
  const r = donnees.foyer.maritalRegime;
  if (!r) return null;
  return MARITAL_REGIME_LABELS[r as keyof typeof MARITAL_REGIME_LABELS] ?? r;
}

/** Réserve héréditaire collective des enfants, formulée selon leur nombre réel. */
function reserveText(nb: number | null): string {
  if (nb == null) {
    return "leur réserve héréditaire est fixée selon leur nombre (la moitié pour un enfant, les deux tiers pour deux enfants, les trois quarts pour trois enfants et plus)";
  }
  if (nb <= 1) return "leur réserve héréditaire est de la moitié de la succession";
  if (nb === 2) return "la réserve héréditaire est des deux tiers, soit un tiers pour chaque enfant";
  return "la réserve héréditaire est des trois quarts, répartis à parts égales entre les enfants";
}

// ---------------------------------------------------------------------------
// Icônes réutilisées
// ---------------------------------------------------------------------------

function EyeSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Cert({ variant, label }: { variant: "c-forte" | "c-moy"; label: string }) {
  return (
    <span className={`cert ${variant} eng-only`}>
      <span>{label}</span>
      <span className="co">
        <EyeSvg />
      </span>
    </span>
  );
}

function ModChev() {
  return (
    <span className="modchev eng-only">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

/** Icône des sous-titres « Décès … » (double flèche d'échange). */
function SwapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#102D50"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h11M11 3.5 14.5 7 11 10.5" />
      <path d="M20 17H9M12.5 13.5 9 17l3.5 3.5" />
    </svg>
  );
}

function InfoCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 15l5-4 4 3 7-7" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function FootArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Encart « Risques & opportunités » : Attribution préférentielle
// (présent dans le module « Droits successoraux » ET rappelé dans la synthèse)
// ---------------------------------------------------------------------------

function AttributionPreferentielleBloc({ monsieur, madame }: { monsieur: string; madame: string }) {
  return (
    <Bloc blocKey="Attribution préférentielle" className="ablock fold">
      <div className="ab-h">
        <span className="mx">
          <svg viewBox="0 0 24 24">
            <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
            <path
              d="M7.4 12.4 12 8.8l4.6 3.6M8.6 11.9V16h6.8v-4.1"
              stroke="#FAF8F3"
              strokeWidth={1.25}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="tt">Attribution préférentielle</span>
        <Cert variant="c-forte" label="Confiance forte · 85 %" />
      </div>
      <div className="ab-grid">
        <div className="dim">
          <div className="dh">
            <InfoCircle /> Constat &amp; origine
          </div>
          <ul className="dlist">
            <li>
              Les testaments olographes du couple peuvent prévoir l’attribution préférentielle de la
              résidence principale au profit du conjoint survivant.
            </li>
            <li>
              Cette clause impose contractuellement au survivant de « désintéresser les enfants » par
              le versement d’une soulte si la valeur du bien excède sa quote-part successorale.
            </li>
          </ul>
        </div>
        <div className="dim">
          <div className="rio">
            <div className="it r">
              <span className="lab">Risque</span>Sans liquidités suffisantes, le versement de la soulte
              aux enfants rendrait l’attribution préférentielle de la résidence principale difficile à
              mettre en œuvre.
            </div>
            <div className="it o">
              <span className="lab">Opportunité</span>L’attribution préférentielle permet au conjoint
              survivant de conserver la résidence principale du foyer.
            </div>
            <div className="it opt">
              <span className="lab">Optimisation</span>Constituer ou flécher des liquidités
              (assurance-vie, épargne) destinées à couvrir la soulte éventuelle.
            </div>
          </div>
        </div>
      </div>
      <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
        <div className="dim">
          <div className="dh">
            <TrendIcon /> Impact quantifié
          </div>
          <p>
            Anticiper les liquidités nécessaires. {monsieur} et {madame} doivent s’assurer de disposer
            des liquidités suffisantes (assurance-vie ou épargne) pour payer cette soulte aux enfants,
            faute de quoi l’attribution préférentielle pourrait être difficile à mettre en œuvre.
          </p>
        </div>
        <div className="dim">
          <div className="dh">
            <CheckCircle /> Justification
          </div>
          <p>
            La clause d’attribution préférentielle impose au survivant de désintéresser les enfants par
            une soulte dès lors que la valeur de la résidence principale excède sa quote-part
            successorale.
          </p>
        </div>
      </div>
      <div className="ab-foot">
        <FootArrow />
        <span>
          <b>Préconisation :</b> Identifier et sécuriser les liquidités nécessaires (assurance-vie,
          épargne disponible) pour garantir l’attribution préférentielle de la résidence principale.
        </span>
      </div>
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Encart « Risques & opportunités » : Droits de succession
// (présent dans le module « simulations » ET rappelé dans la synthèse)
// ---------------------------------------------------------------------------

function DroitsSuccessionBloc({ regime }: { regime: string | null }) {
  return (
    <Bloc blocKey="Droits de succession" className="ablock fold">
      <div className="ab-h">
        <span className="mx">
          <svg viewBox="0 0 24 24">
            <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
            <circle cx="12" cy="12" r="3.9" stroke="#FAF8F3" strokeWidth={1.3} fill="none" />
            <path d="M12 9.7v4.6M10.3 12h3.4" stroke="#FAF8F3" strokeWidth={1.1} strokeLinecap="round" />
          </svg>
        </span>
        <span className="tt">Droits de succession</span>
        <Cert variant="c-moy" label="Confiance modérée · 80 %" />
      </div>
      <div className="ab-grid">
        <div className="dim">
          <div className="dh">
            <InfoCircle /> Constat &amp; origine
          </div>
          <ul className="dlist">
            <li>
              Le foyer est marié{regime ? <> sous le régime de {regime}</> : <> sous le régime matrimonial applicable</>}, avec des enfants à charge.
            </li>
            <li>
              Le montant total des droits de succession au second décès est estimé entre{" "}
              <strong>{DASH}</strong> et <strong>{DASH}</strong> selon l’ordre des décès.
            </li>
            <li>
              Les testaments olographes peuvent prévoir l’attribution de la quotité disponible maximale
              au conjoint (1/4 en pleine propriété et 3/4 en usufruit).
            </li>
            <li>
              Les contrats d’assurance-vie peuvent reposer sur une clause bénéficiaire standard dite
              « usuelle ».
            </li>
          </ul>
        </div>
        <div className="dim">
          <div className="rio">
            <div className="it r">
              <span className="lab">Risque</span>L’impôt successoral au second décès amputerait
              lourdement l’actif net transmis aux enfants ; la clause bénéficiaire usuelle empêche de
              consommer les abattements de 152 500 € des enfants dès le premier décès.
            </div>
            <div className="it o">
              <span className="lab">Opportunité</span>Des marges d’optimisation de la transmission
              demeurent mobilisables avant les décès.
            </div>
            <div className="it opt">
              <span className="lab">Optimisation</span>Réviser les clauses bénéficiaires d’assurance-vie
              et étudier des dispositifs d’anticipation (donation, démembrement).
            </div>
          </div>
        </div>
      </div>
      <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
        <div className="dim">
          <div className="dh">
            <TrendIcon /> Impact quantifié
          </div>
          <p>
            Anticipation nécessaire de la transmission. L’impôt successoral amputerait lourdement
            l’actif net transmis aux enfants. La clause bénéficiaire standard empêcherait de consommer
            les abattements de 152 500 € des enfants dès le premier décès. Des stratégies d’anticipation
            pourraient être mises en place.
          </p>
        </div>
        <div className="dim">
          <div className="dh">
            <CheckCircle /> Justification
          </div>
          <p>
            Les droits de succession au second décès, estimés entre <strong>{DASH}</strong> et{" "}
            <strong>{DASH}</strong> selon l’ordre des départs, pèsent sur un patrimoine peu liquide et
            largement professionnel.
          </p>
        </div>
      </div>
      <div className="ab-foot">
        <FootArrow />
        <span>
          <b>Préconisation :</b> Engager une stratégie d’anticipation de la transmission, à commencer
          par la révision des clauses bénéficiaires d’assurance-vie afin de mobiliser les abattements
          des enfants.
        </span>
      </div>
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Tableaux de simulation (montants honnêtes : « — » éditable)
// ---------------------------------------------------------------------------

const SIM_HEADERS = [
  "Masse transmise",
  "Masse taxable",
  "Droits de succession",
  "Masse nette",
  "Assurance vie reçue",
  "Taxation au 990i",
  "Assurance vie nette",
  "Total reçu",
  "Tranche atteinte (barème)",
];

const SIM_COLS = [14, 9.5, 9, 9.5, 9, 9.5, 9, 9.5, 9.5, 11];

type SimRow = { name: string; cells: boolean[] };

function SimTable({
  blocKey,
  rows,
  foot,
}: {
  blocKey: string;
  rows: SimRow[];
  foot: boolean[];
}) {
  return (
    <Bloc blocKey={blocKey}>
      <div className="succ-scroll">
        <table className="et succ-et">
          <colgroup>
            {SIM_COLS.map((w, i) => (
              <col key={i} style={{ width: `${w}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>Successible</th>
              {SIM_HEADERS.map((h) => (
                <th key={h} className="num">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {r.name}
                  </div>
                </td>
                {r.cells.map((active, ci) => (
                  <td key={ci} className="num">
                    {active ? (
                      <div className="cell ed" data-fmt="txt">
                        {DASH}
                      </div>
                    ) : (
                      <div className="cell ed mt" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              {foot.map((active, ci) => (
                <td key={ci} className="num">
                  {active ? DASH : null}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Bloc « Détail du calcul » (méthode reproduite, montants « — »)
// ---------------------------------------------------------------------------

type BaremeRow = { f: ReactNode; t: string };

function baremeRows(topTranche: 4 | 5): BaremeRow[] {
  const rows: BaremeRow[] = [
    { f: "jusqu’à 8 072 €", t: "5 %" },
    { f: "de 8 072 € à 12 109 €", t: "10 %" },
    { f: "de 12 109 € à 15 932 €", t: "15 %" },
  ];
  if (topTranche === 4) {
    rows.push({ f: <>de 15 932 € à {DASH}</>, t: "20 %" });
  } else {
    rows.push({ f: "de 15 932 € à 552 324 €", t: "20 %" });
    rows.push({ f: <>de 552 324 € à {DASH}</>, t: "30 %" });
  }
  return rows;
}

function DetailCalcul({
  n,
  conjoint,
  topTranche,
  hasAV,
}: {
  n: 1 | 2 | 3 | 4;
  conjoint: string | null;
  topTranche: 4 | 5;
  hasAV: boolean;
}) {
  return (
    <div className="succ-detail" id={`succ-det-${n}`} hidden>
      <div className="sd-head">Méthode de calcul du coût global</div>
      <p className="sd-intro">
        Le coût global réunit les droits de succession dus par les héritiers
        {hasAV ? (
          <> et la taxation de l’assurance-vie prévue à l’article 990 I du Code général des impôts.</>
        ) : (
          <>.</>
        )}
      </p>
      <div className="sd-step">
        <div className="sd-step-t">Étape 1 — Les droits de succession</div>
        {conjoint ? (
          <div className="sd-note">
            <span className="sd-note-k">Conjoint survivant — {conjoint}</span> Exonération totale de
            droits de succession (article 796-0 bis du Code général des impôts, issu de la loi du 21
            août 2007).
          </div>
        ) : null}
        <p className="sd-txt">
          Les droits sont liquidés sur la part nette revenant à chaque héritier, après application de
          son abattement personnel, puis selon le barème progressif :
        </p>
        <table className="sd-bar sd-assiette">
          <tbody>
            <tr>
              <td className="sb-l">Part nette taxable revenant à chaque enfant</td>
              <td className="sb-m">{DASH}</td>
            </tr>
            <tr>
              <td className="sb-l">
                Abattement personnel{" "}
                <span className="sb-ref">article 779, I du Code général des impôts</span>
              </td>
              <td className="sb-m sb-neg">− 100 000 €</td>
            </tr>
            <tr className="sb-base">
              <td className="sb-l">Base nette taxable</td>
              <td className="sb-m">{DASH}</td>
            </tr>
          </tbody>
        </table>
        <div className="sd-sub">
          Application du barème progressif{" "}
          <span className="sb-ref">article 777, tableau I (ligne directe) du Code général des impôts</span>
        </div>
        <table className="sd-bar">
          <thead>
            <tr>
              <th>Fraction de la base nette taxable</th>
              <th>Taux</th>
              <th>Droits</th>
            </tr>
          </thead>
          <tbody>
            {baremeRows(topTranche).map((r, i) => (
              <tr key={i}>
                <td className="sb-f">{r.f}</td>
                <td className="sb-t">{r.t}</td>
                <td className="sb-m">{DASH}</td>
              </tr>
            ))}
            <tr className="sb-tot">
              <td colSpan={2}>Droits dus par chaque enfant</td>
              <td className="sb-m">{DASH}</td>
            </tr>
          </tbody>
        </table>
        <p className="sd-txt">
          Les deux enfants étant dans une situation identique, le total des droits de succession
          s’établit à {DASH} × 2 = <b>{DASH}</b>{" "}
          <span className="sb-ref">
            montants arrondis à l’euro, article 1649 undecies du Code général des impôts
          </span>
          .
        </p>
      </div>
      {hasAV ? (
        <div className="sd-step">
          <div className="sd-step-t">Étape 2 — La taxation de l’assurance-vie</div>
          <p className="sd-txt">
            Les capitaux décès issus de versements effectués avant les 70 ans de l’assuré ne sont pas
            soumis aux droits de succession : ils relèvent du prélèvement spécifique de l’
            <span className="sb-ref">article 990 I du Code général des impôts</span>. Chaque
            bénéficiaire profite d’un abattement de 152 500 €, puis la fraction taxable est prélevée à
            20 % (31,25 % au-delà de 700 000 € de fraction taxable).
          </p>
          <table className="sd-bar">
            <tbody>
              <tr>
                <td className="sb-l">Capital reçu par chaque enfant</td>
                <td className="sb-m">{DASH}</td>
              </tr>
              <tr>
                <td className="sb-l">Prélèvement dû par chaque enfant</td>
                <td className="sb-m">{DASH}</td>
              </tr>
              <tr className="sb-tot">
                <td>Total du prélèvement (2 bénéficiaires)</td>
                <td className="sb-m">{DASH}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="sd-cg">
        <span className="sd-cg-l">Coût global de la succession</span>
        <span className="sd-cg-f">
          {hasAV ? (
            <>
              Droits de succession {DASH} + prélèvement assurance-vie {DASH}
            </>
          ) : (
            <>Total des droits de succession</>
          )}
        </span>
        <span className="sd-cg-v">{DASH}</span>
      </div>
    </div>
  );
}

function CoutGlobal() {
  return (
    <p className="succ-cout">
      Le coût global à la succession s’élève à <b>{DASH}</b>.
    </p>
  );
}

function DetailButton({ n }: { n: 1 | 2 | 3 | 4 }) {
  return (
    <button className="succ-detbtn" id={`succ-detbtn-${n}`} aria-expanded="false">
      <span className="sdb-ico">+</span>
      <span className="sdb-lab">Voir le détail du calcul</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function SuccessoralSection({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  const monsieur = civilNom(donnees, "person_a", "Monsieur");
  const madame = civilNom(donnees, "person_b", "Madame");
  const enfant1 = "Premier enfant";
  const enfant2 = "Deuxième enfant";
  const regime = regimeLabel(donnees);
  const nbEnfants = donnees.foyer.nbChildren;
  const dateMariage = donnees.foyer.marriageDate ? formatFicheDate(donnees.foyer.marriageDate) : null;

  return (
    <>
      {/* ===== Introduction de l'analyse successorale ===== */}
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
                <path d="M12 21v-8" />
                <path d="M12 13c-2.3 0-4-1.7-4-4.3 0-.5.6-.8 1-.5l3 2.2 3-2.2c.4-.3 1 0 1 .5 0 2.6-1.7 4.3-4 4.3z" />
                <path d="M9 8.4 12 6l3 2.4" />
                <path d="M8 16.5c-1.9 0-3.5-1.6-3.5-3.6 1.9 0 3.5 1.6 3.5 3.6z" />
                <path d="M16 16.5c1.9 0 3.5-1.6 3.5-3.6-1.9 0-3.5 1.6-3.5 3.6z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Audit patrimonial</div>
              <h1>Analyse successorale</h1>
            </div>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Texte d’introduction de l’analyse successorale" className="lead">
              Le cadre juridique de la succession détermine la répartition du patrimoine au décès,
              l’impact fiscal de la transmission et les droits des héritiers. Il influence directement
              la protection des proches et la pérennité du patrimoine.
            </Bloc>
            <Bloc blocKey="Aspects étudiés de la succession">
              <p>Dans cette analyse, nous examinons plusieurs aspects clés :</p>
              <ul className="dlist">
                <li>
                  Les droits successoraux au sein du foyer, en particulier entre les partenaires de
                  vie.
                </li>
                <li>
                  L’historique des éventuelles donations réalisées et leur impact sur les abattements
                  fiscaux et le calcul des droits de succession.
                </li>
                <li>
                  Les hypothèses en termes de partage de la succession du défunt et les conséquences en
                  matière de réserve héréditaire et de quotité disponible.
                </li>
                <li>
                  Le chiffrage des droits de succession en tenant compte des régimes fiscaux applicables
                  (notamment en matière d’assurance-vie) et des éléments figurant dans un éventuel
                  testament.
                </li>
              </ul>
            </Bloc>
          </div>
        </div>
      </div>

      {/* ===== Droits successoraux au sein du foyer ===== */}
      <div className="immo-mod" id="succ-droits">
        <div className="page modfold">
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
                <path d="M12 4.5V21" />
                <path d="M8 21h8" />
                <path d="M5 7.5h14" />
                <circle cx="12" cy="3.4" r="1.2" />
                <path d="M5 7.5 2.6 13a3 3 0 0 0 4.8 0z" />
                <path d="M19 7.5 16.6 13a3 3 0 0 0 4.8 0z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse successorale</div>
              <h1>Droits successoraux au sein du foyer</h1>
            </div>
            <Cert variant="c-forte" label="Confiance forte · 90 %" />
            <ModChev />
          </div>
          <div className="mod-body">
            <div className="subttl anchor" id="succ-ds">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                <path d="M14 2v5h5M9 13h6M9 17h4" />
              </svg>{" "}
              Droit successoral
            </div>
            <Bloc blocKey="Droit successoral du conjoint et des enfants">
              <p>
                Le couple est marié
                {regime ? <> sous le régime de {regime}</> : <> sous le régime matrimonial applicable</>}. Au
                premier décès, la succession se compose des biens personnels du défunt et de sa
                quote-part dans les biens acquis en indivision (résidence principale, SCI, etc.).
              </p>
              <ul className="dlist">
                <li>
                  <b>Réserve héréditaire et enfants :</b> En présence des enfants du foyer,{" "}
                  {reserveText(nbEnfants)}. Les enfants, qu’ils soient biologiques ou adoptés en la
                  forme plénière, disposent de droits successoraux strictement identiques.
                </li>
                <li>
                  <b>Application des testaments olographes :</b> {monsieur} et {madame} peuvent chacun
                  avoir rédigé un testament au profit de l’autre.
                </li>
                <li>
                  <b>Option choisie :</b> Les testaments peuvent prévoir l’attribution de 1/4 en pleine
                  propriété et 3/4 en usufruit de l’universalité des biens. Cette option est
                  particulièrement protectrice car elle permet au conjoint survivant de conserver la
                  pleine gestion du patrimoine (via l’usufruit) tout en en devenant partiellement
                  propriétaire.
                </li>
                <li>
                  <b>Attribution préférentielle :</b> Lorsque le testament stipule expressément que la
                  résidence principale doit faire l’objet d’une attribution préférentielle au profit du
                  conjoint survivant, cela garantit au conjoint de pouvoir conserver ce bien, à charge
                  pour lui d’indemniser les enfants (par une soulte) si la valeur du bien dépasse ses
                  droits successoraux.
                </li>
              </ul>
            </Bloc>

            <div className="subttl anchor" id="succ-log">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V8l7-5 7 5v13" />
                <path d="M10 21v-6h4v6" />
              </svg>{" "}
              Droit au logement
            </div>
            <Bloc blocKey="Droit au logement du conjoint survivant">
              <p>
                Le conjoint survivant bénéficie de protections légales automatiques concernant la
                résidence principale :
              </p>
              <ul className="dlist">
                <li>
                  <b>Le droit temporaire au logement (1 an) :</b> Il est de plein droit et d’ordre
                  public. Durant l’année suivant le décès, le survivant peut occuper gratuitement la
                  résidence principale et utiliser le mobilier, la succession prenant en charge les
                  loyers ou les indemnités d’occupation.
                </li>
                <li>
                  <b>Le droit viager au logement :</b> Sauf volonté contraire exprimée par testament
                  authentique, le survivant peut demander à bénéficier d’un droit d’habitation et
                  d’usage sur le mobilier jusqu’à son propre décès. Ce droit doit être exercé dans
                  l’année suivant le décès.
                </li>
              </ul>
            </Bloc>

            <div className="subttl anchor" id="succ-fisc">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M15.5 9.3a3.6 3.6 0 1 0 0 5.4" />
                <path d="M8 11h5M8 13.4h4" />
              </svg>{" "}
              Droits fiscaux
            </div>
            <Bloc blocKey="Droits fiscaux de la transmission">
              <ul className="dlist">
                <li>
                  <b>Le conjoint survivant :</b> En vertu de la loi TEPA, l’époux survivant est
                  totalement exonéré de droits de succession.
                </li>
                <li>
                  <b>Les enfants :</b>
                  <ul className="dlist">
                    <li>
                      Chaque enfant bénéficie d’un abattement fiscal de 100 000 € sur la part héritée de
                      chaque parent (renouvelable tous les 15 ans).
                    </li>
                    <li>
                      Au-delà de cet abattement, les droits sont calculés selon un barème progressif (de
                      5 % à 45 %).
                    </li>
                  </ul>
                </li>
                <li>
                  <b>Assurance-vie (hors succession) :</b> Pour les primes versées avant 70 ans, le
                  capital est exonéré de droits jusqu’à 152 500 € par bénéficiaire. Lorsque les contrats
                  reposent sur une clause « usuelle », celle-ci favorise le conjoint (exonéré) au
                  détriment de l’utilisation des abattements des enfants.
                </li>
                <li>
                  <b>Prévoyance Madelin :</b> Contrairement au capital décès classique, les rentes
                  issues des contrats Madelin sont fiscalisées (impôt sur le revenu, catégorie
                  « pensions », et prélèvements sociaux), ce qui réduit l’efficacité nette de la
                  protection pour le survivant.
                </li>
              </ul>
            </Bloc>

            <div className="subttl anchor" id="succ-soc">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 2.6v5c0 4.3-3 7.2-7 8.4-4-1.2-7-4.1-7-8.4v-5z" />
                <path d="M9 11.5l2 2 3.6-3.6" />
              </svg>{" "}
              Protection sociale
            </div>
            <Bloc blocKey="Protection sociale et réversion (CARCDSF)">
              <p>
                Les droits de réversion dépendent du régime de retraite obligatoire dont relèvent les
                assurés du foyer :
              </p>
              <ul className="dlist">
                <li>
                  <b>Pension de réversion (régime de base) :</b> Elle est attribuée sous conditions de
                  ressources du survivant. Le taux est de 54 % des droits acquis par le défunt.
                </li>
                <li>
                  <b>Régime complémentaire et prestation complémentaire vieillesse (PCV) :</b> La
                  réversion s’élève à 60 % des points du défunt. Elle est versée sans condition de
                  ressources, généralement à partir de 60 ans. Toutefois, elle peut être versée
                  immédiatement lorsque le conjoint survivant a au moins deux enfants à charge.
                </li>
                <li>
                  <b>Conditions de mariage :</b> Le mariage du couple
                  {dateMariage ? <>, célébré le {dateMariage},</> : null} doit remplir les conditions de
                  durée requises pour l’ouverture de ces droits.
                </li>
              </ul>
            </Bloc>

            <div className="subttl anchor" id="succ-rio-d">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M8 21h8" />
                <path d="M5 7.5h14" />
                <circle cx="12" cy="3.4" r="1.1" />
                <path d="M5 7.5 2.6 13a3 3 0 0 0 4.8 0z" />
                <path d="M19 7.5 16.6 13a3 3 0 0 0 4.8 0z" />
              </svg>{" "}
              Risques et opportunités
            </div>
            <AttributionPreferentielleBloc monsieur={monsieur} madame={madame} />
          </div>
        </div>
      </div>

      {/* ===== Analyse des successions selon l'ordre des départs ===== */}
      <div className="immo-mod" id="succ-simul">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h11M11 3l4 4-4 4" />
                <path d="M20 17H9M13 13l-4 4 4 4" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse successorale</div>
              <h1>Analyse des successions selon l’ordre des départs</h1>
            </div>
            <Cert variant="c-forte" label="Confiance forte · 86 %" />
            <ModChev />
          </div>
          <div className="mod-body">
            <Bloc blocKey="Introduction des simulations successorales">
              <p>
                Les prochaines sections permettent d’effectuer les simulations (hors frais de notaire)
                en termes de partage de l’actif successoral à l’occasion du départ :
              </p>
              <ul className="dlist">
                <li>De {monsieur} en premier puis de {madame} en second.</li>
                <li>De {madame} en premier puis de {monsieur} en second.</li>
              </ul>
            </Bloc>

            <div className="subttl anchor" id="succ-t1">
              <SwapIcon /> Décès de {monsieur} en premier (application du testament)
            </div>
            <SimTable
              blocKey="Tableau — décès de Monsieur en premier"
              rows={[
                { name: madame, cells: [true, true, false, true, true, false, false, true, false] },
                { name: enfant1, cells: [true, true, true, true, false, false, false, true, true] },
                { name: enfant2, cells: [true, true, true, true, false, false, false, true, true] },
              ]}
              foot={[true, true, true, true, true, false, false, false, false]}
            />
            <CoutGlobal />
            <DetailButton n={1} />
            <DetailCalcul n={1} conjoint={madame} topTranche={4} hasAV={false} />

            <div className="subttl anchor" id="succ-t2">
              <SwapIcon /> Décès de {madame} en second
            </div>
            <SimTable
              blocKey="Tableau — décès de Madame en second"
              rows={[
                { name: enfant1, cells: [true, true, true, true, true, true, true, true, true] },
                { name: enfant2, cells: [true, true, true, true, true, true, true, true, true] },
              ]}
              foot={[true, true, true, true, true, true, false, false, false]}
            />
            <CoutGlobal />
            <DetailButton n={2} />
            <DetailCalcul n={2} conjoint={null} topTranche={5} hasAV />

            <div className="subttl anchor" id="succ-t3">
              <SwapIcon /> Décès de {madame} en premier (application du testament)
            </div>
            <SimTable
              blocKey="Tableau — décès de Madame en premier"
              rows={[
                { name: monsieur, cells: [true, true, false, true, true, false, true, true, false] },
                { name: enfant1, cells: [true, true, true, true, false, false, false, true, true] },
                { name: enfant2, cells: [true, true, true, true, false, false, false, true, true] },
              ]}
              foot={[true, true, true, true, true, false, false, false, false]}
            />
            <CoutGlobal />
            <DetailButton n={3} />
            <DetailCalcul n={3} conjoint={monsieur} topTranche={4} hasAV={false} />

            <div className="subttl anchor" id="succ-t4">
              <SwapIcon /> Décès de {monsieur} en second
            </div>
            <SimTable
              blocKey="Tableau — décès de Monsieur en second"
              rows={[
                { name: enfant1, cells: [true, true, true, true, true, true, true, true, true] },
                { name: enfant2, cells: [true, true, true, true, true, true, true, true, true] },
              ]}
              foot={[true, true, true, true, true, true, false, false, false]}
            />
            <CoutGlobal />
            <DetailButton n={4} />
            <DetailCalcul n={4} conjoint={null} topTranche={5} hasAV />

            <div className="subttl anchor" id="succ-rio-s">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M8 21h8" />
                <path d="M5 7.5h14" />
                <circle cx="12" cy="3.4" r="1.1" />
                <path d="M5 7.5 2.6 13a3 3 0 0 0 4.8 0z" />
                <path d="M19 7.5 16.6 13a3 3 0 0 0 4.8 0z" />
              </svg>{" "}
              Risques et opportunités
            </div>
            <DroitsSuccessionBloc regime={regime} />
          </div>
        </div>
      </div>

      {/* ===== Synthèse de l'analyse successorale ===== */}
      <div className="immo-mod" id="succ-synthese">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3 8-8" />
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse successorale</div>
              <h1>Synthèse de l’analyse successorale</h1>
            </div>
            <Cert variant="c-moy" label="Confiance modérée · 82 %" />
            <ModChev />
          </div>
          <div className="mod-body">
            <div className="subttl anchor" id="succ-syntbl">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="1.5" />
                <path d="M3 9h18M9 9v11M3 14.5h18" />
              </svg>{" "}
              Synthèse des scénarios de succession
            </div>
            <Bloc blocKey="Tableau de synthèse des scénarios de succession">
              <table className="et succ-syn">
                <colgroup>
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "35%" }} />
                  <col style={{ width: "27%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>1er décès</th>
                    <th>2nd décès</th>
                    <th>Application du testament</th>
                    <th className="num">Droits de succession totaux</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="cell ed" data-fmt="txt">
                        {monsieur}
                      </div>
                    </td>
                    <td>
                      <div className="cell ed" data-fmt="txt">
                        {madame}
                      </div>
                    </td>
                    <td>
                      <div className="cell ed" data-fmt="txt">
                        1/4 en pleine propriété et 3/4 en usufruit
                      </div>
                    </td>
                    <td className="num">
                      <div className="cell ed succ-gold" data-fmt="txt">
                        {DASH}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="cell ed" data-fmt="txt">
                        {madame}
                      </div>
                    </td>
                    <td>
                      <div className="cell ed" data-fmt="txt">
                        {monsieur}
                      </div>
                    </td>
                    <td>
                      <div className="cell ed" data-fmt="txt">
                        1/4 en pleine propriété et 3/4 en usufruit
                      </div>
                    </td>
                    <td className="num">
                      <div className="cell ed succ-gold" data-fmt="txt">
                        {DASH}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Bloc>

            <div
              style={{
                color: "#A57608",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".6px",
                textTransform: "uppercase",
                margin: "18px 0 5px",
              }}
            >
              Rappel des risques et opportunités des modules
            </div>
            <Bloc blocKey="Rappel consolidé des risques et opportunités" className="lead">
              Pour mémoire, cette section rassemble en un seul endroit l’ensemble des risques et
              opportunités identifiés dans les modules de l’analyse successorale.
            </Bloc>

            <AttributionPreferentielleBloc monsieur={monsieur} madame={madame} />
            <DroitsSuccessionBloc regime={regime} />

            <div className="synthacc">
              <div className="subttl anchor synth-h" id="succ-synth">
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
                  Synthèse — analyse successorale
                </div>
                <div className="synth-cert sc-green eng-only">
                  <span className="sc-ico">
                    <EyeSvg />
                  </span>
                  <span>
                    <b>Confiance modérée · 82 %</b> · synthèse fondée sur les constats du thème
                  </span>
                  <span className="sc-link">Voir le détail</span>
                </div>
                <p>
                  Le régime matrimonial du foyer, conjugué à la présence d’enfants protégés par leur
                  réserve héréditaire, structure une transmission dans laquelle le conjoint survivant
                  est déjà fortement protégé : testaments attribuant la quotité disponible maximale (un
                  quart en pleine propriété et trois quarts en usufruit), attribution préférentielle de
                  la résidence principale, exonération de droits au titre de la loi TEPA et réversion du
                  régime de retraite obligatoire.
                </p>
                <p>
                  Le coût successoral se concentre au second décès, estimé entre <b>{DASH}</b> et{" "}
                  <b>{DASH}</b> selon l’ordre des départs. Deux leviers principaux ressortent : la
                  constitution de liquidités pour sécuriser l’attribution préférentielle de la résidence
                  principale, et la révision des clauses bénéficiaires d’assurance-vie, en clause
                  usuelle, qui prive les enfants de leurs abattements de 152 500 € dès le premier décès.
                </p>
                <div className="sp-recap">
                  <div className="spr spr-r">
                    <div className="spr-h">Principaux risques</div>
                    <ul>
                      <li>
                        Coût successoral élevé au second décès ({DASH} à {DASH}).
                      </li>
                      <li>
                        Clause bénéficiaire usuelle privant les enfants de leurs abattements de
                        152 500 € dès le premier décès.
                      </li>
                      <li>Liquidités à prévoir pour la soulte de l’attribution préférentielle.</li>
                    </ul>
                  </div>
                  <div className="spr spr-o">
                    <div className="spr-h">Principales opportunités</div>
                    <ul>
                      <li>
                        Conjoint survivant déjà bien protégé (testaments, usufruit, attribution
                        préférentielle, réversion).
                      </li>
                      <li>
                        Abattements des enfants (100 000 € par parent) et de l’assurance-vie (152 500 €)
                        mobilisables.
                      </li>
                    </ul>
                  </div>
                  <div className="spr spr-opt">
                    <div className="spr-h">Principales optimisations</div>
                    <ul>
                      <li>
                        Réviser les clauses bénéficiaires d’assurance-vie pour répartir entre conjoint
                        et enfants.
                      </li>
                      <li>Constituer ou flécher des liquidités pour la soulte éventuelle.</li>
                      <li>Étudier des dispositifs d’anticipation (donation, démembrement).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
