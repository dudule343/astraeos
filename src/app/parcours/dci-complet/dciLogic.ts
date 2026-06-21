// Logique interactive du DCI complet — portage 1:1 du <script> de la maquette
// dci-complet.html. Opère par délégation d'événements sur le conteneur racine
// (.maq-dci-complet) afin de reproduire à l'identique navigation, accordéons,
// toggles, tables dynamiques, liaisons prêt↔bien, synthèse et signature.

import { persistParcours } from "../submit-client";

const TOTAL_STEPS = 22;

type Ctx = { root: HTMLElement; currentStep: number };

const assetCounters: Record<string, number> = {
  pro: 2, usg: 1, loc: 2, indi: 0, fin: 2, av: 3, per: 2, prev: 0, pret: 2,
  event: 0, donation: 0, projet: 0, dispositif: 0, obj: 0,
};

const atypiqueCounters: Record<string, number> = { or: 1, crypto: 1, art: 1, foncier: 1, autre: 1 };

const linkedLoans: Record<string, string> = {};

const TESTAMENT_DEFS: Record<string, { name: string; text: string }> = {
  olographe: {
    name: 'Testament olographe',
    text: 'Testament entièrement <strong>écrit, daté et signé de la main du testateur</strong>. Il n’exige pas l’intervention d’un notaire, mais doit respecter scrupuleusement ces trois conditions pour être valide. C’est la forme la plus simple et la plus répandue.',
  },
  authentique: {
    name: 'Testament authentique',
    text: 'Testament <strong>reçu par un notaire</strong> en présence de deux témoins ou d’un second notaire. Le testateur le dicte au notaire qui le rédige. C’est la forme la plus sûre juridiquement, particulièrement adaptée aux situations patrimoniales complexes.',
  },
  mystique: {
    name: 'Testament mystique',
    text: 'Testament rédigé par le testateur (ou par un tiers à sa demande), puis <strong>remis cacheté à un notaire</strong> en présence de deux témoins. Le notaire dresse acte de suscription sans connaître le contenu. Forme rare qui combine secret et sécurité juridique.',
  },
};

const atypiqueConfig: Record<string, { listId: string; prefix: string; label: string; title: string; fields: string }> = {
  or: {
    listId: 'assetsListOr', prefix: 'or', label: 'Or / métal précieux', title: 'Nouvel actif Or / métal précieux',
    fields: `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type</label>
            <select class="select-input"><option>Or physique (lingot)</option><option>Or physique (pièces)</option><option>Or dématérialisé (ETF physique)</option><option>Or papier (certificat)</option><option>Argent physique</option><option>Argent papier</option><option>Platine</option><option>Palladium</option><option>Autre métal précieux</option></select></div>
          <div class="field"><label class="field-label">Description</label><input type="text" class="text-input" placeholder="Détail précis"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Quantité</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Date d’acquisition</label><input type="date" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation et conservation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Prix d’achat</label><input type="text" class="text-input" placeholder="Montant en €"></div>
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input" placeholder="Montant en €"></div>
        </div>
        <div class="field"><label class="field-label">Lieu de conservation</label>
          <select class="select-input"><option>Coffre bancaire</option><option>Domicile (coffre privé)</option><option>Prestataire spécialisé</option><option>Plateforme dématérialisée</option></select></div>
        <div class="field"><label class="field-label">Précisez l’établissement <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>`,
  },
  crypto: {
    listId: 'assetsListCrypto', prefix: 'crypto', label: 'Cryptomonnaie', title: 'Nouvel actif Cryptomonnaie',
    fields: `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification</div>
        <div class="field"><label class="field-label">Cryptomonnaie(s) détenue(s)</label><input type="text" class="text-input" placeholder="Ex. : Bitcoin (BTC), Ethereum (ETH)"></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Plateforme / wallet</label>
            <select class="select-input"><option>Exchange centralisé (Coinbase, Binance, Kraken…)</option><option>Wallet froid (Ledger, Trezor…)</option><option>Wallet logiciel</option><option>Plusieurs supports</option></select></div>
          <div class="field"><label class="field-label">Nom précis</label><input type="text" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Quantité totale</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Investissement total</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Date de première acquisition</label><input type="date" class="text-input"></div>
        </div>
      </div>`,
  },
  art: {
    listId: 'assetsListArt', prefix: 'art', label: 'Objet d’art / collection', title: 'Nouvel objet d’art ou de collection',
    fields: `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Catégorie</label>
            <select class="select-input"><option>Peinture / tableau</option><option>Sculpture</option><option>Mobilier ancien</option><option>Livre rare / manuscrit</option><option>Cave à vin</option><option>Voiture de collection</option><option>Bijoux</option><option>Montres</option><option>Instruments de musique</option><option>Autre</option></select></div>
          <div class="field"><label class="field-label">Date d’acquisition</label><input type="date" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Description précise</label><input type="text" class="text-input"></div>
        <div class="field"><label class="field-label">Authentification / Provenance <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation et assurance</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Prix d’achat</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Police d’assurance spécifique <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
        <div class="field"><label class="field-label">Lieu de conservation</label>
          <select class="select-input"><option>Domicile</option><option>Coffre bancaire</option><option>Garde-meuble sécurisé</option><option>Garage / box</option><option>Cave</option><option>Prestataire spécialisé</option></select></div>
      </div>`,
  },
  foncier: {
    listId: 'assetsListFoncier', prefix: 'foncier', label: 'Placement foncier', title: 'Nouveau placement foncier',
    fields: `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type</label>
            <select class="select-input"><option>Groupement Foncier Viticole (GFV)</option><option>Groupement Forestier d’Investissement (GFI)</option><option>Groupement Foncier Forestier (GFF)</option><option>Groupement Foncier Agricole (GFA)</option><option>Vignoble en direct</option><option>Forêt en direct</option><option>Terre agricole en direct</option><option>Autre</option></select></div>
          <div class="field"><label class="field-label">Nom / dénomination</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Localisation</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Date d’acquisition</label><input type="date" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Nombre de parts ou surface</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Revenus annuels perçus <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Régime fiscal</div>
        <div class="field"><label class="field-label">Régime fiscal applicable</label>
          <select class="select-input"><option>Revenus fonciers (Micro)</option><option>Revenus fonciers (Réel)</option><option>BIC</option><option>BA (bénéfices agricoles)</option><option>Société à l’IR</option><option>Société à l’IS</option><option>Régime spécifique GFV/GFI (exonération partielle DMTG)</option></select></div>
      </div>`,
  },
  autre: {
    listId: 'assetsListAutreAtypique', prefix: 'autre-atyp', label: 'Autre actif', title: 'Nouvel autre actif',
    fields: `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Nature</label>
            <select class="select-input"><option>Brevet</option><option>Royalties / droits d’auteur</option><option>Parts de club deal</option><option>Créance détenue</option><option>Cheval de course</option><option>Marque commerciale</option><option>Autre</option></select></div>
          <div class="field"><label class="field-label">Date d’acquisition / inscription</label><input type="date" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Description précise</label><input type="text" class="text-input"></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Revenus annuels perçus</label><input type="text" class="text-input"></div>
        </div>
      </div>`,
  },
};

