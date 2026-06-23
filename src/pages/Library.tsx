import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';

export function Library() {
  const { t, language } = useLanguage();
  return (
    <>
      <PageHeader
        title={language === 'rw' ? 'Isomero' : 'Library'}
        subtitle={language === 'rw' ? 'Soma mbere y\'ikizamini' : 'Read before you do an exam'}
      />

      {/* Category overview */}
      <section className="bg-background py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-8 text-sm text-foreground/90 leading-relaxed">
          <p>
            {language === 'rw' ? 'Murakaza neza mu Isomero. Koresha ibyiciro bikurikira kwiga ibintu nyabyo uzabona mu kizamini cya provisoire.' : 'Welcome to the Library. Use the categories below to study the exact topics you\'ll see in the provisional exam.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a href="#road-signs" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">{language === 'rw' ? 'Ibimenyetso by\'umuhanda' : 'Road Signs'}</h4>
              <p className="text-muted-foreground text-xs">{language === 'rw' ? 'Ibimenyetso by\'umuhanda: umburiro, uburenganzira, ibibujijwe n\'ibiteganyijwe.' : 'Warning, priority, prohibition and mandatory signs.'}</p>
            </a>

            <a href="#traffic-rules" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">{language === 'rw' ? 'Amategeko y\'umuhanda' : 'Traffic Rules'}</h4>
              <p className="text-muted-foreground text-xs">{language === 'rw' ? 'Umuvuduko, uburenganzira bwo kunyura, guhagarara n\'iby\'ingenzi mu gutwara neza.' : 'Speed limits, right-of-way, stopping rules and safe driving basics.'}</p>
            </a>

            <a href="#how-to-take-exam" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">{language === 'rw' ? 'Uko ukora ikizamini' : 'How to Take the Exam'}</h4>
              <p className="text-muted-foreground text-xs">{language === 'rw' ? 'Uko ushobora gusubiza ibibazo no kwiga neza kugira ngo ubone amanota meza.' : 'How to approach questions and study for better results.'}</p>
            </a>

            <a href="#road-safety" className="rounded-lg p-4 border border-border hover:shadow-md">
              <h4 className="font-bold">{language === 'rw' ? 'Umutekano mu muhanda n\'imyitwarire' : 'Road Safety & Driving Behavior'}</h4>
              <p className="text-muted-foreground text-xs">{language === 'rw' ? 'Umutekano w\'abanyamaguru, inzitizi z\'inzoga n\'imyitwarire myiza.' : 'Pedestrian safety, alcohol limits, and responsible driving behavior.'}</p>
            </a>

            <a href="#other" className="rounded-lg p-4 border border-border hover:shadow-md sm:col-span-2">
              <h4 className="font-bold">{language === 'rw' ? 'Ibindi by\'ingenzi' : 'Other Relevant Learning'}</h4>
              <p className="text-muted-foreground text-xs">{language === 'rw' ? 'Ibyaha bikunze, ibihano n\'ibintu by\'ingenzi ugomba kwibuka.' : 'Common offences, penalties, and key reminders.'}</p>
            </a>
          </div>
        </div>
      </section>

      {/* Category details */}
      <section className="bg-foreground/5 py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-10 text-sm text-foreground/90 leading-relaxed">
          <article id="road-signs" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">{language === 'rw' ? 'Ibimenyetso by\'umuhanda' : 'Road Signs'}</h3>
            <p>
              {language === 'rw' ? 'Menya amatsinda ane y\'ibimenyetso: umburiro, uburenganzira, ibibujijwe n\'ibiteganyijwe. Ubu bumenyi ni ngombwa kugira ngo utore igisubizo cyiza mu kizamini.' : 'Recognize the four main sign groups: warning, priority, prohibition, and mandatory. This knowledge is essential for choosing the correct answer in exam questions.'}
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>{language === 'rw' ? 'Ibyapa by\'umburiro bikoresha mpandeshatu zitukura kugira ngo zikuburire ibyago.' : 'Warning signs use red triangles to signal hazards ahead.'}</li>
              <li>{language === 'rw' ? 'Ibyapa by\'uburenganzira bwerekana utegekwa kunyura uwa mbere.' : 'Priority signs govern who goes first at intersections.'}</li>
              <li>{language === 'rw' ? 'Ibyapa bibujijwe bikubwira ibyo utemerewe gukora mu muhanda.' : 'Prohibition signs tell you what you must not do on the road.'}</li>
              <li>{language === 'rw' ? 'Ibyapa biteganyijwe byerekana ibyo ugomba gukora.' : 'Mandatory signs indicate the required action you must follow.'}</li>
            </ul>
          </article>

          <article id="traffic-rules" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">{language === 'rw' ? 'Amategeko y\'umuhanda' : 'Traffic Rules'}</h3>
            <p>
              {language === 'rw' ? 'Wige ibintu by\'ingenzi bigenzwa mu kizamini cya provisoire: umuvuduko, uburenganzira bwo kunyura, aho uhagarara, n\'imyitwarire myiza.' : 'Learn the fundamentals tested in the provisional exam: speed limits, right-of-way, when to stop, and safe driving habits.'}
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>{language === 'rw' ? 'Jya wubahiriza umuvuduko w\'ibyapa kandi uhindure uko ubona.' : 'Always obey posted speed limits and adjust for weather or visibility.'}</li>
              <li>{language === 'rw' ? 'Ha abanyamaguru n\'abandi bashoferi uburenganzira iyo bisabwa.' : 'Give way to pedestrians and vehicles on main roads when required.'}</li>
              <li>{language === 'rw' ? 'Koresha ibimenyetso hakiri kare urebe indorerwamo mbere yo guhindura umuhanda.' : 'Use signals early and check mirrors before changing lanes.'}</li>
              <li>{language === 'rw' ? 'Egera indimburanyana witonze ukurikize amategeko y\'uburenganzira.' : 'Approach intersections carefully and follow priority rules.'}</li>
            </ul>
          </article>

          <article id="how-to-take-exam" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">{language === 'rw' ? 'Uko ukora ikizamini' : 'How to Take the Exam'}</h3>
            <p>
              {language === 'rw' ? 'Witegure ukoresheje imyitozo nziza: soma buri gisubizo, kurura ibisubizo bitari byo, usubiremo ibintu ugora.' : 'Prepare with smart study habits: read every option, eliminate wrong answers, and revisit topics you find difficult.'}
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>{language === 'rw' ? 'Soma buri gisubizo mbere yo gutora kimwe.' : 'Read every answer choice before selecting one.'}</li>
              <li>{language === 'rw' ? 'Koresha Isomero kugira ngo uvugurure amategeko mbere yo gutangira ikizamini.' : 'Use the Library to refresh rules before starting a quiz.'}</li>
              <li>{language === 'rw' ? 'Jya witozaga kenshi kugira ngo wihute kandi wirebere.' : 'Practice regularly to build speed and confidence.'}</li>
              <li>{language === 'rw' ? 'Subiramo ibisobanuro nyuma ya buri kibazo kugira ngo uteze imbere.' : 'Review explanations after each question to improve faster.'}</li>
            </ul>
          </article>

          <article id="road-safety" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">{language === 'rw' ? 'Umutekano n\'imyitwarire mu muhanda' : 'Road Safety & Driving Behavior'}</h3>
            <p>
              {language === 'rw' ? 'Ibibazo by\'umutekano bigerageza imyitwarire nziza. Wibande ku mutekano w\'abanyamaguru, inzitizi z\'inzoga, n\'uko ukora mu bihe bikomeye.' : 'Safety questions test responsible behavior. Focus on pedestrian safety, alcohol limits, and safe reactions in risky situations.'}
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>{language === 'rw' ? 'Ku nyaruka y\'abanyamaguru, jya ugabanya umuvuduko kandi utange uburenganzira.' : 'At pedestrian crossings, always slow down and give safe priority.'}</li>
              <li>{language === 'rw' ? 'Mu Rwanda, inzitizi y\'inzoga y\'amaraso ni nkannyi (0.02 g/L).' : 'In Rwanda, the legal blood alcohol limit for drivers is strict (0.02 g/L).'}</li>
              <li>{language === 'rw' ? 'Ntukajye wita ku byapa by\'umuhanda—ibyago biri imbere bisaba kugabanya umuvuduko.' : 'Never ignore traffic signs—hazards ahead require reduced speed and alertness.'}</li>
              <li>{language === 'rw' ? 'Twarana witonze: tegereza amakosa y\'abandi bakoresha umuhanda.' : 'Drive defensively: anticipate mistakes from other road users.'}</li>
            </ul>
          </article>

          <article id="other" className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">{language === 'rw' ? 'Ibindi by\'ingenzi' : 'Other Relevant Learning'}</h3>
            <p>
              {language === 'rw' ? 'Komeza amanota yawe usobanukiwe ibyaha bikunze n\'ingaruka zabyo. Kumenya ibihano biragufasha kwibuka amategeko mu gihe cy\'ikizamini.' : 'Strengthen your results by understanding common offences and consequences. Knowing penalties helps you remember the rules under exam pressure.'}
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
              <li>{language === 'rw' ? 'Ibyaha by\'umuhanda bishobora kuganisha kuri fine, guhagarikwa cyangwa gufatirwa imodoka.' : 'Traffic violations can lead to fines, license suspension, or impoundment.'}</li>
              <li>{language === 'rw' ? 'Kutantera ahagomba guhagarara abanyamaguru ni icyaha gikomeye.' : 'Failing to stop at a pedestrian crossing can be a serious offence.'}</li>
              <li>{language === 'rw' ? 'Kwiruka no kwirengagiza ibyapa by\'umuhanda byongera ingaruka.' : 'Speeding and ignoring signs increase risk and may lead to penalties.'}</li>
              <li>{language === 'rw' ? 'Komeza ibintu by\'ingenzi ujya wibuka mu Isomero kandi ubikoreshe mu myitozo.' : 'Keep key reminders from the Library and apply them in practice quizzes.'}</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}

