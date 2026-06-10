import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const languages = ['en', 'rw', 'fr'] as const;
export type Language = typeof languages[number];

const translations = {
  en: {
    languageName: 'English',
    nav: {
      how: 'How it Works',
      laws: 'Traffic Laws',
      packages: 'Packages',
      login: 'Login',
      start: 'Start Free Test',
      toggleMenu: 'Toggle menu',
      language: 'Language',
      library: 'Library'
    },
    auth: {
      loginTitle: 'Welcome back',
      loginSubtitle: 'Log in to continue your practice.',
      phoneNumber: 'Phone Number',
      phonePlaceholder: '07XX XXX XXX',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      forgot: 'Forgot?',
      loggingIn: 'Logging in...',
      login: 'Log In',
      newToKora: 'New to Kora?',
      createAccountLink: 'Create an account',
      registerTitle: 'Start practicing today',
      registerSubtitle: 'Free sample quiz. No card required.',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Mugisha Eric',
      creatingAccount: 'Creating account...',
      createAccount: 'Create Account',
      registerSuccess: 'Account created successfully!',
      loginSuccess: 'Successfully signed in.',
      alreadyHaveAccount: 'Already have an account?',
      termsNotice: 'By signing up, you agree to our',
      and: 'and'
    },
    packages: {
      title: 'Choose the package that fits your practice needs',
      subtitle: 'Exam-ready practice bundles with flexible validity and instant SMS code delivery.',
      description: 'Browse our package options and start practicing with the correct exam questions for Rwanda.',
      startPractice: 'Start Practice Session'
    },
    hero: {
      badge: 'UPDATED FOR 2024 TRAFFIC RULES',
      titlePrefix: 'Get your',
      titleHighlight: 'Provisional License',
      titleSuffix: 'on the first try.',
      description:
        'The most comprehensive Rwanda driving theory platform. Practice with real exam questions, track progress, and pass with confidence.',
      codes: 'Get Exam Codes',
      sample: 'Try Sample Quiz',
      joinedBy: 'Joined by',
      students: '12,500+ students',
      thisMonth: 'this month',
      phoneQuestion: 'What is the maximum speed limit in a built-up residential area?',
      questionCount: 'QUESTION 14 / 20',
      passRate: 'PASS RATE'
    },
    how: {
      eyebrow: 'HOW IT WORKS',
      title: 'Get your license in 3 simple steps',
      steps: [
        {
          title: 'Choose a Bundle',
          desc: 'Select the number of practice tests you need. Bundles start as low as 500 RWF.'
        },
        {
          title: 'Pay with MoMo',
          desc: 'Pay instantly via MTN Mobile Money or Airtel Money to receive your activation code via SMS.'
        },
        {
          title: 'Start Practicing',
          desc: 'Enter your code and start real exam simulations with instant corrections and explanations.'
        }
      ]
    },
    traffic: {
      title: 'Know your road signs.',
      subtitle:
        "Browse the four core categories of Rwandan road signs you'll see on the provisional exam.",
      signs: 'Signs',
      categories: {
        warning: {
          label: 'Warning',
          intro: 'Red triangles alert you to upcoming road hazards. Slow down and stay alert.',
          signs: [
            ['General Caution', 'Hazard ahead, prepare to reduce speed.'],
            ['Sharp Bend', 'A sharp turn is approaching. Slow down.'],
            ['Other Danger', 'Unspecified danger ahead - proceed with care.']
          ]
        },
        priority: {
          label: 'Priority',
          intro: 'These signs determine who has the right of way at intersections.',
          signs: [
            ['Stop', 'Come to a complete stop before proceeding.'],
            ['Give Way', 'Yield to traffic on the main road.']
          ]
        },
        prohibition: {
          label: 'Prohibition',
          intro: 'Red circles indicate actions that are not allowed at this point.',
          signs: [
            ['No Entry', 'Entry is forbidden for all vehicles.'],
            ['Speed Limit', 'Do not exceed the indicated speed in km/h.']
          ]
        },
        mandatory: {
          label: 'Mandatory',
          intro: 'Blue circles indicate a required action you must follow.',
          signs: [
            ['Direction Ahead', 'Continue in the indicated direction only.'],
            ['Roundabout', 'Traffic must follow the roundabout direction.']
          ]
        }
      }
    },
    quiz: {
      badge: 'SAMPLE QUIZ - FREE',
      title: 'Try a real exam question.',
      subtitle: '5 questions.',
      question: 'QUESTION',
      score: 'Score',
      submit: 'Submit Answer',
      next: 'Next Question',
      results: 'See Results',
      correct: 'Correct!',
      notQuite: 'Not quite',
      excellent: 'Excellent work!',
      good: 'Good effort!',
      practice: 'Keep practicing!',
      youScored: 'You scored',
      perfect: "Perfect score! You're ready to take the real test.",
      onTrack: "You're on the right track. Keep practicing to lock in those tricky rules.",
      keepGoing: "Don't worry - that's exactly what Kora is for. Practice more to improve.",
      tryAgain: 'Try Again',
      fullAccess: 'Get Full Access',
      questions: [
        {
          prompt: 'What is the maximum speed limit in a built-up residential area?',
          category: 'Speed Limits',
          options: ['40 km/h', '60 km/h', '80 km/h', '100 km/h'],
          explanation:
            'In built-up residential areas in Rwanda, the maximum speed limit is 60 km/h unless otherwise indicated.'
        },
        {
          prompt: 'When approaching a roundabout, who has the right of way?',
          category: 'Right of Way',
          options: [
            'The vehicle entering the roundabout',
            'The vehicle already circulating in the roundabout',
            'The larger vehicle',
            'Whoever arrives first'
          ],
          explanation:
            'Vehicles already inside the roundabout always have priority over those attempting to enter.'
        },
        {
          prompt: 'This sign means:',
          category: 'Warning Signs',
          options: ['Mandatory direction', 'Construction zone', 'General caution - hazard ahead', 'End of restriction'],
          explanation:
            'A red triangle with an exclamation mark warns drivers of an unspecified hazard ahead. Slow down and stay alert.'
        },
        {
          prompt: 'A pedestrian is crossing at a zebra crossing with no traffic lights. You should:',
          category: 'Pedestrian Safety',
          options: [
            'Sound your horn and continue',
            'Slow down and pass behind them',
            'Stop and give way to the pedestrian',
            'Flash your headlights'
          ],
          explanation:
            'At an unlit zebra crossing, drivers must come to a complete stop and let pedestrians cross safely.'
        },
        {
          prompt: 'What is the legal blood alcohol limit for drivers in Rwanda?',
          category: 'Traffic Laws',
          options: ['0.08 g/L', '0.05 g/L', '0.02 g/L', 'Zero tolerance'],
          explanation: 'The legal blood alcohol limit for drivers in Rwanda is 0.02 g/L. Always drive sober.'
        }
      ]
    },
    exams: {
      packageSummary: 'Your selected package includes {count} exam attempts.',
      examTitle: 'Your Exam Session',
      examSubtitle: 'Complete each 20-question test with a 12/20 pass mark. You purchased {count} attempts.'
    },
    pricing: {
      title: 'Ready to pass?',
      subtitle:
        'Purchase exam codes and start your journey. All codes are valid for 30 days from first use.',
      rwf: 'Rwandan Francs',
      usd: 'US Dollars',
      questions: 'questions',
      mostPopular: 'MOST POPULAR',
      buy: 'Buy via MoMo',
      plans: [
        ['STARTER', ['10 Practice Questions', 'Basic Categories']],
        ['BASIC', ['20 Practice Questions', 'All Categories', 'Progress Tracking']],
        ['STANDARD', ['25 Practice Questions', 'Detailed Analytics', 'Traffic Sign Library']],
        ['MASTER', ['30 Practice Questions', 'Pass Guarantee']]
      ]
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: January 2026',
      paragraph1: 'By accessing or using Kora.rw, you agree to be bound by these Terms. If you do not agree, please do not use our platform.',
      paragraph2: 'All exam codes purchased via MTN MoMo or Airtel Money are valid for 30 days from first use. Codes are single-user and non-transferable.',
      paragraph3: 'Unused codes may be refunded within 7 days of purchase. Once a code has been activated, refunds are not available except where required by law.'
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2026',
      paragraph1: 'To deliver Kora, we collect your phone number (for SMS code delivery), your MoMo transaction reference (for payment confirmation), and basic practice data (questions answered, time spent, score).',
      paragraph2: 'We use your phone number only to deliver exam codes and important account notifications. Practice data is used to power your progress dashboard and to improve question quality.',
      paragraph3: 'You may request access to, correction of, or deletion of your data at any time by emailing privacy@kora.rw.'
    },

    footer: {
      description:
        "Rwanda's leading digital driving education platform. Helping thousands of students obtain their driving permits every year.",
      product: 'Product',
      sampleQuiz: 'Sample Quiz',
      trafficRules: 'Traffic Rules',
      pricingPlans: 'Pricing Plans',
      successStories: 'Success Stories',
      company: 'Company',
      about: 'About Us',
      contactSupport: 'Contact Support',
      termsService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      payments: 'PAYMENTS',
      rights: 'Kora Driving Platform. All rights reserved.',
      terms: 'Terms',
      privacy: 'Privacy',
      contact: 'Contact'
    }
  },
  rw: {
    languageName: 'Kinyarwanda',
    nav: {
      how: 'Uko bikora',
      laws: 'Amategeko y\'umuhanda',
      packages: 'Paketi',
      login: 'Injira',
      start: 'Tangira ikizamini cy\'ubuntu',
      toggleMenu: 'Fungura cyangwa funga menu',
      language: 'Ururimi',
      library: 'Ibitabo'
    },
    auth: {
      loginTitle: 'Mwongere muri Kora',
      loginSubtitle: 'Injira kugirango ukomeze imyitozo yawe.',
      phoneNumber: 'Nimero ya telefone',
      phonePlaceholder: '07XX XXX XXX',
      password: 'Ijambo ry\'ibanga',
      passwordPlaceholder: '••••••••',
      forgot: 'Wibagiwe?',
      loggingIn: 'Kwinjira...',
      login: 'Injira',
      newToKora: 'Uri mushya kuri Kora?',
      createAccountLink: 'Fungura konti',
      registerTitle: 'Tangira imyitozo uyu munsi',
      registerSubtitle: 'Ikizamini cy\'urugero cy\'ubuntu. Nta konti isabwa.',
      fullName: 'Amazina yose',
      fullNamePlaceholder: 'Mugisha Eric',
      creatingAccount: 'Gufungura konti...',
      createAccount: 'Fungura konti',
      registerSuccess: 'Konti yafunguwe neza!',
      loginSuccess: 'Winjiye neza.',
      alreadyHaveAccount: 'Ufite konti?',
      termsNotice: 'Iyo wiyandikishije wemera',
      and: 'na'
    },
    packages: {
      title: 'Hitamo paketi ikubereye',
      subtitle: 'Paketi z\'imyitozo zifite igihe cyiza kandi kode ziboneka ako kanya kuri SMS.',
      description: 'Reba amahitamo y\'ipaketi utangire imyitozo n\'ibibazo by\'ikizamini bya Rwanda.',
      startPractice: 'Tangira imyitozo'
    },
    hero: {
      badge: 'BIJYANYE N\'AMATEGEKO YO MU 2024',
      titlePrefix: 'Bona',
      titleHighlight: 'perimi provisoire',
      titleSuffix: 'ku nshuro ya mbere.',
      description:
        'Urubuga rwuzuye rwo kwiga amategeko y\'umuhanda mu Rwanda. Kora ibibazo bimeze nk\'iby\'ikizamini, ukurikirane aho ugeze, kandi utsinde ufite icyizere.',
      codes: 'Gura kode z\'ikizamini',
      sample: 'Gerageza ikizamini',
      joinedBy: 'Bifashishwa na',
      students: 'abanyeshuri 12,500+',
      thisMonth: 'uku kwezi',
      phoneQuestion: 'Umuvuduko ntarengwa mu gace gatuwe ni uwuhe?',
      questionCount: 'IKIBAZO 14 / 20',
      passRate: 'ABATSINDA'
    },
    how: {
      eyebrow: 'UKO BIKORA',
      title: 'Bona perimi mu ntambwe 3 zoroshye',
      steps: [
        {
          title: 'Hitamo paketi',
          desc: 'Hitamo umubare w\'ibizamini ushaka gukora. Paketi zitangirira kuri 500 RWF.'
        },
        {
          title: 'Wishyura na MoMo',
          desc: 'Wishyura ukoresheje MTN Mobile Money cyangwa Airtel Money uhite ubona kode kuri SMS.'
        },
        {
          title: 'Tangira imyitozo',
          desc: 'Shyiramo kode yawe utangire gukora ibizamini by\'imyitozo bifite ibisobanuro ako kanya.'
        }
      ]
    },
    traffic: {
      title: 'Menya ibyapa byo ku muhanda.',
      subtitle: 'Reba ibyiciro bine by\'ibyapa byo mu Rwanda bikunze kugaragara mu kizamini cya provisoire.',
      signs: 'Ibyapa',
      categories: {
        warning: {
          label: 'Iburira',
          intro: 'Ibyapa bya mpandeshatu zitukura bikuburira ibyago biri imbere. Gabanya umuvuduko.',
          signs: [
            ['Iburira rusange', 'Hari icyago imbere, itegure kugabanya umuvuduko.'],
            ['Ikoni rikomeye', 'Hari ikoni rikomeye imbere. Gabanya umuvuduko.'],
            ['Akandi kaga', 'Hari akaga kadasobanuwe imbere - genda witonze.']
          ]
        },
        priority: {
          label: 'Icyambere',
          intro: 'Ibi byapa bigaragaza ufite uburenganzira bwo kubanza mu masangano.',
          signs: [
            ['Hagarara', 'Hagarara burundu mbere yo gukomeza.'],
            ['Tanga inzira', 'Tanga inzira ku modoka ziri mu muhanda munini.']
          ]
        },
        prohibition: {
          label: 'Ibibujijwe',
          intro: 'Ibyapa bizengurutse bitukura bigaragaza ibikorwa bitemewe.',
          signs: [
            ['Nta kwinjira', 'Kwinjira birabujijwe ku binyabiziga byose.'],
            ['Umuvuduko ntarengwa', 'Nturenze umuvuduko wanditseho muri km/h.']
          ]
        },
        mandatory: {
          label: 'Ibigomba gukorwa',
          intro: 'Ibyapa by\'ubururu bizengurutse bigaragaza ibyo ugomba gukurikiza.',
          signs: [
            ['Icyerekezo imbere', 'Komeza mu cyerekezo cyerekanywe gusa.'],
            ['Rond-point', 'Imodoka zigomba gukurikiza icyerekezo cya rond-point.']
          ]
        }
      }
    },
    quiz: {
      badge: 'IKIZAMINI CY\'UBUNTU',
      title: 'Gerageza ikibazo kimeze nk\'icy\'ikizamini.',
      subtitle: 'Ibibazo 5. Nta konti isabwa.',
      question: 'IKIBAZO',
      score: 'Amanota',
      submit: 'Ohereza igisubizo',
      next: 'Ikibazo gikurikira',
      results: 'Reba amanota',
      correct: 'Ni byo!',
      notQuite: 'Si byo neza',
      excellent: 'Wakoze cyane!',
      good: 'Ni byiza!',
      practice: 'Komeza imyitozo!',
      youScored: 'Wabonye',
      perfect: 'Amanota yose! Witeguye gukora ikizamini nyacyo.',
      onTrack: 'Uri mu nzira nziza. Komeza kwitoza kugira ngo usobanukirwe amategeko akomeye.',
      keepGoing: 'Ntugire ikibazo - ni cyo Kora igufasha. Komeza imyitozo.',
      tryAgain: 'Ongera ugerageze',
      fullAccess: 'Fungura byose',
      questions: [
        {
          prompt: 'Umuvuduko ntarengwa mu gace gatuwe ni uwuhe?',
          category: 'Umuvuduko',
          options: ['40 km/h', '60 km/h', '80 km/h', '100 km/h'],
          explanation: 'Mu duce dutuwe mu Rwanda, umuvuduko ntarengwa ni 60 km/h keretse icyapa kivuze ukundi.'
        },
        {
          prompt: 'Iyo wegereye rond-point, ni nde ufite uburenganzira bwo kubanza?',
          category: 'Gutanga inzira',
          options: ['Uwinjira muri rond-point', 'Usanzwe ari muri rond-point', 'Imodoka nini', 'Uwageze mbere'],
          explanation: 'Imodoka zisanzwe ziri muri rond-point ni zo zibanza kurusha izishaka kwinjira.'
        },
        {
          prompt: 'Iki cyapa gisobanura:',
          category: 'Ibyapa biburira',
          options: ['Icyerekezo gitegetswe', 'Ahari imirimo', 'Iburira rusange - hari icyago imbere', 'Iherezo ry\'ikibujijwe'],
          explanation: 'Mpandeshatu itukura ifite akabazo iburira umushoferi akaga kadasobanuwe kari imbere.'
        },
        {
          prompt: 'Umunyamaguru ari kwambukira kuri zebra crossing nta matara ahari. Ugomba:',
          category: 'Umutekano w\'abanyamaguru',
          options: ['Kuvuza ihoni ugakomeza', 'Kugabanya umuvuduko ukamunyura inyuma', 'Guhagarara ukamutanga inzira', 'Kumurika amatara'],
          explanation: 'Kuri zebra crossing itariho amatara, umushoferi agomba guhagarara akareka umunyamaguru akambuka neza.'
        },
        {
          prompt: 'Igipimo cyemewe cy\'inzoga mu maraso ku bashoferi mu Rwanda ni ikihe?',
          category: 'Amategeko y\'umuhanda',
          options: ['0.08 g/L', '0.05 g/L', '0.02 g/L', 'Nta nzoga na mba'],
          explanation: 'Igipimo cyemewe mu Rwanda ni 0.02 g/L. Buri gihe twara udasinze.'
        }
      ]
    },
    exams: {
      packageSummary: 'Paketi wahisemo irimo ibyo kugerageza {count}.',
      examTitle: 'Ikizamini cyawe',
      examSubtitle: 'Kurikirana buri kizamini cyibazwa ibibazo 20, ugomba gutsinda 12/20. Wahisemo {count}.'
    },
    pricing: {
      title: 'Witeguye gutsinda?',
      subtitle: 'Gura kode z\'ikizamini utangire urugendo. Kode zose zimara iminsi 30 uhereye igihe uzikoresheje bwa mbere.',
      rwf: 'Amafaranga y\'u Rwanda',
      usd: 'Amadolari ya Amerika',
      questions: 'ibibazo',
      mostPopular: 'IKUNZWE CYANE',
      buy: 'Gura na MoMo',
      plans: [
        ['STARTER', ['Ibibazo 10 by\'imyitozo', 'Ibyiciro by\'ibanze']],
        ['BASIC', ['Ibibazo 20 by\'imyitozo', 'Ibyiciro byose', 'Gukurikirana aho ugeze']],
        ['STANDARD', ['Ibibazo 25 by\'imyitozo', 'Isesengura rirambuye', 'Ibitabo by\'ibyapa']],
        ['MASTER', ['Ibibazo 30 by\'imyitozo', 'Icyizere cyo gutsinda']]
      ]
    },
    terms: {
      title: 'Amategeko ya Serivisi',
      lastUpdated: 'Yavuguruwe: Mutarama 2026',
      paragraph1: 'Ukoresheje cyangwa wifashishije Kora.rw wemera amategeko. Niba utabyemera, ntukoreshe uru rubuga.',
      paragraph2: 'Kode z\'ibizamini zose zigurwa hakoreshejwe MTN MoMo cyangwa Airtel Money ziba zuzuye iminsi 30 kuva uko zakoreshejwe bwa mbere. Kode ni uwaziguze gusa ntizishobora guhanwa.',
      paragraph3: 'Kode zidakoreshwa zishobora gusubizwa amafaranga mu minsi 7. Iyo kode imaze gukoreshwa, ntisubizwa keretse biteganywa n\'amategeko.'
    },
    privacy: {
      title: 'Politiki y\'Ibanga',
      lastUpdated: 'Yavuguruwe: Mutarama 2026',
      paragraph1: 'Dukoresha nimero yawe ya telefone kugirango twohereze kode za SMS, inyandiko z\'amafaranga ya MoMo, n\'ibipimo by\'imyitozo (ibibazo wisubije, igihe, amanota).',
      paragraph2: 'Nimero yawe ikoreshwa gusa mu kohereza kode n\'amatangazo y\'ingenzi. Amakuru y\'imyitozo akoreshwa mu byo gukurikirana aho ugeze.',
      paragraph3: 'Ushobora gusaba kubona, gukosora cyangwa gusiba amakuru yawe iyo ari yo yose ukoresheje email privacy@kora.rw.'
    },

    footer: {
      description:
        'Kora ni urubuga ruyoboye mu kwigisha amategeko y\'umuhanda mu Rwanda, rufasha abanyeshuri ibihumbi kubona perimi buri mwaka.',
      product: 'Serivisi',
      sampleQuiz: 'Ikizamini cy\'urugero',
      trafficRules: 'Amategeko y\'umuhanda',
      pricingPlans: 'Ibiciro',
      successStories: 'Inkuru z\'abatsinze',
      company: 'Ikigo',
      about: 'Ibitwerekeye',
      contactSupport: 'Ubufasha',
      termsService: 'Amategeko ya serivisi',
      privacyPolicy: 'Politiki y\'ibanga',
      payments: 'KWISHYURA',
      rights: 'Kora Driving Platform. Uburenganzira bwose burabitswe.',
      terms: 'Amategeko',
      privacy: 'Ibanga',
      contact: 'Twandikire'
    }
  },
  fr: {
    languageName: 'Français',
    nav: {
      how: 'Fonctionnement',
      pricing: 'Tarifs',
      laws: 'Code de la route',
      packages: 'Forfaits',
      login: 'Connexion',
      start: 'Test gratuit',
      toggleMenu: 'Ouvrir ou fermer le menu',
      language: 'Langue',
      library: 'Bibliothèque'
    },
    auth: {
      loginTitle: 'Bienvenue',
      loginSubtitle: 'Connectez-vous pour continuer votre pratique.',
      phoneNumber: 'Numéro de téléphone',
      phonePlaceholder: '07XX XXX XXX',
      password: 'Mot de passe',
      passwordPlaceholder: '••••••••',
      forgot: 'Mot de passe oublié?',
      loggingIn: 'Connexion...',
      login: 'Se connecter',
      newToKora: 'Nouveau sur Kora?',
      createAccountLink: 'Créer un compte',
      registerTitle: 'Commencez à pratiquer dès aujourd’hui',
      registerSubtitle: 'Quiz gratuit. Aucun compte requis.',
      fullName: 'Nom complet',
      fullNamePlaceholder: 'Mugisha Eric',
      creatingAccount: 'Création du compte...',
      createAccount: 'Créer un compte',
      registerSuccess: 'Compte créé avec succès!',
      loginSuccess: 'Connecté avec succès.',
      alreadyHaveAccount: 'Déjà un compte?',
      termsNotice: 'En vous inscrivant, vous acceptez',
      and: 'et'
    },
    packages: {
      title: 'Choisissez le forfait qui vous convient',
      subtitle: 'Forfaits d’entraînement avec validité flexible et livraison instantanée par SMS.',
      description: 'Parcourez nos options de forfaits et commencez à vous entraîner avec les bonnes questions d’examen pour le Rwanda.',
      startPractice: 'Commencer la pratique'
    },
    hero: {
      badge: 'MIS A JOUR POUR LE CODE 2024',
      titlePrefix: 'Obtenez votre',
      titleHighlight: 'permis provisoire',
      titleSuffix: 'du premier coup.',
      description:
        'La plateforme la plus complète pour préparer le code de la route au Rwanda. Entraînez-vous avec de vraies questions, suivez vos progrès et réussissez avec confiance.',
      codes: 'Obtenir des codes',
      sample: 'Essayer le quiz',
      joinedBy: 'Rejointe par',
      students: '12 500+ élèves',
      thisMonth: 'ce mois-ci',
      phoneQuestion: 'Quelle est la vitesse maximale dans une zone résidentielle?',
      questionCount: 'QUESTION 14 / 20',
      passRate: 'REUSSITE'
    },
    how: {
      eyebrow: 'FONCTIONNEMENT',
      title: 'Obtenez votre permis en 3 étapes simples',
      steps: [
        {
          title: 'Choisissez un forfait',
          desc: 'Sélectionnez le nombre de tests dont vous avez besoin. Les forfaits commencent à 500 RWF.'
        },
        {
          title: 'Payez avec MoMo',
          desc: 'Payez instantanément par MTN Mobile Money ou Airtel Money et recevez votre code par SMS.'
        },
        {
          title: 'Commencez à pratiquer',
          desc: 'Entrez votre code et lancez des simulations avec corrections et explications immédiates.'
        }
      ]
    },
    traffic: {
      title: 'Maîtrisez les panneaux routiers.',
      subtitle: 'Parcourez les quatre grandes catégories de panneaux rwandais à connaître pour l\'examen provisoire.',
      signs: 'Panneaux',
      categories: {
        warning: {
          label: 'Danger',
          intro: 'Les triangles rouges signalent un danger à venir. Ralentissez et restez attentif.',
          signs: [
            ['Danger général', 'Danger devant vous, préparez-vous à ralentir.'],
            ['Virage serré', 'Un virage serré approche. Ralentissez.'],
            ['Autre danger', 'Danger non précisé devant vous - avancez avec prudence.']
          ]
        },
        priority: {
          label: 'Priorité',
          intro: 'Ces panneaux indiquent qui a la priorité aux intersections.',
          signs: [
            ['Stop', 'Arrêtez-vous complètement avant de continuer.'],
            ['Cédez le passage', 'Cédez le passage aux véhicules sur la route principale.']
          ]
        },
        prohibition: {
          label: 'Interdiction',
          intro: 'Les cercles rouges indiquent les actions interdites à cet endroit.',
          signs: [
            ['Sens interdit', 'L\'entrée est interdite à tous les véhicules.'],
            ['Limitation de vitesse', 'Ne dépassez pas la vitesse indiquée en km/h.']
          ]
        },
        mandatory: {
          label: 'Obligation',
          intro: 'Les cercles bleus indiquent une action obligatoire.',
          signs: [
            ['Direction obligatoire', 'Continuez uniquement dans la direction indiquée.'],
            ['Rond-point', 'La circulation doit suivre le sens du rond-point.']
          ]
        }
      }
    },
    quiz: {
      badge: 'QUIZ GRATUIT',
      title: 'Essayez une vraie question d\'examen.',
      subtitle: '5 questions. Aucun compte requis.',
      question: 'QUESTION',
      score: 'Score',
      submit: 'Valider',
      next: 'Question suivante',
      results: 'Voir les résultats',
      correct: 'Correct!',
      notQuite: 'Pas tout à fait',
      excellent: 'Excellent travail!',
      good: 'Bon effort!',
      practice: 'Continuez à pratiquer!',
      youScored: 'Vous avez obtenu',
      perfect: 'Score parfait! Vous êtes prêt pour le vrai test.',
      onTrack: 'Vous êtes sur la bonne voie. Continuez à pratiquer les règles les plus difficiles.',
      keepGoing: 'Pas d\'inquiétude - c\'est exactement le rôle de Kora. Continuez à vous entraîner.',
      tryAgain: 'Réessayer',
      fullAccess: 'Accès complet',
      questions: [
        {
          prompt: 'Quelle est la vitesse maximale dans une zone résidentielle?',
          category: 'Limitations de vitesse',
          options: ['40 km/h', '60 km/h', '80 km/h', '100 km/h'],
          explanation: 'Dans les zones résidentielles au Rwanda, la vitesse maximale est de 60 km/h sauf indication contraire.'
        },
        {
          prompt: 'A l\'approche d\'un rond-point, qui a la priorité?',
          category: 'Priorité',
          options: ['Le véhicule qui entre', 'Le véhicule déjà dans le rond-point', 'Le véhicule le plus grand', 'Celui qui arrive en premier'],
          explanation: 'Les véhicules déjà engagés dans le rond-point ont toujours la priorité.'
        },
        {
          prompt: 'Ce panneau signifie:',
          category: 'Panneaux de danger',
          options: ['Direction obligatoire', 'Zone de travaux', 'Danger général - prudence', 'Fin de restriction'],
          explanation: 'Un triangle rouge avec un point d\'exclamation signale un danger non précisé. Ralentissez et restez attentif.'
        },
        {
          prompt: 'Un piéton traverse sur un passage piéton sans feu. Vous devez:',
          category: 'Sécurité des piétons',
          options: ['Klaxonner et continuer', 'Ralentir et passer derrière lui', 'Vous arrêter et le laisser passer', 'Faire des appels de phares'],
          explanation: 'Sur un passage piéton sans feu, le conducteur doit s\'arrêter complètement et laisser le piéton traverser.'
        },
        {
          prompt: 'Quelle est la limite légale d\'alcoolémie pour les conducteurs au Rwanda?',
          category: 'Code de la route',
          options: ['0.08 g/L', '0.05 g/L', '0.02 g/L', 'Tolérance zéro'],
          explanation: 'La limite légale au Rwanda est de 0.02 g/L. Conduisez toujours sobre.'
        }
      ]
    },
    exams: {
      packageSummary: 'Votre forfait comprend {count} tentatives d\'examen.',
      examTitle: 'Votre session d\'examen',
      examSubtitle: 'Complétez chaque test de 20 questions avec une note de passage de 12/20. Vous avez acheté {count} tentatives.'
    },
    pricing: {
      title: 'Prêt à réussir?',
      subtitle: 'Achetez vos codes d\'examen et commencez votre parcours. Tous les codes sont valables 30 jours après la première utilisation.',
      rwf: 'Francs rwandais',
      usd: 'Dollars américains',
      questions: 'questions',
      mostPopular: 'LE PLUS POPULAIRE',
      buy: 'Acheter via MoMo',
      plans: [
        ['STARTER', ['10 questions d\'entraînement', 'Catégories de base']],
        ['BASIC', ['20 questions d\'entraînement', 'Toutes les catégories', 'Suivi des progrès']],
        ['STANDARD', ['25 questions d\'entraînement', 'Analyses détaillées', 'Bibliothèque de panneaux']],
        ['MASTER', ['30 questions d\'entraînement', 'Garantie de réussite']]
      ]
    },
    terms: {
      title: 'Conditions d\'utilisation',
      lastUpdated: 'Dernière mise à jour : Janvier 2026',
      paragraph1: 'En accédant à Kora.rw, vous acceptez les présentes conditions. Si vous n\'êtes pas d\'accord, veuillez ne pas utiliser la plateforme.',
      paragraph2: 'Tous les codes d\'examen achetés via MTN MoMo ou Airtel Money sont valables 30 jours à compter de la première utilisation. Les codes sont non transférables.',
      paragraph3: 'Les codes non utilisés peuvent être remboursés dans les 7 jours suivant l\'achat. Une fois activé, un code n\'est plus remboursable sauf disposition légale.'
    },
    privacy: {
      title: 'Politique de confidentialité',
      lastUpdated: 'Dernière mise à jour : Janvier 2026',
      paragraph1: 'Pour fournir Kora, nous collectons votre numéro de téléphone (pour la livraison des codes par SMS), la référence de transaction MoMo (pour confirmer le paiement) et des données de pratique de base (questions répondues, temps passé, score).',
      paragraph2: 'Nous utilisons votre numéro uniquement pour livrer les codes et les notifications importantes. Les données de pratique servent au tableau de bord de progression.',
      paragraph3: 'Vous pouvez demander l\'accès, la correction ou la suppression de vos données en écrivant à privacy@kora.rw.'
    },
    footer: {
      description:
        'La principale plateforme numérique rwandaise pour apprendre le code de la route et aider des milliers d\'élèves à obtenir leur permis chaque année.',
      product: 'Produit',
      sampleQuiz: 'Quiz exemple',
      trafficRules: 'Règles de circulation',
      pricingPlans: 'Forfaits',
      successStories: 'Réussites',
      company: 'Entreprise',
      about: 'A propos',
      contactSupport: 'Support',
      termsService: 'Conditions d\'utilisation',
      privacyPolicy: 'Politique de confidentialité',
      payments: 'PAIEMENTS',
      rights: 'Kora Driving Platform. Tous droits réservés.',
      terms: 'Conditions',
      privacy: 'Confidentialité',
      contact: 'Contact'
    }
  }
} as const;

type Translations = typeof translations.en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return languages.includes(value as Language);
}

export function LanguageProvider({ children }: {children: React.ReactNode;}) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('kora-language');
    if (isLanguage(stored)) setLanguageState(stored);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem('kora-language', next);
    document.documentElement.lang = next === 'rw' ? 'rw' : next;
  };

  useEffect(() => {
    document.documentElement.lang = language === 'rw' ? 'rw' : language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language]
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
