import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Analyse IA d'un dépôt (BYOK).
 * Le cabinet a branché sa propre clé Anthropic via /api/ia-settings.
 * On n'analyse que les FICHIERS (PDF / images) : un dépôt texte est ignoré.
 * L'appel se fait en REST (pas de SDK npm). Tout est silencieux : aucune erreur
 * ne doit remonter jusqu'au client qui dépose ses pièces.
 */

const BUCKET = "depots";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export const ALLOWED_MODELS = ["claude-haiku-4-5", "claude-sonnet-4-6"] as const;
export const DEFAULT_MODEL = "claude-haiku-4-5";

type AnalyseStatus =
  | "conforme"
  | "incoherence"
  | "illisible"
  | "erreur"
  | "en_cours";

type Item = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
};

type Depot = {
  item_index: number;
  label: string;
  file_name: string | null;
  mime: string | null;
  storage_path: string | null;
  reponse: string | null;
};

type IaResult = {
  status: Exclude<AnalyseStatus, "erreur" | "en_cours">;
  resume: string;
  detail: string;
};

/** Convertit un ArrayBuffer en base64 sans dépasser la pile d'appels. */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}

/** Extrait le premier objet JSON { ... } d'une réponse texte du modèle. */
function extractJson(text: string): IaResult | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        try {
          const parsed = JSON.parse(slice) as Partial<IaResult>;
          const status = parsed.status;
          if (
            status === "conforme" ||
            status === "incoherence" ||
            status === "illisible"
          ) {
            return {
              status,
              resume: String(parsed.resume ?? ""),
              detail: String(parsed.detail ?? ""),
            };
          }
        } catch {
          return null;
        }
        return null;
      }
    }
  }
  return null;
}

type AnalysePayload = {
  status: AnalyseStatus;
  resume?: string | null;
  detail?: string | null;
  model?: string | null;
};

async function upsertAnalyse(
  supabase: ReturnType<typeof createAdminClient>,
  collecteId: string,
  itemIndex: number,
  payload: AnalysePayload,
) {
  await supabase.from("collecte_analyses").upsert(
    {
      collecte_id: collecteId,
      item_index: itemIndex,
      status: payload.status,
      resume: payload.resume ?? null,
      detail: payload.detail ?? null,
      model: payload.model ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "collecte_id,item_index" },
  );
}

/** Décrit les réponses déclarées par le client (items de type Question). */
function buildDeclarations(structure: Item[], depots: Depot[]): string {
  const byIndex = new Map<number, Depot>();
  depots.forEach((d) => byIndex.set(d.item_index, d));
  const lines: string[] = [];
  structure.forEach((it, idx) => {
    const dp = byIndex.get(idx);
    if (dp && dp.reponse && dp.reponse.trim()) {
      lines.push(`- ${it.label} : ${dp.reponse.trim()}`);
    }
  });
  return lines.length ? lines.join("\n") : "(aucune information déclarée)";
}

