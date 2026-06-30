// Module SERVEUR de l'outil « Études patrimoniales ».
//
// IMPORTÉ UNIQUEMENT par les pages serveur (page.tsx) et les server actions :
// il importe getSessionContext + createAdminClient. JAMAIS par un composant
// client.
//
// Lit/écrit les tables dédiées `etudes_patrimoniales` ⨝ `etude_blocs`, scope
// tenant/cabinet/engineer. Le seed du jeu de données réutilise les lecteurs
// existants (fiche client, profil de risque, souscriptions) plutôt que de
// recoder l'accès. Dégradé honnête partout : liste vide / null, jamais de
// fausses données.

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import { getFicheClient } from "./fiche-client-server";
import { getFicheClientRiskProfile } from "./fiche-client-risk";
import { fetchEngineerSubscriptions } from "./assets-source";
import { getClientsScreen } from "./clients-server";
import {
  type BlocState,
  type EtudeClientPickerItem,
  type EtudeDetail,
  type EtudeDonnees,
  type EtudeListItem,
  type EtudeProduit,
  type EtudeStatut,
  emptyEtudeDonnees,
  formatEtudeDate,
  normalizeEtudeDonnees,
} from "./etudes-patrimoniales";

const VALID_STATUTS = new Set<EtudeStatut>(["brouillon", "en_cours", "validee", "restituee"]);

function asStatut(raw: unknown): EtudeStatut {
  return VALID_STATUTS.has(raw as EtudeStatut) ? (raw as EtudeStatut) : "brouillon";
}

type RawPersonneName = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

/** Nom d'affichage du foyer « Bertrand & Monique DUPONT » depuis les personnes. */
function householdName(personnes: RawPersonneName[]): string {
  if (personnes.length === 0) return "Foyer sans nom";
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const aFirst = (a.first_name ?? "").trim();
  const lastName = (a.last_name ?? "").trim();
  if (b) {
    const lead = [aFirst, (b.first_name ?? "").trim()].filter(Boolean).join(" & ");
    return `${lead} ${lastName}`.trim() || "Foyer sans nom";
  }
  return `${aFirst} ${lastName}`.trim() || "Foyer sans nom";
}

function clientNameOf(clientRaw: unknown): string {
  const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
  const c = client as { personnes?: RawPersonneName[] | null } | null | undefined;
  return householdName(c?.personnes ?? []);
}

// ---------------------------------------------------------------------------
// Lecture : liste des études du scope
// ---------------------------------------------------------------------------

/**
 * Liste des études patrimoniales de l'ingénieur connecté (scope
 * tenant/cabinet/engineer), jointe au nom du foyer, triée par création
 * décroissante. Dégradé honnête : [] si pas de base / pas de session / erreur.
 */
