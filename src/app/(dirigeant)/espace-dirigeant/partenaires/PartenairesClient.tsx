"use client";

import { Fragment, useMemo, useState } from "react";

// Écran Partenaires & apporteurs porté à l'identique de la maquette dirigeant
// (reference/wireframes-dirigeant.html, lignes 8360-8465). Deux populations :
// (1) partenaires recommandables à qui le cabinet transmet des clients,
// (2) apporteurs d'affaires qui amènent des clients au cabinet.
// Les filtres qf-perf et les champs de recherche deviennent des états client.

type Profession = "Notaire" | "Avocat" | "Expert-comptable";

type ProBadge = { bg: string; color: string };

const PRO_BADGE: Record<string, ProBadge> = {
  Notaire: { bg: "var(--gold-100)", color: "var(--gold-deep)" },
  Avocat: { bg: "var(--purple-bg)", color: "var(--purple-text)" },
  "Expert-comptable": { bg: "var(--light-blue)", color: "var(--navy)" },
  "Agent immo": { bg: "var(--purple-bg)", color: "var(--purple-text)" },
  "Client ambassadeur": { bg: "var(--light-blue)", color: "var(--navy)" },
  "Média / influence": { bg: "var(--purple-bg)", color: "var(--purple-text)" },
};

type Recommandable = {
  name: string;
  org: string;
  profession: Profession;
  localisation: string;
  specialite: string;
  dossiers: number;
  gold: boolean;
};

const RECOMMANDABLES: Recommandable[] = [
  {
    name: "Maître Sophie BERNHEIM",
    org: "SCP Bernheim & Partners",
    profession: "Notaire",
    localisation: "Paris 8e",
    specialite: "Transmission · démembrement",
    dossiers: 14,
    gold: true,
  },
  {
    name: "Maître Pascal BONNARD",
    org: "Cabinet indépendant",
    profession: "Avocat",
    localisation: "Paris 16e",
    specialite: "Droit fiscal · IFI",
    dossiers: 11,
    gold: true,
  },
  {
    name: "Cabinet GRANT THORNTON",
    org: "Antoine DELMAS · associé",
    profession: "Expert-comptable",
    localisation: "Paris La Défense",
    specialite: "Holdings · sociétés patrimoniales",
    dossiers: 9,
    gold: false,
  },
  {
    name: "Maître Catherine ROSSI",
    org: "Étude Rossi-Marchand",
    profession: "Notaire",
    localisation: "Lyon 6e",
    specialite: "Successions · donation",
    dossiers: 7,
    gold: false,
  },
  {
    name: "Maître Julien VERMEULEN",
    org: "Vermeulen & Associés",
    profession: "Avocat",
    localisation: "Bordeaux",
    specialite: "Droit des sociétés · pacte d'associés",
    dossiers: 6,
    gold: false,
  },
  {
    name: "Cabinet MAZARS",
    org: "Cellule patrimoniale",
    profession: "Expert-comptable",
    localisation: "Strasbourg",
    specialite: "Audit · structuration fiscale",
    dossiers: 5,
    gold: false,
  },
];

const RECO_FILTRES = [
  { key: "tous", label: "Tous" },
  { key: "Notaire", label: "Notaires (6)" },
  { key: "Avocat", label: "Avocats (5)" },
  { key: "Expert-comptable", label: "Experts-comptables (7)" },
] as const;

type RecoFiltre = (typeof RECO_FILTRES)[number]["key"];

type StatutTone = "success" | "info";

type Apporteur = {
  name: string;
  org: string;
  profil: string;
  dossiers: string[];
  total: number;
  totalDepuis: string;
  ca: string;
  statut: string;
  statutTone: StatutTone;
  gold: boolean;
  groupe: "pros" | "immo" | "ambassadeur" | "media";
};

