import { providers } from '../providers';
import { isTauri } from '../storage';

export interface Capabilities {
  desktop: boolean;
  tts: boolean;
  ai: boolean;
  pen: boolean;
  game: boolean;
}

/** Evaluated at startup; UI hides/disables features whose flag is false. */
export async function detectCapabilities(): Promise<Capabilities> {
  return {
    desktop: isTauri(),
    tts: await providers.tts.available('en'),
    ai: await providers.llm.available(),
    pen: false,   // stage 3
    game: false,  // stage 4
  };
}
