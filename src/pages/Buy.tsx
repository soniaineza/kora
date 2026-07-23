import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type PlanDef = {
  key: string;
  titleEn: string;
  titleRw: string;
  exams: number | 'unlimited';
  days: number | 'unlimited';
  priceRwf: number;
};

const PLAN_MAP: Record<string, PlanDef> = {
  STARTER: { key: 'STARTER', titleEn: '500 RWF / 10 exams / 3 days', titleRw: '500Frw / ibizamini 10 / iminsi 3', exams: 10, days: 3, priceRwf: 500 },
  BASIC: { key: 'BASIC', titleEn: '1,000 RWF / 15 exams / 5 days', titleRw: '1000Frw / ibizamini 15 / iminsi 5', exams: 15, days: 5, priceRwf: 1000 },
  STANDARD: { key: 'STANDARD', titleEn: '1,500 RWF / 20 exams / 7 days', titleRw: '1500Frw / ibizamini 20 / iminsi 7', exams: 20, days: 7, priceRwf: 1500 },
  MASTER: { key: 'MASTER', titleEn: '2,000 RWF / 20 exams / 10 days', titleRw: '2000Frw / ibizamini 20 / iminsi 10', exams: 20, days: 10, priceRwf: 2000 },
  PREMIUM: { key: 'PREMIUM', titleEn: '3,000 RWF / 25 exams / 15 days', titleRw: '3000Frw / ibizamini 25 / iminsi 15', exams: 25, days: 15, priceRwf: 3000 },
  PRO: { key: 'PRO', titleEn: '5,000 RWF / 50 exams / 30 days', titleRw: '5000Frw / ibizamini 50 / iminsi 30', exams: 50, days: 30, priceRwf: 5000 },
  UNLIMITED: { key: 'UNLIMITED', titleEn: '7,000 RWF / unlimited / unlimited', titleRw: '7000Frw / bidashira / bidashira', exams: 'unlimited', days: 'unlimited', priceRwf: 7000 },
  BOOK: { key: 'BOOK', titleEn: '1,000 RWF / Book Access / 1 year', titleRw: '1000Frw / Ibitabo / umwaka 1', exams: 'unlimited', days: 365, priceRwf: 1000 },
};

export function Buy() {
  const q = useQuery();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const packageKey = (q.get('package') || 'STARTER') as string;

  const plan = useMemo(() => PLAN_MAP[packageKey] ?? PLAN_MAP.STARTER, [packageKey]);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = language === 'rw' ? 'Kwishyura' : language === 'fr' ? 'Paiement complet' : 'Complete Payment';
  const subtitle =
    language === 'rw'
      ? `Tegura umubare wa telefone hanyuma uhitemo Flutterwave kugira ubone code.`
      : language === 'fr'
        ? 'Entrez votre numéro de téléphone, puis confirmez pour être redirigé vers Flutterwave.'
        : 'Enter your phone number, then confirm to be redirected to Flutterwave.';

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('kora-jwt');

      if (!token) {
        const next = `/buy?package=${encodeURIComponent(packageKey)}&from=buy`;
        navigate(`/register?next=${encodeURIComponent(next)}`);
        return;
      }

      const apiBase = getApiBase()?.trim();
      if (!apiBase) throw new Error('API base URL not configured');
      const cleanBase = apiBase.replace(/\/$/, '');

      const res = await fetch(`${cleanBase}/api/payments/flutterwave/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          packageKey,
          amountRwf: plan.priceRwf
        })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid server response');
      }

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const link = data.paymentLink || data.payment_link;
      if (link) {
        window.location.href = link;
        return;
      }

      throw new Error('No payment link returned');

    } catch (e: any) {
      setError(e?.message || 'Payment failed');
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <section className="bg-background py-10">
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-3xl border border-border bg-background shadow-sm p-6">

            <div className="mb-5 text-sm text-muted-foreground">
              {language === 'rw' ? 'Pack' : language === 'fr' ? 'Forfait' : 'Package'}:{' '}
              <span className="text-foreground font-semibold">
                {language === 'rw' ? plan.titleRw : language === 'fr' ? plan.titleEn : plan.titleEn}
              </span>
            </div>

            <div className="grid gap-4">

              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  {language === 'rw' ? 'Numero wishyura' : language === 'fr' ? 'Votre numéro de téléphone' : 'Your phone number'}
                </label>

                <input
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm"
                  placeholder="07xxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Payment: <b>Flutterwave (Mobile Money, Card, Bank)</b>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="button"
                disabled={loading}
                onClick={handleStart}
                className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? (language === 'rw' ? 'Bikorwa...' : language === 'fr' ? 'Traitement...' : 'Processing...') : language === 'rw' ? 'Tangira Kwishyura' : language === 'fr' ? 'Commencer le paiement' : 'Start Payment'}
              </button>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}