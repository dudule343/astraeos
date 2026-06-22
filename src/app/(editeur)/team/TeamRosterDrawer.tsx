"use client";

import { useEffect, useState } from "react";

// Roster équipe + drawer fiche collaborateur, porté 1:1 de la maquette
// (page-team, lignes 4270-4501 + script openTeamDrawer/closeTeamDrawer).
// Le clic sur une ligne (.dt-clickable) ouvre le drawer ; ESC et l'overlay
// le ferment. Le bloc d'indicateurs affiché dépend du rôle (metrics).

type Metrics = "tech" | "support" | "commercial";

type Person = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  clients: string;
  cost: string;
  load: string;
};

type Category = {
  icon: string;
  title: string;
  count: string;
  clickable: boolean;
  people: Person[];
};

type DrawerData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  metrics: Metrics;
};

const TEAM_DATA: Record<string, DrawerData> = {
  lea: { name: "Léa MERCIER", role: "Responsable Technique", email: "l.mercier@astraeos.fr", phone: "06 34 56 78 90", avatar: "LM", metrics: "tech" },
  antoine: { name: "Antoine ROUSSEL", role: "Développeur senior fullstack", email: "a.roussel@astraeos.fr", phone: "06 45 67 89 01", avatar: "AR", metrics: "tech" },
  camille: { name: "Camille PIROTTE", role: "Développeuse frontend", email: "c.pirotte@astraeos.fr", phone: "06 56 78 90 12", avatar: "CP", metrics: "tech" },
  maxime: { name: "Maxime DUFOUR", role: "Développeur backend (prest.)", email: "m.dufour@astraeos.fr", phone: "06 67 89 01 23", avatar: "MD", metrics: "tech" },
  elodie: { name: "Élodie VARIN", role: "Resp. Relation Client senior", email: "e.varin@astraeos.fr", phone: "06 78 90 12 34", avatar: "ÉV", metrics: "support" },
  thomas: { name: "Thomas GAUTHIER", role: "Resp. Relation Client", email: "t.gauthier@astraeos.fr", phone: "06 89 01 23 45", avatar: "TG", metrics: "support" },
  julie: { name: "Julie MERCANTI", role: "Support technique N1", email: "j.mercanti@astraeos.fr", phone: "06 90 12 34 56", avatar: "JM", metrics: "support" },
  marc: { name: "Marc DUPRE", role: "Commercial senior", email: "m.dupre@astraeos.fr", phone: "07 12 34 56 78", avatar: "MD", metrics: "commercial" },
  hugues: { name: "Hugues CARTIER", role: "Commercial junior", email: "h.cartier@astraeos.fr", phone: "07 23 45 67 89", avatar: "HC", metrics: "commercial" },
};

