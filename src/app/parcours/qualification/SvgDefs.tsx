// Sprite SVG verbatim de la maquette (bloc .svg-defs), injecté une fois.
const SVG_DEFS = `
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
  <symbol id="ic-bulb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18h6"/>
    <path d="M10 21h4"/>
    <path d="M12 3a6 6 0 00-3 11l1 3h4l1-3a6 6 0 00-3-11z"/>
  </symbol>
  <symbol id="ic-seal" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="46" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="36" stroke-width="1"/>
    <polyline points="34 50 46 62 66 38" stroke-width="2.5"/>
  </symbol>
</defs>
`;

export default function SvgDefs() {
  return (
    <svg
      className="svg-defs"
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: SVG_DEFS }}
    />
  );
}
