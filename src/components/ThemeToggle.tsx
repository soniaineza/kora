import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useLanguage } from '../i18n';
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    // Default is LIGHT. If user previously toggled, respect saved preference.
    const stored = localStorage.getItem('kora-theme');
    const initial = stored ? stored === 'dark' : false;
    setIsDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);

  const { t } = useLanguage();
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('kora-theme', next ? 'dark' : 'light');
  };
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t.theme.toggleLight : t.theme.toggleDark}
      className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors">
      
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>);

}