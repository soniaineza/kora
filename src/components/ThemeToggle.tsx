import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('kora-theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const initial = stored ? stored === 'dark' : prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('kora-theme', next ? 'dark' : 'light');
  };
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors">
      
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>);

}