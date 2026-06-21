// Test réel : envoie à marvin@edilos.fr un e-mail « comme si on était un client »
// avec le lien vers le DCI Complet et la prise de rendez-vous, via Resend.
// À lancer : node --env-file=.env.local scripts/send-test-dci-email.mjs
// (charte PRIVEOS, miroir de src/lib/rdv-email.ts ; harnais de test, pas de prod)

const TO = process.env.TEST_TO || "marvin@edilos.fr";
const ORIGIN = (process.env.ASTRAEOS_PUBLIC_ORIGIN || "https://app.astraeos.fr").replace(/\/+$/, "");
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";

if (!apiKey) {
  console.error("RESEND_API_KEY manquant (lancer avec --env-file=.env.local)");
  process.exit(1);
}

const NAVY = "#0B1C35", GOLD = "#C8A55C", IVORY = "#FAF7F0";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const button = (url, label) => `
  <tr><td align="center" style="padding:14px 36px 4px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background-color:${GOLD};border-radius:6px;">
        <a href="${esc(url)}" target="_blank" style="display:inline-block;padding:14px 32px;color:${NAVY};font-size:16px;font-weight:600;text-decoration:none;font-family:'Epilogue',Helvetica,Arial,sans-serif;">${esc(label)}</a>
      </td></tr></table>
  </td></tr>`;
const recapRow = (l, v) => `<tr><td style="padding:4px 0;color:#8B96A8;font-size:13px;width:130px;font-family:Helvetica,Arial,sans-serif;">${esc(l)}</td><td style="padding:4px 0;color:${NAVY};font-size:14px;font-weight:600;font-family:Helvetica,Arial,sans-serif;">${esc(v)}</td></tr>`;

const dciUrl = `${ORIGIN}/parcours/dci-complet`;
const bookingUrl = `${ORIGIN}/parcours/rendez-vous`;
const subject = "PRIVEOS · Votre DCI à compléter et votre rendez-vous";

const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${IVORY};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${IVORY};">
 <tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:#fff;border-radius:8px;overflow:hidden;">
   <tr><td style="background:${NAVY};padding:28px 36px;">
     <div style="color:${GOLD};font-size:13px;letter-spacing:3px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">PRIVEOS</div>
     <div style="color:#fff;font-size:22px;line-height:30px;margin-top:6px;font-family:Georgia,serif;font-style:italic;">Confirmation de votre rendez-vous</div>
   </td></tr>
   <tr><td style="padding:32px 36px 8px 36px;">
     <p style="margin:0 0 16px 0;color:${NAVY};font-size:16px;font-family:Helvetica,Arial,sans-serif;">Bonjour Monsieur Bertrand DUPONT-TOPIN,</p>
     <p style="margin:0 0 8px 0;color:#33425A;font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;">Je vous confirme notre entretien initial. Pour le préparer, merci de compléter le document ci-dessous. Vous pouvez aussi choisir/confirmer le créneau de votre rendez-vous.</p>
   </td></tr>
   <tr><td style="padding:12px 36px 0 36px;">
     <table role="presentation" width="100%" style="background:${IVORY};border-radius:8px;"><tr><td style="padding:16px 20px;">
       <table role="presentation" width="100%">
         ${recapRow("Type", "Entretien initial")}
         ${recapRow("Date", "Vendredi 22 mai 2026")}
         ${recapRow("Heure", "10h00 · 1h00")}
         ${recapRow("Lieu", "Cabinet · Paris 8e")}
       </table>
     </td></tr></table>
   </td></tr>
   <tr><td style="padding:16px 36px 0 36px;"><div style="color:${NAVY};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-family:Helvetica,Arial,sans-serif;">Document à compléter</div></td></tr>
   ${button(dciUrl, "Compléter mon DCI Complet →")}
   <tr><td style="padding:16px 36px 0 36px;"><div style="color:${NAVY};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-family:Helvetica,Arial,sans-serif;">Votre rendez-vous</div></td></tr>
   ${button(bookingUrl, "Choisir / voir mon rendez-vous")}
   <tr><td style="border-top:1px solid #ECE7DC;padding:24px 36px;margin-top:16px;">
     <p style="margin:0;color:#33425A;font-size:14px;font-family:Helvetica,Arial,sans-serif;">Bien à vous,<br><strong style="color:${NAVY};">Luc THILLIEZ — Cabinet PRIVEOS</strong></p>
   </td></tr>
  </table>
  <p style="margin:14px 0 0 0;color:#A7AEBB;font-size:11px;font-family:Helvetica,Arial,sans-serif;">Liens : ${esc(dciUrl)} · ${esc(bookingUrl)}</p>
 </td></tr>
</table></body></html>`;

const resp = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from, to: TO, subject, html }),
});
const payload = await resp.json().catch(() => ({}));
console.log("HTTP", resp.status);
console.log("from:", from, "→ to:", TO);
console.log("liens:", dciUrl, "|", bookingUrl);
console.log("réponse Resend:", JSON.stringify(payload));
if (!resp.ok) process.exit(1);
