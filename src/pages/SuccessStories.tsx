import React, { memo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Quote, Star } from 'lucide-react';
import { useLanguage } from '../i18n';
const stories = [
{
  name: 'Aline Mutoni',
  location: 'Kigali',
  score: '19/20',
  date: 'October 2025',
  initials: 'AM',
  quote:
  'I failed my first attempt because I just memorized old questions. Kora taught me the actual rules behind every sign. Second try I got 19/20.'
},
{
  name: 'Jean-Paul N.',
  location: 'Musanze',
  score: '20/20',
  date: 'January 2026',
  initials: 'JN',
  quote:
  'The MoMo payment was instant. I got my code by SMS and started practicing in 30 seconds. Perfect score on my exam!'
},
{
  name: 'Mukamana D.',
  location: 'Huye',
  score: '18/20',
  date: 'November 2025',
  initials: 'MD',
  quote:
  'The Kinyarwanda explanations finally made the priority rules at roundabouts click for me. Worth every franc.'
},
{
  name: 'Eric Habimana',
  location: 'Rubavu',
  score: '20/20',
  date: 'December 2025',
  initials: 'EH',
  quote:
  'I studied during my bus commute every morning. The questions are exactly what came up on the official RNP exam.'
},
{
  name: 'Diane Uwase',
  location: 'Kigali',
  score: '17/20',
  date: 'September 2025',
  initials: 'DU',
  quote:
  'Failed 3 times before Kora. The progress tracking showed me I was weak on warning signs — fixed that and passed.'
},
{
  name: 'Patrick K.',
  location: 'Nyagatare',
  score: '19/20',
  date: 'February 2026',
  initials: 'PK',
  quote:
  'Affordable, fast, and works on my old phone with weak network. The best driving prep platform in Rwanda.'
}];

export function SuccessStories() {
  const { language } = useLanguage();
  return (
    <>
      <PageHeader
        eyebrow={language === 'rw' ? 'IBY\'ABANYESHURI' : 'STUDENT STORIES'}
        title={language === 'rw' ? 'Abanyeshuri nyabo batsinze.' : 'Real passes from real Rwandan drivers.'}
        subtitle={language === 'rw' ? 'Abanyeshuri barenga 12,000 bitegura na Kora buri kwezi. Dore ibyo bamwe babo bavuga.' : 'Over 12,000 students prepare with Kora every month. Here\'s what some of them have to say.'} />
      
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((s, i) =>
            <div
              key={i}
              className="bg-background border border-border rounded-2xl p-6 flex flex-col">
              
                <Quote size={20} className="text-primary mb-4" />
                <p className="text-sm text-foreground/80 leading-relaxed mb-6 flex-grow">
                  "{s.quote}"
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="w-10 h-10 bg-secondary border border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary rounded-full">
                    {s.initials}
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.location} · {s.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent text-xs font-bold bg-accent/10 rounded-full px-2.5 py-1">
                    <Star size={10} className="fill-accent" /> {s.score}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>);

}