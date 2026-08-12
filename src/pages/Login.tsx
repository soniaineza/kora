import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

export function Login() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const apiBase = getApiBase();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = identifier.trim().length >= 3 && password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Login failed');

      if (!data?.token) throw new Error('Login failed');

      localStorage.setItem('kora-jwt', data.token);
      const existing = localStorage.getItem('kora-profile');
      if (!existing) {
        const seed = identifier.trim();
        const avatarUrl = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
        localStorage.setItem('kora-profile', JSON.stringify({ name: data.user?.full_name || 'User', avatarUrl }));
      }

      setTimeout(() => navigate('/packages'), 350);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
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
            <span className="font-heading font-bold text-2xl text-foreground">.RW</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">
            {label('Injira', 'Connexion', 'Log in')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {label(
              'Injira ukoresheje numero ya telefone cyangwa imeyili n’ijambobanga.',
              'Connectez-vous avec votre numéro ou email et votre mot de passe.',
              'Log in with your phone number or email and your password.'
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              {label('Numero cyangwa imeyili', 'Numéro ou email', 'Phone number or email')}
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder={label('Urugero: 0788123456', 'Ex: 0788123456', 'e.g. 0788123456 or you@example.com')}
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
          </div>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? label('Bikorwa...', 'Traitement...', 'Logging in...') : (
              <>
                {label('Injira', 'Se connecter', 'Log in')} <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm">
          <span className="text-muted-foreground">
            {label('Nta konti?', 'Pas de compte ?', 'New to Kora?')}{' '}
          </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            {label('Iyandikishe', 'Créer un compte', 'Create account')}
          </Link>
        </div>
      </div>
    </section>
  );
}