const CATEGORIES: Category[] = [
  {
    icon: "#i-direction",
    title: "DIRECTION",
    count: "2 personnes · 16 800 €/mois · 7 % du CA",
    clickable: false,
    people: [
      { id: "sarah", name: "Sarah KAUFMANN", role: "Présidente fondatrice", email: "s.kaufmann@astraeos.fr", phone: "06 12 34 56 78", clients: "tous (transverse)", cost: "9 800 €", load: "3,9 %" },
      { id: "pierre", name: "Pierre DELACOUR", role: "Directeur des opérations", email: "p.delacour@astraeos.fr", phone: "06 23 45 67 89", clients: "tous (transverse)", cost: "7 000 €", load: "2,8 %" },
    ],
  },
  {
    icon: "#i-tech",
    title: "TECHNIQUE",
    count: "4 personnes · 28 200 €/mois · 11 % du CA",
    clickable: true,
    people: [
      { id: "lea", name: "Léa MERCIER", role: "Responsable Technique", email: "l.mercier@astraeos.fr", phone: "06 34 56 78 90", clients: "infrastructure (transverse)", cost: "8 600 €", load: "3,4 %" },
      { id: "antoine", name: "Antoine ROUSSEL", role: "Développeur senior fullstack", email: "a.roussel@astraeos.fr", phone: "06 45 67 89 01", clients: "tous (modules core)", cost: "7 200 €", load: "2,9 %" },
      { id: "camille", name: "Camille PIROTTE", role: "Développeuse frontend", email: "c.pirotte@astraeos.fr", phone: "06 56 78 90 12", clients: "tous (UI/UX)", cost: "6 400 €", load: "2,5 %" },
      { id: "maxime", name: "Maxime DUFOUR", role: "Développeur backend (prestataire)", email: "m.dufour@astraeos.fr", phone: "06 67 89 01 23", clients: "tous (API, intégrations)", cost: "6 000 €", load: "2,4 %" },
    ],
  },
  {
    icon: "#i-support",
    title: "SUPPORT",
    count: "3 personnes · 18 600 €/mois · 7,4 % du CA",
    clickable: true,
    people: [
      { id: "elodie", name: "Élodie VARIN", role: "Responsable Relation Client senior", email: "e.varin@astraeos.fr", phone: "06 78 90 12 34", clients: "ASTRAEOS, Atlas, 5 cabinets", cost: "6 800 €", load: "2,7 %" },
      { id: "thomas", name: "Thomas GAUTHIER", role: "Responsable Relation Client", email: "t.gauthier@astraeos.fr", phone: "06 89 01 23 45", clients: "Fontaine, 8 cabinets, 3 pros", cost: "5 800 €", load: "2,3 %" },
      { id: "julie", name: "Julie MERCANTI", role: "Support technique N1", email: "j.mercanti@astraeos.fr", phone: "06 90 12 34 56", clients: "tous (tickets de support)", cost: "6 000 €", load: "2,4 %" },
    ],
  },
  {
    icon: "#i-commercial",
    title: "COMMERCIAUX",
    count: "2 personnes · 18 800 €/mois · 7,5 % du CA",
    clickable: true,
    people: [
      { id: "marc", name: "Marc DUPRE", role: "Commercial senior", email: "m.dupre@astraeos.fr", phone: "07 12 34 56 78", clients: "acquisition + closing", cost: "10 800 €", load: "4,3 %" },
      { id: "hugues", name: "Hugues CARTIER", role: "Commercial junior", email: "h.cartier@astraeos.fr", phone: "07 23 45 67 89", clients: "qualification de leads", cost: "8 000 €", load: "3,2 %" },
    ],
  },
];

const TECH_METRICS: [string, string][] = [
  ["Tickets traités cette semaine", "14"],
  ["Déploiements en production", "3"],
  ["Bugs résolus", "8"],
  ["Code reviews effectuées", "11"],
  ["Pull requests fusionnées", "6"],
];

const SUPPORT_METRICS: [string, string, boolean?][] = [
  ["Tickets reçus cette semaine", "38"],
  ["Tickets résolus", "34"],
  ["Appels téléphoniques traités", "22"],
  ["Temps moyen de résolution", "2 h 14"],
  ["Note de satisfaction client", "4,8 / 5", true],
];

const COMMERCIAL_METRICS: [string, string, boolean?][] = [
  ["Contacts pris cette semaine", "42"],
  ["RDV planifiés", "8"],
  ["RDV réalisés", "6"],
  ["Conversions (signatures)", "2", true],
  ["CA généré cette semaine", "14 200 €", true],
];

