'use strict';

// ══════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════
const CATS = [
  { id: 'groente',   name: 'Groente & Fruit',  icon: '🥦' },
  { id: 'zuivel',    name: 'Zuivel & Eieren',  icon: '🥛' },
  { id: 'vlees',     name: 'Vlees & Vis',      icon: '🥩' },
  { id: 'droogkast', name: 'Droogkast',        icon: '🥫' },
  { id: 'brood',     name: 'Brood & Bakkerij', icon: '🍞' },
  { id: 'diepvries', name: 'Diepvries',        icon: '❄️'  },
  { id: 'drogist',   name: 'Drogisterij',      icon: '🧴' },
  { id: 'overig',    name: 'Overig',           icon: '🛒' },
];

// ══════════════════════════════════════════════════════
// DUTCH GROCERY VOCABULARY (voor autocomplete zonder geschiedenis)
// ══════════════════════════════════════════════════════
const VOCAB = [
  // Groente & Fruit
  'Tomaten','Komkommer','Paprika','Sla','Spinazie','Broccoli','Bloemkool','Courgette',
  'Ui','Rode ui','Knoflook','Prei','Wortel','Wortels','Aardappelen','Zoete aardappel',
  'Champignons','Avocado','Sperziebonen','Erwten','Maïs','Spruitjes','Knolselderij',
  'Rucola','IJsbergsla','Veldsla','Andijvie','Witlof','Selderij','Radijs','Biet',
  'Venkel','Asperges','Artisjok','Boerenkool','Paksoi','Gember','Jalapeño',
  'Bananen','Appels','Peren','Sinaasappels','Mandarijnen','Citroenen','Limoenen',
  'Druiven','Aardbeien','Frambozen','Blauwe bessen','Meloen','Watermeloen',
  'Mango','Ananas','Kiwi','Perziken','Nectarines','Pruimen','Abrikozen','Vijgen',
  // Zuivel
  'Melk','Volle melk','Halfvolle melk','Magere melk','Boter','Halvarine','Margarine',
  'Yoghurt','Griekse yoghurt','Kwark','Vla','Slagroom','Koffiemelk','Karnemelk',
  'Eieren','Kaas','Jong belegen kaas','Belegen kaas','Gouda','Cheddar','Brie','Camembert',
  'Mozzarella','Feta','Ricotta','Roomkaas','Smeerkaas','Parmezaan',
  // Vlees & Vis
  'Gehakt','Half-om-half gehakt','Rundergehakt','Varkensgehakt','Kipfilet','Kip',
  'Kipdrumsticks','Kippendijen','Kalkoen','Spek','Ham','Rookvlees','Salami',
  'Worst','Rookworst','Braadworst','Hamburger','Biefstuk','Rundvlees','Varkensvlees',
  'Zalm','Kabeljauw','Tilapia','Tonijn','Garnalen','Mosselen','Makreel','Haring',
  // Droogkast
  'Pasta','Spaghetti','Penne','Fusilli','Tagliatelle','Lasagnebladen','Macaroni',
  'Rijst','Basmatirijst','Zilvervliesrijst','Couscous','Quinoa','Bulgur','Linzen',
  'Kikkererwten','Bruine bonen','Witte bonen','Kidneybonen',
  'Bloem','Suiker','Basterdsuiker','Zout','Peper','Olijfolie','Zonnebloemolie',
  'Azijn','Witte wijnazijn','Balsamicoazijn','Ketjap','Sojasaus','Worcestersaus',
  'Tomatenpuree','Gezeefde tomaten','Tomaten blik','Kokosmelk','Bouillonblokjes',
  'Mosterd','Mayonaise','Ketchup','Sambal','Pesto','Harissa',
  'Havermout','Muesli','Cornflakes','Granola','Cruesli',
  'Pindakaas','Jam','Hagelslag','Appelstroop','Honing','Nutella',
  'Crackers','Rijstwafels','Beschuit','Knäckebröd',
  'Chocolade','Pure chocolade','Melkchocolade','Cacao','Vanillesuiker',
  'Soep','Tomatensoep','Groentesoep','Kippensoep',
  // Brood
  'Brood','Wit brood','Bruin brood','Volkoren brood','Meergranen brood',
  'Stokbrood','Ciabatta','Focaccia','Croissants','Bagels','Wraps','Tortilla wraps',
  'Pita brood','Naan','Roggebrood','Knip brood',
  // Diepvries
  'Diepvries spinazie','Diepvries erwten','Diepvries edamame','Diepvries groenten',
  'Diepvries frites','Diepvries pizza','Diepvries vis','Diepvries garnalen',
  'IJs','Roomijs',
  // Drogisterij
  'Shampoo','Conditioner','Tandpasta','Tandenborstel','Zeep','Handzeep',
  'Deodorant','Scheerschuim','Scheermesjes','Bodylotion','Zonnebrand',
  'Wasmiddel','Wasverzachter','Afwasmiddel','Vaatwasblokjes','Wc-papier',
  'Keukenpapier','Aluminiumfolie','Plasticfolie','Ziplocbakjes','Vuilniszakken',
  // Overig
  'Koffie','Espresso','Filterkoffie','Oploskoffie','Thee','Groene thee',
  'Sinaasappelsap','Appelsap','Jus d\'orange','Cola','Spa','Water','Mineraalwater',
  'Wijn','Rode wijn','Witte wijn','Bier',
  'Chips','Noten','Amandelen','Cashewnoten','Walnoten','Pinda\'s','Popcorn','Pretzels',
];

