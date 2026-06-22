// Gabarit d'e-mail de collecte aux couleurs ASTRAEOS.
// HTML robuste : tables, styles inline, max-width 560 — lisible Gmail / Apple Mail.

type CollecteItem = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
};

type BuildCollecteEmailArgs = {
  prenomNom: string;
  items: CollecteItem[];
  depotUrl: string;
  message?: string;
  /** "rappel" adapte objet + intro pour une relance ; défaut = invitation initiale. */
  variant?: "initial" | "rappel";
};

const NAVY = "#0B1C35";
const GOLD = "#C8A55C";
const IVORY = "#FAF7F0";

/** Échappe le HTML pour éviter toute injection dans le gabarit. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCollecteEmail({
  prenomNom,
  items,
  depotUrl,
  message,
  variant = "initial",
}: BuildCollecteEmailArgs): { subject: string; html: string } {
  const isRappel = variant === "rappel";
  const subject = isRappel
    ? "ASTRAEOS · Rappel · Documents en attente pour votre étude patrimoniale"
    : "ASTRAEOS · Documents nécessaires à votre étude patrimoniale";

  const MAX_LISTED = 6;
  const listed = items.slice(0, MAX_LISTED);
  const remaining = items.length - listed.length;

  const listRows = listed
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 0;vertical-align:top;color:${GOLD};font-size:15px;line-height:22px;">•</td>
          <td style="padding:6px 0 6px 10px;color:${NAVY};font-size:15px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">${escapeHtml(
            item.label,
          )}</td>
        </tr>`,
    )
    .join("");

  const remainingRow =
    remaining > 0
      ? `
        <tr>
          <td></td>
          <td style="padding:6px 0 6px 10px;color:#6B7280;font-size:14px;line-height:22px;font-style:italic;font-family:'Epilogue',Helvetica,Arial,sans-serif;">et ${remaining} autre${
          remaining > 1 ? "s" : ""
        } élément${remaining > 1 ? "s" : ""}…</td>
        </tr>`
      : "";

  const defaultIntro = isRappel
    ? `Madame, Monsieur,<br><br>Sauf erreur de notre part, certaines pièces nécessaires à votre étude patrimoniale ne nous sont pas encore parvenues. Nous nous permettons de vous adresser ce rappel et vous invitons à les déposer via votre espace sécurisé. Le dépôt est chiffré et réservé à votre conseiller.`
    : `Madame, Monsieur,<br><br>Afin de finaliser votre étude patrimoniale, nous vous invitons à déposer les pièces ci-dessous via votre espace sécurisé. Le dépôt est chiffré et réservé à votre conseiller.`;

  const intro =
    message && message.trim()
      ? escapeHtml(message.trim()).replace(/\r?\n/g, "<br>")
      : defaultIntro;

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
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background-color:${NAVY};padding:28px 36px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:30px;height:30px;background-color:${GOLD};border-radius:7px;text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:17px;color:${NAVY};">A</td><td style="padding-left:10px;color:${GOLD};font-size:16px;letter-spacing:3px;font-family:'Epilogue',Helvetica,Arial,sans-serif;font-weight:600;vertical-align:middle;">ASTRAEOS</td></tr></table>
            <div style="color:#FFFFFF;font-size:22px;line-height:30px;margin-top:6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;">Votre étude patrimoniale</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px 8px 36px;">
            <p style="margin:0 0 16px 0;color:${NAVY};font-size:16px;line-height:24px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bonjour ${escapeHtml(
              prenomNom,
            )},</p>
            <p style="margin:0 0 8px 0;color:#33425A;font-size:15px;line-height:24px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">${intro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 36px 8px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${IVORY};border-radius:6px;">
              <tr>
                <td style="padding:18px 20px;">
                  <div style="color:${NAVY};font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Éléments demandés</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${listRows}
                    ${remainingRow}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:28px 36px 8px 36px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${GOLD};border-radius:6px;">
                  <a href="${depotUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:${NAVY};font-size:16px;font-weight:600;text-decoration:none;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Déposer mes documents</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 36px 28px 36px;">
            <p style="margin:12px 0 0 0;color:#8B96A8;font-size:12px;line-height:18px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Si le bouton ne fonctionne pas, copiez ce lien :<br><span style="color:${NAVY};">${escapeHtml(
              depotUrl,
            )}</span></p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #ECE7DC;padding:24px 36px;">
            <p style="margin:0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bien à vous,<br><strong style="color:${NAVY};">L'équipe ASTRAEOS</strong></p>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0 0;color:#A7AEBB;font-size:11px;line-height:16px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Cet e-mail vous est adressé dans le cadre de votre étude patrimoniale. Vos données restent strictement confidentielles.</p>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html };
}
