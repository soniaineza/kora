import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

interface Sale {
  package_key: string;
  count: number;
  revenue: number;
}

export function AdminSales() {
  const { language } = useLanguage();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) return;

        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/admin/package-sales`, {
          headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' }
        });
        const data = await res.json();
        if (data.sales) setSales(data.sales);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const t = {
    title: language === 'rw' ? 'Amaguruwe Y\'ibikoresho' : language === 'fr' ? 'Ventes de forfaits' : 'Package Sales',
    package: language === 'rw' ? 'Pakete' : language === 'fr' ? 'Forfait' : 'Package',
    count: language === 'rw' ? 'Ubuhinzi' : language === 'fr' ? 'Quantité' : 'Count',
    revenue: language === 'rw' ? 'Inyungu' : language === 'fr' ? 'Revenus' : 'Revenue',
    total: language === 'rw' ? 'Byose' : language === 'fr' ? 'Total' : 'Total',
    noData: language === 'rw' ? 'Nta data ihari' : language === 'fr' ? 'Aucune donnée' : 'No data',
  };

  const totalCount = sales.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>

      <div className="bg-background border border-border rounded-2xl p-6">
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
              {sales.map((s) => (
                <tr key={s.package_key} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{s.package_key}</td>
                  <td className="py-3 text-right text-foreground">{s.count}</td>
                  <td className="py-3 text-right text-foreground">{s.revenue.toLocaleString()} RWF</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">{t.noData}</td>
                </tr>
              )}
              <tr className="bg-muted/50 font-bold">
                <td className="py-3">{t.total}</td>
                <td className="py-3 text-right">{totalCount}</td>
                <td className="py-3 text-right">{totalRevenue.toLocaleString()} RWF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}