function TeamTable({ category, onOpen }: { category: Category; onOpen: (id: string) => void }) {
  return (
    <>
      <div className="team-category-header">
        <svg>
          <use href={category.icon} />
        </svg>
        <span>{category.title}</span>
        <span className="count">{category.count}</span>
      </div>
      <table className="dt">
        <thead>
          <tr>
            <th>Prénom Nom</th>
            <th>Rôle</th>
            <th>Email interne</th>
            <th>Téléphone</th>
            <th className="num">Clients affectés</th>
            <th className="num">Coût ASTRAEOS /mois</th>
            <th className="num">Charge / CA</th>
          </tr>
        </thead>
        <tbody>
          {category.people.map((p) => (
            <tr
              key={p.id}
              className={category.clickable ? "dt-clickable" : undefined}
              onClick={category.clickable ? () => onOpen(p.id) : undefined}
            >
              <td className="cell-primary">{p.name}</td>
              <td>{p.role}</td>
              <td style={{ fontSize: "11px" }}>{p.email}</td>
              <td style={{ fontSize: "11px" }}>{p.phone}</td>
              <td className="num">{p.clients}</td>
              <td className="num cell-money">{p.cost}</td>
              <td className="num">{p.load}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function TeamRosterDrawer() {
  const [openId, setOpenId] = useState<string | null>(null);
  const data = openId ? TEAM_DATA[openId] : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="table-wrap mb-24">
        {CATEGORIES.map((cat) => (
          <TeamTable key={cat.title} category={cat} onOpen={setOpenId} />
        ))}

        <div
          style={{
            background: "linear-gradient(90deg, var(--gold-200), var(--ivory))",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid var(--gold)",
          }}
        >
          <div>
            <div className="kpi-label" style={{ marginBottom: "4px" }}>
              TOTAL MASSE SALARIALE
            </div>
            <div style={{ fontSize: "13px", color: "var(--navy)" }}>
              11 collaborateurs (salariés + prestataires)
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--gold)" }}>
              82 400 €/mois
            </div>
            <div style={{ fontSize: "13px", color: "var(--navy)", marginTop: "4px" }}>
              soit <strong>33 % du CA</strong> · cible &lt; 35 % ✓
            </div>
          </div>
        </div>
      </div>

      <div
        className={`team-drawer-overlay${openId ? " open" : ""}`}
        onClick={() => setOpenId(null)}
      />
      <aside className={`team-drawer${openId ? " open" : ""}`}>
        <div className="team-drawer-header">
          <button className="team-drawer-close" onClick={() => setOpenId(null)}>
            ×
          </button>
          <div className="team-drawer-avatar">{data?.avatar ?? "??"}</div>
          <div className="team-drawer-name">{data?.name ?? "—"}</div>
          <div className="team-drawer-role">{data?.role ?? "—"}</div>
          <div className="team-drawer-contact">
            <span>
              <svg style={{ width: "13px", height: "13px" }}>
                <use href="#i-mail" />
              </svg>
              <span>{data?.email ?? "—"}</span>
            </span>
            <span>
              <svg style={{ width: "13px", height: "13px" }}>
                <use href="#i-phone" />
              </svg>
              <span>{data?.phone ?? "—"}</span>
            </span>
          </div>
        </div>
        <div className="team-drawer-body">
          <div
            style={{
              fontSize: "11.5px",
              color: "var(--gold)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Activité de la semaine en cours
          </div>
          <div style={{ fontSize: "11px", color: "var(--navy-300)", marginBottom: "8px" }}>
            Du lundi 4 au dimanche 10 mai 2026
          </div>
          <div className="activity-week-grid">
            <div className="activity-day activity-2">L</div>
            <div className="activity-day activity-3">M</div>
            <div className="activity-day activity-3">M</div>
            <div className="activity-day activity-2">J</div>
            <div className="activity-day activity-3">V</div>
            <div className="activity-day activity-1">S</div>
            <div className="activity-day activity-0">D</div>
          </div>
          <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "18px" }}>
            Saturation : <span style={{ color: "var(--navy-300)" }}>●</span> repos ·{" "}
            <span style={{ color: "var(--gold-300)" }}>●</span> faible ·{" "}
            <span style={{ color: "var(--gold)" }}>●</span> normale ·{" "}
            <span style={{ color: "var(--gold)" }}>●</span> intense
          </div>

          {data?.metrics === "tech" && (
            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--gold)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "14px 0 10px",
                }}
              >
                Indicateurs techniques
              </div>
              {TECH_METRICS.map(([label, value]) => (
                <div key={label} className="finance-detail-row">
                  <span className="finance-detail-label">{label}</span>
                  <span className="finance-detail-value">{value}</span>
                </div>
              ))}
            </div>
          )}

          {data?.metrics === "support" && (
            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--gold)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "14px 0 10px",
                }}
              >
                Indicateurs support &amp; relation
              </div>
              {SUPPORT_METRICS.map(([label, value, gold]) => (
                <div key={label} className="finance-detail-row">
                  <span className="finance-detail-label">{label}</span>
                  <span className={`finance-detail-value${gold ? " gold" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {data?.metrics === "commercial" && (
            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--gold)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "14px 0 10px",
                }}
              >
                Indicateurs commerciaux
              </div>
              {COMMERCIAL_METRICS.map(([label, value, gold]) => (
                <div key={label} className="finance-detail-row">
                  <span className="finance-detail-label">{label}</span>
                  <span className={`finance-detail-value${gold ? " gold" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "18px",
              padding: "10px 14px",
              background: "var(--ivory)",
              borderRadius: "6px",
              fontSize: "11px",
              color: "var(--navy-300)",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--navy)" }}>Note :</strong> les indicateurs sont
            renseignés par le collaborateur lui-même via son espace personnel ASTRAEOS, et
            automatiquement consolidés ici.
          </div>
        </div>
      </aside>
    </>
  );
}
