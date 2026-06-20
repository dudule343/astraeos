# ASTRAEOS Wireframes Éditeur - Extraction Plomberie Partagée

Analyse complète du fichier `/Users/marvinmouton/Documents/Projets/astraeos/reference/wireframes-editeur.html` (4782 lignes).

---

## 1. VARIABLES CSS (lignes 9-18)

### Couleurs primaires
- `--navy: #102D50` (bleu foncé principal)
- `--navy-300: #708196` (bleu intermédiaire)
- `--navy-200: #A4AEBB` (bleu clair)
- `--navy-100: #DBE0E4` (bleu très clair, bordures)

### Couleurs d'accent
- `--gold: #C68E0E` (or principal, CTA, highlights)
- `--gold-300: #DDBB6E` (or intermédiaire)
- `--gold-200: #EEDDB6` (or très clair)

### Couleurs de fond et texte
- `--light-blue: #EBF1FA` (bleu pâle pour hover)
- `--ivory: #FAF8F3` (beige clair, bg général)
- `--medium-400: #695D30` (marron or)

### Couleurs de statut
- `--green-bg: #DDE9D7` / `--green-text: #4F6B3F` (succès/ok)
- `--red-bg: #F5DDD7` / `--red-text: #8B3A2A` (danger/alert)
- `--orange-bg: #FBE7CE` / `--orange-text: #8B5A2A` (warning)
- `--purple-bg: #E5DCEB` / `--purple-text: #5B3A6E` (pro/spécial)

### Dimensions
- `--sidebar-w: 280px`
- `--content-pad: 40px`

---

## 2. CLASSES CSS PARTAGÉES (lignes 36-687)

### Architecture générale
- `.app` (flex, min-height: 100vh)
- `.main` (flex: 1, min-width: 0)
- `.content` (padding: 32px 40px 72px, max-width: 1700px)
- `.page` (display: none / .page.active { display: block })

### SIDEBAR (lignes 39-60)
- `.sidebar` (width: 280px, sticky, 100vh height, ivory bg, scrollable)
  - `.brand` → `.brand-row`, `.brand-mark`, `.brand-name`, `.brand-sub`
  - `.nav-section` (group container)
    - `.nav-section-header` (uppercase, gold dot, navy-300 color)
    - `.nav-item` (button/link)
      - `.nav-item-num` (numéro page 01-08, gold-200 bg)
      - `.nav-item-icon` (18x18px, navy-300 / gold-300 when active)
      - `.nav-badge` (gold bg, ivory text) / `.nav-badge.alert` (red-text bg) / `.nav-badge.new` (green-text bg)
    - `.nav-item.active` (navy bg, white text, gold icons)
    - `.nav-item:hover` (light-blue bg)

### TOPBAR (lignes 64-70)
- `.topbar` (flex, sticky, border-bottom, ivory bg, z-index: 10)
  - `.breadcrumb` (flex, navy-300 color)
    - `a` (navy-300, hover: gold)
    - `.current` (navy, font-weight: 600)
    - `.sep` (opacity: 0.5)
  - `.topbar-right` (flex, gap: 10px)

### DATE SELECTOR (lignes 72-123)
- `.date-selector` (position: relative)
  - `.date-selector-btn` (flex, 34px height, gold border/gradient, cursor pointer)
    - `.date-selector-btn-period` (smaller, navy-300)
  - `.date-popover` (display: none / .open)
    - `.date-popover-section` (margin-bottom: 14px)
    - `.date-popover-label` (uppercase, navy-300)
    - `.date-quick-options` (grid 4 col)
      - `.date-quick-option` (button, white bg, navy border)
      - `.date-quick-option.active` (navy bg, white text)
    - `.date-range-inputs` (grid 2 col)
      - `.date-range-input` (date input, white bg)
    - `.date-compare-options` (grid 3 col, same styling as quick-options)
    - `.date-popover-actions` (flex, 2 buttons: ghost & gold)

### ICON BUTTONS & USER PILL (lignes 125-129)
- `.icon-btn` (34x34px, flex center, navy border, white bg, position: relative)
  - `.icon-btn .dot` (5x5px, gold, top-right indicator)
- `.user-pill` (flex, rounded-pill, white border, cursor pointer)
  - `.user-avatar` (26x26px, navy bg, gold text/border, flex center)
  - `.user-name` (navy, 12.5px, font-weight: 500)

### SECTION & HERO (lignes 135-141)
- `.hero` (grid 2col 1fr/auto, gap: 40px, border-bottom)
  - `.hero-eyebrow` (gold, uppercase, ::before gold dot)
  - `.hero-title` (28px, font-weight: 600, navy)
  - `.hero-sub` (13.5px, navy-300, max-width: 1100px)
  - `.hero-actions` (flex, gap: 8px)
- `.section-block` (margin-bottom: 26px)
  - `.section-header` (flex, space-between)
  - `.section-eyebrow` (gold, uppercase, ::before gold dot)
  - `.section-title` (18px, navy, font-weight: 600)