export async function analyserDepot({
  collecteId,
  itemIndex,
}: {
  collecteId: string;
  itemIndex: number;
}): Promise<void> {
  const supabase = createAdminClient();

  // 1. Clé IA. Si pas branchée, on ne crée rien du tout : return silencieux.
  const { data: settings } = await supabase
    .from("ia_settings")
    .select("api_key, model")
    .limit(1)
    .maybeSingle();

  if (!settings || !settings.api_key) return;

  const apiKey = settings.api_key as string;
  const model = (settings.model as string) || DEFAULT_MODEL;

  // 2. Le dépôt visé.
  const { data: depot } = await supabase
    .from("collecte_depots")
    .select("item_index, label, file_name, mime, storage_path, reponse")
    .eq("collecte_id", collecteId)
    .eq("item_index", itemIndex)
    .maybeSingle();

  if (!depot) return;
  // v1 : on n'analyse que les fichiers. Dépôt texte → on ne fait rien.
  if (!depot.storage_path || !depot.file_name) return;

  // 3. Contexte : collecte + structure + autres réponses déclarées.
  const [{ data: collecte }, { data: depotsData }] = await Promise.all([
    supabase
      .from("collectes")
      .select("client_nom, structure")
      .eq("id", collecteId)
      .maybeSingle(),
    supabase
      .from("collecte_depots")
      .select("item_index, label, file_name, mime, storage_path, reponse")
      .eq("collecte_id", collecteId),
  ]);

  if (!collecte) return;

  const structure: Item[] = Array.isArray(collecte.structure)
    ? (collecte.structure as Item[])
    : [];
  const allDepots: Depot[] = (depotsData ?? []) as Depot[];
  const item = structure[itemIndex] ?? { label: depot.label };
  const theme = item.theme || "Pièces demandées";
  const clientNom = collecte.client_nom || "le client";
  const declarations = buildDeclarations(structure, allDepots);

  // 4. Format du fichier. HEIC non analysable → 'illisible' immédiat.
  const mime = (depot.mime || "").toLowerCase();
  const isPdf = mime.includes("pdf");
  const isHeic = mime.includes("heic") || mime.includes("heif");
  const isImage = mime.startsWith("image/");

  // On signale 'en_cours' AVANT tout travail long, pour que l'UI affiche
  // « analyse en cours ».
  await upsertAnalyse(supabase, collecteId, itemIndex, {
    status: "en_cours",
    model,
  });

  if (isHeic) {
    await upsertAnalyse(supabase, collecteId, itemIndex, {
      status: "illisible",
      resume: "Format HEIC non analysable, demander un PDF/JPG",
      detail:
        "Le fichier est au format HEIC, que l'analyse automatique ne sait pas lire. Demander au client de le renvoyer en PDF ou JPG.",
      model,
    });
    return;
  }

  if (!isPdf && !isImage) {
    await upsertAnalyse(supabase, collecteId, itemIndex, {
      status: "illisible",
      resume: "Format de fichier non analysable",
      detail: `Le type de fichier (${depot.mime || "inconnu"}) n'est pas exploitable par l'analyse automatique.`,
      model,
    });
    return;
  }

  // 5. Téléchargement du fichier depuis le storage.
  const { data: blob, error: dlError } = await supabase.storage
    .from(BUCKET)
    .download(depot.storage_path);

  if (dlError || !blob) {
    await upsertAnalyse(supabase, collecteId, itemIndex, {
      status: "erreur",
      resume: "Fichier introuvable dans le stockage",
      detail: dlError?.message ?? "Le téléchargement du document a échoué.",
      model,
    });
    return;
  }

  let base64: string;
  try {
    base64 = toBase64(await blob.arrayBuffer());
  } catch {
    await upsertAnalyse(supabase, collecteId, itemIndex, {
      status: "erreur",
      resume: "Lecture du fichier impossible",
      detail: "Le document n'a pas pu être encodé pour l'analyse.",
      model,
    });
    return;
  }

  // 6. Construction du bloc de contenu (document PDF ou image).
  const mediaType = isPdf
    ? "application/pdf"
    : mime === "image/png"
      ? "image/png"
      : "image/jpeg";

  const fileBlock = isPdf
    ? {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      }
    : {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64,
        },
      };

  const systemPrompt =
    "Tu es l'assistant conformité d'un cabinet patrimonial. " +
    "Tu analyses les pièces déposées par les clients avec rigueur et factualité. " +
    "Tu réponds UNIQUEMENT en JSON, sans aucun texte autour.";

  const userPrompt =
    `Document attendu : ${item.label} (thème ${theme}) pour le client ${clientNom}.\n` +
    `Autres informations déclarées par le client :\n${declarations}\n\n` +
    "Analyse le document fourni :\n" +
    "1) Le document correspond-il à ce qui est demandé ?\n" +
    "2) Est-il lisible, complet et non expiré ?\n" +
    "3) Y a-t-il des incohérences avec les informations déclarées ?\n\n" +
    'Réponds UNIQUEMENT en JSON : {"status":"conforme"|"incoherence"|"illisible","resume":"une phrase","detail":"2-4 phrases factuelles"}.';

  // 7. Appel Anthropic en REST.
  let result: IaResult | null = null;
  try {
    const resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [fileBlock, { type: "text", text: userPrompt }],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      await upsertAnalyse(supabase, collecteId, itemIndex, {
        status: "erreur",
        resume: "Analyse IA indisponible",
        detail: `L'appel au modèle a échoué (HTTP ${resp.status}). ${msg.slice(0, 200)}`.trim(),
        model,
      });
      return;
    }

    const data = (await resp.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("\n");
    result = extractJson(text);
  } catch (err) {
    await upsertAnalyse(supabase, collecteId, itemIndex, {
      status: "erreur",
      resume: "Analyse IA indisponible",
      detail: err instanceof Error ? err.message : "Erreur réseau lors de l'appel au modèle.",
      model,
    });
    return;
  }

  if (!result) {
    await upsertAnalyse(supabase, collecteId, itemIndex, {
      status: "erreur",
      resume: "Réponse IA illisible",
      detail: "Le modèle n'a pas renvoyé de verdict exploitable.",
      model,
    });
    return;
  }

  // 8. Verdict final.
  await upsertAnalyse(supabase, collecteId, itemIndex, {
    status: result.status,
    resume: result.resume || null,
    detail: result.detail || null,
    model,
  });
}
