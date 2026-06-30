/**
 * Sous-section « Analyse du passif » du document d'audit (maquette lignes 2711-2967).
 *
 * Portage fidèle de la maquette (mêmes sous-rubriques, mêmes libellés, mêmes
 * classes, mêmes SVG). Chaque data-block de la maquette est enveloppé d'un
 * <Bloc> dont la clé reprend exactement la valeur data-block (apostrophes
 * courbes comprises) : sélectionnable, éditable et validable par le volet.
 *
 * Branchement réel : le nom du foyer et le total du passif sont dérivés de
 * `donnees` (foyer.personnes, valeurs.passif_total / patrimoine_brut /
 * patrimoine_net) quand ils existent. Tous les MONTANTS du passif (capital
 * restant dû prêt par prêt, taux, durées, échéances, quotités, cautions, ratios
 * d'endettement) N'EXISTENT PAS en base : ils sont affichés en état vide honnête
 * (« — »), jamais recopiés depuis les chiffres-exemple de la maquette. Les
 * textes éditoriaux et méthodologiques (analyse, risques & opportunités,
 * synthèse, sources) sont reproduits comme contenu ; seuls les chiffres
 * nominatifs qu'ils citaient deviennent honnêtes.
 *
 * Server Component : il compose des <Bloc> (composant client) rendus dans
 * l'arbre du BlocProvider. Les comportements JS (accordéons, camemberts) sont
 * câblés ensuite par le câblage global ; ce module ne fait que produire le
 * markup fidèle avec les ids et classes attendus.
 */

import { type CSSProperties, type ReactNode } from "react";

import { Bloc } from "../Bloc";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

import "../../../../_styles/sections/patrimoine-passif.css";

const DASH = "—";

// ---------------------------------------------------------------------------
// Helpers purs
// ---------------------------------------------------------------------------

/** Formate un montant en « 715 000 € », « — » si absent. */
function fmtEuro(v: string | number | null | undefined): string {
  if (typeof v === "number" && Number.isFinite(v)) {
    return `${new Intl.NumberFormat("fr-FR").format(v)} €`;
  }
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return DASH;
}

/** Montant lu dans le dictionnaire éditable `valeurs` (null par défaut). */
function montant(donnees: EtudeDonnees, key: string): string {
  return fmtEuro(donnees.valeurs[key]);
}

/** Patronyme du foyer (person_a), pour les phrases — null si absent. */
function foyerSurname(donnees: EtudeDonnees): string | null {
  const a =
    donnees.foyer.personnes.find((p) => p.role === "person_a") ?? donnees.foyer.personnes[0];
  const nom = (a?.nom ?? "").trim();
  return nom || null;
}

/** « du foyer Martin » ou « du foyer » selon les données réelles. */
function foyerLabel(donnees: EtudeDonnees): string {
  const s = foyerSurname(donnees);
  return s ? `du foyer ${s}` : "du foyer";
}

/** Sujet des cautions : les deux titulaires réels, sinon « les associés ». */
function cautionsSubject(donnees: EtudeDonnees): string {
  const noms = donnees.foyer.personnes
    .map((p) => `${(p.prenom ?? "").trim()} ${(p.nom ?? "").trim()}`.trim())
    .filter(Boolean);
  if (noms.length >= 2) return `${noms[0]} et ${noms[1]}`;
  if (noms.length === 1) return noms[0];
  return "les associés";
}

// ---------------------------------------------------------------------------
// Styles inline repris de la maquette (cellules d'en-tête de catégorie)
// ---------------------------------------------------------------------------

const CAT_HEAD: CSSProperties = {
  background: "var(--light-blue)",
  color: "var(--navy)",
  fontWeight: 700,
  fontSize: "10.5px",
  letterSpacing: ".4px",
  textAlign: "center",
  padding: "6px 8px",
};

// ---------------------------------------------------------------------------
// Fragments d'affichage
// ---------------------------------------------------------------------------

/**
 * Détail d'un prêt (corps d'accordéon). La structure du tableau est reproduite
 * 1:1 ; chaque valeur du prêt n'existant pas en base, toutes les cellules
 * éditables affichent « — » (état vide honnête), prêtes à être saisies.
 */
