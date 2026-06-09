import React from 'react';
import { PageHeader } from '../components/PageHeader';

export function Library() {
  return (
    <>
      <PageHeader title="Library" subtitle="Read before you do an exam" />
      <section className="bg-background py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-8 text-sm text-foreground/90 leading-relaxed">
          <p>
            Welcome to the Library. Start with the book of road rules broken into sections below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a href="#part-1" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Part 1 — General Rules</h4>
              <p className="text-muted-foreground text-xs">Introduction and general driving rules.</p>
            </a>
            <a href="#part-2" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Part 2 — Road Signs</h4>
              <p className="text-muted-foreground text-xs">Warning, priority, prohibition and mandatory signs.</p>
            </a>
            <a href="#part-3" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Part 3 — Penalties & Offences</h4>
              <p className="text-muted-foreground text-xs">Fines and penalties for common offences.</p>
            </a>
            <a href="#part-4" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Part 4 — Exam Tips</h4>
              <p className="text-muted-foreground text-xs">How to approach the provisional exam.</p>
            </a>
          </div>
        </div>
      </section>
      <section className="bg-foreground/5 py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-10 text-sm text-foreground/90 leading-relaxed">
          <article id="part-1" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Part 1 — General Rules</h3>
            <p>Understand the basics: speed limits, priority rules, seating safety, and when to stop. These regulations are the foundation of Rwanda's provisional exam.</p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Always obey posted speed limits and adjust for weather or visibility.</li>
              <li>Give way to pedestrians and traffic on main roads when required.</li>
              <li>Use signals early and check mirrors before changing lanes.</li>
            </ul>
          </article>
          <article id="part-2" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Part 2 — Road Signs</h3>
            <p>Recognize the four main sign groups: warning, priority, prohibition, and mandatory. This knowledge is essential for choosing the correct answer in exam questions.</p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Warning signs use red triangles to signal hazards ahead.</li>
              <li>Priority signs govern who goes first at intersections.</li>
              <li>Prohibition signs tell you what you must not do on the road.</li>
            </ul>
          </article>
          <article id="part-3" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Part 3 — Penalties & Offences</h3>
            <p>Learn the consequences of common driving mistakes like speeding, drunk driving, and ignoring traffic signs. A strong score depends on knowing both the rules and the penalties.</p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Traffic violations can lead to fines, license suspension, or impoundment.</li>
              <li>Drunk driving limits in Rwanda are strict: the legal alcohol level is 0.02 g/L.</li>
              <li>Failing to stop at a pedestrian crossing puts lives at risk and may fail your exam.</li>
            </ul>
          </article>
          <article id="part-4" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Part 4 — Exam Tips</h3>
            <p>Prepare for the provisional test with smart study habits. Read each question carefully, eliminate wrong answers, and revisit sections you find difficult.</p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Read every answer choice before selecting one.</li>
              <li>Use the Library to review rules before starting an exam.</li>
              <li>Practice regularly to build speed and confidence.</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
