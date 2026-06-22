"use client";

import { useState } from "react";
import SvgDefs from "./SvgDefs";
import { persistParcours } from "../submit-client";
import {
  PRODUITS,
  CONNAISSANCE_OPTIONS,
  EXPERIENCE_OPTIONS,
  OUI_NON_OPTIONS,
  AUTO_EVAL,
  HORIZON,
  PROFILE,
  TOLERANCE,
  REACTION,
  CURVES,
  ESG_EQUILIBRE,
  ESG_PRIVILEGIER,
  ESG_EVITER,
  TOTAL_STEPS,
  type Choice,
  type Product,
} from "./data";

function Icon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <use href={`#${id}`} />
    </svg>
  );
}

function ChoiceList({
  group,
  choices,
  selected,
  onSelect,
}: {
  group: string;
  choices: Choice[];
  selected: number | null;
  onSelect: (group: string, index: number) => void;
}) {
  return (
    <div className="choice-list">
      {choices.map((c, i) => (
        <div
          key={c.label}
          className={`choice-radio${selected === i ? " selected" : ""}`}
          onClick={() => onSelect(group, i)}
        >
          <div className="choice-radio-circle" />
          <div className="choice-radio-content">
            <div className="choice-radio-label">{c.label}</div>
            {c.desc ? <div className="choice-radio-desc">{c.desc}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductSection({ product }: { product: Product }) {
  return (
    <>
      <div className="section-header">
        <div className="section-eyebrow">{product.eyebrow}</div>
        <h1 className="section-title">{product.title}</h1>
      </div>

      <div className="product-card">
        <div className="product-intro">
          <div className="product-def-label">Définition</div>
          <div className="product-def-text">{product.definition}</div>
          <div className="product-example">
            <div className="product-example-icon">
              <Icon id="ic-bulb" />
            </div>
            <div>
              <span className="product-example-label">Exemple ·</span>
              {product.example}
            </div>
          </div>
        </div>
        <div className="product-questions">
          <div className="field-row-3">
            <div className="field">
              <label className="field-label">Connaissance</label>
              <select className="select-input" defaultValue={CONNAISSANCE_OPTIONS[0]}>
                {CONNAISSANCE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Expérience</label>
              <select className="select-input" defaultValue={EXPERIENCE_OPTIONS[0]}>
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Détention</label>
              <select className="select-input" defaultValue={OUI_NON_OPTIONS[0]}>
                {OUI_NON_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">
              Selon vous, ce produit comporte-t-il un risque de perte en capital ?
            </label>
            <select className="select-input" defaultValue={OUI_NON_OPTIONS[0]}>
              {OUI_NON_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export type RiskAnswers = {
  reponses: Record<string, number>;
  esgPrivilegier: boolean[];
  esgEviter: boolean[];
  certifie: boolean;
};

export default function Questionnaire({
  onSubmitAnswers,
  initialAnswers,
}: {
  /** Si fourni, remplace l'enregistrement par défaut (parcours prospect →
   *  dci_submissions). Utilisé par l'espace client pour rattacher le profil au dossier. */
  onSubmitAnswers?: (answers: RiskAnswers) => void | Promise<void>;
  initialAnswers?: Partial<RiskAnswers>;
} = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [certChecked, setCertChecked] = useState(initialAnswers?.certifie ?? false);

  // Sélections radio par groupe (auto-eval, horizon, profile, tolerance, reaction, curve, esg, esg-eq)
  const [radios, setRadios] = useState<Record<string, number>>(
    initialAnswers?.reponses ?? { esg: 1 },
  );
  // Cases ESG cochées (privilégier / éviter)
  const [privilegier, setPrivilegier] = useState<boolean[]>(
    initialAnswers?.esgPrivilegier ?? ESG_PRIVILEGIER.map(() => false),
  );
  const [eviter, setEviter] = useState<boolean[]>(
    initialAnswers?.esgEviter ?? ESG_EVITER.map(() => false),
  );

  const selectRadio = (group: string, index: number) => {
    setRadios((prev) => ({ ...prev, [group]: index }));
  };

  const showStep = (n: number) => {
    setCurrentStep(n);
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 200);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStep = () => {
    if (currentStep === TOTAL_STEPS) {
      submitForm();
      return;
    }
    if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) showStep(currentStep - 1);
  };

  const submitForm = () => {
    const answers: RiskAnswers = {
      reponses: radios,
      esgPrivilegier: privilegier,
      esgEviter: eviter,
      certifie: certChecked,
    };
    // Espace client : enregistrement rattaché au dossier (onSubmitAnswers).
    // Parcours prospect : enregistrement dci_submissions par défaut.
    if (onSubmitAnswers) {
      void onSubmitAnswers(answers);
    } else {
      persistParcours("qualification", answers);
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pct = Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
  const isFinalStep = currentStep === TOTAL_STEPS;
  const nextDisabled = isFinalStep && !certChecked;
  const esgVisible = radios.esg === 0; // « Oui » ouvre le détail conditionnel

  return (
    <>
      <SvgDefs />

      <div className="wf-annotation">
        <strong>
          WIREFRAME · 06 · ESPACE CLIENT · QUESTIONNAIRE DE QUALIFICATION CLIENT
        </strong>{" "}
        · Document individuel et nominatif · à signer par chaque personne physique
      </div>

      {!submitted && (
        <div className="top-bar">
          <div className="top-bar-inner">
            <div className="brand-mini">
              <div className="brand-mini-mark" style={{ color: "var(--gold)" }}>
                <svg>
                  <use href="#ic-tree" />
                </svg>
              </div>
              <div className="brand-mini-text">ASTRAEOS</div>
            </div>
            <div className="progress-zone">
              <div className="progress-info">
                <span>
                  <span className="percent">{pct}%</span> complété
                </span>
                <span>
                  Étape {currentStep} sur {TOTAL_STEPS}
                </span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className={`save-indicator${saveFlash ? "" : " saved"}`}>
              <svg className="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <use href="#ic-check" />
              </svg>
              Enregistré
            </div>
          </div>
        </div>
      )}

      <div className="section-container">
        {/* ─── SECTION 01 · INTRODUCTION ─── */}
        <div className={`section${currentStep === 1 ? " active" : ""}`} data-step="1">
          <div className="welcome-hero">
            <div className="welcome-mark" style={{ color: "var(--gold)" }}>
              <svg>
                <use href="#ic-tree" />
              </svg>
              <span style={{ color: "var(--navy)" }}>ASTRAEOS</span>
            </div>
            <div className="welcome-line" />
            <div className="welcome-name">Bonjour Bertrand,</div>
            <div className="welcome-message">
              Ce questionnaire de qualification client vise à déterminer{" "}
              <strong>votre profil d&apos;investisseur</strong>.
              <br />
              <br />
              Il vous prendra environ <strong>10 minutes</strong> (vos réponses sont
              sauvegardées automatiquement, vous pouvez le compléter en plusieurs fois).
            </div>
          </div>

          <div className="info-block">
            <div className="info-block-title">
              <Icon id="ic-info" />
              Pourquoi ce questionnaire ?
            </div>
            <div className="info-block-text">
              La réglementation nous impose de qualifier votre profil d&apos;investisseur.
            </div>
            <div className="info-block-text">
              Les informations que vous nous communiquerez nous permettront de vérifier
              l&apos;adéquation entre votre situation patrimoniale actuelle, vos
              connaissances, votre expérience en matière d&apos;investissement, votre
              tolérance au risque ainsi que vos objectifs.
            </div>
            <div className="info-block-text">
              Ces éléments sont nécessaires afin de vous fournir un accompagnement et des
              recommandations personnalisées, adaptés à votre profil.
            </div>
          </div>

          <div className="info-block">
            <div className="info-block-title">
              <Icon id="ic-shield" />
              Protection de vos données personnelles · RGPD
            </div>
            <div className="info-block-text">
              Les informations recueillies dans ce questionnaire sont enregistrées dans un
              fichier informatisé par ASTRAEOS pour les besoins de votre qualification
              réglementaire et pour vous délivrer un conseil personnalisé.
            </div>
            <div className="info-block-text">
              Conservation : pendant la durée nécessaire à l&apos;exécution des prestations.
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
              de vos données. Pour toute demande :{" "}
              <a href="mailto:contact@priveos.io">contact@priveos.io</a>
            </div>
          </div>

          <div className="guide-block">
            <div className="guide-title">
              Pour chaque produit financier, nous vous interrogerons sur 4 dimensions
            </div>
            <div className="guide-dims">
              <div className="guide-dim">
                <div className="guide-dim-num">1</div>
                <div className="guide-dim-content">
                  <div className="guide-dim-name">CONNAISSANCE</div>
                  <div className="guide-dim-desc">
                    Votre niveau de compréhension du produit · de &quot;aucune&quot; à
                    &quot;avancée&quot;
                  </div>
                </div>
              </div>
              <div className="guide-dim">
                <div className="guide-dim-num">2</div>
                <div className="guide-dim-content">
                  <div className="guide-dim-name">EXPÉRIENCE</div>
                  <div className="guide-dim-desc">
                    Votre pratique passée de ce produit · de &quot;aucune&quot; à
                    &quot;régulière&quot;
                  </div>
                </div>
              </div>
              <div className="guide-dim">
                <div className="guide-dim-num">3</div>
                <div className="guide-dim-content">
                  <div className="guide-dim-name">RISQUE</div>
                  <div className="guide-dim-desc">
                    Selon vous, ce produit comporte-t-il un risque de perte en capital ?
                  </div>
                </div>
              </div>
              <div className="guide-dim">
                <div className="guide-dim-num">4</div>
                <div className="guide-dim-content">
                  <div className="guide-dim-name">DÉTENTION</div>
                  <div className="guide-dim-desc">
                    Possédez-vous actuellement ce produit dans votre patrimoine ?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── PRODUITS FINANCIERS (sections 02 à 11) ─── */}
        {PRODUITS.map((product) => (
          <div
            key={product.step}
            className={`section${currentStep === product.step ? " active" : ""}`}
            data-step={product.step}
          >
            <ProductSection product={product} />
          </div>
        ))}

        {/* 12 · AUTO-ÉVALUATION */}
        <div className={`section${currentStep === 12 ? " active" : ""}`} data-step="12">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Auto-évaluation</h1>
            <div className="section-subtitle">
              En tant qu&apos;investisseur, comment vous estimez-vous ?
            </div>
          </div>
          <ChoiceList
            group="auto-eval"
            choices={AUTO_EVAL}
            selected={radios["auto-eval"] ?? null}
            onSelect={selectRadio}
          />
        </div>

        {/* 13 · HORIZON */}
        <div className={`section${currentStep === 13 ? " active" : ""}`} data-step="13">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Horizon de placement</h1>
            <div className="section-subtitle">
              Dans le cadre de votre projet d&apos;investissement, quelle est votre
              stratégie en termes d&apos;horizon ?
            </div>
          </div>
          <ChoiceList
            group="horizon"
            choices={HORIZON}
            selected={radios.horizon ?? null}
            onSelect={selectRadio}
          />
        </div>

        {/* 14 · PROFIL INVESTISSEUR */}
        <div className={`section${currentStep === 14 ? " active" : ""}`} data-step="14">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Profil d&apos;investisseur</h1>
            <div className="section-subtitle">
              Quelle affirmation décrit le mieux votre profil d&apos;investisseur ?
            </div>
          </div>
          <ChoiceList
            group="profile"
            choices={PROFILE}
            selected={radios.profile ?? null}
            onSelect={selectRadio}
          />
        </div>

        {/* 15 · TOLÉRANCE */}
        <div className={`section${currentStep === 15 ? " active" : ""}`} data-step="15">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Tolérance aux variations</h1>
            <div className="section-subtitle">
              Parmi ces attitudes, laquelle vous décrit le mieux ?
            </div>
          </div>
          <ChoiceList
            group="tolerance"
            choices={TOLERANCE}
            selected={radios.tolerance ?? null}
            onSelect={selectRadio}
          />
        </div>

        {/* 16 · RÉACTION BAISSE */}
        <div className={`section${currentStep === 16 ? " active" : ""}`} data-step="16">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Réaction face à une baisse</h1>
            <div className="section-subtitle">
              Imaginez qu&apos;après une hausse initiale de 10 %, la valeur de l&apos;un de
              vos placements baisse de 20 %. Quelle serait votre réaction ?
            </div>
          </div>
          <ChoiceList
            group="reaction"
            choices={REACTION}
            selected={radios.reaction ?? null}
            onSelect={selectRadio}
          />
        </div>

        {/* 17 · COURBE RENDEMENT/RISQUE */}
        <div className={`section${currentStep === 17 ? " active" : ""}`} data-step="17">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Profil rendement / risque</h1>
            <div className="section-subtitle">
              Vous trouverez ci-dessous 7 séries de rendements simulés sur 5 ans, classées
              du moins risqué au plus risqué, avec un potentiel de gain croissant.
              <br />
              <br />
              Laquelle choisissez-vous ?
            </div>
          </div>

          <div className="chart-block">
            <svg className="chart-svg" viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg">
              {/* Grid horizontale */}
              <line x1="70" y1="380" x2="700" y2="380" stroke="#E8E3D6" strokeWidth="1" />
              <line x1="70" y1="320" x2="700" y2="320" stroke="#F0EBE0" strokeWidth="1" />
              <line
                x1="70"
                y1="260"
                x2="700"
                y2="260"
                stroke="#DBE0E4"
                strokeWidth="1"
                strokeDasharray="4,3"
              />
              <line x1="70" y1="200" x2="700" y2="200" stroke="#F0EBE0" strokeWidth="1" />
              <line x1="70" y1="140" x2="700" y2="140" stroke="#F0EBE0" strokeWidth="1" />
              <line x1="70" y1="80" x2="700" y2="80" stroke="#F0EBE0" strokeWidth="1" />

              {/* Grid verticale */}
              <line x1="196" y1="40" x2="196" y2="380" stroke="#F0EBE0" strokeWidth="1" />
              <line x1="322" y1="40" x2="322" y2="380" stroke="#F0EBE0" strokeWidth="1" />
              <line x1="448" y1="40" x2="448" y2="380" stroke="#F0EBE0" strokeWidth="1" />
              <line x1="574" y1="40" x2="574" y2="380" stroke="#F0EBE0" strokeWidth="1" />

              {/* Axe Y · vertical */}
              <line x1="70" y1="40" x2="70" y2="380" stroke="#A4AEBB" strokeWidth="1.5" />

              {/* Labels Y */}
              <text x="60" y="385" fontSize="11" fill="#708196" textAnchor="end" fontFamily="Epilogue" fontWeight="500">60</text>
              <text x="60" y="325" fontSize="11" fill="#708196" textAnchor="end" fontFamily="Epilogue" fontWeight="500">80</text>
              <text x="60" y="265" fontSize="11" fill="#102D50" textAnchor="end" fontFamily="Epilogue" fontWeight="700">100</text>
              <text x="60" y="205" fontSize="11" fill="#708196" textAnchor="end" fontFamily="Epilogue" fontWeight="500">120</text>
              <text x="60" y="145" fontSize="11" fill="#708196" textAnchor="end" fontFamily="Epilogue" fontWeight="500">140</text>
              <text x="60" y="85" fontSize="11" fill="#708196" textAnchor="end" fontFamily="Epilogue" fontWeight="500">160</text>

              {/* Labels X */}
              <text x="70" y="402" fontSize="11" fill="#708196" textAnchor="middle" fontFamily="Epilogue" fontWeight="500">0</text>
              <text x="196" y="402" fontSize="11" fill="#708196" textAnchor="middle" fontFamily="Epilogue" fontWeight="500">1</text>
              <text x="322" y="402" fontSize="11" fill="#708196" textAnchor="middle" fontFamily="Epilogue" fontWeight="500">2</text>
              <text x="448" y="402" fontSize="11" fill="#708196" textAnchor="middle" fontFamily="Epilogue" fontWeight="500">3</text>
              <text x="574" y="402" fontSize="11" fill="#708196" textAnchor="middle" fontFamily="Epilogue" fontWeight="500">4</text>
              <text x="700" y="402" fontSize="11" fill="#708196" textAnchor="middle" fontFamily="Epilogue" fontWeight="500">5</text>

              {/* Légendes axes */}
              <text x="385" y="425" fontSize="12" fill="#102D50" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic">Années</text>
              <text
                x="22"
                y="210"
                fontSize="12"
                fill="#102D50"
                textAnchor="middle"
                fontFamily="Cormorant Garamond"
                fontStyle="italic"
                transform="rotate(-90 22 210)"
              >
                Cours
              </text>

              {/* Courbes */}
              {CURVES.map((c) => (
                <path
                  key={c.label}
                  d={c.path}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={c.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          </div>

          <div className="choice-list">
            {CURVES.map((c, i) => (
              <div
                key={c.label}
                className={`choice-radio choice-curve${radios.curve === i ? " selected" : ""}`}
                onClick={() => selectRadio("curve", i)}
              >
                <span
                  className="curve-color-indicator"
                  style={{ background: c.color }}
                />
                <div className="choice-radio-circle" />
                <div className="choice-radio-content">
                  <div className="choice-radio-label">{c.label}</div>
                  <div className="choice-radio-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 18 · ESG */}
        <div className={`section${currentStep === 18 ? " active" : ""}`} data-step="18">
          <div className="section-header">
            <div className="section-eyebrow">Votre profil</div>
            <h1 className="section-title">Critères ESG</h1>
            <div className="section-subtitle">
              Souhaitez-vous intégrer une dimension responsable dans vos investissements ?
            </div>
          </div>

          <div className="info-block">
            <div className="info-block-title">
              <Icon id="ic-info" />
              Élément de définition
            </div>
            <div className="info-block-text">
              Les critères ESG (Environnement, Social, Gouvernance) permettent
              d&apos;orienter les investissements vers des entreprises ou des secteurs qui
              respectent certains engagements éthiques, sociaux ou écologiques.
            </div>
            <div className="info-block-text">
              Intégrer ces critères peut impliquer d&apos;une part l&apos;exclusion de
              certains secteurs ou pratiques jugés controversés, ou d&apos;autre part la
              sélection d&apos;acteurs vertueux. Ces facteurs sont susceptibles de réduire
              le rendement potentiel des placements.
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Seriez-vous disposé(e) à intégrer des critères ESG dans votre portefeuille,
              même si cela peut réduire significativement la performance de vos
              investissements ?
            </label>
            <div className="choice-list" style={{ marginTop: "12px" }}>
              <div
                className={`choice-radio${radios.esg === 0 ? " selected" : ""}`}
                onClick={() => selectRadio("esg", 0)}
              >
                <div className="choice-radio-circle" />
                <div className="choice-radio-content">
                  <div className="choice-radio-label">Oui</div>
                </div>
              </div>
              <div
                className={`choice-radio${radios.esg === 1 ? " selected" : ""}`}
                onClick={() => selectRadio("esg", 1)}
              >
                <div className="choice-radio-circle" />
                <div className="choice-radio-content">
                  <div className="choice-radio-label">Non</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`conditional${esgVisible ? " visible" : ""}`}>
            <div className="conditional-title">
              Quel équilibre recherchez-vous entre performance financière et impact
              sociétal ?
            </div>
            <div className="choice-list" style={{ marginBottom: "26px" }}>
              {ESG_EQUILIBRE.map((c, i) => (
                <div
                  key={c.label}
                  className={`choice-radio${radios["esg-eq"] === i ? " selected" : ""}`}
                  onClick={() => selectRadio("esg-eq", i)}
                >
                  <div className="choice-radio-circle" />
                  <div className="choice-radio-content">
                    <div className="choice-radio-label">{c.label}</div>
                    <div className="choice-radio-desc">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="conditional-title">
              Souhaitez-vous privilégier certains secteurs ou thèmes d&apos;investissement ?
            </div>
            <div className="check-list" style={{ marginBottom: "26px" }}>
              {ESG_PRIVILEGIER.map((label, i) => (
                <div
                  key={label}
                  className={`check-row${privilegier[i] ? " checked" : ""}`}
                  onClick={() =>
                    setPrivilegier((prev) =>
                      prev.map((v, j) => (j === i ? !v : v)),
                    )
                  }
                >
                  <div className="check-box" />
                  <div className="check-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="conditional-title">Souhaitez-vous éviter certains secteurs ?</div>
            <div className="check-list">
              {ESG_EVITER.map((label, i) => (
                <div
                  key={label}
                  className={`check-row${eviter[i] ? " checked" : ""}`}
                  onClick={() =>
                    setEviter((prev) => prev.map((v, j) => (j === i ? !v : v)))
                  }
                >
                  <div className="check-box" />
                  <div className="check-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 19 · SIGNATURE FINALE */}
        <div className={`section${currentStep === 19 ? " active" : ""}`} data-step="19">
          <div className="section-header">
            <div className="section-eyebrow">Signature</div>
            <h1 className="section-title">Récapitulatif et signature</h1>
            <div className="section-subtitle">
              Nous vous invitons à valider votre questionnaire avant transmission à votre
              ingénieur patrimonial.
            </div>
          </div>

          <div className="profile-result">
            <div className="profile-result-label">Profil détecté</div>
            <div className="profile-result-name">Équilibré</div>
            <div className="profile-result-desc">
              Vous recherchez un juste équilibre entre sécurité et performance.
              <br />
              Votre horizon est de long terme avec une tolérance modérée aux variations.
            </div>
          </div>

          <div className="signature-block">
            <div className="signature-block-title">Identité du signataire</div>
            <div className="signature-id-row">
              <div className="signature-id-field">
                <div className="signature-id-label">Prénom</div>
                <div className="signature-id-value">Bertrand</div>
              </div>
              <div className="signature-id-field">
                <div className="signature-id-label">Nom</div>
                <div className="signature-id-value">DUPONT-TOPIN</div>
              </div>
              <div className="signature-id-field">
                <div className="signature-id-label">Date de signature</div>
                <div className="signature-id-value">15 mai 2026</div>
              </div>
            </div>
          </div>

          <div className="cert-block">
            <label className="cert-label">
              <input
                type="checkbox"
                checked={certChecked}
                onChange={(e) => setCertChecked(e.target.checked)}
              />
              <span className="cert-checkbox" />
              <span className="cert-text">
                <strong>Je certifie l&apos;exactitude des informations</strong> communiquées
                dans ce questionnaire. Je comprends qu&apos;elles serviront à déterminer mon
                profil d&apos;investisseur et à fonder les recommandations qui me seront
                formulées par mon ingénieur patrimonial ASTRAEOS dans le cadre de la
                réglementation CIF/MIF.
              </span>
            </label>
          </div>
        </div>

        {/* FINAL */}
        <div className={`final-view${submitted ? " active" : ""}`}>
          <div className="final-frame">
            <div className="final-seal" style={{ color: "var(--gold)" }}>
              <svg>
                <use href="#ic-seal" />
              </svg>
            </div>
            <div className="final-line" />
            <div className="final-title">Merci Bertrand,</div>
            <div className="final-text">
              Votre questionnaire de qualification client a été transmis à votre ingénieur
              patrimonial :
              <br />
              <br />
              <strong>Luc THILLIEZ</strong>.
              <br />
              <br />
              Ce document constitue une étape réglementaire indispensable pour vous formuler
              toute recommandation d&apos;investissement personnalisée.
              <br />
              <br />
              Vous allez recevoir un e-mail de confirmation avec votre questionnaire signé.
            </div>
            <div className="final-signature">
              À très bientôt,
              <div className="final-signature-name">L&apos;ÉQUIPE ASTRAEOS</div>
            </div>
          </div>
        </div>
      </div>

      {!submitted && (
        <div className="nav-bar">
          <div className="nav-bar-inner">
            <button
              className="nav-btn prev"
              onClick={prevStep}
              style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
            >
              <svg>
                <use href="#ic-arrow-left" />
              </svg>
              Précédent
            </button>
            <div className="nav-step-indicator">
              <strong>{currentStep}</strong> sur {TOTAL_STEPS}
            </div>
            <button
              className={`nav-btn next${isFinalStep ? " final" : ""}`}
              onClick={nextStep}
              disabled={nextDisabled}
            >
              {isFinalStep ? "Signer et envoyer" : "Continuer"}
              <svg>
                <use href="#ic-arrow-right" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
