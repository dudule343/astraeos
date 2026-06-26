import "../../_styles/modifications.css";
import { ModificationsBoard } from "./ModificationsBoard";
import {
  getBugAttachmentsMap,
  getBugThreadsMap,
  listBugReports,
  type BugAttachment,
  type BugReport,
  type ThreadMessage,
} from "@/lib/bug-reports-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Modifications",
};

export default async function ModificationsPage() {
  // Chargement initial côté serveur. Si la table n'est pas encore provisionnée,
  // on rend un board vide plutôt que de planter la page (état honnête).
  let reports: BugReport[] = [];
  let attachments: Record<string, BugAttachment[]> = {};
  let threads: Record<string, ThreadMessage[]> = {};
  try {
    [reports, attachments, threads] = await Promise.all([
      listBugReports(),
      getBugAttachmentsMap(),
      getBugThreadsMap(),
    ]);
  } catch {
    /* table absente ou clé service role manquante : board vide */
  }

  return (
    <div className="mod-page-wrap">
      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">SUPPORT</span> Espace ingénieur
          </div>
          <h1 className="hero-title">
            Signaler une <strong>modification</strong>
          </h1>
          <p className="hero-sub">
            Remontez les bugs et les améliorations de l&apos;espace ingénieur. Décrivez le
            problème, joignez une capture, suivez l&apos;avancement (nouveau, en cours, à valider,
            résolu) et validez la correction une fois déployée.
          </p>
        </div>
      </section>

      <ModificationsBoard
        initialReports={reports}
        initialAttachments={attachments}
        initialThreads={threads}
      />
    </div>
  );
}
