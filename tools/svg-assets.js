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

const SHIELD_D = 'M30,42 Q30,18 54,18 L166,18 Q190,18 190,42 L190,108 Q190,168 110,202 Q30,168 30,108 Z';

let emblemClipCounter = 0;

function buildEmblemSvg({ paths, ring }) {
  emblemClipCounter += 1;
  const clipId = `shieldClip${emblemClipCounter}`;
  const markup = paths.map(p =>
    `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${p.strokeWidth || 0}" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
  <defs><clipPath id="${clipId}"><path d="${SHIELD_D}"/></clipPath></defs>
  <path d="${SHIELD_D}" fill="#12141a" stroke="${ring}" stroke-width="6"/>
  <path d="${SHIELD_D}" fill="none" stroke="${ring}" stroke-width="1.5" opacity="0.5" transform="translate(110,110) scale(0.9) translate(-110,-110)"/>
  <g clip-path="url(#${clipId})">${markup}</g>
</svg>`;
}

function buildMarineSvg({ primary, secondary, trim, emblemPaths, helmet }) {
  const helmetColor = helmet || secondary;
  const emblemMarkup = emblemPaths.map(p =>
    `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${(p.strokeWidth || 0) * 0.42}" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
  <rect x="112" y="160" width="76" height="30" fill="${secondary}"/>
  <path d="M108,150 L96,175 L104,178 L114,158 Z" fill="${secondary}"/>
  <path d="M192,150 L204,175 L196,178 Z" fill="${secondary}"/>
  <polygon points="118,296 126,392 138,398 143,310 157,310 162,398 174,392 182,296" fill="${primary}"/>
  <rect x="112" y="380" width="30" height="16" fill="${trim}"/>
  <rect x="158" y="380" width="30" height="16" fill="${trim}"/>
  <rect x="113" y="274" width="74" height="28" fill="${secondary}"/>
  <rect x="128" y="278" width="44" height="8" fill="${trim}" opacity="0.7"/>
  <path d="M108,172 L98,282 L202,282 L192,172 Z" fill="${primary}"/>
  <path d="M138,205 L150,195 L162,205 L156,225 L144,225 Z" fill="${trim}" opacity="0.85"/>
  <polygon points="116,148 104,182 124,174" fill="${trim}"/>
  <polygon points="184,148 196,182 176,174" fill="${trim}"/>
  <ellipse cx="53" cy="193" rx="39" ry="35" fill="${secondary}" stroke="${trim}" stroke-width="3.5"/>
  <g transform="translate(20,159) scale(0.32)">${emblemMarkup}</g>
  <ellipse cx="247" cy="193" rx="39" ry="35" fill="${primary}" stroke="${trim}" stroke-width="3.5"/>
  <rect x="86" y="183" width="27" height="98" rx="11" fill="${primary}"/>
  <rect x="187" y="183" width="27" height="98" rx="11" fill="${primary}"/>
  <rect x="86" y="255" width="27" height="10" fill="${secondary}"/>
  <rect x="187" y="255" width="27" height="10" fill="${secondary}"/>
  <ellipse cx="150" cy="108" rx="53" ry="59" fill="${helmetColor}"/>
  <path d="M114,100 h30 v16 h-30 z M156,100 h30 v16 h-30 z M141,113 v22 h18 v-22 z" fill="${trim}"/>
  <circle cx="129" cy="108" r="4" fill="#ff8a3d" opacity="0.9"/>
  <circle cx="171" cy="108" r="4" fill="#ff8a3d" opacity="0.9"/>
  <line x1="196" y1="85" x2="214" y2="55" stroke="${trim}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="216" cy="52" r="4" fill="${trim}"/>
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
      { d: 'M70,120 h80 v55 a40,40 0 0 1 -80,0 Z', fill: '#e0b400' },
      { d: 'M78,110 h16 v25 h-16 z M100,102 h16 v33 h-16 z M122,102 h16 v33 h-16 z M144,110 h14 v25 h-14 z', fill: '#e0b400' },
      { d: 'M60,140 L78,130 L78,165 L60,168 Z', fill: '#e0b400' }
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
  },
  'emperors-children': {
    status: 'traitor',
    primary: '#4a1a5c', secondary: '#2a0e38', trim: '#c9a227',
    emblemPaths: [
      { d: 'M70,165 C50,140 50,90 78,62', stroke: '#c9a227', strokeWidth: 10 },
      { d: 'M150,165 C170,140 170,90 142,62', stroke: '#c9a227', strokeWidth: 10 },
      { d: 'M58,150 L70,165 L52,168 Z M62,120 L74,130 L58,136 Z M68,95 L80,102 L66,110 Z', fill: '#c9a227' },
      { d: 'M162,150 L150,165 L168,168 Z M158,120 L146,130 L162,136 Z M152,95 L140,102 L154,110 Z', fill: '#c9a227' },
      { d: 'M110,50 a13,13 0 1 0 0.1,0 Z', fill: '#c9a227' }
    ]
  },
  'iron-warriors': {
    status: 'traitor',
    primary: '#5a5a5a', secondary: '#2e2e2e', trim: '#b8860b',
    emblemPaths: [
      { d: 'M78,95 h64 v90 h-64 z', fill: '#b8860b' },
      { d: 'M78,80 h12 v18 h-12 z M100,80 h12 v18 h-12 z M122,80 h12 v18 h-12 z M144,132 h-12 v-18 h12 z', fill: '#b8860b' },
      { d: 'M104,120 h12 v30 h-12 z', fill: '#2e2e2e' }
    ]
  },
  'night-lords': {
    status: 'traitor',
    primary: '#0d1a33', secondary: '#050a14', trim: '#b8c0cc',
    emblemPaths: [
      { d: 'M110,58 a44,50 0 1 0 0.1,0 Z', fill: '#b8c0cc' },
      { d: 'M92,102 a8,8 0 1 0 0.1,0 Z', fill: '#050a14' },
      { d: 'M128,102 a8,8 0 1 0 0.1,0 Z', fill: '#050a14' },
      { d: 'M70,128 L150,128 L140,158 L128,132 L118,158 L108,132 L98,158 L88,132 Z', fill: '#b8c0cc' },
      { d: 'M70,55 L112,108 L92,118 L155,178', stroke: '#0d1a33', strokeWidth: 13 }
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
  },
  'death-guard': {
    status: 'traitor',
    primary: '#5a6b3a', secondary: '#3a4526', trim: '#c9b98a',
    emblemPaths: [
      { d: 'M110,110 a40,40 0 1 0 0.1,0 Z', fill: '#c9b98a' },
      { d: 'M96,102 a7,7 0 1 0 0.1,0 Z', fill: '#3a4526' },
      { d: 'M124,102 a7,7 0 1 0 0.1,0 Z', fill: '#3a4526' },
      { d: 'M110,118 L102,132 L118,132 Z', fill: '#3a4526' },
      { d: 'M70,90 C40,70 30,110 60,130 C50,105 60,95 70,90 Z', fill: '#5a6b3a' },
      { d: 'M150,90 C180,70 190,110 160,130 C170,105 160,95 150,90 Z', fill: '#5a6b3a' }
    ]
  },
  'thousand-sons': {
    status: 'traitor',
    primary: '#1c3a6b', secondary: '#0f1f3d', trim: '#d9a916',
    emblemPaths: [
      { d: 'REPLACE_STAR_10', fill: '#d9a916' },
      { d: 'M110,110 a26,17 0 1 0 0.1,0 Z', fill: '#0f1f3d' },
      { d: 'M110,110 a7,7 0 1 0 0.1,0 Z', fill: '#d9a916' }
    ]
  },
  'black-legion': {
    status: 'traitor',
    primary: '#0d0d0d', secondary: '#1a1a1a', trim: '#9aa5b0',
    emblemPaths: [
      { d: 'REPLACE_STAR_8', fill: '#9aa5b0' },
      { d: 'M95,10 L125,10 L110,55 Z', fill: '#12141a' }
    ]
  },
  'word-bearers': {
    status: 'traitor',
    primary: '#5c1010', secondary: '#2e0808', trim: '#a8791f',
    emblemPaths: [
      { d: 'REPLACE_STAR_7', fill: '#a8791f' },
      { d: 'M75,165 L110,155 L110,182 L75,192 Z', fill: '#a8791f' },
      { d: 'M145,165 L110,155 L110,182 L145,192 Z', fill: '#8a651a' }
    ]
  },
  'alpha-legion': {
    status: 'traitor',
    primary: '#0f4d3d', secondary: '#082e24', trim: '#8ac9a0',
    emblemPaths: [
      { d: 'M50,160 C90,120 40,90 80,50', stroke: '#8ac9a0', strokeWidth: 10 },
      { d: 'M170,160 C130,120 180,90 140,50', stroke: '#8ac9a0', strokeWidth: 10 },
      { d: 'M68,45 L90,45 L79,62 Z', fill: '#8ac9a0' },
      { d: 'M152,45 L130,45 L141,62 Z', fill: '#8ac9a0' }
    ]
  }
};

function generateAll() {
  const outDir = path.join(__dirname, '..');
  for (const [slug, v] of Object.entries(LEGION_VISUALS)) {
    if (slug === 'iron-hands') {
      v.emblemPaths[0].d = cogPath(110, 110, 92, 78, 12);
    }
    if (slug === 'thousand-sons') {
      v.emblemPaths[0].d = starPath(110, 110, 95, 55, 10);
    }
    if (slug === 'black-legion') {
      v.emblemPaths[0].d = starPath(110, 110, 95, 42, 8);
    }
    if (slug === 'word-bearers') {
      v.emblemPaths[0].d = starPath(110, 95, 80, 38, 7);
    }
    const ring = v.status === 'loyalist' ? '#c9a227' : '#8a1f2b';
    fs.writeFileSync(path.join(outDir, 'assets', 'emblems', `${slug}.svg`), buildEmblemSvg({ paths: v.emblemPaths, ring }));
    fs.writeFileSync(path.join(outDir, 'assets', 'marines', `${slug}.svg`), buildMarineSvg(v));
    console.log(`wrote ${slug}`);
  }
}

generateAll();

module.exports = { buildEmblemSvg, buildMarineSvg, cogPath, starPath, polar, LEGION_VISUALS };
