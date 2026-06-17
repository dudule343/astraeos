import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Data layer du portail client — AUTH-GATÉ role='client'.
//
// Résolution du scope (jamais la donnée d'un autre client) :
//   getSessionContext().userId  (= public.users.id)
//     → personnes.user_id = userId   → personnes.client_id
//       → dossiers WHERE client_id    → le dossier du client
//
// On lit/écrit via createAdminClient (service_role) + scope manuel, comme le
// reste du repo (mon-activite, cabinet). dci_responses n'a pas de tenant_id,
// donc pas de policy RLS dédiée : le scope est garanti côté code en passant
// TOUJOURS par le dossier résolu ci-dessus.
//
// Toute lecture dégrade en état vide honnête (null / []) en cas d'erreur ou
// d'absence de donnée. ZÉRO donnée fictive.
// =========================================================================

// ---------------------------------------------------------------------------
// Les 13 catégories du DCI — clé canonique ⇄ colonne dci_responses.
// La clé canonique (cat_01_identite …) est ce que les pages / server actions
// manipulent ; le mapping vers la colonne JSONB reste interne au data layer.
// ---------------------------------------------------------------------------

export const DCI_CATEGORY_COLUMNS = {
  cat_01_identite: "responses_cat_01_identite",
  cat_02_pro: "responses_cat_02_pro",
  cat_03_revenus: "responses_cat_03_revenus",
  cat_04_immobilier: "responses_cat_04_immobilier",
  cat_05_financier: "responses_cat_05_financier",
  cat_06_pro_societes: "responses_cat_06_pro_societes",
  cat_07_usage: "responses_cat_07_usage",
  cat_08_endettement: "responses_cat_08_endettement",
  cat_09_couverture: "responses_cat_09_couverture",
  cat_10_fiscalite: "responses_cat_10_fiscalite",
  cat_11_succession: "responses_cat_11_succession",
  cat_12_objectifs: "responses_cat_12_objectifs",
  cat_13_kyc: "responses_cat_13_kyc",
} as const;

export type DciCategoryKey = keyof typeof DCI_CATEGORY_COLUMNS;

export const DCI_CATEGORY_KEYS = Object.keys(DCI_CATEGORY_COLUMNS) as DciCategoryKey[];

export const DCI_CATEGORY_LABELS: Record<DciCategoryKey, string> = {
  cat_01_identite: "Identité & foyer",
  cat_02_pro: "Situation professionnelle",
  cat_03_revenus: "Revenus",
  cat_04_immobilier: "Patrimoine immobilier",
  cat_05_financier: "Patrimoine financier",
  cat_06_pro_societes: "Patrimoine professionnel / sociétés",
  cat_07_usage: "Biens d'usage & divers",
  cat_08_endettement: "Endettement & passifs",
  cat_09_couverture: "Couverture & prévoyance",
  cat_10_fiscalite: "Fiscalité",
  cat_11_succession: "Succession & transmission",
  cat_12_objectifs: "Objectifs patrimoniaux",
  cat_13_kyc: "Profil investisseur (KYC)",
};

export type DciStatus =
  | "draft"
  | "simplified_completed"
  | "full_in_progress"
  | "full_validated"
  | "signed";

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prise de contact",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Étude en cours",
  "05_restituee": "Restitution",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
};

// ---------------------------------------------------------------------------
// Contexte client résolu
// ---------------------------------------------------------------------------

export type ClientContext = {
  /** public.users.id du client connecté */
  userId: string;
  /** personnes.client_id (le foyer) */
  clientId: string;
  /** dossier principal du client */
  dossierId: string;
  pipelineStage: string;
  pipelineStageLabel: string;
  dciCompletionPct: number;
  /** identité du représentant connecté (personnes) */
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
};

/**
 * Résout le client connecté + son dossier principal + son identité.
 * Renvoie null si : pas de session, rôle ≠ 'client', pas de personne reliée,
 * ou pas de dossier. Aucune donnée d'un autre client ne peut transiter ici :
 * tout part de personnes.user_id = userId.
 */
