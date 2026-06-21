"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { FinancierClient, FinancierTotal } from "../../_data/assets-financier";

/**
 * Tableau « Détail de mes placements » de l'écran investissement financier.
 *
 * Portage fidèle de la maquette v28 : dans le wireframe chaque ligne porte
 * `<tr onclick="goToPage('ing-fiche-client')">`, c'est la LIGNE entière qui
 * navigue vers la fiche client. On reproduit ça avec un vrai handler client
 * (useRouter) sur la ligne, plus un onKeyDown pour l'accessibilité clavier.
 * Le « Voir → » est rendu comme un vrai <Link href> (pas un bouton inerte qui
 * dépendrait du bubbling), aligné sur le pattern éprouvé de ClientsTable :
 * navigable au clavier, ouvrable dans un nouvel onglet, clic-droit fonctionnel.
 */
export function PlacementsTable({
  clients,
  total,
}: {
  clients: FinancierClient[];
  total: FinancierTotal;
}) {
  const router = useRouter();

  return (
    <table className="dt">
      <thead>
        <tr>
          <th>Clients</th>
          <th className="num">Contrats actifs</th>
          <th>Types souscrits</th>
          <th>Dates de souscription</th>
          <th className="num">Encours total</th>
          <th className="center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => {
          const href = `/espace-ingenieur/clients/${client.slug}`;
          return (
            <tr
              key={client.nom}
              className="dt-clickable"
              role="link"
              tabIndex={0}
              onClick={() => router.push(href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(href);
                }
              }}
            >
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className="ingenieur-avatar">{client.initiales}</div>
                  <div className="cell-primary">{client.nom}</div>
                </div>
              </td>
              <td className="num" style={{ verticalAlign: "middle" }}>
                {client.contratsActifs}
              </td>
              <td style={{ lineHeight: "1.9" }}>
                {client.types.map((t, i) => (
                  <span key={t.label}>
                    <span
                      className="badge badge-gold"
                      style={{
                        fontSize: "10px",
                        display: "inline-block",
                        marginBottom: i < client.types.length - 1 ? "3px" : undefined,
                      }}
                    >
                      {t.label}
                    </span>
                    {i < client.types.length - 1 ? <br /> : null}
                  </span>
                ))}
              </td>
              <td className="nowrap" style={{ fontSize: "11px", lineHeight: "1.9" }}>
                {client.dates.map((d, i) => (
                  <span key={d}>
                    {d}
                    {i < client.dates.length - 1 ? <br /> : null}
                  </span>
                ))}
              </td>
              <td className="num cell-money gold" style={{ verticalAlign: "middle" }}>
                {client.encoursTotal}
              </td>
              <td className="center" style={{ verticalAlign: "middle" }}>
                <Link
                  className="btn btn-ghost btn-sm"
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir →
                </Link>
              </td>
            </tr>
          );
        })}
        <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
          <td>
            <strong>Total portefeuille</strong>
          </td>
          <td className="num">
            <strong>{total.contratsActifs}</strong>
          </td>
          <td
            colSpan={2}
            style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy)" }}
          >
            {total.meta}
          </td>
          <td className="num cell-money gold">{total.encoursTotal}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
}
