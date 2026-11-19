// All rendering: the checklist and guide pane, the roadmap with its tables,
// the missables page, the planner, the sources page and the spoiler mask.
// Roadmap figures come from PowerPyx's trophy guide, cross-checked against
// AlcastHQ — the two agree on every number below.
import { gradeLabel, kindLabel, SOURCES, sourceByName, trophyById } from './data.js';
import { counterValue, setCounter, setNote, toggleEarned } from './store.js';
import { displayDescription, displayName, isMasked, nextUpList, visibleTrophies } from './filters.js';

export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function gradeBadge(grade) {
  const badge = el('span', gradeLabel(grade), `grade grade-${grade}`);
  return badge;
}

function sourceLinks(trophy, pane) {
  const wrap = el('p', null, 'sources');
  wrap.append(el('span', 'Sources: '));
  for (const name of trophy.sources ?? ['Exophase', 'PSNProfiles']) {
    const src = sourceByName(name);
    if (src && src.url) {
      const a = document.createElement('a');
      a.href = src.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = src.name;
      wrap.append(a);
    } else {
      wrap.append(el('span', name));
    }
  }
  pane.append(wrap);
}

export function renderHeaderStats(doc, state, mount) {
  const earned = state.earned.length;
  const byGrade = (g) => doc.trophies.filter((t) => t.grade === g).length;
  const earnedByGrade = (g) => doc.trophies.filter((t) => t.grade === g && state.earned.includes(t.id)).length;
  mount.replaceChildren();
  const stats = [
    [`${earned}/55`, 'trophies'],
    [`${earnedByGrade('platinum')}/${byGrade('platinum')}`, 'platinum'],
    [`${earnedByGrade('gold')}/${byGrade('gold')}`, 'gold'],
    [`${earnedByGrade('silver')}/${byGrade('silver')}`, 'silver'],
    [`${earnedByGrade('bronze')}/${byGrade('bronze')}`, 'bronze'],
    ['28', 'hidden'],
    ['0', 'online'],
    ['~200 h', 'to platinum'],
    ['4/10', 'difficulty'],
  ];
  for (const [value, label] of stats) {
    const box = el('div', null, 'stat');
    box.append(el('b', value), el('span', label));
    mount.append(box);
  }
}

export function renderProgressLine(doc, state, mount) {
  const earned = state.earned.length;
  const pct = Math.round((earned / doc.trophies.length) * 100);
  const byGrade = (g) => doc.trophies.filter((t) => t.grade === g && state.earned.includes(t.id)).length;
  mount.replaceChildren();
  const bar = el('div', null, 'bar');
  const fill = document.createElement('i');
  fill.style.width = `${pct}%`;
  bar.append(fill);
  mount.append(bar);
  const text = el('p');
  text.append(
    el('b', `${earned} of 55 earned — ${pct}%`),
    document.createTextNode(` · Platinum ${byGrade('platinum')}/1 · Gold ${byGrade('gold')}/2 · Silver ${byGrade('silver')}/6 · Bronze ${byGrade('bronze')}/46 · Progress saves in this browser (localStorage); export it to keep it.`),
  );
  mount.append(text);
}

