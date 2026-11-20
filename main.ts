// Vice City Cover Maker — entrypoint.
// Copies the finished app and its screenshots into the output directory
// and writes the dossier the grader reads, using the kit's buildDossier
// helper from vendor/makefun-app.ts. Outside the grader, the
// MAKEFUN_OUTPUT_DIR environment variable stands in for /output.

import { buildDossier } from "./vendor/makefun-app.ts";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The folder beside this file is the repo root; the grader runs the
// program with that folder read-only and /output writable.
const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyTree(source: string, target: string): void {
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, "app"), join(outputDir, "app"));
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
copyTree(join(repoRoot, "screenshots"), join(outputDir, "screenshots"));

// The scorer's own caps: only text_max_bytes shapes the dossier bytes;
// the rest refuse an entry the scorer would refuse anyway (more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB
// of app files in all; a path under app/ over 1000 bytes).
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossierText);
console.log(`Wrote ${outputDir}/dossier.json (${dossierText.length} bytes)`);
