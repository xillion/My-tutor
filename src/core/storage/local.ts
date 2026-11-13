import type { LessonProgress, ProgressStore, TermStats } from './types';

const KEY = 'tutor.v1';
interface Blob_ { stats: Record<string, TermStats>; lessons: Record<string, LessonProgress>; settings: Record<string, string> }

export class LocalStore implements ProgressStore {
  private d: Blob_;
  constructor(private ls: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
    this.d = JSON.parse(ls.getItem(KEY) ?? '{"stats":{},"lessons":{},"settings":{}}');
  }
  private save() { this.ls.setItem(KEY, JSON.stringify(this.d)); }
  async getStats(k: string) { return this.d.stats[k]; }
  async putStats(s: TermStats) { this.d.stats[s.key] = s; this.save(); }
  async allStats(prefix = '') { return Object.values(this.d.stats).filter((s) => s.key.startsWith(prefix)); }
  async setLesson(p: LessonProgress) { this.d.lessons[p.key] = p; this.save(); }
  async allLessons() { return Object.values(this.d.lessons); }
  async getSetting(k: string) { return this.d.settings[k]; }
  async setSetting(k: string, v: string) { this.d.settings[k] = v; this.save(); }
}
