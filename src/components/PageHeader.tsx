import React from 'react';
export function PageHeader({
  eyebrow,
  title,
  subtitle




}: {eyebrow?: string;title: string;subtitle?: string;}) {
  return (
    <section className="bg-muted py-16 md:py-20 border-b border-border">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {eyebrow &&
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 mb-5 text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            {eyebrow}
          </div>
        }
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground mb-4 leading-tight">
          {title}
        </h1>
        {subtitle &&
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        }
      </div>
    </section>);

}