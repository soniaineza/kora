import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';
import { PageHeader } from '../components/PageHeader';

interface Package {
  id: string;
  package_key: string;
  status: string;
  remaining_attempts: number | null;
  unlimited: boolean;
  expires_at: string | null;
  activated_at: string | null;
  amount_rwf: number;
}

interface Session {
  id: string;
  plan: string;
  status: string;
  score: number | null;
  total_questions: number | null;
  completed_at: string | null;
  created_at: string;
}

export function UserDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) { navigate('/login'); return; }

        const apiBase = getApiBase();
        const [pkgsRes, sessionsRes] = await Promise.all([
          fetch(`${apiBase}/api/internal/active-package?plan=ALL`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiBase}/api/internal/exam-history`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false })),
        ]);

        if (pkgsRes.ok) {
          const pkgsData = await pkgsRes.json();
          if (pkgsData.packages) setPackages(pkgsData.packages);
          else if (pkgsData.package) setPackages([pkgsData.package]);
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          if (sessionsData.sessions) setSessions(sessionsData.sessions);
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const t = {
    title: language === 'rw' ? 'Dashboard yanjye' : language === 'fr' ? 'Mon Tableau de Bord' : 'My Dashboard',
    myPackages: language === 'rw' ? 'Ibikoresho Byanjye' : language === 'fr' ? 'Mes Forfaits' : 'My Packages',
    examHistory: language === 'rw' ? 'Amasaha Yanjye Y\'ibizamini' : language === 'fr' ? 'Mon Historique d\'Examens' : 'My Exam History',
    active: language === 'rw' ? 'Bikora' : language === 'fr' ? 'Actif' : 'Active',
    expired: language === 'rw' ? 'Bihanze' : language === 'fr' ? 'Expiré' : 'Expired',
    pending: language === 'rw' ? 'Bisubizwa' : language === 'fr' ? 'En attente' : 'Pending',
    attemptsLeft: language === 'rw' ? 'Ibizamini Bishira' : language === 'fr' ? 'Examens restants' : 'Attempts Left',
    unlimited: language === 'rw' ? 'Bidashira' : language === 'fr' ? 'Illimité' : 'Unlimited',
    expires: language === 'rw' ? 'Gihanza' : language === 'fr' ? 'Expire le' : 'Expires',
    startExam: language === 'rw' ? 'Tangira Ikizamini' : language === 'fr' ? 'Commencer l\'examen' : 'Start Exam',
    buyMore: language === 'rw' ? 'Gura Bindi' : language === 'fr' ? 'Acheter plus' : 'Buy More',
    score: language === 'rw' ? 'Ubuhinzi' : language === 'fr' ? 'Score' : 'Score',
    completed: language === 'rw' ? 'Byagenze Neza' : language === 'fr' ? 'Terminé' : 'Completed',
    noPackages: language === 'rw' ? 'Nta bikoresho ufite. Gura ikintu kugira uvatangire.' : language === 'fr' ? 'Aucun forfait. Achetez pour commencer.' : 'No packages yet. Buy one to start.',
    noSessions: language === 'rw' ? 'Nta masaha y\'ibizamini yabaye.' : language === 'fr' ? 'Aucune session d\'examen effectuée.' : 'No exam sessions yet.',
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t.title} subtitle="" />
        <div className="flex items-center justify-center h-64">Loading...</div>
      </>
    );
  }

  const activePackages = packages.filter(p => p.status === 'active');
  const expiredPackages = packages.filter(p => p.status !== 'active');

  const PLAN_TOTALS: Record<string, number> = {
    FREE: 1,
    STARTER: 10,
    BASIC: 15,
    STANDARD: 20,
    MASTER: 20,
    PREMIUM: 25,
    PRO: 50,
    UNLIMITED: 100,
  };

  return (
    <>
      <PageHeader 
        title={t.title} 
        subtitle={language === 'rw' ? 'Reba ibikoresho byawe n\'amasaha y\'ibizamini' : language === 'fr' ? 'Voir vos forfaits et sessions d\'examen' : 'View your packages and exam sessions'} 
      />

      <section className="bg-background py-10">
        <div className="max-w-6xl mx-auto px-6 space-y-8">

          {/* Active Packages */}
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">{t.myPackages}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePackages.length > 0 ? (
                activePackages.map((pkg) => (
                  <div key={pkg.id} className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-sm font-semibold text-primary px-3 py-1 rounded-full bg-primary/10">{pkg.package_key}</span>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{t.active}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        {t.attemptsLeft}:{' '}
                        <span className="text-foreground font-medium">
                          {pkg.unlimited ? t.unlimited : pkg.remaining_attempts}
                        </span>
                        {!pkg.unlimited && PLAN_TOTALS[pkg.package_key] != null && (
                          <span className="text-muted-foreground">
                            {' '}
                            ({Math.max(0, PLAN_TOTALS[pkg.package_key] - Number(pkg.remaining_attempts ?? 0))}{' '}
                            {language === 'rw' ? 'kubonetse' : language === 'fr' ? 'passés' : 'used'} /{' '}
                            {PLAN_TOTALS[pkg.package_key]})
                          </span>
                        )}
                      </p>
                      {pkg.expires_at && (
                        <p className="text-muted-foreground">{t.expires}: <span className="text-foreground font-medium">{new Date(pkg.expires_at).toLocaleDateString()}</span></p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Link to={`/buy?package=${pkg.package_key}`} className="flex-1 text-center text-sm font-semibold text-primary hover:underline">
                        {t.buyMore}
                      </Link>
                      {!pkg.unlimited && pkg.remaining_attempts && pkg.remaining_attempts > 0 && (
                        <Link to={`/exams?plan=${pkg.package_key}&start=0`} className="flex-1 bg-primary text-primary-foreground text-center py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                          {t.startExam}
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-background border border-border rounded-2xl">
                  <p className="text-muted-foreground mb-4">{t.noPackages}</p>
                  <Link to="/packages" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90">
                    {t.buyMore}
                  </Link>
                </div>
              )}
            </div>

            {/* Expired/Pending Packages */}
            {expiredPackages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">{language === 'rw' ? 'Ibikoresho Bihanze' : 'Expired Packages'}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {expiredPackages.map((pkg) => (
                    <div key={pkg.id} className="bg-muted/50 border border-border rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{pkg.package_key}</span>
                        <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-full bg-muted">
                          {pkg.status === 'pending' ? t.pending : t.expired}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pkg.amount_rwf.toLocaleString()} RWF • {pkg.activated_at ? new Date(pkg.activated_at).toLocaleDateString() : 'Not activated'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exam History */}
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">{t.examHistory}</h2>
            <div className="bg-background border border-border rounded-2xl overflow-hidden">
              {sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-muted-foreground">
                        <th className="p-4 font-medium">Exam</th>
                        <th className="p-4 font-medium text-center">{t.score}</th>
                        <th className="p-4 font-medium text-center">Status</th>
                        <th className="p-4 font-medium text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium text-foreground">{session.plan}</td>
                          <td className="p-4 text-center text-foreground">
                            {session.score !== null && session.total_questions
                              ? `${session.score} / ${session.total_questions} (${Math.round((session.score / session.total_questions) * 100)}%)`
                              : '—'}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {session.status === 'completed' ? t.completed : session.status}
                            </span>
                          </td>
                          <td className="p-4 text-right text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t.noSessions}</p>
                  {activePackages.length > 0 && (
                    <Link to={`/exams?plan=${activePackages[0].package_key}&start=0`} className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90">
                      {t.startExam}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
