/**
 * Section « Analyse des sociétés » du document d'audit (maquette lignes 3480-3562).
 *
 * Modules à ascenseur (.immo-mod / .page / .page.modfold) : SCI patrimoniale,
 * entreprise individuelle de Monsieur, entreprise individuelle de Madame, puis
 * synthèse consolidée de l'ensemble. Chaque société est analysée par des
 * sous-accordéons (.subacc : juridique, social, trésorerie, fiscalité) et des
 * blocs d'analyse (.ablock) à trois dimensions, suivis d'une synthèse
 * rédactionnelle (.synthacc). Portage fidèle de la maquette (mêmes libellés,
 * mêmes classes, mêmes SVG) pour que le JS global (accordéons .subacc/.fold/
 * .synthacc, panneaux de confiance) s'y raccroche ensuite.
 *
 * Branché sur le RÉEL : les noms d'associés du schéma de la SCI reprennent les
 * prénoms réels du foyer (à défaut, les libellés génériques « Madame »/« Monsieur »).
 *
 * État vide HONNÊTE partout ailleurs : les MONTANTS des sociétés (capital,
 * bénéfices, cotisations, trésoreries, BFR, fonds de sécurité, surplus, taux de
 * prélèvement) N'EXISTENT PAS en base. Les chiffres nominatifs cités dans les
 * textes méthodologiques deviennent des emplacements « — » (éditables via le
 * volet de révision) plutôt que les exemples de la maquette. Les ratios de
 * gouvernance (50/50, seuils de majorité, fractions successorales) et les
 * constantes légales (IS, TMI, âges de départ) sont reproduits comme contenu
 * méthodologique.
 *
 * Server Component : il ne compose que des éléments statiques et des <Bloc>
 * (composant client) rendus dans l'arbre du BlocProvider.
 */

import "../../../../_styles/sections/societes.css";

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import ValeurEditable from "../ValeurEditable";
import type { ValeurFormat } from "../format-valeur";
import type { EtudeDonnees, EtudePersonne } from "../../../../_data/etudes-patrimoniales";

const DASH = "—";

/** Montant éditable du patrimoine, lu dans donnees.valeurs (« — » tant qu'absent). */
function Val({
  donnees,
  k,
  format = "euro",
}: {
  donnees: EtudeDonnees;
  k: string;
  format?: ValeurFormat;
}) {
  return <ValeurEditable vKey={k} format={format} initial={donnees.valeurs[k] ?? null} />;
}

function roleRank(role: EtudePersonne["role"]): number {
  return role === "person_a" ? 0 : 1;
}

/** Prénom réel (repli sur le nom), « null » si rien n'est renseigné. */
function shortName(p?: EtudePersonne): string | null {
  if (!p) return null;
  const pre = (p.prenom ?? "").trim();
  if (pre) return pre;
  const nom = (p.nom ?? "").trim();
  return nom || null;
}

// ---------------------------------------------------------------------------
// Icônes (chemins SVG repris de la maquette)
// ---------------------------------------------------------------------------

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M6 9l6 6 6-6" />
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

function FootArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" />
    </svg>
  );
}

// Icônes de pastille (.mx) — bouclier marine + glyphe ivoire.
const Shield = <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />;

function MxScales() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <path
        d="M12 7v9M8 16h8M9.5 8.5L6 12h7M14.5 8.5L18 12h-7"
        stroke="#FAF8F3"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MxDoc() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <path d="M8 7h8M8 11h8M8 15h5" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MxShieldPlus() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <path d="M12 8.6v6.8M8.6 12h6.8" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function MxShieldEuro() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <path
        d="M14.6 9.5a3 3 0 1 0 0 5M8.7 11h4.4M8.7 13h3.7"
        stroke="#FAF8F3"
        strokeWidth={1.3}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MxShieldCoin() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <circle cx="12" cy="12" r="3.9" stroke="#FAF8F3" strokeWidth={1.3} fill="none" />
      <path d="M12 9.7v4.6M10.3 12h3.4" stroke="#FAF8F3" strokeWidth={1.1} strokeLinecap="round" />
    </svg>
  );
}

function MxShieldChart() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <path d="M12 8v8M9 11h6M9 14h4" stroke="#FAF8F3" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MxScalesGlobal() {
  return (
    <svg viewBox="0 0 24 24">
      {Shield}
      <path
        d="M12 7.6v7.8M8.2 15.4h7.6M9.6 9.2l-2.4 3.8h4.8zM14.4 9.2l2.4 3.8h-4.8z"
        stroke="#FAF8F3"
        strokeWidth={1.15}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icônes des en-têtes de module (.pic, doré).
function PicBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  );
}

function PicSci() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M7 8V5h10v3M3 13h18" />
    </svg>
  );
}

function PicPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11a4 4 0 1 0-8 0M4 21c0-3.5 3.6-5.5 8-5.5s8 2 8 5.5" />
    </svg>
  );
}

function PicPulse() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  );
}

// Icônes de sous-accordéon (.sub-ic).
function IcJuridique() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M12 3v18M6 8l-3 5h6zM18 8l3 5h-6zM4 21h16M9 5l6-1.5" />
    </svg>
  );
}

function IcSociale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M16 11a4 4 0 1 0-8 0M3 21c0-3.3 3.6-5.5 9-5.5s9 2.2 9 5.5" />
    </svg>
  );
}

function IcTresorerie() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M3 7h18v10H3zM3 11h18M7 15h2" />
    </svg>
  );
}

function IcFiscale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M5 3h14v18H5zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
    </svg>
  );
}

function IcRemuneration() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M22 12a2 2 0 0 0-2-2h-5a2 2 0 0 0 0 4h5a2 2 0 0 0 2-2z" />
    </svg>
  );
}

function SynthHeadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function SpHeadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M8 8h6M8 12h8M8 16h5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Briques de présentation
// ---------------------------------------------------------------------------

type CertLevel = "c-forte" | "c-moy" | "c-faible";

function Cert({ level, label, certif }: { level: CertLevel; label: string; certif: string }) {
  return (
    <span className={`cert ${level} eng-only`} data-certif={certif}>
      <span>{label}</span>
      <span className="co">
        <EyeIcon />
      </span>
    </span>
  );
}

/** Étiquette de groupe (libellé doré majuscule) d'un sous-accordéon. */
function SocLabel({ children, margin = "15px 0 5px" }: { children: ReactNode; margin?: string }) {
  return (
    <div
      style={{
        color: "#A57608",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: ".6px",
        textTransform: "uppercase",
        margin,
      }}
    >
      {children}
    </div>
  );
}

function KeyNote({ children }: { children: ReactNode }) {
  return (
    <div className="keynote" style={{ marginTop: "12px" }}>
      <span className="ki">
        <KeyIcon />
      </span>
      <p>{children}</p>
    </div>
  );
}

/** En-tête d'un sous-accordéon repliable + corps. */
function SubAcc({
  id,
  icon,
  title,
  cert,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  cert: { level: CertLevel; label: string; certif: string };
  children: ReactNode;
}) {
  return (
    <div className="subacc" id={id}>
      <div className="sub-h">
        <span className="sub-ic">{icon}</span>
        <span className="sub-tt">{title}</span>
        <span style={{ marginLeft: "auto" }}>
          <Cert {...cert} />
        </span>
        <span className="sub-chev">
          <ChevDown />
        </span>
      </div>
      <div className="subbody">{children}</div>
    </div>
  );
}

/** Bloc d'analyse à trois dimensions (.ablock fold), enveloppé d'un <Bloc>. */
function AbBlock({
  blocKey,
  mx,
  title,
  cert,
  constat,
  risque,
  opportunite,
  optimisation,
  impact,
  justification,
  preco,
}: {
  blocKey: string;
  mx: ReactNode;
  title: string;
  cert: { level: CertLevel; label: string; certif: string };
  constat: ReactNode;
  risque: ReactNode;
  opportunite: ReactNode;
  optimisation: ReactNode;
  impact: ReactNode;
  justification: ReactNode;
  preco: ReactNode;
}) {
  return (
    <Bloc blocKey={blocKey} className="ablock fold">
      <div className="ab-h">
        <span className="mx">{mx}</span>
        <span className="tt">{title}</span>
        <Cert {...cert} />
      </div>
      <div className="ab-grid">
        <div className="dim">
          <div className="dh">
            <ConstatIcon /> Constat &amp; origine
          </div>
          <ul className="dlist">{constat}</ul>
        </div>
        <div className="dim">
          <div className="rio">
            <div className="it r">
              <span className="lab">Risque</span>
              {risque}
            </div>
            <div className="it o">
              <span className="lab">Opportunité</span>
              {opportunite}
            </div>
            <div className="it opt">
              <span className="lab">Optimisation</span>
              {optimisation}
            </div>
          </div>
        </div>
      </div>
      <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
        <div className="dim">
          <div className="dh">
            <ImpactIcon /> Impact quantifié
          </div>
          <p>{impact}</p>
        </div>
        <div className="dim">
          <div className="dh">
            <JustifIcon /> Justification
          </div>
          <p>{justification}</p>
        </div>
      </div>
      <div className="ab-foot">
        <FootArrow />
        <span>
          <b>Préconisation :</b> {preco}
        </span>
      </div>
    </Bloc>
  );
}

