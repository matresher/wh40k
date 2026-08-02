# Adeptus Astartes Legions Encyclopedia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully offline, dependency-free HTML page (`index.html` at repo root) that catalogs the 18 First Founding Space Marine Legions/Chapters with full lore, original SVG art, and an interactive schematic galaxy map of their systems and events.

**Architecture:** Static site — one `index.html` shell, `style.css`, two plain-JS data files (`data.js` for legions, `map-data.js` for locations) loaded as classic `<script>` tags (top-level `const` becomes shared global scope across files), and `app.js` for all rendering/interaction. 36 SVG art files are produced once by a Node build-time generator script (`tools/svg-assets.js`) and committed as static files — never generated at runtime in the browser. A Node dev-time validator (`tools/validate.js`) checks data-file structural integrity after every content task; it is never loaded by the page.

**Tech Stack:** Vanilla HTML/CSS/JS in the browser. Node.js only as a local dev tool (asset generation + validation) — zero npm packages, zero CDN links, zero build step for the shipped page.

## Global Constraints

- Page must open via double-click on `index.html` (file:// protocol) and work with **zero internet access** and **zero external libraries/CDNs/fonts**.
- `index.html` lives at the **repository root** (not a subfolder) so GitHub Pages can serve it directly from `main`.
- No copied Games Workshop artwork/logos — all visuals are original SVGs authored for this project.
- All SVG asset files must be **fully self-contained** (no cross-file `<use>`/`<image>` references) to avoid `file://` CORS restrictions in some browsers.
- Content (lore text) must be original phrasing from general canon knowledge — never copied verbatim from wikis/encyclopedias.
- `git push` to `https://github.com/matresher/wh40k` and enabling GitHub Pages happen **only** after a separate explicit user confirmation at the end — no task in this plan pushes.

---

## File Structure

```
wh40k/
  index.html              # page shell, containers, script/style includes
  style.css                # full dark 40k theme, layout, cards, map, popup
  data.js                  # global LEGIONS array (18 entries)
  map-data.js              # global LOCATIONS array (~60 entries)
  app.js                   # all rendering + interaction logic
  assets/
    marines/<slug>.svg     # 18 files, generated
    emblems/<slug>.svg     # 18 files, generated
  tools/
    svg-assets.js           # Node generator: LEGION_VISUALS map -> writes the 36 SVGs above
    validate.js              # Node dev-time structural validator for data.js/map-data.js
  docs/superpowers/
    specs/2026-08-02-adeptus-astartes-legions-design.md   # already written
    plans/2026-08-02-adeptus-astartes-legions.md            # this file
```

## Locked Reference Data

### Legion table (slugs, status and homeworld location IDs are load-bearing — every task must use these exact strings)

| # | slug | nameRu | status | primarch | homeworldLocationId |
|---|------|--------|--------|----------|----------------------|
| I | dark-angels | Тёмные Ангелы | loyalist | Lion El'Jonson | caliban |
| III | emperors-children | Дети Императора | traitor | Fulgrim | chemos |
| IV | iron-warriors | Железные Воины | traitor | Perturabo | olympia |
| V | white-scars | Белые Шрамы | loyalist | Jaghatai Khan | chogoris |
| VI | space-wolves | Космические Волки | loyalist | Leman Russ | fenris |
| VII | imperial-fists | Имперские Кулаки | loyalist | Rogal Dorn | terra |
| VIII | night-lords | Ночные Лорды | traitor | Konrad Curze | nostramo |
| IX | blood-angels | Кровавые Ангелы | loyalist | Sanguinius | baal |
| X | iron-hands | Железные Руки | loyalist | Ferrus Manus | medusa |
| XII | world-eaters | Пожиратели Миров | traitor | Angron | nuceria |
| XIII | ultramarines | Ультрамарины | loyalist | Roboute Guilliman | macragge |
| XIV | death-guard | Дозорные Смерти | traitor | Mortarion | barbarus |
| XV | thousand-sons | Тысяча Сынов | traitor | Magnus the Red | prospero |
| XVI | black-legion | Чёрный Легион (Сыны Хоруса) | traitor | Horus | cthonia |
| XVII | word-bearers | Несущие Слово | traitor | Lorgar | colchis |
| XVIII | salamanders | Саламандры | loyalist | Vulkan | nocturne |
| XIX | raven-guard | Гвардия Ворона | loyalist | Corvus Corax | kiavahr |
| XX | alpha-legion | Альфа-Легион | traitor | Alpharius Omegon | unknown-omega |

### Emblem motif per legion (for `tools/svg-assets.js`, hand-authored, NOT copies of GW logos)

dark-angels: sword through wings · emperors-children: laurel-wreathed Ω-palatine mark · iron-warriors: crenellated tower · white-scars: lightning-slashed skull mark · space-wolves: wolf-head silhouette · imperial-fists: raised armored fist · night-lords: lightning bolt through skull · blood-angels: winged blood drop · iron-hands: cog-ringed metal fist · world-eaters: brass fanged skull with horns · ultramarines: Ω (omega) arch · death-guard: fly-winged skull · thousand-sons: flaming eye · black-legion: eight-rayed broken star · word-bearers: seven-pointed dark star over open tome · salamanders: drake/salamander silhouette · raven-guard: raven with spread wings · alpha-legion: coiled double-headed hydra

### Location ID reference (locked; every `homeworldLocationId` and `timeline[].locationId` must come from this set — ~60 IDs)

Homeworlds: `caliban, chemos, olympia, chogoris, fenris, terra, nostramo, baal, medusa, nuceria, macragge, barbarus, prospero, cthonia, colchis, nocturne, kiavahr, unknown-omega`

Shared Great Crusade / Heresy sites: `isstvan-iii, isstvan-v, ullanor, nikaea, molech, calth, davin, beta-garmon, phall, chondax, garm`

Per-legion sites: `the-rock, piscina, tuchulcha-nebula, alaxxes-nebula, phalanx, rynns-world, signus-prime, skalathrax, medusan-gate, endymion, deliverance, lycaeus, kadillus, laeran, tallarn, murder, armatura, 63-19, aghoru, pythos, sortiarius, eye-of-terror, monarchia, eskrador, cryptus, iax`

Current-era (M41–M42): `armageddon, cadia, vigilus, badab, damnos, sanctus-reach`

(That's 60 unique IDs. Task 2 assigns each a `name`, `segmentum`, `x`/`y` in a 0–1000 viewBox, and a one-paragraph `blurb`.)

---

## Data Schemas (locked — every task must conform exactly)

```js
// data.js — one entry of LEGIONS
{
  slug: 'ultramarines',            // matches Legion table + asset filenames
  number: 'XIII',
  name: 'Ultramarines',
  nameRu: 'Ультрамарины',
  status: 'loyalist',               // 'loyalist' | 'traitor' — nothing else
  primarch: { name: 'Roboute Guilliman', summary: '...' },
  homeworldLocationId: 'macragge',  // must exist in LOCATIONS
  homeworldName: 'Макрагг',
  homeworldCulture: '...',          // 1-2 sentences
  colors: { primary: '#0c3c78', secondary: '#c9a227', trim: '#f2f2f2' }, // hex
  emblemDescription: '...',         // 1 sentence describing the emblem motif
  currentStatus: '...',             // 2-4 sentences, present-day (M42) status
  keyCharacters: [
    { name: '...', role: '...', note: '...' }  // >= 2 entries required
  ],
  timeline: [
    { era: '...', locationId: 'macragge', title: '...', description: '...' } // >= 4 entries required
  ],
  books: ['...', '...'],            // >= 2 titles/series required
}
```

```js
// map-data.js — one entry of LOCATIONS
{
  id: 'macragge',        // from the locked ID list
  name: 'Макрагг',
  segmentum: 'Segmentum Ultima',
  x: 720, y: 610,          // 0-1000, no two locations closer than ~25 units
  blurb: '...',            // 1-2 sentences, legion-neutral description of the place itself
}
```

## App.js Interface (locked function names — later tasks call these exactly)

- `switchTab(tabId)` — `tabId: 'orders' | 'map'`
- `applyFilter(filter)` — `filter: 'all' | 'loyalist' | 'traitor'`
- `renderOrdersGrid()`, `openLegionDetail(slug)`, `closeLegionDetail()`
- `renderMapTab()`, `selectLegionOnMap(slugOrNull)`, `showLocationPopup(locationId, slugOrNull)`, `hideLocationPopup()`
- Lookup helpers: `bySlug(slug)`, `byLocationId(id)`

---

### Task 1: Project scaffold, validator, data stubs

**Files:**
- Create: `index.html`, `style.css`, `data.js`, `map-data.js`, `app.js`, `tools/validate.js`

**Interfaces:**
- Produces: `LEGIONS` (empty array, global in browser / exported in Node), `LOCATIONS` (same), DOM ids `ordersGrid`, `orderDetail`, `panel-orders`, `panel-map`, `mapSvg`, `mapLegionSelect`, `mapPopup`, and CSS class hooks `.tab-btn`, `.filter-btn`, `.hidden`.

- [ ] **Step 1: Write the validator**

Create `tools/validate.js`:

```js
const path = require('path');
const fs = require('fs');

const { LEGIONS } = require(path.join(__dirname, '..', 'data.js'));
const { LOCATIONS } = require(path.join(__dirname, '..', 'map-data.js'));

const errors = [];
const fail = (msg) => errors.push(msg);

const locIds = new Set();
for (const loc of LOCATIONS) {
  for (const field of ['id', 'name', 'segmentum', 'blurb']) {
    if (!loc[field] || typeof loc[field] !== 'string') fail(`Location missing/invalid "${field}": ${JSON.stringify(loc)}`);
  }
  if (typeof loc.x !== 'number' || typeof loc.y !== 'number') fail(`Location "${loc.id}" missing numeric x/y`);
  if (loc.x < 0 || loc.x > 1000 || loc.y < 0 || loc.y > 1000) fail(`Location "${loc.id}" x/y out of 0-1000 range`);
  if (locIds.has(loc.id)) fail(`Duplicate location id: ${loc.id}`);
  locIds.add(loc.id);
}

const REQUIRED_STRING_FIELDS = ['slug', 'number', 'name', 'nameRu', 'status', 'homeworldName', 'homeworldLocationId', 'currentStatus', 'emblemDescription'];
const slugs = new Set();
const numbers = new Set();

for (const l of LEGIONS) {
  for (const field of REQUIRED_STRING_FIELDS) {
    if (!l[field] || typeof l[field] !== 'string') fail(`Legion ${l.slug || '?'} missing/invalid "${field}"`);
  }
  if (l.status !== 'loyalist' && l.status !== 'traitor') fail(`Legion ${l.slug} has invalid status "${l.status}"`);
  if (slugs.has(l.slug)) fail(`Duplicate legion slug: ${l.slug}`);
  slugs.add(l.slug);
  if (numbers.has(l.number)) fail(`Duplicate legion number: ${l.number}`);
  numbers.add(l.number);

  if (!l.primarch || !l.primarch.name || !l.primarch.summary) fail(`Legion ${l.slug} missing primarch.name/summary`);
  if (!l.colors || !l.colors.primary || !l.colors.secondary || !l.colors.trim) fail(`Legion ${l.slug} missing colors.primary/secondary/trim`);
  if (l.homeworldLocationId && !locIds.has(l.homeworldLocationId)) fail(`Legion ${l.slug} homeworldLocationId "${l.homeworldLocationId}" not in LOCATIONS`);

  if (!Array.isArray(l.keyCharacters) || l.keyCharacters.length < 2) fail(`Legion ${l.slug} needs >= 2 keyCharacters`);
  for (const c of (l.keyCharacters || [])) {
    if (!c.name || !c.role) fail(`Legion ${l.slug} has a keyCharacter missing name/role`);
  }

  if (!Array.isArray(l.timeline) || l.timeline.length < 4) fail(`Legion ${l.slug} needs >= 4 timeline events`);
  for (const ev of (l.timeline || [])) {
    if (!ev.era || !ev.title || !ev.description) fail(`Legion ${l.slug} has a timeline event missing era/title/description`);
    if (!ev.locationId || !locIds.has(ev.locationId)) fail(`Legion ${l.slug} timeline event "${ev.title}" has unknown locationId "${ev.locationId}"`);
  }

  if (!Array.isArray(l.books) || l.books.length < 2) fail(`Legion ${l.slug} needs >= 2 book/series entries`);

  for (const [kind, dir] of [['marine', 'marines'], ['emblem', 'emblems']]) {
    const p = path.join(__dirname, '..', 'assets', dir, `${l.slug}.svg`);
    if (!fs.existsSync(p)) fail(`Missing asset file for ${l.slug}: assets/${dir}/${l.slug}.svg`);
    else {
      const content = fs.readFileSync(p, 'utf8');
      if (!content.includes('<svg') || !content.includes('</svg>') || !content.includes('viewBox')) {
        fail(`Asset assets/${dir}/${l.slug}.svg does not look like valid SVG`);
      }
    }
  }
}

console.log(`Locations: ${LOCATIONS.length}`);
console.log(`Legions: ${LEGIONS.length}`);

if (errors.length) {
  console.error(`\nFAILED with ${errors.length} error(s):`);
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('OK: all checks passed');
}
```

- [ ] **Step 2: Run it to confirm it fails (no data files yet)**

Run: `node tools/validate.js`
Expected: `Error: Cannot find module '.../data.js'`

- [ ] **Step 3: Create empty data stubs**

Create `data.js`:
```js
const LEGIONS = [];
if (typeof module !== 'undefined' && module.exports) module.exports = { LEGIONS };
```

Create `map-data.js`:
```js
const LOCATIONS = [];
if (typeof module !== 'undefined' && module.exports) module.exports = { LOCATIONS };
```

- [ ] **Step 4: Run validator to confirm it passes on empty data**

Run: `node tools/validate.js`
Expected: `Locations: 0`, `Legions: 0`, `OK: all checks passed`

- [ ] **Step 5: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Adeptus Astartes — Легионы</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <h1>Adeptus Astartes: Легионы Космического Десанта</h1>
  <nav class="tabs">
    <button class="tab-btn active" data-tab="orders">Ордена</button>
    <button class="tab-btn" data-tab="map">Карта галактики</button>
  </nav>
</header>
<main>
  <section class="tab-panel active" id="panel-orders">
    <div class="filters" id="ordersFilters">
      <button class="filter-btn active" data-filter="all">Все</button>
      <button class="filter-btn" data-filter="loyalist">Лоялисты</button>
      <button class="filter-btn" data-filter="traitor">Отступники</button>
    </div>
    <div class="orders-grid" id="ordersGrid"></div>
    <div class="order-detail hidden" id="orderDetail"></div>
  </section>
  <section class="tab-panel" id="panel-map">
    <div class="map-controls">
      <label for="mapLegionSelect">Легион:</label>
      <select id="mapLegionSelect"></select>
    </div>
    <div class="map-wrap">
      <svg id="mapSvg" xmlns="http://www.w3.org/2000/svg"></svg>
      <div class="map-popup hidden" id="mapPopup"></div>
    </div>
  </section>
</main>
<script src="map-data.js"></script>
<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 6: Write base `style.css`**

```css
:root {
  --bg: #0b0d10;
  --panel: #14171c;
  --panel-2: #1b1f26;
  --text: #d9dde3;
  --muted: #8892a0;
  --gold: #c9a227;
  --crimson: #8a1f2b;
  --border: #2a2f38;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: Georgia, 'Times New Roman', serif; }
.site-header { padding: 1.5rem 2rem 0.5rem; border-bottom: 1px solid var(--border); }
.site-header h1 { margin: 0 0 1rem; font-size: 1.6rem; letter-spacing: 0.05em; }
.tabs { display: flex; gap: 0.5rem; }
.tab-btn, .filter-btn { background: var(--panel); color: var(--text); border: 1px solid var(--border); padding: 0.5rem 1.2rem; cursor: pointer; font-family: inherit; font-size: 0.95rem; }
.tab-btn.active, .filter-btn.active { background: var(--gold); color: #1a1a1a; border-color: var(--gold); }
.tab-panel { display: none; padding: 1.5rem 2rem; }
.tab-panel.active { display: block; }
.filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.hidden { display: none !important; }

.orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
.order-card { background: var(--panel); border: 1px solid var(--border); padding: 1rem; text-align: center; cursor: pointer; transition: border-color 0.15s; }
.order-card:hover { border-color: var(--gold); }
.order-card.status-traitor:hover { border-color: var(--crimson); }
.order-card-emblem { width: 64px; height: 64px; margin-bottom: 0.5rem; }
.order-card-name { font-weight: bold; }
.order-card-number { color: var(--muted); font-size: 0.85rem; }
.order-card-badge { display: inline-block; margin-top: 0.5rem; padding: 0.15rem 0.6rem; font-size: 0.75rem; border-radius: 2px; }
.status-loyalist .order-card-badge, .order-card-badge.status-loyalist { background: rgba(201,162,39,0.15); color: var(--gold); border: 1px solid var(--gold); }
.status-traitor .order-card-badge, .order-card-badge.status-traitor { background: rgba(138,31,43,0.2); color: #e0616e; border: 1px solid var(--crimson); }

.order-detail { background: var(--panel); border: 1px solid var(--border); padding: 1.5rem; }
.back-btn { background: none; border: none; color: var(--gold); cursor: pointer; font-family: inherit; margin-bottom: 1rem; padding: 0; }
.detail-header { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1rem; }
.detail-marine { width: 160px; }
.detail-emblem { width: 56px; height: 56px; }
.detail-header-info h2 { margin: 0.4rem 0 0.2rem; }
.legion-number { color: var(--muted); font-weight: normal; font-size: 0.9rem; }
.emblem-desc { color: var(--muted); font-size: 0.9rem; max-width: 40em; }
.order-detail section { margin-top: 1.2rem; }
.order-detail h3 { border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold); }
.timeline li { margin-bottom: 0.5rem; }
.timeline-era { color: var(--muted); font-size: 0.85rem; margin-right: 0.4rem; }

.map-controls { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.map-controls select { background: var(--panel); color: var(--text); border: 1px solid var(--border); padding: 0.4rem; font-family: inherit; }
.map-wrap { position: relative; background: var(--panel-2); border: 1px solid var(--border); }
#mapSvg { width: 100%; height: 70vh; display: block; }
.map-point { fill: var(--gold); stroke: #0b0d10; stroke-width: 1; cursor: pointer; }
.map-point.dimmed { fill: #3a3f47; opacity: 0.5; }
.map-label { fill: var(--muted); font-size: 9px; pointer-events: none; }
.map-path { fill: none; stroke-width: 1.5; opacity: 0.85; }
.map-popup { position: absolute; top: 1rem; right: 1rem; width: 300px; max-height: 60vh; overflow-y: auto; background: var(--panel); border: 1px solid var(--gold); padding: 1rem; font-size: 0.9rem; }
.map-popup h4 { margin: 0 0 0.2rem; }
.map-popup-meta { color: var(--muted); font-size: 0.8rem; margin: 0 0 0.6rem; }
.map-popup-legion { margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid var(--border); }
.map-popup button { margin-top: 0.8rem; background: var(--gold); border: none; padding: 0.4rem 1rem; cursor: pointer; }
```

- [ ] **Step 7: Write `app.js` skeleton**

```js
function bySlug(slug) { return LEGIONS.find(l => l.slug === slug); }
function byLocationId(id) { return LOCATIONS.find(l => l.id === id); }

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabId}`));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  if (tabId === 'map' && !document.getElementById('mapSvg').dataset.rendered) renderMapTab();
}

function applyFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
  window.__currentFilter = filter;
  renderOrdersGrid();
}

function filteredLegions() {
  const f = window.__currentFilter || 'all';
  return f === 'all' ? LEGIONS : LEGIONS.filter(l => l.status === f);
}

function renderOrdersGrid() {
  const grid = document.getElementById('ordersGrid');
  grid.innerHTML = filteredLegions().length
    ? ''
    : '<p style="color:var(--muted)">Пока нет данных.</p>';
}

function renderMapTab() {
  document.getElementById('mapSvg').dataset.rendered = '1';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  renderOrdersGrid();
});
```

- [ ] **Step 8: Manual browser check**

Open `index.html` directly in the Browser pane (`preview_start` with the file path or `navigate` to the `file://` path). Confirm: page loads with no console errors, clicking "Карта галактики" switches panels, clicking filter buttons toggles active state.

- [ ] **Step 9: Commit**

```bash
git add index.html style.css data.js map-data.js app.js tools/validate.js
git commit -m "scaffold: page shell, theme, data stubs, validator"
```

---

### Task 2: `map-data.js` — full LOCATIONS dataset

**Files:** Modify `map-data.js`

**Interfaces:**
- Consumes: locked Location ID list above.
- Produces: `LOCATIONS` populated with exactly the ~60 locked IDs, each with `name`, `segmentum`, `x`, `y` (0–1000, no two points within 25 units of each other), `blurb`.

