/**
 * Client REST Yousign minimal (BYOK par variable d'environnement).
 *
 * Signature électronique en mode « apporter sa propre clé » : aucune table, aucune
 * migration. La clé est lue dans process.env.YOUSIGN_API_KEY. Si elle est absente,
 * les fonctions renvoient { ok:false, reason:"yousign_non_configure" } SANS lever
 * d'exception — l'appelant dégrade gracieusement.
 *
 * API v3 Yousign : on crée une « signature request », on y attache un document,
 * on déclare un signataire, puis on active la requête. L'URL de base est
 * surchargeable via YOUSIGN_BASE_URL (sandbox vs production).
 *
 * Docs : https://developers.yousign.com (Signature Requests / Documents / Signers).
 */

export type YousignFailure = {
  ok: false;
  /** "yousign_non_configure" si la clé manque, sinon message d'erreur API. */
  reason: string;
};

export type YousignSuccess = {
  ok: true;
  /** id de la signature request créée et activée. */
  signatureRequestId: string;
  /** id du document attaché. */
  documentId: string;
  /** Statut renvoyé par Yousign (typiquement "ongoing" après activation). */
  status: string;
};

export type YousignResult = YousignSuccess | YousignFailure;

/** La signature électronique est-elle configurée (clé présente) ? */
export function isYousignConfigured(): boolean {
  return Boolean(process.env.YOUSIGN_API_KEY?.trim());
}

function baseUrl(): string {
  // Sandbox par défaut : évite d'engager des envois réels sans configuration explicite.
  return (process.env.YOUSIGN_BASE_URL?.trim() || "https://api-sandbox.yousign.app/v3").replace(
    /\/$/,
    "",
  );
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.YOUSIGN_API_KEY?.trim() ?? ""}`,
    "Content-Type": "application/json",
  };
}

async function readError(resp: Response): Promise<string> {
  try {
    const body = (await resp.json()) as { detail?: string; message?: string; error?: string };
    return body.detail || body.message || body.error || `Yousign HTTP ${resp.status}`;
  } catch {
    return `Yousign HTTP ${resp.status}`;
  }
}

export type YousignSigner = {
  firstName: string;
  lastName: string;
  email: string;
  /** Numéro au format E.164 (ex: +33600000000), requis si niveau OTP SMS. */
  phone?: string | null;
};

export type SendForSignatureInput = {
  /** Le PDF à signer (sortie de conformite-pdf). */
  pdf: Uint8Array;
  /** Nom de fichier présenté dans Yousign (« DER.pdf »). */
  fileName: string;
  /** Nom de la procédure côté Yousign. */
  requestName: string;
  signer: YousignSigner;
};

/**
 * Crée une signature request Yousign à partir d'un PDF et l'active.
 *
 * Flux v3 :
 *  1. POST /signature_requests           → crée le brouillon (delivery_mode: email)
 *  2. POST /signature_requests/:id/documents (multipart) → attache le PDF
 *  3. POST /signature_requests/:id/signers → déclare le signataire + champ signature
 *  4. POST /signature_requests/:id/activate → envoie l'e-mail de signature
 *
 * Renvoie { ok:false, reason:"yousign_non_configure" } si la clé manque, ou un
 * message d'erreur clair si une étape échoue. Ne lève jamais d'exception.
 */
export async function sendPdfForSignature(input: SendForSignatureInput): Promise<YousignResult> {
  if (!isYousignConfigured()) {
    return { ok: false, reason: "yousign_non_configure" };
  }

  const base = baseUrl();

  try {
    // 1. Brouillon de signature request.
    const draftResp = await fetch(`${base}/signature_requests`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: input.requestName,
        delivery_mode: "email",
        timezone: "Europe/Paris",
      }),
    });
    if (!draftResp.ok) return { ok: false, reason: await readError(draftResp) };
    const draft = (await draftResp.json()) as { id?: string };
    if (!draft.id) return { ok: false, reason: "Yousign : identifiant de requête manquant" };
    const signatureRequestId = draft.id;

    // 2. Attache le document (multipart/form-data — pas de Content-Type JSON ici).
    const form = new FormData();
    form.append("nature", "signable_document");
    form.append("parse_anchors", "true");
    form.append(
      "file",
      new Blob([new Uint8Array(input.pdf)], { type: "application/pdf" }),
      input.fileName,
    );
    const docResp = await fetch(`${base}/signature_requests/${signatureRequestId}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.YOUSIGN_API_KEY?.trim() ?? ""}` },
      body: form,
    });
    if (!docResp.ok) return { ok: false, reason: await readError(docResp) };
    const docJson = (await docResp.json()) as { id?: string };
    if (!docJson.id) return { ok: false, reason: "Yousign : identifiant de document manquant" };
    const documentId = docJson.id;

    // 3. Déclare le signataire et place un champ de signature en bas de page 1.
    const signerResp = await fetch(`${base}/signature_requests/${signatureRequestId}/signers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        info: {
          first_name: input.signer.firstName || "Client",
          last_name: input.signer.lastName || "Client",
          email: input.signer.email,
          ...(input.signer.phone ? { phone_number: input.signer.phone } : {}),
          locale: "fr",
        },
        signature_level: "electronic_signature",
        signature_authentication_mode: input.signer.phone ? "otp_sms" : "no_otp",
        fields: [
          {
            document_id: documentId,
            type: "signature",
            page: 1,
            x: 80,
            y: 700,
            width: 180,
            height: 60,
          },
        ],
      }),
    });
    if (!signerResp.ok) return { ok: false, reason: await readError(signerResp) };

    // 4. Active la requête : déclenche l'envoi de l'e-mail de signature au client.
    const activateResp = await fetch(
      `${base}/signature_requests/${signatureRequestId}/activate`,
      { method: "POST", headers: authHeaders() },
    );
    if (!activateResp.ok) return { ok: false, reason: await readError(activateResp) };
    const activated = (await activateResp.json()) as { status?: string };

    return {
      ok: true,
      signatureRequestId,
      documentId,
      status: activated.status ?? "ongoing",
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Échec de l'appel Yousign",
    };
  }
}
