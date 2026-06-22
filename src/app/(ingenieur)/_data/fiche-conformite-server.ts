import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  ACTION_BAR,
  CONDITIONS,
  CONDITIONS_SUB,
  DOC_CARDS,
  PAY_BANNER,
  type ConditionRow,
  type DocCard,
  type DocCardKey,
  type FicheConformiteBody,
  type TrackerStep,
} from "./fiche-conformite";

/**
 * Résout l'en-tête RÉEL d'une fiche conformité à partir d'un id de dossier.
 *
 * La fiche conformité détaillée porte un atelier de génération des livrables
 * (DER / KYC / LM) volontairement démonstratif. Quand l'id correspond à un
 * dossier réel du cabinet, on remplace au moins le hero (nom du foyer, type)
 * pour que le drill-down soit cohérent avec la ligne cliquée, plutôt que
 * d'afficher systématiquement le foyer modèle. Renvoie null si l'id n'est pas
 * un dossier réel (la page retombe alors sur le modèle de la maquette).
 */

export type FicheConformiteHero = {
  client1Lead: string;
  client1Strong: string;
  client2Lead: string;
  client2Strong: string;
  /** Libellé du foyer (« Couple », « Personne seule », « Personne morale »). */
  typeLabel: string;
  /** Le dossier réel a-t-il déjà des pièces de conformité saisies ? */
  hasConformiteItems: boolean;
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getFicheConformiteHero(
  id: string,
): Promise<FicheConformiteHero | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  // Les ids de la maquette (« joubert », …) ne sont pas des UUID : on évite une
  // requête garantie vide et on retombe directement sur le modèle.
  if (!UUID_RE.test(id)) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          client:clients!inner (
            household_type,
            personnes ( role_in_household, first_name, last_name )
          ),
          conformite_items ( id )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as unknown as {
      client: { household_type: string | null; personnes: RawPersonne[] | null } | null;
      conformite_items: { id: string }[] | null;
    };
    const personnes = row.client?.personnes ?? [];
    if (personnes.length === 0) return null;

    const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
    const b = personnes.find((p) => p.role_in_household === "person_b");
    const aFirst = (a.first_name ?? "").trim();
    const aLast = (a.last_name ?? "").trim();

    if (b) {
      const isPacs = row.client?.household_type === "couple_pacs";
      return {
        client1Lead: aFirst ? `${aFirst} ` : "",
        client1Strong: aLast || "Foyer",
        client2Lead: ` & ${(b.first_name ?? "").trim()} `,
        client2Strong: (b.last_name ?? "").trim() || "",
        typeLabel: isPacs ? "Couple PACS" : "Couple",
        hasConformiteItems: (row.conformite_items ?? []).length > 0,
      };
    }

    return {
      client1Lead: aFirst ? `${aFirst} ` : "",
      client1Strong: aLast || "Foyer",
      client2Lead: "",
      client2Strong: "",
      typeLabel: "Personne seule",
      hasConformiteItems: (row.conformite_items ?? []).length > 0,
    };
  } catch {
    return null;
  }
}

/* ── Corps live · livrables et conditions dérivés de Supabase ──────────────
 *
 * Le CORPS de la fiche (cartes documents DER/KYC/LM + conditions de passage à
 * l'étape 03) est branché sur les pièces de conformité RÉELLES du dossier
 * (`conformite_items`) et le statut de paiement (`souscriptions`). Quand l'id
 * est un UUID de dossier réel du cabinet portant des pièces, on recalcule
 * trackers, pastilles de statut et conditions ; sinon on renvoie les constantes
 * de la maquette (DOC_CARDS / CONDITIONS) comme repli intégral. Vit côté serveur
 * (et pas dans fiche-conformite.ts, importé aussi par un composant client). */

type RawConfItem = {
  type: string;
  status: string; // a_faire | envoye | signe | valide
  sent_at: string | null;
  signed_at: string | null;
  validated_at: string | null;
};

type RawSousc = { status: string | null; subscription_date: string | null };

const STATUS_PILL: Record<string, string> = {
  a_faire: "● À préparer",
  envoye: "● Envoyé · en attente de signature",
  signe: "● Signé par le client",
  valide: "● Validé",
};

const CARD_TYPE_KEY: Record<DocCardKey, string> = {
  der: "der",
  kyc: "kyc",
  lm: "lettre_mission",
};

function fmtConfDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Trackers (Préparé / À envoyer / Signé) recalés sur le statut réel de la pièce. */
function trackerFor(card: DocCard, item: RawConfItem | undefined): TrackerStep[] {
  const status = item?.status ?? "a_faire";
  const sent = fmtConfDate(item?.sent_at ?? null);
  const signed = fmtConfDate(item?.signed_at ?? null);
  return card.tracker.map((step, idx) => {
    // Étape de préparation : faite dès qu'une pièce existe en base.
    if (idx === 0) return { ...step, state: item ? "done" : "todo" };
    const isSignStep = /sign/i.test(step.label);
    if (isSignStep) {
      const done = status === "signe" || status === "valide";
      return { ...step, date: done ? signed : "—", state: done ? "done" : "todo" };
    }
    const isSentStep = /envoyer|envoyée|envoyé/i.test(step.label) || step.state === "current";
    if (isSentStep) {
      const sentDone = status === "envoye" || status === "signe" || status === "valide";
      return { ...step, date: sentDone ? sent : "attente", state: sentDone ? "done" : "current" };
    }
    return step;
  });
}

function docCardsFromItems(items: RawConfItem[]): DocCard[] {
  const byType = new Map(items.map((i) => [i.type, i]));
  return DOC_CARDS.map((card) => {
    const item = byType.get(CARD_TYPE_KEY[card.key]);
    return {
      ...card,
      statusPill: item ? STATUS_PILL[item.status] ?? card.statusPill : card.statusPill,
      tracker: trackerFor(card, item),
    };
  });
}

function conditionsFromState(
  items: RawConfItem[],
  paid: boolean,
): { conditions: ConditionRow[]; remplies: number } {
  const byType = new Map(items.map((i) => [i.type, i.status]));
  const signedOf = (type: string) => {
    const s = byType.get(type);
    return s === "signe" || s === "valide";
  };
  const derOk = signedOf("der");
  const kycOk = signedOf("kyc");
  const lmOk = signedOf("lettre_mission");

  const conditions = CONDITIONS.map((cond): ConditionRow => {
    if (/^DER /i.test(cond.text)) {
      return derOk ? { ...cond, badge: { kind: "text", label: "Signé", bg: "ivory" } } : cond;
    }
    if (/^KYC /i.test(cond.text)) {
      return kycOk ? { ...cond, badge: { kind: "text", label: "Signé", bg: "ivory" } } : cond;
    }
    if (/Lettre de mission/i.test(cond.text)) {
      return lmOk
        ? { ...cond, check: "wait", badge: { kind: "text", label: "Signée", bg: "ivory" } }
        : cond;
    }
    if (/Règlement des honoraires/i.test(cond.text)) {
      return paid ? { ...cond, badge: { kind: "pay", label: "Reçu" } } : cond;
    }
    return cond;
  });

  return { conditions, remplies: [derOk, kycOk, lmOk, paid].filter(Boolean).length };
}

const BODY_FALLBACK: FicheConformiteBody = {
  docCards: DOC_CARDS,
  conditions: CONDITIONS,
  conditionsSub: CONDITIONS_SUB,
  conditionsCount: ACTION_BAR.conditionsCount,
  payBanner: PAY_BANNER,
  realData: false,
};

/**
 * Corps RÉEL de la fiche conformité (cartes documents + conditions) dérivé des
 * pièces de conformité et souscriptions du dossier. Repli sur les constantes de
 * la maquette quand Supabase n'est pas configuré, la session manque, ou l'id
 * n'est pas un dossier réel du cabinet portant des pièces de conformité.
 */
export async function getFicheConformiteBody(id: string): Promise<FicheConformiteBody> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return BODY_FALLBACK;
  if (!UUID_RE.test(id)) return BODY_FALLBACK;

  try {
    const ctx = await getSessionContext();
    if (!ctx) return BODY_FALLBACK;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          conformite_items ( type, status, sent_at, signed_at, validated_at ),
          souscriptions ( status, subscription_date )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return BODY_FALLBACK;

    const row = data as unknown as {
      conformite_items: RawConfItem[] | null;
      souscriptions: RawSousc[] | null;
    };
    const items = row.conformite_items ?? [];
    if (items.length === 0) return BODY_FALLBACK;

    const souscriptions = row.souscriptions ?? [];
    const paid = souscriptions.some((s) => s.status === "active" || s.status === "signed");
    const paidDate = souscriptions.find(
      (s) => s.status === "active" || s.status === "signed",
    )?.subscription_date;

    const { conditions, remplies } = conditionsFromState(items, paid);

    return {
      docCards: docCardsFromItems(items),
      conditions,
      conditionsSub: `${remplies} condition${remplies > 1 ? "s" : ""} sur 4 remplie${
        remplies > 1 ? "s" : ""
      } · le passage à l'étape 03 ouvre l'espace sécurisé client pour collecter les pièces patrimoniales détaillées.`,
      conditionsCount: `${remplies}/4 conditions remplies`,
      payBanner: paid
        ? {
            ...PAY_BANNER,
            statusInline: "reçu",
            pill: "Reçu",
            meta: paidDate
              ? `Règlement reçu le ${fmtConfDate(paidDate)} · synchronisation bancaire active`
              : PAY_BANNER.meta,
          }
        : PAY_BANNER,
      realData: true,
    };
  } catch {
    return BODY_FALLBACK;
  }
}