- [ ] **Step 1:** For each of the 60 locked IDs, write one object per the Location schema. Group placement loosely by the five segmenta (Solar, Obscurus, Tempestus, Pacificus, Ultima) plus an "Eye of Terror / Imperium Nihilus" region for traitor realms — spread across the 0–1000 canvas so the rendered map reads clearly (e.g. Solar cluster near center ~450–550,450–550; Segmentum Ultima lower-right; Obscurus upper-left; Eye of Terror far upper-right, etc.).
- [ ] **Step 2:** Run `node tools/validate.js` — expect `Locations: 60`, no location-related errors (legion errors about missing fields are expected/ignored at this stage since `LEGIONS` is still empty).
- [ ] **Step 3:** Commit.

```bash
git add map-data.js
git commit -m "content: full galaxy location dataset (60 systems)"
```

---

### Task 3: `tools/svg-assets.js` — visual generator + loyalist assets (9 legions)

**Files:** Create `tools/svg-assets.js`; Create `assets/marines/*.svg` and `assets/emblems/*.svg` for the 9 loyalist slugs.

**Interfaces:**
- Consumes: `colors` + emblem motif per legion from the Legion table above.
- Produces: `assets/marines/<slug>.svg`, `assets/emblems/<slug>.svg` for every slug added to `LEGION_VISUALS`.

