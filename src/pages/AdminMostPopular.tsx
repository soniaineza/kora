import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

export function AdminMostPopular() {
  const { language } = useLanguage();
  const apiBase = getApiBase();
  const [data, setData] = useState<{ package_key: string; count: number; price_rwf: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) { setError('Not authenticated'); return; }

        const res = await fetch(`${apiBase}/api/admin/most-popular`, {
          headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiBase]);

  const title = language === 'rw' ? 'Ikunzwe Cyane' : language === 'fr' ? 'Le plus populaire' : 'Most Popular';

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div className="text-center py-12">No data</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div className="bg-background border border-border rounded-2xl p-8 text-center">
        <div className="text-6xl font-heading font-bold text-primary mb-4">{data.package_key}</div>
        <div className="text-2xl text-muted-foreground mb-6">
          {data.count} {language === 'rw' ? 'amaguruwe' : language === 'fr' ? 'ventes' : 'sales'}
        </div>
        <div className="text-4xl font-bold text-foreground">{data.price_rwf.toLocaleString()} RWF</div>
        <p className="mt-4 text-sm text-muted-foreground">
          {language === 'rw' 
            ? 'Iyi ni pakeji ikunzwe cyane na babaye.' 
            : language === 'fr' 
              ? 'C\'est le forfait le plus acheté par les utilisateurs.'
              : 'This is the most purchased package by users.'}
        </p>
      </div>
    </div>
  );
}