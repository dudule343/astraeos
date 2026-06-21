"use client";

import { useState } from "react";

// État initial repris de la maquette : seules deux classes indépendantes existent
// sur chaque carte, .active (étape ouverte) et .completed (étape validée ✓ Validé).
// Étape 1 complétée + ouverte, étape 2 ouverte (active), étapes 3 à 6 fermées.
// toggleWizardStep ne touche QUE .active (ouvre/ferme), comme la maquette : il ne
// valide jamais une étape. goToWizardStep valide les étapes précédentes et ouvre la cible.
const INITIAL_ACTIVE_STEP = 2;
const INITIAL_COMPLETED: number[] = [1];

// Badge de base de chaque étape dans la maquette (statique, hors validation).
const BASE_BADGE: Record<number, { cls: string; label: string }> = {
  1: { cls: "badge badge-gold", label: "En cours" },
  2: { cls: "badge badge-gold", label: "En cours" },
  3: { cls: "badge badge-neutral", label: "À configurer" },
  4: { cls: "badge badge-neutral", label: "À configurer" },
  5: { cls: "badge badge-neutral", label: "À configurer" },
  6: { cls: "badge badge-neutral", label: "Final" },
};

function statusBadge(step: number, completed: boolean) {
  if (completed) return { cls: "badge badge-success", label: "Validé" };
  return BASE_BADGE[step] ?? { cls: "badge badge-neutral", label: "À configurer" };
}

const packs: { checked: boolean; pack: string; badge: string; type: string; priceClass: string; price: string }[] = [
  { checked: true, pack: "Pack Investissements financiers · Abonnement portefeuille", badge: "badge badge-gold", type: "Récurrent", priceClass: "num cell-money", price: "87 €/mois" },
  { checked: false, pack: "Pack Investissements financiers · Constitution portefeuille", badge: "badge badge-purple", type: "Unique", priceClass: "num cell-money", price: "1 000 €" },
  { checked: true, pack: "Pack Immobilier patrimonial · Mise en relation partenaires", badge: "badge badge-success", type: "Inclus", priceClass: "num", price: "commission partenaire" },
  { checked: true, pack: "Pack Assurances de personnes · Mise en relation partenaires", badge: "badge badge-success", type: "Inclus", priceClass: "num", price: "commission partenaire" },
  { checked: false, pack: "Bibliothèque de documents actualisés", badge: "badge badge-purple", type: "Unique", priceClass: "num cell-money", price: "990 €" },
  { checked: false, pack: "Rédaction et immatriculation de société (hors formalisme)", badge: "badge badge-purple", type: "Unique", priceClass: "num cell-money", price: "1 200 €" },
  { checked: false, pack: "Pack Supervision d'études", badge: "badge badge-info", type: "À l'unité", priceClass: "num cell-money", price: "800 € / étude" },
  { checked: false, pack: "Pack Formation", badge: "badge badge-info", type: "À l'unité", priceClass: "num cell-money", price: "1 000 € / formation" },
];

const ingenieurs: { nom: string; email: string; roleClass: string; role: string }[] = [
  { nom: "Marc DELORME", email: "m.delorme@patrimoine-avignon.fr", roleClass: "badge badge-gold", role: "Administrateur" },
  { nom: "Émilie ROBERT", email: "e.robert@patrimoine-avignon.fr", roleClass: "badge badge-info", role: "Ingénieure" },
];

const recap: { label: string; value: string; gold?: boolean }[] = [
  { label: "Type", value: "Cabinet direct" },
  { label: "Raison sociale", value: "Patrimoine Conseil Avignon SAS" },
  { label: "SIREN", value: "892 547 318" },
  { label: "Sous-domaine", value: "patrimoine-avignon.astraeos.fr" },
  { label: "Packs initiaux", value: "3 sélectionnés" },
  { label: "Ingénieurs", value: "2 invités" },
  { label: "Revenu /mois facturé", value: "87 €/mois", gold: true },
];

const documents = [
  "Contrat de prestation (PDF)",
  "CGU acceptées",
  "Conditions de facturation",
  "Notice RGPD",
];

