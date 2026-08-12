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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderId: string } | null>(null);
  const [phone, setPhone] = useState('');

  const title = language === 'rw' ? 'Kwishyura' : language === 'fr' ? 'Paiement' : 'Payment';
  const subtitle =
    language === 'rw'
      ? 'Hitamo paketi kugira ngo ufungure agakururu. Uzakabona ikizamini nyuma y\'uko kwishyura byemejwe.'
      : language === 'fr'
        ? 'Choisissez votre forfait et passez commande. Votre accès est activé une fois le paiement confirmé.'
        : 'Choose your package and place an order. Your access is activated once payment is confirmed.';
  const packageLabel = language === 'rw' ? 'Paketi' : language === 'fr' ? 'Forfait' : 'Package';
  const payNow =
    language === 'rw'
      ? 'Kwishyura ubu (Mobile Money)'
      : language === 'fr'
        ? 'Payer maintenant (Mobile Money)'
        : 'Pay now (Mobile Money)';
  const phoneLabel =
    language === 'rw' ? 'Numero ya telefone' : language === 'fr' ? 'Numéro de téléphone' : 'Phone number';
  const phonePlaceholder =
    language === 'rw' ? 'Urugero: 0788123456' : language === 'fr' ? 'Ex: 0788123456' : 'e.g. 0788123456';
  const processing =
    language === 'rw' ? 'Bikorwa...' : language === 'fr' ? 'Traitement...' : 'Processing...';
  const howToPayMoMo =
    language === 'rw'
      ? 'Andika numero ya telefone, ugukubite mwifuza kuri Mobile Money (MTN MoMo, Airtel Money cyangwa Tigo Cash). Paketi izafungurwa ako kanya nyuma yo kwemeza.'
      : language === 'fr'
        ? 'Saisissez votre numéro, puis approuvez la demande sur votre téléphone (MTN MoMo, Airtel Money ou Tigo Cash). Le forfait est activé automatiquement après confirmation.'
        : 'Enter your phone number, then approve the request on your phone (MTN MoMo, Airtel Money or Tigo Cash). Your package activates automatically once confirmed.';
  const viewStatus =
    language === 'rw'
      ? 'Reba agakururu kanyu'
      : language === 'fr'
        ? 'Voir ma commande'
        : 'View my order status';

  async function postOrder(payload: Record<string, string>) {
    const token = localStorage.getItem('kora-jwt');

    if (!token) {
      const next = `/buy?package=${encodeURIComponent(packageKey)}`;
      navigate(`/register?next=${encodeURIComponent(next)}`);
      return null;
    }

    const apiBase = getApiBase()?.trim();
    if (!apiBase) throw new Error('API base URL not configured');

    const res = await fetch(`${apiBase}/api/payments/paypack/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid server response');
    }

    if (!res.ok) {
      // Token invalid/expired — clear it and send the user to re-login.
      if (res.status === 401) {
        localStorage.removeItem('kora-jwt');
        const next = `/buy?package=${encodeURIComponent(packageKey)}`;
        navigate(`/login?next=${encodeURIComponent(next)}`);
        return null;
      }
      throw new Error(data?.error || `Request failed (${res.status})`);
    }

    return data;
  }

  async function handlePayNow() {
    setLoading(true);
    setError(null);

    try {
      const data = await postOrder({ packageKey, phone: phone.trim() });
      if (!data) {
        setLoading(false);
        return;
      }
      setDone({ orderId: data.orderId || data.txRef });
    } catch (e: any) {
      setError(e?.message || 'Failed to start payment');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <>
        <PageHeader title={title} subtitle={subtitle} />
        <section className="bg-background py-10">
          <div className="max-w-xl mx-auto px-6">
            <div className="rounded-3xl border border-border bg-background shadow-sm p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl">
                {'\u2713'}
              </div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === 'rw' ? 'Agakururu kakuze!' : language === 'fr' ? 'Commande reçue !' : 'Order received!'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'rw' ? 'Umubare wa agakururu:' : language === 'fr' ? 'Référence de commande :' : 'Order reference:'}{' '}
                <span className="font-mono text-foreground">{done.orderId}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-6">{howToPayMoMo}</p>
              <button
                onClick={() => navigate(`/verify?order=${encodeURIComponent(done.orderId)}`)}
                className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold"
              >
                {viewStatus}
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <section className="bg-background py-10">
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-3xl border border-border bg-background shadow-sm p-6">
            <div className="mb-5 text-sm text-muted-foreground">
              {packageLabel}:{' '}
              <span className="text-foreground font-semibold">
                {language === 'rw' ? plan.titleRw : plan.titleEn}
              </span>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                {howToPayMoMo}
              </div>

              <div className="grid gap-3">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="pay-phone">
                  {phoneLabel}
                </label>
                <input
                  id="pay-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={phonePlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePayNow}
                  className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? processing : payNow}
                </button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}