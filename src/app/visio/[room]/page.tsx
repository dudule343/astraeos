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
};

/** Salle Jitsi : on n'accepte que des identifiants alphanumériques + tirets,
 *  bornés, pour ne jamais injecter de caractère douteux dans l'URL de l'iframe. */
function sanitizeRoom(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
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
  const { role, prospect, nom, tool, lien } = await searchParams;

  const safeRoom = sanitizeRoom(room ?? "");
  const safeRole = sanitizeRole(role);
  const safeProspect = sanitizeSlug(prospect);
  const safeNom = sanitizeNom(nom);
  const safeTool = sanitizeTool(tool);
  const safeLien = sanitizeLien(lien, safeTool);
  // Un lien invalide invalide l'outil : pas de mode compagnon sans destination.
  const companionTool = safeLien ? safeTool : "";

  let src = `/wireframes/visio.html?room=${encodeURIComponent(safeRoom)}&role=${safeRole}`;
  if (safeProspect) src += `&prospect=${encodeURIComponent(safeProspect)}`;
  if (safeNom) src += `&nom=${encodeURIComponent(safeNom)}`;
  if (companionTool) {
    src += `&tool=${companionTool}&lien=${encodeURIComponent(safeLien)}`;
  }
  // Transport Realtime de la transcription (canal par salle) : on passe l'URL
  // Supabase + la clé anon (toutes deux publiques) au wireframe statique, qui
  // ne reçoit pas les variables NEXT_PUBLIC_* à la compilation.
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (sbUrl && sbKey) {
    src += `&sb=${encodeURIComponent(sbUrl)}&sbk=${encodeURIComponent(sbKey)}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <iframe
        src={src}
        title="Visio PRIVEOS"
        allow="microphone; camera; display-capture"
        className="block w-full flex-1 border-0"
        style={{ height: "100vh" }}
      />
    </div>
  );
}
