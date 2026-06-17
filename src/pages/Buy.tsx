import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type Network = 'mtn' | 'airtel';

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
};

export function Buy() {
  const q = useQuery();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const packageKey = (q.get('package') || 'STARTER') as string;
  const network = (q.get('network') || 'mtn') as Network;

  const plan = useMemo(() => PLAN_MAP[packageKey] ?? PLAN_MAP.STARTER, [packageKey]);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

  const title = language === 'rw' ? 'Kwishyura' : 'Complete Payment';
  const subtitle =
    language === 'rw'
      ? `Tegura umubare wa telefone hanyuma uhitemo MTN/Airtel kugira ubone code.`
      : 'Enter the phone number you will use for MTN/Airtel, then confirm to get your payment code.';

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('kora-jwt');

      if (!token) {
        setError(language === 'rw' ? 'Musanze wiyandikishe mbere.' : 'Please register/verify first.');
        setLoading(false);
        return;
      }
const apiBase = getApiBase()?.trim();

if (!apiBase) {
  throw new Error('API base URL not configured');
}

const cleanBase = apiBase.replace(/\/$/, '');

const paymentUrl = `${cleanBase}/api/payments/${network}/start`;

console.log('API_BASE =', cleanBase);
console.log('PAYMENT_URL =', paymentUrl);

      const res = await fetch(paymentUrl, {
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

      setPaymentSessionId(data.paymentSessionId);

      navigate(
        `/verify?paymentSession=${encodeURIComponent(data.paymentSessionId)}&package=${encodeURIComponent(packageKey)}&phone=${encodeURIComponent(phoneNumber)}`
      );

    } catch (e: any) {
      setError(e?.message || 'Payment failed');
    } finally {
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
              {language === 'rw' ? 'Pack' : 'Package'}:{' '}
              <span className="text-foreground font-semibold">
                {language === 'rw' ? plan.titleRw : plan.titleEn}
              </span>
            </div>

            <div className="grid gap-4">

              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  {language === 'rw' ? 'Numero wishyura' : 'Your phone number'}
                </label>

                <input
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm"
                  placeholder="07xxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Network: <b>{network.toUpperCase()}</b>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="button"
                disabled={loading}
                onClick={handleStart}
                className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Start Payment'}
              </button>

              {paymentSessionId && (
                <p className="text-xs text-muted-foreground">
                  Session: {paymentSessionId}
                </p>
              )}

            </div>
          </div>
        </div>
      </section>
    </>
  );
}