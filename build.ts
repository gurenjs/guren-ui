// Generator for the "Guren UI" design system bundle — application UI for
// products built on Guren (https://guren.dev). Sibling of guren-deck, which
// covers talk slides; this one covers the surfaces an app renders for hours.
//
// Writes standalone, self-contained preview files into ./dist so the design
// pane can render each card without resolving any relative asset except fonts.
//
// Every visual decision derives from surfaces the project already ships:
//   - the crimson scale in web/resources/css/app.css (gurenjs)
//   - the docs light/dark themes in the same file — white + crimson accent in
//     light, the rose-pine-moon-derived #1a1a2e ground and rose #eb6f92 accent
//     in dark (the docs' own answer to "crimson fails contrast on dark")
//   - the flame mark in web/public/logo.svg (#FF3C28 -> #8B0000)
//   - the terminal surface #1a1212 in CodeBlock.tsx
//   - rose-pine dawn as the light counterpart of the moon palette the docs use
//     for code (foam/gold/pine/iris)

import { cpSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const OUT = join(import.meta.dir, 'dist')

/* ────────────────────────────────────────────────────────────── contrast ── */

function srgb(c: number): number {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
function lum(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
}
function ratio(a: string, b: string): number {
  const la = lum(a)
  const lb = lum(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}
function cr(a: string, b: string): string {
  return ratio(a, b).toFixed(2)
}

/* ─────────────────────────────────────────────────────────────── colours ── */

const C = {
  // light theme (docs light + crimson scale)
  page: '#ffffff',
  raised: '#fffafa',
  line: '#e5e7eb',
  lineStrong: '#d1d5db',
  heading: '#111827',
  text: '#1f2937',
  text2: '#4b5563',
  muted: '#9ca3af',
  accent: '#db1b1b', // crimson-600 — fills
  accentDown: '#b91c1c', // crimson-700 — pressed/hover fills
  accentText: '#991b1b', // crimson-800 — links, accent text
  accentTint: '#fff1f2',
  ok: '#286983', // rose-pine dawn pine — text-safe
  okChip: '#56949f', // dawn foam — chips, borders, icons
  warn: '#b45309', // amber-700 from the site's own utility palette — text-safe
  warnChip: '#ea9d34', // dawn gold — chips, borders, icons
  danger: '#b91c1c',
  dangerChip: '#f23a3a', // crimson-500
  // dark theme (docs dark)
  dPage: '#1a1a2e',
  dPanel: '#1e1e34',
  dRaised: '#232340',
  dLine: '#2e2e4a',
  dLineStrong: '#3d3d5c',
  dHeading: '#e0def4',
  dText: '#e0def4',
  dText2: '#908caa',
  dMuted: '#6e6a86',
  dAccentText: '#eb6f92', // rose — the docs' dark accent
  dOk: '#9ccfd8', // moon foam
  dWarn: '#f6c177', // moon gold
  dDanger: '#ffa5a5', // crimson-300 blush — same reasoning as the deck
  dDangerChip: '#f23a3a',
  // constants across themes
  ink: '#1a1212', // terminal surface
  bone: '#fff5f5', // crimson-50 — text on accent fills and on ink
  smoke: '#c9a9a9', // secondary text on ink
  emberA: '#ff3c28',
  emberB: '#8b0000',
  gold: '#f6c177',
  foam: '#9ccfd8',
  iris: '#c4a7e7',
}

/* ──────────────────────────────────────────────────────────────── tokens ── */

const FONT_FACES = `/* ── Fonts. Self-hosted; no proprietary face is named anywhere in this sheet:
      a name the app cannot supply is a name some machine renders differently
      forever. Both families are SIL OFL 1.1 — see fonts/LICENSE-*.txt. ────── */

@font-face {
  font-family: 'Noto Sans JP';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('__FONTS__/noto-sans-jp-japanese-400-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'Noto Sans JP';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('__FONTS__/noto-sans-jp-japanese-700-normal.woff2') format('woff2');
}
/* Latin after Japanese so it wins the overlap: same design, 13KB not 1MB. */
@font-face {
  font-family: 'Noto Sans JP';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('__FONTS__/noto-sans-jp-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'Noto Sans JP';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('__FONTS__/noto-sans-jp-latin-700-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('__FONTS__/jetbrains-mono-latin-400-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('__FONTS__/jetbrains-mono-latin-500-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('__FONTS__/jetbrains-mono-latin-700-normal.woff2') format('woff2');
}
`

const TOKENS = `/* Guren UI — design tokens
   Application UI for products built on Guren. Light theme is the docs light
   theme guren.dev ships (white + crimson); dark is its docs dark theme
   (rose-pine-moon ground, rose accent). Toggle with a .dark class on any
   ancestor — :root.dark for the whole app, mirroring guren.dev itself.      */

${FONT_FACES}
:root {
  --g-font-sans: 'Noto Sans JP', sans-serif;
  --g-font-mono: 'JetBrains Mono', monospace;

  /* surfaces */
  --g-page: ${C.page};
  --g-panel: ${C.page};
  --g-raised: ${C.raised};
  --g-ink: ${C.ink};             /* terminal surface — dark in both themes */
  --g-line: ${C.line};
  --g-line-strong: ${C.lineStrong};

  /* text */
  --g-heading: ${C.heading};
  --g-text: ${C.text};
  --g-text-2: ${C.text2};
  --g-muted: ${C.muted};

  /* the red budget */
  --g-accent: ${C.accent};        /* crimson-600 — primary fills only */
  --g-accent-down: ${C.accentDown};
  --g-accent-text: ${C.accentText}; /* crimson-800 — links, accent text */
  --g-accent-tint: ${C.accentTint};
  --g-on-accent: ${C.bone};       /* crimson-50 on accent fills */

  /* signals — text-safe value + chip value + wash */
  --g-ok: ${C.ok};
  --g-ok-chip: ${C.okChip};
  --g-ok-tint: rgba(86, 148, 159, 0.12);
  --g-warn: ${C.warn};
  --g-warn-chip: ${C.warnChip};
  --g-warn-tint: rgba(234, 157, 52, 0.14);
  --g-danger: ${C.danger};
  --g-danger-chip: ${C.dangerChip};
  --g-danger-tint: ${C.accentTint};

  /* the one structural device */
  --g-tick: linear-gradient(180deg, ${C.emberA}, ${C.emberB});

  /* geometry */
  --g-r-ctl: 8px;
  --g-r-card: 12px;
  --g-shadow-card: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  --g-shadow-float: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
}

:root.dark, .dark {
  --g-page: ${C.dPage};
  --g-panel: ${C.dPanel};
  --g-raised: ${C.dRaised};
  --g-line: ${C.dLine};
  --g-line-strong: ${C.dLineStrong};

  --g-heading: ${C.dHeading};
  --g-text: ${C.dText};
  --g-text-2: ${C.dText2};
  --g-muted: ${C.dMuted};

  /* fills stay crimson in both themes; accent TEXT moves to rose, the docs'
     own dark accent — crimson measures ${cr(C.dangerChip, C.dPage)}:1 on this ground. */
  --g-accent-text: ${C.dAccentText};
  --g-accent-tint: rgba(235, 111, 146, 0.12);

  --g-ok: ${C.dOk};
  --g-ok-chip: ${C.dOk};
  --g-ok-tint: rgba(156, 207, 216, 0.10);
  --g-warn: ${C.dWarn};
  --g-warn-chip: ${C.dWarn};
  --g-warn-tint: rgba(246, 193, 119, 0.10);
  --g-danger: ${C.dDanger};
  --g-danger-chip: ${C.dDangerChip};
  --g-danger-tint: rgba(242, 58, 58, 0.12);

  --g-shadow-card: 0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2);
  --g-shadow-float: 0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.25);
}
`

/* ─────────────────────────────────────────────────────────────────── kit ── */

const KIT = `/* Guren UI — component classes. Everything reads the tokens above, so the
   whole kit follows a .dark toggle with no per-component work. */

.g-body {
  margin: 0;
  background: var(--g-page);
  color: var(--g-text);
  font-family: var(--g-font-sans);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* page heading carries the tick — the only decorated element on a screen */
.g-title {
  position: relative;
  padding-left: 16px;
  font-size: 20px;
  font-weight: 700;
  color: var(--g-heading);
  letter-spacing: -0.01em;
}
.g-title::before {
  content: '';
  position: absolute;
  left: 0; top: 4px; bottom: 4px;
  width: 3px;
  border-radius: 2px;
  background: var(--g-tick);
}

/* ── buttons ─────────────────────────────────────────────────────────────── */
.g-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: var(--g-r-ctl);
  border: 1px solid transparent;
  font: 700 13.5px/1.45 var(--g-font-sans);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.g-btn:focus-visible { outline: 2px solid var(--g-accent); outline-offset: 2px; }
.g-btn-primary { background: var(--g-accent); color: var(--g-on-accent); }
.g-btn-primary:hover { background: var(--g-accent-down); }
.g-btn-secondary {
  background: var(--g-panel);
  border-color: var(--g-line-strong);
  color: var(--g-text);
}
.g-btn-secondary:hover { border-color: var(--g-muted); }
.g-btn-ghost { background: transparent; color: var(--g-accent-text); }
.g-btn-ghost:hover { background: var(--g-accent-tint); }
/* destructive shares the brand hue, so it is never a second red fill:
   outline + explicit verb, and the fill appears only inside a confirm step */
.g-btn-danger {
  background: transparent;
  border-color: var(--g-danger-chip);
  color: var(--g-danger);
}
.g-btn-danger:hover { background: var(--g-danger-tint); }
.g-btn-sm { padding: 5px 11px; font-size: 12.5px; }
.g-btn[disabled] { opacity: 0.45; cursor: not-allowed; }

/* ── forms ───────────────────────────────────────────────────────────────── */
.g-field { display: flex; flex-direction: column; gap: 6px; }
.g-label { font-size: 13px; font-weight: 700; color: var(--g-heading); }
.g-label .req { color: var(--g-danger); font-weight: 400; margin-left: 4px; }
.g-input, .g-select, .g-textarea {
  padding: 8px 12px;
  border: 1px solid var(--g-line-strong);
  border-radius: var(--g-r-ctl);
  background: var(--g-panel);
  color: var(--g-text);
  font: 400 14px/1.5 var(--g-font-sans);
}
.g-input:focus, .g-select:focus, .g-textarea:focus {
  outline: 2px solid var(--g-accent);
  outline-offset: -1px;
  border-color: transparent;
}
.g-input::placeholder, .g-textarea::placeholder { color: var(--g-muted); }
.g-help { font-size: 12.5px; color: var(--g-text-2); }
.g-error { font-size: 12.5px; color: var(--g-danger); }
.g-field.invalid .g-input,
.g-field.invalid .g-select,
.g-field.invalid .g-textarea { border-color: var(--g-danger-chip); }
.g-input[disabled] { background: var(--g-raised); color: var(--g-muted); }
.g-check { display: inline-flex; gap: 9px; align-items: flex-start; font-size: 14px; }
.g-check input { accent-color: var(--g-accent); width: 16px; height: 16px; margin-top: 3px; }

/* ── cards ───────────────────────────────────────────────────────────────── */
.g-card {
  background: var(--g-panel);
  border: 1px solid var(--g-line);
  border-radius: var(--g-r-card);
  box-shadow: var(--g-shadow-card);
}
.g-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--g-line);
}
.g-card-title { font-size: 15px; font-weight: 700; color: var(--g-heading); }
.g-card-body { padding: 18px; }

/* ── badges ──────────────────────────────────────────────────────────────── */
.g-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 2px 9px;
  border-radius: 999px;
  font: 500 12px/1.6 var(--g-font-mono);
}
.g-badge::before { content: ''; width: 6px; height: 6px; border-radius: 999px; background: currentColor; }
.g-badge-ok { color: var(--g-ok); background: var(--g-ok-tint); }
.g-badge-warn { color: var(--g-warn); background: var(--g-warn-tint); }
.g-badge-danger { color: var(--g-danger); background: var(--g-danger-tint); }
.g-badge-neutral { color: var(--g-text-2); background: var(--g-raised); box-shadow: inset 0 0 0 1px var(--g-line); }

/* ── callouts — the diagnostic row, not a box. Same anatomy as guren check
      output: a mono key in a fixed gutter, a hairline, ordinary body text.
      Keys: note / ok / rule / never. ───────────────────────────────────── */
.g-callout {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 14px;
  padding: 10px 2px;
  border-top: 1px solid var(--g-line);
  font-size: 13.5px;
}
.g-callout:last-child { border-bottom: 1px solid var(--g-line); }
.g-callout .k { font: 700 12.5px/1.7 var(--g-font-mono); text-align: right; }
.g-callout.note .k { color: var(--g-ok); }
.g-callout.ok .k { color: var(--g-ok); }
.g-callout.rule .k { color: var(--g-warn); }
.g-callout.never .k { color: var(--g-danger); }
.g-callout .b { color: var(--g-text); }
.g-callout .b code { font-family: var(--g-font-mono); font-size: 12.5px; color: var(--g-accent-text); }

/* flash / toast — one line of check output, printed on ink and floated.
   The ink surface is themeless, so a flash looks identical on both grounds;
   no coloured border, no tinted box — the mono key in its gutter is the
   entire signal, exactly as it is in the terminal. */
.g-toast {
  display: inline-grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  align-items: baseline;
  padding: 11px 18px 11px 14px;
  border-radius: var(--g-r-ctl);
  background: var(--g-ink);
  color: ${C.bone};
  box-shadow: var(--g-shadow-float);
  font-size: 13.5px;
}
.g-toast .k { font: 700 12.5px/1.7 var(--g-font-mono); text-align: right; }
.g-toast.ok .k { color: ${C.foam}; }
.g-toast.rule .k { color: ${C.gold}; }
.g-toast.never .k { color: ${C.dDanger}; }

/* ── table ───────────────────────────────────────────────────────────────── */
.g-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.g-table th {
  text-align: left;
  font: 500 11.5px/1.6 var(--g-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--g-muted);
  padding: 10px 14px;
  border-bottom: 1px solid var(--g-line-strong);
}
.g-table td { padding: 11px 14px; border-bottom: 1px solid var(--g-line); }
.g-table tr:hover td { background: var(--g-raised); }
.g-table .num { text-align: right; font-family: var(--g-font-mono); font-size: 12.5px; }
.g-table .id { font-family: var(--g-font-mono); font-size: 12.5px; color: var(--g-muted); }

/* ── navigation ──────────────────────────────────────────────────────────── */
.g-topbar {
  display: flex; align-items: center; gap: 22px;
  padding: 0 20px;
  height: 52px;
  background: var(--g-panel);
  border-bottom: 1px solid var(--g-line);
}
.g-side {
  width: 216px;
  padding: 12px 10px;
  background: var(--g-raised);
  border-right: 1px solid var(--g-line);
}
.g-side a {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: var(--g-r-ctl);
  color: var(--g-text-2);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
}
.g-side a:hover { color: var(--g-heading); background: var(--g-accent-tint); }
.g-side a.active { color: var(--g-heading); background: var(--g-accent-tint); font-weight: 700; }
.g-side a.active::before {
  content: '';
  position: absolute;
  left: 0; top: 7px; bottom: 7px;
  width: 3px;
  border-radius: 2px;
  background: var(--g-tick);
}
.g-side .sec {
  font: 500 11px/1.6 var(--g-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--g-muted);
  padding: 14px 12px 6px;
}

/* ── tabs ────────────────────────────────────────────────────────────────── */
.g-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--g-line); }
.g-tabs a {
  position: relative;
  padding: 9px 14px;
  color: var(--g-text-2);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
}
.g-tabs a:hover { color: var(--g-heading); }
.g-tabs a.active { color: var(--g-heading); font-weight: 700; }
.g-tabs a.active::after {
  content: '';
  position: absolute;
  left: 10px; right: 10px; bottom: -1px;
  height: 3px;
  border-radius: 2px 2px 0 0;
  background: var(--g-tick);
}

/* ── pagination ──────────────────────────────────────────────────────────── */
.g-pages { display: inline-flex; gap: 4px; font-family: var(--g-font-mono); font-size: 12.5px; }
.g-pages a {
  min-width: 30px; height: 30px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--g-r-ctl);
  border: 1px solid var(--g-line);
  color: var(--g-text-2);
  text-decoration: none;
}
.g-pages a:hover { border-color: var(--g-line-strong); color: var(--g-heading); }
.g-pages a.active { background: var(--g-accent); border-color: var(--g-accent); color: var(--g-on-accent); font-weight: 700; }

/* ── modal ───────────────────────────────────────────────────────────────── */
.g-modal {
  width: 440px;
  background: var(--g-panel);
  border: 1px solid var(--g-line);
  border-radius: var(--g-r-card);
  box-shadow: var(--g-shadow-float);
}
.g-modal-head { padding: 16px 20px 0; }
.g-modal-body { padding: 10px 20px 20px; color: var(--g-text-2); font-size: 13.5px; }
.g-modal-foot {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--g-line);
  background: var(--g-raised);
  border-radius: 0 0 var(--g-r-card) var(--g-r-card);
}

/* ── code — the terminal surface, dark in both themes ───────────────────── */
.g-code {
  background: var(--g-ink);
  color: ${C.bone};
  border-radius: var(--g-r-card);
  padding: 16px 20px;
  font: 400 12.5px/1.75 var(--g-font-mono);
  overflow-x: auto;
}
.g-code .cm { color: ${C.smoke}; opacity: 0.75; }
.g-code .kw { color: ${C.iris}; }
.g-code .st { color: ${C.gold}; }
.g-code .fn { color: ${C.foam}; }
.g-code .pr { color: #fc6d6d; }
.g-kbd {
  font: 500 11.5px/1.4 var(--g-font-mono);
  padding: 2px 7px;
  border: 1px solid var(--g-line-strong);
  border-bottom-width: 2px;
  border-radius: 6px;
  background: var(--g-raised);
  color: var(--g-text-2);
}

/* ── empty state ─────────────────────────────────────────────────────────── */
.g-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 48px 24px;
  text-align: center;
  border: 1px dashed var(--g-line-strong);
  border-radius: var(--g-r-card);
}
.g-empty h3 { margin: 6px 0 0; font-size: 15px; color: var(--g-heading); }
.g-empty p { margin: 0 0 10px; font-size: 13px; color: var(--g-text-2); max-width: 34em; }
`

/* ────────────────────────────────────────────────────────────── plumbing ── */

const files: { path: string; body: string }[] = []

function emit(path: string, content: string) {
  files.push({ path, body: content })
  const abs = join(OUT, path)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content)
}

const DOC_CSS = `.doc{padding:44px 52px;box-sizing:border-box}
.eyebrow{font:500 12px/1.6 var(--g-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--g-muted);margin:0 0 10px}
.eyebrow b{color:var(--g-accent-text);font-weight:500}
.h{font-size:26px;font-weight:700;margin:0;letter-spacing:-.01em;color:var(--g-heading)}
.sub{margin:10px 0 0;font-size:14px;line-height:1.7;color:var(--g-text-2);max-width:56em}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px;align-items:start}
.pane{border:1px solid var(--g-line);border-radius:14px;background:var(--g-page);padding:24px;color:var(--g-text)}
.pane .tag{font:500 11px/1.6 var(--g-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--g-muted);margin:0 0 16px}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.stack{display:flex;flex-direction:column;gap:14px}
.note{margin-top:24px;font-size:12.5px;color:var(--g-text-2);line-height:1.7;max-width:62em}
.note code{font-family:var(--g-font-mono);font-size:11.5px;color:var(--g-accent-text)}`

function eyebrow(html: string): string {
  return `<p class="eyebrow">${html}</p>`
}

function page(opts: {
  path: string
  group: string
  title: string
  css?: string
  body: string
  width?: number
}) {
  const html = `<!-- @dsCard group="${opts.group}" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.title}</title>
<style>
${TOKENS.replaceAll('__FONTS__', '../fonts')}
${KIT}
${DOC_CSS}
body{width:${opts.width ?? 1080}px}
${opts.css ?? ''}
</style>
</head>
<body class="g-body">
${opts.body}
</body>
</html>
`
  emit(opts.path, html)
}

/* Render the same fragment on a light and a dark pane, side by side. */
function pair(fragment: string): string {
  return `<div class="pair">
  <div class="pane"><p class="tag">light</p>${fragment}</div>
  <div class="pane dark"><p class="tag">dark</p>${fragment}</div>
</div>`
}

function flame(height: number, id: string, opacity = 1): string {
  return `<svg viewBox="0 0 299 516" width="${Math.round(height * (299 / 516))}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:${opacity}" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M120.853 0C169.647 25.1364 195.255 83.7877 184.353 136.5C175.756 178.065 136.039 208.749 137.372 253.138C138.729 298.251 168.879 330.194 161.353 377.5C181.444 352.982 200.458 332.078 208.353 300.5C214.367 261.839 179.943 229.848 190.898 190.72C194.731 177.22 208.153 147.3 231.353 136.5C218.919 181.573 237.455 211.003 266.353 245C300.243 280.246 308.266 343.188 284.853 386C253.141 442.376 189.378 465.573 149.853 515.5C121.558 476.749 77.5264 459.842 48.8528 424C-12.4118 347.419 -19.5127 245.133 47.3528 169C80.8397 130.872 165.348 59.327 120.853 0Z" fill="url(#${id})"/><defs><linearGradient id="${id}" x1="149.117" y1="0" x2="149.117" y2="515.5" gradientUnits="userSpaceOnUse"><stop stop-color="#FF3C28"/><stop offset="1" stop-color="#8B0000"/></linearGradient></defs></svg>`
}

/* ═══════════════════════════════════════════════════════════ foundations ══ */

type Swatch = { name: string; hex: string; role: string; on: string }

const lightSwatches: Swatch[] = [
  { name: 'page', hex: C.page, role: 'The ground. Panels share it; raised is the tint.', on: C.text },
  { name: 'raised', hex: C.raised, role: 'Raised surfaces, hover washes. crimson-tinted white.', on: C.text },
  { name: 'heading', hex: C.heading, role: 'Headings.', on: C.page },
  { name: 'text', hex: C.text, role: 'Body text.', on: C.page },
  { name: 'text-2', hex: C.text2, role: 'Secondary text, help lines.', on: C.page },
  { name: 'accent', hex: C.accent, role: 'crimson-600. Primary fills; measured against bone.', on: C.bone },
  { name: 'accent-text', hex: C.accentText, role: 'crimson-800. Links and accent text.', on: C.page },
  { name: 'ok', hex: C.ok, role: 'Success text. rose-pine dawn pine.', on: C.page },
  { name: 'warn', hex: C.warn, role: 'Warning text. The utility palette’s amber-700.', on: C.page },
  { name: 'danger', hex: C.danger, role: 'Destructive text. crimson-700.', on: C.page },
]

const darkSwatches: Swatch[] = [
  { name: 'page', hex: C.dPage, role: 'The dark ground guren.dev docs ship.', on: C.dText },
  { name: 'raised', hex: C.dRaised, role: 'Raised surfaces.', on: C.dText },
  { name: 'text', hex: C.dText, role: 'Headings and body.', on: C.dPage },
  { name: 'text-2', hex: C.dText2, role: 'Secondary text.', on: C.dPage },
  { name: 'accent', hex: C.accent, role: 'Fills stay crimson-600; measured against bone.', on: C.bone },
  { name: 'accent-text', hex: C.dAccentText, role: 'rose. The docs’ dark accent; crimson fails here.', on: C.dPage },
  { name: 'ok', hex: C.dOk, role: 'Success. rose-pine moon foam.', on: C.dPage },
  { name: 'warn', hex: C.dWarn, role: 'Warning. moon gold.', on: C.dPage },
  { name: 'danger', hex: C.dDanger, role: 'Destructive text. crimson-300 blush.', on: C.dPage },
  { name: 'ink', hex: C.ink, role: 'Terminal surface — identical in both themes.', on: C.bone },
]

function swatchRows(list: Swatch[], ground: string): string {
  return list
    .map((s) => {
      const r = ratio(s.hex, s.on)
      const cls = r >= 4.5 ? 'pass' : r >= 3 ? 'large' : 'fill'
      const label = r >= 4.5 ? 'AA text' : r >= 3 ? 'large text' : 'fill only'
      return `<div class="sw">
  <div class="chip" style="background:${s.hex};${lum(s.hex) > 0.5 && ground === 'light' ? 'border:1px solid var(--g-line);' : ''}"></div>
  <div class="meta">
    <span class="nm">${s.name}</span><span class="hex">${s.hex}</span>
    <div class="rl">${s.role}</div>
    <div class="crr ${cls}">${r.toFixed(2)}:1 · ${label}</div>
  </div>
</div>`
    })
    .join('\n')
}

page({
  path: 'foundations/colors.html',
  group: 'Foundations',
  title: 'Guren UI — Colour',
  css: `.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px}
.col{border:1px solid var(--g-line);border-radius:14px;padding:20px}
.col.dark{background:var(--g-page);color:var(--g-text)}
.col .tag{font:500 11px/1.6 var(--g-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--g-muted);margin:0 0 14px}
.sw{display:flex;gap:14px;align-items:center;padding:9px 0;border-top:1px solid var(--g-line)}
.chip{flex:0 0 64px;height:48px;border-radius:8px}
.meta{min-width:0}
.nm{font-family:var(--g-font-mono);font-size:13px;color:var(--g-heading)}
.hex{font-family:var(--g-font-mono);font-size:11.5px;color:var(--g-muted);margin-left:8px}
.rl{font-size:12px;color:var(--g-text-2);margin-top:1px;line-height:1.5}
.crr{font-family:var(--g-font-mono);font-size:11px;margin-top:1px}
.crr.pass{color:var(--g-ok)}
.crr.large{color:var(--g-warn)}
.crr.fill{color:var(--g-muted)}`,
  body: `<div class="doc">
  ${eyebrow('Foundations / <b>colour</b>')}
  <h1 class="h">Two themes, one red</h1>
  <p class="sub">Light is the docs light theme guren.dev ships (white + crimson); dark is the same docs' dark theme (a rose-pine-moon ground with a rose accent). The crimson-600 fill is shared by both themes — only accent <b>text</b> moves. Every ratio below is measured, and no colour under 4.5:1 gets a text job.</p>
  <div class="cols">
    <div class="col"><p class="tag">light · on ${C.page}</p>${swatchRows(lightSwatches, 'light')}</div>
    <div class="col dark"><p class="tag">dark · on ${C.dPage}</p>${swatchRows(darkSwatches, 'dark')}</div>
  </div>
  <p class="note">crimson-500 <code>#f23a3a</code> measures ${cr(C.dangerChip, C.dPage)}:1 on the dark ground. That is why the docs themselves switch their dark accent to rose <code>#eb6f92</code> (${cr(C.dAccentText, C.dPage)}:1), and this kit follows — the deck's blush reasoning, answered for apps.</p>
</div>`,
})

page({
  path: 'foundations/typography.html',
  group: 'Foundations',
  title: 'Guren UI — Typography',
  css: `.spec{display:grid;grid-template-columns:190px 1fr;gap:10px 24px;margin-top:26px;align-items:baseline}
.spec .m{font:500 11.5px/1.7 var(--g-font-mono);color:var(--g-muted)}
.s32{font-size:26px;font-weight:700;color:var(--g-heading);letter-spacing:-.01em}
.s20{font-size:20px;font-weight:700;color:var(--g-heading);letter-spacing:-.01em}
.s15{font-size:15px;font-weight:700;color:var(--g-heading)}
.s14{font-size:14px;color:var(--g-text)}
.s13{font-size:13px;color:var(--g-text-2)}
.s12m{font:500 11.5px/1.7 var(--g-font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--g-muted)}
.s12d{font:400 12.5px/1.7 var(--g-font-mono);color:var(--g-text)}`,
  body: `<div class="doc">
  ${eyebrow('Foundations / <b>typography</b>')}
  <h1 class="h">One gothic family; the contrast is spent on mono</h1>
  <p class="sub">UI text is Noto Sans JP at 400/700 only — one family covering Latin, kana and kanji, so a bilingual Guren app never falls back mid-sentence. The second face is JetBrains Mono, and in an app only machine-issued values — IDs, timestamps, counts, keys, code — get to be mono.</p>
  <div class="spec">
    <span class="m">26 / 700 / -1%</span><span class="s32">Dashboard</span>
    <span class="m">20 / 700 / -1%</span><span class="s20">Page title (carries the tick)</span>
    <span class="m">15 / 700</span><span class="s15">Card heading</span>
    <span class="m">14 / 400 / 1.6</span><span class="s14">Body text — form values share this size. 日本語もこの一家族で組まれる。</span>
    <span class="m">13 / 400</span><span class="s13">Help text, secondary lines.</span>
    <span class="m">11.5 mono / caps</span><span class="s12m">table header · nav section</span>
    <span class="m">12.5 mono</span><span class="s12d">post_2041 · 2026-08-20 14:32 · guren check --json</span>
  </div>
  <p class="note">Columns of numbers (amounts, counts) are always mono and right-aligned — digits that do not line up vertically cannot be read. The only names in <code>font-family</code> are the two self-hosted families; fallbacks are generic keywords only. Never name a face you cannot supply.</p>
</div>`,
})

page({
  path: 'foundations/surface.html',
  group: 'Foundations',
  title: 'Guren UI — Surface & geometry',
  css: `.geo{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:26px}
.g{border:1px solid var(--g-line);border-radius:12px;padding:16px}
.g .t{font:500 11.5px/1.7 var(--g-font-mono);color:var(--g-muted);margin:0 0 8px}
.g .v{font-size:13px;color:var(--g-text);line-height:1.65}
.g .v code{font-family:var(--g-font-mono);font-size:11.5px;color:var(--g-accent-text)}`,
  body: `<div class="doc">
  ${eyebrow('Foundations / <b>surface</b>')}
  <h1 class="h">A 4px grid, two radii, two shadows</h1>
  <p class="sub">Keep the vocabulary of dimensions small. Controls round at 8px, cards at 12px. Two shadows only — resting and floating, both values the docs ship. Theming is one class, <code>:root.dark</code> (or <code>.dark</code> on any subtree); every component follows through the tokens.</p>
  <div class="geo">
    <div class="g"><p class="t">spacing</p><p class="v">4 · 8 · 12 · 16 · 20 · 24 · 32 · 48. Use 8–16 inside a component, 20–32 between components.</p></div>
    <div class="g"><p class="t">radius</p><p class="v"><code>--g-r-ctl: 8px</code>: buttons, inputs, tabs.<br><code>--g-r-card: 12px</code>: cards, modals, code surfaces.</p></div>
    <div class="g"><p class="t">elevation</p><p class="v"><code>--g-shadow-card</code> for resting surfaces, <code>--g-shadow-float</code> for modals and toasts. Borders lead; shadows assist.</p></div>
    <div class="g"><p class="t">tick</p><p class="v">The ember tick (a 3px slice of the logo gradient) appears <b>once per screen</b>: page title or current nav item. When both are visible, the nav wins.</p></div>
    <div class="g"><p class="t">theme</p><p class="v">Fills (crimson) and the ink surface never move with theme. Only text, ground and line tokens do.</p></div>
    <div class="g"><p class="t">focus</p><p class="v">The focus ring is a 2px crimson outline, identical in both themes — the one red visible on either ground.</p></div>
  </div>
</div>`,
})

/* ═════════════════════════════════════════════════════════════════ brand ══ */

page({
  path: 'brand/mark.html',
  group: 'Brand',
  title: 'Guren UI — Mark & the red budget',
  css: `.hero{display:flex;gap:36px;align-items:center;margin-top:26px}
.lockup{display:flex;align-items:center;gap:18px;padding:28px 34px;border:1px solid var(--g-line);border-radius:14px}
.lockup.dark{background:${C.dPage}}
.lockup .wd{font-size:30px;font-weight:700;letter-spacing:-.01em}
.budget{margin-top:30px;border-top:1px solid var(--g-line)}`,
  body: `<div class="doc">
  ${eyebrow('Brand / <b>mark</b>')}
  <h1 class="h">One flame, and a budget for red</h1>
  <p class="sub">The mark is the guren.dev flame (<span style="font-family:var(--g-font-mono);font-size:12px">#FF3C28 → #8B0000</span>). Inside an app, red is the brand and the danger colour at once — so its uses are budgeted.</p>
  <div class="hero">
    <div class="lockup"><span>${flame(56, 'f1')}</span><span class="wd" style="color:${C.heading}">Guren</span></div>
    <div class="lockup dark"><span>${flame(56, 'f2')}</span><span class="wd" style="color:${C.dHeading}">Guren</span></div>
  </div>
  <div class="budget">
    <div class="g-callout note"><span class="k">note</span><span class="b">One crimson fill per screen — the primary action. The only other red text is a link (accent-text).</span></div>
    <div class="g-callout rule"><span class="k">rule</span><span class="b">Destructive actions never get a red fill. With a single hue, the fill is reserved for the protagonist; destruction is an <b>outline + explicit verb</b> (“Delete”), and the red fill appears only inside a confirm step.</span></div>
    <div class="g-callout never"><span class="k">never</span><span class="b">No flame watermarks or background decoration. No repeating the tick as a border ornament. No gradient text.</span></div>
  </div>
</div>`,
})

/* ════════════════════════════════════════════════════════════ components ══ */

const BTN_ROWS = `<div class="stack">
  <div class="row">
    <button class="g-btn g-btn-primary">Save</button>
    <button class="g-btn g-btn-secondary">Cancel</button>
    <button class="g-btn g-btn-ghost">Revert to draft</button>
    <button class="g-btn g-btn-danger">Delete</button>
  </div>
  <div class="row">
    <button class="g-btn g-btn-sm g-btn-primary">Add</button>
    <button class="g-btn g-btn-sm g-btn-secondary">Duplicate</button>
    <button class="g-btn g-btn-primary" disabled>Save</button>
  </div>
</div>`

page({
  path: 'components/buttons.html',
  group: 'Components',
  title: 'Guren UI — Buttons',
  body: `<div class="doc">
  ${eyebrow('Components / <b>buttons</b>')}
  <h1 class="h">Buttons</h1>
  <p class="sub">primary / secondary / ghost / danger plus a small size. The red fill belongs to primary alone — danger being an outline is not decoration, it is how a red-brand app tells destruction from the protagonist.</p>
  ${pair(BTN_ROWS)}
  <p class="note">One primary per screen; in a row of actions, primary sits rightmost. <code>disabled</code> is opacity, never a hue change.</p>
</div>`,
})

const INPUT_ROWS = `<div class="stack">
  <div class="g-field">
    <label class="g-label">Title<span class="req">*</span></label>
    <input class="g-input" value="Guren v2.5 release notes">
    <span class="g-help">Up to 100 characters. The URL slug is generated automatically.</span>
  </div>
  <div class="g-field invalid">
    <label class="g-label">Slug</label>
    <input class="g-input" value="release notes!">
    <span class="g-error">Only lowercase letters, digits and hyphens are allowed</span>
  </div>
  <div class="g-field">
    <label class="g-label">Category</label>
    <select class="g-select"><option>Releases</option></select>
  </div>
  <div class="row">
    <label class="g-check"><input type="checkbox" checked><span>Publish</span></label>
    <label class="g-check"><input type="checkbox"><span>Allow comments</span></label>
  </div>
</div>`

page({
  path: 'components/inputs.html',
  group: 'Components',
  title: 'Guren UI — Inputs',
  body: `<div class="doc">
  ${eyebrow('Components / <b>inputs</b>')}
  <h1 class="h">Inputs</h1>
  <p class="sub">Labels are 13px/700; values share the 14px body size. An error turns the border crimson-500 and the message to danger text — the exact shape the 422 field errors from <span style="font-family:var(--g-font-mono);font-size:12px">validateBody()</span> flow into.</p>
  ${pair(INPUT_ROWS)}
  <p class="note">Focus is a 2px crimson ring (<code>outline-offset: -1px</code>). The ring beats the error border, so the field being fixed is always the loudest thing on screen.</p>
</div>`,
})

const FORM_BODY = `<div class="g-card" style="max-width:460px">
  <div class="g-card-head"><span class="g-card-title">Edit post</span><span class="g-badge g-badge-neutral">draft</span></div>
  <div class="g-card-body stack">
    <div class="g-field">
      <label class="g-label">Title<span class="req">*</span></label>
      <input class="g-input" value="">
      <span class="g-error">Title is required</span>
    </div>
    <div class="g-field">
      <label class="g-label">Body<span class="req">*</span></label>
      <textarea class="g-textarea" rows="3" placeholder="Markdown is supported"></textarea>
    </div>
    <div class="row" style="justify-content:flex-end;gap:10px;margin-top:4px">
      <button class="g-btn g-btn-secondary">Cancel</button>
      <button class="g-btn g-btn-primary">Save</button>
    </div>
  </div>
</div>`

page({
  path: 'components/form.html',
  group: 'Components',
  title: 'Guren UI — Form',
  body: `<div class="doc">
  ${eyebrow('Components / <b>form</b>')}
  <h1 class="h">Form</h1>
  <p class="sub">An edit form on a card. Errors from a 422 sit directly under their fields — no summary box, because an error is read where it happened. The action row is right-aligned, primary rightmost.</p>
  ${pair(FORM_BODY)}
</div>`,
})

const BADGE_ROWS = `<div class="stack">
  <div class="row">
    <span class="g-badge g-badge-ok">published</span>
    <span class="g-badge g-badge-warn">pending</span>
    <span class="g-badge g-badge-danger">failed</span>
    <span class="g-badge g-badge-neutral">draft</span>
  </div>
  <div class="row">
    <span class="g-badge g-badge-ok">migrated</span>
    <span class="g-badge g-badge-warn">queue: 12</span>
    <span class="g-badge g-badge-neutral">v2.5.0</span>
  </div>
</div>`

page({
  path: 'components/badges.html',
  group: 'Components',
  title: 'Guren UI — Badges',
  body: `<div class="doc">
  ${eyebrow('Components / <b>badges</b>')}
  <h1 class="h">Badges</h1>
  <p class="sub">State is written in lowercase mono — a badge holds machine-issued vocabulary (published / failed / draft), not a sentence. The dot is currentColor: if the text is readable, so is the indicator.</p>
  ${pair(BADGE_ROWS)}
  <p class="note">ok is the foam family, warn is gold, danger is crimson, everything else is neutral. When four kinds are not enough, grow the label vocabulary, not the palette.</p>
</div>`,
})

const CALLOUT_ROWS = `<div>
  <div class="g-callout note"><span class="k">note</span><span class="b">Migrations are applied with <code>bun run db:migrate</code>.</span></div>
  <div class="g-callout ok"><span class="k">ok</span><span class="b">42 routes checked — controllers and pages all agree.</span></div>
  <div class="g-callout rule"><span class="k">rule</span><span class="b">Always set <code>keyGenerator</code> in production; the default rate-limit key is Bun-only.</span></div>
  <div class="g-callout never"><span class="k">never</span><span class="b">Never trust the <code>X-Testing-User</code> header in production.</span></div>
</div>
<div style="margin-top:22px" class="stack">
  <div class="g-toast ok"><span class="k">ok</span><span>Post saved</span></div>
  <div class="g-toast never"><span class="k">error</span><span>Save failed — check your connection</span></div>
</div>`

page({
  path: 'components/callouts.html',
  group: 'Components',
  title: 'Guren UI — Callouts & flash',
  body: `<div class="doc">
  ${eyebrow('Components / <b>callouts</b>')}
  <h1 class="h">Callouts are diagnostic rows, not boxes</h1>
  <p class="sub">The same anatomy as guren check output: a mono key in a fixed gutter, a hairline, ordinary body text. The key vocabulary is note / ok / rule / never. A flash (toast) is one line of that output printed on ink and floated — no coloured border, no tinted box; the key in its gutter is the entire signal, and because ink is themeless the flash is identical on both grounds.</p>
  ${pair(CALLOUT_ROWS)}
</div>`,
})

const CARD_ROWS = `<div class="stack">
  <div class="row" style="flex-wrap:nowrap">
    <div class="g-card" style="flex:1"><div class="g-card-body"><p style="margin:0;font:500 11.5px/1.7 var(--g-font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--g-muted)">posts</p><p style="margin:2px 0 0;font-size:24px;font-weight:700;color:var(--g-heading);font-family:var(--g-font-mono)">128</p><p style="margin:2px 0 0;font-size:12px;color:var(--g-ok)">+12 this week</p></div></div>
    <div class="g-card" style="flex:1"><div class="g-card-body"><p style="margin:0;font:500 11.5px/1.7 var(--g-font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--g-muted)">queue</p><p style="margin:2px 0 0;font-size:24px;font-weight:700;color:var(--g-heading);font-family:var(--g-font-mono)">3</p><p style="margin:2px 0 0;font-size:12px;color:var(--g-text-2)">2 workers idle</p></div></div>
  </div>
  <div class="g-card">
    <div class="g-card-head"><span class="g-card-title">Recent deploys</span><a href="#" style="font-size:12.5px;color:var(--g-accent-text);text-decoration:none">View all</a></div>
    <div class="g-card-body" style="padding-top:12px;font-size:13px;color:var(--g-text-2)">2026-08-20 14:32 · <span style="font-family:var(--g-font-mono);font-size:12px">fc22c89</span> · production</div>
  </div>
</div>`

page({
  path: 'components/card.html',
  group: 'Components',
  title: 'Guren UI — Cards',
  body: `<div class="doc">
  ${eyebrow('Components / <b>cards</b>')}
  <h1 class="h">Cards</h1>
  <p class="sub">A border plus a whisper of shadow. Stat-card labels share the table header's mono caps; values line up in mono. A card head carries the title and exactly one thing on the right — a link or a badge.</p>
  ${pair(CARD_ROWS)}
</div>`,
})

const TABLE_ROWS = `<div class="g-card"><table class="g-table">
  <thead><tr><th>title</th><th>status</th><th>author</th><th class="num">views</th><th>updated</th></tr></thead>
  <tbody>
    <tr><td>Guren v2.5 release notes</td><td><span class="g-badge g-badge-ok">published</span></td><td>Daiki Urata</td><td class="num">4,182</td><td class="id">2026-08-19</td></tr>
    <tr><td>Typed forms with Inertia</td><td><span class="g-badge g-badge-neutral">draft</span></td><td>Daiki Urata</td><td class="num">—</td><td class="id">2026-08-18</td></tr>
    <tr><td>Guren on Cloudflare D1</td><td><span class="g-badge g-badge-warn">pending</span></td><td>Daiki Urata</td><td class="num">903</td><td class="id">2026-08-12</td></tr>
  </tbody>
</table></div>`

page({
  path: 'components/table.html',
  group: 'Components',
  title: 'Guren UI — Table',
  width: 1180,
  body: `<div class="doc">
  ${eyebrow('Components / <b>table</b>')}
  <h1 class="h">Table</h1>
  <p class="sub">Headers are 11.5px mono caps; numeric columns are mono and right-aligned; dates and IDs are muted mono. Row hover is the raised ground — not selection, not emphasis, just where you are.</p>
  ${pair(TABLE_ROWS)}
</div>`,
})

const NAV_ROWS = `<div style="border:1px solid var(--g-line);border-radius:12px;overflow:hidden">
  <div class="g-topbar">
    <span style="display:flex;align-items:center;gap:9px">${flame(22, 'nf')}<b style="font-size:15px;color:var(--g-heading)">Guren Blog</b></span>
    <span style="flex:1"></span>
    <span class="g-kbd">⌘K</span>
    <span style="width:28px;height:28px;border-radius:999px;background:var(--g-accent-tint);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--g-accent-text)">DU</span>
  </div>
  <div style="display:flex">
    <nav class="g-side" style="min-height:230px">
      <p class="sec">content</p>
      <a href="#" class="active">Posts</a>
      <a href="#">Categories</a>
      <a href="#">Comments</a>
      <p class="sec">system</p>
      <a href="#">Jobs</a>
      <a href="#">Settings</a>
    </nav>
    <div style="flex:1;padding:20px;background:var(--g-page)"><span style="font-size:20px;font-weight:700;color:var(--g-heading);letter-spacing:-.01em">Posts</span></div>
  </div>
</div>`

page({
  path: 'components/nav.html',
  group: 'Components',
  title: 'Guren UI — Navigation',
  width: 1240,
  body: `<div class="doc">
  ${eyebrow('Components / <b>navigation</b>')}
  <h1 class="h">Navigation</h1>
  <p class="sub">Topbar plus sidebar. The current place is the ember tick and a pale accent wash. On a screen where the nav carries the tick, the page title goes without one (the once-per-screen rule). Section headings share the table header's mono caps.</p>
  ${pair(NAV_ROWS)}
</div>`,
})

const TABS_ROWS = `<div class="stack">
  <div class="g-tabs">
    <a href="#" class="active">Overview</a>
    <a href="#">Revisions</a>
    <a href="#">Comments<span style="margin-left:6px" class="g-badge g-badge-neutral">3</span></a>
  </div>
  <div class="row" style="justify-content:space-between">
    <span style="font-size:12.5px;color:var(--g-text-2)">Showing 21–40 of 128</span>
    <nav class="g-pages">
      <a href="#">←</a><a href="#">1</a><a href="#" class="active">2</a><a href="#">3</a><a href="#">…</a><a href="#">7</a><a href="#">→</a>
    </nav>
  </div>
</div>`

page({
  path: 'components/tabs.html',
  group: 'Components',
  title: 'Guren UI — Tabs & pagination',
  body: `<div class="doc">
  ${eyebrow('Components / <b>tabs</b>')}
  <h1 class="h">Tabs & pagination</h1>
  <p class="sub">The active tab reuses the title's tick as an underline. Page numbers are mono — they are digits at work. The current page spends a small piece of the screen's crimson fill budget, so check the composition when a primary button shares the screen.</p>
  ${pair(TABS_ROWS)}
</div>`,
})

const MODAL_ROWS = `<div class="g-modal">
  <div class="g-modal-head"><span class="g-card-title">Delete this post?</span></div>
  <div class="g-modal-body">This deletes “Guren v2.5 release notes”. It cannot be undone, and the published URL will return 404.</div>
  <div class="g-modal-foot">
    <button class="g-btn g-btn-secondary">Cancel</button>
    <button class="g-btn g-btn-primary" style="background:var(--g-danger-chip)">Delete</button>
  </div>
</div>`

page({
  path: 'components/modal.html',
  group: 'Components',
  title: 'Guren UI — Modal',
  body: `<div class="doc">
  ${eyebrow('Components / <b>modal</b>')}
  <h1 class="h">Modal</h1>
  <p class="sub">The confirm step for destruction — this is where the red fill finally moves to “Delete”. The body says exactly what happens and what will not come back. The footer separates the action row on the raised ground.</p>
  ${pair(MODAL_ROWS)}
  <p class="note">The confirm modal's primary is a red fill because destruction is this screen's protagonist — the one-fill-per-screen budget holds.</p>
</div>`,
})

const CODE_ROWS = `<div class="g-code"><span class="pr">$</span> guren check
<span class="fn">routes</span>     42 checked, 0 drift
<span class="fn">console</span>    7 commands registered
<span class="st">schema</span>     1 warning — posts.published_at is timestamp, expected timestamptz
<span class="cm"># fix: db/schema.ts:18 → timestamp('published_at', { withTimezone: true })</span></div>`

page({
  path: 'components/code.html',
  group: 'Components',
  title: 'Guren UI — Code & terminal',
  body: `<div class="doc">
  ${eyebrow('Components / <b>code</b>')}
  <h1 class="h">The code surface has no theme</h1>
  <p class="sub">ink <span style="font-family:var(--g-font-mono);font-size:12px">${C.ink}</span> is the surface CodeBlock.tsx uses even in light mode, and this kit keeps it identical in both themes. Syntax is the docs' rose-pine-moon: foam / gold / iris.</p>
  ${pair(CODE_ROWS)}
  <p class="note">Text on ink is bone <code>${C.bone}</code> (${cr(C.bone, C.ink)}:1). gold marks the one line that needs attention; iris is keywords only. The UI signal colours (ok/warn/danger) and the code syntax colours are cousins with different jobs — never mix them.</p>
</div>`,
})

const EMPTY_ROWS = `<div class="g-empty">
  ${flame(44, 'ef', 0.45)}
  <h3>No posts yet</h3>
  <p>Create your first post and the list will appear here. From the CLI, <span style="font-family:var(--g-font-mono);font-size:12px">bunx guren make:feature Post</span> scaffolds the whole set.</p>
  <button class="g-btn g-btn-primary">Create post</button>
</div>`

page({
  path: 'components/empty.html',
  group: 'Components',
  title: 'Guren UI — Empty state',
  body: `<div class="doc">
  ${eyebrow('Components / <b>empty</b>')}
  <h1 class="h">Empty state</h1>
  <p class="sub">The one place a flame watermark is allowed (44px at 0.45 opacity). Say what is missing and offer exactly one next step. The dashed border is the sign of “nothing here yet” — distinct from any resting card.</p>
  ${pair(EMPTY_ROWS)}
</div>`,
})

/* ═══════════════════════════════════════════════════════════════ patterns ══ */

const SCREEN_CSS = `.screen{border:1px solid var(--g-line);border-radius:14px;overflow:hidden;background:var(--g-page);color:var(--g-text)}
.pair2{display:grid;grid-template-columns:1fr;gap:26px;margin-top:28px}`

page({
  path: 'patterns/login.html',
  group: 'Patterns',
  title: 'Guren UI — Login',
  css: SCREEN_CSS,
  body: `<div class="doc">
  ${eyebrow('Patterns / <b>login</b>')}
  <h1 class="h">Login</h1>
  <p class="sub">The screen make:auth generates. One centered card, one brand lockup, and the only red fill is “Sign in”.</p>
  <div class="pair">
    ${['', 'dark']
      .map(
        (d) => `<div class="pane ${d}"><p class="tag">${d || 'light'}</p>
    <div style="display:flex;justify-content:center;padding:26px 0;background:var(--g-page);border-radius:10px">
      <div style="width:320px">
        <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:22px">${flame(30, 'lf' + (d || 'l'))}<b style="font-size:19px;color:var(--g-heading)">Guren Blog</b></div>
        <div class="g-card"><div class="g-card-body stack">
          <div class="g-field"><label class="g-label">Email</label><input class="g-input" value="daiki@example.com"></div>
          <div class="g-field"><label class="g-label">Password</label><input class="g-input" type="password" value="········"></div>
          <button class="g-btn g-btn-primary" style="justify-content:center">Sign in</button>
          <a href="#" style="font-size:12.5px;color:var(--g-accent-text);text-decoration:none;text-align:center">Forgot your password?</a>
        </div></div>
      </div>
    </div></div>`,
      )
      .join('\n')}
  </div>
</div>`,
})

function crudScreen(idSuffix: string): string {
  return `<div class="screen">
  <div class="g-topbar">
    <span style="display:flex;align-items:center;gap:9px">${flame(22, 'cf' + idSuffix)}<b style="font-size:15px;color:var(--g-heading)">Guren Blog</b></span>
    <span style="flex:1"></span>
    <span style="width:28px;height:28px;border-radius:999px;background:var(--g-accent-tint);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--g-accent-text)">DU</span>
  </div>
  <div style="display:flex">
    <nav class="g-side">
      <p class="sec">content</p>
      <a href="#" class="active">Posts</a>
      <a href="#">Categories</a>
      <p class="sec">system</p>
      <a href="#">Jobs</a>
    </nav>
    <div style="flex:1;padding:22px 26px;background:var(--g-page)">
      <div class="row" style="justify-content:space-between;margin-bottom:16px">
        <span style="font-size:20px;font-weight:700;color:var(--g-heading)">Posts</span>
        <span class="row" style="gap:10px">
          <input class="g-input" placeholder="Search…" style="width:200px;padding:6px 12px">
          <button class="g-btn g-btn-primary">New post</button>
        </span>
      </div>
      <div class="g-card"><table class="g-table">
        <thead><tr><th>title</th><th>status</th><th class="num">views</th><th>updated</th><th></th></tr></thead>
        <tbody>
          <tr><td>Guren v2.5 release notes</td><td><span class="g-badge g-badge-ok">published</span></td><td class="num">4,182</td><td class="id">2026-08-19</td><td style="text-align:right"><a href="#" style="font-size:12.5px;color:var(--g-accent-text);text-decoration:none">Edit</a></td></tr>
          <tr><td>Typed forms with Inertia</td><td><span class="g-badge g-badge-neutral">draft</span></td><td class="num">—</td><td class="id">2026-08-18</td><td style="text-align:right"><a href="#" style="font-size:12.5px;color:var(--g-accent-text);text-decoration:none">Edit</a></td></tr>
          <tr><td>Guren on Cloudflare D1</td><td><span class="g-badge g-badge-warn">pending</span></td><td class="num">903</td><td class="id">2026-08-12</td><td style="text-align:right"><a href="#" style="font-size:12.5px;color:var(--g-accent-text);text-decoration:none">Edit</a></td></tr>
        </tbody>
      </table></div>
      <div class="row" style="justify-content:flex-end;margin-top:14px">
        <nav class="g-pages"><a href="#">←</a><a href="#" class="active">1</a><a href="#">2</a><a href="#">→</a></nav>
      </div>
    </div>
  </div>
</div>`
}

page({
  path: 'patterns/crud.html',
  group: 'Patterns',
  title: 'Guren UI — CRUD index',
  width: 1280,
  css: SCREEN_CSS,
  body: `<div class="doc">
  ${eyebrow('Patterns / <b>crud</b>')}
  <h1 class="h">CRUD index</h1>
  <p class="sub">The index make:feature Post assembles. The nav tick marks the current place, so the page title goes bare. The one red fill is “New post” (the current page number coexists as a small exception).</p>
  <div class="pair2">
    ${crudScreen('l')}
    <div class="dark">${crudScreen('d')}</div>
  </div>
</div>`,
})

function dashScreen(idSuffix: string): string {
  return `<div class="screen">
  <div class="g-topbar">
    <span style="display:flex;align-items:center;gap:9px">${flame(22, 'df' + idSuffix)}<b style="font-size:15px;color:var(--g-heading)">Guren Blog</b></span>
    <span style="flex:1"></span>
    <span class="g-kbd">⌘K</span>
  </div>
  <div style="padding:22px 26px">
    <span class="g-title">Dashboard</span>
    <div class="row" style="flex-wrap:nowrap;margin-top:18px">
      ${[
        ['posts', '128', '+12 this week', 'var(--g-ok)'],
        ['views / 7d', '31,204', '+8.4%', 'var(--g-ok)'],
        ['queue', '3', '2 workers idle', 'var(--g-text-2)'],
        ['failed jobs', '1', 'SendDigestJob', 'var(--g-danger)'],
      ]
        .map(
          ([t, v, s, c]) => `<div class="g-card" style="flex:1"><div class="g-card-body"><p style="margin:0;font:500 11.5px/1.7 var(--g-font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--g-muted)">${t}</p><p style="margin:2px 0 0;font-size:24px;font-weight:700;color:var(--g-heading);font-family:var(--g-font-mono)">${v}</p><p style="margin:2px 0 0;font-size:12px;color:${c}">${s}</p></div></div>`,
        )
        .join('\n')}
    </div>
    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-top:16px">
      <div class="g-card">
        <div class="g-card-head"><span class="g-card-title">Recent posts</span><a href="#" style="font-size:12.5px;color:var(--g-accent-text);text-decoration:none">View all</a></div>
        <table class="g-table">
          <tbody>
            <tr><td>Guren v2.5 release notes</td><td style="text-align:right"><span class="g-badge g-badge-ok">published</span></td></tr>
            <tr><td>Typed forms with Inertia</td><td style="text-align:right"><span class="g-badge g-badge-neutral">draft</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="g-card">
        <div class="g-card-head"><span class="g-card-title">System</span></div>
        <div class="g-card-body" style="padding-top:10px">
          <div class="g-callout ok" style="border-top:none"><span class="k">ok</span><span class="b">guren check — 42 routes, 0 drift</span></div>
          <div class="g-callout never"><span class="k">never</span><span class="b">SendDigestJob failed 3 times — <a href="#" style="color:var(--g-accent-text)">view logs</a></span></div>
        </div>
      </div>
    </div>
  </div>
</div>`
}

page({
  path: 'patterns/dashboard.html',
  group: 'Patterns',
  title: 'Guren UI — Dashboard',
  width: 1280,
  css: SCREEN_CSS,
  body: `<div class="doc">
  ${eyebrow('Patterns / <b>dashboard</b>')}
  <h1 class="h">Dashboard</h1>
  <p class="sub">A row of stat cards, a table, diagnostic rows. Every number is mono. There is no primary button here — a dashboard is a reading screen; it has no protagonist action.</p>
  <div class="pair2">
    ${dashScreen('l')}
    <div class="dark">${dashScreen('d')}</div>
  </div>
</div>`,
})

/* ══════════════════════════════════════════════════════════════ artefacts ══ */

emit('tokens.css', TOKENS.replaceAll('__FONTS__', 'fonts'))
emit('guren-ui.css', TOKENS.replaceAll('__FONTS__', 'fonts') + '\n' + KIT)

emit(
  'README.md',
  `# Guren UI

Application design system for products built on [Guren](https://guren.dev) —
the app-side sibling of Guren Deck (slides). Generated by \`build.ts\`; do not
edit files in \`dist/\` by hand.

## Files

- \`tokens.css\` — variables only (fonts, colours, geometry, \`.dark\` overrides)
- \`guren-ui.css\` — tokens + the component classes every preview uses
- \`foundations/\` \`brand/\` \`components/\` \`patterns/\` — preview cards
- \`fonts/\` — self-hosted Noto Sans JP + JetBrains Mono (SIL OFL 1.1)

## The decisions

- **Both themes are the docs' own themes.** Light = white + crimson, dark =
  the rose-pine-moon-derived ground with the rose accent guren.dev already
  ships. Nothing invented.
- **The red budget.** crimson-600 fills appear once per screen (the primary
  action). Destructive actions are outline + explicit verb; the red fill moves
  to them only inside a confirm step.
- **Accent text moves per theme, fills do not.** crimson measures ~4.4:1 on
  the dark ground, so dark accent text is rose \`#eb6f92\` — the docs' answer,
  and the deck's blush reasoning applied to apps.
- **One structural device.** The ember tick (3px slice of the logo gradient)
  marks the current place: page title or active nav item, never both.
- **Callouts are diagnostic rows** (note / ok / rule / never), the shape of
  \`guren check\` output. Flash toasts are the same row, floated.
- **The code surface has no theme.** ink \`#1a1212\` in light and dark alike,
  with the rose-pine-moon syntax colours the docs use.
- **Machine-issued values are mono.** IDs, dates, counts, table headers,
  badge labels, page numbers. Numbers are mono and right-aligned, always.
`,
)

/* contact sheet at repo root for local review */
const sheet = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Guren UI — contact sheet</title>
<style>
body{margin:0;background:#0e0e18;font-family:sans-serif;padding:24px}
h1{color:#e0def4;font-size:18px}
.c{margin:18px 0}
.c p{color:#908caa;font-family:monospace;font-size:12px;margin:0 0 6px}
iframe{border:1px solid #2e2e4a;border-radius:8px;background:#fff;width:100%;height:640px}
</style>
</head>
<body>
<h1>Guren UI — ${files.filter((f) => f.path.endsWith('.html')).length} cards</h1>
${files
  .filter((f) => f.path.endsWith('.html'))
  .map((f) => `<div class="c"><p>${f.path}</p><iframe src="dist/${f.path}"></iframe></div>`)
  .join('\n')}
</body>
</html>
`
writeFileSync(join(import.meta.dir, 'sheet.html'), sheet)

cpSync(join(import.meta.dir, 'fonts'), join(OUT, 'fonts'), { recursive: true })

console.log(`built ${files.length} files into dist/`)
for (const f of files) console.log('  ' + f.path)