### BUTTONS (lignes 143-152)
- `.btn` (inline-flex, gap: 7px, padding: 8px 14px, 12.5px, font-weight: 600, cursor pointer)
  - `.btn-primary` (navy bg, white text, hover: #1a3866)
  - `.btn-gold` (gold bg, white text, hover: #d39817)
  - `.btn-ghost` (white bg, navy text, navy-100 border, hover: gold text/border)
  - `.btn-sm` (padding: 6px 11px, 11.5px)

### KPI CARDS (lignes 154-183)
- `.kpis` (grid 4col, gap: 12px, margin-bottom: 20px)
  - `.kpis-3` (grid 3col) / `.kpis-5` (5col) / `.kpis-6` (6col, gap: 10px) / `.kpis-7` (7col, gap: 10px)
  - `.kpi` (white bg, navy-100 border, border-radius: 8px, padding: 16px 18px, cursor: default)
    - `.kpi.clickable` (cursor: pointer, hover: shadow + gold border)
    - `.kpi-label` (9.5px, gold, uppercase, letter-spacing: 0.14em)
    - `.kpi-value` (24px, navy, font-weight: 600)
      - `.kpi-value .unit` (13px, navy-300, font-weight: 500)
    - `.kpi-meta` (11px, navy-300)
      - `.kpi-meta strong` (gold) / `.kpi-meta strong.alert` (red-text) / `.kpi-meta strong.up` (green-text) / `.kpi-meta strong.down` (red-text)
  - `.kpi-compare` (grid 2col, gap: 0, border-top, margin-top: 8px)
    - `.kpi-compare-cell` (font-size: 9.5px)
    - `.kpi-compare-period` (uppercase, 8.5px, navy-300)
    - `.kpi-compare-value` (navy, 11px, font-weight: 600) / `.up` (green-text) / `.down` (red-text)

### PHASE TAGS (lignes 185-188)
- `.phase-tag` (position: absolute, top: 8px, right: 8px, 8.5px, uppercase)
  - `.phase-tag.p1` (green-bg, green-text)
  - `.phase-tag.p2` (purple-bg, purple-text)

### BADGES (lignes 190-199)
- `.badge` (inline-flex, gap: 4px, padding: 2px 8px, 10.5px, white-space: nowrap, uppercase, font-weight: 700)
  - `.badge-success` (green-bg, green-text)
  - `.badge-danger` (red-bg, red-text)
  - `.badge-warning` (orange-bg, orange-text)
  - `.badge-info` (light-blue, navy)
  - `.badge-gold` (gold-200, medium-400)
  - `.badge-purple` (purple-bg, purple-text)
  - `.badge-neutral` (navy-100, navy-300)
  - `.badge-dot::before` (inline 5x5px gold dot)

### CARDS (lignes 201-207)
- `.card` (white bg, navy-100 border, overflow: hidden)
  - `.card-header` (padding: 14px 20px, border-bottom, flex space-between)
    - `.card-title` (14px, navy, font-weight: 700, flex + gap: 9px)
      - `.card-title svg` (18x18px, gold)
    - `.card-subtitle` (11.5px, navy-300, margin-top: 2px)
  - `.card-body` (padding: 18px 20px)

### TABLES (lignes 215-243)
- `.table-wrap` (white bg, navy-100 border, overflow: hidden)
  - `.table-toolbar` (padding: 12px 16px, flex, space-between, ivory bg, border-bottom)
    - `.table-toolbar-left` (flex, gap: 8px)
    - `.table-toolbar-right` (flex, gap: 8px)
  - `.qf` (quick filter button, inline-flex, 4px/11px padding, navy border, 11.5px, font-weight: 500)
    - `.qf:hover` (gold border)
    - `.qf.active` (navy bg, white text, navy border)
    - `.qf-count` (navy-100 bg, navy-300 text, 9.5px, font-weight: 700)
    - `.qf.active .qf-count` (gold bg, white text)
  - `.search-input` (border: navy-100, white bg, 5px 10px 5px 28px padding, 12px, navy text)
  - `.search-wrap` (position: relative, svg positioned left)
- `table.dt` (width: 100%, border-collapse)
  - `thead` (navy bg)
    - `th` (10px 16px padding, 10.5px, uppercase, white text, font-weight: 600)
    - `th.num` / `th.center` (text-align: right/center)
  - `tbody` (font-size: 12.5px)
    - `td` (10px 16px padding, border-bottom: navy-100, #333 color)
    - `td.num` / `td.center` (text-align: right/center)
    - `tr:nth-child(even)` (ivory bg)
    - `tr.dt-clickable` (cursor: pointer, hover: light-blue bg)
    - `td.cell-id` (JetBrains Mono, navy-300, 11px)
    - `td.cell-primary` (navy, font-weight: 600)
    - `td.cell-money` (navy, font-weight: 600, tnum)
    - `td.cell-money.gold` (gold color)
    - `tr.dt-section td` (gradient gold-200→ivory, medium-400 color, uppercase, 10.5px)

### TABS (lignes 245-251)
- `.tabs` (flex, gap: 4px, border-bottom: navy-100, overflow-x: auto)
  - `.tab` (padding: 9px 16px, 12.5px, navy-300, border-bottom: 2px transparent, cursor pointer)
    - `.tab:hover` (navy color)
    - `.tab.active` (navy, gold border-bottom, font-weight: 700)
  - `.tab-panel` (display: none)
    - `.tab-panel.active` (display: block)

### TT PILLS (lignes 253-257)
- `.tt` (inline-flex, gap: 5px, padding: 2px 9px, 10.5px, uppercase, font-weight: 700)
  - `.tt-marque` (gold-200, medium-400)
  - `.tt-cabinet` (light-blue, navy)
  - `.tt-pro` (purple-bg, purple-text)

### LOGOS (lignes 259-268)
- `.tlogo` (32x32px, border-radius: 6px, flex center, 12px, white text, font-weight: 800)
  - `.tlogo-priveos` (navy gradient)
  - `.tlogo-dupont` (purple gradient)
  - `.tlogo-montblanc` (gray gradient)
  - `.tlogo-1` (gold gradient)
  - `.tlogo-2` (green gradient)
  - `.tlogo-3` (navy gradient)
  - `.tlogo-pro` (purple gradient)
  - `.tlogo-sm` (26x26px, 10px, border-radius: 5px)

### GRIDS & SPACING (lignes 270-276)
- `.grid-2` (grid 2col, gap: 14px)
- `.grid-3` (grid 3col, gap: 14px)
- `.grid-4` (grid 4col, gap: 14px)
- `.grid-2-1` (grid 2fr/1fr, gap: 14px)
- `.grid-1-2` (grid 1fr/2fr, gap: 14px)
- `.mb-12`, `.mb-16`, `.mb-20`, `.mb-24`, `.mb-32` (margin-bottom)

### CHARTS (lignes 278-284)
- `.chart-area` (height: 180px, ivory bg, border-radius: 6px, padding: 14px)
  - `.chart-bars` (flex, align: flex-end, gap: 6px, height: 100%)
    - `.chart-bar` (flex: 1, gold gradient, min-height: 4px)
    - `.chart-bar.navy` (navy gradient)
    - `.chart-bar.green` (green gradient)
    - `.chart-bar-label` (position: absolute, bottom: -22px, 10px, navy-300)

### INFO BAR (lignes 286-293)
- `.info-bar` (ivory→#FFFCF5 gradient, gold-300 border, gold left: 4px, padding: 12px 18px, 12.5px)
  - `.info-bar.alert` (red-bg gradient, red-text left border)
  - `.info-bar.success` (green-bg gradient, green-text left border)
  - `.info-bar svg` (20x20px, gold / red-text / green-text)
  - `.info-bar strong` (navy)

### FORMS (lignes 295-303)
- `.form-group` (margin-bottom: 14px)
- `.form-label` (display: block, 11.5px, navy, uppercase, font-weight: 700, letter-spacing: 0.04em)
  - `.form-label .req` (red-text, margin-left: 2px)
- `.form-help` (11.5px, navy-300, margin-top: 4px)
- `.form-input`, `.form-select`, `.form-textarea` (width: 100%, padding: 8px 12px, navy-100 border, 13px, navy text, white bg)
  - `:focus` (outline: none, gold border)
- `.form-row` (grid 2col, gap: 14px)
- `.form-row-3` (grid 3col, gap: 14px)

### WIZARD ACCORDÉON (lignes 305-374)
- `.wizard-step-card` (white bg, navy-100 border, border-radius: 8px, margin-bottom: 10px, overflow: hidden)
  - `.wizard-step-card.active` (gold border: 2px, shadow: 0 4px 16px gold@0.08)
  - `.wizard-step-card.completed` (green-text left: 4px border)
  - `.wizard-step-header` (flex, gap: 14px, padding: 14px 20px, cursor pointer)
    - `.wizard-step-card.active .wizard-step-header` (ivory→gold-200 gradient)
  - `.wizard-step-num` (32x32px, circle, ivory bg, navy-300 border, navy-300 text)
    - `.wizard-step-card.active .wizard-step-num` (gold bg, white text)
    - `.wizard-step-card.completed .wizard-step-num` (green-text bg, white text)
  - `.wizard-step-info` (flex: 1, min-width: 0)
    - `.wizard-step-title` (14px, navy, font-weight: 700)
    - `.wizard-step-desc` (11.5px, navy-300)
  - `.wizard-step-status` (flex, gap: 8px)
    - `.wizard-step-toggle` (28x28px, circle, ivory bg, navy-100 border, navy-300 color)
    - `.wizard-step-card.active .wizard-step-toggle` (rotate: 180deg, gold bg, white, gold border)
  - `.wizard-step-body` (display: none, padding: 0 20px 20px, border-top: navy-100)
    - `.wizard-step-card.active .wizard-step-body` (display: block, padding-top: 18px)

### KANBAN (lignes 376-387)
- `.kanban-2col` (grid 2col, gap: 14px)
  - `.kb-col` (ivory bg, navy-100 border, border-radius: 8px, padding: 14px, min-height: 240px)
    - `.kb-col-header` (flex, space-between, margin-bottom: 12px)
    - `.kb-col-title` (11px, gold, uppercase, flex + gap: 6px)
    - `.kb-col-count` (11px, navy, white bg, 2px 9px padding, rounded-pill, navy-100 border)
  - `.kb-card` (white bg, navy-100 border, border-radius: 6px, padding: 10px 12px, margin-bottom: 8px, cursor pointer)
    - `.kb-card:hover` (gold border, shadow)
    - `.kb-card-title` (12px, navy, font-weight: 600)
    - `.kb-card-meta` (10.5px, navy-300, flex, gap: 6px)
    - `.kb-card-amount` (12px, gold, font-weight: 700, margin-top: 4px)

### PACK CARDS (lignes 389-408)
- `.pack-card` (white bg, navy-100 border, border-radius: 10px, padding: 22px, position: relative, overflow: hidden)
  - `.pack-card::before` (gold gradient top: 3px, opacity: 0, hover: opacity: 1)
  - `.pack-card:hover` (gold border, shadow: 0 4px 16px navy@0.08, translateY: -1px)
  - `.pack-card-icon` (48x48px, ivory→gold-200 gradient, gold border, gold text)
  - `.pack-card-name` (14.5px, navy, font-weight: 700, letter-spacing: -0.01em)
  - `.pack-card-desc` (12px, navy-300, min-height: 36px, line-height: 1.5)
  - `.pack-card-bullets` (list-style: none, margin-bottom: 16px)
    - `li` (11.5px, navy, padding: 3px 0 3px 16px)
    - `li::before` (4x4px gold dot, position: absolute left: 2px)
  - `.pack-card-meta` (flex, space-between, align: center, padding-top: 14px, border-top: navy-100, 11.5px)
  - `.pack-card-price` (16px, gold, font-weight: 700)
  - `.pack-card-price-period` (11px, navy-300, font-weight: 500)
  - `.pack-pricing-tag` (position: absolute, top: 16px, right: 16px, 9.5px, uppercase, font-weight: 700)
    - `.pack-pricing-tag.recur` (gold-200, medium-400)
    - `.pack-pricing-tag.once` (purple-bg, purple-text)
    - `.pack-pricing-tag.unit` (light-blue, navy)
    - `.pack-pricing-tag.partner` (green-bg, green-text)

### ALERT LIST (lignes 410-416)
- `.alert-item` (padding: 11px 16px, border-bottom: navy-100, cursor pointer)
  - `.alert-item:hover` (ivory bg)
  - `.alert-meta` (flex, gap: 8px, 10.5px, navy-300)
  - `.alert-title` (12.5px, navy, font-weight: 600)
  - `.alert-sub` (11.5px, navy-300, margin-top: 2px)

### PIPELINE STEPPER (lignes 418-431)
- `.pipeline-stepper` (grid 2col, white bg, navy-100 border, border-radius: 10px, padding: 14px 0, margin-bottom: 18px, overflow: hidden)
  - `.stepper-item` (padding: 14px 16px, border-right: navy-100, flex-direction: column, gap: 6px, cursor pointer)
    - `.stepper-item:hover` (light-blue bg)
    - `.stepper-item.active` (ivory→gold-200 gradient)
    - `.stepper-badge` (36x36px, circle, ivory bg, gold-300 border, gold text, margin-bottom: 4px)
      - `.stepper-item.active .stepper-badge` (gold bg, white text, gold border)
    - `.stepper-label` (10.5px, navy-300, font-weight: 600, letter-spacing: 0.04em)
      - `.stepper-item.active .stepper-label` (navy, font-weight: 700)
    - `.stepper-count` (16px, navy, font-weight: 700)
      - `.stepper-item.active .stepper-count` (medium-400)
    - `.stepper-meta` (10.5px, navy-300)

### PIPELINE 6 COLONNES (ligne 434)
- `.pipeline-6` (grid 6col)

### FUNNEL (lignes 436-442)
- `.funnel-stage` (flex, gap: 14px, padding: 14px 18px, white bg, navy-100 border, border-radius: 8px, margin-bottom: 6px, position: relative)
  - `.funnel-bar` (height: 8px, navy-100 bg, border-radius: 4px, overflow: hidden, flex: 1)
    - `.funnel-bar-fill` (height: 100%, gold gradient)
  - `.funnel-label` (width: 200px, 12.5px, navy, font-weight: 600)
  - `.funnel-num` (width: 100px, text-align: right, 14px, navy, font-weight: 700)
  - `.funnel-pct` (width: 80px, text-align: right, 11.5px, navy-300)

### SCORE PREMIUM (lignes 444-452)
- `.score-premium` (position: relative, 160x160px)
  - `.score-premium svg` (width: 100%, height: 100%)
  - `.score-premium-track` (fill: none, stroke: navy-100, stroke-width: 8)
  - `.score-premium-fill` (stroke: scoreGradient, stroke-width: 8, rotate: -90deg, drop-shadow)
  - `.score-premium-center` (position: absolute, inset: 0, flex center, flex-direction: column)
    - `.score-premium-num` (38px, navy, font-weight: 700)
      - `.score-premium-num .unit-small` (14px, navy-300, font-weight: 500)
    - `.score-premium-label` (9px, gold, uppercase, font-weight: 700, margin-top: 6px)

### SCORE BLOCK LIST (lignes 454-472)
- `.score-block-list` (grid 2col, gap: 0)
  - `.score-block-item` (padding: 14px 18px, border-bottom: navy-100, cursor pointer, flex, gap: 14px)
    - `.score-block-item:nth-child(odd)` (border-right: navy-100)
    - `.score-block-item:hover` (ivory bg)
    - `.score-block-icon` (36x36px, border-radius: 8px, ivory→gold-200 gradient, gold-300 border, gold text)
    - `.score-block-content` (flex: 1, min-width: 0)
      - `.score-block-row` (flex, space-between, margin-bottom: 5px)
      - `.score-block-name` (12px, navy, font-weight: 600)
      - `.score-block-num` (13px, font-weight: 700)
        - `.score-block-num.green` (green-text)
        - `.score-block-num.orange` (orange-text)
        - `.score-block-num.red` (red-text)
      - `.score-block-bar` (height: 4px, navy-100 bg, overflow: hidden)
        - `.score-block-bar-fill` (height: 100%)
          - `.score-block-bar-fill.green` (green-text)
          - `.score-block-bar-fill.orange` (orange-text)
          - `.score-block-bar-fill.red` (red-text)

### ICON BADGES (lignes 474-482)
- `.icon-badge` (32x32px, border-radius: 8px, ivory→gold-200 gradient, gold-300 border, gold text)
  - `.icon-badge.lg` (44x44px, border-radius: 10px)
  - `.icon-badge.navy` (navy gradient, navy border, gold-300 text)
- `svg.ico` (16x16px, flex-shrink: 0)
- `.arrow-up` (green-text)
- `.arrow-down` (red-text)

### ROADMAP (lignes 484-489)
- `.roadmap-col` (ivory bg, navy-100 border, border-radius: 8px, padding: 14px)
  - `.roadmap-col-header` (11px, gold, uppercase, margin-bottom: 12px, flex space-between)
  - `.roadmap-card` (white bg, navy-100 border, border-radius: 6px, padding: 12px, margin-bottom: 8px)
    - `.roadmap-card-title` (12.5px, navy, font-weight: 600)
    - `.roadmap-card-meta` (10.5px, navy-300)

### REFERRAL CARDS (lignes 491-512)
- `.referral-card` (white bg, navy-100 border, border-radius: 8px, padding: 18px)
  - `.referral-card:hover` (gold border, shadow)
  - `.referral-card-link` (flex, gap: 8px, 8px 12px padding, ivory bg, dashed gold-300 border, 11.5px, monospace)
    - `.referral-card-link:hover` (gold-200 bg)

### TEAM CATEGORY HEADERS (lignes 525-545)
- `.team-category-header` (navy gradient, white text, 10px 16px padding, 11px, uppercase, font-weight: 700, flex, gap: 10px)
  - `.team-category-header svg` (14x14px, gold-300)
  - `.team-category-header .count` (gold bg, 1px 9px padding, rounded-pill, 9.5px)

### TEAM DRAWER (lignes 558-618)
- `.team-drawer` (position: fixed, top/right/bottom, 540px width, max-width: 92vw, ivory bg, shadow, z-index: 200, overflow-y: auto)
  - `.team-drawer.open` (display: block, slideInDrawer animation: 0.22s)
  - `.team-drawer-overlay` (position: fixed, inset: 0, rgba(navy, 0.32), z-index: 199, backdrop-filter: blur(2px))
    - `.team-drawer-overlay.open` (display: block)
  - `.team-drawer-header` (navy gradient, white text, padding: 24px, sticky top: 0, z-index: 1, position: relative)
    - `.team-drawer-close` (position: absolute, top: 14px, right: 14px, 32x32px, circle, rgba(white, 0.1) bg, white color, cursor pointer)
    - `.team-drawer-avatar` (64x64px, circle, gold bg, navy text, gold-300 border, font-size: 22px, font-weight: 700)
    - `.team-drawer-name` (20px, white, font-weight: 700)
    - `.team-drawer-role` (13px, gold-300, margin-top: 3px)
    - `.team-drawer-contact` (flex, gap: 14px, 11.5px, rgba(white, 0.7), margin-top: 14px)
      - `span` (inline-flex, gap: 5px)
  - `.team-drawer-body` (padding: 20px 24px)

### ACTIVITY WEEK GRID (lignes 620-634)
- `.activity-week-grid` (grid 7col, gap: 4px, margin-bottom: 14px)
  - `.activity-day` (aspect-ratio: 1, border-radius: 4px, flex center, 11px, font-weight: 700)
    - `.activity-day.activity-0` (ivory bg, navy-100 border, navy-300 text)
    - `.activity-day.activity-1` (gold-200 bg, gold-300 border)
    - `.activity-day.activity-2` (gold-300 bg, gold border, medium-400 text)
    - `.activity-day.activity-3` (gold bg, white text, gold border)

### STEPPER ITEM FILTERING (ligne 637)
- `.stepper-item.filtering` (ivory→gold-200 gradient, inset gold 2px shadow)

### PACK RANK ROW (lignes 639-670)
- `.pack-rank-row` (grid 4col 36px/1fr/auto/auto, gap: 14px, align: center, padding: 10px 16px, border-bottom: navy-100)
  - `.pack-rank-row:hover` (ivory bg)
  - `.pack-rank-num` (28x28px, circle, ivory bg, gold-300 border, gold text)
    - `:nth-child(1-3) .pack-rank-num` (gold bg, white text, gold border)
  - `.pack-rank-name` (12.5px, navy, font-weight: 600)
  - `.pack-rank-bar` (180x6px, navy-100 bg, border-radius: 3px, overflow: hidden)
    - `.pack-rank-bar-fill` (height: 100%, gold gradient)
  - `.pack-rank-pct` (12px, gold, font-weight: 700, text-align: right)
  - `.pack-rank-ca` (11.5px, navy-300, text-align: right)

### PREVI EDIT ROW (lignes 672-682)
- `.previ-edit-row` (display: none, ivory→gold-200 gradient, gold left: 4px border, padding: 18px 24px)
  - `.previ-edit-row.open` (display: table-row)
  - `.previ-edit-row td` (padding: 0 !important)
  - `.previ-edit-content` (padding: 18px 24px)
  - `.previ-edit-grid` (grid 4col, gap: 12px)

### YTD PILL (ligne 685)
- `.ytd-pill` (inline-flex, gap: 4px, 1px 8px padding, gold-200 bg, medium-400 text, rounded-pill, 9.5px, font-weight: 700)

---

## 3. NAVIGATION SIDEBAR - STRUCTURE COMPLÈTE (lignes 781-827)

### SECTION 1 : "Cockpit éditeur"
1. **Accueil** (data-page="home", active par défaut, icon: i-home, sans numéro)
2. **Pilotage business** (data-page="business", num: 01)
3. **Acquisition & conversion** (data-page="acquisition", num: 02)
4. **Adoption produit** (data-page="adoption", num: 03)
5. **Vitesse première valeur** (data-page="ttv", num: 04)
6. **Santé clients** (data-page="health", num: 05, badge: alert class, texte: "3")
7. **Analyse produit** (data-page="product", num: 06)
8. **Support & qualité** (data-page="quality", num: 07, badge: gold class, texte: "12")
9. **Infrastructure** (data-page="infra", num: 08)

### SECTION 2 : "Acquisition"
1. **Pipeline acquisition** (data-page="leads", icon: i-leads)
2. **Programme de parrainage** (data-page="referral", icon: i-referral, badge: new class, texte: "N")

### SECTION 3 : "Opérations clients"
1. **Clients totaux actifs** (data-page="clients", icon: i-clients)
2. **Période d'essai** (data-page="trial", icon: i-trial, badge: gold class, texte: "4")
3. **Nouveau client** (data-page="client-new", icon: i-new)
4. **Catalogue des packs** (data-page="marketplace", icon: i-marketplace)

### SECTION 4 : "Pilotage interne"
1. **Finance consolidée** (data-page="finance", icon: i-finance)
2. **Communications & annonces** (data-page="comms", icon: i-comms)
3. **Roadmap & releases** (data-page="roadmap", icon: i-roadmap)
4. **Équipe interne** (data-page="team", icon: i-team)

### SECTION 5 : "Documents fondateurs"
1. **Master Dataset** (href="00_Master_Dataset.html", icon: i-doc, <a> element)
2. **Data Architecture** (href="00_Data_Architecture.html", icon: i-chart, <a> element)

### LEGEND PANEL (après sections)
- **PHASE 1** (.phase-tag.p1) - "mesurable au lancement"
- **PHASE 2** (.phase-tag.p2) - "nécessite tracking"

---

## 4. TOPBAR - STRUCTURE COMPLÈTE (lignes 770-860)

### Breadcrumb
- Parent link: "ASTRAEOS Admin" (onclick="goToPage('home')")
- Separator: "›"
- Current page: <span id="bcCurrent"> (dynamically updated by JS)

### Date Selector
- Button text: "06 mai 2026" + "vs M-1" (period)
- Popover (#datePopover):
  - **Quick period options** (8 options):
    - Aujourd'hui, 7 jours, 30 jours (active), 90 jours, Ce mois, Ce trimestre, Cette année, Personnalisé
  - **Custom range**:
    - Date de → Date à (input type="date")
  - **Comparison** (6 options):
    - vs J-1, vs S-1, vs M-1 (active), vs T-1, vs N-1, Aucune
  - **Actions**:
    - Annuler (btn-ghost) | Appliquer (btn-gold)

### Icon Buttons
- Search icon (.icon-btn, icon: i-search)
- Bell notification icon (.icon-btn, icon: i-bell, with .dot indicator)

### User Pill
- Avatar (.user-avatar): "SK"
- Name (.user-name): "Sarah KAUFMANN"

---

## 5. INTERACTIONS JAVASCRIPT (lignes 4510-4782)

### 5.1 Navigation entre pages
**Fonction: `goToPage(pageId)`** (lignes 4540-4560)
- **Déclenche:**
  - Masque toutes les `.page`, affiche `#page-{pageId}`
  - Désactive tous les `.nav-item`, active celui avec `data-page="{pageId}"`
  - Met à jour le breadcrumb current (#bcCurrent) avec le libellé depuis `PAGE_LABELS`
  - Ferme le drawer équipe si ouvert
  - Met à jour l'URL avec hash (`#pageId`)
  - Scroll vers le haut (smooth)
- **PAGE_LABELS mapping:** 19 pages (home, business, acquisition, adoption, ttv, health, product, quality, infra, leads, referral, clients, trial, client-new, marketplace, finance, comms, roadmap, team)
- **Câblage:** `data-page` attribute + `onclick="goToPage('...')"` sur chaque nav-item

### 5.2 Sélecteur de date global
**Fonction: `toggleDatePopover(event)`** (lignes 4562-4568)
- Ouvre/ferme le popover (#datePopover) avec .open class
- Click outside ferme automatiquement (document click listener, lignes 4570-4575)

**Options rapides** (lignes 4577-4586)
- `.date-quick-options .date-quick-option` listeners:
  - Click: désactive tous, active le cliqué (active class)
  - "30 jours" active par défaut

**Options de comparaison** (lignes 4588-4593)
- `.date-compare-options .date-quick-option` listeners:
  - Même logique que quick options
  - "vs M-1" active par défaut

**Boutons d'action** (lignes 4819-4820 dans topbar HTML):
  - Annuler: appelle `toggleDatePopover(event)` (ferme)
  - Appliquer: appelle `toggleDatePopover(event)` (ferme)

### 5.3 Wizard Accordéon (lignes 4595-4631)
**Fonction: `toggleWizardStep(stepNum)`**
- Ouvre/ferme une étape (id="wstep{N}")
- Si déjà active, la ferme; sinon ouvre celle-ci et ferme les autres
- Scroll smooth vers l'étape

**Fonction: `goToWizardStep(stepNum)`**
- Marque les étapes 1..stepNum-1 comme .completed (✓ checkmark, badge badge-success "Validé")
- Réactive l'étape stepNum avec classe .active (badge badge-gold "En cours")
- Scroll smooth vers l'étape

### 5.4 Onglets Finance (lignes 4633-4641)
**Fonction: `switchFinanceTab(tabName)`**
- Désactive tous les `[data-finance-tab]` (retire .active)
- Active celui avec `data-finance-tab="{tabName}"`
- Masque tous les `#page-finance .tab-panel`, affiche `#finance-{tabName}`

### 5.5 Onglets génériques (lignes 4643-4652)
- Listeners sur tous `.tab` (sauf ceux avec data-finance-tab ou onclick)
- Click: désactive tous les tabs du conteneur, active le cliqué
- Logique à appliquer aux tab-panels associés (peut être à implémenter)

### 5.6 Quick filter buttons (lignes 4654-4661)
**Fonction: auto-listeners sur `.qf`**
- Click: désactive tous les .qf du parent, active le cliqué (active class)
- Exception: si le parent est #treso-period-buttons, logique déléguée à switchTresoView

### 5.7 Stepper acquisition cliquable (lignes 4663-4674)
**Fonction: `filterLeadsByStep(stepperItem, etape)`**
- Désactive tous les `.stepper-item`, active le cliqué
- Ajoute classe .filtering pour highlighting
- Console.log l'étape (implémentation réelle à faire dans app)

### 5.8 Graphe trésorerie multi-vues (lignes 4676-4694)
**Fonction: `switchTresoView(period)`**
- Masque toutes les `.treso-view`
- Affiche `#treso-view-{period}`
- Met à jour les boutons #treso-period-buttons (retire .active de tous, active celui cliqué)

### 5.9 Prévisionnel éditable (lignes 4696-4710)
**Fonction: `togglePreviEdit(monthId)`**
- Ouvre/ferme le panneau d'édition `#previ-edit-{monthId}`
- Si déjà ouvert, le ferme
- Sinon, ferme tous les autres et ouvre celui-ci
- Scroll smooth vers le panneau

### 5.10 Drawer équipe (drilldown) (lignes 4712-4750)
**TEAM_DATA object:**
- 10 personnes avec: name, role, email, phone, avatar (2 letters), metrics (tech/support/commercial)
- Personnes: lea, antoine, camille, maxime (tech), elodie, thomas, julie (support), marc, hugues (commercial)

**Fonction: `openTeamDrawer(personId)`**
- Récupère data depuis TEAM_DATA
- Renseigne les champs du drawer (#td-name, #td-role, #td-email, #td-phone, #td-avatar)
- Bascule l'affichage des blocs de métriques selon `.metrics` (tech/support/commercial)
- Ajoute .open aux #team-drawer et #team-drawer-overlay

**Fonction: `closeTeamDrawer()`**
- Retire .open aux #team-drawer et #team-drawer-overlay

**Clavier:** ESC ferme le drawer (lignes 4752-4754)

### 5.11 Restauration d'état via URL hash (lignes 4756-4762)
- À la charge de la page (load event):
  - Lit le hash (#pageId)
  - Si valid (existe dans PAGE_LABELS), appelle goToPage(hash)

---

## 6. ÉLÉMENTS À REPORTER EN COMPOSANTS CLIENT

### Chrome partagé (Layout)
- [ ] Sidebar (brand, nav-sections, nav-items, badges)
- [ ] Topbar (breadcrumb, date-selector, icon-buttons, user-pill)
- [ ] Main layout (.app, .main, .content)

### Sélecteur de date
- [ ] DateSelector component (button + popover avec quick options, range inputs, compare options)
- [ ] Gestion du state (active option, dates sélectionnées)

### Navigation
- [ ] goToPage() routing logic
- [ ] PAGE_LABELS mapping (19 pages)
- [ ] Hash URL state

### Wizard/Accordéon
- [ ] WizardStepCard component avec toggle et completed state
- [ ] toggleWizardStep / goToWizardStep logic

### Onglets
- [ ] Tabs component (conteneur + tab buttons + panels)
- [ ] switchFinanceTab / tabs génériques
- [ ] Panel visibility toggle

### Filtres
- [ ] QuickFilter component (.qf buttons, active state)
- [ ] Table filters toolbar

### Graphiques/Vues
- [ ] TresoView switcher (5 vues période)
- [ ] switchTresoView state logic

### Prévisionnel
- [ ] TogglePreviEdit inline edit mode
- [ ] Edit row display/hide logic

### Drawer
- [ ] TeamDrawer component (fixed position, overlay, animation)
- [ ] openTeamDrawer / closeTeamDrawer
- [ ] TEAM_DATA structure (10 personnes, metrics blocks)
- [ ] Keyboard ESC handler

### Primitives réutilisées (Composants atomiques)
- [ ] KPI Card (.kpi, .kpi-value, .kpi-meta, .kpi-compare)
- [ ] Badge (.badge, variants: success/danger/warning/info/gold/purple/neutral)
- [ ] Button (.btn, variants: primary/gold/ghost, sizes: default/sm)
- [ ] Card (.card, .card-header, .card-body)
- [ ] Table (.dt, thead/tbody, filtering, sorting)
- [ ] Kanban card (.kb-card, .kb-col)
- [ ] Phase tag (.phase-tag.p1/p2)
- [ ] Info bar (.info-bar, variants: default/alert/success)
- [ ] Form elements (.form-input, .form-select, .form-textarea, .form-label, .form-row)
- [ ] Icon badges (.icon-badge, .icon-badge.lg)
- [ ] TT pills (.tt-marque, .tt-cabinet, .tt-pro)
- [ ] Pack cards (.pack-card, .pack-pricing-tag)
- [ ] Score blocks (.score-block-list, .score-block-item)
- [ ] Alert list (.alert-item)
- [ ] Pipeline stepper (.pipeline-stepper, .stepper-item)
- [ ] Funnel (.funnel-stage, .funnel-bar)
- [ ] Roadmap cards (.roadmap-card, .roadmap-col)
- [ ] Referral cards (.referral-card, .referral-card-link)

---

## 7. PLAGES DE LIGNES CLÉS

| Élément | Lignes |
|---------|--------|
| Variables CSS :root | 9-18 |
| CSS INTRO | 22-34 |
| CSS APP/MAIN | 36-70 |
| CSS SIDEBAR | 39-60 |
| CSS TOPBAR | 62-70 |
| CSS DATE SELECTOR | 72-123 |
| CSS ICON BTN / USER PILL | 125-129 |
| CSS HERO/SECTION | 135-141 |
| CSS BUTTONS | 143-152 |
| CSS KPIs | 154-183 |
| CSS PHASE TAGS | 185-188 |
| CSS BADGES | 190-199 |
| CSS CARDS | 201-207 |
| CSS SECTION BLOCK | 209-213 |
| CSS TABLES | 215-243 |
| CSS TABS | 245-251 |
| CSS TT PILLS | 253-257 |
| CSS LOGOS | 259-268 |
| CSS GRIDS/SPACING | 270-276 |
| CSS CHARTS | 278-284 |
| CSS INFO BAR | 286-293 |
| CSS FORMS | 295-303 |
| CSS WIZARD | 305-374 |
| CSS KANBAN | 376-387 |
| CSS PACK CARDS | 389-408 |
| CSS ALERT LIST | 410-416 |
| CSS PIPELINE STEPPER | 418-431 |
| CSS FUNNEL | 436-442 |
| CSS SCORE PREMIUM | 444-452 |
| CSS SCORE BLOCK | 454-472 |
| CSS ICON BADGES | 474-482 |
| CSS ROADMAP | 484-489 |
| CSS REFERRAL CARDS | 491-512 |
| CSS TEAM CATEGORY | 525-545 |
| CSS TEAM DRAWER | 558-618 |
| CSS ACTIVITY GRID | 620-634 |
| CSS PACK RANK | 639-670 |
| CSS PREVI EDIT | 672-682 |
| CSS YTD PILL | 685 |
| HTML SIDEBAR | 770-827 |
| HTML TOPBAR | 830-860 |
| JS SCRIPT START | 4510 |
| JS PAGE_LABELS | 4527-4548 |
| JS goToPage() | 4550-4560 |
| JS toggleDatePopover() | 4562-4593 |
| JS toggleWizardStep() | 4595-4609 |
| JS goToWizardStep() | 4611-4631 |
| JS switchFinanceTab() | 4633-4641 |
| JS Tabs generics | 4643-4652 |
| JS Quick filters | 4654-4661 |
| JS filterLeadsByStep() | 4663-4674 |
| JS switchTresoView() | 4676-4694 |
| JS togglePreviEdit() | 4696-4710 |
| JS TEAM_DATA | 4712-4750 |
| JS openTeamDrawer() | 4752-4762 |
| JS closeTeamDrawer() | 4764-4768 |
| JS ESC handler | 4770-4772 |
| JS URL hash restore | 4774-4782 |

---

## 8. SYNTHÈSE POUR IMPLÉMENTATION CLIENTE

### Styles globaux à dupliquer
- Variables CSS :root (couleurs, dimensions)
- Reset global (*, html, body)
- Font imports (Epilogue, JetBrains Mono)

### Composants layout critiques
1. **App layout** (.app, .main, .sidebar, .topbar, .content)
2. **Breadcrumb** (navigation context)
3. **Date selector** avec popover (critère global)
4. **Navigation sidebar** avec 5 sections, 19 pages

### Interactions critiques à implémenter
1. `goToPage(pageId)` → routing multi-page
2. `toggleDatePopover()` + date range selection
3. `toggleWizardStep()` / `goToWizardStep()` pour wizard
4. Tab switching (tabs génériques + finance specifique)
5. Quick filters toggle
6. Stepper acquisition (filterLeadsByStep)
7. Tréso view switcher (5 periods)
8. Prévisionnel inline edit (togglePreviEdit)
9. Team drawer (openTeamDrawer + closeTeamDrawer + TEAM_DATA)
10. URL hash state restoration

### Système de design primitif
- 30+ familles de classes réutilisables (kpi, badge, button, card, table, wizard, kanban, score, etc.)
- Color scheme: navy + gold + status colors
- Spacing: 14px, 18px, 20px gaps standards
- Border radius: 4px (small), 6px (default), 8px (large), 10px (extra-large)
- Shadows: minimal, used for hover/active states
- Transitions: 0.12s-0.2s pour interactive elements

