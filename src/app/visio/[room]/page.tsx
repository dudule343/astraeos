import { Cockpit } from "./_cockpit/Cockpit";

export const metadata = {
  title: "PRIVEOS · Visio",
};

type Params = { room: string };
type SearchParams = {
  role?: string;
  prospect?: string;
  nom?: string;
  tool?: string;
  lien?: string;
  /** ?ui=react → cockpit React (migration en cours). Défaut : iframe HTML. */
  ui?: string;
};

/** Salle Jitsi : on n'accepte que des identifiants alphanumériques + tirets,
 *  bornés, pour ne jamais injecter de caractère douteux dans l'URL de l'iframe. */
function sanitizeRoom(raw: string): string {
  // Casse canonique minuscule : la salle Jitsi est normalisée en minuscules par
  // Prosody, et le mapping enregistrement→entretien relit en minuscules. Sans ça,
  // /visio/Dupont créait un entretien « Dupont » jamais retrouvé (404 recording).
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64).toLowerCase();
}

function sanitizeRole(raw: string | undefined): "engineer" | "client" {
  return raw === "client" ? "client" : "engineer";
}

/** Slug prospect : [a-z0-9-], borné à 64 chars. */
function sanitizeSlug(raw: string | undefined): string {
  return (raw ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64);
}

/** Nom affichable : borné à 80 chars (l'encodage URL gère l'échappement). */
function sanitizeNom(raw: string | undefined): string {
  return (raw ?? "").trim().slice(0, 80);
}

/** Outil de visio compagnon : seuls "meet" et "zoom" sont propagés ; tout le
 *  reste (y compris absent) signifie « salle PRIVEOS intégrée » → "". */
function sanitizeTool(raw: string | undefined): "" | "meet" | "zoom" {
  return raw === "meet" || raw === "zoom" ? raw : "";
}

/** Lien externe compagnon : http(s) seulement, hostname autorisé selon l'outil
 *  (meet.google.com pour Meet, *.zoom.us pour Zoom), borné à 300 chars.
 *  Retourne "" si invalide ou incohérent avec l'outil → pas de propagation. */
function sanitizeLien(raw: string | undefined, tool: "" | "meet" | "zoom"): string {
  const v = (raw ?? "").trim();
  if (!v || v.length > 300 || !tool) return "";
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return "";
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return "";
  const host = u.hostname.toLowerCase();
  if (tool === "meet" && host !== "meet.google.com") return "";
  if (tool === "zoom" && host !== "zoom.us" && !host.endsWith(".zoom.us")) {
    return "";
  }
  return v;
}

export default async function VisioRoomPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { room } = await params;
  const { role, prospect, nom, tool, lien, ui } = await searchParams;

  const safeRoom = sanitizeRoom(room ?? "");
  const safeRole = sanitizeRole(role);
  const safeProspect = sanitizeSlug(prospect);
  const safeNom = sanitizeNom(nom);
  const safeTool = sanitizeTool(tool);
  const safeLien = sanitizeLien(lien, safeTool);
  // Un lien invalide invalide l'outil : pas de mode compagnon sans destination.
  const companionTool = safeLien ? safeTool : "";

  const sbUrlPublic = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const sbKeyPublic = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Cockpit React (migration en cours) derrière ?ui=react. Par défaut : l'iframe
  // HTML reste servie en prod tant que la version React n'est pas à parité.
  if (ui === "react") {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
        <Cockpit
          params={{
            room: safeRoom,
            role: safeRole,
            prospect: safeProspect,
            nom: safeNom,
            tool: companionTool,
            lien: safeLien,
            sb: sbUrlPublic,
            sbk: sbKeyPublic,
          }}
        />
      </div>
    );
  }

  let src = `/wireframes/visio.html?room=${encodeURIComponent(safeRoom)}&role=${safeRole}`;
  if (safeProspect) src += `&prospect=${encodeURIComponent(safeProspect)}`;
  if (safeNom) src += `&nom=${encodeURIComponent(safeNom)}`;
  if (companionTool) {
    src += `&tool=${companionTool}&lien=${encodeURIComponent(safeLien)}`;
  }
  // Transport Realtime de la transcription (canal par salle) : on passe l'URL
  // Supabase + la clé anon (toutes deux publiques) au wireframe statique, qui
  // ne reçoit pas les variables NEXT_PUBLIC_* à la compilation.
  if (sbUrlPublic && sbKeyPublic) {
    src += `&sb=${encodeURIComponent(sbUrlPublic)}&sbk=${encodeURIComponent(sbKeyPublic)}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <iframe
        src={src}
        title="Visio PRIVEOS"
        // On délègue micro/caméra/partage à TOUTES les origines (`*`), pas
        // seulement `self` : l'API Jitsi crée à l'intérieur une iframe
        // CROSS-ORIGIN (srv1750581.hstgr.cloud). Avec `camera`/`microphone` sans
        // `*`, Chrome bloque caméra+micro dans cette iframe Jitsi (« problème de
        // permission »). display-capture sert au partage d'onglet (transcription
        // compagnon), clipboard-write au lien d'invitation, speaker-selection au
        // choix de sortie audio Jitsi.
        allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; speaker-selection *"
        className="block w-full flex-1 border-0"
        style={{ height: "100vh" }}
      />
    </div>
  );
}
