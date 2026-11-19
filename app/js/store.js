// Saved progress: earned trophies, per-trophy target counters and personal
// notes, kept in localStorage. Export writes the whole state as one JSON file
// and import reads such a file back, so progress survives a new browser.
export const STORAGE_KEY = 'leonida-roadbook-v2';

export function blankState() {
  return { earned: [], counters: {}, notes: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoiler: Boolean(parsed.spoiler),
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function earnedSet(state) {
  return new Set(state.earned);
}

// True when the browser holds any progress at all — used to decide whether
// the Reset button needs its confirmation.
export function hasProgress(state) {
  return state.earned.length > 0 || Object.keys(state.counters).length > 0 || Object.keys(state.notes).length > 0;
}

export function toggleEarned(state, trophyId) {
  const set = earnedSet(state);
  if (set.has(trophyId)) set.delete(trophyId);
  else set.add(trophyId);
  state.earned = [...set].sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function counterValue(state, trophyId) {
  return Number(state.counters[trophyId] ?? 0);
}

export function setCounter(state, trophyId, value, target) {
  const max = Number.isFinite(target) ? target : 999999;
  state.counters[trophyId] = Math.max(0, Math.min(max, Math.round(value)));
  saveState(state);
  return state;
}

export function setNote(state, trophyId, text) {
  if (text.trim()) state.notes[trophyId] = text;
  else delete state.notes[trophyId];
  saveState(state);
  return state;
}

export function exportProgress(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-roadbook-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.earned)) {
    throw new Error('Not a Leonida Roadbook progress file.');
  }
  const state = {
    earned: parsed.earned.filter((n) => Number.isInteger(n)),
    counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    spoiler: Boolean(parsed.spoiler),
  };
  saveState(state);
  return state;
}

export function seedDemo(state, doc) {
  // Screenshot/demo seed only: the first 12 story trophies plus a few
  // part-way counters, so the checklist, the progress bar and the counters
  // all show real values in a screenshot.
  const demoEarned = doc.trophies.filter((t) => t.id >= 2 && t.id <= 13).map((t) => t.id);
  demoEarned.push(16);
  state.earned = demoEarned;
  state.counters = { 15: 121, 17: 18, 31: 47, 32: 23, 35: 64, 42: 31, 52: 82000, 53: 41000 };
  saveState(state);
  return state;
}
