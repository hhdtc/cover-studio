---
name: catalog-ui-site
description: Reverse-engineer a public site's design language and file it into a UI component library. Measures typography, motion, materials, layout, media, responsive behaviour and loading strategy, then rebuilds them as an original component kit with modules, deep routes, bilingual copy and a machine-readable catalog. Triggers on: 收录这个网站, 逆向组件库, 分析这个官网, 把这个站加进 UI 组件库, extract design tokens from a site, analyze this website's design, build a component library from a site, 抓一下它的字体和动效, catalog a design system.
---

# Catalog a UI site

A repeatable pipeline for turning a public site or project into a catalogued,
original component kit inside this repo (`websnake`). It exists because the
first pass on a real site is easy to get subtly wrong: fabricated file paths,
copied stylesheet text, a kit that renders as grey slabs, routes an agent
cannot enumerate.

## Deliverables

| Artefact | Path |
| --- | --- |
| Token sheet | `src/<prefix>-kit/tokens.css` |
| Components | `src/<prefix>-kit/*.vue` + `kit.css` |
| Showcase page | `src/views/<Name>KitView.vue`, route `#/<prefix>-kit` |
| Library entry | project + modules in `src/views/UILibraryView.vue` |
| Demo branches | `src/components/ModuleDemo.vue` |
| English copy | `src/views/uiLibraryEn.ts` |
| Machine index | `public/ui-catalog.json` (project + module `route`) |
| Write-up | `docs/<site>-design-system.md` |
| Screenshots | `public/<prefix>-kit/guide-*.png` (renders of *your* kit) |

## Phase 0 — Scope and legality

Decide before measuring:

- **Copy this:** numbers, frequencies, ratios, structure, technique names.
- **Never copy:** stylesheet rule text, font files, imagery, logos/marks,
  marketing copy. Demo strings are always your own placeholder text.
- **Pick a class prefix** that does not collide: `grep -c "\.<prefix>-" src/style.css`
  must be `0` before you start. Existing sets: `ef-` (Endfield demo), `efk-`
  (Endfield kit), `apl-` (Apple kit).
- Name the doc and prefix in the plan so modules, components and CSS agree.

## Phase 1 — Capture

```bash
# Chrome must be a managed background job, and its profile must live in the
# workspace: $HOME is read-only here and /tmp is a per-command tmpfs.
google-chrome-stable --headless=new --remote-debugging-port=9222 \
  --remote-allow-origins='*' --user-data-dir="$PWD/.chrome-<site>" \
  --no-first-run --no-default-browser-check --disable-gpu \
  --hide-scrollbars --window-size=1600,1000 --no-sandbox about:blank   # run_in_background
```

Then open each URL with `PUT /json/new?<url>` and save the raw material:

```bash
mkdir -p .analysis/<site>/css
curl -sL --compressed -A '<desktop UA>' <url> -o .analysis/<site>/<page>.html
# extract <link rel=stylesheet> hrefs, download each into css/
```

Keep `.analysis/` in `.gitignore` — it holds third-party CSS that must never be
committed. Chrome's WebSocket URL is at `http://127.0.0.1:9222/json/list`.

## Phase 2 — CSS census

One script over the downloaded stylesheets. Report **frequencies, not prose**:

- `font-family` list; `font-size` / `letter-spacing` / `line-height` / `font-weight` histograms
- `@media (max-width: …)` histogram → the real breakpoints
- `max-width` histogram → the container ladder
- `border-radius`, `box-shadow`, `backdrop-filter`, `clip-path`, `mask-image` values
- `@keyframes` names; `transition` durations; `@supports` conditions
- counts of `prefers-reduced-motion`, `prefers-reduced-transparency`, `display:none`,
  `flex-direction:column`, `position:sticky`, `will-change`, `animation-timeline`

Histograms beat single values: a size that appears 63 times is the body size; a
breakpoint that appears 717 times is the real pivot.

## Phase 3 — Live census

Computed styles, on the real page, three viewports. Emulate rather than resize:

```js
Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
// then 834 / 1600, reloading between
```

Collect in one pass: rendered type combos (family|size|weight|tracking|leading
with counts), running animations (name@duration), `backdrop-filter` groups
(value + background alpha + height), sticky count, hidden count, stack blocks,
`clip-path` values, and media attributes:

- videos: `preload`, `poster`, `autoplay`, `playsinline`, `src` present
- images: `loading`, `srcset`, `<picture>`/`<source>` count and their `media`
- `link[rel=preload]`, deferred/async scripts

**Validate blur against a high-frequency backdrop.** A frosted panel over a
smooth gradient looks like a flat grey slab; you will think the CSS is wrong
when the demo backdrop is. Grid lines or dots behind the glass are mandatory.