export function initDci(root: HTMLElement): () => void {
  const ctx: Ctx = { root, currentStep: 1 };
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + CSS.escape(id));
  const qsa = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));

  function showStep(n: number) {
    qsa('.section').forEach((s) => s.classList.remove('active'));
    const sec = root.querySelector<HTMLElement>(`.section[data-step="${n}"]`);
    if (sec) sec.classList.add('active');
    ctx.currentStep = n;
    root.classList.toggle('s1-fixed', n === 1);
    updateProgress();
    updateNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    flashSave();
  }

  function updateProgress() {
    const pct = Math.round(((ctx.currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
    const fill = $('progFill');
    if (fill) fill.style.width = pct + '%';
    const pc = $('progPercent');
    if (pc) pc.textContent = pct + '%';
    const ps = $('progStep');
    if (ps) ps.textContent = `Étape ${ctx.currentStep} sur ${TOTAL_STEPS}`;
    const si = $('stepIndicator');
    if (si) si.innerHTML = `<strong>${ctx.currentStep}</strong> sur ${TOTAL_STEPS}`;
  }

  function updateNav() {
    const prev = $('prevBtn') as HTMLButtonElement | null;
    const next = $('nextBtn') as HTMLButtonElement | null;
    if (prev) prev.style.visibility = ctx.currentStep === 1 ? 'hidden' : 'visible';
    if (!next) return;
    if (ctx.currentStep === TOTAL_STEPS) {
      next.innerHTML = 'Valider et envoyer <svg><use href="#ic-arrow-right"/></svg>';
      next.classList.add('final');
      const cert = $('certCheck') as HTMLInputElement | null;
      next.disabled = !(cert && cert.checked);
    } else {
      next.innerHTML = 'Continuer <svg><use href="#ic-arrow-right"/></svg>';
      next.classList.remove('final');
      next.disabled = false;
    }
  }

  function nextStep() {
    if (ctx.currentStep === TOTAL_STEPS) { submitForm(); return; }
    if (ctx.currentStep < TOTAL_STEPS) showStep(ctx.currentStep + 1);
  }
  function prevStep() { if (ctx.currentStep > 1) showStep(ctx.currentStep - 1); }

  function checkFinalValid() {
    if (ctx.currentStep === TOTAL_STEPS) {
      const next = $('nextBtn') as HTMLButtonElement | null;
      const cert = $('certCheck') as HTMLInputElement | null;
      if (next) next.disabled = !(cert && cert.checked);
    }
  }

  function submitForm() {
    persistParcours('complet');
    qsa('.section').forEach((s) => s.classList.remove('active'));
    const fv = $('finalView');
    if (fv) fv.classList.add('active');
    const nav = $('navBar');
    if (nav) nav.style.display = 'none';
    const tb = root.querySelector<HTMLElement>('.top-bar');
    if (tb) tb.style.display = 'none';
    const fill = $('progFill');
    if (fill) fill.style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function flashSave() {
    const ind = $('saveIndicator');
    if (!ind) return;
    ind.classList.remove('saved');
    setTimeout(() => ind.classList.add('saved'), 200);
  }

  function toggleYN(el: HTMLElement) {
    const parent = el.parentElement;
    if (!parent) return;
    parent.querySelectorAll('.yesno-option').forEach((o) => o.classList.remove('selected'));
    el.classList.add('selected');
  }

  function toggleAsset(rowEl: HTMLElement, detailId: string) {
    const detail = $(detailId);
    if (!detail) return;
    qsa('.asset-detail.visible').forEach((d) => { if (d.id !== detailId) d.classList.remove('visible'); });
    qsa('.asset-row.open').forEach((r) => { if (r !== rowEl) r.classList.remove('open'); });
    detail.classList.toggle('visible');
    rowEl.classList.toggle('open');
  }

  function addEnfant() {
    const tbl = $('enfantsTable');
    if (!tbl) return;
    const rowEl = document.createElement('div');
    rowEl.className = 'dyn-row dyn-row-enfant';
    rowEl.innerHTML = `
      <input type="text" class="text-input" placeholder="Prénom">
      <input type="date" class="text-input">
      <select class="select-input"><option>Du couple</option><option>De Monsieur</option><option>De Madame</option></select>
      <select class="select-input"><option>Non</option><option>Oui</option></select>
      <div class="dyn-row-remove" data-action="remove-parent">×</div>
    `;
    tbl.appendChild(rowEl);
  }

  function addRevenu() {
    const list = $('revenusList');
    if (!list) return;
    const rowEl = document.createElement('div');
    rowEl.className = 'dyn-row dyn-row-budget';
    rowEl.innerHTML = `
      <select class="select-input">
        <option>Salaires et traitements</option><option>BNC (libéral)</option><option>BIC</option><option>BA (agricole)</option><option>Dividendes</option><option>Revenus fonciers (locatifs)</option><option>Pensions / retraites</option><option>Revenus financiers (intérêts, plus-values)</option><option>Autre</option>
      </select>
      <input type="text" class="text-input" placeholder="Montant annuel">
      <select class="select-input">
        <option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Les deux</option>
      </select>
      <div class="dyn-row-remove" data-action="remove-parent">×</div>
    `;
    list.appendChild(rowEl);
  }

  function addCharge() {
    const list = $('chargesList');
    if (!list) return;
    const rowEl = document.createElement('div');
    rowEl.className = 'dyn-row dyn-row-budget';
    rowEl.innerHTML = `
      <select class="select-input">
        <option>Charges courantes (vie quotidienne)</option><option>Mensualités de crédits</option><option>Impôt sur le revenu</option><option>Taxe foncière</option><option>Taxe d'habitation (RS)</option><option>IFI</option><option>Pensions versées</option><option>Loyer (si locataire)</option><option>Frais de scolarité</option><option>Cotisations diverses</option><option>Autre</option>
      </select>
      <input type="text" class="text-input" placeholder="Montant annuel">
      <select class="select-input">
        <option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Les deux</option>
      </select>
      <div class="dyn-row-remove" data-action="remove-parent">×</div>
    `;
    list.appendChild(rowEl);
  }

  function buildAssetCard(listId: string, detailId: string, idLabel: string | number, title: string, meta: string, value: string, detailHTML: string) {
    const list = $(listId);
    if (!list) return;
    qsa('.asset-detail.visible').forEach((d) => d.classList.remove('visible'));
    qsa('.asset-row.open').forEach((r) => r.classList.remove('open'));
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="asset-row open" data-action="toggle-asset" data-detail="${detailId}">
        <div class="asset-row-id">${idLabel}</div>
        <div class="asset-row-main">
          <div class="asset-row-title">${title}</div>
          <div class="asset-row-meta">${meta}</div>
        </div>
        <div class="asset-row-value">${value}</div>
        <div class="asset-row-action">Modifier <svg><use href="#ic-chevron-right"/></svg></div>
      </div>
      <div class="asset-detail visible" id="${detailId}">${detailHTML}</div>
    `;
    const emptyPh = list.querySelector('[id$="EmptyPlaceholder"]');
    if (emptyPh) emptyPh.remove();
    while (wrapper.firstChild) list.appendChild(wrapper.firstChild);
    setTimeout(() => {
      const newRow = root.querySelector('.asset-row.open');
      if (newRow) newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function detentionTable(prefix: string): string {
    const detenteurs = ['Bertrand DUPONT-TOPIN', 'Monique DUPONT-TOPIN', 'Camille DUPONT-TOPIN', 'Antoine DUPONT-TOPIN', 'Via une société', 'Tiers'];
    let rows = '';
    detenteurs.forEach((d) => {
      rows += `
        <div class="detention-row">
          <div class="detention-row-label">${d}</div>
          <input type="number" class="text-input" min="0" max="100" value="0" data-action="detention" data-prefix="${prefix}">
          <select class="select-input"><option>Pleine propriété</option><option>Usufruit</option><option>Nue-propriété</option></select>
        </div>`;
    });
    return `
      <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; font-style: italic;">Indiquez la quote-part détenue par chaque détenteur (la somme doit faire 100 %).</div>
      <div class="detention-table">
        <div class="detention-table-head">
          <div>Détenteur</div><div>Quote-part</div><div>Mode de détention</div>
        </div>
        ${rows}
        <div class="detention-total is-invalid" id="det-total-${prefix}">
          <span>Total détention</span>
          <span class="detention-total-value">0 %</span>
        </div>
      </div>
      <div class="field" style="margin-top: 14px;"><label class="field-label">Si "Via une société" · précisez laquelle <span class="opt">facultatif</span></label>
        <select class="select-input" data-action="autre-societe">
          <option>—</option>
          <option>SCI DUPONT FAMILY</option>
          <option>SELARL DR DUPONT</option>
          <option>Autre société · à préciser</option>
        </select>
      </div>
      <div class="field autre-societe" style="display:none; margin-top: 14px;">
        <label class="field-label">Précisez le nom de la société</label>
        <input type="text" class="text-input" placeholder="Nom de la société">
      </div>`;
  }

  function actionsRow(): string {
    return `<div class="asset-detail-actions">
      <button class="asset-detail-delete" data-action="delete-card">Supprimer</button>
      <button class="asset-detail-save" data-action="stop">Enregistrer</button>
    </div>`;
  }

  function updateDetention(prefix: string) {
    const detail = $(prefix);
    if (!detail) return;
    const inputs = detail.querySelectorAll<HTMLInputElement>('.detention-row input[type="number"]');
    let total = 0;
    inputs.forEach((i) => { total += parseFloat(i.value) || 0; });
    const totalEl = $('det-total-' + prefix);
    if (totalEl) {
      const v = totalEl.querySelector('.detention-total-value');
      if (v) v.textContent = total + ' %';
      totalEl.classList.toggle('is-valid', total === 100);
      totalEl.classList.toggle('is-invalid', total !== 100);
    }
  }

  function onResFiscChange() {
    const sel = $('residenceFiscale') as HTMLSelectElement | null;
    if (!sel) return;
    const v = sel.value;
    $('resFiscUE')?.classList.toggle('visible', v === 'ue');
    $('resFiscHorsUE')?.classList.toggle('visible', v === 'hors-ue');
  }

  function showTestamentDef(selectEl: HTMLSelectElement) {
    const def = TESTAMENT_DEFS[selectEl.value];
    if (!def) return;
    const block = $('testamentDef');
    if (!block) return;
    block.innerHTML = '<strong style="color: var(--gold); letter-spacing: 0.06em;">' + def.name + ' ·</strong> <span>' + def.text + '</span>';
  }

  function loanLinkBlock(bienId: string, bienType: string): string {
    return `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Financement</div>
        <div class="field">
          <label class="field-label">Un prêt est-il associé à ce bien ?</label>
          <div class="field-help">Si oui, une fiche emprunt sera automatiquement créée dans la section « Emprunts et dettes »</div>
          <div class="yesno">
            <div class="yesno-option" data-action="loan-link" data-bien="${bienId}" data-bientype="${bienType}" data-linked="true">Oui</div>
            <div class="yesno-option selected" data-action="loan-link" data-bien="${bienId}" data-bientype="${bienType}" data-linked="false">Non</div>
          </div>
          <div id="loan-link-${bienId}" style="display:none; margin-top: 14px; padding: 14px 18px; background: var(--gold-faint); border-left: 2px solid var(--gold); border-radius: 6px; font-size: 12.5px; color: var(--text-soft); line-height: 1.6;">
            <strong style="color: var(--gold);">Fiche emprunt liée créée ·</strong> Une nouvelle fiche a été ajoutée dans la section <strong style="color: var(--navy);">« Emprunts et dettes »</strong> et est automatiquement liée à ce bien. Vous pourrez la compléter en arrivant à cette section.
          </div>
        </div>
      </div>`;
  }

  function toggleLoanLink(bienId: string, bienType: string, isLinked: boolean) {
    const block = $('loan-link-' + bienId);
    if (block) block.style.display = isLinked ? 'block' : 'none';
    if (isLinked && !linkedLoans[bienId]) {
      assetCounters.pret++;
      const pretId = 'pret-' + assetCounters.pret;
      linkedLoans[bienId] = pretId;
      const addrEl = $(bienId + '-addr') as HTMLInputElement | null;
      const addr = addrEl ? addrEl.value || 'À préciser' : 'À préciser';
      const detail = `
        <div class="asset-detail-group" style="background: var(--gold-faint); border-left: 2px solid var(--gold); padding-left: 22px; border-radius: 6px;">
          <div class="asset-detail-group-title" style="color: var(--gold);">Lié automatiquement au ${bienType.toLowerCase()}</div>
          <div style="font-size: 12.5px; color: var(--text-soft); line-height: 1.6;">Cette fiche emprunt a été créée automatiquement lorsque vous avez indiqué qu'un prêt était associé à ce bien. Vous pouvez la dissocier ci-dessous si nécessaire.</div>
          <input type="hidden" data-linked-to="${bienId}">
        </div>
        <div class="asset-detail-group">
          <div class="asset-detail-group-title">Identité du prêt</div>
          <div class="field-row">
            <div class="field"><label class="field-label">Type de prêt</label><select class="select-input"><option>${bienType === 'Bien d’usage' ? 'Prêt immobilier (résidence principale)' : 'Prêt immobilier locatif'}</option><option>Prêt à la consommation</option><option>Prêt professionnel</option><option>Prêt étudiant</option><option>Prêt familial</option></select></div>
            <div class="field"><label class="field-label">Établissement prêteur</label><input type="text" class="text-input"></div>
          </div>
        </div>
        <div class="asset-detail-group">
          <div class="asset-detail-group-title">Emprunteurs</div>
          ${detentionTable(pretId)}
        </div>
        <div class="asset-detail-group">
          <div class="asset-detail-group-title">Caractéristiques</div>
          <div class="field-row">
            <div class="field"><label class="field-label">Capital emprunté</label><input type="text" class="text-input"></div>
            <div class="field"><label class="field-label">Capital restant dû</label><input type="text" class="text-input"></div>
          </div>
          <div class="field-row-3">
            <div class="field"><label class="field-label">Taux</label><input type="text" class="text-input"></div>
            <div class="field"><label class="field-label">Durée totale</label><input type="number" class="text-input"></div>
            <div class="field"><label class="field-label">Durée restante</label><input type="number" class="text-input"></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="field-label">Mensualité</label><input type="text" class="text-input"></div>
            <div class="field"><label class="field-label">Date de fin</label><input type="date" class="text-input"></div>
          </div>
        </div>
        ${actionsRow()}`;
      buildAssetCard('assetsListEmp', pretId, assetCounters.pret, bienType + ' · ' + addr, 'Prêt lié', '—', detail);
    } else if (!isLinked && linkedLoans[bienId]) {
      const pretId = linkedLoans[bienId];
      const pretCard = root.querySelector<HTMLElement>(`.asset-row[data-detail="${pretId}"]`);
      if (pretCard && pretCard.parentNode) pretCard.parentNode.removeChild(pretCard);
      const pretDetail = $(pretId);
      if (pretDetail && pretDetail.parentNode) pretDetail.parentNode.removeChild(pretDetail);
      delete linkedLoans[bienId];
    }
  }

  function syncLinkedLoan(bienId: string) {
    const pretId = linkedLoans[bienId];
    if (!pretId) return;
    const addrEl = $(bienId + '-addr') as HTMLInputElement | null;
    if (!addrEl) return;
    const pretRow = root.querySelector<HTMLElement>(`.asset-row[data-detail="${pretId}"] .asset-row-title`);
    if (pretRow) {
      const bienType = (pretRow.textContent || '').split(' · ')[0] || 'Bien';
      pretRow.textContent = bienType + ' · ' + (addrEl.value || 'À préciser');
    }
  }

  function toggleCTONatures(selectEl: HTMLSelectElement) {
    const ctoBlock = selectEl.closest('.asset-detail')?.querySelector<HTMLElement>('.cto-natures');
    if (!ctoBlock) return;
    ctoBlock.style.display = selectEl.value === 'Compte-titres ordinaire' ? 'block' : 'none';
  }

  function toggleCTOAutre(checkbox: HTMLInputElement) {
    const ctoAutre = checkbox.closest('.asset-detail')?.querySelector<HTMLElement>('.cto-autre');
    if (!ctoAutre) return;
    ctoAutre.style.display = checkbox.checked ? 'block' : 'none';
  }

  function adaptDetenteurSupport(selectEl: HTMLSelectElement) {
    const monoOnly = ['Livret A', 'LDDS', 'LEP', 'Livret jeune', 'PEA', 'PEA-PME', 'Livret bancaire',
      'Plan d\'Épargne Entreprise (PEE)', 'Plan d\'Épargne Interentreprises (PEI)'];
    const detailGroup = selectEl.closest('.asset-detail');
    if (!detailGroup) return;
    const detenteurSelect = detailGroup.querySelectorAll<HTMLSelectElement>('select.select-input')[3];
    const helpDiv = detailGroup.querySelector('.field-help');
    if (!detenteurSelect) return;
    if (monoOnly.includes(selectEl.value)) {
      detenteurSelect.innerHTML = '<option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option>';
      if (helpDiv) helpDiv.textContent = 'Support mono-titulaire · au nom de Monsieur ou Madame';
    } else {
      detenteurSelect.innerHTML = '<option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Les deux (cotitulaires)</option>';
      if (helpDiv) helpDiv.textContent = 'Support pouvant être individuel ou joint (compte cotitulaires)';
    }
  }

  function addEvent() {
    assetCounters.event++;
    const id = 'event-' + assetCounters.event;
    const detail = `
      <div class="asset-detail-group">
        <div class="field-row">
          <div class="field"><label class="field-label">Nature de l'événement</label>
            <select class="select-input">
              <option>Naissance</option><option>Mariage</option><option>PACS</option><option>Séparation / Divorce</option><option>Décès dans la famille</option><option>Départ d'un enfant du foyer</option><option>Changement de résidence fiscale</option><option>Autre</option>
            </select></div>
          <div class="field"><label class="field-label">Date estimée</label><input type="date" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Précisions <span class="opt">facultatif</span></label>
          <textarea class="text-input" rows="2" placeholder="Détails complémentaires…" style="resize: vertical; font-family: inherit;"></textarea></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('eventsList', id, assetCounters.event, 'Nouvel événement', 'À préciser', '—', detail);
  }

  function addDonation() {
    assetCounters.donation++;
    const id = 'donation-' + assetCounters.donation;
    const detail = `
      <div class="asset-detail-group">
        <div class="field-row">
          <div class="field"><label class="field-label">Nature</label>
            <select class="select-input"><option>Donation reçue</option><option>Donation consentie</option></select></div>
          <div class="field"><label class="field-label">Qui est concerné ?</label>
            <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date de la donation</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Montant</label><input type="text" class="text-input" placeholder="Montant en €"></div>
        </div>
        <div class="field"><label class="field-label">Donateur ou bénéficiaire</label>
          <select class="select-input" data-action="autre-donateur">
            <option>Conjoint</option><option>Enfant</option><option>Petit-enfant</option><option>Parent</option><option>Frère / Sœur</option><option>Autre membre de la famille</option><option>Tiers</option><option>Autre · à préciser</option>
          </select></div>
        <div class="field autre-donateur" style="display:none;"><label class="field-label">Précisez</label>
          <input type="text" class="text-input" placeholder="Nom et lien de parenté"></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('donationsList', id, assetCounters.donation, 'Nouvelle donation', 'À préciser', '—', detail);
  }

  function toggleAutreDonateur(sel: HTMLSelectElement) {
    const autre = sel.closest('.asset-detail')?.querySelector<HTMLElement>('.autre-donateur');
    if (autre) autre.style.display = sel.value === 'Autre · à préciser' ? 'block' : 'none';
  }

  function toggleAutreSociete(sel: HTMLSelectElement) {
    const next = sel.closest('.field')?.nextElementSibling as HTMLElement | null;
    if (next && next.classList.contains('autre-societe')) {
      next.style.display = sel.value === 'Autre société · à préciser' ? 'block' : 'none';
    }
  }

  function toggleAutreFormeJuridique(sel: HTMLSelectElement) {
    const fieldEl = sel.closest('.field') as HTMLElement | null;
    if (!fieldEl || !fieldEl.parentElement) return;
    let preciseField = fieldEl.parentElement.querySelector<HTMLElement>('.autre-forme-juridique[data-for-select]');
    if (preciseField && preciseField.previousElementSibling !== fieldEl) preciseField = null;
    if (sel.value === 'Autre · à préciser') {
      if (!preciseField) {
        preciseField = document.createElement('div');
        preciseField.className = 'field autre-forme-juridique';
        preciseField.setAttribute('data-for-select', '1');
        preciseField.style.marginTop = '14px';
        preciseField.innerHTML = '<label class="field-label">Précisez la forme juridique</label><input type="text" class="text-input" placeholder="Saisissez la forme juridique exacte">';
        fieldEl.parentNode!.insertBefore(preciseField, fieldEl.nextSibling);
      }
      preciseField.style.display = 'block';
    } else if (preciseField) {
      preciseField.style.display = 'none';
    }
  }

  function addActivite(personne: string) {
    const list = $('activites' + personne + 'List');
    if (!list) return;
    const idx = list.children.length + 1;
    const id = 'activite-' + personne.toLowerCase() + '-' + idx;
    const detail = `
      <div class="asset-detail-group">
        <div class="field-row">
          <div class="field"><label class="field-label">Statut professionnel</label>
            <select class="select-input"><option>Profession libérale</option><option>Dirigeant d'entreprise</option><option>Salarié du privé</option><option>Salarié du public</option><option>Activité accessoire</option><option>Mandat social</option><option>Autre</option></select></div>
          <div class="field"><label class="field-label">Catégorie socioprofessionnelle</label>
            <select class="select-input"><option>Cadre supérieur / Profession libérale</option><option>Cadre</option><option>Profession intermédiaire</option><option>Employé</option><option>Artisan / Commerçant</option><option>Chef d'entreprise</option></select></div>
        </div>
        <div class="field"><label class="field-label">Profession exacte</label><input type="text" class="text-input" placeholder="Profession ou fonction"></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Nom de la structure</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">SIRET <span class="opt">si applicable</span></label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date de début</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Date de fin prévue <span class="opt">facultatif</span></label><input type="date" class="text-input"></div>
        </div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('activites' + personne + 'List', id, idx, 'Activité supplémentaire · ' + personne + ' DUPONT-TOPIN', 'À renseigner', '—', detail);
  }

  function addFonctionSociete(prefix: string) {
    const list = $('fonctionsList-' + prefix);
    if (!list) return;
    const rowEl = document.createElement('div');
    rowEl.className = 'dyn-row dyn-row-fonction';
    rowEl.style.marginBottom = '10px';
    rowEl.innerHTML = '<select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Camille DUPONT-TOPIN</option><option>Antoine DUPONT-TOPIN</option><option>Autre · à préciser</option></select>' +
      '<select class="select-input"><option>Gérant</option><option>Co-gérant</option><option>Président</option><option>Directeur général</option><option>Directeur général délégué</option><option>Associé</option><option>Membre du conseil de surveillance</option><option>Autre</option></select>' +
      '<div class="dyn-row-remove" data-action="remove-parent">×</div>';
    list.appendChild(rowEl);
  }

  function addRegimeFiscal(prefix: string) {
    const list = $('regimesList-' + prefix);
    if (!list) return;
    const isIndi = prefix.indexOf('indi-') === 0;
    const optsHtml = isIndi
      ? '<option>Revenus fonciers (Micro)</option><option>Revenus fonciers (Réel)</option><option>Revenus de capitaux mobiliers</option><option>Société à l’IR</option><option>Société à l’IS</option>'
      : '<option>Micro-foncier</option><option>Réel foncier</option><option>Micro-BIC</option><option>Réel BIC</option><option>Société à l’IR</option><option>Société à l’IS</option>';
    const rowEl = document.createElement('div');
    rowEl.className = 'dyn-row dyn-row-fonction';
    rowEl.style.marginBottom = '10px';
    rowEl.innerHTML = '<select class="select-input">' + optsHtml + '</select>' +
      '<input type="text" class="text-input" placeholder="Détenteur concerné">' +
      '<div class="dyn-row-remove" data-action="remove-parent">×</div>';
    list.appendChild(rowEl);
  }

  function addActifAtypique(type: string) {
    const cfg = atypiqueConfig[type];
    if (!cfg) return;
    atypiqueCounters[type]++;
    const idx = atypiqueCounters[type];
    const id = cfg.prefix + '-' + idx;
    const detail = cfg.fields + `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Détenteur</div>
        <div class="field">
          <label class="field-label">À qui appartient cet actif ?</label>
          <select class="select-input">
            <option>Bertrand DUPONT-TOPIN</option>
            <option>Monique DUPONT-TOPIN</option>
            <option>Les deux (indivision)</option>
          </select>
        </div>
      </div>
      ${actionsRow()}`;
    buildAssetCard(cfg.listId, id, idx, cfg.title, 'À renseigner', '—', detail);
  }

  function addFATCAPerson() {
    const list = $('fatcaList');
    if (!list) return;
    const idx = list.children.length + 1;
    const id = 'fatca-' + idx;
    const div = document.createElement('div');
    div.className = 'asset-detail visible';
    div.style.marginBottom = '12px';
    div.id = id;
    div.innerHTML = `
      <div class="asset-detail-group">
        <div class="field">
          <label class="field-label">Qui est concerné ?</label>
          <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
        </div>
        <div class="field">
          <label class="field-label">Précisez la situation</label>
          <select class="select-input"><option>Citoyen américain</option><option>Résident fiscal aux États-Unis</option><option>Détenteur d'une Green Card</option><option>Personne née aux États-Unis</option></select>
        </div>
        <div class="field">
          <label class="field-label">Numéro d'identification fiscale américain (TIN / SSN)</label>
          <input type="text" class="text-input" placeholder="XXX-XX-XXXX">
        </div>
        <div class="asset-detail-actions" style="margin-top: 18px;">
          <button class="asset-detail-delete" data-action="remove-asset-detail">Supprimer</button>
          <span></span>
        </div>
      </div>`;
    list.appendChild(div);
    setTimeout(() => div.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  function addPPEPerson() {
    const list = $('ppeList');
    if (!list) return;
    const idx = list.children.length + 1;
    const id = 'ppe-' + idx;
    const div = document.createElement('div');
    div.className = 'asset-detail visible';
    div.style.marginBottom = '12px';
    div.id = id;
    div.innerHTML = `
      <div class="asset-detail-group">
        <div class="field">
          <label class="field-label">Qui est concerné ?</label>
          <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
        </div>
        <div class="field">
          <label class="field-label">Précisez la fonction occupée</label>
          <input type="text" class="text-input" placeholder="Fonction publique, mandat, poste de direction…">
        </div>
        <div class="field">
          <label class="field-label">Période</label>
          <input type="text" class="text-input" placeholder="Ex. : depuis 2018">
        </div>
        <div class="asset-detail-actions" style="margin-top: 18px;">
          <button class="asset-detail-delete" data-action="remove-asset-detail">Supprimer</button>
          <span></span>
        </div>
      </div>`;
    list.appendChild(div);
    setTimeout(() => div.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  function addPPEFamille() {
    const list = $('ppeFamList');
    if (!list) return;
    const idx = list.children.length + 1;
    const id = 'ppe-fam-' + idx;
    const detail = `
      <div class="asset-detail-group">
        <div class="field-row">
          <div class="field"><label class="field-label">Lien familial</label>
            <select class="select-input" data-action="autre-ppe-fam">
              <option>Enfant</option><option>Parent</option><option>Frère / Sœur</option><option>Grand-parent</option><option>Oncle / Tante</option><option>Cousin(e)</option><option>Autre · à préciser</option>
            </select></div>
          <div class="field"><label class="field-label">Prénom et nom</label><input type="text" class="text-input" placeholder="Identité"></div>
        </div>
        <div class="field autre-ppe-fam" style="display:none;"><label class="field-label">Précisez le lien</label>
          <input type="text" class="text-input" placeholder="Précisez le lien familial"></div>
        <div class="field"><label class="field-label">Fonction occupée</label>
          <input type="text" class="text-input" placeholder="Fonction publique, mandat, poste de direction…"></div>
        <div class="field"><label class="field-label">Période</label>
          <input type="text" class="text-input" placeholder="Ex. : depuis 2020"></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('ppeFamList', id, idx, 'Personne politiquement exposée', 'Membre de la famille', '—', detail);
  }

  function toggleAutrePPEFam(sel: HTMLSelectElement) {
    const autre = sel.closest('.asset-detail')?.querySelector<HTMLElement>('.autre-ppe-fam');
    if (autre) autre.style.display = sel.value === 'Autre · à préciser' ? 'block' : 'none';
  }

  function addProjetPro() {
    assetCounters.projet++;
    const id = 'projet-' + assetCounters.projet;
    const detail = `
      <div class="asset-detail-group">
        <div class="field-row">
          <div class="field"><label class="field-label">Qui est concerné ?</label>
            <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select></div>
          <div class="field"><label class="field-label">Horizon temporel</label>
            <select class="select-input"><option>1 à 3 ans</option><option>3 à 5 ans</option><option>Au-delà de 5 ans</option></select></div>
        </div>
        <div class="field"><label class="field-label">Nature du projet</label>
          <select class="select-input">
            <option>Cession d'entreprise</option><option>Départ en retraite</option><option>Reconversion professionnelle</option><option>Changement d'activité</option><option>Création d'activité</option><option>Autre</option>
          </select></div>
        <div class="field"><label class="field-label">Précisions <span class="opt">facultatif</span></label>
          <textarea class="text-input" rows="2" style="resize: vertical; font-family: inherit;"></textarea></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('projetsList', id, assetCounters.projet, 'Nouveau projet professionnel', 'À préciser', '—', detail);
  }

  function addDispositifFiscal() {
    assetCounters.dispositif++;
    const id = 'disp-' + assetCounters.dispositif;
    const detail = `
      <div class="asset-detail-group">
        <div class="field"><label class="field-label">Type de dispositif fiscal</label>
          <select class="select-input" data-action="dispositif-type">
            <option>Pinel</option><option>Denormandie</option><option>Malraux</option><option>Monument historique</option><option>Girardin industriel</option><option>Girardin logement social</option><option>Girardin agricole</option><option>Dons aux œuvres</option><option>Emploi à domicile</option><option>Cosse</option><option>Censi-Bouvard</option><option>Loueur en meublé non professionnel (LMNP)</option><option>Autre</option>
          </select></div>
        <div class="field autre-disp" style="display:none;"><label class="field-label">Précisez le dispositif</label>
          <input type="text" class="text-input" placeholder="Nom du dispositif fiscal"></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date de début</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Date de fin prévue</label><input type="date" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Montant investi ou réduction d’impôt attendue <span class="opt">facultatif</span></label>
          <input type="text" class="text-input" placeholder="Montant en €"></div>
        <div class="girardin-detail" style="display:none; margin-top: 16px; padding: 16px; background: var(--gold-faint); border-left: 2px solid var(--gold); border-radius: 6px;">
          <div style="font-size: 11px; color: var(--gold); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 12px;">Précisions Girardin · investissement à fonds perdus en outre-mer</div>
          <div class="field-row">
            <div class="field"><label class="field-label">Véhicule de souscription</label>
              <select class="select-input"><option>SAS de portage</option><option>GIE (Groupement d’Intérêt Économique)</option><option>SNC</option><option>Souscription directe</option></select></div>
            <div class="field"><label class="field-label">Promoteur / monteur</label><input type="text" class="text-input" placeholder="Inter Invest, Ecofip, Profina…"></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="field-label">Année de souscription</label><input type="number" class="text-input" placeholder="Ex. : 2024"></div>
            <div class="field"><label class="field-label">Réduction d’impôt obtenue (one-shot)</label><input type="text" class="text-input" placeholder="Montant en €"></div>
          </div>
          <div class="field"><label class="field-label">Localisation outre-mer</label>
            <select class="select-input"><option>—</option><option>Guadeloupe</option><option>Martinique</option><option>Guyane</option><option>La Réunion</option><option>Mayotte</option><option>Nouvelle-Calédonie</option><option>Polynésie française</option><option>Saint-Martin / Saint-Barthélemy</option><option>Saint-Pierre-et-Miquelon</option><option>Wallis-et-Futuna</option></select></div>
        </div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('dispositifsList', id, assetCounters.dispositif, 'Nouveau dispositif fiscal', 'À préciser', '—', detail);
  }

  function toggleAutreDisp(sel: HTMLSelectElement) {
    const autre = sel.closest('.asset-detail')?.querySelector<HTMLElement>('.autre-disp');
    if (autre) autre.style.display = sel.value === 'Autre' ? 'block' : 'none';
  }

  function toggleGirardinDetail(sel: HTMLSelectElement) {
    const detail = sel.closest('.asset-detail')?.querySelector<HTMLElement>('.girardin-detail');
    if (!detail) return;
    const isGirardin = sel.value.indexOf('Girardin') === 0;
    detail.style.display = isGirardin ? 'block' : 'none';
  }

  function addSociete() {
    assetCounters.pro++;
    const id = 'pro-' + assetCounters.pro;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">1 · Identité de la société</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Dénomination sociale</label><input type="text" class="text-input" placeholder="Nom de la société"></div>
          <div class="field"><label class="field-label">Forme juridique</label><select class="select-input" data-action="forme-juridique"><option>SCI</option><option>SARL</option><option>SAS</option><option>SA</option><option>EURL</option><option>SASU</option><option>SNC</option><option>SELARL</option><option>SELAS</option><option>SCP</option><option>SEL</option><option>SELAFA</option><option>SELCA</option><option>Autre · à préciser</option></select></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">SIREN</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Date de création</label><input type="date" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Activité principale</label><input type="text" class="text-input"></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">2 · Capital social et valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Capital social</label><input type="text" class="text-input" placeholder="Montant en €"></div>
          <div class="field"><label class="field-label">Valeur estimée de la société</label><input type="text" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">3 · Détention du capital</div>
        ${detentionTable(id)}
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">4 · Régime fiscal</div>
        <div class="field"><label class="field-label">Régime fiscal</label><select class="select-input"><option>Impôt sur le revenu (IR)</option><option>Impôt sur les sociétés (IS)</option></select></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">5 · Fonctions occupées dans la société</div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; font-style: italic;">Indiquez qui occupe quelle fonction.</div>
        <div class="assets-list" id="fonctionsList-${id}">
          <div class="dyn-row dyn-row-fonction" style="margin-bottom: 10px;">
            <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Camille DUPONT-TOPIN</option><option>Antoine DUPONT-TOPIN</option><option>Autre · à préciser</option></select>
            <select class="select-input"><option>Gérant</option><option>Co-gérant</option><option>Président</option><option>Directeur général</option><option>Associé</option><option>Autre</option></select>
            <div class="dyn-row-remove" data-action="remove-parent">×</div>
          </div>
        </div>
        <button class="btn-add-asset" data-action="add-fonction-societe" data-prefix="${id}"><svg><use href="#ic-plus"/></svg>Ajouter une fonction</button>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">6 · Autres associés</div>
        <div class="field"><label class="field-label">Autres associés <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">7 · Caractéristiques fiscales</div>
        <div class="field"><label class="field-label">La société est-elle à prépondérance immobilière ?</label>
          <div class="field-help" style="margin-bottom: 16px;">Une société est dite à prépondérance immobilière lorsque plus de 50 % de son actif est constitué d’immeubles non affectés à sa propre exploitation</div>
          <div class="yesno">
            <div class="yesno-option" data-action="preponderance" data-val="oui">Oui</div>
            <div class="yesno-option selected" data-action="preponderance" data-val="non">Non</div>
          </div>
        </div>
        <div class="conditional preponderance-conditional">
          <div style="background: var(--ivory); border-left: 2px solid var(--gold); padding: 14px 18px; border-radius: 6px; font-size: 13px; color: var(--text-soft); line-height: 1.6;">
            <strong style="color: var(--navy);">À noter ·</strong> Une société à prépondérance immobilière ne peut généralement pas bénéficier de l’<strong>exonération Pacte Dutreil</strong>. Exception : si cette société est une <strong>holding animatrice</strong>. Votre ingénieur patrimonial étudiera ce cas spécifique avec vous.
          </div>
        </div>
        <div class="dutreil-block" style="margin-top: 20px;">
          <div class="field"><label class="field-label">Les titres sont-ils sous engagement Pacte Dutreil ?</label>
            <div class="field-help" style="margin-bottom: 16px;">Engagement collectif de conservation permettant un abattement de 75 % en cas de transmission</div>
            <div class="yesno">
              <div class="yesno-option" data-action="dutreil" data-val="oui">Oui</div>
              <div class="yesno-option selected" data-action="dutreil" data-val="non">Non</div>
            </div>
          </div>
          <div class="conditional dutreil-conditional">
            <div class="field-row">
              <div class="field"><label class="field-label">Type d’engagement</label>
                <select class="select-input"><option>Engagement collectif</option><option>Engagement individuel post-collectif</option><option>Engagement réputé acquis</option></select></div>
              <div class="field"><label class="field-label">Date de signature</label><input type="date" class="text-input"></div>
            </div>
            <div class="field-row">
              <div class="field"><label class="field-label">Durée totale (années)</label><input type="number" class="text-input" placeholder="Ex. : 2 + 4"></div>
              <div class="field"><label class="field-label">Durée restante (années)</label><input type="number" class="text-input"></div>
            </div>
            <div class="field"><label class="field-label">Quote-part des titres sous engagement (%)</label>
              <input type="number" class="text-input" min="0" max="100" placeholder="Ex. : 34 ou 100">
              <div class="field-help">Minimum légal : 17 % du capital pour sociétés cotées · 34 % pour non cotées</div></div>
          </div>
        </div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListPro', id, assetCounters.pro, 'Nouvelle société', 'À renseigner', '—', detail);
  }

  function addBienUsage() {
    assetCounters.usg++;
    const id = 'usg-' + assetCounters.usg;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Localisation et type</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type de bien</label><select class="select-input"><option>Appartement</option><option>Maison</option><option>Terrain</option><option>Local mixte</option></select></div>
          <div class="field"><label class="field-label">Usage</label><select class="select-input"><option>Résidence secondaire</option><option>Résidence principale</option><option>Bien à usage professionnel</option><option>Pied-à-terre</option></select></div>
        </div>
        <div class="field"><label class="field-label">Adresse</label><input type="text" class="text-input" id="${id}-addr" placeholder="Adresse complète" data-action="sync-loan" data-bien="${id}"></div>
        <div class="field-row-3">
          <div class="field"><label class="field-label">Code postal</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Ville</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Pays</label><select class="select-input"><option>France</option><option>Autre</option></select></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Caractéristiques</div>
        <div class="field-row-3">
          <div class="field"><label class="field-label">Surface (m²)</label><input type="number" class="text-input"></div>
          <div class="field"><label class="field-label">Nombre de pièces</label><input type="number" class="text-input"></div>
          <div class="field"><label class="field-label">Année construction</label><input type="number" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">DPE</label><select class="select-input"><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option><option>Non communiqué</option></select></div>
          <div class="field"><label class="field-label">GES</label><select class="select-input"><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option><option>Non communiqué</option></select></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Acquisition et valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date d'acquisition</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Prix d'acquisition</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Frais d'acquisition</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Valeur brute actuelle estimée</label><input type="text" class="text-input"></div>
        </div>
      </div>
      ${loanLinkBlock(id, 'Bien d’usage')}
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Mode de détention</div>
        ${detentionTable(id)}
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListUsg', id, assetCounters.usg, 'Nouveau bien d\'usage', 'À renseigner', '—', detail);
  }

  function addBienLocatif() {
    assetCounters.loc++;
    const id = 'loc-' + assetCounters.loc;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Localisation et type</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type de bien</label><select class="select-input"><option>Appartement</option><option>Maison</option><option>Local commercial</option><option>Parking / Box</option><option>Terrain</option></select></div>
          <div class="field"><label class="field-label">Type de location</label><select class="select-input"><option>Location nue</option><option>LMNP</option><option>LMP</option><option>Location saisonnière</option></select></div>
        </div>
        <div class="field"><label class="field-label">Adresse</label><input type="text" class="text-input" id="${id}-addr" data-action="sync-loan" data-bien="${id}"></div>
        <div class="field-row-3">
          <div class="field"><label class="field-label">Code postal</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Ville</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Pays</label><select class="select-input"><option>France</option><option>Autre</option></select></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Caractéristiques</div>
        <div class="field-row-3">
          <div class="field"><label class="field-label">Surface (m²)</label><input type="number" class="text-input"></div>
          <div class="field"><label class="field-label">Pièces</label><input type="number" class="text-input"></div>
          <div class="field"><label class="field-label">Année construction</label><input type="number" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">DPE</label><select class="select-input"><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option><option>Non communiqué</option></select></div>
          <div class="field"><label class="field-label">GES</label><select class="select-input"><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option><option>Non communiqué</option></select></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Acquisition et valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date d'acquisition</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Prix d'acquisition</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Frais d'acquisition</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Valeur brute estimée</label><input type="text" class="text-input"></div>
        </div>
      </div>
      ${loanLinkBlock(id, 'Bien locatif')}
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Mode de détention</div>
        ${detentionTable(id)}
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Exploitation locative</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Loyer mensuel brut</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Loyer annuel brut</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Charges annuelles</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Taxe foncière</label><input type="text" class="text-input"></div>
        </div>
        <div class="field">
          <label class="field-label">Date de mise en location</label><input type="date" class="text-input">
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Régime(s) fiscal(aux)</div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; font-style: italic;">Si plusieurs détenteurs avec des régimes différents, vous pouvez en ajouter plusieurs.</div>
        <div class="assets-list" id="regimesList-${id}">
          <div class="dyn-row dyn-row-fonction" style="margin-bottom: 10px;">
            <select class="select-input"><option>Micro-foncier</option><option>Réel foncier</option><option>Micro-BIC</option><option>Réel BIC</option><option>Société à l’IR</option><option>Société à l’IS</option></select>
            <input type="text" class="text-input" placeholder="Détenteur concerné">
            <div class="dyn-row-remove" data-action="remove-parent">×</div>
          </div>
        </div>
        <button class="btn-add-asset" data-action="add-regime" data-prefix="${id}"><svg><use href="#ic-plus"/></svg>Ajouter un régime fiscal</button>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Dispositif fiscal éventuel</div>
        <div class="field"><label class="field-label">Ce bien bénéficie-t-il d'un dispositif fiscal ?</label>
          <select class="select-input"><option>Aucun</option><option>Pinel</option><option>Denormandie</option><option>Malraux</option><option>Monument historique</option><option>Cosse</option><option>Censi-Bouvard</option></select></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListLoc', id, assetCounters.loc, 'Nouveau bien locatif', 'À renseigner', '—', detail);
  }

  function addSupportIndirect() {
    assetCounters.indi++;
    const id = 'indi-' + assetCounters.indi;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification du support</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type</label><select class="select-input"><option>SCPI</option><option>OPCI</option><option>Parts de SCI</option><option>OPCVM immobilier</option></select></div>
          <div class="field"><label class="field-label">Société de gestion</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Nom du support</label><input type="text" class="text-input" placeholder="Ex. : Corum Origin"></div>
          <div class="field"><label class="field-label">Date de souscription</label><input type="date" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Nombre de parts</label><input type="number" class="text-input"></div>
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Revenus annuels perçus</label><input type="text" class="text-input"></div>
      </div>
      ${loanLinkBlock(id, 'Immobilier indirect')}
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Régime(s) fiscal(aux)</div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; font-style: italic;">Si plusieurs détenteurs avec des régimes différents, vous pouvez en ajouter plusieurs.</div>
        <div class="assets-list" id="regimesList-${id}">
          <div class="dyn-row dyn-row-fonction" style="margin-bottom: 10px;">
            <select class="select-input"><option>Revenus fonciers (Micro)</option><option>Revenus fonciers (Réel)</option><option>Revenus de capitaux mobiliers</option><option>Société à l’IR</option><option>Société à l’IS</option></select>
            <input type="text" class="text-input" placeholder="Détenteur concerné">
            <div class="dyn-row-remove" data-action="remove-parent">×</div>
          </div>
        </div>
        <button class="btn-add-asset" data-action="add-regime" data-prefix="${id}"><svg><use href="#ic-plus"/></svg>Ajouter un régime fiscal</button>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Mode de détention</div>
        ${detentionTable(id)}
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListIndi', id, assetCounters.indi, 'Nouveau support immobilier indirect', 'À renseigner', '—', detail);
  }

  function addLiquidite() {
    assetCounters.fin++;
    const id = 'fin-' + assetCounters.fin;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification du support</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type de support</label>
            <select class="select-input" data-action="adapt-detenteur">
              <option>Livret A</option><option>LDDS</option><option>LEP</option><option>Livret jeune</option><option>Livret bancaire</option><option>Compte à terme</option><option>Compte courant</option>
            </select></div>
          <div class="field"><label class="field-label">Établissement</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">N° de contrat</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Date d’ouverture</label><input type="date" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation et détention</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Montant actuel</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Détenteur</label>
            <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
            <div class="field-help">Support mono-titulaire · au nom de Monsieur ou Madame</div>
          </div>
        </div>
        <div class="field"><label class="field-label">Versement programmé mensuel <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListFin', id, assetCounters.fin, 'Nouvelle liquidité', 'À renseigner', '—', detail);
  }

  function addInvestissement() {
    assetCounters.fin++;
    const id = 'fin-' + assetCounters.fin;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identification du support</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type de support</label>
            <select class="select-input" data-action="adapt-detenteur-cto">
              <option>PEA</option><option>PEA-PME</option><option>Compte-titres ordinaire</option><option>Plan d’Épargne Entreprise (PEE)</option><option>Plan d’Épargne Interentreprises (PEI)</option>
            </select></div>
          <div class="field"><label class="field-label">Établissement</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">N° de contrat</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Date d’ouverture</label><input type="date" class="text-input"></div>
        </div>
      </div>
      <div class="cto-natures" style="display:none;">
        <div class="asset-detail-group">
          <div class="asset-detail-group-title">Natures de titres détenus dans le CTO</div>
          <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; font-style: italic;">Cochez les natures de titres présentes.</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;">
            <label class="cto-nature-check"><input type="checkbox"> Actions françaises et européennes</label>
            <label class="cto-nature-check"><input type="checkbox"> Actions étrangères</label>
            <label class="cto-nature-check"><input type="checkbox"> Obligations</label>
            <label class="cto-nature-check"><input type="checkbox"> OPCVM / ETF</label>
            <label class="cto-nature-check"><input type="checkbox"> Parts de SOFICA</label>
            <label class="cto-nature-check"><input type="checkbox"> Parts de FCPI</label>
            <label class="cto-nature-check"><input type="checkbox"> Parts de FCPR</label>
            <label class="cto-nature-check"><input type="checkbox"> Parts de FIP</label>
            <label class="cto-nature-check"><input type="checkbox" data-action="cto-autre"> Autres valeurs mobilières</label>
          </div>
          <div class="field cto-autre" style="display:none; margin-top: 14px;">
            <label class="field-label">Précisez les autres valeurs mobilières</label>
            <input type="text" class="text-input" placeholder="Nature et description">
          </div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation et détention</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Montant actuel</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Détenteur</label>
            <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
            <div class="field-help">Support mono-titulaire · au nom de Monsieur ou Madame</div>
          </div>
        </div>
        <div class="field"><label class="field-label">Versement programmé mensuel <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListInvest', id, assetCounters.fin, 'Nouveau support d’investissement', 'À renseigner', '—', detail);
  }

  function addContratAV() {
    assetCounters.av++;
    const id = 'av-' + assetCounters.av;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identité du contrat</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type</label><select class="select-input"><option>Assurance-vie</option><option>Capitalisation</option></select></div>
          <div class="field"><label class="field-label">Compagnie</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Nom du contrat</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">N° de contrat</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date d'ouverture</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Souscripteur(s)</label><select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Co-souscription</option></select></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation et allocation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Versements cumulés</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">% en fonds en euros</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">% en unités de compte</label><input type="text" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Clause bénéficiaire</div>
        <div class="field"><label class="field-label">Désignation bénéficiaire</label>
          <textarea class="text-input" rows="2" placeholder="Ex. : mon conjoint, à défaut mes enfants par parts égales…" style="resize: vertical; font-family: inherit;"></textarea></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListAV', id, assetCounters.av, 'Nouveau contrat', 'À renseigner', '—', detail);
  }

  function addContratRetraite() {
    assetCounters.per++;
    const id = 'per-' + assetCounters.per;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identité du contrat</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type</label><select class="select-input"><option>PER Individuel (PERIN)</option><option>PER Entreprise Collectif (PERECO)</option><option>PER Entreprise Obligatoire (PERO)</option><option>Madelin retraite</option><option>PERP</option><option>Article 83</option></select></div>
          <div class="field"><label class="field-label">Compagnie</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date d'ouverture</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Titulaire</label>
            <select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select>
            <div class="field-help">L'épargne retraite est strictement nominative · pas de co-souscription</div>
          </div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Valorisation</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Valorisation actuelle</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Versements cumulés</label><input type="text" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Versement annuel <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListPer', id, assetCounters.per, 'Nouveau contrat retraite', 'À renseigner', '—', detail);
  }

  function addContratPrev() {
    assetCounters.prev++;
    const id = 'prev-' + assetCounters.prev;
    const detail = `
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identité du contrat</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type de garantie</label><select class="select-input"><option>Décès / Invalidité</option><option>Garantie obsèques</option><option>Incapacité temporaire</option><option>Dépendance</option><option>Mixte (multi-garanties)</option></select></div>
          <div class="field"><label class="field-label">Compagnie</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Assuré</label><select class="select-input"><option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option></select></div>
          <div class="field"><label class="field-label">Date d'effet</label><input type="date" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Garanties</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Capital décès</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Capital invalidité</label><input type="text" class="text-input"></div>
        </div>
        <div class="field"><label class="field-label">Cotisation annuelle</label><input type="text" class="text-input"></div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Clause bénéficiaire</div>
        <div class="field"><label class="field-label">Désignation bénéficiaire</label>
          <textarea class="text-input" rows="2" style="resize: vertical; font-family: inherit;"></textarea></div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListPrev', id, assetCounters.prev, 'Nouveau contrat de prévoyance', 'À renseigner', '—', detail);
  }

  function addEmprunt() {
    assetCounters.pret++;
    const id = 'pret-' + assetCounters.pret;
    const detail = `
      <div class="link-bien-block">
        <label class="field-label">Lier ce prêt à un bien ou une société déjà renseigné(e) ?</label>
        <select class="select-input">
          <option>Aucun lien</option>
          <optgroup label="Immobilier d'usage">
            <option>Résidence principale · 48 rue de l'Université, Paris 7e</option>
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
        <div class="field-help" style="margin-top: 8px;">Cela permet d'associer automatiquement ce prêt à un actif et de calculer la valeur nette de votre patrimoine.</div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Identité du prêt</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Type de prêt</label><select class="select-input"><option>Prêt immobilier (résidence principale)</option><option>Prêt immobilier locatif</option><option>Prêt à la consommation</option><option>Prêt professionnel</option><option>Prêt étudiant</option><option>Prêt familial</option></select></div>
          <div class="field"><label class="field-label">Établissement prêteur</label><input type="text" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Emprunteurs</div>
        ${detentionTable(id)}
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Caractéristiques</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Capital emprunté</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Capital restant dû</label><input type="text" class="text-input"></div>
        </div>
        <div class="field-row-3">
          <div class="field"><label class="field-label">Taux</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Durée totale</label><input type="number" class="text-input"></div>
          <div class="field"><label class="field-label">Durée restante</label><input type="number" class="text-input"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Date de début</label><input type="date" class="text-input"></div>
          <div class="field"><label class="field-label">Mensualité</label><input type="text" class="text-input"></div>
        </div>
      </div>
      <div class="asset-detail-group">
        <div class="asset-detail-group-title">Assurance emprunteur</div>
        <div class="field-row">
          <div class="field"><label class="field-label">Quotité</label><input type="text" class="text-input"></div>
          <div class="field"><label class="field-label">Cotisation mensuelle</label><input type="text" class="text-input"></div>
        </div>
      </div>
      ${actionsRow()}`;
    buildAssetCard('assetsListPret', id, assetCounters.pret, 'Nouveau prêt', 'À renseigner', '—', detail);
  }

  function addObjectif() {
    assetCounters.obj++;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="q-block obj-block" draggable="true" data-obj="1">
        <div class="q-block-head">
          <div class="obj-drag-handle" title="Glisser pour réordonner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>
          </div>
          <div class="q-block-number obj-num">—</div>
          <div class="q-block-text">
            <div class="q-block-title obj-title">Nouvel objectif</div>
            <div class="q-block-subtitle">Faites glisser pour réordonner</div>
          </div>
          <button class="asset-detail-delete" style="margin-top: 0;" data-action="delete-objectif">Supprimer</button>
        </div>
        <div class="field">
          <label class="field-label">Quel est cet objectif ?</label>
          <select class="select-input" data-action="obj-title">
            <option>Préparer ma transmission patrimoniale</option><option>Préparer ma retraite</option><option>Optimiser ma fiscalité</option><option>Protéger ma famille</option><option>Acquérir un bien immobilier</option><option>Investir pour générer des revenus</option><option>Constituer un capital</option><option>Financer les études de mes enfants</option><option>Anticiper une cession professionnelle</option><option>Diversifier mon patrimoine</option><option>Autre · préciser</option>
          </select>
        </div>
        <div class="field-row-3 obj-row">
          <div class="field"><label class="field-label">Importance</label>
            <select class="select-input"><option>Élevée</option><option>Moyenne</option><option>Faible</option></select></div>
          <div class="field"><label class="field-label">Quand initier ?</label>
            <select class="select-input"><option>Urgent · moins d'un an</option><option>Court terme · 1 à 2 ans</option><option>Moyen terme · 3 à 5 ans</option><option>Long terme · 5 à 10 ans</option><option>Très long terme · 10+ ans</option></select></div>
          <div class="field"><label class="field-label">Quand atteindre ?</label>
            <select class="select-input"><option>Urgent · moins d'un an</option><option>Court terme · 1 à 2 ans</option><option>Moyen terme · 3 à 5 ans</option><option>Long terme · 5 à 10 ans</option><option>Très long terme · 10+ ans</option></select></div>
        </div>
        <div class="field">
          <label class="field-label">Précisez le contexte et les enjeux <span class="opt">facultatif</span></label>
          <textarea class="text-input" rows="3" placeholder="Décrivez votre objectif en détail…" style="resize: vertical; font-family: inherit;"></textarea>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Montant cible <span class="opt">si applicable</span></label><input type="text" class="text-input" placeholder="Montant en €"></div>
          <div class="field"><label class="field-label">Bénéficiaires concernés <span class="opt">facultatif</span></label><input type="text" class="text-input"></div>
        </div>
      </div>`;
    const list = $('objectifsList');
    if (!list) return;
    const block = wrapper.firstElementChild as HTMLElement;
    bindObjDrag(block);
    while (wrapper.firstChild) list.appendChild(wrapper.firstChild);
    renumerObjectifs();
    setTimeout(() => { (list.lastElementChild as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
  }

  function renumerObjectifs() {
    const list = $('objectifsList');
    if (!list) return;
    const blocks = list.querySelectorAll('.obj-block');
    blocks.forEach((block, i) => {
      const numEl = block.querySelector('.obj-num');
      if (numEl) numEl.textContent = String(i + 1);
    });
  }

  function updateObjTitle(selectEl: HTMLSelectElement) {
    const titleEl = selectEl.closest('.q-block')?.querySelector('.obj-title');
    if (titleEl) titleEl.textContent = selectEl.value;
  }

  let draggedObj: HTMLElement | null = null;
  function bindObjDrag(block: HTMLElement) {
    block.addEventListener('dragstart', (e) => {
      draggedObj = block;
      block.classList.add('obj-dragging');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    block.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      if (block === draggedObj || !draggedObj) return;
      const rect = block.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const list = $('objectifsList');
      if (!list) return;
      if (e.clientY < mid) list.insertBefore(draggedObj, block);
      else list.insertBefore(draggedObj, block.nextSibling);
    });
    block.addEventListener('drop', (e) => e.preventDefault());
    block.addEventListener('dragend', () => {
      if (draggedObj) draggedObj.classList.remove('obj-dragging');
      draggedObj = null;
      renumerObjectifs();
    });
  }

  // ─── Délégation des événements ───
  const onClick = (e: Event) => {
    const t = e.target as HTMLElement;
    const actionEl = t.closest<HTMLElement>('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    switch (action) {
      case 'next': nextStep(); break;
      case 'prev': prevStep(); break;
      case 'toggle-yn': toggleYN(actionEl); applyInlineYN(actionEl); break;
      case 'toggle-asset': {
        toggleAsset(actionEl, actionEl.dataset.detail!);
        break;
      }
      case 'add-enfant': addEnfant(); break;
      case 'add-revenu': addRevenu(); break;
      case 'add-charge': addCharge(); break;
      case 'add-fatca': addFATCAPerson(); break;
      case 'add-ppe': addPPEPerson(); break;
      case 'add-ppe-famille': addPPEFamille(); break;
      case 'add-event': addEvent(); break;
      case 'add-donation': addDonation(); break;
      case 'add-activite': addActivite(actionEl.dataset.personne!); break;
      case 'add-projet': addProjetPro(); break;
      case 'add-dispositif': addDispositifFiscal(); break;
      case 'add-societe': addSociete(); break;
      case 'add-fonction-societe': addFonctionSociete(actionEl.dataset.prefix!); break;
      case 'add-regime': addRegimeFiscal(actionEl.dataset.prefix!); break;
      case 'add-bien-usage': addBienUsage(); break;
      case 'add-bien-locatif': addBienLocatif(); break;
      case 'add-support-indirect': addSupportIndirect(); break;
      case 'add-liquidite': addLiquidite(); break;
      case 'add-investissement': addInvestissement(); break;
      case 'add-av': addContratAV(); break;
      case 'add-retraite': addContratRetraite(); break;
      case 'add-prev': addContratPrev(); break;
      case 'add-emprunt': addEmprunt(); break;
      case 'add-atypique': addActifAtypique(actionEl.dataset.type!); break;
      case 'add-objectif': addObjectif(); break;
      case 'remove-parent': actionEl.parentElement?.remove(); break;
      case 'remove-asset-detail': actionEl.closest('.asset-detail')?.remove(); break;
      case 'delete-card': {
        const d = actionEl.closest('.asset-detail');
        const prev = d?.previousElementSibling;
        prev?.remove();
        d?.remove();
        break;
      }
      case 'delete-objectif': actionEl.closest('.q-block')?.remove(); renumerObjectifs(); break;
      case 'stop': e.stopPropagation(); break;
      case 'loan-link': {
        toggleYN(actionEl);
        toggleLoanLink(actionEl.dataset.bien!, actionEl.dataset.bientype!, actionEl.dataset.linked === 'true');
        break;
      }
      case 'preponderance': {
        toggleYN(actionEl);
        const detail = actionEl.closest('.asset-detail');
        const cond = detail?.querySelector<HTMLElement>('.preponderance-conditional');
        const dutreil = detail?.querySelector<HTMLElement>('.dutreil-block');
        if (actionEl.dataset.val === 'oui') {
          cond?.classList.add('visible');
          if (dutreil) dutreil.style.display = 'none';
        } else {
          cond?.classList.remove('visible');
          if (dutreil) dutreil.style.display = 'block';
        }
        break;
      }
      case 'dutreil': {
        toggleYN(actionEl);
        const cond = actionEl.closest('.asset-detail')?.querySelector<HTMLElement>('.dutreil-conditional');
        if (actionEl.dataset.val === 'oui') cond?.classList.add('visible');
        else cond?.classList.remove('visible');
        break;
      }
    }
  };

  // Toggles « oui/non » des conditionnels statiques de la maquette (target par data-target)
  function applyInlineYN(el: HTMLElement) {
    const targets = (el.dataset.show || '').split(',').filter(Boolean);
    const hides = (el.dataset.hide || '').split(',').filter(Boolean);
    targets.forEach((id) => $(id)?.classList.add('visible'));
    hides.forEach((id) => $(id)?.classList.remove('visible'));
    if (el.dataset.hideStyle) $(el.dataset.hideStyle)!.style.display = 'none';
    if (el.dataset.showStyle) $(el.dataset.showStyle)!.style.display = 'block';
  }

  const onChange = (e: Event) => {
    const t = e.target as HTMLElement;
    const actionEl = t.closest<HTMLElement>('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === 'res-fisc' || actionEl.id === 'residenceFiscale') { onResFiscChange(); return; }
      if (action === 'testament-def') { showTestamentDef(t as HTMLSelectElement); return; }
      if (action === 'cert-check') { checkFinalValid(); return; }
      if (action === 'autre-societe') { toggleAutreSociete(t as HTMLSelectElement); return; }
      if (action === 'autre-donateur') { toggleAutreDonateur(t as HTMLSelectElement); return; }
      if (action === 'autre-ppe-fam') { toggleAutrePPEFam(t as HTMLSelectElement); return; }
      if (action === 'forme-juridique') { toggleAutreFormeJuridique(t as HTMLSelectElement); return; }
      if (action === 'dispositif-type') { toggleAutreDisp(t as HTMLSelectElement); toggleGirardinDetail(t as HTMLSelectElement); return; }
      if (action === 'adapt-detenteur') { adaptDetenteurSupport(t as HTMLSelectElement); toggleCTONatures(t as HTMLSelectElement); return; }
      if (action === 'adapt-detenteur-cto') { adaptDetenteurSupport(t as HTMLSelectElement); toggleCTONatures(t as HTMLSelectElement); return; }
      if (action === 'cto-autre') { toggleCTOAutre(t as HTMLInputElement); return; }
      if (action === 'obj-title') { updateObjTitle(t as HTMLSelectElement); return; }
    }
  };

  const onInput = (e: Event) => {
    const t = e.target as HTMLElement;
    const actionEl = t.closest<HTMLElement>('[data-action]');
    if (!actionEl) return;
    if (actionEl.dataset.action === 'detention') updateDetention(actionEl.dataset.prefix!);
    if (actionEl.dataset.action === 'sync-loan') syncLinkedLoan(actionEl.dataset.bien!);
  };

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('input', onInput);

  // État initial : section 1 figée, progression à 0.
  root.classList.add('s1-fixed');
  updateProgress();
  updateNav();

  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
    root.removeEventListener('input', onInput);
    root.classList.remove('s1-fixed');
  };
}
