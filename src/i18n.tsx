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
      library: 'Library',
      createAccount: 'Create account',
      logout: 'Logout'
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
      and: 'and',
      phoneLabel: 'Phone',
      verificationCode: 'Verification Code',
      verificationPlaceholder: '123456',
      verificationHelper: 'Enter the 6-digit code sent to your phone.',
      sendCode: 'Send Login Code',
      sendingCode: 'Sending Code...',
      verifyAndLogin: 'Verify & Login',
      verifyAndContinue: 'Verify & Continue',
      verifying: 'Verifying...',
      backToLogin: 'Back to login',
      backToRegistration: 'Back to registration',
      passwordHelper: 'Your password must be exactly 6 digits.',
      creating: 'Creating...',
      loginLink: 'Login',
      fullNameLabel: 'Full name'
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
      passRate: 'PASS RATE',
      provisoireSubtitle: 'Provisoire — cars & motorcycles',
      mock: {
        statusTime: '9:41',
        questionTime: '02:41',
        optionA: 'A. 40 km/h',
        optionB: 'B. 60 km/h',
        optionC: 'C. 80 km/h',
        license: 'Licence',
        licenseProvisoire: 'Provisoire',
        holdingProvisoire: 'Holding her provisoire',
        happyNewDriver: 'Happy new driver',
        altHappyWoman: 'Happy Black woman holding a provisional license card'
      }
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
      percentage: 'Percentage',
      loading: 'Loading...',
      startTimer: 'Start Timer',
      startLearning: 'Start Learning',
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
        },
        {
          prompt: 'What does a solid white line on the edge of the road mean?',
          category: 'Road Markings',
          options: ['You may cross it', 'No parking zone', 'Edge of the roadway — do not cross', 'Cycle lane'],
          explanation: 'A solid white line at the edge marks the boundary of the roadway. You should not drive beyond it.'
        },
        {
          prompt: 'When are you allowed to overtake on the left?',
          category: 'Overtaking',
          options: ['Never', 'When the vehicle ahead is turning right', 'On a one-way street', 'In a residential area'],
          explanation: 'You may only overtake on the left when the vehicle ahead is signalling to turn right.'
        },
        {
          prompt: 'What does a blue circular sign with a white arrow mean?',
          category: 'Mandatory Signs',
          options: ['One-way street', 'Mandatory direction — you must go this way', 'Recommended route', 'No entry'],
          explanation: 'A blue circle with a white arrow is a mandatory sign indicating the direction you must follow.'
        },
        {
          prompt: 'What should you do when emergency vehicle with flashing lights approaches from behind?',
          category: 'Emergency',
          options: ['Speed up', 'Stop immediately', 'Pull over to the side and let it pass', 'Flash your hazard lights'],
          explanation: 'When an emergency vehicle approaches with flashing lights, you must pull over safely and allow it to pass.'
        },
        {
          prompt: 'What is the minimum age to obtain a provisional driving license in Rwanda?',
          category: 'Licensing',
          options: ['16 years', '18 years', '21 years', '15 years'],
          explanation: 'The minimum age to apply for a provisional driving license in Rwanda is 18 years.'
        },
        {
          prompt: 'What does a red circle with a white horizontal bar mean?',
          category: 'Prohibition Signs',
          options: ['No parking', 'No entry — do not proceed', 'Stop', 'Speed limit ends'],
          explanation: 'A red circle with a white horizontal bar means "No entry" — you cannot enter this road from that direction.'
        },
        {
          prompt: 'When driving at night, when should you use your high beam headlights?',
          category: 'Night Driving',
          options: ['Always in the city', 'On unlit roads with no oncoming traffic', 'Never', 'In heavy fog'],
          explanation: 'Use high beams on unlit roads when there is no oncoming traffic. Dip them when another vehicle approaches.'
        },
        {
          prompt: 'What does a flashing yellow traffic light mean?',
          category: 'Traffic Signals',
          options: ['Stop and wait for green', 'Proceed with caution', 'Speed up to clear the intersection', 'Prepare to stop'],
          explanation: 'A flashing yellow light means proceed with caution — check for other vehicles before crossing.'
        },
        {
          prompt: 'What should you do if you miss your intended exit on a highway?',
          category: 'Driving Safety',
          options: ['Reverse back to the exit', 'Make a U-turn', 'Continue to the next exit', 'Stop on the shoulder'],
          explanation: 'If you miss your exit, never reverse or U-turn. Continue to the next exit and turn around safely.'
        },
        {
          prompt: 'What does a yellow diamond-shaped sign indicate?',
          category: 'Warning Signs',
          options: ['End of speed limit', 'Warning of potential hazard ahead', 'Mandatory action', 'No stopping'],
          explanation: 'A yellow diamond-shaped sign warns of a potential hazard ahead on the roadway.'
        },
        {
          prompt: 'How close can you park to a pedestrian crossing?',
          category: 'Parking Rules',
          options: ['5 metres', '10 metres', '15 metres', '20 metres'],
          explanation: 'You must not park within 10 metres of a pedestrian crossing to ensure clear visibility.'
        },
        {
          prompt: 'What does a white rectangular sign with black text indicate?',
          category: 'Information Signs',
          options: ['Regulatory requirement', 'Local traffic rule', 'Direction or distance information', 'Prohibition'],
          explanation: 'White rectangular signs with black text provide information such as directions or distances.'
        },
        {
          prompt: 'What should you do before reversing your vehicle?',
          category: 'Basic Manoeuvres',
          options: ['Sound the horn', 'Check mirrors and blind spots', 'Turn on hazard lights', 'Shift to neutral'],
          explanation: 'Before reversing, always check your mirrors and blind spots for pedestrians or obstacles.'
        },
        {
          prompt: 'What is the maximum speed on a highway in Rwanda?',
          category: 'Speed Limits',
          options: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'],
          explanation: 'The maximum speed on Rwandan highways is 100 km/h unless otherwise posted.'
        },
        {
          prompt: 'When must you stop at a railway crossing?',
          category: 'Railway Crossings',
          options: ['Only if a train is coming', 'When lights are flashing or barrier is down', 'Never — just slow down', 'Only at night'],
          explanation: 'You must come to a complete stop when the warning lights are flashing, the barrier is lowered, or a signal indicates a train is approaching.'
        }
      ]
    },
    exams: {
      packageSummary: 'Your selected package includes {count} exam attempts.',
      examTitle: 'Your Exam Session',
      examSubtitle: 'Complete each 20-question test with a 12/20 pass mark. You purchased {count} attempts.',
      accessDenied: 'Access denied',
      register: 'Register',
      choosePackage: 'Choose package',
      loadingSession: 'Loading session...',
      sessionNotValid: 'Session not valid',
      buyOrChoosePackage: 'Buy / Choose package',
      goBack: 'Go back',
      selectedPackage: 'Selected package',
      package: 'Package',
      price: 'Price',
      attempts: 'Attempts',
      note: 'Note:',
      instruction1: 'This full exam starts a 20-minute countdown automatically after you press Start Exam.',
      instruction2: 'Complete each 20-question exam and aim for at least 12 correct answers to pass.',
      instruction3: 'Need a quick review before you begin? Read the library for traffic signs and road rules.',
      startExam: 'Start Exam',
      readLibrary: 'Read the Library',
      unlimited: 'Unlimited',
      remainingAttempts: 'Remaining attempts:',
      passMark: 'Pass mark: 12 / 20',
      examLength: 'Exam length',
      questions: 'Questions',
      readyWhenYouAre: 'Ready when you are',
      description: 'Complete each 20-question exam and aim for at least 12 correct answers to pass.'
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
    },
    theme: {
      toggleLight: 'Switch to light mode',
      toggleDark: 'Switch to dark mode'
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
      library: 'Ibitabo',
      createAccount: 'Fungura konti',
      logout: 'Sohoka'
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
      and: 'na',
      phoneLabel: 'Nimero ya telefone',
      verificationCode: 'Kode yo kwemeza',
      verificationPlaceholder: '123456',
      verificationHelper: 'Shyiramo kode y\'imibare 6 wakiriye kuri telefone yawe.',
      sendCode: 'Ohereza kode yo kwinjira',
      sendingCode: 'Ohereza kode...',
      verifyAndLogin: 'Kwemeza no kwinjira',
      verifyAndContinue: 'Kwemeza ukomeze',
      verifying: 'Bikorwa...',
      backToLogin: 'Subira mu kwinjira',
      backToRegistration: 'Subira mu kwiyandikisha',
      passwordHelper: 'Ijambo ry\'ibanga rigomba kuba imibare 6 gusa.',
      creating: 'Gufungura konti...',
      loginLink: 'Injira',
      fullNameLabel: 'Amazina yose'
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
      passRate: 'ABATSINDA',
      provisoireSubtitle: 'Provisoire — imodoka & moto',
      mock: {
        statusTime: '9:41',
        questionTime: '02:41',
        optionA: 'A. 40 km/h',
        optionB: 'B. 60 km/h',
        optionC: 'C. 80 km/h',
        license: 'Ifishi',
        licenseProvisoire: 'Provisoire',
        holdingProvisoire: 'Afite provisoire ye',
        happyNewDriver: 'Umunyeshuri wishimye',
        altHappyWoman: 'Umunyafurika w\'umugore wishimye afite kariya ya provisoire'
      }
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
      timeLeftLabel: 'igihe gisigaye',
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
      percentage: 'Ijanisha',
      loading: 'Bikorwa...',
      startTimer: 'Tangira igihe',
      startLearning: 'Tangira kwiga',
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
        },
        {
          prompt: 'Umurongo wera ukomeye uri mu nkengero z\'umuhanda usobanura?',
          category: 'Ibyapa byo ku muhanda',
          options: ['Urashobora kuwambuka', 'Ahantu hatabishyirwamo imodoka', 'Inkengero z\'umuhanda - ntukambuke', 'Umuhanda w\'amagare'],
          explanation: 'Umurongo wera ku nkengero z\'umuhanda werekana aho umuhanda urangirira. Ntugomba gutambuka.'
        },
        {
          prompt: 'Ni ryari wemerewe kurenga ibumoso?',
          category: 'Kurenga',
          options: ['Ntabwo', 'Iyo imodoka iri imbere igarukira iburyo', 'Mu muhanda w\'urugendo rumwe', 'Mu gace gatuwe'],
          explanation: 'Ushobora kurenga ibumoso iyo imodoka iri imbere yerekanaga kugarukira iburyo.'
        },
        {
          prompt: 'Icyapa cy\'ubururu gifite umwambi wera gisobanura iki?',
          category: 'Ibyapa biteganyijwe',
          options: ['Umuhanda w\'urugendo rumwe', 'Urenga aha - ugomba kunyura inzira yerekanywe', 'Inzira iteganijwe', 'Nta kwinjira'],
          explanation: 'Uruziga rw\'ubururu rufite umwambi wera ni ikimenyetso kiguhana inzira ugomba gukurikira.'
        },
        {
          prompt: 'Bigenzi iki iyo imodoka y\'itumanaho iri inyuma yanje irimo kumurika?',
          category: 'Itumanaho',
          options: ['Kwihuta', 'Guhagarara ako kanya', 'Kureka inzira ukayirekera', 'Gukoresha amatara y\'ibura'],
          explanation: 'Iyo imodoka y\'itumanaho igeze inyuma irimo kumurika, ugomba kuyirekera umuhanda.'
        },
        {
          prompt: 'Iminsi y\'amavuko ikeje wewe kubona perimi provisoire mu Rwanda?',
          category: 'Gutanga perimi',
          options: ['imyaka 16', 'imyaka 18', 'imyaka 21', 'imyaka 15'],
          explanation: 'Imyaka y\'amavuko igomba kugira ngo ubone perimi provisoire mu Rwanda ni imyaka 18.'
        },
        {
          prompt: 'Icyapa gitukura gifite umurongo wera utambitse gisobanura iki?',
          category: 'Ibyapa bibujijwe',
          options: ['Ntibishyirwamo imodoka', 'Nta kwinjira - ntukomeze', 'Hagarara', 'Umuvuduko urangiye'],
          explanation: 'Uruziga rutukura rufite umurongo wera usobanura ko nta winjira — ntabwo wemerewe kwinjira muri uwo muhanda.'
        },
        {
          prompt: 'Iyo utwaye nijoro, ni ryari ugomba gukoresha amatara arekura?',
          category: 'Kutwara nijoro',
          options: ['Buri gihe mu mujyi', 'Ku mihanda idafite amatara nta modoka ikurikiye', 'Ntabwo', 'Mu kifu gikomeye'],
          explanation: 'Koresha amatara arekura ku mihanda idafite amatara nta modoka ikurikiye. Umanure iyo modoka igeze.'
        },
        {
          prompt: 'Amatara y\'umuhanga y\'umuhondo abaka abaka asobanura iki?',
          category: 'Amatara y\'umuhanda',
          options: ['Hagarara utegereze icyatsi', 'Komeza witonze', 'Wihute kugirango unyure', 'Tegura guhagarara'],
          explanation: 'Amatara y\'umuhondo abaka abaka asobanura komeza witonze — reba ko nta modoka mbere y\'ukunyura.'
        },
        {
          prompt: 'Bigenzi iki iyo wakozwe n\'umuhanda uri mu nzira nyamukuru?',
          category: 'Umutekano',
          options: ['Subira inyuma kuri exit', 'Kora U-turn', 'Komeza kugera kuri exit ikurikira', 'Hagarara ku rutibi'],
          explanation: 'Iyo wakozwe n\'exit yawe, ntukore reverse cyangwa U-turn. Komeza kugera kuri exit ikurikira.'
        },
        {
          prompt: 'Icyapa cy\'umuhondo gifishije uruhu rw\'ipfundo risa nka diamondi gisobanura iki?',
          category: 'Ibyapa biburira',
          options: ['Umuvuduko urangiye', 'Iburira ry\'ibyago biri imbere', 'Igikorwa gitegetswe', 'Ntihahagararwa'],
          explanation: 'Icyapa cy\'umuhondo gifite ishusho ya diamondi kiburira umushoferi ibyago biri imbere.'
        },
        {
          prompt: 'Ugomba guhagarara intera ingana iki uvuye aho abanyamaguru bambukira?',
          category: 'Guhagarika imodoka',
          options: ['5 metres', '10 metres', '15 metres', '20 metres'],
          explanation: 'Ntugomba guhagarika imodoka hafi ya metero 10 uvuye aho abanyamaguru bambukira kugirango habe uruhu rw\'irebero.'
        },
        {
          prompt: 'Icyapa cy\'umweru gifite inyandiko yirabura gisobanura iki?',
          category: 'Ibyapa by\'amakuru',
          options: ['Itegeko', 'Amategeko y\'agace', 'Akarere cyangwa intera', 'Icabujijwe'],
          explanation: 'Ibyapa by\'umweru bifite inyandiko yirabura bitanga amakuru nk\'akarere cyangwa intera.'
        },
        {
          prompt: 'Bigenzi iki mbere yo gusubira inyuma n\'imodoka?',
          category: 'Gutwara imodoka',
          options: ['Vuza ihoni', 'Reba indorerwamo n\'ahantu utabona', 'Koresha amatara y\'ibura', 'Shyira muri neutral'],
          explanation: 'Mbere yo gusubira inyuma, reba indorerwamo n\'ahantu utabona kugirango urebe abantu cyangwa ibintu.'
        },
        {
          prompt: 'Umuvuduko ntarengwa mu Rwanda ku muhanda mwinshi ni uwuhe?',
          category: 'Umuvuduko',
          options: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'],
          explanation: 'Umuvuduko ntarengwa ku mihanda minini mu Rwanda ni 100 km/h keretse icyapa kikavuze ukundi.'
        },
        {
          prompt: 'Ni ryari ugomba guhagarara ku nzira y\'igari ya moshi?',
          category: 'Inzira y\'igari ya moshi',
          options: ['Iyo hari igari riza gusa', 'Iyo amatara abaka cyangwa urugi ruri hasi', 'Ntabwo - gabanya umuvuduko gusa', 'Nijoro gusa'],
          explanation: 'Ugomba guhagarara buri gihe iyo amatara y\'iburira abaka, urugi ruri hasi, cyangwa ikimenyetso kigaragaza ko igari riza.'
        }
      ]
    },
    exams: {
      packageSummary: 'Paketi wahisemo irimo ibyo kugerageza {count}.',
      examTitle: 'Ikizamini cyawe',
      examSubtitle: 'Kurikirana buri kizamini cyibazwa ibibazo 20, ugomba gutsinda 12/20. Wahisemo {count}.',
      accessDenied: 'Ntibyemewe',
      register: 'Iyandikishe',
      choosePackage: 'Hitamo paketi',
      loadingSession: 'Bikorwa...',
      sessionNotValid: 'Sesiyo ntiyemewe',
      buyOrChoosePackage: 'Gura / Hitamo paketi',
      goBack: 'Subira inyuma',
      selectedPackage: 'Paketi yahisemo',
      package: 'Paketi',
      price: 'Igiciro',
      attempts: 'Ugeragezo',
      note: 'Icyitonderwa:',
      instruction1: 'Iki kizamini gitangira kubara igihe cy\'iminota 20 nyuma yo kugona "Tangira Ikizamini".',
      instruction2: 'Kurikiranya buri kizamini cyibazwa 20, ugomba gutsinda byibura 12 kugirango utsinde.',
      instruction3: 'Ukeneye gusubiramo mbere yo gutangira? Soma ibitabo by\'ibyapa by\'umuhanda n\'amategeko.',
      startExam: 'Tangira Ikizamini',
      readLibrary: 'Soma Ibitabo',
      unlimited: 'Ugeragezo rudahagira',
      remainingAttempts: 'Ugeragezo usigariwe:',
      passMark: 'Pass mark: 12 / 20',
      examLength: 'Uburebure bw\'ikizamini',
      questions: 'Ibibazo',
      readyWhenYouAre: 'Uteguye',
      description: 'Kurikiranya buri kizamini cyibazwa 20, ugomba gutsinda byibura 12 kugirango utsinde.'
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
    },
    theme: {
      toggleLight: 'Hindura ubutare',
      toggleDark: 'Hindura umwijima'
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
      library: 'Bibliothèque',
      createAccount: 'Créer un compte',
      logout: 'Déconnexion'
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
      and: 'et',
      phoneLabel: 'Téléphone',
      verificationCode: 'Code de vérification',
      verificationPlaceholder: '123456',
      verificationHelper: 'Entrez le code à 6 chiffres reçu par SMS.',
      sendCode: 'Envoyer le code',
      sendingCode: 'Envoi...',
      verifyAndLogin: 'Vérifier et connecter',
      verifyAndContinue: 'Vérifier et continuer',
      verifying: 'Vérification...',
      backToLogin: 'Retour',
      backToRegistration: 'Retour',
      passwordHelper: 'Le mot de passe doit comporter exactement 6 chiffres.',
      creating: 'Création...',
      loginLink: 'Connexion',
      fullNameLabel: 'Nom complet'
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
      passRate: 'REUSSITE',
      provisoireSubtitle: 'Provisoire — voitures & motos',
      mock: {
        statusTime: '9:41',
        questionTime: '02:41',
        optionA: 'A. 40 km/h',
        optionB: 'B. 60 km/h',
        optionC: 'C. 80 km/h',
        license: 'Permis',
        licenseProvisoire: 'Provisoire',
        holdingProvisoire: 'Tenant sa provisoire',
        happyNewDriver: 'Nouveau conducteur',
        altHappyWoman: 'Femme noire heureuse tenant sa carte de permis provisoire'
      }
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
      percentage: 'Pourcentage',
      loading: 'Chargement...',
      startTimer: 'Démarrer le chronomètre',
      startLearning: 'Commencer à apprendre',
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
        },
        {
          prompt: 'Que signifie une ligne blanche continue sur le bord de la route?',
          category: 'Marquages routiers',
          options: ['Vous pouvez la franchir', 'Zone de stationnement interdit', 'Limite de la chaussée — ne pas franchir', 'Piste cyclable'],
          explanation: 'Une ligne blanche continue marque la limite de la chaussée. Vous ne devez pas la franchir.'
        },
        {
          prompt: 'Quand êtes-vous autorisé à dépasser par la gauche?',
          category: 'Dépassement',
          options: ['Jamais', 'Quand le véhicule devant tourne à droite', 'Sur une voie à sens unique', 'En zone résidentielle'],
          explanation: 'Vous pouvez dépasser par la gauche quand le véhicule devant vous signale qu\'il tourne à droite.'
        },
        {
          prompt: 'Que signifie un panneau bleu rond avec une flèche blanche?',
          category: 'Panneaux obligatoires',
          options: ['Sens unique', 'Direction obligatoire — vous devez aller par là', 'Itinéraire conseillé', 'Sens interdit'],
          explanation: 'Un panneau bleu rond avec une flèche blanche est une obligation de direction que vous devez suivre.'
        },
        {
          prompt: 'Que faire quand un véhicule d\'urgence avec gyrophare approche par derrière?',
          category: 'Urgence',
          options: ['Accélérer', 'S\'arrêter immédiatement', 'Se ranger et le laisser passer', 'Allumer les feux de détresse'],
          explanation: 'Quand un véhicule d\'urgence approche, rangez-vous et laissez-le passer.'
        },
        {
          prompt: 'Quel est l\'âge minimum pour obtenir un permis provisoire au Rwanda?',
          category: 'Permis',
          options: ['16 ans', '18 ans', '21 ans', '15 ans'],
          explanation: 'L\'âge minimum pour demander un permis provisoire au Rwanda est 18 ans.'
        },
        {
          prompt: 'Que signifie un cercle rouge avec une barre blanche horizontale?',
          category: 'Panneaux d\'interdiction',
          options: ['Stationnement interdit', 'Sens interdit — ne pas entrer', 'Stop', 'Fin de limitation'],
          explanation: 'Un cercle rouge avec une barre blanche signifie "Sens interdit" — vous ne pouvez pas entrer dans cette rue.'
        },
        {
          prompt: 'Quand utiliser les feux de route la nuit?',
          category: 'Conduite de nuit',
          options: ['Toujours en ville', 'Sur route non éclairée sans trafic venant en face', 'Jamais', 'En cas de brouillard'],
          explanation: 'Utilisez les feux de route sur routes non éclairées sans trafic venant en face. Baissez-les quand un véhicule approche.'
        },
        {
          prompt: 'Que signifie un feu jaune clignotant?',
          category: 'Feux de circulation',
          options: ['Arrêtez-vous et attendez le vert', 'Passez avec prudence', 'Accélérez pour traverser', 'Préparez-vous à vous arrêter'],
          explanation: 'Un feu jaune clignotant signifie passez avec prudence — vérifiez qu\'aucun véhicule n\'arrive.'
        },
        {
          prompt: 'Que faire si vous ratez votre sortie sur une autoroute?',
          category: 'Sécurité routière',
          options: ['Reculer jusqu\'à la sortie', 'Faire un demi-tour', 'Continuer jusqu\'à la prochaine sortie', 'S\'arrêter sur le bas-côté'],
          explanation: 'Ne reculez jamais et ne faites pas de demi-tour. Continuez jusqu\'à la prochaine sortie.'
        },
        {
          prompt: 'Que signifie un panneau jaune en forme de losange?',
          category: 'Panneaux de danger',
          options: ['Fin de limitation', 'Danger potentiel à venir', 'Action obligatoire', 'Stationnement interdit'],
          explanation: 'Un panneau jaune en losange signale un danger potentiel sur la route à venir.'
        },
        {
          prompt: 'À quelle distance devez-vous stationner d\'un passage piéton?',
          category: 'Stationnement',
          options: ['5 mètres', '10 mètres', '15 mètres', '20 mètres'],
          explanation: 'Ne stationnez pas à moins de 10 mètres d\'un passage piéton pour garantir une bonne visibilité.'
        },
        {
          prompt: 'Que signifie un panneau blanc rectangulaire avec texte noir?',
          category: 'Panneaux d\'information',
          options: ['Obligation réglementaire', 'Règle locale', 'Direction ou distance', 'Interdiction'],
          explanation: 'Les panneaux blancs rectangulaires avec texte noir fournissent des informations comme les directions ou distances.'
        },
        {
          prompt: 'Que devez-vous faire avant de faire marche arrière?',
          category: 'Manoeuvres',
          options: ['Klaxonner', 'Vérifier les rétroviseurs et angles morts', 'Allumer les feux de détresse', 'Passer au point mort'],
          explanation: 'Avant de reculer, vérifiez toujours les rétroviseurs et les angles morts pour les piétons ou obstacles.'
        },
        {
          prompt: 'Quelle est la vitesse maximale sur autoroute au Rwanda?',
          category: 'Limitations',
          options: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'],
          explanation: 'La vitesse maximale sur les autoroutes rwandaises est de 100 km/h sauf indication contraire.'
        },
        {
          prompt: 'Quand devez-vous vous arrêter à un passage à niveau?',
          category: 'Passage à niveau',
          options: ['Seulement si un train arrive', 'Quand les feux clignotent ou la barrière est baissée', 'Jamais — ralentissez seulement', 'Seulement la nuit'],
          explanation: 'Vous devez vous arrêter complètement quand les feux clignotent, la barrière est baissée ou un signal indique qu\'un train approche.'
        }
      ]
    },
    exams: {
      packageSummary: 'Votre forfait comprend {count} tentatives d\'examen.',
      examTitle: 'Votre session d\'examen',
      examSubtitle: 'Complétez chaque test de 20 questions avec une note de passage de 12/20. Vous avez acheté {count} tentatives.',
      accessDenied: 'Accès refusé',
      register: 'S\'inscrire',
      choosePackage: 'Choisir un forfait',
      loadingSession: 'Chargement...',
      sessionNotValid: 'Session non valide',
      buyOrChoosePackage: 'Acheter / Choisir un forfait',
      goBack: 'Retour',
      selectedPackage: 'Forfait sélectionné',
      package: 'Forfait',
      price: 'Prix',
      attempts: 'Tentatives',
      note: 'Note:',
      instruction1: 'Cet examen démarre un compte à rebours de 20 minutes automatiquement après avoir cliqué sur Commencer.',
      instruction2: 'Chaque test comporte 20 questions, vous devez obtenir au moins 12/20 pour réussir.',
      instruction3: 'Besoin de réviser avant de commencer? Lisez la bibliothèque sur les panneaux et le code de la route.',
      startExam: 'Commencer',
      readLibrary: 'Lire la bibliothèque',
      unlimited: 'Illimité',
      remainingAttempts: 'Tentatives restantes:',
      passMark: 'Note de passage: 12 / 20',
      examLength: 'Durée',
      questions: 'Questions',
      readyWhenYouAre: 'Prêt quand vous l\'êtes',
      description: 'Chaque test comporte 20 questions, vous devez obtenir au moins 12/20 pour réussir.'
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
    },
    theme: {
      toggleLight: 'Mode clair',
      toggleDark: 'Mode sombre'
    }
  }
} as const;

type Translations = typeof translations.en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};



const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === 'rw' || value === 'en' || value === 'fr';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {

  // Hard default to Kinyarwanda on every fresh load.
  // This prevents hosted (Vercel) caching/localStorage from keeping an old language.
  const [language, setLanguageState] = useState<Language>('rw');

  useEffect(() => {
    const stored = localStorage.getItem('kora-language') || localStorage.getItem('language');
    const initial: Language = isLanguage(stored) ? stored : 'rw';
    localStorage.setItem('kora-language', initial);
    localStorage.setItem('language', initial);
    document.documentElement.lang = initial === 'rw' ? 'rw' : initial;
    setLanguageState(initial);
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
