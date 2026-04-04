'use strict';

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════

const CATS = [
  { id: 'groente',   name: 'Groente & Fruit',   icon: '🥦' },
  { id: 'zuivel',    name: 'Zuivel & Eieren',    icon: '🥛' },
  { id: 'vlees',     name: 'Vlees & Vis',        icon: '🥩' },
  { id: 'droogkast', name: 'Droogkast',          icon: '🥫' },
  { id: 'brood',     name: 'Brood & Bakkerij',   icon: '🍞' },
  { id: 'diepvries', name: 'Diepvries',          icon: '❄️'  },
  { id: 'drogist',   name: 'Drogisterij',        icon: '🧴' },
  { id: 'overig',    name: 'Overig',             icon: '🛒' },
];

// ═══════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════

const S = {
  get(k, d) { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

let lists      = S.get('lists2', []);          // [{id, name, createdAt, items:[...]}]
let baseItems  = S.get('baseItems2', []);      // [{id, name, catId, skipped}]
let frequency  = S.get('frequency', {});       // {name: count}
let activeListId = null;
let pendingItem  = null;  // {name, catId} — waiting for qty

function save() {
  S.set('lists2', lists);
  S.set('baseItems2', baseItems);
  S.set('frequency', frequency);
}

function uid() { return Math.random().toString(36).slice(2, 11); }

function activeList() { return lists.find(l => l.id === activeListId) || null; }

function trackFrequency(name) {
  frequency[name] = (frequency[name] || 0) + 1;
  S.set('frequency', frequency);
}

function getSuggestions(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return Object.entries(frequency)
    .filter(([name]) => name.toLowerCase().includes(q))
    .sort(([,a],[,b]) => b - a)
    .map(([name, count]) => ({ name, count }))
    .slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function showScreen(id, direction = 'none') {
  const screens = document.querySelectorAll('.screen');
  const target  = document.getElementById(id);

  screens.forEach(s => {
    if (s === target) return;
    s.classList.add('hidden');
    s.classList.remove('slide-right','slide-left');
  });

  target.classList.remove('hidden', 'slide-right', 'slide-left');
  if (direction === 'forward') {
    target.classList.add('slide-right');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => target.classList.remove('slide-right'));
    });
  } else if (direction === 'back') {
    const prev = document.querySelector('.screen:not(.hidden)');
    if (prev) prev.classList.add('slide-left');
    target.classList.remove('slide-right','slide-left');
  }
}

// ═══════════════════════════════════════════════════════════════════
// RENDER: HOME
// ═══════════════════════════════════════════════════════════════════

function renderHome() {
  const container = document.getElementById('homeLists');
  const section   = document.getElementById('homeListsSection');
  const empty     = document.getElementById('homeEmpty');

  if (!lists.length) {
    section.style.display = 'none';
    empty.style.display = '';
    return;
  }

  section.style.display = '';
  empty.style.display = 'none';
  container.innerHTML = '';

  [...lists].reverse().forEach(list => {
    const total   = list.items.length;
    const done    = list.items.filter(i => i.checked).length;
    const pct     = total ? Math.round(done / total * 100) : 0;
    const dateStr = new Date(list.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

    const row = document.createElement('div');
    row.className = 'ios-list-item';
    row.dataset.id = list.id;
    row.innerHTML = `
      <div class="ios-list-icon">🛒</div>
      <div class="ios-list-text">
        <div class="ios-list-title">${esc(list.name)}</div>
        <div class="ios-list-meta">${total} items · ${pct}% klaar · ${dateStr}</div>
      </div>
      <button class="ios-delete-btn" data-id="${list.id}">Verwijder</button>
      <span class="ios-chevron">›</span>`;

    // Long press to reveal delete
    let pressTimer;
    row.addEventListener('touchstart', () => { pressTimer = setTimeout(() => row.classList.toggle('swipe-active'), 500); }, { passive: true });
    row.addEventListener('touchend', () => clearTimeout(pressTimer), { passive: true });
    row.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });

    row.querySelector('.ios-delete-btn').addEventListener('click', e => {
      e.stopPropagation();
      lists = lists.filter(l => l.id !== list.id);
      save();
      renderHome();
    });

    row.addEventListener('click', e => {
      if (e.target.closest('.ios-delete-btn')) return;
      row.classList.remove('swipe-active');
      openList(list.id);
    });

    container.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════════════
// RENDER: LIST DETAIL
// ═══════════════════════════════════════════════════════════════════

function renderList() {
  const list = activeList();
  if (!list) return;

  // Title
  document.getElementById('listLargeTitle').textContent = list.name;
  document.getElementById('listTitleSmall').textContent = list.name;

  // Progress
  const total = list.items.length;
  const done  = list.items.filter(i => i.checked).length;
  document.getElementById('progressFill').style.width  = total ? (done / total * 100) + '%' : '0%';
  document.getElementById('progressLabel').textContent = `${done} / ${total}`;

  const container = document.getElementById('listItems');
  container.innerHTML = '';

  CATS.forEach(cat => {
    const items = list.items.filter(i => i.catId === cat.id);
    if (!items.length) return;

    // Unchecked first, then checked
    items.sort((a,b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));

    const doneInCat = items.filter(i => i.checked).length;

    const group = document.createElement('div');
    group.className = 'cat-group';
    group.innerHTML = `
      <div class="cat-group-header">
        <span class="cat-group-icon">${cat.icon}</span>
        <span class="cat-group-name">${cat.name}</span>
        <span class="cat-group-count">${doneInCat}/${items.length}</span>
      </div>
      <div class="cat-group-card"></div>`;

    const card = group.querySelector('.cat-group-card');

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-row' + (item.checked ? ' is-done' : '');

      const qtyText = item.qty && item.qty !== 1
        ? `${item.qty} ${item.unit || 'stuks'}`
        : item.unit === 'gram' ? `${item.qty || 1} gram` : '';

      row.innerHTML = `
        <div class="check-circle ${item.checked ? 'done' : ''}" data-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="item-body">
          <div class="item-name">${esc(item.name)}</div>
          ${qtyText ? `<div class="item-qty">${qtyText}</div>` : ''}
        </div>
        ${item.fromBase ? '<span class="item-basis-badge">basis</span>' : ''}
        <button class="item-delete" data-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>`;

      row.querySelector('.check-circle').addEventListener('click', () => toggleItem(item.id));
      row.querySelector('.item-delete').addEventListener('click', () => removeItem(item.id));

      card.appendChild(row);
    });

    container.appendChild(group);
  });
}

