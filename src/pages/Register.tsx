import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';
type Step = 'enter' | 'verify';
function normalizePhone(raw: string) {
  return String(raw || '').replace(/\D/g, '');
}

export function Register() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [nextPath] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('next');
  });
  const [step, setStep] = useState<Step>('enter');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password6, setPassword6] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNext = useMemo(() => {
    const p = normalizePhone(phone);
    return p.length >= 9 && password6.length === 6 && /^\d{6}$/.test(password6);
  }, [phone, password6]);

  const apiBase = getApiBase();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      if (!fullName.trim()) {
        throw new Error(language === 'rw' ? 'Andika amazina yose.' : 'Full name is required.');
      }

      const p = normalizePhone(phone);
      if (!p || p.length < 9) {
        throw new Error(language === 'rw' ? 'Andika nimero ya telefone neza.' : 'Enter a valid phone number.');
      }
      if (!/^\d{6}$/.test(password6)) {
        throw new Error(language === 'rw' ? 'Ijambo ry\u2019ibanga rigomba kuba imibare 6 gusa.' : 'Password must be exactly 6 digits.');
      }

      const res = await fetch(`${apiBase}/api/otp/send`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || 'Failed to send OTP');

      setStep('verify');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const p = normalizePhone(phone);

      const res = await fetch(`${apiBase}/api/otp/verify`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || 'Verification failed');

      if (!data?.token) {
        throw new Error('Verification failed');
      }

      localStorage.setItem('kora-jwt', data.token);

      // Create/store placeholder profile so the user has an avatar after signup
      const seed = `${p}`;
      const avatarUrl = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
      localStorage.setItem('kora-profile', JSON.stringify({ name: fullName || 'User', avatarUrl }));

      setTimeout(() => {
        if (nextPath) {
          navigate(nextPath);
        } else {
          navigate('/packages');
        }
      }, 350);
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="bg-muted min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-6">
      <div className="bg-background border border-border rounded-3xl p-8 md:p-10 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-baseline mb-6">
            <span className="font-heading font-bold text-2xl text-primary">KORA</span>
            <span className="font-heading font-bold text-2xl text-foreground">.RW</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">{t.auth.registerTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'enter'
              ? t.auth.registerSubtitle
              : t.auth.verificationHelper}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {step === 'enter' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">{t.auth.fullNameLabel}</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder={t.auth.fullNamePlaceholder}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">{t.auth.phoneLabel}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t.auth.phonePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">{t.auth.password} (6 {language === 'rw' ? 'imibare' : language === 'fr' ? 'chiffres' : 'digits'})</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  inputMode="numeric"
                  value={password6}
                  onChange={(e) => setPassword6(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t.auth.verificationPlaceholder}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{t.auth.passwordHelper}</p>
            </div>

            <button
              type="submit"
              disabled={sending || !canNext}
              className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {sending ? t.auth.creating : (
                <>
                  {t.auth.createAccount} <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">{t.auth.verificationCode}</label>
              <div className="relative">
                <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t.auth.verificationPlaceholder}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{t.auth.verificationHelper}</p>
            </div>

            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {verifying ? t.auth.verifying : (
                <>
                  {t.auth.verifyAndContinue} <ArrowRight size={14} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('enter')}
              className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {t.auth.backToRegistration}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-border text-center text-sm">
          <span className="text-muted-foreground">{t.auth.alreadyHaveAccount} </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            {t.auth.loginLink}
          </Link>
        </div>
      </div>
    </section>
  );
}

