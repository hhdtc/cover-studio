export interface EnModule {
  name: string
  group: string
  summary: string
  points: string[]
}

export interface EnProject {
  /** Display name; only needed when the Chinese name is not English already. */
  name?: string
  /** Chip row under the description; only needed when the Chinese chips differ. */
  stack?: string[]
  tagline: string
  description: string
  theme: string
  demoLabel?: string
  demoNote?: string
  shots: string[]
  modules: Record<string, EnModule>
}

export const UI_EN: Record<string, EnProject> = {
  'rhine-music': {
    tagline: 'A 3D album shelf for a local music player: three columns, gapless switching and synced lyrics.',
    description:
      'An MIT-licensed browser music player demo whose interface base comes from LBEILC / RhineLabUI. It turns a local library into a rotatable three-dimensional shelf: real column layout, CD and case models with their own lighting, wheel-and-ruler navigation, gapless track switching, synced lyrics and light/dark themes. Beyond playback it covers PWA offline use, render-quality tiers and a staged boot sequence, split across roughly a hundred files under src/. This site also ships a pure-CSS visual recreation of the same layout, linked below.',
    theme: 'Morning Mist / Moon Shadow',
    demoLabel: 'Visual recreation (CSS 3D)',
    demoNote:
      'A pure-CSS rewrite of the three-column shelf and HUD: 3D glass cards, detail view, light/dark themes and an opening sequence, using five local mock covers and no WebGL.',
    shots: [
      'Moon Shadow: three-column album cards with a case preview.',
      'Immersive lyrics: timeline highlighting with per-line motion.',
      'Display settings: theme, quality and motion switches.',
    ],
    modules: {
      'rhine-overview': {
        name: 'Overview & artist grid',
        group: 'Display',
        summary:
          'The overview lays the library out as an artist grid and a projected view; clipped edge cards hint at more content, and both layouts share one data layer.',
        points: [
          'Artist grid and projected view share the data layer, so switching never refetches.',
          'Edge clipping is deliberate: a half-visible card tells you there is more.',
          'Grid density follows the viewport while card proportions stay fixed.',
        ],
      },
      'rhine-columns': {
        name: 'Three-column shelf',
        group: 'Layout',
        summary:
          'Real columns place albums in three lanes that scroll independently; the geometry lives in music-real-columns and music-array-layout, with responsive rules kept separate.',
        points: [
          'Column position is state, not pure CSS: leaving and returning restores the lane.',
          'Layout uses viewport ratios rather than hardcoded pixel widths.',
          'Narrow screens drop lanes but keep card proportions, so covers never stretch.',
        ],
      },
      'rhine-cd': {
        name: 'CD & case',
        group: '3D',
        summary:
          'Case and disc are separate models with their own lighting and anchors; hovering draws the disc out of the case, and lighting shifts warm to cool with the theme.',
        points: [
          'Case and disc are modelled separately so the drawer motion is its own timeline.',
          'Theme changes also shift lighting temperature, not just the background.',
          'A failed model load falls back to the cover image instead of an empty slot.',
        ],
      },
      'rhine-player': {
        name: 'Playback & gapless',
        group: 'Playback',
        summary:
          'The playback layer wraps Web Audio and local files; gapless switching preloads the next track in a second buffer, and volume/quality settings live in audio-settings.',
        points: [
          'The next track buffers while the current one plays, so switching leaves no gap.',
          'Unsupported browsers fall back to a normal switch without blocking playback.',
          'Files are read locally and never uploaded.',
        ],
      },
      'rhine-lyrics': {
        name: 'Synced lyrics',
        group: 'Lyrics',
        summary:
          'A same-name lyrics file is parsed and the current line highlighted on the timeline; immersive mode fills the screen, moving lines with text motion rather than per-character animation.',
        points: [
          'Timeline and rendering are separate, so seeking does not rebuild the whole list.',
          'Lines other than the current one drop in opacity, and the active line sits mid-screen rather than pinned to the top.',
          'Immersive type scales with the viewport while leading keeps its ratio.',
        ],
      },
      'rhine-navigation': {
        name: 'Wheel & ruler',
        group: 'Interaction',
        summary:
          'The wheel drives column switching with a ruler for position feedback; scrolling carries inertia but snaps to a column, and trackpad vs wheel use different strength curves.',
        points: [
          'Wheel and trackpad get separate coefficients so a trackpad flick cannot overshoot.',
          'The snap threshold is a ratio of column width, not a fixed pixel value.',
          'The ruler appears while scrolling and fades once motion settles.',
        ],
      },
      'rhine-transitions': {
        name: 'Track & view transitions',
        group: 'Motion',
        summary:
          'Opening an album is a view transition: the card grows from its list position into the detail view, with background and copy entering on separate layers; cover and title transition independently when tracks change.',
        points: [
          'The detail transition runs on three layers — cover, background, copy — at slightly different speeds.',
          'Reduced motion jumps to the end state instead of merely shortening the animation.',
          'Wheel navigation is disabled during the transition to avoid double movement.',
        ],
      },
      'rhine-theme': {
        name: 'Themes',
        group: 'Theme',
        summary:
          'Morning Mist and Moon Shadow: switching interpolates background, glass cards and lighting together, and the preference persists so the next launch starts in the right theme.',
        points: [
          'Switching interpolates colour and lighting rather than flashing a new stylesheet.',
          'Glass cards change blur and tint with the theme instead of sharing one alpha.',
          'The preference is applied before the first frame, avoiding a white flash.',
        ],
      },
      'rhine-boot': {
        name: 'Boot sequence',
        group: 'Boot',
        summary:
          'Boot is a choreographed sequence — logo tracks, camera push, shelf settling — with independent timings and callbacks, and it can be skipped.',
        points: [
          'Each segment has its own duration and callback, so it can be tuned alone.',
          'Any user interaction skips the remaining sequence immediately.',
          'Nothing interactive renders during boot, preventing stray clicks.',
        ],
      },
      'rhine-platform': {
        name: 'PWA, quality & settings',
        group: 'Platform',
        summary:
          'Offline caching, quality tiers and motion preference share one layer: PWA registration, render quality and the settings panel read the same state instead of each keeping a copy.',
        points: [
          'Quality tiers drive render parameters, not just a blur toggle.',
          'Motion preference affects both CSS transitions and 3D animation.',
          'The offline cache keeps the app and covers only, never audio.',
        ],
      },
    },
  },
  'apple-kit': {
    name: 'Apple · Type & motion',
    stack: ['Vue 3', 'TypeScript', 'Plain CSS', 'IntersectionObserver', 'rAF progress'],
    tagline:
      'Type ladder and motion pacing measured from three product pages, rebuilt as 8 Vue components.',
    description:
      'Two subjects only: how type is spaced, and how motion is paced. A passive reading of three public pages — DOM shape, declared CSS values, one computed-style census — yields a continuous size ladder (each step bound to its own tracking and leading) and a 240/320/400/500ms duration scale. Scroll effects run on IntersectionObserver plus rAF, writing progress into CSS variables so the animation stays declarative. SF Pro is not redistributed and every demo string is placeholder text.',
    theme: 'Ink #1d1d1f / surface #f5f5f7 / blue #0071e3',
    demoLabel: 'Type & motion showcase',
    demoNote:
      'Built from web analysis: size ladder, scroll drift, frosted sticky bar, colour band and parallax — with a one-click reduced-motion switch.',
    shots: [
      'Showcase hero: oversized headline, drifting stage and pill controls.',
      'Size ladder: each step labelled with px, tracking and leading.',
    ],
    modules: {
      'ap-type': {
        name: 'Size ladder',
        group: 'Type',
        summary:
          'A continuous ladder of 12 / 14 / 17 / 21 / 24 / 28 / 40 / 56 / 80px. Large steps tighten tracking (from -0.008em) while mid sizes open slightly (+0.011em); leading climbs from 1.06 to 1.47.',
        points: [
          'Size, tracking and leading are one triple: changing only the size destroys the rhythm.',
          'Body sits at 17px/1.47, controls at 14px, legal and captions at 12px.',
          'Display weight stays 600 (the most frequent observed value); nothing heavier.',
        ],
      },
      'ap-scroll': {
        name: 'Scroll-driven',
        group: 'Motion',
        summary:
          'The original ships no CSS scroll timelines (animation-timeline count is zero) and drives transforms from script. This kit also uses IntersectionObserver for visibility, rAF for merged reads, and writes progress into --apl-p.',
        points: [
          'Scroll listeners are passive and read layout once per frame; off-screen elements schedule nothing.',
          'Movement uses translate3d so it stays on the compositor, never top/left.',
          'Entrances are a 500ms ease-out with staggered delays rather than per-element keyframes.',
        ],
      },
      'ap-material': {
        name: 'Material & sticky',
        group: 'Material',
        summary:
          'A 44px sticky bar using saturate(180%) blur(20px) for frosted glass, inverting wholesale over dark sections. Product pages carry 12–20 sticky elements and 21–27 backdrop-filter layers.',
        points: [
          'Ship the -webkit- prefix as well, or Safari degrades the blur to a flat fill.',
          'Inversion changes only background alpha, text and border — three values over 320ms.',
          'The pill thumb is absolutely positioned and measured with ResizeObserver so label changes cannot desync it.',
        ],
      },
      'ap-color': {
        name: 'Colour & gradient',
        group: 'Visual',
        summary:
          'Section grounds cross-fade between two colours as they pass (1s linear, matching the measurement), and headlines use background-clip: text for a two-stop ramp. Neither needs an image.',
        points: [
          'Colour interpolation runs in oklab via color-mix, avoiding the grey midpoint of sRGB blending.',
          'Gradient text needs color: transparent plus both clip properties or the background shows through as a block.',
          'Body copy on dark grounds uses #f5f5f7 rather than pure white.',
        ],
      },
      'ap-limits': {
        name: 'Limits & substitution',
        group: 'Notes',
        summary:
          'SF Pro is proprietary, so no font files ship and the stack falls back to the system UI face. No stylesheet text, imagery, marks or product copy is reproduced.',
        points: [
          'The stack starts with -apple-system / BlinkMacSystemFont, so macOS resolves the native face.',
          'Prefix apl- and tokens --apl-* keep this kit isolated from the existing ef- / efk- sets.',
          'prefers-reduced-motion and .apl-no-motion both collapse durations to 1ms.',
        ],
      },
      'ap-glass': {
        name: 'Glass & focus ring',
        group: 'Material',
        summary:
          'Three measured glass steps: 20px blur at 0.8 alpha for the nav, 20px at 0.4 for the scrim, 7px at 0.7 for a floating pill — all on saturate(180%). The focus ring is a double ring: a 3px white gap plus a 5px accent ring.',
        points: [
          'Paint an opaque fill first, then gate backdrop-filter behind @supports so unsupported browsers do not end up with a see-through block.',
          'Alpha is computed with color-mix, so changing the tint does not mean editing a dozen rgba values.',
          'The focus ring uses two box-shadows, avoiding cross-browser outline differences while staying keyboard-reachable.',
        ],
      },
      'ap-story': {
        name: 'Sticky story & snap gallery',
        group: 'Narrative',
        summary:
          'The classic product-page structure: the visual column is position: sticky while the copy scrolls, and only the step inside the middle band lights up; galleries align one card at a time with scroll-snap-type: x mandatory.',
        points: [
          'The sticky top must subtract the global bar height or the visual column hides behind it.',
          'Step activation narrows to the viewport’s middle band with rootMargin (-42%), which is cheaper than computing scroll offsets.',
          'Scroll-snap needs no gesture library: scroll-snap-align is enough, and wheel and trackpad both settle naturally.',
        ],
      },
      'ap-layout': {
        name: 'Layout & rhythm',
        group: 'Layout',
        summary:
          'Three container widths — 734 / 833 / 1068px — with the main breakpoints at 734 and 1068 (717 and 565 occurrences in the stylesheet). Layout is mostly flex (185) rather than grid (27), and vertical padding is almost always asymmetric: 40/84, 76/76, 90/0.',
        points: [
          'Container widths are a three-step ladder, not a copy of the breakpoint numbers; past 1068 the margins take over.',
          'Asymmetric vertical spacing (40 above, 84 below) makes a block read as dropped into place rather than centred.',
          'Flex carries almost all arrangement; grid appears only where two-dimensional alignment is genuinely needed.',
        ],
      },
      'ap-media': {
        name: 'Media & pieces',
        group: 'Components',
        summary:
          'Product pages carry 311 images, 17 videos, 81 buttons, 434 links and 31 sticky elements. Card radii run 18 / 28 / 32px, pills sit at 980px and small controls at 5–10px; the home page alone uses 35 pills at 980px.',
        points: [
          'Media frames lock an aspect ratio, use a 28px radius, and hover only nudges to 1.01 — no shadow stacking.',
          'The price bar is a floating pill: price on the left, action on the right, 980px radius, frosted with one soft shadow.',
          'Dark pages never use pure white for body text (#f5f5f7 appears 402 times); secondary copy is #86868b.',
        ],
      },
      'ap-responsive': {
        name: 'Breakpoints & collapse',
        group: 'Responsive',
        summary:
          'The same page measured at 390 / 834 / 1600px: below 834 the nav collapses to a hamburger (visible links 14 → 3, bar height 44 → 48px), stacking blocks go 61 → 113, hidden elements 309 → 337, while sticky elements stay at 31 throughout.',
        points: [
          'Collapse happens in the navigation layer, not the content layer: content merely goes from two columns to one.',
          'Sticky count never changes with width (31), so pinning is structural rather than a desktop-only effect.',
          'Artwork swaps at the same two breakpoints: all 549 <source> elements use only max-width:734px, max-width:1068px and min-width:0.',
        ],
      },
      'ap-loading': {
        name: 'Media loading',
        group: 'Performance',
        summary:
          'All 17 videos ship preload="none" and playsinline, with no poster and no autoplay attribute; only 2 carry a src in the initial HTML and the rest are injected by a data-inline-media plugin. Of 156 images, zero use loading="lazy" — native lazy loading is unused.',
        points: [
          'Videos declare playback timing, exit reset and timeout through data-inline-media-* attributes; loading and play are script-scheduled.',
          'Images rely on <picture> with 549 <source> srcset entries for resolution switching and a JS onload for reveal, not loading="lazy".',
          'This kit’s ApLazyMedia requests through IntersectionObserver and falls back to a manual button when saveData is set.',
        ],
      },
    },
  },
  'endfield-kit': {
    name: 'Endfield Kit · from web analysis',
    stack: ['Vue 3', 'TypeScript', 'Plain CSS', 'clip-path geometry', 'CSS aberration'],
    tagline:
      'The official Endfield site’s type ladder, notched geometry and chromatic type, rebuilt as 10 Vue components.',
    description:
      'A passive structural observation of the marketing site — DOM shape, declared CSS values, one computed-style census — re-expressed as components. Structure and rhythm only: no commercial fonts, artwork or copy are reproduced, and the efk- prefix keeps it clear of the existing Endfield demo in this repo. The result is 10 framework-agnostic Vue components plus a --efk-* token set.',
    theme: 'Ink #191919 / paper / signal yellow #fffa00',
    demoLabel: 'Full style guide',
    demoNote:
      'Built from web analysis: tokens, type ladder, all 12 components, motion and provenance — with a one-click reduced-motion switch.',
    shots: [
      'Guide hero: signal-yellow band, chromatic title, rolling ticker and readout tags.',
      'Components: notched buttons, wedge tabs, stat rows, chromatic headline, tags and icon rail.',
    ],
    modules: {
      'ek-typography': {
        name: 'Type & scale',
        group: 'Foundations',
        summary:
          'The original encodes weight in the family name (e.g. Novecentosanswide-DemiBold) and organises layout on a 10 → 60px ladder; line-height is almost always 1, and display tracking tightens to -0.05em.',
        points: [
          'Tokens --efk-t-10 … --efk-t-30 match the measured 10 / 11.25 / 12.5 / 13.75 / 15.6 / 17.5 / 18.75 / 25 / 30px steps.',
          'Display type tightens while technical labels open up to 0.14em uppercase — two trackings for two information layers.',
          'Commercial faces are not redistributed; the kit ships a substitutable stack, so licence your own or switch to an OFL face.',
        ],
      },
      'ek-geometry': {
        name: 'Cut corners & shape',
        group: 'Shape',
        summary:
          'Cut corners are the site’s core grammar: double-notched buttons, 55° wedge tabs, corner ticks on panels, and a trapezoid title band — one shape vocabulary reused across controls.',
        points: [
          'Button notches come from --efk-btn-notch with three size steps; an inner pseudo-element keeps the edge crisp.',
          'Hover is a skewed light bar sweeping across, not a scale or shadow — consistent with a restrained industrial HUD.',
          'Panel corner ticks are drawn with ::before/::after, adding no extra DOM.',
        ],
      },
      'ek-hud': {
        name: 'Readouts & navigation',
        group: 'Information',
        summary:
          'Instrument readouts (label / value / unit / tick bar), a rolling ticker, status tags and a left icon rail form the page’s instrument layer.',
        points: [
          'Values use tabular figures so decimals line up; the tick bar only hints at proportion.',
          'The ticker duplicates its content so a 50% translate loops seamlessly, and pauses on hover.',
          'The rail inverts the active item and adds a yellow left tick — the same selection grammar as tabs.',
        ],
      },
      'ek-effects': {
        name: 'Aberration & texture',
        group: 'Visual effects',
        summary:
          'The original uses an inline SVG filter url(#red-green) with grayscale + contrast(200) to offset channels; this kit does it in pure CSS with two screen-blended copies.',
        points: [
          'Aberration only runs on hover or when live, so no full-page filter taxes low-end devices.',
          'Scanlines are a repeating-linear-gradient overlay and the hatch is a 45° stripe — no image assets.',
          'Channel colours --efk-channel-r / --efk-channel-g are separate tokens, so the effect can go cool or monochrome.',
        ],
      },
      'ek-motion': {
        name: 'Motion rhythm',
        group: 'Motion',
        summary:
          'Entrances are a four-decay strobe (1s ease-out forwards), the ticker holds at 80% before wrapping, the scroll hint breathes at 1.6s, and ordinary transitions stay within 0.2–0.3s.',
        points: [
          'prefers-reduced-motion collapses every duration to 1ms, and .efk-no-motion is a manual kill switch in the showcase.',
          'Motion carries state (entrance, loop, hint) rather than decorating with movement.',
          'Durations and easing come from observation: 1s / 6s / 1.6s with cubic-bezier(1,0,.7,1).',
        ],
      },
    },
  },
  'endfield-ui': {
    tagline:
      'A design-language guide for Arknights: Endfield and a React component library built from it.',
    description:
      'Industrial editorial style: paper-white or smoke-black grounds, ink typography, one signal yellow, and restrained print and survey marks. The repo includes the design guide, Tailwind v4 tokens, React components, a Storybook preview and a docs site; the main entry ships no official assets.',
    theme: 'Light / dark / inverse blocks',
    demoLabel: 'Online Storybook',
    demoNote:
      'Online component preview: controls, motifs and example pages with light/dark themes; no install needed.',
    shots: [
      'Example “Depot”, dark: ghost display type, wedge tabs, item slots and tick-ring detail panel.',
      'Example “Settings”, light: form fields, steps and validation feedback.',
    ],
    modules: {
      'ef-foundations': {
        name: 'Foundations & theming',
        group: 'Foundations',
        summary:
          'Paper/smoke, ink and signal yellow; light and dark themes, inverse blocks and a replaceable accent, all expressed as Tailwind v4 @theme tokens.',
        points: [
          'Light is the default; data-theme="dark" on <html> or any container switches the theme, and inverse blocks flip it locally.',
          'The signal yellow can be replaced globally, including components and focus rings.',
          'The guide fixes the paper/ink/yellow ratio: colour is a signal, not a surface.',
        ],
      },
      'ef-controls': {
        name: 'Core controls',
        group: 'Controls',
        summary:
          'Button, ButtonGroup, Tag, Panel, Toolbar, Kbd, SectionTitle, BracketTitle and Tabs.',
        points: [
          'Cut corners, wedges and corner brackets are shape grammar, reused with the same meaning across controls.',
          'Buttons have solid, outline and text levels; focus rings stay readable in both themes.',
          'Tags use English for structure and Chinese for reading, with fixed case and tracking.',
        ],
      },
      'ef-forms': {
        name: 'Form controls',
        group: 'Forms',
        summary:
          'Input, Select, Combobox, OtpInput, Checkbox, SegmentedControl, Slider and FileUpload, with validation and error states.',
        points: [
          'The focus line wipes in from the left; errors are signalled by more than colour.',
          'Combobox, slider and OTP behaviour builds on Base UI for keyboard and screen-reader support.',
          'Controls adapt to light, dark and inverse block contexts.',
        ],
      },
      'ef-feedback': {
        name: 'Feedback & overlays',
        group: 'Feedback',
        summary:
          'Alert, Toast, Progress, Spinner, Skeleton, Dialog, Drawer, Tooltip and Popover.',
        points: [
          'Overlays enter from the side that triggered them and finish in 0.2–0.3s with no bounce.',
          'Status uses icon, copy and shape together, not colour alone.',
          'With reduced motion enabled, transitions jump straight to the end state.',
        ],
      },
      'ef-display': {
        name: 'Display & navigation',
        group: 'Display',
        summary:
          'ItemSlot / ItemGrid, Table, Stat, SideRail, PageHeader, Breadcrumb, Steps and Timeline.',
        points: [
          'Item slots encode rarity, stock and badges and remain legible in dark mode.',
          'Tables support expandable rows, sorting, selection and inline actions; narrow screens turn the rail into a top bar.',
          'Navigation controls accept a render prop for router links.',
        ],
      },
      'ef-motifs': {
        name: 'Motifs & motion',
        group: 'Motifs',
        summary:
          'CornerBrackets, Viewfinder, GhostText, Hatch, TickRing and HazardStripe, plus the short, bounce-free motion rules.',
        points: [
          'Cut corners, wedges, brackets, ghost type and hatching are both components and Tailwind utilities.',
          'Texture has a budget: hatching and survey ticks only appear where emphasis is needed.',
          'Motion is short and hard: state changes finish in 0.2–0.3s with no bounce; reduced motion jumps to the end.',
          'The visual demo plays once on entry: ghost type wipes in, brackets unfold, the tick ring rotates in and hatching sweeps; press “Replay” to run it again.',
        ],
      },
    },
  },
  'nerv-ui': {
    tagline:
      'A reusable stylesheet and HTML component set built around a military research console aesthetic.',
    description:
      'MIT-licensed, zero-dependency stylesheet plus self-contained HTML components: 808 lines of CSS holding every colour, font, CRT effect and component class. The default state is pure black — the screen stays off until data demands it. Components cover an event log, vault cards, a three-source oracle, a metrics grid, data tables and an emergency mode; the full demo adds a Three.js topology view. The repo is packaged as an AI agent skill, with SKILL.md as the complete spec. Upstream files are served unmodified under /nerv-ui/ so the reference implementation can be inspected directly.',
    theme: 'Pure black void + phosphor orange / data green / alert red',
    demoLabel: 'Full demo',
    demoNote:
      'Upstream demo.html served as-is: topology, event log, vault cards, MAGI consensus, metrics and emergency mode. Fonts come from Google Fonts, so it needs network access.',
    shots: [
      'Full console: topology, metrics grid, event log and three-source consensus on one screen.',
      'MAGI consensus: three columns voting, with agreement and divergence marked by colour and text.',
      'Event log: typed colours, monospaced timestamps, aligned right-hand column.',
    ],
    modules: {
      'nrv-foundations': {
        name: 'Colour & type',
        group: 'Foundations',
        summary:
          'Each phosphor colour has exactly one job: orange #FF9830 for structure, green #50FF50 for data, cyan #20F0FF for wiring, red #FF3030 only for alerts; the ground is #000 plus three very dark panel levels. Type pairs a Mincho display face with monospaced body copy and a condensed stamp face.',
        points: [
          'Reusing a colour outside its role breaks legibility immediately.',
          'Nearly all copy is monospaced, and numbers use tabular figures, so it reads like an instrument rather than an article.',
          '“The screen is off until data demands it”: no skeleton placeholders, just black.',
        ],
      },
      'nrv-crt': {
        name: 'CRT effects',
        group: 'Effects',
        summary:
          'Scanlines, vignette, flicker and glow are pure CSS gradients and animations with no images; crt-effects.css drops into any page on its own.',
        points: [
          'Scanlines are a repeating-linear-gradient overlay that never intercepts pointer events.',
          'Glow stacks multiple text-shadow / box-shadow layers instead of using filters.',
          'Flicker and sweep durations stay short so they never fight the reading.',
        ],
      },
      'nrv-console': {
        name: 'Console layout & metrics',
        group: 'Layout',
        summary:
          'A three-column dashboard: topology on the left, metrics and vault cards in the middle, event log on the right. The metrics grid compresses value, unit and note into one row, separating levels by colour and size.',
        points: [
          'Columns use ratios rather than fixed pixels and stack in order on narrow screens.',
          'Metric values are large monospaced figures; units drop one size and lose saturation so they never compete.',
          'Panel borders are 1px with a faint inner glow — boundaries come from brightness, not shadow.',
        ],
      },
      'nrv-data': {
        name: 'Event log & tables',
        group: 'Data',
        summary:
          'The event log is a typed, scrolling feed with monospaced timestamps and right-aligned amounts; the data table puts strategy and transmuter performance side by side with a constant row height and no zebra striping.',
        points: [
          'Event types are encoded twice, colour and word, so the feed never relies on colour alone.',
          'Numeric columns are right-aligned and monospaced for vertical scanning.',
          'Tables drop vertical rules and rely on row height and spacing instead.',
        ],
      },
      'nrv-magi': {
        name: 'MAGI & vault cards',
        group: 'Components',
        summary:
          'The consensus panel puts three sources side by side and turns the row green on agreement; vault cards are compact unit + status lamp + key ratios, with state expressed by colour and text together.',
        points: [
          'The three-source vote labels agreement in small inline text rather than expecting the reader to infer it from colour.',
          'Status lamps are small glowing dots that animate only when the state changes.',
          'Monospaced blocks inside cards line the right-hand values up on one baseline.',
        ],
      },
      'nrv-emergency': {
        name: 'Emergency mode',
        group: 'State',
        summary:
          'The whole page flips into an alert state: hazard stripes, a hexagonal banner, a red overlay and heavier scanlines. Leaving the state restores everything with no residue.',
        points: [
          'Emergency is a page-level state, not a component variant.',
          'Stripes are a fixed-angle repeating-linear-gradient with no SVG needed.',
          'Exiting removes the root class, so every side effect disappears with its selector.',
        ],
      },
    },
  },
  'nasa-punk': {
    tagline:
      'A NASA golden-age retro-futurist design system packaged as a UI skill for AI coding agents.',
    description:
      'A design-system skill that AI coding agents can invoke directly: paper-white by default, switching to dark instrument surfaces for terminals, logs and dashboards, with print-document, console and era-grade languages. The reference implementation is a single zero-dependency HTML file, grounded in the 1976 NASA graphics manual and NTRS technical-report plates.',
    theme: 'PRINT / CONSOLE / era grades',
    demoLabel: 'Reference implementation',
    demoNote:
      'The repo’s single-file, zero-dependency reference, hosted locally: print document, console and chart layouts.',
    shots: [
      'Print-document cover: paper white, signal red, agency masthead and document props.',
      'Console instruments: deep-space ground, scan visor, star map and status chips.',
    ],
    modules: {
      'nasa-foundations': {
        name: 'Base skin & type',
        group: 'Foundations',
        summary:
          'Signal red #E4002B, navy #0B3D91 and worn baked white; Helvetica headings with mono stencil labels, ragged-right alignment, no pastels or neon.',
        points: [
          'Colour is a signal: paper, ink and worn white dominate; red and blue mark emphasis and agency identity.',
          'Helvetica for headings and monospace for spec labels; copy is left-aligned with a naturally ragged right edge.',
          'Every decision passes two tests: at home in a 1979 government exhibit, and shippable by a modern brand team.',
        ],
      },
      'nasa-print': {
        name: 'Print document layer',
        group: 'PRINT',
        summary:
          'The default surface: paper and ink figures, with at least two Band-15 document props — masthead, memo metadata, exhibit band, wayfinding or barcode.',
        points: [
          'The page ground stays light by default; reading surfaces never get dark instrument panels.',
          'Document props deploy by genre: magazine cover, agency memo, reading page, museum band, GPO colophon.',
          'Report figures follow the technical-plate grammar, with axes off by default so the figure reads first.',
        ],
      },
      'nasa-console': {
        name: 'Console instruments',
        group: 'CONSOLE',
        summary:
          'Dark #0A1420 instrument surfaces for terminals, log walls, dashboards and status clusters, with scan visor, star map, status chips, brushed metal and a heritage serif layer.',
        points: [
          'Dark surfaces attach only to instrument-shaped content; a full-console page must be requested explicitly.',
          'Status chips come in threes with three rarity colours; the scan visor and star map are signature components.',
          'Brushed-metal bevels, corner screws and cool/warm light build hardware realism without cyberpunk neon.',
        ],
      },
      'nasa-charts': {
        name: 'Chart & instrument grammar',
        group: 'Charts',
        summary:
          'Four-step technical-plate fills, baseline bars, analog dials with range arcs, tri-state flags (grey, hatched, red) and split-flap boards.',
        points: [
          'Fill ladder: outline → solid → 45° hatch → cross-hatch, one grammar for data hierarchy.',
          'Bars grow from the baseline with axes off by default; scales live in captions or dial arcs.',
          'Status never relies on colour alone: grey, hatched and red stay distinguishable in grayscale print.',
        ],
      },
      'nasa-motion': {
        name: 'Motion rhythm & quality gates',
        group: 'Motion',
        summary:
          'Attention states breathe (2.5s, opacity .55↔1); entrances run 150–250ms ease-out; one CRT/flicker exception per page.',
        points: [
          'Flicker is a hard failure: persistent attention uses breathing, never high-frequency blinking.',
          'Entrances are short and ease-out; title line-height and collisions are checked by an auditor.',
          'Zero unexpected overlap, collision audits and mandatory visual verification form the release gate.',
        ],
      },
      'nasa-emblem': {
        name: 'Era grades & insignia',
        group: 'Motifs',
        summary:
          '.era-mercury / .era-gemini / .era-apollo era grades, the four-zone emblem formula, Constellation four-colour stripes and fictional agency identity.',
        points: [
          'Era grades are token-level tweaks: Mercury cool blue-grey, Gemini neutral steel, Apollo warm brown.',
          'Emblems compose from four zones; fictional agency and mission marks are allowed, the NASA insignia are not.',
          'NASA insignia and logotypes are U.S. Government marks; this repo contains only fictional, inspired-by branding.',
        ],
      },
    },
  },
  aureole: {
    tagline:
      'An interactive template extracted from the first 60 seconds of the Arknights sixth-anniversary PV: future, machinery and sanctity.',
    description:
      'Turns the black field, silver structures, cobalt blueprints and pale deconstruction of the PV into an interactive web template. Subjects are split into transparent image planes floating in CSS 3D; numbered leads track each part, with physical observation, structural blueprint and deconstruction modes, plus search, archive, config export and reduced motion.',
    theme: 'Observation / Blueprint / Deconstruction',
    demoLabel: 'Local interactive demo',
    demoNote:
      'The full template runs locally on 5176: switch the three observation modes, search specimens, click numbers to read parts and export the config.',
    shots: [
      'Physical observation: silver image planes in a black field, numbered leads and part archive.',
      'Structural blueprint: cobalt dot matrix, contours, axes and calibration circles.',
    ],
    modules: {
      'aureole-observation': {
        name: 'Physical observation',
        group: 'Mode',
        summary:
          'Silver image planes drift in a black field; numbered leads follow their structures, and clicking a number or phrase opens the part archive.',
        points: [
          'The subject is split into transparent planes floating at different depths and phases; numbers and leads are separate web layers.',
          'Labels and phrases settle when hovered or keyboard-focused, so they are easy to click and read.',
          'Click a number to locate a part, or a phrase to open the full archive; Escape dismisses it.',
        ],
      },
      'aureole-blueprint': {
        name: 'Structural blueprint',
        group: 'Mode',
        summary:
          'Derives contours for each transparent layer and overlays cobalt dots, axes, calibration circles and a selected section.',
        points: [
          'Contours come from foreground connected regions; structural points are located on their layer and projected to screen.',
          'Cobalt dots, axes and calibration circles are separate layers and do not alter the subject material.',
          'The selected section emphasises the current part; switching modes keeps the same specimen.',
        ],
      },
      'aureole-deconstruct': {
        name: 'Deconstruction',
        group: 'Mode',
        summary:
          'A pale inverse layer, continuously offset diagonal slices, floating serif fragments and radial leads form the third observation mode.',
        points: [
          'The pale inverse layer and slices make the same subject read as “taken apart”.',
          'Serif fragments and radial leads drift independently but share the subject’s time base.',
          'All three modes share specimens, numbering and archive data; only the presentation layer changes.',
        ],
      },
      'aureole-float': {
        name: 'Floating scene & projection',
        group: 'Motion',
        summary:
          'An 18-second base cycle of poses, CSS 3D transforms, pointer parallax and screen projection; reduced motion freezes every layer.',
        points: [
          'Layers, phrases and fragments use different depths and phases but one continuous time base.',
          'The pointer adds a small viewpoint shift; leads update as the subject projection moves.',
          'With system or manual reduced motion, layers stay still while search and reading remain available.',
        ],
      },
      'aureole-annotate': {
        name: 'Labels, search & archive',
        group: 'Interaction',
        summary:
          'Search specimen names, numbers and English identifiers, adjust label density and open part archives; keys 1/2/3, arrows, / and Escape.',
        points: [
          '1 / 2 / 3 switch modes, left/right switch specimens, / focuses search, Escape closes overlays.',
          'Label density is adjustable; turning labels off still leaves the subject and archive readable.',
          'Specimen names, numbers and English identifiers are all searchable.',
        ],
      },
      'aureole-settings': {
        name: 'Config & accessibility',
        group: 'System',
        summary:
          'Export the current UI config or specimen JSON; toggle labels, subtle parallax and reduced motion; keep subject and controls visible on mobile.',
        points: [
          'Exports include specimen ID, mode and UI settings; specimen records are still fictional template data.',
          'Reads and listens to the system reduced-motion preference, with a manual override in settings.',
          'Mobile keeps the subject and controls visible; desktop uses the full observation field.',
        ],
      },
    },
  },
  'p5-ui': {
    tagline: 'A toy Persona 5-style component library for Vue 3.',
    description:
      'A Vue 3 component library built on red, black and white, diagonal cuts and paper-cut collage: buttons, titles, text, slider, switch, message, notification, back-to-top, divider, upload, table and a crowd animation. The repository has no license, so this catalog links to it and runs it locally for evaluation only; no code, images or build output are copied here. The visual demos are original CSS recreations.',
    theme: 'Red / black / white · diagonal collage',
    demoLabel: 'Local docs (evaluation only)',
    demoNote:
      'The repository’s prebuilt docs site runs locally for evaluation only; no redistribution license is granted, so it is not published with this site.',
    shots: ['Original cover artwork: red/black diagonal P5-style typography, no project assets used.'],
    modules: {
      'p5-foundations': {
        name: 'Global styles & icons',
        group: 'Foundation',
        summary:
          'Red, black and paper white, diagonal cuts and paper-cut collage, shared fonts and P5 icons; all components share one Sass token set and outline language.',
        points: [
          'Red #e60012, black and paper white form the palette; diagonal cuts, jagged edges and outlines carry the shape language.',
          'Icons are SVG paths; buttons and titles share the same skew and shadow rules.',
          'Global styles ship separately, so on-demand component imports can still share one skin.',
        ],
      },
      'p5-actions': {
        name: 'Buttons, titles & text',
        group: 'Components',
        summary:
          'P5Button, P5Title and P5Text: skewed buttons, titles with red slices, and outlined display text.',
        points: [
          'Buttons come in solid red and black/white outline variants, with hover offset and short press feedback.',
          'Titles use red diagonal blocks and offset typesetting for a print-collage feel.',
          'Text exposes outline, shadow and skew variants for display copy.',
        ],
      },
      'p5-controls': {
        name: 'Slider & switch',
        group: 'Forms',
        summary:
          'P5Slider and P5Switch: heavy outlined tracks, red fill and offset thumbs.',
        points: [
          'The slider uses a thick outline and red progress segment; dragging updates the value live.',
          'The switch shows state with a black/white track and a red thumb, with a short transition.',
          'Both expose v-model for direct use in forms.',
        ],
      },
      'p5-feedback': {
        name: 'Message, notification & back-to-top',
        group: 'Feedback',
        summary:
          'P5Message, P5Notification and P5BackTop: diagonal message bars, character-silhouette notifications and a back-to-top button.',
        points: [
          'Messages enter from the edge as diagonal bars and dismiss automatically; notifications can carry a silhouette and title.',
          'Back-to-top appears after scrolling and returns to the top.',
          'All three keep the same hard shadows and red/black/white tone.',
        ],
      },
      'p5-layout': {
        name: 'Divider, upload & table',
        group: 'Layout',
        summary:
          'P5Divider, P5Upload and P5Table: jagged dividers, drag-and-drop upload and a diagonal table header.',
        points: [
          'Dividers use jagged/diagonal cuts instead of plain lines to reinforce the collage feel.',
          'The upload area supports click and drag, then shows the selected file and preview.',
          'Tables use a diagonal header and outlined rows for archive-style lists.',
        ],
      },
      'p5-motion': {
        name: 'Crowd motion & zoom',
        group: 'Motion',
        summary:
          'Canvas crowd silhouettes move continuously, paired with zoom and diagonal transitions for page-level momentum.',
        points: [
          'Crowd silhouettes move continuously in Canvas; density and speed are configurable.',
          'Zoom/diagonal transitions handle image previews and page changes with a short rhythm.',
          'The motion relies on red/black silhouettes rather than external image assets.',
        ],
      },
    },
  },
  persona3: {
    tagline:
      'A Persona 3-inspired portfolio template with diagonal type, a custom cursor, glass clock and circular transitions.',
    description:
      'A Next.js + TypeScript + Tailwind + Framer Motion portfolio template: bold diagonal typography, floating chapter navigation, ink cursor, glass-clock transitions and a photo viewer, plus an interactive Three.js space configurator. The repository includes only original placeholders and generic copy, no official game assets; demo content is fictional.',
    theme: 'Deep blue / cyan / diagonal type',
    demoLabel: 'Local Next.js demo',
    demoNote:
      'The full template runs locally on 5179: home, creative categories, project pages, 3D configurator and profile.',
    shots: [
      'Home: diagonal typography, chapter navigation and glass clock.',
      'Creative categories: menu, media cards and photo viewer.',
    ],
    modules: {
      'p3-home': {
        name: 'Diagonal home & typography',
        group: 'Home',
        summary:
          'Bold Anton headings, diagonal colour blocks and layered parallax; the home page connects hero, manifesto, chapter previews and work entries.',
        points: [
          'Anton for display, IBM Plex Mono for body and labels; tracking and leading serve the diagonal composition.',
          'A light scroll parallax shifts titles and blocks without heavy 3D.',
          'Chapter previews and home entries are data-driven; edit site.ts / sections.ts to replace content.',
        ],
      },
      'p3-motion': {
        name: 'Ink cursor & glass transition',
        group: 'Motion',
        summary:
          'A custom ink cursor, press feedback, circular mask and glass-clock page transition that feels like a jump in time.',
        points: [
          'The ink cursor follows the pointer and expands over interactive elements; touch and reduced motion fall back gracefully.',
          'Page changes use a circular mask plus glass clock and lock scrolling during the transition.',
          'Press feedback is a short scale/offset response, with no sound or vibration dependency.',
        ],
      },
      'p3-chapters': {
        name: 'Chapter navigation',
        group: 'Navigation',
        summary:
          'A floating edge chapter nav with magnetic hover and a current-chapter indicator, synced to routes and scroll position.',
        points: [
          'Chapter labels follow the page module, with the current item marked by a block and number.',
          'Hover adds a magnetic offset; clicking opens that chapter or route.',
          'Narrow screens collapse it into a simpler top/bottom navigation.',
        ],
      },
      'p3-creative': {
        name: 'Creative categories & photo viewer',
        group: 'Content',
        summary:
          'Four creative routes, a category menu, media cards and a paged photo viewer; local video and optional Mux playback.',
        points: [
          'The category menu handles routing and filtering; the gallery renders media cards per category.',
          'The photo viewer supports previous/next and restores the scroll position from before opening.',
          'Video defaults to local placeholders or optional Mux; no playback IDs or private videos ship with the repo.',
        ],
      },
      'p3-projects': {
        name: 'Project index & 3D configurator',
        group: 'Projects',
        summary:
          'Project index, case-study pages and a Three.js space configurator; 3D code loads on demand.',
        points: [
          'Project cards open case studies; the case content is a replaceable sample, not a real commercial project.',
          'The 3D configurator switches spaces, materials and demo parameters with demonstration estimates.',
          'Three.js and the Mux player load dynamically, keeping the first screen light.',
        ],
      },
      'p3-profile': {
        name: 'Profile page',
        group: 'Profile',
        summary:
          'Placeholder education, experience, projects, skills and recognition; email and CV links stay hidden until configured.',
        points: [
          'Name, title, location and SEO metadata live in site.ts; biography and experience in profile.ts.',
          'Email and CV are empty by default and are not rendered, avoiding template data leaks.',
          'A privacy check blocks real contact details or private media from entering the template.',
        ],
      },
    },
  },
  'shadcn-ui': {
    tagline: 'Composable, accessible React components you can own and edit.',
    description:
      'Not a classic dependency package, but component source distributed through a registry: React + Tailwind CSS, with Radix / Base UI behaviour by default, plus tokens for colour, radius, spacing and keyboard interaction. Components, examples, blocks and themes can be added on demand and edited directly.',
    theme: 'Neutral / radius / light-dark',
    demoLabel: 'Online documentation',
    demoNote:
      'Official docs: component examples, themes, blocks and install commands, viewable in the browser.',
    shots: ['shadcn/ui: composable components and the default theme.'],
    modules: {
      'shadcn-foundations': {
        name: 'Foundations & theming',
        group: 'Foundations',
        summary:
          'CSS variables, Tailwind tokens, radius and light/dark themes; multiple styles (Vega / Nova / Maia and more) share one component structure.',
        points: [
          'Colour, radius and spacing live in CSS variables; components only reference tokens.',
          'Light/dark switches at the root class without editing component code.',
          'Different styles share component structure and only swap tokens and a few styles.',
        ],
      },
      'shadcn-core': {
        name: 'Core components',
        group: 'Components',
        summary:
          'Button, Badge, Card, Input, Label, Separator, Skeleton and Avatar for everyday UI.',
        points: [
          'Components use cva for variants and sizes, keeping defaults separate from product styles.',
          'Every interactive element has focus-visible and disabled states.',
          'Source is copied into the project, so structure can be changed rather than overridden.',
        ],
      },
      'shadcn-overlays': {
        name: 'Overlays & menus',
        group: 'Overlays',
        summary:
          'Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu and Command; focus and keyboard behaviour come from the primitive layer.',
        points: [
          'Overlays include a backdrop, focus trap, Escape to close and focus return by default.',
          'Motion is short and driven by data-state for enter and exit.',
          'Command supports search, grouping and arrow-key selection.',
        ],
      },
      'shadcn-forms': {
        name: 'Form controls',
        group: 'Forms',
        summary:
          'Field, Input, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Slider, Calendar and form validation examples.',
        points: [
          'Field unifies label, description and error messaging, with errors not relying on colour alone.',
          'Complex controls get keyboard and screen-reader support from the primitive layer.',
          'Examples cover React Hook Form, TanStack Form and Server Actions.',
        ],
      },
      'shadcn-data': {
        name: 'Data display',
        group: 'Display',
        summary:
          'Table, Chart, Carousel, Sidebar, Tabs, Accordion, Pagination and sortable/expandable data-table examples.',
        points: [
          'Table provides structure and styling; sorting, filtering and pagination are composed in the TanStack Table example.',
          'Chart wraps Recharts containers, tooltips and legend tokens.',
          'Sidebar supports collapse, a mobile drawer and keyboard operation.',
        ],
      },
      'shadcn-registry': {
        name: 'Registry & blocks',
        group: 'Engineering',
        summary:
          'Add components, examples and blocks through the registry; `npx shadcn add` writes source into your project instead of installing a black-box dependency.',
        points: [
          'The registry describes each component’s files, dependencies and target paths.',
          'The CLI supports components, examples, blocks and themes, with Radix / Base UI / React Aria bases.',
          'Once source lands in the project, you own edits and upgrade timing.',
        ],
      },
    },
  },
}
