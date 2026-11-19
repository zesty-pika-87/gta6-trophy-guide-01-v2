// Leonida Platinum Roadbook v2 — the hand-in program (Node 22, standard
// library only). The guide itself is the static app/ folder: index.html plus
// its CSS and ES modules, served by any static server with app/ at the root,
// and app/data/trophies.json holding the 55 trophies with a cited guide each.
// This program copies app/ and screenshots/ beside it into /output and writes
// /output/dossier.json with the vendored make.fun library, exactly as the
// scorer rebuilds it — leave vendor/makefun-frontend.ts untouched.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide while you work with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

// Fail loudly instead of handing in a half-built entry: the guide, its data
// and its screenshots must all be there before the dossier is written.
if (!existsSync(join(appDir, 'index.html'))) throw new Error('app/index.html is missing');
if (!existsSync(join(appDir, 'data', 'trophies.json'))) throw new Error('app/data/trophies.json is missing');
const shotFiles = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => !f.startsWith('.')) : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ needs 3 or 4 screenshots, found ${shotFiles.length}`);
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app
// files, which share /output's own 1000-entry cap with screenshots/ and
// dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
