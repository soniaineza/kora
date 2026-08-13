import React, { useCallback, useState, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, XCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function Verify() {
  const q = useQuery();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const orderRef = q.get('order') || q.get('tx_ref') || '';
  const apiBase = getApiBase();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [order, setOrder] = useState<{
    status: string;
    packageKey: string;
    amountRwf?: number;
    phoneNumber?: string;
    failureReason?: string | null;
    active: boolean;
  } | null>(null);

  const handleContinue = useCallback(async () => {
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('kora-jwt');
      if (!token) {
        setError(language === 'rw' ? 'Musanze wiyandikishije mbere.' : 'Please register/verify first.');
        return;
      }

      const planKey = order.packageKey || 'STARTER';
      const res = await fetch(`${apiBase}/api/internal/start-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planKey })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Cannot start exam');

      const newSessionId = data?.sessionId;
      if (!newSessionId) throw new Error('Missing sessionId');

      navigate(`/exams?plan=${encodeURIComponent(planKey)}&start=1&sessionId=${encodeURIComponent(newSessionId)}`);
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [apiBase, language, navigate, order]);

  useEffect(() => {
    if (!orderRef || isSuccess || isFailed) return;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) return;

        const res = await fetch(`${apiBase}/api/payments/order/${encodeURIComponent(orderRef)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;

        const data = await res.json().catch(() => ({}));
        const o = data?.order;
        if (o) {
          setOrder(o);
          if (o.active) {
            setIsSuccess(true);
          } else if (o.status === 'failed' || o.status === 'cancelled') {
            setIsFailed(true);
          }
        }
      } catch {
        // Polling will try again
      }
    };

    const intervalId = window.setInterval(checkStatus, 5000);
    checkStatus();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [orderRef, apiBase, isSuccess, isFailed]);

  useEffect(() => {
    if (isSuccess && !loading) {
      const timer = window.setTimeout(() => {
        handleContinue();
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [handleContinue, isSuccess, loading]);

  const title = language === 'rw' ? 'Agakururu kanyu' : language === 'fr' ? 'Ma commande' : 'Order Status';
  const subtitle =
    language === 'rw'
      ? 'Paketi izafungurwa igihe kwishyura kwemejwe kuri Mobile Money.'
      : language === 'fr'
        ? 'Votre forfait sera activé dès que votre paiement Mobile Money est confirmé.'
        : 'Your package is activated once your Mobile Money payment is confirmed.';

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <section className="bg-background py-16">
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-[2rem] border border-border bg-background p-8 text-center shadow-xl shadow-foreground/5">
            {isFailed ? (
              <div>
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-600/10 text-red-600">
                  <XCircle size={40} />
                </div>
                <h2 className="text-2xl font-heading font-extrabold text-foreground mb-2">
                  {language === 'rw' ? 'Kwishyura byanze' : 'Payment failed'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'rw'
                    ? 'Ntabwo twashoboye kwemeza kwishyura. Ongera ugerageze, cyangwa ukoreshe izindi numero ya Mobile Money.'
                    : 'We could not confirm your payment. Please try again, or use a different Mobile Money number.'}
                </p>
                {order?.failureReason && (
                  <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    {language === 'rw' ? 'Impamvu' : 'Reason'}: <span className="font-semibold text-foreground">{order.failureReason}</span>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate(`/buy?package=${encodeURIComponent(order?.packageKey || 'STARTER')}`)}
                    className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold"
                  >
                    {language === 'rw' ? 'Ongera ugerageze' : 'Try again'}
                  </button>
                  <button
                    onClick={() => navigate('/packages')}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {language === 'rw' ? 'Genda inyuma' : 'Go back'}
                  </button>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-heading font-extrabold text-foreground mb-2">
                  {language === 'rw' ? 'Paketi yanyu yemejwe!' : 'Payment Confirmed!'}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {language === 'rw'
                    ? 'Noneho ushobora gutangira gukora ibizamini byawe.'
                    : 'Your package is now active. You can start your practice exams now.'}
                </p>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  {loading ? '...' : (language === 'rw' ? 'Tangira Ikizamini' : 'Start Exam')}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8 flex justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  {language === 'rw' ? 'Kwemeza kuri telefone yawe...' : 'Confirm on your phone...'}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {language === 'rw'
                    ? 'Niba utarabinyejeje, reba telefone yawe ukameze icyifuzo kuri Mobile Money (andika PIN). Iyi paji izakomeza kugenzura agakururu kawe.'
                    : 'If you haven\'t approved it yet, check your phone for the Mobile Money prompt and enter your PIN. This page keeps checking your order until it is activated.'}
                </p>

                {order && (
                  <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-border bg-muted/40 p-4 text-sm">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                      <Clock size={16} />
                      <span>
                        {language === 'rw' ? 'Agakururu' : language === 'fr' ? 'Commande' : 'Order'}:{' '}
                        <span className="font-mono text-foreground">{orderRef}</span>
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {language === 'rw' ? 'Ikigereranyo:' : language === 'fr' ? 'Statut :' : 'Status: '}{' '}
                      <span className="capitalize font-semibold text-foreground">{order.status}</span>
                    </div>
                    {order.amountRwf ? (
                      <div className="text-muted-foreground">
                        {language === 'rw' ? 'Amafaranga:' : language === 'fr' ? 'Montant :' : 'Amount: '}{' '}
                        <span className="font-semibold text-foreground">{order.amountRwf.toLocaleString()} RWF</span>
                      </div>
                    ) : null}
                    {order.phoneNumber ? (
                      <div className="text-muted-foreground">
                        {language === 'rw' ? 'Telefone:' : language === 'fr' ? 'Téléphone :' : 'Phone: '}{' '}
                        <span className="font-semibold text-foreground">{order.phoneNumber}</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {language === 'rw' ? 'Ongera ubeho' : 'Refresh status'}
                  </button>
                  <button
                    onClick={() => navigate('/packages')}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {language === 'rw' ? 'Genda inyuma' : 'Cancel and go back'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}