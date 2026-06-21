// Sprite SVG statique repris verbatim de la maquette dci-complet.html.
// Contenu 100 % statique (aucune donnée utilisateur) injecté via
// dangerouslySetInnerHTML pour éviter de réécrire chaque <symbol> en JSX.
export const SVG_SPRITE = `
<defs>
  <symbol id="ic-tree" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 28V18" stroke-width="1.6"/>
    <path d="M16 18c-3 0-5.5-2.2-5.5-5s2.5-5 5.5-5 5.5 2.2 5.5 5-2.5 5-5.5 5z" stroke-width="1.4"/>
    <path d="M16 8V4" stroke-width="1.4"/>
    <circle cx="11.5" cy="11" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="20.5" cy="11" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="ic-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
    <polyline points="9 12 11 14 15 10"/>
  </symbol>
  <symbol id="ic-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <line x1="12" y1="11" x2="12" y2="16"/>
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="4 12 10 18 20 6"/>
  </symbol>
  <symbol id="ic-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"/>
    <polyline points="14 6 20 12 14 18"/>
  </symbol>
  <symbol id="ic-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="20" y1="12" x2="4" y2="12"/>
    <polyline points="10 6 4 12 10 18"/>
  </symbol>
  <symbol id="ic-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 6 15 12 9 18"/>
  </symbol>
  <symbol id="ic-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </symbol>
  <symbol id="ic-prefill" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </symbol>
  <symbol id="ic-seal" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="46" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="36" stroke-width="1"/>
    <polyline points="34 50 46 62 66 38" stroke-width="2.5"/>
  </symbol>
</defs>
`;
