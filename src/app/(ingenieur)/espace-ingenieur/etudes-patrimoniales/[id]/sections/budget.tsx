/**
 * Section « Analyse du budget » du document d'audit (maquette lignes 3270-3372).
 *
 * Module à ascenseur (.immo-mod > .page) : synthèse du budget, détail des
 * revenus et des charges, indicateurs clés (taux d'effort, endettement, reste à
 * vivre, capacité d'épargne), ventilation du revenu en anneau, analyses
 * risques/opportunités puis synthèse rédactionnelle du thème. Portage fidèle de
 * la maquette (mêmes sous-titres, mêmes tableaux, mêmes SVG, mêmes classes) pour
 * que le JS global (accordéons .fold/.synthacc, anneau .donut, groupe .grp-dette,
 * panneaux de confiance) s'y raccroche ensuite.
 *
 * Branché sur le RÉEL :
 *  - les agrégats annuels du budget se lisent dans donnees.valeurs
 *    (revenus_annuels_foyer, charges_annuelles), nuls par défaut → « — ».
 * État vide HONNÊTE partout ailleurs : aucun budget chiffré n'existe en base. Les
 * lignes de revenus et de charges, les sous-totaux, les indicateurs, l'anneau de
 * ventilation et les chiffres nominatifs cités dans les textes méthodologiques
 * deviennent des emplacements « — » / « À compléter » (éditables via le volet de
 * révision) plutôt que les exemples de la maquette.
 *
 * Server Component : il ne compose que des éléments statiques et des <Bloc>
 * (composant client) rendus dans l'arbre du BlocProvider.
 */

import "../../../../_styles/sections/budget.css";

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import ValeurEditable from "../ValeurEditable";
import type { ValeurFormat } from "../format-valeur";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

const DASH = "—";
const TODO = "À compléter";

/** Style en ligne des lignes d'en-tête de catégorie (repris de la maquette). */
const CAT_STYLE = {
  background: "var(--light-blue)",
  color: "var(--navy)",
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: ".3px",
  padding: "7px 11px",
} as const;

/** Œil des badges de confiance (CERTIF). */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Badge de confiance d'une analyse (panneau ouvert plus tard par le JS global). */
function CertBadge({ level, label, certif }: { level: string; label: string; certif: string }) {
  return (
    <span className={`cert ${level} eng-only`} data-certif={certif}>
      <span>{label}</span>
      <span className="co">
        <EyeIcon />
      </span>
    </span>
  );
}

/** En-tête de catégorie dans un tableau .et. */
function CatRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={5} style={CAT_STYLE}>
        {children}
      </td>
    </tr>
  );
}

/** Ligne de saisie vide (libellé + quatre colonnes de montants éditables). */
function TodoRow() {
  return (
    <tr>
      <td>
        <div className="cell ed" data-fmt="txt">
          {TODO}
        </div>
      </td>
      {[0, 1, 2, 3].map((i) => (
        <td className="num" key={i}>
          <div className="cell ed" data-fmt="txt" />
        </td>
      ))}
    </tr>
  );
}

/** Sous-total de catégorie (libellé vide, quatre montants « — »). */
function SubtotalRow() {
  return (
    <tr>
      <td />
      {[0, 1, 2, 3].map((i) => (
        <td className="num" key={i}>
          <div className="cell" data-fmt="txt">
            <strong>{DASH}</strong>
          </div>
        </td>
      ))}
    </tr>
  );
}

/** Ligne de total (libellé + quatre montants éditables Monsieur/Madame/Commun/Total). */
function TotalRow({ label, cells }: { label: string; cells: ReactNode[] }) {
  return (
    <tr>
      <td>
        <div className="cell" data-fmt="txt">
          <strong>{label}</strong>
        </div>
      </td>
      {cells.map((c, i) => (
        <td className="num" key={i}>
          <div className="cell" data-fmt="txt">
            <strong>{c}</strong>
          </div>
        </td>
      ))}
    </tr>
  );
}

