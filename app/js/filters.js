// Filtering and the spoiler mask: which trophies a filter shows, and what a
// hidden story trophy looks like while spoilers are hidden.
export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === 'potential';
  if (kind === 'hidden') return trophy.hidden === true;
  return trophy.kind === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  if (!query) return true;
  const hay = `${trophy.name} ${trophy.description} ${trophy.mission ?? ''} ${trophy.where ?? ''}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
}

export function visibleTrophies(doc, filters) {
  return doc.trophies.filter(
    (t) => matchesKind(t, filters.kind) && matchesGrade(t, filters.grade) && matchesSearch(t, filters.search),
  );
}

// A hidden trophy stays masked until it is earned: its name and description
// are replaced, never shown, while the spoiler setting is on.
export function isMasked(trophy, state) {
  return Boolean(state.spoiler) && trophy.hidden === true && !state.earned.includes(trophy.id);
}

export function isEarned(trophy, state) {
  return state.earned.includes(trophy.id);
}

export function displayName(trophy, state) {
  return isMasked(trophy, state) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, state) {
  return isMasked(trophy, state) ? 'Hidden story trophy — earn it to reveal.' : trophy.description;
}

// Roadmap order for the planner: stage first, then the trophy's place in
// the official list, so story trophies come before the open-world sweep.
export function nextUpList(doc, state) {
  return [...doc.trophies]
    .filter((t) => !state.earned.includes(t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id);
}