- [ ] **Step 1: Write the shared template + first two example entries**

```js
const fs = require('fs');
const path = require('path');

function buildEmblemSvg({ paths, ring }) {
  const pathsMarkup = paths.map(p => `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${p.strokeWidth || 0}" stroke-linecap="round"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
  <circle cx="110" cy="110" r="100" fill="#12141a" stroke="${ring}" stroke-width="6"/>
  ${pathsMarkup}
</svg>`;
}

function buildMarineSvg({ primary, secondary, trim, emblemPaths }) {
  const emblem = emblemPaths.map(p => `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${(p.strokeWidth || 0) * 0.4}" stroke-linecap="round"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
  <polygon points="120,300 130,400 145,400 150,310 150,310 155,400 170,400 180,300" fill="${primary}"/>
  <rect x="115" y="278" width="70" height="26" fill="${secondary}"/>
  <path d="M110,175 L100,285 L200,285 L190,175 Z" fill="${primary}"/>
  <polygon points="118,150 108,180 125,175" fill="${trim}"/>
  <polygon points="182,150 192,180 175,175" fill="${trim}"/>
  <ellipse cx="55" cy="195" rx="38" ry="34" fill="${secondary}" stroke="${trim}" stroke-width="3"/>
  <g transform="translate(28,168) scale(0.24)">${emblem}</g>
  <ellipse cx="245" cy="195" rx="38" ry="34" fill="${primary}" stroke="${trim}" stroke-width="3"/>
  <rect x="88" y="185" width="26" height="95" rx="10" fill="${primary}"/>
  <rect x="186" y="185" width="26" height="95" rx="10" fill="${primary}"/>
  <ellipse cx="150" cy="110" rx="52" ry="58" fill="${secondary}"/>
  <path d="M118,105 h26 v14 h-26 z M156,105 h26 v14 h-26 z M144,116 v18 h12 v-18 z" fill="${trim}"/>
