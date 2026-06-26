// Espace éditeur — page « Finance consolidée » (route /finance).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-finance">, lignes 3352-4060. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { FinanceConsolidee, type FinanceView } from "./FinanceConsolidee";
import {
  type EditeurCommission,
  computeBreakdownByCategory,
  computeEditeurResultat,
  computeMonthlyRevenue,
  computeSourceRows,
  fetchEditeurCommissions,
  fmtEur,
  fmtEurCell,
  pct,
} from "./data";

export const metadata = {
  title: "ASTRAEOS · Finance consolidée",
};

export const dynamic = "force-dynamic";

// Construit la vue financière réelle (part marque de l'éditeur) à partir des
// commissions encaissées/dues, pré-formatée pour le composant client.
function buildFinanceView(commissions: EditeurCommission[]): FinanceView {
  const resultat = computeEditeurResultat(commissions);
  const breakdown = computeBreakdownByCategory(commissions);
  const monthly = computeMonthlyRevenue(commissions);
  const rows = computeSourceRows(commissions);
  const total = resultat.totalGenere;
  const maxMonth = Math.max(1, ...monthly.map((m) => m.generated));

  return {
    caRealise: fmtEur(resultat.totalGenere),
    caEncaisse: fmtEur(resultat.totalEncaisse),
    encaisseMeta: `${pct(resultat.totalEncaisse, total)} encaissé`,
    repartition: breakdown.map((b) => ({
      label: b.label,
      pct: pct(b.generated, total),
      value: fmtEurCell(b.generated),
    })),
    monthly: monthly.map((m) => ({
      label: m.current ? `${m.label}*` : m.label,
      height: `${Math.round((m.generated / maxMonth) * 100)}%`,
      navy: m.current,
    })),
    packRows: rows.map((r) => ({
      pack: r.source,
      souscriptions: String(r.subs),
      genere: fmtEurCell(r.gen),
      encaisse: fmtEurCell(r.enc),
      reste: fmtEurCell(r.rest),
      pca: "—",
      part: pct(r.gen, total),
    })),
  };
}

export default async function Page() {
  const commissions = await fetchEditeurCommissions();
  const real = commissions.length > 0 ? buildFinanceView(commissions) : null;

  return (
    <>
      <EditeurTopbar current="Finance consolidée" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Pilotage interne</div>
            <h1 className="hero-title">Finance consolidée</h1>
            <p className="hero-sub">
              Pilotage financier complet d&apos;ASTRAEOS — compte de résultat avec évolution N/N-1,
              détail du CA généré, détail des charges par poste, trésorerie multi-comptes,
              prévisionnel et marge par client.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export comptable">
              <svg>
                <use href="#i-download" />
              </svg>
              Export comptable
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Connexion Qonto">
              Connexion Qonto
            </button>
          </div>
        </div>

        <FinanceConsolidee real={real} />
      </div>
    </>
  );
}
