"use client";

import { useState } from "react";
import { Topbar } from "../_components/Topbar";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

type StepStatus = "completed" | "active" | "todo" | "final";

const steps: {
  num: number;
  title: string;
  desc: string;
  status: StepStatus;
}[] = [
  { num: 1, title: "Type de structure", desc: "Cabinet direct sélectionné", status: "completed" },
  {
    num: 2,
    title: "Identité juridique",
    desc: "Patrimoine Conseil Avignon SAS · SIREN 892 547 318",
    status: "active",
  },
  {
    num: 3,
    title: "Configuration plateforme",
    desc: "Sous-domaine · branding · paramètres techniques · facturation",
    status: "todo",
  },
  {
    num: 4,
    title: "Packs souscrits",
    desc: "Choix des packs récurrents et ponctuels du catalogue",
    status: "todo",
  },
  {
    num: 5,
    title: "Invitation des ingénieurs patrimoniaux",
    desc: "Liste initiale des utilisateurs · rôles · droits d'accès",
    status: "todo",
  },
  {
    num: 6,
    title: "Récapitulatif & activation",
    desc: "Vérification finale · contrat · activation période d'essai 30 jours",
    status: "final",
  },
];

const statusBadge: Record<StepStatus, { label: string; class: string }> = {
  completed: { label: "Validé", class: "bg-[var(--green-bg)] text-[var(--green-text)]" },
  active: { label: "En cours", class: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
  todo: { label: "À configurer", class: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
  final: { label: "Final", class: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
};

function Field({
  label,
  required,
  children,
  help,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--gold)]">*</span>}
      </label>
      {children}
      {help && <div className="mt-1 text-[11px] text-[var(--navy-300)]">{help}</div>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[12.5px] text-[var(--navy)] focus:border-[var(--gold)] focus:outline-none";

export default function ClientNewPage() {
  const [openStep, setOpenStep] = useState<number>(2);

  const toggle = (n: number) => setOpenStep((cur) => (cur === n ? 0 : n));
  const goNext = (n: number) => setOpenStep(Math.min(n + 1, 6));
  const goPrev = (n: number) => setOpenStep(Math.max(n - 1, 1));

  return (
    <>
      <Topbar current="Nouveau client" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients"
          title="Créer un nouveau client"
          description="Wizard interactif en 6 étapes — cliquer sur l'en-tête d'une étape la déplie. Chaque étape est testable et peut être validée pour passer à la suivante."
          actions={<GhostButton>Annuler</GhostButton>}
        />

        <div className="mb-6 flex items-start gap-2 rounded-md border border-[var(--gold-300)] bg-[var(--gold-200)]/30 px-4 py-3 text-[11.5px] text-[var(--navy)]">
          <span>ℹ️</span>
          <div>
            <strong>Mode test :</strong> toutes les étapes sont cliquables. Cliquer sur "Continuer"
            referme l'étape courante et ouvre la suivante. Cliquer à nouveau sur l'en-tête d'une
            étape précédente la rouvre pour modification.
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step) => {
            const isOpen = openStep === step.num;
            const badge = statusBadge[step.status];
            return (
              <div
                key={step.num}
                className={`overflow-hidden rounded-md border bg-white transition-colors ${
                  isOpen
                    ? "border-[var(--gold)] shadow-sm"
                    : "border-[var(--navy-100)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(step.num)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isOpen ? "bg-[var(--gold-200)]/30" : "hover:bg-[var(--ivory)]"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      step.status === "completed"
                        ? "bg-[var(--green-text)] text-white"
                        : isOpen
                          ? "bg-[var(--gold)] text-white"
                          : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                    }`}
                  >
                    {step.status === "completed" ? "✓" : step.num}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-[var(--navy)]">
                      {step.title}
                    </div>
                    <div className="text-[12px] text-[var(--navy-300)]">{step.desc}</div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.class}`}
                  >
                    {badge.label}
                  </span>
                  <span
                    className={`ml-2 text-[var(--navy-300)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--navy-100)] p-5">
                    {step.num === 1 && <Step1 onNext={() => goNext(1)} />}
                    {step.num === 2 && (
                      <Step2 onPrev={() => goPrev(2)} onNext={() => goNext(2)} />
                    )}
                    {step.num === 3 && (
                      <Step3 onPrev={() => goPrev(3)} onNext={() => goNext(3)} />
                    )}
                    {step.num === 4 && (
                      <Step4 onPrev={() => goPrev(4)} onNext={() => goNext(4)} />
                    )}
                    {step.num === 5 && (
                      <Step5 onPrev={() => goPrev(5)} onNext={() => goNext(5)} />
                    )}
                    {step.num === 6 && <Step6 onPrev={() => goPrev(6)} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  const types = [
    { icon: "🏷️", label: "Marque", desc: "Franchise · licence · réseau", selected: false },
    { icon: "🏢", label: "Cabinet direct ✓", desc: "Indépendant ou mandataire", selected: true },
    { icon: "👥", label: "Autre professionnel", desc: "Notaire · avocat · EC", selected: false },
  ];
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {types.map((t) => (
          <div
            key={t.label}
            className={`rounded-lg border-[1.5px] p-4 ${
              t.selected
                ? "border-[var(--gold)] bg-[var(--ivory)]"
                : "border-[var(--navy-100)] opacity-50"
            }`}
          >
            <div
              className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-md text-xl ${
                t.selected
                  ? "bg-[var(--gold)] text-white"
                  : "bg-[var(--navy-100)] text-[var(--navy-300)]"
              }`}
            >
              {t.icon}
            </div>
            <div
              className={`text-[13px] font-bold ${t.selected ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
            >
              {t.label}
            </div>
            <div className="mt-1 text-[11.5px] text-[var(--navy-300)]">{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
        >
          Continuer vers Identité →
        </button>
      </div>
    </>
  );
}

function Step2({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Raison sociale" required>
          <input className={inputClass} defaultValue="Patrimoine Conseil Avignon SAS" />
        </Field>
        <Field label="Nom commercial">
          <input className={inputClass} defaultValue="Patrimoine Conseil" />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="SIREN" required help="Vérifié auprès de l'INSEE ✓">
          <input className={inputClass} defaultValue="892 547 318" />
        </Field>
        <Field label="Statut juridique">
          <select className={inputClass} defaultValue="SAS">
            <option>SAS</option>
            <option>SARL</option>
            <option>SA</option>
            <option>SCP</option>
          </select>
        </Field>
        <Field label="Numéro ORIAS" required help="CIF + Courtier en assurance">
          <input className={inputClass} defaultValue="24 002 845" />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Adresse siège" required>
          <input className={inputClass} defaultValue="42 boulevard Saint-Roch, 84000 Avignon" />
        </Field>
        <Field label="Représentant légal" required>
          <input className={inputClass} defaultValue="Marc DELORME" />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Email principal" required>
          <input className={inputClass} defaultValue="m.delorme@patrimoine-avignon.fr" />
        </Field>
        <Field label="Téléphone">
          <input className={inputClass} defaultValue="04 90 12 34 56" />
        </Field>
      </div>
      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
        >
          Continuer vers Configuration →
        </button>
      </div>
    </>
  );
}

function Step3({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Sous-domaine"
          required
          help="URL d'accès des ingénieurs : https://patrimoine-avignon.astraeos.fr"
        >
          <div className="flex items-center gap-1.5">
            <input className={`${inputClass} flex-1`} defaultValue="patrimoine-avignon" />
            <span className="text-[12px] text-[var(--navy-300)]">.astraeos.fr</span>
          </div>
        </Field>
        <Field
          label="Nom de marque affiché"
          help="Visible dans l'interface ingénieur et clients finaux"
        >
          <input className={inputClass} defaultValue="Patrimoine Conseil" />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Couleur principale">
          <input type="color" className={`${inputClass} h-10`} defaultValue="#102D50" />
        </Field>
        <Field label="Couleur d'accent">
          <input type="color" className={`${inputClass} h-10`} defaultValue="#C68E0E" />
        </Field>
        <Field label="Logo">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
          >
            ⬆ Téléverser
          </button>
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Mode de facturation" required>
          <select className={inputClass} defaultValue="Mensuel · prélèvement automatique">
            <option>Mensuel · prélèvement automatique</option>
            <option>Mensuel · virement</option>
            <option>Annuel · 1 paiement</option>
          </select>
        </Field>
        <Field label="Date d'activation" required>
          <input type="date" className={inputClass} defaultValue="2026-05-15" />
        </Field>
      </div>
      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
        >
          Continuer vers Packs →
        </button>
      </div>
    </>
  );
}

const packs = [
  {
    name: "Pack Investissements financiers · Abonnement portefeuille",
    type: { v: "Récurrent", c: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    price: "87 €/mois",
    checked: true,
  },
  {
    name: "Pack Investissements financiers · Constitution portefeuille",
    type: { v: "Unique", c: "bg-[#E5DCEB] text-[#5B3A6E]" },
    price: "1 000 €",
    checked: false,
  },
  {
    name: "Pack Immobilier patrimonial · Mise en relation partenaires",
    type: { v: "Inclus", c: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    price: "commission partenaire",
    checked: true,
  },
  {
    name: "Pack Assurances de personnes · Mise en relation partenaires",
    type: { v: "Inclus", c: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    price: "commission partenaire",
    checked: true,
  },
  {
    name: "Bibliothèque de documents actualisés",
    type: { v: "Unique", c: "bg-[#E5DCEB] text-[#5B3A6E]" },
    price: "990 €",
    checked: false,
  },
  {
    name: "Rédaction et immatriculation de société (hors formalisme)",
    type: { v: "Unique", c: "bg-[#E5DCEB] text-[#5B3A6E]" },
    price: "1 200 €",
    checked: false,
  },
  {
    name: "Pack Supervision d'études",
    type: { v: "À l'unité", c: "bg-[var(--light-blue)] text-[var(--navy)]" },
    price: "800 € / étude",
    checked: false,
  },
  {
    name: "Pack Formation",
    type: { v: "À l'unité", c: "bg-[var(--light-blue)] text-[var(--navy)]" },
    price: "1 000 € / formation",
    checked: false,
  },
];

function Step4({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
        <span>ℹ️</span>
        <div>
          Sélectionnez les packs à intégrer dès le démarrage. Les packs gratuits (mise en relation
          partenaires) sont activés par défaut.
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--navy-100)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Pack</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Prix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {packs.map((p) => (
              <tr key={p.name} className="text-[12.5px] text-[var(--navy)]">
                <td className="px-4 py-3">
                  <input type="checkbox" defaultChecked={p.checked} className="h-4 w-4" />
                </td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.type.c}`}
                  >
                    {p.type.v}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
        >
          Continuer vers Ingénieurs →
        </button>
      </div>
    </>
  );
}

const engineers = [
  {
    name: "Marc DELORME",
    email: "m.delorme@patrimoine-avignon.fr",
    role: { v: "Administrateur", c: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
  },
  {
    name: "Émilie ROBERT",
    email: "e.robert@patrimoine-avignon.fr",
    role: { v: "Ingénieure", c: "bg-[var(--light-blue)] text-[var(--navy)]" },
  },
];

function Step5({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
        <span>ℹ️</span>
        <div>
          Vous pourrez ajouter d'autres ingénieurs plus tard depuis la fiche client. Au minimum 1
          utilisateur administrateur est requis.
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--navy-100)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3">Prénom Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {engineers.map((e) => (
              <tr key={e.email} className="text-[12.5px] text-[var(--navy)]">
                <td className="px-4 py-3 font-semibold">{e.name}</td>
                <td className="px-4 py-3">{e.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${e.role.c}`}
                  >
                    {e.role.v}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <GhostButton>Modifier</GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="mt-3 rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
      >
        ＋ Ajouter un ingénieur
      </button>
      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
        >
          Continuer vers Validation →
        </button>
      </div>
    </>
  );
}

const summary = [
  { label: "Type", value: "Cabinet direct" },
  { label: "Raison sociale", value: "Patrimoine Conseil Avignon SAS" },
  { label: "SIREN", value: "892 547 318" },
  { label: "Sous-domaine", value: "patrimoine-avignon.astraeos.fr" },
  { label: "Packs initiaux", value: "3 sélectionnés" },
  { label: "Ingénieurs", value: "2 invités" },
  { label: "Revenu /mois facturé", value: "87 €/mois", highlight: true },
];

const documents = [
  "Contrat de prestation (PDF)",
  "CGU acceptées",
  "Conditions de facturation",
  "Notice RGPD",
];

function Step6({ onPrev }: { onPrev: () => void }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            🏢 Récapitulatif
          </div>
          <div className="p-4">
            {summary.map((s) => (
              <div
                key={s.label}
                className="flex justify-between border-b border-[var(--navy-100)] py-2 text-[12.5px] last:border-0"
              >
                <span
                  className={
                    s.highlight ? "font-bold text-[var(--gold)]" : "text-[var(--navy-300)]"
                  }
                >
                  {s.label}
                </span>
                <span
                  className={`font-semibold ${s.highlight ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            📄 Documents générés
          </div>
          <div className="flex flex-col gap-2 p-4">
            {documents.map((d) => (
              <button
                key={d}
                type="button"
                className="flex items-center gap-2 rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-left text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                📄 {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          ← Retour
        </button>
        <GoldButton>✓ Activer le client maintenant</GoldButton>
      </div>
    </>
  );
}
