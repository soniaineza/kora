import React from 'react';
import { PageHeader } from '../components/PageHeader';

export function Library() {
  return (
    <>
      <PageHeader title="Library" subtitle="Read before you do an exam" />

      {/* Category overview */}
      <section className="bg-background py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-8 text-sm text-foreground/90 leading-relaxed">
          <p>
            Welcome to the Library. Use the categories below to study the exact topics you’ll see in the provisional exam.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a href="#road-signs" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Road Signs</h4>
              <p className="text-muted-foreground text-xs">Warning, priority, prohibition and mandatory signs.</p>
            </a>

            <a href="#traffic-rules" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Traffic Rules</h4>
              <p className="text-muted-foreground text-xs">Speed limits, right-of-way, stopping rules and safe driving basics.</p>
            </a>

            <a href="#how-to-take-exam" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">How to Take the Exam</h4>
              <p className="text-muted-foreground text-xs">How to approach questions and study for better results.</p>
            </a>

            <a href="#road-safety" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">Road Safety & Driving Behavior</h4>
              <p className="text-muted-foreground text-xs">Pedestrian safety, alcohol limits, and responsible driving behavior.</p>
            </a>

            <a href="#other" className="rounded-lg p-4 border border-border hover:shadow-md sm:col-span-2">
              <h4 className="font-bold">Other Relevant Learning</h4>
              <p className="text-muted-foreground text-xs">Common offences, penalties, and key reminders.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Category details */}
      <section className="bg-foreground/5 py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-10 text-sm text-foreground/90 leading-relaxed">
          <article id="road-signs" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Road Signs</h3>
            <p>
              Recognize the four main sign groups: warning, priority, prohibition, and mandatory. This knowledge is essential for choosing the correct answer in exam questions.
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Warning signs use red triangles to signal hazards ahead.</li>
              <li>Priority signs govern who goes first at intersections.</li>
              <li>Prohibition signs tell you what you must not do on the road.</li>
              <li>Mandatory signs indicate the required action you must follow.</li>
            </ul>
          </article>

          <article id="traffic-rules" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Traffic Rules</h3>
            <p>
              Learn the fundamentals tested in the provisional exam: speed limits, right-of-way, when to stop, and safe driving habits.
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Always obey posted speed limits and adjust for weather or visibility.</li>
              <li>Give way to pedestrians and vehicles on main roads when required.</li>
              <li>Use signals early and check mirrors before changing lanes.</li>
              <li>Approach intersections carefully and follow priority rules.</li>
            </ul>
          </article>

          <article id="how-to-take-exam" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">How to Take the Exam</h3>
            <p>
              Prepare with smart study habits: read every option, eliminate wrong answers, and revisit topics you find difficult.
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Read every answer choice before selecting one.</li>
              <li>Use the Library to refresh rules before starting a quiz.</li>
              <li>Practice regularly to build speed and confidence.</li>
              <li>Review explanations after each question to improve faster.</li>
            </ul>
          </article>

          <article id="road-safety" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Road Safety & Driving Behavior</h3>
            <p>
              Safety questions test responsible behavior. Focus on pedestrian safety, alcohol limits, and safe reactions in risky situations.
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>At pedestrian crossings, always slow down and give safe priority.</li>
              <li>In Rwanda, the legal blood alcohol limit for drivers is strict (0.02 g/L).</li>
              <li>Never ignore traffic signs—hazards ahead require reduced speed and alertness.</li>
              <li>Drive defensively: anticipate mistakes from other road users.</li>
            </ul>
          </article>

          <article id="other" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Other Relevant Learning</h3>
            <p>
              Strengthen your results by understanding common offences and consequences. Knowing penalties helps you remember the rules under exam pressure.
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>Traffic violations can lead to fines, license suspension, or impoundment.</li>
              <li>Failing to stop at a pedestrian crossing can be a serious offence.</li>
              <li>Speeding and ignoring signs increase risk and may lead to penalties.</li>
              <li>Keep key reminders from the Library and apply them in practice quizzes.</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}

