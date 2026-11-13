import { describe, it, expect } from 'vitest';
import { checkChoice, checkInput, checkMatch } from './check';
import type { QuizItem } from '../types';

const base = { id: 'q', prompt: 'p' } as const;
describe('quiz check', () => {
  it('input is case/space/ё-insensitive', () => {
    const q: QuizItem = { ...base, kind: 'input', answer: ['зелёный'] };
    expect(checkInput(q, '  Зеленый ')).toBe(true);
    expect(checkInput(q, 'red')).toBe(false);
  });
  it('choice', () => expect(checkChoice({ ...base, kind: 'choice', answer: 1 }, 1)).toBe(true));
  it('match requires all pairs', () => {
    const q: QuizItem = { ...base, kind: 'match', pairs: [['a', '1'], ['b', '2']] };
    expect(checkMatch(q, [['a', '1'], ['b', '2']])).toBe(true);
    expect(checkMatch(q, [['a', '2'], ['b', '1']])).toBe(false);
    expect(checkMatch(q, [['a', '1']])).toBe(false);
  });
});
