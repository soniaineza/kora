import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Signal, Wifi, BatteryFull } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import happyCustom from '../assets/illustrations/happy-woman.png';
import avatar1 from '../assets/avatars/black1.svg';
import avatar2 from '../assets/avatars/black2.svg';
import avatar3 from '../assets/avatars/black3.svg';
import avatar4 from '../assets/avatars/black4.svg';
/* Speed limit 60 sign */
const SpeedLimitSign = () =>
<svg viewBox="0 0 100 100" className="w-24 h-24" aria-hidden="true">
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
    fontFamily="Arial, sans-serif"
    fontSize="38"
    fontWeight="900"
    textAnchor="middle"
    fill="#111">
      60
    </text>
  </svg>;
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary" aria-hidden="true">
    <rect x="1.5" y="6" width="21" height="9" rx="2" />
    <path d="M3 15v1.5a1.5 1.5 0 0 0 1.5 1.5h.5a1 1 0 0 0 1-1v-1H3z" />
    <path d="M20.5 15v1.5a1.5 1.5 0 0 1-1.5 1.5h-.5a1 1 0 0 1-1-1V15h3z" />
    <circle cx="7.25" cy="17.25" r="1.25" />
    <circle cx="16.75" cy="17.25" r="1.25" />
  </svg>
);
const MotorcycleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary" aria-hidden="true">
    <path d="M3 13h3l2-3h4l2.5 4H21" />
    <path d="M6 16a2 2 0 1 0 0 0" />
    <path d="M18 16a2 2 0 1 0 0 0" />
    <path d="M12 7v2" />
  </svg>
);
const PhoneMockup = () => {
const { t } = useLanguage();
return (
<motion.div
  className="relative mx-auto w-[292px] sm:w-[330px] max-w-full"
  animate={{
    y: [0, -10, 0]
  }}
  transition={{
    duration: 5.2,
    repeat: Infinity,
    ease: 'easeInOut'
  }}>
    <div className="absolute -inset-5 rounded-[3.6rem] bg-gradient-to-br from-primary/20 via-sky-400/10 to-accent/20 blur-2xl opacity-70"></div>
    {/* Grey iPhone frame */}
    <div className="relative rounded-[3.25rem] bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 p-[7px] shadow-[0_32px_80px_rgba(15,23,42,0.28)] ring-1 ring-white/40">
      <div className="absolute left-[-4px] top-28 h-16 w-1 rounded-l-full bg-zinc-500"></div>
      <div className="absolute right-[-4px] top-24 h-12 w-1 rounded-r-full bg-zinc-600"></div>
      <div className="absolute right-[-4px] top-40 h-20 w-1 rounded-r-full bg-zinc-600"></div>
      <div className="rounded-[2.85rem] bg-zinc-950 p-[9px]">
        <div className="relative h-[600px] overflow-hidden rounded-[2.35rem] bg-background">
          <div className="absolute left-1/2 top-3 z-30 h-7 w-28 -translate-x-1/2 rounded-full bg-zinc-950 shadow-sm"></div>
          <div className="relative z-10 flex items-center justify-between px-6 pb-3 pt-12 text-[10px] font-mono text-muted-foreground">
            <span>{t.hero.mock?.statusTime ?? ''}</span>
            <div className="flex items-center gap-1.5 text-foreground">
              <Signal size={12} />
              <Wifi size={12} />
              <BatteryFull size={14} />
            </div>
          </div>
          <div className="px-5">
            <div className="rounded-3xl border border-border bg-background/95 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>{t.hero.questionCount}</span>
                <span>{t.hero.mock?.questionTime ?? ''}</span>
              </div>
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-sky-500 to-accent"
                  initial={{
                    width: '18%'
                  }}
                  animate={{
                    width: '70%'
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.7,
                    ease: 'easeOut'
                  }} />
              </div>

              {/* Sign display */}
              <motion.div
                className="mb-5 flex items-center justify-center rounded-2xl bg-gradient-to-br from-muted via-secondary/60 to-sky-100/70 py-8 dark:from-muted dark:via-secondary/30 dark:to-sky-950/30"
                animate={{
                  scale: [1, 1.025, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}>
                
                <SpeedLimitSign />
              </motion.div>

              {/* Question */}
              <div>
                <p className="mb-4 text-sm font-semibold leading-snug text-foreground">
                  {t.hero.phoneQuestion}
                </p>

                <div className="space-y-2.5">
                  <div className="rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors">
                    {t.hero.mock?.optionA ?? ''}
                  </div>
                  <motion.div
                    className="flex items-center justify-between rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-sm text-foreground shadow-sm"
                    initial={{
                      scale: 0.98
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.45, 
                      delay: 1,
                      ease: 'easeOut'
                    }}>
                    
                    <span className="font-medium">{t.hero.mock?.optionB ?? ''}</span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check
                        size={12}
                        className="text-primary-foreground"
                        strokeWidth={3} />
                    </div>
                  </motion.div>
                  <div className="rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors">
                    {t.hero.mock?.optionC ?? ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </motion.div>);
};
export function Hero() {
  const { t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const hashLink = (hash: string) => isHome ? `#${hash}` : `/#${hash}`;
  const [sampleTaken, setSampleTaken] = useState(false);
  useEffect(() => {
    setSampleTaken(localStorage.getItem('kora-sample-taken') === '1');
  }, []);
  return (
    <section className="hero-pro-bg relative overflow-hidden border-b border-border py-16 transition-colors duration-500 md:py-24">
      <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:64px_64px]"></div>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-500 to-accent"></div>
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        {/* Left */}
        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1]
          }}>
          
          {/* Pill */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.45,
              delay: 0.1
            }}>
            
            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
            {t.hero.badge}
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-foreground leading-[1.05] tracking-tight mb-6">
            {t.hero.titlePrefix}{' '}
            <span className="text-primary">{t.hero.titleHighlight}</span>{' '}
            {t.hero.titleSuffix}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
            {t.hero.description}
          </p>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center gap-3">
              <CarIcon />
              <MotorcycleIcon />
            </div>
            <span className="text-sm font-semibold text-foreground">{(t.hero as any).provisoireSubtitle ?? ((t.hero as any).provisoire_subtitle ?? '')}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-10 relative z-20">
            <Link
              to="/packages"
              className="rounded-full bg-primary px-6 py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl">
              {t.hero.codes}
            </Link>
            {/* Free trial CTA (single button). If already taken, prompt to register. */}
            <a
              href={sampleTaken ? '/register' : hashLink('quiz')}
              onClick={(e) => {
                if (sampleTaken) {
                  // allow full navigation to /register when sample already taken
                  return;
                }
              }}
              className={`rounded-full border border-border px-6 py-3.5 text-center text-sm font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 ${sampleTaken ? 'bg-background/85 hover:border-foreground/30 hover:bg-background' : 'bg-background/85 hover:border-foreground/30 hover:bg-background'}`}>
              {sampleTaken ? t.hero.createAccountLink : t.hero.sample}

            </a>

          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img
                src={avatar1}
                alt=""
                loading="lazy"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-background object-cover" />
              
              <img
                src={avatar2}
                alt=""
                loading="lazy"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-background object-cover" />
              
              <img
                src={avatar3}
                alt=""
                loading="lazy"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-background object-cove
                r" />
              
              <img
                src={avatar4}
                alt=""
                loading="lazy"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-background object-cover" />
              
            </div>
            <span className="text-xs text-muted-foreground">
              {t.hero.joinedBy}{' '}
              <span className="font-semibold text-foreground">
                {t.hero.students}
              </span>{' '}
              {t.hero.thisMonth}
            </span>
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          className="relative flex justify-center"
          initial={{
            opacity: 0,
            y: 36,
            scale: 0.96
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}>
          <div className="relative w-full max-w-[380px]">
            <PhoneMockup />
            <motion.div
              className="absolute inset-x-0 bottom-0 flex justify-center sm:bottom-[-26px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}>
              <div className="flex flex-col items-center justify-center rounded-3xl bg-accent px-5 py-4 text-center text-accent-foreground shadow-xl ring-1 ring-white/20">
                <div className="font-heading text-3xl font-extrabold leading-none">98%</div>
                <div className="text-[10px] font-bold tracking-widest mt-1">{t.hero.passRate}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <div className="hidden md:block pointer-events-none absolute right-8 bottom-12 w-60">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white shadow-2xl">
          <img
            src={happyCustom}
            alt="Happy Black woman holding a provisional license card"
            className="h-56 w-full object-cover"
          />
          <div className="absolute left-4 top-4 rounded-3xl bg-white/95 px-3 py-2 shadow-lg shadow-foreground/10 border border-border">
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary">{t.hero.mock?.license ?? 'Licence'}</p>
            <p className="text-sm font-semibold text-foreground">{t.hero.mock?.licenseProvisoire ?? 'Provisoire'}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary">{t.hero.mock?.holdingProvisoire ?? 'Holding her provisoire'}</p>
            <p className="text-sm font-semibold text-white">{t.hero.mock?.happyNewDriver ?? 'Happy new driver'}</p>
          </div>
        </div>
      </div>
    </section>);

}
