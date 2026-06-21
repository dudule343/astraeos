// Sections 9 à 13 du DCI complet — port JSX 1:1 de la maquette.

const muted: React.CSSProperties = { fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', fontStyle: 'italic' };

export function Sections9to13() {
  return (
    <>
      {/* ═══════════ SECTION 09 · ACTIFS PROFESSIONNELS ═══════════ */}
      <div className="section" data-step="9">
        <div className="section-header">
          <div className="section-eyebrow">Étape 9 sur 22 · Patrimoine 1/10</div>
          <h1 className="section-title">Actifs professionnels</h1>
          <div className="section-subtitle">Sociétés que vous détenez ou dirigez.</div>
        </div>

        <div className="assets-list" id="assetsListPro">
          {/* Société 1 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="pro-1">
            <div className="asset-row-id">1</div>
            <div className="asset-row-main">
              <div className="asset-row-title">SCI DUPONT FAMILY</div>
              <div className="asset-row-meta">Société Civile Immobilière · 50 % détenus</div>
            </div>
            <div className="asset-row-value">120 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="pro-1">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">1 · Identité de la société</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Dénomination sociale</label><input type="text" className="text-input" defaultValue="SCI DUPONT FAMILY" /></div>
                <div className="field"><label className="field-label">Forme juridique</label><select className="select-input" data-action="forme-juridique"><option>SCI</option><option>SARL</option><option>SAS</option><option>SA</option><option>EURL</option><option>SASU</option><option>SNC</option><option>SELARL</option><option>SELAS</option><option>SCP</option><option>SEL</option><option>SELAFA</option><option>SELCA</option><option>Autre · à préciser</option></select></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">SIREN</label><input type="text" className="text-input" placeholder="9 chiffres" /></div>
                <div className="field"><label className="field-label">Date de création</label><input type="date" className="text-input" /></div>
              </div>
              <div className="field"><label className="field-label">Activité principale</label><input type="text" className="text-input" placeholder="Ex. : gestion d'un patrimoine immobilier locatif" /></div>
            </div>

            <div className="asset-detail-group">
              <div className="asset-detail-group-title">2 · Capital social et valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Capital social</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                <div className="field"><label className="field-label">Valeur estimée de la société</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
            </div>

            <div className="asset-detail-group">
              <div className="asset-detail-group-title">3 · Détention du capital</div>
              <div style={muted}>Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Détenteur</div>
                  <div>Quote-part</div>
                  <div>Mode de détention</div>
                </div>
                <DetentionRow name="Bertrand DUPONT-TOPIN" value="50" prefix="pro-1" />
                <DetentionRow name="Monique DUPONT-TOPIN" value="50" prefix="pro-1" />
                <DetentionRow name="Camille DUPONT-TOPIN" value="0" prefix="pro-1" />
                <DetentionRow name="Antoine DUPONT-TOPIN" value="0" prefix="pro-1" />
                <DetentionRow name="Via une société" value="0" prefix="pro-1" />
                <DetentionRow name="Tiers" value="0" prefix="pro-1" />
                <div className="detention-total is-valid" id="det-total-pro-1">
                  <span>Total détention</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
              <ViaSociete />
            </div>

            <div className="asset-detail-group">
              <div className="asset-detail-group-title">4 · Régime fiscal</div>
              <div className="field"><label className="field-label">Régime fiscal</label><select className="select-input"><option>Impôt sur le revenu (IR)</option><option>Impôt sur les sociétés (IS)</option></select></div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">5 · Fonctions occupées dans la société</div>
              <div style={muted}>Indiquez qui occupe quelle fonction. Vous pouvez ajouter plusieurs personnes (co-gérants, président + directeur général, etc.).</div>
              <div className="assets-list" id="fonctionsList-pro-1">
                <div className="dyn-row dyn-row-fonction" style={{ marginBottom: '10px' }}>
                  <select className="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Camille DUPONT-TOPIN</option><option>Antoine DUPONT-TOPIN</option><option>Autre · à préciser</option></select>
                  <select className="select-input"><option>Gérant</option><option>Co-gérant</option><option>Président</option><option>Directeur général</option><option>Directeur général délégué</option><option>Associé</option><option>Membre du conseil de surveillance</option><option>Autre</option></select>
                  <div className="dyn-row-remove" data-action="remove-parent">×</div>
                </div>
              </div>
              <button className="btn-add-asset" data-action="add-fonction-societe" data-prefix="pro-1"><svg><use href="#ic-plus" /></svg>Ajouter une fonction</button>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">6 · Autres associés</div>
              <div className="field"><label className="field-label">Autres associés <span className="opt">facultatif</span></label><input type="text" className="text-input" placeholder="Précisez les noms des autres associés" /></div>
            </div>

            <PreponderanceDutreil />

            <div className="asset-detail-actions">
              <button className="asset-detail-delete" data-action="stop">Supprimer ce bien</button>
              <button className="asset-detail-save" data-action="stop">Enregistrer</button>
            </div>
          </div>

          {/* Société 2 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="pro-2">
            <div className="asset-row-id">2</div>
            <div className="asset-row-main">
              <div className="asset-row-title">SELARL DR DUPONT</div>
              <div className="asset-row-meta">Société commerciale · 100 % détenus</div>
            </div>
            <div className="asset-row-value">60 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="pro-2">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">1 · Identité de la société</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Dénomination sociale</label><input type="text" className="text-input" defaultValue="SELARL DR DUPONT" /></div>
                <div className="field"><label className="field-label">Forme juridique</label><select className="select-input" data-action="forme-juridique"><option>SELARL</option><option>SELAS</option><option>SCP</option><option>SEL</option><option>SELAFA</option><option>SELCA</option><option>SARL</option><option>SAS</option><option>SA</option><option>EURL</option><option>SASU</option><option>SNC</option><option>SCI</option><option>Autre · à préciser</option></select></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">SIREN</label><input type="text" className="text-input" /></div>
                <div className="field"><label className="field-label">Date de création</label><input type="date" className="text-input" /></div>
              </div>
              <div className="field"><label className="field-label">Activité principale</label><input type="text" className="text-input" defaultValue="Cabinet de cardiologie" /></div>
            </div>

            <div className="asset-detail-group">
              <div className="asset-detail-group-title">2 · Capital social et valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Capital social</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                <div className="field"><label className="field-label">Valeur estimée de la société</label><input type="text" className="text-input" defaultValue="60 000 €" /></div>
              </div>
            </div>

            <div className="asset-detail-group">
              <div className="asset-detail-group-title">3 · Détention du capital</div>
              <div style={muted}>Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Détenteur</div>
                  <div>Quote-part</div>
                  <div>Mode de détention</div>
                </div>
                <DetentionRow name="Bertrand DUPONT-TOPIN" value="100" prefix="pro-2" />
                <DetentionRow name="Monique DUPONT-TOPIN" value="0" prefix="pro-2" />
                <DetentionRow name="Camille DUPONT-TOPIN" value="0" prefix="pro-2" />
                <DetentionRow name="Antoine DUPONT-TOPIN" value="0" prefix="pro-2" />
                <DetentionRow name="Via une société" value="0" prefix="pro-2" />
                <DetentionRow name="Tiers" value="0" prefix="pro-2" />
                <div className="detention-total is-valid" id="det-total-pro-2">
                  <span>Total détention</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
              <ViaSociete />
            </div>

            <div className="asset-detail-group">
              <div className="asset-detail-group-title">4 · Régime fiscal</div>
              <div className="field"><label className="field-label">Régime fiscal</label><select className="select-input"><option>Impôt sur les sociétés (IS)</option><option>Impôt sur le revenu (IR)</option></select></div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">5 · Fonctions occupées dans la société</div>
              <div style={muted}>Indiquez qui occupe quelle fonction. Vous pouvez ajouter plusieurs personnes.</div>
              <div className="assets-list" id="fonctionsList-pro-2">
                <div className="dyn-row dyn-row-fonction" style={{ marginBottom: '10px' }}>
                  <select className="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Camille DUPONT-TOPIN</option><option>Antoine DUPONT-TOPIN</option><option>Autre · à préciser</option></select>
                  <select className="select-input"><option>Gérant</option><option>Co-gérant</option><option>Président</option><option>Directeur général</option><option>Associé</option><option>Autre</option></select>
                  <div className="dyn-row-remove" data-action="remove-parent">×</div>
                </div>
              </div>
              <button className="btn-add-asset" data-action="add-fonction-societe" data-prefix="pro-2"><svg><use href="#ic-plus" /></svg>Ajouter une fonction</button>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">6 · Autres associés</div>
              <div className="field"><label className="field-label">Autres associés <span className="opt">facultatif</span></label><input type="text" className="text-input" /></div>
            </div>

            <PreponderanceDutreil />

            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce bien</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>
        </div>
        <button className="btn-add-asset" data-action="add-societe"><svg><use href="#ic-plus" /></svg>Ajouter une société</button>
      </div>

      {/* ═══════════ SECTION 10 · IMMOBILIER D'USAGE ═══════════ */}
      <div className="section" data-step="10">
        <div className="section-header">
          <div className="section-eyebrow">Étape 10 sur 22 · Patrimoine 2/10</div>
          <h1 className="section-title">Immobilier d&apos;usage</h1>
          <div className="section-subtitle">Votre résidence principale et vos résidences secondaires.</div>
        </div>

        <div className="section-def">
          L&apos;<strong>immobilier d&apos;usage</strong> regroupe les biens immobiliers que vous détenez pour votre <strong>usage personnel</strong> (et non pour la location) : votre résidence principale, vos résidences secondaires, vos pied-à-terre. Si un bien est mis en location, il sera renseigné dans la section suivante.
        </div>

        <div className="assets-list" id="assetsListUsg">
          {/* Résidence principale */}
          <div className="asset-row" data-action="toggle-asset" data-detail="usg-1">
            <div className="asset-row-id">RP</div>
            <div className="asset-row-main">
              <div className="asset-row-title">Résidence principale · 48 rue de l&apos;Université</div>
              <div className="asset-row-meta">Appartement · 120 m² · Paris 75007</div>
            </div>
            <div className="asset-row-value">850 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="usg-1">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Localisation et type</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type de bien</label><select className="select-input"><option>Appartement</option><option>Maison</option><option>Terrain</option><option>Local mixte</option></select></div>
                <div className="field"><label className="field-label">Usage</label><select className="select-input"><option>Résidence principale</option><option>Résidence secondaire</option><option>Bien à usage professionnel</option><option>Pied-à-terre</option></select></div>
              </div>
              <div className="field"><label className="field-label">Adresse</label><input type="text" className="text-input prefilled" id="usg-1-addr" defaultValue="48 rue de l'Université" data-action="sync-loan" data-bien="usg-1" /></div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Code postal</label><input type="text" className="text-input prefilled" defaultValue="75007" /></div>
                <div className="field"><label className="field-label">Ville</label><input type="text" className="text-input prefilled" defaultValue="Paris" /></div>
                <div className="field"><label className="field-label">Pays</label><select className="select-input"><option>France</option><option>Autre</option></select></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Caractéristiques</div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Surface habitable (m²)</label><input type="number" className="text-input" defaultValue="120" /></div>
                <div className="field"><label className="field-label">Nombre de pièces</label><input type="number" className="text-input" /></div>
                <div className="field"><label className="field-label">Année de construction</label><input type="number" className="text-input" placeholder="Ex. : 1925" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">DPE</label><DpeSelect /></div>
                <div className="field"><label className="field-label">GES</label><DpeSelect /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Acquisition et valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Date d&apos;acquisition</label><input type="date" className="text-input" /></div>
                <div className="field"><label className="field-label">Prix d&apos;acquisition</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Frais d&apos;acquisition</label><input type="text" className="text-input" placeholder="Frais de notaire, droits…" /></div>
                <div className="field"><label className="field-label">Valeur brute actuelle estimée</label><input type="text" className="text-input prefilled" defaultValue="850 000 €" /></div>
              </div>
              <div className="field"><label className="field-label">Travaux réalisés depuis l&apos;acquisition <span className="opt">facultatif</span></label><input type="text" className="text-input" placeholder="Montant total des travaux en €" /></div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Financement</div>
              <div className="field">
                <label className="field-label">Un prêt est-il associé à ce bien ?</label>
                <div className="field-help">Si oui, une fiche emprunt sera automatiquement créée et liée dans la section « Emprunts et dettes »</div>
                <div className="yesno">
                  <div className="yesno-option selected" data-action="loan-link" data-bien="usg-1" data-bientype="Bien d&rsquo;usage" data-linked="true">Oui</div>
                  <div className="yesno-option" data-action="loan-link" data-bien="usg-1" data-bientype="Bien d&rsquo;usage" data-linked="false">Non</div>
                </div>
                <div id="loan-link-usg-1" style={{ display: 'block', marginTop: '14px', padding: '14px 18px', background: 'var(--gold-faint)', borderLeft: '2px solid var(--gold)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold)' }}>Fiche emprunt liée ·</strong> Une fiche est automatiquement présente dans la section <strong style={{ color: 'var(--navy)' }}>« Emprunts et dettes »</strong> (Prêt RP BNP) et liée à ce bien.
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Mode de détention</div>
              <div style={muted}>Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Détenteur</div>
                  <div>Quote-part</div>
                  <div>Mode de détention</div>
                </div>
                <DetentionRow name="Bertrand DUPONT-TOPIN" value="50" prefix="usg-1" />
                <DetentionRow name="Monique DUPONT-TOPIN" value="50" prefix="usg-1" />
                <DetentionRow name="Camille DUPONT-TOPIN" value="0" prefix="usg-1" />
                <DetentionRow name="Antoine DUPONT-TOPIN" value="0" prefix="usg-1" />
                <DetentionRow name="Via une société" value="0" prefix="usg-1" />
                <DetentionRow name="Tiers" value="0" prefix="usg-1" />
                <div className="detention-total is-valid" id="det-total-usg-1">
                  <span>Total détention</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
              <ViaSociete />
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce bien</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>
        </div>
        <button className="btn-add-asset" data-action="add-bien-usage"><svg><use href="#ic-plus" /></svg>Ajouter un bien d&apos;usage</button>
      </div>

      {/* ═══════════ SECTION 11 · IMMOBILIER LOCATIF ═══════════ */}
      <div className="section" data-step="11">
        <div className="section-header">
          <div className="section-eyebrow">Étape 11 sur 22 · Patrimoine 3/10</div>
          <h1 className="section-title">Immobilier locatif</h1>
          <div className="section-subtitle">Vos biens immobiliers donnés en location.</div>
        </div>

        <div className="assets-list" id="assetsListLoc">
          {/* Bien locatif 1 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="loc-1">
            <div className="asset-row-id">1</div>
            <div className="asset-row-main">
              <div className="asset-row-title">Appartement Paris 16e</div>
              <div className="asset-row-meta">Appartement T2 · 48 m² · Loué nu · 1 850 €/mois</div>
            </div>
            <div className="asset-row-value">380 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="loc-1">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Localisation et type</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type de bien</label><select className="select-input"><option>Appartement</option><option>Maison</option><option>Local commercial</option><option>Parking / Box</option><option>Terrain</option></select></div>
                <div className="field"><label className="field-label">Type de location</label><select className="select-input"><option>Location nue</option><option>Location meublée non professionnelle (LMNP)</option><option>Location meublée professionnelle (LMP)</option><option>Location saisonnière</option></select></div>
              </div>
              <div className="field"><label className="field-label">Adresse</label><input type="text" className="text-input prefilled" id="loc-1-addr" defaultValue="14 avenue Mozart" data-action="sync-loan" data-bien="loc-1" /></div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Code postal</label><input type="text" className="text-input prefilled" defaultValue="75016" /></div>
                <div className="field"><label className="field-label">Ville</label><input type="text" className="text-input prefilled" defaultValue="Paris" /></div>
                <div className="field"><label className="field-label">Pays</label><select className="select-input"><option>France</option><option>Autre</option></select></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Caractéristiques</div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Surface habitable (m²)</label><input type="number" className="text-input" defaultValue="48" /></div>
                <div className="field"><label className="field-label">Nombre de pièces</label><input type="number" className="text-input" defaultValue="2" /></div>
                <div className="field"><label className="field-label">Année de construction</label><input type="number" className="text-input" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">DPE</label><DpeSelect /></div>
                <div className="field"><label className="field-label">GES</label><DpeSelect /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Acquisition et valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Date d&apos;acquisition</label><input type="date" className="text-input" /></div>
                <div className="field"><label className="field-label">Prix d&apos;acquisition</label><input type="text" className="text-input" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Frais d&apos;acquisition</label><input type="text" className="text-input" /></div>
                <div className="field"><label className="field-label">Valeur brute actuelle estimée</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
              <div className="field"><label className="field-label">Travaux réalisés depuis l&apos;acquisition</label><input type="text" className="text-input" placeholder="Montant total en €" /></div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Financement</div>
              <div className="field">
                <label className="field-label">Un prêt est-il associé à ce bien ?</label>
                <div className="field-help">Si oui, une fiche emprunt sera automatiquement créée et liée dans la section « Emprunts et dettes »</div>
                <div className="yesno">
                  <div className="yesno-option selected" data-action="loan-link" data-bien="loc-1" data-bientype="Bien locatif" data-linked="true">Oui</div>
                  <div className="yesno-option" data-action="loan-link" data-bien="loc-1" data-bientype="Bien locatif" data-linked="false">Non</div>
                </div>
                <div id="loan-link-loc-1" style={{ display: 'block', marginTop: '14px', padding: '14px 18px', background: 'var(--gold-faint)', borderLeft: '2px solid var(--gold)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold)' }}>Fiche emprunt liée ·</strong> Une fiche est automatiquement présente dans la section <strong style={{ color: 'var(--navy)' }}>« Emprunts et dettes »</strong> (Prêt locatif Paris 16e · Crédit Mutuel) et liée à ce bien.
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Mode de détention</div>
              <div style={muted}>Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Détenteur</div>
                  <div>Quote-part</div>
                  <div>Mode de détention</div>
                </div>
                <DetentionRow name="Bertrand DUPONT-TOPIN" value="50" prefix="loc-1" />
                <DetentionRow name="Monique DUPONT-TOPIN" value="50" prefix="loc-1" />
                <DetentionRow name="Camille DUPONT-TOPIN" value="0" prefix="loc-1" />
                <DetentionRow name="Antoine DUPONT-TOPIN" value="0" prefix="loc-1" />
                <DetentionRow name="Via une société" value="0" prefix="loc-1" />
                <DetentionRow name="Tiers" value="0" prefix="loc-1" />
                <div className="detention-total is-valid" id="det-total-loc-1">
                  <span>Total détention</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
              <ViaSociete />
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Exploitation locative</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Loyer mensuel brut perçu</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                <div className="field"><label className="field-label">Loyer annuel brut</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Charges annuelles déductibles</label><input type="text" className="text-input" /></div>
                <div className="field"><label className="field-label">Taxe foncière annuelle</label><input type="text" className="text-input" /></div>
              </div>
              <div className="field">
                <label className="field-label">Date de mise en location</label><input type="date" className="text-input" />
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Régime(s) fiscal(aux)</div>
              <div style={muted}>Si plusieurs détenteurs avec des régimes différents (par exemple quote-part personne physique en IR et quote-part société en IS), vous pouvez en ajouter plusieurs.</div>
              <div className="assets-list" id="regimesList-loc-1">
                <div className="dyn-row dyn-row-fonction" style={{ marginBottom: '10px' }}>
                  <select className="select-input"><option>Micro-foncier</option><option>Réel foncier</option><option>Micro-BIC</option><option>Réel BIC</option><option>Société à l&rsquo;IR</option><option>Société à l&rsquo;IS</option></select>
                  <input type="text" className="text-input" placeholder="Détenteur concerné (ex. : 100 % Bertrand)" />
                  <div className="dyn-row-remove" data-action="remove-parent">×</div>
                </div>
              </div>
              <button className="btn-add-asset" data-action="add-regime" data-prefix="loc-1"><svg><use href="#ic-plus" /></svg>Ajouter un régime fiscal</button>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Dispositif fiscal éventuel</div>
              <div className="field">
                <label className="field-label">Ce bien bénéficie-t-il d&apos;un dispositif fiscal ?</label>
                <select className="select-input"><option>Aucun</option><option>Pinel</option><option>Denormandie</option><option>Malraux</option><option>Monument historique</option><option>Cosse</option><option>Censi-Bouvard</option></select>
              </div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce bien</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>

          {/* Bien locatif 2 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="loc-2">
            <div className="asset-row-id">2</div>
            <div className="asset-row-main">
              <div className="asset-row-title">Maison Cap Ferret</div>
              <div className="asset-row-meta">Maison · 90 m² · Location saisonnière</div>
            </div>
            <div className="asset-row-value">240 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="loc-2">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Localisation et type</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type de bien</label><select className="select-input"><option>Maison</option><option>Appartement</option><option>Local commercial</option><option>Parking / Box</option><option>Terrain</option></select></div>
                <div className="field"><label className="field-label">Type de location</label><select className="select-input"><option>Location saisonnière</option><option>Location nue</option><option>Location meublée non professionnelle (LMNP)</option><option>Location meublée professionnelle (LMP)</option></select></div>
              </div>
              <div className="field"><label className="field-label">Adresse</label><input type="text" className="text-input prefilled" id="loc-2-addr" defaultValue="Avenue de l'Océan, Cap Ferret" data-action="sync-loan" data-bien="loc-2" /></div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Code postal</label><input type="text" className="text-input prefilled" defaultValue="33970" /></div>
                <div className="field"><label className="field-label">Ville</label><input type="text" className="text-input prefilled" defaultValue="Cap Ferret" /></div>
                <div className="field"><label className="field-label">Pays</label><select className="select-input"><option>France</option><option>Autre</option></select></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Caractéristiques</div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Surface habitable (m²)</label><input type="number" className="text-input" defaultValue="90" /></div>
                <div className="field"><label className="field-label">Nombre de pièces</label><input type="number" className="text-input" defaultValue="4" /></div>
                <div className="field"><label className="field-label">Année de construction</label><input type="number" className="text-input" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">DPE</label><DpeSelect /></div>
                <div className="field"><label className="field-label">GES</label><DpeSelect /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Acquisition et valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Date d&apos;acquisition</label><input type="date" className="text-input" /></div>
                <div className="field"><label className="field-label">Prix d&apos;acquisition</label><input type="text" className="text-input" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Frais d&apos;acquisition</label><input type="text" className="text-input" /></div>
                <div className="field"><label className="field-label">Valeur brute estimée</label><input type="text" className="text-input prefilled" defaultValue="240 000 €" /></div>
              </div>
              <div className="field"><label className="field-label">Travaux réalisés depuis l&apos;acquisition</label><input type="text" className="text-input" placeholder="Montant total en €" /></div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Financement</div>
              <div className="field">
                <label className="field-label">Un prêt est-il associé à ce bien ?</label>
                <div className="field-help">Si oui, une fiche emprunt sera automatiquement créée et liée dans la section « Emprunts et dettes »</div>
                <div className="yesno">
                  <div className="yesno-option" data-action="loan-link" data-bien="loc-2" data-bientype="Bien locatif" data-linked="true">Oui</div>
                  <div className="yesno-option selected" data-action="loan-link" data-bien="loc-2" data-bientype="Bien locatif" data-linked="false">Non</div>
                </div>
                <div id="loan-link-loc-2" style={{ display: 'none', marginTop: '14px', padding: '14px 18px', background: 'var(--gold-faint)', borderLeft: '2px solid var(--gold)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold)' }}>Fiche emprunt liée créée ·</strong> Une nouvelle fiche a été ajoutée dans la section <strong style={{ color: 'var(--navy)' }}>« Emprunts et dettes »</strong> et est automatiquement liée à ce bien.
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Mode de détention</div>
              <div style={muted}>Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Détenteur</div><div>Quote-part</div><div>Mode de détention</div>
                </div>
                <DetentionRow name="Bertrand DUPONT-TOPIN" value="50" prefix="loc-2" />
                <DetentionRow name="Monique DUPONT-TOPIN" value="50" prefix="loc-2" />
                <DetentionRow name="Camille DUPONT-TOPIN" value="0" prefix="loc-2" />
                <DetentionRow name="Antoine DUPONT-TOPIN" value="0" prefix="loc-2" />
                <DetentionRow name="Via une société" value="0" prefix="loc-2" />
                <DetentionRow name="Tiers" value="0" prefix="loc-2" />
                <div className="detention-total is-valid" id="det-total-loc-2">
                  <span>Total détention</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Exploitation locative</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Loyer mensuel brut</label><input type="text" className="text-input" placeholder="Saisonnier : moyenne mensuelle" /></div>
                <div className="field"><label className="field-label">Loyer annuel brut</label><input type="text" className="text-input" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Charges annuelles</label><input type="text" className="text-input" /></div>
                <div className="field"><label className="field-label">Taxe foncière</label><input type="text" className="text-input" /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Dispositif fiscal éventuel</div>
              <div className="field">
                <label className="field-label">Ce bien bénéficie-t-il d&apos;un dispositif fiscal ?</label>
                <select className="select-input"><option>Aucun</option><option>Pinel</option><option>Denormandie</option><option>Malraux</option><option>Monument historique</option><option>Cosse</option><option>Censi-Bouvard</option></select>
              </div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce bien</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>
        </div>
        <button className="btn-add-asset" data-action="add-bien-locatif"><svg><use href="#ic-plus" /></svg>Ajouter un bien locatif</button>
      </div>

      {/* ═══════════ SECTION 12 · IMMOBILIER INDIRECT ═══════════ */}
      <div className="section" data-step="12">
        <div className="section-header">
          <div className="section-eyebrow">Étape 12 sur 22 · Patrimoine 4/10</div>
          <h1 className="section-title">Immobilier indirect</h1>
          <div className="section-subtitle">SCPI, OPCI et parts dans des sociétés civiles non détenues directement.</div>
        </div>

        <div className="section-def">
          L&apos;<strong>immobilier indirect</strong> regroupe les parts de SCPI (Sociétés Civiles de Placement Immobilier), d&apos;OPCI (Organismes de Placement Collectif Immobilier) et d&apos;autres véhicules collectifs investis en immobilier que vous détenez en compte-titres ou via une assurance-vie.
        </div>

        <div className="assets-list" id="assetsListIndi">
          {/* SCPI exemple */}
          <div className="asset-row" data-action="toggle-asset" data-detail="indi-1">
            <div className="asset-row-id">1</div>
            <div className="asset-row-main">
              <div className="asset-row-title">SCPI Corum Origin</div>
              <div className="asset-row-meta">Société Civile de Placement Immobilier · Corum AM · 40 parts</div>
            </div>
            <div className="asset-row-value">42 800 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="indi-1">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Identification du support</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type</label><select className="select-input"><option>SCPI</option><option>OPCI</option><option>Parts de SCI</option><option>OPCVM immobilier</option></select></div>
                <div className="field"><label className="field-label">Société de gestion</label><input type="text" className="text-input" defaultValue="Corum AM" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Nom du support</label><input type="text" className="text-input" defaultValue="Corum Origin" /></div>
                <div className="field"><label className="field-label">Date de souscription</label><input type="date" className="text-input" /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Nombre de parts</label><input type="number" className="text-input" defaultValue="40" /></div>
                <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="42 800 €" /></div>
              </div>
              <div className="field"><label className="field-label">Revenus annuels perçus</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Financement</div>
              <div className="field">
                <label className="field-label">Un prêt est-il associé à ce support ?</label>
                <div className="field-help">Les SCPI peuvent être acquises à crédit. Si oui, une fiche emprunt sera automatiquement créée dans « Emprunts et dettes »</div>
                <div className="yesno">
                  <div className="yesno-option" data-action="loan-link" data-bien="indi-1" data-bientype="Immobilier indirect" data-linked="true">Oui</div>
                  <div className="yesno-option selected" data-action="loan-link" data-bien="indi-1" data-bientype="Immobilier indirect" data-linked="false">Non</div>
                </div>
                <div id="loan-link-indi-1" style={{ display: 'none', marginTop: '14px', padding: '14px 18px', background: 'var(--gold-faint)', borderLeft: '2px solid var(--gold)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold)' }}>Fiche emprunt liée créée ·</strong> Une nouvelle fiche a été ajoutée dans la section <strong style={{ color: 'var(--navy)' }}>« Emprunts et dettes »</strong> et est automatiquement liée à ce support.
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Régime(s) fiscal(aux)</div>
              <div style={muted}>Si plusieurs détenteurs avec des régimes différents, vous pouvez en ajouter plusieurs.</div>
              <div className="assets-list" id="regimesList-indi-1">
                <div className="dyn-row dyn-row-fonction" style={{ marginBottom: '10px' }}>
                  <select className="select-input"><option>Revenus fonciers (Micro)</option><option>Revenus fonciers (Réel)</option><option>Revenus de capitaux mobiliers</option><option>Société à l&rsquo;IR</option><option>Société à l&rsquo;IS</option></select>
                  <input type="text" className="text-input" placeholder="Détenteur concerné (ex. : 100 % Bertrand)" />
                  <div className="dyn-row-remove" data-action="remove-parent">×</div>
                </div>
              </div>
              <button className="btn-add-asset" data-action="add-regime" data-prefix="indi-1"><svg><use href="#ic-plus" /></svg>Ajouter un régime fiscal</button>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Mode de détention</div>
              <div style={muted}>Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Détenteur</div>
                  <div>Quote-part</div>
                  <div>Mode de détention</div>
                </div>
                <DetentionRow name="Bertrand DUPONT-TOPIN" value="100" prefix="indi-1" />
                <DetentionRow name="Monique DUPONT-TOPIN" value="0" prefix="indi-1" />
                <DetentionRow name="Camille DUPONT-TOPIN" value="0" prefix="indi-1" />
                <DetentionRow name="Antoine DUPONT-TOPIN" value="0" prefix="indi-1" />
                <DetentionRow name="Via une société" value="0" prefix="indi-1" />
                <DetentionRow name="Tiers" value="0" prefix="indi-1" />
                <div className="detention-total is-valid" id="det-total-indi-1">
                  <span>Total détention</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce support</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>
        </div>
        <button className="btn-add-asset" data-action="add-support-indirect"><svg><use href="#ic-plus" /></svg>Ajouter un support immobilier indirect</button>
      </div>

      {/* ═══════════ SECTION 13 · PLACEMENTS FINANCIERS ═══════════ */}
      <div className="section" data-step="13">
        <div className="section-header">
          <div className="section-eyebrow">Étape 13 sur 22 · Patrimoine 5/10</div>
          <h1 className="section-title">Placements financiers</h1>
          <div className="section-subtitle">Liquidités et comptes réglementés d&apos;une part, investissement financier d&apos;autre part.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Liquidités et comptes réglementés</div>
              <div className="q-block-subtitle">Livret A, LDDS, LEP, Livret jeune, Livret bancaire, Compte à terme, Compte courant</div>
            </div>
          </div>

          <div className="assets-list" id="assetsListFin">
            {/* Livret A */}
            <div className="asset-row" data-action="toggle-asset" data-detail="fin-1">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">Livret A · Crédit Mutuel</div>
                <div className="asset-row-meta">Livret réglementé · Détenteur : Bertrand</div>
              </div>
              <div className="asset-row-value">22 950 €</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="fin-1">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification du support</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Type de support</label><select className="select-input" data-action="adapt-detenteur-cto"><option>Livret A</option><option>LDDS</option><option>LEP</option><option>Livret jeune</option><option>Livret bancaire</option><option>Compte à terme</option><option>Compte courant</option><option>PEA</option><option>PEA-PME</option><option>Compte-titres ordinaire</option><option>Plan d&rsquo;Épargne Entreprise (PEE)</option><option>Plan d&rsquo;Épargne Interentreprises (PEI)</option></select></div>
                  <div className="field"><label className="field-label">Établissement</label><input type="text" className="text-input" defaultValue="Crédit Mutuel" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Numéro de compte / contrat</label><input type="text" className="text-input" placeholder="N° identifiant" /></div>
                  <div className="field"><label className="field-label">Date d&rsquo;ouverture</label><input type="date" className="text-input" /></div>
                </div>
              </div>
              <div className="cto-natures" style={{ display: 'none' }}>
                <div className="asset-detail-group">
                  <div className="asset-detail-group-title">Natures de titres détenus dans le CTO</div>
                  <div style={muted}>Cochez les natures de titres présentes et précisez la valorisation par catégorie si vous le souhaitez.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                    <label className="cto-nature-check"><input type="checkbox" /> Actions françaises et européennes</label>
                    <label className="cto-nature-check"><input type="checkbox" /> Actions étrangères</label>
                    <label className="cto-nature-check"><input type="checkbox" /> Obligations</label>
                    <label className="cto-nature-check"><input type="checkbox" /> OPCVM / ETF</label>
                    <label className="cto-nature-check"><input type="checkbox" /> Parts de SOFICA</label>
                    <label className="cto-nature-check"><input type="checkbox" /> Parts de FCPI</label>
                    <label className="cto-nature-check"><input type="checkbox" /> Parts de FCPR</label>
                    <label className="cto-nature-check"><input type="checkbox" /> Parts de FIP</label>
                    <label className="cto-nature-check"><input type="checkbox" data-action="cto-autre" /> Autres valeurs mobilières</label>
                  </div>
                  <div className="field cto-autre" style={{ display: 'none', marginTop: '14px' }}>
                    <label className="field-label">Précisez les autres valeurs mobilières</label>
                    <input type="text" className="text-input" placeholder="Nature et description" />
                  </div>
                </div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation et détention</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Montant actuel</label><input type="text" className="text-input" defaultValue="22 950 €" /></div>
                  <div className="field">
                    <label className="field-label">Détenteur</label>
                    <select className="select-input">
                      <option>Bertrand DUPONT-TOPIN</option>
                      <option>Monique DUPONT-TOPIN</option>
                    </select>
                    <div className="field-help">Support mono-titulaire · ne peut être qu&rsquo;au nom de Monsieur ou Madame</div>
                  </div>
                </div>
                <div className="field"><label className="field-label">Versement programmé mensuel <span className="opt">facultatif</span></label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer ce bien</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-liquidite"><svg><use href="#ic-plus" /></svg>Ajouter une liquidité ou un compte réglementé</button>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Investissement financier</div>
              <div className="q-block-subtitle">PEA, PEA-PME, Compte-titres ordinaire, PEE, PEI — supports d&apos;investissement en valeurs mobilières (actions, OPCVM, ETF, SOFICA, FCPI, FCPR, FIP…)</div>
            </div>
          </div>

          <div className="assets-list" id="assetsListInvest">
            {/* PEA */}
            <div className="asset-row" data-action="toggle-asset" data-detail="fin-2">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">PEA · BoursoBank</div>
                <div className="asset-row-meta">Plan d&apos;Épargne en Actions · Bertrand · ouvert en 2015</div>
              </div>
              <div className="asset-row-value">95 000 €</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="fin-2">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Type</label><select className="select-input"><option>PEA</option></select></div>
                  <div className="field"><label className="field-label">Établissement</label><input type="text" className="text-input" defaultValue="BoursoBank" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Date d&apos;ouverture</label><input type="date" className="text-input" defaultValue="2015-03-15" /></div>
                  <div className="field">
                    <label className="field-label">Détenteur</label>
                    <select className="select-input">
                      <option>Bertrand DUPONT-TOPIN</option>
                      <option>Monique DUPONT-TOPIN</option>
                    </select>
                    <div className="field-help">Le PEA est mono-titulaire · réservé à une seule personne</div>
                  </div>
                </div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Versements cumulés</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                  <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="95 000 €" /></div>
                </div>
              </div>
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer ce bien</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-investissement"><svg><use href="#ic-plus" /></svg>Ajouter un support d&apos;investissement</button>
        </div>
      </div>
    </>
  );
}

function DetentionRow({ name, value, prefix }: { name: string; value: string; prefix: string }) {
  return (
    <div className="detention-row">
      <div className="detention-row-label">{name}</div>
      <input type="number" className="text-input" min="0" max="100" defaultValue={value} data-action="detention" data-prefix={prefix} />
      <select className="select-input"><option>Pleine propriété</option><option>Usufruit</option><option>Nue-propriété</option></select>
    </div>
  );
}

function DpeSelect() {
  return <select className="select-input"><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option><option>Non communiqué</option></select>;
}

function ViaSociete() {
  return (
    <>
      <div className="field" style={{ marginTop: '14px' }}><label className="field-label">Si &quot;Via une société&quot; · précisez laquelle <span className="opt">facultatif</span></label>
        <select className="select-input" data-action="autre-societe">
          <option>—</option>
          <option>SCI DUPONT FAMILY</option>
          <option>SELARL DR DUPONT</option>
          <option>Autre société · à préciser</option>
        </select>
      </div>
      <div className="field autre-societe" style={{ display: 'none', marginTop: '14px' }}>
        <label className="field-label">Précisez le nom de la société</label>
        <input type="text" className="text-input" placeholder="Nom de la société" />
      </div>
    </>
  );
}

function PreponderanceDutreil() {
  return (
    <div className="asset-detail-group">
      <div className="asset-detail-group-title">7 · Caractéristiques fiscales</div>
      <div className="field"><label className="field-label">La société est-elle à prépondérance immobilière ?</label>
        <div className="field-help" style={{ marginBottom: '16px' }}>Une société est dite à prépondérance immobilière lorsque plus de 50 % de son actif est constitué d&rsquo;immeubles non affectés à sa propre exploitation</div>
        <div className="yesno">
          <div className="yesno-option" data-action="preponderance" data-val="oui">Oui</div>
          <div className="yesno-option selected" data-action="preponderance" data-val="non">Non</div>
        </div>
      </div>
      <div className="conditional preponderance-conditional">
        <div style={{ background: 'var(--ivory)', borderLeft: '2px solid var(--gold)', padding: '14px 18px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--navy)' }}>À noter ·</strong> Une société à prépondérance immobilière ne peut généralement pas bénéficier de l&rsquo;<strong>exonération Pacte Dutreil</strong> (article 787 B du CGI). Exception : si cette société est une <strong>holding animatrice</strong> détenant des participations dans des sociétés opérationnelles. Votre ingénieur patrimonial étudiera ce cas spécifique avec vous.
        </div>
      </div>
      <div className="dutreil-block" style={{ marginTop: '20px' }}>
        <div className="field"><label className="field-label">Les titres sont-ils sous engagement Pacte Dutreil ?</label>
          <div className="field-help" style={{ marginBottom: '16px' }}>Engagement collectif de conservation permettant un abattement de 75 % en cas de transmission</div>
          <div className="yesno">
            <div className="yesno-option" data-action="dutreil" data-val="oui">Oui</div>
            <div className="yesno-option selected" data-action="dutreil" data-val="non">Non</div>
          </div>
        </div>
        <div className="conditional dutreil-conditional">
          <div className="field-row">
            <div className="field"><label className="field-label">Type d&rsquo;engagement</label>
              <select className="select-input"><option>Engagement collectif</option><option>Engagement individuel post-collectif</option><option>Engagement réputé acquis</option></select></div>
            <div className="field"><label className="field-label">Date de signature</label><input type="date" className="text-input" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Durée totale (années)</label><input type="number" className="text-input" placeholder="Ex. : 2 + 4" /></div>
            <div className="field"><label className="field-label">Durée restante (années)</label><input type="number" className="text-input" /></div>
          </div>
          <div className="field"><label className="field-label">Quote-part des titres sous engagement (%)</label>
            <input type="number" className="text-input" min="0" max="100" placeholder="Ex. : 34 ou 100" />
            <div className="field-help">Minimum légal : 17 % du capital pour sociétés cotées · 34 % pour non cotées</div></div>
        </div>
      </div>
    </div>
  );
}
