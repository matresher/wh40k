function bySlug(slug) { return LEGIONS.find(l => l.slug === slug); }
function byLocationId(id) { return LOCATIONS.find(l => l.id === id); }

const MARINE_EXT = {
  'dark-angels':'jpg','white-scars':'png','space-wolves':'jpg','imperial-fists':'jpg',
  'blood-angels':'jpg','iron-hands':'png','ultramarines':'jpg','salamanders':'png',
  'raven-guard':'jpg','emperors-children':'jpg','iron-warriors':'jpg','night-lords':'png',
  'world-eaters':'jpg','death-guard':'png','thousand-sons':'jpg','black-legion':'jpg',
  'word-bearers':'jpg','alpha-legion':'jpg'
};
function marineImg(slug) { return `assets/marines/${slug}.${MARINE_EXT[slug] || 'svg'}`; }

const EMBLEM_EXT = {
  'dark-angels':'jpg','white-scars':'jpg','space-wolves':'png','imperial-fists':'jpg',
  'blood-angels':'jpg','iron-hands':'jpg','ultramarines':'png','salamanders':'jpg',
  'raven-guard':'jpg','emperors-children':'jpg','iron-warriors':'jpg','night-lords':'jpg',
  'world-eaters':'jpg','death-guard':'jpg','thousand-sons':'jpg','black-legion':'jpg',
  'word-bearers':'jpg','alpha-legion':'jpg'
};
function emblemImg(slug) { return `assets/emblems/${slug}.${EMBLEM_EXT[slug] || 'svg'}`; }

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

const ROMAN = {I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12,XIII:13,XIV:14,XV:15,XVI:16,XVII:17,XVIII:18,XIX:19,XX:20};
function filteredLegions() {
  const f = window.__currentFilter || 'all';
  const list = f === 'all' ? [...LEGIONS] : LEGIONS.filter(l => l.status === f);
  return list.sort((a, b) => (ROMAN[a.number] || 99) - (ROMAN[b.number] || 99));
}

