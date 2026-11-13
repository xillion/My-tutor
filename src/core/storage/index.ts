import type { ProgressStore } from './types';
import { LocalStore } from './local';

export const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export async function openStore(): Promise<ProgressStore> {
  if (isTauri()) {
    const { SqliteStore } = await import('./sqlite');
    return SqliteStore.open();
  }
  return new LocalStore();
}
export type { ProgressStore, TermStats } from './types';
