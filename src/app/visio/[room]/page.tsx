export const metadata = {
  title: "PRIVEOS · Visio",
};

type Params = { room: string };
type SearchParams = { role?: string; prospect?: string; nom?: string };

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

export default async function VisioRoomPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { room } = await params;
  const { role, prospect, nom } = await searchParams;

  const safeRoom = sanitizeRoom(room ?? "");
  const safeRole = sanitizeRole(role);
  const safeProspect = sanitizeSlug(prospect);
  const safeNom = sanitizeNom(nom);

  let src = `/wireframes/visio.html?room=${encodeURIComponent(safeRoom)}&role=${safeRole}`;
  if (safeProspect) src += `&prospect=${encodeURIComponent(safeProspect)}`;
  if (safeNom) src += `&nom=${encodeURIComponent(safeNom)}`;

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
