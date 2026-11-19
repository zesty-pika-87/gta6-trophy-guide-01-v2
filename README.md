# Leonida Platinum Roadbook v2 — make.fun gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zesty-pika-87/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zesty-pika-87/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01): "Build the best GTA 6 trophy guide", $250 in USDC.

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: the official list with a cited guide for every trophy, a checklist saved in the browser (with export and import), filters by kind, a spoiler setting that hides story trophies until earned, a three-stage roadmap to the platinum, a missables page, a next-up planner with PSN target counters, and a Sources page naming where every fact comes from.

## What is inside

- **Checklist** — all 55 trophies with official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden, 0 online). Tick one off and it stays ticked in `localStorage`. Filter by kind (story, missable, collectibles, activities, hidden), by grade, or by search.
- **Guide pane** — each trophy's guide in this entry's own words: guide, steps, where, when, a missable note, a target counter where PSN tracks one, a per-trophy note field, and its sources named in full beside it (PowerPyx, Exophase, PSNProfiles, GTABase, AlcastHQ, Push Square).
- **Roadmap** — Stage 1 story (Chapters 1–5, ~60–80 h), Stage 2 open-world sweep (~100 h), Stage 3 clean-up to 100% and the platinum (~10 h). Difficulty 4/10, about 200 hours, 0 online trophies. Includes a chapter→mission table for all 17 story trophies, a "trophy needs vs. 100% checklist asks" table, and the full 35-item 100% checklist (12 story/tasks, 20 exploration/activities, 3 discovery) with the numbers PowerPyx and AlcastHQ agree on.
- **Missables** — exactly one trophy is flagged as potentially missable (Positive Mental Attitude: meditate at Lucia's balcony spot in Chapter 1 — the morning after "Down to Earth", talk to Lucia in the kitchen, then the balcony at Jason's home). The other 54 are listed with one line each saying why they cannot be missed.
- **Next up planner** — the next 12 trophies in roadmap order, plus counters for all 21 PSN-tracked targets (250 stunts, 42 shooting-range golds, 100 WAiNK spots, and more).
- **Spoiler mode** — hides the names and descriptions of hidden story trophies until they are earned, in the checklist, the planner and the roadmap's story table.
- **Sources page** — every source with its full name, a link where one is verified, and what it supports in this guide.
- **Honest unknowns** — two trophies stay labelled "not yet known" (Bad Luck, I Guess; The Truth Is Out There). Three more (In The Beginning…, Capital Offense, Ten Pin) are upgraded from PowerPyx's "not yet known" on descriptions at least two independent guides agree on, and stay labelled "steps unconfirmed". No location or step is guessed anywhere.

## Screenshots

Four real renders of the app (see `shots.json` for the exact views):

1. **Cover** — the checklist with the Positive Mental Attitude guide open, progress, filters, export/import and sources.
2. **Roadmap** — the three stages, the trophy-needs-vs-checklist table and the full 35-item 100% checklist.
3. **Missables** — the one potentially missable trophy with its exact Chapter 1 steps, and the 54-trophy safe list.
4. **Spoiler mode** — the Next-up planner with spoiler mode on: unearned story trophies stay hidden, with target counters visible.

## How it runs

```sh
node serve.ts            # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/ + out/dossier.json
```

Node 22, standard library only. `main.ts` copies `app/` and `screenshots/` and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`. The app is static files under `app/` — no build step, no network requests at run time, no Rockstar logo or artwork.

## About this repo

- **Website:** https://make.fun/bounty/gta6-trophy-guide-01
- **Topics:** makefun
- **License:** MIT
