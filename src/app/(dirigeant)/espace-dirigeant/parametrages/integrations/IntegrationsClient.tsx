"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useState, type CSSProperties, type ReactNode } from "react";

type Connector = {
  id: string;
  name: string;
  category: string;
  description: string;
  meta: string;
  status: "active" | "todo";
  iconBg: string;
  iconLetter?: string;
  iconSvg?: ReactNode;
};

const CONNECTORS: Connector[] = [
  {
    id: "yousign",
    name: "Yousign",
    category: "Signature électronique",
    description:
      "Signature électronique des lettres de mission, contrats et documents clients. eIDAS niveau qualifié.",
    meta: "184 signatures (mai)",
    status: "active",
    iconBg: "linear-gradient(135deg, #6B5BD8, #8E7CFB)",
    iconLetter: "Y",
  },
  {
    id: "pennylane",
    name: "Pennylane",
    category: "Comptabilité",
    description:
      "Comptabilité automatisée du réseau · facturation, lettrage, déclarations TVA et liasses fiscales.",
    meta: "Synchro temps réel",
    status: "active",
    iconBg: "linear-gradient(135deg, #1B5E48, #2E8B57)",
    iconLetter: "P",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    category: "Stockage documents",
    description:
      "Stockage cloud des dossiers clients · 62 GB / 100 GB alloués au cabinet · partage sécurisé.",
    meta: "12 480 fichiers",
    status: "active",
    iconBg: "linear-gradient(135deg, #4285F4, #34A853)",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "22px", height: "22px" }}>
        <path
          d="M7.71 3.5L1.15 15l3.42 6 6.55-11.5zM12 11l3.42-6h-6.84zm10.85 4l-3.42-6L13.42 18.5L19.42 18.5z"
          opacity="0.95"
        />
      </svg>
    ),
  },
  {
    id: "brevo",
    name: "Brevo",
    category: "E-mailing & CRM",
    description:
      "Newsletters mensuelles aux clients, campagnes ciblées par ingénieur, transactionnel automatisé.",
    meta: "4 280 contacts",
    status: "active",
    iconBg: "linear-gradient(135deg, #0B996E, #2DBC8E)",
    iconLetter: "B",
  },
  {
    id: "aircall",
    name: "Aircall",
    category: "Téléphonie cloud",
    description:
      "Lignes téléphoniques cloud par ingénieur · enregistrement des appels, suivi automatique CRM.",
    meta: "38 lignes actives",
    status: "active",
    iconBg: "linear-gradient(135deg, #00BFA5, #4DD8C8)",
    iconSvg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "22px", height: "22px" }}
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Visio & webinaires",
    description:
      "Rendez-vous client à distance, restitutions d'études, formations Académie ASTRAEOS, webinaires.",
    meta: "312 réunions (mai)",
    status: "active",
    iconBg: "linear-gradient(135deg, #2D8CFF, #4DA8FF)",
    iconSvg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "22px", height: "22px" }}
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: "netheos",
    name: "Netheos",
    category: "KYC & identité",
    description:
      "Vérification automatique d'identité (CNI, passeport), justificatif de domicile, conformité LCB-FT.",
    meta: "142 vérifications (mai)",
    status: "active",
    iconBg: "linear-gradient(135deg, #003D7A, #005EBF)",
    iconLetter: "N",
  },
  {
    id: "docusign",
    name: "DocuSign",
    category: "Signature alternative",
    description:
      "Solution de signature alternative à Yousign si requise par certains clients institutionnels.",
    meta: "Pas de clé API renseignée",
    status: "todo",
    iconBg: "#FFE3D5",
    iconLetter: "D",
  },
  {
    id: "sirius-kyc",
    name: "Sirius KYC",
    category: "KYC alternatif",
    description:
      "Solution KYC alternative à Netheos · vérifications PEP, sanctions, biographie publique.",
    meta: "Pas de clé API renseignée",
    status: "todo",
    iconBg: "#FFE3D5",
    iconLetter: "S",
  },
];

export function IntegrationsClient() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [addHover, setAddHover] = useState(false);
  const [drawer, setDrawer] = useState<Connector | "add" | null>(null);

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Administration · paramétrages cabinet · 3/8</div>
          <h1 className="hero-title">
            Intégrations &amp; <strong>connecteurs</strong>
          </h1>
          <p className="hero-sub">
            Tous les services tiers connectés à ASTRAEOS pour automatiser le quotidien du réseau ·
            signature électronique, comptabilité, stockage, e-mailing, téléphonie, visio, KYC.
            Statut connecté/déconnecté, clés API et dernières synchronisations.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-gold btn-sm" onClick={() => setDrawer("add")}>
            + Ajouter un connecteur
          </button>
        </div>
      </div>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Connecteurs actifs</div>
          <div className="kpi-value gold">7</div>
          <div className="kpi-meta">connectés et fonctionnels</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">À configurer</div>
          <div className="kpi-value" style={{ color: "var(--orange-text)" }}>
            2
          </div>
          <div className="kpi-meta">DocuSign · Sirius KYC</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Synchros / 24h</div>
          <div className="kpi-value">1 248</div>
          <div className="kpi-meta">événements traités</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Taux de succès</div>
          <div className="kpi-value gold">
            99,8 <span className="unit">%</span>
          </div>
          <div className="kpi-meta">des appels API</div>
        </div>
      </div>

      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-link" />
            </svg>
            Connecteurs &amp; intégrations actifs
          </div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)", fontStyle: "italic" }}>
            cliquez pour configurer
          </span>
        </div>
        <div className="card-body" style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {CONNECTORS.map((c) => (
              <ConnectorCard
                key={c.id}
                connector={c}
                hovered={hovered === c.id}
                onHover={(h) => setHovered(h ? c.id : null)}
                onClick={() => setDrawer(c)}
              />
            ))}
          </div>

          <button
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "14px",
              background: addHover ? "var(--gold-100)" : "transparent",
              border: `2px dashed ${addHover ? "var(--gold)" : "var(--gold-200)"}`,
              borderRadius: "10px",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--gold-deep)",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseOver={() => setAddHover(true)}
            onMouseOut={() => setAddHover(false)}
            onClick={() => setDrawer("add")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "16px", height: "16px" }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter un nouveau connecteur
          </button>
        </div>
      </div>

      {drawer && (
        <ConfigDrawer target={drawer} onClose={() => setDrawer(null)} />
      )}
    </>
  );
}

