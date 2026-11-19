// Boot: loads the trophy data, wires the toolbar and tabs, and renders the
// current view. Address parameters (for screenshots and sharing):
// ?view=checklist|roadmap|missables|planner|sources, ?trophy=<id> opens a
// guide, ?spoiler=on hides story trophies, ?seed=13 seeds demo progress.
import { loadTrophyData, trophyById } from './data.js';
import { loadState, saveState, exportProgress, importProgress, seedDemo, blankState } from './store.js';
import {
  renderHeaderStats,
  renderProgressLine,
  renderChecklist,
  renderDetail,
  renderRoadmap,
  renderStoryMap,
  renderNeedsVsAsks,
  renderChecklist100,
  renderMissables,
  renderPlanner,
  renderNextUpStrip,
  renderSources,
  renderSpoiler,
} from './views.js';

const params = new URLSearchParams(location.search);
const doc = await loadTrophyData();
let state = loadState();

if (params.get('seed') === '13') {
  state = seedDemo(state, doc);
  document.getElementById('demoNote').hidden = false;
}
if (params.get('spoiler') === 'on') {
  state.spoiler = true;
  saveState(state);
}

const filters = {
  kind: params.get('kind') ?? 'all',
  grade: 'all',
  search: '',
};
let selectedId = Number(params.get('trophy') ?? 28);
let currentView = params.get('view') ?? 'checklist';
if (!['checklist', 'roadmap', 'missables', 'planner', 'sources'].includes(currentView)) currentView = 'checklist';
if (!doc.trophies.some((t) => t.id === selectedId)) selectedId = 28;

const $ = (id) => document.getElementById(id);

function renderAll() {
  renderHeaderStats(doc, state, $('mastheadStats'));
  renderProgressLine(doc, state, $('progressLine'));
  renderChecklist(doc, state, filters, $('trophyList'), $('listHead'), selectTrophy, selectedId);
  renderDetail(doc, state, trophyById(doc, selectedId), $('detailPane'), renderAll);
  renderNextUpStrip(doc, state, $('nextUpStrip'), selectTrophy);
  renderRoadmap(doc, state, $('stages'));
  renderStoryMap(doc, state, $('storyMap'));
  renderNeedsVsAsks($('needsTable'));
  renderChecklist100(state, $('hundred'));
  renderMissables(doc, state, $('missableCards'), document.querySelector('#safeTable tbody'));
  renderPlanner(doc, state, $('nextUp'), $('counters'), selectTrophy);
  renderSources($('sourcesTable'));
}

function selectTrophy(id, rerender) {
  selectedId = id;
  showView('checklist');
  if (rerender) renderAll();
  else {
    renderChecklist(doc, state, filters, $('trophyList'), $('listHead'), selectTrophy, selectedId);
    renderDetail(doc, state, trophyById(doc, selectedId), $('detailPane'), renderAll);
    renderHeaderStats(doc, state, $('mastheadStats'));
    renderProgressLine(doc, state, $('progressLine'));
  }
}

function showView(view) {
  currentView = view;
  document.title = `Leonida Platinum Roadbook v2 — ${view.charAt(0).toUpperCase() + view.slice(1)}`;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.hidden = section.id !== `view-${view}`;
  }
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}

for (const chip of document.querySelectorAll('#kindChips .chip')) {
  chip.classList.toggle('active', chip.dataset.kind === filters.kind);
  chip.addEventListener('click', () => {
    filters.kind = chip.dataset.kind;
    for (const c of document.querySelectorAll('#kindChips .chip')) c.classList.toggle('active', c === chip);
    renderChecklist(doc, state, filters, $('trophyList'), $('listHead'), selectTrophy, selectedId);
  });
}

$('grade').addEventListener('change', (e) => {
  filters.grade = e.target.value;
  renderChecklist(doc, state, filters, $('trophyList'), $('listHead'), selectTrophy, selectedId);
});

$('search').addEventListener('input', (e) => {
  filters.search = e.target.value;
  renderChecklist(doc, state, filters, $('trophyList'), $('listHead'), selectTrophy, selectedId);
});

const spoilerBox = $('spoiler');
spoilerBox.checked = state.spoiler;
spoilerBox.addEventListener('change', () => {
  state.spoiler = spoilerBox.checked;
  saveState(state);
  renderSpoiler(doc, state, { renderAll });
});

$('exportBtn').addEventListener('click', () => exportProgress(state));

$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    state = await importProgress(file);
    spoilerBox.checked = state.spoiler;
    renderAll();
  } catch (err) {
    alert(err.message);
  }
  e.target.value = '';
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all saved progress, counters and notes?')) return;
  state = blankState();
  saveState(state);
  renderAll();
});

showView(currentView);
renderAll();
