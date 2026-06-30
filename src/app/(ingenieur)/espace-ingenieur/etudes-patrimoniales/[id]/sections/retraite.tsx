/**
 * Section « Analyse de la retraite » du document d'audit (maquette lignes 3373-3425).
 *
 * Module à ascenseur (.immo-mod > .page) : bilan des droits acquis, projection
 * des pensions, taux de remplacement et analyse risques/opportunités, puis
 * synthèse rédactionnelle du thème. Portage fidèle de la maquette (mêmes
 * sous-titres, mêmes tableaux, mêmes SVG, mêmes classes) pour que le JS global
 * (accordéons .fold/.synthacc, panneaux de confiance) s'y raccroche ensuite.
 *
 * Branché sur le RÉEL :
 *  - les âges des conjoints (dérivés de birthDate) et leurs noms d'affichage
 *    alimentent l'en-tête et la ligne « Âge du salarié » du bilan ;
 * État vide HONNÊTE partout ailleurs : trimestres, points, valeurs de point,
 * pensions projetées, taux de remplacement et revenus professionnels N'EXISTENT
 * PAS en base. Les cellules éditables affichent « À compléter » et les chiffres
 * nominatifs cités dans les textes méthodologiques deviennent des emplacements
 * « — » (éditables via le volet de révision) plutôt que les exemples de la maquette.
 *
 * Server Component : il ne compose que des éléments statiques et des <Bloc>
 * (composant client) rendus dans l'arbre du BlocProvider.
 */

import "../../../../_styles/sections/retraite.css";

import { Bloc } from "../Bloc";
import { ageFromBirthDate } from "../../../../_data/fiche-client";
import type { EtudeDonnees, EtudePersonne } from "../../../../_data/etudes-patrimoniales";

const DASH = "—";
const TODO = "À compléter";

/**
 * Lecture d'un montant/taux saisi par l'ingénieur dans le dictionnaire éditable
 * `donnees.valeurs` (pensions projetées, taux de remplacement, revenus
 * professionnels…). Aucune de ces valeurs n'est calculée ici : tant que rien
 * n'est saisi, on affiche « — ». L'unité reste libre (montant en euros ou taux)
 * car ces montants n'ont pas tous la même nature.
 */
function lire(donnees: EtudeDonnees, key: string): string {
  const v = donnees.valeurs[key];
  if (typeof v === "number" && Number.isFinite(v)) {
    return new Intl.NumberFormat("fr-FR").format(v);
  }
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return DASH;
}

function roleRank(role: EtudePersonne["role"]): number {
  return role === "person_a" ? 0 : 1;
}

function sortedPersonnes(donnees: EtudeDonnees): EtudePersonne[] {
  return [...donnees.foyer.personnes].sort((a, b) => roleRank(a.role) - roleRank(b.role));
}

/** Nom d'affichage « prénom nom » (réel), sans civilité inventée. */
function personneNom(p: EtudePersonne | undefined): string {
  if (!p) return DASH;
  const s = `${(p.prenom ?? "").trim()} ${(p.nom ?? "").trim()}`.trim();
  return s || DASH;
}

/** Âge réel dérivé de la date de naissance, « — » si absente. */
function ageLabel(p: EtudePersonne | undefined): string {
  if (!p) return DASH;
  const age = ageFromBirthDate(p.birthDate);
  return age != null ? `${age} ans` : DASH;
}