// ═══════════════════════════════════════════════════════════════════
// RENDER: BASIS SHEET
// ═══════════════════════════════════════════════════════════════════

function renderBasis() {
  const container = document.getElementById('basisItems');
  const empty     = document.getElementById('basisEmpty');
  container.innerHTML = '';

  if (!baseItems.length) { empty.style.display = ''; return; }
  empty.style.display = 'none';

  CATS.forEach(cat => {
    const items = baseItems.filter(i => i.catId === cat.id);
    if (!items.length) return;

    items.sort((a,b) => (a.skipped ? 1 : 0) - (b.skipped ? 1 : 0));

    const group = document.createElement('div');
    group.className = 'cat-group';
    group.innerHTML = `
      <div class="cat-group-header">
        <span class="cat-group-icon">${cat.icon}</span>
        <span class="cat-group-name">${cat.name}</span>
      </div>
      <div class="cat-group-card"></div>`;

    const card = group.querySelector('.cat-group-card');

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-row' + (item.skipped ? ' is-skip' : '');
      row.innerHTML = `
        <div class="check-circle ${item.skipped ? 'skip' : ''}" data-id="${item.id}" title="${item.skipped ? 'Activeren' : 'Overslaan deze week'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="item-body">
          <div class="item-name">${esc(item.name)}</div>
        </div>
        <button class="item-delete" data-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>`;

      row.querySelector('.check-circle').addEventListener('click', () => toggleBaseSkip(item.id));
      row.querySelector('.item-delete').addEventListener('click', () => deleteBaseItem(item.id));
      card.appendChild(row);
    });

    container.appendChild(group);
  });
}

// ═══════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════

function openList(id) {
  activeListId = id;
  resetAddArea();
  renderList();
  showScreen('screen-list', 'forward');
}

function createList(name, loadBase) {
  const items = loadBase
    ? baseItems.filter(b => !b.skipped).map(b => ({
        id: uid(), name: b.name, catId: b.catId,
        qty: 1, unit: 'stuks',
        checked: false, fromBase: true, baseId: b.id
      }))
    : [];
  const list = { id: uid(), name, createdAt: Date.now(), items };
  lists.push(list);
  save();
  renderHome();
  openList(list.id);
}

function toggleItem(itemId) {
  const list = activeList();
  const item = list.items.find(i => i.id === itemId);
  if (!item) return;
  item.checked = !item.checked;
  save();
  renderList();
}

function removeItem(itemId) {
  const list = activeList();
  list.items = list.items.filter(i => i.id !== itemId);
  save();
  renderList();
}

function addItemToList(name, catId, qty, unit) {
  const list = activeList();
  list.items.push({ id: uid(), name, catId: catId || 'overig', qty, unit, checked: false, fromBase: false });
  trackFrequency(name);
  save();
  renderList();
}

