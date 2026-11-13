export interface TermStats {
  key: string;          // "<packId>/<termId>"
  seen: number;
  correct: number;
  wrong: number;
  lastSeen: number;     // epoch ms
  due: number;          // epoch ms
  /** serialized ts-fsrs Card */
  card: string;
}
export interface LessonProgress { key: string; done: boolean; at: number }

/** Persistence port. Implementations: SQLite (Tauri), localStorage (browser dev). */
export interface ProgressStore {
  getStats(key: string): Promise<TermStats | undefined>;
  putStats(s: TermStats): Promise<void>;
  allStats(prefix?: string): Promise<TermStats[]>;
  setLesson(p: LessonProgress): Promise<void>;
  allLessons(): Promise<LessonProgress[]>;
  getSetting(k: string): Promise<string | undefined>;
  setSetting(k: string, v: string): Promise<void>;
}
