import React from 'react';
import { Link, useLocation, NavLink, Outlet } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { Layout as BaseLayout } from './Layout';

const navItems = [
  { path: '/admin', label: { en: 'Overview', rw: 'Ibyifuzo', fr: 'Aperçu' }, icon: '📊' },
  { path: '/admin/sales', label: { en: 'Package Sales', rw: 'Amaguruwe Y\'ibikoresho', fr: 'Ventes de forfaits' }, icon: '💰' },
  { path: '/admin/sessions', label: { en: 'Exam Sessions', rw: 'Amasaha Y\'ibizamini', fr: 'Sessions d\'examen' }, icon: '📝' },
  { path: '/admin/popular', label: { en: 'Most Popular', rw: 'Ikunzwe Cyane', fr: 'Plus populaire' }, icon: '⭐' },
];

export function AdminLayout() {
  const { language } = useLanguage();
  const location = useLocation();

  return (
    <BaseLayout>
      <div className="min-h-screen bg-background">
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border hidden lg:block">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                <span className="font-heading font-bold text-xl text-foreground">KORA Admin</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label[language as keyof typeof item.label] || item.label.en}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="text-xl">🏠</span>
                <span>{language === 'rw' ? 'Genda Home' : language === 'fr' ? 'Accueil' : 'Back to Home'}</span>
              </Link>
            </div>
          </div>
        </aside>

        <main className="lg:ml-64 min-h-screen">
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between h-16 px-6">
              <h1 className="font-heading text-xl font-bold text-foreground">
                {navItems.find((i) => i.path === location.pathname)?.label[language as keyof typeof navItems[0].label] || navItems[0].label[language as keyof typeof navItems[0].label] || 'Admin'}
              </h1>
              <div className="text-sm text-muted-foreground">
                {language === 'rw' ? 'Mwaramutse' : language === 'fr' ? 'Bonjour' : 'Welcome'} Admin
              </div>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </BaseLayout>
  );
}