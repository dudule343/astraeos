// E-mail de confirmation envoyé au prospect après chaque soumission d'une étape
// du parcours (DCI complet, DCI simplifié, questionnaire de risque, dépôt de
// pièces). Confirme l'étape réalisée et liste les liens des étapes RESTANTES.
// Notifie aussi l'ingénieur (RDV_NOTIFY_EMAIL). Best-effort : ne throw jamais.
//
// L'e-mail du prospect est retrouvé depuis sa soumission RDV (kind='rdv',
// payload.email). Sans e-mail connu ou sans clé Resend → { sent:false, to:null }.

import { loadSubmissions } from "@/lib/dci-store";

export type ParcoursStep = "complet" | "simple" | "qualification" | "documents";

const NAVY = "#0B1C35";
const GOLD = "#C8A55C";
const IVORY = "#FAF7F0";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Libellé FR de l'étape réalisée (confirmation).
const STEP_DONE_LABEL: Record<ParcoursStep, string> = {
  complet: "votre document de collecte (DCI)",
  simple: "votre DCI simplifié",
  qualification: "votre questionnaire de risque",
  documents: "vos pièces justificatives",
};

// Étapes proposées en « prochaines étapes » (avec lien). On n'y met pas le DCI
// simplifié : c'est l'écran d'avant-entretien, pas une étape restante à relancer.
type NextStep = { step: Exclude<ParcoursStep, "simple">; label: string; path: string };

const NEXT_STEPS: NextStep[] = [
  { step: "complet", label: "Compléter mon document de collecte (DCI)", path: "/parcours/dci-complet" },
  { step: "qualification", label: "Compléter mon questionnaire de risque", path: "/parcours/qualification" },
  { step: "documents", label: "Déposer mes pièces justificatives", path: "/parcours/documents" },
];

function canonicalOrigin(): string {
  const env = process.env.ASTRAEOS_PUBLIC_ORIGIN?.trim();
  return (env || "https://app.astraeos.fr").replace(/\/+$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stepUrl(path: string, prospectSlug: string, displayName: string): string {
  return `${canonicalOrigin()}${path}?prospect=${encodeURIComponent(
    prospectSlug,
  )}&name=${encodeURIComponent(displayName)}`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  if (!apiKey) return false;
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

function buildHtml(opts: {
  displayName: string;
  prospectSlug: string;
  stepDone: ParcoursStep;
}): { subject: string; html: string } {
  const subject = "ASTRAEOS · Bien reçu, votre étape est enregistrée";
  const doneLabel = STEP_DONE_LABEL[opts.stepDone];

  // Étapes restantes : tout NEXT_STEPS sauf celle qu'on vient de réaliser.
  const remaining = NEXT_STEPS.filter((s) => s.step !== opts.stepDone);

  const button = (url: string, label: string) => `
        <tr><td align="center" style="padding:10px 36px 0 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background-color:${GOLD};border-radius:6px;">
              <a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:13px 30px;color:${NAVY};font-size:15px;font-weight:600;text-decoration:none;font-family:'Epilogue',Helvetica,Arial,sans-serif;">${escapeHtml(
                label,
              )}</a>
            </td>
          </tr></table>
        </td></tr>`;

  const nextBlock = remaining.length
    ? `
      <tr><td style="padding:20px 36px 0 36px;">
        <div style="color:${NAVY};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Prochaines étapes</div>
        <p style="margin:6px 0 0 0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Il vous reste à compléter les étapes suivantes pour préparer votre dossier.</p>
      </td></tr>
      ${remaining
        .map((s) => button(stepUrl(s.path, opts.prospectSlug, opts.displayName), s.label))
        .join("")}`
    : `
      <tr><td style="padding:20px 36px 0 36px;">
        <p style="margin:0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Toutes les étapes de votre parcours sont désormais complétées. Votre conseiller revient vers vous très prochainement.</p>
      </td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${IVORY};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${IVORY};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
      <tr><td style="background-color:${NAVY};padding:28px 36px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:30px;height:30px;background-color:${GOLD};border-radius:7px;text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:17px;color:${NAVY};">A</td><td style="padding-left:10px;color:${GOLD};font-size:16px;letter-spacing:3px;font-family:'Epilogue',Helvetica,Arial,sans-serif;font-weight:600;vertical-align:middle;">ASTRAEOS</td></tr></table>
        <div style="color:#FFFFFF;font-size:22px;line-height:30px;margin-top:6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;">Bien reçu</div>
      </td></tr>
      <tr><td style="padding:32px 36px 8px 36px;">
        <p style="margin:0 0 16px 0;color:${NAVY};font-size:16px;line-height:24px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bonjour ${escapeHtml(
          opts.displayName,
        )},</p>
        <p style="margin:0 0 8px 0;color:#33425A;font-size:15px;line-height:24px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Nous avons bien reçu ${escapeHtml(
          doneLabel,
        )}. Merci, cette étape est enregistrée dans votre dossier.</p>
      </td></tr>
      ${nextBlock}
      <tr><td style="border-top:1px solid #ECE7DC;padding:24px 36px;margin-top:16px;">
        <p style="margin:0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bien à vous,<br><strong style="color:${NAVY};">L'équipe ASTRAEOS · Astraeos</strong></p>
      </td></tr>
    </table>
    <p style="margin:18px 0 0 0;color:#A7AEBB;font-size:11px;line-height:16px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Vos données restent strictement confidentielles.</p>
  </td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}

/**
 * Confirme au prospect l'étape qu'il vient de réaliser et lui rappelle les liens
 * des étapes restantes ; notifie l'ingénieur. Best-effort : ne throw jamais.
 */
export async function sendParcoursConfirmation(opts: {
  prospectSlug: string;
  displayName: string;
  stepDone: ParcoursStep;
}): Promise<{ sent: boolean; to: string | null }> {
  try {
    const { submissions } = await loadSubmissions(opts.prospectSlug);
    const rdv = submissions.rdv;
    const rawEmail = rdv?.payload?.email;
    const to = typeof rawEmail === "string" ? rawEmail.trim() : "";
    if (!to || !EMAIL_RE.test(to)) return { sent: false, to: null };

    const { subject, html } = buildHtml({
      displayName: opts.displayName,
      prospectSlug: opts.prospectSlug,
      stepDone: opts.stepDone,
    });
    const sent = await sendEmail(to, subject, html);

    // Notification courte à l'ingénieur (best-effort, indépendante du retour).
    const notify = process.env.RDV_NOTIFY_EMAIL?.trim();
    if (notify && EMAIL_RE.test(notify)) {
      const doneLabel = STEP_DONE_LABEL[opts.stepDone];
      const notifyHtml = `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:24px;background-color:${IVORY};font-family:'Epilogue',Helvetica,Arial,sans-serif;color:${NAVY};">
<p style="margin:0 0 8px 0;font-size:15px;">Le prospect <strong>${escapeHtml(
        opts.displayName,
      )}</strong> a complété : ${escapeHtml(doneLabel)}.</p>
<p style="margin:0;font-size:13px;color:#33425A;">Soumission visible dans votre espace prospects.</p>
</body></html>`;
      await sendEmail(
        notify,
        `ASTRAEOS · Étape complétée · ${opts.displayName}`,
        notifyHtml,
      );
    }

    return { sent, to: sent ? to : null };
  } catch {
    return { sent: false, to: null };
  }
}