</svg>`;
}

const LEGION_VISUALS = {
  'ultramarines': {
    status: 'loyalist',
    primary: '#12327a', secondary: '#0a1f52', trim: '#e6c869',
    emblemPaths: [
      { d: 'M70,160 L70,100 A40,40 0 1 1 150,100 L150,160', stroke: '#e6c869', strokeWidth: 16 }
    ]
  },
  'world-eaters': {
    status: 'traitor',
    primary: '#6b1010', secondary: '#3a0a0a', trim: '#c7b98a',
    emblemPaths: [
      { d: 'M110,60 a45,45 0 1 0 0.1,0 Z', fill: '#c7b98a' },
      { d: 'M92,95 a8,8 0 1 0 0.1,0 Z', fill: '#1a1a1a' },
      { d: 'M128,95 a8,8 0 1 0 0.1,0 Z', fill: '#1a1a1a' },
      { d: 'M75,120 L145,120 L135,150 L125,125 L115,150 L105,125 L95,150 L85,125 Z', fill: '#c7b98a' },
      { d: 'M65,80 L45,55 L70,65 Z', fill: '#c7960a' },
      { d: 'M155,80 L175,55 L150,65 Z', fill: '#c7960a' }
    ]
  }
};

function generateAll() {
  for (const [slug, v] of Object.entries(LEGION_VISUALS)) {
    const ring = v.status === 'loyalist' ? '#c9a227' : '#8a1f2b';
    fs.writeFileSync(path.join(__dirname, '..', 'assets', 'emblems', `${slug}.svg`), buildEmblemSvg({ paths: v.emblemPaths, ring }));
    fs.writeFileSync(path.join(__dirname, '..', 'assets', 'marines', `${slug}.svg`), buildMarineSvg(v));
    console.log(`wrote ${slug}`);
  }
}

generateAll();
```

