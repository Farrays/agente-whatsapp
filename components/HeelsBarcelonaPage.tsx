import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './shared/Breadcrumb';
import { HEELS_STYLES, HEELS_FAQS_CONFIG } from '../constants/heels';
import AnimateOnScroll from './AnimateOnScroll';
import FAQSection from './FAQSection';
import AnimatedCounter from './AnimatedCounter';
import Icon, { type IconName } from './Icon';
import type { ValuePillar } from '../types';
import { SUPPORTED_LOCALES } from '../types';
import { ReviewsSection } from './reviews';
import { CourseSchema } from './SchemaMarkup';
import { CheckIcon } from '../lib/icons';
import LazyImage from './LazyImage';
import OptimizedImage from './OptimizedImage';
import { getRelatedClassImageUrl, getStyleImage } from '../constants/style-images';

const ANIMATION_DELAYS = {
  STAGGER_SMALL: 100,
  STAGGER_MEDIUM: 150,
};

// Type extension for ValuePillar with icon names instead of components
type ValuePillarWithIcon = Omit<ValuePillar, 'Icon'> & { iconName: IconName };

const valuePillars: ValuePillarWithIcon[] = [
  {
    id: 'unesco',
    titleKey: 'heelsBarcelona_why_reason1_title',
    contentKey: 'heelsBarcelona_why_reason1_desc',
    iconName: 'academic-cap',
  },
  {
    id: 'yunaisy',
    titleKey: 'heelsBarcelona_why_reason2_title',
    contentKey: 'heelsBarcelona_why_reason2_desc',
    iconName: 'star',
  },
  {
    id: 'femininity',
    titleKey: 'heelsBarcelona_why_reason3_title',
    contentKey: 'heelsBarcelona_why_reason3_desc',
    iconName: 'sparkles',
  },
  {
    id: 'posture',
    titleKey: 'heelsBarcelona_why_reason4_title',
    contentKey: 'heelsBarcelona_why_reason4_desc',
    iconName: 'heart',
  },
  {
    id: 'facilities',
    titleKey: 'heelsBarcelona_why_reason5_title',
    contentKey: 'heelsBarcelona_why_reason5_desc',
    iconName: 'building',
  },
  {
    id: 'location',
    titleKey: 'heelsBarcelona_why_reason6_title',
    contentKey: 'heelsBarcelona_why_reason6_desc',
    iconName: 'map-pin',
  },
];

