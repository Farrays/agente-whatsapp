/**
 * Article Configuration: Salsa - El Ritmo que Conquistó el Mundo
 *
 * Premium SEO-optimized article with GEO citability, internal links,
 * and comprehensive educational content about salsa dance styles.
 *
 * Category: Historia
 * Target Keywords: salsa baile, estilos salsa, rueda casino, salsa cubana,
 *                  salsa barcelona, aprender salsa, clases salsa
 */

import type { BlogArticleConfig } from '../types';

export const SALSA_RITMO_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogSalsaRitmo',
  slug: 'salsa-ritmo-conquisto-mundo',
  category: 'historia',

  // === DATES ===
  datePublished: '2026-01-16',
  dateModified: '2026-01-16',

  // === READING METRICS ===
  readingTime: 10,
  wordCount: 2400,

  // === SUMMARY (GEO Optimized) ===
  summaryBullets: [
    'blogSalsaRitmo_summaryBullet1',
    'blogSalsaRitmo_summaryBullet2',
    'blogSalsaRitmo_summaryBullet3',
    'blogSalsaRitmo_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards with GEO Citations) ===
  summaryStats: [
    {
      value: '1960s',
      labelKey: 'blogSalsaRitmo_statNYCLabel',
      citation: {
        source: 'Universidad Interamericana de Puerto Rico',
        url: 'https://www.arecibo.inter.edu/wp-content/uploads/biblioteca/pdf/salsa.pdf',
        year: '2020',
        authors: 'Departamento de Música',
      },
    },
    {
      value: '4+',
      labelKey: 'blogSalsaRitmo_statEstilosLabel',
      citation: {
        source: 'Mucho Más Que Baile',
        url: 'https://www.muchomasquebaile.es/wp-content/uploads/2021/11/Historia-de-la-salsa-desde-las-raices-hasta-el-1975.pdf',
        year: '2023',
        authors: 'Ramos Gandía',
      },
    },
    {
      value: '76%',
      labelKey: 'blogSalsaRitmo_statDemenciaLabel',
      citation: {
        source: 'New England Journal of Medicine',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
        year: '2003',
        authors: 'Verghese et al.',
        doi: '10.1056/NEJMoa022252',
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
      contentKey: 'blogSalsaRitmo_intro',
    },
    {
      id: 'intro-2',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_intro2',
    },

    // =====================================================
    // ANSWER CAPSULE: ¿Dónde nació la salsa? (72% AI Citation Rate)
    // =====================================================
    {
      id: 'answer-origen',
      type: 'answer-capsule',
      contentKey: 'blogSalsaRitmo_answerOrigen',
      answerCapsule: {
        questionKey: 'blogSalsaRitmo_answerOrigenQ',
        answerKey: 'blogSalsaRitmo_answerOrigenA',
        sourceUrl: 'https://www.arecibo.inter.edu/wp-content/uploads/biblioteca/pdf/salsa.pdf',
        sourcePublisher: 'Universidad Interamericana de Puerto Rico',
        sourceYear: '2020',
        confidence: 'verified',
        icon: 'check',
      },
    },

    // === DEFINITION: Salsa (LLM Extraction) ===
    {
      id: 'definition-salsa',
      type: 'definition',
      contentKey: 'blogSalsaRitmo_defSalsa',
      definitionTermKey: 'blogSalsaRitmo_defSalsaTerm',
    },

    // =====================================================
    // SECTION 1: ORÍGENES
    // =====================================================
    {
      id: 'origenes',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_origenesTitle',
    },
    {
      id: 'origenes-content1',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_origenesContent1',
    },
    {
      id: 'origenes-content2',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_origenesContent2',
    },

    // =====================================================
    // SECTION 2: ESTILOS
    // =====================================================
    {
      id: 'estilos',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_estilosTitle',
    },
    {
      id: 'estilos-intro',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_estilosIntro',
    },
    {
      id: 'estilos-lista',
      type: 'list',
      contentKey: 'blogSalsaRitmo_estilosListaTitle',
      listItems: [
        'blogSalsaRitmo_estiloCubana',
        'blogSalsaRitmo_estiloLinea',
        'blogSalsaRitmo_estiloCaleña',
        'blogSalsaRitmo_estiloPuertorriqueña',
      ],
    },
    {
      id: 'estilos-cierre',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_estilosCierre',
    },

    // =====================================================
    // SECTION 3: RUEDA DE CASINO
    // =====================================================
    {
      id: 'rueda',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_ruedaTitle',
    },
    {
      id: 'rueda-content1',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_ruedaContent1',
    },
    {
      id: 'rueda-content2',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_ruedaContent2',
    },

    // =====================================================
    // SECTION 4: PROYECCIÓN Y ALMA
    // =====================================================
    {
      id: 'proyeccion',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_proyeccionTitle',
    },
    {
      id: 'proyeccion-content1',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_proyeccionContent1',
    },
    {
      id: 'proyeccion-content2',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_proyeccionContent2',
    },

    // =====================================================
    // SECTION 5: VESTUARIO
    // =====================================================
    {
      id: 'vestuario',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_vestuarioTitle',
    },
    {
      id: 'vestuario-content',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_vestuarioContent',
    },
    {
      id: 'vestuario-lista',
      type: 'list',
      contentKey: 'blogSalsaRitmo_vestuarioListaTitle',
      listItems: ['blogSalsaRitmo_vestuarioMujeres', 'blogSalsaRitmo_vestuarioHombres'],
    },
    {
      id: 'vestuario-cierre',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_vestuarioCierre',
    },

    // =====================================================
    // SECTION 6: BENEFICIOS - POR QUÉ APRENDER
    // =====================================================
    {
      id: 'beneficios',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_beneficiosTitle',
    },
    {
      id: 'beneficios-intro',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_beneficiosIntro',
    },
    {
      id: 'beneficios-lista',
      type: 'list',
      contentKey: 'blogSalsaRitmo_beneficiosListaTitle',
      listItems: [
        'blogSalsaRitmo_beneficioSalud',
        'blogSalsaRitmo_beneficioCultura',
        'blogSalsaRitmo_beneficioComunidad',
        'blogSalsaRitmo_beneficioConfianza',
      ],
    },
    {
      id: 'beneficios-farrays',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_beneficiosFarrays',
    },

    // =====================================================
    // SECTION 7: CONCLUSIÓN
    // =====================================================
    {
      id: 'conclusion',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaRitmo_conclusionTitle',
    },
    {
      id: 'conclusion-content',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_conclusionContent',
    },
    {
      id: 'conclusion-cta',
      type: 'paragraph',
      contentKey: 'blogSalsaRitmo_conclusionCTA',
    },

    // =====================================================
    // REFERENCES SECTION (E-E-A-T)
    // =====================================================
    {
      id: 'references-section',
      type: 'references',
      contentKey: 'blogSalsaRitmo_referencesIntro',
      references: [
        {
          id: 'ramos-gandia',
          titleKey: 'blogSalsaRitmo_refRamosTitle',
          url: 'https://www.muchomasquebaile.es/wp-content/uploads/2021/11/Historia-de-la-salsa-desde-las-raices-hasta-el-1975.pdf',
          publisher: 'Mucho Más Que Baile',
          year: '2023',
          descriptionKey: 'blogSalsaRitmo_refRamosDesc',
        },
        {
          id: 'arecibo-inter',
          titleKey: 'blogSalsaRitmo_refAreciboTitle',
          url: 'https://www.arecibo.inter.edu/wp-content/uploads/biblioteca/pdf/salsa.pdf',
          publisher: 'Universidad Interamericana de Puerto Rico',
          year: '2020',
          descriptionKey: 'blogSalsaRitmo_refAreciboDesc',
        },
        {
          id: 'nejm-dementia',
          titleKey: 'blogSalsaRitmo_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogSalsaRitmo_refNEJMDesc',
        },
        {
          id: 'frontiers-wellbeing',
          titleKey: 'blogSalsaRitmo_refFrontiersTitle',
          url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
          publisher: 'Frontiers in Psychology',
          year: '2019',
          descriptionKey: 'blogSalsaRitmo_refFrontiersDesc',
        },
        {
          id: 'sciencedirect-endorphins',
          titleKey: 'blogSalsaRitmo_refScienceDirectTitle',
          url: 'https://www.sciencedirect.com/science/article/abs/pii/S1090513816300113',
          publisher: 'Evolution and Human Behavior',
          year: '2016',
          descriptionKey: 'blogSalsaRitmo_refScienceDirectDesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/salsa-ritmo/hero.webp',
    srcSet:
      '/images/blog/salsa-ritmo/hero-480.webp 480w, /images/blog/salsa-ritmo/hero-960.webp 960w, /images/blog/salsa-ritmo/hero.webp 1200w',
    alt: 'Bailarines bailando salsa cubana en Barcelona, representando este estilo latino que conquistó el mundo desde Nueva York, Cali y Puerto Rico',
    altKey: 'blogSalsaRitmo_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/salsa-ritmo/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_historia',
    categoryUrl: '/blog/historia',
    currentKey: 'blogSalsaRitmo_breadcrumbCurrent',
  },

  // === FAQ SECTION (SEO Optimized) ===
  faqSection: {
    enabled: true,
    titleKey: 'blogSalsaRitmo_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogSalsaRitmo_faq1Question',
        answerKey: 'blogSalsaRitmo_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogSalsaRitmo_faq2Question',
        answerKey: 'blogSalsaRitmo_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogSalsaRitmo_faq3Question',
        answerKey: 'blogSalsaRitmo_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogSalsaRitmo_faq4Question',
        answerKey: 'blogSalsaRitmo_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogSalsaRitmo_faq5Question',
        answerKey: 'blogSalsaRitmo_faq5Answer',
      },
      {
        id: '6',
        questionKey: 'blogSalsaRitmo_faq6Question',
        answerKey: 'blogSalsaRitmo_faq6Answer',
      },
      {
        id: '7',
        questionKey: 'blogSalsaRitmo_faq7Question',
        answerKey: 'blogSalsaRitmo_faq7Answer',
      },
      {
        id: '8',
        questionKey: 'blogSalsaRitmo_faq8Question',
        answerKey: 'blogSalsaRitmo_faq8Answer',
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
      slug: 'beneficios-bailar-salsa',
      category: 'lifestyle',
      titleKey: 'blogBeneficiosSalsa_title',
      excerptKey: 'blogBeneficiosSalsa_excerpt',
      image: '/images/blog/beneficios-salsa/hero.webp',
    },
  ],

  // === RELATED CLASSES (internal linking for SEO) ===
  relatedClasses: ['salsa-cubana-barcelona', 'bachata-barcelona', 'salsa-bachata-barcelona'],

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
    '#answer-origen',
    '#definition-salsa',
    '#origenes',
    '#estilos',
    '#rueda',
    '#beneficios',
    '#conclusion',
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