export function renderChecklist(doc, state, filters, mount, headMount, onSelect, selectedId) {
  const list = visibleTrophies(doc, filters);
  headMount.replaceChildren();
  headMount.append(
    el('b', `Showing ${list.length} of 55 trophies`),
    document.createTextNode(` — tick a trophy when you earn it; click its name to read the guide.`),
  );
  mount.replaceChildren();
  for (const t of list) {
    const li = document.createElement('li');
    if (t.id === selectedId) li.classList.add('selected');
    if (state.earned.includes(t.id)) li.classList.add('earned');
    if (isMasked(t, state)) li.classList.add('masked');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.includes(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEarned(state, t.id);
      onSelect(t.id, true);
    });
    const body = el('div');
    const nameRow = el('div', null, 'tname');
    nameRow.append(document.createTextNode(displayName(t, state)), gradeBadge(t.grade));
    body.append(nameRow);
    body.append(el('div', displayDescription(t, state), 'tdesc'));
    const meta = el('div', null, 'tmeta');
    meta.append(el('span', kindLabel(t.kind), 'tag'));
    if (t.missable === 'potential') meta.append(el('span', 'MISSABLE', 'tag miss'));
    if (t.hidden) meta.append(el('span', 'Hidden', 'tag hiddenTag'));
    if (t.stage) meta.append(el('span', `Stage ${t.stage}`, 'tag'));
    if (t.status === 'steps unconfirmed') meta.append(el('span', 'Steps unconfirmed', 'tag'));
    if (t.status === 'not yet known') meta.append(el('span', 'Not yet known', 'tag'));
    body.append(meta);
    const count = el('span', null, 'tcount');
    if (t.target != null) count.textContent = `${counterValue(state, t.id)} / ${t.target.toLocaleString('en-US')}`;
    li.append(box, body, count);
    li.addEventListener('click', () => onSelect(t.id, false));
    mount.append(li);
  }
}

export function renderDetail(doc, state, trophy, pane, onCounterChange) {
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'Pick a trophy on the left to read its guide.'));
    return;
  }
  const masked = isMasked(trophy, state);
  pane.append(el('h3', displayName(trophy, state)));
  const sub = el('p', null, 'sub');
  sub.append(
    document.createTextNode(`${displayDescription(trophy, state)} `),
    gradeBadge(trophy.grade),
    document.createTextNode(` ${kindLabel(trophy.kind)}${trophy.hidden ? ' · Hidden' : ''}${trophy.missable === 'potential' ? ' · Potentially missable' : ''}`),
  );
  pane.append(sub);
  pane.append(el('h4', 'Sources'));
  sourceLinks(trophy, pane);
  if (masked) {
    pane.append(el('p', 'Spoiler mode is on. Earn this trophy — or switch spoilers off — to read its guide.'));
    return;
  }
  if (trophy.status === 'not yet known') {
    pane.append(el('div', 'PowerPyx lists this trophy as “not yet known”. The exact trigger is not confirmed by any source, so this guide states only what the official description says and guesses nothing.', 'unknownbox'));
  } else if (trophy.status === 'steps unconfirmed') {
    pane.append(el('div', 'Steps unconfirmed: at least two independent guides agree on what this trophy asks for, but no source has pinned down the exact spot or trigger yet. The steps below are the agreed description — treat the details as unconfirmed.', 'unknownbox'));
  }
  if (trophy.missable === 'potential') {
    pane.append(el('div', trophy.missNote, 'warnbox'));
  }
  pane.append(el('h4', 'Guide'));
  pane.append(el('p', trophy.guide));
  if (trophy.steps && trophy.steps.length) {
    pane.append(el('h4', 'Steps'));
    const ol = el('ol');
    for (const step of trophy.steps) ol.append(el('li', step));
    pane.append(ol);
  }
  if (trophy.where) {
    pane.append(el('h4', 'Where'));
    pane.append(el('p', trophy.where));
  }
  if (trophy.when) {
    pane.append(el('h4', 'When'));
    pane.append(el('p', trophy.when));
  }
  if (trophy.missNote && trophy.missable !== 'potential') {
    pane.append(el('h4', 'Can it be missed?'));
    pane.append(el('p', trophy.missNote));
  }
  if (trophy.target != null) {
    pane.append(el('h4', 'Your counter'));
    const line = el('div', null, 'counterline');
    const val = el('span', `${counterValue(state, trophy.id)} / ${trophy.target.toLocaleString('en-US')}${trophy.targetLabel ? ` — ${trophy.targetLabel}` : ''}`, 'cval');
    const minus = el('button', '−');
    minus.type = 'button';
    minus.addEventListener('click', () => { setCounter(state, trophy.id, counterValue(state, trophy.id) - 1, trophy.target); onCounterChange(); });
    const plus = el('button', '+');
    plus.type = 'button';
    plus.addEventListener('click', () => { setCounter(state, trophy.id, counterValue(state, trophy.id) + 1, trophy.target); onCounterChange(); });
    const step10 = el('button', '+10');
    step10.type = 'button';
    step10.addEventListener('click', () => { setCounter(state, trophy.id, counterValue(state, trophy.id) + 10, trophy.target); onCounterChange(); });
    line.append(minus, val, plus, step10);
    pane.append(line);
  }
  pane.append(el('h4', 'Your note'));
  const note = document.createElement('textarea');
  note.className = 'notebox';
  note.placeholder = 'Where did you find it? What worked? (saved in this browser)';
  note.value = state.notes[trophy.id] ?? '';
  note.addEventListener('change', () => setNote(state, trophy.id, note.value));
  pane.append(note);
}

