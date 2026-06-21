// Seed de DÉMO — VRAIS CLIENTS de l'Espace Ingénieur (Astraeos), persistés en
// base pour que les écrans ingénieur (clients / fiche / assets) et le cockpit
// dirigeant lisent enfin LA MÊME source (clients ⨝ personnes ⨝ dossiers ⨝
// souscriptions), au lieu des constantes .ts de la maquette v28.
//
// Reproduit le portefeuille de la maquette ingénieur : DUPONT-TOPIN, HUYGHE,
// SAS GROUPE LEFEBVRE, DELANNOY, BONNARD, LAMOUREUX, LACROIX. Pour chaque foyer :
//   - 1 ligne `clients` (le foyer)
//   - 1 ou 2 lignes `personnes` (person_a, parfois person_b)
//   - 1 ligne `dossiers` rattachée à l'ingénieur DEFAULT
//   - 1..n lignes `souscriptions` représentant le patrimoine placé, dont la
//     somme des amount_initial reconstitue l'encours du foyer (≈ 2,1 M€ au total)
//
// SÉCURITÉ — exactement le pattern des seeds existants (seed-demo-*.mjs) :
//   - ids DÉTERMINISTES taggés (préfixe "0000c1e7-", se lit « cliet ») → upsert
//     idempotent sur `id`. Relancer le script ne crée jamais de doublon.
//   - AUCUN DELETE, AUCUN UPDATE de lignes existantes non taggées.
//   - tout est scopé au tenant / cabinet / engineer DEFAULT (contexte legacy).
//   - on s'appuie sur un catalogue produits taggé propre à ce seed.
//
// Pour retirer ce seed plus tard : supprimer les lignes dont l'id commence par
// "0000c1e7-" dans commissions, souscriptions, dossiers, personnes, clients,
// produits (dans cet ordre, ON DELETE CASCADE gère l'essentiel via clients).
//
// NE PAS lancer ce script ici : le main loop l'exécutera.

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

// --- Contexte legacy (scope), aligné sur src/lib/supabase/admin.ts --------
const TENANT_ID = "00000000-0000-0000-0000-000000000010"; // PRIVEOS Capital
const CABINET_ID = "00000000-0000-0000-0000-000000000100"; // Cabinet Paris Étoile
const ENGINEER_ID = "00000000-0000-0000-0000-000000001000"; // Sarah KAUFMANN

// Préfixe id taggé reconnaissable et SUPPRIMABLE : "0000c1e7" (hex valide, se
// lit « cliet »). Forme : 0000c1e7-XXXX-4c30-8c30-XXXXXXXXXXXX (UUID v4 valide,
// variant 8/9/a/b respecté).
function tagId(kind, n) {
  const k = String(kind).padStart(4, "0").slice(0, 4);
  const seq = String(n).padStart(12, "0").slice(0, 12);
  return `0000c1e7-${k}-4c30-8c30-${seq}`;
}

const today = new Date();
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function isoTs(d) {
  return d.toISOString();
}
function daysAgo(days) {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d;
}

async function upsert(table, rows, onConflict = "id") {
  if (rows.length === 0) return { count: 0 };
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) {
    console.error(`  ✗ upsert ${table}:`, error.message, error.details ?? "");
    throw new Error(`upsert ${table} failed`);
  }
  return { count: rows.length };
}