/** Synthèse rédactionnelle d'un thème (.synthacc). */
function SynthBlock({
  anchorId,
  headTitle,
  certif,
  certLabel,
  paras,
  risques,
  opportunites,
  optimisations,
}: {
  anchorId: string;
  headTitle: string;
  certif: string;
  certLabel: string;
  paras: ReactNode;
  risques: ReactNode;
  opportunites: ReactNode;
  optimisations: ReactNode;
}) {
  return (
    <div className="synthacc">
      <div className="subttl anchor synth-h" id={anchorId}>
        <SynthHeadIcon /> Synthèse du thème
        <svg className="synthchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <div className="synthprose">
        <div className="sp-head">
          <SpHeadIcon /> {headTitle}
        </div>
        <div className="synth-cert sc-green eng-only" data-certif={certif}>
          <span className="sc-ico">
            <EyeIcon />
          </span>
          <span>
            <b>{certLabel}</b> · synthèse fondée sur les constats du thème
          </span>
          <span className="sc-link">Voir le détail</span>
        </div>
        {paras}
        <div className="sp-recap">
          <div className="spr spr-r">
            <div className="spr-h">Principaux risques</div>
            <ul>{risques}</ul>
          </div>
          <div className="spr spr-o">
            <div className="spr-h">Principales opportunités</div>
            <ul>{opportunites}</ul>
          </div>
          <div className="spr spr-opt">
            <div className="spr-h">Principales optimisations</div>
            <ul>{optimisations}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blocs d'analyse (.ablock) — définis une fois, réutilisés dans le module et
// dans le rappel consolidé de la synthèse globale (data-block identiques).
// ---------------------------------------------------------------------------

function AbGouvernance() {
  return (
    <AbBlock
      blocKey="Gouvernance et transmission"
      mx={<MxScales />}
      title="Gouvernance et transmission : une paralysie potentielle de la structure"
      cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "socgouv" }}
      constat={
        <>
          <li>Le capital est détenu à parts égales (50/50).</li>
          <li>
            Les statuts exigent une majorité de plus de 50 % pour les décisions ordinaires (AGO) et de
            66,6 % pour les décisions extraordinaires (AGE).
          </li>
          <li>Les descendants entrent dans la société sans agrément.</li>
          <li>
            Les testaments prévoient un legs au profit du conjoint survivant de 1/4 en pleine propriété
            et 3/4 en usufruit.
          </li>
        </>
      }
      risque={
        <>
          En cas de désaccord entre les deux époux, aucune décision ne peut être validée ; un blocage
          persistant pourrait paralyser le fonctionnement de la société et ouvrir la voie à une
          dissolution judiciaire. Au premier décès, l&apos;application du testament donnerait aux
          enfants la nue-propriété de 37,5 % des parts (3/4 de la moitié du défunt), avec un droit de
          vote en AGE conférant une minorité de blocage automatique.
        </>
      }
      opportunite={
        <>
          Un pacte d&apos;associés, une clause d&apos;agrément et une révision des dispositions
          testamentaires permettent de sécuriser la gouvernance et la transmission.
        </>
      }
      optimisation={
        <>
          Insérer une clause d&apos;agrément, adapter les règles de majorité et de gérance, et réviser
          les legs pour préserver le contrôle du conjoint survivant.
        </>
      }
      impact={
        <>
          Le conjoint survivant ne disposerait que de <strong>62,5 %</strong> des voix (50 %
          d&apos;origine + 12,5 % hérités en pleine propriété), en deçà des deux tiers (66,67 %) requis
          pour modifier les statuts ou céder l&apos;actif.
        </>
      }
      justification="Statuts de la SCI, dispositions testamentaires et répartition du capital."
      preco="mettre en place un pacte d’associés et réviser les dispositions testamentaires (partie « Préconisations »)."
    />
  );
}

function AbCession() {
  return (
    <AbBlock
      blocKey="Modalités de cession des parts sociales"
      mx={<MxDoc />}
      title="Cession des parts sous seing privé : risque de fraude et lourdeur du recouvrement"
      cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "soccess" }}
      constat={
        <>
          <li>
            Les statuts de la SCI prévoient que les parts sociales peuvent être cédées sans recourir
            strictement à un acte notarié.
          </li>
          <li>
            Cette modalité sous seing privé est souvent privilégiée pour sa souplesse apparente lors des
            mouvements de capital.
          </li>
        </>
      }
      risque={
        <>
          L&apos;absence d&apos;acte notarié expose la société à un risque accru de fraude (usurpation
          d&apos;identité d&apos;un cédant ou d&apos;un cessionnaire). L&apos;acte sous seing privé
          n&apos;étant pas un titre exécutoire, tout litige ou défaut de paiement impose
          d&apos;obtenir au préalable un jugement définitif (procédure au fond souvent longue) avant de
          pouvoir agir.
        </>
      }
      opportunite={
        <>
          Le recours à l&apos;acte authentique confère la force exécutoire, permet d&apos;agir en référé
          et facilite la reconnaissance du droit par le juge.
        </>
      }
      optimisation={
        <>
          Prévoir, statutairement ou par pacte, le recours à l&apos;acte notarié pour les cessions de
          parts.
        </>
      }
      impact={
        <>
          Sans force exécutoire, le créancier ne peut diligenter de saisies immédiates sur le patrimoine
          du débiteur défaillant ; l&apos;acte notarié permet au contraire d&apos;obtenir rapidement une
          provision ou l&apos;exécution forcée des engagements.
        </>
      }
      justification="Clauses statutaires relatives à la cession des parts sociales."
      preco="privilégier l’acte authentique pour les cessions de parts (partie « Préconisations »)."
    />
  );
}

function AbProtSocSci() {
  return (
    <AbBlock
      blocKey="Protection sociale — SCI"
      mx={<MxShieldPlus />}
      title="Une protection sociale non portée par la structure"
      cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "scisoc" }}
      constat={
        <>
          <li>La gérance n&apos;est pas rémunérée et la SCI ne supporte aucune charge sociale.</li>
          <li>Aucune couverture santé, prévoyance ou retraite n&apos;est constituée via la société.</li>
        </>
      }
      risque={
        <>
          En cas d&apos;arrêt de travail, d&apos;invalidité ou de décès, la structure n&apos;ouvre aucun
          droit ; la couverture du couple dépend entièrement des contrats personnels et des entreprises
          individuelles.
        </>
      }
      opportunite={
        <>
          La protection est assurée par les entreprises individuelles et des contrats personnels ; un
          audit permet de vérifier l&apos;absence de trou de garantie.
        </>
      }
      optimisation={
        <>
          Vérifier l&apos;adéquation des garanties portées par les entreprises individuelles et compléter
          si nécessaire par une prévoyance dédiée.
        </>
      }
      impact={
        <>
          Exposition du foyer en cas d&apos;aléa non couvert ; la SCI ne constitue pas un outil de
          protection sociale.
        </>
      }
      justification="Statut de la gérance et absence de charges sociales dans la structure."
      preco="auditer et compléter la couverture sociale du couple (partie « Préconisations »)."
    />
  );
}

function ProtectionRetraiteTexts() {
  return {
    constat: (
      <>
        <li>
          La couverture santé et prévoyance relève de la loi Madelin et du régime obligatoire de la
          profession.
        </li>
        <li>
          La retraite repose sur le régime obligatoire de la profession libérale (base, complémentaire,
          et le cas échéant prestation complémentaire de vieillesse), par points.
        </li>
      </>
    ),
    risque: (
      <>
        La forte dépendance au régime obligatoire et l&apos;absence de capitalisation complémentaire
        exposent à une chute du taux de remplacement à la retraite ; les prestations Madelin versées en
        rente seront imposables.
      </>
    ),
    opportunite: (
      <>
        La mise en place d&apos;une épargne retraite et d&apos;une prévoyance complémentaire sécurise le
        niveau de vie futur.
      </>
    ),
    optimisation: <>Constituer une épargne retraite dédiée et compléter les garanties de prévoyance.</>,
    impact: <>Sans capitalisation, baisse significative du niveau de vie au départ à la retraite.</>,
    justification: "Régime de retraite de la profession libérale et fonctionnement par points.",
    preco: "mettre en place une épargne retraite complémentaire (partie « Préconisations »).",
  };
}

