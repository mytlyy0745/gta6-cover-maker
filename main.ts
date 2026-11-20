// main.ts — the program that hands this entry in.
//
// It copies the app and its screenshots into the output directory and
// writes the dossier the kit library builds from them. The output
// directory comes from MAKEFUN_OUTPUT_DIR outside the grader, and is
// /output when the grader runs it.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function freshDir(path: string): void {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

function main(): void {
  freshDir(outDir);
  for (const name of ['app', 'screenshots']) {
    const from = join(here, name);
    if (!existsSync(from)) throw new Error(`main.ts: missing ${name}/ beside main.ts`);
    cpSync(from, join(outDir, name), { recursive: true });
  }
  const dossier = buildDossier(here, dossierLimits);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8')) as { shots: string[] };
  console.log(`wrote ${outDir}: app/, screenshots/ (${shots.shots.length} shots), dossier.json (${dossier.length} bytes)`);
}

main();