// ---------------------------------------------------------------------------
// 1) CATALOGUE PRODUITS (taggé) — classes cohérentes avec assets-*.ts :
//    financier = av_multisupport, av_lux, per, structure ;
//    immobilier = scpi, opci, fpci ; assurance = prevoyance.
// ---------------------------------------------------------------------------
const PRODUITS = [
  { key: "av_gen", name: "Lynxia Sérénité", category: "av_multisupport", partner: "Generali", rate: 4.5, split: 60, mgmt: 0.85 },
  { key: "av_spi", name: "Lynxia Patrimoine", category: "av_multisupport", partner: "Spirica", rate: 4.2, split: 60, mgmt: 0.80 },
  { key: "av_lux", name: "Wealth Lux Premium", category: "av_lux", partner: "Lombard International", rate: 3.5, split: 55, mgmt: 0.95 },
  { key: "per", name: "Horizon Retraite PER", category: "per", partner: "Swiss Life", rate: 3.8, split: 60, mgmt: 0.75 },
  { key: "struct", name: "Phoenix Autocall 10", category: "structure", partner: "BNP Paribas", rate: 2.5, split: 50, mgmt: 0.0 },
  { key: "scpi", name: "Pierre & Rendement SCPI", category: "scpi", partner: "Corum", rate: 8.0, split: 50, mgmt: 0.0 },
  { key: "opci", name: "Capimmo OPCI", category: "opci", partner: "Primonial", rate: 5.5, split: 50, mgmt: 0.0 },
  { key: "fpci", name: "Innovation Croissance FPCI", category: "fpci", partner: "Eurazeo", rate: 6.0, split: 45, mgmt: 0.0 },
  { key: "prev", name: "Bouclier Prévoyance Pro", category: "prevoyance", partner: "AXA", rate: 12.0, split: 50, mgmt: 0.0 },
];
const PRODUIT_ID = {};
const produitRows = PRODUITS.map((p, i) => {
  const id = tagId("0001", i + 1);
  PRODUIT_ID[p.key] = id;
  return {
    id,
    tenant_id: TENANT_ID,
    cabinet_id: CABINET_ID,
    name: p.name,
    category: p.category,
    partner_name: p.partner,
    commission_rate_owner: p.rate,
    commission_split_to_cabinet: p.split,
    recurring_management_fee: p.mgmt,
    min_ticket: 5000,
    max_ticket: 10000000,
    status: "active",
  };
});

