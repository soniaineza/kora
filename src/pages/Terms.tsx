import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
export function Terms() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t.terms.title}
        subtitle={t.terms.lastUpdated} />
      
      <section className="bg-background py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-8 text-sm text-foreground/80 leading-relaxed">
          <div>
            <p>{t.terms.paragraph1}</p>
          </div>

          <div>
            <p>{t.terms.paragraph2}</p>
          </div>

          <div>
            <p>{t.terms.paragraph3}</p>
          </div>

        </div>
      </section>
    </>);

}