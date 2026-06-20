// Seed ~9 RDV dans la SEMAINE COURANTE pour remplir la grille agenda comme la
// maquette. Idempotent (id préfixe 0000de71-), scopé, n'insère que.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TENANT = "00000000-0000-0000-0000-000000000010";
const CABINET = "00000000-0000-0000-0000-000000000100";
const ENGINEER = "00000000-0000-0000-0000-000000001000";

// Récupère un status valide (enum) depuis une ligne rdv existante, + des dossiers.
const { data: sample } = await supabase.from("rdv").select("status").limit(1);
const STATUS = sample?.[0]?.status ?? "scheduled";
const { data: dossiers } = await supabase.from("dossiers").select("id").eq("cabinet_id", CABINET).limit(9);
const dIds = (dossiers ?? []).map((d) => d.id);

// Lundi de la semaine courante (00:00 local).
const now = new Date();
const monday = new Date(now);
monday.setHours(0, 0, 0, 0);
monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

function at(dayOffset, h, m) {
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// (jour 0=Lun..4=Ven, heure, min, type, format, durée)
const SLOTS = [
  [0, 9, 0, "suivi_annuel", "telephone", 30],
  [0, 14, 30, "decouverte", "visio", 60],
  [1, 10, 0, "suivi_annuel", "presentiel", 60],
  [1, 16, 0, "collecte", "visio", 45],
  [2, 9, 30, "restitution", "visio", 90],
  [2, 11, 0, "signature", "presentiel", 45],
  [3, 15, 0, "decouverte", "visio", 60],
  [4, 9, 0, "collecte", "presentiel", 60],
  [4, 16, 30, "suivi_annuel", "visio", 45],
];

const rows = SLOTS.map((s, i) => ({
  id: `0000de71-0000-4000-8000-${String(2000 + i).padStart(12, "0")}`,
  tenant_id: TENANT,
  cabinet_id: CABINET,
  engineer_id: ENGINEER,
  dossier_id: dIds[i % Math.max(1, dIds.length)] ?? null,
  type: s[3],
  format: s[4],
  scheduled_at: at(s[0], s[1], s[2]),
  duration_minutes: s[5],
  status: STATUS,
}));

const { error } = await supabase.from("rdv").upsert(rows, { onConflict: "id" });
if (error) { console.error("ERREUR:", error); process.exit(1); }
const { count } = await supabase.from("rdv").select("id", { count: "exact", head: true })
  .eq("cabinet_id", CABINET).gte("scheduled_at", monday.toISOString());
console.log(`RDV semaine courante (status=${STATUS}) : ${rows.length} upsertés, total dès lundi = ${count}`);