export async function getEtudesPatrimoniales(): Promise<EtudeListItem[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const ctx = await getSessionContext();
    if (!ctx) return [];

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("etudes_patrimoniales")
      .select(
        `
          id, client_id, titre, statut, created_at, updated_at,
          client:clients ( personnes ( role_in_household, first_name, last_name ) )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("engineer_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) return [];

    return data.map((row: Record<string, unknown>) => {
      const createdAt = (row.created_at as string) ?? null;
      return {
        id: row.id as string,
        clientId: (row.client_id as string) ?? null,
        clientNom: clientNameOf(row.client),
        titre: (row.titre as string) ?? "Étude patrimoniale",
        statut: asStatut(row.statut),
        createdAt,
        updatedAt: (row.updated_at as string) ?? null,
        dateLabel: formatEtudeDate(createdAt),
      } satisfies EtudeListItem;
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Lecture : une étude + ses blocs
// ---------------------------------------------------------------------------

/**
 * Une étude patrimoniale et l'état de ses blocs (validation + contenu édité).
 * Dégradé honnête : null si pas de base / pas de session / introuvable / erreur.
 */
export async function getEtudePatrimoniale(id: string): Promise<EtudeDetail | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("etudes_patrimoniales")
      .select(
        `
          id, client_id, dossier_id, titre, statut, donnees, created_at, updated_at,
          etude_blocs ( bloc_key, contenu_edite, valide, valide_par, valide_at )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as Record<string, unknown>;
    const blocsRaw = (row.etude_blocs as Array<Record<string, unknown>> | null) ?? [];
    const blocs: BlocState[] = blocsRaw.map((b) => ({
      blocKey: b.bloc_key as string,
      contenuEdite: (b.contenu_edite as string) ?? null,
      valide: b.valide === true,
      validePar: (b.valide_par as string) ?? null,
      valideAt: (b.valide_at as string) ?? null,
    }));

    return {
      id: row.id as string,
      clientId: (row.client_id as string) ?? null,
      dossierId: (row.dossier_id as string) ?? null,
      titre: (row.titre as string) ?? "Étude patrimoniale",
      statut: asStatut(row.statut),
      donnees: normalizeEtudeDonnees(row.donnees),
      blocs,
      createdAt: (row.created_at as string) ?? null,
      updatedAt: (row.updated_at as string) ?? null,
    } satisfies EtudeDetail;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Seed : jeu de données pré-rempli depuis le réel
// ---------------------------------------------------------------------------

/**
 * Construit un EtudeDonnees pré-rempli pour un client EXISTANT en réutilisant
 * les lecteurs déjà branchés :
 *  - getFicheClient → foyer + personnes (format DB) ;
 *  - getFicheClientRiskProfile → profil de risque / horizon / ESG ;
 *  - fetchEngineerSubscriptions → produits placés (filtrés sur ce client).
 *
 * Tous les MONTANTS du patrimoine restent nuls (état vide éditable). Best-effort :
 * en cas d'erreur on retombe sur un jeu de données vide, jamais d'exception.
 */
export async function seedDonneesFromClient(clientId: string): Promise<EtudeDonnees> {
  const donnees = emptyEtudeDonnees();

  try {
    const [fiche, risk, souscriptions] = await Promise.all([
      getFicheClient(clientId),
      getFicheClientRiskProfile(clientId),
      fetchEngineerSubscriptions(),
    ]);

    // Foyer + personnes : depuis la partie éditable (valeurs DB exactes). Quand
    // la fiche provient du repli modèle (editable === null), le foyer reste vide.
    if (fiche.editable) {
      const foyer = fiche.editable.foyer;
      donnees.foyer = {
        householdType: foyer.household_type ?? null,
        maritalRegime: foyer.marital_regime,
        marriageDate: foyer.marriage_date,
        adresse: foyer.household_address,
        nbChildren: foyer.nb_children,
        nbDependents: foyer.nb_dependents,
        taxResidency: foyer.tax_residency,
        personnes: fiche.editable.personnes.map((p) => ({
          role: p.role_in_household,
          prenom: p.first_name,
          nom: p.last_name,
          birthName: p.birth_name,
          birthDate: p.birth_date,
          // birth_city n'est pas exposé par le lecteur réutilisé : à compléter.
          birthCity: null,
          nationality: p.nationality,
          profession: p.profession,
          employer: p.employer,
          employmentStatus: p.employment_status,
          tmi: p.tmi_estimated,
        })),
      };
    }

    // Profil de risque (si le client a rempli le questionnaire).
    if (risk) {
      donnees.risque = {
        profil: risk.profileLabel,
        horizon: risk.horizonLabel,
        esgActif: risk.esg.actif,
        esgPrivilegier: risk.esg.privilegier,
        esgEviter: risk.esg.eviter,
      };
    }

    // Produits placés au cabinet pour CE client uniquement.
    donnees.produits = souscriptions
      .filter((s) => s.clientId === clientId)
      .map(
        (s): EtudeProduit => ({
          souscriptionId: s.id,
          nom: s.produitName,
          categorie: s.produitCategory,
          partenaire: s.partnerName,
          montantInitial: Number.isFinite(s.amountInitial) ? s.amountInitial : null,
          dateSouscription: s.subscriptionDate,
          statut: s.status,
        }),
      );

    return donnees;
  } catch {
    return donnees;
  }
}

// ---------------------------------------------------------------------------
// Sélecteur de client pour le flux « Créer une étude »
// ---------------------------------------------------------------------------

/**
 * Clients sélectionnables à la création d'une étude. Réutilise getClientsScreen()
 * (même source que l'écran « Tous mes clients ») : id du foyer + nom + détail.
 * Dégradé honnête via le repli de getClientsScreen quand la base manque.
 */
export async function getClientsForPicker(): Promise<EtudeClientPickerItem[]> {
  try {
    const screen = await getClientsScreen();
    return screen.clients.map((c) => ({
      id: c.slug,
      nom: c.nom,
      foyer: c.details,
    }));
  } catch {
    return [];
  }
}
