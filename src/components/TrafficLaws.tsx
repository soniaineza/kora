import React, { useState } from 'react';
import { useLanguage } from '../i18n';

const WarningSign = ({ symbol = '!' }: {symbol?: string;}) =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
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
      {symbol}
    </text>
  </svg>;

const BendSign = () =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
    <polygon
    points="50,8 92,86 8,86"
    fill="white"
    stroke="#DC2626"
    strokeWidth="9"
    strokeLinejoin="round" />
    <path
    d="M 40 75 Q 40 55 55 50 Q 70 45 70 30"
    fill="none"
    stroke="#111"
    strokeWidth="6"
    strokeLinecap="round" />
    <polygon points="63,32 70,22 77,32" fill="#111" />
  </svg>;

const SpeedSign = ({ limit }: {limit: string;}) =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
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
      {limit}
    </text>
  </svg>;

const NoEntry = () =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="#DC2626" />
    <rect x="22" y="44" width="56" height="12" fill="white" />
  </svg>;

const MandatoryArrow = () =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="#0052CC" />
    <path
    d="M 30 50 L 65 50 M 55 38 L 70 50 L 55 62"
    fill="none"
    stroke="white"
    strokeWidth="8"
    strokeLinecap="round"
    strokeLinejoin="round" />
  </svg>;

const Roundabout = () =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="#0052CC" />
    <g fill="none" stroke="white" strokeWidth="5" strokeLinecap="round">
      <path d="M 50 28 A 22 22 0 0 1 72 50" />
      <path d="M 72 50 A 22 22 0 0 1 50 72" />
      <path d="M 50 72 A 22 22 0 0 1 28 50" />
      <path d="M 28 50 A 22 22 0 0 1 50 28" />
    </g>
    <polygon points="68,30 78,38 66,42" fill="white" />
  </svg>;

const StopSign = () =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
    <polygon
    points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30"
    fill="#DC2626"
    stroke="white"
    strokeWidth="5" />
    <text
    x="50"
    y="60"
    fontFamily="Arial"
    fontSize="22"
    fontWeight="900"
    textAnchor="middle"
    fill="white">
      STOP
    </text>
  </svg>;

const YieldSign = () =>
<svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
    <polygon
    points="50,88 92,16 8,16"
    fill="white"
    stroke="#DC2626"
    strokeWidth="9"
    strokeLinejoin="round" />
  </svg>;

type CategoryId = 'warning' | 'priority' | 'prohibition' | 'mandatory';

const categories: {id: CategoryId; signs: React.ReactNode[];}[] = [
  {
    id: 'warning',
    signs: [<WarningSign />, <BendSign />, <WarningSign symbol="!" />]
  },
  {
    id: 'priority',
    signs: [<StopSign />, <YieldSign />]
  },
  {
    id: 'prohibition',
    signs: [<NoEntry />, <SpeedSign limit="60" />]
  },
  {
    id: 'mandatory',
    signs: [<MandatoryArrow />, <Roundabout />]
  }
];

export function TrafficLaws() {
  const [active, setActive] = useState<CategoryId>('warning');
  const { t } = useLanguage();
  const current = categories.find((category) => category.id === active)!;
  const currentText = t.traffic.categories[current.id];

  return (
    <section
      id="traffic-laws"
      className="professional-section bg-muted py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-3">
            {t.traffic.title}
          </h2>
          <p className="text-muted-foreground max-w-xl">
            {t.traffic.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) =>
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300
                ${active === cat.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-background text-muted-foreground hover:-translate-y-0.5 hover:text-foreground border border-border'}`}>
              {t.traffic.categories[cat.id].label} {t.traffic.signs}
            </button>
          )}
        </div>

        <p className="text-sm text-foreground/80 mb-8 max-w-2xl">
          {currentText.intro}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {current.signs.map((sign, i) =>
          <div
            key={i}
            className="professional-card flex items-start gap-5 rounded-2xl border border-border bg-background/90 p-6 shadow-sm backdrop-blur">
              <div className="shrink-0">{sign}</div>
              <div>
                <h3 className="font-heading font-bold text-foreground mb-1">
                  {currentText.signs[i][0]}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentText.signs[i][1]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);
}
