/** Stage 2 will add Anthropic/OpenAI/Ollama providers; API key lives in the OS keychain, calls go via Rust. */
export interface GenerateQuizRequest { terms: string[]; lang: string; count: number }
export interface LlmProvider {
  readonly id: string;
  available(): Promise<boolean>;
  generateQuiz(req: GenerateQuizRequest): Promise<import('../types').QuizItem[]>;
}
export const NullLlm: LlmProvider = {
  id: 'null',
  available: async () => false,
  generateQuiz: async () => [],
};
