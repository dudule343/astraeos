"use client";

import { useRouter } from "next/navigation";

import type { AssetsAssurance } from "../../_data/assets-assurance";

/**
 * Table « Détail de mes contrats d'assurance ».
 *
 * Portage fidèle de la maquette (page-ing-assets-assurance) : dans le wireframe
 * chaque ligne porte `<tr style="cursor:pointer" onclick="goToPage('ing-fiche-client')">`,
 * c'est la LIGNE entière qui navigue vers la fiche client. Le nom du client est un
 * simple `<div class="cell-primary">` (pas un lien) et le bouton « Voir → » est un
 * `<button>` sans lien propre : tous deux héritent du clic de la ligne. On reproduit
 * exactement ce comportement avec un vrai handler client (useRouter).
 */
export function ContratsAssuranceTable({
  clients,
  total,
}: {
  clients: AssetsAssurance["clients"];
  total: AssetsAssurance["total"];
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
          <th className="num">Frais de dossier perçus</th>
          <th className="center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr
            key={c.clientId}
            className="dt-clickable"
            style={{ cursor: "pointer" }}
            role="link"
            tabIndex={0}
            onClick={() => router.push(c.ficheHref)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(c.ficheHref);
              }
            }}
          >
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="ingenieur-avatar">{c.initials}</div>
                <div className="cell-primary">{c.name}</div>
              </div>
            </td>
            <td className="num" style={{ verticalAlign: "middle" }}>
              {c.contracts.length}
            </td>
            <td style={c.contracts.length > 1 ? { lineHeight: 1.9 } : undefined}>
              {c.contracts.map((ct, i) => {
                const multi = c.contracts.length > 1;
                const last = i === c.contracts.length - 1;
                return (
                  <span key={i}>
                    <span
                      className="badge badge-gold"
                      style={{
                        fontSize: "10px",
                        ...(multi ? { display: "inline-block" } : {}),
                        ...(multi && !last ? { marginBottom: "3px" } : {}),
                      }}
                    >
                      {ct.label}
                    </span>
                    {last ? null : <br />}
                  </span>
                );
              })}
            </td>
            <td
              className="nowrap"
              style={{
                fontSize: "11px",
                ...(c.contracts.length > 1 ? { lineHeight: 1.9 } : {}),
              }}
            >
              {c.contracts.map((ct, i) => (
                <span key={i}>
                  {ct.date}
                  {i < c.contracts.length - 1 ? <br /> : null}
                </span>
              ))}
            </td>
            <td className="num cell-money gold" style={{ verticalAlign: "middle" }}>
              {c.fees}
            </td>
            <td className="center" style={{ verticalAlign: "middle" }}>
              <button type="button" className="btn btn-ghost btn-sm">
                Voir →
              </button>
            </td>
          </tr>
        ))}
        <tr className="dt-total">
          <td>
            <strong>Total portefeuille</strong>
          </td>
          <td className="num">
            <strong>{total.contracts}</strong>
          </td>
          <td colSpan={2} style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy)" }}>
            {total.clientsLabel}
          </td>
          <td className="num cell-money gold">{total.fees}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}
