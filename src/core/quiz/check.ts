import type { QuizItem } from '../types';

const norm = (s: string) => s.trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');

export function checkInput(item: QuizItem, given: string): boolean {
  const answers = Array.isArray(item.answer) ? item.answer : [String(item.answer ?? '')];
  return answers.some((a) => norm(a) === norm(given));
}
export function checkChoice(item: QuizItem, index: number): boolean {
  return item.answer === index;
}
/** pairs the user made, as [left,right]; correct iff every made pair exists in item.pairs and all are made */
export function checkMatch(item: QuizItem, made: Array<[string, string]>): boolean {
  const truth = new Set((item.pairs ?? []).map(([a, b]) => `${a}\u0000${b}`));
  return made.length === truth.size && made.every(([a, b]) => truth.has(`${a}\u0000${b}`));
}

export function shuffle<T>(arr: T[], rnd = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
