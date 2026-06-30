"use client";

import { useState } from "react";
import { SVG_DEFS } from "./svg-defs";
import { persistParcours } from "../submit-client";

const TOTAL_STEPS = 8;

type Enfant = { prenom: string; date: string };
type Objectif = { num: number; kind: "obj1" | "obj2" | "added" };

/** Toggle Oui/Non/3-options : index de l'option sélectionnée + visibilité conditionnelle. */
function useYesNo(initialSelected: number, initialVisible: boolean) {
  const [selected, setSelected] = useState(initialSelected);
  const [visible, setVisible] = useState(initialVisible);
  return { selected, setSelected, visible, setVisible };
}

export default function DciSimplifieForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(true);
  const [certChecked, setCertChecked] = useState(false);

  // Section 2 · foyer
  const [foyerType, setFoyerType] = useState<"seul" | "couple">("couple");
  const enfantsInit: Enfant[] = [
    { prenom: "Camille", date: "1996-04-18" },
    { prenom: "Antoine", date: "1999-11-03" },
  ];
  const [enfants, setEnfants] = useState<Enfant[]>(enfantsInit);
  const autresPersonnes = useYesNo(1, false); // Non sélectionné, non visible

  // Section 4 · situation
  const [testament, setTestament] = useState(0); // Oui sélectionné
  const secondFiscal = useYesNo(1, false); // Non, non visible

  // Section 5 · patrimoine — accordéons
  const [accProOpen, setAccProOpen] = useState(false);
  const [accImmoOpen, setAccImmoOpen] = useState(true);
  const [accFinOpen, setAccFinOpen] = useState(true);
  const [accAltOpen, setAccAltOpen] = useState(false);
  const [accDetteOpen, setAccDetteOpen] = useState(true);

  // 5.1 actifs pro
  const socDetail = useYesNo(0, true); // Oui, visible
  // 5.2 immobilier
  const rpDetail = useYesNo(0, true); // Propriétaire, visible
  const locDetail = useYesNo(0, true); // Oui, visible
  const indiDetail = useYesNo(1, false); // Non
  const autresImmo = useYesNo(1, false); // Non
  // 5.3 financier
  const liqDetail = useYesNo(0, true); // Oui
  const avDetail = useYesNo(0, true); // Oui
  const peaDetail = useYesNo(0, true); // Oui
  const ctoDetail = useYesNo(1, false); // Non
  const perDetail = useYesNo(0, true); // Oui
  const autresFin = useYesNo(1, false); // Non
  // 5.4 alternatif
  const altDetail = useYesNo(1, false); // Non
  // 5.5 emprunts
  const pretImmo = useYesNo(0, true); // Oui
  const pretConso = useYesNo(1, false); // Non
  const autresDettes = useYesNo(1, false); // Non

  // Section 7 · objectifs
  const [objectifs, setObjectifs] = useState<Objectif[]>([{ num: 1, kind: "obj1" }, { num: 2, kind: "obj2" }]);
  const [objCount, setObjCount] = useState(2);

  function flashSave() {
    setSaved(false);
    setTimeout(() => setSaved(true), 200);
  }

  function showStep(n: number) {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
    flashSave();
  }

  function nextStep() {
    if (currentStep === TOTAL_STEPS) {
      submitForm();
      return;
    }
    if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
  }
  function prevStep() {
    if (currentStep > 1) showStep(currentStep - 1);
  }
  function goToStep(n: number) {
    showStep(n);
  }
  function submitForm() {
    persistParcours("simple");
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addEnfant() {
    setEnfants((e) => [...e, { prenom: "", date: "" }]);
  }
  function removeEnfant(i: number) {
    setEnfants((e) => e.filter((_, idx) => idx !== i));
  }

  function addObjectif() {
    const next = objCount + 1;
    setObjCount(next);
    setObjectifs((o) => [...o, { num: next, kind: "added" }]);
  }
  function removeObjectif(i: number) {
    setObjectifs((o) => o.filter((_, idx) => idx !== i));
  }

  const pct = Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
  const progFillWidth = submitted ? "100%" : `${pct}%`;

  return (
    <div className="maq-dci-simplifie">
      <svg className="svg-defs" xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: SVG_DEFS }} />

      {!submitted && (
        <div className="top-bar">
          <div className="top-bar-inner">
            <div className="brand-mini">
              <div className="brand-mini-mark" style={{ color: "var(--gold)" }}>
                <svg><use href="#ic-tree" /></svg>
              </div>
              <div className="brand-mini-text">ASTRAEOS</div>
            </div>
            <div className="progress-zone">
              <div className="progress-info">
                <span><span className="percent">{pct}%</span> complété</span>
                <span>Étape {currentStep} sur {TOTAL_STEPS}</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: progFillWidth }} />
              </div>
            </div>
            <div className={`save-indicator${saved ? " saved" : ""}`}>
              <svg className="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><use href="#ic-check" /></svg>
              Enregistré
            </div>
          </div>
        </div>
      )}

      <div className="section-container">

        {/* ───── SECTION 01 · BIENVENUE + RGPD ───── */}
        <div className={`section${!submitted && currentStep === 1 ? " active" : ""}`} data-step="1">
          <div className="welcome-frame">
            <div className="welcome-mark" style={{ color: "var(--gold)" }}>
              <svg><use href="#ic-tree" /></svg>
              <span style={{ color: "var(--navy)" }}>ASTRAEOS</span>
            </div>
            <div className="welcome-line" />
            <div className="welcome-name">Bonjour Monsieur Bertrand DUPONT-TOPIN,</div>
            <div className="welcome-message">
              En prévision de notre entretien initial du <strong>vendredi 22 mai 2026 à 10h00</strong>, nous vous invitons à compléter ce document de collecte d&apos;informations. Il nous permettra de mieux comprendre votre situation et vos objectifs, et de préparer notre échange dans les meilleures conditions.
              <br /><br />
              Il vous prendra environ <strong>15 minutes</strong> (vos réponses sont sauvegardées automatiquement, vous pouvez le compléter en plusieurs fois).
            </div>
          </div>

          <div className="info-row">
            <div className="info-card">
              <div className="info-card-icon"><svg><use href="#ic-lock" /></svg></div>
              <div className="info-card-title">Confidentialité</div>
              <div className="info-card-text">Vos données sont strictement protégées et destinées uniquement à votre ingénieur patrimonial.</div>
            </div>
            <div className="info-card">
              <div className="info-card-icon"><svg><use href="#ic-clock" /></svg></div>
              <div className="info-card-title">15 minutes</div>
              <div className="info-card-text">Durée moyenne de remplissage · sauvegarde automatique à chaque étape.</div>
            </div>
            <div className="info-card">
              <div className="info-card-icon"><svg><use href="#ic-devices" /></svg></div>
              <div className="info-card-title">Mobile ou ordinateur</div>
              <div className="info-card-text">Reprenez quand vous le souhaitez, depuis n&apos;importe quel appareil.</div>
            </div>
          </div>

          <div className="rgpd-block">
            <div className="rgpd-title">
              <svg><use href="#ic-shield" /></svg>
              Protection de vos données personnelles · RGPD
            </div>
            <div className="rgpd-text">
              Les informations recueillies dans ce document sont enregistrées dans un fichier informatisé par ASTRAEOS afin de connaître votre situation familiale, financière et patrimoniale, et de vous conseiller au mieux de vos intérêts.
            </div>
            <div className="rgpd-text">
              Conservation : pendant la durée nécessaire à l&apos;exécution des prestations. Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour toute demande : <a href="mailto:contact@astraeos.fr">contact@astraeos.fr</a>
            </div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">I</div>
              <div className="q-block-text">
                <div className="q-block-title">Votre identifiant</div>
                <div className="q-block-subtitle">Quelques informations pour démarrer — vous pourrez compléter le reste juste après</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Prénom <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="Bertrand" placeholder="Votre prénom" />
              </div>
              <div className="field">
                <label className="field-label">Nom <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="DUPONT-TOPIN" placeholder="Votre nom" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Adresse e-mail <span className="required">*</span></label>
              <input type="email" className="text-input" defaultValue="bertrand.dupont@email.fr" readOnly />
              <div className="field-help">Cette adresse est utilisée pour l&apos;envoi de votre confirmation dans votre agenda · <a href="mailto:contact@astraeos.fr">Contacter votre ingénieur patrimonial</a></div>
            </div>
          </div>
        </div>

        {/* ───── SECTION 02 · FOYER ───── */}
        <div className={`section${!submitted && currentStep === 2 ? " active" : ""}`} data-step="2">
          <div className="section-header">
            <div className="section-eyebrow">Étape 2 sur 8</div>
            <h1 className="section-title">Votre foyer</h1>
            <div className="section-subtitle">Nous vous invitons à nous partager les informations qui composent votre foyer.</div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">I</div>
              <div className="q-block-text">
                <div className="q-block-title">Votre situation</div>
                <div className="q-block-subtitle">Êtes-vous seul ou en couple ?</div>
              </div>
            </div>
            <div className="choice-cards">
              <div className={`choice-card${foyerType === "seul" ? " selected" : ""}`} onClick={() => setFoyerType("seul")}>
                <div className="choice-card-icon"><svg><use href="#ic-user" /></svg></div>
                <div className="choice-card-label">Seul</div>
                <div className="choice-card-desc">Célibataire · divorcé(e) · veuf(ve)</div>
              </div>
              <div className={`choice-card${foyerType === "couple" ? " selected" : ""}`} onClick={() => setFoyerType("couple")}>
                <div className="choice-card-icon"><svg><use href="#ic-couple" /></svg></div>
                <div className="choice-card-label">En couple</div>
                <div className="choice-card-desc">Marié(e) · pacsé(e) · concubin(e)</div>
              </div>
            </div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">II</div>
              <div className="q-block-text">
                <div className="q-block-title">Vous</div>
                <div className="q-block-subtitle">Vos informations personnelles principales</div>
              </div>
            </div>
            <div className="field-row-3">
              <div className="field">
                <label className="field-label">Civilité <span className="required">*</span></label>
                <select className="select-input" defaultValue="Monsieur">
                  <option>Monsieur</option>
                  <option>Madame</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Prénom <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="Bertrand" />
              </div>
              <div className="field">
                <label className="field-label">Nom <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="DUPONT-TOPIN" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Date de naissance <span className="required">*</span></label>
                <input type="date" className="text-input" defaultValue="1964-03-12" />
              </div>
              <div className="field">
                <label className="field-label">Nationalité <span className="required">*</span></label>
                <select className="select-input" defaultValue="Française">
                  <option>Française</option>
                  <option>Autre pays de l&apos;Union européenne</option>
                  <option>Hors Union européenne</option>
                </select>
              </div>
            </div>
          </div>

          {foyerType === "couple" && (
            <div className="q-block">
              <div className="q-block-head">
                <div className="q-block-number">III</div>
                <div className="q-block-text">
                  <div className="q-block-title">Votre conjoint(e)</div>
                  <div className="q-block-subtitle">Les mêmes informations pour la personne avec qui vous partagez votre vie</div>
                </div>
              </div>
              <div className="field-row-3">
                <div className="field">
                  <label className="field-label">Civilité <span className="required">*</span></label>
                  <select className="select-input" defaultValue="Madame">
                    <option>Madame</option>
                    <option>Monsieur</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Prénom <span className="required">*</span></label>
                  <input type="text" className="text-input" defaultValue="Monique" />
                </div>
                <div className="field">
                  <label className="field-label">Nom <span className="required">*</span></label>
                  <input type="text" className="text-input" defaultValue="DUPONT-TOPIN" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Date de naissance <span className="required">*</span></label>
                  <input type="date" className="text-input" defaultValue="1968-07-22" />
                </div>
                <div className="field">
                  <label className="field-label">Nationalité <span className="required">*</span></label>
                  <select className="select-input" defaultValue="Française">
                    <option>Française</option>
                    <option>Autre pays de l&apos;Union européenne</option>
                    <option>Hors Union européenne</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">IV</div>
              <div className="q-block-text">
                <div className="q-block-title">Vos enfants</div>
                <div className="q-block-subtitle">Avez-vous des enfants ? Vous pouvez en ajouter autant que nécessaire.</div>
              </div>
            </div>
            <div className="dyn-header-cols h-enfant">
              <div>Prénom</div>
              <div>Date de naissance</div>
              <div>Enfant de</div>
              <div>À charge fiscale</div>
              <div></div>
            </div>
            <div className="dyn-wrap">
              {enfants.map((enf, i) => (
                <div className="dyn-row dyn-row-enfant" key={i}>
                  <input type="text" className="text-input" placeholder="Prénom" defaultValue={enf.prenom} />
                  <input type="date" className="text-input" defaultValue={enf.date} />
                  <select className="select-input" defaultValue="Du couple"><option>Du couple</option><option>De Monsieur</option><option>De Madame</option></select>
                  <select className="select-input" defaultValue="Non"><option>Non</option><option>Oui</option></select>
                  <div className="dyn-row-remove" onClick={() => removeEnfant(i)}>×</div>
                </div>
              ))}
            </div>
            <button className="dyn-add" onClick={addEnfant}>
              <svg><use href="#ic-plus" /></svg>
              Ajouter un enfant
            </button>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">V</div>
              <div className="q-block-text">
                <div className="q-block-title">Autres personnes à charge <span className="opt">facultatif</span></div>
                <div className="q-block-subtitle">Parent âgé, frère, sœur ou autre personne dont vous avez la charge financière ou affective</div>
              </div>
            </div>
            <div className="yesno">
              <div className={`yesno-option${autresPersonnes.selected === 0 ? " selected" : ""}`} onClick={() => { autresPersonnes.setSelected(0); autresPersonnes.setVisible((v) => !v); }}>Oui</div>
              <div className={`yesno-option${autresPersonnes.selected === 1 ? " selected" : ""}`} onClick={() => { autresPersonnes.setSelected(1); autresPersonnes.setVisible(false); }}>Non</div>
            </div>
            <div className={`conditional${autresPersonnes.visible ? " visible" : ""}`}>
              <div className="dyn-header-cols h-relation" style={{ marginTop: "14px" }}>
                <div>Lien</div>
                <div>Prénom</div>
                <div>Nom</div>
                <div></div>
              </div>
              <div className="dyn-wrap">
                <div className="dyn-row dyn-row-relation">
                  <select className="select-input" defaultValue="Père / Mère"><option>Père / Mère</option><option>Frère / Sœur</option><option>Grand-parent</option><option>Autre</option></select>
                  <input type="text" className="text-input" placeholder="Prénom" />
                  <input type="text" className="text-input" placeholder="Nom" />
                  <div className="dyn-row-remove">×</div>
                </div>
              </div>
              <button className="dyn-add">
                <svg><use href="#ic-plus" /></svg>
                Ajouter une personne
              </button>
            </div>
          </div>
        </div>

        {/* ───── SECTION 03 · COORDONNÉES ───── */}
        <div className={`section${!submitted && currentStep === 3 ? " active" : ""}`} data-step="3">
          <div className="section-header">
            <div className="section-eyebrow">Étape 3 sur 8</div>
            <h1 className="section-title">Vos coordonnées</h1>
            <div className="section-subtitle">Nous proposons de disposer des coordonnées qui nous permettront de vous joindre.</div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">I</div>
              <div className="q-block-text">
                <div className="q-block-title">Adresse principale</div>
                <div className="q-block-subtitle">L&apos;adresse de votre résidence principale</div>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Adresse <span className="required">*</span></label>
              <input type="text" className="text-input" defaultValue="48 rue de l'Université" />
            </div>
            <div className="field-row-3">
              <div className="field">
                <label className="field-label">Code postal <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="75007" />
              </div>
              <div className="field">
                <label className="field-label">Ville <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="Paris" />
              </div>
              <div className="field">
                <label className="field-label">Pays <span className="required">*</span></label>
                <select className="select-input" defaultValue="France">
                  <option>France</option>
                  <option>Belgique</option>
                  <option>Suisse</option>
                  <option>Luxembourg</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">II</div>
              <div className="q-block-text">
                <div className="q-block-title">Vos coordonnées personnelles</div>
                <div className="q-block-subtitle">Téléphone et e-mail pour vous joindre</div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Téléphone mobile · Vous <span className="required">*</span></label>
                <input type="tel" className="text-input" defaultValue="+33 6 12 34 56 78" />
              </div>
              <div className="field">
                <label className="field-label">E-mail · Vous <span className="required">*</span></label>
                <input type="email" className="text-input" defaultValue="bertrand.dupont@email.fr" />
              </div>
            </div>
            {foyerType === "couple" && (
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Téléphone mobile · Madame <span className="required">*</span></label>
                  <input type="tel" className="text-input" defaultValue="+33 6 98 76 54 32" />
                </div>
                <div className="field">
                  <label className="field-label">E-mail · Madame <span className="required">*</span></label>
                  <input type="email" className="text-input" defaultValue="monique.dupont@email.fr" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───── SECTION 04 · SITUATION ───── */}
        <div className={`section${!submitted && currentStep === 4 ? " active" : ""}`} data-step="4">
          <div className="section-header">
            <div className="section-eyebrow">Étape 4 sur 8</div>
            <h1 className="section-title">Votre situation</h1>
            <div className="section-subtitle">Nous souhaiterions connaître votre situation matrimoniale, professionnelle et fiscale.</div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">I</div>
              <div className="q-block-text">
                <div className="q-block-title">Situation matrimoniale</div>
                <div className="q-block-subtitle">Comment êtes-vous unis officiellement ?</div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Votre statut <span className="required">*</span></label>
                <select className="select-input" defaultValue="Marié(e)">
                  <option>Marié(e)</option>
                  <option>Pacsé(e)</option>
                  <option>Concubin(e)</option>
                  <option>Célibataire</option>
                  <option>Divorcé(e)</option>
                  <option>Veuf / Veuve</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Date de mariage / PACS</label>
                <input type="date" className="text-input" defaultValue="1990-06-15" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Avez-vous signé un contrat de mariage ou une convention de PACS ?</label>
              <select className="select-input" defaultValue="Oui — Communauté légale (la plupart des couples)">
                <option>Oui — Communauté légale (la plupart des couples)</option>
                <option>Oui — Séparation de biens</option>
                <option>Oui — Communauté universelle</option>
                <option>Oui — Participation aux acquêts</option>
                <option>Non / je ne sais pas</option>
              </select>
              <div className="field-help">Si vous n&apos;êtes pas sûr, votre ingénieur patrimonial vous aidera à le préciser lors de l&apos;entretien.</div>
            </div>
            <div className="field">
              <label className="field-label">Avez-vous rédigé un testament ?</label>
              <div className="yesno">
                <div className={`yesno-option${testament === 0 ? " selected" : ""}`} onClick={() => setTestament(0)}>Oui</div>
                <div className={`yesno-option${testament === 1 ? " selected" : ""}`} onClick={() => setTestament(1)}>Non</div>
                <div className={`yesno-option${testament === 2 ? " selected" : ""}`} onClick={() => setTestament(2)}>Je ne sais pas</div>
              </div>
            </div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">II</div>
              <div className="q-block-text">
                <div className="q-block-title">Votre activité professionnelle</div>
                <div className="q-block-subtitle">Pour vous et votre conjoint(e)</div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Statut professionnel · Vous <span className="required">*</span></label>
                <select className="select-input" defaultValue="Dirigeant d'entreprise">
                  <option>Dirigeant d&apos;entreprise</option>
                  <option>Salarié du privé</option>
                  <option>Salarié du public / fonctionnaire</option>
                  <option>Profession libérale</option>
                  <option>Artisan / commerçant</option>
                  <option>Retraité</option>
                  <option>Sans activité</option>
                  <option>En recherche d&apos;emploi</option>
                  <option>Étudiant</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Profession · Vous <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="Cardiologue libéral" placeholder="Votre profession actuelle" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Statut professionnel · Madame <span className="required">*</span></label>
                <select className="select-input" defaultValue="Salarié du privé">
                  <option>Salarié du privé</option>
                  <option>Dirigeant d&apos;entreprise</option>
                  <option>Salarié du public / fonctionnaire</option>
                  <option>Profession libérale</option>
                  <option>Artisan / commerçant</option>
                  <option>Retraité</option>
                  <option>Sans activité</option>
                  <option>En recherche d&apos;emploi</option>
                  <option>Étudiant</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Profession · Madame <span className="required">*</span></label>
                <input type="text" className="text-input" defaultValue="Directrice marketing" placeholder="Profession actuelle" />
              </div>
            </div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">III</div>
              <div className="q-block-text">
                <div className="q-block-title">Situation fiscale</div>
                <div className="q-block-subtitle">Votre pays de résidence fiscale principal</div>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Pays de résidence fiscale <span className="required">*</span></label>
              <select className="select-input" defaultValue="France">
                <option>France</option>
                <option>Belgique</option>
                <option>Suisse</option>
                <option>Luxembourg</option>
                <option>Royaume-Uni</option>
                <option>Allemagne</option>
                <option>Autre pays UE</option>
                <option>États-Unis</option>
                <option>Autre pays hors UE</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Avez-vous une autre résidence fiscale ?</label>
              <div className="yesno">
                <div className={`yesno-option${secondFiscal.selected === 0 ? " selected" : ""}`} onClick={() => { secondFiscal.setSelected(0); secondFiscal.setVisible(true); }}>Oui</div>
                <div className={`yesno-option${secondFiscal.selected === 1 ? " selected" : ""}`} onClick={() => { secondFiscal.setSelected(1); secondFiscal.setVisible(false); }}>Non</div>
              </div>
              <div className={`conditional${secondFiscal.visible ? " visible" : ""}`}>
                <div className="field" style={{ marginTop: "14px", marginBottom: 0 }}>
                  <label className="field-label">Précisez le pays</label>
                  <input type="text" className="text-input" placeholder="Pays de seconde résidence fiscale" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───── SECTION 05 · PATRIMOINE ───── */}
        <div className={`section${!submitted && currentStep === 5 ? " active" : ""}`} data-step="5">
          <div className="section-header">
            <div className="section-eyebrow">Étape 5 sur 8</div>
            <h1 className="section-title">Votre patrimoine</h1>
            <div className="section-subtitle">Nous proposons de disposer d&apos;un aperçu de votre patrimoine actuel.</div>
          </div>

          {/* 5.1 · Actifs professionnels */}
          <div className={`accordion${accProOpen ? " open" : ""}`}>
            <div className="accordion-head" onClick={() => setAccProOpen((o) => !o)}>
              <div className="accordion-head-icon-bg"><svg><use href="#ic-briefcase" /></svg></div>
              <div className="accordion-head-text">
                <div className="accordion-head-title">Actifs professionnels</div>
                <div className="accordion-head-desc">Sociétés que vous détenez ou dirigez</div>
              </div>
              <div className="accordion-head-state">À compléter</div>
              <div className="accordion-chevron"><svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="accordion-body">
              <div className="field">
                <label className="field-label">Détenez-vous des parts dans des sociétés ?</label>
                <div className="yesno">
                  <div className={`yesno-option${socDetail.selected === 0 ? " selected" : ""}`} onClick={() => { socDetail.setSelected(0); socDetail.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${socDetail.selected === 1 ? " selected" : ""}`} onClick={() => { socDetail.setSelected(1); socDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${socDetail.visible ? " visible" : ""}`}>
                <div className="field-row">
                  <div className="field">
                    <label className="field-label">Sociétés civiles · combien ?</label>
                    <input type="number" className="text-input" defaultValue="1" min="0" />
                    <div className="field-help">SCI, sociétés civiles patrimoniales</div>
                  </div>
                  <div className="field">
                    <label className="field-label">Sociétés commerciales · combien ?</label>
                    <input type="number" className="text-input" defaultValue="1" min="0" />
                    <div className="field-help">SARL, SAS, SA, EURL, SASU, etc.</div>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Estimation totale de la valeur de ces actifs professionnels</label>
                  <input type="text" className="text-input" defaultValue="180 000 €" placeholder="Montant en €" />
                  <div className="field-help">Estimation approximative — pas besoin d&apos;être précis à ce stade</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5.2 · Immobilier */}
          <div className={`accordion${accImmoOpen ? " open" : ""}`}>
            <div className="accordion-head" onClick={() => setAccImmoOpen((o) => !o)}>
              <div className="accordion-head-icon-bg"><svg><use href="#ic-home" /></svg></div>
              <div className="accordion-head-text">
                <div className="accordion-head-title">Immobilier</div>
                <div className="accordion-head-desc">Votre résidence et vos investissements immobiliers</div>
              </div>
              <div className="accordion-head-state filled">Renseigné</div>
              <div className="accordion-chevron"><svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="accordion-body">
              <div className="field">
                <label className="field-label">Votre résidence principale</label>
                <div className="yesno">
                  <div className={`yesno-option${rpDetail.selected === 0 ? " selected" : ""}`} onClick={() => { rpDetail.setSelected(0); rpDetail.setVisible(true); }}>Propriétaire</div>
                  <div className={`yesno-option${rpDetail.selected === 1 ? " selected" : ""}`} onClick={() => { rpDetail.setSelected(1); rpDetail.setVisible(false); }}>Locataire</div>
                  <div className={`yesno-option${rpDetail.selected === 2 ? " selected" : ""}`} onClick={() => { rpDetail.setSelected(2); rpDetail.setVisible(false); }}>Hébergé à titre gratuit</div>
                </div>
              </div>
              <div className={`conditional${rpDetail.visible ? " visible" : ""}`}>
                <div className="field" style={{ marginTop: "14px" }}>
                  <label className="field-label">Valeur brute estimée de votre résidence principale</label>
                  <input type="text" className="text-input" defaultValue="850 000 €" placeholder="Valeur estimée" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Investissements immobiliers locatifs</label>
                <div className="yesno">
                  <div className={`yesno-option${locDetail.selected === 0 ? " selected" : ""}`} onClick={() => { locDetail.setSelected(0); locDetail.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${locDetail.selected === 1 ? " selected" : ""}`} onClick={() => { locDetail.setSelected(1); locDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${locDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Combien de biens ?</label>
                    <input type="number" className="text-input" defaultValue="2" min="1" />
                  </div>
                  <div className="field">
                    <label className="field-label">Valeur brute totale estimée</label>
                    <input type="text" className="text-input" defaultValue="620 000 €" />
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Immobilier indirect (SCPI, OPCI, parts de SCI…)</label>
                <div className="yesno">
                  <div className={`yesno-option${indiDetail.selected === 0 ? " selected" : ""}`} onClick={() => { indiDetail.setSelected(0); indiDetail.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${indiDetail.selected === 1 ? " selected" : ""}`} onClick={() => { indiDetail.setSelected(1); indiDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${indiDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Combien de supports ?</label>
                    <input type="number" className="text-input" min="1" />
                  </div>
                  <div className="field">
                    <label className="field-label">Valeur brute totale estimée</label>
                    <input type="text" className="text-input" placeholder="Montant en €" />
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Autres biens immobiliers (résidence secondaire, terrains…)</label>
                <div className="yesno">
                  <div className={`yesno-option${autresImmo.selected === 0 ? " selected" : ""}`} onClick={() => { autresImmo.setSelected(0); autresImmo.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${autresImmo.selected === 1 ? " selected" : ""}`} onClick={() => { autresImmo.setSelected(1); autresImmo.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${autresImmo.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Combien de biens ?</label>
                    <input type="number" className="text-input" min="1" />
                  </div>
                  <div className="field">
                    <label className="field-label">Valeur brute totale estimée</label>
                    <input type="text" className="text-input" placeholder="Montant en €" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5.3 · Financier */}
          <div className={`accordion${accFinOpen ? " open" : ""}`}>
            <div className="accordion-head" onClick={() => setAccFinOpen((o) => !o)}>
              <div className="accordion-head-icon-bg"><svg><use href="#ic-coins" /></svg></div>
              <div className="accordion-head-text">
                <div className="accordion-head-title">Patrimoine financier</div>
                <div className="accordion-head-desc">Liquidités, placements et investissements financiers</div>
              </div>
              <div className="accordion-head-state filled">Renseigné</div>
              <div className="accordion-chevron"><svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="accordion-body">
              <div style={{ background: "var(--gold-faint)", borderLeft: "2px solid var(--gold)", padding: "12px 16px", borderRadius: "6px", marginBottom: "22px", fontSize: "12.5px", color: "var(--text-soft)", fontStyle: "italic", lineHeight: 1.55 }}>
                Indiquez pour chaque type de produit que vous possédez, le nombre total de supports et le montant total approximatif.
              </div>

              <div className="field">
                <label className="field-label">Épargne disponible (livrets, comptes de dépôt…)</label>
                <div className="yesno">
                  <div className={`yesno-option${liqDetail.selected === 0 ? " selected" : ""}`} onClick={() => { liqDetail.setSelected(0); liqDetail.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${liqDetail.selected === 1 ? " selected" : ""}`} onClick={() => { liqDetail.setSelected(1); liqDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${liqDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de supports</label>
                    <input type="number" className="text-input" defaultValue="4" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total</label>
                    <input type="text" className="text-input" defaultValue="85 000 €" />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Assurances-vie</label>
                <div className="yesno">
                  <div className={`yesno-option${avDetail.selected === 0 ? " selected" : ""}`} onClick={() => { avDetail.setSelected(0); avDetail.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${avDetail.selected === 1 ? " selected" : ""}`} onClick={() => { avDetail.setSelected(1); avDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${avDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de contrats</label>
                    <input type="number" className="text-input" defaultValue="3" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total</label>
                    <input type="text" className="text-input" defaultValue="280 000 €" />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">PEA (Plan d&apos;Épargne en Actions)</label>
                <div className="yesno">
                  <div className={`yesno-option${peaDetail.selected === 0 ? " selected" : ""}`} onClick={() => { peaDetail.setSelected(0); peaDetail.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${peaDetail.selected === 1 ? " selected" : ""}`} onClick={() => { peaDetail.setSelected(1); peaDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${peaDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de PEA</label>
                    <input type="number" className="text-input" defaultValue="1" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total</label>
                    <input type="text" className="text-input" defaultValue="95 000 €" />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Compte-titres ordinaire (CTO)</label>
                <div className="yesno">
                  <div className={`yesno-option${ctoDetail.selected === 0 ? " selected" : ""}`} onClick={() => { ctoDetail.setSelected(0); ctoDetail.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${ctoDetail.selected === 1 ? " selected" : ""}`} onClick={() => { ctoDetail.setSelected(1); ctoDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${ctoDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de comptes</label>
                    <input type="number" className="text-input" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total</label>
                    <input type="text" className="text-input" placeholder="Montant en €" />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Épargne retraite (PER, PERP, Madelin, PERCO…)</label>
                <div className="yesno">
                  <div className={`yesno-option${perDetail.selected === 0 ? " selected" : ""}`} onClick={() => { perDetail.setSelected(0); perDetail.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${perDetail.selected === 1 ? " selected" : ""}`} onClick={() => { perDetail.setSelected(1); perDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${perDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de contrats</label>
                    <input type="number" className="text-input" defaultValue="2" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total</label>
                    <input type="text" className="text-input" defaultValue="60 000 €" />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Autres placements financiers</label>
                <div className="yesno">
                  <div className={`yesno-option${autresFin.selected === 0 ? " selected" : ""}`} onClick={() => { autresFin.setSelected(0); autresFin.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${autresFin.selected === 1 ? " selected" : ""}`} onClick={() => { autresFin.setSelected(1); autresFin.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${autresFin.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de supports</label>
                    <input type="number" className="text-input" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total</label>
                    <input type="text" className="text-input" placeholder="Montant en €" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5.4 · Alternatif */}
          <div className={`accordion${accAltOpen ? " open" : ""}`}>
            <div className="accordion-head" onClick={() => setAccAltOpen((o) => !o)}>
              <div className="accordion-head-icon-bg"><svg><use href="#ic-diamond" /></svg></div>
              <div className="accordion-head-text">
                <div className="accordion-head-title">Placements alternatifs</div>
                <div className="accordion-head-desc">Crypto-monnaies, or, art, vins, montres, véhicules de collection…</div>
              </div>
              <div className="accordion-head-state">À compléter</div>
              <div className="accordion-chevron"><svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="accordion-body">
              <div className="field">
                <label className="field-label">Possédez-vous des placements alternatifs ?</label>
                <div className="yesno">
                  <div className={`yesno-option${altDetail.selected === 0 ? " selected" : ""}`} onClick={() => { altDetail.setSelected(0); altDetail.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${altDetail.selected === 1 ? " selected" : ""}`} onClick={() => { altDetail.setSelected(1); altDetail.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${altDetail.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de supports</label>
                    <input type="number" className="text-input" min="1" />
                  </div>
                  <div className="field">
                    <label className="field-label">Montant total estimé</label>
                    <input type="text" className="text-input" placeholder="Montant en €" />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Précisez les types <span className="opt">facultatif</span></label>
                  <input type="text" className="text-input" placeholder="Ex. : crypto-monnaies, or, montres, art…" />
                </div>
              </div>
            </div>
          </div>

          {/* 5.5 · Emprunts */}
          <div className={`accordion${accDetteOpen ? " open" : ""}`}>
            <div className="accordion-head" onClick={() => setAccDetteOpen((o) => !o)}>
              <div className="accordion-head-icon-bg"><svg><use href="#ic-trend-down" /></svg></div>
              <div className="accordion-head-text">
                <div className="accordion-head-title">Emprunts et dettes</div>
                <div className="accordion-head-desc">Crédits en cours et dettes diverses</div>
              </div>
              <div className="accordion-head-state filled">Renseigné</div>
              <div className="accordion-chevron"><svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="accordion-body">
              <div className="field">
                <label className="field-label">Prêt(s) immobilier(s)</label>
                <div className="yesno">
                  <div className={`yesno-option${pretImmo.selected === 0 ? " selected" : ""}`} onClick={() => { pretImmo.setSelected(0); pretImmo.setVisible(true); }}>Oui</div>
                  <div className={`yesno-option${pretImmo.selected === 1 ? " selected" : ""}`} onClick={() => { pretImmo.setSelected(1); pretImmo.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${pretImmo.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de prêts</label>
                    <input type="number" className="text-input" defaultValue="2" />
                  </div>
                  <div className="field">
                    <label className="field-label">Capital restant dû total</label>
                    <input type="text" className="text-input" defaultValue="220 000 €" />
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Prêt(s) à la consommation</label>
                <div className="yesno">
                  <div className={`yesno-option${pretConso.selected === 0 ? " selected" : ""}`} onClick={() => { pretConso.setSelected(0); pretConso.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${pretConso.selected === 1 ? " selected" : ""}`} onClick={() => { pretConso.setSelected(1); pretConso.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${pretConso.visible ? " visible" : ""}`}>
                <div className="field-row" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label className="field-label">Nombre de prêts</label>
                    <input type="number" className="text-input" />
                  </div>
                  <div className="field">
                    <label className="field-label">Capital restant dû total</label>
                    <input type="text" className="text-input" placeholder="Montant en €" />
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Autres dettes (familiales, fiscales, professionnelles…)</label>
                <div className="yesno">
                  <div className={`yesno-option${autresDettes.selected === 0 ? " selected" : ""}`} onClick={() => { autresDettes.setSelected(0); autresDettes.setVisible((v) => !v); }}>Oui</div>
                  <div className={`yesno-option${autresDettes.selected === 1 ? " selected" : ""}`} onClick={() => { autresDettes.setSelected(1); autresDettes.setVisible(false); }}>Non</div>
                </div>
              </div>
              <div className={`conditional${autresDettes.visible ? " visible" : ""}`}>
                <div className="field" style={{ marginTop: "14px" }}>
                  <label className="field-label">Précisez la nature et le montant</label>
                  <input type="text" className="text-input" placeholder="Ex. : dette familiale 50 000 €, dette fiscale…" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───── SECTION 06 · BUDGET ───── */}
        <div className={`section${!submitted && currentStep === 6 ? " active" : ""}`} data-step="6">
          <div className="section-header">
            <div className="section-eyebrow">Étape 6 sur 8</div>
            <h1 className="section-title">Votre budget</h1>
            <div className="section-subtitle">Nous proposons de disposer d&apos;un aperçu de vos revenus et de vos charges annuels.</div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">I</div>
              <div className="q-block-text">
                <div className="q-block-title">Vos revenus annuels avant impôt</div>
                <div className="q-block-subtitle">Total des revenus bruts perçus par le foyer (salaires, pensions, loyers, dividendes…)</div>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Montant total annuel des revenus du foyer · avant impôt</label>
              <input type="text" className="text-input" defaultValue="220 000 €" placeholder="Ex. 80 000 €" />
              <div className="field-help">Approximatif — revenus bruts du foyer (Monsieur + Madame, toutes sources confondues, avant impôt)</div>
            </div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">II</div>
              <div className="q-block-text">
                <div className="q-block-title">Vos charges annuelles</div>
                <div className="q-block-subtitle">Charges fixes (loyer / crédits, impôts, factures…) et charges courantes</div>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Montant total annuel des charges du foyer</label>
              <input type="text" className="text-input" defaultValue="140 000 €" placeholder="Ex. 50 000 €" />
              <div className="field-help">Approximatif — ensemble des dépenses annuelles récurrentes</div>
            </div>
          </div>

          <div className="q-block" style={{ background: "var(--gold-faint)", borderColor: "var(--gold-soft)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ width: "44px", height: "44px", background: "var(--white)", border: "1px solid var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3" /></svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-cormorant), 'Georgia', serif", fontSize: "18px", color: "var(--navy)", fontWeight: 600, marginBottom: "4px" }}>Capacité d&apos;épargne estimée par an</div>
                <div style={{ fontSize: "13.5px", color: "var(--text-soft)", lineHeight: 1.6 }}>D&apos;après vos réponses : environ <strong style={{ color: "var(--navy)", fontWeight: 700 }}>80 000 € par an</strong> · soit <strong style={{ color: "var(--navy)", fontWeight: 700 }}>6 700 € par mois</strong>.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ───── SECTION 07 · OBJECTIFS ───── */}
        <div className={`section${!submitted && currentStep === 7 ? " active" : ""}`} data-step="7">
          <div className="section-header">
            <div className="section-eyebrow">Étape 7 sur 8</div>
            <h1 className="section-title">Quels sont vos objectifs ?</h1>
            <div className="section-subtitle">Nous vous invitons à nous indiquer les principaux objectifs qui motivent votre démarche.</div>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">I</div>
              <div className="q-block-text">
                <div className="q-block-title">Vos projets prioritaires</div>
                <div className="q-block-subtitle">Ajoutez autant d&apos;objectifs que nécessaire — classez-les par ordre d&apos;importance</div>
              </div>
            </div>

            <div>
              {objectifs.map((obj, i) => (
                <ObjectifCard key={i} num={obj.num} kind={obj.kind} onRemove={() => removeObjectif(i)} />
              ))}
            </div>

            <button className="dyn-add" onClick={addObjectif}>
              <svg><use href="#ic-plus" /></svg>
              Ajouter un objectif
            </button>
          </div>

          <div className="q-block">
            <div className="q-block-head">
              <div className="q-block-number">II</div>
              <div className="q-block-text">
                <div className="q-block-title">Un message libre <span className="opt">facultatif</span></div>
                <div className="q-block-subtitle">Une préoccupation particulière, un contexte, une question — tout ce que vous souhaitez nous partager avant l&apos;entretien</div>
              </div>
            </div>
            <div className="field">
              <textarea className="text-input" rows={5} placeholder="Votre message…" style={{ resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>
        </div>

        {/* ───── SECTION 08 · VALIDATION ───── */}
        <div className={`section${!submitted && currentStep === 8 ? " active" : ""}`} data-step="8">
          <div className="section-header">
            <div className="section-eyebrow">Étape 8 sur 8</div>
            <h1 className="section-title">Récapitulatif de votre profil</h1>
            <div className="section-subtitle">Vérifiez vos informations avant de les transmettre à votre ingénieur patrimonial.</div>
          </div>

          <div className="recap-hero">
            <div className="recap-hero-mark">
              <svg width="44" height="44" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M32 52 V18" />
                <path d="M32 24 Q22 24 19 16" />
                <path d="M32 30 Q44 30 47 20" />
                <path d="M32 36 Q22 36 18 28" />
                <path d="M32 42 Q44 42 46 34" />
                <ellipse cx="32" cy="54" rx="9" ry="2.5" />
              </svg>
            </div>
            <div className="recap-hero-content">
              <div className="recap-hero-eyebrow">Profil patrimonial complété</div>
              <div className="recap-hero-name">Bertrand &amp; Monique DUPONT-TOPIN</div>
              <div className="recap-hero-meta">Couple · 2 enfants · Résidence fiscale France · Cardiologue libéral</div>
            </div>
            <div className="recap-hero-side">
              <div className="recap-hero-side-label">Patrimoine brut estimé</div>
              <div className="recap-hero-side-value">≈ 2,17 M€</div>
              <div className="recap-hero-side-sub">après dettes : ≈ 1,95 M€</div>
            </div>
          </div>

          <div className="recap-section-title">Détail par rubrique</div>

          <div className="recap-grid">
            <div className="recap-card">
              <div className="recap-card-title">
                <div className="recap-card-label"><svg><use href="#ic-family" /></svg> Foyer</div>
                <span className="recap-card-edit" onClick={() => goToStep(2)}>Modifier</span>
              </div>
              <div className="recap-card-content">
                <div className="recap-line"><span className="recap-line-label">Composition</span><span className="recap-line-val">Couple marié</span></div>
                <div className="recap-line"><span className="recap-line-label">Conjoints</span><span className="recap-line-val">Bertrand &amp; Monique</span></div>
                <div className="recap-line"><span className="recap-line-label">Enfants</span><span className="recap-line-val">Camille (30) · Antoine (26)</span></div>
              </div>
            </div>

            <div className="recap-card">
              <div className="recap-card-title">
                <div className="recap-card-label"><svg><use href="#ic-pin" /></svg> Coordonnées</div>
                <span className="recap-card-edit" onClick={() => goToStep(3)}>Modifier</span>
              </div>
              <div className="recap-card-content">
                <div className="recap-line"><span className="recap-line-label">Adresse</span><span className="recap-line-val">48 rue de l&apos;Université</span></div>
                <div className="recap-line"><span className="recap-line-label">Ville</span><span className="recap-line-val">75007 Paris</span></div>
                <div className="recap-line"><span className="recap-line-label">E-mail</span><span className="recap-line-val">bertrand.dupont@email.fr</span></div>
              </div>
            </div>

            <div className="recap-card">
              <div className="recap-card-title">
                <div className="recap-card-label"><svg><use href="#ic-doc" /></svg> Situation</div>
                <span className="recap-card-edit" onClick={() => goToStep(4)}>Modifier</span>
              </div>
              <div className="recap-card-content">
                <div className="recap-line"><span className="recap-line-label">Régime</span><span className="recap-line-val">Communauté légale</span></div>
                <div className="recap-line"><span className="recap-line-label">Marié depuis</span><span className="recap-line-val">1990</span></div>
                <div className="recap-line"><span className="recap-line-label">Activité</span><span className="recap-line-val">Cardiologue libéral</span></div>
                <div className="recap-line"><span className="recap-line-label">Fiscalité</span><span className="recap-line-val">France</span></div>
              </div>
            </div>

            <div className="recap-card">
              <div className="recap-card-title">
                <div className="recap-card-label"><svg><use href="#ic-home" /></svg> Patrimoine</div>
                <span className="recap-card-edit" onClick={() => goToStep(5)}>Modifier</span>
              </div>
              <div className="recap-card-content">
                <div className="recap-line"><span className="recap-line-label">Immobilier</span><span className="recap-line-val recap-line-amount">≈ 1 470 000 €</span></div>
                <div className="recap-line"><span className="recap-line-label">Financier</span><span className="recap-line-val recap-line-amount">≈ 520 000 €</span></div>
                <div className="recap-line"><span className="recap-line-label">Professionnel</span><span className="recap-line-val recap-line-amount">≈ 180 000 €</span></div>
                <div className="recap-line recap-line-neg"><span className="recap-line-label">Dettes</span><span className="recap-line-val recap-line-amount">− 220 000 €</span></div>
              </div>
            </div>

            <div className="recap-card">
              <div className="recap-card-title">
                <div className="recap-card-label"><svg><use href="#ic-wallet" /></svg> Budget</div>
                <span className="recap-card-edit" onClick={() => goToStep(6)}>Modifier</span>
              </div>
              <div className="recap-card-content">
                <div className="recap-line"><span className="recap-line-label">Revenus annuels</span><span className="recap-line-val recap-line-amount">220 000 €</span></div>
                <div className="recap-line"><span className="recap-line-label">Charges annuelles</span><span className="recap-line-val recap-line-amount">140 000 €</span></div>
                <div className="recap-line"><span className="recap-line-label">Capacité d&apos;épargne</span><span className="recap-line-val recap-line-amount recap-line-positive">≈ 80 000 € / an</span></div>
              </div>
            </div>

            <div className="recap-card">
              <div className="recap-card-title">
                <div className="recap-card-label"><svg><use href="#ic-target" /></svg> Objectifs</div>
                <span className="recap-card-edit" onClick={() => goToStep(7)}>Modifier</span>
              </div>
              <div className="recap-card-content">
                <div className="recap-objective"><span className="recap-obj-num">1</span><div><div className="recap-obj-title">Transmission patrimoniale</div><div className="recap-obj-meta">Horizon long terme</div></div></div>
                <div className="recap-objective"><span className="recap-obj-num">2</span><div><div className="recap-obj-title">Optimisation fiscale</div><div className="recap-obj-meta">Horizon court terme</div></div></div>
              </div>
            </div>
          </div>

          <div className="cert-block">
            <label className="cert-label">
              <input type="checkbox" checked={certChecked} onChange={(e) => setCertChecked(e.target.checked)} />
              <span className="cert-checkbox"></span>
              <span className="cert-text">
                <strong>Je certifie l&apos;exactitude des informations</strong> communiquées dans ce document. Je comprends que la qualité du conseil prodigué par ASTRAEOS dépendra de la véracité et de l&apos;exhaustivité de mes réponses. Je consens au traitement de ces données par ASTRAEOS pour les besoins de l&apos;accompagnement patrimonial qui me sera proposé.
              </span>
            </label>
          </div>

          <div className="final-note">
            <strong>À noter ·</strong> Une fois envoyé, votre ingénieur patrimonial recevra immédiatement vos réponses et préparera votre entretien initial du <em>vendredi 22 mai 2026 à 10h00</em>. Vous pourrez ensuite décider ensemble si vous souhaitez engager une étude patrimoniale plus approfondie.
          </div>
        </div>

        {/* ───── VUE FINALE · APRÈS ENVOI ───── */}
        <div className={`final-view${submitted ? " active" : ""}`}>
          <div className="final-frame">
            <div className="final-seal" style={{ color: "var(--gold)" }}>
              <svg><use href="#ic-seal" /></svg>
            </div>
            <div className="final-line" />
            <div className="final-title">Merci Bertrand,</div>
            <div className="final-text">
              Vos informations ont été transmises à votre ingénieur patrimonial :
              <br /><br />
              <strong>Luc THILLIEZ</strong>.
              <br /><br />
              Votre ingénieur étudiera vos informations attentivement pour préparer votre entretien initial du :
              <br /><br />
              <strong>vendredi 22 mai 2026 à 10h00</strong>.
              <br /><br />
              Vous allez recevoir un e-mail de confirmation avec un lien de connexion.
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
            <button className="nav-btn prev" onClick={prevStep} style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}>
              <svg><use href="#ic-arrow-left" /></svg>
              Précédent
            </button>
            <div className="nav-step-indicator"><strong>{currentStep}</strong> sur {TOTAL_STEPS}</div>
            <button
              className={`nav-btn next${currentStep === TOTAL_STEPS ? " final" : ""}`}
              onClick={nextStep}
              disabled={currentStep === TOTAL_STEPS && !certChecked}
            >
              {currentStep === TOTAL_STEPS ? "Envoyer mes réponses" : "Continuer"}
              <svg><use href="#ic-arrow-right" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ObjectifCard({ num, kind, onRemove }: { num: number; kind: "obj1" | "obj2" | "added"; onRemove: () => void }) {
  // Trois archétypes de carte fidèles à la maquette (objectif 1 statique, objectif 2 statique,
  // carte ajoutée via addObjectif). Le rendu dépend de l'origine de la carte, pas de son numéro
  // d'affichage, pour rester correct après suppression d'une carte intermédiaire.
  const objetOptionsFull = [
    "Préparer ma transmission patrimoniale",
    "Préparer ma retraite",
    "Optimiser ma fiscalité",
    "Protéger ma famille",
    "Acquérir un bien immobilier",
    "Investir pour générer des revenus",
    "Constituer un capital",
    "Financer les études de mes enfants",
    "Anticiper une cession professionnelle",
    "Diversifier mon patrimoine",
    "Autre · préciser",
  ];
  const objetOptionsReduced = [
    "Optimiser ma fiscalité",
    "Préparer ma transmission patrimoniale",
    "Préparer ma retraite",
    "Protéger ma famille",
    "Acquérir un bien immobilier",
    "Autre · préciser",
  ];
  // Objectif 1 : liste complète, Importance « Élevée », initier « Court terme », atteindre « Long terme »
  // Objectif 2 : liste réduite, Importance « Moyenne », initier « Urgent », atteindre « Court terme »
  // Carte ajoutée : liste complète, Importance « Moyenne », initier « Court terme », atteindre « Moyen terme »
  const objetOptions = kind === "obj2" ? objetOptionsReduced : objetOptionsFull;

  const importanceOptions = kind === "obj1"
    ? ["Élevée", "Moyenne", "Faible"]
    : ["Moyenne", "Élevée", "Faible"];

  const initierOptions = kind === "obj2"
    ? ["Urgent (moins d'un an)", "Court terme (1 à 2 ans)", "Moyen terme (3 à 5 ans)", "Long terme (5 à 10 ans)", "Très long terme (plus de 10 ans)"]
    : ["Court terme (1 à 2 ans)", "Urgent (moins d'un an)", "Moyen terme (3 à 5 ans)", "Long terme (5 à 10 ans)", "Très long terme (plus de 10 ans)"];

  let atteindreOptions: string[];
  if (kind === "obj1") {
    atteindreOptions = ["Long terme (5 à 10 ans)", "Urgent (moins d'un an)", "Court terme (1 à 2 ans)", "Moyen terme (3 à 5 ans)", "Très long terme (plus de 10 ans)"];
  } else if (kind === "obj2") {
    atteindreOptions = ["Court terme (1 à 2 ans)", "Urgent (moins d'un an)", "Moyen terme (3 à 5 ans)", "Long terme (5 à 10 ans)", "Très long terme (plus de 10 ans)"];
  } else {
    atteindreOptions = ["Moyen terme (3 à 5 ans)", "Urgent (moins d'un an)", "Court terme (1 à 2 ans)", "Long terme (5 à 10 ans)", "Très long terme (plus de 10 ans)"];
  }

  return (
    <div className="obj-card">
      <div className="obj-card-num">Objectif n° {num}</div>
      <button className="obj-card-remove" onClick={onRemove}>×</button>
      <div className="obj-card-field">
        <label className="field-label">Quel est cet objectif ?</label>
        <select className="select-input" defaultValue={objetOptions[0]}>
          {objetOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="obj-card-importance">
        <label className="field-label">Importance</label>
        <select className="select-input" defaultValue={importanceOptions[0]}>
          {importanceOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="obj-card-horizons">
        <div>
          <label className="field-label">Quand initier ?</label>
          <select className="select-input" defaultValue={initierOptions[0]}>
            {initierOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Quand atteindre ?</label>
          <select className="select-input" defaultValue={atteindreOptions[0]}>
            {atteindreOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
