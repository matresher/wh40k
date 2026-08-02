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
  document.getElementById('mapSvg').dataset.rendered = '1';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  renderOrdersGrid();
});
