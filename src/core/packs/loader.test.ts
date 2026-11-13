import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { loadPack } from './loader';
import { zipSync, strToU8 } from 'fflate';

const ids = readdirSync('packs-src').filter((n) => !n.startsWith('.'));

describe('demo packs', () => {
  for (const id of ids) {
    it(`${id} loads and passes validation + reference checks`, () => {
      const zip = new Uint8Array(readFileSync(`public/packs/${id}.zip`));
      const p = loadPack(zip);
      expect(p.manifest.id).toBe(id);
      expect(p.terms.length).toBeGreaterThan(0);
      expect(p.quiz.length).toBeGreaterThan(0);
    });
  }
});

describe('loader rejects bad packs', () => {
  const zip = (files: Record<string, unknown>) =>
    zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(JSON.stringify(v))])));
  const manifest = { schema_version: 1, id: 'x', type: 'content', subject: 's', title: 't', version: '1', languages: ['en'] };

  it('missing manifest', () => expect(() => loadPack(zip({}))).toThrow(/manifest/));
  it('newer schema', () => expect(() => loadPack(zip({ 'manifest.json': { ...manifest, schema_version: 2 } }))).toThrow());
  it('unknown term reference', () =>
    expect(() => loadPack(zip({
      'manifest.json': manifest,
      'vocab.json': { terms: [] },
      'quiz.json': { items: [{ id: 'q1', kind: 'input', prompt: 'p', terms: ['nope'], answer: 'a' }] },
    }))).toThrow(/unknown term/));
  it('path traversal', () =>
    expect(() => loadPack(zipSync({ 'manifest.json': strToU8(JSON.stringify(manifest)), '../evil': strToU8('x') }))).toThrow(/unsafe/));
});
