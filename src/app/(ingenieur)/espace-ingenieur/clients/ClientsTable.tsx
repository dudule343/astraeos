"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Client, StatutVariant } from "../../_data/clients";

/** Couplets background/color du badge de statut, repris à l'identique de la maquette. */
const STATUT_STYLE: Record<StatutVariant, { background: string; color: string }> = {
  gold: { background: "var(--gold-100)", color: "var(--gold-deep)" },
  goldStrong: { background: "rgba(198,142,14,0.15)", color: "var(--gold-deep)" },
  orange: { background: "rgba(229,124,75,0.15)", color: "var(--orange-text)" },
  info: { background: "var(--light-blue)", color: "var(--navy)" },
  green: { background: "#E8F5EE", color: "var(--green-text)" },
};

function TypeBadge({ type }: { type: Client["type"] }) {
  if (type === "Personne morale") {
    return (
      <span
        className="badge"
        style={{ background: "var(--light-blue)", color: "var(--navy)", fontSize: "9.5px" }}
      >
        Personne morale
      </span>
    );
  }
  return (
    <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
      Personne physique
    </span>
  );
}

type ClientsTableProps = {
  clients: Client[];
  cardTitle: string;
  totalPortefeuille: string;
  totalMeta: string;
};

export default function ClientsTable({
  clients,
  cardTitle,
  totalPortefeuille,
  totalMeta,
}: ClientsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) =>
      [client.nom, client.details, client.type, client.statutLabel]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [clients, query]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
            <path d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" />
          </svg>
          {cardTitle}
        </div>
        <div className="search-wrap" style={{ marginLeft: "auto" }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.5-4.5" />
          </svg>
          <input
            className="search-input"
            placeholder="Rechercher un client..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Rechercher un client"
          />
        </div>
      </div>
      <table className="dt" style={{ fontSize: "12.5px" }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Type</th>
            <th>Date 1ère étude</th>
            <th>Dernière interaction</th>
            <th className="num">CA généré 2026</th>
            <th className="center">Statut</th>
            <th className="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((client) => {
            const statut = STATUT_STYLE[client.statutVariant];
            const ficheHref = `/espace-ingenieur/clients/${client.slug}`;
            return (
              <tr
                key={client.slug}
                className="dt-clickable"
                onClick={() => router.push(ficheHref)}
              >
                <td>
                  <Link
                    href={ficheHref}
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textDecoration: "none",
                    }}
                  >
                    <div className="ingenieur-avatar">{client.initiales}</div>
                    <div>
                      <div className="cell-primary">{client.nom}</div>
                      <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                        {client.details}
                      </div>
                    </div>
                  </Link>
                </td>
                <td>
                  <TypeBadge type={client.type} />
                </td>
                <td className="nowrap">{client.date1ereEtude}</td>
                <td className="nowrap">{client.derniereInteraction}</td>
                <td className={`num cell-money${client.caGold ? " gold" : ""}`}>
                  {client.caGenere2026}
                </td>
                <td className="center">
                  <span
                    className="badge"
                    style={{ background: statut.background, color: statut.color, fontSize: "9.5px" }}
                  >
                    {client.statutLabel}
                  </span>
                </td>
                <td className="center">
                  <Link
                    className="btn btn-ghost btn-sm"
                    href={ficheHref}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{ textAlign: "center", padding: "24px 16px", color: "var(--navy-300)" }}
              >
                Aucun client ne correspond à « {query} ».
              </td>
            </tr>
          )}
          <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
            <td colSpan={4}>
              <strong>Total portefeuille</strong>
            </td>
            <td className="num cell-money gold">{totalPortefeuille}</td>
            <td
              colSpan={2}
              style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy)" }}
            >
              {totalMeta}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
