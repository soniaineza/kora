import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

type Sale = { package_key: string; count: number; total_revenue: number };

export function AdminPackageSales() {
  const { language } = useLanguage();
  const apiBase = getApiBase();
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) { setError('Not authenticated'); return; }

        const res = await fetch(`${apiBase}/api/admin/package-sales`, {
          headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiBase]);

  const title = language === 'rw' ? 'Amaguruwe y\'Ibipakeji' : language === 'fr' ? 'Ventes de forfaits' : 'Package Sales';

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const totalRevenue = data.reduce((sum, s) => sum + s.total_revenue, 0);
  const totalSales = data.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-background border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">{language === 'rw' ? 'Amaguruwe Yose' : 'Total Sales'}</p>
          <p className="text-3xl font-bold mt-2">{totalSales}</p>
        </div>
        <div className="bg-background border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">{language === 'rw' ? 'Imbere Yose (RWF)' : 'Total Revenue (RWF)'}</p>
          <p className="text-3xl font-bold mt-2 text-primary">{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">{language === 'rw' ? 'Pakeji' : 'Package'}</th>
              <th className="text-right p-4 font-semibold">{language === 'rw' ? 'Amaguruwe' : 'Sales'}</th>
              <th className="text-right p-4 font-semibold">{language === 'rw' ? 'Imbere (RWF)' : 'Revenue (RWF)'}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.package_key} className={`border-t ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                <td className="p-4 font-medium">{row.package_key}</td>
                <td className="p-4 text-right">{row.count}</td>
                <td className="p-4 text-right font-mono">{row.total_revenue.toLocaleString()}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-8 text-muted-foreground">
                  {language === 'rw' ? 'Nta maguruwe yarabaye' : 'No sales yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}