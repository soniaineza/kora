import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';
import { Document, Page } from 'react-pdf';

const BOOK_PARTS = [
  { id: 'p01', title: { en: 'Introduction & Overview', rw: 'Incamake n\'Iby\'ibanze', fr: 'Introduction et aperçu' }, startPage: 1, endPage: 7 },
  { id: 'p02', title: { en: 'Road Signs Basics', rw: 'Ibyapa by\'Umuhanda', fr: 'Panneaux de signalisation' }, startPage: 8, endPage: 14 },
  { id: 'p03', title: { en: 'Warning Signs', rw: 'Ibimenyetso by\'Umburiro', fr: 'Panneaux de danger' }, startPage: 15, endPage: 21 },
  { id: 'p04', title: { en: 'Priority Signs', rw: 'Ibimenyetso by\'Uburenganzira', fr: 'Panneaux de priorité' }, startPage: 22, endPage: 28 },
  { id: 'p05', title: { en: 'Prohibition Signs', rw: 'Ibimenyetso Bibujijwe', fr: 'Panneaux d\'interdiction' }, startPage: 29, endPage: 35 },
  { id: 'p06', title: { en: 'Mandatory Signs', rw: 'Ibimenyetso Biteganyijwe', fr: 'Panneaux obligatoires' }, startPage: 36, endPage: 42 },
  { id: 'p07', title: { en: 'Speed Limits & Rules', rw: 'Umuvuduko n\'Amategeko', fr: 'Limitations de vitesse' }, startPage: 43, endPage: 49 },
  { id: 'p08', title: { en: 'Overtaking & Lane Rules', rw: 'Kurenga n\'Imihanda', fr: 'Dépassement et voies' }, startPage: 50, endPage: 56 },
  { id: 'p09', title: { en: 'Right of Way', rw: 'Uburenganzira bwo Kunyura', fr: 'Priorité de passage' }, startPage: 57, endPage: 63 },
  { id: 'p10', title: { en: 'Intersections & Roundabouts', rw: 'Indimburanyana na Rond-point', fr: 'Intersections et ronds-points' }, startPage: 64, endPage: 70 },
  { id: 'p11', title: { en: 'Safe Driving Practices', rw: 'Gutwara neza', fr: 'Conduite sécuritaire' }, startPage: 71, endPage: 77 },
  { id: 'p12', title: { en: 'Night & Weather Driving', rw: 'Gutwara nijoro n\'ibihe', fr: 'Conduite de nuit et par temps' }, startPage: 78, endPage: 84 },
  { id: 'p13', title: { en: 'Pedestrian Safety', rw: 'Umutekano w\'Abanyamaguru', fr: 'Sécurité des piétons' }, startPage: 85, endPage: 90 },
  { id: 'p14', title: { en: 'Penalties & Offences', rw: 'Ibihano n\'Ibyaha', fr: 'Sanctions et infractions' }, startPage: 91, endPage: 98 },
  { id: 'p15', title: { en: 'Licensing & Procedures', rw: 'Gushaka Perimi n\'Inzira', fr: 'Permis et procédures' }, startPage: 99, endPage: 106 },
];

