import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Users, Target, Heart } from 'lucide-react';
import { useLanguage } from '../i18n';
export function About() {
  const { language } = useLanguage();
  return (
    <>
      <PageHeader
        eyebrow={language === 'rw' ? 'ABOUT KORA' : 'ABOUT KORA'}
        title={language === 'rw' ? 'Yubatswe i Kigali, igenewe abashoferi b\'u Rwanda.' : 'Built in Kigali, for Rwandan drivers.'}
        subtitle={language === 'rw' ? 'Kora yashinzwe kugira ngo gukura ikizamini cy\'umuhanda mu Rwanda bibe byihuse, byoroshye, kandi bihendutse kuri buri munyeshuri.' : 'Kora was founded to make passing the Rwanda provisional driving exam faster, fairer, and more affordable for every learner.'} />
      
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
            {
              icon: <Users size={20} />,
              title: language === 'rw' ? 'Abanyeshuri 12,000+' : '12,000+ learners',
              desc: language === 'rw' ? 'Bizerwa n\'abanyeshuri benshi bo mu Rwanda buri kwezi.' : 'Trusted by thousands of Rwandan students every month.'
            },
            {
              icon: <Target size={20} />,
              title: language === 'rw' ? '98% batsinda' : '98% pass rate',
              desc: language === 'rw' ? 'Abanyeshuri bacu batsinda ku nshuro ya mbere.' : 'Our students consistently pass on the first attempt.'
            },
            {
              icon: <Heart size={20} />,
              title: language === 'rw' ? 'Byakozwe hano' : 'Made locally',
              desc: language === 'rw' ? 'Itsinda ry\'Abanyarwanda ryubaka ibikoresho by\'abashoferi b\'u Rwanda.' : '100% Rwandan team building tools for Rwandan drivers.'
            }].
            map((item, i) =>
            <div
              key={i}
              className="bg-background border border-border rounded-2xl p-6">
              
                <div className="w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-5">
              {language === 'rw' ? 'Amateka yacu' : 'Our story'}
            </h2>
            <p className="text-foreground/80 mb-5 leading-relaxed">
              {language === 'rw' ? 'Mu 2024, nyuma yo kureba inshuti nyinshi zidanirwa mu kizamini cya provisoire kubera ibikoresho bishaje, twiyemeje kubaka urubuga rwa none rwo kwitoza rukoreshwa kuri telefone rugendewe ku nteganyanyigisho za Polisi y\'Igihugu y\'u Rwanda.' : 'In 2024, after watching too many friends fail the provisional exam due to outdated study materials, we set out to build a modern, mobile-first practice platform built around the official Rwanda National Police curriculum.'}
            </p>
            <p className="text-foreground/80 mb-5 leading-relaxed">
              {language === 'rw' ? 'Uyu munsi, Kora ifasha abanyeshuri barenga 12,000 buri kwezi kwitegura n\'icyizere. Ibibazo byacu bisubiramo buri kwezi kugira ngo bigere kuri gahunda y\'amategeko, kandi ibiciro byacu muri RWF bisobanura ko buri wese ashobora kwitoza.' : 'Today, Kora helps over 12,000 students every month prepare with confidence. Our questions are reviewed monthly to reflect any updates to the traffic code, and our pricing in RWF means anyone can afford to practice.'}
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mt-10 mb-5">
              {language === 'rw' ? 'Intego yacu' : 'Our mission'}
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              {language === 'rw' ? 'Gutuma gutwara neza kandi n\'icyizere bishoboka kuri buri Munyarwanda — ikibazo kimwe ku giti cyacyo.' : 'To make safe, confident driving accessible to every Rwandan — one practice question at a time.'}
            </p>
          </div>
        </div>
      </section>
    </>);

}