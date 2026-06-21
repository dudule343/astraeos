export const SVG_DEFS = `
<defs>
  <symbol id="ic-tree" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 28V18" stroke-width="1.6"/>
    <path d="M16 18c-3 0-5.5-2.2-5.5-5s2.5-5 5.5-5 5.5 2.2 5.5 5-2.5 5-5.5 5z" stroke-width="1.4"/>
    <path d="M16 8V4" stroke-width="1.4"/>
    <circle cx="11.5" cy="11" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="20.5" cy="11" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="ic-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 018 0v4"/>
    <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="ic-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 15 14"/>
  </symbol>
  <symbol id="ic-devices" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="5" width="13" height="10" rx="1"/>
    <path d="M2 18h14"/>
    <rect x="17" y="9" width="5" height="11" rx="1"/>
    <line x1="19.5" y1="17.5" x2="19.5" y2="17.5" stroke-width="1.5"/>
  </symbol>
  <symbol id="ic-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
    <polyline points="9 12 11 14 15 10"/>
  </symbol>
  <symbol id="ic-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>
  </symbol>
  <symbol id="ic-couple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="8" cy="8" r="3.2"/>
    <circle cx="16" cy="8" r="3.2"/>
    <path d="M2 20c1-3.5 3-5.5 6-5.5s5 2 6 5.5"/>
    <path d="M10 20c1-3.5 3-5.5 6-5.5s5 2 6 5.5"/>
  </symbol>
  <symbol id="ic-briefcase" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="1.5"/>
    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>
    <line x1="3" y1="13" x2="21" y2="13"/>
  </symbol>
  <symbol id="ic-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z"/>
  </symbol>
  <symbol id="ic-coins" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="9" cy="8" rx="6" ry="2.5"/>
    <path d="M3 8v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V8"/>
    <path d="M3 12v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/>
    <ellipse cx="17" cy="14" rx="4" ry="2"/>
    <path d="M13 14v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4"/>
  </symbol>
  <symbol id="ic-diamond" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3h12l4 6-10 12L2 9l4-6z"/>
    <line x1="6" y1="3" x2="10" y2="9"/>
    <line x1="18" y1="3" x2="14" y2="9"/>
    <line x1="2" y1="9" x2="22" y2="9"/>
    <line x1="10" y1="9" x2="12" y2="21"/>
    <line x1="14" y1="9" x2="12" y2="21"/>
  </symbol>
  <symbol id="ic-trend-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 7 9 13 13 9 21 17"/>
    <polyline points="21 11 21 17 15 17"/>
  </symbol>
  <symbol id="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="4 12 10 18 20 6"/>
  </symbol>
  <symbol id="ic-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </symbol>
  <symbol id="ic-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 6 15 12 9 18"/>
  </symbol>
  <symbol id="ic-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"/>
    <polyline points="14 6 20 12 14 18"/>
  </symbol>
  <symbol id="ic-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="20" y1="12" x2="4" y2="12"/>
    <polyline points="10 6 4 12 10 18"/>
  </symbol>
  <symbol id="ic-family" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="7" r="2.5"/>
    <circle cx="18" cy="7" r="2.5"/>
    <circle cx="12" cy="14" r="2"/>
    <path d="M3 19c.7-2.3 2-3.5 4-3.5"/>
    <path d="M17 15.5c2 0 3.3 1.2 4 3.5"/>
    <path d="M9 21c.5-2 1.5-3 3-3s2.5 1 3 3"/>
  </symbol>
  <symbol id="ic-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s7-7 7-13a7 7 0 10-14 0c0 6 7 13 7 13z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </symbol>
  <symbol id="ic-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z"/>
    <polyline points="14 3 14 8 19 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="13" y2="17"/>
  </symbol>
  <symbol id="ic-wallet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="6" width="18" height="14" rx="2"/>
    <path d="M3 10h18"/>
    <circle cx="17" cy="15" r="1.2" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="ic-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="20" x2="20" y2="20"/>
    <rect x="6" y="12" width="3" height="8"/>
    <rect x="11" y="8" width="3" height="12"/>
    <rect x="16" y="14" width="3" height="6"/>
  </symbol>
  <symbol id="ic-target" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="ic-seal" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="46" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="36" stroke-width="1"/>
    <polyline points="34 50 46 62 66 38" stroke-width="2.5"/>
  </symbol>
</defs>
`;
