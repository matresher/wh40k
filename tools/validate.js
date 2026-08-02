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
