export type Question = {
  prompt: string;
  category: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type LanguageCode = 'en' | 'rw' | 'fr';