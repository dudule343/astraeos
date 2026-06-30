/**
 * Sous-section « Analyse du patrimoine — Patrimoine financier » du document
 * d'audit (maquette « Etude_Patrimoniale_Partie Audit », module .fin-mod,
 * lignes 2264-2696). Module financier symétrique à l'immobilier : synthèse &
 * rendement, répartition & liquidité (donuts), détail par enveloppe (liquidités,
 * assurance-vie, PEA, CTO, épargne salariale, métaux précieux, autres actifs),
 * indicateurs clés, analyse Risques · Opportunités · Optimisations, coût
 * d'opportunité et synthèse du thème.
 *
 * Portage fidèle de la maquette (mêmes sous-rubriques, mêmes libellés, même
 * disposition, mêmes SVG, mêmes classes). Module compatible Server Component :
 * il ne compose que des éléments <Bloc> (composant client) et du markup statique
 * rendus dans l'arbre du BlocProvider. Les comportements JS (accordéons, donuts,
 * scénarios du coût d'opportunité) sont câblés globalement par le main loop ;
 * ce composant fournit le markup avec les classes/ids exacts pour s'y raccorder.
 *
 * Branchement au RÉEL :
 *  - les contrats d'assurance-vie placés au cabinet viennent de donnees.produits
 *    (catégories av_multisupport / av_lux) ; les colonnes absentes en base
 *    (valeur d'étude, frais, gains, rendement) restent « — » éditables ;
 *  - les KPI d'encours (assurance-vie, liquidités, total financier, capacité
 *    d'épargne, excédent) sont lus dans donnees.valeurs[<clé>], null par défaut ;
 *  - tous les autres MONTANTS du patrimoine (soldes compte par compte,
 *    répartitions, rendements, indicateurs, projections du coût d'opportunité)
 *    n'existent pas en base : affichés « — » / « À compléter », jamais recopiés
 *    depuis les chiffres-exemple de la maquette. Les scores de confiance des
 *    panneaux CERTIF, non calculés en base, sont rendus « à évaluer ».
 */

import {
  PRODUIT_CATEGORY_LABELS,
  type ProduitCategory,
} from "../../../../_data/assets-pure";
import type { EtudeDonnees, EtudeProduit } from "../../../../_data/etudes-patrimoniales";

import { Bloc } from "../Bloc";
import ValeurEditable from "../ValeurEditable";
import { donutSegments } from "../chart-geom";
import "../../../../_styles/sections/patrimoine-financier.css";

const DASH = "—";

// ---------------------------------------------------------------------------
// Lecture honnête des montants (donnees.valeurs) — « — » tant qu'absent
// ---------------------------------------------------------------------------

function eurNum(n: number | null): string {
  if (n == null) return DASH;
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;
}

/**
 * Montant brut depuis donnees.valeurs → nombre exploitable par la géométrie des
 * graphiques (ou null si non saisi). Tolère les valeurs stockées en chaîne.
 */
function montant(v: string | number | null | undefined): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.,-]/g, "").replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Date ISO « yyyy-mm-dd » → « mm/yyyy » (souscription), « — » si absente. */
function moisAnnee(iso: string | null): string {
  if (!iso) return DASH;
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return DASH;
  return `${m[2]}/${m[1]}`;
}

const AV_CATEGORIES = new Set<ProduitCategory>(["av_multisupport", "av_lux"]);

function isAvProduit(p: EtudeProduit): boolean {
  return AV_CATEGORIES.has(p.categorie as ProduitCategory);
}

