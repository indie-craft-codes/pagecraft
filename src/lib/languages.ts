export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  ko: { name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  zh: { name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