export function Library() {
  const { language } = useLanguage();
  const apiBase = getApiBase();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activePart, setActivePart] = useState(BOOK_PARTS[0].id);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const t = (obj: { en: string; rw: string; fr: string }) =>
    obj[language as keyof typeof obj] || obj.en;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('kora-jwt');
        if (!token) {
          if (mounted) setHasAccess(false);
          return;
        }
        const res = await fetch(`${apiBase}/api/internal/book/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (mounted) setHasAccess(!!data.hasAccess);
      } catch {
        if (mounted) setHasAccess(false);
      } finally {
        if (mounted) setCheckingAccess(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiBase]);

  const token = localStorage.getItem('kora-jwt');
  const pdfUrl = hasAccess && token ? `${apiBase}/api/internal/book/pdf` : null;
  const pdfOptions = useMemo(
    () => (token ? { httpHeaders: { Authorization: `Bearer ${token}` } } : undefined),
    [token]
  );

  const activePartData = useMemo(
    () => BOOK_PARTS.find((p) => p.id === activePart) || BOOK_PARTS[0],
    [activePart]
  );

  const handlePartChange = useCallback((partId: string) => {
    const p = BOOK_PARTS.find((x) => x.id === partId);
    if (p) {
      setActivePart(partId);
      setCurrentPage(p.startPage);
      viewerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const headerTitle =
    language === 'rw' ? 'Isomero' : language === 'fr' ? 'Bibliothèque' : 'Library';
  const headerSubtitle =
    language === 'rw'
      ? 'Soma igitabo cya IGAZETI-1'
      : language === 'fr'
        ? 'Lisez le livre IGAZETI-1'
        : 'Read the IGAZETI-1 book';

  if (checkingAccess) {
    return (
      <>
        <PageHeader title={headerTitle} subtitle={headerSubtitle} />
        <section className="bg-background py-20 text-center">
          <p className="text-muted-foreground">
            {language === 'rw' ? 'Bikorwa...' : language === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        </section>
      </>
    );
  }

  if (!hasAccess) {
    const isLoggedIn = !!localStorage.getItem('kora-jwt');
    return (
      <>
        <PageHeader title={headerTitle} subtitle={headerSubtitle} />
        <section className="bg-background py-16">
          <div className="max-w-2xl mx-auto px-6">
            <div className="rounded-3xl border border-border bg-background shadow-sm p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>

              <h2 className="text-2xl font-heading font-extrabold text-foreground mb-3">
                {language === 'rw' ? 'IGAZETI-1' : 'IGAZETI-1'}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'rw'
                    ? 'Igito gikubiyemo amategeko y\'umuhanda, ibimenyetso, n\'ibindi by\'ingenzi byo gutwara neza mu Rwanda. Gifite amapaji 106 n\'ibice 15 by\'oroshye.'
                  : language === 'fr'
                    ? 'Un livre complet sur le code de la route, les panneaux et les bonnes pratiques de conduite au Rwanda. 106 pages, 15 sections faciles.'
                    : 'A comprehensive book covering Rwandan traffic laws, road signs, and safe driving practices. 106 pages, 15 easy-to-follow parts.'}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  106 {language === 'rw' ? 'paji' : language === 'fr' ? 'pages' : 'pages'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                   {BOOK_PARTS.length} {language === 'rw' ? 'ibice' : language === 'fr' ? 'sections' : 'parts'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  1,000 RWF
                </span>
              </div>

              {isLoggedIn ? (
                <Link
                  to="/buy?package=BOOK&network=mtn"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {language === 'rw'
                    ? 'Gura igitabo — 1,000 RWF'
                    : language === 'fr'
                      ? 'Acheter le livre — 1,000 RWF'
                      : 'Buy the book — 1,000 RWF'}
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {language === 'rw'
                    ? 'Injira cyangwa Iyandikishe'
                    : language === 'fr'
                      ? 'Connectez-vous ou créez un compte'
                      : 'Login or create an account'}
                </Link>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                {language === 'rw'
                  ? 'Iyo ugize igitabo, ukibona mu Isomero imyaka itarenze umwaka.'
                  : language === 'fr'
                    ? 'Une fois acheté, le livre est accessible dans la bibliothèque pendant un an.'
                    : 'Once purchased, the book stays in your library for one year.'}
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (pdfError) {
    return (
      <>
        <PageHeader title={headerTitle} subtitle={headerSubtitle} />
        <section className="bg-background py-20 text-center">
          <div className="max-w-md mx-auto px-6">
            <p className="text-red-600 text-sm mb-4">{pdfError}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {language === 'rw' ? 'Ongera ugerageze' : language === 'fr' ? 'Réessayer' : 'Retry'}
            </button>
          </div>
        </section>
      </>
    );
  }

  const partIndex = BOOK_PARTS.findIndex((p) => p.id === activePart);
  const progressPct = numPages ? Math.round((currentPage / numPages) * 100) : 0;

  function handleNextPage() {
    const next = currentPage + 1;
    if (numPages && next > numPages) return;
    const nextPart = BOOK_PARTS.find((p) => p.startPage <= next && p.endPage >= next);
    if (nextPart && nextPart.id !== activePart) {
      setActivePart(nextPart.id);
    }
    setCurrentPage(next);
  }

  function handlePrevPage() {
    const prev = currentPage - 1;
    if (prev < 1) return;
    const prevPart = BOOK_PARTS.find((p) => p.startPage <= prev && p.endPage >= prev);
    if (prevPart && prevPart.id !== activePart) {
      setActivePart(prevPart.id);
    }
    setCurrentPage(prev);
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = !!(numPages && currentPage >= numPages);

  return (
    <>
      <PageHeader title={headerTitle} subtitle={headerSubtitle} />
      <section className="bg-background py-8" ref={viewerRef}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Part tabs with numbers */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {BOOK_PARTS.map((part, i) => (
              <button
                key={part.id}
                onClick={() => handlePartChange(part.id)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                  activePart === part.id
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  activePart === part.id ? 'bg-primary-foreground text-primary' : 'bg-foreground/10 text-muted-foreground'
                }`}>
                  {i + 1}
                </span>
                {t(part.title)}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          {numPages ? (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {language === 'rw'
                    ? `Parti ${partIndex + 1} kuva ${BOOK_PARTS.length}: ${t(activePartData.title)}`
                    : language === 'fr'
                      ? `Partie ${partIndex + 1} sur ${BOOK_PARTS.length}: ${t(activePartData.title)}`
                      : `Part ${partIndex + 1} of ${BOOK_PARTS.length}: ${t(activePartData.title)}`}
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Book pages inline as a reading flow */}
          <div
            className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            {pdfUrl ? (
              <div className="flex justify-center p-4 sm:p-6 md:p-8">
                <Document
                  file={pdfUrl}
                  options={pdfOptions}
                  onLoadSuccess={({ numPages: n }) => {
                    setNumPages(n);
                    setPdfError(null);
                    if (currentPage > n) setCurrentPage(1);
                  }}
                  onLoadError={(err) => {
                    setPdfError(err?.message || 'Failed to load the book');
                  }}
                  loading={
                    <div className="flex items-center justify-center py-32">
                      <div className="text-muted-foreground text-sm">
                        {language === 'rw' ? 'Bikorwa...' : language === 'fr' ? 'Chargement...' : 'Loading...'}
                      </div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center py-32">
                      <div className="text-red-600 text-sm">
                        {language === 'rw' ? 'Hubatswe no gupakira igitabo' : language === 'fr' ? 'Erreur de chargement du livre' : 'Failed to load the book'}
                      </div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                    width={Math.min(window.innerWidth - 64, 900)}
                    loading={
                      <div className="flex items-center justify-center py-32">
                        <div className="text-muted-foreground text-sm">Loading page...</div>
                      </div>
                    }
                  />
                </Document>
              </div>
            ) : (
              <div className="flex items-center justify-center py-32">
                <div className="text-muted-foreground text-sm">
                  {language === 'rw' ? 'Bikorwa...' : language === 'fr' ? 'Chargement...' : 'Loading...'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom navigation — simple prev/next with page number */}
          <div className="flex items-center justify-between gap-4 mt-4">
            <button
              onClick={handlePrevPage}
              disabled={isFirstPage}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-5 py-2.5 text-xs font-semibold text-foreground disabled:opacity-30 hover:bg-muted/70 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {language === 'rw' ? 'Inyuma' : language === 'fr' ? 'Précédent' : 'Previous'}
            </button>

            <div className="text-xs text-muted-foreground">
              {language === 'rw'
                ? `Paji ${currentPage}`
                : language === 'fr'
                  ? `Page ${currentPage}`
                  : `Page ${currentPage}`}
              {numPages ? ` / ${numPages}` : ''}
            </div>

            <button
              onClick={handleNextPage}
              disabled={isLastPage}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all"
            >
              {language === 'rw' ? 'Imbere' : language === 'fr' ? 'Suivant' : 'Next'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Part boundaries notice */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {activePartData.startPage > 1 && currentPage === activePartData.startPage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'rw'
                  ? `Utangiye: ${t(activePartData.title)}`
                  : language === 'fr'
                    ? `Début: ${t(activePartData.title)}`
                    : `Started: ${t(activePartData.title)}`}
              </span>
            )}
            {currentPage === activePartData.endPage && !isLastPage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-semibold text-green-600">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'rw'
                  ? `Urangije: ${t(activePartData.title)}`
                  : language === 'fr'
                    ? `Terminé: ${t(activePartData.title)}`
                    : `Completed: ${t(activePartData.title)}`}
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
