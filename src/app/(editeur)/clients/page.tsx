// Espace éditeur — page « Clients totaux actifs » (route /clients).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-clients">, lignes 2424-2623. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import Link from "next/link";

import { EditeurTopbar } from "../_components/EditeurTopbar";
import { ClientsTable } from "./ClientsTable";
import { kpis } from "./clientsData";

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Clients totaux actifs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Opérations clients</div>
            <h1 className="hero-title">Clients totaux actifs</h1>
            <p className="hero-sub">
              La liste des clients qui paient un abonnement à ASTRAEOS, répartie en 3 catégories :
              marques (franchise, licence, réseau), cabinets directs indépendants, autres
              professionnels (notaires, avocats, experts-comptables).
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export CSV">
              <svg>
                <use href="#i-download" />
              </svg>
              Export CSV
            </button>
            <Link className="btn btn-gold btn-sm" href="/client-new">
              <svg>
                <use href="#i-new" />
              </svg>
              Nouveau client
            </Link>
          </div>
        </div>

        <div className="kpis kpis-6 mb-20">
          {kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">
                {k.value}
                {k.unit ? (
                  <>
                    {" "}
                    <span className="unit">{k.unit}</span>
                  </>
                ) : null}
              </div>
              <div className="kpi-meta">{k.meta}</div>
            </div>
          ))}
        </div>

        <ClientsTable />
      </div>
    </>
  );
}