// ══════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

// ══════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════
let lists     = store.get('mnd_lists', []);
let baseItems = store.get('mnd_base', []);
let freq      = store.get('mnd_freq', {});
let activeId  = null;
let pending   = null; // {name, catId}

const uid = () => Math.random().toString(36).slice(2, 11);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const activeList = () => lists.find(l => l.id === activeId) || null;

function save() {
  store.set('mnd_lists', lists);
  store.set('mnd_base', baseItems);
  store.set('mnd_freq', freq);
}

function trackFreq(name) {
  freq[name] = (freq[name] || 0) + 1;
  store.set('mnd_freq', freq);
}

// ══════════════════════════════════════════════════════
// AUTO-CATEGORIE op basis van naam
// ══════════════════════════════════════════════════════
const CAT_RULES = [
  { cat: 'groente',   words: ['tomaat','tomaten','komkommer','paprika','sla','spinazie','broccoli','bloemkool','courgette','ui','knoflook','prei','wortel','aardappel','champignon','avocado','sperzieboon','erwt','maïs','spruitje','knolselderi','rucola','andijvie','witlof','selderi','radijs','biet','venkel','asperge','artisjok','boerenkool','paksoi','gember','jalapeño','banaan','appel','peer','sinaasappel','mandarijn','citroen','limoen','druif','aardbei','framboos','blauwe bes','meloen','watermeloen','mango','ananas','kiwi','perzik','nectarine','pruim','abrikoos','vijg','fruit','groente'] },
  { cat: 'zuivel',    words: ['melk','boter','halvarine','margarine','yoghurt','kwark','vla','slagroom','koffiemelk','karnemelk','ei','eieren','kaas','gouda','cheddar','brie','camembert','mozzarella','feta','ricotta','roomkaas','smeerkaas','parmezaan','zuivel'] },
  { cat: 'vlees',     words: ['gehakt','kipfilet','kip','kalkoen','spek','ham','rookvlees','salami','worst','rookworst','braadworst','hamburger','biefstuk','rundvlees','varkensvlees','zalm','kabeljauw','tilapia','tonijn','garnalen','mosselen','makreel','haring','vis','vlees'] },
  { cat: 'droogkast', words: ['pasta','spaghetti','penne','fusilli','tagliatelle','lasagne','macaroni','rijst','couscous','quinoa','bulgur','linzen','kikkererwt','boon','bonen','bloem','suiker','zout','peper','olijfolie','olie','azijn','ketjap','sojasaus','worcester','tomatenpuree','tomaten blik','kokosmelk','bouillon','mosterd','mayonaise','ketchup','sambal','pesto','harissa','havermout','muesli','cornflakes','granola','pindakaas','jam','hagelslag','appelstroop','honing','nutella','cracker','rijstwafel','beschuit','chocolade','cacao','soep','ingeblikt','blik'] },
  { cat: 'brood',     words: ['brood','stokbrood','ciabatta','focaccia','croissant','bagel','wrap','tortilla','pita','naan','rogge','knip'] },
  { cat: 'diepvries', words: ['diepvries','frites','ijs','roomijs','frozen'] },
  { cat: 'drogist',   words: ['shampoo','conditioner','tandpasta','tandenborstel','zeep','deodorant','scheerschuim','scheermesje','bodylotion','zonnebrand','wasmiddel','wasverzachter','afwasmiddel','vaatwas','wc-papier','keukenpapier','aluminiumfolie','plasticfolie','vuilniszak'] },
  { cat: 'overig',    words: ['koffie','espresso','thee','sap','cola','water','wijn','bier','chips','noten','amandel','cashew','walnoot','pinda','popcorn','pretzel'] },
];

