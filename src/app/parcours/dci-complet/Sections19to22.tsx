// Sections 19 à 22 du DCI complet + vue finale — port JSX 1:1 de la maquette.

export function Sections19to22() {
  return (
    <>
      {/* ═══════════ SECTION 18 · BUDGET DÉTAILLÉ ═══════════ */}
      <div className="section" data-step="19">
        <div className="section-header">
          <div className="section-eyebrow">Étape 19 sur 22</div>
          <h1 className="section-title">Budget détaillé</h1>
          <div className="section-subtitle">Précisons vos revenus et vos charges annuels par nature et par bénéficiaire.</div>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">I</div>
            <div className="q-block-text">
              <div className="q-block-title">Revenus annuels du foyer</div>
              <div className="q-block-subtitle">Montants annuels bruts (avant impôt) · à qui appartient chaque revenu ?</div>
            </div>
          </div>
          <div className="dyn-table-header h-budget">
            <div>Nature du revenu</div>
            <div>Montant annuel</div>
            <div>Qui ?</div>
            <div />
          </div>
          <div id="revenusList">
            <div className="dyn-row dyn-row-budget">
              <select className="select-input">
                <option>Salaires et traitements</option><option>BNC (libéral)</option><option>BIC</option><option>BA (agricole)</option><option>Dividendes</option><option>Revenus fonciers (locatifs)</option><option>Pensions / retraites</option><option>Revenus financiers (intérêts, plus-values)</option><option>Autre</option>
              </select>
              <input type="text" className="text-input" placeholder="Montant annuel" />
              <select className="select-input">
                <option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Les deux</option>
              </select>
              <div className="dyn-row-remove" data-action="remove-parent">×</div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-revenu"><svg><use href="#ic-plus" /></svg>Ajouter un revenu</button>
        </div>

        <div className="q-block">
          <div className="q-block-head">
            <div className="q-block-number">II</div>
            <div className="q-block-text">
              <div className="q-block-title">Charges annuelles du foyer</div>
              <div className="q-block-subtitle">Dépenses récurrentes · à qui appartient chaque charge ?</div>
            </div>
          </div>
          <div className="dyn-table-header h-budget">
            <div>Nature de la charge</div>
            <div>Montant annuel</div>
            <div>Qui ?</div>
            <div />
          </div>
          <div id="chargesList">
            <div className="dyn-row dyn-row-budget">
              <select className="select-input">
                <option>Charges courantes (vie quotidienne)</option><option>Mensualités de crédits</option><option>Impôt sur le revenu</option><option>Taxe foncière</option><option>Taxe d&apos;habitation (RS)</option><option>IFI</option><option>Pensions versées</option><option>Loyer (si locataire)</option><option>Frais de scolarité</option><option>Cotisations diverses</option><option>Autre</option>
              </select>
              <input type="text" className="text-input" placeholder="Montant annuel" />
              <select className="select-input">
                <option>Bertrand DUPONT-TOPIN</option><option>Monique DUPONT-TOPIN</option><option>Les deux</option>
              </select>
              <div className="dyn-row-remove" data-action="remove-parent">×</div>
            </div>
          </div>
          <button className="btn-add-asset" data-action="add-charge"><svg><use href="#ic-plus" /></svg>Ajouter une charge</button>
        </div>

        <div className="q-block" style={{ background: 'var(--gold-faint)', borderColor: 'var(--gold-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--white)', border: '1px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-cormorant), 'Georgia', serif", fontSize: '18px', color: 'var(--navy)', fontWeight: 600, marginBottom: '4px' }}>Capacité d&apos;épargne estimée par an</div>
              <div style={{ fontSize: '13.5px', color: 'var(--text-soft)', lineHeight: 1.6 }}>D&apos;après vos réponses : environ <strong style={{ color: 'var(--navy)', fontWeight: 700 }}>80 000 € par an</strong> · soit <strong style={{ color: 'var(--navy)', fontWeight: 700 }}>6 700 € par mois</strong>.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 19 · OBJECTIFS DÉTAILLÉS ═══════════ */}
      <div className="section" data-step="20">
        <div className="section-header">
          <div className="section-eyebrow">Étape 20 sur 22</div>
          <h1 className="section-title">Vos objectifs détaillés</h1>
          <div className="section-subtitle">Précisez vos objectifs patrimoniaux pour les années à venir.</div>
        </div>

        <div id="objectifsList" />

        <button className="btn-add-asset" data-action="add-objectif"><svg><use href="#ic-plus" /></svg>Ajouter un nouvel objectif</button>
      </div>

      {/* ═══════════ SECTION 21 · SYNTHÈSE À VALIDER ═══════════ */}
      <div className="section" data-step="21">
        <div className="section-header">
          <div className="section-eyebrow">Étape 21 sur 22</div>
          <h1 className="section-title">Synthèse de votre patrimoine</h1>
          <div className="section-subtitle">Vérifiez que les éléments consolidés correspondent à votre situation, puis poursuivez vers la signature.</div>
        </div>

        <div className="compliance-block" style={{ background: 'linear-gradient(180deg, var(--white) 0%, #F4F8FD 100%)', borderColor: '#D8E3EF', padding: '28px 32px' }}>
          <div className="compliance-block-subtitle">Synthèse patrimoniale</div>
          <div className="compliance-block-title">Photographie de votre patrimoine</div>

          <div style={{ background: 'var(--white)', borderLeft: '2px solid var(--gold)', padding: '14px 20px', borderRadius: '6px', marginTop: '22px', marginBottom: '24px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.65 }}>
            <strong style={{ color: 'var(--navy)' }}>Méthode de calcul ·</strong> Les valeurs sont consolidées au <strong>16 mai 2026</strong> à partir de l&rsquo;ensemble des actifs déclarés, en tenant compte des quote-parts de détention et du barème fiscal de l&rsquo;article 669 du CGI pour les biens démembrés (usufruit / nue-propriété évalués selon l&rsquo;âge de l&rsquo;usufruitier).
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1.1fr', background: 'var(--navy)', color: 'var(--ivory)', padding: '14px 22px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
              <div>Catégorie d&rsquo;actif</div>
              <div style={{ textAlign: 'right' }}>Bertrand</div>
              <div style={{ textAlign: 'right' }}>Monique</div>
              <div style={{ textAlign: 'right' }}>Indivision</div>
              <div style={{ textAlign: 'right' }}>Total</div>
            </div>

            <SynthRow title={<>Immobilier d&rsquo;usage</>} sub={<>Résidence principale Paris 7<sup>e</sup></>} b="425 000 €" m="425 000 €" i="—" total="850 000 €" />
            <SynthRow title="Immobilier locatif" sub={<>Paris 16<sup>e</sup> · Cap Ferret</>} b="310 000 €" m="310 000 €" i="—" total="620 000 €" />
            <SynthRow title="Immobilier indirect" sub="SCPI Corum Origin" b="42 800 €" m="—" i="—" total="42 800 €" />
            <SynthRow title="Placements financiers" sub="Livret A · PEA BoursoBank" b="117 950 €" m="—" i="—" total="117 950 €" />
            <SynthRow title="Assurance-vie et capitalisation" sub="Generali · Linxea Spirit · Cardif" b="175 000 €" m="80 000 €" i="25 000 €" total="280 000 €" />
            <SynthRow title="Patrimoine atypique" sub="Or · Crypto · Art · GFV · Brevet" b="45 500 €" m="—" i="4 000 €" total="49 500 €" />
            <SynthRow title="Épargne retraite" sub="PER Linxea · PERCO Société Générale" b="42 000 €" m="18 000 €" i="—" total="60 000 €" />
            <SynthRow title="Actifs professionnels" sub="SCI DUPONT FAMILY · SELARL DR DUPONT" b="120 000 €" m="60 000 €" i="—" total="180 000 €" />

            <div className="synth-row synth-subtotal">
              <div className="synth-cat">
                <div className="synth-cat-title" style={{ color: 'var(--gold)' }}>Total des actifs</div>
              </div>
              <div className="synth-val">1 278 250 €</div>
              <div className="synth-val">893 000 €</div>
              <div className="synth-val">29 000 €</div>
              <div className="synth-val synth-total" style={{ color: 'var(--gold)', fontSize: '16px' }}>2 200 250 €</div>
            </div>

            <div className="synth-row synth-passif">
              <div className="synth-cat">
                <div className="synth-cat-title">Emprunts et dettes</div>
                <div className="synth-cat-sub">Prêt RP BNP · Prêt locatif Crédit Mutuel</div>
              </div>
              <div className="synth-val">−110 000 €</div>
              <div className="synth-val">−110 000 €</div>
              <div className="synth-val">—</div>
              <div className="synth-val synth-total">−220 000 €</div>
            </div>

            <div className="synth-row synth-final">
              <div className="synth-cat">
                <div className="synth-cat-title">Patrimoine consolidé</div>
                <div className="synth-cat-sub">Actifs nets après emprunts et dettes</div>
              </div>
              <div className="synth-val">1 168 250 €</div>
              <div className="synth-val">783 000 €</div>
              <div className="synth-val">29 000 €</div>
              <div className="synth-val synth-total">1 980 250 €</div>
            </div>
          </div>
        </div>

        <div className="ratios-section">
          <div className="ratios-eyebrow">Indicateurs clés · Cabinet Paris Étoile</div>
          <div className="ratios-title">Vos ratios financiers</div>
          <div className="ratios-line" />

          <div className="ratios-grid">
            <div className="ratio-premium">
              <div className="ratio-premium-head">
                <div className="ratio-premium-icon">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="11" width="20" height="14" rx="2" />
                    <path d="M11 11V8a3 3 0 016 0v3" />
                    <circle cx="16" cy="18" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="ratio-premium-label">Capacité d&apos;épargne</div>
              </div>
              <div className="ratio-premium-value">6 700 €<span className="ratio-premium-unit"> /mois</span></div>
              <div className="ratio-premium-sub">Précaution équivalente à <strong>15 mois</strong> de charges</div>
            </div>

            <div className="ratio-premium">
              <div className="ratio-premium-head">
                <div className="ratio-premium-icon">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="16" cy="16" r="10" />
                    <path d="M16 8 A8 8 0 0 1 22.5 19" strokeWidth="2.4" />
                    <path d="M16 11v5l3 2" />
                  </svg>
                </div>
                <div className="ratio-premium-label">Endettement</div>
              </div>
              <div className="ratio-premium-value">22,8<span className="ratio-premium-unit"> %</span></div>
              <div className="ratio-premium-sub">Mensualités de crédits sur revenus mensuels</div>
            </div>

            <div className="ratio-premium">
              <div className="ratio-premium-head">
                <div className="ratio-premium-icon">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 22h20" />
                    <path d="M9 22v-6l4-3 4 4 6-7" />
                    <circle cx="9" cy="16" r="1.2" fill="currentColor" stroke="none" />
                    <circle cx="13" cy="13" r="1.2" fill="currentColor" stroke="none" />
                    <circle cx="17" cy="17" r="1.2" fill="currentColor" stroke="none" />
                    <circle cx="23" cy="10" r="1.2" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="ratio-premium-label">Taux d&apos;effort</div>
              </div>
              <div className="ratio-premium-value">27,4<span className="ratio-premium-unit"> %</span></div>
              <div className="ratio-premium-sub">Part des revenus consacrée aux charges contraintes</div>
            </div>

            <div className="ratio-premium">
              <div className="ratio-premium-head">
                <div className="ratio-premium-icon">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 16h20" />
                    <path d="M12 11l-6 5 6 5" />
                    <path d="M26 9v14" />
                    <circle cx="26" cy="16" r="2.5" />
                  </svg>
                </div>
                <div className="ratio-premium-label">Reste à vivre</div>
              </div>
              <div className="ratio-premium-value">13 300 €<span className="ratio-premium-unit"> /mois</span></div>
              <div className="ratio-premium-sub">Disponible mensuel après charges contraintes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 22 · VALIDATION ET SIGNATURE ═══════════ */}
      <div className="section" data-step="22">
        <div className="section-header">
          <div className="section-eyebrow">Étape 22 sur 22</div>
          <h1 className="section-title">Validation et signature</h1>
          <div className="section-subtitle">Mentions de conformité et certification de l&apos;exactitude des informations.</div>
        </div>

        <div className="compliance-block" style={{ padding: '22px 28px' }}>
          <div className="compliance-block-subtitle">Mentions de conformité ASTRAEOS</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: '14px', fontStyle: 'italic' }}>Cliquez pour déployer chaque mention.</div>

          <details className="compliance-accordion">
            <summary>Votre conseiller et vos intérêts</summary>
            <div className="compliance-accordion-content">
              La qualité du conseil prodigué par votre ingénieur patrimonial ASTRAEOS dépend directement de la <strong>véracité, de l&apos;exactitude et de l&apos;exhaustivité</strong> des informations que vous avez communiquées dans ce document. Vous reconnaissez avoir été informé(e) que toute information inexacte, incomplète ou erronée est susceptible d&apos;affecter la pertinence des recommandations formulées par votre ingénieur patrimonial.
            </div>
          </details>

          <details className="compliance-accordion">
            <summary>Protection des données personnelles · RGPD</summary>
            <div className="compliance-accordion-content">
              Les informations recueillies sont enregistrées dans un fichier informatisé par ASTRAEOS aux fins d&apos;exécution de la prestation de conseil patrimonial et de respect de nos obligations réglementaires (CIF, courtage en assurance, LCB-FT). Ces données sont conservées pendant la durée nécessaire à l&apos;exécution des prestations puis archivées conformément aux durées légales applicables. Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation et de portabilité de vos données. Pour toute demande : <a href="mailto:contact@astraeos.fr">contact@astraeos.fr</a>
            </div>
          </details>

          <details className="compliance-accordion">
            <summary>Démarchage téléphonique · Bloctel</summary>
            <div className="compliance-accordion-content">
              Conformément à la loi, vous pouvez vous inscrire gratuitement sur la liste d&apos;opposition au démarchage téléphonique : <a href="https://www.bloctel.gouv.fr/" target="_blank" rel="noreferrer">www.bloctel.gouv.fr</a>
            </div>
          </details>
        </div>

        <div className="admin-only-note" style={{ padding: '14px 22px' }}>
          <div className="admin-only-note-title" style={{ fontSize: '11px', marginBottom: '4px' }}>Contrôles de conformité internes</div>
          <div className="admin-only-note-text" style={{ fontSize: '12px', lineHeight: 1.5 }}>
            Les vérifications ANACOFI seront effectuées par votre ingénieur patrimonial avant l&apos;envoi définitif pour signature · contrôles réservés au cabinet.
          </div>
        </div>

        <div className="cert-block">
          <label className="cert-label">
            <input type="checkbox" id="certCheck" data-action="cert-check" />
            <span className="cert-checkbox" />
            <span className="cert-text">
              <strong>Je certifie l&apos;exactitude et l&apos;exhaustivité des informations</strong> communiquées dans ce document. Je reconnais avoir pris connaissance des mentions de conformité ci-dessus et consens au traitement de mes données par ASTRAEOS aux fins de l&apos;accompagnement patrimonial qui m&apos;est proposé.
            </span>
          </label>
        </div>

        <div style={{ background: 'var(--ivory)', borderLeft: '2px solid var(--gold)', padding: '18px 24px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--gold)' }}>À noter ·</strong> Une fois ce document validé, votre ingénieur patrimonial <strong style={{ color: 'var(--navy)' }}>Luc THILLIEZ</strong> pourra poursuivre le processus de collaboration. Vous recevrez un e-mail de confirmation avec l&apos;ensemble des documents à signer.
        </div>
      </div>

      {/* ═══════════ VUE FINALE ═══════════ */}
      <div className="final-view" id="finalView">
        <div className="final-frame">
          <div className="final-seal" style={{ color: 'var(--gold)' }}>
            <svg><use href="#ic-seal" /></svg>
          </div>
          <div className="final-line" />
          <div className="final-title">Merci,<br /><span className="final-title-civilite">Monsieur Bertrand DUPONT-TOPIN</span></div>
          <div className="final-text">
            Votre document de collecte d&apos;informations a été transmis à votre ingénieur patrimonial :
            <br /><br />
            <strong>Luc THILLIEZ</strong>
            <br /><br />
            Il dispose désormais de l&apos;ensemble des éléments nécessaires pour finaliser votre étude patrimoniale.
          </div>
          <div className="final-noteinfo">
            <strong className="note-pre">À noter ·</strong> Vous allez recevoir un e-mail de confirmation avec votre document signé. Votre ingénieur patrimonial <strong className="note-name">Luc THILLIEZ</strong> vous recontactera dans les prochains jours pour la suite de votre accompagnement.
          </div>
          <div className="final-signature">
            À très bientôt,
            <div className="final-signature-name">L&apos;ÉQUIPE ASTRAEOS</div>
          </div>
        </div>
      </div>
    </>
  );
}

function SynthRow({ title, sub, b, m, i, total }:
  { title: React.ReactNode; sub: React.ReactNode; b: string; m: string; i: string; total: string }) {
  return (
    <div className="synth-row">
      <div className="synth-cat">
        <div className="synth-cat-title">{title}</div>
        <div className="synth-cat-sub">{sub}</div>
      </div>
      <div className="synth-val">{b}</div>
      <div className="synth-val">{m}</div>
      <div className="synth-val">{i}</div>
      <div className="synth-val synth-total">{total}</div>
    </div>
  );
}
