import React, { useCallback, useState, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type PlanKey = string;

export function Verify() {
  const q = useQuery();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const txRef = q.get('tx_ref') || q.get('paymentSession');
  const apiBase = getApiBase();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedPackage, setVerifiedPackage] = useState<PlanKey | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleContinue = useCallback(async () => {
    if (verifiedPackage === 'BOOK') {
      navigate('/library');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('kora-jwt');
      if (!token) {
        setError(language === 'rw' ? 'Musanze wiyandikishe mbere.' : 'Please register/verify first.');
        return;
      }

      const planKey = verifiedPackage || 'STARTER';
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
  }, [apiBase, language, navigate, verifiedPackage]);

  useEffect(() => {
    if (!txRef || isSuccess) return;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) return;

        const res = await fetch(`${apiBase}/api/payments/flutterwave/verify/${encodeURIComponent(txRef)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.active) {
            setVerifiedPackage(data.package?.package_key || 'STARTER');
            setIsSuccess(true);
          }
        }
      } catch {
        // Polling will try again
      }
    };

    const intervalId = window.setInterval(checkStatus, 3000);
    checkStatus();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [txRef, apiBase, isSuccess]);

  useEffect(() => {
    if (isSuccess && !loading) {
      const timer = window.setTimeout(() => {
        handleContinue();
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [handleContinue, isSuccess, loading]);

  const title = language === 'rw' ? 'Kwishyura' : 'Payment Verification';
  const subtitle =
    language === 'rw'
      ? 'Tegereze akanya gato ko kwishyura kwanyu kwemezwa.'
      : 'Please wait a moment while your payment is being verified.';

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <section className="bg-background py-16">
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-[2rem] border border-border bg-background p-8 text-center shadow-xl shadow-foreground/5">
            {isSuccess ? (
              <div className="animate-in fade-in zoom-in duration-500">
                 <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-heading font-extrabold text-foreground mb-2">
                  {language === 'rw' ? 'Kwishyura kwagenze neza!' : 'Payment Successful!'}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {verifiedPackage === 'BOOK'
                    ? (language === 'rw'
                      ? 'Igitabo cyawe kirashobora gusomwa noneho.'
                      : language === 'fr'
                        ? 'Votre livre est maintenant accessible.'
                        : 'Your book is now accessible.')
                    : (language === 'rw'
                      ? 'Noneho ushobora gutangira gukora ibizamini byawe.'
                      : 'Your package is now active. You can start your practice exams now.')}
                </p>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground rounded-full py-4 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  {loading ? '...' : (verifiedPackage === 'BOOK'
                    ? (language === 'rw' ? 'Soma Igitabo' : language === 'fr' ? 'Lire le livre' : 'Read the Book')
                    : (language === 'rw' ? 'Tangira Ikizamini' : 'Start Exam'))}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8 flex justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  {language === 'rw' ? 'Turacyategereje...' : 'Waiting for confirmation...'}
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  {language === 'rw'
                    ? 'Emeza kwishyura kuri telefono yawe. Turahita tubona ko bishyuwe.'
                    : 'Please complete the payment on Flutterwave. We will automatically detect when it is complete.'}
                </p>
                
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