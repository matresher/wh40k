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
