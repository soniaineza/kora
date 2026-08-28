import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

function normalizePhone(raw: string) {
  return String(raw || '').replace(/\D/g, '');
}

export function Register() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [nextPath] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('next');
  });
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    fullName.trim().length >= 2 &&
    normalizePhone(phone).length >= 9 &&
    password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: normalizePhone(phone),
          email: email.trim() || undefined,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Registration failed');

      if (!data?.token) throw new Error('Registration failed');

      localStorage.setItem('kora-jwt', data.token);
      const seed = normalizePhone(phone);
      const avatarUrl = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
      localStorage.setItem('kora-profile', JSON.stringify({ name: fullName.trim() || 'User', avatarUrl }));

      setTimeout(() => {
        navigate(nextPath || '/packages');
      }, 350);
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  const label = (rw: string, fr: string, en: string) =>
    language === 'rw' ? rw : language === 'fr' ? fr : en;

  return (
    <section className="bg-muted min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-6">
      <div className="bg-background border border-border rounded-3xl p-8 md:p-10 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-baseline mb-6">
            <span className="font-heading font-bold text-2xl text-primary">KORA</span>
            <span className="font-heading font-bold text-lg text-foreground">APP.NET</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">
            {label('Iyandikishe', 'Créer un compte', 'Create account')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {label(
              'Andika numero ya telefone n’ijambobanga. Nta code ikenewe.',
              'Saisissez votre numéro et un mot de passe. Aucun code requis.',
              'Enter your phone number and a password. No verification code needed.'
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              {label('Amazina', 'Nom complet', 'Full name')}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder={label('Urugero: Jean Pierre', 'Ex: Jean Pierre', 'e.g. Jean Pierre')}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              {label('Numero ya telefone', 'Numéro de téléphone', 'Phone number')}
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder={label('Urugero: 0788123456', 'Ex: 0788123456', 'e.g. 0788123456')}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              {label('Imeyili (bishoboka)', 'Email (optionnel)', 'Email (optional)')}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              {label('Ijambobanga', 'Mot de passe', 'Password')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {label('Byibuze inyuguti 6', 'Au moins 6 caractères', 'At least 6 characters')}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? label('Bikorwa...', 'Traitement...', 'Creating...') : (
              <>
                {label('Fungura konti', 'Créer le compte', 'Create account')} <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm">
          <span className="text-muted-foreground">
            {label('Ufite konti?', 'Déjà un compte ?', 'Already have an account?')}{' '}
          </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            {label('Injira', 'Connectez-vous', 'Log in')}
          </Link>
        </div>
      </div>
    </section>
  );
}
