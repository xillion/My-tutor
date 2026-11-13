import { unzipSync, strFromU8 } from 'fflate';
import type { Exam, Lesson, Manifest, Pack, QuizItem, TextDoc, Term } from '../types';
import { PackError, validate } from './validate';

export const CORE_SCHEMA_VERSION = 1;

function json<T>(files: Record<string, Uint8Array>, name: string, required = false): T | undefined {
  const raw = files[name];
  if (!raw) {
    if (required) throw new PackError(`${name}: missing in archive`);
    return undefined;
  }
  try { return JSON.parse(strFromU8(raw)) as T; }
  catch (e) { throw new PackError(`${name}: invalid JSON (${(e as Error).message})`); }
}

/** Reject path traversal / absolute paths inside the archive. */
function safePath(p: string): boolean {
  return !p.startsWith('/') && !p.split('/').includes('..') && !p.includes('\\');
}

export function loadPack(bytes: Uint8Array): Pack {
  const files = unzipSync(bytes);
  for (const k of Object.keys(files)) if (!safePath(k)) throw new PackError(`unsafe path in archive: ${k}`);

  const manifest = json<Manifest>(files, 'manifest.json', true)!;
  validate('manifest', manifest, 'manifest.json');
  if (manifest.schema_version > CORE_SCHEMA_VERSION)
    throw new PackError(`pack needs newer app (schema ${manifest.schema_version})`);

  const vocab = json<{ terms: Term[] }>(files, 'vocab.json');
  if (vocab) validate('vocab', vocab, 'vocab.json');
  const lessons = json<{ lessons: Lesson[] }>(files, 'lessons.json');
  if (lessons) validate('lessons', lessons, 'lessons.json');
  const quiz = json<{ items: QuizItem[] }>(files, 'quiz.json');
  if (quiz) validate('quiz', quiz, 'quiz.json');
  const texts = json<{ texts: TextDoc[] }>(files, 'texts.json');
  if (texts) validate('texts', texts, 'texts.json');
  const minorExam = json<Exam>(files, 'minor_exam.json');
  if (minorExam) validate('exam', minorExam, 'minor_exam.json');
  const majorExam = json<Exam>(files, 'major_exam.json');
  if (majorExam) validate('exam', majorExam, 'major_exam.json');

  const pack: Pack = {
    manifest,
    terms: vocab?.terms ?? [],
    lessons: lessons?.lessons ?? [],
    quiz: quiz?.items ?? [],
    texts: texts?.texts ?? [],
    minorExam, majorExam,
    assets: new Map(Object.entries(files).filter(([k]) => /^(images|sounds)\//.test(k))),
  };
  checkReferences(pack);
  return pack;
}

/** Cross-file integrity: every referenced id must exist. */
export function checkReferences(p: Pack): void {
  const terms = new Set(p.terms.map((t) => t.id));
  const dup = (ids: string[], what: string) => {
    if (new Set(ids).size !== ids.length) throw new PackError(`duplicate ${what} ids`);
  };
  dup(p.terms.map((t) => t.id), 'term');
  dup(p.lessons.map((l) => l.id), 'lesson');
  dup(p.quiz.map((q) => q.id), 'quiz');
  const need = (id: string, where: string) => {
    if (!terms.has(id)) throw new PackError(`${where}: unknown term "${id}"`);
  };
  for (const l of p.lessons) {
    l.terms?.forEach((t) => need(t, `lesson ${l.id}`));
    for (const b of l.blocks) if (b.kind === 'terms') b.terms.forEach((t) => need(t, `lesson ${l.id}`));
  }
  for (const q of p.quiz) q.terms?.forEach((t) => need(t, `quiz ${q.id}`));
  const quizIds = new Set(p.quiz.map((q) => q.id));
  for (const e of [p.minorExam, p.majorExam])
    e?.items.forEach((i) => { if (!quizIds.has(i)) throw new PackError(`exam ${e.id}: unknown quiz "${i}"`); });
}

export function assetUrl(pack: Pack, path: string): string | undefined {
  const b = pack.assets.get(path);
  if (!b) return undefined;
  const type = path.endsWith('.png') ? 'image/png' : path.endsWith('.svg') ? 'image/svg+xml'
    : path.endsWith('.mp3') ? 'audio/mpeg' : path.endsWith('.m4a') ? 'audio/mp4' : 'application/octet-stream';
  return URL.createObjectURL(new Blob([b as BlobPart], { type }));
}
