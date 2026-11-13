import Database from '@tauri-apps/plugin-sql';
import type { LessonProgress, ProgressStore, TermStats } from './types';

/** Versioned migrations — append only, never edit an applied one. */
const MIGRATIONS: string[] = [
  `CREATE TABLE term_stats (key TEXT PRIMARY KEY, seen INTEGER NOT NULL, correct INTEGER NOT NULL,
     wrong INTEGER NOT NULL, last_seen INTEGER NOT NULL, due INTEGER NOT NULL, card TEXT NOT NULL);
   CREATE TABLE lesson_progress (key TEXT PRIMARY KEY, done INTEGER NOT NULL, at INTEGER NOT NULL);
   CREATE TABLE settings (k TEXT PRIMARY KEY, v TEXT NOT NULL);`,
];

export class SqliteStore implements ProgressStore {
  private constructor(private db: Database) {}

  static async open(): Promise<SqliteStore> {
    const db = await Database.load('sqlite:tutor.db');
    await db.execute('CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)');
    const rows = await db.select<{ v: string }[]>("SELECT v FROM meta WHERE k='schema'");
    let ver = rows.length ? Number(rows[0].v) : 0;
    for (; ver < MIGRATIONS.length; ver++) {
      for (const stmt of MIGRATIONS[ver].split(';').map((s) => s.trim()).filter(Boolean)) await db.execute(stmt);
      await db.execute("INSERT OR REPLACE INTO meta (k,v) VALUES ('schema', $1)", [String(ver + 1)]);
    }
    return new SqliteStore(db);
  }

  private static row(r: any): TermStats {
    return { key: r.key, seen: r.seen, correct: r.correct, wrong: r.wrong, lastSeen: r.last_seen, due: r.due, card: r.card };
  }
  async getStats(key: string) {
    const r = await this.db.select<any[]>('SELECT * FROM term_stats WHERE key=$1', [key]);
    return r[0] ? SqliteStore.row(r[0]) : undefined;
  }
  async putStats(s: TermStats) {
    await this.db.execute(
      'INSERT OR REPLACE INTO term_stats (key,seen,correct,wrong,last_seen,due,card) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [s.key, s.seen, s.correct, s.wrong, s.lastSeen, s.due, s.card]);
  }
  async allStats(prefix = '') {
    const r = await this.db.select<any[]>('SELECT * FROM term_stats WHERE key LIKE $1', [prefix + '%']);
    return r.map(SqliteStore.row);
  }
  async setLesson(p: LessonProgress) {
    await this.db.execute('INSERT OR REPLACE INTO lesson_progress (key,done,at) VALUES ($1,$2,$3)', [p.key, p.done ? 1 : 0, p.at]);
  }
  async allLessons() {
    const r = await this.db.select<any[]>('SELECT * FROM lesson_progress');
    return r.map((x) => ({ key: x.key, done: !!x.done, at: x.at }));
  }
  async getSetting(k: string) {
    const r = await this.db.select<{ v: string }[]>('SELECT v FROM settings WHERE k=$1', [k]);
    return r[0]?.v;
  }
  async setSetting(k: string, v: string) {
    await this.db.execute('INSERT OR REPLACE INTO settings (k,v) VALUES ($1,$2)', [k, v]);
  }
}
