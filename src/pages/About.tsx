import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Users, Target, Heart } from 'lucide-react';
export function About() {
  return (
    <>
      <PageHeader
        eyebrow="ABOUT KORA"
        title="Built in Kigali, for Rwandan drivers."
        subtitle="Kora was founded to make passing the Rwanda provisional driving exam faster, fairer, and more affordable for every learner." />
      
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
            {
              icon: <Users size={20} />,
              title: '12,000+ learners',
              desc: 'Trusted by thousands of Rwandan students every month.'
            },
            {
              icon: <Target size={20} />,
              title: '98% pass rate',
              desc: 'Our students consistently pass on the first attempt.'
            },
            {
              icon: <Heart size={20} />,
              title: 'Made locally',
              desc: '100% Rwandan team building tools for Rwandan drivers.'
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
              Our story
            </h2>
            <p className="text-foreground/80 mb-5 leading-relaxed">
              In 2024, after watching too many friends fail the provisional exam
              due to outdated study materials, we set out to build a modern,
              mobile-first practice platform built around the official Rwanda
              National Police curriculum.
            </p>
            <p className="text-foreground/80 mb-5 leading-relaxed">
              Today, Kora helps over 12,000 students every month prepare with
              confidence. Our questions are reviewed monthly to reflect any
              updates to the traffic code, and our pricing in RWF means anyone
              can afford to practice.
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mt-10 mb-5">
              Our mission
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              To make safe, confident driving accessible to every Rwandan — one
              practice question at a time.
            </p>
          </div>
        </div>
      </section>
    </>);

}