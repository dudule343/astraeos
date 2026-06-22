import Link from "next/link";

import { buildItems } from "@/lib/collecte-catalog";
import { CollecteBuilder } from "@/app/(editeur)/dossiers/[id]/collecte/CollecteBuilder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Nouvelle demande de collecte",
};

// Demande de collecte LIBRE : à n'importe quel destinataire (pas forcément un
// client/dossier). Pas de DCI → catalogue complet ; l'ingénieur coche les pièces,
// ajoute des pièces libres au besoin, saisit le destinataire (nom + e-mail) et
// envoie le lien /depot/<token>. `dossierId` est omis (collecte non rattachée).
export default function NouvelleCollectePage() {
  const fullCatalog = buildItems({});
  const totalCategories = new Set(fullCatalog.map((e) => e.category)).size;

  return (
    <div className="px-10 py-8">
      <Link
        href="/espace-ingenieur/collectes"
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
      >
        ← Retour aux collectes
      </Link>

      <section className="mb-6">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Étape 03 · Collecte de documents
        </div>
        <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
          Nouvelle demande de collecte
        </h1>
        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--gold-deep)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <circle cx="12" cy="12" r="4" />
          </svg>
          Demande libre · à n&apos;importe quel destinataire · {totalCategories} rubriques disponibles
        </div>
      </section>

      <CollecteBuilder initialFacts={{}} defaultParticipant={{ nom: "", email: "" }} />
    </div>
  );
}
