/**
 * Sous-section « Analyse du patrimoine — Synthèse » du document d'audit
 * (maquette lignes 1575-1766) : patrimoine net & brut, bilan patrimonial,
 * diversification (donuts par personne et par classe d'actifs), liquidité
 * (niveaux, visualisation, seuil de précaution) et répartition au sein du foyer
 * (donut par conjoint, barres divergentes par classe, équilibre).
 *
 * Portage fidèle de la maquette (mêmes sous-rubriques, mêmes libellés, même
 * disposition, mêmes SVG). Chaque data-block est enveloppé d'un <Bloc> dont la
 * clé reprend exactement la valeur data-block de la maquette (sélectionnable,
 * éditable, validable). Module compatible Server Component : il ne compose que
 * des éléments <Bloc> (composant client) rendus dans l'arbre du BlocProvider.
 *
 * Branchement au RÉEL :
 *  - le régime matrimonial de l'encadré « équilibre » vient de donnees.foyer ;
 *  - TOUS les montants du patrimoine (valorisations, répartitions, passif…)
 *    n'existent pas en base : ils sont lus dans donnees.valeurs[<clé>] (null par
 *    défaut) et affichés « — » tant qu'ils ne sont pas saisis. Aucun chiffre de
 *    la maquette n'est recopié comme s'il était réel.
 *  - La GÉOMÉTRIE des SVG (donuts, barres du bilan, barres divergentes) DÉCOULE
 *    désormais des montants client via les helpers purs de ../chart-geom
 *    (donutSegments / barHeights / divergePair). Tant que rien n'est saisi, les
 *    graphiques affichent un état vide neutre (anneau gris, barres à zéro) et
 *    jamais la forme figée héritée du dossier-type.
 */

import { MARITAL_REGIME_LABELS } from "../../../../_data/fiche-client";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

import { Bloc } from "../Bloc";
import ValeurEditable from "../ValeurEditable";
import { donutSegments, barHeights, divergePair } from "../chart-geom";
import "../../../../_styles/sections/patrimoine-synthese.css";

const DASH = "—";

// ---------------------------------------------------------------------------
// Lecture honnête des montants (donnees.valeurs) — « — » tant qu'absent
// ---------------------------------------------------------------------------

