// Ajoute au DNS d'astraeos.fr (API Hostinger) les enregistrements d'envoi e-mail
// que Resend exige (DKIM, SPF, MX feedback) + un DMARC, en mode APPEND
// (overwrite:false) : on n'ajoute QUE de nouveaux noms, on ne touche PAS aux
// CNAME Vercel ni au A apex existants.
// Lancer : node --env-file=.env.local scripts/hostinger-dns-add.mjs
import fs from "node:fs";

const TOKEN = process.env.HOSTINGER_API_TOKEN;
const DOMAIN = "astraeos.fr";
const BASE = `https://developers.hostinger.com/api/dns/v1/zones/${DOMAIN}`;
if (!TOKEN) {
  console.error("HOSTINGER_API_TOKEN manquant");
  process.exit(1);
}

// Valeurs exactes fournies par Resend (sauvegardées au moment de l'enregistrement).
const resendRecords = JSON.parse(fs.readFileSync("/tmp/resend-astraeos-records.json", "utf8"));

const zone = [];
for (const r of resendRecords) {
  if (r.type === "MX") {
    const host = r.value.endsWith(".") ? r.value : r.value + ".";
    zone.push({ name: r.name, type: "MX", ttl: 3600, records: [{ content: `${r.priority ?? 10} ${host}` }] });
  } else if (r.type === "TXT") {
    zone.push({ name: r.name, type: "TXT", ttl: 3600, records: [{ content: r.value }] });
  }
}
// DMARC recommandé pour la délivrabilité (M365 & co).
zone.push({ name: "_dmarc", type: "TXT", ttl: 3600, records: [{ content: "v=DMARC1; p=none;" }] });

console.log("=== Enregistrements à AJOUTER (overwrite:false) ===");
for (const z of zone) console.log(z.type, z.name, "→", z.records[0].content.slice(0, 70));

const r = await fetch(BASE, {
  method: "PUT",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ overwrite: false, zone }),
});
console.log("PUT HTTP", r.status);
console.log(await r.text());