function renderOrdersGrid() {
  const grid = document.getElementById('ordersGrid');
  grid.innerHTML = '';
  const legions = filteredLegions();
  for (let i = 0; i < legions.length; i++) {
    const l = legions[i];
    const card = document.createElement('div');
    card.className = `order-card status-${l.status}`;
    card.style.setProperty('--i', i);
    card.innerHTML = `
      <img class="order-card-emblem" src="${emblemImg(l.slug)}" alt="Эмблема ${l.nameRu}">
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
      <img class="detail-marine" src="${marineImg(l.slug)}" alt="Космодесантник ${l.nameRu}">
      <div class="detail-header-info">
        <img class="detail-emblem" src="${emblemImg(l.slug)}" alt="Эмблема ${l.nameRu}">
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
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeLegionDetail() {
  document.getElementById('orderDetail').classList.add('hidden');
  document.getElementById('orderDetail').innerHTML = '';
  document.getElementById('ordersFilters').classList.remove('hidden');
  document.getElementById('ordersGrid').classList.remove('hidden');
}

function initMapPanZoom() {
  const svg = document.getElementById('mapSvg');
  const wrap = document.getElementById('mapWrap');

  const vb = { x: 0, y: 0, w: 1000, h: 1000 };
  const ZOOM_FACTOR = 0.15;
  const MIN_W = 150;
  const MAX_W = 2000;

  function applyVB() {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  }

  function svgPoint(clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    return {
      x: vb.x + (clientX - rect.left) / rect.width * vb.w,
      y: vb.y + (clientY - rect.top) / rect.height * vb.h
    };
  }

  function zoom(delta, cx, cy) {
    const factor = delta > 0 ? (1 + ZOOM_FACTOR) : (1 - ZOOM_FACTOR);
    const newW = Math.min(MAX_W, Math.max(MIN_W, vb.w * factor));
    const newH = Math.min(MAX_W, Math.max(MIN_W, vb.h * factor));
    const ratio = newW / vb.w;
    vb.x = cx - (cx - vb.x) * ratio;
    vb.y = cy - (cy - vb.y) * ratio;
    vb.w = newW;
    vb.h = newH;
    applyVB();
  }

  svg.addEventListener('wheel', function(e) {
    e.preventDefault();
    const pt = svgPoint(e.clientX, e.clientY);
    zoom(e.deltaY, pt.x, pt.y);
  }, { passive: false });

  let pointerDown = false, hasDragged = false;
  let dragStart = { x: 0, y: 0 }, vbStart = { x: 0, y: 0 };
  const DRAG_THRESHOLD = 4;

  svg.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    pointerDown = true;
    hasDragged = false;
    dragStart = { x: e.clientX, y: e.clientY };
    vbStart = { x: vb.x, y: vb.y };
  });

  window.addEventListener('mousemove', function(e) {
    if (!pointerDown) return;
    const mx = e.clientX - dragStart.x;
    const my = e.clientY - dragStart.y;
    if (!hasDragged && Math.hypot(mx, my) < DRAG_THRESHOLD) return;
    hasDragged = true;
    svg.classList.add('grabbing');
    const rect = svg.getBoundingClientRect();
    const dx = mx / rect.width * vb.w;
    const dy = my / rect.height * vb.h;
    vb.x = vbStart.x - dx;
    vb.y = vbStart.y - dy;
    applyVB();
  });

  window.addEventListener('mouseup', function() {
    if (!pointerDown) return;
    pointerDown = false;
    svg.classList.remove('grabbing');
    if (hasDragged) {
      svg.addEventListener('click', function suppress(e) {
        e.stopPropagation();
        svg.removeEventListener('click', suppress, true);
      }, true);
    }
    hasDragged = false;
  });

  let lastTouchDist = 0, lastTouchMid = { x: 0, y: 0 };
  svg.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.hypot(dx, dy);
      lastTouchMid = svgPoint(
        (e.touches[0].clientX + e.touches[1].clientX) / 2,
        (e.touches[0].clientY + e.touches[1].clientY) / 2
      );
    } else if (e.touches.length === 1) {
      dragging = true;
      dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      vbStart = { x: vb.x, y: vb.y };
    }
  }, { passive: false });

  svg.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const mid = svgPoint(
        (e.touches[0].clientX + e.touches[1].clientX) / 2,
        (e.touches[0].clientY + e.touches[1].clientY) / 2
      );
      if (lastTouchDist) zoom(lastTouchDist - dist, mid.x, mid.y);
      lastTouchDist = dist;
      lastTouchMid = mid;
    } else if (e.touches.length === 1 && dragging) {
      const rect = svg.getBoundingClientRect();
      const tdx = (e.touches[0].clientX - dragStart.x) / rect.width * vb.w;
      const tdy = (e.touches[0].clientY - dragStart.y) / rect.height * vb.h;
      vb.x = vbStart.x - tdx;
      vb.y = vbStart.y - tdy;
      applyVB();
    }
  }, { passive: false });

  svg.addEventListener('touchend', function() {
    dragging = false;
    lastTouchDist = 0;
  });

  document.getElementById('mapZoomIn').addEventListener('click', function() {
    zoom(-1, vb.x + vb.w / 2, vb.y + vb.h / 2);
  });
  document.getElementById('mapZoomOut').addEventListener('click', function() {
    zoom(1, vb.x + vb.w / 2, vb.y + vb.h / 2);
  });
  document.getElementById('mapZoomReset').addEventListener('click', function() {
    vb.x = 0; vb.y = 0; vb.w = 1000; vb.h = 1000;
    applyVB();
  });
}

function renderMapTab() {
  const svg = document.getElementById('mapSvg');
  svg.dataset.rendered = '1';
  svg.setAttribute('viewBox', '0 0 1000 1000');

  let stars = '';
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const r = Math.random() * 1.2 + 0.3;
    const o = Math.random() * 0.6 + 0.2;
    stars += `<circle class="map-star" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" opacity="${o.toFixed(2)}"></circle>`;
  }

  const segLabels = SEGMENTA.map(s =>
    `<text class="segmentum-label" x="${s.x}" y="${s.y}" text-anchor="middle">${s.name.toUpperCase()}</text>`
  ).join('');

  const defs = LOCATIONS.map(loc => `
    <pattern id="planet-img-${loc.id}" patternUnits="objectBoundingBox" width="1" height="1">
      <image href="assets/planets/${loc.id}.jpg" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice"></image>
    </pattern>`).join('');

  const points = LOCATIONS.map(loc => `
    <g class="map-point-group" data-id="${loc.id}">
      <circle class="map-point-halo" cx="${loc.x}" cy="${loc.y}" r="15"></circle>
      <circle class="map-point" data-id="${loc.id}" cx="${loc.x}" cy="${loc.y}" r="8" style="fill:url(#planet-img-${loc.id})"></circle>
      <text class="map-label" x="${loc.x + 12}" y="${loc.y + 4}">${loc.name}</text>
    </g>`).join('');

  svg.innerHTML = `<defs>${defs}</defs><g class="map-stars">${stars}</g><g class="map-segmenta">${segLabels}</g><g class="map-points">${points}</g>`;

  svg.querySelectorAll('.map-point').forEach(el => {
    el.addEventListener('click', () => showLocationPopup(el.dataset.id, window.__selectedMapLegion || null));
  });

  const selector = document.getElementById('mapLegionSelect');
  selector.innerHTML = '<option value="">— Все легионы —</option>' + LEGIONS.map(l => `<option value="${l.slug}">${l.nameRu}</option>`).join('');
  selector.addEventListener('change', () => selectLegionOnMap(selector.value || null));

  initMapPanZoom();
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
  svg.querySelectorAll('.map-point-group').forEach(el => {
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
      svg.insertBefore(path, svg.querySelector('.map-points'));
    }
  }
}

