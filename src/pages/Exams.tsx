import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
import { Quiz } from '../components/Quiz';
import { getApiBase } from '../lib/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function Exams() {
  const q = useQuery();
  const plan = q.get('plan') || 'STARTER';
  const { t } = useLanguage();
  const start = q.get('start');
  const sessionId = q.get('sessionId');
  const apiBase = getApiBase();

  const planMap: Record<string, { price: string; exams: number }> = {
    STARTER: { price: '500 RWF', exams: 10 },
    BASIC: { price: '1,000 RWF', exams: 15 },
    STANDARD: { price: '1,500 RWF', exams: 20 },
    MASTER: { price: '2,000 RWF', exams: 20 },
    PREMIUM: { price: '3,000 RWF', exams: 25 },
    PRO: { price: '5,000 RWF', exams: 50 },
    UNLIMITED: { price: '7,000 RWF', exams: 999999 },
  };

  const p = planMap[plan] || planMap.STARTER;

  const [guard, setGuard] = React.useState<{ ok: boolean; reason?: string; remaining?: number }>(() => ({ ok: true }));

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) {
          if (!mounted) return;
          setGuard({ ok: false, reason: 'Please login/register first' });
          return;
        }

        const res = await fetch(
          `${apiBase}/api/internal/active-package?plan=${encodeURIComponent(plan)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Backend errors may return HTML (e.g., 404/forbidden). Avoid crashing on res.json().
        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const data = isJson ? await res.json() : await res.text();

        if (!res.ok) {
          const msg = typeof data === 'string' ? data : data?.error || 'Guard check failed';
          throw new Error(msg);
        }

        if (isJson && !data.active) {
          throw new Error('No active package. Please buy a package.');
        }

        if (!mounted) return;
        setGuard({ ok: true, remaining: (data as any)?.remaining_attempts });

      } catch (e: any) {
        if (!mounted) return;
        setGuard({ ok: false, reason: e?.message || 'Not activated' });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [plan, apiBase]);

  if (!guard.ok) {
    return (
      <section className="bg-background py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="rounded-3xl border border-border bg-background p-8">
            <h2 className="text-xl font-heading font-extrabold text-foreground mb-3">Access denied</h2>
            <p className="text-sm text-muted-foreground">{guard.reason}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                to="/register"
              >
                Register
              </Link>
              <Link
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground"
                to="/packages"
              >
                Choose package
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function ExamsQuizSessionGate() {
    // If user tries to open /exams?plan=...&start=1 without a valid sessionId,
    // block rendering.
    const [sessionGuard, setSessionGuard] = React.useState<{ ok: boolean; reason?: string }>(() => ({ ok: true }));
    const [loadingSession, setLoadingSession] = React.useState<boolean>(true);

    React.useEffect(() => {
      let mounted = true;

      (async () => {
        try {
          const token = localStorage.getItem('kora-jwt');
          if (!token) {
            if (!mounted) return;
            setSessionGuard({ ok: false, reason: 'Please login/register first' });
            setLoadingSession(false);
            return;
          }

          if (!sessionId) {
            if (!mounted) return;
            // If we arrived without a sessionId, user should land on package screen (start=0)
            setSessionGuard({ ok: false, reason: 'Missing session. Start the exam from the package screen.' });
            setLoadingSession(false);
            return;
          }


          const res = await fetch(
            `${apiBase}/api/internal/session?sessionId=${encodeURIComponent(sessionId)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'Invalid session');

          if (!mounted) return;
          setSessionGuard({ ok: true });
          setLoadingSession(false);
        } catch (e: any) {
          if (!mounted) return;
          setSessionGuard({ ok: false, reason: e?.message || 'Session invalid' });
          setLoadingSession(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, []);

    if (loadingSession) {
      return (
        <section className="bg-background py-12">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-muted-foreground">Loading session…</div>
          </div>
        </section>
      );
    }

    if (!sessionGuard.ok) {
      return (
        <section className="bg-background py-16">
          <div className="max-w-2xl mx-auto px-6">
            <div className="rounded-3xl border border-border bg-background p-8">
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-3">Session not valid</h2>
              <p className="text-sm text-muted-foreground">{sessionGuard.reason}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  className="rounded-full border border-border bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                  to="/packages"
                >
                  Buy / Choose package
                </Link>
                <Link
                  className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground"
                  to={`/exams?plan=${encodeURIComponent(plan)}&start=0`}
                >
                  Go back
                </Link>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="bg-background py-7 md:py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-background/60 shadow-xl shadow-foreground/5">
            {/* Background fills */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(220,38,38,0.22),transparent_38%)]" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-primary/10 blur-2xl" />

            {/* Subtle grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />

            <div className="relative p-6 sm:p-8 md:p-10">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                {/* Left */}
                <div className="text-left">
                  <div className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    {plan} Plan
                  </div>

                  <p className="text-sm text-muted-foreground mt-5">{t.exams.packageSummary}</p>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-heading font-extrabold text-foreground">
                    {t.exams.examTitle}
                  </h2>

                  <p className="mt-3 text-muted-foreground max-w-xl">
                    {t.exams.examSubtitle.replace('{count}', p.exams === 999999 ? 'Unlimited' : p.exams.toString())}
                  </p>

                  {guard.remaining != null && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-muted/70 px-3 py-1 text-xs font-semibold text-foreground">
                        {guard.remaining === 999999 ? 'Unlimited attempts' : `Remaining attempts: ${guard.remaining}`}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Pass mark: 12 / 20
                      </span>
                    </div>
                  )}
                </div>

                {/* Right stats */}
                <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-5 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Exam length</p>
                      <p className="mt-2 text-3xl font-heading font-extrabold text-foreground">20</p>
                      <p className="mt-1 text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div className="hidden sm:block">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <div className="h-3.5 w-3.5 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-px bg-border/60" />

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ready when you are</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Complete each 20-question exam and aim for at least 12 correct answers to pass.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Quiz totalQuestions={20} isSample={false} sessionId={sessionId || undefined} />
          </div>
        </div>
      </section>
    );
  }


  return (
    <>
      <PageHeader title={`Exams — ${plan}`} subtitle={`Includes ${p.exams} exam attempts`} />
      {!start ? (
        <section className="bg-background py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-background shadow-xl shadow-foreground/5">
              <div className="bg-primary/5 px-8 py-8 sm:px-10 sm:py-10">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">Selected package</p>
                <h2 className="mt-3 text-3xl font-heading font-extrabold text-foreground">{plan} plan</h2>
                <p className="mt-3 text-muted-foreground max-w-2xl">
                  You’re ready to begin full exam practice with {p.exams} exam attempts. Each exam includes 20 questions and
                  a 12/20 pass mark.
                </p>
              </div>

              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                  <div className="rounded-3xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Package</p>
                    <p className="mt-3 text-lg font-semibold text-foreground">{plan}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Price</p>
                    <p className="mt-3 text-lg font-semibold text-foreground">{p.price}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Attempts</p>
                    <p className="mt-3 text-lg font-semibold text-foreground">{p.exams}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-foreground/90 leading-relaxed mb-8">
                  <p>Complete each 20-question exam and aim for at least 12 correct answers to pass.</p>
                  <p>Need a quick review before you begin? Read the library for traffic signs and road rules.</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                      <Link
                    to="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const token = localStorage.getItem('kora-jwt');
                        if (!token) return;

                        // Resume: if there's an active unfinished session for the clicked plan, use it.
                        // If the active session is for a different plan, we start a new one.
                        const resumeRes = await fetch(
                          `${apiBase}/api/internal/active-session?plan=${encodeURIComponent(plan)}`,
                          {
                            method: 'GET',
                            headers: { Authorization: `Bearer ${token}` }
                          }
                        );

                        const resumeContentType = resumeRes.headers.get('content-type') || '';
                        const resumeIsJson = resumeContentType.includes('application/json');
                        const resumeData = resumeIsJson ? await resumeRes.json() : await resumeRes.text();

                        if (resumeRes.ok && resumeData?.ok && resumeData?.session?.id) {
                          window.location.href = `/exams?plan=${encodeURIComponent(plan)}&start=1&sessionId=${encodeURIComponent(
                            resumeData.session.id
                          )}`;
                          return;
                        }

                        const startRes = await fetch(
                          `${apiBase}/api/internal/start-exam`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ plan })
                          }
                        );

                        const startContentType = startRes.headers.get('content-type') || '';
                        const startIsJson = startContentType.includes('application/json');
                        const startData = startIsJson ? await startRes.json() : await startRes.text();

                        if (!startRes.ok) {
                          const msg = typeof startData === 'string' ? startData : startData?.error || 'Cannot start exam';
                          alert(msg);
                          return;
                        }

                        const newSessionId = (startData as any)?.sessionId as string | undefined;
                        if (!newSessionId) {
                          alert('Start exam succeeded but missing sessionId in response');
                          return;
                        }

                        window.location.href = `/exams?plan=${encodeURIComponent(plan)}&start=1&sessionId=${encodeURIComponent(newSessionId)}`;


                      } catch {
                        alert('Cannot start exam');
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    Start Exam
                  </Link>

                  <Link
                    to="/library"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30"
                  >
                    Read the Library
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <ExamsQuizSessionGate />
      )}

    </>
  );
}



