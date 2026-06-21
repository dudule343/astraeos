import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  type FicheClient,
  type FoyerEditable,
  type Personne,
  type PersonneEditable,
  type RegimeField,
  ageFromBirthDate,
  EMPLOYMENT_STATUS_LABELS,
  FICHE_CLIENT_MODELE,
  ficheModeleFromClient,
  formatFicheDate,
  HOUSEHOLD_TYPE_LABELS,
  MARITAL_REGIME_LABELS,
} from "./fiche-client";
import { getClientsScreenFallbackSync, HOUSEHOLD_TYPE_LABELS as CLIENTS_SITUATION_LABELS } from "./clients";

/**
 * Module SERVEUR de la fiche client ingénieur.
 *
 * Lit le foyer réel (`clients` ⨝ `personnes`) par id, scope tenant/cabinet
 * (sécurité multi-tenant). Construit l'affichage ET les données éditables
 * (format DB exact) depuis la base. Dégrade sur la fiche modèle quand la base
 * n'est pas configurée ou que l'id ne correspond à aucun foyer du cabinet.
 */

type RawPersonneFull = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_name: string | null;
  birth_date: string | null;
  nationality: string | null;
  profession: string | null;
  employer: string | null;
  employment_status: string | null;
  tmi_estimated: number | string | null;
  phone: string | null;
  email: string | null;
};

type RawClientFull = {
  id: string;
  household_type: string | null;
  marital_regime: string | null;
  marriage_date: string | null;
  household_address: string | null;
  nb_children: number | null;
  nb_dependents: number | null;
  tax_residency: string | null;
  acquisition_origin: string | null;
  personnes?: RawPersonneFull[] | null;
};

function orderPersonnes(personnes: RawPersonneFull[]): RawPersonneFull[] {
  return [...personnes].sort((a, b) => {
    const ra = a.role_in_household === "person_a" ? 0 : 1;
    const rb = b.role_in_household === "person_a" ? 0 : 1;
    return ra - rb;
  });
}

/** Carte « Identité » d'affichage (lecture) pour une personne. */
function personneDisplay(p: RawPersonneFull): Personne {
  const full = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Personne";
  const age = ageFromBirthDate(p.birth_date);
  const naissance =
    formatFicheDate(p.birth_date) === "—"
      ? "—"
      : `${formatFicheDate(p.birth_date)}${age != null ? ` · ${age} ans` : ""}`;
  const statut = p.employment_status ? EMPLOYMENT_STATUS_LABELS[p.employment_status] ?? p.employment_status : "—";

  return {
    name: full,
    kycBadge: p.role_in_household === "person_a" ? "Personne A" : "Personne B",
    rows: [
      { label: "Date de naissance", value: naissance },
      { label: "Nationalité", value: p.nationality?.trim() || "—" },
      { label: "Profession", value: p.profession?.trim() || "—" },
      { label: "Employeur", value: p.employer?.trim() || "—" },
      { label: "Statut professionnel", value: statut },
      {
        label: "TMI estimée",
        value: p.tmi_estimated != null ? `${Number(p.tmi_estimated)} %` : "—",
      },
      { label: "E-mail", value: p.email?.trim() || "—" },
      { label: "Téléphone", value: p.phone?.trim() || "—" },
    ],
  };
}

function regimeFields(row: RawClientFull): RegimeField[] {
  const ht = row.household_type ? HOUSEHOLD_TYPE_LABELS[row.household_type] ?? row.household_type : "—";
  const mr = row.marital_regime ? MARITAL_REGIME_LABELS[row.marital_regime] ?? row.marital_regime : "—";
  return [
    { label: "Type de foyer", value: ht },
    { label: "Régime matrimonial", value: mr },
    { label: "Date du mariage", value: formatFicheDate(row.marriage_date) },
    { label: "Adresse du foyer", value: row.household_address?.trim() || "—" },
    { label: "Enfants", value: row.nb_children != null ? String(row.nb_children) : "—" },
    {
      label: "Personnes à charge",
      value: row.nb_dependents != null ? String(row.nb_dependents) : "—",
    },
    { label: "Résidence fiscale", value: row.tax_residency?.trim() || "—" },
  ];
}

