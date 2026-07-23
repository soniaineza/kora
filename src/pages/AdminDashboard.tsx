import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useLanguage } from '../i18n';

const adminNav = [
  { path: '/admin', label: { en: 'Dashboard', rw: 'Dashibodi', fr: 'Tableau de bord' } },
  { path: '/admin/sales', label: { en: 'Package Sales', rw: 'Amaguruwe', fr: 'Ventes' } },
  { path: '/admin/sessions', label: { en: 'Exam Sessions', rw: 'Ibizamini', fr: 'Sessions' } },
  { path: '/admin/popular', label: { en: 'Most Popular', rw: 'Ikunzwe', fr: 'Populaire' } },
];

export function AdminLayout() {
  const { language } = useLanguage();
  const location = useLocation();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background/95 backdrop-blur z-40 hidden lg:block">
          <nav className="p-6 space-y-2">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            {adminNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.label[language as keyof typeof item.label] || item.label.en}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lg:ml-64 pt-8 px-6 pb-12">
          <Outlet />
        </main>
      </div>
    </Layout>
  );
}

export function AdminDashboard() {
  const { language } = useLanguage();
  
  const title = language === 'rw' ? 'Dashibodi ya Admin' : language === 'fr' ? 'Tableau de bord Admin' : 'Admin Dashboard';
  const subtitle = language === 'rw' ? 'Reba ibisobanuro byose' : language === 'fr' ? 'Voir toutes les analyses' : 'View all analytics';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
          title={language === 'rw' ? 'Amaguruwe' : 'Sales'}
          path="/admin/sales"
        >
          <Link to="/admin/sales" className="block">
            <div className="text-4xl font-bold text-primary">—</div>
            <div className="text-sm text-muted-foreground mt-1">Total Sales</div>
          </Link>
        </AdminStatCard>

        <AdminStatCard 
          title={language === 'rw' ? 'Imbere' : 'Revenue'}
          path="/admin/sales"
        >
          <Link to="/admin/sales" className="block">
            <div className="text-4xl font-bold text-green-600">—</div>
            <div className="text-sm text-muted-foreground mt-1">Total Revenue</div>
          </Link>
        </AdminStatCard>

        <AdminStatCard 
          title={language === 'rw' ? 'Ibizamini' : 'Sessions'}
          path="/admin/sessions"
        >
          <Link to="/admin/sessions" className="block">
            <div className="text-4xl font-bold text-blue-600">—</div>
            <div className="text-sm text-muted-foreground mt-1">Exam Sessions</div>
          </Link>
        </AdminStatCard>

        <AdminStatCard 
          title={language === 'rw' ? 'Ikunzwe' : 'Popular'}
          path="/admin/popular"
        >
          <Link to="/admin/popular" className="block">
            <div className="text-4xl font-bold text-purple-600">—</div>
            <div className="text-sm text-muted-foreground mt-1">Top Package</div>
          </Link>
        </AdminStatCard>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <AdminQuickLink
          icon="📦"
          title={language === 'rw' ? 'Amaguruwe y\'Ibipakeji' : 'Package Sales'}
          desc={language === 'rw' ? 'Reba amaguruwe n\'imbere yose' : 'View sales and revenue'}
          href="/admin/sales"
        />
        <AdminQuickLink
          icon="📝"
          title={language === 'rw' ? 'Ibizamini Byose' : 'All Exam Sessions'}
          desc={language === 'rw' ? 'Ibizamini byakozwe n\'abafasha' : 'Exams taken by users'}
          href="/admin/sessions"
        />
        <AdminQuickLink
          icon="🏆"
          title={language === 'rw' ? 'Ikunzwe Cyane' : 'Most Popular'}
          desc={language === 'rw' ? 'Pakeji ikunzwe cyane' : 'Most purchased package'}
          href="/admin/popular"
        />
      </div>
    </div>
  );
}

function AdminStatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
      {children}
    </div>
  );
}

function AdminQuickLink({ icon, title, desc, href }: { icon: string; title: string; desc: string; href: string }) {
  return (
    <a href={href} className="block bg-background border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
      </div>
    </a>
  );
}