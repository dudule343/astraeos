"use client";

import { useRef, useState } from "react";

type EmailTpl = {
  category: string;
  title: string;
  desc: string;
};

const EMAIL_TEMPLATES: EmailTpl[] = [
  { category: "Onboarding cabinet", title: "Bienvenue cabinet licencié", desc: "Envoyé à la signature du contrat de licence" },
  { category: "Onboarding cabinet", title: "Bienvenue ingénieur patrimonial", desc: "Envoyé à la création de compte ingénieur" },
  { category: "Parcours client", title: "Bienvenue client", desc: "Envoyé à la signature lettre de mission" },
  { category: "Parcours client", title: "KYC validé", desc: "Envoyé après vérification Netheos" },
  { category: "Parcours client", title: "Étude patrimoniale livrée", desc: "Envoyé à la livraison de l'étude" },
  { category: "Parcours client", title: "Restitution programmée", desc: "Confirmation RDV restitution étude" },
  { category: "Suivi client", title: "Bilan annuel client", desc: "Envoyé chaque anniversaire d'étude" },
  { category: "Facturation", title: "Facture émise", desc: "Notification automatique avec PDF" },
  { category: "Facturation", title: "Relance impayé J+15", desc: "1ère relance courtoise" },
  { category: "Facturation", title: "Relance impayé J+30", desc: "Mise en demeure formelle" },
];

const EMAIL_TEMPLATES_EXTRA: EmailTpl[] = [
  { category: "Facturation", title: "Reçu de paiement", desc: "Confirmation automatique d'encaissement" },
  { category: "Suivi client", title: "Anniversaire signature", desc: "Message personnalisé annuel" },
  { category: "Parcours client", title: "Relance documents manquants", desc: "Pièces KYC incomplètes" },
  { category: "Onboarding cabinet", title: "Formation initiale programmée", desc: "Confirmation session onboarding réseau" },
];

type DocTpl = {
  name: string;
  type: string;
  format: string;
  version: string;
  maj: string;
};

const DOC_TEMPLATES: DocTpl[] = [
  { name: "Lettre de mission", type: "Contractuel", format: "DOCX + PDF", version: "v4.2", maj: "28/03/2026" },
  { name: "Étude patrimoniale", type: "Production", format: "DOCX + PDF", version: "v5.1", maj: "15/04/2026" },
  { name: "Document de restitution", type: "Production", format: "PPTX + PDF", version: "v3.0", maj: "10/04/2026" },
  { name: "Livret cabinet · présentation réseau", type: "Marketing", format: "PDF", version: "v2.3", maj: "22/02/2026" },
  { name: "Synthèse fiscale annuelle", type: "Production", format: "PDF", version: "v1.4", maj: "05/02/2026" },
  { name: "Bilan annuel client", type: "Suivi", format: "PDF", version: "v2.0", maj: "18/01/2026" },
];

const DOC_TEMPLATES_EXTRA: DocTpl[] = [
  { name: "Convention de confidentialité", type: "Contractuel", format: "DOCX + PDF", version: "v1.2", maj: "12/01/2026" },
  { name: "Note de cadrage mission", type: "Production", format: "DOCX", version: "v1.0", maj: "08/01/2026" },
  { name: "Questionnaire profil de risque", type: "Production", format: "PDF", version: "v2.1", maj: "20/12/2025" },
];

type MarketingItem = {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  meta: string;
};

const MARKETING_LIBRARY: MarketingItem[] = [
  { badge: "PDF", badgeBg: "var(--gold-100)", badgeColor: "var(--gold-deep)", title: "Plaquette PRIVEOS · cabinet", meta: "8 pages · v3.2 · 4 MB" },
  { badge: "PPT", badgeBg: "var(--light-blue)", badgeColor: "var(--navy)", title: "Présentation services · client final", meta: "24 slides · v2.1 · 18 MB" },
  { badge: "JPG", badgeBg: "#FFE3D5", badgeColor: "var(--orange-text)", title: "Bannières LinkedIn · 5 visuels", meta: "1200×627px · v1.0 · 2 MB" },
  { badge: "PDF", badgeBg: "var(--gold-100)", badgeColor: "var(--gold-deep)", title: "Charte graphique réseau · v3.2", meta: "36 pages · mars 2026 · 12 MB" },
  { badge: "DOC", badgeBg: "var(--light-blue)", badgeColor: "var(--navy)", title: "Argumentaire commercial · réseau", meta: "12 pages · v1.5 · 800 KB" },
];

const cardBaseStyle: React.CSSProperties = {
  padding: "14px 16px",
  background: "white",
  border: "1px solid var(--navy-100)",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.15s",
};

