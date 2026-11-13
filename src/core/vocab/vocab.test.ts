import { describe, it, expect } from 'vitest';
import { LocalStore } from '../storage/local';
import { dueTerms, mastery, review, touch } from './vocab';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

describe('vocab', () => {
  it('touch creates new term, review grades it', async () => {
    const st = new LocalStore(mem());
    await touch(st, 'p/a');
    expect(mastery(await st.getStats('p/a'))).toBe('new');
    const s = await review(st, 'p/a', true);
    expect(s.seen).toBe(1); expect(s.correct).toBe(1);
    expect(mastery(s)).toBe('learning');
  });
  it('wrong answer schedules soon, correct later', async () => {
    const st = new LocalStore(mem());
    const now = new Date('2026-01-01T00:00:00Z');
    const bad = await review(st, 'p/b', false, now);
    const good = await review(st, 'p/c', true, now);
    expect(bad.due).toBeLessThanOrEqual(good.due);
    expect(await dueTerms(st, 'p/', now.getTime() + 1e9)).toHaveLength(2);
  });
});