function guessCat(name) {
  const lname = name.toLowerCase();
  for (const rule of CAT_RULES) {
    if (rule.words.some(w => lname.includes(w))) return rule.cat;
  }
  return 'overig';
}

function getSuggestions(q) {
  if (!q) return [];
  const lq = q.toLowerCase();

  // Merge VOCAB + freq into one scored list
  const seen = new Set();
  const results = [];

  // From frequency (personal history) — highest score boost
  Object.entries(freq).forEach(([name, count]) => {
    if (name.toLowerCase().includes(lq)) {
      seen.add(name.toLowerCase());
      results.push({ name, score: count + 100 });
    }
  });

  // From built-in vocab
  VOCAB.forEach(name => {
    if (name.toLowerCase().includes(lq) && !seen.has(name.toLowerCase())) {
      // Prefix match scores higher
      const score = name.toLowerCase().startsWith(lq) ? 10 : 1;
      results.push({ name, score });
    }
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
}

// ══════════════════════════════════════════════════════
// SCREENS — simple show/hide, no transform transitions
// (avoids the overlap bug)
// ══════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('is-active'));
  document.getElementById(id).classList.add('is-active');
}

// ══════════════════════════════════════════════════════
// SELECTS
// ══════════════════════════════════════════════════════
function fillSelect(el) {
  el.innerHTML = '<option value="">Categorie</option>';
  CATS.forEach(c => {
    const o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.icon + '\u00A0' + c.name;
    el.appendChild(o);
  });
}

// ══════════════════════════════════════════════════════
// RENDER HOME
// ══════════════════════════════════════════════════════
function renderHome() {
  const cards   = document.getElementById('homeCards');
  const section = document.getElementById('homeSection');
  const empty   = document.getElementById('homeEmpty');

  if (!lists.length) {
    section.style.display = 'none';
    empty.style.display = '';
    return;
  }

  section.style.display = '';
  empty.style.display = 'none';
  cards.innerHTML = '';

  [...lists].reverse().forEach(list => {
    const total = list.items.length;
    const done  = list.items.filter(i => i.checked).length;
    const pct   = total ? Math.round(done / total * 100) : 0;
    const date  = new Date(list.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

    const card = document.createElement('div');
    card.className = 'list-card';

    // Main tappable area — opens list
    const main = document.createElement('div');
    main.className = 'list-card-main';
    main.innerHTML = `
      <div class="list-card-icon">🛒</div>
      <div class="list-card-body">
        <div class="list-card-name">${esc(list.name)}</div>
        <div class="list-card-meta">${total} items · ${date}</div>
      </div>
      <div class="list-card-pct">${pct ? pct + '%' : ''}</div>`;
    main.addEventListener('click', () => openList(list.id));

    // Delete button — separate, always visible
    const del = document.createElement('button');
    del.className = 'list-card-del';
    del.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
    del.addEventListener('click', e => {
      e.stopPropagation();
      lists = lists.filter(l => l.id !== list.id);
      save();
      renderHome();
    });

    card.appendChild(main);
    card.appendChild(del);
    cards.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════
// RENDER LIST
// ══════════════════════════════════════════════════════
function renderList() {
  const list = activeList();
  if (!list) return;

  document.getElementById('listLargeTitle').textContent = list.name;
  document.getElementById('listSmallTitle').textContent  = list.name;

  const total = list.items.length;
  const done  = list.items.filter(i => i.checked).length;
  document.getElementById('progressFill').style.width   = total ? (done / total * 100) + '%' : '0%';
  document.getElementById('progressLabel').textContent  = `${done} / ${total}`;

  const container = document.getElementById('listItems');
  container.innerHTML = '';

  CATS.forEach(cat => {
    const items = list.items.filter(i => i.catId === cat.id);
    if (!items.length) return;

    items.sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));

    const doneN = items.filter(i => i.checked).length;

    const sec = document.createElement('div');
    sec.className = 'cat-section';
    sec.innerHTML = `
      <div class="cat-header">
        <span class="cat-emoji">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-tally">${doneN}/${items.length}</span>
      </div>
      <div class="cat-card"></div>`;

    const card = sec.querySelector('.cat-card');

    items.forEach(item => {
      const qty  = item.qty  || 1;
      const unit = item.unit || 'stuks';
      const qtyLabel = unit === 'gram' ? `${qty}g` : `${qty}×`;

      const row = document.createElement('div');
      row.className = 'item-row' + (item.checked ? ' done' : '');
      row.innerHTML = `
        <button class="check-btn ${item.checked ? 'is-checked' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <div class="item-body">
          <div class="item-name">${esc(item.name)}</div>
        </div>
        <div class="item-stepper">
          <button class="step-btn step-min">−</button>
          <span class="step-val">${qtyLabel}</span>
          <button class="step-btn step-plus">+</button>
        </div>
        <button class="item-del">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>`;

      row.querySelector('.check-btn').addEventListener('click', () => {
        item.checked = !item.checked;
        save(); renderList();
      });

      row.querySelector('.step-min').addEventListener('click', () => {
        if (item.qty <= 1) return;
        item.qty = (item.qty || 1) - 1;
        save(); renderList();
      });

      row.querySelector('.step-plus').addEventListener('click', () => {
        item.qty = (item.qty || 1) + 1;
        save(); renderList();
      });

      row.querySelector('.item-del').addEventListener('click', () => {
        list.items = list.items.filter(i => i.id !== item.id);
        save(); renderList();
      });

      card.appendChild(row);
    });

    container.appendChild(sec);
  });
}

// ══════════════════════════════════════════════════════
// RENDER BASIS
// ══════════════════════════════════════════════════════
function renderBasis() {
  const container = document.getElementById('basisItems');
  const empty     = document.getElementById('basisEmpty');
  container.innerHTML = '';

  if (!baseItems.length) { empty.style.display = ''; return; }
  empty.style.display = 'none';

  CATS.forEach(cat => {
    const items = baseItems.filter(i => i.catId === cat.id);
    if (!items.length) return;

    items.sort((a, b) => (a.skipped ? 1 : 0) - (b.skipped ? 1 : 0));

    const sec = document.createElement('div');
    sec.className = 'cat-section';
    sec.innerHTML = `
      <div class="cat-header">
        <span class="cat-emoji">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
      </div>
      <div class="cat-card"></div>`;

    const card = sec.querySelector('.cat-card');

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-row' + (item.skipped ? ' skipped' : '');
      row.innerHTML = `
        <button class="check-btn ${item.skipped ? 'is-skipped' : ''}" data-id="${item.id}" title="${item.skipped ? 'Activeren' : 'Overslaan deze week'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <div class="item-body">
          <div class="item-name">${esc(item.name)}</div>
        </div>
        <button class="item-del" data-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>`;

      row.querySelector('.check-btn').addEventListener('click', () => toggleBaseSkip(item.id));
      row.querySelector('.item-del').addEventListener('click', () => deleteBase(item.id));
      card.appendChild(row);
    });

    container.appendChild(sec);
  });
}

// ══════════════════════════════════════════════════════
// ACTIONS
// ══════════════════════════════════════════════════════
function openList(id) {
  activeId = id;
  resetAdd();
  renderList();
  showScreen('screen-list');
  document.getElementById('listScroll').scrollTop = 0;
}

function createList(name, withBase) {
  const items = withBase
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

function toggleBaseSkip(id) {
  const item = baseItems.find(i => i.id === id);
  if (!item) return;
  item.skipped = !item.skipped;

  const list = activeList();
  if (list) {
    if (item.skipped) {
      list.items = list.items.filter(w => !(w.baseId === id && !w.checked));
    } else {
      if (!list.items.find(w => w.baseId === id)) {
        list.items.push({ id: uid(), name: item.name, catId: item.catId, qty: 1, unit: 'stuks', checked: false, fromBase: true, baseId: id });
      }
    }
  }

  save();
  renderBasis();
  if (list) renderList();
}

function deleteBase(id) {
  baseItems = baseItems.filter(i => i.id !== id);
  const list = activeList();
  if (list) list.items = list.items.filter(w => !(w.baseId === id && !w.checked));
  save();
  renderBasis();
  if (list) renderList();
}

function addBaseItem(name, catId) {
  const id = uid();
  const resolvedCat = (catId && catId !== 'overig') ? catId : guessCat(name);
  baseItems.push({ id, name, catId: resolvedCat, skipped: false });
  trackFreq(name);
  const list = activeList();
  if (list) list.items.push({ id: uid(), name, catId: catId || 'overig', qty: 1, unit: 'stuks', checked: false, fromBase: true, baseId: id });
  save();
  renderBasis();
  if (list) renderList();
}

function addWeekItem(name, catId, qty, unit) {
  const list = activeList();
  if (!list) return;
  // Auto-detect category if not specified
  const resolvedCat = (catId && catId !== 'overig') ? catId : guessCat(name);
  // Don't add duplicate (same name, unchecked)
  if (list.items.find(i => i.name.toLowerCase() === name.toLowerCase() && !i.checked)) return;
  list.items.push({ id: uid(), name, catId: resolvedCat, qty: qty || 1, unit: unit || 'stuks', checked: false, fromBase: false });
  trackFreq(name);
  save();
  renderList();
}

function newWeek() {
  const list = activeList();
  if (!list) return;
  baseItems.forEach(b => { b.skipped = false; });
  list.items = list.items.filter(i => !i.fromBase);
  list.items.forEach(i => { i.checked = false; });
  baseItems.forEach(b => {
    list.items.push({ id: uid(), name: b.name, catId: b.catId, qty: 1, unit: 'stuks', checked: false, fromBase: true, baseId: b.id });
  });
  save();
  renderBasis();
  renderList();
}

// ══════════════════════════════════════════════════════
// ADD / AUTOCOMPLETE
// ══════════════════════════════════════════════════════
function resetAdd() {
  document.getElementById('itemInput').value = '';
  document.getElementById('acDropdown').style.display = 'none';
  document.getElementById('itemInput').blur();
}

// Direct toevoegen — geen tussenstap
function quickAdd(name) {
  if (!name.trim()) return;
  addWeekItem(name.trim(), '', 1, 'stuks');
  resetAdd();
}

function renderAC(q) {
  const dd = document.getElementById('acDropdown');
  const sugg = getSuggestions(q);
  if (!sugg.length) { dd.style.display = 'none'; return; }

  dd.innerHTML = sugg.map(s => {
    const cat = CATS.find(c => c.id === guessCat(s.name));
    const catLabel = cat ? cat.icon : '';
    return `<div class="autocomplete-item" data-name="${esc(s.name)}">
      <span class="ac-cat">${catLabel}</span>
      <span class="ac-name">${esc(s.name)}</span>
      ${s.score > 100 ? `<span class="ac-count">${s.score - 100}×</span>` : ''}
    </div>`;
  }).join('');

  dd.querySelectorAll('.autocomplete-item').forEach(el => {
    el.addEventListener('mousedown', e => e.preventDefault());
    el.addEventListener('click', () => quickAdd(el.dataset.name));
  });

  dd.style.display = '';
}

// ══════════════════════════════════════════════════════
// BOTTOM SHEET
// ══════════════════════════════════════════════════════
function openSheet() {
  renderBasis();
  const sheet = document.getElementById('basisSheet');
  sheet.classList.add('open');
}

function closeSheet() {
  document.getElementById('basisSheet').classList.remove('open');
}

// ══════════════════════════════════════════════════════
// SCROLL COMPACT NAV
// ══════════════════════════════════════════════════════
function setupCompact(scrollId, navId) {
  document.getElementById(scrollId).addEventListener('scroll', function() {
    document.getElementById(navId).classList.toggle('compact', this.scrollTop > 50);
  }, { passive: true });
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Fill category selects
  ['itemCat', 'basisCat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) fillSelect(el);
  });

  setupCompact('homeScroll', 'homeNav');
  setupCompact('listScroll', 'listNav');

  // Splash → Home: crossfade dissolve
  setTimeout(() => {
    renderHome();
    const splash = document.getElementById('screen-splash');
    const home   = document.getElementById('screen-home');
    // Show home underneath first
    home.classList.add('is-active');
    // Fade splash out on top
    splash.style.transition = 'opacity 0.65s ease';
    splash.style.opacity = '0';
    splash.style.zIndex  = '5';
    setTimeout(() => {
      splash.classList.remove('is-active');
      splash.style.cssText = '';
    }, 700);
  }, 2000);

  // ── New list ────────────────────────────────────────
  document.getElementById('btnNewList').addEventListener('click', () => {
    document.getElementById('newListName').value = '';
    document.getElementById('loadBase').checked = true;
    document.getElementById('modalList').style.display = 'flex';
    setTimeout(() => document.getElementById('newListName').focus(), 80);
  });

  document.getElementById('btnListCancel').addEventListener('click', () => {
    document.getElementById('modalList').style.display = 'none';
  });

  document.getElementById('btnListConfirm').addEventListener('click', () => {
    const name = document.getElementById('newListName').value.trim() || 'Lijst';
    const wb   = document.getElementById('loadBase').checked;
    document.getElementById('modalList').style.display = 'none';
    createList(name, wb);
  });

  document.getElementById('newListName').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnListConfirm').click();
  });

  document.getElementById('modalList').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });

  // ── Back ─────────────────────────────────────────────
  document.getElementById('btnBack').addEventListener('click', () => {
    resetAdd();
    renderHome();
    showScreen('screen-home');
    activeId = null;
  });

  // ── Autocomplete ─────────────────────────────────────
  const itemInput = document.getElementById('itemInput');

  itemInput.addEventListener('input', () => renderAC(itemInput.value.trim()));

  itemInput.addEventListener('blur', () => {
    setTimeout(() => { document.getElementById('acDropdown').style.display = 'none'; }, 150);
  });

  itemInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    quickAdd(itemInput.value.trim());
  });

  document.getElementById('btnAddItem').addEventListener('click', () => {
    quickAdd(itemInput.value.trim());
  });

  // ── New week ─────────────────────────────────────────
  document.getElementById('btnNewWeek').addEventListener('click', () => {
    document.getElementById('modalWeek').style.display = 'flex';
  });
  document.getElementById('btnWeekCancel').addEventListener('click', () => {
    document.getElementById('modalWeek').style.display = 'none';
  });
  document.getElementById('btnWeekConfirm').addEventListener('click', () => {
    document.getElementById('modalWeek').style.display = 'none';
    newWeek();
  });
  document.getElementById('modalWeek').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });

  // ── Basis sheet ──────────────────────────────────────
  document.getElementById('btnBasisFromHome').addEventListener('click', openSheet);
  document.getElementById('btnBasisFromList').addEventListener('click', openSheet);
  document.getElementById('btnBasisClose').addEventListener('click', closeSheet);
  document.getElementById('sheetBackdrop').addEventListener('click', closeSheet);

  document.getElementById('btnBasisAdd').addEventListener('click', () => {
    const name  = document.getElementById('basisInput').value.trim();
    const catId = document.getElementById('basisCat').value || 'overig';
    if (!name) { document.getElementById('basisInput').focus(); return; }
    addBaseItem(name, catId);
    document.getElementById('basisInput').value = '';
    document.getElementById('basisInput').focus();
  });

  document.getElementById('basisInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnBasisAdd').click();
  });
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
