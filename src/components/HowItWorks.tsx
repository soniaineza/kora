import React from 'react';
import { ShoppingCart, Smartphone, BookOpen } from 'lucide-react';
import { useLanguage } from '../i18n';
const steps = [
{
  num: 1,
  icon: <ShoppingCart size={28} strokeWidth={1.8} />
},
{
  num: 2,
  icon: <Smartphone size={28} strokeWidth={1.8} />
},
{
  num: 3,
  icon: <BookOpen size={28} strokeWidth={1.8} />
}];
export function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section
      id="how"
      className="professional-section bg-background py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-bold tracking-widest text-primary mb-3">
            {t.how.eyebrow}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">
            {t.how.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step) =>
          <div
            key={step.num}
            className="professional-card reveal-in flex items-start gap-5 rounded-2xl border border-border bg-background/85 p-6 shadow-sm backdrop-blur">
              {/* Icon tile with number badge */}
              <div className="relative shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-muted via-background to-secondary/60 text-foreground">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md">
                  {step.num}
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                  {t.how.steps[step.num - 1].title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {t.how.steps[step.num - 1].desc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
