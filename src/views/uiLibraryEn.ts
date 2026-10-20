export interface EnModule {
  name: string
  group: string
  summary: string
  points: string[]
}

export interface EnProject {
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
    tagline: 'A Windows port of Rhine Music with synced lyrics, playlists and a queue.',
    description:
      'Maintained by Bong712, built on the RhineLabUI interface from RonaldDeng and LBEILC. It adds synchronized LRC lyrics, playlists and an editable queue on top of the 3D album shelf, and optimizes cover atlases and instanced rendering. This catalog shows its visual-only demo.',
    theme: 'Windows 0.6.0 · Morning Mist / Moon Shadow',
    demoLabel: 'Local visual demo',
    demoNote:
      'Uses only the three bundled covers, with no music library or audio; requires WebGL 2.',
    shots: [
      'Moon Shadow: the 3D album shelf (interface base from upstream V0.5.0, kept by the Windows port).',
      'Morning Mist: glass album cases and browsing position (upstream interface base).',
    ],
    modules: {
      shelf: {
        name: '3D album shelf',
        group: 'Scene',
        summary:
          'Albums are laid out in 3D columns with a moving camera, sorted by genre, artist or title, with an optional real-column mode.',
        points: [
          'Column centers sit 4.746 apart with 0.75 clearance; real-column mode shows each album once.',
          'Browsing moves only the current column and recenters smoothly; arrows disable at either end.',
          'Camera and layout are separate, so the arrangement or data source can be replaced.',
        ],
      },
      'cd-case': {
        name: 'Glass album case',
        group: 'Scene',
        summary:
          'A glass CD case with spine, cover texture, inner reflections and a reveal animation; cover geometry is shared by both themes.',
        points: [
          'The case is 3.996 × 3.35 with a ~0.269 spine; the glass body is ~11.25% wider than square.',
          'Covers are 2.98 × 2.98 and share the same geometry in day and night themes.',
          'Reveal and optics are isolated modules, so their timing can be replaced independently.',
        ],
      },
      overview: {
        name: 'Thumbnail overview & artist grid',
        group: 'Browse',
        summary:
          'Press V to pull the camera back; landscape uses projected plaques, portrait shows the full artist grid, and selecting returns to the shelf without playing.',
        points: [
          'Selecting in the overview never starts playback; Esc or V returns to the close view.',
          'Below a 1.05 aspect ratio the full artist grid is enabled automatically.',
          'Projected plaques locate a column first, then an arrow returns to the close view.',
        ],
      },
      settings: {
        name: 'Two-page settings',
        group: 'Panel',
        summary:
          'Library settings and display/audio are separate tabs; common options stay visible while advanced ones collapse, and tab state is preserved.',
        points: [
          'Switching tabs keeps entered values, import previews and each page’s scroll position.',
          'AI workflow, online metadata and advanced debugging are collapsed by default.',
          'The light theme uses an opaque warm base with themed sliders, hints and scrollbars.',
        ],
      },
      player: {
        name: 'Local playback & transitions',
        group: 'Playback',
        summary:
          'Reads local tags and covers, outputs through the browser or macOS CoreAudio, and animates track changes and the transport title.',
        points: [
          'Browser output and native CoreAudio can be switched; native output can pick a device.',
          'The browser path supports gapless playback; playback state is separate from the UI title.',
          'Clicking the now-playing title locates the track without changing playback.',
        ],
      },
      navigation: {
        name: 'Ruler & wheel navigation',
        group: 'Browse',
        summary:
          'The bottom ruler, wheel, arrow keys and touch share one navigation target; ticks and motion are separate modules.',
        points: [
          'Arrow keys, the ruler and the wheel all drive the same target.',
          'Within-column and cross-column moves use different easing.',
          'Ruler ticks are generated from separate CSS and logic, so themes can restyle them.',
          'The visual demo supports clicking ticks, dragging, the wheel and ← → / Home / End; the pointer, album name and counter stay in sync.',
        ],
      },
      theme: {
        name: 'Themes & opening',
        group: 'Motion',
        summary:
          'Morning Mist (light) and Moon Shadow (dark), with an opening slogan, brand reels and a reduced-motion setting.',
        points: [
          'The opening fades “ONE ALBUM AT A TIME” in and out, then reveals the 3D shelf; it can be skipped or replayed.',
          'Manual theme changes play a transition; reduced motion shortens or skips it.',
          'Theme preference is stored in the browser, independent of browsing position.',
        ],
      },
      search: {
        name: 'Library & search',
        group: 'Browse',
        summary:
          'Browse and search albums, tracks and genres; selecting a result moves to it and opens details without changing playback.',
        points: [
          'Search covers albums and tracks, with genre filtering.',
          'Locating uses eased motion and does not trigger playback.',
          'Per-column browsing positions are kept by default; toggling does not move the view.',
        ],
      },
      lyrics: {
        name: 'Synced lyrics',
        group: 'Playback',
        summary:
          'Reads an LRC file next to the audio, highlights the current line during playback, parses offsets and seeks on lyric click.',
        points: [
          'A same-name LRC file is detected automatically; audio is never copied or uploaded.',
          'The current line follows playback, and clicking a line seeks to it.',
          'Offset tags are parsed to handle timing differences between sources.',
        ],
      },
      queue: {
        name: 'Playlists & queue',
        group: 'Playback',
        summary:
          'Windows-only local playlists and an editable playback queue, with previous/next controls.',
        points: [
          'Playlists and the queue are stored locally; audio still plays from its original path.',
          'The queue can be reordered and supports previous/next.',
          'Queue editing is hidden in demo-cover mode to avoid accidental changes.',
        ],
      },
      performance: {
        name: 'Cover atlas & instancing',
        group: 'Performance',
        summary:
          'The Windows port packs covers into a 2D atlas with per-album UV regions and instanced shelf drawing to cut uploads and draw calls.',
        points: [
          'Updating a cover uploads only the changed tile, not the whole atlas.',
          'The shelf uses instanced drawing to reduce draw calls.',
          'Cold switches use a CanvasTexture path for selected and leaving covers, avoiding GPU readback.',
        ],
      },
      navhud: {
        name: 'Bottom navigation & status',
        group: 'Browse',
        summary:
          'The persistent bottom layer: album counter, up/down album stepper, left/right genre switch, key hints, collection status and rAF diagnostics.',
        points: [
          'The ALBUM / SELECT number rolls when switching albums; the total follows the current category.',
          'The center steps albums and ticks; the right side switches genres and fades the genre name.',
          'The bottom line shows LOCAL COLLECTION and demo state on the left, and rAF FPS, buffer size, theme and WebGL 2 acceleration on the right.',
          'Keys stay visible: ← → genre, ↑ ↓ album, ENTER open; the whole group fades in on boot.',
          'Switching albums shifts the background shelf and rolls the number; switching genres fades the name and tints the background.',
          'ENTER or “open album” scales the cover into a detail view; ESC or Back returns.',
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
}