export async function getClientContext(): Promise<ClientContext | null> {
  try {
    const ctx = await getSessionContext();
    if (!ctx || ctx.role !== "client") return null;

    const supabase = createAdminClient();

    // 1. La personne reliée à l'utilisateur connecté → son client_id + identité.
    const { data: personne, error: pErr } = await supabase
      .from("personnes")
      .select("client_id, first_name, last_name, email")
      .eq("user_id", ctx.userId)
      .limit(1)
      .maybeSingle();

    if (pErr || !personne?.client_id) return null;

    const clientId = personne.client_id as string;

    // 2. Le dossier du client (le plus récent fait foi comme dossier principal).
    const { data: dossier, error: dErr } = await supabase
      .from("dossiers")
      .select("id, pipeline_stage, dci_completion_pct")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dErr || !dossier?.id) return null;

    const firstName = (personne.first_name as string) ?? "";
    const lastName = (personne.last_name as string) ?? "";
    const stage = (dossier.pipeline_stage as string) ?? "01_prospect";

    return {
      userId: ctx.userId,
      clientId,
      dossierId: dossier.id as string,
      pipelineStage: stage,
      pipelineStageLabel: PIPELINE_STAGE_LABELS[stage] ?? stage,
      dciCompletionPct: Number(dossier.dci_completion_pct ?? 0),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email: (personne.email as string) ?? null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lecture du dossier
// ---------------------------------------------------------------------------

export type ClientDossier = {
  id: string;
  pipelineStage: string;
  pipelineStageLabel: string;
  dciCompletionPct: number;
  letterOfMissionSignedAt: string | null;
  studyDeliveredAt: string | null;
  restitutionMeetingDate: string | null;
  lastActivityAt: string | null;
};

/**
 * Détail du dossier du client connecté. Re-résout le scope via getClientContext
 * (pas de dossierId en paramètre côté lecture : on ne lit QUE son dossier).
 * Dégrade à null.
 */
export async function fetchClientDossier(): Promise<ClientDossier | null> {
  try {
    const client = await getClientContext();
    if (!client) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        "id, pipeline_stage, dci_completion_pct, letter_of_mission_signed_at, study_delivered_at, restitution_meeting_date, last_activity_at, client_id",
      )
      .eq("id", client.dossierId)
      .eq("client_id", client.clientId) // double garde de scope
      .maybeSingle();

    if (error || !data) return null;

    const stage = (data.pipeline_stage as string) ?? "01_prospect";
    return {
      id: data.id as string,
      pipelineStage: stage,
      pipelineStageLabel: PIPELINE_STAGE_LABELS[stage] ?? stage,
      dciCompletionPct: Number(data.dci_completion_pct ?? 0),
      letterOfMissionSignedAt: (data.letter_of_mission_signed_at as string) ?? null,
      studyDeliveredAt: (data.study_delivered_at as string) ?? null,
      restitutionMeetingDate: (data.restitution_meeting_date as string) ?? null,
      lastActivityAt: (data.last_activity_at as string) ?? null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lecture du DCI (dci_responses, 1-1 dossier)
// ---------------------------------------------------------------------------

export type DciCategoryState = {
  key: DciCategoryKey;
  label: string;
  /** réponses brutes de la catégorie (JSONB) */
  responses: Record<string, unknown>;
  /** au moins une réponse saisie */
  hasResponses: boolean;
};

export type ClientDci = {
  exists: boolean;
  status: DciStatus;
  completionPct: number;
  simplifiedCompletedAt: string | null;
  fullValidatedAt: string | null;
  signedAt: string | null;
  categories: DciCategoryState[];
  /** completion par catégorie mise en cache côté serveur (0-100) */
  completionByCat: Record<string, number>;
};

function emptyDci(): ClientDci {
  return {
    exists: false,
    status: "draft",
    completionPct: 0,
    simplifiedCompletedAt: null,
    fullValidatedAt: null,
    signedAt: null,
    completionByCat: {},
    categories: DCI_CATEGORY_KEYS.map((key) => ({
      key,
      label: DCI_CATEGORY_LABELS[key],
      responses: {},
      hasResponses: false,
    })),
  };
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

/**
 * Lit le DCI du dossier du client connecté : status, timestamps de cycle,
 * et les 13 catégories de réponses. Si aucune ligne dci_responses n'existe
 * encore, renvoie un état vide honnête (exists:false, catégories vides).
 */
export async function fetchClientDci(): Promise<ClientDci> {
  try {
    const client = await getClientContext();
    if (!client) return emptyDci();

    const supabase = createAdminClient();
    const columns = DCI_CATEGORY_KEYS.map((k) => DCI_CATEGORY_COLUMNS[k]);
    const { data, error } = await supabase
      .from("dci_responses")
      .select(
        [
          "status",
          "completion_pct_cached",
          "completion_by_cat_cached",
          "simplified_completed_at",
          "full_validated_at",
          "signed_at",
          ...columns,
        ].join(", "),
      )
      .eq("dossier_id", client.dossierId)
      .maybeSingle();

    if (error || !data) return emptyDci();

    const row = data as unknown as Record<string, unknown>;
    const categories: DciCategoryState[] = DCI_CATEGORY_KEYS.map((key) => {
      const responses = asRecord(row[DCI_CATEGORY_COLUMNS[key]]);
      return {
        key,
        label: DCI_CATEGORY_LABELS[key],
        responses,
        hasResponses: Object.keys(responses).length > 0,
      };
    });

    return {
      exists: true,
      status: (row.status as DciStatus) ?? "draft",
      completionPct: Number(row.completion_pct_cached ?? 0),
      simplifiedCompletedAt: (row.simplified_completed_at as string) ?? null,
      fullValidatedAt: (row.full_validated_at as string) ?? null,
      signedAt: (row.signed_at as string) ?? null,
      completionByCat: asRecord(row.completion_by_cat_cached) as Record<string, number>,
      categories,
    };
  } catch {
    return emptyDci();
  }
}

// ---------------------------------------------------------------------------
// Lecture des documents partagés au client
// ---------------------------------------------------------------------------

export type ClientDocument = {
  id: string;
  filename: string;
  category: string; // document_category
  documentType: string; // document_type
  status: string; // document_status
  fileSizeBytes: number | null;
  mimeType: string | null;
  storageUrl: string;
  createdAt: string | null;
  signedAt: string | null;
};

/**
 * Documents du dossier du client VISIBLES par lui :
 * visibility='shared_with_client' uniquement (les private_pro restent
 * invisibles). Inclut études/synthèses/lettre de mission partagées par le CGP
 * ET les pièces déposées par le client lui-même (cf. uploadClientDocument).
 * Dégrade à [].
 */
export async function fetchClientDocuments(): Promise<ClientDocument[]> {
  try {
    const client = await getClientContext();
    if (!client) return [];

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("documents")
      .select(
        "id, filename, category, document_type, status, file_size_bytes, mime_type, storage_url, created_at, signed_at",
      )
      .eq("dossier_id", client.dossierId)
      .eq("visibility", "shared_with_client")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id as string,
      filename: (d.filename as string) ?? "Document",
      category: (d.category as string) ?? "autre",
      documentType: (d.document_type as string) ?? "autre",
      status: (d.status as string) ?? "pending_validation",
      fileSizeBytes: d.file_size_bytes != null ? Number(d.file_size_bytes) : null,
      mimeType: (d.mime_type as string) ?? null,
      storageUrl: (d.storage_url as string) ?? "",
      createdAt: (d.created_at as string) ?? null,
      signedAt: (d.signed_at as string) ?? null,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Formatage partagé (réutilisable par les pages, sans dépendance DB)
// ---------------------------------------------------------------------------

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function fmtFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