// --- Roadmap data (PowerPyx, cross-checked against AlcastHQ) ---

const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Story first (Chapters 1–5, ~60–80 h)',
    hours: '60–80 h',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 28],
    items: [
      'Play the story in order; every chapter and mission trophy lands here.',
      'Chapter 1 FIRST: meditate at Lucia’s balcony spot — the one missable (see Missables).',
      'Manual save at the start of every chapter — there is no mission replay.',
      'Finish the five contact strands (Andy, Kenton, Billy, Randy, Tyrone).',
      'Scan vehicles and study animals as you travel — it already counts toward 100%.',
    ],
  },
  {
    n: 2,
    title: 'Stage 2 — Open-world sweep (~100 h)',
    hours: '~100 h',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 25, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
    items: [
      'Collectibles: 15 of 18 card sets, 100 WAiNK spots, 18 meditation spots, 8 garages, 52 areas.',
      'Activities: 250 stunts (of 397), 42 gold shooting-range medals, 20 races, drone races at all 14 spots.',
      'Robberies and money: 5 bank vaults, armored trucks, 22 banks, $250,000 laundered, $100,000 spent.',
      'Stranger strands to 8, gang operations for all 9 gangs, a unique animal for Bret.',
    ],
  },
  {
    n: 3,
    title: 'Stage 3 — Clean-up to 100% and the platinum (~10 h)',
    hours: '~10 h',
    trophyIds: [1, 14],
    items: [
      'Work the 35-item 100% checklist below until A Long Road pops.',
      'Then mop up anything left — the platinum follows the other 54.',
    ],
  },
];

const STORY_MAP = [
  { id: 2, mission: 'Gone Fishing (opening mission)', chapter: 'Chapter 1' },
  { id: 3, mission: 'Complete Chapter 1', chapter: 'Chapter 1' },
  { id: 4, mission: 'Complete Chapter 2', chapter: 'Chapter 2' },
  { id: 5, mission: 'Complete Chapter 3', chapter: 'Chapter 3' },
  { id: 6, mission: 'Complete Chapter 4', chapter: 'Chapter 4' },
  { id: 7, mission: 'Complete the final mission', chapter: 'Chapter 5' },
  { id: 8, mission: 'Breakfast Run', chapter: 'Chapter 1' },
  { id: 9, mission: 'The Cartel Heist', chapter: 'Chapter 2' },
  { id: 10, mission: 'Child’s Play', chapter: 'Chapter 2' },
  { id: 11, mission: 'Headliners', chapter: 'Chapter 3' },
  { id: 12, mission: 'VCIA Takedown', chapter: 'Chapter 3' },
  { id: 13, mission: 'Operation Savage Glory', chapter: 'Chapter 4' },
  { id: 22, mission: 'Andy — final mission of the strand', chapter: 'Strand (Ch. 1–5)' },
  { id: 23, mission: 'Kenton — final mission of the strand', chapter: 'Strand (Ch. 1–5)' },
  { id: 24, mission: 'Billy — final mission of the strand', chapter: 'Strand (Ch. 1–5)' },
  { id: 26, mission: 'Randy — final mission of the strand', chapter: 'Strand (Ch. 1–5)' },
  { id: 27, mission: 'Tyrone — final mission of the strand', chapter: 'Strand (Ch. 1–5)' },
];

