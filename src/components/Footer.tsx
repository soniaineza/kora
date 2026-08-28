import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n';

export function Footer() {
  const location = useLocation();
  const { t } = useLanguage();
  const isHome = location.pathname === '/';
  const hashLink = (hash: string) => isHome ? `#${hash}` : `/#${hash}`;
  const sampleTaken = typeof window !== 'undefined' && localStorage.getItem('kora-sample-taken') === '1';

  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-baseline mb-4">
              <span className="font-heading font-bold text-xl text-primary">
                KORA
              </span>
              <span className="font-heading font-bold text-lg text-background">
                APP.NET
              </span>
            </Link>
            <p className="text-background/60 text-xs leading-relaxed max-w-xs">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-background mb-4">
              {t.footer.product}
            </h4>
            <ul className="space-y-3 text-xs text-background/60">
              <li>
                {sampleTaken ? (
                  <span className="text-background/40">{t.footer.sampleQuiz} (taken)</span>
                ) : (
                  <a href={hashLink('quiz')} className="hover:text-background transition-colors">
                    {t.footer.sampleQuiz}
                  </a>
                )}
              </li>
              <li>
                <a href={hashLink('traffic-laws')} className="hover:text-background transition-colors">
                  {t.footer.trafficRules}
                </a>
              </li>
              <li>
                <a href={hashLink('pricing')} className="hover:text-background transition-colors">
                  {t.footer.pricingPlans}
                </a>
              </li>
              <li>
                <Link to="/stories" className="hover:text-background transition-colors">
                  {t.footer.successStories}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-background mb-4">
              {t.footer.company}
            </h4>
            <ul className="space-y-3 text-xs text-background/60">
              <li>
                <Link to="/about" className="hover:text-background transition-colors">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-background transition-colors">
                  {t.footer.contactSupport}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-background transition-colors">
                  {t.footer.termsService}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-background transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-background mb-4">
              {t.footer.payments}
            </h4>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 bg-background/5 border border-background/15 rounded-xl pl-1.5 pr-3 py-1.5 text-xs text-background/90">
                <span className="bg-[#FFCB05] text-black font-extrabold text-[9px] tracking-tight rounded-md px-1.5 py-1 leading-none">
                  MTN
                </span>
                <span className="font-semibold">MoMo</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-background/5 border border-background/15 rounded-xl pl-1.5 pr-3 py-1.5 text-xs text-background/90">
                <span className="bg-[#E60012] text-white font-extrabold text-[9px] tracking-tight rounded-md px-1.5 py-1 leading-none">
                  airtel
                </span>
                <span className="font-semibold">Money</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/50">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <div className="flex gap-5 text-xs text-background/50">
            <Link to="/terms" className="hover:text-background transition-colors">
              {t.footer.terms}
            </Link>
            <Link to="/privacy" className="hover:text-background transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to="/contact" className="hover:text-background transition-colors">
              {t.footer.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>);
}