// ---------------------------------------------------------------------------
// 2) FOYERS — reproduisent la maquette. Les souscriptions[].amount somment
//    l'encours affiché côté maquette pour chaque foyer.
//    Encours maquette : DUPONT-TOPIN 420k, HUYGHE 380k, LEFEBVRE 340k,
//    BONNARD 280k, LAMOUREUX 180k, LACROIX 120k (financier) + DELANNOY (en
//    découverte, patrimoine plus modeste). Total ≈ 2,1 M€.
// ---------------------------------------------------------------------------
const FOYERS = [
  {
    seq: 1,
    slug: "dupont-topin",
    household_type: "couple_marie",
    marital_regime: "communaute_reduite_acquets",
    marriage_date: "1990-06-16",
    address: "12 rue de Grenelle, 75007 Paris",
    nb_children: 2,
    acquisition_origin: "recommandation",
    pipeline_stage: "05_restituee",
    pipeline_entry_date: "2025-03-15",
    last_activity_days: 45,
    study_delivered_days: 45,
    personnes: [
      { role: "person_a", first: "Bertrand", last: "DUPONT-TOPIN", birth_date: "1963-04-12", birth_city: "Paris", nationality: "FR", profession: "Chirurgien", employer: "Hôpital Cochin", employment_status: "cadre_dirigeant", tmi: 45, phone: "06 12 34 56 78", email: "b.dupont-topin@example.fr" },
      { role: "person_b", first: "Monique", last: "DUPONT-TOPIN", birth_name: "TOPIN", birth_date: "1967-09-03", birth_city: "Lyon", nationality: "FR", profession: "Pharmacienne", employer: "Pharmacie du Centre", employment_status: "tns_liberal", tmi: 41, phone: "06 22 33 44 55", email: "m.dupont-topin@example.fr" },
    ],
    // 420 000 € financier (av + per + structure)
    souscriptions: [
      { prod: "av_gen", amount: 220000, status: "active", sub_days: 380 },
      { prod: "per", amount: 80000, status: "active", sub_days: 380, monthly: 500 },
      { prod: "struct", amount: 120000, status: "active", sub_days: 200 },
    ],
  },
  {
    seq: 2,
    slug: "huyghe",
    household_type: "couple_marie",
    marital_regime: "communaute_universelle",
    marriage_date: "1992-05-23",
    address: "8 avenue de Saint-Cloud, 78000 Versailles",
    nb_children: 3,
    acquisition_origin: "recommandation",
    pipeline_stage: "04_etudes",
    pipeline_entry_date: "2025-01-22",
    last_activity_days: 57,
    personnes: [
      { role: "person_a", first: "Albert", last: "HUYGHE", birth_date: "1968-02-19", birth_city: "Lille", nationality: "FR", profession: "Dirigeant PME", employer: "Huyghe Industries", employment_status: "cadre_dirigeant", tmi: 45, phone: "06 31 41 51 61", email: "a.huyghe@example.fr" },
      { role: "person_b", first: "Cécile", last: "HUYGHE", birth_name: "MERCIER", birth_date: "1971-11-08", birth_city: "Reims", nationality: "FR", profession: "Sans profession", employment_status: "autre", tmi: 45, phone: "06 71 81 91 01", email: "c.huyghe@example.fr" },
    ],
    // 380 000 € (av lux + av + scpi)
    souscriptions: [
      { prod: "av_lux", amount: 250000, status: "active", sub_days: 300 },
      { prod: "av_spi", amount: 80000, status: "active", sub_days: 300 },
      { prod: "scpi", amount: 50000, status: "active", sub_days: 150 },
    ],
  },
  {
    seq: 3,
    slug: "lefebvre-sas",
    household_type: "celibataire", // personne morale : représentée par son dirigeant (person_a)
    marital_regime: null,
    marriage_date: null,
    address: "24 rue de Courcelles, 75008 Paris",
    nb_children: 0,
    acquisition_origin: "captation_directe",
    pipeline_stage: "03_collecte",
    pipeline_entry_date: "2025-04-10",
    last_activity_days: 30,
    raison_sociale: "SAS GROUPE LEFEBVRE",
    siren: "812345678",
    personnes: [
      { role: "person_a", first: "Guillaume", last: "LEFEBVRE", birth_date: "1974-07-30", birth_city: "Paris", nationality: "FR", profession: "Président", employer: "SAS GROUPE LEFEBVRE", employment_status: "cadre_dirigeant", tmi: 45, phone: "06 44 55 66 77", email: "g.lefebvre@groupe-lefebvre.fr" },
    ],
    // 340 000 € (structure + opci + fpci de trésorerie d'entreprise)
    souscriptions: [
      { prod: "struct", amount: 150000, status: "active", sub_days: 260 },
      { prod: "opci", amount: 90000, status: "active", sub_days: 160 },
      { prod: "fpci", amount: 100000, status: "signed", sub_days: 40 },
    ],
  },
  {
    seq: 4,
    slug: "delannoy",
    household_type: "couple_marie",
    marital_regime: "separation_biens",
    marriage_date: "2004-09-11",
    address: "5 boulevard du Château, 92200 Neuilly-sur-Seine",
    nb_children: 2,
    acquisition_origin: "marketing",
    pipeline_stage: "02_compliance",
    pipeline_entry_date: "2025-06-05",
    last_activity_days: 78,
    personnes: [
      { role: "person_a", first: "Bruno", last: "DELANNOY", birth_date: "1978-03-21", birth_city: "Amiens", nationality: "FR", profession: "Consultant", employer: "Indépendant", employment_status: "tns_liberal", tmi: 41, phone: "06 88 77 66 55", email: "b.delannoy@example.fr" },
      { role: "person_b", first: "Hélène", last: "DELANNOY", birth_name: "ROUSSEL", birth_date: "1980-12-14", birth_city: "Rouen", nationality: "FR", profession: "Architecte", employer: "Atelier DR", employment_status: "tns_liberal", tmi: 41, phone: "06 99 88 77 66", email: "h.delannoy@example.fr" },
    ],
    // 90 000 € (foyer en découverte, première souscription)
    souscriptions: [
      { prod: "av_gen", amount: 90000, status: "pending_signature", sub_days: 20 },
    ],
  },
  {
    seq: 5,
    slug: "bonnard",
    household_type: "celibataire",
    marital_regime: null,
    marriage_date: null,
    address: "47 avenue Victor Hugo, 75016 Paris",
    nb_children: 0,
    acquisition_origin: "recommandation",
    pipeline_stage: "03_collecte",
    pipeline_entry_date: "2025-02-18",
    last_activity_days: 13,
    personnes: [
      { role: "person_a", first: "Étienne", last: "BONNARD", birth_date: "1972-05-09", birth_city: "Bordeaux", nationality: "FR", profession: "Avocat", employer: "Cabinet Bonnard", employment_status: "tns_liberal", tmi: 45, phone: "06 10 20 30 40", email: "e.bonnard@avocat-bonnard.fr" },
    ],
    // 280 000 € (av + scpi)
    souscriptions: [
      { prod: "av_gen", amount: 180000, status: "active", sub_days: 320 },
      { prod: "scpi", amount: 100000, status: "active", sub_days: 180 },
    ],
  },
  {
    seq: 6,
    slug: "lamoureux",
    household_type: "celibataire",
    marital_regime: null,
    marriage_date: null,
    address: "3 rue Dailly, 92210 Saint-Cloud",
    nb_children: 0,
    acquisition_origin: "recommandation",
    pipeline_stage: "06_suivi",
    pipeline_entry_date: "2024-03-04",
    last_activity_days: 64,
    study_delivered_days: 120,
    personnes: [
      { role: "person_a", first: "Pierre", last: "LAMOUREUX", birth_date: "1961-10-27", birth_city: "Nantes", nationality: "FR", profession: "Chef d'entreprise", employer: "Lamoureux & Fils", employment_status: "cadre_dirigeant", tmi: 45, phone: "06 55 44 33 22", email: "p.lamoureux@example.fr" },
    ],
    // 180 000 € (av + per)
    souscriptions: [
      { prod: "av_spi", amount: 130000, status: "active", sub_days: 520 },
      { prod: "per", amount: 50000, status: "active", sub_days: 520, monthly: 300 },
    ],
  },
  {
    seq: 7,
    slug: "lacroix",
    household_type: "celibataire",
    marital_regime: null,
    marriage_date: null,
    address: "18 rue de la Boétie, 75008 Paris",
    nb_children: 0,
    acquisition_origin: "recommandation",
    pipeline_stage: "06_suivi",
    pipeline_entry_date: "2024-01-12",
    last_activity_days: 50,
    study_delivered_days: 200,
    personnes: [
      { role: "person_a", first: "Marguerite", last: "LACROIX", birth_date: "1969-08-15", birth_city: "Strasbourg", nationality: "FR", profession: "Notaire", employer: "Étude Lacroix", employment_status: "tns_liberal", tmi: 45, phone: "06 66 55 44 33", email: "m.lacroix@notaire-lacroix.fr" },
    ],
    // 120 000 € (av)
    souscriptions: [
      { prod: "av_gen", amount: 120000, status: "active", sub_days: 640 },
    ],
  },
];