## Phase 4 — Derive the token sheet

Write `tokens.css` from measured values only, in this order:

1. palette (hex + how many times it appeared, split light/dark)
2. type ladder — **size, tracking and leading as one triple**
3. motion scale (durations that recur, the two easings actually used)
4. material ladder (blur radii + background alphas + saturate)
5. layout ladder (container widths, padding rhythm, breakpoints)
6. radius ladder (cards / pills / small controls)
7. shadows, focus ring
8. `prefers-reduced-motion` collapse + a `.…-no-motion` kill switch

## Phase 5 — Build the kit

- One component per dimension, not per page section.
- Original CSS only. Attack the effect with your own technology where the
  original used something unportable (SVG filter → screen-blended layers).
- `@supports` gate anything modern; give an opaque fallback first.
- Copy is placeholder (`Display`, `Overview`, `Colour in motion`).
- Every scroll effect: `IntersectionObserver` for visibility, one `rAF` read
  per frame, progress into a CSS variable, CSS does the transform.
- Always ship: reduced-motion, focus-visible rings, tabular numerals for stats.

## Phase 6 — File it into the library

1. **Project entry** in `UILibraryView.vue`: `id`, `name`, `tagline`,
   `description` (say what was actually covered), `repo`, `release`, `design`,
   `demo`, `stack`, `theme`, `screenshots`, `modules`.
2. **Modules** with ids `<prefix>-<topic>`; each needs `name`, `group`,
   `summary`, `files`, `points`.
3. **File manifests must be verified.** Prefer the upstream GitHub tree over a
   vendored demo copy:

   ```bash
   curl -s "https://api.github.com/repos/<owner>/<repo>/git/trees/HEAD?recursive=1"
   ```

   Every path either exists in that tree or on disk. Never invent a plausible
   filename — that is the fastest way to poison the catalogue.
4. **Demo branch** in `ModuleDemo.vue` per module id, rendering the real
   component, plus `.ax-`/`.<prefix>-demo` styles in `src/style.css`.
5. **English** copy in `uiLibraryEn.ts` (same module ids).
6. **Catalog**: append the project and every module with an explicit
   `route: "/#/ui/<project>"` / `"/#/ui/<project>/<module>"`, then bump nothing
   else. Agents enumerate from here; anchors alone require rendering.
7. **Showcase view** at `#/<prefix>-kit`, listed in `HIDDEN_IDS` in `App.vue`
   so it stays routable but out of the shell nav.

## Phase 7 — Verify, then ship

```bash
npm run build                                   # must be clean
docker compose up -d --build                    # local build, no token needed
curl -s localhost:8080/ui-catalog.json | node -e "…"   # count projects/modules
```

DOM checks that catch real regressions:

- `location.hash` after load equals the intended route (no redirect to a module)
- `document.querySelectorAll('a[href^="#/ui/<project>/"]').length` matches the
  module count
- `document.querySelectorAll('.lib-group').length` equals the number of groups
- the new module ids resolve, and the old wording is gone

Then commit with the **measured facts in the message** (numbers, not adjectives)
and push.

## Pitfalls that already cost time

| Symptom | Cause | Fix |
| --- | --- | --- |
| Kit renders as grey slabs | backdrop is a smooth gradient | add grid/dot backdrop before judging blur |
| Page background stops mid-scroll | view root is a flex child stretched to viewport height | make the view its own scroller: `height:100%; overflow-y:auto` |
| `v-else has no adjacent v-if` | section moved away from its sibling | use `v-if="!state"` instead of `v-else` |
| Demo counters all show 3 | curated shortlist presented as inventory | verify against the tree, then vary 2–14 by content |
| `patch: entry "x" not found` | Cordis patch used as overlay | wrap in `insert:` |
| Cross-origin resources silently dropped | REA `allowed_origins` too narrow | pass every asset host explicitly |
| `EROFS` writing `~/.cache` | `$HOME` is read-only in the sandbox | write under the workspace (`.chrome-*`, `.analysis/`) |
| Chrome dies between calls | `/tmp` is a per-command tmpfs | managed background job + workspace profile dir |

## Acceptance checklist

- [ ] tokens trace back to measured numbers, and the doc says which
- [ ] no third-party CSS text, fonts, images, marks or copy in the repo
- [ ] prefix collision checked (`grep -c "\.<prefix>-" src/style.css` → 0)
- [ ] every module has verified files, EN copy and a demo branch
- [ ] catalog has project + module routes for agents
- [ ] reduced motion, focus rings, saveData path all work
- [ ] build clean, deploy healthy, DOM probes pass
- [ ] doc section numbering consistent, `.analysis/` untracked
