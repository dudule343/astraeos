// Sections 14 à 18 du DCI complet — port JSX 1:1 de la maquette.
// Ordre des data-step conservé tel quel : 14 (AV), 16 (Épargne retraite),
// 15 (Patrimoine atypique), 17 (Prévoyance), 18 (Emprunts).

const muted: React.CSSProperties = { fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', fontStyle: 'italic' };
const benefPlaceholder = 'Ex. : mon conjoint, à défaut mes enfants par parts égales, à défaut mes héritiers';

export function Sections14to18() {
  return (
    <>
      {/* ═══════════ SECTION 14 · ASSURANCE-VIE ═══════════ */}
      <div className="section" data-step="14">
        <div className="section-header">
          <div className="section-eyebrow">Étape 14 sur 22 · Patrimoine 6/10</div>
          <h1 className="section-title">Assurance-vie et capitalisation</h1>
          <div className="section-subtitle">Contrats d&apos;assurance-vie et contrats de capitalisation détenus.</div>
        </div>

        <div className="assets-list" id="assetsListAV">
          <AvCard id="av-1" idx="1" title="Contrat Multisupport · Generali Espace Liberté" meta="Assurance-vie · Bertrand · 70/30 (fonds €/UC)" value="150 000 €"
            compagnie="Generali" nom="Espace Liberté" valo="150 000 €" euros="70" uc="30"
            souscripteurs={['Bertrand DUPONT-TOPIN', 'Monique DUPONT-TOPIN', 'Co-souscription']} />
          <AvCard id="av-2" idx="2" title="Linxea Spirit 2 · Spirica" meta="Assurance-vie · Monique · 50/50" value="80 000 €"
            compagnie="Spirica" nom="Linxea Spirit 2" valo="80 000 €" euros="50" uc="50"
            souscripteurs={['Monique DUPONT-TOPIN', 'Bertrand DUPONT-TOPIN', 'Co-souscription']} />
          <AvCard id="av-3" idx="3" title="Cardif Multiplaces · BNP Paribas" meta="Assurance-vie · Co-souscription" value="50 000 €"
            compagnie="Cardif" nom="Cardif Multiplaces" valo="50 000 €" euros="100" uc="0"
            souscripteurs={['Co-souscription', 'Bertrand DUPONT-TOPIN', 'Monique DUPONT-TOPIN']} />
        </div>
        <button className="btn-add-asset" data-action="add-av"><svg><use href="#ic-plus" /></svg>Ajouter un contrat</button>
      </div>

      {/* ═══════════ SECTION 15 · ÉPARGNE RETRAITE ═══════════ */}
      <div className="section" data-step="16">
        <div className="section-header">
          <div className="section-eyebrow">Étape 16 sur 22 · Patrimoine 8/10</div>
          <h1 className="section-title">Épargne retraite</h1>
          <div className="section-subtitle">PER, PERP, contrats Madelin, PERCO et autres dispositifs.</div>
        </div>

        <div className="assets-list" id="assetsListPer">
          {/* PER 1 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="per-1">
            <div className="asset-row-id">1</div>
            <div className="asset-row-main">
              <div className="asset-row-title">PER Individuel · Linxea Spirit PER</div>
              <div className="asset-row-meta">PERIN · Bertrand · ouvert en 2020</div>
            </div>
            <div className="asset-row-value">42 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="per-1">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Identité du contrat</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type</label><select className="select-input"><option>PER Individuel (PERIN)</option><option>PER Entreprise Collectif (PERECO)</option><option>PER Entreprise Obligatoire (PERO)</option><option>Madelin retraite</option><option>PERP</option><option>Article 83</option></select></div>
                <div className="field"><label className="field-label">Compagnie</label><input type="text" className="text-input" defaultValue="Spirica" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Date d&apos;ouverture</label><input type="date" className="text-input" /></div>
                <div className="field">
                  <label className="field-label">Titulaire</label>
                  <select className="select-input">
                    <option>Bertrand DUPONT-TOPIN</option>
                    <option>Monique DUPONT-TOPIN</option>
                  </select>
                  <div className="field-help">L&apos;épargne retraite est strictement nominative · pas de co-souscription</div>
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="42 000 €" /></div>
                <div className="field"><label className="field-label">Versements cumulés</label><input type="text" className="text-input" /></div>
              </div>
              <div className="field"><label className="field-label">Versement annuel <span className="opt">facultatif</span></label><input type="text" className="text-input" placeholder="Montant en €" /></div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>

          {/* PER 2 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="per-2">
            <div className="asset-row-id">2</div>
            <div className="asset-row-main">
              <div className="asset-row-title">PERCO · Société Générale</div>
              <div className="asset-row-meta">PER Entreprise Collectif · Monique</div>
            </div>
            <div className="asset-row-value">18 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="per-2">
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Identité du contrat</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type</label><select className="select-input"><option>PER Entreprise Collectif (PERECO)</option><option>PER Individuel (PERIN)</option><option>PER Entreprise Obligatoire (PERO)</option><option>Madelin retraite</option><option>PERP</option><option>Article 83</option></select></div>
                <div className="field"><label className="field-label">Compagnie</label><input type="text" className="text-input" defaultValue="Société Générale" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Date d&apos;ouverture</label><input type="date" className="text-input" /></div>
                <div className="field">
                  <label className="field-label">Titulaire</label>
                  <select className="select-input">
                    <option>Monique DUPONT-TOPIN</option>
                    <option>Bertrand DUPONT-TOPIN</option>
                  </select>
                  <div className="field-help">L&apos;épargne retraite est strictement nominative · pas de co-souscription</div>
                </div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Valorisation</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="18 000 €" /></div>
                <div className="field"><label className="field-label">Versements cumulés</label><input type="text" className="text-input" /></div>
              </div>
              <div className="field"><label className="field-label">Versement annuel <span className="opt">facultatif</span></label><input type="text" className="text-input" placeholder="Montant en €" /></div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>
        </div>
        <button className="btn-add-asset" data-action="add-retraite"><svg><use href="#ic-plus" /></svg>Ajouter un contrat retraite</button>
      </div>

      {/* ═══════════ SECTION 15 · PATRIMOINE ATYPIQUE ═══════════ */}
      <div className="section" data-step="15">
        <div className="section-header">
          <div className="section-eyebrow">Étape 15 sur 22 · Patrimoine 7/10</div>
          <h1 className="section-title">Patrimoine atypique</h1>
          <div className="section-subtitle">Or, cryptomonnaies, objets d&apos;art, placements fonciers et autres actifs divers.</div>
        </div>

        <div className="section-def">
          Le <strong>patrimoine atypique</strong> regroupe les actifs qui n&apos;entrent dans aucune des catégories précédentes : métaux précieux (or, argent), cryptomonnaies, objets d&apos;art et collections, placements fonciers (vignobles, forêts, groupements), et autres actifs spécifiques (brevets, royalties, parts de club deal).
        </div>

        {/* I · Or et métaux précieux */}
        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Or et métaux précieux</div>
              <div className="q-block-subtitle">Or physique (lingots, pièces), or dématérialisé (ETF physiques, certificats), argent, platine, palladium</div>
            </div>
          </div>
          <div className="assets-list" id="assetsListOr">
            <div className="asset-row" data-action="toggle-asset" data-detail="or-1">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">Lingot d&apos;or 50 g</div>
                <div className="asset-row-meta">Or physique · Coffre BNP Paribas · acquis en 2022</div>
              </div>
              <div className="asset-row-value">4 500 €</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="or-1">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Type</label>
                    <select className="select-input"><option>Or physique (lingot)</option><option>Or physique (pièces)</option><option>Or dématérialisé (ETF physique)</option><option>Or papier (certificat)</option><option>Argent physique</option><option>Argent papier</option><option>Platine</option><option>Palladium</option><option>Autre métal précieux</option></select></div>
                  <div className="field"><label className="field-label">Description</label>
                    <input type="text" className="text-input" defaultValue="Lingot 50 g · 999,9 ‰" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Quantité</label><input type="text" className="text-input" defaultValue="50 g" /></div>
                  <div className="field"><label className="field-label">Date d&apos;acquisition</label><input type="date" className="text-input" /></div>
                </div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation et conservation</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Prix d&apos;achat</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                  <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="4 500 €" /></div>
                </div>
                <div className="field"><label className="field-label">Lieu de conservation</label>
                  <select className="select-input"><option>Coffre bancaire</option><option>Domicile (coffre privé)</option><option>Prestataire spécialisé (Loomis, Brink&rsquo;s…)</option><option>Plateforme dématérialisée</option></select></div>
                <div className="field"><label className="field-label">Précisez l&apos;établissement <span className="opt">facultatif</span></label>
                  <input type="text" className="text-input" defaultValue="BNP Paribas · agence Paris 7e" /></div>
              </div>
              <Detenteur />
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer cet actif</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-atypique" data-type="or"><svg><use href="#ic-plus" /></svg>Ajouter un actif Or / métaux précieux</button>
        </div>

        {/* II · Cryptomonnaies */}
        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Cryptomonnaies</div>
              <div className="q-block-subtitle">Bitcoin, Ethereum, stablecoins, autres tokens</div>
            </div>
          </div>
          <div className="assets-list" id="assetsListCrypto">
            <div className="asset-row" data-action="toggle-asset" data-detail="crypto-1">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">Portefeuille Bitcoin + Ethereum</div>
                <div className="asset-row-meta">Coinbase · 0,15 BTC + 2 ETH</div>
              </div>
              <div className="asset-row-value">12 000 €</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="crypto-1">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification</div>
                <div className="field"><label className="field-label">Cryptomonnaie(s) détenue(s)</label>
                  <input type="text" className="text-input" defaultValue="Bitcoin (BTC), Ethereum (ETH)" /></div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Plateforme / wallet</label>
                    <select className="select-input"><option>Exchange centralisé (Coinbase, Binance, Kraken…)</option><option>Wallet froid (Ledger, Trezor…)</option><option>Wallet logiciel</option><option>Plusieurs supports</option></select></div>
                  <div className="field"><label className="field-label">Nom précis</label><input type="text" className="text-input" defaultValue="Coinbase" /></div>
                </div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Quantité totale</label><input type="text" className="text-input" defaultValue="0,15 BTC + 2 ETH" /></div>
                  <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="12 000 €" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Investissement total</label><input type="text" className="text-input" placeholder="Montant cumulé en €" /></div>
                  <div className="field"><label className="field-label">Date de première acquisition</label><input type="date" className="text-input" /></div>
                </div>
              </div>
              <Detenteur />
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer cet actif</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-atypique" data-type="crypto"><svg><use href="#ic-plus" /></svg>Ajouter un actif Cryptomonnaie</button>
        </div>

        {/* III · Objets d'art et collections */}
        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">III</div>
            <div className="q-block-text">
              <div className="q-block-title">Objets d&apos;art, antiquités, collections</div>
              <div className="q-block-subtitle">Peinture, sculpture, mobilier, livres rares, vins, voitures de collection, bijoux</div>
            </div>
          </div>
          <div className="assets-list" id="assetsListArt">
            <div className="asset-row" data-action="toggle-asset" data-detail="art-1">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">Tableau école française XIXe</div>
                <div className="asset-row-meta">Peinture · Acquise en 2018 · Conservé au domicile</div>
              </div>
              <div className="asset-row-value">8 000 €</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="art-1">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Catégorie</label>
                    <select className="select-input"><option>Peinture / tableau</option><option>Sculpture</option><option>Mobilier ancien</option><option>Livre rare / manuscrit</option><option>Cave à vin</option><option>Voiture de collection</option><option>Bijoux</option><option>Montres</option><option>Instruments de musique</option><option>Autre</option></select></div>
                  <div className="field"><label className="field-label">Date d&apos;acquisition</label><input type="date" className="text-input" /></div>
                </div>
                <div className="field"><label className="field-label">Description précise</label>
                  <input type="text" className="text-input" defaultValue="Tableau école française XIXe · paysage normand · huile sur toile signée" /></div>
                <div className="field"><label className="field-label">Authentification / Provenance <span className="opt">facultatif</span></label>
                  <input type="text" className="text-input" placeholder="Maison de vente, certificat, expertise…" /></div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation et assurance</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Prix d&apos;achat</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                  <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="8 000 €" /></div>
                </div>
                <div className="field"><label className="field-label">Police d&apos;assurance spécifique <span className="opt">facultatif</span></label>
                  <input type="text" className="text-input" placeholder="Compagnie, n° de police" /></div>
                <div className="field"><label className="field-label">Lieu de conservation</label>
                  <select className="select-input"><option>Domicile</option><option>Coffre bancaire</option><option>Garde-meuble sécurisé</option><option>Garage / box</option><option>Cave</option><option>Prestataire spécialisé</option></select></div>
              </div>
              <Detenteur />
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer cet actif</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-atypique" data-type="art"><svg><use href="#ic-plus" /></svg>Ajouter un objet d&apos;art ou de collection</button>
        </div>

        {/* IV · Placements fonciers */}
        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">IV</div>
            <div className="q-block-text">
              <div className="q-block-title">Placements fonciers</div>
              <div className="q-block-subtitle">Vignobles, forêts, groupements forestiers (GFF), groupements viticoles (GFV), groupements fonciers agricoles (GFA), terres agricoles</div>
            </div>
          </div>
          <div className="assets-list" id="assetsListFoncier">
            <div className="asset-row" data-action="toggle-asset" data-detail="foncier-1">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">GFV Château de Sancerre</div>
                <div className="asset-row-meta">Groupement Foncier Viticole · 50 parts · acquises en 2020</div>
              </div>
              <div className="asset-row-value">25 000 €</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="foncier-1">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Type</label>
                    <select className="select-input"><option>Groupement Foncier Viticole (GFV)</option><option>Groupement Forestier d&apos;Investissement (GFI)</option><option>Groupement Foncier Forestier (GFF)</option><option>Groupement Foncier Agricole (GFA)</option><option>Vignoble en direct</option><option>Forêt en direct</option><option>Terre agricole en direct</option><option>Autre</option></select></div>
                  <div className="field"><label className="field-label">Nom / dénomination</label><input type="text" className="text-input" defaultValue="GFV Château de Sancerre" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Localisation</label><input type="text" className="text-input" defaultValue="Sancerre · Cher (18)" /></div>
                  <div className="field"><label className="field-label">Date d&apos;acquisition</label><input type="date" className="text-input" /></div>
                </div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Nombre de parts ou surface</label><input type="text" className="text-input" defaultValue="50 parts" /></div>
                  <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue="25 000 €" /></div>
                </div>
                <div className="field"><label className="field-label">Revenus annuels perçus <span className="opt">facultatif</span></label>
                  <input type="text" className="text-input" placeholder="Loyers, dividendes, livraisons en nature…" /></div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Régime fiscal</div>
                <div className="field"><label className="field-label">Régime fiscal applicable</label>
                  <select className="select-input"><option>Revenus fonciers (Micro)</option><option>Revenus fonciers (Réel)</option><option>BIC</option><option>BA (bénéfices agricoles)</option><option>Société à l&rsquo;IR</option><option>Société à l&rsquo;IS</option><option>Régime spécifique GFV/GFI (exonération partielle DMTG)</option></select></div>
              </div>
              <Detenteur />
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer cet actif</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-atypique" data-type="foncier"><svg><use href="#ic-plus" /></svg>Ajouter un placement foncier</button>
        </div>

        {/* V · Autres actifs */}
        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">V</div>
            <div className="q-block-text">
              <div className="q-block-title">Autres actifs</div>
              <div className="q-block-subtitle">Brevets, royalties, droits d&apos;auteur, parts de club deal, créances détenues, autres actifs spécifiques</div>
            </div>
          </div>
          <div className="assets-list" id="assetsListAutreAtypique">
            <div className="asset-row" data-action="toggle-asset" data-detail="autre-atyp-1">
              <div className="asset-row-id">1</div>
              <div className="asset-row-main">
                <div className="asset-row-title">Royalties brevet médical</div>
                <div className="asset-row-meta">Brevet dispositif cardiaque · revenus annuels récurrents</div>
              </div>
              <div className="asset-row-value">3 000 € / an</div>
              <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
            </div>
            <div className="asset-detail" id="autre-atyp-1">
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Identification</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Nature</label>
                    <select className="select-input"><option>Brevet</option><option>Royalties / droits d&apos;auteur</option><option>Parts de club deal</option><option>Créance détenue</option><option>Cheval de course</option><option>Marque commerciale</option><option>Autre</option></select></div>
                  <div className="field"><label className="field-label">Date d&apos;acquisition / inscription</label><input type="date" className="text-input" /></div>
                </div>
                <div className="field"><label className="field-label">Description précise</label>
                  <input type="text" className="text-input" defaultValue="Brevet sur dispositif cardiaque · revenus de royalties annuels" /></div>
              </div>
              <div className="asset-detail-group">
                <div className="asset-detail-group-title">Valorisation</div>
                <div className="field-row">
                  <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" placeholder="Capitalisée" /></div>
                  <div className="field"><label className="field-label">Revenus annuels perçus</label><input type="text" className="text-input" defaultValue="3 000 €" /></div>
                </div>
              </div>
              <Detenteur />
              <div className="asset-detail-actions">
                <button className="asset-detail-delete">Supprimer cet actif</button>
                <button className="asset-detail-save">Enregistrer</button>
              </div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-atypique" data-type="autre"><svg><use href="#ic-plus" /></svg>Ajouter un autre actif</button>
        </div>
      </div>

      {/* ═══════════ SECTION 16 · PRÉVOYANCE ═══════════ */}
      <div className="section" data-step="17">
        <div className="section-header">
          <div className="section-eyebrow">Étape 17 sur 22 · Patrimoine 9/10</div>
          <h1 className="section-title">Prévoyance</h1>
          <div className="section-subtitle">Contrats de prévoyance, capitaux assurés en cas de décès ou d&apos;invalidité.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Couverture prévoyance</div>
              <div className="q-block-subtitle">Garanties souscrites pour vous protéger et protéger vos proches</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Disposez-vous d&apos;un contrat de prévoyance ?</label>
            <div className="field-help">Contrat décès, garantie obsèques, invalidité, incapacité, dépendance…</div>
            <div className="yesno">
              <div className="yesno-option" data-action="toggle-yn" data-show="prevDetail">Oui</div>
              <div className="yesno-option selected" data-action="toggle-yn" data-hide="prevDetail">Non</div>
            </div>
          </div>
          <div className="conditional" id="prevDetail">
            <div className="assets-list" id="assetsListPrev">
              <div id="prevEmptyPlaceholder" style={{ textAlign: 'center', padding: '22px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>Aucun contrat ajouté pour le moment</div>
            </div>
            <button className="btn-add-asset" data-action="add-prev"><svg><use href="#ic-plus" /></svg>Ajouter un contrat de prévoyance</button>
          </div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Mutuelle santé</div>
              <div className="q-block-subtitle">Complémentaire santé en vigueur</div>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Organisme</label><input type="text" className="text-input" placeholder="Nom de la mutuelle" /></div>
            <div className="field"><label className="field-label">À qui s&apos;applique-t-elle ?</label>
              <select className="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>L&apos;ensemble du foyer</option></select></div>
          </div>
          <div className="field"><label className="field-label">Cotisation mensuelle</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
        </div>
      </div>

      {/* ═══════════ SECTION 17 · EMPRUNTS ET DETTES ═══════════ */}
      <div className="section" data-step="18">
        <div className="section-header">
          <div className="section-eyebrow">Étape 18 sur 22 · Patrimoine 10/10</div>
          <h1 className="section-title">Emprunts et dettes</h1>
          <div className="section-subtitle">Crédits en cours et dettes diverses.</div>
        </div>

        <div className="assets-list" id="assetsListPret">
          {/* Prêt 1 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="pret-1">
            <div className="asset-row-id">1</div>
            <div className="asset-row-main">
              <div className="asset-row-title">Prêt RP · BNP Paribas</div>
              <div className="asset-row-meta">Prêt immobilier · Reste 8 ans · 1,85 %</div>
            </div>
            <div className="asset-row-value">180 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="pret-1">
            <div className="link-bien-block">
              <label className="field-label">Lier ce prêt à un bien ou une société déjà renseigné(e) ?</label>
              <select className="select-input">
                <option>Aucun lien</option>
                <optgroup label="Immobilier d'usage">
                  <option>Résidence principale · 48 rue de l&apos;Université, Paris 7e</option>
                </optgroup>
                <optgroup label="Immobilier locatif">
                  <option>Appartement Paris 16e</option>
                  <option>Maison Cap Ferret</option>
                </optgroup>
                <optgroup label="Sociétés">
                  <option>SCI DUPONT FAMILY</option>
                  <option>SELARL DR DUPONT</option>
                </optgroup>
              </select>
              <div className="field-help" style={{ marginTop: '8px' }}>Cela permet d&apos;associer automatiquement ce prêt à un actif et de calculer la valeur nette de votre patrimoine.</div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Identité du prêt</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type de prêt</label><select className="select-input"><option>Prêt immobilier (résidence principale)</option><option>Prêt immobilier locatif</option><option>Prêt à la consommation</option><option>Prêt professionnel</option><option>Prêt étudiant</option><option>Prêt familial</option></select></div>
                <div className="field"><label className="field-label">Établissement prêteur</label><input type="text" className="text-input" defaultValue="BNP Paribas" /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Emprunteurs</div>
              <div style={muted}>Indiquez la quote-part empruntée par chaque emprunteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Emprunteur</div>
                  <div>Quote-part</div>
                  <div>Garantie</div>
                </div>
                <EmprunteurRow name="Bertrand DUPONT-TOPIN" value="50" prefix="pret-1" full />
                <EmprunteurRow name="Monique DUPONT-TOPIN" value="50" prefix="pret-1" full />
                <EmprunteurRow name="Camille DUPONT-TOPIN" value="0" prefix="pret-1" />
                <EmprunteurRow name="Antoine DUPONT-TOPIN" value="0" prefix="pret-1" />
                <EmprunteurRow name="Via une société" value="0" prefix="pret-1" />
                <EmprunteurRow name="Tiers" value="0" prefix="pret-1" />
                <div className="detention-total is-valid" id="det-total-pret-1">
                  <span>Total emprunteurs</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
              <ViaSociete />
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Caractéristiques</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Capital emprunté</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
                <div className="field"><label className="field-label">Capital restant dû</label><input type="text" className="text-input" defaultValue="180 000 €" /></div>
              </div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Taux d&apos;intérêt</label><input type="text" className="text-input" defaultValue="1,85 %" /></div>
                <div className="field"><label className="field-label">Durée totale (années)</label><input type="number" className="text-input" /></div>
                <div className="field"><label className="field-label">Durée restante (années)</label><input type="number" className="text-input" defaultValue="8" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label className="field-label">Date de début</label><input type="date" className="text-input" /></div>
                <div className="field"><label className="field-label">Mensualité (hors assurance)</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Assurance emprunteur</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Quotité d&apos;assurance</label><input type="text" className="text-input" placeholder="Ex. : 100/100 ou 50/50" /></div>
                <div className="field"><label className="field-label">Cotisation mensuelle</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
              </div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce prêt</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>

          {/* Prêt 2 */}
          <div className="asset-row" data-action="toggle-asset" data-detail="pret-2">
            <div className="asset-row-id">2</div>
            <div className="asset-row-main">
              <div className="asset-row-title">Prêt Locatif Paris 16e · Crédit Mutuel</div>
              <div className="asset-row-meta">Prêt immobilier locatif · Reste 4 ans · 2,1 %</div>
            </div>
            <div className="asset-row-value">40 000 €</div>
            <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
          </div>
          <div className="asset-detail" id="pret-2">
            <div className="link-bien-block">
              <label className="field-label">Lier ce prêt à un bien ou une société déjà renseigné(e) ?</label>
              <select className="select-input">
                <option>Appartement Paris 16e</option>
                <option>Aucun lien</option>
                <optgroup label="Immobilier d'usage">
                  <option>Résidence principale · 48 rue de l&apos;Université, Paris 7e</option>
                </optgroup>
                <optgroup label="Immobilier locatif">
                  <option>Maison Cap Ferret</option>
                </optgroup>
                <optgroup label="Sociétés">
                  <option>SCI DUPONT FAMILY</option>
                  <option>SELARL DR DUPONT</option>
                </optgroup>
              </select>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Identité du prêt</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Type de prêt</label><select className="select-input"><option>Prêt immobilier locatif</option><option>Prêt immobilier (résidence principale)</option><option>Prêt professionnel</option></select></div>
                <div className="field"><label className="field-label">Établissement prêteur</label><input type="text" className="text-input" defaultValue="Crédit Mutuel" /></div>
              </div>
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Emprunteurs</div>
              <div style={muted}>Indiquez la quote-part empruntée par chaque emprunteur (la somme doit faire 100 %).</div>
              <div className="detention-table">
                <div className="detention-table-head">
                  <div>Emprunteur</div>
                  <div>Quote-part</div>
                  <div>Garantie</div>
                </div>
                <EmprunteurRow name="Bertrand DUPONT-TOPIN" value="50" prefix="pret-2" full />
                <EmprunteurRow name="Monique DUPONT-TOPIN" value="50" prefix="pret-2" full />
                <EmprunteurRow name="Camille DUPONT-TOPIN" value="0" prefix="pret-2" />
                <EmprunteurRow name="Antoine DUPONT-TOPIN" value="0" prefix="pret-2" />
                <EmprunteurRow name="Via une société" value="0" prefix="pret-2" />
                <EmprunteurRow name="Tiers" value="0" prefix="pret-2" />
                <div className="detention-total is-valid" id="det-total-pret-2">
                  <span>Total emprunteurs</span>
                  <span className="detention-total-value">100 %</span>
                </div>
              </div>
              <ViaSociete />
            </div>
            <div className="asset-detail-group">
              <div className="asset-detail-group-title">Caractéristiques</div>
              <div className="field-row">
                <div className="field"><label className="field-label">Capital emprunté</label><input type="text" className="text-input" /></div>
                <div className="field"><label className="field-label">Capital restant dû</label><input type="text" className="text-input" defaultValue="40 000 €" /></div>
              </div>
              <div className="field-row-3">
                <div className="field"><label className="field-label">Taux d&apos;intérêt</label><input type="text" className="text-input" defaultValue="2,1 %" /></div>
                <div className="field"><label className="field-label">Durée totale</label><input type="number" className="text-input" /></div>
                <div className="field"><label className="field-label">Durée restante</label><input type="number" className="text-input" defaultValue="4" /></div>
              </div>
            </div>
            <div className="asset-detail-actions">
              <button className="asset-detail-delete">Supprimer ce prêt</button>
              <button className="asset-detail-save">Enregistrer</button>
            </div>
          </div>
        </div>
        <button className="btn-add-asset" data-action="add-emprunt"><svg><use href="#ic-plus" /></svg>Ajouter un prêt ou une dette</button>
      </div>
    </>
  );
}

function AvCard({ id, idx, title, meta, value, compagnie, nom, valo, euros, uc, souscripteurs }:
  { id: string; idx: string; title: string; meta: string; value: string; compagnie: string; nom: string; valo: string; euros: string; uc: string; souscripteurs: string[] }) {
  return (
    <>
      <div className="asset-row" data-action="toggle-asset" data-detail={id}>
        <div className="asset-row-id">{idx}</div>
        <div className="asset-row-main">
          <div className="asset-row-title">{title}</div>
          <div className="asset-row-meta">{meta}</div>
        </div>
        <div className="asset-row-value">{value}</div>
        <div className="asset-row-action">Modifier <svg><use href="#ic-chevron-right" /></svg></div>
      </div>
      <div className="asset-detail" id={id}>
        <div className="asset-detail-group">
          <div className="asset-detail-group-title">Identité du contrat</div>
          <div className="field-row">
            <div className="field"><label className="field-label">Type de contrat</label><select className="select-input"><option>Assurance-vie</option><option>Capitalisation</option></select></div>
            <div className="field"><label className="field-label">Compagnie d&apos;assurance</label><input type="text" className="text-input" defaultValue={compagnie} /></div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Nom du contrat</label><input type="text" className="text-input" defaultValue={nom} /></div>
            <div className="field"><label className="field-label">N° de contrat</label><input type="text" className="text-input" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">Date d&apos;ouverture</label><input type="date" className="text-input" /></div>
            <div className="field"><label className="field-label">Souscripteur(s)</label><select className="select-input">{souscripteurs.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
        </div>
        <div className="asset-detail-group">
          <div className="asset-detail-group-title">Valorisation et allocation</div>
          <div className="field-row">
            <div className="field"><label className="field-label">Valorisation actuelle</label><input type="text" className="text-input" defaultValue={valo} /></div>
            <div className="field"><label className="field-label">Versements cumulés</label><input type="text" className="text-input" placeholder="Montant en €" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label className="field-label">% en fonds en euros</label><input type="text" className="text-input" defaultValue={euros} /></div>
            <div className="field"><label className="field-label">% en unités de compte</label><input type="text" className="text-input" defaultValue={uc} /></div>
          </div>
          <div className="field"><label className="field-label">Versement programmé mensuel <span className="opt">facultatif</span></label><input type="text" className="text-input" placeholder="Montant en €" /></div>
        </div>
        <div className="asset-detail-group">
          <div className="asset-detail-group-title">Clause bénéficiaire</div>
          <div className="field"><label className="field-label">Désignation bénéficiaire</label><textarea className="text-input" rows={2} placeholder={benefPlaceholder} style={{ resize: 'vertical', fontFamily: 'inherit' }} /></div>
        </div>
        <div className="asset-detail-actions">
          <button className="asset-detail-delete">Supprimer ce contrat</button>
          <button className="asset-detail-save">Enregistrer</button>
        </div>
      </div>
    </>
  );
}

function Detenteur() {
  return (
    <div className="asset-detail-group">
      <div className="asset-detail-group-title">Détenteur</div>
      <div className="field">
        <label className="field-label">À qui appartient cet actif ?</label>
        <select className="select-input">
          <option>Bertrand DUPONT-TOPIN</option>
          <option>Monique DUPONT-TOPIN</option>
          <option>Les deux (indivision)</option>
        </select>
      </div>
    </div>
  );
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

function EmprunteurRow({ name, value, prefix, full }: { name: string; value: string; prefix: string; full?: boolean }) {
  return (
    <div className="detention-row">
      <div className="detention-row-label">{name}</div>
      <input type="number" className="text-input" min="0" max="100" defaultValue={value} data-action="detention" data-prefix={prefix} />
      <select className="select-input">
        <option>Caution simple</option><option>Caution solidaire</option><option>Hypothèque</option>
        {full && <option>Privilège prêteur de deniers</option>}
        <option>Aucune</option>
      </select>
    </div>
  );
}
