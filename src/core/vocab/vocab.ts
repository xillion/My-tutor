import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';
import type { ProgressStore, TermStats } from '../storage/types';

const scheduler = fsrs();
const revive = (json: string): Card => {
  const c = JSON.parse(json);
  c.due = new Date(c.due);
  if (c.last_review) c.last_review = new Date(c.last_review);
  return c as Card;
};

export type Mastery = 'new' | 'learning' | 'known';

export function mastery(s: TermStats | undefined): Mastery {
  if (!s || s.seen === 0) return 'new';
  const c = revive(s.card);
  return c.stability >= 7 && s.correct >= 3 ? 'known' : 'learning';
}

/** Record one review of a term. Creates the stats row on first contact (term enters active vocabulary). */
export async function review(store: ProgressStore, key: string, ok: boolean, now = new Date()): Promise<TermStats> {
  const prev = await store.getStats(key);
  const card = prev ? revive(prev.card) : createEmptyCard(now);
  const next = scheduler.next(card, now, ok ? Rating.Good : Rating.Again).card;
  const s: TermStats = {
    key,
    seen: (prev?.seen ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (ok ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (ok ? 0 : 1),
    lastSeen: now.getTime(),
    due: next.due.getTime(),
    card: JSON.stringify(next),
  };
  await store.putStats(s);
  return s;
}

/** Mark a term as encountered (lesson/text) without grading. */
export async function touch(store: ProgressStore, key: string, now = new Date()): Promise<void> {
  if (await store.getStats(key)) return;
  const card = createEmptyCard(now);
  await store.putStats({ key, seen: 0, correct: 0, wrong: 0, lastSeen: now.getTime(), due: now.getTime(), card: JSON.stringify(card) });
}

export async function dueTerms(store: ProgressStore, prefix: string, now = Date.now()): Promise<string[]> {
  return (await store.allStats(prefix)).filter((s) => s.due <= now).map((s) => s.key);
}
