import type { RichText, Segment } from '../types';

export function toSegments(rt: RichText | undefined): Segment[] {
  if (rt === undefined) return [];
  return typeof rt === 'string' ? [{ t: rt }] : rt;
}

export function plainText(rt: RichText | undefined): string {
  return toSegments(rt).map((s) => s.t).join('');
}

const COLORS = new Set(['red', 'green', 'blue', 'orange', 'purple', 'gray']);

/** Translate fx list to a CSS class list + safe inline style. No raw HTML is ever produced. */
export function fxToClasses(fx: string[] | undefined): string {
  if (!fx) return '';
  const out: string[] = [];
  for (const f of fx) {
    if (['bold', 'italic', 'underline', 'strike', 'mark'].includes(f)) out.push(`fx-${f}`);
    else if (f.startsWith('color:') && COLORS.has(f.slice(6))) out.push(`fx-c-${f.slice(6)}`);
    else if (/^size:(s|l|xl)$/.test(f)) out.push(`fx-${f.replace(':', '-')}`);
  }
  return out.join(' ');
}
