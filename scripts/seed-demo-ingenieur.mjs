// Seed de DÉMO pour l'Espace Ingénieur (Astraeos) — PROD.
//
// Objectif : peupler produits / souscriptions / rdv / etudes / commissions avec
// des données réalistes et MODIFIABLES, rattachées aux 13 dossiers existants du
// cabinet, pour que le dashboard / assets / parcours / agenda ressemblent à la
// maquette.
//
// SÉCURITÉ : on n'INSÈRE/UPSERT que des lignes démo à id DÉTERMINISTES (préfixe
// "0000dem0-"). Idempotent (upsert sur id). Aucun DELETE, aucun UPDATE des 13
// dossiers/clients existants : on les LIT seulement pour récupérer leurs id.
//
// Pour retirer la démo plus tard : supprimer les lignes dont l'id commence par
// "0000de70-" dans produits, souscriptions, commissions, rdv, etudes.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Lecture des clés depuis .env.local -----------------------------------
const envRaw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Clés Supabase manquantes dans .env.local");
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// --- Contexte legacy (scope) ----------------------------------------------
const TENANT_ID = "00000000-0000-0000-0000-000000000010";
const CABINET_ID = "00000000-0000-0000-0000-000000000100";
const ENGINEER_ID = "00000000-0000-0000-0000-000000001000";

// Préfixe id démo reconnaissable et SUPPRIMABLE : "0000de70" (hex valide, se lit
// « demo »). Forme : 0000de70-XXXX-4d30-8d30-XXXXXXXXXXXX (UUID v4 valide).
function demoId(kind, n) {
  const k = String(kind).padStart(4, "0").slice(0, 4);
  const seq = String(n).padStart(12, "0").slice(0, 12);
  return `0000de70-${k}-4d30-8d30-${seq}`;
}

const today = new Date();
function dateOffset(days) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function isoTs(d) {
  return d.toISOString();
}

async function upsert(table, rows) {
  if (rows.length === 0) return { count: 0 };
  const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`  ✗ upsert ${table}:`, error.message, error.details ?? "");
    throw new Error(`upsert ${table} failed`);
  }
  return { count: rows.length };
}

async function countScoped(table) {
  const { count } = await sb
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("cabinet_id", CABINET_ID)
    .eq("tenant_id", TENANT_ID);
  return count ?? 0;
}

