// Espace éditeur — page « Infrastructure » (route /infra).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-infra">, lignes 1996-2055. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";

type Kpi = { label: string; value: string; unit?: string; meta: string };

const STABILITY_KPIS: Kpi[] = [
  { label: "Disponibilité 30 jours", value: "99,98", unit: "%", meta: "2 min d'indisponibilité" },
  { label: "Temps de réponse moyen", value: "142", unit: "ms", meta: "P95 : 380 ms" },
  { label: "Erreurs serveur 5xx", value: "0,03", unit: "%", meta: "stable · seuil < 0,1 %" },
  { label: "Incidents 30j", value: "0", meta: "aucun depuis 47 jours" },
];

const AI_KPIS: Kpi[] = [
  { label: "Tokens consommés ce mois", value: "42,6", unit: "M", meta: "42,6 millions · ▲ +18 %" },
  { label: "Coût IA mensuel", value: "3 480", unit: "€", meta: "refacturé aux clients via packs" },
  { label: "Marge IA brute", value: "68", unit: "%", meta: "revenus IA / coûts IA" },
];

const CLOUD_KPIS: Kpi[] = [
  { label: "Coût cloud mensuel", value: "1 240", unit: "€", meta: "AWS + Cloudflare + Supabase" },
  { label: "Stockage utilisé", value: "428", unit: "Go", meta: "documents clients + backups" },
  { label: "Bande passante", value: "2,4", unit: "To", meta: "trafic sortant 30 jours" },
];

type Job = {
  job: string;
  frequence: string;
  derniere: string;
  duree: string;
};

const JOBS: Job[] = [
  { job: "Synchronisation ORIAS", frequence: "Quotidien · 03h00", derniere: "06 mai · 03h00", duree: "42 s" },
  { job: "Recalcul scores santé", frequence: "Quotidien · 04h00", derniere: "06 mai · 04h00", duree: "18 s" },
  { job: "Backup base de données", frequence: "Quotidien · 02h00", derniere: "06 mai · 02h00", duree: "8 min" },
  { job: "Génération rapports hebdo", frequence: "Hebdomadaire · lun 06h00", derniere: "05 mai · 06h00", duree: "2 min" },
  { job: "Relances facturation", frequence: "Hebdomadaire · jeu 09h00", derniere: "02 mai · 09h00", duree: "14 s" },
  { job: "Nettoyage logs > 90 jours", frequence: "Mensuel · 1er du mois", derniere: "01 mai · 03h30", duree: "3 min" },
];

function KpiBlock({ kpi }: { kpi: Kpi }) {
  return (
    <div className="kpi">
      <span className="phase-tag p1">PHASE 1</span>
      <div className="kpi-label">{kpi.label}</div>
      <div className="kpi-value">
        {kpi.value}
        {kpi.unit ? <span className="unit">{kpi.unit}</span> : null}
      </div>
      <div className="kpi-meta">{kpi.meta}</div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <EditeurTopbar current="08 · Infrastructure" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 08 · Infrastructure</div>
            <h1 className="hero-title">Infrastructure</h1>
            <p className="hero-sub">
              Superviser la stabilité technique de la plateforme — disponibilité, temps de réponse
              serveur, consommation IA et cloud, jobs automatiques.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Stabilité</div>
              <div className="section-title">Disponibilité de la plateforme</div>
            </div>
          </div>
          <div className="kpis">
            {STABILITY_KPIS.map((kpi) => (
              <KpiBlock key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Consommation IA</div>
              <div className="section-title">Usage des modèles d&apos;intelligence artificielle</div>
            </div>
          </div>
          <div className="kpis kpis-3">
            {AI_KPIS.map((kpi) => (
              <KpiBlock key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Infrastructure cloud</div>
              <div className="section-title">Consommation des ressources serveur</div>
            </div>
          </div>
          <div className="kpis kpis-3">
            {CLOUD_KPIS.map((kpi) => (
              <KpiBlock key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Automatisations</div>
              <div className="section-title">
                Tâches planifiées de la plateforme · jobs automatiques
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>Job automatique</th>
                  <th>Fréquence</th>
                  <th>Dernière exécution</th>
                  <th className="num">Durée</th>
                  <th className="center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {JOBS.map((j) => (
                  <tr key={j.job}>
                    <td className="cell-primary">{j.job}</td>
                    <td>{j.frequence}</td>
                    <td>{j.derniere}</td>
                    <td className="num">{j.duree}</td>
                    <td className="center">
                      <span className="badge badge-success">OK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