function AbEimSoc() {
  const t = ProtectionRetraiteTexts();
  return (
    <AbBlock
      blocKey="Protection sociale et retraite — Monsieur"
      mx={<MxShieldPlus />}
      title="Protection sociale et retraite : une dépendance au régime obligatoire"
      cert={{ level: "c-moy", label: "Confiance modérée · 82 %", certif: "eimsoc" }}
      constat={t.constat}
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={t.impact}
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function AbEifSoc() {
  const t = ProtectionRetraiteTexts();
  return (
    <AbBlock
      blocKey="Protection sociale et retraite — Madame"
      mx={<MxShieldPlus />}
      title="Protection sociale et retraite : une dépendance au régime obligatoire"
      cert={{ level: "c-moy", label: "Confiance modérée · 82 %", certif: "eifsoc" }}
      constat={t.constat}
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={t.impact}
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function PilotageRemTexts(donnees: EtudeDonnees, prefix: string) {
  return {
    constat: (
      <>
        <li>
          Le statut de l&apos;Entreprise Individuelle interdit tout arbitrage entre rémunération et
          dividendes.
        </li>
        <li>La stratégie actuelle privilégie la consommation immédiate de la richesse.</li>
      </>
    ),
    risque: (
      <>
        L&apos;impôt porte sur 100 % du profit, même si une partie était laissée dans l&apos;entreprise
        pour investir ; la capitalisation patrimoniale pérenne est entravée et la dépendance à la
        retraite demeure élevée.
      </>
    ),
    opportunite: (
      <>
        Une structure à l&apos;impôt sur les sociétés ouvrirait l&apos;arbitrage rémunération /
        dividendes et une capitalisation pilotée.
      </>
    ),
    optimisation: (
      <>Piloter la rémunération via une structure à l&apos;IS et orienter l&apos;excédent vers la capitalisation.</>
    ),
    impact: (
      <>
        En l&apos;état, le prélèvement représente{" "}
        <strong>
          <Val donnees={donnees} k={`${prefix}_taux_prelevement`} format="percent" />
        </strong>{" "}
        du bénéfice, sur des revenus déjà lourdement taxés.
      </>
    ),
    justification: "Transparence fiscale du régime de l’Entreprise Individuelle.",
    preco: "étudier une structuration à l’IS pour piloter la rémunération (partie « Préconisations »).",
  };
}

function AbEimRem({ donnees }: { donnees: EtudeDonnees }) {
  const t = PilotageRemTexts(donnees, "eim");
  return (
    <AbBlock
      blocKey="Pilotage de la rémunération — Monsieur"
      mx={<MxShieldEuro />}
      title="Un déséquilibre entre consommation immédiate et capitalisation"
      cert={{ level: "c-moy", label: "Confiance modérée · 82 %", certif: "eimrem" }}
      constat={t.constat}
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={t.impact}
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function AbEifRem({ donnees }: { donnees: EtudeDonnees }) {
  const t = PilotageRemTexts(donnees, "eif");
  return (
    <AbBlock
      blocKey="Pilotage de la rémunération — Madame"
      mx={<MxShieldEuro />}
      title="Un déséquilibre entre consommation immédiate et capitalisation"
      cert={{ level: "c-moy", label: "Confiance modérée · 82 %", certif: "eifrem" }}
      constat={t.constat}
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={t.impact}
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function TresorerieTexts() {
  return {
    constat: (
      <>
        <li>Les liquidités sont laissées intégralement sur le compte courant, sans rémunération.</li>
        <li>Le besoin en fonds de roulement négatif génère une ressource de trésorerie constante.</li>
      </>
    ),
    risque: (
      <>
        La non-rémunération des liquidités face à l&apos;inflation constitue une perte de valeur réelle
        pour le patrimoine du foyer.
      </>
    ),
    opportunite: (
      <>
        Le placement du matelas de sécurité sur un support monétaire liquide couvrirait au moins les
        frais bancaires annuels.
      </>
    ),
    optimisation: (
      <>
        Placer la trésorerie de précaution et, le cas échéant, extraire le surplus vers des supports de
        placement personnels.
      </>
    ),
    justification: "Soldes bancaires professionnels et niveau du fonds de sécurité.",
    preco: "placer la trésorerie de précaution et mobiliser le surplus (partie « Préconisations »).",
  };
}

function AbEimTres() {
  const t = TresorerieTexts();
  return (
    <AbBlock
      blocKey="Trésorerie excédentaire — Monsieur"
      mx={<MxShieldCoin />}
      title="Une trésorerie excédentaire statique et non rémunérée"
      cert={{ level: "c-forte", label: "Confiance forte · 85 %", certif: "eimtres" }}
      constat={t.constat}
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={
        <>
          Le solde correspondant presque exactement au fonds de sécurité, la marge d&apos;extraction est
          limitée ; le gain porte d&apos;abord sur la rémunération du matelas de sécurité.
        </>
      }
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function AbEifTres({ donnees }: { donnees: EtudeDonnees }) {
  const t = TresorerieTexts();
  return (
    <AbBlock
      blocKey="Trésorerie excédentaire — Madame"
      mx={<MxShieldCoin />}
      title="Une trésorerie excédentaire statique et non rémunérée"
      cert={{ level: "c-forte", label: "Confiance forte · 85 %", certif: "eiftres" }}
      constat={t.constat}
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={
        <>
          Le surplus de{" "}
          <strong>
            <Val donnees={donnees} k="eif_surplus_extractible" />
          </strong>
          , déjà fiscalisé, peut être extrait sans frottement vers des supports de placement personnels.
        </>
      }
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function StructFiscRisqueOppOpt() {
  return {
    risque: (
      <>
        L&apos;absence de personnalité morale (contrairement à une SELARL ou une SELAS à l&apos;IS)
        interdit tout arbitrage entre rémunération et dividendes. Chaque euro de bénéfice est lourdement
        ponctionné, qu&apos;il soit consommé ou laissé en trésorerie.
      </>
    ),
    opportunite: (
      <>
        Le passage à une structure à l&apos;IS (SELARL, SELAS) ouvrirait l&apos;arbitrage rémunération /
        dividendes et une capitalisation à taux réduit (IS à 25 %).
      </>
    ),
    optimisation: (
      <>
        Étudier l&apos;apport de l&apos;activité à une société d&apos;exercice à l&apos;IS et
        l&apos;encapsulation de la trésorerie excédentaire.
      </>
    ),
    justification: "Régime fiscal et social de l’Entreprise Individuelle (BNC).",
    preco: "étudier une structuration à l’impôt sur les sociétés (partie « Préconisations »).",
  };
}

function AbEimFisc({ donnees }: { donnees: EtudeDonnees }) {
  const t = StructFiscRisqueOppOpt();
  return (
    <AbBlock
      blocKey="Structuration fiscale (EI au régime BNC) — Monsieur"
      mx={<MxShieldChart />}
      title="Structuration EI au régime BNC : pression fiscale et sociale maximale"
      cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "eimfisc" }}
      constat={
        <>
          <li>Monsieur exerce en Entreprise Individuelle à l&apos;impôt sur le revenu.</li>
          <li>
            L&apos;intégralité du bénéfice net (
            <strong>
              <Val donnees={donnees} k="eim_benefice_net" />
            </strong>{" "}
            en 2024) est soumise au barème progressif de l&apos;impôt sur le revenu (TMI à 41 %) et aux
            cotisations sociales (URSSAF et caisse de retraite de la profession).
          </li>
        </>
      }
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={
        <>
          En l&apos;état, aucune stratégie de capitalisation à taux réduit n&apos;est possible au sein de
          l&apos;outil professionnel ; le prélèvement représente{" "}
          <strong>
            <Val donnees={donnees} k="eim_taux_prelevement" format="percent" />
          </strong>{" "}
          du bénéfice.
        </>
      }
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function AbEifFisc({ donnees }: { donnees: EtudeDonnees }) {
  const t = StructFiscRisqueOppOpt();
  return (
    <AbBlock
      blocKey="Structuration fiscale (EI au régime BNC) — Madame"
      mx={<MxShieldChart />}
      title="Structuration EI au régime BNC : pression fiscale et sociale maximale"
      cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "eiffisc" }}
      constat={
        <>
          <li>Madame exerce en Entreprise Individuelle à l&apos;impôt sur le revenu.</li>
          <li>
            L&apos;intégralité du bénéfice net (
            <strong>
              <Val donnees={donnees} k="eif_benefice_net" />
            </strong>{" "}
            en 2024) est soumise au barème progressif de l&apos;impôt sur le revenu (TMI à 41 % ou 45 %)
            et aux cotisations sociales (URSSAF et caisse de retraite de la profession).
          </li>
        </>
      }
      risque={t.risque}
      opportunite={t.opportunite}
      optimisation={t.optimisation}
      impact={
        <>
          En l&apos;état, aucune stratégie de capitalisation à taux réduit n&apos;est possible au sein de
          l&apos;outil professionnel ; le prélèvement représente{" "}
          <strong>
            <Val donnees={donnees} k="eif_taux_prelevement" format="percent" />
          </strong>{" "}
          du bénéfice.
        </>
      }
      justification={t.justification}
      preco={t.preco}
    />
  );
}

function AbGlobFisc({ donnees }: { donnees: EtudeDonnees }) {
  return (
    <AbBlock
      blocKey="Saturation fiscale des activités libérales"
      mx={<MxShieldEuro />}
      title="Saturation fiscale et sociale des deux activités libérales"
      cert={{ level: "c-forte", label: "Confiance forte · 86 %", certif: "globfisc" }}
      constat={
        <>
          <li>Les deux activités sont exercées en Entreprise Individuelle au régime BNC.</li>
          <li>
            Les bénéfices cumulés (
            <strong>
              <Val donnees={donnees} k="soc_benefices_cumules" />
            </strong>{" "}
            en 2024) supportent l&apos;impôt sur le revenu (TMI 41 %) et les cotisations sociales.
          </li>
        </>
      }
      risque={
        <>
          Aucun arbitrage ni capitalisation à taux réduit n&apos;est possible ; la création de richesse
          est lourdement ponctionnée, qu&apos;elle soit consommée ou épargnée.
        </>
      }
      opportunite={
        <>
          L&apos;encapsulation des activités dans une ou plusieurs structures à l&apos;IS ouvre le
          pilotage et la capitalisation.
        </>
      }
      optimisation={
        <>Créer une ou plusieurs sociétés d&apos;exercice à l&apos;impôt sur les sociétés (SELARL, SELAS).</>
      }
      impact={
        <>
          Prélèvements de{" "}
          <strong>
            <Val donnees={donnees} k="eim_taux_prelevement" format="percent" />
          </strong>{" "}
          (Monsieur) et{" "}
          <strong>
            <Val donnees={donnees} k="eif_taux_prelevement" format="percent" />
          </strong>{" "}
          (Madame) du bénéfice, sans levier de capitalisation à taux réduit.
        </>
      }
      justification="Transparence fiscale du régime BNC."
      preco="étudier la structuration des activités à l’IS (partie « Préconisations »)."
    />
  );
}

function AbGlobJur() {
  return (
    <AbBlock
      blocKey="Fragilité juridique et successorale de la SCI"
      mx={<MxScalesGlobal />}
      title="Fragilité juridique et successorale de la SCI"
      cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "globjur" }}
      constat={
        <>
          <li>La SCI est détenue à parts égales (50/50) par les conjoints.</li>
          <li>
            Les statuts et les testaments confèrent aux enfants une minorité de blocage au premier décès.
          </li>
        </>
      }
      risque={
        <>
          Paralysie potentielle de la gouvernance et perte de contrôle du conjoint survivant ; cession
          des parts sous seing privé exposée à la fraude.
        </>
      }
      opportunite={
        <>
          Un pacte d&apos;associés, une clause d&apos;agrément et la révision des testaments sécurisent la
          structure.
        </>
      }
      optimisation={
        <>
          Réviser les statuts et les dispositions testamentaires, et prévoir l&apos;acte authentique pour
          les cessions.
        </>
      }
      impact={<>Conjoint survivant à 62,5 % des voix, en deçà des deux tiers requis pour décider seul.</>}
      justification="Statuts de la SCI et dispositions testamentaires."
      preco="sécuriser la gouvernance et la transmission de la SCI (partie « Préconisations »)."
    />
  );
}

function AbGlobTres({ donnees }: { donnees: EtudeDonnees }) {
  return (
    <AbBlock
      blocKey="Trésoreries professionnelles dormantes"
      mx={<MxShieldCoin />}
      title="Des trésoreries professionnelles dormantes"
      cert={{ level: "c-forte", label: "Confiance forte · 85 %", certif: "globtres" }}
      constat={
        <>
          <li>Les trésoreries des deux entreprises individuelles sont excédentaires et non rémunérées.</li>
          <li>Une partie a déjà supporté l&apos;impôt sur le revenu.</li>
        </>
      }
      risque={
        <>
          L&apos;érosion monétaire réduit la valeur réelle de ces liquidités laissées sur les comptes
          courants.
        </>
      }
      opportunite={
        <>Le placement et, le cas échéant, l&apos;extraction du surplus améliorent la performance du patrimoine.</>
      }
      optimisation={<>Mobiliser les trésoreries vers des supports de placement adaptés.</>}
      impact={
        <>
          Surplus extractible (
          <strong>
            <Val donnees={donnees} k="eif_surplus_extractible" />
          </strong>{" "}
          chez Madame) et rémunération possible du matelas de sécurité.
        </>
      }
      justification="Soldes bancaires professionnels et niveaux de trésorerie."
      preco="mobiliser et placer les trésoreries excédentaires (partie « Préconisations »)."
    />
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function SocietesSection({ donnees }: { donnees: EtudeDonnees }) {
  const personnes = [...donnees.foyer.personnes].sort((a, b) => roleRank(a.role) - roleRank(b.role));
  const pa = personnes.find((p) => p.role === "person_a");
  const pb = personnes.find((p) => p.role === "person_b");
  const nameRight = shortName(pa) ?? "Monsieur";
  const nameLeft = shortName(pb) ?? "Madame";

  return (
    <>
      {/* INTRODUCTION DE LA SECTION */}
      <div className="immo-mod">
        <div className="page">
          <div className="shead">
            <div className="pic">
              <PicBriefcase />
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Audit patrimonial</div>
              <h1>Analyse des sociétés</h1>
            </div>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Texte d’introduction des sociétés" className="lead">
              Nous effectuons une analyse attentive des sociétés et structures professionnelles du foyer
              en examinant les statuts, les états financiers et les éléments transmis, afin de détecter
              les risques de nature juridique et sociale ainsi que les opportunités financières et
              fiscales.
            </Bloc>
            <Bloc blocKey="Objet et périmètre">
              <p>
                Nous identifions les impacts possibles en cas d&apos;aléas (conflits entre associés,
                invalidité, décès) et prenons en compte les différentes phases du cycle de vie de
                l&apos;entreprise, notamment la cession et la transmission.
              </p>
              <p>
                Nous recensons les structures professionnelles et patrimoniales rattachées au foyer
                (sociétés civiles ou commerciales, entreprises individuelles), puis nous analysons
                chacune selon quatre axes (juridique, social, trésorerie, fiscalité) avant de consolider
                une synthèse d&apos;ensemble. Structures retenues pour ce dossier : {DASH}.
              </p>
            </Bloc>
          </div>
        </div>
      </div>

      {/* MODULE — LA SCI */}
      <div className="immo-mod">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <PicSci />
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des sociétés</div>
              <h1>La SCI</h1>
            </div>
            <Cert level="c-forte" label="Confiance forte · 85 %" certif="sci" />
            <span className="modchev eng-only">
              <ChevDown />
            </span>
          </div>
          <div className="mod-body">
            <SubAcc
              id="jur-sci"
              icon={<IcJuridique />}
              title="Analyse juridique"
              cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "scijur" }}
            >
              <p>
                L&apos;analyse juridique des documents constitutifs (statuts, pacte d&apos;associés,
                conventions internes) permet d&apos;évaluer la gouvernance, la répartition des pouvoirs
                et les mécanismes de protection en cas d&apos;aléas : décès ou invalidité d&apos;un
                associé, conflit, retrait, arrivée d&apos;un investisseur, cession ou transmission. Nous
                identifions la présence ou l&apos;absence de clauses clés (prise de décision, restrictions
                à la cession, sortie et protection, résolution des conflits, sécurisation du capital).
              </p>
              <Bloc blocKey="Structure de la SCI" className="orgwrap">
                <svg
                  viewBox="0 0 480 246"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ maxWidth: "430px", width: "100%", height: "auto" }}
                >
                  <rect x="120" y="12" width="240" height="46" rx="9" fill="#102D50" />
                  <text
                    x="240"
                    y="34"
                    textAnchor="middle"
                    fill="#FAF8F3"
                    fontFamily="var(--font-epilogue), sans-serif"
                    fontSize="15"
                    fontWeight="600"
                  >
                    La SCI
                  </text>
                  <text
                    x="240"
                    y="50"
                    textAnchor="middle"
                    fill="#DDBB6E"
                    fontFamily="var(--font-epilogue), sans-serif"
                    fontSize="10.5"
                    letterSpacing="0.5"
                  >
                    Régime fiscal : {DASH}
                  </text>
                  <line x1="240" y1="58" x2="240" y2="92" stroke="#C68E0E" strokeWidth="2" />
                  <rect x="148" y="92" width="184" height="44" rx="9" fill="#F4ECD9" stroke="#C68E0E" strokeWidth="1.5" />
                  <text
                    x="240"
                    y="113"
                    textAnchor="middle"
                    fill="#102D50"
                    fontFamily="var(--font-epilogue), sans-serif"
                    fontSize="11"
                    letterSpacing="0.4"
                  >
                    Capital social
                  </text>
                  <text
                    x="240"
                    y="128"
                    textAnchor="middle"
                    fill="#102D50"
                    fontFamily="var(--font-cinzel), serif"
                    fontSize="13.5"
                    fontWeight="700"
                  >
                    {DASH}
                  </text>
                  <line x1="240" y1="136" x2="240" y2="158" stroke="#C68E0E" strokeWidth="2" />
                  <line x1="118" y1="158" x2="362" y2="158" stroke="#C68E0E" strokeWidth="2" />
                  <line x1="118" y1="158" x2="118" y2="180" stroke="#C68E0E" strokeWidth="2" />
                  <line x1="362" y1="158" x2="362" y2="180" stroke="#C68E0E" strokeWidth="2" />
                  <rect x="38" y="180" width="160" height="50" rx="9" fill="#EBF1FA" stroke="#A4AEBB" strokeWidth="1" />
                  <text
                    x="118"
                    y="201"
                    textAnchor="middle"
                    fill="#102D50"
                    fontFamily="var(--font-epilogue), sans-serif"
                    fontSize="12.5"
                    fontWeight="600"
                  >
                    {nameLeft}
                  </text>
                  <text
                    x="118"
                    y="218"
                    textAnchor="middle"
                    fill="#A57608"
                    fontFamily="var(--font-cinzel), serif"
                    fontSize="13"
                    fontWeight="700"
                  >
                    50 %
                  </text>
                  <rect x="282" y="180" width="160" height="50" rx="9" fill="#EBF1FA" stroke="#A4AEBB" strokeWidth="1" />
                  <text
                    x="362"
                    y="201"
                    textAnchor="middle"
                    fill="#102D50"
                    fontFamily="var(--font-epilogue), sans-serif"
                    fontSize="12.5"
                    fontWeight="600"
                  >
                    {nameRight}
                  </text>
                  <text
                    x="362"
                    y="218"
                    textAnchor="middle"
                    fill="#A57608"
                    fontFamily="var(--font-cinzel), serif"
                    fontSize="13"
                    fontWeight="700"
                  >
                    50 %
                  </text>
                </svg>
              </Bloc>
              <p>L&apos;analyse des documents constitutifs fait apparaître les risques détaillés ci-dessous.</p>
              <AbGouvernance />
              <AbCession />
            </SubAcc>

            <SubAcc
              id="soc-sci"
              icon={<IcSociale />}
              title="Analyse sociale"
              cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "scisoc" }}
            >
              <SocLabel>Statut du dirigeant</SocLabel>
              <ul className="dlist">
                <li>
                  Madame exerce les fonctions de gérante associée. En l&apos;absence de rémunération
                  constatée au titre de ce mandat, elle ne relève ni du statut des travailleurs
                  non-salariés (TNS), ni de celui des assimilés-salariés pour cette activité.
                </li>
                <li>
                  La structure ne supporte aucune charge sociale ; cette gérance n&apos;ouvre donc aucun
                  droit propre à la protection sociale obligatoire (santé, retraite, prévoyance).
                </li>
              </ul>
              <SocLabel>Protection sociale</SocLabel>
              <ul className="dlist">
                <li>
                  Aucune couverture santé ni garantie d&apos;indemnités journalières n&apos;est portée par
                  la SCI ; la couverture repose exclusivement sur les contrats d&apos;assurance personnelle.
                </li>
                <li>
                  Monsieur et Madame bénéficient d&apos;une prévoyance via leurs entreprises individuelles
                  respectives ; la SCI n&apos;assume pas ces frais.
                </li>
                <li>
                  Des contrats de protection juridique professionnelle peuvent garantir le couple en
                  tant que locataires des locaux professionnels.
                </li>
              </ul>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbProtSocSci />
            </SubAcc>

            <SubAcc
              id="tres-sci"
              icon={<IcTresorerie />}
              title="Optimisation de la trésorerie"
              cert={{ level: "c-faible", label: "À instruire", certif: "scitres" }}
            >
              <p>
                La gestion de la trésorerie influence la solidité financière, la capacité
                d&apos;investissement et la flexibilité de la structure. L&apos;analyse repose sur deux
                axes :
              </p>
              <ul className="dlist">
                <li>La détermination du besoin en fonds de roulement (BFR) et de l&apos;excédent de trésorerie.</li>
                <li>L&apos;analyse de la performance actuelle de la trésorerie.</li>
              </ul>
              <p style={{ color: "var(--navy-300)", fontSize: "12px" }}>
                Analyse à compléter dès réception des comptes de la SCI.
              </p>
            </SubAcc>

            <SubAcc
              id="fisc-sci"
              icon={<IcFiscale />}
              title="Optimisation fiscale"
              cert={{ level: "c-faible", label: "À instruire", certif: "scifisc" }}
            >
              <p>
                L&apos;optimisation fiscale de la structure dépend de sa forme juridique, de son régime et
                des objectifs du foyer. Les leviers étudiés :
              </p>
              <ul className="dlist">
                <li>Régime mère-fille</li>
                <li>Intégration fiscale</li>
                <li>Exonérations et crédits d&apos;impôt</li>
                <li>Dispositifs spécifiques : Dutreil, 150-0 B ter</li>
              </ul>
            </SubAcc>

            <SynthBlock
              anchorId="synthese-theme-sci"
              headTitle="La SCI — lecture stratégique"
              certif="scith"
              certLabel="Confiance forte · 85 %"
              paras={
                <>
                  <p>
                    La SCI est détenue à parts égales (50/50) par les deux conjoints. L&apos;analyse
                    juridique révèle des fragilités de gouvernance et de transmission.
                  </p>
                  <p>
                    Deux risques majeurs ressortent : une paralysie potentielle (capital 50/50 et
                    dispositions testamentaires conférant aux enfants une minorité de blocage au premier
                    décès) et la cession des parts sous seing privé (fraude, recouvrement difficile). La
                    protection sociale n&apos;est pas portée par la structure.
                  </p>
                </>
              }
              risques={
                <>
                  <li>Paralysie de la gouvernance (50/50, blocage successoral).</li>
                  <li>Cession des parts sous seing privé.</li>
                  <li>Absence de protection sociale portée par la SCI.</li>
                </>
              }
              opportunites={
                <>
                  <li>Pacte d&apos;associés et clause d&apos;agrément.</li>
                  <li>Recours à l&apos;acte authentique pour les cessions.</li>
                  <li>Leviers d&apos;optimisation trésorerie et fiscalité.</li>
                </>
              }
              optimisations={
                <>
                  <li>Révision des statuts et des testaments.</li>
                  <li>Sécurisation des cessions de parts.</li>
                  <li>Structuration sociale et fiscale.</li>
                </>
              }
            />
          </div>
        </div>
      </div>

      {/* MODULE — ENTREPRISE INDIVIDUELLE DE MONSIEUR */}
      <div className="immo-mod">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <PicPerson />
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des sociétés</div>
              <h1>Entreprise individuelle de Monsieur</h1>
            </div>
            <Cert level="c-forte" label="Confiance forte · 86 %" certif="eim" />
            <span className="modchev eng-only">
              <ChevDown />
            </span>
          </div>
          <div className="mod-body">
            <SubAcc
              id="soc-eim"
              icon={<IcSociale />}
              title="Analyse sociale"
              cert={{ level: "c-forte", label: "Confiance forte · 88 %", certif: "eimsoc" }}
            >
              <SocLabel>Statut du dirigeant</SocLabel>
              <ul className="dlist">
                <li>
                  Monsieur exerce son activité sous le régime de l&apos;Entreprise Individuelle (EI), en
                  transparence fiscale ; il n&apos;existe aucune séparation juridique entre le patrimoine
                  professionnel et personnel.
                </li>
                <li>
                  Le bénéfice net comptable de{" "}
                  <strong>
                    <Val donnees={donnees} k="eim_benefice_net" />
                  </strong>{" "}
                  en 2024 constitue l&apos;intégralité de la base imposable et sociale.
                </li>
                <li>
                  Les cotisations sociales payées en 2024 s&apos;élèvent à{" "}
                  <strong>
                    <Val donnees={donnees} k="eim_cotisations_sociales" />
                  </strong>
                  , après déduction des aides éventuelles.
                </li>
              </ul>
              <SocLabel>Protection sociale — couverture santé et prévoyance</SocLabel>
              <ul className="dlist">
                <li>
                  Monsieur bénéficie du régime obligatoire de sa profession libérale, avec,
                  le cas échéant, une prise en charge partielle de ses cotisations à hauteur de{" "}
                  <Val donnees={donnees} k="eim_cotisations_prise_en_charge" /> en 2024.
                </li>
                <li>
                  Les contrats mutuelle et prévoyance sont souscrits via la structure professionnelle dans
                  le cadre de la loi Madelin.
                </li>
                <li>
                  Ce choix permet, en tant que travailleur non salarié, de déduire les cotisations
                  d&apos;assurance du bénéfice imposable. En contrepartie, les prestations versées sous
                  forme de rentes (incapacité, invalidité, décès) seront imposables à l&apos;impôt sur le
                  revenu et soumises aux prélèvements sociaux après abattement éventuel.
                </li>
                <li>La couverture prévoit des indemnités journalières en cas d&apos;accident ou de maladie.</li>
                <li>
                  La garantie est « professionnelle » : le taux d&apos;invalidité est apprécié au regard de
                  l&apos;aptitude à exercer la profession déclarée, et non d&apos;une activité
                  quelconque.
                </li>
              </ul>
              <SocLabel>Protection juridique et responsabilité</SocLabel>
              <ul className="dlist">
                <li>RC Pro (responsabilité civile professionnelle).</li>
                <li>Garantie des accidents de la vie pour le dirigeant et sa famille.</li>
              </ul>
              <SocLabel>Régime de retraite</SocLabel>
              <ul className="dlist">
                <li>
                  En tant que professionnel libéral, la retraite repose sur un système par points
                  géré par la caisse de retraite de la profession, qui se décompose en trois étages :
                </li>
                <li>
                  <b>Régime de base (CNAVPL)</b> : acquisition de points proportionnels aux revenus.
                </li>
                <li>
                  <b>Régime complémentaire</b> : spécifique à la profession, alimenté par une
                  cotisation forfaitaire et une cotisation proportionnelle.
                </li>
                <li>
                  <b>Prestation complémentaire de vieillesse (PCV)</b>, le cas échéant : pour les
                  professions conventionnées, avec participation au financement par le régime obligatoire.
                </li>
                <li>L&apos;âge légal de départ est de 64 ans et 1 mois ; le taux plein est fixé à 67 ans.</li>
              </ul>
              <KeyNote>
                En l&apos;état, sans capitalisation privée supplémentaire significative, le taux de
                remplacement au départ à la retraite entraînera une chute du niveau de vie.
              </KeyNote>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbEimSoc />
            </SubAcc>

            <SubAcc
              id="rem-eim"
              icon={<IcRemuneration />}
              title="Optimisation de la rémunération et fiscalité"
              cert={{ level: "c-moy", label: "Confiance modérée · 82 %", certif: "eimrem" }}
            >
              <ul className="dlist">
                <li>
                  <b>Pression sociale et fiscale</b> : contrairement à une structure à l&apos;impôt sur les
                  sociétés (IS), l&apos;intégralité du bénéfice est soumise aux cotisations sociales
                  (URSSAF, caisse de retraite de la profession) et à l&apos;impôt sur le revenu (TMI à 41 %).
                </li>
                <li>
                  <b>Absence de pilotage</b> : le statut EI interdit tout arbitrage entre rémunération et
                  dividendes. L&apos;impôt porte sur 100 % du profit, même si une partie était laissée dans
                  l&apos;entreprise pour investir.
                </li>
                <li>
                  <b>Déséquilibre consommation / capitalisation</b> : la stratégie actuelle est davantage
                  axée sur une consommation immédiate de la richesse que sur une capitalisation
                  patrimoniale pérenne.
                </li>
                <li>
                  <b>Arbitrage retraite</b> : la dépendance au régime obligatoire de la profession demeure élevée ;
                  sans dispositifs de capitalisation complémentaires, les revenus à la retraite risquent
                  d&apos;être insuffisants pour maintenir le niveau de vie.
                </li>
              </ul>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbEimRem donnees={donnees} />
            </SubAcc>

            <SubAcc
              id="tres-eim"
              icon={<IcTresorerie />}
              title="Optimisation de la trésorerie"
              cert={{ level: "c-forte", label: "Confiance forte · 87 %", certif: "eimtres" }}
            >
              <SocLabel>BFR et excédent de trésorerie</SocLabel>
              <ul className="dlist">
                <li>
                  <b>Fonds de sécurité</b> : il serait recommandé de conserver l&apos;équivalent de 3 mois
                  de charges d&apos;exploitation. Avec <Val donnees={donnees} k="eim_charges_annuelles" /> de
                  charges annuelles (soit <Val donnees={donnees} k="eim_charges_mensuelles" />/mois), le
                  fonds de sécurité cible s&apos;établit à{" "}
                  <strong>
                    <Val donnees={donnees} k="eim_fonds_securite_cible" />
                  </strong>
                  .
                </li>
                <li>
                  <b>Besoin en fonds de roulement (BFR)</b> : le BFR est structurellement négatif (
                  <strong>
                    <Val donnees={donnees} k="eim_bfr" />
                  </strong>
                  ). C&apos;est un excellent indicateur : l&apos;entreprise encaisse ses honoraires avant de
                  payer ses charges sociales et ses fournisseurs, générant une ressource de trésorerie
                  constante.
                </li>
                <li>
                  <b>Analyse de l&apos;excédent</b> : le solde du compte professionnel correspond presque
                  exactement au fonds de sécurité. Il n&apos;existe donc pas de trésorerie excédentaire
                  libre pour des investissements longs, la quasi-totalité des bénéfices (
                  <Val donnees={donnees} k="eim_prelevement_annuel" />) étant prélevée chaque année pour les
                  besoins du foyer.
                </li>
              </ul>
              <SocLabel>Performance actuelle de la trésorerie</SocLabel>
              <ul className="dlist">
                <li>
                  <b>Liquidités disponibles</b> :{" "}
                  <strong>
                    <Val donnees={donnees} k="eim_liquidites" />
                  </strong>{" "}
                  (solde du compte professionnel).
                </li>
                <li>Les fonds sont laissés intégralement sur le compte courant, sans rémunération.</li>
                <li>
                  Ces fonds doivent rester disponibles pour la sécurité de l&apos;activité, mais leur
                  non-rémunération face à l&apos;inflation constitue une perte de valeur réelle pour le
                  patrimoine du foyer.
                </li>
                <li>
                  Le placement du matelas de sécurité sur un support monétaire liquide (compte à terme,
                  livret pro) permettrait de générer des intérêts couvrant au minimum les{" "}
                  <Val donnees={donnees} k="eim_frais_bancaires" /> de frais bancaires annuels, transformant
                  un poste de coût en opération blanche.
                </li>
              </ul>
              <KeyNote>
                La trésorerie est suffisante pour assurer la stabilité, mais totalement statique : elle
                joue le rôle de matelas de sécurité sans contribuer à la performance financière globale du
                patrimoine.
              </KeyNote>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbEimTres />
            </SubAcc>

            <SubAcc
              id="fisc-eim"
              icon={<IcFiscale />}
              title="Optimisation fiscale"
              cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "eimfiscS" }}
            >
              <AbEimFisc donnees={donnees} />
            </SubAcc>

            <SynthBlock
              anchorId="synthese-theme-eim"
              headTitle="Entreprise individuelle de Monsieur — lecture stratégique"
              certif="eimth"
              certLabel="Confiance forte · 86 %"
              paras={
                <>
                  <p>
                    L&apos;activité de Monsieur est extrêmement saine, mais elle arrive à un point de
                    saturation fiscale. Le statut d&apos;Entreprise Individuelle ne permet plus de protéger
                    efficacement la création de richesse du foyer.
                  </p>
                  <p>
                    Avec un prélèvement de{" "}
                    <strong>
                      <Val donnees={donnees} k="eim_taux_prelevement" format="percent" />
                    </strong>{" "}
                    du bénéfice, l&apos;outil professionnel n&apos;est plus un levier de capitalisation mais
                    un simple canal de revenus lourdement taxés. Son encapsulation dans une structure à
                    l&apos;IS et le placement de la trésorerie constituent les leviers prioritaires.
                  </p>
                </>
              }
              risques={
                <>
                  <li>Saturation fiscale et sociale (TMI 41 %, cotisations).</li>
                  <li>Dépendance au régime obligatoire pour la retraite.</li>
                  <li>Trésorerie statique non rémunérée.</li>
                </>
              }
              opportunites={
                <>
                  <li>Encapsulation de l&apos;activité dans une structure à l&apos;IS.</li>
                  <li>Placement du matelas de trésorerie.</li>
                  <li>Constitution d&apos;une épargne retraite dédiée.</li>
                </>
              }
              optimisations={
                <>
                  <li>Structuration à l&apos;impôt sur les sociétés.</li>
                  <li>Extraction / placement de la trésorerie excédentaire.</li>
                  <li>Mise en place de dispositifs de capitalisation.</li>
                </>
              }
            />
          </div>
        </div>
      </div>

      {/* MODULE — ENTREPRISE INDIVIDUELLE DE MADAME */}
      <div className="immo-mod">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <PicPerson />
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des sociétés</div>
              <h1>Entreprise individuelle de Madame</h1>
            </div>
            <Cert level="c-forte" label="Confiance forte · 86 %" certif="eif" />
            <span className="modchev eng-only">
              <ChevDown />
            </span>
          </div>
          <div className="mod-body">
            <SubAcc
              id="soc-eif"
              icon={<IcSociale />}
              title="Analyse sociale"
              cert={{ level: "c-forte", label: "Confiance forte · 88 %", certif: "eifsoc" }}
            >
              <SocLabel>Statut du dirigeant</SocLabel>
              <ul className="dlist">
                <li>
                  Madame exerce son activité sous le régime de l&apos;Entreprise Individuelle (EI), en
                  transparence fiscale ; il n&apos;existe aucune séparation juridique entre son patrimoine
                  professionnel et personnel.
                </li>
                <li>
                  Le bénéfice net comptable de{" "}
                  <strong>
                    <Val donnees={donnees} k="eif_benefice_net" />
                  </strong>{" "}
                  en 2024 constitue l&apos;intégralité de la base imposable et sociale.
                </li>
                <li>
                  Les cotisations sociales payées en 2024 s&apos;élèvent à{" "}
                  <strong>
                    <Val donnees={donnees} k="eif_cotisations_sociales" />
                  </strong>
                  , après déduction des aides éventuelles.
                </li>
              </ul>
              <SocLabel>Protection sociale — couverture santé et prévoyance</SocLabel>
              <ul className="dlist">
                <li>
                  Madame bénéficie du régime obligatoire de sa profession libérale, avec,
                  le cas échéant, une prise en charge partielle de ses cotisations à hauteur de{" "}
                  <Val donnees={donnees} k="eif_cotisations_prise_en_charge" /> en 2024.
                </li>
                <li>
                  Les contrats mutuelle et prévoyance sont souscrits via la structure professionnelle dans
                  le cadre de la loi Madelin.
                </li>
                <li>
                  Ce choix permet, en tant que travailleur non salarié, de déduire les cotisations
                  d&apos;assurance du bénéfice imposable. En contrepartie, les prestations versées sous
                  forme de rentes (incapacité, invalidité, décès) seront imposables à l&apos;impôt sur le
                  revenu et soumises aux prélèvements sociaux après abattement éventuel.
                </li>
                <li>La couverture prévoit des indemnités journalières en cas d&apos;accident ou de maladie.</li>
                <li>
                  La garantie est « professionnelle » : le taux d&apos;invalidité est apprécié au regard de
                  l&apos;aptitude à exercer la profession déclarée, et non d&apos;une activité
                  quelconque.
                </li>
              </ul>
              <SocLabel>Protection juridique et responsabilité</SocLabel>
              <ul className="dlist">
                <li>RC Pro (responsabilité civile professionnelle).</li>
                <li>Garantie des accidents de la vie pour le dirigeant et sa famille.</li>
              </ul>
              <SocLabel>Régime de retraite</SocLabel>
              <ul className="dlist">
                <li>
                  En tant que professionnel libéral, la retraite repose sur un système par points
                  géré par la caisse de retraite de la profession, qui se décompose en trois étages :
                </li>
                <li>
                  <b>Régime de base (CNAVPL)</b> : acquisition de points proportionnels aux revenus.
                </li>
                <li>
                  <b>Régime complémentaire</b> : spécifique à la profession, alimenté par une
                  cotisation forfaitaire et une cotisation proportionnelle.
                </li>
                <li>
                  <b>Prestation complémentaire de vieillesse (PCV)</b>, le cas échéant : pour les
                  professions conventionnées, avec participation au financement par le régime obligatoire.
                </li>
                <li>L&apos;âge légal de départ est de 64 ans ; le taux plein est fixé à 67 ans.</li>
              </ul>
              <KeyNote>
                En l&apos;état, sans capitalisation privée supplémentaire significative, le taux de
                remplacement au départ à la retraite entraînera une chute du niveau de vie.
              </KeyNote>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbEifSoc />
            </SubAcc>

            <SubAcc
              id="rem-eif"
              icon={<IcRemuneration />}
              title="Optimisation de la rémunération et fiscalité"
              cert={{ level: "c-moy", label: "Confiance modérée · 82 %", certif: "eifrem" }}
            >
              <ul className="dlist">
                <li>
                  <b>Pression sociale et fiscale</b> : contrairement à une structure à l&apos;impôt sur les
                  sociétés (IS), l&apos;intégralité du bénéfice est soumise aux cotisations sociales
                  (URSSAF, caisse de retraite de la profession) et à l&apos;impôt sur le revenu (TMI à 41 %).
                </li>
                <li>
                  <b>Absence de pilotage</b> : le statut EI interdit tout arbitrage entre rémunération et
                  dividendes. L&apos;impôt porte sur 100 % du profit, même si une partie était laissée dans
                  l&apos;entreprise pour investir.
                </li>
                <li>
                  <b>Déséquilibre consommation / capitalisation</b> : la stratégie actuelle est davantage
                  axée sur une consommation immédiate de la richesse que sur une capitalisation
                  patrimoniale pérenne.
                </li>
                <li>
                  <b>Arbitrage retraite</b> : la dépendance au régime obligatoire de la profession demeure élevée ;
                  sans dispositifs de capitalisation complémentaires, les revenus à la retraite risquent
                  d&apos;être insuffisants pour maintenir le niveau de vie.
                </li>
              </ul>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbEifRem donnees={donnees} />
            </SubAcc>

            <SubAcc
              id="tres-eif"
              icon={<IcTresorerie />}
              title="Optimisation de la trésorerie"
              cert={{ level: "c-forte", label: "Confiance forte · 87 %", certif: "eiftres" }}
            >
              <SocLabel>BFR et excédent de trésorerie</SocLabel>
              <ul className="dlist">
                <li>
                  <b>Fonds de sécurité</b> : il serait recommandé de conserver l&apos;équivalent de 3 mois
                  de charges d&apos;exploitation. Avec <Val donnees={donnees} k="eif_charges_annuelles" /> de
                  charges annuelles (soit <Val donnees={donnees} k="eif_charges_mensuelles" />/mois), le
                  fonds de sécurité cible s&apos;établit à{" "}
                  <strong>
                    <Val donnees={donnees} k="eif_fonds_securite_cible" />
                  </strong>
                  .
                </li>
                <li>
                  <b>Besoin en fonds de roulement (BFR)</b> : le BFR est structurellement négatif (
                  <strong>
                    <Val donnees={donnees} k="eif_bfr" />
                  </strong>
                  ). C&apos;est un excellent indicateur : l&apos;entreprise encaisse ses honoraires avant de
                  payer ses charges sociales et ses fournisseurs, générant une ressource de trésorerie
                  constante.
                </li>
                <li>
                  <b>Analyse de l&apos;excédent</b> : le solde du compte professionnel est supérieur au
                  fonds de sécurité. Ce surplus de{" "}
                  <strong>
                    <Val donnees={donnees} k="eif_surplus_extractible" />
                  </strong>{" "}
                  ne constitue pas une capitalisation au sens comptable (faute de personne morale), mais une
                  épargne personnelle déjà taxée laissée sur le compte professionnel. Ne prélevant que{" "}
                  <Val donnees={donnees} k="eif_taux_prelevement" format="percent" /> de son bénéfice, Madame
                  accumule des liquidités déjà soumises à l&apos;impôt sur le revenu (TMI 41 %) sans support
                  de placement.
                </li>
              </ul>
              <SocLabel>Performance actuelle de la trésorerie</SocLabel>
              <ul className="dlist">
                <li>
                  <b>Liquidités disponibles</b> :{" "}
                  <strong>
                    <Val donnees={donnees} k="eif_liquidites" />
                  </strong>{" "}
                  (comptes professionnels).
                </li>
                <li>Les fonds sont laissés intégralement sur le compte courant, sans rémunération.</li>
                <li>
                  Ces fonds doivent rester disponibles pour la sécurité de l&apos;activité, mais leur
                  non-rémunération face à l&apos;inflation constitue une perte de valeur réelle pour le
                  patrimoine du foyer.
                </li>
                <li>
                  Le placement du matelas de sécurité sur un support monétaire liquide (compte à terme,
                  livret pro) permettrait de générer des intérêts couvrant au minimum les{" "}
                  <Val donnees={donnees} k="eif_frais_bancaires" /> de frais bancaires annuels, transformant
                  un poste de coût en opération blanche.
                </li>
              </ul>
              <KeyNote>
                La trésorerie est largement suffisante pour assurer la stabilité. L&apos;absence de
                distinction fiscale entre compte professionnel et compte personnel signifie que ce surplus
                de <Val donnees={donnees} k="eif_surplus_extractible" /> est de l&apos;argent statique, qui
                pourrait être extrait vers des supports
                d&apos;investissement personnels sans frottement fiscal supplémentaire, l&apos;impôt ayant
                déjà été acquitté.
              </KeyNote>
              <SocLabel>Risques et opportunités</SocLabel>
              <AbEifTres donnees={donnees} />
            </SubAcc>

            <SubAcc
              id="fisc-eif"
              icon={<IcFiscale />}
              title="Optimisation fiscale"
              cert={{ level: "c-moy", label: "Confiance modérée · 80 %", certif: "eiffiscS" }}
            >
              <AbEifFisc donnees={donnees} />
            </SubAcc>

            <SynthBlock
              anchorId="synthese-theme-eif"
              headTitle="Entreprise individuelle de Madame — lecture stratégique"
              certif="eifth"
              certLabel="Confiance forte · 86 %"
              paras={
                <>
                  <p>
                    L&apos;activité de Madame est extrêmement saine, mais elle arrive, elle aussi, à un
                    point de saturation fiscale. Le statut d&apos;Entreprise Individuelle ne permet plus de
                    protéger efficacement la création de richesse du foyer.
                  </p>
                  <p>
                    Bien que Madame soit plus prudente (prélèvement de{" "}
                    <strong>
                      <Val donnees={donnees} k="eif_taux_prelevement" format="percent" />
                    </strong>{" "}
                    du bénéfice contre{" "}
                    <strong>
                      <Val donnees={donnees} k="eim_taux_prelevement" format="percent" />
                    </strong>{" "}
                    pour Monsieur), la transparence fiscale l&apos;oblige à acquitter l&apos;impôt au prix
                    fort (TMI 41 %) sur des revenus qu&apos;elle ne consomme pas. L&apos;outil professionnel
                    est devenu un simple réceptacle d&apos;épargne déjà taxée, qui mériterait d&apos;être
                    encapsulé ou extrait vers des supports de placement.
                  </p>
                </>
              }
              risques={
                <>
                  <li>Saturation fiscale et sociale (TMI 41 %, cotisations).</li>
                  <li>Dépendance au régime obligatoire pour la retraite.</li>
                  <li>Trésorerie statique non rémunérée.</li>
                </>
              }
              opportunites={
                <>
                  <li>Encapsulation de l&apos;activité dans une structure à l&apos;IS.</li>
                  <li>Placement du matelas de trésorerie.</li>
                  <li>Constitution d&apos;une épargne retraite dédiée.</li>
                </>
              }
              optimisations={
                <>
                  <li>Structuration à l&apos;impôt sur les sociétés.</li>
                  <li>Extraction / placement de la trésorerie excédentaire.</li>
                  <li>Mise en place de dispositifs de capitalisation.</li>
                </>
              }
            />
          </div>
        </div>
      </div>

      {/* MODULE — SYNTHÈSE DE L'ENSEMBLE DES SOCIÉTÉS */}
      <div className="immo-mod">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <PicPulse />
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des sociétés</div>
              <h1>Synthèse de l&apos;ensemble des sociétés</h1>
            </div>
            <Cert level="c-forte" label="Confiance forte · 86 %" certif="societesth" />
            <span className="modchev eng-only">
              <ChevDown />
            </span>
          </div>
          <div className="mod-body">
            <SocLabel>Risques et opportunités consolidés</SocLabel>
            <AbGlobFisc donnees={donnees} />
            <AbGlobJur />
            <AbGlobTres donnees={donnees} />

            <SocLabel margin="18px 0 5px">Rappel des risques et opportunités des modules</SocLabel>
            <Bloc blocKey="Rappel consolidé des risques et opportunités" className="lead">
              Pour mémoire, cette section rassemble en un seul endroit l&apos;ensemble des risques et
              opportunités identifiés dans les modules de l&apos;analyse des sociétés.
            </Bloc>
            <AbGouvernance />
            <AbCession />
            <AbProtSocSci />
            <AbEimSoc />
            <AbEimRem donnees={donnees} />
            <AbEimTres />
            <AbEimFisc donnees={donnees} />
            <AbEifSoc />
            <AbEifRem donnees={donnees} />
            <AbEifTres donnees={donnees} />
            <AbEifFisc donnees={donnees} />

            <SynthBlock
              anchorId="synthese-globale-societes"
              headTitle="Ensemble des sociétés — lecture consolidée"
              certif="societesth"
              certLabel="Confiance forte · 86 %"
              paras={
                <>
                  <p>
                    Le foyer s&apos;appuie sur des structures professionnelles et patrimoniales : une{" "}
                    <b>SCI patrimoniale</b> (50/50) et des <b>entreprises individuelles</b> (au régime
                    BNC). La SCI porte un enjeu juridique et successoral ; les entreprises individuelles
                    portent un enjeu de structuration fiscale et de capitalisation.
                  </p>
                  <p>
                    Les deux activités libérales sont saines mais fiscalement saturées : l&apos;intégralité
                    des bénéfices (
                    <strong>
                      <Val donnees={donnees} k="soc_benefices_cumules" />
                    </strong>{" "}
                    cumulés en 2024) supporte l&apos;impôt sur le revenu (TMI 41 %) et les cotisations
                    sociales, sans possibilité d&apos;arbitrage ni de capitalisation à taux réduit. Les
                    trésoreries professionnelles, structurellement excédentaires, restent statiques et non
                    rémunérées.
                  </p>
                  <p>
                    L&apos;enjeu central est la <b>transformation des outils professionnels</b> :
                    encapsulation des activités dans une ou plusieurs structures à l&apos;IS pour piloter la
                    rémunération et capitaliser, sécurisation juridique de la SCI, et mobilisation des
                    trésoreries dormantes. Ces leviers sont développés dans le volet préconisations.
                  </p>
                </>
              }
              risques={
                <>
                  <li>Saturation fiscale et sociale des deux EI (TMI 41 %).</li>
                  <li>Fragilité juridique et successorale de la SCI.</li>
                  <li>Trésoreries professionnelles dormantes et non rémunérées.</li>
                </>
              }
              opportunites={
                <>
                  <li>Encapsulation des activités dans des structures à l&apos;IS.</li>
                  <li>Sécurisation de la gouvernance de la SCI.</li>
                  <li>Mobilisation et placement des trésoreries excédentaires.</li>
                </>
              }
              optimisations={
                <>
                  <li>Création d&apos;une ou plusieurs sociétés d&apos;exercice à l&apos;IS.</li>
                  <li>Révision des statuts et des testaments de la SCI.</li>
                  <li>Stratégie de capitalisation et d&apos;épargne retraite.</li>
                </>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
