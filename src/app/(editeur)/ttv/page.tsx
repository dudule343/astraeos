// Espace éditeur — page « Vitesse première valeur » (route /ttv).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-ttv">, lignes 1657-1712. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { fetchTtv } from "./data";

export const metadata = {
  title: "ASTRAEOS · Vitesse première valeur",
};

export const dynamic = "force-dynamic";

type MilestoneView = { label: string; value: string; unit?: string; meta?: string };
type FunnelView = { label: string; pct: number; strong: string; count: string };

const MILESTONES = [
  { label: "Connexion initiale", value: "4", unit: "min", meta: "après création compte" },
  { label: "Premier client ajouté", value: "2,4", unit: "jours", meta: "médiane" },
  { label: "Première étude patrimoniale", value: "5,8", unit: "jours", meta: "médiane" },
  { label: "Première simulation", value: "7,2", unit: "jours", meta: "médiane" },
  { label: "Premier rapport généré", value: "9,4", unit: "jours", meta: "médiane · révèle la valeur" },
] as const;

const FUNNEL = [
  { label: "Connexion initiale", pct: 100, strong: "100 %", count: "18/18" },
  { label: "Premier client ajouté", pct: 94, strong: "94 %", count: "17/18" },
  { label: "Première étude patrimoniale", pct: 78, strong: "78 %", count: "14/18" },
  { label: "Première simulation", pct: 61, strong: "61 %", count: "11/18" },
  { label: "Premier rapport généré", pct: 44, strong: "44 %", count: "8/18" },
] as const;

export default async function Page() {
  // Source réelle = délais médians dérivés des dossiers/études du cabinet et
  // funnel d'atteinte des jalons par la cohorte d'ingénieurs. Jalons non
  // instrumentés (connexion initiale, simulation) en état vide honnête.
  const data = await fetchTtv();
  const milestones: MilestoneView[] = data.hasData ? data.milestones : MILESTONES.map((m) => ({ ...m }));
  const funnel: FunnelView[] = data.hasData
    ? data.funnel.map((f) => ({
        label: f.label,
        pct: f.pct ?? 0,
        strong: f.pct != null ? `${f.pct} %` : "—",
        count: f.tracked ? `${f.reached}/${f.cohort}` : "—",
      }))
    : FUNNEL.map((s) => ({ ...s }));

  return (
    <>
      <EditeurTopbar current="Vitesse première valeur" />

      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 04 · Vitesse première valeur</div>
            <h1 className="hero-title">Vitesse première valeur</h1>
            <p className="hero-sub">
              Mesurer combien de temps un nouvel utilisateur met avant d&apos;obtenir une première
              valeur tangible — court = plus de chances de conversion et rétention.
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
              <div className="section-eyebrow">Délais médians</div>
              <div className="section-title">Temps moyen jusqu&apos;aux jalons clés</div>
            </div>
          </div>
          <div className="kpis kpis-5">
            {milestones.map((m) => (
              <div className="kpi" key={m.label}>
                <span className="phase-tag p1">PHASE 1</span>
                <div className="kpi-label">{m.label}</div>
                <div className="kpi-value">
                  {m.value} <span className="unit">{m.unit}</span>
                </div>
                <div className="kpi-meta">{m.meta}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Onboarding</div>
              <div className="section-title">
                Progression des nouveaux ingénieurs (30 derniers jours)
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              {funnel.map((step, i) => (
                <div key={step.label} style={i < funnel.length - 1 ? { marginBottom: "18px" } : undefined}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      fontSize: "11.5px",
                      color: "var(--navy-300)",
                    }}
                  >
                    <span>{step.label}</span>
                    <span>
                      <strong style={{ color: "var(--navy)" }}>{step.strong}</strong> · {step.count}
                    </span>
                  </div>
                  <div className="funnel-bar">
                    <div className="funnel-bar-fill" style={{ width: `${step.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
