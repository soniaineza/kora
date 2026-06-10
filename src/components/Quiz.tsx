import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw, ArrowRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n';

const SpeedSign60 = () =>
<svg viewBox="0 0 100 100" className="w-20 h-20" aria-hidden="true">
    <circle
    cx="50"
    cy="50"
    r="44"
    fill="white"
    stroke="#DC2626"
    strokeWidth="9" />
    <text
    x="50"
    y="66"
    fontFamily="Arial"
    fontSize="34"
    fontWeight="900"
    textAnchor="middle"
    fill="#111">
      60
    </text>
  </svg>;

const TriangleWarning = () =>
<svg viewBox="0 0 100 100" className="w-20 h-20" aria-hidden="true">
    <polygon
    points="50,8 92,86 8,86"
    fill="white"
    stroke="#DC2626"
    strokeWidth="9"
    strokeLinejoin="round" />
    <text
    x="50"
    y="76"
    fontFamily="Arial"
    fontSize="46"
    fontWeight="900"
    textAnchor="middle"
    fill="#111">
      !
    </text>
  </svg>;

export function Quiz({
  totalQuestions = 5,
  isSample = true,
  sessionId,
  plan,
}: {
  totalQuestions?: number;
  isSample?: boolean;
  sessionId?: string;
  plan?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sampleTaken, setSampleTaken] = useState(false);
  const { t } = useLanguage();

  // build questions pool by cycling the t.quiz.questions entries
  const base = t.quiz.questions;
  const answers = [1, 1, 2, 2, 2];
  const visuals = [<SpeedSign60 />, undefined, <TriangleWarning />, undefined, undefined];
  const questions = Array.from({ length: totalQuestions }).map((_, i) => ({
    correct: answers[i % answers.length],
    visual: visuals[i % visuals.length]
  }));
  const q = questions[current];
  const qText = base[current % base.length];
  const progress = (current + (revealed ? 1 : 0)) / questions.length * 100;

  useEffect(() => {
    if (isSample) {
      const alreadyTaken = localStorage.getItem('kora-sample-taken') === '1';
      setSampleTaken(alreadyTaken);
    }
  }, [isSample]);

  if (isSample && sampleTaken) {
    return (
      <section id="quiz" className="bg-background py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 mb-5 text-xs font-semibold">
            {t.quiz.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">Free sample already used</h2>
          <p className="text-muted-foreground mb-6">
            You have already tried the free sample quiz. Choose a pricing package to continue practicing with full exams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/packages" className="rounded-full bg-primary px-6 py-3 text-primary-foreground font-bold">View Packages</a>
            <a href="/library" className="rounded-full border border-border px-6 py-3 text-foreground">Read the Library</a>
          </div>
        </div>
      </section>
    );
  }

  const apiBase = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5001';

  if (finished) {
    const percentage = (score / questions.length) * 100;
    let message = t.quiz.keepGoing;
    if (percentage === 100) message = t.quiz.perfect;
    else if (percentage >= 80) message = t.quiz.excellent;
    else if (percentage >= 60) message = t.quiz.onTrack;

    return (
      <section id="quiz" className="bg-background py-20">
      <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-[2rem] border border-border bg-background p-10 text-center shadow-xl shadow-foreground/5">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy size={40} />
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-foreground mb-2">
              {percentage >= 60 ? t.quiz.excellent : t.quiz.good}
            </h2>
            <p className="text-muted-foreground mb-8">{message}</p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="rounded-3xl bg-muted p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t.quiz.score}</p>
                <p className="text-3xl font-heading font-extrabold text-foreground">{score} / {questions.length}</p>
              </div>
              <div className="rounded-3xl bg-muted p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Percentage</p>
                <p className="text-3xl font-heading font-extrabold text-foreground">{Math.round(percentage)}%</p>
              </div>
            </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setCurrent(0);
                  setSelected(null);
                  setRevealed(false);
                  setScore(0);
                  setFinished(false);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-all hover:bg-muted"
              >
                <RotateCcw size={18} />
                {t.quiz.tryAgain}
              </button>
              {!isSample && plan && !Number.isNaN(Number(plan)) && (
                <div className="hidden" />
              )}
              {isSample ? (
                <a
                  href="/packages"
                  className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  {t.quiz.fullAccess}
                </a>
              ) : (
                <a
                  href={`/buy?package=${encodeURIComponent(plan || '')}&network=mtn`}
                  className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  Get Full Access
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleSelect = (idx: number) => {
    if (!revealed) setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === q.correct) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    if (current === questions.length - 1) {
      setFinished(true);
      if (isSample) {
        localStorage.setItem('kora-sample-taken', '1');
      } else if (sessionId) {
        // Submit exam to backend
        try {
          const apiBase = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5001';
          const token = localStorage.getItem('kora-jwt');
          await fetch(`${apiBase}/api/internal/submit-exam`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId, score, totalQuestions: questions.length })
          });
        } catch (e) {
          console.error('Failed to submit exam', e);
        }
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setFinished(false);
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
              <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                {t.quiz.subtitle}
              </p>
              <div className="mt-10 rounded-[1.75rem] border border-border bg-background/90 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {t.quiz.question} {current + 1} / {questions.length}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">02:41</p>
                  </div>
                  <div className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground">
                    {qText.category}
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
                    <h3 className="mt-3 text-xl font-semibold text-foreground leading-snug">
                      {qText.prompt}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
                      {qText.category}
                    </div>
                    {q.visual && (
                      <div className="rounded-2xl border border-border bg-muted/30 p-2">
                        {q.visual}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {qText.options.map((opt, i) => {
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
                        className={`flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left text-sm font-medium transition-all duration-300 ${classes}`}>
                        <span className="flex items-center gap-4">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${isSelected || showCorrect ? 'bg-primary text-primary-foreground' : showWrong ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>
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
                      className="overflow-hidden">
                      <div className={`rounded-3xl border-l-4 p-5 ${selected === q.correct ? 'bg-primary/5 border-primary' : 'bg-muted border-foreground/30'}`}>
                        <p className={`text-xs font-bold uppercase tracking-[0.25em] ${selected === q.correct ? 'text-primary' : 'text-foreground'}`}>
                          {selected === q.correct ? t.quiz.correct : t.quiz.notQuite}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-foreground/80">{qText.explanation}</p>
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
                      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
                      {t.quiz.submit}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/90">
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
