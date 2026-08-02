const fs = require('fs');
const path = require('path');

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function cogPath(cx, cy, rOuter, rInner, teeth) {
  const pts = [];
  const step = 360 / (teeth * 2);
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const p = polar(cx, cy, r, i * step);
    pts.push(`${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(' ') + ' Z';
}

function starPath(cx, cy, rOuter, rInner, points) {
  const pts = [];
  const step = 360 / (points * 2);
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const p = polar(cx, cy, r, i * step);
    pts.push(`${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(' ') + ' Z';
}

function buildEmblemSvg({ paths, ring }) {
  const markup = paths.map(p =>
    `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${p.strokeWidth || 0}" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
  <circle cx="110" cy="110" r="102" fill="#12141a" stroke="${ring}" stroke-width="6"/>
  ${markup}
</svg>`;
}

function buildMarineSvg({ primary, secondary, trim, emblemPaths, helmet }) {
  const helmetColor = helmet || secondary;
  const emblemMarkup = emblemPaths.map(p =>
    `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${(p.strokeWidth || 0) * 0.42}" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
  <polygon points="120,300 130,400 145,400 150,310 155,400 170,400 180,300" fill="${primary}"/>
  <rect x="115" y="278" width="70" height="26" fill="${secondary}"/>
  <path d="M110,175 L100,285 L200,285 L190,175 Z" fill="${primary}"/>
  <polygon points="118,150 108,180 125,175" fill="${trim}"/>
  <polygon points="182,150 192,180 175,175" fill="${trim}"/>
  <ellipse cx="55" cy="195" rx="38" ry="34" fill="${secondary}" stroke="${trim}" stroke-width="3"/>
  <g transform="translate(21,161) scale(0.31)">${emblemMarkup}</g>
  <ellipse cx="245" cy="195" rx="38" ry="34" fill="${primary}" stroke="${trim}" stroke-width="3"/>
  <rect x="88" y="185" width="26" height="95" rx="10" fill="${primary}"/>
  <rect x="186" y="185" width="26" height="95" rx="10" fill="${primary}"/>
  <ellipse cx="150" cy="110" rx="52" ry="58" fill="${helmetColor}"/>
  <path d="M118,105 h26 v14 h-26 z M156,105 h26 v14 h-26 z M144,116 v18 h12 v-18 z" fill="${trim}"/>
</svg>`;
}

const LEGION_VISUALS = {
  'dark-angels': {
    status: 'loyalist',
    primary: '#1a3325', secondary: '#0d0d0d', trim: '#c0c0c0',
    emblemPaths: [
      { d: 'M40,125 L92,92 L92,142 L58,152 Z', fill: '#c0c0c0' },
      { d: 'M180,125 L128,92 L128,142 L162,152 Z', fill: '#c0c0c0' },
      { d: 'M110,35 L123,112 L110,188 L97,112 Z', fill: '#e8e8e8' },
      { d: 'M88,100 h44 v11 h-44 z', fill: '#8a8a8a' }
    ]
  },
  'white-scars': {
    status: 'loyalist',
    primary: '#e6e6e6', secondary: '#7a1414', trim: '#c9a227', helmet: '#d8d8d8',
    emblemPaths: [
      { d: 'M110,55 a48,52 0 1 0 0.1,0 Z', fill: '#f2f2f2' },
      { d: 'M92,100 a9,9 0 1 0 0.1,0 Z', fill: '#1a1a1a' },
      { d: 'M128,100 a9,9 0 1 0 0.1,0 Z', fill: '#1a1a1a' },
      { d: 'M55,55 L100,95 L78,105 L150,175', stroke: '#7a1414', strokeWidth: 14 }
    ]
  },
  'space-wolves': {
    status: 'loyalist',
    primary: '#48545f', secondary: '#1c2733', trim: '#d6d9dc',
    emblemPaths: [
      { d: 'M68,65 L85,95 L60,100 Z', fill: '#d6d9dc' },
      { d: 'M152,65 L135,95 L160,100 Z', fill: '#d6d9dc' },
      { d: 'M70,72 L150,72 L165,125 L110,182 L55,125 Z', fill: '#d6d9dc' },
      { d: 'M93,110 a7,7 0 1 0 0.1,0 Z', fill: '#1c2733' },
      { d: 'M127,110 a7,7 0 1 0 0.1,0 Z', fill: '#1c2733' },
      { d: 'M110,130 L98,150 L122,150 Z', fill: '#1c2733' }
    ]
  },
  'imperial-fists': {
    status: 'loyalist',
    primary: '#e0b400', secondary: '#1a1a1a', trim: '#8a1f1f', helmet: '#d1a600',
    emblemPaths: [
      { d: 'M70,120 h80 v55 a40,40 0 0 1 -80,0 Z', fill: '#1a1a1a' },
      { d: 'M78,110 h16 v25 h-16 z M100,102 h16 v33 h-16 z M122,102 h16 v33 h-16 z M144,110 h14 v25 h-14 z', fill: '#1a1a1a' },
      { d: 'M60,140 L78,130 L78,165 L60,168 Z', fill: '#1a1a1a' }
    ]
  },
  'blood-angels': {
    status: 'loyalist',
    primary: '#8a1220', secondary: '#1a1a1a', trim: '#c9a227',
    emblemPaths: [
      { d: 'M110,45 C142,90 150,128 110,172 C70,128 78,90 110,45 Z', fill: '#c9a227' },
      { d: 'M45,110 L85,95 L75,130 Z', fill: '#8a1220' },
      { d: 'M175,110 L135,95 L145,130 Z', fill: '#8a1220' }
    ]
  },
  'iron-hands': {
    status: 'loyalist',
    primary: '#161616', secondary: '#3a3a3a', trim: '#b8bfc7',
    emblemPaths: [
      { d: 'REPLACE_COG', stroke: '#b8bfc7', strokeWidth: 8 },
      { d: 'M75,120 h70 v50 a35,35 0 0 1 -70,0 Z', fill: '#b8bfc7' },
      { d: 'M82,112 h14 v22 h-14 z M100,105 h14 v29 h-14 z M120,105 h14 v29 h-14 z M138,112 h14 v22 h-14 z', fill: '#161616' }
    ]
  },
  'ultramarines': {
    status: 'loyalist',
    primary: '#12327a', secondary: '#0a1f52', trim: '#e6c869',
    emblemPaths: [
      { d: 'M70,160 L70,100 A40,40 0 1 1 150,100 L150,160', stroke: '#e6c869', strokeWidth: 16 }
    ]
  },
  'salamanders': {
    status: 'loyalist',
    primary: '#0e3d2a', secondary: '#122a1e', trim: '#c9821a',
    emblemPaths: [
      { d: 'M60,130 C80,90 140,90 160,130 C150,120 130,150 110,150 C90,150 70,120 60,130 Z', fill: '#c9821a' },
      { d: 'M158,128 L182,118 L178,138 Z', fill: '#c9821a' },
      { d: 'M95,110 a6,6 0 1 0 0.1,0 Z', fill: '#0e3d2a' },
      { d: 'M125,110 a6,6 0 1 0 0.1,0 Z', fill: '#0e3d2a' }
    ]
  },
  'raven-guard': {
    status: 'loyalist',
    primary: '#141414', secondary: '#0a0a0a', trim: '#e6e6e6',
    emblemPaths: [
      { d: 'M110,80 C90,80 40,95 30,130 C55,120 75,120 90,128 C70,140 55,158 50,178 C75,165 95,150 110,150 C125,150 145,165 170,178 C165,158 150,140 130,128 C145,120 165,120 190,130 C180,95 130,80 110,80 Z', fill: '#e6e6e6' }
    ]
  }
};

function generateAll() {
  const outDir = path.join(__dirname, '..');
  for (const [slug, v] of Object.entries(LEGION_VISUALS)) {
    if (slug === 'iron-hands') {
      v.emblemPaths[0].d = cogPath(110, 110, 92, 78, 12);
    }
    const ring = v.status === 'loyalist' ? '#c9a227' : '#8a1f2b';
    fs.writeFileSync(path.join(outDir, 'assets', 'emblems', `${slug}.svg`), buildEmblemSvg({ paths: v.emblemPaths, ring }));
    fs.writeFileSync(path.join(outDir, 'assets', 'marines', `${slug}.svg`), buildMarineSvg(v));
    console.log(`wrote ${slug}`);
  }
}

generateAll();

module.exports = { buildEmblemSvg, buildMarineSvg, cogPath, starPath, polar, LEGION_VISUALS };
