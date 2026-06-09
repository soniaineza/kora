import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';

// SVG Icons
const BrakeIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="#f0f0f0" stroke="#333" strokeWidth="2" />
    <circle cx="32" cy="32" r="20" fill="none" stroke="#dc2626" strokeWidth="3" />
    <path d="M32 12 L32 52 M12 32 L52 32" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="32" r="6" fill="#dc2626" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
    <rect x="16" y="28" width="32" height="18" rx="2" fill="none" stroke="#333" strokeWidth="2" />
    <circle cx="22" cy="46" r="4" fill="none" stroke="#333" strokeWidth="2" />
    <circle cx="42" cy="46" r="4" fill="none" stroke="#333" strokeWidth="2" />
    <rect x="24" y="24" width="16" height="6" fill="none" stroke="#333" strokeWidth="2" />
  </svg>
);

const TrafficLightsIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
    <rect x="24" y="8" width="16" height="48" rx="2" fill="none" stroke="#333" strokeWidth="2" />
    <circle cx="32" cy="18" r="5" fill="#dc2626" />
    <circle cx="32" cy="32" r="5" fill="#fbbf24" />
    <circle cx="32" cy="46" r="5" fill="#22c55e" />
  </svg>
);

const TrainingIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
    <circle cx="32" cy="20" r="8" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M32 28 L20 40 M32 28 L44 40 M32 28 L32 44" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="48" r="3" fill="#333" />
    <circle cx="44" cy="48" r="3" fill="#333" />
  </svg>
);

type Pkg = {
  key: string;
  questions: string;
  price: string;
  days: string;
  highlight: boolean;
  labelEn: string;
  labelRw: string;
};

const packages: Pkg[] = [
  {
    key: 'STARTER',
    questions: '10',
    price: '500',
    days: '3',
    highlight: false,
    labelEn: '',
    labelRw: ''
  },
  {
    key: 'BASIC',
    questions: '15',
    price: '1,000',
    days: '5',
    highlight: false,
    labelEn: '',
    labelRw: ''
  },
  {
    key: 'STANDARD',
    questions: '20',
    price: '1,500',
    days: '7',
    highlight: false,
    labelEn: '',
    labelRw: ''
  },
  {
    key: 'MASTER',
    questions: '20',
    price: '2,000',
    days: '10',
    highlight: false,
    labelEn: '',
    labelRw: ''
  },
  {
    key: 'PREMIUM',
    questions: '25',
    price: '3,000',
    days: '15',
    highlight: true,
    labelEn: 'Most Popular',
    labelRw: 'Ikunzwe cyane'
  },
  {
    key: 'PRO',
    questions: '50',
    price: '5,000',
    days: '30',
    highlight: false,
    labelEn: '',
    labelRw: ''
  },
  {
    key: 'UNLIMITED',
    questions: '∞',
    price: '7,000',
    days: 'Unlimited',
    highlight: false,
    labelEn: '',
    labelRw: ''
  }
];



export function Packages() {
  const { language } = useLanguage();

  const title =
    language === 'rw'
      ? 'Hitamo pack y\'ibizamini.'
      : language === 'fr'
        ? 'Choisissez votre forfait d\'examen'
        : 'Choose Your Exam Package';

  const subtitle =
    language === 'rw'
      ? 'Pack ugura iyo ariyo yose, urahabwa code muri sms uzajya ukoresha igihe cyose ugiye gukora ikizamini cy\'umwitozo.'
      : language === 'fr'
        ? 'Achetez n\'importe quel forfait et recevez un code SMS que vous pouvez utiliser à tout moment pour pratiquer.'
        : 'Purchase any package and receive an SMS code that you can use anytime to take practice exams.';


  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Icons Row */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <div className="flex flex-col items-center gap-2">
              <BrakeIcon />
              <p className="text-xs text-muted-foreground font-semibold">{language === 'rw' ? 'Ibiharuro' : 'Safety'}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CarIcon />
              <p className="text-xs text-muted-foreground font-semibold">{language === 'rw' ? 'Imodoka' : 'Vehicle'}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrafficLightsIcon />
              <p className="text-xs text-muted-foreground font-semibold">{language === 'rw' ? 'Inyambo' : 'Signals'}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrainingIcon />
              <p className="text-xs text-muted-foreground font-semibold">{language === 'rw' ? 'Imyitozo' : 'Training'}</p>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.key}
                className={`relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
                  pkg.highlight
                    ? 'bg-primary border-primary shadow-lg ring-2 ring-primary/20'
                    : 'bg-background border-border hover:border-foreground/30'
                }`}>
                
                {pkg.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-3 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap">
                    {language === 'rw' ? pkg.labelRw : pkg.labelEn}
                  </div>
                )}


                <div className={`text-sm font-semibold mb-4 ${pkg.highlight ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {pkg.questions} {language === 'rw' ? 'ibizamini' : 'exams'}
                </div>

                <div className="mb-2">
                  <span className={`text-3xl font-heading font-extrabold ${pkg.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {pkg.price}
                  </span>
                  <span className={`text-xs ml-1 ${pkg.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    RWF
                  </span>
                </div>

                <div className={`text-xs mb-6 ${pkg.highlight ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                  {pkg.days} {language === 'rw' ? 'iminsi' : 'days'}
                </div>

                <Link
                  to={`/buy?package=${encodeURIComponent(pkg.key)}&network=mtn`}
                  className={`w-full inline-flex items-center justify-center rounded-full py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                    pkg.highlight
                      ? 'bg-white text-primary hover:bg-gray-50'
                      : 'bg-muted text-foreground hover:bg-muted/70'
                  }`}>
                  {language === 'rw' ? 'Gura' : 'Buy'}
                </Link>

              </div>
            ))}
          </div>

          {/* FAQ/Info Section */}
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground">
              {language === 'rw' 
                ? 'Iga kugeza utsinze — 30,000 RWF →'
                : 'Get all packages at once — 30,000 RWF →'}
            </p>
          </div>

          {/* Payment Info Card */}
          <div className="max-w-2xl mx-auto bg-muted rounded-2xl border border-border p-8 text-center">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">
              {language === 'rw' ? 'Imyishyurire: MTN&AIRTEL' : 'Payment: MTN & Airtel'}
            </h3>
            
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'rw' 
                  ? 'Shyira hano hasi nomero wishyuriraho'
                  : 'Enter your payment number below'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
                  <span className="text-sm font-semibold text-yellow-600">MTN</span>
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
                  <span className="text-sm font-semibold text-red-600">Airtel</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {language === 'rw'
                ? 'Uramukora na code uzajya ukureba kuri sms. Icyerekezo cyahabwa igihe cyose mugiye gukora ikizamini.'
                : 'You will receive an SMS code. Use it anytime to start practicing with your exam package.'}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