const HeelsBarcelonaPage: React.FC = () => {
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

  // FAQs - translate keys dynamically
  const heelsFaqs = HEELS_FAQS_CONFIG.map(faq => ({
    id: faq.id,
    question: t(faq.questionKey),
    answer: t(faq.answerKey),
  }));

  // Breadcrumb items for visual navigation with microdata
  const breadcrumbItems = [
    { name: t('heelsBarcelona_breadcrumb_home'), url: `/${locale}` },
    { name: t('heelsBarcelona_breadcrumb_classes'), url: `/${locale}/clases/baile-barcelona` },
    {
      name: t('heelsBarcelona_breadcrumb_urban'),
      url: `/${locale}/clases/danzas-urbanas-barcelona`,
    },
    {
      name: t('heelsBarcelona_breadcrumb_current'),
      url: `/${locale}/clases/heels-barcelona`,
      isActive: true,
    },
  ];

  // Schema Markup - ItemList (Heels Styles)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('schema_heels_itemListName'),
    itemListElement: HEELS_STYLES.map((style, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: t(`heelsBarcelona_style_${style.key}_title`),
      url: `${baseUrl}/${locale}${style.url}`,
    })),
  };

  // FAQPage Schema removed — generated at build-time by prerender.mjs

  return (
    <>
      {/* SEO metadata (title, description, og, hreflang) is handled by the global SEO.tsx component */}
      {/* Page-specific Schema Markup */}
      <CourseSchema
        name={t('heelsBarcelona_title')}
        description={t('heelsBarcelona_description')}
        provider={{
          name: "Farray's International Dance Center",
          url: baseUrl,
        }}
        educationalLevel={t('schema_educationalLevelBeginnerAdvanced')}
        teaches={t('schema_heels_teaches')}
        availableLanguage={SUPPORTED_LOCALES}
      />
      {/* LocalBusiness Schema removed - already injected at build-time by prerender.mjs */}
      <Helmet>
        <title>{t('heelsBarcelona_title')}</title>
        {/* BreadcrumbList + FAQPage generated at build-time by prerender.mjs */}
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-accent focus:text-white focus:rounded-lg"
      >
        {t('skipToContent')}
      </a>
      <a
        href="#styles"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-accent focus:text-white focus:rounded-lg"
      >
        {t('skipToSchedule')}
      </a>

      <main role="main" id="main-content" className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section
          id="heels-hero"
          aria-labelledby="heels-hero-title"
          className="relative text-center py-24 sm:py-32 md:py-40 overflow-hidden flex items-center justify-center min-h-[600px]"
        >
          {/* Background Image - Enterprise OptimizedImage with full optimization */}
          <div className="absolute inset-0">
            <OptimizedImage
              src="/images/classes/Heels/img/clases-heels-barcelona"
              altKey="styleImages.heels.hero"
              altFallback="Bailarina profesional en clase de Heels Barcelona - Técnica de baile con tacones y coreografía sensual en Farray's Center"
              priority="high"
              sizes="100vw"
              aspectRatio="16/9"
              className="w-full h-full"
              objectFit="cover"
              objectPosition="center 30%"
              placeholder="color"
              placeholderColor="#111"
              breakpoints={[320, 640, 768, 1024, 1440, 1920]}
              formats={['avif', 'webp', 'jpg']}
            />
            {/* Gradient overlay for text readability - optimized for hero visibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-black/70 to-black/80"></div>
          </div>
          <div className="relative z-20 container mx-auto px-4 sm:px-6">
            {/* Breadcrumb with Microdata */}
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/90" />

            {/* H1 + Subheadline - Enterprise pattern with holographic */}
            <AnimateOnScroll>
              <h1
                id="heels-hero-title"
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight mb-4 min-h-[100px] md:min-h-[140px] flex flex-col items-center justify-center text-white"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {t('heelsBarcelona_h1')}
                <br />
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-normal mt-2 holographic-text">
                  {t('heelsBarcelona_h1_sub')}
                </span>
              </h1>
              <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-neutral/90 mt-8 leading-relaxed">
                {t('heelsBarcelona_intro')}
              </p>
            </AnimateOnScroll>

            {/* CTA Buttons */}
            <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 2}>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={`/${locale}#enroll`}
                  className="inline-flex items-center justify-center bg-primary-accent text-white font-bold text-base sm:text-lg py-4 px-8 sm:px-10 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-accent-glow animate-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {t('enrollNow')}
                  <CheckIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* What are Heels Classes Section - SEO CRITICAL */}
        <section
          id="what-is-heels"
          aria-labelledby="what-is-title"
          className="section-after-hero pb-12 sm:pb-16 md:pb-24 bg-black"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto">
                <h2
                  id="what-is-title"
                  className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-8 text-center holographic-text"
                >
                  {t('heelsBarcelona_whatIs_title')}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="max-w-4xl mx-auto space-y-6 text-neutral/90 leading-relaxed">
              <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL}>
                <p className="text-base sm:text-lg">{t('heelsBarcelona_whatIs_definition')}</p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 3}>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">
                  {t('heelsBarcelona_whatIs_benefits_title')}
                </h3>
              </AnimateOnScroll>

              <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 4}>
                <ul
                  className="list-disc list-inside space-y-2 text-base sm:text-lg"
                  role="list"
                  aria-label={t('heelsBarcelona_whatIs_benefits_title')}
                >
                  <li role="listitem">{t('heelsBarcelona_whatIs_benefits_list1')}</li>
                  <li role="listitem">{t('heelsBarcelona_whatIs_benefits_list2')}</li>
                  <li role="listitem">{t('heelsBarcelona_whatIs_benefits_list3')}</li>
                  <li role="listitem">{t('heelsBarcelona_whatIs_benefits_list4')}</li>
                  <li role="listitem">{t('heelsBarcelona_whatIs_benefits_list5')}</li>
                  <li role="listitem">{t('heelsBarcelona_whatIs_benefits_list6')}</li>
                </ul>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Heels Styles Grid Section - 2 Styles */}
        <section
          id="styles"
          aria-labelledby="styles-title"
          className="py-12 md:py-16 bg-primary-dark/10"
        >
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto">
                <h2
                  id="styles-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 holographic-text"
                >
                  {t('heelsBarcelona_styles_title')}
                </h2>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 2}>
              <p className="max-w-3xl mx-auto text-base sm:text-lg text-neutral/90 mb-12">
                {t('heelsBarcelona_styles_description')}
              </p>
            </AnimateOnScroll>

            {/* Grid of 2 Heels Styles */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto"
              role="list"
              aria-label={t('heelsBarcelona_styles_title')}
            >
              {HEELS_STYLES.map((style, index) => (
                <AnimateOnScroll key={style.key} delay={index * ANIMATION_DELAYS.STAGGER_MEDIUM}>
                  <Link
                    to={`/${locale}${style.url}`}
                    className="group block relative h-full rounded-xl overflow-hidden shadow-lg bg-black text-white transition-all duration-500 ease-in-out hover:shadow-accent-glow hover:scale-105 border border-white/10 hover:border-primary-accent flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    role="listitem"
                  >
                    {/* Background Image - Enterprise OptimizedImage */}
                    <div className="relative h-48 sm:h-64 overflow-hidden flex-shrink-0">
                      <OptimizedImage
                        src={style.basePath}
                        altKey={style.altKey}
                        altFallback={style.fallbackAlt}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        aspectRatio="4/3"
                        className="w-full h-full"
                        objectFit="cover"
                        placeholder="color"
                        placeholderColor="#111"
                      />
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>
                    </div>

                    {/* Text Content - Always visible */}
                    <div className="p-4 sm:p-6 space-y-3 flex-grow flex flex-col">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary-accent transition-colors duration-300">
                        {t(`heelsBarcelona_style_${style.key}_title`)}
                      </h3>

                      {/* SEO Text - Always visible */}
                      <p className="text-neutral/90 text-xs sm:text-sm leading-relaxed flex-grow">
                        {t(`heelsBarcelona_style_${style.key}_seo`)}
                      </p>

                      {/* CTA Link */}
                      <div className="pt-2 text-primary-accent font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        {t('heelsBarcelona_viewMore')}
                        <CheckIcon className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Which Style to Choose Section */}
        <section
          id="which-style"
          aria-labelledby="which-style-title"
          className="py-12 md:py-16 bg-black"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto">
                <h2
                  id="which-style-title"
                  className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-6 text-center holographic-text"
                >
                  {t('heelsBarcelona_whichStyle_title')}
                </h2>
                <p className="max-w-3xl mx-auto text-center text-base sm:text-lg text-neutral/90 mb-12">
                  {t('heelsBarcelona_whichStyle_intro')}
                </p>
              </div>
            </AnimateOnScroll>

            {/* Comparison Cards */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto"
              role="list"
              aria-label={t('heelsBarcelona_whichStyle_title')}
            >
              <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL}>
                <div
                  className="h-full min-h-[280px] bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-xl p-6 sm:p-8 hover:border-primary-accent hover:shadow-accent-glow transition-all duration-300 flex flex-col"
                  role="listitem"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {t('heelsBarcelona_whichStyle_femmology_title')}
                  </h3>
                  <p className="text-primary-accent text-xs sm:text-sm font-medium mb-3">
                    {t('heelsBarcelona_whichStyle_femmology_subtitle')}
                  </p>
                  <p className="text-neutral/70 text-xs uppercase tracking-wide mb-4">
                    {t('heelsBarcelona_whichStyle_femmology_for')}
                  </p>
                  <ul
                    className="text-neutral/90 space-y-2 text-xs sm:text-sm mb-6 flex-grow"
                    role="list"
                    aria-label={t('heelsBarcelona_whichStyle_femmology_title')}
                  >
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_femmology_point1')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_femmology_point2')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_femmology_point3')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_femmology_point4')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_femmology_point5')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_femmology_point6')}
                    </li>
                  </ul>
                  <Link
                    to={`/${locale}/clases/femmology-sexy-style-en-barcelona`}
                    className="inline-flex items-center justify-center w-full bg-primary-accent text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-accent-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {t('heelsBarcelona_whichStyle_femmology_cta')}
                    <CheckIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 2}>
                <div
                  className="h-full min-h-[280px] bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-xl p-6 sm:p-8 hover:border-primary-accent hover:shadow-accent-glow transition-all duration-300 flex flex-col"
                  role="listitem"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {t('heelsBarcelona_whichStyle_sexystyle_title')}
                  </h3>
                  <p className="text-primary-accent text-xs sm:text-sm font-medium mb-3">
                    {t('heelsBarcelona_whichStyle_sexystyle_subtitle')}
                  </p>
                  <p className="text-neutral/70 text-xs uppercase tracking-wide mb-4">
                    {t('heelsBarcelona_whichStyle_sexystyle_for')}
                  </p>
                  <ul
                    className="text-neutral/90 space-y-2 text-xs sm:text-sm mb-6 flex-grow"
                    role="list"
                    aria-label={t('heelsBarcelona_whichStyle_sexystyle_title')}
                  >
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_sexystyle_point1')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_sexystyle_point2')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_sexystyle_point3')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_sexystyle_point4')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_sexystyle_point5')}
                    </li>
                    <li className="flex items-start" role="listitem">
                      <span className="text-primary-accent mr-2 mt-0.5">✓</span>
                      {t('heelsBarcelona_whichStyle_sexystyle_point6')}
                    </li>
                  </ul>
                  <Link
                    to={`/${locale}/clases/sexy-style-barcelona`}
                    className="inline-flex items-center justify-center w-full bg-transparent border-2 border-primary-accent text-primary-accent font-bold py-3 px-6 rounded-full transition-all duration-300 hover:bg-primary-accent hover:text-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {t('heelsBarcelona_whichStyle_sexystyle_cta')}
                    <CheckIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Comparison Table */}
            <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 2.5}>
              <div className="mt-12 max-w-4xl mx-auto overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  role="table"
                  aria-label={t('heelsBarcelona_whichStyle_title')}
                >
                  <thead>
                    <tr className="border-b border-primary-accent/30">
                      <th
                        className="py-3 sm:py-4 px-3 sm:px-4 text-left text-neutral/70 font-medium text-xs sm:text-sm"
                        scope="col"
                      >
                        {t('heelsBarcelona_table_aspect')}
                      </th>
                      <th
                        className="py-3 sm:py-4 px-3 sm:px-4 text-center text-primary-accent font-bold text-xs sm:text-sm"
                        scope="col"
                      >
                        {t('heelsBarcelona_table_femmology')}
                      </th>
                      <th
                        className="py-3 sm:py-4 px-3 sm:px-4 text-center text-white font-bold text-xs sm:text-sm"
                        scope="col"
                      >
                        {t('heelsBarcelona_table_sexystyle')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-neutral/90">
                        {t('heelsBarcelona_table_heels')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-primary-accent font-medium">
                        {t('heelsBarcelona_table_heels_fem')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-neutral/90">
                        {t('heelsBarcelona_table_heels_sexy')}
                      </td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-neutral/90">
                        {t('heelsBarcelona_table_level')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-primary-accent font-medium">
                        {t('heelsBarcelona_table_level_fem')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-neutral/90">
                        {t('heelsBarcelona_table_level_sexy')}
                      </td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-neutral/90">
                        {t('heelsBarcelona_table_focus')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-primary-accent font-medium">
                        {t('heelsBarcelona_table_focus_fem')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-neutral/90">
                        {t('heelsBarcelona_table_focus_sexy')}
                      </td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-neutral/90">
                        {t('heelsBarcelona_table_emotional')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-primary-accent font-medium">
                        {t('heelsBarcelona_table_emotional_fem')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-neutral/90">
                        {t('heelsBarcelona_table_emotional_sexy')}
                      </td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-neutral/90">
                        {t('heelsBarcelona_table_teacher')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-primary-accent font-medium">
                        {t('heelsBarcelona_table_teacher_fem')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-neutral/90">
                        {t('heelsBarcelona_table_teacher_sexy')}
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-neutral/90">
                        {t('heelsBarcelona_table_ideal')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-primary-accent font-medium">
                        {t('heelsBarcelona_table_ideal_fem')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-neutral/90">
                        {t('heelsBarcelona_table_ideal_sexy')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AnimateOnScroll>

            {/* Additional Info Card - Combine Styles */}
            <div className="mt-12 max-w-3xl mx-auto">
              <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 3}>
                <div className="bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-xl p-6 sm:p-8 hover:border-primary-accent hover:shadow-accent-glow transition-all duration-300 text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                    {t('heelsBarcelona_whichStyle_combine_title')}
                  </h3>
                  <p className="text-neutral/90 leading-relaxed text-sm sm:text-base">
                    {t('heelsBarcelona_whichStyle_combine_text')}
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Why Study Heels at FIDC Section */}
        <section id="why-fidc" aria-labelledby="why-title" className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                <h2
                  id="why-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text"
                >
                  {t('heelsBarcelona_why_title')}
                </h2>
              </div>
            </AnimateOnScroll>
            <div
              className="flex flex-wrap justify-center -m-2 sm:-m-4"
              role="list"
              aria-label={t('heelsBarcelona_why_title')}
            >
              {valuePillars.map((pillar, index) => (
                <div
                  key={pillar.id}
                  className="w-full sm:w-1/2 lg:w-1/3 p-2 sm:p-4"
                  role="listitem"
                >
                  <AnimateOnScroll
                    delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                    className="h-full"
                  >
                    <div className="group p-6 sm:p-8 bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-2xl shadow-lg transition-all duration-500 hover:border-primary-accent hover:shadow-accent-glow hover:-translate-y-3 hover:scale-[1.02] h-full min-h-[180px] flex flex-col">
                      <div className="mb-4 sm:mb-6">
                        <div className="bg-primary-dark/30 group-hover:bg-primary-accent/20 p-3 sm:p-4 rounded-xl inline-block shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                          <Icon
                            name={pillar.iconName}
                            className="h-8 w-8 sm:h-10 sm:w-10 text-primary-accent transition-all duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-neutral group-hover:text-white transition-colors duration-300">
                        {t(pillar.titleKey)}
                      </h3>
                      <p className="text-neutral/90 text-sm sm:text-base leading-relaxed flex-grow group-hover:text-neutral/90 transition-colors duration-300">
                        {t(pillar.contentKey)}
                      </p>
                    </div>
                  </AnimateOnScroll>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Widget Section */}
        <section id="stats" aria-labelledby="stats-title" className="py-8 md:py-12 bg-black">
          <h2 id="stats-title" className="sr-only">
            {t('trustStats')}
          </h2>
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div
                className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 max-w-5xl mx-auto"
                role="list"
                aria-label={t('trustStats')}
              >
                <div className="text-center" role="listitem">
                  <AnimatedCounter
                    target={8}
                    suffix="+"
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                  />
                  <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                    {t('yearsExperience')}
                  </p>
                </div>
                <div className="text-center" role="listitem">
                  <AnimatedCounter
                    target={1500}
                    suffix="+"
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                  />
                  <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                    {t('activeStudents')}
                  </p>
                </div>
                <div className="text-center" role="listitem">
                  <AnimatedCounter
                    target={15000}
                    suffix="+"
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                  />
                  <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                    {t('satisfiedStudents')}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Reviews Section - Google Reviews */}
        <ReviewsSection category="general" limit={6} showGoogleBadge={true} layout="grid" />

        {/* FAQ Section */}
        <FAQSection title={t('heelsBarcelona_faq_title')} faqs={heelsFaqs} />

        {/* Final CTA Section - Conversion Optimized */}
        <section
          id="final-cta"
          aria-labelledby="final-cta-title"
          className="relative py-12 md:py-16 overflow-hidden"
        >
          {/* Background like Hero */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-black to-black"></div>
          </div>
          <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto">
                <h2
                  id="final-cta-title"
                  className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-6 holographic-text"
                >
                  {t('heelsBarcelona_cta_title')}
                </h2>
                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral/90 mb-4">
                  {t('heelsBarcelona_cta_subtitle')}
                </p>
                <p className="max-w-xl mx-auto text-base sm:text-lg text-neutral/75 mb-10">
                  {t('heelsBarcelona_cta_description')}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL * 2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={`/${locale}#enroll`}
                  className="inline-flex items-center justify-center bg-primary-accent text-white font-bold text-lg sm:text-xl py-4 sm:py-5 px-10 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-accent-glow animate-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {t('enrollNow')}
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                </Link>
                <Link
                  to={`/${locale}#enroll`}
                  className="inline-flex items-center justify-center bg-transparent border-2 border-primary-accent text-primary-accent font-bold text-lg sm:text-xl py-4 sm:py-5 px-10 sm:px-12 rounded-full transition-all duration-300 hover:bg-primary-accent hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {t('heroCTA1')}
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Related Classes Section (Internal Linking) */}
        <section
          id="related-classes"
          aria-labelledby="related-classes-title"
          className="py-12 md:py-16"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <header className="text-center mb-8 sm:mb-12 relative z-10">
                <h2
                  id="related-classes-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text"
                >
                  {t('relatedClassesTitle')}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/70">{t('relatedClassesSubtitle')}</p>
              </header>
            </AnimateOnScroll>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto relative z-0"
              role="list"
              aria-label={t('relatedClassesTitle')}
            >
              {/* Sexy Style */}
              <div role="listitem">
                <AnimateOnScroll
                  delay={ANIMATION_DELAYS.STAGGER_SMALL}
                  className="[perspective:1000px]"
                >
                  <article className="h-full" aria-labelledby="related-sexystyle-title">
                    <Link
                      to={`/${locale}/clases/sexy-style-barcelona`}
                      className="group block h-full bg-black/70 backdrop-blur-md
                                 border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                                 transition-all duration-500
                                 [transform-style:preserve-3d]
                                 hover:border-primary-accent hover:shadow-accent-glow
                                 hover:[transform:translateY(-0.5rem)_scale(1.02)]
                                 focus:outline-none focus:ring-2 focus:ring-primary-accent
                                 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={`${t('relatedSexyStyleName')} - ${t('relatedClassesViewClass')}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '480/320' }}>
                        <OptimizedImage
                          src={getStyleImage('sexy_style').basePath}
                          alt={`Clase de ${t('relatedSexyStyleName')} en Barcelona - Farray's Dance Center`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          width={480}
                          height={320}
                          breakpoints={getStyleImage('sexy_style').breakpoints}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
                          priority="auto"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3
                          id="related-sexystyle-title"
                          className="text-lg sm:text-xl font-bold text-neutral mb-2 group-hover:text-primary-accent transition-colors duration-300"
                        >
                          {t('relatedSexyStyleName')}
                        </h3>
                        <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
                          {t('relatedSexyStyleDesc')}
                        </p>
                        <div
                          className="flex items-center gap-2 text-primary-accent font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                          aria-hidden="true"
                        >
                          <span>{t('relatedClassesViewClass')}</span>
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                </AnimateOnScroll>
              </div>

              {/* Femmology */}
              <div role="listitem">
                <AnimateOnScroll
                  delay={ANIMATION_DELAYS.STAGGER_SMALL * 2}
                  className="[perspective:1000px]"
                >
                  <article className="h-full" aria-labelledby="related-femmology-title">
                    <Link
                      to={`/${locale}/clases/femmology`}
                      className="group block h-full bg-black/70 backdrop-blur-md
                                 border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                                 transition-all duration-500
                                 [transform-style:preserve-3d]
                                 hover:border-primary-accent hover:shadow-accent-glow
                                 hover:[transform:translateY(-0.5rem)_scale(1.02)]
                                 focus:outline-none focus:ring-2 focus:ring-primary-accent
                                 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={`${t('relatedFemmologyName')} - ${t('relatedClassesViewClass')}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '480/320' }}>
                        <OptimizedImage
                          src={getStyleImage('femmology_heels').basePath}
                          alt={`Clase de ${t('relatedFemmologyName')} en Barcelona - Farray's Dance Center`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          width={480}
                          height={320}
                          breakpoints={getStyleImage('femmology_heels').breakpoints}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
                          priority="auto"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3
                          id="related-femmology-title"
                          className="text-lg sm:text-xl font-bold text-neutral mb-2 group-hover:text-primary-accent transition-colors duration-300"
                        >
                          {t('relatedFemmologyName')}
                        </h3>
                        <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
                          {t('relatedFemmologyDesc')}
                        </p>
                        <div
                          className="flex items-center gap-2 text-primary-accent font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                          aria-hidden="true"
                        >
                          <span>{t('relatedClassesViewClass')}</span>
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                </AnimateOnScroll>
              </div>

              {/* Salsa Lady Style */}
              <div role="listitem">
                <AnimateOnScroll
                  delay={ANIMATION_DELAYS.STAGGER_SMALL * 3}
                  className="[perspective:1000px]"
                >
                  <article className="h-full" aria-labelledby="related-salsaladystyle-title">
                    <Link
                      to={`/${locale}/clases/salsa-lady-style-barcelona`}
                      className="group block h-full bg-black/70 backdrop-blur-md
                                 border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                                 transition-all duration-500
                                 [transform-style:preserve-3d]
                                 hover:border-primary-accent hover:shadow-accent-glow
                                 hover:[transform:translateY(-0.5rem)_scale(1.02)]
                                 focus:outline-none focus:ring-2 focus:ring-primary-accent
                                 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={`${t('relatedSalsaLadyStyleName')} - ${t('relatedClassesViewClass')}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '480/320' }}>
                        <LazyImage
                          src={getRelatedClassImageUrl('salsa-lady-style-barcelona')}
                          alt={`Clase de ${t('relatedSalsaLadyStyleName')} en Barcelona - Farray's Dance Center`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          width={480}
                          height={320}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3
                          id="related-salsaladystyle-title"
                          className="text-lg sm:text-xl font-bold text-neutral mb-2 group-hover:text-primary-accent transition-colors duration-300"
                        >
                          {t('relatedSalsaLadyStyleName')}
                        </h3>
                        <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
                          {t('relatedSalsaLadyStyleDesc')}
                        </p>
                        <div
                          className="flex items-center gap-2 text-primary-accent font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                          aria-hidden="true"
                        >
                          <span>{t('relatedClassesViewClass')}</span>
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                </AnimateOnScroll>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HeelsBarcelonaPage;
