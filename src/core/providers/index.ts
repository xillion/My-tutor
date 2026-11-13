import { NullLlm, type LlmProvider } from './llm';
import { NullTts, type TtsProvider } from './tts';

/** Single place where optional modules are wired. Replace Null* as stages land. */
export interface Providers { tts: TtsProvider; llm: LlmProvider }
export const providers: Providers = { tts: NullTts, llm: NullLlm };
