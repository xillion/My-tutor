import { describe, it, expect } from 'vitest';
import { fxToClasses, plainText, toSegments } from './normalize';

describe('richtext', () => {
  it('wraps plain string', () => expect(toSegments('hi')).toEqual([{ t: 'hi' }]));
  it('joins plain text', () => expect(plainText([{ t: 'a' }, { t: 'b', lang: 'ru' }])).toBe('ab'));
  it('maps fx and drops unknown', () =>
    expect(fxToClasses(['bold', 'color:red', 'color:evil', 'x'])).toBe('fx-bold fx-c-red'));
});