// internal_notes : pour les foyers personne morale, on stocke raison_sociale +
// siren comme le wizard client-new, pour que la liste dossiers les nomme bien.
function notesFor(f) {
  if (!f.raison_sociale) return null;
  return JSON.stringify({ raison_sociale: f.raison_sociale, siren: f.siren ?? "" });
}

async function main() {
  console.log("→ Upsert produits (catalogue taggé)…");
  await upsert("produits", produitRows);
  console.log(`  ${produitRows.length} produits.`);

  const clientRows = [];
  const personneRows = [];
  const dossierRows = [];
  const souscriptionRows = [];
  const commissionRows = [];

  // Map (foyerSeq, role) -> personneId, pour subscriber_person_id (person_a).
  const personAId = new Map();

  let persSeq = 0;
  let subSeq = 0;
  let comSeq = 0;

  for (const f of FOYERS) {
    const clientId = tagId("0002", f.seq);
    const dossierId = tagId("0003", f.seq);

    clientRows.push({
      id: clientId,
      tenant_id: TENANT_ID,
      cabinet_id: CABINET_ID,
      household_type: f.household_type,
      marital_regime: f.marital_regime,
      marriage_date: f.marriage_date,
      household_address: f.address,
      nb_children: f.nb_children ?? 0,
      nb_dependents: f.nb_children ?? 0,
      tax_residency: "FR",
      acquisition_origin: f.acquisition_origin,
    });

    for (const p of f.personnes) {
      persSeq += 1;
      const personId = tagId("0004", persSeq);
      if (p.role === "person_a") personAId.set(f.seq, personId);
      personneRows.push({
        id: personId,
        client_id: clientId,
        role_in_household: p.role,
        first_name: p.first,
        last_name: p.last,
        birth_name: p.birth_name ?? null,
        birth_date: p.birth_date ?? null,
        birth_city: p.birth_city ?? null,
        nationality: p.nationality ?? null,
        profession: p.profession ?? null,
        employer: p.employer ?? null,
        employment_status: p.employment_status ?? null,
        tmi_estimated: p.tmi ?? null,
        phone: p.phone ?? null,
        email: p.email ?? null,
      });
    }

    const lastActivity = isoTs(daysAgo(f.last_activity_days ?? 30));
    dossierRows.push({
      id: dossierId,
      tenant_id: TENANT_ID,
      cabinet_id: CABINET_ID,
      client_id: clientId,
      engineer_id: ENGINEER_ID,
      pipeline_stage: f.pipeline_stage,
      pipeline_entry_date: f.pipeline_entry_date,
      stage_entered_at: lastActivity,
      last_activity_at: lastActivity,
      study_delivered_at: f.study_delivered_days ? isoTs(daysAgo(f.study_delivered_days)) : null,
      priority: "normal",
      internal_notes: notesFor(f),
    });
  }

  // Souscriptions + commissions (après que toutes les personnes A soient mappées).
  for (const f of FOYERS) {
    const clientId = tagId("0002", f.seq);
    const dossierId = tagId("0003", f.seq);
    const subscriberPersonId = personAId.get(f.seq);
    if (!subscriberPersonId) continue;

    for (const s of f.souscriptions) {
      subSeq += 1;
      const sousId = tagId("0005", subSeq);
      const prodId = PRODUIT_ID[s.prod];
      const prodDef = PRODUITS.find((p) => p.key === s.prod);
      const subDate = isoDate(daysAgo(s.sub_days ?? 180));
      const isActive = s.status === "active";
      // total_aum_current : léger gain réaliste (~+6%) pour les actifs en cours.
      const aum = isActive ? Math.round(s.amount * 1.06) : s.amount;

      souscriptionRows.push({
        id: sousId,
        tenant_id: TENANT_ID,
        cabinet_id: CABINET_ID,
        dossier_id: dossierId,
        client_id: clientId,
        subscriber_person_id: subscriberPersonId,
        produit_id: prodId,
        engineer_id: ENGINEER_ID,
        amount_initial: s.amount,
        amount_recurring_monthly: s.monthly ?? 0,
        total_aum_current: aum,
        contract_number_partner: `${prodDef.partner.slice(0, 3).toUpperCase()}-2025-${String(1000 + subSeq)}`,
        subscription_date: subDate,
        status: s.status,
        payment_method: "virement",
      });

      // Commission d'apport (upfront) part cabinet + part reversée ingénieur.
      const ownerComm = (s.amount * prodDef.rate) / 100;
      const cabinetShare = Math.round(ownerComm * (prodDef.split / 100));
      const received = isActive || s.status === "signed";

      comSeq += 1;
      commissionRows.push({
        id: tagId("0006", comSeq),
        souscription_id: sousId,
        commission_type: "upfront",
        recipient_type: "cabinet",
        recipient_tenant_id: TENANT_ID,
        recipient_cabinet_id: CABINET_ID,
        recipient_user_id: null,
        amount_eur: cabinetShare,
        rate_applied: prodDef.rate / 100,
        base_amount: s.amount,
        due_date: subDate,
        paid_date: received ? subDate : null,
        status: received ? "received" : "pending",
      });

      comSeq += 1;
      commissionRows.push({
        id: tagId("0006", comSeq),
        souscription_id: sousId,
        commission_type: "upfront",
        recipient_type: "engineer_bonus",
        recipient_tenant_id: TENANT_ID,
        recipient_cabinet_id: CABINET_ID,
        recipient_user_id: ENGINEER_ID,
        amount_eur: Math.round(cabinetShare * 0.25),
        rate_applied: prodDef.rate / 100,
        base_amount: s.amount,
        due_date: subDate,
        paid_date: received ? subDate : null,
        status: received ? "received" : "pending",
      });
    }

    // Honoraires d'étude (study_fee) pour les foyers dont l'étude est livrée.
    if (f.study_delivered_days || ["04_etudes", "05_restituee", "06_suivi"].includes(f.pipeline_stage)) {
      const firstSub = souscriptionRows.find((r) => r.dossier_id === dossierId);
      if (firstSub) {
        comSeq += 1;
        commissionRows.push({
          id: tagId("0006", comSeq),
          souscription_id: firstSub.id,
          commission_type: "study_fee",
          recipient_type: "cabinet",
          recipient_tenant_id: TENANT_ID,
          recipient_cabinet_id: CABINET_ID,
          recipient_user_id: null,
          amount_eur: 2500,
          rate_applied: null,
          base_amount: null,
          due_date: firstSub.subscription_date,
          paid_date: firstSub.subscription_date,
          status: "received",
        });
      }
    }
  }

  console.log("→ Upsert clients…");
  await upsert("clients", clientRows);
  console.log(`  ${clientRows.length} clients (foyers).`);

  console.log("→ Upsert personnes…");
  await upsert("personnes", personneRows);
  console.log(`  ${personneRows.length} personnes.`);

  console.log("→ Upsert dossiers…");
  await upsert("dossiers", dossierRows);
  console.log(`  ${dossierRows.length} dossiers (engineer DEFAULT).`);

  console.log("→ Upsert souscriptions…");
  await upsert("souscriptions", souscriptionRows);
  console.log(`  ${souscriptionRows.length} souscriptions.`);

  console.log("→ Upsert commissions…");
  await upsert("commissions", commissionRows);
  console.log(`  ${commissionRows.length} commissions.`);

  // ----------------------------------------------------------------------
  // VÉRIFICATION
  // ----------------------------------------------------------------------
  const totalPatrimoine = souscriptionRows.reduce((a, r) => a + r.amount_initial, 0);
  console.log("\n→ Vérification :");
  console.log(`  Patrimoine placé (Σ amount_initial) : ${totalPatrimoine.toLocaleString("fr-FR")} €`);
  for (const t of ["clients", "personnes", "dossiers", "souscriptions"]) {
    const { count } = await sb
      .from(t)
      .select("id", { count: "exact", head: true })
      .eq("cabinet_id", CABINET_ID)
      .eq("tenant_id", TENANT_ID);
    console.log(`  ${t} (scopé) : ${count ?? 0}`);
  }

  console.log("\n✓ Seed clients réels terminé.");
}

main().catch((e) => {
  console.error("✗ Échec du seed :", e.message);
  process.exit(1);
});
