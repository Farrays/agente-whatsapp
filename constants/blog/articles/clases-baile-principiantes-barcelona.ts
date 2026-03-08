/**
 * Article Configuration: Clases de baile para principiantes en Barcelona
 *
 * SEO/GEO optimized guide for beginners in Barcelona.
 * Target: clases de baile para principiantes en Barcelona
 *
 * ENTERPRISE 10/10 - GEO Optimized with verified citations
 *
 * Category: Tips
 * Target Keywords: clases de baile para principiantes barcelona, academia de baile barcelona,
 *                  escuela de baile eixample, clase de baile gratis barcelona,
 *                  empezar a bailar desde cero, clases sin pareja
 */

import type { BlogArticleConfig } from '../types';

export const CLASES_PRINCIPIANTES_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogClasesPrincipiantes',
  slug: 'clases-baile-principiantes-barcelona-farrays',
  category: 'tips',

  // === DATES ===
  datePublished: '2026-01-24',
  dateModified: '2026-01-24',

  // === READING METRICS ===
  readingTime: 10,
  wordCount: 1500,

  // === SUMMARY (GEO Optimized) ===
  summaryBullets: [
    'blogClasesPrincipiantes_summaryBullet1',
    'blogClasesPrincipiantes_summaryBullet2',
    'blogClasesPrincipiantes_summaryBullet3',
    'blogClasesPrincipiantes_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards with GEO Citations) ===
  summaryStats: [
    {
      value: '76%',
      labelKey: 'blogClasesPrincipiantes_statDemenciaLabel',
      citation: {
        source: 'New England Journal of Medicine',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
        year: '2003',
        authors: 'Verghese et al.',
        doi: '10.1056/NEJMoa022252',
      },
    },
    {
      value: '300-500',
      labelKey: 'blogClasesPrincipiantes_statCaloriasLabel',
      citation: {
        source: 'Harvard Health Publishing',
        url: 'https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-for-people-of-three-different-weights',
        year: '2021',
        authors: 'Harvard Medical School',
      },
    },
    {
      value: '94%',
      labelKey: 'blogClasesPrincipiantes_statBienestarLabel',
      citation: {
        source: 'Frontiers in Psychology',
        url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
        year: '2019',
        authors: 'Koch et al.',
      },
    },
  ],

  // === CONTENT SECTIONS ===
  sections: [
    // =====================================================
    // INTRODUCTION
    // =====================================================
    {
      id: 'intro',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_intro',
    },

    // =====================================================
    // ANSWER CAPSULE: ¿Por dónde empezar? (72% AI Citation Rate)
    // =====================================================
    {
      id: 'answer-empezar',
      type: 'answer-capsule',
      contentKey: 'blogClasesPrincipiantes_answerEmpezar',
      answerCapsule: {
        questionKey: 'blogClasesPrincipiantes_answerEmpezarQ',
        answerKey: 'blogClasesPrincipiantes_answerEmpezarA',
        sourcePublisher: "Farray's Dance Center",
        confidence: 'verified',
        icon: 'star',
      },
    },

    // === CTA Principal ===
    {
      id: 'cta-hero',
      type: 'callout',
      calloutType: 'cta',
      contentKey: 'blogClasesPrincipiantes_ctaHero',
    },

    // =====================================================
    // SECTION 1: Lo primero que quiero que sepas
    // =====================================================
    {
      id: 'sin-presion',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section1Title',
    },
    {
      id: 'sin-presion-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section1Content',
    },
    {
      id: 'sin-presion-list',
      type: 'list',
      contentKey: 'blogClasesPrincipiantes_section1ListTitle',
      listItems: [
        'blogClasesPrincipiantes_list1Item1',
        'blogClasesPrincipiantes_list1Item2',
        'blogClasesPrincipiantes_list1Item3',
        'blogClasesPrincipiantes_list1Item4',
      ],
    },
    {
      id: 'sin-presion-conclusion',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section1Conclusion',
    },

    // === DEFINITION: Clase de baile para principiantes (LLM Extraction) ===
    {
      id: 'definition-clase-principiantes',
      type: 'definition',
      contentKey: 'blogClasesPrincipiantes_defClasePrincipiantes',
      definitionTermKey: 'blogClasesPrincipiantes_defClasePrincipiantesTerm',
    },

    // === STATISTIC: Beneficios cognitivos ===
    {
      id: 'stat-cognitivo',
      type: 'statistic',
      contentKey: 'blogClasesPrincipiantes_statCognitivoContent',
      statisticValue: '76%',
      statisticSource: 'New England Journal of Medicine, 2003',
    },

    // =====================================================
    // SECTION 2: Cómo es tu primera clase
    // =====================================================
    {
      id: 'primera-clase',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section2Title',
    },
    {
      id: 'primera-clase-intro',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section2Intro',
    },
    {
      id: 'primera-clase-pasos',
      type: 'list',
      contentKey: 'blogClasesPrincipiantes_section2ListTitle',
      listItems: [
        'blogClasesPrincipiantes_paso1',
        'blogClasesPrincipiantes_paso2',
        'blogClasesPrincipiantes_paso3',
      ],
    },

    // === Qué traer ===
    {
      id: 'que-traer',
      type: 'heading',
      level: 3,
      contentKey: 'blogClasesPrincipiantes_queTraerTitle',
    },
    {
      id: 'que-traer-list',
      type: 'list',
      contentKey: 'blogClasesPrincipiantes_queTraerListTitle',
      listItems: [
        'blogClasesPrincipiantes_traer1',
        'blogClasesPrincipiantes_traer2',
        'blogClasesPrincipiantes_traer3',
        'blogClasesPrincipiantes_traer4',
      ],
    },

    // =====================================================
    // SECTION 3: ¿Necesito venir con pareja?
    // =====================================================
    {
      id: 'sin-pareja',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section3Title',
    },
    {
      id: 'sin-pareja-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section3Content',
    },

    // =====================================================
    // SECTION 4: Qué estilo elegir
    // =====================================================
    {
      id: 'elegir-estilo',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section4Title',
    },
    {
      id: 'elegir-estilo-intro',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section4Intro',
    },
    {
      id: 'elegir-estilo-list',
      type: 'list',
      contentKey: 'blogClasesPrincipiantes_section4ListTitle',
      listItems: [
        'blogClasesPrincipiantes_estilo1',
        'blogClasesPrincipiantes_estilo2',
        'blogClasesPrincipiantes_estilo3',
      ],
    },
    {
      id: 'elegir-estilo-cta',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section4Cta',
    },

    // =====================================================
    // SECTION 5: La regla que hace que mejores
    // =====================================================
    {
      id: 'memoria-muscular',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section5Title',
    },
    {
      id: 'memoria-muscular-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section5Content',
    },
    {
      id: 'memoria-muscular-tip',
      type: 'callout',
      calloutType: 'cta',
      contentKey: 'blogClasesPrincipiantes_section5Tip',
    },

    // =====================================================
    // SECTION 6: No te compares con nadie
    // =====================================================
    {
      id: 'no-comparar',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section6Title',
    },
    {
      id: 'no-comparar-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section6Content',
    },
    {
      id: 'no-comparar-list',
      type: 'list',
      contentKey: 'blogClasesPrincipiantes_section6ListTitle',
      listItems: [
        'blogClasesPrincipiantes_comparar1',
        'blogClasesPrincipiantes_comparar2',
        'blogClasesPrincipiantes_comparar3',
      ],
    },
    {
      id: 'no-comparar-conclusion',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section6Conclusion',
    },

    // =====================================================
    // SECTION 7: Si te atascas, pregunta
    // =====================================================
    {
      id: 'preguntar',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section7Title',
    },
    {
      id: 'preguntar-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section7Content',
    },
    {
      id: 'preguntar-list',
      type: 'list',
      contentKey: 'blogClasesPrincipiantes_section7ListTitle',
      listItems: ['blogClasesPrincipiantes_pregunta1', 'blogClasesPrincipiantes_pregunta2'],
    },
    {
      id: 'preguntar-privadas',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section7Privadas',
    },

    // =====================================================
    // SECTION 8: CTA Final
    // =====================================================
    {
      id: 'cta-final',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section8Title',
    },
    {
      id: 'cta-final-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section8Content',
    },
    {
      id: 'cta-reserva',
      type: 'callout',
      calloutType: 'cta',
      contentKey: 'blogClasesPrincipiantes_ctaReserva',
    },

    // =====================================================
    // SECTION 9: Dónde estamos
    // =====================================================
    {
      id: 'ubicacion',
      type: 'heading',
      level: 2,
      contentKey: 'blogClasesPrincipiantes_section9Title',
    },
    {
      id: 'ubicacion-content',
      type: 'paragraph',
      contentKey: 'blogClasesPrincipiantes_section9Content',
    },

    // =====================================================
    // REFERENCES SECTION (E-E-A-T)
    // =====================================================
    {
      id: 'references-section',
      type: 'references',
      contentKey: 'blogClasesPrincipiantes_referencesIntro',
      references: [
        {
          id: 'nejm-dementia',
          titleKey: 'blogClasesPrincipiantes_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogClasesPrincipiantes_refNEJMDesc',
        },
        {
          id: 'harvard-calories',
          titleKey: 'blogClasesPrincipiantes_refHarvardTitle',
          url: 'https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-for-people-of-three-different-weights',
          publisher: 'Harvard Health Publishing',
          year: '2021',
          descriptionKey: 'blogClasesPrincipiantes_refHarvardDesc',
        },
        {
          id: 'frontiers-wellbeing',
          titleKey: 'blogClasesPrincipiantes_refFrontiersTitle',
          url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
          publisher: 'Frontiers in Psychology',
          year: '2019',
          descriptionKey: 'blogClasesPrincipiantes_refFrontiersDesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/clases-principiantes/hero.webp',
    srcSet:
      '/images/blog/clases-principiantes/hero-480.webp 480w, /images/blog/clases-principiantes/hero-960.webp 960w, /images/blog/clases-principiantes/hero.webp 1200w',
    alt: 'Grupo de alumnos principiantes aprendiendo sus primeros pasos de salsa y bachata en clase grupal de Barcelona, ambiente acogedor y profesores atentos',
    altKey: 'blogClasesPrincipiantes_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/clases-principiantes/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_tips',
    categoryUrl: '/blog/tips',
    currentKey: 'blogClasesPrincipiantes_breadcrumbCurrent',
  },

  // === FAQ SECTION (SEO Optimized) ===
  faqSection: {
    enabled: true,
    titleKey: 'blogClasesPrincipiantes_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogClasesPrincipiantes_faq1Question',
        answerKey: 'blogClasesPrincipiantes_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogClasesPrincipiantes_faq2Question',
        answerKey: 'blogClasesPrincipiantes_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogClasesPrincipiantes_faq3Question',
        answerKey: 'blogClasesPrincipiantes_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogClasesPrincipiantes_faq4Question',
        answerKey: 'blogClasesPrincipiantes_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogClasesPrincipiantes_faq5Question',
        answerKey: 'blogClasesPrincipiantes_faq5Answer',
      },
    ],
  },

  // === RELATED ARTICLES ===
  relatedArticles: [
    {
      slug: 'como-perder-miedo-bailar',
      category: 'lifestyle',
      titleKey: 'blogPerderMiedoBailar_title',
      excerptKey: 'blogPerderMiedoBailar_excerpt',
      image: '/images/blog/como-perder-miedo/hero.webp',
    },
    {
      slug: 'salsa-vs-bachata',
      category: 'tips',
      titleKey: 'blogSalsaVsBachata_title',
      excerptKey: 'blogSalsaVsBachata_excerpt',
      image: '/images/blog/salsa-vs-bachata/hero.webp',
    },
  ],

  // === RELATED CLASSES (internal linking for SEO) ===
  relatedClasses: [
    'salsa-cubana-barcelona',
    'bachata-barcelona',
    'dancehall-barcelona',
    'clases-particulares-baile',
  ],

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
    '#answer-empezar',
    '#sin-presion',
    '#primera-clase',
    '#elegir-estilo',
    '#memoria-muscular',
    '#ubicacion',
  ],

  // === LOCAL BUSINESS SCHEMA (Local SEO) ===
  localBusinessSchema: {
    enabled: true,
  },

  // === AGGREGATE RATING SCHEMA (Rich Snippets) ===
  aggregateRatingSchema: {
    enabled: true,
    ratingValue: 4.9,
    reviewCount: 156,
    bestRating: 5,
    worstRating: 1,
  },

  // === GOOGLE DISCOVER OPTIMIZATION ===
  discoverOptimized: true,
};