function ConnectorCard({
  connector,
  hovered,
  onHover,
  onClick,
}: {
  connector: Connector;
  hovered: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
}) {
  const isTodo = connector.status === "todo";

  const cardStyle: CSSProperties = isTodo
    ? {
        padding: "18px",
        background: "white",
        border: "1.5px dashed var(--orange-text)",
        borderRadius: "10px",
        transition: "all 0.15s",
        cursor: "pointer",
        opacity: 0.85,
      }
    : {
        padding: "18px",
        background: "white",
        border: `1px solid ${hovered ? "var(--gold)" : "var(--navy-100)"}`,
        borderRadius: "10px",
        transition: "all 0.15s",
        cursor: "pointer",
      };

  const iconStyle: CSSProperties = {
    width: "40px",
    height: "40px",
    flexShrink: 0,
    background: connector.iconBg,
    color: isTodo ? "#FFA500" : "white",
    border: isTodo ? "1px dashed var(--orange-text)" : undefined,
    borderRadius: "8px",
    display: "grid",
    placeItems: "center",
    fontFamily: connector.iconLetter ? "'Epilogue',sans-serif" : undefined,
    fontWeight: connector.iconLetter ? 800 : undefined,
    fontSize: connector.iconLetter ? "16px" : undefined,
  };

  return (
    <div
      style={cardStyle}
      onMouseOver={() => !isTodo && onHover(true)}
      onMouseOut={() => !isTodo && onHover(false)}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        <div style={iconStyle}>{connector.iconLetter ?? connector.iconSvg}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
            {connector.name}
          </div>
          <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>{connector.category}</div>
        </div>
        {isTodo ? (
          <span
            className="badge"
            style={{
              background: "rgba(229,124,75,0.15)",
              color: "var(--orange-text)",
              fontSize: "9px",
            }}
          >
            À configurer
          </span>
        ) : (
          <span className="badge badge-success" style={{ fontSize: "9px" }}>
            Actif
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "10.5px",
          color: "var(--navy-300)",
          lineHeight: 1.5,
          marginBottom: "10px",
        }}
      >
        {connector.description}
      </div>
      <div
        style={{
          fontSize: "10px",
          paddingTop: "10px",
          borderTop: "1px solid var(--ivory-deep)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "var(--navy-300)" }}>● {connector.meta}</span>
        <span
          style={
            isTodo
              ? { color: "var(--gold-deep)", fontWeight: 700 }
              : { color: "var(--navy)" }
          }
        >
          Configurer →
        </span>
      </div>
    </div>
  );
}

function ConfigDrawer({
  target,
  onClose,
}: {
  target: Connector | "add";
  onClose: () => void;
}) {
  const isAdd = target === "add";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 200,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 92vw)",
          height: "100%",
          background: "white",
          boxShadow: "-12px 0 32px rgba(15,23,42,0.18)",
          padding: "24px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)" }}>
            {isAdd ? "Ajouter un connecteur" : `Configurer ${target.name}`}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--navy-300)",
              fontSize: "20px",
              lineHeight: 1,
            }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {isAdd ? (
          <p style={{ fontSize: "12.5px", color: "var(--navy-300)", lineHeight: 1.6 }}>
            Choisissez un service tiers à connecter à ASTRAEOS. Signature électronique,
            comptabilité, stockage, e-mailing, téléphonie, visio ou KYC. Renseignez la clé API
            fournie par le prestataire pour activer la synchronisation.
          </p>
        ) : (
          <>
            <div
              style={{
                fontSize: "11px",
                color: "var(--navy-300)",
                marginBottom: "4px",
              }}
            >
              {target.category}
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--navy-300)", lineHeight: 1.6 }}>
              {target.description}
            </p>
            <div
              style={{
                marginTop: "16px",
                fontSize: "11px",
                color: "var(--navy-300)",
              }}
            >
              État : {target.status === "active" ? "Actif · " : ""}
              {target.meta}
            </div>
          </>
        )}

        <button
          className="btn btn-gold btn-sm"
          style={{ marginTop: "22px", width: "100%" }}
          onClick={onClose}
        >
          {isAdd ? "Parcourir le catalogue" : "Enregistrer la configuration"}
        </button>
      </div>
    </div>
  );
}
