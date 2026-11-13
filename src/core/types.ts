export type Fx = string; // bold|italic|underline|strike|mark|color:<name>|size:s|l|xl
export interface Segment { t: string; lang?: string; fx?: Fx[]; term?: string; audio?: string }
export type RichText = string | Segment[];

export interface Manifest {
  schema_version: 1;
  id: string;
  type: 'content' | 'game';
  subject: string;
  title: string;
  description?: string;
  version: string;
  languages: string[];
  requires?: { core?: string };
  optional?: Array<'tts' | 'ai' | 'game' | 'pen'>;
  sections?: Array<{ id: string; title: string; lessons?: string[] }>;
}

export type TermType = 'word' | 'concept' | 'definition' | 'law' | 'constant' | 'lemma';
export interface Term {
  id: string; type: TermType; text: RichText; meaning?: RichText;
  ipa?: string; audio?: string; image?: string; tags?: string[];
}

export type LessonBlock =
  | { kind: 'heading' | 'text' | 'note'; body: RichText }
  | { kind: 'image' | 'audio'; src: string }
  | { kind: 'terms'; terms: string[] };
export interface Lesson { id: string; title: string; section?: string; terms?: string[]; blocks: LessonBlock[] }

export interface QuizItem {
  id: string; kind: 'choice' | 'input' | 'match'; section?: string; lesson?: string;
  terms?: string[]; prompt: RichText; options?: RichText[];
  answer?: number | string | string[]; pairs?: Array<[string, string]>; explain?: RichText;
}
export interface TextDoc { id: string; title: string; section?: string; body: RichText; hints?: unknown[] }
export interface Exam { id: string; title: string; pass_ratio?: number; items: string[] }

/** Loaded, validated, immutable content pack. Assets are resolved to object URLs lazily. */
export interface Pack {
  manifest: Manifest;
  terms: Term[];
  lessons: Lesson[];
  quiz: QuizItem[];
  texts: TextDoc[];
  minorExam?: Exam;
  majorExam?: Exam;
  /** path inside the archive (e.g. "images/cat.png") -> bytes */
  assets: Map<string, Uint8Array>;
}

/** Global term key: "<packId>/<termId>" — stats are stored against this. */
export const termKey = (packId: string, termId: string) => `${packId}/${termId}`;