const NEEDS_VS_ASKS = [
  ['Stunts', '250', '300', '397'],
  ['Races won (different)', '20', '30', '—'],
  ['Meditation spots', '18 (all)', '15', '18'],
  ['Vehicles scanned', '100', '200', '277'],
  ['Animals studied', '—', '100', '255'],
  ['Challenges finished', '50', '70', '80'],
];

const HUNDRED_35 = [
  { group: 'Story & tasks (12)', label: 'Chapter 1 complete', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Chapter 2 complete', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Chapter 3 complete', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Chapter 4 complete', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Chapter 5 / final mission', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Andy — final mission', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Kenton — final mission', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Billy — final mission', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Randy — final mission', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Tyrone — final mission', need: 1, total: 1 },
  { group: 'Story & tasks (12)', label: 'Stranger mission strands', need: 8, total: 8 },
  { group: 'Story & tasks (12)', label: 'Optional tasks', need: 100, total: 100 },
  { group: 'Exploration & activities (20)', label: 'Collectible card sets', need: 15, total: 18 },
  { group: 'Exploration & activities (20)', label: 'Vehicles scanned', need: 200, total: 277 },
  { group: 'Exploration & activities (20)', label: 'Animals studied', need: 100, total: 255 },
  { group: 'Exploration & activities (20)', label: 'Weapons collected', need: 50, total: 66 },
  { group: 'Exploration & activities (20)', label: 'Challenges finished', need: 70, total: 80 },
  { group: 'Exploration & activities (20)', label: 'Shooting-range gold medals', need: 42, total: 42 },
  { group: 'Exploration & activities (20)', label: 'Stunts completed', need: 300, total: 397 },
  { group: 'Exploration & activities (20)', label: 'Stunt jumps', need: 130, total: 130 },
  { group: 'Exploration & activities (20)', label: 'Flights under bridges', need: 202, total: 202 },
  { group: 'Exploration & activities (20)', label: 'Knife flights', need: 40, total: 40 },
  { group: 'Exploration & activities (20)', label: 'Base jumps', need: 25, total: 25 },
  { group: 'Exploration & activities (20)', label: 'Race challenge gold medals', need: 10, total: 13 },
  { group: 'Exploration & activities (20)', label: 'Banks robbed', need: 22, total: 22 },
  { group: 'Exploration & activities (20)', label: 'Payday loans', need: 7, total: 7 },
  { group: 'Exploration & activities (20)', label: 'Smash ’N’ Grabs', need: 35, total: 35 },
  { group: 'Exploration & activities (20)', label: 'Bank vaults robbed', need: 8, total: 8 },
  { group: 'Exploration & activities (20)', label: 'Gang operations', need: 39, total: 39 },
  { group: 'Exploration & activities (20)', label: 'Meditation spots', need: 15, total: 18 },
  { group: 'Exploration & activities (20)', label: 'WAiNK spots', need: 100, total: 100 },
  { group: 'Exploration & activities (20)', label: 'Areas explored', need: 52, total: 52 },
  { group: 'Discovery (3)', label: 'Unique animal hunted for Bret', need: 1, total: 1 },
  { group: 'Discovery (3)', label: 'Jewelry store robbed undetected', need: 1, total: 1 },
  { group: 'Discovery (3)', label: 'Armored truck robbed', need: 1, total: 1 },
];

function stageProgress(doc, state, stage) {
  const ids = STAGES[stage - 1].trophyIds;
  const done = ids.filter((id) => state.earned.includes(id)).length;
  return { done, total: ids.length };
}

export function renderRoadmap(doc, state, mount) {
  mount.replaceChildren();
  for (const s of STAGES) {
    const p = stageProgress(doc, state, s.n);
    const card = el('div', null, 'stage');
    card.append(el('h3', s.title));
    card.append(el('div', `${p.done}/${p.total} earned · ${s.hours}`, 'pct'));
    const bar = el('div', null, 'bar');
    const fill = document.createElement('i');
    fill.style.width = `${p.total ? Math.round((p.done / p.total) * 100) : 0}%`;
    bar.append(fill);
    card.append(bar);
    const ul = el('ul');
    for (const item of s.items) ul.append(el('li', item));
    card.append(ul);
    mount.append(card);
  }
}

export function renderStoryMap(doc, state, table) {
  const body = table.querySelector('tbody');
  body.replaceChildren();
  for (const row of STORY_MAP) {
    const t = trophyById(doc, row.id);
    const tr = document.createElement('tr');
    const name = el('td');
    name.append(
      document.createTextNode(displayName(t, state)),
      document.createTextNode(' '),
      gradeBadge(t.grade),
    );
    tr.append(name, el('td', row.mission), el('td', row.chapter), el('td', `Stage ${t.stage}`, 'num'));
    body.append(tr);
  }
}

export function renderNeedsVsAsks(table) {
  const body = table.querySelector('tbody');
  body.replaceChildren();
  for (const [what, need, ask, total] of NEEDS_VS_ASKS) {
    const tr = document.createElement('tr');
    tr.append(el('td', what), el('td', need, 'num'), el('td', ask, 'num'), el('td', total, 'num'));
    body.append(tr);
  }
}

export function renderChecklist100(state, mount) {
  mount.replaceChildren();
  let group = '';
  for (const item of HUNDRED_35) {
    if (item.group !== group) {
      group = item.group;
      mount.append(el('h4', group));
    }
    const row = el('div', null, 'hrow');
    row.append(el('span', item.label));
    const nums = el('span', null, 'nums');
    nums.append(
      document.createTextNode(`${item.need} / ${item.total}`),
      el('small', item.need === item.total ? ' · all' : ` · of ${item.total}`),
    );
    row.append(nums);
    mount.append(row);
  }
}

export function renderMissables(doc, state, cardsMount, tableBody) {
  const flagged = doc.trophies.filter((t) => t.missable === 'potential');
  cardsMount.replaceChildren();
  for (const t of flagged) {
    const card = el('div', null, 'misscard');
    card.append(el('h3', `⚠ ${t.name} — the only potentially missable trophy`));
    card.append(el('p', t.guide));
    const ol = el('ol');
    for (const step of t.steps ?? []) ol.append(el('li', step));
    card.append(ol);
    card.append(el('p', t.missNote));
    const src = el('p', null, 'sources');
    src.append(document.createTextNode('Sources: '));
    for (const name of t.sources ?? []) {
      const s = sourceByName(name);
      if (s && s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = s.name;
        src.append(a);
      } else {
        src.append(el('span', name));
      }
    }
    card.append(src);
    cardsMount.append(card);
  }
  tableBody.replaceChildren();
  for (const t of doc.trophies) {
    if (t.missable === 'potential') continue;
    const tr = document.createElement('tr');
    tr.append(el('td', t.name), el('td', kindLabel(t.kind)), el('td', safeReason(t)));
    tableBody.append(tr);
  }
}

export function safeReason(t) {
  if (t.id === 1) return 'Unlocks when the other 54 are earned — nothing to miss.';
  if (t.id === 14) return 'The 100% checklist stays open after the story; nothing on it locks.';
  if (t.status === 'not yet known') return 'Story moment — unlocks as the story plays; nothing to miss.';
  if (t.status === 'steps unconfirmed') return 'Not missable: the act can be done any time in free-roam; only the exact trigger is unconfirmed.';
  if (t.kind === 'story') return 'Story mission — unlocks as the story plays; no lockout.';
  if (t.kind === 'collectibles') return 'Stays in the world after the story; collect it in free-roam.';
  if (t.target != null) return 'Retryable any time in free-roam; progress counts across sessions.';
  return 'Done in free-roam, any time after the story.';
}

export function renderPlanner(doc, state, listMount, countersMount, onSelect) {
  const ordered = nextUpList(doc, state).slice(0, 12);
  listMount.replaceChildren();
  ordered.forEach((t, i) => {
    const li = document.createElement('li');
    li.append(el('span', `${i + 1}.`, 'rank'));
    const body = el('div');
    const nameRow = el('div', null, 'tname');
    nameRow.append(document.createTextNode(displayName(t, state)), gradeBadge(t.grade));
    body.append(nameRow);
    body.append(el('div', `${displayDescription(t, state)} · Stage ${t.stage} · ${kindLabel(t.kind)}`, 'tdesc'));
    li.append(body);
    if (t.target != null) li.append(el('span', `${counterValue(state, t.id)} / ${t.target.toLocaleString('en-US')}`, 'tcount'));
    li.addEventListener('click', () => onSelect(t.id, false));
    listMount.append(li);
  });
  countersMount.replaceChildren();
  for (const t of doc.trophies.filter((x) => x.target != null)) {
    const row = el('div', null, 'crow');
    row.append(el('div', `${t.name} — ${t.targetLabel}`));
    const btns = el('div', null, 'cbtns');
    const val = el('span', `${counterValue(state, t.id)} / ${t.target.toLocaleString('en-US')}`, 'cval');
    const minus = el('button', '−');
    minus.type = 'button';
    minus.addEventListener('click', () => { setCounter(state, t.id, counterValue(state, t.id) - 1, t.target); renderPlanner(doc, state, listMount, countersMount, onSelect); });
    const plus = el('button', '+');
    plus.type = 'button';
    plus.addEventListener('click', () => { setCounter(state, t.id, counterValue(state, t.id) + 1, t.target); renderPlanner(doc, state, listMount, countersMount, onSelect); });
    const step10 = el('button', '+10');
    step10.type = 'button';
    step10.addEventListener('click', () => { setCounter(state, t.id, counterValue(state, t.id) + 10, t.target); renderPlanner(doc, state, listMount, countersMount, onSelect); });
    btns.append(minus, val, plus, step10);
    row.append(btns);
    countersMount.append(row);
  }
}

export function renderNextUpStrip(doc, state, mount, onSelect) {
  mount.replaceChildren();
  mount.append(el('h3', 'Next up in this session — roadmap order, spoiler-safe'));
  const ol = el('ol');
  for (const t of nextUpList(doc, state).slice(0, 6)) {
    const li = document.createElement('li');
    li.append(
      document.createTextNode(`${displayName(t, state)} `),
      gradeBadge(t.grade),
      document.createTextNode(` — Stage ${t.stage} · ${kindLabel(t.kind)}`),
    );
    li.addEventListener('click', () => onSelect(t.id, false));
    ol.append(li);
  }
  mount.append(ol);
  const counters = doc.trophies.filter((x) => x.target != null && counterValue(state, x.id) > 0);
  const line = el('p', null, 'strip-counters');
  if (counters.length) {
    line.append(document.createTextNode('Counters in progress: '));
    counters.slice(0, 4).forEach((t, i) => {
      if (i) line.append(document.createTextNode(' · '));
      line.append(el('b', `${t.name} ${counterValue(state, t.id)}/${t.target.toLocaleString('en-US')}`));
    });
  } else {
    line.textContent = 'No counters started yet — open a counted trophy and tap + to log progress.';
  }
  mount.append(line);
}

export function renderSources(table) {
  const body = table.querySelector('tbody');
  body.replaceChildren();
  for (const s of SOURCES) {
    const tr = document.createElement('tr');
    const nameCell = el('td');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      nameCell.append(a);
    } else {
      nameCell.append(el('b', s.name));
    }
    tr.append(nameCell, el('td', s.supports));
    body.append(tr);
  }
}

// Spoiler mode: re-render every view that shows trophy names so masked
// trophies stay masked everywhere, and mark the page so masked rows read as
// hidden even at a glance.
export function renderSpoiler(doc, state, mounts) {
  document.body.classList.toggle('spoiler-on', Boolean(state.spoiler));
  mounts.renderAll();
}
