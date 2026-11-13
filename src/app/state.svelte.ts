import { loadPack } from '../core/packs/loader';
import { openStore, type ProgressStore } from '../core/storage';
import { detectCapabilities, type Capabilities } from '../core/capabilities';
import { applyTheme, parseChoice, type ThemeChoice } from '../themes/themes';
import type { Pack, QuizItem } from '../core/types';

export type View =
  | { name: 'library' }
  | { name: 'pack'; pack: string }
  | { name: 'lesson'; pack: string; lesson: string }
  | { name: 'quiz'; pack: string; title: string; items: QuizItem[]; passRatio?: number }
  | { name: 'vocab'; pack: string }
  | { name: 'settings' };

class AppState {
  view = $state<View>({ name: 'library' });
  packs = $state<Pack[]>([]);
  theme = $state<ThemeChoice>({ theme: 'minecraft', mode: 'light' });
  caps = $state<Capabilities | null>(null);
  error = $state<string | null>(null);
  ready = $state(false);
  store!: ProgressStore;

  async init() {
    this.store = await openStore();
    this.theme = parseChoice(await this.store.getSetting('theme'));
    applyTheme(this.theme);
    this.caps = await detectCapabilities();
    await this.loadBundled();
    this.ready = true;
  }

  async loadBundled() {
    try {
      const ids: string[] = await (await fetch('/packs/index.json')).json();
      for (const id of ids) {
        const bytes = new Uint8Array(await (await fetch(`/packs/${id}.zip`)).arrayBuffer());
        this.addPack(loadPack(bytes));
      }
    } catch (e) { this.error = `Не удалось загрузить встроенные паки: ${(e as Error).message}`; }
  }

  addPack(p: Pack) {
    const i = this.packs.findIndex((x) => x.manifest.id === p.manifest.id);
    if (i >= 0) this.packs[i] = p; else this.packs.push(p);
  }

  async importFile(file: File) {
    try { this.addPack(loadPack(new Uint8Array(await file.arrayBuffer()))); this.error = null; }
    catch (e) { this.error = `Пак «${file.name}» не загружен: ${(e as Error).message}`; }
  }

  pack(id: string) { return this.packs.find((p) => p.manifest.id === id)!; }
  go(v: View) { this.view = v; }

  async setTheme(c: ThemeChoice) {
    this.theme = c; applyTheme(c);
    await this.store.setSetting('theme', JSON.stringify(c));
  }
}
export const app = new AppState();
