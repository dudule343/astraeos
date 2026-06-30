import Link from "next/link";

import { clientInitials } from "../../_data/clients";
import {
  getClientsForPicker,
  getEtudesPatrimoniales,
} from "../../_data/etudes-patrimoniales-server";
import {
  ETUDE_STATUT_VARIANT,
  statutLabel,
  type EtudeStatutVariant,
} from "../../_data/etudes-patrimoniales";
import "../../_styles/etudes-patrimoniales.css";

import CreerEtudeButton from "./CreerEtudeButton";

export const metadata = {
  title: "ASTRAEOS · Études patrimoniales",
};

export const dynamic = "force-dynamic";

const BASE = "/espace-ingenieur/etudes-patrimoniales";

/** Couplets background/color du badge de statut, charte ingénieur. */
const STATUT_STYLE: Record<EtudeStatutVariant, { background: string; color: string }> = {
  info: { background: "var(--light-blue)", color: "var(--navy)" },
  goldStrong: { background: "rgba(198,142,14,0.15)", color: "var(--gold-deep)" },
  gold: { background: "var(--gold-100)", color: "var(--gold-deep)" },
  green: { background: "#E8F5EE", color: "var(--green-text)" },
};

export default async function EtudesPatrimonialesPage() {
  const [etudes, clients] = await Promise.all([
    getEtudesPatrimoniales(),
    getClientsForPicker(),
  ]);

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Outils · production de l&apos;audit patrimonial</div>
          <h1 className="hero-title">
            Études <strong>patrimoniales</strong>
          </h1>
          <p className="hero-sub">
            Créez une étude par client, générez l&apos;audit pré-rempli depuis ses données réelles
            (foyer, fiscalité, profil de risque, produits placés), complétez chaque bloc et validez-le.
          </p>
        </div>
        <div className="hero-actions">
          <CreerEtudeButton clients={clients} />
        </div>
      </div>

      {/* LISTE DES ÉTUDES */}
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
              <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
              <path d="M14 3v5h5" />
              <path d="M9 13h6M9 17h6" />
            </svg>
            Mes études patrimoniales · {etudes.length} étude{etudes.length > 1 ? "s" : ""}
          </div>
        </div>

        {etudes.length === 0 ? (
          <div className="etude-empty">
            <div className="etude-empty-title">Aucune étude pour l&apos;instant</div>
            <p className="etude-empty-sub">
              Lancez votre première étude patrimoniale : choisissez un client de votre portefeuille
              ou créez un nouveau client. L&apos;audit sera pré-rempli avec ses données réelles.
            </p>
          </div>
        ) : (
          <table className="dt">
            <thead>
              <tr>
                <th>Client</th>
                <th>Titre</th>
                <th>Créée le</th>
                <th className="center">Statut</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {etudes.map((etude) => {
                const statut = STATUT_STYLE[ETUDE_STATUT_VARIANT[etude.statut]];
                const href = `${BASE}/${etude.id}`;
                return (
                  <tr key={etude.id} className="dt-clickable">
                    <td>
                      <Link
                        href={href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          textDecoration: "none",
                        }}
                      >
                        <div className="etude-avatar">{clientInitials(etude.clientNom)}</div>
                        <div className="cell-primary">{etude.clientNom}</div>
                      </Link>
                    </td>
                    <td>{etude.titre}</td>
                    <td className="nowrap">{etude.dateLabel}</td>
                    <td className="center">
                      <span
                        className="badge"
                        style={{
                          background: statut.background,
                          color: statut.color,
                          fontSize: "9.5px",
                        }}
                      >
                        {statutLabel(etude.statut)}
                      </span>
                    </td>
                    <td className="center">
                      <Link className="btn btn-ghost btn-sm" href={href}>
                        Ouvrir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
