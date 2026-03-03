import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type Locale } from '../../types';
import Breadcrumb from '../shared/Breadcrumb';
import { StarRating, CheckCircleIcon, ClockIcon, FlameIcon } from '../../lib/icons';
import { UsersIcon, MapPinIcon } from '../shared/CommonIcons';
import AnimateOnScroll from '../AnimateOnScroll';
import CulturalHistorySection from '../CulturalHistorySection';
import ScheduleSection from '../ScheduleSection';
import FAQSection from '../FAQSection';
import { ReviewsSection } from '../reviews';
import AnimatedCounter from '../AnimatedCounter';
import HowToGetHere from '../HowToGetHere';
import { CourseSchema, AggregateReviewsSchema } from '../SchemaMarkup';
import {
  ANIMATION_DELAYS,
  BARCELONA_NEARBY_AREAS,
  FARRAYS_LOCATION,
  SOCIAL_PROOF,
} from '../../constants/shared';
import type { Testimonial } from '../../types';
import type { FAQ } from './ClassPageTemplate';

// ============================================================================
// TYPES
// ============================================================================

export interface ScheduleItem {
  id: string;
  dayKey: string;
  className: string;
  time: string;
  teacher: string;
  levelKey: string;
  note?: string;
}

export interface LevelItem {
  id: string;
  levelKey: string;
  titleKey: string;
  descKey: string;
  duration: string;
}

export interface TeacherInfo {
  name: string;
  specialtyKey: string;
  bioKey: string;
  image?: string;
  imageSrcSet?: string;
  tags?: string[];
}

export interface PrepareItem {
  titleKey: string;
  items: string[];
  icon: 'bring' | 'before' | 'note';
}

export interface IdentifyItem {
  key: string;
  icon?: React.ReactNode;
}

export interface TransformationItem {
  beforeKey: string;
  afterKey: string;
}

export interface DanceClassPageConfig {
  // Identification
  styleKey: string; // 'ballet', 'salsa', 'dancehall', etc.
  stylePath: string; // 'ballet-barcelona', 'salsa-cubana-barcelona', etc.

  // Data from constants
  faqsConfig: FAQ[];
  testimonials: Testimonial[];
  scheduleKeys: ScheduleItem[];
  levels?: LevelItem[];
  nearbyAreas?: ReadonlyArray<{ readonly name: string; readonly time: string }>;

  // Teachers
  teachers: TeacherInfo[];

  // Hero stats
  heroStats?: {
    minutes?: number;
    calories?: number;
    funPercent?: number;
  };

  // Course schema config
  courseConfig?: {
    teaches?: string;
    prerequisites?: string;
    lessons?: string;
    duration?: string;
  };

  // Optional video
  videoId?: string;

  // Breadcrumb config (4 levels: home > classes > category > current)
  breadcrumbConfig: {
    homeKey: string;
    classesKey: string;
    categoryKey: string;
    categoryUrl: string;
    currentKey: string;
  };

  // Cultural history section
  culturalHistory?: {
    titleKey: string;
    shortDescKey: string;
    fullHistoryKey: string;
  };

