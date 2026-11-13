// Zips every packs-src/<id>/ into public/packs/<id>.zip and writes public/packs/index.json
import { zipSync } from 'fflate';
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = 'packs-src', OUT = 'public/packs';
mkdirSync(OUT, { recursive: true });

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const index = [];
for (const id of readdirSync(SRC)) {
  const root = join(SRC, id);
  if (!statSync(root).isDirectory()) continue;
  const files = {};
  for (const f of walk(root)) {
    if (f.endsWith('.gitkeep')) continue;
    files[relative(root, f).split('\\').join('/')] = readFileSync(f);
  }
  writeFileSync(join(OUT, `${id}.zip`), zipSync(files, { level: 9 }));
  index.push(id);
  console.log(`packed ${id} (${Object.keys(files).length} files)`);
}
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index));