export default function BudgetSection({ donnees }: { donnees: EtudeDonnees }) {
  /** Montant éditable lu dans donnees.valeurs (persisté via setValeur). */
  const mt = (vKey: string, format: ValeurFormat) => (
    <ValeurEditable vKey={vKey} format={format} initial={donnees.valeurs[vKey] ?? null} />
  );

  return (
    <div className="immo-mod">
      <div className="page">
        <div className="shead">
          <div className="pic">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C68E0E"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
              <circle cx="17" cy="13" r="1.3" fill="#C68E0E" stroke="none" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Audit patrimonial</div>
            <h1>Analyse du budget</h1>
          </div>
        </div>

        <div className="mod-body">
          <Bloc blocKey="Texte d’introduction du budget" className="lead">
            Le budget rapproche l’ensemble des revenus du foyer de ses charges récurrentes afin d’en
            dégager la capacité d’épargne et le reste à vivre. Il mesure l’équilibre entre les flux
            entrants (revenus professionnels, fonciers et mobiliers) et les flux sortants (train de
            vie, impôts, remboursements d’emprunt), et conditionne la capacité du foyer à financer ses
            projets et à développer son patrimoine.
          </Bloc>

          <div className="subttl anchor" id="synth-budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M3 21h18M5 21V8l7-5 7 5v13" />
            </svg>{" "}
            Synthèse du budget
          </div>
          <Bloc blocKey="Synthèse du budget">
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--text)",
                lineHeight: 1.62,
                margin: "2px 0 16px",
                maxWidth: "780px",
              }}
            >
              Le foyer perçoit des revenus annuels de{" "}
              <strong>{mt("revenus_annuels_foyer", "euro")}</strong>, pour des charges de{" "}
              <strong>{mt("charges_annuelles", "euro")}</strong> (hors remboursements d’emprunt) et un
              service de la dette de <strong>{mt("budget_service_dette_annuel", "euro")}</strong>. Il en
              résulte une capacité d’épargne de{" "}
              <strong>{mt("budget_capacite_epargne_an", "euro")}</strong>. La composition des revenus et
              leur répartition entre les membres du foyer restent à préciser dans le détail ci-dessous.
            </p>
          </Bloc>

          <div className="subttl anchor" id="revenus-budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6" />
            </svg>{" "}
            Détail des revenus
          </div>
          <table className="et">
            <colgroup>
              <col style={{ width: "34%" }} />
              <col style={{ width: "16.5%" }} />
              <col style={{ width: "16.5%" }} />
              <col style={{ width: "16.5%" }} />
              <col style={{ width: "16.5%" }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2}>Désignation</th>
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
              <CatRow>Revenus professionnels</CatRow>
              <TodoRow />
              <SubtotalRow />
              <CatRow>Revenus d’investissement (nom propre)</CatRow>
              <TodoRow />
              <SubtotalRow />
              <CatRow>Revenus des SCI (à l’impôt sur le revenu, quote-part)</CatRow>
              <TodoRow />
              <SubtotalRow />
            </tbody>
            <tfoot>
              <TotalRow
                label="Total des revenus"
                cells={[
                  mt("budget_revenus_total_monsieur", "euro"),
                  mt("budget_revenus_total_madame", "euro"),
                  mt("budget_revenus_total_commun", "euro"),
                  mt("revenus_annuels_foyer", "euro"),
                ]}
              />
            </tfoot>
          </table>
          <div className="note" style={{ marginTop: "9px" }}>
            Les loyers des SCI sont intégrés à la quote-part de détention (50 % par associé), les
            sociétés étant à l’impôt sur le revenu. À l’impôt sur les sociétés, ces revenus ne
            seraient pas remontés au foyer.
          </div>

          <div className="subttl anchor" id="charges-budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 5h16M4 12h16M4 19h16" />
            </svg>{" "}
            Détail des charges
          </div>
          <table className="et">
            <colgroup>
              <col style={{ width: "34%" }} />
              <col style={{ width: "16.5%" }} />
              <col style={{ width: "16.5%" }} />
              <col style={{ width: "16.5%" }} />
              <col style={{ width: "16.5%" }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2}>Désignation</th>
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
              <CatRow>Dépenses d’usage</CatRow>
              <TodoRow />
              <SubtotalRow />
              <CatRow>Impôts et taxes</CatRow>
              <TodoRow />
              <SubtotalRow />
              <tr className="grp-dette" style={{ cursor: "pointer" }}>
                <td colSpan={5} style={CAT_STYLE}>
                  Service de la dette (rappel)
                  <svg
                    className="dette-chev"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    style={{ width: "13px", height: "13px", float: "right", marginTop: "1px" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </td>
              </tr>
              <tr className="dette-row" style={{ display: "none" }}>
                <td>
                  <div className="cell ed" data-fmt="txt" style={{ paddingLeft: "22px" }}>
                    {TODO}
                  </div>
                </td>
                {[0, 1, 2, 3].map((i) => (
                  <td className="num" key={i}>
                    <div className="cell ed" data-fmt="txt" />
                  </td>
                ))}
              </tr>
              <tr>
                <td>
                  <div className="cell" data-fmt="txt">
                    <strong>Service de la dette</strong>
                  </div>
                </td>
                {[
                  mt("budget_service_dette_monsieur", "euro"),
                  mt("budget_service_dette_madame", "euro"),
                  mt("budget_service_dette_commun", "euro"),
                  mt("budget_service_dette_annuel", "euro"),
                ].map((c, i) => (
                  <td className="num" key={i}>
                    <div className="cell" data-fmt="txt">
                      <strong>{c}</strong>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              {/* charges_annuelles s'entend hors service de la dette (cf. synthèse) ;
                  ce total « charges + remboursements » a donc sa propre clé éditable. */}
              <TotalRow
                label="Total des charges et remboursements"
                cells={[
                  mt("budget_charges_remb_monsieur", "euro"),
                  mt("budget_charges_remb_madame", "euro"),
                  mt("budget_charges_remb_commun", "euro"),
                  mt("budget_charges_remboursements_total", "euro"),
                ]}
              />
            </tfoot>
          </table>
          <div className="note" style={{ marginTop: "9px" }}>
            Le service de la dette est rappelé ci-dessus, réparti par détenteur ; son détail prêt par
            prêt figure dans l’analyse du passif. L’impôt sur le revenu constitue généralement le
            premier poste de charges du foyer.
          </div>

          <div className="subttl anchor" id="indic-budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M3 12a9 9 0 0 1 18 0" />
              <path d="M12 12l5-3" />
              <circle cx="12" cy="12" r="1.4" fill="#102D50" />
            </svg>{" "}
            Indicateurs clés
          </div>
          <div className="kpirow">
            <div className="kpi">
              <div className="kv">{mt("budget_taux_effort", "percent")}</div>
              <div className="kl">
                Taux d’effort
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Taux d’effort</span>
                    <span className="ktd">
                      Part des revenus nets annuels (avant impôt) absorbée par les charges d’emprunt,
                      hors sociétés à l’impôt sur les sociétés.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Formule</span>
                      Taux d’effort = (charges annuelles d’emprunt ÷ revenus nets annuels) × 100
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="kpi">
              <div className="kv">{mt("budget_taux_endettement", "percent")}</div>
              <div className="kl">
                Taux d’endettement
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Taux d’endettement</span>
                    <span className="ktd">
                      Ensemble des charges contraintes rapporté à l’ensemble des revenus : charges
                      d’emprunt, impôts et taxes, et charges exceptionnelles (pensions alimentaires,
                      prestations compensatoires, dettes familiales) le cas échéant.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Calcul</span>
                      (charges d’emprunt + impôts et taxes) ÷ revenus × 100
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="kpi">
              <div className="kv">{mt("budget_reste_a_vivre_mois", "euro")}</div>
              <div className="kl">
                Reste à vivre / mois
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Reste à vivre</span>
                    <span className="ktd">
                      Revenus disponibles chaque mois une fois honorés les remboursements d’emprunt et
                      les impôts ; ils financent le train de vie et l’épargne.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Calcul</span>
                      (revenus − charges d’emprunt − impôts et taxes) ÷ 12
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="kpi">
              <div className="kv">{mt("budget_capacite_epargne_an", "euro")}</div>
              <div className="kl">
                Capacité d’épargne / an
                <span className="kinfo">
                  i
                  <span className="ktip">
                    <span className="ktt">Capacité d’épargne</span>
                    <span className="ktd">
                      Montant que le foyer peut épargner chaque année, une fois honorés les impôts et
                      taxes, les charges d’emprunt et le train de vie.
                    </span>
                    <span className="ktc">
                      <span className="ktcl">Calcul</span>
                      revenus − impôts et taxes − charges d’emprunt − dépenses d’usage
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              background: "var(--ivory)",
              border: "1px solid var(--navy-100)",
              borderLeft: "3px solid var(--gold)",
              borderRadius: "0 9px 9px 0",
              padding: "11px 14px",
              margin: "11px 0 0",
              fontSize: "11.5px",
              color: "var(--navy-300)",
              lineHeight: 1.6,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gold-deep)"
              strokeWidth={2}
              style={{ width: "15px", height: "15px", flex: "0 0 auto", marginTop: "1px" }}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 9v4M12 16h.01" />
            </svg>
            <span>
              <strong style={{ color: "var(--navy)" }}>Aucune décote n’est appliquée ici.</strong> En
              pratique, selon le mode d’exploitation du bien (location nue, meublée, courte ou longue
              durée) et l’antériorité de la location, les établissements bancaires retiennent
              fréquemment une décote de 30 à 100 % sur les revenus fonciers, ce qui peut sensiblement
              relever le taux d’effort retenu pour l’octroi d’un crédit.
            </span>
          </div>

          <div className="subttl anchor" id="vent-budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 3v9l6 4" />
              <circle cx="12" cy="12" r="9" />
            </svg>{" "}
            Ventilation du revenu<span className="rep-tot">{DASH}</span>
          </div>
          <div className="charts">
            <div className="chartc">
              <div className="chart-head">
                <h3>Allocation du revenu annuel</h3>
              </div>
              <div className="donutwrap">
                <div className="donutbox" id="box-budgalloc">
                  <svg className="donut" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth={16} />
                    <g transform="rotate(-90 70 70)" fill="none" strokeWidth={16}>
                      <circle
                        className="seg"
                        id="seg-budgalloc-0"
                        cx="70"
                        cy="70"
                        r="54"
                        stroke="#102D50"
                        strokeDasharray="0 339.29"
                        strokeDashoffset="0"
                      />
                      <circle
                        className="seg"
                        id="seg-budgalloc-1"
                        cx="70"
                        cy="70"
                        r="54"
                        stroke="#C68E0E"
                        strokeDasharray="0 339.29"
                        strokeDashoffset="0"
                      />
                      <circle
                        className="seg"
                        id="seg-budgalloc-2"
                        cx="70"
                        cy="70"
                        r="54"
                        stroke="#708196"
                        strokeDasharray="0 339.29"
                        strokeDashoffset="0"
                      />
                      <circle
                        className="seg"
                        id="seg-budgalloc-3"
                        cx="70"
                        cy="70"
                        r="54"
                        stroke="#DDBB6E"
                        strokeDasharray="0 339.29"
                        strokeDashoffset="0"
                      />
                    </g>
                  </svg>
                  <div className="donut-tip" id="tip-budgalloc">
                    <div className="dt-v">{DASH}</div>
                  </div>
                </div>
                <div className="leg">
                  <div className="lr" id="leg-budgalloc-0">
                    <span className="sw" style={{ background: "#102D50" }} />
                    <span className="ll">Dépenses d’usage</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-budgalloc-1">
                    <span className="sw" style={{ background: "#C68E0E" }} />
                    <span className="ll">Impôts et taxes</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-budgalloc-2">
                    <span className="sw" style={{ background: "#708196" }} />
                    <span className="ll">Service de la dette</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-budgalloc-3">
                    <span className="sw" style={{ background: "#DDBB6E" }} />
                    <span className="ll">Capacité d’épargne</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="keynote">
            <span className="ki">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 7.5h.01" />
              </svg>
            </span>
            <p>
              Le foyer dégage une{" "}
              <strong>capacité d’épargne de {mt("budget_capacite_epargne_an", "euro")} par an</strong>{" "}
              (environ {mt("budget_capacite_epargne_mois", "euro")} par mois), soit{" "}
              <strong>{mt("budget_capacite_epargne_pct_revenus", "percent")}</strong> de ses revenus. Le
              taux d’effort, une fois les montants saisis, conditionnera la{" "}
              <strong>capacité d’endettement</strong> disponible pour financer de nouveaux projets.
            </p>
          </div>

          <div className="subttl anchor" id="risk-budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>{" "}
            Risques &amp; opportunités
          </div>

          <Bloc blocKey="Capacité d’épargne à mobiliser" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <path
                    d="M7 14l3-3 2 2 4-5"
                    stroke="#FAF8F3"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="tt">Une capacité d’épargne élevée, à structurer et à investir</span>
              <CertBadge level="c-moy" label="Confiance modérée · 82 %" certif="budgep" />
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
                    Le foyer dégage{" "}
                    <strong>{mt("budget_capacite_epargne_an", "euro")} d’épargne par an</strong>{" "}
                    (environ {mt("budget_capacite_epargne_mois", "euro")} par mois), soit{" "}
                    <strong>{mt("budget_capacite_epargne_pct_revenus", "percent")}</strong> de ses
                    revenus.
                  </li>
                  <li>
                    Laissé sur des comptes peu rémunérés, cet excédent ne contribue pas à la
                    constitution du patrimoine.
                  </li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r">
                    <span className="lab">Risque</span>
                    Une épargne non investie subit l’érosion de l’inflation et représente un coût
                    d’opportunité significatif sur la durée.
                  </div>
                  <div className="it o">
                    <span className="lab">Opportunité</span>
                    Orienter cet excédent vers des supports adaptés (assurance-vie, immobilier,
                    placements financiers) enclenche un effet de capitalisation.
                  </div>
                  <div className="it opt">
                    <span className="lab">Optimisation</span>
                    Mettre en place des versements programmés et une allocation cible cohérente avec
                    l’horizon et le profil de risque.
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
                  Réorientés vers des supports rémunérés, ces{" "}
                  <strong>{mt("budget_capacite_epargne_an", "euro")} annuels</strong> représentent,
                  capitalisés, un levier patrimonial majeur sur 10 à 20 ans.
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
                <p>Soldes des comptes et flux d’épargne issus du budget du foyer.</p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span>
                <b>Préconisation :</b> définir une stratégie d’investissement de l’excédent d’épargne
                (détaillée dans la partie « Préconisations »).
              </span>
            </div>
          </Bloc>

          <Bloc blocKey="Dépendance aux revenus libéraux" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <path
                    d="M12 8v4.5M12 16h.01"
                    stroke="#FAF8F3"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="tt">Des revenus concentrés sur l’activité libérale</span>
              <CertBadge level="c-forte" label="Confiance forte · 88 %" certif="budgconc" />
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
                    Les activités libérales représentent{" "}
                    <strong>{mt("budget_revenus_liberaux_montant", "euro")}</strong> de revenus, soit
                    une part majoritaire du total.
                  </li>
                  <li>
                    Les charges courantes, les impôts et le service de la dette demeurent dus
                    indépendamment de l’activité.
                  </li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r">
                    <span className="lab">Risque</span>
                    En cas d’arrêt d’activité (maladie, accident), la chute des revenus professionnels
                    exposerait le foyer à un déséquilibre budgétaire rapide.
                  </div>
                  <div className="it o">
                    <span className="lab">Opportunité</span>
                    Une prévoyance bien calibrée (indemnités journalières, garantie maintien de
                    revenu) sécurise le budget en cas de coup dur.
                  </div>
                  <div className="it opt">
                    <span className="lab">Optimisation</span>
                    Renforcer progressivement la part des revenus passifs (fonciers, financiers) pour
                    diversifier les sources.
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
                  Un revenu de remplacement adapté couvrirait les{" "}
                  <strong>{mt("charges_annuelles", "euro")} de charges</strong> et{" "}
                  <strong>{mt("budget_service_dette_annuel", "euro")}</strong> de service de la dette
                  annuels en cas d’incapacité.
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
                <p>Structure des revenus issue des avis d’imposition et des comptes de résultat.</p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span>
                <b>Préconisation :</b> auditer la couverture prévoyance des deux praticiens (renvoi à
                la partie « Analyse des assurances »).
              </span>
            </div>
          </Bloc>

          <Bloc blocKey="Marge d’endettement disponible" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <path
                    d="M8 12h7M12 8.5l3.5 3.5L12 15.5"
                    stroke="#FAF8F3"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="tt">
                Une marge d’endettement préservée, mobilisable en effet de levier
              </span>
              <CertBadge level="c-moy" label="Confiance modérée · 84 %" certif="budglev" />
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
                    Le taux d’effort, à comparer aux seuils d’octroi usuels (de l’ordre de 35 %),
                    s’établit à <strong>{mt("budget_taux_effort", "percent")}</strong>.
                  </li>
                  <li>Le foyer conserve donc une capacité d’endettement à apprécier.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r">
                    <span className="lab">Risque</span>
                    Une marge inutilisée est un levier patrimonial dormant : l’épargne seule
                    capitalise plus lentement que l’effet de levier du crédit.
                  </div>
                  <div className="it o">
                    <span className="lab">Opportunité</span>
                    Cette marge autorise un financement complémentaire pour acquérir un actif
                    (immobilier de rapport, parts de société), en mobilisant l’effet de levier.
                  </div>
                  <div className="it opt">
                    <span className="lab">Optimisation</span>
                    Calibrer un nouveau financement en cohérence avec la capacité d’épargne et la
                    fiscalité du foyer.
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
                  À l’approche du seuil d’usage (35 %), la capacité d’emprunt résiduelle, déployable
                  sans déséquilibrer le budget, sera chiffrée une fois les montants saisis.
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
                <p>Taux d’effort calculé sur les revenus et les charges d’emprunt du foyer.</p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span>
                <b>Préconisation :</b> étudier un investissement à effet de levier adossé à la capacité
                résiduelle (chiffré dans la partie « Préconisations »).
              </span>
            </div>
          </Bloc>

          {/* SYNTHÈSE DU THÈME */}
          <div className="synthacc">
            <div className="subttl anchor synth-h" id="synthese-theme-budget">
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
                Analyse du budget — lecture stratégique
              </div>
              <div className="synth-cert sc-green eng-only" data-certif="budgetth">
                <span className="sc-ico">
                  <EyeIcon />
                </span>
                <span>
                  <b>Confiance forte · 90 %</b> · synthèse fondée sur les constats du thème
                </span>
                <span className="sc-link">Voir le détail</span>
              </div>
              <p>
                Le budget du foyer est <b>structurellement excédentaire</b> dès lors que les revenus (
                {mt("revenus_annuels_foyer", "euro")}) couvrent les charges (
                {mt("charges_annuelles", "euro")}) et le service de la dette (
                {mt("budget_service_dette_annuel", "euro")}), libérant une épargne annuelle (
                {mt("budget_capacite_epargne_an", "euro")}, soit{" "}
                {mt("budget_capacite_epargne_pct_revenus", "percent")} des revenus). Le taux d’effort (
                {mt("budget_taux_effort", "percent")}), apprécié au regard des seuils d’octroi usuels,
                indiquera la capacité d’endettement supplémentaire dont dispose le foyer.
              </p>
              <p>
                Les revenus reposent pour une part majeure ({mt("budget_revenus_pro_pct", "percent")})
                sur les activités professionnelles : cette concentration appelle une attention
                particulière sur la prévoyance et sur la diversification progressive des revenus
                passifs, fonciers et financiers. Le patrimoine d’investissement et les éventuelles SCI
                fournissent un socle de revenus complémentaires appelé à monter en puissance.
              </p>
              <p>
                Le <b>taux d’endettement élargi</b>, qui intègre les impôts et taxes (
                {mt("budget_impots_taxes", "euro")}), s’établit à{" "}
                <b>{mt("budget_taux_endettement", "percent")}</b> : selon le niveau d’impôt sur le
                revenu ({mt("budget_impot_revenu", "euro")}), il indiquera si le principal levier
                d’allègement du budget est d’ordre fiscal, à instruire dans le volet dédié. Après
                remboursements et impôts, le <b>reste à vivre mensuel</b> (
                {mt("budget_reste_a_vivre_mois", "euro")}) financera le train de vie et alimentera
                l’épargne.
              </p>
              <div className="sp-recap">
                <div className="spr spr-r">
                  <div className="spr-h">Principaux risques</div>
                  <ul>
                    <li>
                      Concentration des revenus sur l’activité professionnelle, sensible à un arrêt
                      d’activité.
                    </li>
                    <li>Taux d’endettement élargi tiré par l’impôt sur le revenu, à quantifier.</li>
                    <li>
                      Couverture prévoyance à confirmer pour sécuriser le budget en cas d’incapacité.
                    </li>
                  </ul>
                </div>
                <div className="spr spr-o">
                  <div className="spr-h">Principales opportunités</div>
                  <ul>
                    <li>
                      Capacité d’épargne annuelle à investir sur des supports rémunérés (montant à
                      compléter).
                    </li>
                    <li>Marge d’endettement à apprécier, mobilisable en effet de levier.</li>
                    <li>Montée en puissance des revenus passifs (fonciers, financiers, SCI).</li>
                  </ul>
                </div>
                <div className="spr spr-opt">
                  <div className="spr-h">Principales optimisations</div>
                  <ul>
                    <li>Optimisation de l’impôt sur le revenu, généralement premier poste de charges.</li>
                    <li>Versements programmés et allocation cible de l’excédent d’épargne.</li>
                    <li>Renforcement et mise en concurrence de la couverture prévoyance.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ANNEXE CLIENT */}
          <div className="appendix client-only">
            <h2>Sources &amp; méthode</h2>
            <div className="appref">
              <span className="n">¹</span>
              <span>
                <b>Revenus du foyer.</b> Avis d’imposition et comptes de résultat des activités
                libérales ; déclarations de revenus fonciers et de location meublée ; résultats des
                SCI à l’impôt sur le revenu réintégrés à la quote-part de détention.
              </span>
            </div>
            <div className="appref">
              <span className="n">²</span>
              <span>
                <b>Charges du foyer.</b> Relevés de charges courantes, avis de taxe foncière et
                d’impôt sur le revenu.
              </span>
            </div>
            <div className="appref">
              <span className="n">³</span>
              <span>
                <b>Taux d’effort.</b> Charges annuelles d’emprunt (capital, intérêts, assurance), hors
                sociétés à l’impôt sur les sociétés, rapportées aux revenus nets avant impôt. Méthode
                et seuils à valider depuis la base documentaire ASTRAEOS.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