function showLocationPopup(locationId, slug) {
  const loc = byLocationId(locationId);
  if (!loc) return;
  const relevant = slug ? [bySlug(slug)].filter(Boolean)
    : LEGIONS.filter(l => l.homeworldLocationId === locationId || l.timeline.some(ev => ev.locationId === locationId));
  let body = `<img class="map-popup-img" src="assets/planets/${loc.id}.jpg" alt="${loc.name}"><h4>${loc.name}</h4><p class="map-popup-meta">${loc.segmentum}</p><p>${loc.blurb}</p>`;
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
  document.getElementById('mapWrap').classList.add('planet-selected');
  document.getElementById('mapPopupClose').addEventListener('click', hideLocationPopup);
}

function hideLocationPopup() {
  document.getElementById('mapPopup').classList.add('hidden');
  document.getElementById('mapWrap').classList.remove('planet-selected');
}

function initSmokeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'smokeCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.6;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function vw() { return window.innerWidth || document.documentElement.clientWidth || 1280; }
  function vh() { return window.innerHeight || document.documentElement.clientHeight || 800; }
  function resize() { W = canvas.width = vw(); H = canvas.height = vh(); }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const SPAWN_X_MIN = 0.38, SPAWN_X_MAX = 0.52;
  const SPAWN_Y_MIN = 0.42, SPAWN_Y_MAX = 0.62;

  function spawn() {
    particles.push({
      x: W * (SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN)),
      y: H * (SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN)),
      vx: (Math.random() - 0.65) * 0.6,
      vy: -(0.15 + Math.random() * 0.35),
      r: 15 + Math.random() * 30,
      life: 0,
      maxLife: 120 + Math.random() * 100,
      grow: 0.15 + Math.random() * 0.2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (particles.length < 35 && Math.random() < 0.3) spawn();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.x += p.vx + Math.sin(p.life * 0.02) * 0.3;
      p.y += p.vy;
      p.r += p.grow;
      const t = p.life / p.maxLife;
      const alpha = t < 0.15 ? t / 0.15 : t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
      if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(140,150,160,${alpha * 0.08})`);
      grad.addColorStop(0.5, `rgba(100,110,120,${alpha * 0.04})`);
      grad.addColorStop(1, 'rgba(80,90,100,0)');
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

function initEyeGlow() {
  const canvas = document.createElement('canvas');
  canvas.id = 'eyeGlowCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function vw() { return window.innerWidth || document.documentElement.clientWidth || 1280; }
  function vh() { return window.innerHeight || document.documentElement.clientHeight || 800; }
  function resize() { W = canvas.width = vw(); H = canvas.height = vh(); }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.02;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.2);
    const flicker = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    const intensity = pulse * flicker;

    const eyes = [
      { x: W * 0.745, y: H * 0.165 },
      { x: W * 0.775, y: H * 0.175 },
    ];

    for (const eye of eyes) {
      const outerR = 25 + intensity * 20;
      const g1 = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, outerR);
      g1.addColorStop(0, `rgba(255,20,20,${0.6 * intensity})`);
      g1.addColorStop(0.3, `rgba(255,0,0,${0.25 * intensity})`);
      g1.addColorStop(0.6, `rgba(200,0,0,${0.08 * intensity})`);
      g1.addColorStop(1, 'rgba(150,0,0,0)');
      ctx.beginPath();
      ctx.fillStyle = g1;
      ctx.arc(eye.x, eye.y, outerR, 0, Math.PI * 2);
      ctx.fill();

      const coreR = 3 + intensity * 2;
      const g2 = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, coreR);
      g2.addColorStop(0, `rgba(255,200,200,${0.9 * intensity})`);
      g2.addColorStop(0.5, `rgba(255,50,30,${0.7 * intensity})`);
      g2.addColorStop(1, `rgba(255,0,0,${0.3 * intensity})`);
      ctx.beginPath();
      ctx.fillStyle = g2;
      ctx.arc(eye.x, eye.y, coreR, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  renderOrdersGrid();
  function initFx() {
    const w = window.innerWidth || document.documentElement.clientWidth;
    if (!w) { setTimeout(initFx, 100); return; }
    initSmokeCanvas();
    initEyeGlow();
  }
  initFx();
});
