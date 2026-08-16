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

function buildMarineSvg({ primary, secondary, trim, emblemPaths, helmet, kneeColor, beltColor, extraElements }) {
  const helmetColor = helmet || secondary;
  const kneeFill = kneeColor || trim;
  const beltFill = beltColor || secondary;
  const emblemMarkup = emblemPaths.map(p =>
    `<path d="${p.d}" fill="${p.fill || 'none'}" stroke="${p.stroke || 'none'}" stroke-width="${(p.strokeWidth || 0) * 0.36}" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  const extras = extraElements || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
  <!-- Power pack -->
  <rect x="122" y="80" width="56" height="90" rx="4" fill="${secondary}"/>
  <rect x="126" y="84" width="48" height="10" rx="2" fill="${trim}" opacity="0.3"/>
  <rect x="126" y="118" width="48" height="10" rx="2" fill="${trim}" opacity="0.3"/>
  <circle cx="138" cy="75" r="7" fill="${secondary}" stroke="${trim}" stroke-width="1.5"/>
  <circle cx="162" cy="75" r="7" fill="${secondary}" stroke="${trim}" stroke-width="1.5"/>
  <line x1="134" y1="98" x2="134" y2="114" stroke="${trim}" stroke-width="1.5" opacity="0.25"/>
  <line x1="150" y1="98" x2="150" y2="114" stroke="${trim}" stroke-width="1.5" opacity="0.25"/>
  <line x1="166" y1="98" x2="166" y2="114" stroke="${trim}" stroke-width="1.5" opacity="0.25"/>

  <!-- Gorget -->
  <rect x="126" y="148" width="48" height="22" rx="4" fill="${secondary}"/>

  <!-- Legs -->
  <path d="M118,298 L126,384 L142,396 L144,312 Z" fill="${primary}"/>
  <path d="M182,298 L174,384 L158,396 L156,312 Z" fill="${primary}"/>
  <path d="M126,320 L142,320" stroke="${trim}" stroke-width="1" opacity="0.2"/>
  <path d="M158,320 L174,320" stroke="${trim}" stroke-width="1" opacity="0.2"/>
  <path d="M126,350 L140,350" stroke="${trim}" stroke-width="1" opacity="0.2"/>
  <path d="M160,350 L174,350" stroke="${trim}" stroke-width="1" opacity="0.2"/>

  <!-- Knee pads -->
  <ellipse cx="134" cy="336" rx="11" ry="9" fill="${kneeFill}" opacity="0.75"/>
  <ellipse cx="166" cy="336" rx="11" ry="9" fill="${kneeFill}" opacity="0.75"/>

  <!-- Boots -->
  <path d="M120,382 L144,382 L144,400 L118,400 Z" fill="${trim}"/>
  <path d="M156,382 L180,382 L182,400 L156,400 Z" fill="${trim}"/>

  <!-- Belt / waist -->
  <rect x="110" y="274" width="80" height="26" fill="${beltFill}"/>
  <rect x="128" y="278" width="44" height="8" fill="${trim}" opacity="0.45"/>
  <path d="M143,286 a7,7 0 1 0 14,0 a7,7 0 1 0 -14,0 Z" fill="${trim}" opacity="0.6"/>

  <!-- Torso -->
  <path d="M106,168 L96,278 L204,278 L194,168 Z" fill="${primary}"/>

  <!-- Chest aquila -->
  <path d="M116,212 L128,202 L138,207 L150,194 L162,207 L172,202 L184,212 L172,216 L162,210 L150,222 L138,210 L128,216 Z" fill="${trim}" opacity="0.7"/>

  <!-- Abdomen ribbing -->
  <line x1="104" y1="236" x2="196" y2="236" stroke="${trim}" stroke-width="0.8" opacity="0.18"/>
  <line x1="102" y1="248" x2="198" y2="248" stroke="${trim}" stroke-width="0.8" opacity="0.18"/>
  <line x1="100" y1="260" x2="200" y2="260" stroke="${trim}" stroke-width="0.8" opacity="0.18"/>

  <!-- Pauldron trim arcs -->
  <path d="M16,192 Q58,220 100,192" fill="none" stroke="${trim}" stroke-width="2.5" opacity="0.4"/>
  <path d="M200,192 Q242,220 284,192" fill="none" stroke="${trim}" stroke-width="2.5" opacity="0.4"/>

  <!-- Left shoulder pad (emblem) -->
  <ellipse cx="58" cy="190" rx="42" ry="36" fill="${secondary}" stroke="${trim}" stroke-width="4"/>
  <g transform="translate(20,155) scale(0.35)">${emblemMarkup}</g>

  <!-- Right shoulder pad -->
  <ellipse cx="242" cy="190" rx="42" ry="36" fill="${primary}" stroke="${trim}" stroke-width="4"/>

  <!-- Left arm -->
  <rect x="84" y="192" width="28" height="86" rx="12" fill="${primary}"/>
  <rect x="86" y="250" width="24" height="10" fill="${secondary}"/>
  <rect x="86" y="268" width="24" height="18" rx="4" fill="${primary}"/>

  <!-- Right arm -->
  <rect x="188" y="192" width="28" height="86" rx="12" fill="${primary}"/>
  <rect x="190" y="250" width="24" height="10" fill="${secondary}"/>
  <rect x="190" y="268" width="24" height="18" rx="4" fill="${primary}"/>

  <!-- Bolter -->
  <rect x="218" y="260" width="48" height="14" rx="3" fill="#2a2a2a"/>
  <rect x="220" y="256" width="10" height="22" rx="2" fill="#333"/>
  <rect x="260" y="262" width="12" height="8" rx="1" fill="#1a1a1a"/>

  <!-- Helmet -->
  <path d="M112,100 Q112,46 150,40 Q188,46 188,100 Q188,134 150,140 Q112,134 112,100 Z" fill="${helmetColor}"/>

  <!-- Faceplate -->
  <path d="M122,84 L178,84 L182,96 L182,112 L172,118 L128,118 L118,112 L118,96 Z" fill="${trim}" opacity="0.22"/>

  <!-- T-visor -->
  <rect x="120" y="88" width="24" height="13" fill="${trim}"/>
  <rect x="156" y="88" width="24" height="13" fill="${trim}"/>
  <rect x="141" y="97" width="18" height="20" fill="${trim}"/>

  <!-- Eye lenses -->
  <circle cx="132" cy="95" r="5.5" fill="#ff8a3d" opacity="0.95"/>
  <circle cx="168" cy="95" r="5.5" fill="#ff8a3d" opacity="0.95"/>
  <circle cx="130" cy="93" r="2" fill="#ffd090" opacity="0.7"/>
  <circle cx="166" cy="93" r="2" fill="#ffd090" opacity="0.7"/>

  <!-- Breathing grille -->
  <rect x="136" y="118" width="28" height="14" rx="2" fill="${trim}" opacity="0.22"/>
  <line x1="142" y1="120" x2="142" y2="130" stroke="${helmetColor}" stroke-width="2.5" opacity="0.5"/>
  <line x1="150" y1="120" x2="150" y2="130" stroke="${helmetColor}" stroke-width="2.5" opacity="0.5"/>
  <line x1="158" y1="120" x2="158" y2="130" stroke="${helmetColor}" stroke-width="2.5" opacity="0.5"/>

  <!-- Antenna -->
  <line x1="185" y1="76" x2="210" y2="48" stroke="${trim}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="212" cy="46" r="4" fill="${trim}"/>

  ${extras}
</svg>`;
}

// =============================================================================
//  LEGION VISUALS — canonical emblem designs matched to reference
// =============================================================================

const LEGION_VISUALS = {

  // ---- I — DARK ANGELS: Winged Sword ----
  'dark-angels': {
    status: 'loyalist',
    primary: '#2a5c38', secondary: '#0a1a0e', trim: '#c0c0c0', helmet: '#2a5c38',
    emblemPaths: [
      { d: 'M75,102 L55,62 L62,68 L48,42 L58,52 L46,28 L60,45 L70,68 L75,88 Z', fill: '#e8e8e8' },
      { d: 'M145,102 L165,62 L158,68 L172,42 L162,52 L174,28 L160,45 L150,68 L145,88 Z', fill: '#e8e8e8' },
      { d: 'M78,100 L62,72 L68,78 L55,55 L65,65 L72,80 L78,92 Z', fill: '#c8c8c8' },
      { d: 'M142,100 L158,72 L152,78 L165,55 L155,65 L148,80 L142,92 Z', fill: '#c8c8c8' },
      { d: 'M110,26 L118,98 L110,178 L102,98 Z', fill: '#e8e8e8' },
      { d: 'M110,30 L115,96 L110,174 Z', fill: '#f5f5f5' },
      { d: 'M72,96 L148,96 L145,104 L75,104 Z', fill: '#b0b0b0' },
      { d: 'M105,160 L115,160 L112,175 L108,175 Z', fill: '#a0a0a0' }
    ]
  },

  // ---- V — WHITE SCARS: Lightning Bolt ----
  'white-scars': {
    status: 'loyalist',
    primary: '#e8e8e8', secondary: '#c41818', trim: '#c9a227', helmet: '#e0e0e0',
    emblemPaths: [
      { d: 'M78,26 L118,82 L96,82 L142,178 L108,178 L88,112 L110,112 Z', fill: '#c41818' },
      { d: 'M84,38 L114,78 L98,78 L136,170 L112,170 L96,110 L110,110 Z', fill: '#e02020' },
      { d: 'M48,92 L172,108', stroke: '#c41818', strokeWidth: 5 }
    ]
  },

  // ---- VI — SPACE WOLVES: Wolf Head (profile, facing left) ----
  'space-wolves': {
    status: 'loyalist',
    primary: '#5a6d7a', secondary: '#2a3844', trim: '#d4af37', helmet: '#5a6d7a',
    emblemPaths: [
      { d: 'M145,72 C148,52 140,38 125,30 C112,24 96,28 82,40 C68,52 58,72 56,95 C55,112 60,125 72,135 L82,155 L95,140 C118,148 135,142 148,128 C155,118 155,100 152,85 Z', fill: '#d4af37' },
      { d: 'M90,38 L68,12 L80,42 Z', fill: '#d4af37' },
      { d: 'M92,40 L74,18 L82,44 Z', fill: '#a89028' },
      { d: 'M102,60 L118,54 L116,68 L100,72 Z', fill: '#2a3844' },
      { d: 'M106,62 a3,3 0 1 0 6,0 a3,3 0 1 0 -6,0 Z', fill: '#f0a030' },
      { d: 'M56,102 L40,96 L38,108 L54,112 Z', fill: '#c8a830' },
      { d: 'M40,100 L48,96 L46,106 Z', fill: '#2a3844' },
      { d: 'M56,115 L42,112 L38,118 L44,128 L50,120 L56,130 L62,122 L70,135 L78,128 Q65,132 56,115 Z', fill: '#e8e0c0' },
      { d: 'M130,38 C138,42 145,52 148,65', stroke: '#c8a830', strokeWidth: 2 }
    ]
  },

  // ---- VII — IMPERIAL FISTS: Armored Gauntlet ----
  'imperial-fists': {
    status: 'loyalist',
    primary: '#f0c800', secondary: '#1a1a1a', trim: '#8a1f1f', helmet: '#e0b800',
    kneeColor: '#8a1f1f',
    emblemPaths: [
      { d: 'M72,118 L52,102 Q46,96 52,86 L68,74 L82,82 L72,100 Z', fill: '#1a1a1a' },
      { d: 'M72,155 L72,90 L82,72 L92,60 L128,60 L138,72 L148,90 L148,155 Q148,172 130,172 L90,172 Q72,172 72,155 Z', fill: '#1a1a1a' },
      { d: 'M82,72 L88,52 Q92,44 98,52 L98,72 Z', fill: '#0a0a0a' },
      { d: 'M98,72 L102,48 Q106,40 112,48 L112,72 Z', fill: '#0a0a0a' },
      { d: 'M112,72 L118,48 Q122,40 128,48 L128,72 Z', fill: '#0a0a0a' },
      { d: 'M128,72 L132,52 Q136,44 140,52 L138,72 Z', fill: '#0a0a0a' },
      { d: 'M78,72 L142,72', stroke: '#3a3a3a', strokeWidth: 3 },
      { d: 'M76,105 L144,105 M76,135 L144,135', stroke: '#3a3a3a', strokeWidth: 2 },
      { d: 'M78,155 L142,155 L146,168 L74,168 Z', fill: '#0a0a0a' }
    ]
  },

  // ---- IX — BLOOD ANGELS: Winged Blood Drop ----
  'blood-angels': {
    status: 'loyalist',
    primary: '#cc0000', secondary: '#1a0000', trim: '#c9a227', helmet: '#cc0000',
    emblemPaths: [
      { d: 'M85,105 L60,62 L55,72 L42,48 L50,62 L35,45 L52,68 L58,78 L68,90 Z', fill: '#e8e8e8' },
      { d: 'M135,105 L160,62 L165,72 L178,48 L170,62 L185,45 L168,68 L162,78 L152,90 Z', fill: '#e8e8e8' },
      { d: 'M88,100 L68,72 L72,80 L58,60 L68,72 L78,88 Z', fill: '#c8c8c8' },
      { d: 'M132,100 L152,72 L148,80 L162,60 L152,72 L142,88 Z', fill: '#c8c8c8' },
      { d: 'M110,42 C122,68 138,95 138,115 C138,135 126,155 110,158 C94,155 82,135 82,115 C82,95 98,68 110,42 Z', fill: '#cc0000' },
      { d: 'M110,48 C104,68 94,90 94,112 C94,130 100,142 110,148 Z', fill: '#e82020' },
      { d: 'M110,55 C116,72 125,92 125,110 C125,125 120,138 110,142 C100,138 95,125 95,110 C95,92 104,72 110,55 Z', fill: '#0a0000' }
    ]
  },

  // ---- X — IRON HANDS: Cog Gear + Iron Fist ----
  'iron-hands': {
    status: 'loyalist',
    primary: '#0a0a0a', secondary: '#2a2a2a', trim: '#b8bfc7', helmet: '#0a0a0a',
    emblemPaths: [
      { d: 'REPLACE_COG', fill: 'none', stroke: '#e0e0e0', strokeWidth: 8 },
      { d: 'M78,148 L78,95 L85,78 L95,65 L125,65 L135,78 L142,95 L142,148 Q142,162 110,162 Q78,162 78,148 Z', fill: '#e0e0e0' },
      { d: 'M88,78 L92,58 Q96,50 102,58 L102,78 Z', fill: '#b0b8c0' },
      { d: 'M102,78 L106,54 Q110,46 114,54 L118,78 Z', fill: '#b0b8c0' },
      { d: 'M118,78 L122,58 Q126,50 132,58 L132,78 Z', fill: '#b0b8c0' },
      { d: 'M78,115 L62,100 Q56,94 62,84 L75,74 L85,80 L78,98 Z', fill: '#e0e0e0' },
      { d: 'M84,78 L136,78', stroke: '#505860', strokeWidth: 3 },
      { d: 'M82,108 L138,108 M82,132 L138,132', stroke: '#505860', strokeWidth: 2 }
    ]
  },

  // ---- XIII — ULTRAMARINES: Bold Omega (Ω) ----
  'ultramarines': {
    status: 'loyalist',
    primary: '#003399', secondary: '#002266', trim: '#c9a227', helmet: '#003399',
    emblemPaths: [
      { d: 'M55,168 L55,148 L72,148 L72,105 C72,62 88,42 110,42 C132,42 148,62 148,105 L148,148 L165,148 L165,168 L135,168 L135,148 L130,148 L130,108 C130,74 122,56 110,56 C98,56 90,74 90,108 L90,148 L85,148 L85,168 Z', fill: '#ffffff' },
      { d: 'M65,158 L65,150 L78,150 L78,105 C78,66 92,48 110,48 C128,48 142,66 142,105 L142,150 L155,150 L155,158 L138,158 L138,148 L134,148 L134,108 C134,70 125,52 110,52 C95,52 86,70 86,108 L86,148 L82,148 L82,158 Z', fill: '#12141a' }
    ]
  },

  // ---- XVIII — SALAMANDERS: Drake Head with Flame ----
  'salamanders': {
    status: 'loyalist',
    primary: '#0a6b32', secondary: '#052a15', trim: '#c9821a', helmet: '#0a6b32',
    emblemPaths: [
      { d: 'M62,128 C58,100 72,65 105,50 L128,46 C148,46 168,58 178,78 L172,82 C164,68 150,56 132,54 C108,54 85,68 78,92 C74,105 72,118 62,128 Z', fill: '#c9821a' },
      { d: 'M62,128 C72,122 85,132 100,145 C115,148 130,140 138,125 L128,118 L112,128 L95,135 L78,132 L65,130 Z', fill: '#a06815' },
      { d: 'M138,62 a8,7 0 1 0 0.1,0 Z', fill: '#0a6b32' },
      { d: 'M138,62 a5,4 0 1 0 0.1,0 Z', fill: '#ff6020' },
      { d: 'M170,75 a4,3 0 1 0 0.1,0 Z', fill: '#052a15' },
      { d: 'M62,128 L65,122 L68,128 L72,120 L76,128 L80,118 L85,126 L90,116 L95,124 Z', fill: '#e8d8b0' },
      { d: 'M120,46 L130,25 L140,48 Z', fill: '#c9821a' },
      { d: 'M62,128 L48,110 L55,118 L40,95 L52,108 L38,82 L52,100 L58,115 Z', fill: '#ff6020' },
      { d: 'M58,122 L48,108 L54,114 L44,98 L52,106 L56,118 Z', fill: '#ffa040' }
    ]
  },

  // ---- XIX — RAVEN GUARD: Raven in Flight ----
  'raven-guard': {
    status: 'loyalist',
    primary: '#0a0a0a', secondary: '#050505', trim: '#e6e6e6', helmet: '#0a0a0a',
    emblemPaths: [
      { d: 'M110,78 C88,78 42,95 32,132 C58,120 78,120 92,130 C72,142 55,162 48,182 C72,168 92,152 110,152 C128,152 148,168 172,182 C165,162 148,142 128,130 C142,120 162,120 188,132 C178,95 132,78 110,78 Z', fill: '#e6e6e6' },
      { d: 'M110,78 C104,78 98,72 98,65 C98,58 103,52 110,50 C117,52 122,58 122,65 C122,72 116,78 110,78 Z', fill: '#e6e6e6' },
      { d: 'M106,56 L110,40 L114,56 Z', fill: '#d0d0d0' },
      { d: 'M107,62 a4,3 0 1 0 6,0 a4,3 0 1 0 -6,0 Z', fill: '#0a0a0a' },
      { d: 'M92,130 L62,100 M85,128 L55,105 M78,125 L50,110', stroke: '#c8c8c8', strokeWidth: 1.5 },
      { d: 'M128,130 L158,100 M135,128 L165,105 M142,125 L170,110', stroke: '#c8c8c8', strokeWidth: 1.5 }
    ]
  },

  // ---- III — EMPEROR'S CHILDREN: Palatine Eagle / Aquila ----
  'emperors-children': {
    status: 'traitor',
    primary: '#6b1b80', secondary: '#3a0e48', trim: '#c9a227', helmet: '#6b1b80',
    emblemPaths: [
      { d: 'M110,72 L125,98 L110,112 L95,98 Z', fill: '#c9a227' },
      { d: 'M106,58 L114,58 L113,70 L107,70 Z', fill: '#c9a227' },
      { d: 'M108,50 L112,50 L110,58 Z', fill: '#e8d070' },
      { d: 'M95,92 L62,58 L56,68 L42,48 L48,62 L34,50 L50,72 L62,82 L78,90 Z', fill: '#c9a227' },
      { d: 'M125,92 L158,58 L164,68 L178,48 L172,62 L186,50 L170,72 L158,82 L142,90 Z', fill: '#c9a227' },
      { d: 'M95,92 L70,68 L75,75 L58,58 L68,70 L80,85 Z', fill: '#a88020' },
      { d: 'M125,92 L150,68 L145,75 L162,58 L152,70 L140,85 Z', fill: '#a88020' },
      { d: 'M104,112 L110,148 L116,112 Z', fill: '#c9a227' },
      { d: 'M58,138 C48,118 55,92 70,78 C60,95 54,115 58,138 Z', fill: '#a88020' },
      { d: 'M52,155 C42,132 50,108 62,92 C55,112 48,135 52,155 Z', fill: '#a88020' },
      { d: 'M162,138 C172,118 165,92 150,78 C160,95 166,115 162,138 Z', fill: '#a88020' },
      { d: 'M168,155 C178,132 170,108 158,92 C165,112 172,135 168,155 Z', fill: '#a88020' }
    ]
  },

  // ---- IV — IRON WARRIORS: Iron Skull with hazard stripes ----
  'iron-warriors': {
    status: 'traitor',
    primary: '#5a5f68', secondary: '#2a2e34', trim: '#c9a227', helmet: '#5a5f68',
    emblemPaths: [
      // Iron skull
      { d: 'M110,40 C85,40 68,58 68,80 C68,98 78,112 92,118 L95,135 L125,135 L128,118 C142,112 152,98 152,80 C152,58 135,40 110,40 Z', fill: '#c0c0c0' },
      { d: 'M86,75 L100,68 L103,82 L89,88 Z', fill: '#2a2e34' },
      { d: 'M134,75 L120,68 L117,82 L131,88 Z', fill: '#2a2e34' },
      { d: 'M104,95 L116,95 L110,106 Z', fill: '#2a2e34' },
      { d: 'M90,115 L92,120 L98,112 L104,122 L110,112 L116,122 L122,112 L128,120 L130,115 L128,135 L92,135 Z', fill: '#d8d8d8' },
      // Hazard stripes below
      { d: 'M55,150 L165,150 L165,180 L55,180 Z', fill: '#f0c800' },
      { d: 'M55,150 L70,150 L55,180 Z M70,150 L85,150 L70,180 L55,180 Z M85,150 L100,150 L85,180 L70,180 Z M100,150 L115,150 L100,180 L85,180 Z M115,150 L130,150 L115,180 L100,180 Z M130,150 L145,150 L130,180 L115,180 Z M145,150 L160,150 L145,180 L130,180 Z M160,150 L165,150 L165,180 L145,180 Z', fill: '#1a1a1a' }
    ]
  },

  // ---- VIII — NIGHT LORDS: Bat-winged Skull ----
  'night-lords': {
    status: 'traitor',
    primary: '#0a1530', secondary: '#050a18', trim: '#b0b8c8', helmet: '#0a1530',
    emblemPaths: [
      { d: 'M110,55 C88,55 72,72 72,95 C72,112 82,128 95,132 L98,148 L122,148 L125,132 C138,128 148,112 148,95 C148,72 132,55 110,55 Z', fill: '#b8c0cc' },
      { d: 'M88,88 L100,82 L104,95 L92,100 Z', fill: '#050a18' },
      { d: 'M132,88 L120,82 L116,95 L128,100 Z', fill: '#050a18' },
      { d: 'M105,105 L115,105 L110,115 Z', fill: '#050a18' },
      { d: 'M92,128 L95,132 L100,126 L105,134 L110,126 L115,134 L120,126 L125,132 L128,128 L125,142 L95,142 Z', fill: '#d8dce2' },
      { d: 'M72,90 L52,55 L58,68 L42,38 L52,58 L35,32 L48,55 L55,72 L68,82 Z', fill: '#b8c0cc' },
      { d: 'M148,90 L168,55 L162,68 L178,38 L168,58 L185,32 L172,55 L165,72 L152,82 Z', fill: '#b8c0cc' },
      { d: 'M68,25 L82,62 L75,62 L92,105', stroke: '#4060b0', strokeWidth: 5 }
    ]
  },

  // ---- XII — WORLD EATERS: Teeth / Jaws in Circle ----
  'world-eaters': {
    status: 'traitor',
    primary: '#b81818', secondary: '#3a0a0a', trim: '#c8a848', helmet: '#e8e8e8',
    kneeColor: '#c8a848',
    emblemPaths: [
      // Outer circle
      { d: 'M110,100 m-55,0 a55,55 0 1,0 110,0 a55,55 0 1,0 -110,0 Z', fill: 'none', stroke: '#e8e8e8', strokeWidth: 8 },
      // Inner circle (planet)
      { d: 'M110,100 m-38,0 a38,38 0 1,0 76,0 a38,38 0 1,0 -76,0 Z', fill: '#e8e8e8' },
      // Upper teeth (biting into the circle from top)
      { d: 'M78,68 L82,82 L88,68 L92,84 L98,70 L104,86 L110,68 L116,86 L122,70 L128,84 L132,68 L138,82 L142,68', fill: 'none', stroke: '#b81818', strokeWidth: 4 },
      // Lower teeth
      { d: 'M78,132 L82,118 L88,132 L92,116 L98,130 L104,114 L110,132 L116,114 L122,130 L128,116 L132,132 L138,118 L142,132', fill: 'none', stroke: '#b81818', strokeWidth: 4 },
      // Central dark area (mouth)
      { d: 'M75,90 L145,90 L145,110 L75,110 Z', fill: '#3a0a0a' },
      // Red eye dots
      { d: 'M95,100 a4,4 0 1 0 0.1,0 Z', fill: '#ff2020' },
      { d: 'M125,100 a4,4 0 1 0 0.1,0 Z', fill: '#ff2020' }
    ]
  },

  // ---- XIV — DEATH GUARD: Nurgle Mark (three circles + fly) ----
  'death-guard': {
    status: 'traitor',
    primary: '#727a52', secondary: '#4a5232', trim: '#c9b98a', helmet: '#727a52',
    emblemPaths: [
      { d: 'M110,60 m-26,0 a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0 Z', fill: '#c9b98a' },
      { d: 'M78,128 m-26,0 a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0 Z', fill: '#c9b98a' },
      { d: 'M142,128 m-26,0 a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0 Z', fill: '#c9b98a' },
      { d: 'M110,60 L78,128 L142,128 Z', fill: 'none', stroke: '#c9b98a', strokeWidth: 8 },
      { d: 'M110,60 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0 Z', fill: '#4a5232' },
      { d: 'M78,128 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0 Z', fill: '#4a5232' },
      { d: 'M142,128 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0 Z', fill: '#4a5232' },
      { d: 'M85,52 C68,35 52,38 48,52 C55,42 65,40 78,50 Z', fill: '#5a6b3a' },
      { d: 'M135,52 C152,35 168,38 172,52 C165,42 155,40 142,50 Z', fill: '#5a6b3a' }
    ]
  },

  // ---- XV — THOUSAND SONS: Eye of Magnus in Star (RED armor) ----
  'thousand-sons': {
    status: 'traitor',
    primary: '#c23028', secondary: '#8a1818', trim: '#d4af37', helmet: '#c23028',
    emblemPaths: [
      { d: 'REPLACE_STAR_9', fill: '#d4af37' },
      { d: 'M55,100 Q110,52 165,100 Q110,148 55,100 Z', fill: '#8a1818' },
      { d: 'M110,100 m-24,0 a24,20 0 1,0 48,0 a24,20 0 1,0 -48,0 Z', fill: '#d4af37' },
      { d: 'M110,100 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 Z', fill: '#0a0a18' },
      { d: 'M105,95 a3,3 0 1 0 6,0 a3,3 0 1 0 -6,0 Z', fill: '#d4af37' }
    ]
  },

  // ---- XVI — BLACK LEGION: Eye of Horus in Chaos Star ----
  'black-legion': {
    status: 'traitor',
    primary: '#0a0a0a', secondary: '#1a1a1a', trim: '#c9a227', helmet: '#0a0a0a',
    emblemPaths: [
      { d: 'REPLACE_STAR_8', fill: '#c9a227' },
      { d: 'M62,95 Q110,55 158,95 Q110,130 62,95 Z', fill: '#0a0a0a' },
      { d: 'M65,95 Q110,60 155,95 Q110,125 65,95 Z', fill: 'none', stroke: '#c9a227', strokeWidth: 3 },
      { d: 'M110,95 m-16,0 a16,14 0 1,0 32,0 a16,14 0 1,0 -32,0 Z', fill: '#c9a227' },
      { d: 'M110,95 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0 Z', fill: '#0a0a0a' },
      { d: 'M110,120 L105,148 L110,162 L115,148 Z', fill: '#c9a227' }
    ]
  },

  // ---- XVII — WORD BEARERS: Burning Book / Flaming Tome ----
  'word-bearers': {
    status: 'traitor',
    primary: '#6a1515', secondary: '#3a0808', trim: '#b0b0b0', helmet: '#6a1515',
    emblemPaths: [
      { d: 'M50,100 L108,92 L108,175 L50,182 Z', fill: '#b0b0b0' },
      { d: 'M170,100 L112,92 L112,175 L170,182 Z', fill: '#909090' },
      { d: 'M108,92 L112,92 L112,175 L108,175 Z', fill: '#787878' },
      { d: 'M58,108 L102,102 M58,118 L102,112 M58,128 L102,122 M58,138 L102,132 M58,148 L100,142 M58,158 L98,152', stroke: '#787878', strokeWidth: 1.5 },
      { d: 'M118,102 L162,108 M118,112 L162,118 M118,122 L162,128 M118,132 L162,138 M118,142 L160,148 M118,152 L158,158', stroke: '#787878', strokeWidth: 1.5 },
      { d: 'M65,100 Q72,60 82,65 Q88,35 98,58 Q102,22 110,52 Q118,22 122,58 Q132,35 138,65 Q148,60 155,100 L140,92 L130,88 L120,90 L110,86 L100,90 L90,88 L80,92 Z', fill: '#c03010' },
      { d: 'M75,95 Q80,62 90,68 Q96,42 105,60 Q108,32 112,60 Q118,42 125,68 Q135,62 140,95 L130,90 L120,88 L110,85 L100,88 L90,90 Z', fill: '#e06020' },
      { d: 'M85,88 Q92,52 100,62 Q105,38 110,55 Q115,38 120,62 Q128,52 135,88', stroke: '#ffa040', strokeWidth: 2 }
    ]
  },

  // ---- XX — ALPHA LEGION: Three-headed Hydra ----
  'alpha-legion': {
    status: 'traitor',
    primary: '#1a5a4a', secondary: '#0a3a2e', trim: '#90c8a8', helmet: '#1a5a4a',
    emblemPaths: [
      { d: 'M92,180 Q110,162 128,180 Z', fill: '#90c8a8' },
      { d: 'M110,168 C110,135 108,105 110,62', stroke: '#90c8a8', strokeWidth: 10 },
      { d: 'M105,148 C92,128 72,100 55,68', stroke: '#90c8a8', strokeWidth: 10 },
      { d: 'M115,148 C128,128 148,100 165,68', stroke: '#90c8a8', strokeWidth: 10 },
      { d: 'M98,62 L110,30 L122,62 Z', fill: '#90c8a8' },
      { d: 'M42,72 L48,40 L65,65 Z', fill: '#90c8a8' },
      { d: 'M178,72 L172,40 L155,65 Z', fill: '#90c8a8' },
      { d: 'M106,52 a3,2 0 1 0 0.1,0 Z M114,52 a3,2 0 1 0 0.1,0 Z', fill: '#0a3a2e' },
      { d: 'M50,58 a3,2 0 1 0 0.1,0 Z M58,58 a3,2 0 1 0 0.1,0 Z', fill: '#0a3a2e' },
      { d: 'M162,58 a3,2 0 1 0 0.1,0 Z M170,58 a3,2 0 1 0 0.1,0 Z', fill: '#0a3a2e' },
      { d: 'M108,30 L106,22 M112,30 L114,22', stroke: '#60a080', strokeWidth: 1.5 },
      { d: 'M46,40 L42,32 M50,40 L52,32', stroke: '#60a080', strokeWidth: 1.5 },
      { d: 'M170,40 L168,32 M174,40 L176,32', stroke: '#60a080', strokeWidth: 1.5 }
    ]
  }
};

// =============================================================================

function generateAll() {
  const outDir = path.join(__dirname, '..');
  for (const [slug, v] of Object.entries(LEGION_VISUALS)) {
    const resolved = v.emblemPaths.map(p => {
      const copy = { ...p };
      if (copy.d === 'REPLACE_COG') copy.d = cogPath(110, 105, 88, 74, 12);
      if (copy.d === 'REPLACE_STAR_9') copy.d = starPath(110, 100, 88, 52, 9);
      if (copy.d === 'REPLACE_STAR_8') copy.d = starPath(110, 95, 90, 40, 8);
      return copy;
    });
    const ring = v.status === 'loyalist' ? '#c9a227' : '#8a1f2b';
    fs.writeFileSync(
      path.join(outDir, 'assets', 'emblems', `${slug}.svg`),
      buildEmblemSvg({ paths: resolved, ring })
    );
    fs.writeFileSync(
      path.join(outDir, 'assets', 'marines', `${slug}.svg`),
      buildMarineSvg({ ...v, emblemPaths: resolved })
    );
    console.log(`wrote ${slug}`);
  }
}

function buildHeroSvg() {
  let stars = '';
  for (let i = 0; i < 140; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * 1600;
    const y = (Math.sin(i * 78.233) * 12543.98 % 1 + 1) % 1 * 480;
    const r = (i % 5 === 0) ? 1.6 : 0.8;
    const o = 0.25 + (i % 7) * 0.08;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#ffffff" opacity="${o.toFixed(2)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 480" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="heroBg" cx="72%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1c2230"/>
      <stop offset="45%" stop-color="#12151c"/>
      <stop offset="100%" stop-color="#0b0d10"/>
    </radialGradient>
    <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff9a4d" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#ff9a4d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c9a227" stop-opacity="0"/>
      <stop offset="100%" stop-color="#c9a227" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1600" height="480" fill="url(#heroBg)"/>
  <g opacity="0.85">${stars}</g>
  <g transform="translate(980,60)">
    <ellipse cx="230" cy="330" rx="260" ry="150" fill="#0d0f14"/>
    <path d="M40,260 Q10,150 90,90 Q160,30 260,30 Q360,30 430,90 Q510,150 480,260 L470,420 L50,420 Z" fill="#141821"/>
    <path d="M430,90 Q510,150 480,260 L470,340 L455,340 L462,255 Q485,155 415,100 Z" fill="url(#rimLight)"/>
    <path d="M110,150 Q120,60 260,55 Q400,60 410,150 Q415,230 335,255 L185,255 Q105,230 110,150 Z" fill="#1b202b"/>
    <path d="M150,155 h70 v34 h-70 z M290,155 h70 v34 h-70 z M245,172 v46 h30 v-46 z" fill="#05060a"/>
    <circle cx="184" cy="172" r="30" fill="url(#lensGlow)"/>
    <circle cx="184" cy="172" r="10" fill="#ffb066"/>
    <circle cx="336" cy="172" r="30" fill="url(#lensGlow)"/>
    <circle cx="336" cy="172" r="10" fill="#ffb066"/>
    <path d="M410,150 Q415,230 335,255" fill="none" stroke="#3a4252" stroke-width="4"/>
    <path d="M60,270 Q230,340 460,270 L470,420 L50,420 Z" fill="#12151c" opacity="0.9"/>
  </g>
  <rect x="0" y="0" width="1600" height="480" fill="#000000" opacity="0.12"/>
</svg>`;
}

generateAll();
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'hero.svg'), buildHeroSvg());
console.log('wrote hero.svg');

module.exports = { buildEmblemSvg, buildMarineSvg, buildHeroSvg, cogPath, starPath, polar, LEGION_VISUALS };
