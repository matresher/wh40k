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

  const points = LOCATIONS.map(loc => `
    <g class="map-point-group" data-id="${loc.id}">
      <circle class="map-point-halo" cx="${loc.x}" cy="${loc.y}" r="13"></circle>
      <circle class="map-point" data-id="${loc.id}" cx="${loc.x}" cy="${loc.y}" r="5.5"></circle>
      <text class="map-label" x="${loc.x + 9}" y="${loc.y + 4}">${loc.name}</text>
    </g>`).join('');

  svg.innerHTML = `<g class="map-stars">${stars}</g><g class="map-segmenta">${segLabels}</g><g class="map-points">${points}</g>`;

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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  renderOrdersGrid();
});