async function main() {
  console.log("→ Lecture des dossiers existants…");
  const { data: dossiers, error: dErr } = await sb
    .from("dossiers")
    .select("id, client_id, engineer_id, pipeline_stage")
    .eq("cabinet_id", CABINET_ID)
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: true });
  if (dErr) throw dErr;
  if (!dossiers || dossiers.length === 0) {
    console.error("Aucun dossier trouvé pour ce cabinet/tenant. Abandon.");
    process.exit(1);
  }
  console.log(`  ${dossiers.length} dossiers.`);

  // Représentant (person_a) de chaque client, pour subscriber_person_id.
  const clientIds = [...new Set(dossiers.map((d) => d.client_id).filter(Boolean))];
  const { data: personnes, error: pErr } = await sb
    .from("personnes")
    .select("id, client_id, role_in_household")
    .in("client_id", clientIds);
  if (pErr) throw pErr;
  const personByClient = new Map();
  for (const p of personnes ?? []) {
    // Priorité à person_a, sinon premier trouvé.
    if (!personByClient.has(p.client_id) || p.role_in_household === "person_a") {
      personByClient.set(p.client_id, p.id);
    }
  }

  // ----------------------------------------------------------------------
  // 1) PRODUITS (catalogue cabinet) — 10 produits, classes cohérentes avec
  //    assets-financier.ts (financier = av_multisupport, av_lux, per, structure ;
  //    immobilier = scpi, opci, fpci ; assurance = prevoyance).
  // ----------------------------------------------------------------------
  const produitDefs = [
    { name: "Lynxia Sérénité", category: "av_multisupport", partner: "Generali", rate: 4.5, split: 60, mgmt: 0.85, min: 5000, max: 2000000 },
    { name: "Lynxia Patrimoine", category: "av_multisupport", partner: "Spirica", rate: 4.2, split: 60, mgmt: 0.80, min: 30000, max: 5000000 },
    { name: "Wealth Lux Premium", category: "av_lux", partner: "Lombard International", rate: 3.5, split: 55, mgmt: 0.95, min: 250000, max: 10000000 },
    { name: "Horizon Retraite PER", category: "per", partner: "Swiss Life", rate: 3.8, split: 60, mgmt: 0.75, min: 5000, max: 1000000 },
    { name: "Phoenix Autocall 10", category: "structure", partner: "BNP Paribas", rate: 2.5, split: 50, mgmt: 0.00, min: 10000, max: 1500000 },
    { name: "Athéna Capital Garanti", category: "structure", partner: "Société Générale", rate: 2.3, split: 50, mgmt: 0.00, min: 20000, max: 2000000 },
    { name: "Pierre & Rendement SCPI", category: "scpi", partner: "Corum", rate: 8.0, split: 50, mgmt: 0.00, min: 5000, max: 3000000 },
    { name: "Capimmo OPCI", category: "opci", partner: "Primonial", rate: 5.5, split: 50, mgmt: 0.00, min: 10000, max: 2000000 },
    { name: "Innovation Croissance FPCI", category: "fpci", partner: "Eurazeo", rate: 6.0, split: 45, mgmt: 0.00, min: 100000, max: 5000000 },
    { name: "Bouclier Prévoyance Pro", category: "prevoyance", partner: "AXA", rate: 12.0, split: 50, mgmt: 0.00, min: 500, max: 100000 },
  ];
  const produits = produitDefs.map((p, i) => ({
    id: demoId("0001", i + 1),
    tenant_id: TENANT_ID,
    cabinet_id: CABINET_ID,
    name: p.name,
    category: p.category,
    partner_name: p.partner,
    commission_rate_owner: p.rate,
    commission_split_to_cabinet: p.split,
    recurring_management_fee: p.mgmt,
    min_ticket: p.min,
    max_ticket: p.max,
    status: "active",
  }));
  console.log("→ Upsert produits…");
  await upsert("produits", produits);
  console.log(`  ${produits.length} produits.`);

  // ----------------------------------------------------------------------
  // 2) SOUSCRIPTIONS — réparties sur les clients/dossiers, montants réalistes.
  //    On crée 1 à 2 souscriptions par dossier (clients en suivi/restitué
  //    plus dotés). On répartit sur les 10 produits.
  // ----------------------------------------------------------------------
  const subStatusByStage = {
    "06_suivi": "active",
    "05_restituee": "active",
    "04_etudes": "signed",
    "03_collecte": "pending_signature",
    "02_compliance": "pending_signature",
    "01_prospect": "pending_signature",
    "00_archive": "closed",
  };
  // Montants types par catégorie (initial €).
  const amountByCat = {
    av_multisupport: [60000, 120000, 250000, 90000, 180000],
    av_lux: [400000, 750000, 1200000],
    per: [20000, 45000, 80000, 35000],
    structure: [50000, 100000, 75000],
    scpi: [30000, 60000, 100000, 45000],
    opci: [25000, 50000],
    fpci: [150000, 200000],
    prevoyance: [1200, 2400, 3600],
  };

  const souscriptions = [];
  const paymentMethods = ["virement", "prelevement", "cheque"];
  let subSeq = 0;
  // On veut ~18-22 souscriptions. On itère les dossiers ; les dossiers avancés
  // (suivi/restituée/études) reçoivent 1-2 souscriptions, les autres 0-1.
  const subscriptionTargets = [];
  dossiers.forEach((d, idx) => {
    const stage = d.pipeline_stage ?? "01_prospect";
    let n;
    if (stage === "06_suivi" || stage === "05_restituee") n = 2;
    else if (stage === "04_etudes") n = 1;
    else if (stage === "03_collecte") n = idx % 2 === 0 ? 1 : 0;
    else n = 0; // prospect / compliance / archive : pas encore de souscription
    for (let k = 0; k < n; k++) subscriptionTargets.push({ d, k });
  });

  // Garantir un plancher : si trop peu, ajouter une souscription aux dossiers avancés.
  if (subscriptionTargets.length < 15) {
    for (const d of dossiers) {
      if (subscriptionTargets.length >= 18) break;
      const stage = d.pipeline_stage ?? "";
      if (["06_suivi", "05_restituee", "04_etudes"].includes(stage)) {
        subscriptionTargets.push({ d, k: 9 });
      }
    }
  }

  subscriptionTargets.forEach((t, i) => {
    const { d, k } = t;
    const subscriberPersonId = personByClient.get(d.client_id);
    if (!subscriberPersonId) return; // pas de personne -> on saute (NOT NULL)
    // Choix de produit : rotation déterministe, en variant la classe par k.
    const prodIndex = (i * 3 + k * 7) % produits.length;
    const prod = produits[prodIndex];
    const amounts = amountByCat[prod.category] ?? [50000];
    const amount = amounts[(i + k) % amounts.length];
    // total_aum_current : léger gain/perte réaliste (~+/-12%) sur les actifs en cours.
    const stage = d.pipeline_stage ?? "01_prospect";
    const status = subStatusByStage[stage] ?? "pending_signature";
    const isActive = status === "active";
    const growth = isActive ? 1 + (((i * 13 + k * 5) % 25) - 8) / 100 : 1; // ~-8% à +16%
    const aum = isActive ? Math.round(amount * growth) : amount;
    // Date de souscription : passée, étalée sur ~30 mois.
    const subDate = dateOffset(-(60 + i * 35 + k * 20));
    subSeq += 1;
    souscriptions.push({
      id: demoId("0002", subSeq),
      tenant_id: TENANT_ID,
      cabinet_id: CABINET_ID,
      dossier_id: d.id,
      client_id: d.client_id,
      subscriber_person_id: subscriberPersonId,
      produit_id: prod.id,
      engineer_id: d.engineer_id ?? ENGINEER_ID,
      amount_initial: amount,
      amount_recurring_monthly: prod.category === "per" ? [150, 300, 500][i % 3] : 0,
      total_aum_current: aum,
      contract_number_partner: `${prod.partner_name.slice(0, 3).toUpperCase()}-${2024 + (i % 2)}-${String(1000 + subSeq)}`,
      subscription_date: isoDate(subDate),
      status,
      payment_method: paymentMethods[i % paymentMethods.length],
    });
  });
  console.log("→ Upsert souscriptions…");
  await upsert("souscriptions", souscriptions);
  console.log(`  ${souscriptions.length} souscriptions.`);

  // ----------------------------------------------------------------------
  // 3) COMMISSIONS — pour chaque souscription : une commission d'apport
  //    (upfront) part cabinet, parfois une part reversée à l'ingénieur,
  //    et quelques honoraires d'études (study_fee). Mix pending/received.
  // ----------------------------------------------------------------------
  const commissions = [];
  let comSeq = 0;
  souscriptions.forEach((s, i) => {
    const prod = produits.find((p) => p.id === s.produit_id);
    const rate = prod ? Number(prod.commission_rate_owner) : 3;
    const splitCab = prod ? Number(prod.commission_split_to_cabinet) / 100 : 0.6;
    const base = Number(s.amount_initial);
    const ownerComm = (base * rate) / 100;
    const cabinetShare = Math.round(ownerComm * splitCab);
    // upfront part cabinet
    const received = s.status === "active" || (s.status === "signed" && i % 2 === 0);
    comSeq += 1;
    commissions.push({
      id: demoId("0003", comSeq),
      souscription_id: s.id,
      commission_type: "upfront",
      recipient_type: "cabinet",
      recipient_tenant_id: TENANT_ID,
      recipient_cabinet_id: CABINET_ID,
      recipient_user_id: null,
      amount_eur: cabinetShare,
      rate_applied: rate / 100,
      base_amount: base,
      due_date: s.subscription_date,
      paid_date: received ? s.subscription_date : null,
      status: received ? "received" : "pending",
    });
    // part reversée à l'ingénieur (bonus) sur ~la moitié des souscriptions
    if (i % 2 === 0) {
      comSeq += 1;
      commissions.push({
        id: demoId("0003", comSeq),
        souscription_id: s.id,
        commission_type: "upfront",
        recipient_type: "engineer_bonus",
        recipient_tenant_id: TENANT_ID,
        recipient_cabinet_id: CABINET_ID,
        recipient_user_id: s.engineer_id,
        amount_eur: Math.round(cabinetShare * 0.25),
        rate_applied: rate / 100,
        base_amount: base,
        due_date: s.subscription_date,
        paid_date: received ? s.subscription_date : null,
        status: received ? "received" : "pending",
      });
    }
    // honoraires d'étude (study_fee) part cabinet sur ~1/3 des souscriptions
    if (i % 3 === 0) {
      comSeq += 1;
      const fee = [1500, 2500, 3500][i % 3];
      commissions.push({
        id: demoId("0003", comSeq),
        souscription_id: s.id,
        commission_type: "study_fee",
        recipient_type: "cabinet",
        recipient_tenant_id: TENANT_ID,
        recipient_cabinet_id: CABINET_ID,
        recipient_user_id: null,
        amount_eur: fee,
        rate_applied: null,
        base_amount: null,
        due_date: s.subscription_date,
        paid_date: received ? s.subscription_date : null,
        status: received ? "received" : "pending",
      });
    }
  });
  console.log("→ Upsert commissions…");
  await upsert("commissions", commissions);
  console.log(`  ${commissions.length} commissions.`);

  // ----------------------------------------------------------------------
  // 4) RDV — 10 rendez-vous FUTURS (scheduled_at > maintenant), types/formats
  //    variés, rattachés à des dossiers (priorité aux dossiers en cours).
  // ----------------------------------------------------------------------
  const rdvTypes = ["decouverte", "collecte", "restitution", "signature", "suivi_annuel", "autre"];
  const rdvFormats = ["visio", "presentiel", "telephone"];
  // On choisit des dossiers de préférence en production / suivi.
  const rdvDossiers = [...dossiers].sort((a, b) => {
    const order = { "02_compliance": 0, "03_collecte": 1, "04_etudes": 2, "05_restituee": 3, "06_suivi": 4, "01_prospect": 5, "00_archive": 9 };
    return (order[a.pipeline_stage] ?? 6) - (order[b.pipeline_stage] ?? 6);
  });
  const rdv = [];
  const hours = [9, 10, 11, 14, 15, 16, 17];
  for (let i = 0; i < 10; i++) {
    const d = rdvDossiers[i % rdvDossiers.length];
    // Étaler sur les 28 prochains jours (jours ouvrés approx.).
    const dayOffset = 1 + i * 2 + (i % 3);
    const dt = dateOffset(dayOffset);
    dt.setHours(hours[i % hours.length], (i % 2) * 30, 0, 0);
    rdv.push({
      id: demoId("0004", i + 1),
      tenant_id: TENANT_ID,
      cabinet_id: CABINET_ID,
      dossier_id: d.id,
      engineer_id: d.engineer_id ?? ENGINEER_ID,
      type: rdvTypes[i % rdvTypes.length],
      format: rdvFormats[i % rdvFormats.length],
      scheduled_at: isoTs(dt),
      duration_minutes: [45, 60, 90][i % 3],
      status: i % 4 === 0 ? "confirmed" : "scheduled",
    });
  }
  console.log("→ Upsert rdv…");
  await upsert("rdv", rdv);
  console.log(`  ${rdv.length} rdv (futurs).`);

  // ----------------------------------------------------------------------
  // 5) ÉTUDES — 8 études supplémentaires, mix delivered_at NULL (en cours) /
  //    passé (restituées). On vise des dossiers distincts ; on évite la
  //    collision d'unicité (dossier_id, version) en utilisant version=2.
  // ----------------------------------------------------------------------
  const etudeStages = [...dossiers].filter((d) =>
    ["03_collecte", "04_etudes", "05_restituee", "06_suivi"].includes(d.pipeline_stage ?? ""),
  );
  const pool = etudeStages.length >= 8 ? etudeStages : dossiers;
  const etudes = [];
  for (let i = 0; i < 8; i++) {
    const d = pool[i % pool.length];
    const delivered = i % 2 === 0; // alternance livrée / en cours
    const deliveredAt = delivered ? isoTs(dateOffset(-(15 + i * 12))) : null;
    etudes.push({
      id: demoId("0005", i + 1),
      dossier_id: d.id,
      version: 2 + i, // évite la collision avec la version 1 existante
      status: delivered ? "delivered" : "in_progress",
      current_phase: delivered ? "completed" : ["phase_1_bilan", "phase_2_strategies", "phase_3_synthese"][i % 3],
      phase_progress_pct: delivered ? 100 : [25, 50, 70][i % 3],
      delivered_at: deliveredAt,
      client_satisfaction_score: delivered ? [8, 9, 10, 7][i % 4] : null,
    });
  }
  console.log("→ Upsert etudes…");
  await upsert("etudes", etudes);
  console.log(`  ${etudes.length} etudes.`);

  // ----------------------------------------------------------------------
  // VÉRIFICATION
  // ----------------------------------------------------------------------
  console.log("\n→ Vérification (counts scopés cabinet/tenant) :");
  for (const t of ["produits", "souscriptions", "rdv"]) {
    console.log(`  ${t}: ${await countScoped(t)}`);
  }
  // etudes / commissions ne portent pas cabinet_id : count global.
  for (const t of ["etudes", "commissions"]) {
    const { count } = await sb.from(t).select("id", { count: "exact", head: true });
    console.log(`  ${t} (global): ${count ?? 0}`);
  }
  // rdv futurs
  const { count: rdvFuturs } = await sb
    .from("rdv")
    .select("id", { count: "exact", head: true })
    .eq("cabinet_id", CABINET_ID)
    .eq("tenant_id", TENANT_ID)
    .gte("scheduled_at", new Date().toISOString());
  console.log(`  rdv futurs: ${rdvFuturs ?? 0}`);

  console.log("\n✓ Seed démo terminé.");
}

main().catch((e) => {
  console.error("✗ Échec du seed :", e.message);
  process.exit(1);
});
