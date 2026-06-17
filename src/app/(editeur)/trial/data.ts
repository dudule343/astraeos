import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Données de la page "Période d'essai" (espace éditeur ASTRAEOS).
//
// Un "essai" = un compte client éditeur dont le statut applicatif vaut
// "trial/essai". La source réelle est la même que clients/page.tsx :
//   - table `clients` (scopée tenant_id)
//   - représentant dans `personnes`
//   - cabinet rattaché dans `cabinets`
//   - métadonnées éditeur en JSON dans `dossiers.internal_notes`
//     (champs `status`, `category`, `is_demo`, ...).
//
// Aucune table ni colonne "trial" dédiée n'existe (pas de date de fin
// d'essai, pas d'étapes de parcours, pas d'offres, pas d'historique de
// conversion). Tout ce qui n'a pas de source reste en "—" / état vide
// honnête — on n'invente rien.

const TRIAL_STATUSES = new Set(["trial", "essai", "trialing"]);

const TYPE_BADGE: Record<string, { v: string; cls: string }> = {
  marque: { v: "Marque", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
  cabinet_direct: { v: "Cabinet", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
  autre_pro: { v: "Autre pro", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
};

const PLACEHOLDER_BADGE = { v: "—", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" };

export type TrialRow = {
  id: string;
  name: string | null;
  role: string | null;
  cabinet: string | null;
  email: string | null;
  phone: string | null;
  type: { v: string; cls: string };
  startedOn: string | null;
  /** Aucune date de fin d'essai en base → toujours null (affiché "—"). */
  remaining: string | null;
  /** Aucune table d'étapes d'onboarding → toujours null. */
  step: string | null;
  /** Aucune table d'offres proposées → toujours null. */
  offer: string | null;
  startedAt: string | null;
};

export type TrialData = {
  rows: TrialRow[];
  /** Essais en cours = nb de comptes en statut trial. */
  enCours: number;
  /** Démarrés ces 30 jours = comptes trial créés < 30 jours. */
  demarres30j: number;
  hasData: boolean;
};

const EMPTY: TrialData = {
  rows: [],
  enCours: 0,
  demarres30j: 0,
  hasData: false,
};

type CabinetEmbed = { name?: string };
type PersonneEmbed = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};
type DossierEmbed = { internal_notes?: string };
type ClientRow = {
  id: string;
  created_at?: string;
  cabinets?: CabinetEmbed | CabinetEmbed[] | null;
  personnes?: PersonneEmbed | PersonneEmbed[] | null;
  dossiers?: DossierEmbed | DossierEmbed[] | null;
};

type Notes = {
  category?: string;
  sub_category?: string;
  raison_sociale?: string;
  status?: string;
  is_demo?: boolean;
};

function first<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : (v ?? undefined);
}

function parseNotes(raw?: string): Notes {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Notes;
  } catch {
    return {};
  }
}

export async function fetchTrials(): Promise<TrialData> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return EMPTY;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("clients")
      .select(
        `
          id,
          created_at,
          cabinets ( name ),
          personnes ( first_name, last_name, email, phone ),
          dossiers ( internal_notes )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!data) return EMPTY;

    const rows: TrialRow[] = [];
    for (const raw of data as ClientRow[]) {
      const notes = parseNotes(first(raw.dossiers)?.internal_notes);

      // Filtre "en essai" : seul champ qui porte un statut applicatif.
      const status = (notes.status ?? "").toLowerCase();
      if (!TRIAL_STATUSES.has(status)) continue;
      // On masque le seed de démo.
      if (notes.is_demo) continue;

      const cabinet = first(raw.cabinets);
      const person = first(raw.personnes);
      const fullName = person
        ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim()
        : "";

      rows.push({
        id: raw.id,
        name: fullName || null,
        // Pas de colonne "fonction" en base → sub_category si présent, sinon "—".
        role: notes.sub_category ?? null,
        cabinet: cabinet?.name ?? notes.raison_sociale ?? null,
        email: person?.email ?? null,
        phone: person?.phone ?? null,
        type: notes.category ? (TYPE_BADGE[notes.category] ?? PLACEHOLDER_BADGE) : PLACEHOLDER_BADGE,
        startedOn: fmtDate(raw.created_at ?? null),
        remaining: null,
        step: null,
        offer: null,
        startedAt: raw.created_at ?? null,
      });
    }

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const demarres30j = rows.filter((r) => {
      if (!r.startedAt) return false;
      const t = new Date(r.startedAt).getTime();
      return Number.isFinite(t) && t >= cutoff;
    }).length;

    return {
      rows,
      enCours: rows.length,
      demarres30j,
      hasData: rows.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}