function PretDetail() {
  const cell = (label: string) => (
    <tr>
      <td>
        <div className="cell" data-fmt="txt">
          {label}
        </div>
      </td>
      <td className="num">
        <div className="cell ed" data-fmt="txt">
          {DASH}
        </div>
      </td>
    </tr>
  );
  return (
    <div className="acc-b">
      <div className="acc-in">
        <table className="et" style={{ marginTop: "2px" }}>
          <colgroup>
            <col style={{ width: "54%" }} />
            <col style={{ width: "46%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={2} style={CAT_HEAD}>
                Informations générales
              </td>
            </tr>
            {cell("Établissement prêteur")}
            {cell("Capital emprunté")}
            {cell("Durée totale du prêt")}
            {cell("Capital restant dû")}
            <tr>
              <td colSpan={2} style={CAT_HEAD}>
                Taux / coût
              </td>
            </tr>
            {cell("Taux d’intérêt nominal")}
            {cell("TAEG")}
            {cell("Montant des échéances du prêt")}
            {cell("Montant des échéances de l’assurance")}
            {cell("Montant total des échéances (par mois)")}
            {cell("Montant total des échéances (par an)")}
            <tr>
              <td colSpan={2} style={CAT_HEAD}>
                Assurance emprunteur
              </td>
            </tr>
            {cell("Délégation d’assurance")}
            {cell("Risque couvert")}
            <tr>
              <td colSpan={2} style={CAT_HEAD}>
                Options &amp; spécificités
              </td>
            </tr>
            {cell("Option de modulation des échéances")}
            {cell("Option de suspension des échéances")}
            {cell("Indemnités de remboursement anticipé")}
            {cell("Garantie du prêt")}
            {cell("Clause de bonification")}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Un accordéon de prêt : le <Bloc> EST l'élément .acc (il porte le data-block,
 * comme dans la maquette où id/data-block/classe sont sur le même div). Entête
 * (icône, nom honnête, montant honnête) + détail. Le pliage est câblé ensuite.
 */
function PretAccordion({ blocKey, icon }: { blocKey: string; icon: ReactNode }) {
  return (
    <Bloc blocKey={blocKey} className="acc">
      <div className="acc-h">
        <div className="ic">{icon}</div>
        <div className="nm">
          {DASH}
          <span className="sub">{DASH}</span>
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
      <PretDetail />
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Icônes des prêts (chemins SVG repris de la maquette)
// ---------------------------------------------------------------------------

function IconImmeuble() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function IconResidence() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
      <path d="M4 21V6l8-3 8 3v15" />
      <path d="M9 21v-4h6v4" />
      <path d="M8 9h.5M11.5 9h.5M15 9h.5M8 13h.5M11.5 13h.5M15 13h.5" />
    </svg>
  );
}

function IconCredit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function PatrimoinePassif({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  const passifTotal = montant(donnees, "passif_total");
  const brut = montant(donnees, "patrimoine_brut");
  const net = montant(donnees, "patrimoine_net");
  const foyer = foyerLabel(donnees);
  const cautions = cautionsSubject(donnees);

  return (
    <div className="immo-mod">
      <div className="page modfold">
        <div className="shead">
          <div className="pic">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M5 21h14M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="crumb2">Analyse du patrimoine</div>
            <h1>Analyse du passif</h1>
          </div>{" "}
          <span className="cert c-forte eng-only">
            <span>Confiance forte · 92 %</span>
            <span className="co">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
          </span>
          <span className="modchev eng-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        <div className="mod-body">
      <Bloc blocKey="Texte d’introduction du passif" className="lead">
        Le passif rassemble l’ensemble des obligations financières et dettes que le foyer doit
        honorer (prêts bancaires, crédit à la consommation, crédits renouvelables, dettes envers un
        tiers ou l’administration, etc.). Il renseigne sur la santé financière du foyer et sur sa
        capacité d’endettement (les prêts bancaires, et plus particulièrement immobiliers, recèlent
        de nombreux leviers d’optimisation).
      </Bloc>

      {/* SYNTHÈSE */}
      <div className="subttl anchor" id="synth-pass">
        <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
          <path d="M3 21h18M5 21V8l7-5 7 5v13" />
        </svg>{" "}
        Synthèse du passif
      </div>
      <Bloc blocKey="Synthèse du passif">
        <div style={{ margin: "2px 0 16px", maxWidth: "760px" }}>
          <p style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: 1.62 }}>
            Le passif {foyer} s’établit à <strong>{passifTotal}</strong>. Il associe une dette
            personnelle de {DASH} (dont {DASH} de financements immobiliers en nom propre et un crédit
            à la consommation résiduel) et une dette de {DASH} logée dans les SCI, pour laquelle{" "}
            {cautions} se sont portés <strong>cautions solidaires</strong>.
          </p>
        </div>
      </Bloc>

      {/* TABLEAU DES DETTES */}
      <div className="subttl anchor">
        <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
          <path d="M4 5h16M4 12h16M4 19h16" />
        </svg>{" "}
        Tableau récapitulatif des dettes — réconcilié
      </div>
      <table className="et">
        <colgroup>
          <col style={{ width: "31%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Financement</th>
            <th>Détenteur</th>
            <th className="num">Capital restant dû</th>
            <th className="num">Taux</th>
            <th className="num">Durée rest.</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 4].map((i) => (
            <tr key={i}>
              <td>
                <div className="cell" data-fmt="txt">
                  {DASH}
                </div>
              </td>
              <td>
                <div className="cell" data-fmt="txt">
                  {DASH}
                </div>
              </td>
              <td className="num">
                <div className="cell" data-fmt="txt">
                  {DASH}
                </div>
              </td>
              <td className="num">
                <div className="cell" data-fmt="txt">
                  {DASH}
                </div>
              </td>
              <td className="num">
                <div className="cell" data-fmt="txt">
                  {DASH}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <div className="cell" data-fmt="txt">
                Total du passif
              </div>
            </td>
            <td></td>
            <td className="num">
              <div className="cell" data-fmt="txt">
                {passifTotal}
              </div>
            </td>
            <td className="num"></td>
            <td className="num"></td>
          </tr>
        </tfoot>
      </table>
      <div className="note" style={{ marginTop: "9px" }}>
        Trois financements immobiliers ({DASH}), un emprunt d’investissement sur le local
        professionnel ({DASH}) et un crédit à la consommation résiduel ({DASH}) composent le passif
        de <strong>{passifTotal}</strong>. Le détail prêt par prêt — conditions, assurance et
        cautions — figure ci-dessous.
      </div>

      {/* VENTILATION */}
      <div className="subttl anchor" id="vent-pass">
        <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
          <path d="M12 3v9l6 4" />
          <circle cx="12" cy="12" r="9" />
        </svg>{" "}
        Ventilation du passif<span className="rep-tot">{passifTotal}</span>
      </div>
      <div className="charts">
        <div className="chartc">
          <div className="ct-row">
            <span className="ct">Par nature</span>
          </div>
          <div className="donutwrap">
            <div className="donutbox" id="box-passnat">
              <svg className="donut" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth={16} />
                <g transform="rotate(-90 70 70)" fill="none" strokeWidth={16}>
                  <circle
                    className="seg"
                    id="seg-passnat-0"
                    cx="70"
                    cy="70"
                    r="54"
                    stroke="#102D50"
                    strokeDasharray="227.78 111.51"
                    strokeDashoffset="0"
                  />
                  <circle
                    className="seg"
                    id="seg-passnat-1"
                    cx="70"
                    cy="70"
                    r="54"
                    stroke="#C68E0E"
                    strokeDasharray="104.40 234.89"
                    strokeDashoffset="-227.78"
                  />
                  <circle
                    className="seg"
                    id="seg-passnat-2"
                    cx="70"
                    cy="70"
                    r="54"
                    stroke="#708196"
                    strokeDasharray="7.12 332.17"
                    strokeDashoffset="-332.18"
                  />
                </g>
              </svg>
              <div className="donut-tip" id="tip-passnat">
                <div className="dt-v">{passifTotal}</div>
              </div>
            </div>
            <div className="leg">
              <div className="lr" id="leg-passnat-0">
                <span className="sw" style={{ background: "#102D50" }}></span>
                <span className="ll">Emprunts immobiliers</span>
                <span className="lv">{DASH}</span>
                <span className="lp">{DASH}</span>
              </div>
              <div className="lr" id="leg-passnat-1">
                <span className="sw" style={{ background: "#C68E0E" }}></span>
                <span className="ll">Emprunt d’investissement</span>
                <span className="lv">{DASH}</span>
                <span className="lp">{DASH}</span>
              </div>
              <div className="lr" id="leg-passnat-2">
                <span className="sw" style={{ background: "#708196" }}></span>
                <span className="ll">Crédit à la consommation</span>
                <span className="lv">{DASH}</span>
                <span className="lp">{DASH}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="chartc">
          <div className="ct-row">
            <span className="ct">Par détenteur</span>
          </div>
          <div className="donutwrap">
            <div className="donutbox" id="box-passdet">
              <svg className="donut" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#DBE0E4" strokeWidth={16} />
                <g transform="rotate(-90 70 70)" fill="none" strokeWidth={16}>
                  <circle
                    className="seg"
                    id="seg-passdet-0"
                    cx="70"
                    cy="70"
                    r="54"
                    stroke="#102D50"
                    strokeDasharray="121.00 218.29"
                    strokeDashoffset="0"
                  />
                  <circle
                    className="seg"
                    id="seg-passdet-1"
                    cx="70"
                    cy="70"
                    r="54"
                    stroke="#C68E0E"
                    strokeDasharray="218.29 121.00"
                    strokeDashoffset="-121.00"
                  />
                </g>
              </svg>
              <div className="donut-tip" id="tip-passdet">
                <div className="dt-v">{passifTotal}</div>
              </div>
            </div>
            <div className="leg">
              <div className="lr" id="leg-passdet-0">
                <span className="sw" style={{ background: "#102D50" }}></span>
                <span className="ll">En nom propre</span>
                <span className="lv">{DASH}</span>
                <span className="lp">{DASH}</span>
              </div>
              <div className="lr" id="leg-passdet-1">
                <span className="sw" style={{ background: "#C68E0E" }}></span>
                <span className="ll">Via les SCI</span>
                <span className="lv">{DASH}</span>
                <span className="lp">{DASH}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYSE DÉTAILLÉE DU PASSIF */}
      <div className="subttl anchor" id="detail-pass">
        <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
          <path d="M9 3h6M9 3v4M15 3v4M7 7h10a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1z" />
          <path d="M9 12h6M9 16h4" />
        </svg>{" "}
        Analyse des prêts en cours
      </div>
      <PretAccordion blocKey="Prêt — Appartement de rapport" icon={<IconImmeuble />} />
      <PretAccordion blocKey="Prêt — Appartement meublé (LMNP)" icon={<IconImmeuble />} />
      <PretAccordion blocKey="Prêt — Studios locatifs" icon={<IconResidence />} />
      <PretAccordion blocKey="Prêt — Local professionnel" icon={<IconResidence />} />
      <PretAccordion blocKey="Prêt — Crédit à la consommation" icon={<IconCredit />} />
      <div className="note" style={{ marginTop: "2px" }}>
        * Les montants indiqués sont arrondis à l’euro le plus proche. Le total des capitaux restant
        dus s’élève à <strong>{passifTotal}</strong>, pour un service annuel cumulé de{" "}
        <strong>{DASH}</strong>.
      </div>

      {/* RISQUES & OPPORTUNITÉS - PRÊTS */}
      <div className="subttl anchor" id="rio-pass">
        <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
          <path d="M12 3l8 4v5c0 4-3.5 7.5-8 9-4.5-1.5-8-5-8-9V7z" />
          <path d="M9 12l2 2 4-4" />
        </svg>{" "}
        Risques &amp; opportunités — Prêts
      </div>

      {/* veille des taux */}
      <Bloc blocKey="Charge d’emprunt — veille des taux" className="ablock fold">
        <div className="ab-h">
          <span className="mx">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="13" r="8" fill="#102D50" />
              <path
                d="M12 9v4l3 2"
                stroke="#FAF8F3"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9 3h6" stroke="#102D50" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </span>
          <span className="tt">
            Évaluation de la charge d’emprunt — opportunité de renégociation ou de rachat
          </span>
          <span className="cert c-forte eng-only">
            <span>Confiance forte · 90 %</span>
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
                Les financements en cours s’échelonnent de <strong>{DASH}</strong> à{" "}
                <strong>{DASH}</strong>.
              </li>
              <li>
                Le prêt de l’appartement meublé ({DASH}) et le crédit à la consommation ({DASH})
                ressortent <strong>au-dessus des conditions de marché</strong> actuelles (≈ 3,50 %
                sur 15 ans).
              </li>
            </ul>
          </div>
          <div className="dim">
            <div className="rio">
              <div className="it r">
                <span className="lab">Risque</span>Une veille insuffisante laisserait courir une{" "}
                <strong>charge d’intérêts supérieure au marché</strong> sur les lignes les plus
                chères.
              </div>
              <div className="it o">
                <span className="lab">Opportunité</span>Renégociation ou <strong>rachat</strong> du
                prêt meublé et du crédit à la consommation dès que les taux moyens afficheront
                environ <strong>1 % d’écart à la baisse</strong>, allégeant la charge de la dette.
              </div>
              <div className="it opt">
                <span className="lab">Optimisation</span>Mettre en place une veille des taux et
                chiffrer le <strong>point mort</strong> d’un rachat — indemnités de remboursement
                anticipé incluses — avant toute opération.
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
              Allègement mécanique de la charge d’intérêts et amélioration du cash-flow, à arbitrer
              contre les indemnités de remboursement anticipé ({DASH}).
            </p>
          </div>
          <div className="dim">
            <div className="dh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>{" "}
              Justification<span className="fn client-only">¹</span>
            </div>
            <p>
              Comparaison des taux des contrats et des conditions de marché à durée équivalente.{" "}
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
          <span>
            <b>Préconisation :</b> instaurer une veille des taux et étudier le rachat des lignes les
            plus chères (chiffré dans la partie « Préconisations »).
          </span>
        </div>
      </Bloc>

      {/* assurance emprunteur */}
      <Bloc blocKey="Assurance emprunteur — quotités et délégation" className="ablock fold">
        <div className="ab-h">
          <span className="mx">
            <svg viewBox="0 0 24 24">
              <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
              <path
                d="M8.5 12l2.3 2.3 4.4-4.8"
                stroke="#FAF8F3"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="tt">
            Couverture et coût de l’assurance emprunteur — quotités et délégation
          </span>
          <span className="cert c-moy eng-only">
            <span>Confiance modérée · 79 %</span>
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
                Le prêt du local professionnel (SCI) est assuré à une{" "}
                <strong>quotité de {DASH} par tête</strong>, soit {DASH} au global.
              </li>
              <li>
                Son coût ({DASH}) <strong>pèse sur la rentabilité</strong> de la SCI.
              </li>
            </ul>
          </div>
          <div className="dim">
            <div className="rio">
              <div className="it r">
                <span className="lab">Risque</span>La faible quotité globale ({DASH}) contraindrait
                le <strong>conjoint survivant à supporter seul une part majeure</strong> de
                l’échéance en cas de décès du partenaire.
              </div>
              <div className="it o">
                <span className="lab">Opportunité</span>Une renégociation ou une{" "}
                <strong>délégation d’assurance</strong> permettrait une économie de trésorerie sur la
                durée résiduelle, à garanties au moins équivalentes.
              </div>
              <div className="it opt">
                <span className="lab">Optimisation</span>Relever les quotités (cible{" "}
                <strong>100 % par tête</strong> sur les prêts SCI) et mettre l’assurance en
                concurrence par délégation.
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
              Économie de trésorerie sur la durée résiduelle et meilleure protection du conjoint
              survivant. En crédit professionnel, le droit à la délégation est moins protecteur, mais
              une démarche commerciale peut <b>augmenter les garanties tout en abaissant le coût</b>.
            </p>
          </div>
          <div className="dim">
            <div className="dh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>{" "}
              Justification<span className="fn client-only">²</span>
            </div>
            <p>
              Quotités et coûts relevés sur le contrat d’assurance emprunteur.{" "}
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
        <div className="fond">
          <div className="fl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 3v18M5 21h14M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
            </svg>{" "}
            Fondements juridiques
          </div>
          <div className="chips">
            <div className="lawchip">
              <span className="k">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3" />
                  <path d="M12 8.5v4M12 16h.01" />
                </svg>
                À valider
              </span>
              <span className="lt">
                Droit à la délégation d’assurance (crédit professionnel) —{" "}
                <b>référence base ASTRAEOS</b>
              </span>
            </div>
          </div>
        </div>
        <div className="ab-foot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
          <span>
            <b>Préconisation :</b> relever les quotités et mettre en concurrence l’assurance
            emprunteur par délégation (chiffré dans la partie « Préconisations »).
          </span>
        </div>
      </Bloc>

      {/* caution solidaire */}
      <Bloc blocKey="Caution solidaire — exposition personnelle" className="ablock fold">
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
          <span className="tt">
            Caution solidaire — la dette des SCI pèse sur le patrimoine personnel
          </span>
          <span className="cert c-moy eng-only">
            <span>Confiance modérée · 80 %</span>
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
                Les deux financements logés dans les SCI (studios locatifs et local professionnel)
                représentent <strong>{DASH}</strong> de capital restant dû.
              </li>
              <li>
                Ces prêts sont assortis d’une <strong>caution solidaire</strong> consentie
                personnellement par les associés : la banque peut les poursuivre directement, pour la
                totalité de la dette.
              </li>
            </ul>
          </div>
          <div className="dim">
            <div className="rio">
              <div className="it r">
                <span className="lab">Risque</span>Sous le régime de la{" "}
                <strong>séparation de biens</strong>, l’engagement de caution n’est pas couvert par
                les protections propres aux régimes communautaires : il pèse sur le{" "}
                <strong>patrimoine propre</strong> de chaque caution, au-delà du capital social.
              </div>
              <div className="it o">
                <span className="lab">Opportunité</span>La{" "}
                <strong>renégociation des cautions bancaires</strong> et la mise en place d’une{" "}
                <strong>délégation d’assurance emprunteur</strong> permettent d’alléger et de
                circonscrire cette exposition.
              </div>
              <div className="it opt">
                <span className="lab">Optimisation</span>Documenter l’étendue exacte de chaque
                caution, calibrer les têtes et quotités d’assurance, et tenir un tableau de bord
                unique des engagements.
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
              La caution porte le taux d’endettement <b>de {DASH} à {DASH}</b> : un écart de{" "}
              <b>{DASH} de service annuel</b> de la dette, supporté personnellement en cas de
              défaillance des sociétés. La renégociation viserait à substituer ou plafonner ces
              engagements ; la délégation d’assurance à garantir le remboursement en cas de décès ou
              d’invalidité d’un associé.
            </p>
          </div>
          <div className="dim">
            <div className="dh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>{" "}
              Justification<span className="fn client-only">¹</span>
            </div>
            <p>
              Contrats de prêt des SCI et actes de cautionnement ; régime de la séparation de biens.{" "}
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
        <div className="fond">
          <div className="fl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 3v18M5 21h14M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
            </svg>{" "}
            Fondements juridiques
          </div>
          <div className="chips">
            <div className="lawchip">
              <span className="k">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3" />
                  <path d="M12 8.5v4M12 16h.01" />
                </svg>
                À valider
              </span>
              <span className="lt">
                Cautionnement solidaire de l’associé — <b>référence base ASTRAEOS</b>
              </span>
            </div>
            <div className="lawchip">
              <span className="k">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 3v4a1 1 0 0 0 1 1h4M7 21h10a2 2 0 0 0 2-2V8l-5-5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                </svg>
                Obligation
              </span>
              <span className="lt">Déclarations d’engagements aux prêteurs</span>
            </div>
          </div>
        </div>
        <div className="ab-foot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
          <span>
            <b>Préconisations :</b> renégociation des cautions bancaires des SCI et délégation
            d’assurance emprunteur (chiffrées dans la partie « Préconisations »).
          </span>
        </div>
      </Bloc>

      {/* SYNTHÈSE DU THÈME */}
      <div className="synthacc">
        <div className="subttl anchor synth-h" id="synthese-theme-pass">
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
            Analyse du passif — lecture stratégique
          </div>
          <div className="synth-cert sc-green eng-only">
            <span className="sc-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span>
              <b>Confiance forte · 92 %</b> · synthèse fondée sur les constats du thème
            </span>
            <span className="sc-link">Voir le détail</span>
          </div>
          <p>
            Le passif {foyer} s’établit à <b>{passifTotal}</b>, pour un patrimoine brut de{" "}
            <b>{brut}</b> : l’endettement reste à mettre en regard de l’actif, pour un patrimoine net
            de <b>{net}</b>. Sa structure repose en majorité sur l’immobilier, le solde se partageant
            entre un emprunt d’investissement et un crédit à la consommation résiduel. Le service
            annuel de la dette, assurance comprise, s’élève à <b>{DASH}</b>.
          </p>
          <p>
            Plusieurs éléments confortent cette lecture. Aucun financement n’est adossé à la
            résidence principale, libre de toute charge ; les taux des prêts immobiliers demeurent à
            apprécier au regard des conditions de marché ; et le taux d’endettement strictement
            personnel, limité à <b>{DASH}</b> des revenus du foyer, laisse une capacité d’emprunt à
            quantifier.
          </p>
          <p>
            La principale vigilance tient à l’exposition personnelle au titre des{" "}
            <b>cautions solidaires</b>. Les deux financements logés dans les SCI — <b>{DASH}</b> de
            capital restant dû — sont garantis personnellement par les associés. Réintégrée, cette
            dette porte le taux d’endettement consolidé à <b>{DASH}</b> : un niveau à apprécier, qui
            rappelle que, sous le régime de la séparation de biens, l’engagement de caution pèse sur
            le patrimoine propre de chacun, sans la protection attachée aux régimes communautaires.
          </p>
          <p>
            Deux leviers se dégagent. La renégociation des cautions bancaires des SCI allégerait
            l’exposition personnelle ; la délégation d’assurance emprunteur sécuriserait le
            remboursement des prêts en cas de décès ou d’invalidité, tout en maîtrisant son
            traitement fiscal. Ces deux chantiers sont développés dans la partie « Préconisations »
            de l’étude.
          </p>
          <div className="sp-recap">
            <div className="spr spr-r">
              <div className="spr-h">Principaux risques</div>
              <ul>
                <li>
                  Exposition personnelle au titre des cautions solidaires consenties aux SCI.
                </li>
                <li>
                  Séparation de biens : l’engagement de caution pèse sur le patrimoine propre, sans
                  protection communautaire.
                </li>
                <li>Crédit à la consommation au taux le plus élevé du foyer.</li>
              </ul>
            </div>
            <div className="spr spr-o">
              <div className="spr-h">Principales opportunités</div>
              <ul>
                <li>Capacité d’emprunt résiduelle à quantifier (endettement personnel maîtrisé).</li>
                <li>Renégociation des cautions bancaires des SCI.</li>
                <li>Délégation d’assurance emprunteur sur les prêts garantis.</li>
              </ul>
            </div>
            <div className="spr spr-opt">
              <div className="spr-h">Principales optimisations</div>
              <ul>
                <li>
                  Solder par anticipation le crédit à la consommation, au coût relatif le plus élevé.
                </li>
                <li>
                  Mettre en place une délégation d’assurance emprunteur calibrée par tête et par
                  quotité.
                </li>
                <li>Cartographier l’ensemble des engagements et cautions dans un tableau de bord unique.</li>
              </ul>
            </div>
          </div>
          <div className="sp-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>{" "}
            <span>
              Ces leviers seront chiffrés, arbitrés et hiérarchisés dans la partie « Préconisations »
              de l’étude.
            </span>
          </div>
        </div>
      </div>

      {/* ANNEXE CLIENT */}
      <div className="appendix client-only">
        <h2>Sources &amp; méthode</h2>
        <div className="appref">
          <span className="n">¹</span>
          <span>
            <b>Capital restant dû et conditions des prêts.</b> Tableaux d’amortissement des
            financements en cours (établissement, taux, durée, mensualité, quotité d’assurance).
          </span>
        </div>
        <div className="appref">
          <span className="n">²</span>
          <span>
            <b>Taux d’endettement.</b> Service annuel de la dette rapporté aux revenus du foyer issus
            des avis d’imposition ; lecture personnelle puis consolidée des cautions des SCI.
          </span>
        </div>
        <div className="appref">
          <span className="n">³</span>
          <span>
            <b>Cautionnement solidaire.</b> Contrats de prêt des SCI et actes de cautionnement ;
            régime de la séparation de biens (contrat de mariage). Référence juridique précise à
            valider depuis la base documentaire ASTRAEOS.
          </span>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
