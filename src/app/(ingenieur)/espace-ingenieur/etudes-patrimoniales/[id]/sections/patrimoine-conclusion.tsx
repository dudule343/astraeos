/**
 * Sous-section « Synthèse de l'analyse du patrimoine » (id « patrimoine-conclusion »,
 * maquette lignes 2968-3269).
 *
 * Portage fidèle de la maquette : sous-blocs stratégiques (assurance-vie levier
 * de transmission, patrimoine professionnel, transmission), rappel consolidé des
 * risques et opportunités des modules, puis synthèse du thème. Mêmes libellés,
 * mêmes classes, mêmes SVG, mêmes clés data-block (byte-exactes).
 *
 * Données : EtudeDonnees. Ce qui existe au réel est branché — régime matrimonial
 * et nombre d'enfants (foyer). Les MONTANTS du patrimoine (valorisations,
 * répartition, passif, ratios) n'existent pas en base : ils sont lus dans
 * `donnees.valeurs` (null par défaut) et rendus en état vide honnête « — ». Les
 * chiffres-exemple de la maquette ne sont JAMAIS recopiés comme s'ils étaient
 * réels ; seuls les constantes légales et méthodologiques (seuils, abattements,
 * normes de place) sont conservées telles quelles. Marque rebrandée
 * ASTRAEOS (ex-PRIVEOS).
 *
 * Server Component : markup statique. Les comportements JS (accordéons, ouverture
 * des panneaux de confiance) sont raccrochés ensuite par le câblage central via
 * les classes exactes (.ablock, .ab-h, .synthacc…).
 */

import "../../../../_styles/sections/patrimoine-conclusion.css";

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import { MARITAL_REGIME_LABELS } from "../../../../_data/fiche-client";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

const DASH = "—";

type Valeur = string | number | null | undefined;

/** Montant éditable : valeur réelle formatée, sinon « — » honnête. */
function eur(v: Valeur): string {
  if (v == null || v === "") return DASH;
  if (typeof v === "number") {
    return `${new Intl.NumberFormat("fr-FR").format(v)} €`;
  }
  return v;
}

const MOTS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];

/** « deux enfants » dérivé du foyer, sinon état vide honnête. */
function enfantsLabel(donnees: EtudeDonnees): string {
  const n = donnees.foyer.nbChildren;
  if (n == null) return `${DASH} enfant`;
  const mot = n >= 0 && n <= 10 ? MOTS[n] : String(n);
  return `${mot} enfant${n > 1 ? "s" : ""}`;
}

/** Libellé du régime matrimonial réel, sinon null. */
function regimeLabel(donnees: EtudeDonnees): string | null {
  const r = donnees.foyer.maritalRegime;
  if (!r) return null;
  return MARITAL_REGIME_LABELS[r] ?? r;
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

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 15l5-4 4 3 7-7" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function GavelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3v18M5 21h14M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 4a1 1 0 0 1 1-1h13v18H6a1 1 0 0 1-1-1z" />
      <path d="M9 3v18" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4M7 21h10a2 2 0 0 0 2-2V8l-5-5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function ProcIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function JurisIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3v18M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
    </svg>
  );
}

function AValiderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3" />
      <path d="M12 8.5v4M12 16h.01" />
    </svg>
  );
}

function ShieldCheckOutline() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Fragments d'affichage réutilisables
// ---------------------------------------------------------------------------

type CertLevel = "forte" | "moy";

function CertBadge({ level, label }: { level: CertLevel; label: string }) {
  return (
    <span className={`cert c-${level} eng-only`}>
      <span>{label}</span>
      <span className="co">
        <EyeIcon />
      </span>
    </span>
  );
}

function AbHead({
  mx,
  title,
  level,
  label,
}: {
  mx: ReactNode;
  title: ReactNode;
  level: CertLevel;
  label: string;
}) {
  return (
    <div className="ab-h">
      <span className="mx">{mx}</span>
      <span className="tt">{title}</span>
      <CertBadge level={level} label={label} />
    </div>
  );
}

function DimConstat({ children }: { children: ReactNode }) {
  return (
    <div className="dim">
      <div className="dh">
        <InfoIcon /> Constat &amp; origine
      </div>
      {children}
    </div>
  );
}

function Rio({
  risque,
  opportunite,
  optimisation,
}: {
  risque: ReactNode;
  opportunite: ReactNode;
  optimisation: ReactNode;
}) {
  return (
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
  );
}

function DimImpact({ children }: { children: ReactNode }) {
  return (
    <div className="dim">
      <div className="dh">
        <ChartIcon /> Impact quantifié
      </div>
      {children}
    </div>
  );
}