function toEditableFoyer(row: RawClientFull): FoyerEditable {
  return {
    household_type: row.household_type ?? "celibataire",
    marital_regime: row.marital_regime,
    marriage_date: row.marriage_date,
    household_address: row.household_address,
    nb_children: row.nb_children ?? 0,
    nb_dependents: row.nb_dependents ?? 0,
    tax_residency: row.tax_residency,
    acquisition_origin: row.acquisition_origin,
  };
}

function toEditablePersonne(p: RawPersonneFull): PersonneEditable {
  return {
    role_in_household: p.role_in_household === "person_b" ? "person_b" : "person_a",
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    birth_name: p.birth_name,
    birth_date: p.birth_date,
    nationality: p.nationality,
    profession: p.profession,
    employer: p.employer,
    employment_status: p.employment_status,
    tmi_estimated: p.tmi_estimated != null ? Number(p.tmi_estimated) : null,
    phone: p.phone,
    email: p.email,
  };
}

function heroFromRow(row: RawClientFull, personnes: RawPersonneFull[]): {
  eyebrow: string;
  heroNameLead: string;
  heroNameStrong: string;
  heroSub: string;
} {
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const lastName = (a?.last_name ?? "").trim();
  const aFirst = (a?.first_name ?? "").trim();
  const lead = b ? [aFirst, (b.first_name ?? "").trim()].filter(Boolean).join(" & ") : aFirst;

  const situation = row.household_type
    ? CLIENTS_SITUATION_LABELS[row.household_type] ?? ""
    : "";
  const ageA = ageFromBirthDate(a?.birth_date ?? null);
  const ageB = ageFromBirthDate(b?.birth_date ?? null);
  const ages = [ageA, ageB].filter((x): x is number => x != null).map((x) => `${x} ans`);

  const subBits: string[] = [];
  subBits.push(personnes.length >= 2 ? "2 personnes physiques" : "1 personne physique");
  if (situation) subBits.push(`foyer : ${situation}`);
  if (ages.length) subBits.push(ages.join(" et "));
  if (row.household_address) subBits.push(`domicile : ${row.household_address}`);

  return {
    eyebrow: "Fiche client · régime de l'union",
    heroNameLead: lead ? `${lead} ` : "",
    heroNameStrong: lastName || "Foyer",
    heroSub: subBits.join(" · ") + ".",
  };
}

/**
 * Fiche client réelle alimentée par la base. Dégrade sur le modèle quand la
 * base n'est pas configurée, la session manque, ou l'id ne correspond à aucun
 * foyer du cabinet.
 */
export async function getFicheClient(id: string): Promise<FicheClient> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return resolveFallback(id);
  try {
    const ctx = await getSessionContext();
    if (!ctx) return resolveFallback(id);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
          id, household_type, marital_regime, marriage_date, household_address,
          nb_children, nb_dependents, tax_residency, acquisition_origin,
          personnes (
            role_in_household, first_name, last_name, birth_name, birth_date,
            nationality, profession, employer, employment_status,
            tmi_estimated, phone, email
          )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return resolveFallback(id);

    const row = data as RawClientFull;
    const personnes = orderPersonnes(row.personnes ?? []);
    const hero = heroFromRow(row, personnes);

    return {
      ...FICHE_CLIENT_MODELE,
      id: row.id,
      eyebrow: hero.eyebrow,
      heroNameLead: hero.heroNameLead,
      heroNameStrong: hero.heroNameStrong,
      heroSub: hero.heroSub,
      personnes: personnes.map(personneDisplay),
      regimeFields: regimeFields(row),
      // Historique / documents / RDV restent dérivés ailleurs (souscriptions,
      // conformité) : on garde l'exemple de la maquette en lecture seule tant
      // que ces flux ne sont pas branchés ici.
      editable: {
        clientId: row.id,
        foyer: toEditableFoyer(row),
        personnes: personnes.map(toEditablePersonne),
      },
    };
  } catch {
    return resolveFallback(id);
  }
}

/** Repli : reconstruit le hero depuis la liste maquette, ou la fiche modèle. */
function resolveFallback(id: string): FicheClient {
  const client = getClientsScreenFallbackSync().clients.find((c) => c.slug === id);
  if (!client) return FICHE_CLIENT_MODELE;
  if (client.slug === "dupont-topin") return FICHE_CLIENT_MODELE;
  return ficheModeleFromClient(client);
}
