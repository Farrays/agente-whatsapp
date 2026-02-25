import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HUB_CATEGORIES, FEATURED_STYLES } from '../constants/danceClassesHub';
import { getStyleImage, getContextualAltKey } from '../constants/style-images';
import AnimateOnScroll from './AnimateOnScroll';
import OptimizedImage from './OptimizedImage';
import CategoryPageTemplate, {
  type ValuePillarWithIcon,
  type CategoryItem,
} from './templates/CategoryPageTemplate';

// ============================================================================
// PAGE-SPECIFIC DATA
// ============================================================================

// Category images mapping - Enterprise optimized (AVIF/WebP/JPEG srcsets)
const CATEGORY_IMAGES: Record<string, string> = {
  contemporary: '/images/categories/img/danza',
  urban: '/images/classes/hip-hop-reggaeton/img/clases-hip-hop-reaggaeton-barcelona',
  latin: '/images/categories/img/salsa-bachata',
  fitness: '/images/categories/img/stretching', // Uses stretching image for prep física card
};

// Object positions for category images (to control cropping)
const CATEGORY_OBJECT_POSITIONS: Record<string, string> = {
  fitness: 'center 10%', // Adjusted for stretching image
};

const valuePillars: ValuePillarWithIcon[] = [
  {
    id: 'variety',
    titleKey: 'danceClassesHub_why_variety_title',
    contentKey: 'danceClassesHub_why_variety_content',
    iconName: 'sparkles',
  },
  {
    id: 'farray_method',
    titleKey: 'danceClassesHub_why_farray_method_title',
    contentKey: 'danceClassesHub_why_farray_method_content',
    iconName: 'sparkles',
  },
  {
    id: 'cuban',
    titleKey: 'danceClassesHub_why_cuban_title',
    contentKey: 'danceClassesHub_why_cuban_content',
    iconName: 'academic-cap',
  },
  {
    id: 'levels',
    titleKey: 'danceClassesHub_why_levels_title',
    contentKey: 'danceClassesHub_why_levels_content',
    iconName: 'chart-bar',
  },
  {
    id: 'location',
    titleKey: 'danceClassesHub_why_location_title',
    contentKey: 'danceClassesHub_why_location_content',
    iconName: 'map-pin',
  },
  {
    id: 'schedule',
    titleKey: 'danceClassesHub_why_schedule_title',
    contentKey: 'danceClassesHub_why_schedule_content',
    iconName: 'clock',
  },
  {
    id: 'accreditation',
    titleKey: 'danceClassesHub_why_accreditation_title',
    contentKey: 'danceClassesHub_why_accreditation_content',
    iconName: 'badge-check',
  },
];

// Convert HUB_CATEGORIES to CategoryItem format
const categories: CategoryItem[] = HUB_CATEGORIES.map(cat => ({
  key: cat.key,
  titleKey: cat.titleKey,
  descriptionKey: cat.descriptionKey,
  pillarUrl: cat.pillarUrl,
  imageUrl: cat.imageUrl,
}));

// ============================================================================
// PAGE-SPECIFIC SECTIONS (Slots)
// ============================================================================

