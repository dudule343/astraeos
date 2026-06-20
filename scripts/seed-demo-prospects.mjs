// Seed démo des PROSPECTS (table dci_submissions), scopé tenant/cabinet legacy.
// Idempotent (upsert sur id taggé 0000de70-). N'INSÈRE que, ne supprime rien.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TENANT = "00000000-0000-0000-0000-000000000010";
const CABINET = "00000000-0000-0000-0000-000000000100";

// 5 prospects, mix de kinds (complet = DCI complet, qualification = questionnaire,
// rdv = prise de RDV, simple = formulaire simple).
const PROSPECTS = [
  { slug: "prospect-mercier", name: "Thomas MERCIER", kinds: ["rdv", "complet"], days: 2 },
  { slug: "prospect-joubert", name: "Sophie JOUBERT", kinds: ["rdv", "qualification"], days: 5 },
  { slug: "prospect-renard", name: "Bernard RENARD", kinds: ["rdv"], days: 1 },
  { slug: "prospect-vasseur", name: "Claire VASSEUR", kinds: ["complet", "qualification", "rdv"], days: 9 },
  { slug: "prospect-leroy", name: "Antoine LEROY", kinds: ["qualification"], days: 3 },
];

function payloadFor(kind, name) {
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const base = { first_name: first, last_name: last, email: `${first}.${last}`.toLowerCase().replace(/\s+/g, "") + "@email-demo.fr", phone: "+33 6 12 34 56 78" };
  if (kind === "rdv") return { ...base, message: "Souhaite un premier rendez-vous découverte." };
  if (kind === "qualification") return { ...base, profil_risque: "équilibré", horizon: "8 ans", objectif: "transmission" };
  if (kind === "complet") return { ...base, patrimoine_estime: 850000, revenus: 120000, objectif: "optimisation fiscale", profil_risque: "dynamique" };
  return base;
}

const rows = [];
let n = 0;
for (const p of PROSPECTS) {
  for (const kind of p.kinds) {
    const at = new Date(Date.now() - p.days * 24 * 3600 * 1000).toISOString();
    rows.push({
      id: `0000de70-0000-4000-8000-${String(1000 + n).padStart(12, "0")}`,
      prospect_slug: p.slug,
      kind,
      payload: payloadFor(kind, p.name),
      display_name: p.name,
      submitted_at: at,
      updated_at: at,
      tenant_id: TENANT,
      cabinet_id: CABINET,
    });
    n++;
  }
}

const before = await supabase.from("dci_submissions").select("id", { count: "exact", head: true }).eq("tenant_id", TENANT);
const { error } = await supabase.from("dci_submissions").upsert(rows, { onConflict: "id" });
if (error) { console.error("ERREUR upsert:", error); process.exit(1); }
const after = await supabase.from("dci_submissions").select("id", { count: "exact", head: true }).eq("tenant_id", TENANT);
console.log(`dci_submissions (tenant): avant=${before.count ?? 0} → après=${after.count ?? 0} | ${PROSPECTS.length} prospects, ${rows.length} soumissions`);
