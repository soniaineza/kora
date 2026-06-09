import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
const plans = [
  {
    key: 'STARTER',
    priceRWF: '500',
    priceUSD: '0.5',
    questions: '10',
    dimmed: [false, false],
    highlight: false,
    dark: false
  },
  {
    key: 'BASIC',
    priceRWF: '1,000',
    priceUSD: '1',
    questions: '20',
    dimmed: [false, false, false],
    highlight: false,
    dark: false
  },
  {
    key: 'STANDARD',
    priceRWF: '1,500',
    priceUSD: '1.5',
    questions: '25',
    dimmed: [false, false, false],
    highlight: true,
    dark: false
  },
  {
    key: 'MASTER',
    priceRWF: '2,000',
    priceUSD: '2',
    questions: '30',
    dimmed: [false, false],
    highlight: false,
    dark: true
  }
];

export function Pricing() {
  const [currency, setCurrency] = useState<'RWF' | 'USD'>('RWF');
  const { t } = useLanguage();
  return (
    <section
      id="pricing"
      className="professional-section bg-background py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-3">
              {t.pricing.title}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {t.pricing.subtitle}
            </p>
          </div>

          {/* Currency toggle */}
          <div className="inline-flex items-center rounded-full border border-border bg-muted p-1 shadow-sm self-start md:self-auto">
            <button
              onClick={() => setCurrency('RWF')}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all duration-300 ${currency === 'RWF' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              
              RWF
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all duration-300 ${currency === 'USD' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              
              USD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) =>
          <div
            key={i}
            className={`professional-card relative flex h-full flex-col rounded-2xl border p-6
                ${plan.dark ? 'bg-foreground text-background border-foreground' : plan.highlight ? 'bg-background border-primary border-2 shadow-lg' : 'bg-background border-border'}`}>
            
              {plan.highlight &&
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-3 py-1 text-[10px] font-bold tracking-widest">
                  {t.pricing.mostPopular}
                </div>
            }

              <div
              className={`text-xs font-bold tracking-widest mb-4 ${plan.dark ? 'text-background/60' : 'text-muted-foreground'}`}>
              
                {t.pricing.plans[i][0]}
              </div>

              <div className="mb-1">
                <span
                className={`text-4xl font-heading font-extrabold ${plan.dark ? 'text-background' : 'text-foreground'}`}>
                
                  {currency === 'RWF' ? plan.priceRWF : plan.priceUSD}
                </span>
              </div>
              <div
              className={`text-xs mb-2 ${plan.dark ? 'text-background/60' : 'text-muted-foreground'}`}>
              
                {currency === 'RWF' ? t.pricing.rwf : t.pricing.usd}
              </div>
              <div
              className={`text-xs font-semibold mb-6 ${plan.dark ? 'text-accent' : 'text-primary'}`}>
              
                {plan.questions} {t.pricing.questions}
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {t.pricing.plans[i][1].map((feat, j) =>
              <li key={j} className="flex items-center gap-2 text-xs">
                    {plan.dark ?
                <Star
                  size={14}
                  className="text-accent shrink-0 fill-accent" /> :


                <Check
                  size={14}
                  className={`shrink-0 ${plan.dimmed[j] ? 'text-muted-foreground/40' : 'text-primary'}`} />

                }
                    <span
                  className={
                  plan.dark ?
                  'text-background/90' :
                  plan.dimmed[j] ?
                  'text-muted-foreground/50' :
                  'text-foreground'
                  }>
                  
                      {feat}
                    </span>
                  </li>
              )}
              </ul>

              <Link
                to={`/exams?plan=${plan.key}`}
                className={`w-full inline-flex items-center justify-center rounded-full py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5
                ${plan.dark ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                {t.pricing.buy}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>);

}
