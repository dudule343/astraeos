"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useMemo, useState } from "react";

type Etape = "asigner" | "audit" | "auditionner";

type Candidat = {
  nom: string;
  sousTitre?: string;
  role: string;
  localisation: string;
  origine: string;
  anciennete: string;
  patrimCa: string;
  contrat: string;
  etape: Etape;
  etapeLabel: string;
  date: string;
  action: string;
  actionGold: boolean;
};

const CANDIDATS: Candidat[] = [
  {
    nom: "Florence MERCIER",
    sousTitre: "Diplôme CIF · ORIAS valide",
    role: "Senior · 8 ans+",
    localisation: "Paris 8e",
    origine: "Cooptation",
    anciennete: "12 ans",
    patrimCa: "280 k€/an",
    contrat: "CDI",
    etape: "asigner",
    etapeLabel: "À signer",
    date: "15 mars 2026",
    action: "Signer",
    actionGold: true,
  },
  {
    nom: "Henri CASTELLANI",
    sousTitre: "Master GP · ORIAS valide",
    role: "Senior · 5 ans+",
    localisation: "Paris 8e",
    origine: "Site web ASTRAEOS",
    anciennete: "8 ans",
    patrimCa: "180 k€/an",
    contrat: "CDI",
    etape: "asigner",
    etapeLabel: "À signer",
    date: "22 mars 2026",
    action: "Signer",
    actionGold: true,
  },
  {
    nom: "Christian WEBER",
    role: "Senior · 10 ans+",
    localisation: "Paris 8e",
    origine: "Salon CGP",
    anciennete: "15 ans",
    patrimCa: "220 k€/an",
    contrat: "CDI",
    etape: "audit",
    etapeLabel: "En audit dossier",
    date: "02 avr. 2026",
    action: "Voir",
    actionGold: false,
  },
  {
    nom: "Jean-Pierre RAVAUD",
    role: "Confirmé · 5 ans+",
    localisation: "Paris 8e",
    origine: "Cooptation",
    anciennete: "10 ans",
    patrimCa: "150 k€/an",
    contrat: "CDI",
    etape: "audit",
    etapeLabel: "En audit dossier",
    date: "10 avr. 2026",
    action: "Voir",
    actionGold: false,
  },
  {
    nom: "Sandrine LARROQUE",
    role: "Camille BERTRAND Côte",
    localisation: "Biarritz",
    origine: "LinkedIn",
    anciennete: "7 ans",
    patrimCa: "120 k€/an",
    contrat: "CDI",
    etape: "audit",
    etapeLabel: "En audit dossier",
    date: "15 avr. 2026",
    action: "Voir",
    actionGold: false,
  },
  {
    nom: "Béatrice DUVAL",
    role: "Luc THILLIEZ",
    localisation: "Reims",
    origine: "Site web ASTRAEOS",
    anciennete: "9 ans",
    patrimCa: "140 k€/an",
    contrat: "CDI",
    etape: "audit",
    etapeLabel: "En audit dossier",
    date: "20 avr. 2026",
    action: "Voir",
    actionGold: false,
  },
  {
    nom: "Michel ALLARD",
    role: "Julien VASSEUR",
    localisation: "Avignon",
    origine: "Cooptation",
    anciennete: "14 ans",
    patrimCa: "200 k€/an",
    contrat: "CDI",
    etape: "auditionner",
    etapeLabel: "À auditionner",
    date: "25 avr. 2026",
    action: "Planifier",
    actionGold: false,
  },
  {
    nom: "Pauline VERNET",
    role: "Sophie MERCIER",
    localisation: "Grenoble",
    origine: "Recommandation",
    anciennete: "6 ans",
    patrimCa: "100 k€/an",
    contrat: "CDI",
    etape: "auditionner",
    etapeLabel: "À auditionner",
    date: "02 mai 2026",
    action: "Planifier",
    actionGold: false,
  },
  {
    nom: "Vincent BOULAY",
    role: "Thomas LEROY",
    localisation: "Caen",
    origine: "Site web ASTRAEOS",
    anciennete: "5 ans",
    patrimCa: "90 k€/an",
    contrat: "CDI",
    etape: "auditionner",
    etapeLabel: "À auditionner",
    date: "06 mai 2026",
    action: "Planifier",
    actionGold: false,
  },
];

type Filtre = "toutes" | Etape;

const FILTRES: { key: Filtre; label: string; count: number }[] = [
  { key: "toutes", label: "Toutes (9)", count: 9 },
  { key: "auditionner", label: "À auditionner (3)", count: 3 },
  { key: "audit", label: "En audit (4)", count: 4 },
  { key: "asigner", label: "À signer (2)", count: 2 },
];

export function RecrutementClient() {
  const [filtre, setFiltre] = useState<Filtre>("toutes");
  const [recherche, setRecherche] = useState("");

  const lignes = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return CANDIDATS.filter((c) => {
      if (filtre !== "toutes" && c.etape !== filtre) return false;
      if (q) {
        const hay = [
          c.nom,
          c.sousTitre ?? "",
          c.role,
          c.localisation,
          c.origine,
          c.etapeLabel,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filtre, recherche]);

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
            Candidatures · parcours de recrutement
          </span>
          {FILTRES.map((f) => (
            <button
              key={f.key}
              className={f.key === filtre ? "qf-perf active" : "qf-perf"}
              onClick={() => setFiltre(f.key)}
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
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>
      </div>
      <table className="dt">
        <thead>
          <tr>
            <th>Candidat</th>
            <th>Rôle pressenti</th>
            <th>Localisation</th>
            <th>Origine</th>
            <th className="num">Anc. métier</th>
            <th className="num">Patrim. CA</th>
            <th>Type de contrat</th>
            <th>Étape</th>
            <th>Date dépôt</th>
            <th className="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((c) => (
            <tr className="dt-clickable" key={c.nom}>
              <td>
                <div className="cell-primary">{c.nom}</div>
                {c.sousTitre && (
                  <div style={{ fontSize: 10.5, color: "var(--navy-300)" }}>{c.sousTitre}</div>
                )}
              </td>
              <td>{c.role}</td>
              <td>{c.localisation}</td>
              <td>{c.origine}</td>
              <td className="num">{c.anciennete}</td>
              <td className="num">{c.patrimCa}</td>
              <td>
                <span className="badge badge-gold">{c.contrat}</span>
              </td>
              <td>
                {c.etape === "asigner" && (
                  <span className="badge badge-success">{c.etapeLabel}</span>
                )}
                {c.etape === "audit" && (
                  <span className="badge badge-info">{c.etapeLabel}</span>
                )}
                {c.etape === "auditionner" && (
                  <span
                    className="badge"
                    style={{ background: "var(--gold-200)", color: "var(--medium-400)" }}
                  >
                    {c.etapeLabel}
                  </span>
                )}
              </td>
              <td>{c.date}</td>
              <td className="center">
                <button className={c.actionGold ? "btn btn-gold btn-sm" : "btn btn-ghost btn-sm"}>
                  {c.action}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          padding: "14px 18px",
          background: "var(--ivory)",
          fontSize: 11,
          color: "var(--navy-300)",
          borderTop: "1px solid var(--navy-100)",
        }}
      >
        <strong style={{ color: "var(--navy)" }}>Note développeur :</strong> la colonne
        &quot;Modèle visé&quot; est <strong>indicative</strong> — c&apos;est l&apos;attente du
        candidat ou la recommandation interne. Le modèle <strong>définitif</strong> est arrêté à la
        signature, dans l&apos;écran Souscription (Espace Éditeur Doc 2).
      </div>
    </div>
  );
}
