import React from 'react';
import { Globe2 } from 'lucide-react';
import { Language, languages, useLanguage } from '../i18n';

const labels: Record<Language, string> = {
  en: 'EN',
  rw: 'RW',
  fr: 'FR'
};

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors duration-300 hover:bg-muted">
      <Globe2 size={15} className="text-muted-foreground" />
      <span className="sr-only">{t.nav.language}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={t.nav.language}
        className="bg-background text-foreground text-xs font-bold outline-none px-0">
        {languages.map((item) => (
          <option key={item} value={item} className="bg-background text-foreground">
            {labels[item]}
          </option>
        ))}
      </select>
    </label>);
}