- [ ] **Step 2: Run it**

Run: `node tools/svg-assets.js`
Expected: `wrote ultramarines`, `wrote world-eaters`, and both files exist under `assets/emblems/` and `assets/marines/`.

- [ ] **Step 3: Extend `LEGION_VISUALS` with the remaining 7 loyalist legions**

Using the Legion table's `colors` (author reasonable canon-accurate hex values not yet fixed above — pick per legion, e.g. Dark Angels deep green/black, White Scars white/red, Space Wolves grey/blue, Imperial Fists yellow/black, Blood Angels red/gold, Iron Hands black/silver, Salamanders green/bronze, Raven Guard black/white) and the Emblem motif table (sword-through-wings, wolf head, raised fist, winged blood drop, cog-ringed fist, drake silhouette, raven), add one `LEGION_VISUALS` entry each for: `dark-angels`, `white-scars`, `space-wolves`, `imperial-fists`, `blood-angels`, `iron-hands`, `salamanders`, `raven-guard`. Each entry follows the exact same shape as the two examples above (simple path/circle/polygon primitives only — no external references, no `<image>`/`<use>` of other files).

- [ ] **Step 4: Run generator again**

Run: `node tools/svg-assets.js`
Expected: 9 `wrote ...` lines total, 18 new SVG files present (9 marines + 9 emblems).

- [ ] **Step 5: Validate**

Run: `node tools/validate.js`
Expected: no asset-related errors for any loyalist slug (legion-content errors are still expected since `data.js` LEGIONS is still empty — ignore those).

- [ ] **Step 6: Commit**

```bash
git add tools/svg-assets.js assets/marines assets/emblems
git commit -m "art: generator + loyalist legion visuals (9)"
```

---

### Task 4: Traitor legion visuals (9 legions)

**Files:** Modify `tools/svg-assets.js`

- [ ] **Step 1:** Add `LEGION_VISUALS` entries for the remaining 9 traitor slugs: `emperors-children`, `iron-warriors`, `night-lords`, `death-guard`, `thousand-sons`, `black-legion`, `word-bearers`, `alpha-legion` (world-eaters already done in Task 3), using each legion's canon color scheme (e.g. Emperor's Children purple/gold, Iron Warriors grey/gold, Night Lords midnight blue/silver, Death Guard bone/rust-green, Thousand Sons blue/gold with flame motif, Black Legion black/chrome with broken aquila, Word Bearers maroon/brass, Alpha Legion hydra teal/green) and this task's motif table (fly-winged skull, flaming eye, eight-rayed star, seven-pointed star over tome, crenellated tower, lightning-through-skull, coiled hydra).
- [ ] **Step 2:** Run `node tools/svg-assets.js` — expect all 18 slugs (9+9) to log `wrote ...`.
- [ ] **Step 3:** Run `node tools/validate.js` — expect zero asset-related errors for all 18 slugs.
- [ ] **Step 4: Commit**

```bash
git add tools/svg-assets.js assets/marines assets/emblems
git commit -m "art: traitor legion visuals (9) — 36 SVGs complete"
```

---

### Task 5: `data.js` — loyalist legion content (9 entries)

**Files:** Modify `data.js`

**Interfaces:** Consumes: Legion table (slug/status/primarch/homeworldLocationId) + Location IDs from Task 2. Produces: 9 `LEGIONS` entries per the Data Schema above.

