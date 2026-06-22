'use client';

import { useEffect, useRef } from 'react';
import { initDci } from './dciLogic';
import { SVG_SPRITE } from './svgSprite';
import { Sections1to8 } from './Sections1to8';
import { Sections9to13 } from './Sections9to13';
import { Sections14to18 } from './Sections14to18';
import { Sections19to22 } from './Sections19to22';

export default function DciComplet() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return initDci(rootRef.current);
  }, []);

  return (
    <div className="maq-dci-complet" ref={rootRef}>
      <svg className="svg-defs" xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: SVG_SPRITE }} />

      <div className="wf-annotation">
        <strong>WIREFRAME · 05 · ESPACE CLIENT · DCI COMPLET</strong> · Document de collecte d&apos;informations détaillé · à compléter après l&apos;entretien initial · bien par bien
      </div>

      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="brand-mini">
            <div className="brand-mini-mark" style={{ color: 'var(--gold)' }}>
              <svg><use href="#ic-tree" /></svg>
            </div>
            <div className="brand-mini-text">ASTRAEOS</div>
          </div>
          <div className="progress-zone">
            <div className="progress-info">
              <span><span className="percent" id="progPercent">0%</span> complété</span>
              <span id="progStep">Étape 1 sur 22</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" id="progFill" style={{ width: '0%' }} />
            </div>
          </div>
          <div className="save-indicator saved" id="saveIndicator">
            <svg className="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><use href="#ic-check" /></svg>
            Enregistré
          </div>
        </div>
      </div>

      <div className="section-container">
        <Sections1to8 />
        <Sections9to13 />
        <Sections14to18 />
        <Sections19to22 />
      </div>

      <div className="nav-bar" id="navBar">
        <div className="nav-bar-inner">
          <button className="nav-btn prev" id="prevBtn" data-action="prev" style={{ visibility: 'hidden' }}>
            <svg><use href="#ic-arrow-left" /></svg>
            Précédent
          </button>
          <div className="nav-step-indicator" id="stepIndicator"><strong>1</strong> sur 22</div>
          <button className="nav-btn next" id="nextBtn" data-action="next">
            Continuer
            <svg><use href="#ic-arrow-right" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
