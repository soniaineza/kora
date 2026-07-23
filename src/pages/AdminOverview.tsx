import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { apiFetch, getApiBase } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface Stats {
  totalSales: number;
  totalRevenue: number;
  activePackages: number;
  totalSessions: number;
  byPackage: Record<string, { count: number; revenue: number }>;
}

export function AdminOverview() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) return;

        const apiBase = getApiBase();
        
        const [salesRes, sessionsRes, popularRes] = await Promise.all([
          fetch(`${apiBase}/api/admin/package-sales`, { headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' } }),
          fetch(`${apiBase}/api/admin/exam-session-counts`, { headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' } }),
          fetch(`${apiBase}/api/admin/most-popular`, { headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' } }),
        ]);

        const [salesData, sessionsData, popularData] = await Promise.all([
          salesRes.json(),
          sessionsRes.json(),
          popularRes.json(),
        ]);

        const byPackage: Record<string, { count: number; revenue: number }> = {};
        let totalSales = 0;
        let totalRevenue = 0;

        if (salesData.sales) {
          salesData.sales.forEach((s: any) => {
            byPackage[s.package_key] = { count: s.count, revenue: s.revenue };
            totalSales += s.count;
            totalRevenue += s.revenue;
          });
        }

        let totalSessions = 0;
        if (sessionsData.counts) {
          sessionsData.counts.forEach((s: any) => {
            totalSessions += s.count;
          });
        }

        setStats({ totalSales, totalRevenue, activePackages: 0, totalSessions, byPackage });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!stats) return <div className="text-center py-12">No data</div>;

  const t = {
    overview: language === 'rw' ? 'Ibyifuzo' : language === 'fr' ? 'Aperçu' : 'Overview',
    totalSales: language === 'rw' ? 'Gushyura Byose' : language === 'fr' ? 'Ventes totales' : 'Total Sales',
    totalRevenue: language === 'rw' ? 'Inyungu Zose' : language === 'fr' ? 'Revenus totaux' : 'Total Revenue',
    totalSessions: language === 'rw' ? 'Amasaha Yose' : language === 'fr' ? 'Sessions totales' : 'Total Sessions',
    byPackage: language === 'rw' ? 'Kwa Pakete' : language === 'fr' ? 'Par forfait' : 'By Package',
    package: language === 'rw' ? 'Pakete' : language === 'fr' ? 'Forfait' : 'Package',
    count: language === 'rw' ? 'Ubuhinzi' : language === 'fr' ? 'Quantité' : 'Count',
    revenue: language === 'rw' ? 'Inyungu' : language === 'fr' ? 'Revenus' : 'Revenue',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">{t.overview}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.totalSales}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-heading font-bold text-foreground">{stats.totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.totalRevenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-heading font-bold text-foreground">{stats.totalRevenue.toLocaleString()} RWF</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.totalSessions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-heading font-bold text-foreground">{stats.totalSessions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.byPackage}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">{t.package}</th>
                  <th className="pb-3 font-medium text-right">{t.count}</th>
                  <th className="pb-3 font-medium text-right">{t.revenue}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byPackage).map(([pkg, data]) => (
                  <tr key={pkg} className="border-b border-border/50">
                    <td className="py-3 font-medium text-foreground">{pkg}</td>
                    <td className="py-3 text-right text-foreground">{data.count}</td>
                    <td className="py-3 text-right text-foreground">{data.revenue.toLocaleString()} RWF</td>
                  </tr>
                ))}
                {Object.keys(stats.byPackage).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      {language === 'rw' ? 'Nta data ihari' : language === 'fr' ? 'Aucune donnée' : 'No data yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}