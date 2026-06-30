"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { EtudeClientPickerItem } from "../../_data/etudes-patrimoniales";
import { createEtude } from "./actions";

type Mode = "existant" | "nouveau";

type Props = {
  clients: EtudeClientPickerItem[];
};

/**
 * Bouton + modale « Créer une étude patrimoniale ». Deux modes :
 *  - client existant : choix dans la liste du portefeuille ;
 *  - nouveau client : prénom / nom / e-mail minimal.
 * À la validation, appelle createEtude puis redirige vers le document /[id].
 */
export default function CreerEtudeButton({ clients }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(clients.length > 0 ? "existant" : "nouveau");
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [titre, setTitre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setMode(clients.length > 0 ? "existant" : "nouveau");
    setClientId(clients[0]?.id ?? "");
    setPrenom("");
    setNom("");
    setEmail("");
    setTitre("");
    setError(null);
  }

  function close() {
    if (pending) return;
    setOpen(false);
    reset();
  }

  function submit() {
    setError(null);

    if (mode === "existant") {
      if (!clientId) {
        setError("Sélectionnez un client.");
        return;
      }
    } else if (!prenom.trim() || !nom.trim()) {
      setError("Prénom et nom requis pour un nouveau client.");
      return;
    }

    const input =
      mode === "existant"
        ? { clientId, titre: titre.trim() || null }
        : {
            nouveauClient: { prenom: prenom.trim(), nom: nom.trim(), email: email.trim() || null },
            titre: titre.trim() || null,
          };

    startTransition(async () => {
      const res = await createEtude(input);
      if (res.ok && res.id) {
        router.push(`/espace-ingenieur/etudes-patrimoniales/${res.id}`);
      } else {
        setError(res.error ?? "La création a échoué.");
      }
    });
  }

  return (
    <>
      <button type="button" className="btn btn-gold btn-sm" onClick={() => setOpen(true)}>
        + Créer une étude patrimoniale
      </button>

      {open && (
        <div
          className="etude-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="etude-modal" role="dialog" aria-modal="true" aria-label="Créer une étude patrimoniale">
            <div className="etude-modal-header">
              <div className="etude-modal-eyebrow">Outil · audit patrimonial</div>
              <div className="etude-modal-title">Créer une étude patrimoniale</div>
            </div>

            <div className="etude-modal-body">
              <div className="etude-mode">
                <button
                  type="button"
                  className={`etude-mode-btn${mode === "existant" ? " is-active" : ""}`}
                  onClick={() => setMode("existant")}
                  disabled={clients.length === 0}
                >
                  Client existant
                </button>
                <button
                  type="button"
                  className={`etude-mode-btn${mode === "nouveau" ? " is-active" : ""}`}
                  onClick={() => setMode("nouveau")}
                >
                  Nouveau client
                </button>
              </div>

              {mode === "existant" ? (
                <div className="etude-field">
                  <label className="etude-field-label" htmlFor="etude-client">
                    Client du portefeuille
                  </label>
                  {clients.length > 0 ? (
                    <select
                      id="etude-client"
                      className="etude-select"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                          {c.foyer && c.foyer !== "—" ? ` — ${c.foyer}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="etude-empty-sub">
                      Aucun client dans votre portefeuille. Créez d&apos;abord un nouveau client.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="etude-grid-2">
                    <div className="etude-field">
                      <label className="etude-field-label" htmlFor="etude-prenom">
                        Prénom
                      </label>
                      <input
                        id="etude-prenom"
                        className="etude-input"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder="Bertrand"
                      />
                    </div>
                    <div className="etude-field">
                      <label className="etude-field-label" htmlFor="etude-nom">
                        Nom
                      </label>
                      <input
                        id="etude-nom"
                        className="etude-input"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="DUPONT"
                      />
                    </div>
                  </div>
                  <div className="etude-field">
                    <label className="etude-field-label" htmlFor="etude-email">
                      E-mail (facultatif)
                    </label>
                    <input
                      id="etude-email"
                      type="email"
                      className="etude-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bertrand.dupont@email.fr"
                    />
                  </div>
                </>
              )}

              <div className="etude-field">
                <label className="etude-field-label" htmlFor="etude-titre">
                  Titre de l&apos;étude (facultatif)
                </label>
                <input
                  id="etude-titre"
                  className="etude-input"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Étude patrimoniale"
                />
              </div>

              {error && <div className="etude-error">{error}</div>}
            </div>

            <div className="etude-modal-footer">
              <button type="button" className="btn btn-ghost btn-sm" onClick={close} disabled={pending}>
                Annuler
              </button>
              <button type="button" className="btn btn-gold btn-sm" onClick={submit} disabled={pending}>
                {pending ? "Création…" : "Créer l'étude"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
