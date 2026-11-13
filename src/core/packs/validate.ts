import Ajv from 'ajv';
import common from '../../../schemas/common.schema.json';
import manifest from '../../../schemas/manifest.schema.json';
import vocab from '../../../schemas/vocab.schema.json';
import lessons from '../../../schemas/lessons.schema.json';
import quiz from '../../../schemas/quiz.schema.json';
import texts from '../../../schemas/texts.schema.json';
import exam from '../../../schemas/exam.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
for (const s of [common, manifest, vocab, lessons, quiz, texts, exam]) ajv.addSchema(s);

export type SchemaName = 'manifest' | 'vocab' | 'lessons' | 'quiz' | 'texts' | 'exam';

export class PackError extends Error {}

export function validate(name: SchemaName, data: unknown, file: string): void {
  const fn = ajv.getSchema(name)!;
  if (!fn(data)) {
    const msg = (fn.errors ?? []).slice(0, 5).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
    throw new PackError(`${file}: ${msg}`);
  }
}
