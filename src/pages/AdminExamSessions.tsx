import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

type SessionCount = { plan: string; count: number };

export function AdminExamSessions() {
  const { language } = useLanguage();
  const apiBase = getApiBase();
  const [data, setData] = useState<SessionCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) { setError('Not authenticated'); return; }

        const res = await fetch(`${apiBase}/api/admin/exam-session-counts`, {
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

  const title = language === 'rw' ? 'Ibyizamini byose byakozwe' : language === 'fr' ? 'Tous les examens passés' : 'All Exam Sessions';

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">{language === 'rw' ? 'Pakeji' : 'Package'}</th>
              <th className="text-right p-4 font-semibold">{language === 'rw' ? 'Ibizamini' : 'Sessions'}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.plan} className={`border-t ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                <td className="p-4 font-medium">{row.plan}</td>
                <td className="p-4 text-right text-foreground">{row.count}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center p-8 text-muted-foreground">
                  {language === 'rw' ? 'Nta bizamini byakozwe' : 'No exam sessions yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}