const APPORTEURS: Apporteur[] = [
  {
    name: "Linda TRABELSI",
    org: "Cabinet d'avocat",
    profil: "Avocat",
    dossiers: [
      "Dossier MOREAU-2026-04 · Romain BERTHIER",
      "Dossier ROUSSEAU-2026-02 · Émilie LAMBERT",
      "Dossier VIDAL-2025-11 · Antoine ROSSI + 5 autres dossiers",
    ],
    total: 8,
    totalDepuis: "dossiers depuis 2024",
    ca: "186 400 €",
    statut: "Top apporteur",
    statutTone: "success",
    gold: true,
    groupe: "pros",
  },
  {
    name: "Maître Hugo PERIER",
    org: "Notaire indépendant",
    profil: "Notaire",
    dossiers: ["Dossier LEROY-2026-04 · Antoine ROSSI"],
    total: 5,
    totalDepuis: "dossiers depuis 2024",
    ca: "112 200 €",
    statut: "Actif",
    statutTone: "success",
    gold: false,
    groupe: "pros",
  },
  {
    name: "Cabinet ARTHURIMMO",
    org: "Agent immobilier · Lyon",
    profil: "Agent immo",
    dossiers: ["Dossier HUYGHE-2026-03 · Émilie LAMBERT"],
    total: 4,
    totalDepuis: "dossiers depuis 2025",
    ca: "68 000 €",
    statut: "Actif",
    statutTone: "success",
    gold: false,
    groupe: "immo",
  },
  {
    name: "Famille DELANNOY",
    org: "Client ambassadeur · servi par Luc THILLIEZ",
    profil: "Client ambassadeur",
    dossiers: ["Dossier neveu DELANNOY-2026-04 · Luc THILLIEZ"],
    total: 3,
    totalDepuis: "dossiers depuis 2024",
    ca: "52 800 €",
    statut: "VIP",
    statutTone: "success",
    gold: false,
    groupe: "ambassadeur",
  },
  {
    name: "Cabinet GRANT THORNTON",
    org: "Aussi partenaire recommandable (cf. section 1)",
    profil: "Expert-comptable",
    dossiers: ["Dossier SAS MAILLARD-2026-02 · Émilie LAMBERT"],
    total: 3,
    totalDepuis: "dossiers depuis 2025",
    ca: "48 600 €",
    statut: "Actif",
    statutTone: "success",
    gold: false,
    groupe: "pros",
  },
  {
    name: 'Podcast "Patrimoine & Cie"',
    org: "Marc LEMAIRE · podcasteur",
    profil: "Média / influence",
    dossiers: ["Dossier MARTINEAU-2026-04 · Jordan AGNESSENS"],
    total: 2,
    totalDepuis: "dossiers depuis 2026",
    ca: "32 400 €",
    statut: "Émergent",
    statutTone: "info",
    gold: false,
    groupe: "media",
  },
  {
    name: "Maître Pascal BONNARD",
    org: "Aussi partenaire recommandable (cf. section 1)",
    profil: "Avocat",
    dossiers: ["Dossier BERTHAUD-2026-03 · Marvin MOUTON"],
    total: 2,
    totalDepuis: "dossiers depuis 2025",
    ca: "28 800 €",
    statut: "Actif",
    statutTone: "success",
    gold: false,
    groupe: "pros",
  },
];

const APP_FILTRES = [
  { key: "tous", label: "Tous" },
  { key: "pros", label: "Pros (avocat·notaire·EC)" },
  { key: "immo", label: "Agents immobiliers" },
  { key: "ambassadeur", label: "Clients ambassadeurs" },
  { key: "media", label: "Médias / influence" },
] as const;

type AppFiltre = (typeof APP_FILTRES)[number]["key"];