const WhatToExpectSection: React.FC = () => {
  const { t } = useTranslation([
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

  return (
    <section aria-labelledby="what-to-expect-title" className="py-12 md:py-16 bg-black">
      <div className="container mx-auto px-6">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto">
            <h2
              id="what-to-expect-title"
              className="text-3xl md:text-4xl font-black tracking-tighter mb-8 text-center holographic-text"
            >
              {t('danceClassesHub_whatToExpect_title')}
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="max-w-4xl mx-auto space-y-6 text-neutral/90 leading-relaxed">
          <AnimateOnScroll delay={100}>
            <p className="text-lg">{t('danceClassesHub_whatToExpect_p1')}</p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <p className="text-lg">{t('danceClassesHub_whatToExpect_p2')}</p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={300}>
            <p className="text-lg">{t('danceClassesHub_whatToExpect_p3')}</p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={400}>
            <p className="text-lg">{t('danceClassesHub_whatToExpect_p4')}</p>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};

const WhichCategorySection: React.FC = () => {
  const { t } = useTranslation([
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

  const tableRows = [
    { goal: 'couples', category: 'couples', why: 'couples' },
    { goal: 'expression', category: 'expression', why: 'expression' },
    { goal: 'urban', category: 'urban', why: 'urban' },
    { goal: 'fitness', category: 'fitness', why: 'fitness' },
    { goal: 'beginner', category: 'beginner', why: 'beginner' },
    { goal: 'morning', category: 'morning', why: 'morning' },
    { goal: 'world', category: 'world', why: 'world' },
  ];

  return (
    <section aria-labelledby="which-category-title" className="py-12 md:py-16 bg-black">
      <div className="container mx-auto px-6">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto">
            <h2
              id="which-category-title"
              className="text-3xl md:text-4xl font-black tracking-tighter mb-6 text-center holographic-text"
            >
              {t('danceClassesHub_whichCategory_title')}
            </h2>
            <p className="max-w-3xl mx-auto text-center text-lg text-neutral/90 mb-12">
              {t('danceClassesHub_whichCategory_intro')}
            </p>
          </div>
        </AnimateOnScroll>

        {/* Comparison Table */}
        <AnimateOnScroll delay={200}>
          <div className="max-w-5xl mx-auto overflow-x-auto mb-12">
            <table className="w-full border-collapse bg-black/50 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl">
              <thead>
                <tr className="bg-primary-accent/20 border-b-2 border-primary-accent">
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    {t('danceClassesHub_whichCategory_tableHeader_goal')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    {t('danceClassesHub_whichCategory_tableHeader_category')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider hidden md:table-cell">
                    {t('danceClassesHub_whichCategory_tableHeader_why')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {tableRows.map(row => (
                  <tr
                    key={row.goal}
                    className="hover:bg-primary-accent/10 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-neutral/90">
                      {t(`danceClassesHub_whichCategory_${row.goal}_goal`)}
                    </td>
                    <td className="px-6 py-4 text-white font-bold">
                      {t(`danceClassesHub_whichCategory_${row.category}_category`)}
                    </td>
                    <td className="px-6 py-4 text-neutral/80 text-sm hidden md:table-cell">
                      {t(`danceClassesHub_whichCategory_${row.why}_why`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimateOnScroll>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <AnimateOnScroll delay={300} className="[perspective:1000px]">
            <div className="h-full min-h-[120px] bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-xl p-6 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.02)_rotateY(5deg)_rotateX(2deg)] hover:border-primary-accent hover:shadow-accent-glow">
              <h3 className="text-xl font-bold text-white mb-3">
                {t('danceClassesHub_whichCategory_beginner_title')}
              </h3>
              <p className="text-neutral/90 text-sm leading-relaxed">
                {t('danceClassesHub_whichCategory_beginner_text')}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={400} className="[perspective:1000px]">
            <div className="h-full min-h-[120px] bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-xl p-6 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.02)_rotateY(5deg)_rotateX(2deg)] hover:border-primary-accent hover:shadow-accent-glow">
              <h3 className="text-xl font-bold text-white mb-3">
                {t('danceClassesHub_whichCategory_combine_title')}
              </h3>
              <p className="text-neutral/90 text-sm leading-relaxed">
                {t('danceClassesHub_whichCategory_combine_text')}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={500} className="[perspective:1000px]">
            <div className="h-full min-h-[120px] bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-xl p-6 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.02)_rotateY(5deg)_rotateX(2deg)] hover:border-primary-accent hover:shadow-accent-glow">
              <h3 className="text-xl font-bold text-white mb-3">
                {t('danceClassesHub_whichCategory_schedule_title')}
              </h3>
              <p className="text-neutral/90 text-sm leading-relaxed">
                {t('danceClassesHub_whichCategory_schedule_text')}
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};

const FeaturedStylesSection: React.FC = () => {
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

  return (
    <section aria-labelledby="featured-title" className="py-12 md:py-16 bg-primary-dark/10">
      <div className="container mx-auto px-6">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto">
            <h2
              id="featured-title"
              className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-center holographic-text"
            >
              {t('danceClassesHub_featured_title')}
            </h2>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <p className="max-w-3xl mx-auto text-lg text-neutral/90 mb-12 text-center">
            {t('danceClassesHub_featured_description')}
          </p>
        </AnimateOnScroll>

        {/* Grid of Featured Styles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_STYLES.map((style, index) => {
            const styleImage = getStyleImage(style.key);
            return (
              <AnimateOnScroll key={style.key} delay={index * 50} className="[perspective:1000px]">
                <Link
                  to={`/${locale}${style.url}`}
                  className="group block relative h-full rounded-xl overflow-hidden shadow-lg bg-black text-white transition-all duration-500 ease-in-out [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.02)_rotateY(5deg)_rotateX(2deg)] hover:shadow-accent-glow border border-white/10 hover:border-primary-accent flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <OptimizedImage
                      src={styleImage.basePath}
                      altKey={getContextualAltKey(style.key, 'hub')}
                      altFallback={styleImage.fallbackAlt}
                      aspectRatio="4/3"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3 ? 'high' : 'low'}
                      breakpoints={styleImage.breakpoints}
                      formats={styleImage.formats}
                      objectPosition={styleImage.objectPosition}
                      className="w-full h-full transition-all duration-500 ease-in-out group-hover:scale-110 opacity-60 group-hover:opacity-80"
                      placeholder="color"
                      placeholderColor="#111"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                  </div>

                  {/* Text Content */}
                  <div className="p-6 space-y-3 flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary-accent transition-colors duration-300">
                      {t(`danceClassesHub_style_${style.key}`)}
                    </h3>

                    {/* SEO Description */}
                    <p className="text-neutral/90 text-sm leading-relaxed flex-grow">
                      {t(`danceClassesHub_style_${style.key}_desc`)}
                    </p>

                    {/* CTA Link */}
                    <div className="pt-2 text-primary-accent font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform duration-300">
                      {t('danzaBarcelona_viewMore')}
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DanceClassesPage: React.FC = () => {
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

  // FAQ data
  const classesFaqs = [
    { id: 'cl-1', question: t('classesFaqQ1'), answer: t('classesFaqA1') },
    { id: 'cl-2', question: t('classesFaqQ2'), answer: t('classesFaqA2') },
    { id: 'cl-3', question: t('classesFaqQ3'), answer: t('classesFaqA3') },
    { id: 'cl-4', question: t('classesFaqQ4'), answer: t('classesFaqA4') },
    { id: 'cl-5', question: t('classesFaqQ5'), answer: t('classesFaqA5') },
    { id: 'cl-6', question: t('classesFaqQ6'), answer: t('classesFaqA6') },
    { id: 'cl-7', question: t('classesFaqQ7'), answer: t('classesFaqA7') },
    { id: 'cl-8', question: t('classesFaqQ8'), answer: t('classesFaqA8') },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { name: t('danceClassesHub_breadcrumb_home'), url: `/${locale}` },
    {
      name: t('danceClassesHub_breadcrumb_current'),
      url: `/${locale}/clases/baile-barcelona`,
      isActive: true,
    },
  ];

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('schema_danceClasses_itemListName'),
    itemListElement: HUB_CATEGORIES.map((cat, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: t(cat.titleKey),
      url: `${baseUrl}/${locale}${cat.pillarUrl}`,
    })),
  };

  // FAQPage Schema removed — generated at build-time by prerender.mjs

  // WebPage schema with primary image + speakable (GEO/AIEO/Voice Search optimized)
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/${locale}/clases/baile-barcelona#webpage`,
    url: `${baseUrl}/${locale}/clases/baile-barcelona`,
    name: t('danceClassesHub_h1'),
    description: t('danceClassesHub_intro'),
    inLanguage:
      locale === 'ca' ? 'ca-ES' : locale === 'en' ? 'en-GB' : locale === 'fr' ? 'fr-FR' : 'es-ES',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: "Farray's International Dance Center",
      url: baseUrl,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      '@id': `${baseUrl}/images/og-clases-baile-barcelona.jpg#primaryimage`,
      url: `${baseUrl}/images/og-clases-baile-barcelona.jpg`,
      contentUrl: `${baseUrl}/images/og-clases-baile-barcelona.jpg`,
      width: 1200,
      height: 630,
      caption: t('alt_hero_clases_baile_barcelona'),
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#hero-title', '#category-hero p', '#categories-title', '#why-title'],
    },
    // BreadcrumbList generated as standalone schema at build-time by prerender.mjs
  };

  // Schemas component
  const schemas = (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      {/* BreadcrumbList + FAQPage generated at build-time by prerender.mjs */}
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
    </Helmet>
  );

  return (
    <CategoryPageTemplate
      // Hero
      heroGradient="from-primary-dark/30"
      heroTitleKey="danceClassesHub_h1"
      heroSubtitleKey="danceClassesHub_h1_sub"
      heroIntroKey="danceClassesHub_intro"
      heroImage={{
        basePath: '/images/categories/hero/clases-baile-barcelona-hero',
        altKey: 'alt_hero_clases_baile_barcelona',
        altFallback:
          "Clases de baile Barcelona - Bailarinas profesionales ejecutando coreografía elegante con atuendos dorados e iluminación escénica dramática verde en Farray's Center",
        objectPosition: 'center 35%',
        opacity: 100,
        overlayOpacity: 85,
      }}
      // Data - using categories instead of styles
      categories={categories}
      categoryImages={CATEGORY_IMAGES}
      categoryObjectPositions={CATEGORY_OBJECT_POSITIONS}
      valuePillars={valuePillars}
      faqs={classesFaqs}
      // No relatedClasses for hub page
      // SEO
      pageTitle={`${t('danceClassesHub_h1')} | Farray's Center`}
      breadcrumbItems={breadcrumbItems}
      schemas={schemas}
      faqTitle={t('danceClassesHub_faq_title')}
      // Sections config
      stylesSectionTitleKey="danceClassesHub_categories_title"
      stylesDescriptionKey="danceClassesHub_categories_description"
      gridColumns={2}
      // Reviews
      reviewsCategory="general"
      reviewsLimit={6}
      // CTA
      ctaTitleKey="danceClassesHub_finalCTA_title"
      ctaSubtitleKey="danceClassesHub_finalCTA_subtitle"
      ctaDescriptionKey="danceClassesHub_finalCTA_description"
      // Slots
      whatIsSection={<WhatToExpectSection />}
      whichStyleSection={<WhichCategorySection />}
      featuredStylesSection={<FeaturedStylesSection />}
    />
  );
};

export default DanceClassesPage;
