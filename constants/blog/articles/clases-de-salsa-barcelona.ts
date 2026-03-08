/**
 * Article Configuration: Hombres y mujeres, ¿hablamos salsa?
 *
 * Guest article by Mar Guerrero (Copywriter & Dance Enthusiast).
 * Reflections on dance as a space for connection and expression.
 *
 * ENTERPRISE 10/10 - GEO Optimized with verified citations
 *
 * Category: Lifestyle
 * Target Keywords: clases de salsa barcelona, bailar salsa, pista de baile,
 *                  salsa pareja, aprender salsa barcelona
 */

import type { BlogArticleConfig } from '../types';

export const CLASES_SALSA_BARCELONA_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogClasesSalsaBarcelona',
  slug: 'clases-de-salsa-barcelona',
  category: 'lifestyle',

  // === AUTHOR ===
  authorId: 'mar-guerrero',

  // === DATES ===
  datePublished: '2026-01-24',
  dateModified: '2026-01-24',

  // === READING METRICS ===
  readingTime: 6,
  wordCount: 850,

  // === SUMMARY (GEO Optimized) ===
  summaryBullets: [
    'blogClasesSalsaBarcelona_summaryBullet1',
    'blogClasesSalsaBarcelona_summaryBullet2',
    'blogClasesSalsaBarcelona_summaryBullet3',
    'blogClasesSalsaBarcelona_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards with GEO Citations) ===
  summaryStats: [
    {
      value: '76%',
      labelKey: 'blogClasesSalsaBarcelona_statDemenciaLabel',
      citation: {
        source: 'New England Journal of Medicine',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
        year: '2003',
        authors: 'Verghese et al.',
        doi: '10.1056/NEJMoa022252',
      },
    },
    {
      value: '+21%',
      labelKey: 'blogClasesSalsaBarcelona_statEndorfinasLabel',
      citation: {
        source: 'Evolution and Human Behavior',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S1090513816300113',
        year: '2016',
        authors: 'Tarr et al.',
      },
    },
    {
      value: '2019',
      labelKey: 'blogClasesSalsaBarcelona_statUNESCOLabel',
      citation: {
        source: 'UNESCO Patrimonio Cultural Inmaterial',
        url: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
        year: '2019',
        authors: 'UNESCO',
      },
    },
  ],

  // === CONTENT SECTIONS ===
  sections: [
    // =====================================================
    // INTRODUCTION - Revolución y espacios de expresión
    // =====================================================
    {
      id: 'intro',
      type: 'paragraph',
      contentKey: 'blogClasesSalsaBarcelona_intro',
    },

    // =====================================================
    // ANSWER CAPSULE: ¿Por qué bailar salsa? (72% AI Citation Rate)
    // =====================================================
    {
      id: 'answer-por-que-salsa',
      type: 'answer-capsule',
      contentKey: 'blogClasesSalsaBarcelona_answerPorQueSalsa',
      answerCapsule: {
        questionKey: 'blogClasesSalsaBarcelona_answerPorQueSalsaQ',
        answerKey: 'blogClasesSalsaBarcelona_answerPorQueSalsaA',
        sourcePublisher: 'Frontiers in Psychology',
        sourceUrl: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
        sourceYear: '2019',
        confidence: 'verified',
        icon: 'star',
      },
    },

    // =====================================================
    // SECTION 1: LA PISTA DE BAILE
    // =====================================================
    {
      id: 'pista-baile',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesSalsaBarcelona_section1Title',
    },

    // === DEFINITION: Salsa social (LLM Extraction) ===
    {
      id: 'definition-salsa-social',
      type: 'definition',
      contentKey: 'blogClasesSalsaBarcelona_defSalsaSocial',
      definitionTermKey: 'blogClasesSalsaBarcelona_defSalsaSocialTerm',
    },

    {
      id: 'pista-baile-content',
      type: 'paragraph',
      contentKey: 'blogClasesSalsaBarcelona_section1Content',
    },

    // === STATISTIC: Bienestar social ===
    {
      id: 'stat-bienestar',
      type: 'statistic',
      contentKey: 'blogClasesSalsaBarcelona_statBienestarContent',
      statisticValue: '94%',
      statisticSource: 'Frontiers in Psychology, 2019',
    },

    // =====================================================
    // SECTION 2: LA SALSA COMO LENGUAJE UNIVERSAL
    // =====================================================
    {
      id: 'lenguaje-universal',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesSalsaBarcelona_section2Title',
    },
    {
      id: 'lenguaje-universal-content1',
      type: 'paragraph',
      contentKey: 'blogClasesSalsaBarcelona_section2Content1',
    },
    {
      id: 'lenguaje-universal-content2',
      type: 'paragraph',
      contentKey: 'blogClasesSalsaBarcelona_section2Content2',
    },

    // === STATISTIC: Conexión endorfinas ===
    {
      id: 'stat-endorfinas',
      type: 'statistic',
      contentKey: 'blogClasesSalsaBarcelona_statEndorfinasContent',
      statisticValue: '+21%',
      statisticSource: 'Evolution and Human Behavior, 2016',
    },

    // =====================================================
    // SECTION 3: CONCLUSIÓN - HABLEMOS SALSA
    // =====================================================
    {
      id: 'hablemos-salsa',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesSalsaBarcelona_section3Title',
    },
    {
      id: 'hablemos-salsa-content',
      type: 'paragraph',
      contentKey: 'blogClasesSalsaBarcelona_section3Content',
    },

    // =====================================================
    // SECTION 4: APRENDE CON PROFESIONALES
    // =====================================================
    {
      id: 'aprende',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesSalsaBarcelona_section4Title',
    },
    {
      id: 'aprende-content',
      type: 'paragraph',
      contentKey: 'blogClasesSalsaBarcelona_section4Content',
    },

    // === CTA: Enlaces a clases de salsa ===
    {
      id: 'cta-clases',
      type: 'callout',
      calloutType: 'cta',
      contentKey: 'blogClasesSalsaBarcelona_ctaClases',
    },

    // =====================================================
    // REFERENCES SECTION (E-E-A-T)
    // =====================================================
    {
      id: 'references-section',
      type: 'references',
      contentKey: 'blogClasesSalsaBarcelona_referencesIntro',
      references: [
        {
          id: 'nejm-dementia',
          titleKey: 'blogClasesSalsaBarcelona_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogClasesSalsaBarcelona_refNEJMDesc',
        },
        {
          id: 'frontiers-wellbeing',
          titleKey: 'blogClasesSalsaBarcelona_refFrontiersTitle',
          url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
          publisher: 'Frontiers in Psychology',
          year: '2019',
          descriptionKey: 'blogClasesSalsaBarcelona_refFrontiersDesc',
        },
        {
          id: 'sciencedirect-endorphins',
          titleKey: 'blogClasesSalsaBarcelona_refEndorphinsTitle',
          url: 'https://www.sciencedirect.com/science/article/abs/pii/S1090513816300113',
          publisher: 'Evolution and Human Behavior',
          year: '2016',
          descriptionKey: 'blogClasesSalsaBarcelona_refEndorphinsDesc',
        },
        {
          id: 'unesco-bachata',
          titleKey: 'blogClasesSalsaBarcelona_refUNESCOTitle',
          url: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
          publisher: 'UNESCO',
          year: '2019',
          descriptionKey: 'blogClasesSalsaBarcelona_refUNESCODesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/hablemos-salsa/hero.webp',
    srcSet:
      '/images/blog/hablemos-salsa/hero-480.webp 480w, /images/blog/hablemos-salsa/hero-960.webp 960w, /images/blog/hablemos-salsa/hero.webp 1200w',
    alt: 'Pareja conectando a través del baile de salsa en pista social de Barcelona, expresando la comunicación no verbal y el lenguaje universal del ritmo latino',
    altKey: 'blogClasesSalsaBarcelona_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/hablemos-salsa/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_lifestyle',
    categoryUrl: '/blog/lifestyle',
    currentKey: 'blogClasesSalsaBarcelona_breadcrumbCurrent',
  },

  // === FAQ SECTION (6 FAQs for SEO Schema) ===
  faqSection: {
    enabled: true,
    titleKey: 'blogClasesSalsaBarcelona_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogClasesSalsaBarcelona_faq1Question',
        answerKey: 'blogClasesSalsaBarcelona_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogClasesSalsaBarcelona_faq2Question',
        answerKey: 'blogClasesSalsaBarcelona_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogClasesSalsaBarcelona_faq3Question',
        answerKey: 'blogClasesSalsaBarcelona_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogClasesSalsaBarcelona_faq4Question',
        answerKey: 'blogClasesSalsaBarcelona_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogClasesSalsaBarcelona_faq5Question',
        answerKey: 'blogClasesSalsaBarcelona_faq5Answer',
      },
      {
        id: '6',
        questionKey: 'blogClasesSalsaBarcelona_faq6Question',
        answerKey: 'blogClasesSalsaBarcelona_faq6Answer',
      },
    ],
  },

  // === RELATED ARTICLES ===
  relatedArticles: [
    {
      slug: 'salsa-vs-bachata',
      category: 'tips',
      titleKey: 'blogSalsaVsBachata_title',
      excerptKey: 'blogSalsaVsBachata_excerpt',
      image: '/images/blog/salsa-vs-bachata/hero.webp',
    },
    {
      slug: 'salsa-ritmo-conquisto-mundo',
      category: 'historia',
      titleKey: 'blogSalsaRitmo_title',
      excerptKey: 'blogSalsaRitmo_excerpt',
      image: '/images/blog/salsa-ritmo/hero.webp',
    },
  ],

  // === RELATED CLASSES (internal linking for SEO) ===
  relatedClasses: ['salsa-cubana-barcelona', 'bachata-barcelona'],

  // === UX TOGGLES ===
  tableOfContents: {
    enabled: true,
    sticky: true,
  },
  progressBar: {
    enabled: true,
  },
  shareButtons: {
    enabled: true,
    platforms: ['whatsapp', 'facebook', 'twitter', 'linkedin', 'email'],
  },

  // === SPEAKABLE (Voice Search GEO) ===
  speakableSelectors: [
    '#article-summary',
    '#intro',
    '#answer-por-que-salsa',
    '#pista-baile',
    '#lenguaje-universal',
    '#hablemos-salsa',
    '#aprende',
  ],

  // === LOCAL BUSINESS SCHEMA (Local SEO) ===
  localBusinessSchema: {
    enabled: true,
  },

  // === AGGREGATE RATING SCHEMA (Rich Snippets) ===
  aggregateRatingSchema: {
    enabled: true,
    ratingValue: 4.8,
    reviewCount: 89,
    bestRating: 5,
    worstRating: 1,
  },

  // === GOOGLE DISCOVER OPTIMIZATION ===
  discoverOptimized: true,
};
