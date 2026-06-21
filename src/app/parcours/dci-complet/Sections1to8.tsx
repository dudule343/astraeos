// Sections 1 à 8 du DCI complet — port JSX 1:1 de la maquette.
// Markup statique ; l'interactivité est gérée par délégation (dciLogic.ts)
// via les attributs data-action.

export function Sections1to8() {
  return (
    <>
      {/* ═══════════ SECTION 01 · BIENVENUE ═══════════ */}
      <div className="section active" data-step="1">
        <div className="welcome-frame">
          <div className="welcome-mark" style={{ color: 'var(--gold)' }}>
            <svg><use href="#ic-tree" /></svg>
            <span style={{ color: 'var(--navy)' }}>PRIVEOS</span>
          </div>
          <div className="welcome-line" />
          <div className="welcome-name">Bonjour,<br /><span className="welcome-name-civilite">Monsieur Bertrand DUPONT-TOPIN</span></div>
          <div className="welcome-message">
            En prévision de notre entretien initial du <strong>vendredi 22 mai 2026</strong>, nous vous invitons à compléter ce document détaillé qui constitue le socle de votre étude patrimoniale.
            <br /><br />
            Il vous prendra environ <strong>30 à 45 minutes</strong>. Vos réponses sont sauvegardées automatiquement, vous pouvez le compléter en plusieurs fois.
          </div>
          <div className="welcome-noteinfo">
            <strong className="note-pre">À noter ·</strong> En cas de question pendant le remplissage, votre ingénieur patrimonial reste à votre disposition. Toutes vos données sont protégées (RGPD) et la qualité du conseil dépend de l&apos;exactitude des informations que vous nous transmettez.
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 02 · FOYER ═══════════ */}
      <div className="section" data-step="2">
        <div className="section-header">
          <div className="section-eyebrow">Étape 2 sur 22</div>
          <h1 className="section-title">Votre foyer</h1>
          <div className="section-subtitle">Nous vous invitons à nous partager les informations qui composent votre foyer.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Client 1</div>
              <div className="q-block-subtitle">Informations personnelles du Client 1</div>
            </div>
          </div>
          <div className="field-row-3">
            <div className="field">
              <label className="field-label">Civilité <span className="required">*</span></label>
              <select className="select-input"><option>Monsieur</option><option>Madame</option></select>
            </div>
            <div className="field">
              <label className="field-label">Prénom <span className="required">*</span></label>
              <input type="text" className="text-input prefilled" defaultValue="Bertrand" />
            </div>
            <div className="field">
              <label className="field-label">Nom <span className="required">*</span></label>
              <input type="text" className="text-input prefilled" defaultValue="DUPONT-TOPIN" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Nom de naissance <span className="opt">si différent</span></label>
            <input type="text" className="text-input" placeholder="Si différent du nom usuel" />
          </div>
          <div className="field-row-3">
            <div className="field">
              <label className="field-label">Date de naissance <span className="required">*</span></label>
              <input type="date" className="text-input prefilled" defaultValue="1964-03-12" />
            </div>
            <div className="field">
              <label className="field-label">Lieu de naissance <span className="required">*</span></label>
              <input type="text" className="text-input" placeholder="Ville" />
            </div>
            <div className="field">
              <label className="field-label">Pays de naissance <span className="required">*</span></label>
              <select className="select-input"><option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option><option>Autre</option></select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Nationalité <span className="required">*</span></label>
              <select className="select-input"><option>Française</option><option>Autre pays UE</option><option>Hors UE</option></select>
            </div>
            <div className="field">
              <label className="field-label">Seconde nationalité <span className="opt">si applicable</span></label>
              <select className="select-input"><option>Aucune</option><option>Belge</option><option>Suisse</option><option>Autre</option></select>
            </div>
          </div>
        </div>

        <div className="q-block" id="conjoint-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Client 2</div>
              <div className="q-block-subtitle">Informations personnelles du Client 2</div>
            </div>
          </div>
          <div className="field-row-3">
            <div className="field">
              <label className="field-label">Civilité <span className="required">*</span></label>
              <select className="select-input"><option>Madame</option><option>Monsieur</option></select>
            </div>
            <div className="field">
              <label className="field-label">Prénom <span className="required">*</span></label>
              <input type="text" className="text-input prefilled" defaultValue="Monique" />
            </div>
            <div className="field">
              <label className="field-label">Nom <span className="required">*</span></label>
              <input type="text" className="text-input prefilled" defaultValue="DUPONT-TOPIN" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Nom de naissance <span className="opt">si différent</span></label>
            <input type="text" className="text-input" placeholder="Si différent du nom usuel" />
          </div>
          <div className="field-row-3">
            <div className="field">
              <label className="field-label">Date de naissance <span className="required">*</span></label>
              <input type="date" className="text-input prefilled" defaultValue="1968-07-22" />
            </div>
            <div className="field">
              <label className="field-label">Lieu de naissance <span className="required">*</span></label>
              <input type="text" className="text-input" placeholder="Ville" />
            </div>
            <div className="field">
              <label className="field-label">Pays de naissance <span className="required">*</span></label>
              <select className="select-input"><option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option><option>Autre</option></select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Nationalité <span className="required">*</span></label>
              <select className="select-input"><option>Française</option><option>Autre pays UE</option><option>Hors UE</option></select>
            </div>
            <div className="field">
              <label className="field-label">Seconde nationalité <span className="opt">si applicable</span></label>
              <select className="select-input"><option>Aucune</option><option>Belge</option><option>Suisse</option><option>Autre</option></select>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Vos enfants</div>
              <div className="q-block-subtitle">Informations détaillées pour chaque enfant</div>
            </div>
          </div>
          <div className="dyn-table-header h-enfant">
            <div>Prénom</div>
            <div>Date de naissance</div>
            <div>Filiation</div>
            <div>À charge</div>
            <div />
          </div>
          <div className="dyn-wrap" id="enfantsTable">
            <div className="dyn-row dyn-row-enfant">
              <input type="text" className="text-input prefilled" defaultValue="Camille" />
              <input type="date" className="text-input prefilled" defaultValue="1996-04-18" />
              <select className="select-input"><option>Du couple</option><option>De Monsieur</option><option>De Madame</option></select>
              <select className="select-input"><option>Non</option><option>Oui</option></select>
              <div className="dyn-row-remove" data-action="remove-parent">×</div>
            </div>
            <div className="dyn-row dyn-row-enfant">
              <input type="text" className="text-input prefilled" defaultValue="Antoine" />
              <input type="date" className="text-input prefilled" defaultValue="1999-11-03" />
              <select className="select-input"><option>Du couple</option><option>De Monsieur</option><option>De Madame</option></select>
              <select className="select-input"><option>Non</option><option>Oui</option></select>
              <div className="dyn-row-remove" data-action="remove-parent">×</div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-enfant">
            <svg><use href="#ic-plus" /></svg>
            Ajouter un enfant
          </button>
        </div>
      </div>

      {/* ═══════════ SECTION 03 · COORDONNÉES ═══════════ */}
      <div className="section" data-step="3">
        <div className="section-header">
          <div className="section-eyebrow">Étape 3 sur 22</div>
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
            <input type="text" className="text-input prefilled" defaultValue="48 rue de l'Université" />
          </div>
          <div className="field">
            <label className="field-label">Complément d&apos;adresse <span className="opt">facultatif</span></label>
            <input type="text" className="text-input" placeholder="Bâtiment, étage, appartement…" />
          </div>
          <div className="field-row-3">
            <div className="field">
              <label className="field-label">Code postal <span className="required">*</span></label>
              <input type="text" className="text-input prefilled" defaultValue="75007" />
            </div>
            <div className="field">
              <label className="field-label">Ville <span className="required">*</span></label>
              <input type="text" className="text-input prefilled" defaultValue="Paris" />
            </div>
            <div className="field">
              <label className="field-label">Pays <span className="required">*</span></label>
              <select className="select-input"><option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option><option>Autre</option></select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Date d&apos;emménagement dans cette résidence</label>
            <input type="date" className="text-input" />
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Adresse fiscale</div>
              <div className="q-block-subtitle">Si différente de votre adresse principale</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Votre adresse fiscale est-elle la même que votre adresse principale ?</label>
            <div className="yesno">
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="addrFiscale">Oui, identique</div>
              <div className="yesno-option" data-action="toggle-yn" data-show="addrFiscale">Non, différente</div>
            </div>
          </div>
          <div className="conditional" id="addrFiscale">
            <div className="field">
              <label className="field-label">Adresse fiscale</label>
              <input type="text" className="text-input" placeholder="Adresse complète" />
            </div>
            <div className="field-row-3">
              <div className="field"><label className="field-label">Code postal</label><input type="text" className="text-input" /></div>
              <div className="field"><label className="field-label">Ville</label><input type="text" className="text-input" /></div>
              <div className="field"><label className="field-label">Pays</label><select className="select-input"><option>France</option><option>Autre</option></select></div>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Vos coordonnées personnelles</div>
              <div className="q-block-subtitle">Téléphone et e-mail pour vous joindre</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Tél. · Bertrand DUPONT-TOPIN <span className="required">*</span></label>
              <input type="tel" className="text-input prefilled" defaultValue="+33 6 12 34 56 78" />
            </div>
            <div className="field">
              <label className="field-label">E-mail · Bertrand DUPONT-TOPIN <span className="required">*</span></label>
              <input type="email" className="text-input prefilled" defaultValue="bertrand.dupont@email.fr" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Tél. · Monique DUPONT-TOPIN <span className="required">*</span></label>
              <input type="tel" className="text-input prefilled" defaultValue="+33 6 98 76 54 32" />
            </div>
            <div className="field">
              <label className="field-label">E-mail · Monique DUPONT-TOPIN <span className="required">*</span></label>
              <input type="email" className="text-input prefilled" defaultValue="monique.dupont@email.fr" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Téléphone fixe <span className="opt">facultatif</span></label>
            <input type="tel" className="text-input" />
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 04 · INFORMATIONS COMPLÉMENTAIRES ═══════════ */}
      <div className="section" data-step="4">
        <div className="section-header">
          <div className="section-eyebrow">Étape 4 sur 22</div>
          <h1 className="section-title">Informations complémentaires</h1>
          <div className="section-subtitle">Quelques précisions réglementaires nécessaires à la qualité du conseil.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Capacité juridique</div>
              <div className="q-block-subtitle">Pour chaque membre du foyer · Bertrand et Monique DUPONT-TOPIN</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Capacité juridique · Bertrand DUPONT-TOPIN <span className="required">*</span></label>
              <select className="select-input"><option>Capacité juridique pleine</option><option>Sous tutelle</option><option>Sous curatelle</option><option>Sauvegarde de justice</option></select>
            </div>
            <div className="field">
              <label className="field-label">Capacité juridique · Monique DUPONT-TOPIN <span className="required">*</span></label>
              <select className="select-input"><option>Capacité juridique pleine</option><option>Sous tutelle</option><option>Sous curatelle</option><option>Sauvegarde de justice</option></select>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Statut FATCA / US Person</div>
              <div className="q-block-subtitle">Réglementation américaine FATCA pour la conformité fiscale</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Êtes-vous citoyen américain ou résident fiscal aux États-Unis ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="usPerson">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="usPerson">Non</div>
            </div>
          </div>
          <div className="conditional" id="usPerson">
            <div className="assets-list" id="fatcaList">
              <div className="asset-detail visible" style={{ marginBottom: '12px' }} id="fatca-1">
                <div className="asset-detail-group">
                  <div className="field">
                    <label className="field-label">Qui est concerné ?</label>
                    <select className="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
                  </div>
                  <div className="field">
                    <label className="field-label">Précisez la situation</label>
                    <select className="select-input"><option>Citoyen américain</option><option>Résident fiscal aux États-Unis</option><option>Détenteur d&apos;une Green Card</option><option>Personne née aux États-Unis</option></select>
                  </div>
                  <div className="field">
                    <label className="field-label">Numéro d&apos;identification fiscale américain (TIN / SSN)</label>
                    <input type="text" className="text-input" placeholder="XXX-XX-XXXX" />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-add-asset" data-action="add-fatca"><svg><use href="#ic-plus" /></svg>Ajouter une personne supplémentaire</button>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Personne Politiquement Exposée (PPE)</div>
              <div className="q-block-subtitle">Conformité LCB-FT · obligation réglementaire</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Exercez-vous, ou avez-vous exercé au cours des 12 derniers mois, des fonctions publiques importantes ?</label>
            <div className="field-help">Fonctions politiques, judiciaires, militaires ou administratives de premier rang en France ou à l&apos;étranger</div>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="ppeDetail">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="ppeDetail">Non</div>
            </div>
          </div>
          <div className="conditional" id="ppeDetail">
            <div className="assets-list" id="ppeList">
              <div className="asset-detail visible" style={{ marginBottom: '12px' }} id="ppe-1">
                <div className="asset-detail-group">
                  <div className="field">
                    <label className="field-label">Qui est concerné ?</label>
                    <select className="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
                  </div>
                  <div className="field">
                    <label className="field-label">Précisez la fonction occupée</label>
                    <input type="text" className="text-input" placeholder="Fonction publique, mandat, poste de direction…" />
                  </div>
                  <div className="field">
                    <label className="field-label">Période</label>
                    <input type="text" className="text-input" placeholder="Ex. : depuis 2018" />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-add-asset" data-action="add-ppe"><svg><use href="#ic-plus" /></svg>Ajouter une personne supplémentaire</button>
          </div>
          <div className="field">
            <label className="field-label">Un membre de votre famille proche occupe-t-il une telle fonction ?</label>
            <div className="field-help">Enfant, parent, frère, sœur ou autre lien familial direct</div>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="ppeFamDetail">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="ppeFamDetail">Non</div>
            </div>
          </div>
          <div className="conditional" id="ppeFamDetail">
            <div className="assets-list" id="ppeFamList" />
            <button className="btn-add-asset" data-action="add-ppe-famille"><svg><use href="#ic-plus" /></svg>Ajouter une personne</button>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 05 · SITUATION MATRIMONIALE ═══════════ */}
      <div className="section" data-step="5">
        <div className="section-header">
          <div className="section-eyebrow">Étape 5 sur 22</div>
          <h1 className="section-title">Situation matrimoniale</h1>
          <div className="section-subtitle">Régime matrimonial, contrats et dispositions de transmission.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Régime matrimonial</div>
              <div className="q-block-subtitle">Précisions sur votre union officielle</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Statut <span className="required">*</span></label>
              <select className="select-input prefilled"><option>Marié(e)</option><option>Pacsé(e)</option><option>Concubin(e)</option><option>Célibataire</option><option>Divorcé(e)</option><option>Veuf / Veuve</option></select>
            </div>
            <div className="field">
              <label className="field-label">Date de l&apos;union <span className="required">*</span></label>
              <input type="date" className="text-input prefilled" defaultValue="1990-06-15" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Lieu de l&apos;union</label>
              <input type="text" className="text-input" placeholder="Ville" />
            </div>
            <div className="field">
              <label className="field-label">Régime matrimonial <span className="required">*</span></label>
              <select className="select-input prefilled"><option>Communauté légale</option><option>Séparation de biens</option><option>Communauté universelle</option><option>Participation aux acquêts</option><option>Autre</option></select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Avez-vous établi un contrat de mariage ou une convention de PACS écrite ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="contratMariage">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="contratMariage">Non</div>
            </div>
          </div>
          <div className="conditional" id="contratMariage">
            <div className="field-row">
              <div className="field"><label className="field-label">Date du contrat</label><input type="date" className="text-input" /></div>
              <div className="field"><label className="field-label">Notaire rédacteur</label><input type="text" className="text-input" placeholder="Nom du notaire" /></div>
            </div>
            <div className="field">
              <label className="field-label">Clauses particulières <span className="opt">facultatif</span></label>
              <input type="text" className="text-input" placeholder="Ex. : préciput, attribution intégrale au conjoint survivant…" />
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Donations entre époux</div>
              <div className="q-block-subtitle">Donations au dernier vivant ou autres dispositions entre conjoints</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Avez-vous mis en place une donation entre époux ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="donationEpoux">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="donationEpoux">Non</div>
            </div>
          </div>
          <div className="conditional" id="donationEpoux">
            <div className="field-row">
              <div className="field"><label className="field-label">Date de la donation</label><input type="date" className="text-input" /></div>
              <div className="field"><label className="field-label">Notaire rédacteur</label><input type="text" className="text-input" /></div>
            </div>
            <div className="field">
              <label className="field-label">Type de donation</label>
              <select className="select-input"><option>Donation au dernier vivant</option><option>Donation-partage</option><option>Donation simple</option></select>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Testament</div>
              <div className="q-block-subtitle">Dispositions testamentaires existantes</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Avez-vous rédigé un testament ?</label>
            <div className="yesno">
              <div className="yesno-option selected" data-action="toggle-yn" data-show="testament">Oui</div>
              <div className="yesno-option" data-action="toggle-yn" data-hide="testament">Non</div>
              <div className="yesno-option" data-action="toggle-yn" data-hide="testament">Je ne sais pas</div>
            </div>
          </div>
          <div className="conditional visible" id="testament">
            <div className="field-row">
              <div className="field">
                <label className="field-label">Type de testament</label>
                <select className="select-input" data-action="testament-def">
                  <option value="olographe">Testament olographe</option>
                  <option value="authentique">Testament authentique</option>
                  <option value="mystique">Testament mystique</option>
                </select>
              </div>
              <div className="field"><label className="field-label">Date de rédaction</label><input type="date" className="text-input" /></div>
            </div>
            <div
              className="testament-def-block"
              id="testamentDef"
              style={{ background: 'var(--ivory)', borderLeft: '2px solid var(--gold)', padding: '14px 20px', borderRadius: '6px', marginTop: '-4px', marginBottom: '16px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.65 }}
            >
              <strong style={{ color: 'var(--gold)', letterSpacing: '0.06em' }}>Testament olographe ·</strong> <span id="testamentDefText">Testament entièrement <strong>écrit, daté et signé de la main du testateur</strong>. Il n&apos;exige pas l&apos;intervention d&apos;un notaire, mais doit respecter scrupuleusement ces trois conditions pour être valide. C&apos;est la forme la plus simple et la plus répandue.</span>
            </div>
            <div className="field">
              <label className="field-label">Lieu de conservation</label>
              <input type="text" className="text-input" placeholder="Ex. : déposé chez Me Martin, notaire à Paris" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 06 · CONTEXTE FAMILIAL ═══════════ */}
      <div className="section" data-step="6">
        <div className="section-header">
          <div className="section-eyebrow">Étape 6 sur 22</div>
          <h1 className="section-title">Contexte et événements familiaux</h1>
          <div className="section-subtitle">Projets et changements à venir qui peuvent impacter votre situation patrimoniale.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Événements familiaux à venir</div>
              <div className="q-block-subtitle">Mariage, naissance, départ d&apos;un enfant, séparation…</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Anticipez-vous un événement familial significatif dans les 3 prochaines années ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="eventFam">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="eventFam">Non</div>
            </div>
          </div>
          <div className="conditional" id="eventFam">
            <div className="assets-list" id="eventsList" />
            <button className="btn-add-asset" data-action="add-event"><svg><use href="#ic-plus" /></svg>Ajouter un événement</button>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Succession à recevoir</div>
              <div className="q-block-subtitle">Héritage anticipé ou succession en cours</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Avez-vous connaissance d&apos;une succession à recevoir prochainement ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="successionRecevoir">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="successionRecevoir">Non</div>
            </div>
          </div>
          <div className="conditional" id="successionRecevoir">
            <div className="field-row">
              <div className="field"><label className="field-label">Qui est concerné ?</label>
                <select className="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select></div>
              <div className="field"><label className="field-label">Lien avec la personne décédée</label>
                <select className="select-input"><option>Père</option><option>Mère</option><option>Frère</option><option>Sœur</option><option>Grand-père</option><option>Grand-mère</option><option>Oncle / Tante</option><option>Cousin(e)</option><option>Autre</option></select></div>
            </div>
            <div className="field-row">
              <div className="field"><label className="field-label">Estimation du montant total</label><input type="text" className="text-input" placeholder="Montant approximatif en €" /></div>
              <div className="field"><label className="field-label">Date estimée <span className="opt">facultatif</span></label><input type="date" className="text-input" /></div>
            </div>
            <div className="field"><label className="field-label">Nature des biens transmis</label><input type="text" className="text-input" placeholder="Immobilier, financier, entreprise…" /></div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Donations reçues ou consenties</div>
              <div className="q-block-subtitle">Donations antérieures dont vous avez bénéficié ou que vous avez consenties</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Avez-vous reçu ou consenti des donations dans les 15 dernières années ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="donationsAnt">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="donationsAnt">Non</div>
            </div>
          </div>
          <div className="conditional" id="donationsAnt">
            <div className="assets-list" id="donationsList" />
            <button className="btn-add-asset" data-action="add-donation"><svg><use href="#ic-plus" /></svg>Ajouter une donation</button>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">IV</div>
            <div className="q-block-text">
              <div className="q-block-title">Relations familiales</div>
              <div className="q-block-subtitle">Climat relationnel au sein de la famille proche et élargie</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Existe-t-il une relation conflictuelle avec un membre de votre famille ?</label>
            <div className="field-help">Information confidentielle utile pour vous accompagner sur les enjeux de transmission et de succession</div>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="relConflit">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="relConflit">Non</div>
            </div>
          </div>
          <div className="conditional" id="relConflit">
            <div className="field"><label className="field-label">Personne concernée du foyer</label>
              <select className="select-input">
                <option>Bertrand DUPONT-TOPIN</option>
                <option>Monique DUPONT-TOPIN</option>
                <option>Les deux</option>
              </select></div>
            <div className="field"><label className="field-label">Précisez la nature de la relation</label>
              <textarea className="text-input" rows={3} placeholder="Décrivez librement la nature de la relation et les éventuelles tensions…" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div className="field-help">Ce champ reste strictement confidentiel et n&apos;est consulté que par votre ingénieur patrimonial</div>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">V</div>
            <div className="q-block-text">
              <div className="q-block-title">Santé du foyer</div>
              <div className="q-block-subtitle">État général de santé des membres du foyer</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Considérez-vous que le foyer est en bonne santé ?</label>
            <div className="field-help">C&apos;est-à-dire : aucune personne du foyer n&apos;a de pronostic vital engagé à court ou moyen terme</div>
            <div className="yesno">
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="santeDetail">Oui</div>
              <div className="yesno-option" data-action="toggle-yn" data-show="santeDetail">Non</div>
            </div>
          </div>
          <div className="conditional" id="santeDetail">
            <div className="field"><label className="field-label">Personne concernée</label>
              <select className="select-input">
                <option>Bertrand DUPONT-TOPIN</option>
                <option>Monique DUPONT-TOPIN</option>
                <option>Un enfant</option>
                <option>Autre membre du foyer</option>
              </select></div>
            <div className="field"><label className="field-label">Précisions <span className="opt">facultatif</span></label>
              <textarea className="text-input" rows={2} placeholder="Éléments que vous souhaitez partager avec votre ingénieur patrimonial…" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div className="field-help">Information confidentielle utile pour anticiper certaines dispositions patrimoniales (prévoyance, transmission, mandat de protection)</div>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">VI</div>
            <div className="q-block-text">
              <div className="q-block-title">Situation de handicap</div>
              <div className="q-block-subtitle">Présence d&apos;une personne en situation de handicap au sein du foyer</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Une personne au sein du foyer est-elle en situation de handicap ?</label>
            <div className="field-help">Cette information ouvre droit à des dispositifs spécifiques (rente survie, contrat épargne handicap, AAH…)</div>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="handicapDetail">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="handicapDetail">Non</div>
            </div>
          </div>
          <div className="conditional" id="handicapDetail">
            <div className="field-row">
              <div className="field"><label className="field-label">Personne concernée</label>
                <select className="select-input">
                  <option>Bertrand DUPONT-TOPIN</option>
                  <option>Monique DUPONT-TOPIN</option>
                  <option>Un enfant</option>
                  <option>Autre membre du foyer</option>
                </select></div>
              <div className="field"><label className="field-label">Taux d&apos;incapacité reconnu</label>
                <select className="select-input">
                  <option>—</option>
                  <option>Inférieur à 50 %</option>
                  <option>De 50 % à 79 %</option>
                  <option>80 % et plus</option>
                </select></div>
            </div>
            <div className="field"><label className="field-label">Précisions <span className="opt">facultatif</span></label>
              <textarea className="text-input" rows={2} placeholder="Nature du handicap, accompagnement en place…" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 07 · SITUATION PROFESSIONNELLE ═══════════ */}
      <div className="section" data-step="7">
        <div className="section-header">
          <div className="section-eyebrow">Étape 7 sur 22</div>
          <h1 className="section-title">Situation professionnelle</h1>
          <div className="section-subtitle">Activité, employeur et perspectives professionnelles.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Activité professionnelle · Bertrand DUPONT-TOPIN</div>
              <div className="q-block-subtitle">Précisions sur l&apos;activité</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Statut professionnel <span className="required">*</span></label>
              <select className="select-input prefilled"><option>Profession libérale</option><option>Dirigeant d&apos;entreprise</option><option>Salarié du privé</option><option>Salarié du public</option><option>Retraité</option><option>Sans activité</option></select>
            </div>
            <div className="field">
              <label className="field-label">Catégorie socioprofessionnelle <span className="required">*</span></label>
              <select className="select-input"><option>Cadre supérieur / Profession libérale</option><option>Cadre</option><option>Profession intermédiaire</option><option>Employé</option><option>Artisan / Commerçant</option><option>Chef d&apos;entreprise</option></select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Profession exacte <span className="required">*</span></label>
            <input type="text" className="text-input prefilled" defaultValue="Cardiologue libéral" />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Nom de la structure</label>
              <input type="text" className="text-input" placeholder="Cabinet, entreprise, hôpital…" />
            </div>
            <div className="field">
              <label className="field-label">SIRET <span className="opt">si applicable</span></label>
              <input type="text" className="text-input" placeholder="14 chiffres" />
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Date de début d&apos;activité</label><input type="date" className="text-input" /></div>
            <div className="field">
              <label className="field-label">Date de départ en retraite envisagée</label>
              <input type="date" className="text-input" />
            </div>
          </div>
          <div className="assets-list" id="activitesBertrandList" style={{ marginTop: '16px' }} />
          <button className="btn-add-asset" data-action="add-activite" data-personne="Bertrand"><svg><use href="#ic-plus" /></svg>Ajouter une activité supplémentaire pour Bertrand</button>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Activité professionnelle · Monique DUPONT-TOPIN</div>
              <div className="q-block-subtitle">Précisions sur l&apos;activité</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Statut professionnel <span className="required">*</span></label>
              <select className="select-input prefilled"><option>Salarié du privé</option><option>Dirigeant d&apos;entreprise</option><option>Profession libérale</option><option>Salarié du public</option><option>Retraité</option><option>Sans activité</option></select>
            </div>
            <div className="field">
              <label className="field-label">Catégorie socioprofessionnelle <span className="required">*</span></label>
              <select className="select-input"><option>Cadre supérieur</option><option>Cadre</option><option>Profession intermédiaire</option><option>Employé</option></select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Profession exacte <span className="required">*</span></label>
            <input type="text" className="text-input prefilled" defaultValue="Directrice marketing" />
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Nom de la structure</label><input type="text" className="text-input" /></div>
            <div className="field"><label className="field-label">SIRET <span className="opt">si applicable</span></label><input type="text" className="text-input" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Date de début d&apos;activité</label><input type="date" className="text-input" /></div>
            <div className="field"><label className="field-label">Date de départ en retraite envisagée</label><input type="date" className="text-input" /></div>
          </div>
          <div className="assets-list" id="activitesMoniqueList" style={{ marginTop: '16px' }} />
          <button className="btn-add-asset" data-action="add-activite" data-personne="Monique"><svg><use href="#ic-plus" /></svg>Ajouter une activité supplémentaire pour Monique</button>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Projets professionnels</div>
              <div className="q-block-subtitle">Changements à venir dans votre activité</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Anticipez-vous un changement professionnel significatif dans les 3 prochaines années ?</label>
            <div className="field-help">Cession d&apos;entreprise, départ en retraite, reconversion, création d&apos;activité…</div>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="projPro">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="projPro">Non</div>
            </div>
          </div>
          <div className="conditional" id="projPro">
            <div className="assets-list" id="projetsList" />
            <button className="btn-add-asset" data-action="add-projet"><svg><use href="#ic-plus" /></svg>Ajouter un projet professionnel</button>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 08 · FISCALITÉ ═══════════ */}
      <div className="section" data-step="8">
        <div className="section-header">
          <div className="section-eyebrow">Étape 8 sur 22</div>
          <h1 className="section-title">Votre fiscalité</h1>
          <div className="section-subtitle">Composition fiscale du foyer et imposition.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Composition du foyer fiscal</div>
              <div className="q-block-subtitle">Nombre de parts fiscales</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Nombre de parts fiscales</label><input type="number" className="text-input" defaultValue="3" min="1" step="0.5" /></div>
            <div className="field"><label className="field-label">Nombre de personnes à charge</label><input type="number" className="text-input" defaultValue="0" min="0" /></div>
          </div>
          <div className="field">
            <label className="field-label">Pays de résidence fiscale principal <span className="required">*</span></label>
            <select className="select-input prefilled" id="residenceFiscale" data-action="res-fisc">
              <option value="france">France</option>
              <option value="ue">Pays de l&apos;Union européenne</option>
              <option value="hors-ue">Pays hors Union européenne</option>
            </select>
          </div>
          <div className="conditional" id="resFiscUE">
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Précisez le pays de l&apos;UE</label>
              <select className="select-input">
                <option>Belgique</option><option>Luxembourg</option><option>Allemagne</option><option>Italie</option><option>Espagne</option><option>Portugal</option><option>Pays-Bas</option><option>Autriche</option><option>Irlande</option><option>Pologne</option><option>République tchèque</option><option>Hongrie</option><option>Roumanie</option><option>Bulgarie</option><option>Croatie</option><option>Slovénie</option><option>Slovaquie</option><option>Estonie</option><option>Lettonie</option><option>Lituanie</option><option>Finlande</option><option>Suède</option><option>Danemark</option><option>Grèce</option><option>Chypre</option><option>Malte</option>
              </select>
            </div>
          </div>
          <div className="conditional" id="resFiscHorsUE">
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Précisez le pays hors UE</label>
              <select className="select-input">
                <option>Suisse</option><option>Royaume-Uni</option><option>États-Unis</option><option>Canada</option><option>Maroc</option><option>Tunisie</option><option>Algérie</option><option>Sénégal</option><option>Côte d&apos;Ivoire</option><option>Émirats arabes unis</option><option>Singapour</option><option>Hong Kong</option><option>Australie</option><option>Japon</option><option>Israël</option><option>Brésil</option><option>Argentine</option><option>Mexique</option><option>Autre · à préciser</option>
              </select>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Impôt sur le revenu</div>
              <div className="q-block-subtitle">Votre dernier avis d&apos;imposition</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Revenu fiscal de référence (N-1)</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
            <div className="field"><label className="field-label">Tranche marginale d&apos;imposition (TMI)</label><select className="select-input"><option>0 %</option><option>11 %</option><option>30 %</option><option>41 %</option><option>45 %</option></select></div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Impôt sur le revenu acquitté (N-1)</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
            <div className="field"><label className="field-label">Taux de prélèvement à la source</label><input type="text" className="text-input" placeholder="Ex. : 18,5 %" /></div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Impôt sur la Fortune Immobilière (IFI)</div>
              <div className="q-block-subtitle">Si votre patrimoine immobilier net excède 1,3 M€</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Êtes-vous redevable de l&apos;IFI ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="ifiDetail">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="ifiDetail">Non</div>
              <div className="yesno-option" data-action="toggle-yn" data-hide="ifiDetail">Je ne sais pas</div>
            </div>
          </div>
          <div className="conditional" id="ifiDetail">
            <div className="field-row">
              <div className="field"><label className="field-label">Patrimoine immobilier net taxable</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              <div className="field"><label className="field-label">Montant d&apos;IFI dû (dernier avis)</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
            </div>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">IV</div>
            <div className="q-block-text">
              <div className="q-block-title">Dispositifs fiscaux en cours</div>
              <div className="q-block-subtitle">Réductions, crédits d&apos;impôt, défiscalisation</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Bénéficiez-vous actuellement de dispositifs fiscaux ?</label>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="fiscDisp">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="fiscDisp">Non</div>
            </div>
          </div>
          <div className="conditional" id="fiscDisp">
            <div className="assets-list" id="dispositifsList" />
            <button className="btn-add-asset" data-action="add-dispositif"><svg><use href="#ic-plus" /></svg>Ajouter un dispositif fiscal</button>
          </div>
        </div>
      </div>
    </>
  );
}
