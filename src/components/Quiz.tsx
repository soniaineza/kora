import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Trophy, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';
import { getQuestionBank, sampleQuestions } from '../lib/questionBank';
import type { Question } from '../lib/questionBank';

const SpeedSign60 = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="white" stroke="#DC2626" strokeWidth="9" />
    <text
      x="50"
      y="66"
      fontFamily="Arial"
      fontSize="34"
      fontWeight="900"
      textAnchor="middle"
      fill="#111"
    >
      60
    </text>
  </svg>
);

const TriangleWarning = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20" aria-hidden="true">
    <polygon
      points="50,8 92,86 8,86"
      fill="white"
      stroke="#DC2626"
      strokeWidth="9"
      strokeLinejoin="round"
    />
    <text
      x="50"
      y="76"
      fontFamily="Arial"
      fontSize="46"
      fontWeight="900"
      textAnchor="middle"
      fill="#111"
    >
      !
    </text>
  </svg>
);

export function Quiz({
  totalQuestions,
  isSample = true,
  sessionId,
  plan,
}: {
  totalQuestions?: number;
  isSample?: boolean;
  sessionId?: string;
  plan?: string;
}) {
  const TOTAL_QUESTIONS = totalQuestions ?? 20;
  const { t, language } = useLanguage();
  const DEFAULT_EXAM_DURATION_SECONDS = 20 * 60;

  const [examDurationSeconds, setExamDurationSeconds] = useState<number>(DEFAULT_EXAM_DURATION_SECONDS);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(TOTAL_QUESTIONS).fill(null));
  const [finished, setFinished] = useState(false);

  const [sampleTaken, setSampleTaken] = useState(false);
  const [freeStatusLoading, setFreeStatusLoading] = useState(false);

  const [timerArmed, setTimerArmed] = useState(false);

  const storageKey = sessionId ? `kora-exam-timer-${sessionId}` : 'kora-sample-timer';
  const [startAtMs, setStartAtMs] = useState<number | null>(null);

  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    (async () => {
      try {
        const apiBase = getApiBase();
        const token = localStorage.getItem('kora-jwt');
        if (!token) return;

        const res = await fetch(`${apiBase}/api/internal/session?sessionId=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json().catch(() => null);
        const seconds =
          Number((data as any)?.session?.duration_seconds ?? (data as any)?.session?.durationSeconds ?? (data as any)?.session?.duration);

        if (!cancelled && Number.isFinite(seconds) && seconds > 0) {
          setExamDurationSeconds(seconds);
        }
      } catch {
        // Keep the default duration if the session lookup fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Deterministic seed so each attempt/session gets a different (but stable) set.
  const seedSource = sessionId || (startAtMs ? String(startAtMs) : 'sample');

  const questions = useMemo<Question[]>(
    () => sampleQuestions(language, TOTAL_QUESTIONS, seedSource),
    [language, TOTAL_QUESTIONS, seedSource]
  );

  // Bank order keeps the decorative sign SVGs attached to the two sign questions.
  const qVisual = (q: Question) => {
    const bank = getQuestionBank(language);
    const i = bank.indexOf(q);
    if (i === 0) return <SpeedSign60 />;
    if (i === 2) return <TriangleWarning />;
    return undefined;
  };

  const q = questions[current];

  const score = useMemo(
    () => questions.reduce((s, question, i) => (answers[i] !== null && answers[i] === question.correct ? s + 1 : s), 0),
    [questions, answers]
  );

  useEffect(() => {
    let cancelled = false;

    // Ensure timer is not started automatically for fresh attempt.
    setTimerArmed(false);
    setStartAtMs(null);

    (async () => {
      try {
        setFreeStatusLoading(true);
        const apiBase = getApiBase();
        const token = localStorage.getItem('kora-jwt');

        if (!token) {
          const alreadyTaken = localStorage.getItem('kora-sample-taken') === '1';
          if (!cancelled) setSampleTaken(alreadyTaken);
          return;
        }

        const res = await fetch(`${apiBase}/api/internal/free-exam/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const alreadyTaken = localStorage.getItem('kora-sample-taken') === '1';
          if (!cancelled) setSampleTaken(alreadyTaken);
          return;
        }

        if (!cancelled) setSampleTaken(!!data?.alreadyTaken);
      } catch {
        const alreadyTaken = localStorage.getItem('kora-sample-taken') === '1';
        if (!cancelled) setSampleTaken(alreadyTaken);
      } finally {
        if (!cancelled) setFreeStatusLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSample]);
  // Only hydrate existing timer — never create one. Creation happens on user click.
  useEffect(() => {
    if (!storageKey) return;

    let mounted = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { startedAtMs?: number };
        if (typeof parsed.startedAtMs === 'number') {
          if (!mounted) return;
          setStartAtMs(parsed.startedAtMs);
          setTimerArmed(true);
        }
      }
    } catch {
      // ignore corrupted storage
    }

    return () => {
      mounted = false;
    };
  }, [sessionId, isSample, storageKey]);

  // Countdown (timer should start only after user clicks Start Timer)
  useEffect(() => {
    if (!startAtMs) return;
    if (!timerArmed) return;

    let mounted = true;

    const compute = () => {
      const elapsedMs = Date.now() - startAtMs;
      const remainingMs = examDurationSeconds * 1000 - elapsedMs;
      if (!mounted) return;

      setTimeLeftMs(remainingMs > 0 ? remainingMs : 0);
      if (remainingMs <= 0) {
        setRevealed(true);
      }
    };

    compute();
    const intervalId = window.setInterval(compute, 250);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [startAtMs, examDurationSeconds, isSample, timerArmed]);

  const computeScore = () =>
    questions.reduce((s, question, i) => (answers[i] !== null && answers[i] === question.correct ? s + 1 : s), 0);

  const submitExamOnce = React.useCallback(
    async (finalScore: number) => {
      if (hasAutoSubmitted) return;

      setHasAutoSubmitted(true);

      try {
        const apiBase = getApiBase();
        const token = localStorage.getItem('kora-jwt');

        if (sessionId) {
          // Paid exam
          await fetch(`${apiBase}/api/internal/submit-exam`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionId,
              score: finalScore,
              totalQuestions: questions.length,
            }),
          });
          return;
        }

        if (isSample) {
          // Free sample
          if (!token) return;
          await fetch(`${apiBase}/api/internal/free-exam/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ score: finalScore, totalQuestions: questions.length }),
          });
        }
      } catch (e) {
        console.error('Auto submit failed', e);
      } finally {
        try {
          if (storageKey) localStorage.removeItem(storageKey);
        } catch {
          // Ignore storage cleanup failures.
        }
      }
    },
    [hasAutoSubmitted, sessionId, isSample, questions.length, storageKey]
  );

  // When time hits 0: finish + submit
  useEffect(() => {
    if (timeLeftMs === null) return;
    if (timeLeftMs > 0) return;
    if (finished) return;

    setFinished(true);
    setRevealed(true);
    submitExamOnce(computeScore());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftMs, finished, submitExamOnce]);

  const formattedTime = useMemo(() => {
    const ms = timeLeftMs ?? examDurationSeconds * 1000;
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timeLeftMs, examDurationSeconds]);
  if (isSample && freeStatusLoading) {
    return (
      <section id="quiz" className="bg-background py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-heading font-extrabold text-foreground mb-3">{t.quiz.results}</h2>
          <p className="text-muted-foreground">{t.quiz.loading}</p>
        </div>
      </section>
    );
  }

  if (isSample && sampleTaken) {
    return (
      <section id="quiz" className="bg-background py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 mb-5 text-xs font-semibold">
            {t.quiz.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">
            {language === 'rw' ? "Ikizamini cy'urugero kirarangiye" : 'Free sample already used'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'rw'
              ? "Wagerageje ikizamini cy'urugero. Komeza kwitoza ukoresheje Library cyangwa jya mu gice cy'amasomo."
              : 'You have already tried the free sample quiz. Start learning in the Library.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/library"
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {t.quiz.startLearning}
            </a>
          </div>
        </div>
      </section>
    );
  }
  const startFreeTrialTimer = () => {
    if (timerArmed) return;
    const now = Date.now();
    setStartAtMs(now);
    try {
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({ startedAtMs: now }));
      }
    } catch (_e) {
      // ignore localStorage errors
    }
    setTimerArmed(true);
  };

  if (!timerArmed) {
    return (
      <section id="quiz" className="bg-background py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-[2rem] border border-border bg-background p-10 text-center shadow-xl shadow-foreground/5">
            <div className="relative mx-auto mb-8 h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Trophy size={36} />
              </div>
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-foreground mb-3">
              {language === 'rw' ? 'Witeguye ikizamini?' : 'Ready for your exam?'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'rw'
                ? 'Ufite iminota 20 ngo usubize ibibazo 20. Kanda hasi gutangira kubara igihe.'
                : 'You have 20 minutes to answer 20 questions. Click below to start the timer.'}
            </p>
            <button
              onClick={startFreeTrialTimer}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {t.quiz.startTimer}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (finished) {
    const percentage = (score / questions.length) * 100;
    let message: string = t.quiz.keepGoing;
    if (percentage === 100) message = String(t.quiz.perfect);
    else if (percentage >= 80) message = String(t.quiz.excellent);
    else if (percentage >= 60) message = String(t.quiz.onTrack);
    const passed = score >= Math.ceil(questions.length / 2);
    return (
      <section id="quiz" className="bg-background py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-[2rem] border border-border bg-background p-10 text-center shadow-xl shadow-foreground/5">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy size={40} />
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-foreground mb-2">
              {passed ? (percentage >= 80 ? t.quiz.excellent : t.quiz.good) : t.quiz.good}
            </h2>
            <p className="text-muted-foreground mb-8">{message}</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="rounded-3xl bg-muted p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t.quiz.score}</p>
                <p className="text-3xl font-heading font-extrabold text-foreground">
                  {score} / {questions.length}
                </p>
              </div>
              <div className="rounded-3xl bg-muted p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t.quiz.percentage}</p>
                <p className="text-3xl font-heading font-extrabold text-foreground">{Math.round(percentage)}%</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isSample && (
                <button
                  onClick={() => {
                    setCurrent(0);
                    setSelected(null);
                    setRevealed(false);
                    setAnswers(Array(TOTAL_QUESTIONS).fill(null));
                    setFinished(false);
                    setHasAutoSubmitted(false);
                    setStartAtMs(Date.now());
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-all hover:bg-muted"
                >
                  <RotateCcw size={18} />
                  {t.quiz.tryAgain}
                </button>
              )}
              {isSample ? (
                <a
                  href="/packages"
                  className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  {t.quiz.fullAccess}
                </a>
              ) : (
                <>
                  <a
                    href={`/exams?plan=${encodeURIComponent(plan || '')}&start=0`}
                    className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    {language === 'rw' ? 'Kora Ikindi Kizamini' : language === 'fr' ? 'Passer un autre examen' : 'Take Another Exam'}
                  </a>
                  <a
                    href="/packages"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-all hover:bg-muted"
                  >
                    {language === 'rw' ? 'Paketi' : language === 'fr' ? 'Forfaits' : 'Back to Packages'}
                  </a>
                </>
              )}
            </div>

            {/* Answer review */}
            {questions.length > 0 && (
              <div className="mt-12 text-left">
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {language === 'rw'
                    ? 'Igisubizo cyawe kuri buri kibazo'
                    : language === 'fr'
                      ? 'Vos réponses détaillées'
                      : 'Review your answers'}
                </div>
                <div className="space-y-4">
                  {questions.map((question, i) => {
                    const userAns = answers[i];
                    const ok = userAns === question.correct;
                    return (
                      <div key={i} className="rounded-3xl border border-border bg-background p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground leading-6">
                            {i + 1}. {question.prompt}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                              userAns === null
                                ? 'bg-muted text-muted-foreground'
                                : ok
                                  ? 'bg-green-500/10 text-green-600'
                                  : 'bg-red-500/10 text-red-600'
                            }`}
                          >
                            {userAns === null
                              ? language === 'rw'
                                ? 'Nta gisubizo'
                                : language === 'fr'
                                  ? 'Sans réponse'
                                  : 'No answer'
                              : ok
                                ? t.quiz.correct
                                : t.quiz.notQuite}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {question.category}
                        </p>
                        <div className="mt-3 space-y-1.5">
                          {question.options.map((opt, oi) => {
                            const isRight = oi === question.correct;
                            const isUserWrong = oi === userAns && !ok;
                            let classes = 'border border-border bg-muted/30';
                            if (isRight) classes = 'border-2 border-green-500 bg-green-500/5';
                            else if (isUserWrong) classes = 'border-2 border-red-500 bg-red-500/5';
                            return (
                              <div
                                key={oi}
                                className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm ${classes}`}
                              >
                                <span className="flex items-center gap-3">
                                  <span
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                      isRight
                                        ? 'bg-green-600 text-white'
                                        : isUserWrong
                                          ? 'bg-red-600 text-white'
                                          : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <span className={isRight ? 'text-green-700' : isUserWrong ? 'text-red-700' : 'text-foreground'}>
                                    {opt}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  {isRight && <Check size={16} className="text-green-600" strokeWidth={3} />}
                                  {isUserWrong && <X size={16} className="text-red-600" strokeWidth={3} />}
                                  {isUserWrong && userAns === oi && (
                                    <span className="text-[10px] font-bold uppercase text-red-600">
                                      {language === 'rw' ? 'Icyo wahisemo' : language === 'fr' ? 'Votre choix' : 'Your pick'}
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-3 rounded-2xl bg-primary/5 border-l-4 border-primary p-4 text-sm leading-6 text-foreground/80">
                          {question.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    const copy = [...answers];
    copy[current] = idx;
    setAnswers(copy);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const handleNext = () => {
    if (current === questions.length - 1) {
      if (isSample) {
        localStorage.setItem('kora-sample-taken', '1');
      }
      setFinished(true);
      submitExamOnce(computeScore());
      return;
    }
    const next = current + 1;
    setCurrent(next);
    setSelected(answers[next] ?? null);
    setRevealed(false);
  };
  return (
    <section id="quiz" className="bg-background py-20 md:py-24" data-plan={plan || ''}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-background shadow-xl shadow-foreground/5">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1.85fr]">
            <div className="bg-primary/5 px-8 py-10 sm:px-10 sm:py-12">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-secondary-foreground">
                {t.quiz.badge}
              </span>
              <h2 className="mt-8 text-4xl font-heading font-extrabold text-foreground leading-tight">
                {t.quiz.title}
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground">{t.quiz.subtitle}</p>

              <div className="mt-10 rounded-[1.75rem] border border-border bg-background/90 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {t.quiz.question} {current + 1} / {questions.length}
                    </p>

                    <div className="mt-2">
                      <div className="inline-flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-extrabold text-primary tracking-wider tabular-nums">
                            {formattedTime}
                          </span>

                          <span className="text-sm font-semibold text-muted-foreground">
                            {t.quiz.timeLeftLabel}
                          </span>

                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground">
                    {q.category}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {t.quiz.question} {current + 1} / {questions.length}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-foreground leading-snug">{q.prompt}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
                      {q.category}
                    </div>
                    {qVisual(q) && (
                      <div className="rounded-2xl border border-border bg-muted/30 p-2">{qVisual(q)}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {q.options.map((opt: string, i: number) => {
                    const isSelected = selected === i;
                    const isCorrect = i === q.correct;
                    const showCorrect = revealed && isCorrect;
                    const showWrong = revealed && isSelected && !isCorrect;

                    let classes = 'border border-border bg-background hover:border-foreground/30';
                    if (showCorrect) classes = 'border-2 border-primary bg-primary/5';
                    else if (showWrong) classes = 'border-2 border-destructive bg-destructive/5';
                    else if (isSelected && !revealed) classes = 'border-2 border-primary bg-primary/5';

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={revealed}
                        className={`flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left text-sm font-medium transition-all duration-300 ${classes}`}
                      >
                        <span className="flex items-center gap-4">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                              isSelected || showCorrect
                                ? 'bg-primary text-primary-foreground'
                                : showWrong
                                  ? 'bg-destructive text-destructive-foreground'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-foreground leading-6">{opt}</span>
                        </span>
                        {showCorrect && <Check size={20} className="text-primary" strokeWidth={3} />}
                        {showWrong && <X size={20} className="text-destructive" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`rounded-3xl border-l-4 p-5 ${
                          selected === q.correct ? 'bg-primary/5 border-primary' : 'bg-muted border-foreground/30'
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase tracking-[0.25em] ${
                            selected === q.correct ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {selected === q.correct ? t.quiz.correct : t.quiz.notQuite}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-foreground/80">{q.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t.quiz.score}: <span className="font-semibold text-foreground">{score} / {questions.length}</span>
                  </div>
                  {!revealed ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selected === null}
                      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.quiz.submit}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/90"
                    >
                      {current === questions.length - 1 ? t.quiz.results : t.quiz.next}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}