export function ClientNewWizard() {
  const [activeStep, setActiveStep] = useState<number>(INITIAL_ACTIVE_STEP);
  const [completed, setCompleted] = useState<number[]>(INITIAL_COMPLETED);

  function toggleWizardStep(stepNum: number) {
    // Comme la maquette : on retire .active partout puis on rouvre la cible si
    // elle n'était pas déjà ouverte. On ne touche JAMAIS .completed ni le badge.
    setActiveStep((prev) => (prev === stepNum ? 0 : stepNum));
  }

  function goToWizardStep(stepNum: number) {
    // Valide toutes les étapes précédentes (✓ + badge « Validé ») et ouvre la cible.
    setCompleted((prev) => {
      const set = new Set(prev);
      for (let i = 1; i < stepNum; i++) set.add(i);
      return [...set];
    });
    setActiveStep(stepNum);
  }

  function cardClass(step: number) {
    let cls = "wizard-step-card";
    if (step === activeStep) cls += " active";
    if (completed.includes(step)) cls += " completed";
    return cls;
  }

  function stepNum(step: number) {
    return completed.includes(step) ? "✓" : String(step);
  }

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Opérations clients</div>
          <h1 className="hero-title">Créer un nouveau client</h1>
          <p className="hero-sub">
            Wizard interactif en 6 étapes — cliquer sur l&apos;en-tête d&apos;une étape la déplie.
            Chaque étape est testable et peut être validée pour passer à la suivante.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-ghost btn-sm" data-stub="Annuler">Annuler</button>
        </div>
      </div>

      <div className="info-bar">
        <svg><use href="#i-info" /></svg>
        <div>
          <strong>Mode test :</strong> toutes les étapes sont cliquables. Cliquer sur
          &quot;Continuer&quot; referme l&apos;étape courante et ouvre la suivante. Cliquer à nouveau
          sur l&apos;en-tête d&apos;une étape précédente la rouvre pour modification.
        </div>
      </div>

      {/* ÉTAPE 1 : Type */}
      <div className={cardClass(1)} data-step="1" id="wstep1">
        <div className="wizard-step-header" onClick={() => toggleWizardStep(1)}>
          <div className="wizard-step-num">{stepNum(1)}</div>
          <div className="wizard-step-info">
            <div className="wizard-step-title">Type de structure</div>
            <div className="wizard-step-desc">Cabinet direct sélectionné</div>
          </div>
          <div className="wizard-step-status">
            <span className={statusBadge(1, completed.includes(1)).cls}>{statusBadge(1, completed.includes(1)).label}</span>
            <div className="wizard-step-toggle"><svg><use href="#i-arrow-down" /></svg></div>
          </div>
        </div>
        <div className="wizard-step-body">
          <div className="grid-3">
            <div style={{ border: "1.5px solid var(--navy-100)", borderRadius: "8px", padding: "16px", opacity: 0.5 }}>
              <div className="icon-badge lg" style={{ marginBottom: "10px" }}><svg><use href="#i-licence" /></svg></div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>Marque</div>
              <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}>Franchise · licence · réseau</div>
            </div>
            <div style={{ border: "1.5px solid var(--gold)", borderRadius: "8px", padding: "16px", background: "var(--ivory)" }}>
              <div className="icon-badge lg" style={{ marginBottom: "10px", background: "var(--gold)", color: "white", borderColor: "var(--gold)" }}><svg><use href="#i-building" /></svg></div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)" }}>Cabinet direct ✓</div>
              <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}>Indépendant ou mandataire</div>
            </div>
            <div style={{ border: "1.5px solid var(--navy-100)", borderRadius: "8px", padding: "16px", opacity: 0.5 }}>
              <div className="icon-badge lg" style={{ marginBottom: "10px" }}><svg><use href="#i-team" /></svg></div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>Autre professionnel</div>
              <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}>Notaire · avocat · EC</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
            <button className="btn btn-gold" onClick={() => goToWizardStep(2)}>Continuer vers Identité <svg><use href="#i-arrow-right" /></svg></button>
          </div>
        </div>
      </div>

      {/* ÉTAPE 2 : Identité */}
      <div className={cardClass(2)} data-step="2" id="wstep2">
        <div className="wizard-step-header" onClick={() => toggleWizardStep(2)}>
          <div className="wizard-step-num">{stepNum(2)}</div>
          <div className="wizard-step-info">
            <div className="wizard-step-title">Identité juridique</div>
            <div className="wizard-step-desc">Patrimoine Conseil Avignon SAS · SIREN 892 547 318</div>
          </div>
          <div className="wizard-step-status">
            <span className={statusBadge(2, completed.includes(2)).cls}>{statusBadge(2, completed.includes(2)).label}</span>
            <div className="wizard-step-toggle"><svg><use href="#i-arrow-down" /></svg></div>
          </div>
        </div>
        <div className="wizard-step-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Raison sociale<span className="req">*</span></label><input className="form-input" defaultValue="Patrimoine Conseil Avignon SAS" /></div>
            <div className="form-group"><label className="form-label">Nom commercial</label><input className="form-input" defaultValue="Patrimoine Conseil" /></div>
          </div>
          <div className="form-row-3">
            <div className="form-group"><label className="form-label">SIREN<span className="req">*</span></label><input className="form-input" defaultValue="892 547 318" /><div className="form-help">Vérifié auprès de l&apos;INSEE ✓</div></div>
            <div className="form-group"><label className="form-label">Statut juridique</label><select className="form-select" defaultValue="SAS"><option>SAS</option><option>SARL</option><option>SA</option><option>SCP</option></select></div>
            <div className="form-group"><label className="form-label">Numéro ORIAS<span className="req">*</span></label><input className="form-input" defaultValue="24 002 845" /><div className="form-help">CIF + Courtier en assurance</div></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Adresse siège<span className="req">*</span></label><input className="form-input" defaultValue="42 boulevard Saint-Roch, 84000 Avignon" /></div>
            <div className="form-group"><label className="form-label">Représentant légal<span className="req">*</span></label><input className="form-input" defaultValue="Marc DELORME" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email principal<span className="req">*</span></label><input className="form-input" defaultValue="m.delorme@patrimoine-avignon.fr" /></div>
            <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" defaultValue="04 90 12 34 56" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button className="btn btn-ghost" onClick={() => goToWizardStep(1)}>← Retour</button>
            <button className="btn btn-gold" onClick={() => goToWizardStep(3)}>Continuer vers Configuration <svg><use href="#i-arrow-right" /></svg></button>
          </div>
        </div>
      </div>

      {/* ÉTAPE 3 : Configuration */}
      <div className={cardClass(3)} data-step="3" id="wstep3">
        <div className="wizard-step-header" onClick={() => toggleWizardStep(3)}>
          <div className="wizard-step-num">{stepNum(3)}</div>
          <div className="wizard-step-info">
            <div className="wizard-step-title">Configuration plateforme</div>
            <div className="wizard-step-desc">Sous-domaine · branding · paramètres techniques · facturation</div>
          </div>
          <div className="wizard-step-status">
            <span className={statusBadge(3, completed.includes(3)).cls}>{statusBadge(3, completed.includes(3)).label}</span>
            <div className="wizard-step-toggle"><svg><use href="#i-arrow-down" /></svg></div>
          </div>
        </div>
        <div className="wizard-step-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Sous-domaine<span className="req">*</span></label>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><input className="form-input" defaultValue="patrimoine-avignon" style={{ flex: 1 }} /><span style={{ fontSize: "12px", color: "var(--navy-300)" }}>.astraeos.fr</span></div>
              <div className="form-help">URL d&apos;accès des ingénieurs : https://patrimoine-avignon.astraeos.fr</div>
            </div>
            <div className="form-group"><label className="form-label">Nom de marque affiché</label><input className="form-input" defaultValue="Patrimoine Conseil" /><div className="form-help">Visible dans l&apos;interface ingénieur et clients finaux</div></div>
          </div>
          <div className="form-row-3">
            <div className="form-group"><label className="form-label">Couleur principale</label><input type="color" className="form-input" defaultValue="#102D50" style={{ height: "40px" }} /></div>
            <div className="form-group"><label className="form-label">Couleur d&apos;accent</label><input type="color" className="form-input" defaultValue="#C68E0E" style={{ height: "40px" }} /></div>
            <div className="form-group"><label className="form-label">Logo</label><button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} data-stub="Téléverser"><svg><use href="#i-download" /></svg>Téléverser</button></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Mode de facturation<span className="req">*</span></label><select className="form-select" defaultValue="Mensuel · prélèvement automatique"><option>Mensuel · prélèvement automatique</option><option>Mensuel · virement</option><option>Annuel · 1 paiement</option></select></div>
            <div className="form-group"><label className="form-label">Date d&apos;activation<span className="req">*</span></label><input type="date" className="form-input" defaultValue="2026-05-15" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button className="btn btn-ghost" onClick={() => goToWizardStep(2)}>← Retour</button>
            <button className="btn btn-gold" onClick={() => goToWizardStep(4)}>Continuer vers Packs <svg><use href="#i-arrow-right" /></svg></button>
          </div>
        </div>
      </div>

      {/* ÉTAPE 4 : Packs */}
      <div className={cardClass(4)} data-step="4" id="wstep4">
        <div className="wizard-step-header" onClick={() => toggleWizardStep(4)}>
          <div className="wizard-step-num">{stepNum(4)}</div>
          <div className="wizard-step-info">
            <div className="wizard-step-title">Packs souscrits</div>
            <div className="wizard-step-desc">Choix des packs récurrents et ponctuels du catalogue</div>
          </div>
          <div className="wizard-step-status">
            <span className={statusBadge(4, completed.includes(4)).cls}>{statusBadge(4, completed.includes(4)).label}</span>
            <div className="wizard-step-toggle"><svg><use href="#i-arrow-down" /></svg></div>
          </div>
        </div>
        <div className="wizard-step-body">
          <div className="info-bar"><svg><use href="#i-info" /></svg><div>Sélectionnez les packs à intégrer dès le démarrage. Les packs gratuits (mise en relation partenaires) sont activés par défaut.</div></div>
          <table className="dt" style={{ border: "1px solid var(--navy-100)", borderRadius: "6px", overflow: "hidden" }}>
            <thead><tr><th></th><th>Pack</th><th>Type</th><th className="num">Prix</th></tr></thead>
            <tbody>
              {packs.map((p) => (
                <tr key={p.pack}>
                  <td><input type="checkbox" defaultChecked={p.checked} /></td>
                  <td className="cell-primary">{p.pack}</td>
                  <td><span className={p.badge}>{p.type}</span></td>
                  <td className={p.priceClass}>{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button className="btn btn-ghost" onClick={() => goToWizardStep(3)}>← Retour</button>
            <button className="btn btn-gold" onClick={() => goToWizardStep(5)}>Continuer vers Ingénieurs <svg><use href="#i-arrow-right" /></svg></button>
          </div>
        </div>
      </div>

      {/* ÉTAPE 5 : Ingénieurs */}
      <div className={cardClass(5)} data-step="5" id="wstep5">
        <div className="wizard-step-header" onClick={() => toggleWizardStep(5)}>
          <div className="wizard-step-num">{stepNum(5)}</div>
          <div className="wizard-step-info">
            <div className="wizard-step-title">Invitation des ingénieurs patrimoniaux</div>
            <div className="wizard-step-desc">Liste initiale des utilisateurs · rôles · droits d&apos;accès</div>
          </div>
          <div className="wizard-step-status">
            <span className={statusBadge(5, completed.includes(5)).cls}>{statusBadge(5, completed.includes(5)).label}</span>
            <div className="wizard-step-toggle"><svg><use href="#i-arrow-down" /></svg></div>
          </div>
        </div>
        <div className="wizard-step-body">
          <div className="info-bar"><svg><use href="#i-info" /></svg><div>Vous pourrez ajouter d&apos;autres ingénieurs plus tard depuis la fiche client. Au minimum 1 utilisateur administrateur est requis.</div></div>
          <table className="dt" style={{ border: "1px solid var(--navy-100)", borderRadius: "6px", overflow: "hidden" }}>
            <thead><tr><th>Prénom Nom</th><th>Email</th><th>Rôle</th><th className="center">Actions</th></tr></thead>
            <tbody>
              {ingenieurs.map((i) => (
                <tr key={i.email}>
                  <td className="cell-primary">{i.nom}</td>
                  <td>{i.email}</td>
                  <td><span className={i.roleClass}>{i.role}</span></td>
                  <td className="center"><button className="btn btn-ghost btn-sm" data-stub="Modifier">Modifier</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: "12px" }} data-stub="Ajouter un ingénieur"><svg><use href="#i-new" /></svg>Ajouter un ingénieur</button>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button className="btn btn-ghost" onClick={() => goToWizardStep(4)}>← Retour</button>
            <button className="btn btn-gold" onClick={() => goToWizardStep(6)}>Continuer vers Validation <svg><use href="#i-arrow-right" /></svg></button>
          </div>
        </div>
      </div>

      {/* ÉTAPE 6 : Validation */}
      <div className={cardClass(6)} data-step="6" id="wstep6">
        <div className="wizard-step-header" onClick={() => toggleWizardStep(6)}>
          <div className="wizard-step-num">{stepNum(6)}</div>
          <div className="wizard-step-info">
            <div className="wizard-step-title">Récapitulatif &amp; activation</div>
            <div className="wizard-step-desc">Vérification finale · contrat · activation période d&apos;essai 30 jours</div>
          </div>
          <div className="wizard-step-status">
            <span className={statusBadge(6, completed.includes(6)).cls}>{statusBadge(6, completed.includes(6)).label}</span>
            <div className="wizard-step-toggle"><svg><use href="#i-arrow-down" /></svg></div>
          </div>
        </div>
        <div className="wizard-step-body">
          <div className="grid-2">
            <div className="card"><div className="card-header"><div className="card-title"><svg><use href="#i-building" /></svg>Récapitulatif</div></div>
              <div className="card-body">
                {recap.map((r) => (
                  <div className="finance-detail-row" key={r.label}>
                    <span className="finance-detail-label" style={r.gold ? { color: "var(--gold)", fontWeight: 700 } : undefined}>{r.label}</span>
                    <span className="finance-detail-value" style={r.gold ? { color: "var(--gold)" } : undefined}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card"><div className="card-header"><div className="card-title"><svg><use href="#i-doc" /></svg>Documents générés</div></div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {documents.map((d) => (
                    <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} key={d} data-stub={d}><svg><use href="#i-doc" /></svg>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button className="btn btn-ghost" onClick={() => goToWizardStep(5)}>← Retour</button>
            <button className="btn btn-gold" style={{ fontWeight: 700 }} data-stub="Activer le client maintenant"><svg><use href="#i-success" /></svg>Activer le client maintenant</button>
          </div>
        </div>
      </div>
    </>
  );
}
