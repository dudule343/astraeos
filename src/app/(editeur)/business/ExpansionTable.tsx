"use client";

import { useRouter } from "next/navigation";

import { expansionRows } from "./businessData";

// Top 5 des comptes en expansion. Dans la maquette chaque ligne porte
// onclick="goToPage('clients')" : on reproduit la navigation pleine ligne.
export function ExpansionTable() {
  const router = useRouter();

  return (
    <div className="table-wrap">
      <table className="dt">
        <thead>
          <tr>
            <th>#</th>
            <th>Compte</th>
            <th>Type</th>
            <th className="num">Abonnement /mois</th>
            <th className="num">Dépensé en packs</th>
            <th className="num">Revenu total apporté</th>
            <th className="center">vs M-1</th>
            <th className="center">vs N-1</th>
          </tr>
        </thead>
        <tbody>
          {expansionRows.map((row) => (
            <tr
              key={row.id}
              className="dt-clickable"
              onClick={() => router.push("/clients")}
            >
              <td className="num cell-id">{row.id}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className={`tlogo ${row.logoCls}`}>{row.logoText}</div>
                  <div className="cell-primary">{row.name}</div>
                </div>
              </td>
              <td>
                <span className={`tt ${row.typeCls}`}>{row.typeLabel}</span>
              </td>
              <td className="num cell-money">{row.abo}</td>
              <td className="num cell-money">{row.packs}</td>
              <td className="num cell-money gold">{row.total}</td>
              <td className="center">
                <span className={`badge ${row.vsM1.cls}`}>{row.vsM1.text}</span>
              </td>
              <td className="center">
                <span className={`badge ${row.vsN1.cls}`}>{row.vsN1.text}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