function num(donnees: EtudeDonnees, key: string): number | null {
  const v = donnees.valeurs[key];
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function eur(donnees: EtudeDonnees, key: string): string {
  const n = num(donnees, key);
  if (n == null) return DASH;
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;
}

function regimeLabel(donnees: EtudeDonnees): string {
  const r = donnees.foyer.maritalRegime;
  if (!r) return "à préciser";
  return MARITAL_REGIME_LABELS[r] ?? r;
}

// ---------------------------------------------------------------------------
// Référentiels de la section (libellés, couleurs et géométrie SVG de la maquette)
// ---------------------------------------------------------------------------

type Classe = {
  key: string;
  bilan: string; // libellé tableaux
  div: string; // libellé barres divergentes
  leg: string; // libellé légende donut
  color: string;
};

const CLASSES: Classe[] = [
  { key: "immo_usage", bilan: "Immobilier d’usage", div: "Immobilier d’usage", leg: "Immobilier d’usage", color: "#102D50" },
  { key: "immo_rapport", bilan: "Immobilier de rapport", div: "Immobilier de rapport", leg: "Immobilier de rapport", color: "#46638A" },
  { key: "patrimoine_pro", bilan: "Patrimoine professionnel", div: "Patrimoine professionnel", leg: "Patrimoine professionnel", color: "#8A99AD" },
  { key: "liquidites", bilan: "Liquidités", div: "Liquidités", leg: "Liquidités", color: "#DDBB6E" },
  { key: "assurance_vie", bilan: "Assurance-vie / Capitalisation", div: "Assurance-vie / Capi.", leg: "Assurance-vie / Capitalisation", color: "#C68E0E" },
  { key: "valeurs_mobilieres", bilan: "Valeurs mobilières & autres placements", div: "Valeurs mobilières", leg: "Valeurs mobilières & autres placements", color: "#A57608" },
];

// Couleurs des barres du bilan patrimonial (actif / passif / actif net).
const BILAN_BARS = [
  { key: "total_actif", x: 155, tx: 190, color: "#102D50" },
  { key: "total_passif", x: 311, tx: 346, color: "#A4AEBB" },
  { key: "actif_net", x: 467, tx: 502, color: "#A57608" },
];
// Échelle de l'axe (fixe, comme la maquette) : 0 € en bas (y=255), 3,5 M€ en haut (y=35).
const BILAN_SCALE_MAX = 3_500_000;
const BILAN_AXIS_H = 220;
const BILAN_BASE_Y = 255;
const BILAN_BAR_W = 70;

const PASSIF: { key: string; label: string }[] = [
  { key: "passif_emprunt_immobilier", label: "Emprunt immobilier" },
  { key: "passif_emprunt_conso", label: "Emprunt à la consommation" },
  { key: "passif_emprunt_investissement", label: "Emprunt pour l’investissement" },
  { key: "passif_dettes", label: "Dettes" },
];

const NIVEAUX: { key: string; label: string; color: string }[] = [
  { key: "liq_haute", label: "Hautement liquide", color: "#C68E0E" },
  { key: "liq_moyenne", label: "Moyennement liquide", color: "#708196" },
  { key: "liq_faible", label: "Faiblement liquide", color: "#102D50" },
];

// Barres divergentes : seules les positions VERTICALES (y de la barre, y du texte)
// sont fixes ; les largeurs découlent des montants. Monsieur croît vers la gauche
// depuis l'axe x=210, Madame croît vers la droite depuis l'axe x=390.
const DIVERGE: { key: string; label: string; y: number; ty: number }[] = [
  { key: "immo_usage", label: "Immobilier d’usage", y: 28, ty: 43 },
  { key: "immo_rapport", label: "Immobilier de rapport", y: 70, ty: 85 },
  { key: "patrimoine_pro", label: "Patrimoine professionnel", y: 112, ty: 127 },
  { key: "liquidites", label: "Liquidités", y: 154, ty: 169 },
  { key: "assurance_vie", label: "Assurance-vie / Capi.", y: 196, ty: 211 },
  { key: "valeurs_mobilieres", label: "Valeurs mobilières", y: 238, ty: 253 },
];
// Axes des barres divergentes et largeur px allouée à la valeur maximale.
const DIV_RIGHT_M = 210; // bord droit (fixe) des barres Monsieur
const DIV_LEFT_MME = 390; // bord gauche (fixe) des barres Madame
const DIV_BAR_W = 145; // largeur px de la plus grande valeur

// ---------------------------------------------------------------------------
// Icônes (chemins SVG repris de la maquette)
// ---------------------------------------------------------------------------

function InfoCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Fragments d'affichage
// ---------------------------------------------------------------------------

/**
 * Donut générique (cercle de fond + segments). La géométrie de chaque segment
 * DÉCOULE des montants client (donnees.valeurs[item.key]) via donutSegments :
 * la part de chaque arc est proportionnelle au total réel. Si rien n'est saisi
 * (total nul), les segments sont plats et seul l'anneau gris de fond reste
 * visible — état vide neutre, jamais la forme du dossier-type.
 */
function Donut({
  id,
  items,
  tipKey,
  donnees,
}: {
  id: string;
  items: { color: string; key: string }[];
  tipKey: string;
  donnees: EtudeDonnees;
}) {
  const { segments } = donutSegments(items.map((it) => num(donnees, it.key)));
  return (
    <div className="donutbox" id={`box-${id}`}>
      <svg className="donut" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth="17" />
        <g transform="rotate(-90 70 70)" fill="none" strokeWidth="17">
          {items.map((it, i) => (
            <circle
              key={i}
              className="seg"
              id={`seg-${id}-${i}`}
              cx="70"
              cy="70"
              r="54"
              stroke={it.color}
              strokeDasharray={segments[i].dasharray}
              strokeDashoffset={segments[i].dashoffset}
            />
          ))}
        </g>
      </svg>
      <div className="donut-tip" id={`tip-${id}`}>
        <div className="dt-v">{eur(donnees, tipKey)}</div>
      </div>
    </div>
  );
}

/** Ligne de légende donut (pastille, libellé, montant, part). */
function LegRow({
  id,
  color,
  label,
  valKey,
  pctKey,
  donnees,
}: {
  id: string;
  color: string;
  label: string;
  valKey: string;
  pctKey: string;
  donnees: EtudeDonnees;
}) {
  return (
    <div className="lr" id={id}>
      <span className="sw" style={{ background: color }} />
      <span className="ll">{label}</span>
      <span className="lv">
        <ValeurEditable vKey={valKey} format="euro" initial={donnees.valeurs[valKey] ?? null} />
      </span>
      <span className="lp">
        <ValeurEditable vKey={pctKey} format="percent" initial={donnees.valeurs[pctKey] ?? null} />
      </span>
    </div>
  );
}

/** Cellule montant + part d'un tableau de répartition. */
function MP({ donnees, valKey, pctKey }: { donnees: EtudeDonnees; valKey: string; pctKey: string }) {
  return (
    <>
      <span className="m">
        <ValeurEditable vKey={valKey} format="euro" initial={donnees.valeurs[valKey] ?? null} />
      </span>
      <span className="p">
        <ValeurEditable vKey={pctKey} format="percent" initial={donnees.valeurs[pctKey] ?? null} />
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function PatrimoineSynthese({ donnees }: { donnees: EtudeDonnees }) {
  // Barres du bilan patrimonial : hauteurs calées sur l'axe fixe 0 → 3,5 M€.
  const bilan = barHeights(
    BILAN_BARS.map((b) => num(donnees, b.key)),
    { height: BILAN_AXIS_H, max: BILAN_SCALE_MAX },
  );
  const bilanBars = BILAN_BARS.map((b, i) => {
    const h = Math.min(bilan.heights[i], BILAN_AXIS_H);
    return { ...b, h, y: BILAN_BASE_Y - h };
  });

  // Barres divergentes Monsieur / Madame : échelle commune sur la valeur max.
  const divMax = DIVERGE.reduce((m, d) => {
    const a = num(donnees, `${d.key}_m`) ?? 0;
    const b = num(donnees, `${d.key}_mme`) ?? 0;
    return Math.max(m, a, b);
  }, 0);
  const divBars = DIVERGE.map((d) => {
    const { leftW, rightW } = divergePair(num(donnees, `${d.key}_m`), num(donnees, `${d.key}_mme`), {
      max: divMax,
      width: DIV_BAR_W,
    });
    return { ...d, leftW, rightW };
  });

  return (
    <div className="immo-mod">
      <div className="page modfold">
        <div className="shead">
          <div className="pic">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a9 9 0 1 0 9 9h-9z" />
              <path d="M12 3v9" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Analyse du patrimoine</div>
            <h1>Synthèse du patrimoine</h1>
          </div>
          <span className="modchev eng-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>

        <div className="mod-body">
          <Bloc blocKey="Synthèse — introduction" className="subsect">
        <p>
          Cette section offre une vue d’ensemble du patrimoine, actifs et passifs, en abordant les{" "}
          <b>montants</b>, la <b>composition</b>, la <b>diversification</b>, la <b>liquidité</b> et la{" "}
          <b>répartition au sein du foyer</b>. Elle dresse une vision globale et synthétique, préalable à
          l’analyse détaillée de chaque catégorie d’actifs et du passif.
        </p>
      </Bloc>

      <Bloc blocKey="Patrimoine net et brut" className="subsect">
        <h3>Patrimoine net &amp; brut</h3>
        <div className="pstat-grid">
          <div className="pstat">
            <div className="pl">Patrimoine brut</div>
            <div className="pv">
              <ValeurEditable vKey="patrimoine_brut" format="euro" initial={donnees.valeurs["patrimoine_brut"] ?? null} />
            </div>
            <div className="ps">Valeur totale des actifs</div>
          </div>
          <div className="pstat">
            <div className="pl">Passif</div>
            <div className="pv">
              <ValeurEditable vKey="passif_total" format="euro" initial={donnees.valeurs["passif_total"] ?? null} />
            </div>
            <div className="ps">
              Emprunts et dettes{" "}
              <span className="info-i" data-tip="Somme des emprunts et des dettes">
                i
              </span>
            </div>
          </div>
          <div className="pstat net">
            <div className="pl">Patrimoine net</div>
            <div className="pv">
              <ValeurEditable vKey="patrimoine_net" format="euro" initial={donnees.valeurs["patrimoine_net"] ?? null} />
            </div>
            <div className="ps">
              Brut − passif{" "}
              <span className="info-i" data-tip="Patrimoine brut − Passif = Patrimoine net">
                i
              </span>
            </div>
          </div>
        </div>
        <div className="formula-note">
          <span>
            <b>Patrimoine brut</b> = valeur totale des actifs.
          </span>
          <span>
            <b>Patrimoine net</b> = valeur des actifs − valeur des dettes.
          </span>
        </div>
      </Bloc>

      <Bloc blocKey="Bilan patrimonial" className="subsect">
        <table className="bilan2">
          <thead>
            <tr>
              <th colSpan={3}>Actif</th>
              <th colSpan={2} className="sp">
                Passif
              </th>
            </tr>
          </thead>
          <tbody>
            {CLASSES.map((c, i) => {
              const p = PASSIF[i];
              return (
                <tr key={c.key}>
                  <td>{c.bilan}</td>
                  <td className="num">
                    <ValeurEditable vKey={c.key} format="euro" initial={donnees.valeurs[c.key] ?? null} />
                  </td>
                  <td className="pct">
                    <ValeurEditable vKey={`${c.key}_pct`} format="percent" initial={donnees.valeurs[`${c.key}_pct`] ?? null} />
                  </td>
                  <td className="sp">{p ? p.label : ""}</td>
                  <td className="num">
                    {p ? <ValeurEditable vKey={p.key} format="euro" initial={donnees.valeurs[p.key] ?? null} /> : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total actif</td>
              <td className="num">
                <ValeurEditable vKey="total_actif" format="euro" initial={donnees.valeurs["total_actif"] ?? null} />
              </td>
              <td className="pct">
                <ValeurEditable vKey="total_actif_pct" format="percent" initial={donnees.valeurs["total_actif_pct"] ?? null} />
              </td>
              <td className="sp">Total passif</td>
              <td className="num">
                <ValeurEditable vKey="total_passif" format="euro" initial={donnees.valeurs["total_passif"] ?? null} />
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="anet">
          <span className="anet-l">
            Actif net{" "}
            <span className="info-i" data-tip="Total actif − Total passif = Actif net">
              i
            </span>
          </span>
          <span className="anet-v">
            <ValeurEditable vKey="actif_net" format="euro" initial={donnees.valeurs["actif_net"] ?? null} />
          </span>
        </div>
        <div className="chart-wrap">
          <div className="chart-title">Synthèse du patrimoine</div>
          <svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg" fontFamily="Epilogue,sans-serif">
            <g stroke="#DBE0E4" strokeWidth="1">
              <line x1="92" y1="255.0" x2="600" y2="255.0" />
              <line x1="92" y1="223.6" x2="600" y2="223.6" />
              <line x1="92" y1="192.1" x2="600" y2="192.1" />
              <line x1="92" y1="160.7" x2="600" y2="160.7" />
              <line x1="92" y1="129.3" x2="600" y2="129.3" />
              <line x1="92" y1="97.9" x2="600" y2="97.9" />
              <line x1="92" y1="66.4" x2="600" y2="66.4" />
              <line x1="92" y1="35.0" x2="600" y2="35.0" />
            </g>
            <g fill="#708196" fontSize="10" textAnchor="end">
              <text x="85" y="258.0">0 €</text>
              <text x="85" y="226.6">0,5 M€</text>
              <text x="85" y="195.1">1 M€</text>
              <text x="85" y="163.7">1,5 M€</text>
              <text x="85" y="132.3">2 M€</text>
              <text x="85" y="100.9">2,5 M€</text>
              <text x="85" y="69.4">3 M€</text>
              <text x="85" y="38.0">3,5 M€</text>
            </g>
            {bilanBars.map((b) => (
              <rect key={b.key} x={b.x} y={b.y} width={BILAN_BAR_W} height={b.h} fill={b.color} rx="3" />
            ))}
            <g fill="#102D50" fontSize="12" fontWeight="600" textAnchor="middle">
              {bilanBars.map((b) => (
                <text key={b.key} x={b.tx} y={b.y - 8}>
                  {eur(donnees, b.key)}
                </text>
              ))}
            </g>
            {!bilan.hasData ? (
              <text x="346" y="150" textAnchor="middle" fill="#8A99AD" fontSize="11">
                Graphique disponible une fois les montants saisis
              </text>
            ) : null}
            <g fill="#102D50" fontSize="12.5" fontWeight="600" textAnchor="middle">
              <text x="190" y="277">Actif</text>
              <text x="346" y="277">Passif</text>
              <text x="502" y="277">Actif net</text>
            </g>
          </svg>
        </div>
      </Bloc>

      <Bloc blocKey="Diversification — introduction" className="subsect">
        <h3>Diversification du patrimoine</h3>
        <p>
          La diversification, pilier de la gestion du risque patrimonial, conduit à analyser la répartition
          du patrimoine entre différentes classes d’actifs. Une allocation équilibrée réduit l’exposition
          aux risques propres à un marché ou à un secteur et optimise la performance globale. Les catégories
          retenues sont les suivantes :
        </p>
        <ul className="tax">
          <li>
            <b>Immobilier et placements fonciers</b> — immobilier d’usage (résidence principale ou
            secondaire), immobilier de rapport (location nue ou meublée, LMNP, LMP, en nom propre ou via une
            structure à l’impôt sur le revenu), parts de SCPI et fonds immobiliers (OPCI, SIIC), forêts et
            terres agricoles.
          </li>
          <li>
            <b>Actifs professionnels</b> — sociétés d’exploitation, sociétés civiles patrimoniales (SCI, SARL
            de famille soumises à l’impôt sur les sociétés), holdings de détention et de gestion de
            participations.
          </li>
          <li>
            <b>Actifs financiers</b> — comptes-titres ordinaires, PEA et PEA-PME, assurances-vie et contrats
            de capitalisation, épargne retraite et salariale (PER, PEE), liquidités sur livrets réglementés et
            non réglementés.
          </li>
          <li>
            <b>Actifs alternatifs</b> — cryptomonnaies et actifs numériques, investissements tangibles
            (bijoux, objets d’art, vins, montres de collection, véhicules anciens, métaux précieux).
          </li>
          <li>
            <b>Autres catégories</b> — private equity et capital-investissement, dettes privées et prêts
            participatifs, actifs incorporels (propriété intellectuelle, brevets, droits d’auteur, marques).
          </li>
        </ul>
      </Bloc>

      <Bloc blocKey="Diversification — répartition par personne" className="subsect">
        <table className="div-tbl">
          <thead>
            <tr>
              <th>Actif</th>
              <th>Monsieur</th>
              <th>Madame</th>
              <th>Commun</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {CLASSES.map((c) => (
              <tr key={c.key}>
                <td>{c.bilan}</td>
                <td>
                  <MP donnees={donnees} valKey={`${c.key}_m`} pctKey={`${c.key}_m_pct`} />
                </td>
                <td>
                  <MP donnees={donnees} valKey={`${c.key}_mme`} pctKey={`${c.key}_mme_pct`} />
                </td>
                <td className="dash">{DASH}</td>
                <td>
                  <MP donnees={donnees} valKey={c.key} pctKey={`${c.key}_pct`} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total actif</td>
              <td>
                <MP donnees={donnees} valKey="total_actif_m" pctKey="total_actif_m_pct" />
              </td>
              <td>
                <MP donnees={donnees} valKey="total_actif_mme" pctKey="total_actif_mme_pct" />
              </td>
              <td className="dash">{DASH}</td>
              <td>
                <MP donnees={donnees} valKey="total_actif" pctKey="total_actif_pct" />
              </td>
            </tr>
          </tfoot>
        </table>
      </Bloc>

      <Bloc blocKey="Diversification — répartition par classe d’actifs" className="subsect">
        <div className="donutwrap">
          <Donut
            id="synthdiv"
            donnees={donnees}
            tipKey="total_actif"
            items={CLASSES.map((c) => ({ color: c.color, key: c.key }))}
          />
          <div className="leg">
            {CLASSES.map((c, i) => (
              <LegRow
                key={c.key}
                id={`leg-synthdiv-${i}`}
                color={c.color}
                label={c.leg}
                valKey={c.key}
                pctKey={`${c.key}_pct`}
                donnees={donnees}
              />
            ))}
          </div>
        </div>
      </Bloc>

      <Bloc blocKey="Liquidité — introduction" className="subsect">
        <h3>Liquidité du patrimoine</h3>
        <p>
          La liquidité mesure la capacité du foyer à mobiliser rapidement des fonds en cas de besoin, tout en
          veillant à la cohérence avec ses objectifs patrimoniaux et ses horizons d’investissement. Trois
          niveaux sont distingués :
        </p>
        <ul className="tax">
          <li>
            <b>Actifs hautement liquides</b> — disponibles immédiatement et sans perte de valeur (comptes
            courants, livrets d’épargne réglementés, certains fonds monétaires).
          </li>
          <li>
            <b>Actifs moyennement liquides</b> — mobilisables sous quelques jours à quelques semaines, avec un
            éventuel impact fiscal ou des frais (titres cotés, PEA, assurance-vie).
          </li>
          <li>
            <b>Actifs faiblement liquides</b> — nécessitant un délai plus long ou soumis à des contraintes de
            marché (immobilier, private equity, parts de sociétés non cotées, certains contrats de
            capitalisation).
          </li>
        </ul>
      </Bloc>

      <Bloc blocKey="Liquidité — répartition par niveau" className="subsect">
        <table className="div-tbl">
          <thead>
            <tr>
              <th>Niveau de liquidité</th>
              <th>Monsieur</th>
              <th>Madame</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {NIVEAUX.map((n) => (
              <tr key={n.key}>
                <td>{n.label}</td>
                <td>
                  <MP donnees={donnees} valKey={`${n.key}_m`} pctKey={`${n.key}_m_pct`} />
                </td>
                <td>
                  <MP donnees={donnees} valKey={`${n.key}_mme`} pctKey={`${n.key}_mme_pct`} />
                </td>
                <td>
                  <MP donnees={donnees} valKey={n.key} pctKey={`${n.key}_pct`} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>
                <MP donnees={donnees} valKey="total_actif_m" pctKey="total_actif_m_pct" />
              </td>
              <td>
                <MP donnees={donnees} valKey="total_actif_mme" pctKey="total_actif_mme_pct" />
              </td>
              <td>
                <MP donnees={donnees} valKey="total_actif" pctKey="total_actif_pct" />
              </td>
            </tr>
          </tfoot>
        </table>
      </Bloc>

      <Bloc blocKey="Liquidité — visualisation" className="subsect">
        <div className="donutwrap">
          <Donut
            id="synthliq"
            donnees={donnees}
            tipKey="total_actif"
            items={NIVEAUX.map((n) => ({ color: n.color, key: n.key }))}
          />
          <div className="leg wv">
            {NIVEAUX.map((n, i) => (
              <LegRow
                key={n.key}
                id={`leg-synthliq-${i}`}
                color={n.color}
                label={n.label}
                valKey={n.key}
                pctKey={`${n.key}_pct`}
                donnees={donnees}
              />
            ))}
          </div>
        </div>
      </Bloc>

      <Bloc blocKey="Liquidité — seuil de précaution" className="subsect">
        <div className="keynote">
          <span className="ki">
            <InfoCircle />
          </span>
          <p>
            Il est usuellement recommandé de conserver l’équivalent de <b>3 à 6 mois de charges courantes</b>{" "}
            en liquidités. Le foyer en détient{" "}
            <b>
              <ValeurEditable vKey="liquidites" format="euro" initial={donnees.valeurs["liquidites"] ?? null} />
            </b>
            , soit environ{" "}
            <b>
              <ValeurEditable
                vKey="liquidites_couverture_mois"
                format="number"
                initial={donnees.valeurs["liquidites_couverture_mois"] ?? null}
              />{" "}
              mois
            </b>{" "}
            de charges — une trésorerie à comparer au
            seuil de précaution habituel, dont l’éventuel excédent pourra être partiellement optimisé.
          </p>
        </div>
      </Bloc>

      <Bloc blocKey="Répartition — introduction" className="subsect">
        <h3>Répartition du patrimoine au sein du foyer</h3>
        <p>
          La répartition du patrimoine au sein du foyer repose sur la distinction entre biens propres et biens
          communs, selon le régime matrimonial, l’antériorité des acquisitions et d’éventuelles dispositions
          spécifiques. Elle permet d’apprécier l’équilibre patrimonial entre les conjoints et d’identifier
          d’éventuels déséquilibres susceptibles de fragiliser la sécurité financière en cas de séparation ou
          de décès.
        </p>
      </Bloc>

      <Bloc blocKey="Répartition — par conjoint" className="subsect">
        <div className="donutwrap">
          <Donut
            id="synthrep"
            donnees={donnees}
            tipKey="total_actif"
            items={[
              { color: "#102D50", key: "total_actif_m" },
              { color: "#C68E0E", key: "total_actif_mme" },
            ]}
          />
          <div className="leg nl wv">
            <LegRow
              id="leg-synthrep-0"
              color="#102D50"
              label="Monsieur"
              valKey="total_actif_m"
              pctKey="total_actif_m_pct"
              donnees={donnees}
            />
            <LegRow
              id="leg-synthrep-1"
              color="#C68E0E"
              label="Madame"
              valKey="total_actif_mme"
              pctKey="total_actif_mme_pct"
              donnees={donnees}
            />
          </div>
        </div>
      </Bloc>

      <Bloc blocKey="Répartition — par classe d’actifs" className="subsect">
        <div className="chart-wrap diverge-wrap">
          <div className="chart-title">Répartition par classe d’actifs</div>
          <div className="diverge-head">
            <span data-side="m">
              <i style={{ background: "#102D50" }} /> Monsieur
            </span>
            <span data-side="mme">
              <i style={{ background: "#C68E0E" }} /> Madame
            </span>
          </div>
          <svg viewBox="0 0 600 288" xmlns="http://www.w3.org/2000/svg" fontFamily="Epilogue,sans-serif">
            {divBars.map((d) => (
              <g key={d.key} fontFamily="inherit">
                <g className="m-bar">
                  <rect x={DIV_RIGHT_M - d.leftW} y={d.y} width={d.leftW} height="23" rx="2.5" fill="#102D50" />
                  <text x={DIV_RIGHT_M - d.leftW - 7} y={d.ty} textAnchor="end" fill="#102D50" fontSize="11" fontWeight="600">
                    {eur(donnees, `${d.key}_m`)}
                  </text>
                </g>
                <g className="mme-bar">
                  <rect x={DIV_LEFT_MME} y={d.y} width={d.rightW} height="23" rx="2.5" fill="#C68E0E" />
                  <text x={DIV_LEFT_MME + d.rightW + 7} y={d.ty} textAnchor="start" fill="#A57608" fontSize="11" fontWeight="600">
                    {eur(donnees, `${d.key}_mme`)}
                  </text>
                </g>
                <text x="300.0" y={d.ty} textAnchor="middle" fill="#33414F" fontSize="12">
                  {d.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </Bloc>

      <Bloc blocKey="Répartition — équilibre" className="subsect">
        <div className="keynote">
          <span className="ki">
            <InfoCircle />
          </span>
          <p>
            Sous le régime de la <b>{regimeLabel(donnees)}</b>, la répartition du patrimoine entre les
            conjoints —{" "}
            <b>
              <ValeurEditable vKey="total_actif_m_pct" format="percent" initial={donnees.valeurs["total_actif_m_pct"] ?? null} />
            </b>{" "}
            pour Monsieur,{" "}
            <b>
              <ValeurEditable vKey="total_actif_mme_pct" format="percent" initial={donnees.valeurs["total_actif_mme_pct"] ?? null} />
            </b>{" "}
            pour Madame — sera appréciée pour identifier un éventuel déséquilibre.
          </p>
        </div>
      </Bloc>
        </div>
      </div>
    </div>
  );
}