function DimJustif({
  fn,
  sources,
  children,
}: {
  fn?: string;
  sources?: string;
  children: ReactNode;
}) {
  return (
    <div className="dim">
      <div className="dh">
        <CheckCircleIcon /> Justification
        {fn ? <span className="fn client-only">{fn}</span> : null}
      </div>
      <p>
        {children}
        {sources ? (
          <>
            {" "}
            <span className="eye eng-only">
              <EyeIcon /> {sources}
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}

function AbGrid2({ children }: { children: ReactNode }) {
  return (
    <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
      {children}
    </div>
  );
}

function AbFoot({ children }: { children: ReactNode }) {
  return (
    <div className="ab-foot">
      <ArrowIcon />
      <span>{children}</span>
    </div>
  );
}

function Fond({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fond">
      <div className="fl">
        <GavelIcon /> {title}
      </div>
      <div className="chips">{children}</div>
    </div>
  );
}

function LawChip({
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

// ---------------------------------------------------------------------------
// Icônes propres à chaque module (mx — uniques, reproduites telles quelles)
// ---------------------------------------------------------------------------

const MxAssuranceVie = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
    <path d="M12 7.5c-1.2-1.6-4-1.2-4 1 0 1.8 4 4 4 4s4-2.2 4-4c0-2.2-2.8-2.6-4-1z" fill="#FAF8F3" />
  </svg>
);

const MxProfessionnel = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
    <path d="M8 9h8v7H8zM10 9V7.5h4V9" stroke="#FAF8F3" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
  </svg>
);

const MxTransmission = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
    <path d="M12 8v8M8.5 11.5L12 8l3.5 3.5" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MxRefi = (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#102D50" />
    <path d="M7.5 10.2a4.6 4.6 0 0 1 8-1.6" fill="none" stroke="#FAF8F3" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M16.5 13.8a4.6 4.6 0 0 1-8 1.6" fill="none" stroke="#FAF8F3" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M15.8 5.6l.4 3.3-3.3.4" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.2 18.4l-.4-3.3 3.3-.4" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MxCrl = (
  <svg viewBox="0 0 24 24">
    <rect x="4.5" y="3" width="15" height="18" rx="2" fill="#102D50" />
    <path d="M9 9l6 6" stroke="#FAF8F3" strokeWidth={1.7} strokeLinecap="round" />
    <circle cx="9.6" cy="9.4" r="1.15" fill="#FAF8F3" />
    <circle cx="14.4" cy="14.6" r="1.15" fill="#FAF8F3" />
  </svg>
);

const MxDpe = (
  <svg viewBox="0 0 24 24">
    <rect x="3.5" y="3" width="17" height="18" rx="2.5" fill="#102D50" />
    <path d="M6.8 7.5h6.5M6.8 11h8.4M6.8 14.5h4.5" stroke="#FAF8F3" strokeWidth={1.7} strokeLinecap="round" />
    <path d="M15 13l3.2-5v3.4h1.8l-3.2 5v-3.4z" fill="#C68E0E" />
  </svg>
);

const MxCharges = (
  <svg viewBox="0 0 24 24">
    <path d="M6 2.6h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" fill="#102D50" />
    <path d="M9 7.5h6M9 11h6M9 14.5h4" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);

const MxLmnp = (
  <svg viewBox="0 0 24 24">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill="#102D50" />
    <path d="M14.4 11.7a3 3 0 1 0 0 4.6M9.2 13.1h4.6M9.2 14.9h4.6" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </svg>
);

const MxShieldCheck = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
    <path d="M8.5 12l2.3 2.3 4.4-4.8" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MxBanques = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5 2.8 7.5h18.4z" fill="#102D50" />
    <rect x="4.2" y="9" width="2.5" height="7.5" fill="#102D50" />
    <rect x="10.75" y="9" width="2.5" height="7.5" fill="#102D50" />
    <rect x="17.3" y="9" width="2.5" height="7.5" fill="#102D50" />
    <rect x="2.8" y="18" width="18.4" height="2.2" rx="1" fill="#102D50" />
  </svg>
);

const MxLiquidites = (
  <svg viewBox="0 0 24 24">
    <path d="M7 15h10a3.3 3.3 0 0 0 .5-6.56A4.8 4.8 0 0 0 8 6.4 3.8 3.8 0 0 0 7 15z" fill="#102D50" />
    <g stroke="#102D50" strokeWidth={2} strokeLinecap="round">
      <line x1="9" y1="17.5" x2="8" y2="20.5" />
      <line x1="13" y1="17.5" x2="12" y2="20.5" />
      <line x1="17" y1="17.5" x2="16" y2="20.5" />
    </g>
  </svg>
);

const MxHorloge = (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="13" r="8" fill="#102D50" />
    <path d="M12 9v4l3 2" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3h6" stroke="#102D50" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const MxCaution = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
    <path d="M12 8v4.5M12 16h.01" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function PatrimoineConclusion({ donnees }: { donnees: EtudeDonnees }) {
  const v = donnees.valeurs;
  const regime = regimeLabel(donnees);
  const enfants = enfantsLabel(donnees);

  const RegimeFragment = regime ? (
    <>
      le régime de la <b>{regime}</b>
    </>
  ) : (
    <>
      un régime matrimonial <b>{DASH}</b>
    </>
  );

  return (
    <div className="immo-mod">
      <div className="subttl anchor" id="risk-patrimoine">
        <ShieldCheckOutline /> Risques &amp; opportunités
      </div>

      {/* ANALYSE AVANCÉE : assurance-vie */}
      <Bloc blocKey="Assurance-vie au cœur du patrimoine" className="ablock fold">
        <AbHead
          mx={MxAssuranceVie}
          title="Une assurance-vie au cœur du patrimoine, levier de transmission"
          level="moy"
          label="Confiance modérée · 80 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                L’assurance-vie représente <strong>{eur(v.assurance_vie)}</strong>, premier actif du
                foyer (environ <strong>{DASH}</strong> % du patrimoine brut).
              </li>
              <li>Elle concentre une part importante de l’épargne financière disponible.</li>
            </ul>
          </DimConstat>
          <Rio
            risque="Une concentration sur un même cadre expose à l’évolution de sa fiscalité et à la performance de ses supports ; des clauses bénéficiaires non actualisées peuvent contrarier la volonté de transmission."
            opportunite="L’assurance-vie demeure un outil de transmission très efficace : clause bénéficiaire sur mesure et fiscalité avantageuse hors succession, dans les limites légales."
            optimisation="Actualiser les clauses bénéficiaires, arbitrer entre fonds en euros et unités de compte selon l’horizon, et répartir les capitaux entre plusieurs contrats."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Bien calibrée, l’assurance-vie permet de transmettre une part importante des{" "}
              <strong>{eur(v.assurance_vie)}</strong> dans un cadre fiscal optimisé.
            </p>
          </DimImpact>
          <DimJustif>Relevés des contrats d’assurance-vie et clauses bénéficiaires.</DimJustif>
        </AbGrid2>
        <AbFoot>
          <b>Préconisation :</b> auditer les clauses bénéficiaires et l’allocation des contrats
          (parties « Successoral » et « Préconisations »).
        </AbFoot>
      </Bloc>

      {/* ANALYSE AVANCÉE : professionnel */}
      <Bloc blocKey="Patrimoine professionnel à sécuriser" className="ablock fold">
        <AbHead
          mx={MxProfessionnel}
          title="Un patrimoine professionnel significatif, à sécuriser et rendre liquide"
          level="moy"
          label="Confiance modérée · 78 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Le patrimoine professionnel s’élève à <strong>{eur(v.actifs_professionnels)}</strong>,
                deuxième poste du patrimoine (<strong>{DASH}</strong> %).
              </li>
              <li>Il est étroitement lié à l’activité libérale et peu liquide.</li>
            </ul>
          </DimConstat>
          <Rio
            risque="La valeur de l’outil professionnel dépend de la poursuite de l’activité ; sa transmission ou sa cession, non anticipée, peut être lourdement fiscalisée."
            opportunite="Une structuration adaptée (société d’exercice, holding) et l’anticipation de la cession permettent de sécuriser et de valoriser cet actif."
            optimisation="Étudier la détention via une structure dédiée et préparer la transmission (pacte Dutreil le cas échéant)."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Les <strong>{eur(v.actifs_professionnels)}</strong> de patrimoine professionnel gagnent
              en sécurité et en liquidité par une structuration anticipée.
            </p>
          </DimImpact>
          <DimJustif>Bilans des activités libérales et structure de détention.</DimJustif>
        </AbGrid2>
        <AbFoot>
          <b>Préconisation :</b> étudier la structuration et la transmission de l’outil professionnel
          (parties « Sociétés » et « Préconisations »).
        </AbFoot>
      </Bloc>

      {/* ANALYSE AVANCÉE : transmission */}
      <Bloc blocKey="Transmission du patrimoine" className="ablock fold">
        <AbHead
          mx={MxTransmission}
          title="Un patrimoine conséquent appelant une stratégie de transmission"
          level="moy"
          label="Confiance modérée · 82 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Le patrimoine net atteint <strong>{eur(v.patrimoine_net)}</strong>, détenu sous{" "}
                {RegimeFragment}, avec {enfants}.
              </li>
              <li>La détention combine indivision, SCI et biens propres.</li>
            </ul>
          </DimConstat>
          <Rio
            risque="Sans anticipation, la transmission sera soumise à une fiscalité successorale potentiellement lourde ; la complexité de la détention peut compliquer le partage."
            opportunite="De nombreux leviers existent (donation-partage, démembrement de propriété, donation de parts de SCI, assurance-vie) pour organiser et alléger la transmission."
            optimisation="Mettre en place une stratégie de transmission progressive, en exploitant les abattements et le démembrement."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Une anticipation structurée peut réduire significativement la fiscalité de transmission
              des <strong>{eur(v.patrimoine_net)}</strong> de patrimoine net.
            </p>
          </DimImpact>
          <DimJustif>
            Composition et structure de détention du patrimoine, régime matrimonial.
          </DimJustif>
        </AbGrid2>
        <AbFoot>
          <b>Préconisation :</b> bâtir une stratégie de transmission sur mesure (parties
          « Successoral » et « Préconisations »).
        </AbFoot>
      </Bloc>

      {/* SYNTHÈSE DU THÈME — rappel consolidé des modules */}
      <div className="recap-kicker">Rappel des risques et opportunités des modules</div>
      <Bloc blocKey="Rappel consolidé des risques et opportunités" className="lead">
        Pour mémoire, cette section rassemble en un seul endroit l’ensemble des risques et
        opportunités identifiés dans les modules de l’analyse du patrimoine.
      </Bloc>

      <Bloc blocKey="Potentiel de refinancement" className="ablock fold">
        <AbHead
          mx={MxRefi}
          title="Potentiel de refinancement"
          level="forte"
          label="Confiance forte · 95 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                La résidence principale et les parkings (<strong>{eur(v.residence_principale)}</strong>)
                sont libres de toute hypothèque ; le capital restant dû total s&rsquo;élève à{" "}
                <strong>{eur(v.credit_capital_restant)}</strong> sur les deux appartements.
              </li>
              <li>Le service annuel de la dette reste modéré au regard de la valeur du parc.</li>
              <li>
                La valeur nette immobilisée demeure importante — une capacité de levier bancaire{" "}
                <strong>partiellement exploitée</strong>, encore largement disponible.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque="Une valeur « inerte » : un capital immobilisé qui ne travaille pas et ne génère pas de nouveaux revenus."
            opportunite={
              <>
                Utiliser ces biens en garantie (hypothèque de second rang, crédit lombard) pour
                financer de nouveaux investissements <strong>sans apport personnel</strong>.
              </>
            }
            optimisation="Mobiliser une quotité prudente de la valeur du parc pour amorcer une nouvelle phase de diversification, immobilière ou financière."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              À une quotité prudente de 60 à 70 %, et après déduction du capital restant dû (
              {eur(v.credit_capital_restant)}), la capacité de refinancement mobilisable s&rsquo;élève à{" "}
              <strong>{DASH}</strong>, déployables sans céder le moindre actif (voir module ci-dessous).
            </p>
          </DimImpact>
          <DimJustif fn="¹" sources="2 sources">
            Valeurs de marché de l’inventaire ; capital restant dû des financements en cours.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Hypothèque conventionnelle — <b>Code civil, art. 2385 et s.</b>
          </LawChip>
          <LawChip icon={<DocIcon />} kind="Pratique bancaire">
            Quotité de financement (60 à 70 %)
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Optimisation chiffrée :</b> capacité de refinancement (ci-dessous) ·{" "}
          <b>Préconisation :</b> crédit hypothécaire sur la résidence principale.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Contribution sur les revenus locatifs" className="ablock fold">
        <AbHead
          mx={MxCrl}
          title="Contribution sur les revenus locatifs"
          level="forte"
          label="Confiance forte · 87 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Une <strong>Contribution sur les revenus locatifs</strong> est acquittée pour deux
                appartements (<strong>{DASH}</strong> et <strong>{DASH}</strong>).
              </li>
              <li>
                Cette contribution vise principalement les revenus perçus par des personnes morales
                soumises à l’impôt sur les sociétés.
              </li>
              <li>
                Or ces biens sont détenus par des <strong>personnes physiques</strong> —
                l’assujettissement ne paraît pas juridiquement fondé.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque="Une charge indue, modérée à l’unité mais récurrente, qui pèse sur la rentabilité nette des biens concernés."
            opportunite="Engager une démarche de régularisation pour solliciter le remboursement des sommes versées sur les exercices non prescrits."
            optimisation="Cesser le règlement et récupérer les montants des trois dernières années auprès de l’administration fiscale."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Économie pérenne de <strong>≈ {DASH}/an</strong>, et remboursement potentiel d’environ{" "}
              <strong>{DASH}</strong> au titre des trois derniers exercices.
            </p>
          </DimImpact>
          <DimJustif fn="²" sources="2 sources">
            Avis d’imposition et comptes locatifs ; régime juridique de la contribution.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            <b>CGI, art. 234 nonies à 234 quindecies</b>
          </LawChip>
          <LawChip icon={<DocIcon />} kind="Doctrine">
            <b>BOI-RFPI-CTRL-20</b>
          </LawChip>
          <LawChip icon={<ProcIcon />} kind="Procédure">
            Réclamation — <b>LPF, art. L.190 et R.196-1</b>
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> régularisation auprès de l’administration fiscale et demande de
          remboursement.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Diagnostic de performance énergétique" className="ablock fold">
        <AbHead
          mx={MxDpe}
          title="Absence de diagnostic de performance énergétique"
          level="forte"
          label="Confiance forte · 89 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Plusieurs actifs ne disposent d’aucun{" "}
                <strong>diagnostic de performance énergétique</strong> en cours de validité.
              </li>
              <li>
                La réglementation impose un diagnostic opposable pour toute mise en location,
                renouvellement de bail ou vente.
              </li>
              <li>
                L’absence de classification empêche de mesurer l’exposition aux futures interdictions
                de louer.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque="Nullité possible du bail ou de la vente, amende administrative (jusqu’à 3 000 € pour une personne physique, 15 000 € pour une SCI), loyer gelé si le bien est classé F ou G."
            opportunite="Anticiper les diagnostics permet de sécuriser les baux, de fiabiliser les valeurs et d’identifier d’éventuels travaux d’amélioration."
            optimisation="Réaliser les diagnostics manquants avant toute relocation ou cession, et budgéter les éventuels travaux de rénovation énergétique."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Risque réglementaire et de dépréciation : un classement défavorable contraindrait à des
              travaux non budgétés et gèlerait les loyers, pesant sur le rendement et la valeur vénale.
            </p>
          </DimImpact>
          <DimJustif fn="³" sources="2 sources">
            Dossier locatif ; réglementation sur la décence énergétique.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            <b>CCH, art. L.126-26 et s.</b> — loi Climat et Résilience
          </LawChip>
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Gel des loyers (classes F et G)
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> réalisation des diagnostics de performance énergétique sur les biens
          concernés.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Niveau des charges locatives" className="ablock fold">
        <AbHead
          mx={MxCharges}
          title="Niveau des charges locatives — vigilance et optimisation"
          level="forte"
          label="Confiance forte · 86 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Sur l’appartement meublé détenu en nom propre, les charges représentent{" "}
                <strong>{DASH}</strong>, soit ≈ <strong>{DASH} %</strong> du chiffre d’affaires — un
                poste à surveiller.
              </li>
              <li>
                Sur les studios détenus en <strong>SCI</strong>, ce ratio atteint près de{" "}
                <strong>{DASH} %</strong> (honoraires comptables, copropriété, assurances, frais
                d’agence) — analysé dans le thème « Sociétés ».
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque="L’empilement de frais fixes capte près de la moitié des loyers avant même l’imposition des associés, ralentissant la performance."
            opportunite="Renégocier les postes les plus lourds (honoraires, agence) et rationaliser les protections assurantielles."
            optimisation="Revue ligne à ligne des charges pour rehausser le rendement net sans toucher au capital."
          />
        </div>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Charges déductibles — <b>CGI, art. 39 ; BOI-BIC-CHAMP-40-20</b>
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> audit et renégociation des charges d’exploitation locatives.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Régime de la location meublée non professionnelle" className="ablock fold">
        <AbHead
          mx={MxLmnp}
          title="Régime de la location meublée non professionnelle (LMNP)"
          level="forte"
          label="Confiance forte · 90 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                L’appartement meublé est exploité en location meublée non professionnelle : les
                recettes (<strong>{DASH}</strong>) restent inférieures à 23 000 € et aux autres
                revenus du foyer.
              </li>
              <li>
                Ce régime relève des bénéfices industriels et commerciaux, au régime réel, avec
                amortissement du bien et du mobilier.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque={
              <>
                À la cession, les amortissements pratiqués sont désormais{" "}
                <strong>réintégrés dans la plus-value</strong> (réforme 2025), ce qui alourdit
                l’imposition. Un franchissement durable des seuils ferait{" "}
                <strong>basculer le bien en LMP</strong> — changement de régime de plus-value et
                affiliation sociale.
              </>
            }
            opportunite={
              <>
                L’amortissement du bien et du mobilier, au régime réel,{" "}
                <strong>neutralise tout ou partie de l’imposition des loyers</strong> pendant la phase
                de détention ; les déficits s’imputent et se reportent.
              </>
            }
            optimisation="Arbitrer la durée de détention au regard de la réforme, et piloter le niveau des recettes pour conserver, le cas échéant, le statut non professionnel."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Loyers de <b>{DASH}</b> par an largement neutralisés par l’amortissement pendant la
              détention ; en contrepartie, plus-value brute portée à <b>{DASH}</b> à la cession après
              réintégration des amortissements (voir le coût d’opportunité immobilier).
            </p>
          </DimImpact>
          <DimJustif fn="⁶" sources="sources">
            Régime des bénéfices industriels et commerciaux, seuils du statut et réforme de la
            plus-value.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Seuils LMNP / LMP — <b>CGI, art. 155, IV</b>
          </LawChip>
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Régime réel BIC — <b>BOI-BIC-CHAMP-40-20</b>
          </LawChip>
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Réintégration des amortissements — <b>CGI, art. 150 VB III</b>
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> arbitrer la stratégie de détention (LMNP / LMP) au regard de la
          réforme de 2025 et de la trajectoire des recettes.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Assurance emprunteur — remboursement et fiscalité" className="ablock fold">
        <AbHead
          mx={MxShieldCheck}
          title="Assurance emprunteur (décès / perte totale et irréversible d’autonomie) — remboursement du prêt et fiscalité"
          level="moy"
          label="Confiance modérée · 78 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Pour les biens financés par emprunt — détenus via la SCI, ou en location meublée non
                professionnelle (LMNP) et professionnelle (LMP) — une assurance emprunteur garantit le
                remboursement du prêt en cas de décès ou de perte totale et irréversible d’autonomie
                d’un assuré.
              </li>
              <li>
                Le remboursement anticipé par l’assureur a un effet fiscal qui dépend du{" "}
                <strong>régime de la structure</strong>.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque={
              <>
                En SCI à l’impôt sur les sociétés, le capital remboursé par l’assurance constitue un{" "}
                <strong>produit exceptionnel imposable</strong> (accroissement de l’actif net) — une
                charge fiscale parfois inattendue.{" "}
                <strong>Le même mécanisme s’applique en location meublée au régime réel</strong> (LMNP
                ou LMP).
              </>
            }
            opportunite={
              <>
                Anticiper le traitement et, le cas échéant, opter pour l’<strong>étalement</strong> du
                produit sur cinq exercices ; choisir le régime (impôt sur le revenu ou sur les
                sociétés) en connaissance de cause.
              </>
            }
            optimisation="Calibrer les têtes assurées et les quotités d’assurance, et documenter le régime applicable, pour maîtriser l’impact fiscal de la garantie."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              <b>SCI à l’impôt sur les sociétés :</b> produit = capital restant dû remboursé (à titre
              d’illustration, ≈ <b>{DASH}</b> sur le local financé), imposé à l’impôt sur les sociétés,{" "}
              <b>étalable sur 5 ans</b>. <b>SCI à l’impôt sur le revenu :</b> l’indemnité constitue des{" "}
              <b>recettes foncières</b> dès lors que les intérêts ont été déduits.{" "}
              <b>Location meublée au réel (LMNP ou LMP) :</b> le capital remboursé constitue un{" "}
              <b>produit imposable au titre des bénéfices industriels et commerciaux</b>, étalable sur
              cinq exercices.
            </p>
          </DimImpact>
          <DimJustif fn="⁴" sources="sources">
            Qualification de l’indemnité d’assurance selon le régime de la structure.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<JurisIcon />} kind="Jurisprudence">
            <b>Conseil d’État, 6 août 2008, n°301336</b>
          </LawChip>
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Produit exceptionnel, étalement — <b>CGI, art. 38 et 38 quater</b>
          </LawChip>
          <LawChip icon={<DocIcon />} kind="Doctrine">
            Société à l’IR : recettes foncières — <b>BOI-RFPI-BASE-20-80</b>
          </LawChip>
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Location meublée au réel (BIC) — <b>CGI, art. 38 et 38 quater</b>
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> cadrer le régime fiscal de l’assurance emprunteur et la stratégie
          d’étalement, pour la SCI comme pour la location meublée (analyse détaillée dans le thème
          « Sociétés »).
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Multiplicité des banques — déchéance du terme" className="ablock fold">
        <AbHead
          mx={MxBanques}
          title="Multiplicité des banques — risque de déchéance du terme"
          level="moy"
          label="Confiance modérée · 75 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Plusieurs établissements financent ou pourraient financer les différents actifs du
                foyer et de ses structures.
              </li>
              <li>
                Chaque prêt comporte des <strong>obligations déclaratives</strong> sur les engagements
                existants auprès des autres prêteurs.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque={
              <>
                L’omission ou l’inexactitude d’une déclaration d’engagement peut caractériser une
                fausse déclaration et entraîner la <strong>déchéance du terme</strong> — exigibilité
                immédiate du capital restant dû.
              </>
            }
            opportunite="Cartographier l’ensemble des engagements et fiabiliser les déclarations sécurise les financements et la relation bancaire."
            optimisation="Tenir un tableau de bord des prêts (établissement, encours, sûretés, clauses) et respecter scrupuleusement les obligations d’information."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Exigibilité anticipée des prêts concernés, dégradation de la relation bancaire et
              surcoût de refinancement en urgence — un risque de liquidité disproportionné au regard
              du manquement.
            </p>
          </DimImpact>
          <DimJustif fn="⁵" sources="sources">
            Clauses des contrats de prêt et obligations de sincérité des déclarations.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques &amp; fiscaux">
          <LawChip icon={<BookIcon />} kind="Texte de loi">
            Déchéance du terme — <b>Code civil, art. 1103 et 1104</b>
          </LawChip>
          <LawChip icon={<ProcIcon />} kind="Obligation">
            Sincérité des déclarations d’engagements
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> cartographie consolidée des engagements bancaires et mise en
          conformité déclarative.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Excédent de liquidités" className="ablock fold">
        <AbHead
          mx={MxLiquidites}
          title="Excédent de liquidités"
          level="forte"
          label="Confiance forte · 96 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Liquidités immédiatement disponibles : <strong>{eur(v.liquidites)}</strong>, soit{" "}
                <strong>{DASH}</strong> de dépenses courantes.
              </li>
              <li>
                Norme d’épargne de précaution : 3 à 6 mois, soit une réserve cible de ~<strong>{DASH}</strong>.
              </li>
              <li>Origine : accumulation progressive sur comptes courants et livrets, sans réallocation.</li>
            </ul>
          </DimConstat>
          <Rio
            risque="Érosion monétaire : ces fonds, peu ou pas rémunérés, perdent du pouvoir d’achat face à l’inflation (~2,5 %/an)."
            opportunite="Liquidité = atout : apport pour un investissement à effet de levier, ou saisie d’opportunités lors d’une correction de marché."
            optimisation={
              <>
                Arbitrer l’excédent (~<strong>{DASH}</strong>) vers des supports rémunérateurs, en
                conservant une réserve de précaution de ~<strong>{DASH}</strong>.
              </>
            }
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Excédent au-delà de la réserve : <strong>≈ {DASH}</strong>. À <strong>{DASH}</strong> il
              rapporterait ~<strong>{DASH}</strong>/an ; à 5 %, ~<strong>{DASH}</strong>/an — un
              différentiel de <strong>~{DASH}/an</strong> de performance non captée.
            </p>
          </DimImpact>
          <DimJustif fn="¹" sources="3 sources">
            Réserve recommandée 3-6 mois (pratique de place) ; train de vie issu de l’analyse
            budgétaire.
          </DimJustif>
        </AbGrid2>
        <AbFoot>
          <b>Optimisation chiffrée :</b> coût d’opportunité (ci-dessous) · <b>Préconisation :</b>{" "}
          arbitrage vers l’assurance-vie luxembourgeoise.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Faible performance des contrats" className="ablock fold">
        <AbHead
          mx={MxLiquidites}
          title="Faible performance des contrats"
          level="forte"
          label="Confiance forte · 88 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Depuis l’origine, rendements nets de <strong>{DASH}</strong> (Monsieur) et{" "}
                <strong>{DASH}</strong> (Madame), à comparer à l’inflation moyenne de la période :{" "}
                <strong>{DASH}</strong>.
              </li>
              <li>
                Contrats des enfants : <strong>{DASH}</strong> et <strong>{DASH}</strong> pour une
                inflation de <strong>{DASH}</strong> — réel également négatif.
              </li>
              <li>
                Origine : exposition massive aux fonds euros ; une injection récente de{" "}
                <strong>{DASH}</strong> fige une part prépondérante du capital.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque={
              <>
                Rendement réel négatif de <strong>{DASH}</strong> : le patrimoine se déprécie en
                pouvoir d’achat malgré la protection nominale.
              </>
            }
            opportunite="Réallouer un capital de cette taille sur des supports diversifiés peut transformer une perte réelle en croissance significative."
            optimisation="Arbitrage vers une enveloppe performante (assurance-vie luxembourgeoise, unités de compte pilotées), réserve de précaution maintenue."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Sur ~<strong>{DASH}</strong>, le différentiel de <strong>{DASH}</strong> représente{" "}
              <strong>≈ {DASH}/an</strong> de richesse réelle perdue, avant fiscalité. Sur 10 ans,
              manque à gagner cumulé <strong>≈ {DASH}</strong> (détail ci-dessous).
            </p>
          </DimImpact>
          <DimJustif fn="²" sources="3 sources">
            Rendements et versements issus des relevés annuels ; inflation moyenne INSEE.
          </DimJustif>
        </AbGrid2>
        <AbFoot>
          <b>Optimisation chiffrée :</b> coût d’opportunité (ci-dessous) · <b>Préconisation :</b>{" "}
          arbitrage des avoirs vers l’assurance-vie luxembourgeoise.
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Charge d’emprunt — veille des taux" className="ablock fold">
        <AbHead
          mx={MxHorloge}
          title="Évaluation de la charge d’emprunt — opportunité de renégociation ou de rachat"
          level="forte"
          label="Confiance forte · 90 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Les financements en cours s’échelonnent de <strong>{DASH}</strong>.
              </li>
              <li>
                Le prêt de l’appartement meublé (<strong>{DASH}</strong>) et le crédit à la
                consommation (<strong>{DASH}</strong>) ressortent{" "}
                <strong>au-dessus des conditions de marché</strong> actuelles (≈ <strong>{DASH}</strong>{" "}
                sur 15 ans).
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque={
              <>
                Une veille insuffisante laisserait courir une{" "}
                <strong>charge d’intérêts supérieure au marché</strong> sur les lignes les plus chères.
              </>
            }
            opportunite={
              <>
                Renégociation ou <strong>rachat</strong> du prêt meublé et du crédit à la consommation
                dès que les taux moyens afficheront environ <strong>1 % d’écart à la baisse</strong>,
                allégeant la charge de la dette.
              </>
            }
            optimisation={
              <>
                Mettre en place une veille des taux et chiffrer le <strong>point mort</strong> d’un
                rachat — indemnités de remboursement anticipé incluses — avant toute opération.
              </>
            }
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Allègement mécanique de la charge d’intérêts et amélioration du cash-flow, à arbitrer
              contre les indemnités de remboursement anticipé (≈ <strong>{DASH}</strong> sur le
              meublé, sans indemnité sur le crédit à la consommation).
            </p>
          </DimImpact>
          <DimJustif fn="¹" sources="sources">
            Comparaison des taux des contrats et des conditions de marché à durée équivalente.
          </DimJustif>
        </AbGrid2>
        <AbFoot>
          <b>Préconisation :</b> instaurer une veille des taux et étudier le rachat des lignes les plus
          chères (chiffré dans la partie « Préconisations »).
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Assurance emprunteur — quotités et délégation" className="ablock fold">
        <AbHead
          mx={MxShieldCheck}
          title="Couverture et coût de l’assurance emprunteur — quotités et délégation"
          level="moy"
          label="Confiance modérée · 79 %"
        />
        <div className="ab-grid">
          <DimConstat>
            <ul className="dlist">
              <li>
                Le prêt du local professionnel (SCI) est assuré à une{" "}
                <strong>quotité de {DASH} par tête</strong>, soit <strong>{DASH}</strong> au global.
              </li>
              <li>
                Son coût (≈ <strong>{DASH}</strong> / mois) <strong>pèse sur la rentabilité</strong> de
                la SCI.
              </li>
            </ul>
          </DimConstat>
          <Rio
            risque={
              <>
                La faible quotité globale (<strong>{DASH}</strong>) contraindrait le{" "}
                <strong>conjoint survivant à supporter seul environ {DASH}</strong> de l’échéance en
                cas de décès du partenaire.
              </>
            }
            opportunite={
              <>
                Une renégociation ou une <strong>délégation d’assurance</strong> permettrait une
                économie de trésorerie sur la durée résiduelle, à garanties au moins équivalentes.
              </>
            }
            optimisation={
              <>
                Relever les quotités (cible <strong>100 % par tête</strong> sur les prêts SCI) et
                mettre l’assurance en concurrence par délégation.
              </>
            }
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              Économie de trésorerie sur la durée résiduelle et meilleure protection du conjoint
              survivant. En crédit professionnel, le droit à la délégation est moins protecteur, mais
              une démarche commerciale peut <b>augmenter les garanties tout en abaissant le coût</b>.
            </p>
          </DimImpact>
          <DimJustif fn="²" sources="sources">
            Quotités et coûts relevés sur le contrat d’assurance emprunteur.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques">
          <LawChip icon={<AValiderIcon />} kind="À valider">
            Droit à la délégation d’assurance (crédit professionnel) — <b>référence base ASTRAEOS</b>
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisation :</b> relever les quotités et mettre en concurrence l’assurance emprunteur
          par délégation (chiffré dans la partie « Préconisations »).
        </AbFoot>
      </Bloc>

      <Bloc blocKey="Caution solidaire — exposition personnelle" className="ablock fold">
        <AbHead
          mx={MxCaution}
          title="Caution solidaire — la dette des SCI pèse sur le patrimoine personnel"
          level="moy"
          label="Confiance modérée · 80 %"
        />
        <div className="ab-grid">
          <DimConstat>
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
          </DimConstat>
          <Rio
            risque={
              <>
                Sous le régime de la <strong>séparation de biens</strong>, l’engagement de caution
                n’est pas couvert par les protections propres aux régimes communautaires : il pèse sur
                le <strong>patrimoine propre</strong> de chaque caution, au-delà du capital social.
              </>
            }
            opportunite={
              <>
                La <strong>renégociation des cautions bancaires</strong> et la mise en place d’une{" "}
                <strong>délégation d’assurance emprunteur</strong> permettent d’alléger et de
                circonscrire cette exposition.
              </>
            }
            optimisation="Documenter l’étendue exacte de chaque caution, calibrer les têtes et quotités d’assurance, et tenir un tableau de bord unique des engagements."
          />
        </div>
        <AbGrid2>
          <DimImpact>
            <p>
              La caution porte le taux d’endettement <b>de {DASH} à {DASH}</b> : un écart de près de{" "}
              <b>{DASH} de service annuel</b> de la dette, supporté personnellement en cas de
              défaillance des sociétés. La renégociation viserait à substituer ou plafonner ces
              engagements ; la délégation d’assurance à garantir le remboursement en cas de décès ou
              d’invalidité d’un associé.
            </p>
          </DimImpact>
          <DimJustif fn="¹" sources="sources">
            Contrats de prêt des SCI et actes de cautionnement ; régime de la séparation de biens.
          </DimJustif>
        </AbGrid2>
        <Fond title="Fondements juridiques">
          <LawChip icon={<AValiderIcon />} kind="À valider">
            Cautionnement solidaire de l’associé — <b>référence base ASTRAEOS</b>
          </LawChip>
          <LawChip icon={<DocIcon />} kind="Obligation">
            Déclarations d’engagements aux prêteurs
          </LawChip>
        </Fond>
        <AbFoot>
          <b>Préconisations :</b> renégociation des cautions bancaires des SCI et délégation
          d’assurance emprunteur (chiffrées dans la partie « Préconisations »).
        </AbFoot>
      </Bloc>

      {/* SYNTHÈSE DU THÈME */}
      <div className="synthacc">
        <div className="subttl anchor synth-h" id="synthese-theme-patrimoine">
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
            Analyse du patrimoine — lecture stratégique
          </div>
          <div className="synth-cert sc-green eng-only">
            <span className="sc-ico">
              <EyeIcon />
            </span>
            <span>
              <b>Confiance forte · 88 %</b> · synthèse fondée sur les constats du thème
            </span>
            <span className="sc-link">Voir le détail</span>
          </div>
          <p>
            Le patrimoine net du foyer s’établit à <b>{eur(v.patrimoine_net)}</b>, pour un patrimoine
            brut de {eur(v.patrimoine_brut)}. Il est diversifié entre l’immobilier (d’usage et de
            rapport), le patrimoine professionnel, l’assurance-vie et les placements financiers, et se
            répartit de façon équilibrée entre les conjoints (<b>{DASH}</b> et <b>{DASH}</b>) sous{" "}
            {regime ? (
              <>
                le régime de la <b>{regime}</b>
              </>
            ) : (
              <>
                un régime matrimonial <b>{DASH}</b>
              </>
            )}
            .
          </p>
          <p>
            Trois actifs structurent le patrimoine : l’<b>assurance-vie ({eur(v.assurance_vie)})</b>,
            premier poste et levier de transmission ; le{" "}
            <b>patrimoine professionnel ({eur(v.actifs_professionnels)})</b>, lié à l’activité et à
            rendre plus liquide ; et l’<b>immobilier ({DASH}</b> entre usage et rapport), socle
            patrimonial et source de revenus.
          </p>
          <p>
            La principale marge de progression tient à l’<b>anticipation de la transmission</b>. Avec
            un patrimoine net de {eur(v.patrimoine_net)}, {enfants} et {RegimeFragment}, la mise en
            place d’une stratégie successorale (donation, démembrement, optimisation des clauses
            bénéficiaires) constitue le principal levier d’optimisation, développé dans le volet
            successoral.
          </p>
          <div className="sp-recap">
            <div className="spr spr-r">
              <div className="spr-h">Principaux risques</div>
              <ul>
                <li>Concentration de près de {DASH} % du patrimoine sur l’assurance-vie.</li>
                <li>
                  Patrimoine professionnel ({eur(v.actifs_professionnels)}) peu liquide et lié à
                  l’activité.
                </li>
                <li>Fiscalité successorale potentiellement lourde en l’absence d’anticipation.</li>
              </ul>
            </div>
            <div className="spr spr-o">
              <div className="spr-h">Principales opportunités</div>
              <ul>
                <li>Assurance-vie comme outil de transmission optimisé.</li>
                <li>Structuration et valorisation de l’outil professionnel.</li>
                <li>Leviers successoraux : donation, démembrement, donation de parts de SCI.</li>
              </ul>
            </div>
            <div className="spr spr-opt">
              <div className="spr-h">Principales optimisations</div>
              <ul>
                <li>Actualisation des clauses bénéficiaires d’assurance-vie.</li>
                <li>Structuration de la détention du patrimoine professionnel.</li>
                <li>Stratégie de transmission progressive exploitant les abattements.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
