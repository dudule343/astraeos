// Gabarit d'e-mail d'invitation à un entretien visio, aux couleurs PRIVEOS.
// HTML robuste (tables + styles inline), même charte que collecte-email.

type BuildVisioInviteArgs = {
  prenomNom: string;
  joinUrl: string;
  message?: string;
};

const NAVY = "#0B1C35";
const GOLD = "#C8A55C";
const IVORY = "#FAF7F0";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildVisioInviteEmail({
  prenomNom,
  joinUrl,
  message,
}: BuildVisioInviteArgs): { subject: string; html: string } {
  const subject = "PRIVEOS · Votre rendez-vous en visioconférence";

  const intro =
    message && message.trim()
      ? escapeHtml(message.trim()).replace(/\r?\n/g, "<br>")
      : `Votre conseiller vous invite à un entretien patrimonial en visioconférence. Au moment du rendez-vous, cliquez simplement sur le bouton ci-dessous depuis votre ordinateur ou votre téléphone — aucune installation n'est nécessaire.`;

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
            <div style="color:${GOLD};font-size:13px;letter-spacing:3px;text-transform:uppercase;font-family:'Epilogue',Helvetica,Arial,sans-serif;">PRIVEOS</div>
            <div style="color:#FFFFFF;font-size:22px;line-height:30px;margin-top:6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;">Votre rendez-vous en visioconférence</div>
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
          <td align="center" style="padding:28px 36px 8px 36px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${GOLD};border-radius:6px;">
                  <a href="${escapeHtml(joinUrl)}" target="_blank" style="display:inline-block;padding:14px 32px;color:${NAVY};font-size:16px;font-weight:600;text-decoration:none;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Rejoindre l'entretien</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 36px 28px 36px;">
            <p style="margin:12px 0 0 0;color:#8B96A8;font-size:12px;line-height:18px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Si le bouton ne fonctionne pas, copiez ce lien :<br><span style="color:${NAVY};">${escapeHtml(
              joinUrl,
            )}</span></p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #ECE7DC;padding:24px 36px;">
            <p style="margin:0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bien à vous,<br><strong style="color:${NAVY};">L'équipe PRIVEOS</strong></p>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0 0;color:#A7AEBB;font-size:11px;line-height:16px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">La session est privée et réservée à vous et votre conseiller. Vos données restent strictement confidentielles.</p>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html };
}
