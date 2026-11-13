/** Stage 1 will add NativeTts (Rust `tts` crate), PiperTts, WebSpeechTts behind this port. */
export interface TtsProvider {
  readonly id: string;
  available(lang: string): Promise<boolean>;
  speak(text: string, lang: string): Promise<void>;
  stop(): void;
}
export const NullTts: TtsProvider = {
  id: 'null',
  available: async () => false,
  speak: async () => {},
  stop: () => {},
};