export function PartenairesClient() {
  const [recoFiltre, setRecoFiltre] = useState<RecoFiltre>("tous");
  const [recoRecherche, setRecoRecherche] = useState("");
  const [appFiltre, setAppFiltre] = useState<AppFiltre>("tous");
  const [appRecherche, setAppRecherche] = useState("");

  const recommandables = useMemo(() => {
    const q = recoRecherche.trim().toLowerCase();
    return RECOMMANDABLES.filter((r) => {
      if (recoFiltre !== "tous" && r.profession !== recoFiltre) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.org.toLowerCase().includes(q) ||
        r.localisation.toLowerCase().includes(q) ||
        r.specialite.toLowerCase().includes(q)
      );
    });
  }, [recoFiltre, recoRecherche]);

  const apporteurs = useMemo(() => {
    const q = appRecherche.trim().toLowerCase();
    return APPORTEURS.filter((a) => {
      if (appFiltre !== "tous" && a.groupe !== appFiltre) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.org.toLowerCase().includes(q) ||
        a.profil.toLowerCase().includes(q) ||
        a.dossiers.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [appFiltre, appRecherche]);

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">
            Partenaires · environnement professionnel · Cabinet Paris Étoile
          </div>
          <h1 className="hero-title">
            Partenaires &amp; <strong>apporteurs d&apos;affaires</strong>
          </h1>
          <p className="hero-sub">
            Deux populations distinctes : les <strong>partenaires recommandables</strong> que
            PRIVEOS active pour ses clients (notaires, avocats, experts comptables identifiés et
            qualifiés), et les <strong>apporteurs d&apos;affaires</strong> qui amènent des clients à
            notre réseau (avocats, notaires, comptables, agents immo, clients satisfaits,
            podcasteurs...).
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-ghost btn-sm">Exporter</button>
          <button className="btn btn-gold btn-sm">
            <svg>
              <use href="#i-new" />
            </svg>
            Nouveau partenaire
          </button>
        </div>
      </div>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Partenaires actifs</div>
          <div className="kpi-value">42</div>
          <div className="kpi-meta">recommandables + apporteurs</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Recommandés au client</div>
          <div className="kpi-value">18</div>
          <div className="kpi-meta">notaires, avocats, comptables identifiés</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Apporteurs d&apos;affaires</div>
          <div className="kpi-value">24</div>
          <div className="kpi-meta">amènent des clients au cabinet</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Affaires apportées 2026</div>
          <div className="kpi-value">38</div>
          <div className="kpi-meta">clients entrés via apporteurs</div>
        </div>
      </div>

      {/* SECTION 1 : Partenaires recommandables que PRIVEOS active pour ses clients */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">1 · Partenaires identifiés et qualifiés par PRIVEOS</div>
            <div className="section-title">
              <strong>Partenaires à qui je transmets des clients</strong>
            </div>
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
            Notaires · Avocats · Experts-comptables que les ingénieurs peuvent activer pour un
            dossier
          </span>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                18 partenaires recommandables
              </span>
              {RECO_FILTRES.map((f) => (
                <button
                  key={f.key}
                  className={f.key === recoFiltre ? "qf-perf active" : "qf-perf"}
                  onClick={() => setRecoFiltre(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="table-toolbar-right">
              <div className="search-wrap">
                <svg>
                  <use href="#i-search" />
                </svg>
                <input
                  className="search-input"
                  placeholder="Rechercher..."
                  value={recoRecherche}
                  onChange={(e) => setRecoRecherche(e.target.value)}
                />
              </div>
            </div>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th>Partenaire</th>
                <th>Profession</th>
                <th>Localisation</th>
                <th>Spécialité</th>
                <th className="num">Dossiers traités 2026</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recommandables.map((r) => (
                <tr key={r.name}>
                  <td>
                    <div className="cell-primary">{r.name}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{r.org}</div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: PRO_BADGE[r.profession].bg,
                        color: PRO_BADGE[r.profession].color,
                      }}
                    >
                      {r.profession}
                    </span>
                  </td>
                  <td>{r.localisation}</td>
                  <td>{r.specialite}</td>
                  <td className={r.gold ? "num cell-money gold" : "num cell-money"}>{r.dossiers}</td>
                  <td className="center">
                    <button className="btn btn-ghost btn-sm">Voir</button>
                  </td>
                </tr>
              ))}
              <tr style={{ background: "var(--ivory)" }}>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    fontSize: "11.5px",
                    color: "var(--navy-300)",
                    padding: "14px",
                  }}
                >
                  … 12 autres partenaires recommandables ·{" "}
                  <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                    Voir l&apos;intégralité (18)
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2 : Apporteurs d'affaires */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">
              2 · Personnes qui amènent des clients à PRIVEOS et au cabinet
            </div>
            <div className="section-title">
              <strong>Apporteurs d&apos;affaires</strong>
            </div>
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
            Avocats · Notaires · Comptables · Agents immo · Clients satisfaits · Podcasteurs ·
            Influenceurs
          </span>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                24 apporteurs d&apos;affaires actifs
              </span>
              {APP_FILTRES.map((f) => (
                <button
                  key={f.key}
                  className={f.key === appFiltre ? "qf-perf active" : "qf-perf"}
                  onClick={() => setAppFiltre(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="table-toolbar-right">
              <div className="search-wrap">
                <svg>
                  <use href="#i-search" />
                </svg>
                <input
                  className="search-input"
                  placeholder="Rechercher..."
                  value={appRecherche}
                  onChange={(e) => setAppRecherche(e.target.value)}
                />
              </div>
            </div>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th>Apporteur</th>
                <th>Profil</th>
                <th>Dossier concerné</th>
                <th className="num">Affaires totales apportées</th>
                <th className="num">CA généré cumul</th>
                <th>Statut</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apporteurs.map((a) => {
                const rowSpan = a.dossiers.length;
                return (
                  <Fragment key={a.name}>
                    {a.dossiers.map((dossier, di) => {
                      const isFirst = di === 0;
                      const hasExtra = dossier.includes("+ 5 autres dossiers");
                      const dossierMain = hasExtra
                        ? dossier.replace(" + 5 autres dossiers", "")
                        : dossier;
                      return (
                        <tr key={`${a.name}-${di}`}>
                          {isFirst && (
                            <td rowSpan={rowSpan}>
                              <div className="cell-primary">{a.name}</div>
                              <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                                {a.org}
                              </div>
                            </td>
                          )}
                          {isFirst && (
                            <td rowSpan={rowSpan}>
                              <span
                                className="badge"
                                style={{
                                  background: PRO_BADGE[a.profil].bg,
                                  color: PRO_BADGE[a.profil].color,
                                }}
                              >
                                {a.profil}
                              </span>
                            </td>
                          )}
                          <td>
                            {dossierMain}
                            {hasExtra && (
                              <span style={{ color: "var(--navy-300)", fontSize: "10px" }}>
                                {" "}
                                + 5 autres dossiers
                              </span>
                            )}
                          </td>
                          {isFirst && (
                            <td
                              className={a.gold ? "num cell-money gold" : "num cell-money"}
                              rowSpan={rowSpan}
                              style={{ verticalAlign: "middle", fontSize: "18px" }}
                            >
                              <strong>{a.total}</strong>
                              <div
                                style={{
                                  fontSize: "9.5px",
                                  color: "var(--navy-300)",
                                  fontWeight: 400,
                                  marginTop: "2px",
                                }}
                              >
                                {a.totalDepuis}
                              </div>
                            </td>
                          )}
                          {isFirst && (
                            <td
                              className={a.gold ? "num cell-money gold" : "num cell-money"}
                              rowSpan={rowSpan}
                              style={{ verticalAlign: "middle" }}
                            >
                              {a.ca}
                            </td>
                          )}
                          {isFirst && (
                            <td rowSpan={rowSpan} style={{ verticalAlign: "middle" }}>
                              <span className={`badge badge-${a.statutTone}`}>{a.statut}</span>
                            </td>
                          )}
                          {isFirst && (
                            <td className="center" rowSpan={rowSpan} style={{ verticalAlign: "middle" }}>
                              <button className="btn btn-ghost btn-sm">Voir</button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
              <tr style={{ background: "var(--ivory)" }}>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    fontSize: "11.5px",
                    color: "var(--navy-300)",
                    padding: "14px",
                  }}
                >
                  … 17 autres apporteurs d&apos;affaires ·{" "}
                  <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                    Voir l&apos;intégralité (24)
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              marginTop: "14px",
              padding: "12px 14px",
              background: "var(--ivory)",
              borderLeft: "3px solid var(--gold)",
              borderRadius: "5px",
              fontSize: "11px",
              color: "var(--navy-300)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--navy)" }}>Lecture :</strong> chaque apporteur peut amener
            plusieurs dossiers (exemple Linda TRABELSI · Cabinet d&apos;avocat avec 8 dossiers
            cumulés depuis 2024). La colonne{" "}
            <strong style={{ color: "var(--gold-deep)" }}>Affaires totales apportées</strong> donne
            la vue cumulée pour identifier les apporteurs récurrents et fidéliser la relation.
          </div>
        </div>
      </div>
    </>
  );
}