function startNewWeek() {
  const list = activeList();
  // Reset all skipped flags on base
  baseItems.forEach(b => { b.skipped = false; });
  // Rebuild: remove old base items, add fresh ones
  list.items = list.items.filter(i => !i.fromBase || i.checked === false ? false : true);
  // Actually: keep extra (non-base) items unchecked, remove all base items, re-add from base
  list.items = list.items.filter(i => !i.fromBase);
  list.items.forEach(i => { i.checked = false; });
  baseItems.filter(b => !b.skipped).forEach(b => {
    list.items.push({ id: uid(), name: b.name, catId: b.catId, qty: 1, unit: 'stuks', checked: false, fromBase: true, baseId: b.id });
  });
  save();
  renderBasis();
  renderList();
}

function toggleBaseSkip(id) {
  const item = baseItems.find(i => i.id === id);
  if (!item) return;
  item.skipped = !item.skipped;

  // Sync to active list if open
  const list = activeList();
  if (list) {
    if (item.skipped) {
      list.items = list.items.filter(w => !(w.baseId === id && !w.checked));
    } else {
      const already = list.items.find(w => w.baseId === id);
      if (!already) {
        list.items.push({ id: uid(), name: item.name, catId: item.catId, qty: 1, unit: 'stuks', checked: false, fromBase: true, baseId: id });
      }
    }
  }
  save();
  renderBasis();
  if (list) renderList();
}

function deleteBaseItem(id) {
  baseItems = baseItems.filter(i => i.id !== id);
  const list = activeList();
  if (list) {
    list.items = list.items.filter(w => !(w.baseId === id && !w.checked));
  }
  save();
  renderBasis();
  if (list) renderList();
}

function addBaseItem(name, catId) {
  const id = uid();
  baseItems.push({ id, name, catId: catId || 'overig', skipped: false });
  trackFrequency(name);
  const list = activeList();
  if (list) {
    list.items.push({ id: uid(), name, catId: catId || 'overig', qty: 1, unit: 'stuks', checked: false, fromBase: true, baseId: id });
  }
  save();
  renderBasis();
  if (list) renderList();
}

// ═══════════════════════════════════════════════════════════════════
// ADD AREA (autocomplete + qty)
// ═══════════════════════════════════════════════════════════════════

function resetAddArea() {
  pendingItem = null;
  document.getElementById('itemInput').value = '';
  document.getElementById('itemCategory').value = '';
  document.getElementById('qtyStage').style.display = 'none';
  document.getElementById('autocompleteDropdown').style.display = 'none';
  document.getElementById('qtyValue').value = 1;
  document.getElementById('btnStuks').classList.add('active');
  document.getElementById('btnGram').classList.remove('active');
}

function showQtyStage(name, catId) {
  pendingItem = { name, catId };
  document.getElementById('qtyItemName').textContent = name;
  document.getElementById('qtyStage').style.display = '';
  document.getElementById('autocompleteDropdown').style.display = 'none';
  document.getElementById('itemInput').value = '';
  document.getElementById('qtyValue').value = 1;
  document.getElementById('btnStuks').classList.add('active');
  document.getElementById('btnGram').classList.remove('active');
}

function confirmAddItem() {
  if (!pendingItem) return;
  const qty  = parseInt(document.getElementById('qtyValue').value) || 1;
  const unit = document.getElementById('btnStuks').classList.contains('active') ? 'stuks' : 'gram';
  addItemToList(pendingItem.name, pendingItem.catId, qty, unit);
  resetAddArea();
}

// ═══════════════════════════════════════════════════════════════════
// AUTOCOMPLETE
// ═══════════════════════════════════════════════════════════════════

function renderAutocomplete(query) {
  const dd = document.getElementById('autocompleteDropdown');
  const suggestions = getSuggestions(query);

  if (!suggestions.length) { dd.style.display = 'none'; return; }

  dd.innerHTML = suggestions.map(s => `
    <div class="autocomplete-item" data-name="${esc(s.name)}">
      <span class="autocomplete-icon">🔍</span>
      <span>${esc(s.name)}</span>
      <span class="autocomplete-count">${s.count}×</span>
    </div>`).join('');

  dd.querySelectorAll('.autocomplete-item').forEach(el => {
    el.addEventListener('mousedown', e => e.preventDefault()); // prevent blur
    el.addEventListener('click', () => {
      const name  = el.dataset.name;
      const catId = document.getElementById('itemCategory').value || 'overig';
      showQtyStage(name, catId);
    });
  });

  dd.style.display = '';
}

// ═══════════════════════════════════════════════════════════════════
// POPULATE SELECTS
// ═══════════════════════════════════════════════════════════════════

