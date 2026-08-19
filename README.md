# guren-ui

Application design system for products built on [Guren](https://guren.dev) —
the app-side sibling of guren-deck (talk slides). Published to a Claude Design
system project so agents and designers can build Guren apps that look like
Guren.

## Build

```bash
bun build.ts
```

Everything is generated into `dist/` by the single generator in `build.ts`:
19 preview cards, `tokens.css` (variables only), `guren-ui.css` (variables +
component classes), and a local contact sheet at `sheet.html` for reviewing
all cards at once (serve the repo root statically; the cards load `dist/`).
`dist/` is not committed — it is fully reproducible from this repo.

`fonts/` is vendored source, not build output (Noto Sans JP + JetBrains Mono,
both SIL OFL 1.1 — the licence texts travel with the files). The generator
copies it into `dist/fonts/` so a clean build cannot leave the `@font-face`
rules pointing at nothing.

## Layout

| Path | What it is |
| --- | --- |
| `build.ts` | The whole system. Tokens, the component kit, every card. |
| `fonts/` | Vendored woff2 + the OFL licence texts. |
| `dist/` | Generated. This is what gets uploaded. |
| `dist/README.md` | The design system's own documentation, generated too. |

Each preview is standalone — the tokens and component classes are inlined into
every HTML file — so a card renders without resolving any relative asset
except its fonts.

## Where the design comes from

Nothing here is invented decoration. Every value traces to a surface the
project already ships: the crimson scale and the docs light/dark themes in
`web/resources/css/app.css`, the flame gradient in `web/public/logo.svg`, the
terminal surface `#1a1212` from `CodeBlock.tsx`, and the rose-pine palettes
the docs render code with (moon for dark, dawn as its light counterpart).

Decisions worth knowing before changing anything:

- **Both themes are the docs' own themes.** Light = white + crimson, dark =
  the rose-pine-moon-derived ground with the rose accent guren.dev ships.
- **The red budget.** One crimson-600 fill per screen — the primary action.
  Destructive actions are outline + explicit verb; the red fill moves to them
  only inside a confirm step. This is how a red-brand app tells destruction
  from the protagonist.
- **Accent text moves per theme, fills do not.** crimson measures ~4.4:1 on
  the dark ground, so dark accent text is rose `#eb6f92` — the docs' answer.
- **One structural device.** The ember tick (a 3px slice of the logo
  gradient) marks the current place: page title or active nav item, never
  both at once.
- **Callouts are diagnostic rows** (note / ok / rule / never), the shape of
  `guren check` output. A flash toast is the same row, floated.
- **The code surface has no theme** — ink `#1a1212` in light and dark alike.
- **Machine-issued values are mono**: IDs, dates, counts, table headers,
  badge labels, page numbers. Numbers are mono and right-aligned, always.

## Publishing

The bundle is pushed to a Claude Design system project (`Guren UI`) with the
DesignSync tool: finalize a plan over `dist/`, then write the files. Fonts
also need registering through the pane's own **Upload fonts** control —
writing them into `fonts/` does not populate the pane's font registry.

## License

MIT for everything in this repo except `fonts/`, which is distributed under
the SIL Open Font License 1.1 (see `fonts/LICENSE-*.txt`).
