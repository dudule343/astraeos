import { Topbar } from "../_components/Topbar";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";

const features = [
  { label: "Étude patrimoniale globale", users: "214 utilisateurs", pct: 100, tone: "gold" },
  { label: "Simulation patrimoniale", users: "198 utilisateurs", pct: 92, tone: "gold" },
  { label: "Génération rapport client", users: "182 utilisateurs", pct: 85, tone: "gold" },
  { label: "CRM clients", users: "170 utilisateurs", pct: 79, tone: "gold" },
  { label: "Bibliothèque DCI", users: "98 utilisateurs", pct: 46, tone: "gold" },
  { label: "Module IA conversationnel", users: "42 utilisateurs", pct: 20, tone: "warning" },
] as const;

const frictions = [
  {
    badge: { value: "À surveiller", tone: "warning" },
    label: "Création étude patrimoniale",
    value: "28 %",
    valueTone: "warning",
    desc: 'd\'abandons à l\'étape "Bilan patrimonial"',
  },
  {
    badge: { value: "Critique", tone: "danger" },
    label: "Module IA conversationnel",
    value: "62 %",
    valueTone: "danger",
    desc: "d'utilisateurs qui n'y sont jamais revenus",
  },
  {
    badge: { value: "Bon", tone: "success" },
    label: "CRM clients",
    value: "94 %",
    valueTone: "success",
    desc: "de complétion du parcours fiche client",
  },
] as const;

const badgeToneClass = {
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  danger: "bg-[var(--red-bg)] text-[var(--red-text)]",
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
} as const;

const valueToneClass = {
  warning: "text-[var(--orange-text)]",
  danger: "text-[var(--red-text)]",
  success: "text-[var(--green-text)]",
} as const;

export default function ProductPage() {
  return (
    <>
      <Topbar current="06 · Analyse produit" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 06 · Analyse produit"
          title="Analyse produit"
          description="Comprendre comment les utilisateurs utilisent réellement la plateforme — détecter les frictions et identifier les fonctionnalités à valeur. Bloc essentiel mais nécessite le tracking comportemental (Phase 2)."
          actions={<GhostButton>Export</GhostButton>}
        />

        <div className="mb-6 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
          <span>ℹ️</span>
          <div>
            <strong>Distinction Adoption vs Analyse :</strong> le bloc 03 mesure{" "}
            <strong>qui</strong> utilise la plateforme (volumétrie). Le bloc 06 mesure{" "}
            <strong>comment</strong> ils l'utilisent (parcours, frictions, fonctionnalités
            plébiscitées ou délaissées).
          </div>
        </div>

        <section className="mb-8">
          <SectionHeader eyebrow="Cœur du produit" title="Fonctionnalités les plus utilisées" />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <div className="flex flex-col gap-4">
              {features.map((f) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex justify-between text-[12px] text-[var(--navy)]">
                    <span>{f.label}</span>
                    <span>
                      <strong
                        className={
                          f.tone === "warning"
                            ? "text-[var(--orange-text)]"
                            : "text-[var(--gold)]"
                        }
                      >
                        {f.users}
                      </strong>{" "}
                      · {f.pct} %
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                    <div
                      className={`h-full ${
                        f.tone === "warning"
                          ? "bg-gradient-to-r from-[var(--orange-text)] to-[#C5825A]"
                          : "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-300)]"
                      }`}
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Frictions détectées" title="Points de friction et abandons" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {frictions.map((f) => (
              <div
                key={f.label}
                className="rounded-md border border-[var(--navy-100)] bg-white p-5"
              >
                <span
                  className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeToneClass[f.badge.tone]}`}
                >
                  {f.badge.value}
                </span>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  {f.label}
                </div>
                <div className={`text-[24px] font-bold leading-none ${valueToneClass[f.valueTone]}`}>
                  {f.value}
                </div>
                <div className="mt-1 text-[11.5px] text-[var(--navy-300)]">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
