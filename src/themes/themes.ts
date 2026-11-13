export type Mode = 'light' | 'dark';
export interface ThemeInfo { id: string; name: string; emoji: string }

/** Add a new theme: create src/themes/<id>.css defining [data-theme="<id>"][data-mode=...] variables, then register here. */
export const THEMES: ThemeInfo[] = [
  { id: 'minecraft', name: 'Блоки', emoji: '🟩' },
];

export interface ThemeChoice { theme: string; mode: Mode }

export function systemMode(): Mode {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(c: ThemeChoice, root: HTMLElement = document.documentElement) {
  root.dataset.theme = c.theme;
  root.dataset.mode = c.mode;
}

export function parseChoice(raw: string | undefined): ThemeChoice {
  try {
    const c = JSON.parse(raw ?? '');
    if (THEMES.some((t) => t.id === c.theme) && (c.mode === 'light' || c.mode === 'dark')) return c;
  } catch { /* fall through */ }
  return { theme: THEMES[0].id, mode: systemMode() };
}