export default function RetraiteSection({ donnees }: { donnees: EtudeDonnees }) {
  const personnes = sortedPersonnes(donnees);
  const pa = personnes[0];
  const pb = personnes[1];
  const colA = personneNom(pa);
  const colB = personneNom(pb);

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
              <path d="M6 3h12M6 21h12M8 3v3l4 4 4-4V3M8 21v-3l4-4 4 4v3" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Audit patrimonial</div>
            <h1>Analyse des états retraite</h1>
          </div>
        </div>

        <div className="mod-body">
          <Bloc blocKey="Texte d’introduction de la retraite" className="lead">
            La préparation de la retraite est, à tout âge, une composante essentielle de la vie
            patrimoniale et son anticipation permet de sécuriser les revenus futurs.
          </Bloc>

          <Bloc blocKey="Objet de l’analyse retraite">
            <p>
              L’analyse des états retraite permet d’évaluer les droits acquis, de détecter
              d’éventuelles anomalies et d’identifier les actions à mettre en place pour optimiser la
              pension perçue. Cette section s’appuie sur les relevés de carrière et les estimations
              fournies par les régimes de retraite. Elle permet d’avoir une vision claire des
              trimestres validés, du montant projeté des pensions et des leviers d’optimisation
              pouvant être actionnés.
            </p>
            <p>
              L’objectif est de déterminer si la situation actuelle est alignée avec les besoins et
              objectifs du foyer pour la retraite, et d’identifier les éventuelles stratégies à
              mettre en place pour compléter les revenus futurs et sécuriser le niveau de vie.
            </p>
          </Bloc>

          <div className="subttl anchor" id="bilan-retraite">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 5h16M4 12h16M4 19h16" />
            </svg>{" "}
            Bilan des droits acquis
          </div>
          <table className="et et-retr">
            <colgroup>
              <col style={{ width: "34%" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "33%" }} />
            </colgroup>
            <thead>
              <tr>
                <th colSpan={3} style={{ textAlign: "center", fontSize: "11.5px", letterSpacing: ".4px" }}>
                  Régime de base
                </th>
              </tr>
              <tr>
                <th></th>
                <th style={{ textAlign: "center" }}>{colA}</th>
                <th style={{ textAlign: "center" }}>{colB}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Âge du salarié
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {ageLabel(pa)}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {ageLabel(pb)}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Droits acquis pour la retraite de base
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Nombre de trimestres restants à cotiser pour partir à taux plein
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Âge légal de départ à la retraite
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Âge ou durée de cotisation pour départ à taux plein
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Estimations de la pension de base à différents âges de départ en retraite
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={3}
                  style={{
                    background: "var(--light-blue)",
                    color: "var(--navy)",
                    fontWeight: 700,
                    fontSize: "11px",
                    letterSpacing: ".3px",
                    padding: "7px 11px",
                    textAlign: "center",
                  }}
                >
                  Régimes complémentaires
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Points accumulés AGIRC-ARRCO
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    CARCDSF complémentaire
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Prestation complémentaire de vieillesse
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Estimations des pensions complémentaires
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="subttl anchor" id="projection-retraite">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M4 19V5M4 15l5-4 4 3 7-7" />
            </svg>{" "}
            Projection des pensions
          </div>
          <table className="et et-retr">
            <colgroup>
              <col style={{ width: "34%" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "33%" }} />
            </colgroup>
            <thead>
              <tr>
                <th colSpan={3} style={{ textAlign: "center", fontSize: "11.5px", letterSpacing: ".4px" }}>
                  Cumul des pensions
                </th>
              </tr>
              <tr>
                <th></th>
                <th style={{ textAlign: "center" }}>{colA}</th>
                <th style={{ textAlign: "center" }}>{colB}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    Estimation des futures pensions
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
                <td>
                  <div className="cell ed" data-fmt="txt">
                    {TODO}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <Bloc blocKey="Taux de remplacement" className="subsect">
            <div className="keynote">
              <span className="ki">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 7.5h.01" />
                </svg>
              </span>
              <p>
                Le cumul des pensions projetées s’élève à{" "}
                <b>{lire(donnees, "retraite_pensions_cumul")}</b>, soit une baisse de revenus de
                l’ordre de <b>{lire(donnees, "retraite_taux_remplacement_baisse")}</b> par rapport
                aux revenus professionnels actuels du couple (
                <b>{lire(donnees, "retraite_revenus_pro_actuels")}</b>). Ce taux de remplacement
                appelle l’anticipation de revenus complémentaires pour préserver le niveau de vie à
                la retraite.
              </p>
            </div>
          </Bloc>

          <div className="subttl anchor" id="risk-retraite">
            <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
              <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>{" "}
            Risques &amp; opportunités
          </div>
          <Bloc blocKey="Taux de remplacement et baisse des ressources" className="ablock fold">
            <div className="ab-h">
              <span className="mx">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
                  <circle cx="12" cy="12.5" r="4.6" stroke="#FAF8F3" strokeWidth={1.5} fill="none" />
                  <path d="M12 10.2v2.4l1.6 1" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <span className="tt">
                Un taux de remplacement faible : baisse des ressources de{" "}
                {lire(donnees, "retraite_taux_remplacement_baisse")} à la retraite
              </span>
              <span className="cert c-moy eng-only" data-certif="retrisq">
                <span>Confiance modérée · 82 %</span>
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
                    Le revenu professionnel annuel actuel du couple s’élève à{" "}
                    <strong>{lire(donnees, "retraite_revenus_pro_actuels")}</strong> (net imposable).
                  </li>
                  <li>
                    Le montant prévisionnel des pensions (régime de base et complémentaire) est estimé
                    à <strong>{lire(donnees, "retraite_pensions_cumul")}</strong> bruts par an.
                  </li>
                  <li>
                    Cette projection met en évidence une baisse de revenus de{" "}
                    <strong>{lire(donnees, "retraite_taux_remplacement_baisse")}</strong> au moment du
                    départ à la retraite.
                  </li>
                </ul>
              </div>
              <div className="dim">
                <div className="rio">
                  <div className="it r">
                    <span className="lab">Risque</span>
                    La diminution des ressources peut engendrer un déséquilibre budgétaire si les
                    charges fixes (crédits en cours, impôts, dépenses de santé) et le train de vie ne
                    sont pas ajustés. Sans anticipation, le couple pourrait puiser prématurément dans
                    son capital, compromettant la pérennité du patrimoine à long terme.
                  </div>
                  <div className="it o">
                    <span className="lab">Opportunité</span>
                    La mise en place d’une stratégie de revenus complémentaires permettrait de combler
                    tout ou partie de cet écart.
                  </div>
                  <div className="it opt">
                    <span className="lab">Optimisation</span>
                    Anticiper la constitution de revenus complémentaires (immobilier locatif,
                    placements financiers, épargne retraite) et ajuster progressivement les charges
                    fixes avant le départ.
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
                  Ce différentiel de revenus réduit la marge de manœuvre financière face à des
                  dépenses imprévues ou liées à une future perte d’autonomie.
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
                  Relevés de carrière, estimations des régimes de retraite et revenus professionnels
                  du foyer.
                </p>
              </div>
            </div>
            <div className="ab-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span>
                <b>Préconisation :</b> bâtir une stratégie de revenus complémentaires pour sécuriser
                le niveau de vie à la retraite (partie « Préconisations »).
              </span>
            </div>
          </Bloc>

          {/* SYNTHÈSE DU THÈME */}
          <div className="synthacc">
            <div className="subttl anchor synth-h" id="synthese-theme-retraite">
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
                Analyse de la retraite — lecture stratégique
              </div>
              <div className="synth-cert sc-green eng-only" data-certif="retraiteth">
                <span className="sc-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <span>
                  <b>Confiance forte · 88 %</b> · synthèse fondée sur les constats du thème
                </span>
                <span className="sc-link">Voir le détail</span>
              </div>
              <p>
                À la retraite, le couple percevrait des pensions de{" "}
                <b>{lire(donnees, "retraite_pension_person_a")}</b> pour {colA} et{" "}
                <b>{lire(donnees, "retraite_pension_person_b")}</b> pour {colB}, soit un cumul de{" "}
                <b>{lire(donnees, "retraite_pensions_cumul")}</b> bruts par an.
              </p>
              <p>
                Ce montant représente une baisse de l’ordre de{" "}
                <b>{lire(donnees, "retraite_taux_remplacement_baisse")}</b> par rapport aux revenus
                professionnels actuels. Le taux de remplacement est donc faible, ce qui est habituel
                pour des professions libérales fortement rémunérées, dont les cotisations ne couvrent
                qu’une part limitée du revenu d’activité.
              </p>
              <p>
                Le principal enjeu est l’<b>anticipation</b> : la constitution progressive de revenus
                complémentaires (immobilier, placements financiers, épargne retraite dédiée) et
                l’ajustement des charges fixes permettront de préserver le niveau de vie. Ces leviers
                sont développés dans le volet préconisations.
              </p>
              <div className="sp-recap">
                <div className="spr spr-r">
                  <div className="spr-h">Principaux risques</div>
                  <ul>
                    <li>Baisse de revenus à la retraite à quantifier.</li>
                    <li>Risque de décapitalisation pour maintenir le train de vie.</li>
                    <li>Marge de manœuvre réduite face aux imprévus et à la perte d’autonomie.</li>
                  </ul>
                </div>
                <div className="spr spr-o">
                  <div className="spr-h">Principales opportunités</div>
                  <ul>
                    <li>Horizon long permettant de constituer des revenus complémentaires.</li>
                    <li>Capacité d’épargne actuelle mobilisable (montant à compléter).</li>
                    <li>Dispositifs d’épargne retraite à fiscalité avantageuse.</li>
                  </ul>
                </div>
                <div className="spr spr-opt">
                  <div className="spr-h">Principales optimisations</div>
                  <ul>
                    <li>Constitution progressive de revenus complémentaires.</li>
                    <li>Ajustement anticipé des charges fixes avant le départ.</li>
                    <li>Mobilisation de l’épargne retraite (PER) dans une logique fiscale.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ANNEXE CLIENT */}
          <div className="appendix client-only">
            <div className="ap-h">Sources et pièces analysées</div>
            <ul>
              <li>Relevés de carrière des deux conjoints</li>
              <li>Estimations indicatives des régimes de base et complémentaires</li>
              <li>Avis d’imposition et revenus professionnels du foyer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