- [ ] **Step 1:** For `dark-angels`, `white-scars`, `space-wolves`, `imperial-fists`, `blood-angels`, `iron-hands`, `ultramarines`, `salamanders`, `raven-guard`, write a full entry each: primarch summary, homeworld name/culture, colors (matching Task 3/4's hex values exactly), emblem description, 2–4 sentence current-status paragraph (present-day Chapter status, successor Chapters where relevant), 3–5 key characters beyond the primarch, 4–6 timeline events (each tied to a `locationId` from the locked list, e.g. Dark Angels: caliban → the-rock → isstvan-v or beta-garmon → piscina; Ultramarines: macragge → calth → ullanor → chondax/iax), 2–4 book/series titles.
- [ ] **Step 2:** Run `node tools/validate.js` — expect zero errors for these 9 slugs (traitor slugs still absent from LEGIONS, that's fine).
- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "content: loyalist legion lore entries (9)"
```

---

### Task 6: `data.js` — traitor legion content (9 entries)

**Files:** Modify `data.js`

- [ ] **Step 1:** Same as Task 5 for `emperors-children`, `iron-warriors`, `night-lords`, `world-eaters`, `death-guard`, `thousand-sons`, `black-legion`, `word-bearers`, `alpha-legion`. Reuse shared location IDs already used by loyalists where lore overlaps (e.g. `isstvan-iii`, `isstvan-v`, `terra`, `davin`) rather than inventing new ones. `currentStatus` describes their present role as Chaos Space Marines / Black Legion allies.
- [ ] **Step 2:** Run `node tools/validate.js` — expect `Legions: 18`, `OK: all checks passed`, zero errors.
- [ ] **Step 3:** Run `node -e "const {LEGIONS}=require('./data.js'); if(LEGIONS.length!==18) throw new Error('expected 18 got '+LEGIONS.length); console.log('18 legions confirmed, statuses:', LEGIONS.filter(l=>l.status==='loyalist').length,'loyalist /',LEGIONS.filter(l=>l.status==='traitor').length,'traitor');"` — expect `18 legions confirmed, statuses: 9 loyalist / 9 traitor`.
- [ ] **Step 4: Commit**

```bash
git add data.js
git commit -m "content: traitor legion lore entries (9) — all 18 legions complete"
```

---

### Task 7: Orders tab — full rendering + detail view

**Files:** Modify `app.js`, `index.html` (none), `style.css` (extend if needed)

**Interfaces:**
- Consumes: `LEGIONS` (full, from Task 6), `byLocationId`.
- Produces: working `renderOrdersGrid()` and `openLegionDetail(slug)`/`closeLegionDetail()` per the locked signatures.

- [ ] **Step 1:** Replace the `renderOrdersGrid` skeleton with the full version:

```js
function renderOrdersGrid() {
  const grid = document.getElementById('ordersGrid');
  grid.innerHTML = '';
  for (const l of filteredLegions()) {
    const card = document.createElement('div');
    card.className = `order-card status-${l.status}`;
    card.innerHTML = `
      <img class="order-card-emblem" src="assets/emblems/${l.slug}.svg" alt="Эмблема ${l.nameRu}">
      <div class="order-card-name">${l.nameRu}</div>
      <div class="order-card-number">Легион ${l.number}</div>
      <div class="order-card-badge status-${l.status}">${l.status === 'loyalist' ? 'Лоялист' : 'Отступник'}</div>
    `;
    card.addEventListener('click', () => openLegionDetail(l.slug));
    grid.appendChild(card);
  }
}

function openLegionDetail(slug) {
  const l = bySlug(slug);
  if (!l) return;
  document.getElementById('ordersGrid').classList.add('hidden');
  document.getElementById('ordersFilters').classList.add('hidden');
  const detail = document.getElementById('orderDetail');
  detail.classList.remove('hidden');
  detail.innerHTML = `
    <button class="back-btn" id="detailBackBtn">← Назад к списку</button>
    <div class="detail-header">
      <img class="detail-marine" src="assets/marines/${l.slug}.svg" alt="Космодесантник ${l.nameRu}">
      <div class="detail-header-info">
        <img class="detail-emblem" src="assets/emblems/${l.slug}.svg" alt="Эмблема ${l.nameRu}">
        <h2>${l.nameRu} <span class="legion-number">(Легион ${l.number})</span></h2>
        <div class="order-card-badge status-${l.status}">${l.status === 'loyalist' ? 'Лоялист' : 'Отступник'}</div>
        <p class="emblem-desc">${l.emblemDescription}</p>
      </div>
    </div>
    <section><h3>Примарх</h3><p><strong>${l.primarch.name}</strong> — ${l.primarch.summary}</p></section>
    <section><h3>Родной мир</h3><p>${l.homeworldName}. ${l.homeworldCulture || ''}</p></section>
    <section><h3>Текущее состояние</h3><p>${l.currentStatus}</p></section>
    <section><h3>Ключевые персонажи</h3><ul>${l.keyCharacters.map(c => `<li><strong>${c.name}</strong> — ${c.role}${c.note ? '. ' + c.note : ''}</li>`).join('')}</ul></section>
    <section><h3>Хронология</h3><ul class="timeline">${l.timeline.map(ev => `<li><span class="timeline-era">${ev.era}</span><strong>${ev.title}</strong> (${byLocationId(ev.locationId)?.name || ev.locationId}) — ${ev.description}</li>`).join('')}</ul></section>
    <section><h3>Появления в книгах</h3><ul>${l.books.map(b => `<li>${b}</li>`).join('')}</ul></section>
  `;
  document.getElementById('detailBackBtn').addEventListener('click', closeLegionDetail);
}

function closeLegionDetail() {
  document.getElementById('orderDetail').classList.add('hidden');
  document.getElementById('orderDetail').innerHTML = '';
  document.getElementById('ordersFilters').classList.remove('hidden');
  document.getElementById('ordersGrid').classList.remove('hidden');
}
```

- [ ] **Step 2: Browser check**

Open `index.html` in the Browser pane. Confirm: 18 cards render (9 gold-bordered loyalists, 9 crimson-bordered traitors on hover), clicking "Отступники" filter shows only 9 cards, clicking a card opens the detail view with marine image + emblem + all sections populated, "Назад к списку" returns to the grid. Check console for zero errors (especially no broken image 404s for any of the 36 SVGs).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: orders tab grid, filter and detail view"
```

---

### Task 8: Galaxy map tab — rendering + interaction

**Files:** Modify `app.js`

**Interfaces:**
- Consumes: `LOCATIONS` (Task 2), `LEGIONS` (Task 6).
- Produces: working `renderMapTab()`, `selectLegionOnMap(slugOrNull)`, `showLocationPopup(locationId, slugOrNull)`, `hideLocationPopup()`.

- [ ] **Step 1:** Replace the `renderMapTab` skeleton and add the map functions:

```js
function renderMapTab() {
  const svg = document.getElementById('mapSvg');
  svg.dataset.rendered = '1';
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.innerHTML = LOCATIONS.map(loc =>
    `<circle class="map-point" data-id="${loc.id}" cx="${loc.x}" cy="${loc.y}" r="6"></circle>
     <text class="map-label" x="${loc.x + 9}" y="${loc.y + 4}">${loc.name}</text>`
  ).join('');
  svg.querySelectorAll('.map-point').forEach(el => {
    el.addEventListener('click', () => showLocationPopup(el.dataset.id, window.__selectedMapLegion || null));
  });

  const selector = document.getElementById('mapLegionSelect');
  selector.innerHTML = '<option value="">— Все легионы —</option>' + LEGIONS.map(l => `<option value="${l.slug}">${l.nameRu}</option>`).join('');
  selector.addEventListener('change', () => selectLegionOnMap(selector.value || null));
}

function selectLegionOnMap(slug) {
  window.__selectedMapLegion = slug;
  const svg = document.getElementById('mapSvg');
  svg.querySelectorAll('.map-path').forEach(p => p.remove());
  const l = slug ? bySlug(slug) : null;
  const usedIds = new Set();
  if (l) {
    usedIds.add(l.homeworldLocationId);
    l.timeline.forEach(ev => usedIds.add(ev.locationId));
  }
  svg.querySelectorAll('.map-point').forEach(el => {
    el.classList.toggle('dimmed', !!l && !usedIds.has(el.dataset.id));
  });
  if (l) {
    const points = [l.homeworldLocationId, ...l.timeline.map(ev => ev.locationId)]
      .map(id => byLocationId(id)).filter(Boolean);
    if (points.length > 1) {
      const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'map-path');
      path.style.stroke = l.colors.primary;
      svg.insertBefore(path, svg.firstChild);
    }
  }
}

function showLocationPopup(locationId, slug) {
  const loc = byLocationId(locationId);
  if (!loc) return;
  const relevant = slug ? [bySlug(slug)].filter(Boolean)
    : LEGIONS.filter(l => l.homeworldLocationId === locationId || l.timeline.some(ev => ev.locationId === locationId));
  let body = `<h4>${loc.name}</h4><p class="map-popup-meta">${loc.segmentum}</p><p>${loc.blurb}</p>`;
  for (const rl of relevant) {
    const events = rl.timeline.filter(ev => ev.locationId === locationId);
    const isHome = rl.homeworldLocationId === locationId;
    if (!events.length && !isHome) continue;
    body += `<div class="map-popup-legion"><strong>${rl.nameRu}</strong>`;
    if (isHome) body += `<div>Родной мир легиона.</div>`;
    body += events.map(ev => `<div><em>${ev.era}</em> — ${ev.title}: ${ev.description}</div>`).join('');
    body += `</div>`;
  }
  const popup = document.getElementById('mapPopup');
  popup.innerHTML = body + '<button id="mapPopupClose">Закрыть</button>';
  popup.classList.remove('hidden');
  document.getElementById('mapPopupClose').addEventListener('click', hideLocationPopup);
}

function hideLocationPopup() {
  document.getElementById('mapPopup').classList.add('hidden');
}
```

- [ ] **Step 2: Browser check**

Open the Map tab. Confirm: ~60 labeled points render across the SVG with no overlap making them unclickable, selecting a legion from the dropdown dims unrelated points and draws a colored path through that legion's locations in chronological order, clicking a point opens a popup with the location blurb plus that legion's event description(s) there, clicking a point while "— Все легионы —" is selected lists every legion with an event/homeworld there, "Закрыть" hides the popup. Check console for zero errors.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: interactive galaxy map tab"
```

---

### Task 9: Final integration QA (no push)

**Files:** none (verification only), possibly minor fixes to any file if bugs found

- [ ] **Step 1:** Run `node tools/validate.js` — expect `Locations: 60`, `Legions: 18`, `OK: all checks passed`.
- [ ] **Step 2:** In the Browser pane, open `index.html` via `file://` (not a dev server, to prove true offline/double-click usage). Click through all 18 legion detail cards (both filters), confirm every marine + emblem image loads (no broken-image icons), confirm every timeline location resolves to a real name (not a raw id).
- [ ] **Step 3:** On the Map tab, cycle through several legions in the dropdown (at least 2 loyalist, 2 traitor) and confirm the highlighted path and popups look correct; test the "Все легионы" popup case on a shared location like `terra` or `isstvan-v`.
- [ ] **Step 4:** Resize the Browser pane to mobile width and confirm the grid reflows without horizontal scroll and the map remains usable.
- [ ] **Step 5:** Take a screenshot of the Orders grid and the Map tab as evidence.
- [ ] **Step 6:** `git status` to confirm everything is committed; leave the branch as-is — **do not push**.

---

## Deployment (deferred — requires separate user confirmation)

Once Task 9 passes: ask the user to explicitly confirm `git push origin main`, and separately point them to Settings → Pages → Deploy from branch → `main` / `/(root)` in the GitHub UI (or ask if they want it done via `gh` once authenticated) to actually publish the page.
