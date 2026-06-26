import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import "../../../_styles/collecte-fiche.css";
import {
  FicheCollecteClient,
  type FicheData,
  type PieceVM,
  type SousVM,
  type ThemeVM,
} from "./FicheCollecteClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Consulter la collecte",
};

type Verdict = "valide" | "refuse" | "a_revoir";

type StoredItem = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
  removed?: boolean;
  verdict?: Verdict | null;
};

type DepotRow = {
  item_index: number;
  file_name: string | null;
  file_size: number | null;
  reponse: string | null;
};

type AnalyseRow = {
  item_index: number;
  status: string | null;
  resume: string | null;
  detail: string | null;
};

type MessageRow = { item_index: number | null };

/**
 * Dérive le statut d'affichage d'une pièce à partir des trois signaux :
 * dépôt présent, verdict humain de l'ingénieur, verdict IA (collecte_analyses).
 */
function deriveStatus(
  hasDepot: boolean,
  human: Verdict | null | undefined,
  iaStatus: string | null,
): PieceVM["status"] {
  if (!hasDepot) return "manquant";
  if (human === "valide") return "depose";
  if (human === "refuse") return "refuse";
  if (iaStatus === "incoherence") return "alerte";
  return "attval";
}

const STATUS_LABEL: Record<PieceVM["status"], string> = {
  depose: "Validé",
  attval: "En attente de validation",
  manquant: "En attente du client",
  alerte: "Incohérence détectée par l'IA",
  refuse: "Refusé",
};

