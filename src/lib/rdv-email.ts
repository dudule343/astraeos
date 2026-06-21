// Gabarit d'e-mail de confirmation de rendez-vous, envoyé au client à la création
// du RDV depuis la modale « Nouveau rendez-vous » de l'agenda ingénieur. Reprend
// la charte PRIVEOS de visio-email / collecte-email (tables + styles inline pour
// la compatibilité clients mail). Contient : le message du conseiller, un
// récapitulatif du RDV, le lien visio si applicable, et la liste des documents
// à compléter avant l'entretien.

type BuildRdvConfirmationArgs = {
  prenomNom: string;
  typeLabel: string;
  dateLabel: string;
  heure: string;
  duree: string;
  lieu: string;
  joinUrl?: string | null;
  documents: string[];
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

export function buildRdvConfirmationEmail({
  prenomNom,
  typeLabel,
  dateLabel,
  heure,
  duree,
  lieu,
  joinUrl,
  documents,
  message,
}: BuildRdvConfirmationArgs): { subject: string; html: string } {
  const subject = `PRIVEOS · Confirmation de votre rendez-vous · ${dateLabel}`;

  const intro =
    message && message.trim()
      ? escapeHtml(message.trim()).replace(/\r?\n/g, "<br>")
      : `Je vous confirme notre prochain rendez-vous. Vous trouverez ci-dessous le récapitulatif et les documents à compléter pour le préparer.`;

  const recapRow = (label: string, value: string) => `
    <tr>
      <td style="padding:4px 0;color:#8B96A8;font-size:13px;font-family:'Epilogue',Helvetica,Arial,sans-serif;width:120px;">${escapeHtml(label)}</td>
      <td style="padding:4px 0;color:${NAVY};font-size:14px;font-weight:600;font-family:'Epilogue',Helvetica,Arial,sans-serif;">${escapeHtml(value)}</td>
    </tr>`;

  const docsList = documents.length
    ? `
        <tr><td style="padding:8px 36px 0 36px;">
          <div style="color:${NAVY};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Documents à compléter</div>
        </td></tr>
        <tr><td style="padding:8px 36px 4px 36px;">
          ${documents
            .map(
              (d) =>
                `<div style="margin:0 0 6px 0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">• ${escapeHtml(
                  d,
                )}</div>`,
            )
            .join("")}
        </td></tr>`
    : "";

  const joinButton = joinUrl
    ? `
        <tr><td align="center" style="padding:20px 36px 4px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background-color:${GOLD};border-radius:6px;">
              <a href="${escapeHtml(joinUrl)}" target="_blank" style="display:inline-block;padding:14px 32px;color:${NAVY};font-size:16px;font-weight:600;text-decoration:none;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Rejoindre la visioconférence</a>
            </td>
          </tr></table>
        </td></tr>`
    : "";

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
        <div style="color:${GOLD};font-size:13px;letter-spacing:3px;text-transform:uppercase;font-family:'Epilogue',Helvetica,Arial,sans-serif;">PRIVEOS</div>
        <div style="color:#FFFFFF;font-size:22px;line-height:30px;margin-top:6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;">Confirmation de votre rendez-vous</div>
      </td></tr>
      <tr><td style="padding:32px 36px 8px 36px;">
        <p style="margin:0 0 16px 0;color:${NAVY};font-size:16px;line-height:24px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bonjour ${escapeHtml(
          prenomNom,
        )},</p>
        <p style="margin:0 0 8px 0;color:#33425A;font-size:15px;line-height:24px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">${intro}</p>
      </td></tr>
      <tr><td style="padding:12px 36px 0 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${IVORY};border-radius:8px;">
          <tr><td style="padding:16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${recapRow("Type", typeLabel)}
              ${recapRow("Date", dateLabel)}
              ${recapRow("Heure", `${heure} · ${duree}`)}
              ${recapRow("Lieu", lieu)}
            </table>
          </td></tr>
        </table>
      </td></tr>
      ${joinButton}
      ${docsList}
      <tr><td style="border-top:1px solid #ECE7DC;padding:24px 36px;margin-top:16px;">
        <p style="margin:0;color:#33425A;font-size:14px;line-height:22px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Bien à vous,<br><strong style="color:${NAVY};">Votre conseiller PRIVEOS</strong></p>
      </td></tr>
    </table>
    <p style="margin:18px 0 0 0;color:#A7AEBB;font-size:11px;line-height:16px;font-family:'Epilogue',Helvetica,Arial,sans-serif;">Vos données restent strictement confidentielles.</p>
  </td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