export function TemplatesClient() {
  const [showEmailExtra, setShowEmailExtra] = useState(false);
  const [showDocExtra, setShowDocExtra] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const emails = showEmailExtra ? [...EMAIL_TEMPLATES, ...EMAIL_TEMPLATES_EXTRA] : EMAIL_TEMPLATES;
  const docs = showDocExtra ? [...DOC_TEMPLATES, ...DOC_TEMPLATES_EXTRA] : DOC_TEMPLATES;

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Administration · paramétrages cabinet · 7/8</div>
          <h1 className="hero-title">Templates &amp; <strong>communication</strong></h1>
          <p className="hero-sub">Templates emails automatiques (bienvenue, KYC validé, étude livrée), templates documents (lettre de mission, étude patrimoniale, restitution, livret cabinet), charte de communication réseau (signatures email, ton de voix) et bibliothèque marketing partagée.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-gold btn-sm" onClick={() => notify("Nouveau template — éditeur de template")}>+ Nouveau template</button>
        </div>
      </div>

      {/* KPIs templates */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi"><div className="kpi-label">Templates emails</div><div className="kpi-value">14</div><div className="kpi-meta">automatisés</div></div>
        <div className="kpi"><div className="kpi-label">Templates documents</div><div className="kpi-value gold">9</div><div className="kpi-meta">production réseau</div></div>
        <div className="kpi"><div className="kpi-label">Bibliothèque marketing</div><div className="kpi-value">5</div><div className="kpi-meta">supports partagés</div></div>
        <div className="kpi"><div className="kpi-label">Charte graphique</div><div className="kpi-value" style={{ fontSize: "18px" }}>v3.2</div><div className="kpi-meta">mars 2026</div></div>
      </div>

      {/* Bloc 1 : Templates emails automatiques */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title"><svg><use href="#i-comms" /></svg>Templates emails automatiques · 14 templates</div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)", fontStyle: "italic" }}>déclenchement automatique selon événements</span>
        </div>
        <div className="card-body" style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {emails.map((tpl) => (
              <div
                key={tpl.title}
                style={{
                  ...cardBaseStyle,
                  borderColor: selectedEmail === tpl.title ? "var(--gold)" : "var(--navy-100)",
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = selectedEmail === tpl.title ? "var(--gold)" : "var(--navy-100)"; }}
                onClick={() => { setSelectedEmail(tpl.title); notify(`Édition du template « ${tpl.title} »`); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--gold-deep)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{tpl.category}</span>
                  <span className="badge badge-success" style={{ fontSize: "9px" }}>Actif</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>{tpl.title}</div>
                <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "4px" }}>{tpl.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--ivory-deep)", textAlign: "center" }}>
            <a
              style={{ fontSize: "11.5px", color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}
              onClick={() => setShowEmailExtra((v) => !v)}
            >
              {showEmailExtra ? "Masquer les 4 autres templates emails ←" : "Voir les 4 autres templates emails →"}
            </a>
          </div>
        </div>
      </div>

      {/* Bloc 2 : Templates documents */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title"><svg><use href="#i-doc" /></svg>Templates documents · 9 templates</div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)", fontStyle: "italic" }}>production professionnelle réseau</span>
        </div>
        <table className="dt" style={{ fontSize: "12.5px" }}>
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Format</th>
              <th>Version</th>
              <th>Dernière MAJ</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.name}>
                <td><strong>{doc.name}</strong></td>
                <td>{doc.type}</td>
                <td>{doc.format}</td>
                <td>{doc.version}</td>
                <td className="nowrap" style={{ fontSize: "11.5px" }}>{doc.maj}</td>
                <td className="center"><button className="btn btn-ghost btn-sm" onClick={() => notify(`Modification du template « ${doc.name} »`)}>Modifier</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--ivory-deep)", textAlign: "center" }}>
          <a
            style={{ fontSize: "11.5px", color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}
            onClick={() => setShowDocExtra((v) => !v)}
          >
            {showDocExtra ? "Masquer les 3 autres templates documents ←" : "Voir les 3 autres templates documents →"}
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

        {/* Bloc 3 : Charte de communication */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><svg><use href="#i-marketplace" /></svg>Charte de communication réseau</div>
          </div>
          <div className="card-body" style={{ padding: "20px 22px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--navy-300)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Signature email type · cabinet</div>
              <div style={{ padding: "14px 16px", background: "var(--ivory)", border: "1px solid var(--gold-200)", borderRadius: "8px", fontSize: "12px", lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: "var(--navy)" }}>Julien VASSEUR</div>
                <div style={{ color: "var(--navy-300)", fontSize: "11px" }}>Ingénieur patrimonial · Cabinet Paris Étoile</div>
                <div style={{ color: "var(--navy-300)", fontSize: "11px" }}>membre du réseau <strong style={{ color: "var(--gold)" }}>PRIVE<span style={{ color: "var(--gold-deep)" }}>OS</span></strong></div>
                <div style={{ marginTop: "6px", color: "var(--navy-300)", fontSize: "10.5px" }}>+33 1 42 65 80 12 · julien.vasseur@email-test.fr</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--navy-300)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Ton de voix · principes</div>
              <div style={{ fontSize: "11.5px", color: "var(--navy)", lineHeight: 1.7 }}>
                <div>● <strong>Sobre &amp; expert</strong> · vocabulaire patrimonial précis, jamais condescendant</div>
                <div>● <strong>Direct &amp; transparent</strong> · pas de jargon inutile, on cite les sources</div>
                <div>● <strong>Personnalisé</strong> · prénom du client, jamais de mass-mailing impersonnel</div>
                <div>● <strong>Patient</strong> · prendre le temps d&apos;expliquer plutôt que survoler</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc 4 : Bibliothèque marketing */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><svg><use href="#i-marketplace" /></svg>Bibliothèque marketing partagée</div>
            <button className="btn btn-ghost btn-sm" onClick={() => notify("Ajout d'un support marketing")}>+ Ajouter</button>
          </div>
          <div className="card-body" style={{ padding: "20px 22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
              {MARKETING_LIBRARY.map((item) => (
                <div key={item.title} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "white", border: "1px solid var(--navy-100)", borderRadius: "6px" }}>
                  <div style={{ width: "32px", height: "32px", flexShrink: 0, background: item.badgeBg, borderRadius: "6px", display: "grid", placeItems: "center", color: item.badgeColor, fontSize: "11px", fontWeight: 700 }}>{item.badge}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)" }}>{item.title}</div>
                    <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>{item.meta}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => notify(`Téléchargement · ${item.title}`)}>Télécharger</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--navy)",
            color: "white",
            padding: "12px 22px",
            borderRadius: "10px",
            fontSize: "12.5px",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 1000,
          }}
          role="status"
        >
          {toast}
        </div>
      )}
    </>
  );
}
