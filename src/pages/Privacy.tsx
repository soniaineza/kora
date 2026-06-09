import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
export function Privacy() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t.privacy.title}
        subtitle={t.privacy.lastUpdated} />
      
      <section className="bg-background py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-8 text-sm text-foreground/80 leading-relaxed">
          <div>
            <p>{t.privacy.paragraph1}</p>
          </div>

          <div>
            <p>{t.privacy.paragraph2}</p>
          </div>

          <div>
            <p>{t.privacy.paragraph3}</p>
          </div>

        </div>
      </section>
    </>);

}