function fillSelects() {
  ['itemCategory', 'quickCategory', 'basisCategory'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">Categorie</option>';
    CATS.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.icon + ' ' + c.name;
      el.appendChild(o);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SCROLL COMPACT NAV
// ═══════════════════════════════════════════════════════════════════

function setupScrollCompact(scrollEl, navEl) {
  scrollEl.addEventListener('scroll', () => {
    navEl.classList.toggle('compact', scrollEl.scrollTop > 40);
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  fillSelects();

  // ── Splash ──────────────────────────────────────────────
  setTimeout(() => {
    showScreen('screen-home');
    renderHome();
  }, 2000);

  // ── Compact nav on scroll ────────────────────────────────
  setupScrollCompact(document.getElementById('homeScroll'), document.getElementById('homeNav'));
  setupScrollCompact(document.getElementById('listScroll'), document.getElementById('listNav'));

  // ── New list ─────────────────────────────────────────────
  document.getElementById('btnNewList').addEventListener('click', () => {
    document.getElementById('newListName').value = '';
    document.getElementById('newListLoadBase').checked = true;
    document.getElementById('modalNewList').style.display = 'flex';
    setTimeout(() => document.getElementById('newListName').focus(), 100);
  });

  document.getElementById('btnNewListCancel').addEventListener('click', () => {
    document.getElementById('modalNewList').style.display = 'none';
  });

  document.getElementById('btnNewListConfirm').addEventListener('click', () => {
    const name    = document.getElementById('newListName').value.trim() || 'Lijst';
    const loadBase = document.getElementById('newListLoadBase').checked;
    document.getElementById('modalNewList').style.display = 'none';
    createList(name, loadBase);
  });

  document.getElementById('newListName').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnNewListConfirm').click();
  });

  // ── Back ─────────────────────────────────────────────────
  document.getElementById('btnBack').addEventListener('click', () => {
    resetAddArea();
    renderHome();
    showScreen('screen-home', 'back');
    activeListId = null;
  });

  // ── Item input autocomplete ───────────────────────────────
  const itemInput = document.getElementById('itemInput');

  itemInput.addEventListener('input', () => {
    renderAutocomplete(itemInput.value.trim());
  });

  itemInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.getElementById('autocompleteDropdown').style.display = 'none';
    }, 150);
  });

  itemInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const name  = itemInput.value.trim();
      const catId = document.getElementById('itemCategory').value || 'overig';
      if (!name) return;
      showQtyStage(name, catId);
    }
  });

  // ── Qty stage ────────────────────────────────────────────
  document.getElementById('qtyMinus').addEventListener('click', () => {
    const inp = document.getElementById('qtyValue');
    inp.value = Math.max(1, parseInt(inp.value) - 1);
  });

  document.getElementById('qtyPlus').addEventListener('click', () => {
    const inp = document.getElementById('qtyValue');
    inp.value = parseInt(inp.value) + 1;
  });

  document.getElementById('btnStuks').addEventListener('click', () => {
    document.getElementById('btnStuks').classList.add('active');
    document.getElementById('btnGram').classList.remove('active');
  });

  document.getElementById('btnGram').addEventListener('click', () => {
    document.getElementById('btnGram').classList.add('active');
    document.getElementById('btnStuks').classList.remove('active');
  });

  document.getElementById('btnQtyCancel').addEventListener('click', resetAddArea);
  document.getElementById('btnQtyConfirm').addEventListener('click', confirmAddItem);

  // ── New week ─────────────────────────────────────────────
  document.getElementById('btnNewWeek').addEventListener('click', () => {
    document.getElementById('modalNewWeek').style.display = 'flex';
  });

  document.getElementById('modalCancel').addEventListener('click', () => {
    document.getElementById('modalNewWeek').style.display = 'none';
  });

  document.getElementById('modalConfirm').addEventListener('click', () => {
    document.getElementById('modalNewWeek').style.display = 'none';
    startNewWeek();
  });

  // ── Basis sheet ──────────────────────────────────────────
  function openBasis() {
    renderBasis();
    document.getElementById('screen-basis').classList.remove('hidden');
  }
  function closeBasis() {
    document.getElementById('screen-basis').classList.add('hidden');
  }

  document.getElementById('btnBasisFromHome').addEventListener('click', openBasis);
  document.getElementById('btnBasisFromList').addEventListener('click', openBasis);
  document.getElementById('btnBasisClose').addEventListener('click', closeBasis);
  document.getElementById('sheetBackdrop').addEventListener('click', closeBasis);

  // ── Basis add ────────────────────────────────────────────
  const basisInput = document.getElementById('basisInput');

  document.getElementById('btnBasisAdd').addEventListener('click', () => {
    const name  = basisInput.value.trim();
    const catId = document.getElementById('basisCategory').value || 'overig';
    if (!name) { basisInput.focus(); return; }
    addBaseItem(name, catId);
    basisInput.value = '';
    basisInput.focus();
  });

  basisInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnBasisAdd').click();
  });

  // ── Close modals on backdrop ─────────────────────────────
  document.getElementById('modalNewList').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });
  document.getElementById('modalNewWeek').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });
});

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE WORKER
// ═══════════════════════════════════════════════════════════════════

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