  // Optional custom sections (to be inserted between standard sections)
  customSections?: {
    afterHero?: React.ReactNode;
    afterSchedule?: React.ReactNode;
    afterTeachers?: React.ReactNode;
    beforeFAQ?: React.ReactNode;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

const DanceClassPageTemplate: React.FC<DanceClassPageConfig> = ({
  styleKey,
  stylePath,
  faqsConfig,
  testimonials,
  scheduleKeys,
  levels,
  nearbyAreas = BARCELONA_NEARBY_AREAS,
  teachers,
  heroStats = { minutes: 60, calories: 400, funPercent: 100 },
  courseConfig,
  // Note: videoId is available in the interface but not currently used in this template
  breadcrumbConfig,
  culturalHistory,
  customSections,
}) => {
  const { t, i18n } = useTranslation([
    'common',
    'booking',
    'schedule',
    'calendar',
    'home',
    'classes',
    'blog',
    'faq',
    'about',
    'contact',
    'pages',
  ]);
  const locale = i18n.language;
  const baseUrl = 'https://www.farrayscenter.com';
  const pageUrl = `${baseUrl}/${locale}/clases/${stylePath}`;

  // ===== MEMOIZED DATA (Performance optimization) =====

  // Schedule data - translate keys dynamically
  const schedules = useMemo(
    () =>
      scheduleKeys.map(schedule => ({
        ...schedule,
        day: t(schedule.dayKey),
        level: t(schedule.levelKey),
      })),
    [scheduleKeys, t]
  );

  // FAQs - translate keys dynamically
  const faqs = useMemo(
    () =>
      faqsConfig.map(faq => ({
        id: faq.id,
        question: t(faq.questionKey),
        answer: t(faq.answerKey),
      })),
    [faqsConfig, t]
  );

  // Reviews schema data
  const reviewsSchemaData = useMemo(
    () =>
      testimonials.map(testimonial => ({
        author: testimonial.name,
        reviewRating: { ratingValue: testimonial.rating.toString(), bestRating: '5' },
        reviewBody: testimonial.quote[locale as Locale],
        datePublished: new Date().toISOString().split('T')[0],
      })),
    [testimonials, locale]
  );

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { name: t(breadcrumbConfig.homeKey), url: `/${locale}` },
      { name: t(breadcrumbConfig.classesKey), url: `/${locale}/clases/baile-barcelona` },
      { name: t(breadcrumbConfig.categoryKey), url: `/${locale}${breadcrumbConfig.categoryUrl}` },
      {
        name: t(breadcrumbConfig.currentKey),
        url: `/${locale}/clases/${stylePath}`,
        isActive: true,
      },
    ],
    [breadcrumbConfig, locale, stylePath, t]
  );