/** Libellé du contrat d'assurance-vie (nom réel, sinon catégorie libellée). */
function avContratLabel(p: EtudeProduit): string {
  const nom = (p.nom ?? "").trim();
  if (nom) return nom;
  return PRODUIT_CATEGORY_LABELS[p.categorie as ProduitCategory] ?? "Contrat d'assurance-vie";
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function PatrimoineFinancier({ donnees }: { donnees: EtudeDonnees }) {
  const avProduits = donnees.produits.filter(isAvProduit);
  const avSub =
    avProduits.length > 0
      ? `${avProduits.length} contrat${avProduits.length > 1 ? "s" : ""} placé${
          avProduits.length > 1 ? "s" : ""
        } au cabinet`
      : "Aucun contrat collecté · à compléter";

  // Géométrie des donuts dérivée des montants saisis (donnees.valeurs). Tant
  // qu'aucun montant n'est saisi, donutSegments renvoie des segments plats
  // (dasharray "0 C") : seul l'anneau gris neutre reste visible — état vide honnête.
  const finTit = donutSegments([
    montant(donnees.valeurs["fin_repartition_titulaire_monsieur"]),
    montant(donnees.valeurs["fin_repartition_titulaire_madame"]),
    montant(donnees.valeurs["fin_repartition_titulaire_commun"]),
    montant(donnees.valeurs["fin_repartition_titulaire_enfants"]),
  ]);
  const finLiq = donutSegments([
    montant(donnees.valeurs["fin_liquidite_haute"]),
    montant(donnees.valeurs["fin_liquidite_moyenne"]),
    montant(donnees.valeurs["fin_liquidite_faible"]),
  ]);

  return (
    <div className="fin-mod">
      <div className="page modfold">
        <div className="shead">
          <div className="pic">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l5-5 3 3 7-7" />
              <path d="M14 8h4v4" />
              <path d="M3 21h18" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Analyse du patrimoine</div>
            <h1>Patrimoine financier</h1>
          </div>
          <span className="cert c-forte eng-only">
            <span>Confiance · à évaluer</span>
            <span className="co">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
          </span>
          <span className="modchev eng-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>

        <div className="mod-body">
          <Bloc blocKey="Patrimoine financier · introduction du thème" className="lead">
            Le patrimoine financier constitue un levier clé dans la construction et l&apos;optimisation
            du patrimoine — liquidité, diversification et adaptation de la stratégie au contexte de
            marché et aux objectifs du foyer.
          </Bloc>

          {/* SYNTHÈSE & RENDEMENT */}
          <div className="subttl anchor" id="synthese">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>{" "}
            Synthèse du patrimoine financier
          </div>
          <div className="kpirow">
            <div className="kpi">
              <div className="kv" id="kpi-av">
                <ValeurEditable vKey="assurance_vie" format="euro" initial={donnees.valeurs["assurance_vie"] ?? null} label="Assurance-vie & capitalisation" />
              </div>
              <div className="kl">Assurance-vie &amp; capitalisation</div>
            </div>
            <div className="kpi">
              <div className="kv" id="kpi-liq">
                <ValeurEditable vKey="liquidites" format="euro" initial={donnees.valeurs["liquidites"] ?? null} label="Liquidités et comptes réglementés" />
              </div>
              <div className="kl">Liquidités et comptes réglementés</div>
            </div>
            <div className="kpi">
              <div className="kv" id="kpi-tot-f">
                <ValeurEditable vKey="actifs_financiers" format="euro" initial={donnees.valeurs["actifs_financiers"] ?? null} label="Patrimoine financier total" />
              </div>
              <div className="kl">Patrimoine financier total</div>
            </div>
            <div className="kpi">
              <div className="kv">
                <ValeurEditable vKey="fin_part_patrimoine_global" format="percent" initial={donnees.valeurs["fin_part_patrimoine_global"] ?? null} label="Part du patrimoine global" />
              </div>
              <div className="kl">du patrimoine global</div>
            </div>
          </div>
          <div className="subttl">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 19V5M4 15l5-4 4 3 7-7" />
            </svg>{" "}
            Rendement net pondéré{" "}
            <span style={{ fontSize: 11, color: "var(--navy-300)", fontWeight: 400 }}>
              — consolidé &amp; détaillé
            </span>
          </div>
          <div className="rpgrid">
            <div className="rpc">
              <div className="rl">Assurance-vie &amp; capitalisation</div>
              <div className="rv" id="rp-av">
                <ValeurEditable vKey="fin_rendement_av" format="percent" initial={donnees.valeurs["fin_rendement_av"] ?? null} label="Rendement assurance-vie" />
              </div>
              <div className="rs">net de frais de gestion</div>
            </div>
            <div className="rpc">
              <div className="rl">Liquidités et comptes réglementés</div>
              <div className="rv" id="rp-liq">
                <ValeurEditable vKey="fin_rendement_liquidites" format="percent" initial={donnees.valeurs["fin_rendement_liquidites"] ?? null} label="Rendement des liquidités" />
              </div>
              <div className="rs">livrets + comptes</div>
            </div>
            <div className="rpc glob">
              <div className="rl">Patrimoine financier global</div>
              <div className="rv" id="rp-glob">
                <ValeurEditable vKey="fin_rendement_global" format="percent" initial={donnees.valeurs["fin_rendement_global"] ?? null} label="Rendement financier global" />
              </div>
              <div className="rs" id="rp-real">réel vs inflation</div>
            </div>
          </div>

          {/* RÉPARTITION & LIQUIDITÉ (camemberts) */}
          <div className="subttl anchor" id="repartition">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 3v9l6 4" />
              <circle cx="12" cy="12" r="9" />
            </svg>{" "}
            Répartition &amp; liquidité
          </div>
          <div className="charts">
            <div className="chartc">
              <div className="ct">Répartition du patrimoine financier par titulaire</div>
              <div className="donutwrap">
                <div className="donutbox" id="box-fintit">
                  <svg className="donut" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth="17" />
                    <g transform="rotate(-90 70 70)" fill="none" strokeWidth="17">
                      <circle className="seg" id="seg-fintit-0" cx="70" cy="70" r="54" stroke="#102D50" strokeDasharray={finTit.segments[0].dasharray} strokeDashoffset={finTit.segments[0].dashoffset} />
                      <circle className="seg" id="seg-fintit-1" cx="70" cy="70" r="54" stroke="#C68E0E" strokeDasharray={finTit.segments[1].dasharray} strokeDashoffset={finTit.segments[1].dashoffset} />
                      <circle className="seg" id="seg-fintit-2" cx="70" cy="70" r="54" stroke="#708196" strokeDasharray={finTit.segments[2].dasharray} strokeDashoffset={finTit.segments[2].dashoffset} />
                      <circle className="seg" id="seg-fintit-3" cx="70" cy="70" r="54" stroke="#DDBB6E" strokeDasharray={finTit.segments[3].dasharray} strokeDashoffset={finTit.segments[3].dashoffset} />
                    </g>
                  </svg>
                  <div className="donut-tip" id="tip-fintit">
                    <div className="dt-v">{DASH}</div>
                  </div>
                </div>
                <div className="leg wv">
                  <div className="lr" id="leg-fintit-0">
                    <span className="sw" style={{ background: "#102D50" }} />
                    <span className="ll">Monsieur</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-fintit-1">
                    <span className="sw" style={{ background: "#C68E0E" }} />
                    <span className="ll">Madame</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-fintit-2">
                    <span className="sw" style={{ background: "#708196" }} />
                    <span className="ll">Commun</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-fintit-3">
                    <span className="sw" style={{ background: "#DDBB6E" }} />
                    <span className="ll">Enfants</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chartc">
              <div className="ct">Répartition par degré de liquidité</div>
              <div className="donutwrap">
                <div className="donutbox" id="box-finliq">
                  <svg className="donut" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth="17" />
                    <g transform="rotate(-90 70 70)" fill="none" strokeWidth="17">
                      <circle className="seg" id="seg-finliq-0" cx="70" cy="70" r="54" stroke="#C68E0E" strokeDasharray={finLiq.segments[0].dasharray} strokeDashoffset={finLiq.segments[0].dashoffset} />
                      <circle className="seg" id="seg-finliq-1" cx="70" cy="70" r="54" stroke="#708196" strokeDasharray={finLiq.segments[1].dasharray} strokeDashoffset={finLiq.segments[1].dashoffset} />
                      <circle className="seg" id="seg-finliq-2" cx="70" cy="70" r="54" stroke="#102D50" strokeDasharray={finLiq.segments[2].dasharray} strokeDashoffset={finLiq.segments[2].dashoffset} />
                    </g>
                  </svg>
                  <div className="donut-tip" id="tip-finliq">
                    <div className="dt-v">{DASH}</div>
                  </div>
                </div>
                <div className="leg wv">
                  <div className="lr" id="leg-finliq-0">
                    <span className="sw" style={{ background: "#C68E0E" }} />
                    <span className="ll">Hautement liquide</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-finliq-1">
                    <span className="sw" style={{ background: "#708196" }} />
                    <span className="ll">Moyennement liquide</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                  <div className="lr" id="leg-finliq-2">
                    <span className="sw" style={{ background: "#102D50" }} />
                    <span className="ll">Faiblement liquide</span>
                    <span className="lv">{DASH}</span>
                    <span className="lp">{DASH}</span>
                  </div>
                </div>
              </div>
              <div className="donut-note">
                Liquidités = immédiat · assurance-vie, PEA, or = moyen · épargne salariale, private
                equity = faible.
              </div>
            </div>
          </div>

          {/* DÉTAIL DES ENVELOPPES */}
          <div className="subttl anchor" id="contrats">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>{" "}
            Détail par enveloppe — donnée collectée, modifiable
          </div>

          {/* 1. LIQUIDITÉS ET COMPTES RÉGLEMENTÉS */}
          <div className="acc" id="acc-liq">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 10h18" />
                  <circle cx="16" cy="14.5" r="1.4" />
                </svg>
              </div>
              <div className="nm">
                Liquidités et comptes réglementés
                <span className="sub">
                  comptes courants, livrets réglementés et non réglementés — détail compte par compte
                </span>
              </div>
              <div className="amt">
                <span id="amt-liq">
                  <ValeurEditable vKey="liquidites" format="euro" initial={donnees.valeurs["liquidites"] ?? null} label="Total liquidités et comptes réglementés" />
                </span>
              </div>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="acc-b">
              <div className="acc-in">
                <table className="et" id="tbl-liq">
                  <colgroup>
                    <col style={{ width: "34%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Support</th>
                      <th>Titulaire</th>
                      <th className="num">Solde</th>
                      <th className="num">Taux net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur" data-col="m">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="pct" data-col="rate">{DASH}</div></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><div className="cell">Total liquidités</div></td>
                      <td><div className="cell">{DASH}</div></td>
                      <td className="num"><div className="cell" id="liq-f-total">{DASH}</div></td>
                      <td className="num"><div className="cell" id="liq-f-rate">{DASH}</div></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="callout" style={{ marginTop: 10 }}>
                  <strong>À part :</strong> les comptes professionnels éventuels sont rattachés à
                  l&apos;activité professionnelle et analysés dans la section « Sociétés ».
                </div>
              </div>
            </div>
          </div>

          {/* 2. ASSURANCE-VIE & CAPITALISATION */}
          <div className="acc" id="acc-av">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M12 3l8 4v5c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V7z" />
                </svg>
              </div>
              <div className="nm">
                Contrats d&apos;assurance-vie et de capitalisation
                <span className="sub">{avSub}</span>
              </div>
              <div className="amt">
                <span id="amt-av">
                  <ValeurEditable vKey="assurance_vie" format="euro" initial={donnees.valeurs["assurance_vie"] ?? null} label="Total contrats d'assurance-vie et de capitalisation" />
                </span>
              </div>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="acc-b">
              <div className="acc-in">
                <table className="et" id="tbl-av">
                  <colgroup>
                    <col style={{ width: "23%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "10%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Contrat</th>
                      <th>Souscription</th>
                      <th className="num">Versements bruts</th>
                      <th className="num">Valeur (étude)</th>
                      <th className="num">Frais d&apos;entrée</th>
                      <th className="num">Frais de gestion</th>
                      <th className="num">Gains</th>
                      <th className="num">Rendement net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avProduits.length > 0 ? (
                      avProduits.map((p, i) => (
                        <tr key={p.souscriptionId ?? i} data-name={avContratLabel(p)}>
                          <td><div className="cell ed" data-fmt="txt">{avContratLabel(p)}</div></td>
                          <td><div className="cell ed" data-fmt="txt">{moisAnnee(p.dateSouscription)}</div></td>
                          <td className="num"><div className="cell ed" data-fmt="eur" data-col="vers">{eurNum(p.montantInitial)}</div></td>
                          <td className="num"><div className="cell ed" data-fmt="eur" data-col="val">{DASH}</div></td>
                          <td className="num"><div className="cell ed" data-fmt="pct" data-col="fin">{DASH}</div></td>
                          <td className="num"><div className="cell ed" data-fmt="pct" data-col="fee">{DASH}</div></td>
                          <td className="num"><div className="cell ed" data-fmt="eur" data-col="gain">{DASH}</div></td>
                          <td className="num"><div className="cell ed" data-fmt="pct" data-col="rdt">{DASH}</div></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                        <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                        <td className="num"><div className="cell ed" data-fmt="eur" data-col="vers">{DASH}</div></td>
                        <td className="num"><div className="cell ed" data-fmt="eur" data-col="val">{DASH}</div></td>
                        <td className="num"><div className="cell ed" data-fmt="pct" data-col="fin">{DASH}</div></td>
                        <td className="num"><div className="cell ed" data-fmt="pct" data-col="fee">{DASH}</div></td>
                        <td className="num"><div className="cell ed" data-fmt="eur" data-col="gain">{DASH}</div></td>
                        <td className="num"><div className="cell ed" data-fmt="pct" data-col="rdt">{DASH}</div></td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}><div className="cell">Consolidé</div></td>
                      <td className="num"><div className="cell" id="av-f-vers">{DASH}</div></td>
                      <td className="num"><div className="cell" id="av-f-val">{DASH}</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                      <td className="num"><div className="cell" id="av-f-gain">{DASH}</div></td>
                      <td className="num"><div className="cell" id="av-f-rdt">{DASH}</div></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="fees">
                  <b>Frais analysés</b> — frais d&apos;entrée, de gestion (fonds euros / unités de
                  compte) et d&apos;arbitrage à renseigner depuis les conditions de chaque contrat ;
                  les totaux pondérés se recalculent ensuite.
                </div>
                <div className="edit-hint eng-only">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>{" "}
                  Prérempli depuis la collecte — cliquez une valeur pour la corriger. Le format (€, %)
                  est réappliqué automatiquement ; les totaux pondérés se recalculent seuls.
                </div>
              </div>
            </div>
          </div>

          {/* 3. PEA */}
          <div className="acc" id="acc-pea">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M4 19V5M4 15l5-4 4 3 7-7" />
                  <circle cx="20" cy="7" r="1.5" />
                </svg>
              </div>
              <div className="nm">
                Plan d&apos;épargne en actions (PEA)
                <span className="sub">
                  support réglementé — l&apos;ancienneté fiscale conditionne la fiscalité
                </span>
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
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Titulaire</th>
                      <th className="num">Ouverture</th>
                      <th className="num">Versements</th>
                      <th className="num">Valeur (étude)</th>
                      <th className="num">Plus-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="regul">
                  <div className="rc"><div className="rl">Date d&apos;ouverture</div><div className="rv">{DASH}</div></div>
                  <div className="rc"><div className="rl">Ancienneté fiscale</div><div className="rv">{DASH}</div></div>
                  <div className="rc"><div className="rl">Seuil d&apos;exonération</div><div className="rv">À compléter</div></div>
                </div>
                <div className="consq">
                  <strong>Conséquence fiscale :</strong> au-delà de 5 ans de détention, les retraits
                  sont <strong>exonérés d&apos;impôt sur le revenu</strong> (prélèvements sociaux de
                  17,2 % dus sur les gains) et un retrait reste possible sans clôture. L&apos;ancienneté
                  du plan reste à renseigner.{" "}
                  <span className="eye eng-only">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>{" "}
                    source &amp; texte
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. COMPTE-TITRES ORDINAIRE */}
          <div className="acc" id="acc-cto">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M3 3v18h18" />
                  <path d="M7 14l3-3 3 3 5-6" />
                </svg>
              </div>
              <div className="nm">
                Compte-titres ordinaire (CTO)
                <span className="sub">valeurs mobilières détenues en direct</span>
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
                    <col style={{ width: "32%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Nom du support</th>
                      <th>Titulaire</th>
                      <th className="num">Valeur (étude)</th>
                      <th className="num">Poids</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><div className="cell">Total compte-titres</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="consq">
                  <strong>Fiscalité :</strong> hors enveloppe — les plus-values de cession et les
                  dividendes sont soumis au <strong>prélèvement forfaitaire unique de 30 %</strong> (ou
                  barème sur option), avec imposition l&apos;année de réalisation. Liquidité élevée,
                  aucune contrainte de durée.
                </div>
              </div>
            </div>
          </div>

          {/* 5. ÉPARGNE SALARIALE */}
          <div className="acc" id="acc-es">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M12 3v18M5 8h14M5 16h14" />
                </svg>
              </div>
              <div className="nm">
                Épargne salariale (PEE / PERCO)
                <span className="sub">participation, intéressement, abondement</span>
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
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Dispositif</th>
                      <th>Titulaire</th>
                      <th className="num">Versements</th>
                      <th className="num">Abondement</th>
                      <th className="num">Valeur (étude)</th>
                      <th className="num">Rendement net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="pct">{DASH}</div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="regul r4">
                  <div className="rc"><div className="rl">Mise en place</div><div className="rv">{DASH}</div></div>
                  <div className="rc"><div className="rl">Disponibilité</div><div className="rv">Blocage 5 ans</div></div>
                  <div className="rc rc-click"><div className="rl">Déblocage anticipé</div><div className="rv">Cas légaux <span style={{ color: "var(--gold-deep)" }}>›</span></div></div>
                  <div className="rc"><div className="rl">Fiscalité des gains</div><div className="rv">PS 17,2 %</div></div>
                </div>
                <div className="consq">
                  <strong>Conséquence :</strong> sommes indisponibles 5 ans, sauf cas de déblocage
                  anticipé légaux (mariage, acquisition de la résidence principale, etc.). Versements et
                  abondement <strong>exonérés d&apos;impôt sur le revenu</strong> ; plus-values soumises
                  aux seuls prélèvements sociaux.
                </div>
              </div>
            </div>
          </div>

          {/* 6. MÉTAUX PRÉCIEUX */}
          <div className="acc" id="acc-or">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <path d="M4 18l5-9 4 5 3-4 4 8z" />
                </svg>
              </div>
              <div className="nm">
                Métaux précieux (or)
                <span className="sub">or physique, pièces, supports indexés</span>
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
                    <col style={{ width: "26%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "17%" }} />
                    <col style={{ width: "17%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Support</th>
                      <th>Détenteur</th>
                      <th>Forme</th>
                      <th className="num">Valeur (étude)</th>
                      <th className="num">Variation 1 an</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="pct">{DASH}</div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="consq">
                  <strong>Rôle patrimonial :</strong> valeur refuge, faiblement corrélée aux marchés
                  actions. <strong>Fiscalité à la cession :</strong> taxe forfaitaire sur les métaux
                  précieux de 11,5 %, ou régime des plus-values sur biens meubles sur option (abattement
                  par année de détention).
                </div>
              </div>
            </div>
          </div>

          {/* 7. AUTRES ACTIFS FINANCIERS */}
          <div className="acc" id="acc-autres">
            <div className="acc-h">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l3 2" />
                </svg>
              </div>
              <div className="nm">
                Autres actifs financiers
                <span className="sub">private equity, produits structurés, cryptoactifs</span>
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
                    <col style={{ width: "31%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Nom de l&apos;actif</th>
                      <th>Titulaire</th>
                      <th className="num">Valeur (étude)</th>
                      <th className="num">Horizon</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="eur">{DASH}</div></td>
                      <td className="num"><div className="cell ed" data-fmt="txt">{DASH}</div></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><div className="cell">Total autres actifs</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                      <td className="num"><div className="cell">{DASH}</div></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="consq">
                  <strong>Caractéristiques :</strong> actifs <strong>peu liquides</strong>, à horizon
                  long (8-10 ans), valorisés périodiquement. Avantage fiscal à la souscription (réduction
                  d&apos;impôt sur le revenu) en contrepartie d&apos;un engagement de conservation. À
                  intégrer avec prudence dans l&apos;allocation globale.
                </div>
              </div>
            </div>
          </div>

          {/* INDICATEURS */}
          <div className="synthacc">
            <div className="subttl anchor synth-h" id="indic">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                <path d="M12 3a9 9 0 1 0 9 9" />
                <path d="M12 12l5-3" />
              </svg>{" "}
              Indicateurs clés — épargne &amp; liquidité
              <svg className="synthchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="synthbody">
              <div className="kpirow">
                <div className="kpi">
                  <div className="kv">
                    <ValeurEditable vKey="capacite_epargne_mensuelle" format="euro" initial={donnees.valeurs["capacite_epargne_mensuelle"] ?? null} label="Capacité d'épargne mensuelle" />
                  </div>
                  <div className="kl">Capacité d&apos;épargne mensuelle</div>
                  <div className="kf">
                    <ValeurEditable vKey="fin_taux_epargne_budget" format="percent" initial={donnees.valeurs["fin_taux_epargne_budget"] ?? null} label="Taux d'épargne du budget" /> du budget
                  </div>
                </div>
                <div className="kpi">
                  <div className="kv">
                    <ValeurEditable vKey="fin_epargne_precaution" format="euro" initial={donnees.valeurs["fin_epargne_precaution"] ?? null} label="Épargne de précaution" />
                  </div>
                  <div className="kl">Épargne de précaution</div>
                  <div className="kf">cible 3 à 6 mois de charges</div>
                </div>
                <div className="kpi">
                  <div className="kv">
                    <ValeurEditable vKey="epargne_disponible" format="euro" initial={donnees.valeurs["epargne_disponible"] ?? null} label="Excédent mobilisable" />
                  </div>
                  <div className="kl">Excédent mobilisable</div>
                  <div className="kf">au-delà de la réserve</div>
                </div>
                <div className="kpi">
                  <div className="kv">
                    <ValeurEditable vKey="fin_liquidite_courante_mois" format="number" initial={donnees.valeurs["fin_liquidite_courante_mois"] ?? null} label="Liquidité courante (mois)" />
                  </div>
                  <div className="kl">Liquidité courante</div>
                  <div className="kf">cible 3 à 6 mois</div>
                </div>
              </div>
              <div className="rappel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 16v-5" />
                  <circle cx="12" cy="8" r="0.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <span>
                  <b>Rappel synthétique</b> — taux d&apos;effort{" "}
                  <ValeurEditable vKey="budget_taux_effort" format="percent" initial={donnees.valeurs["budget_taux_effort"] ?? null} label="Taux d'effort" /> · taux d&apos;endettement{" "}
                  <ValeurEditable vKey="budget_taux_endettement" format="percent" initial={donnees.valeurs["budget_taux_endettement"] ?? null} label="Taux d'endettement" />{" "}
                  · reste à vivre{" "}
                  <ValeurEditable vKey="budget_reste_a_vivre" format="euro" initial={donnees.valeurs["budget_reste_a_vivre"] ?? null} label="Reste à vivre mensuel" />/mois.{" "}
                  <span className="lk">Détail complet dans « Budget »</span>.
                </span>
              </div>
            </div>
          </div>

          {/* ANALYSE 3 DIMENSIONS */}
          <div className="subttl anchor" id="analyse">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 4v16h16" />
              <path d="M4 15l4-4 4 3 5-6" />
            </svg>{" "}
            Risques · Opportunités · Optimisations
          </div>

          <Bloc blocKey="Excédent de liquidités" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M7 15h10a3.3 3.3 0 0 0 .5-6.56A4.8 4.8 0 0 0 8 6.4 3.8 3.8 0 0 0 7 15z" fill="#102D50" />
                  <g stroke="#102D50" strokeWidth="2" strokeLinecap="round">
                    <line x1="9" y1="17.5" x2="8" y2="20.5" />
                    <line x1="13" y1="17.5" x2="12" y2="20.5" />
                    <line x1="17" y1="17.5" x2="16" y2="20.5" />
                  </g>
                </svg>
              </span>
              <span className="tt">Excédent de liquidités</span>
              <span className="cert c-forte eng-only">
                <span>Confiance · à évaluer</span>
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
                  <li>Liquidités immédiatement disponibles : <strong><ValeurEditable vKey="fin_liquidites_immediates" format="euro" initial={donnees.valeurs["fin_liquidites_immediates"] ?? null} label="Liquidités immédiatement disponibles" /></strong>, soit <strong><ValeurEditable vKey="fin_liquidites_mois_depenses" format="number" initial={donnees.valeurs["fin_liquidites_mois_depenses"] ?? null} label="Mois de dépenses courantes couverts" /></strong> de dépenses courantes.</li>
                  <li>Norme d&apos;épargne de précaution : 3 à 6 mois de charges courantes.</li>
                  <li>Origine : accumulation progressive sur comptes courants et livrets, à apprécier une fois les soldes collectés.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>Érosion monétaire : des fonds peu ou pas rémunérés perdent du pouvoir d&apos;achat face à l&apos;inflation.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Liquidité = atout : apport pour un investissement à effet de levier, ou saisie d&apos;opportunités lors d&apos;une correction de marché.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Arbitrer l&apos;excédent vers des supports rémunérateurs, en conservant une réserve de précaution adaptée au train de vie.</div>
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
                <p>Excédent au-delà de la réserve : <strong><ValeurEditable vKey="epargne_disponible" format="euro" initial={donnees.valeurs["epargne_disponible"] ?? null} label="Excédent au-delà de la réserve" /></strong>. Le différentiel de performance entre le taux actuel et un taux cible chiffre le manque à gagner annuel, à compléter une fois les montants renseignés.</p>
              </div>
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>{" "}
                  Justification<span className="fn client-only">¹</span>
                </div>
                <p>Réserve recommandée 3-6 mois (pratique de place) ; train de vie issu de l&apos;analyse budgétaire.{" "}
                  <span className="eye eng-only">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>{" "}
                    sources
                  </span>
                </p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span><b>Optimisation chiffrée :</b> coût d&apos;opportunité (ci-dessous) · <b>Préconisation :</b> arbitrage vers une enveloppe diversifiée et performante.</span>
            </div>
          </Bloc>

          <Bloc blocKey="Faible performance des contrats" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M7 15h10a3.3 3.3 0 0 0 .5-6.56A4.8 4.8 0 0 0 8 6.4 3.8 3.8 0 0 0 7 15z" fill="#102D50" />
                  <g stroke="#102D50" strokeWidth="2" strokeLinecap="round">
                    <line x1="9" y1="17.5" x2="8" y2="20.5" />
                    <line x1="13" y1="17.5" x2="12" y2="20.5" />
                    <line x1="17" y1="17.5" x2="16" y2="20.5" />
                  </g>
                </svg>
              </span>
              <span className="tt">Faible performance des contrats</span>
              <span className="cert c-forte eng-only">
                <span>Confiance · à évaluer</span>
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
                  <li>Rendements nets des contrats à comparer à l&apos;inflation moyenne de la période de détention : <strong><ValeurEditable vKey="fin_rendement_net_contrats" format="percent" initial={donnees.valeurs["fin_rendement_net_contrats"] ?? null} label="Rendement net des contrats depuis l'origine" /></strong>.</li>
                  <li>Une exposition prépondérante aux fonds en euros plafonne le rendement réel.</li>
                  <li>Origine : structure d&apos;allocation à objectiver une fois les rendements collectés.</li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r"><span className="lab">Risque</span>Rendement réel potentiellement négatif : le patrimoine se déprécie en pouvoir d&apos;achat malgré la protection nominale.</div>
                  <div className="it o"><span className="lab">Opportunité</span>Réallouer un capital significatif sur des supports diversifiés peut transformer une perte réelle en croissance.</div>
                  <div className="it opt"><span className="lab">Optimisation</span>Arbitrage vers une enveloppe performante (assurance-vie luxembourgeoise, unités de compte pilotées), réserve de précaution maintenue.</div>
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
                <p>Sur l&apos;encours concerné, le différentiel de rendement réel représente un manque à gagner annuel, cumulé sur dix ans : <strong><ValeurEditable vKey="fin_manque_a_gagner_10ans" format="euro" initial={donnees.valeurs["fin_manque_a_gagner_10ans"] ?? null} label="Manque à gagner cumulé sur dix ans" /></strong> (détail ci-dessous).</p>
              </div>
              <div className="dim">
                <div className="dh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>{" "}
                  Justification<span className="fn client-only">²</span>
                </div>
                <p>Rendements et versements issus des relevés annuels ; inflation moyenne INSEE.{" "}
                  <span className="eye eng-only">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>{" "}
                    sources
                  </span>
                </p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span><b>Optimisation chiffrée :</b> coût d&apos;opportunité (ci-dessous) · <b>Préconisation :</b> arbitrage des avoirs vers une enveloppe diversifiée et performante.</span>
            </div>
          </Bloc>

          {/* COÛT D'OPPORTUNITÉ */}
          <div className="synthacc open">
            <div className="subttl anchor synth-h" id="cout">
              <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v8M9.5 10.5h3.2a1.5 1.5 0 0 1 0 3H10.5" />
              </svg>{" "}
              Coût d&apos;opportunité
              <svg className="synthchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="synthbody">
              <div className="coppintro">
                <b>Qu&apos;est-ce que le coût d&apos;opportunité ?</b> C&apos;est la performance{" "}
                <em>non perçue</em> en laissant un capital sur des supports peu rémunérateurs, plutôt que
                de l&apos;investir sur une allocation cohérente avec l&apos;horizon du foyer.{" "}
                <b>Méthode :</b> on projette la valeur sur 10 ans à son rendement actuel, puis au taux
                cible ; l&apos;écart est le manque à gagner. <b>Hypothèse :</b> le taux de référence (5 %
                par défaut) correspond au rendement annualisé moyen d&apos;une allocation diversifiée
                équilibrée, prudent et net de frais.{" "}
                <span className="srcbtn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7z" />
                  </svg>{" "}
                  Méthode &amp; justification détaillées
                </span>
              </div>
              <Bloc blocKey="Coût d'opportunité" className="copp ablock foldopen">
                <div className="ch">
                  <div className="t">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v10M9.2 9.5h3.6a1.6 1.6 0 0 1 0 3.2H10" />
                    </svg>{" "}
                    Projection sur 10 ans
                  </div>
                  <div className="hyprow eng-only">
                    <span className="hl">Scénario :</span>
                    <button className="hbtn">3 %</button>
                    <button className="hbtn on">5 %</button>
                    <button className="hbtn">8 %</button>
                    <button className="hbtn">10 %</button>
                  </div>
                  <span className="hyp-client" id="hyp-client">Scénario retenu : 5 %</span>
                </div>
                <div className="copp-body">
                  <div className="compare">
                    <div className="cstate now">
                      <div className="cl">Capital aujourd&apos;hui</div>
                      <div className="cv" id="cmp-cap">{DASH}</div>
                      <div className="cd">&nbsp;</div>
                    </div>
                    <div className="carrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </div>
                    <div className="cstate cur">
                      <div className="cl">Dans 10 ans · au rythme actuel</div>
                      <div className="cv" id="cmp-cur">{DASH}</div>
                      <div className="cd" id="cmp-cur-d">{DASH}</div>
                    </div>
                    <div className="carrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </div>
                    <div className="cstate opt">
                      <div className="cl">Dans 10 ans · optimisé (<span id="cmp-h">5</span> %)</div>
                      <div className="cv" id="cmp-opt">{DASH}</div>
                      <div className="cd" id="cmp-opt-d">{DASH}</div>
                    </div>
                  </div>
                  <div className="gapband">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 3v18M5 10l7-7 7 7" />
                    </svg>{" "}
                    Manque à gagner sur 10 ans : <b id="gap-v-f">{DASH}</b>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Contrat</th>
                        <th>Valeur</th>
                        <th>Rdt actuel</th>
                        <th>Projeté 10 ans</th>
                        <th>Projeté optimisé</th>
                        <th>Manque à gagner</th>
                      </tr>
                    </thead>
                    <tbody id="cout-body"></tbody>
                    <tfoot>
                      <tr>
                        <td>Consolidé</td>
                        <td id="c-val">{DASH}</td>
                        <td id="c-rdt">{DASH}</td>
                        <td id="c-cur">{DASH}</td>
                        <td id="c-tar">{DASH}</td>
                        <td className="mq" id="c-mq">{DASH}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="note" style={{ marginTop: 9 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 16v-5" />
                      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>{" "}
                    Capitalisation composée nette de frais.{" "}
                    <span className="srcbtn eng-only" style={{ marginLeft: 4 }}>Méthode &amp; sources</span>
                  </div>
                </div>
              </Bloc>
            </div>
          </div>

          {/* SYNTHESE DU THEME */}
          <div className="synthacc">
            <div className="subttl anchor synth-h" id="synthese-theme-fin">
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
                Patrimoine financier — lecture stratégique
              </div>
              <div className="synth-cert sc-green eng-only">
                <span className="sc-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <span><b>Confiance · à évaluer</b> · synthèse fondée sur les constats du thème</span>
                <span className="sc-link">Voir le détail</span>
              </div>
              <p>
                Le patrimoine financier du foyer s&apos;élève à <b><ValeurEditable vKey="actifs_financiers" format="euro" initial={donnees.valeurs["actifs_financiers"] ?? null} label="Patrimoine financier total" /></b>, soit une part à préciser du
                patrimoine global. Il se compose de contrats d&apos;assurance-vie et de capitalisation
                (<b><ValeurEditable vKey="assurance_vie" format="euro" initial={donnees.valeurs["assurance_vie"] ?? null} label="Contrats d'assurance-vie et de capitalisation" /></b>), de liquidités disponibles (<b><ValeurEditable vKey="liquidites" format="euro" initial={donnees.valeurs["liquidites"] ?? null} label="Liquidités disponibles" /></b>) et de valeurs mobilières
                diversifiées (<b><ValeurEditable vKey="fin_valeurs_mobilieres" format="euro" initial={donnees.valeurs["fin_valeurs_mobilieres"] ?? null} label="Valeurs mobilières diversifiées" /></b> — PEA, compte-titres, métaux précieux, capital-investissement).
                Une fois les encours collectés, l&apos;analyse pourra confronter le volume de l&apos;assise
                financière à sa structure, en particulier la part de trésorerie non rémunérée et le
                rendement réel des contrats.
              </p>
              <p>
                Les liquidités sont à comparer à la réserve de précaution usuelle de 3 à 6 mois de charges
                courantes. L&apos;excédent mobilisable (<b><ValeurEditable vKey="epargne_disponible" format="euro" initial={donnees.valeurs["epargne_disponible"] ?? null} label="Excédent mobilisable" /></b>), s&apos;il demeure placé sur des
                supports peu ou pas rémunérés, reste exposé à l&apos;érosion monétaire.
              </p>
              <p>
                Les contrats d&apos;assurance-vie seront appréciés au regard de leur rendement net depuis
                l&apos;origine (<b><ValeurEditable vKey="fin_rendement_net_contrats" format="percent" initial={donnees.valeurs["fin_rendement_net_contrats"] ?? null} label="Rendement net des contrats depuis l'origine" /></b>), confronté à l&apos;inflation moyenne de la période : un
                rendement réel négatif signalerait un capital figé sur des fonds en euros. Sur l&apos;encours
                concerné, le manque à gagner cumulé sur dix ans est estimé à <b><ValeurEditable vKey="fin_manque_a_gagner_10ans" format="euro" initial={donnees.valeurs["fin_manque_a_gagner_10ans"] ?? null} label="Manque à gagner cumulé sur dix ans" /></b>.
              </p>
              <p>
                Plusieurs leviers se dégageront de cette lecture. La réallocation de l&apos;excédent de
                liquidités et l&apos;arbitrage des contrats sous-performants vers une enveloppe diversifiée
                et performante — assurance-vie luxembourgeoise, unités de compte sous gestion pilotée —
                permettraient de convertir une perte réelle en croissance, tout en préservant une réserve
                de précaution adaptée. Le coût d&apos;opportunité chiffré objective l&apos;enjeu et fonde la
                priorité de cet arbitrage.
              </p>
              <div className="sp-recap">
                <div className="spr spr-r">
                  <div className="spr-h">Principaux risques</div>
                  <ul>
                    <li>Érosion monétaire d&apos;un éventuel excédent de liquidités non rémunéré.</li>
                    <li>Rendement réel potentiellement négatif des contrats d&apos;assurance-vie.</li>
                    <li>Concentration sur les fonds en euros.</li>
                  </ul>
                </div>
                <div className="spr spr-o">
                  <div className="spr-h">Principales opportunités</div>
                  <ul>
                    <li>Capital mobilisable vers des supports diversifiés.</li>
                    <li>Liquidité disponible comme apport à effet de levier ou saisie d&apos;opportunités de marché.</li>
                    <li>Enveloppes existantes (PEA, compte-titres) à dynamiser.</li>
                  </ul>
                </div>
                <div className="spr spr-opt">
                  <div className="spr-h">Principales optimisations</div>
                  <ul>
                    <li>Arbitrer l&apos;excédent vers des supports rémunérateurs, réserve de précaution maintenue.</li>
                    <li>Réallouer les contrats sous-performants vers une assurance-vie luxembourgeoise en unités de compte pilotées.</li>
                    <li>Capter le différentiel de performance objectivé par le coût d&apos;opportunité.</li>
                  </ul>
                </div>
              </div>
              <div className="sp-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>{" "}
                <span>Ces leviers seront chiffrés, arbitrés et hiérarchisés dans la partie « Préconisations » de l&apos;étude.</span>
              </div>
            </div>
          </div>

          {/* ANNEXE CLIENT */}
          <div className="appendix client-only">
            <h2>Sources &amp; méthode</h2>
            <div className="appref">
              <span className="n">¹</span>
              <span><b>Excédent de liquidités.</b> Soldes bancaires (relevés) ; train de vie issu de l&apos;analyse budgétaire ; réserve de précaution 3 à 6 mois de charges.</span>
            </div>
            <div className="appref">
              <span className="n">²</span>
              <span><b>Performance des contrats.</b> Rendements nets depuis l&apos;origine issus des relevés annuels ; inflation moyenne INSEE sur la période de détention.</span>
            </div>
            <div className="appref">
              <span className="n">³</span>
              <span><b>Coût d&apos;opportunité — scénario 5 %.</b> Rendement annualisé moyen d&apos;une allocation diversifiée équilibrée, net de frais, horizon 10 ans. Capitalisation composée : Valeur projetée = Valeur × (1 + taux)¹⁰.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