export default async function FicheCollectePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const dossierId = rawId.trim();

  const data = await loadFiche(dossierId);

  return (
    <div className="maq-collecte-fiche px-10 py-8">
      <Link href="/espace-ingenieur/collectes" className="ci-back">
        ← Retour à la collecte
      </Link>

      {data ? (
        <FicheCollecteClient data={data} dossierId={dossierId} />
      ) : (
        <div className="ci-empty">
          <div className="ci-empty-title">Aucune collecte ouverte pour ce dossier</div>
          <p className="ci-empty-sub">
            Aucun lien de collecte n&apos;a encore été envoyé pour ce dossier. Ouvrez le
            constructeur pour préparer la demande de pièces et l&apos;adresser au client.
          </p>
          <div style={{ marginTop: 18 }}>
            <Link href={`/espace-ingenieur/collectes/${dossierId}/modifier`} className="btn btn-gold btn-sm">
              Préparer la collecte
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Résout le dossier <id> vers sa collecte la plus récente, puis assemble le
 * modèle de vue : structure regroupée par thème → sous-rubrique, avec dépôts,
 * verdicts IA (collecte_analyses) et compteurs de messages par pièce.
 * Renvoie null si pas de session, pas de collecte ou base non configurée
 * (l'écran affiche alors un état vide honnête, sans planter).
 */
async function loadFiche(dossierId: string): Promise<FicheData | null> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;

    const supabase = createAdminClient();

    // Toutes les collectes du dossier (couple → un lien par participant) ;
    // la plus récente porte la structure de référence, le titre agrège les noms.
    const { data: collectes, error } = await supabase
      .from("collectes")
      .select("id, token, client_nom, created_at, opened_at, structure")
      .eq("dossier_id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("created_at", { ascending: false });

    if (error || !collectes || collectes.length === 0) return null;

    const latest = collectes[0] as {
      id: string;
      token: string;
      client_nom: string;
      created_at: string;
      opened_at: string | null;
      structure: unknown;
    };

    const names = Array.from(
      new Set(
        collectes
          .map((c) => (c as { client_nom: string }).client_nom?.trim())
          .filter((n): n is string => Boolean(n)),
      ),
    );
    const title = names.length > 0 ? names.join(" & ") : latest.client_nom || "Collecte";

    const structure: StoredItem[] = Array.isArray(latest.structure)
      ? (latest.structure as StoredItem[])
      : [];

    const [{ data: depotsData }, { data: analysesData }, { data: messagesData }] =
      await Promise.all([
        supabase
          .from("collecte_depots")
          .select("item_index, file_name, file_size, reponse")
          .eq("collecte_id", latest.id),
        supabase
          .from("collecte_analyses")
          .select("item_index, status, resume, detail")
          .eq("collecte_id", latest.id),
        supabase.from("collecte_messages").select("item_index").eq("collecte_id", latest.id),
      ]);

    const depotByIndex = new Map<number, DepotRow>();
    for (const d of (depotsData ?? []) as DepotRow[]) depotByIndex.set(d.item_index, d);

    const analyseByIndex = new Map<number, AnalyseRow>();
    for (const a of (analysesData ?? []) as AnalyseRow[]) analyseByIndex.set(a.item_index, a);

    const msgCountByIndex = new Map<number, number>();
    for (const m of (messagesData ?? []) as MessageRow[]) {
      if (m.item_index == null) continue;
      msgCountByIndex.set(m.item_index, (msgCountByIndex.get(m.item_index) ?? 0) + 1);
    }

    // Regroupement thème → sous-rubrique, ordre de première apparition préservé.
    const themeOrder: string[] = [];
    const themeMap = new Map<string, Map<string, PieceVM[]>>();

    let totalActive = 0;
    let receivedTotal = 0;

    structure.forEach((item, itemIndex) => {
      if (item.removed) return;
      totalActive += 1;

      const themeKey = item.theme?.trim() || "Autres pièces";
      const subKey = item.sub?.trim() || "Éléments";
      if (!themeMap.has(themeKey)) {
        themeMap.set(themeKey, new Map());
        themeOrder.push(themeKey);
      }
      const subMap = themeMap.get(themeKey)!;
      if (!subMap.has(subKey)) subMap.set(subKey, []);

      const depot = depotByIndex.get(itemIndex);
      const hasDepot = Boolean(depot && (depot.file_name || (depot.reponse && depot.reponse.trim())));
      const analyse = analyseByIndex.get(itemIndex) ?? null;
      const status = deriveStatus(hasDepot, item.verdict, analyse?.status ?? null);
      if (hasDepot) receivedTotal += 1;

      const piece: PieceVM = {
        itemIndex,
        label: item.label,
        declaratif: item.type === "Question",
        status,
        statusLabel: STATUS_LABEL[status],
        hasDepot,
        fileName: depot?.file_name ?? null,
        reponse: depot?.reponse ?? null,
        ia: analyse
          ? { status: analyse.status, resume: analyse.resume, detail: analyse.detail }
          : null,
        commentCount: msgCountByIndex.get(itemIndex) ?? 0,
      };
      subMap.get(subKey)!.push(piece);
    });

    const themes: ThemeVM[] = themeOrder.map((themeTitle) => {
      const subMap = themeMap.get(themeTitle)!;
      const sous: SousVM[] = [];
      let tTotal = 0;
      let tReceived = 0;
      let tManquant = 0;
      let tAlertes = 0;

      for (const [subTitle, pieces] of subMap) {
        const received = pieces.filter((p) => p.hasDepot).length;
        tTotal += pieces.length;
        tReceived += received;
        tManquant += pieces.filter((p) => p.status === "manquant").length;
        tAlertes += pieces.filter((p) => p.status === "alerte").length;
        sous.push({ title: subTitle, pieces, received, total: pieces.length });
      }

      return {
        title: themeTitle,
        sous,
        total: tTotal,
        received: tReceived,
        manquant: tManquant,
        alertes: tAlertes,
        pct: tTotal > 0 ? Math.round((tReceived / tTotal) * 100) : 0,
        subCount: sous.length,
      };
    });

    const pct = totalActive > 0 ? Math.round((receivedTotal / totalActive) * 100) : 0;

    // Comptages globaux pour les filtres de la toolbar.
    const allPieces = themes.flatMap((t) => t.sous.flatMap((s) => s.pieces));
    const counts = {
      all: allPieces.length,
      depose: allPieces.filter((p) => p.status === "depose").length,
      attval: allPieces.filter((p) => p.status === "attval").length,
      alerte: allPieces.filter((p) => p.status === "alerte" || p.ia?.status === "incoherence").length,
      manquant: allPieces.filter((p) => p.status === "manquant").length,
      comment: allPieces.filter((p) => p.commentCount > 0).length,
    };

    return {
      token: latest.token,
      title,
      themeCount: themes.length,
      pct,
      received: receivedTotal,
      total: totalActive,
      opened: Boolean(latest.opened_at),
      themes,
      counts,
    };
  } catch {
    return null;
  }
}
