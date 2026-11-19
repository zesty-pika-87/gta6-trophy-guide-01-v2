// Trophy data: loads app/data/trophies.json and names the sources every guide
// cites. Source links are shown to the reader; the app itself never fetches
// them, so the guide stays fully offline.
export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`Could not load trophy data (${response.status})`);
  return response.json();
}

export function trophyById(doc, id) {
  return doc.trophies.find((t) => t.id === id);
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  const labels = {
    story: 'Story',
    missable: 'Missable',
    collectibles: 'Collectibles',
    activities: 'Activities',
    other: 'Other',
  };
  return labels[kind] ?? kind;
}

// Full source names with the page each fact comes from. Exophase, PSNProfiles
// and AlcastHQ are cited by name (their GTA VI pages carry the same list and
// figures); the three entries with a verified article URL link to it.
export const SOURCES = [
  {
    name: 'PowerPyx',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
    supports: 'Roadmap: difficulty 4/10, ~200 hours, 0 online, 1 potentially missable trophy, the 100% checklist counts, and which of the five “not yet known” trophies have agreed descriptions.',
  },
  {
    name: 'Exophase',
    url: '',
    supports: 'Official trophy list: the 55 names, descriptions, grades and hidden flags, as PlayStation publishes them.',
  },
  {
    name: 'PSNProfiles',
    url: '',
    supports: 'Official trophy list and the PSN progress counts behind each counted trophy (250 stunts, 42 shooting-range golds, 18 meditation spots, and the rest).',
  },
  {
    name: 'GTABase',
    url: 'https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series',
    supports: 'Full 55-trophy list with grades and Gamerscore; confirms the 1 / 2 / 6 / 46 split, no online trophies, and Positive Mental Attitude as the one possible missable.',
  },
  {
    name: 'AlcastHQ',
    url: '',
    supports: 'Roadmap figures cross-checked against PowerPyx: the 100% checklist numbers (200 of 277 vehicles, 100 of 255 animals, 70 of 80 challenges, 300 of 397 stunts) agree.',
  },
  {
    name: 'Push Square',
    url: 'https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap',
    supports: 'Trophy guide and roadmap: the 55-trophy list via Exophase, 100% completion for the platinum, 15 of 18 card sets, 397 stunts in total.',
  },
];

export function sourceByName(name) {
  return SOURCES.find((s) => s.name === name);
}

// One trophy's sources as { name, url } pairs, in the order the guide lists
// them, for the detail pane and the missables card.
export function sourceLinksFor(trophy) {
  return (trophy.sources ?? ['Exophase', 'PSNProfiles']).map(
    (name) => sourceByName(name) ?? { name, url: '' },
  );
}
