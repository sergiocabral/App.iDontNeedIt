import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: [
    'en', // English
    'es', // Spanish
    'pt', // Portuguese
    'zh', // Chinese (Simplified)
    'ja', // Japanese
    'fr', // French
    'de', // German
    'ru', // Russian
    'ko', // Korean
    'hi', // Hindi
  ],
  defaultLocale: 'en',
})