  return (
    <>
      <Helmet>
        <title>{t(`${styleKey}PageTitle`)} | Farray&apos;s Center</title>
        <meta name="description" content={t(`${styleKey}MetaDescription`)} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${t(`${styleKey}PageTitle`)} | Farray's Center`} />
        <meta property="og:description" content={t(`${styleKey}MetaDescription`)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/images/og-${stylePath}.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t(`${styleKey}PageTitle`)} | Farray's Center`} />
        <meta name="twitter:description" content={t(`${styleKey}MetaDescription`)} />
        <meta name="twitter:image" content={`${baseUrl}/images/og-${stylePath}.jpg`} />
      </Helmet>

      {/* BreadcrumbList generated at build-time by prerender.mjs */}

      {/* LocalBusiness Schema removed - already injected at build-time by prerender.mjs */}

      <CourseSchema
        name={t(`${styleKey}CourseSchemaName`)}
        description={t(`${styleKey}CourseSchemaDesc`)}
        provider={{
          name: FARRAYS_LOCATION.name,
          url: baseUrl,
        }}
        educationalLevel={t('schema_educationalLevel')}
        teaches={courseConfig?.teaches || t(`${styleKey}CourseTeaches`)}
        coursePrerequisites={courseConfig?.prerequisites || t('schema_prerequisites')}
        numberOfLessons={courseConfig?.lessons || t('schema_weeklyClasses')}
        timeRequired={courseConfig?.duration || 'PT1H'}
        availableLanguage={SUPPORTED_LOCALES}
      />

      <AggregateReviewsSchema
        reviews={reviewsSchemaData}
        itemName={`${t(`${styleKey}PageTitle`)} - Farray's Center`}
        itemType="Course"
      />

      {/* Skip Links */}
      <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:bg-primary-accent focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:font-bold"
        >
          {t('skipToMain')}
        </a>
        <a
          href="#schedule"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-48 focus-visible:z-[100] focus-visible:bg-primary-accent focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:font-bold"
        >
          {t('skipToSchedule')}
        </a>
      </nav>

      <main id="main-content" className="pt-20 md:pt-24" role="main">
        {/* ===== HERO SECTION ===== */}
        <section
          id={`${styleKey}-hero`}
          aria-labelledby="hero-title"
          className="relative text-center py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[600px]"
        >
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/30 via-black to-black"></div>
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6">
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/75" />

            <AnimateOnScroll>
              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-6 holographic-text"
              >
                {t(`${styleKey}HeroTitle`)}
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 holographic-text">
                {t(`${styleKey}HeroSubtitle`)}
              </p>
              <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-neutral/90 mt-6 sm:mt-8 mb-4 sm:mb-6 leading-relaxed">
                {t(`${styleKey}HeroDesc`)}
              </p>
              <p className="text-base sm:text-lg md:text-xl text-neutral/90 italic mb-6">
                {t(`${styleKey}HeroLocation`)}
              </p>

              {/* Social Proof */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-8 text-neutral/80">
                <div className="flex items-center gap-2">
                  <StarRating size="sm" />
                  <span className="font-semibold">{SOCIAL_PROOF.rating}/5</span>
                  <span className="text-sm">
                    ({SOCIAL_PROOF.reviewCount} {t('reviews')})
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary-accent" />
                  <span className="text-sm">{t(`${styleKey}HeroStudents`)}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-primary-accent" />
                  <span className="text-sm">Barcelona</span>
                </div>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ClockIcon className="w-6 h-6 text-primary-accent" />
                    <AnimatedCounter
                      target={heroStats.minutes || 60}
                      suffix="min"
                      className="text-3xl md:text-4xl font-black text-neutral"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-neutral/60">{t('classesPerSession')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FlameIcon className="w-6 h-6 text-primary-accent" />
                    <AnimatedCounter
                      target={heroStats.calories || 400}
                      suffix=""
                      className="text-3xl md:text-4xl font-black text-neutral"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-neutral/60">{t('caloriesBurned')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircleIcon className="w-6 h-6 text-primary-accent" />
                    <AnimatedCounter
                      target={heroStats.funPercent || 100}
                      suffix="%"
                      className="text-3xl md:text-4xl font-black text-neutral"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-neutral/60">{t('funGuaranteed')}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <a
                  href="#schedule"
                  className="px-8 py-4 bg-primary-accent text-white font-bold rounded-full hover:bg-primary-accent/90 transition-colors shadow-lg hover:shadow-accent-glow"
                >
                  {t('viewSchedule')}
                </a>
                <a
                  href={`/${locale}/contacto`}
                  className="px-8 py-4 bg-transparent border-2 border-neutral/30 text-neutral font-bold rounded-full hover:border-primary-accent hover:text-primary-accent transition-colors"
                >
                  {t('bookTrialClass')}
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Custom section after hero */}
        {customSections?.afterHero}

        {/* ===== SCHEDULE SECTION ===== */}
        <section
          id="schedule"
          aria-labelledby="schedule-title"
          className="py-12 md:py-16 bg-primary-dark/10"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10 sm:mb-12 max-w-3xl mx-auto">
                <h2
                  id="schedule-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral holographic-text"
                >
                  {t(`${styleKey}ScheduleTitle`)}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/70 mt-4">
                  {t(`${styleKey}ScheduleSubtitle`)}
                </p>
              </div>
            </AnimateOnScroll>

            <ScheduleSection
              schedules={schedules}
              titleKey={`${styleKey}ScheduleTitle`}
              subtitleKey={`${styleKey}ScheduleSubtitle`}
              t={t}
            />
          </div>
        </section>

        {/* Custom section after schedule */}
        {customSections?.afterSchedule}

        {/* ===== LEVELS SECTION (if provided) ===== */}
        {levels && levels.length > 0 && (
          <section className="py-12 md:py-16 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-neutral holographic-text">
                    {t(`${styleKey}LevelsTitle`)}
                  </h2>
                  <p className="text-neutral/70 mt-2">{t(`${styleKey}LevelsSubtitle`)}</p>
                </div>
              </AnimateOnScroll>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {levels.map((level, index) => (
                  <AnimateOnScroll key={level.id} delay={index * ANIMATION_DELAYS.STAGGER_SMALL}>
                    <div className="h-full p-5 rounded-2xl border transition-colors bg-black/50 border-primary-dark/40 hover:border-primary-accent/50">
                      <div className="inline-block px-3 py-1 text-sm font-semibold rounded-full mb-3 bg-primary-accent/20 text-primary-accent">
                        {level.duration}
                      </div>
                      <h4 className="text-lg font-bold text-neutral mb-2">{t(level.titleKey)}</h4>
                      <p className="text-neutral/80 text-sm leading-relaxed">{t(level.descKey)}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== TEACHERS SECTION ===== */}
        <section
          id="teachers"
          aria-labelledby="teachers-title"
          className="py-12 md:py-16 bg-primary-dark/10"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto">
                <h2
                  id="teachers-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral holographic-text"
                >
                  {t(`${styleKey}TeachersTitle`)}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/70 mt-4">
                  {t(`${styleKey}TeachersSubtitle`)}
                </p>
              </div>
            </AnimateOnScroll>

            <div
              className={`grid ${teachers.length > 1 ? 'md:grid-cols-2' : ''} gap-6 max-w-4xl mx-auto`}
            >
              {teachers.map((teacher, index) => (
                <AnimateOnScroll key={teacher.name} delay={index * ANIMATION_DELAYS.STAGGER_MEDIUM}>
                  <div className="group h-full bg-black/50 backdrop-blur-md border border-primary-dark/40 hover:border-primary-accent/50 rounded-2xl p-6 transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                      {teacher.image ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-dark/50 group-hover:border-primary-accent/50 transition-colors duration-300 mb-4">
                          <picture>
                            {teacher.imageSrcSet && (
                              <source type="image/webp" srcSet={teacher.imageSrcSet} sizes="96px" />
                            )}
                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              width="96"
                              height="96"
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </picture>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-dark/50 group-hover:border-primary-accent/50 transition-colors duration-300 mb-4 bg-primary-dark/30 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-primary-accent/50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-neutral mb-1">{teacher.name}</h3>
                      <p className="text-primary-accent font-semibold mb-3 text-sm">
                        {t(teacher.specialtyKey)}
                      </p>
                      <p className="text-neutral/80 text-sm leading-relaxed">{t(teacher.bioKey)}</p>
                      {teacher.tags && teacher.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                          {teacher.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary-accent/20 text-primary-accent text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll>
              <p className="text-center text-base sm:text-lg text-neutral/90 mt-8 sm:mt-10 max-w-2xl mx-auto">
                {t(`${styleKey}TeachersClosing`)}
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Custom section after teachers */}
        {customSections?.afterTeachers}

        {/* ===== CULTURAL HISTORY SECTION (if provided) ===== */}
        {culturalHistory && (
          <CulturalHistorySection
            titleKey={culturalHistory.titleKey}
            shortDescKey={culturalHistory.shortDescKey}
            fullHistoryKey={culturalHistory.fullHistoryKey}
            readMoreText={t('readMore')}
            readLessText={t('readLess')}
            t={t}
          />
        )}

        {/* ===== TESTIMONIALS SECTION ===== */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-neutral holographic-text">
                  {t('testimonialsTitle')}
                </h2>
                <p className="text-neutral/70 mt-2">{t('testimonialsSubtitle')}</p>
              </div>
            </AnimateOnScroll>

            <ReviewsSection category="general" limit={6} showGoogleBadge={true} layout="grid" />
          </div>
        </section>

        {/* Custom section before FAQ */}
        {customSections?.beforeFAQ}

        {/* ===== FAQ SECTION ===== */}
        <FAQSection faqs={faqs} title={t(`${styleKey}FaqTitle`)} />

        {/* ===== NEARBY AREAS / HOW TO GET HERE ===== */}
        <section className="py-12 md:py-16 bg-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-neutral holographic-text">
                  {t('howToGetHereTitle')}
                </h2>
                <p className="text-neutral/70 mt-2">{t('howToGetHereSubtitle')}</p>
              </div>
            </AnimateOnScroll>

            <HowToGetHere />

            {/* Nearby Areas Grid */}
            <div className="mt-10 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-neutral mb-4 text-center">
                {t('nearbyAreasTitle')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nearbyAreas.map((area, index) => (
                  <AnimateOnScroll key={area.name} delay={index * 50}>
                    <div className="p-3 bg-black/30 rounded-xl text-center">
                      <p className="text-neutral font-medium text-sm">{area.name}</p>
                      <p className="text-neutral/60 text-xs">{area.time}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA SECTION ===== */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary-dark via-black to-black relative overflow-hidden">
          <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
            <AnimateOnScroll>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral holographic-text mb-6">
                {t(`${styleKey}FinalCtaTitle`)}
              </h2>
              <p className="text-lg sm:text-xl text-neutral/80 max-w-2xl mx-auto mb-10">
                {t(`${styleKey}FinalCtaDesc`)}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/${locale}/contacto`}
                  className="px-10 py-4 bg-primary-accent text-white font-bold rounded-full hover:bg-primary-accent/90 transition-colors shadow-lg hover:shadow-accent-glow text-lg"
                >
                  {t('bookNow')}
                </a>
                <a
                  href="#schedule"
                  className="px-10 py-4 bg-transparent border-2 border-neutral/30 text-neutral font-bold rounded-full hover:border-primary-accent hover:text-primary-accent transition-colors text-lg"
                >
                  {t('viewSchedule')}
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
    </>
  );
};

export default DanceClassPageTemplate;
