/**
 * Article Configuration: Historia de la Bachata - Del Barrio Dominicano a Barcelona
 *
 * Premium SEO-optimized article with GEO citability, internal links,
 * and comprehensive historical content about bachata dance.
 *
 * ENTERPRISE 10/10 - GEO Optimized with verified citations
 *
 * Category: Historia
 * Target Keywords: historia bachata, origen bachata, bachata barcelona, bachata sensual,
 *                  clases bachata barcelona, aprender bachata, Romeo Santos
 */

import type { BlogArticleConfig } from '../types';

export const HISTORIA_BACHATA_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogHistoriaBachata',
  slug: 'historia-bachata-barcelona',
  category: 'historia',

  // === DATES ===
  datePublished: '2026-01-24',
  dateModified: '2026-01-24',

  // === READING METRICS ===
  readingTime: 14,
  wordCount: 3200,

  // === SUMMARY (GEO Optimized) ===
  summaryBullets: [
    'blogHistoriaBachata_summaryBullet1',
    'blogHistoriaBachata_summaryBullet2',
    'blogHistoriaBachata_summaryBullet3',
    'blogHistoriaBachata_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards with GEO Citations) ===
  summaryStats: [
    {
      value: '1962',
      labelKey: 'blogHistoriaBachata_statCalderonLabel',
      citation: {
        source: 'Bachata: A Social History (Pacini Hernández)',
        url: 'https://archive.org/details/bachatasocialhist00paci',
        year: '1995',
        authors: 'Pacini Hernández',
      },
    },
    {
      value: '2019',
      labelKey: 'blogHistoriaBachata_statUNESCOLabel',
      citation: {
        source: 'UNESCO Patrimonio Cultural Inmaterial',
        url: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
        year: '2019',
        authors: 'UNESCO',
      },
    },
    {
      value: '76%',
      labelKey: 'blogHistoriaBachata_statDemenciaLabel',
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
      contentKey: 'blogHistoriaBachata_intro',
    },
    {
      id: 'intro-farrays',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_introFarrays',
    },

    // =====================================================
    // ANSWER CAPSULE: Origen de la bachata (72% AI Citation Rate)
    // =====================================================
    {
      id: 'answer-origen',
      type: 'answer-capsule',
      contentKey: 'blogHistoriaBachata_answerOrigen',
      answerCapsule: {
        questionKey: 'blogHistoriaBachata_answerOrigenQ',
        answerKey: 'blogHistoriaBachata_answerOrigenA',
        sourceUrl: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
        sourcePublisher: 'UNESCO',
        sourceYear: '2019',
        confidence: 'verified',
        icon: 'star',
      },
    },

    // === DEFINITION: Bachata (LLM Extraction) ===
    {
      id: 'definition-bachata',
      type: 'definition',
      contentKey: 'blogHistoriaBachata_defBachata',
      definitionTermKey: 'blogHistoriaBachata_defBachataTerm',
    },

    // =====================================================
    // SECTION 1: ORÍGENES (1960s)
    // =====================================================
    {
      id: 'origenes',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_origenesTitle',
    },
    {
      id: 'origenes-content1',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_origenesContent1',
    },
    {
      id: 'origenes-content2',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_origenesContent2',
    },
    {
      id: 'origenes-barcelona',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_origenesBarcelona',
    },

    // =====================================================
    // SECTION 2: ETIMOLOGÍA DE "BACHATA"
    // =====================================================
    {
      id: 'etimologia',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_etimologiaTitle',
    },
    {
      id: 'etimologia-intro',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_etimologiaIntro',
    },

    // Teorías como lista
    {
      id: 'etimologia-teorias',
      type: 'list',
      contentKey: 'blogHistoriaBachata_etimologiaTeoriasTitle',
      listItems: [
        'blogHistoriaBachata_teoria1',
        'blogHistoriaBachata_teoria2',
        'blogHistoriaBachata_teoria3',
      ],
    },

    {
      id: 'etimologia-cierre',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_etimologiaCierre',
    },

    // =====================================================
    // SECTION 3: EVOLUCIÓN ESTILÍSTICA (TABLA COMPARATIVA)
    // =====================================================
    {
      id: 'evolucion',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_evolucionTitle',
    },
    {
      id: 'evolucion-intro',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_evolucionIntro',
    },

    // Tabla comparativa de evolución
    {
      id: 'evolucion-tabla',
      type: 'comparison-table',
      contentKey: 'blogHistoriaBachata_evolucionTableTitle',
      tableConfig: {
        headers: [
          'blogHistoriaBachata_tableHeaderEtapa',
          'blogHistoriaBachata_tableHeaderDecada',
          'blogHistoriaBachata_tableHeaderCaracteristicas',
          'blogHistoriaBachata_tableHeaderFiguras',
          'blogHistoriaBachata_tableHeaderBarcelona',
        ],
        rows: [
          [
            'blogHistoriaBachata_tableRow1Col1',
            'blogHistoriaBachata_tableRow1Col2',
            'blogHistoriaBachata_tableRow1Col3',
            'blogHistoriaBachata_tableRow1Col4',
            'blogHistoriaBachata_tableRow1Col5',
          ],
          [
            'blogHistoriaBachata_tableRow2Col1',
            'blogHistoriaBachata_tableRow2Col2',
            'blogHistoriaBachata_tableRow2Col3',
            'blogHistoriaBachata_tableRow2Col4',
            'blogHistoriaBachata_tableRow2Col5',
          ],
          [
            'blogHistoriaBachata_tableRow3Col1',
            'blogHistoriaBachata_tableRow3Col2',
            'blogHistoriaBachata_tableRow3Col3',
            'blogHistoriaBachata_tableRow3Col4',
            'blogHistoriaBachata_tableRow3Col5',
          ],
        ],
        highlightColumn: 4,
      },
    },

    // =====================================================
    // SECTION 4: ÍCONOS DE LA BACHATA
    // =====================================================
    {
      id: 'iconos',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_iconosTitle',
    },
    {
      id: 'iconos-intro',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_iconosIntro',
    },
    {
      id: 'iconos-lista',
      type: 'list',
      contentKey: 'blogHistoriaBachata_iconosListaTitle',
      listItems: [
        'blogHistoriaBachata_iconoCalderon',
        'blogHistoriaBachata_iconoSegura',
        'blogHistoriaBachata_iconoVictorVictor',
        'blogHistoriaBachata_iconoJuanLuis',
        'blogHistoriaBachata_iconoRomeo',
        'blogHistoriaBachata_iconoPrince',
      ],
    },
    {
      id: 'iconos-farrays',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_iconosFarrays',
    },

    // =====================================================
    // SECTION 5: BACHATA EN BARCELONA
    // =====================================================
    {
      id: 'barcelona',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_barcelonaTitle',
    },
    {
      id: 'barcelona-comunidad',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_barcelonaComunidad',
    },
    {
      id: 'barcelona-farrays',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_barcelonaFarrays',
    },

    // =====================================================
    // SECTION 6: BENEFICIOS CIENTÍFICOS
    // =====================================================
    {
      id: 'beneficios',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_beneficiosTitle',
    },
    {
      id: 'beneficios-intro',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_beneficiosIntro',
    },
    {
      id: 'beneficios-lista',
      type: 'list',
      contentKey: 'blogHistoriaBachata_beneficiosListaTitle',
      listItems: [
        'blogHistoriaBachata_beneficio1',
        'blogHistoriaBachata_beneficio2',
        'blogHistoriaBachata_beneficio3',
        'blogHistoriaBachata_beneficio4',
      ],
    },

    // =====================================================
    // SECTION 7: CONCLUSIÓN
    // =====================================================
    {
      id: 'conclusion',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_conclusionTitle',
    },
    {
      id: 'conclusion-content',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_conclusionContent',
    },

    // CTA Final natural
    {
      id: 'conclusion-cta',
      type: 'paragraph',
      contentKey: 'blogHistoriaBachata_conclusionCTA',
    },

    // =====================================================
    // REFERENCES (E-E-A-T Authority)
    // =====================================================
    {
      id: 'references',
      type: 'heading',
      level: 2,
      contentKey: 'blogHistoriaBachata_referencesTitle',
    },
    {
      id: 'references-section',
      type: 'references',
      contentKey: 'blogHistoriaBachata_referencesIntro',
      references: [
        {
          id: 'unesco-bachata',
          titleKey: 'blogHistoriaBachata_refUNESCOTitle',
          url: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
          publisher: 'UNESCO',
          year: '2019',
          descriptionKey: 'blogHistoriaBachata_refUNESCODesc',
        },
        {
          id: 'pacini-hernandez',
          titleKey: 'blogHistoriaBachata_refPaciniTitle',
          url: 'https://archive.org/details/bachatasocialhist00paci',
          publisher: 'Temple University Press',
          year: '1995',
          descriptionKey: 'blogHistoriaBachata_refPaciniDesc',
        },
        {
          id: 'peter-manuel',
          titleKey: 'blogHistoriaBachata_refManuelTitle',
          url: 'https://books.google.com/books/about/Caribbean_Currents.html?id=TUUhDQAAQBAJ',
          publisher: 'Temple University Press',
          year: '1995',
          descriptionKey: 'blogHistoriaBachata_refManuelDesc',
        },
        {
          id: 'paul-austerlitz',
          titleKey: 'blogHistoriaBachata_refAusterlitzTitle',
          url: 'https://www.abebooks.com/9781566394840/Merengue-Dominican-Music-Identity-Paul-1566394848/plp',
          publisher: 'Temple University Press',
          year: '1997',
          descriptionKey: 'blogHistoriaBachata_refAusterlitzDesc',
        },
        {
          id: 'nejm-dance-brain',
          titleKey: 'blogHistoriaBachata_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogHistoriaBachata_refNEJMDesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/historia-bachata/hero.webp',
    srcSet:
      '/images/blog/historia-bachata/hero-480.webp 480w, /images/blog/historia-bachata/hero-960.webp 960w, /images/blog/historia-bachata/hero.webp 1200w',
    alt: 'Grupo de baile bailando bachata sensual en Barcelona, reflejando la evolución del género desde los barrios de República Dominicana hasta Patrimonio UNESCO 2019',
    altKey: 'blogHistoriaBachata_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/historia-bachata/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_historia',
    categoryUrl: '/blog/historia',
    currentKey: 'blogHistoriaBachata_breadcrumbCurrent',
  },

  // === FAQ SECTION (SEO Optimized) ===
  faqSection: {
    enabled: true,
    titleKey: 'blogHistoriaBachata_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogHistoriaBachata_faq1Question',
        answerKey: 'blogHistoriaBachata_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogHistoriaBachata_faq2Question',
        answerKey: 'blogHistoriaBachata_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogHistoriaBachata_faq3Question',
        answerKey: 'blogHistoriaBachata_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogHistoriaBachata_faq4Question',
        answerKey: 'blogHistoriaBachata_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogHistoriaBachata_faq5Question',
        answerKey: 'blogHistoriaBachata_faq5Answer',
      },
      {
        id: '6',
        questionKey: 'blogHistoriaBachata_faq6Question',
        answerKey: 'blogHistoriaBachata_faq6Answer',
      },
      {
        id: '7',
        questionKey: 'blogHistoriaBachata_faq7Question',
        answerKey: 'blogHistoriaBachata_faq7Answer',
      },
      {
        id: '8',
        questionKey: 'blogHistoriaBachata_faq8Question',
        answerKey: 'blogHistoriaBachata_faq8Answer',
      },
    ],
  },

  // === RELATED ARTICLES ===
  relatedArticles: [
    {
      slug: 'historia-salsa-barcelona',
      category: 'historia',
      titleKey: 'blogHistoriaSalsa_title',
      excerptKey: 'blogHistoriaSalsa_excerpt',
      image: '/images/blog/historia-salsa/hero.webp',
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
  relatedClasses: ['bachata-barcelona', 'salsa-cubana-barcelona', 'salsa-bachata-barcelona'],

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
    '#origenes',
    '#etimologia',
    '#iconos',
    '#barcelona',
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
    reviewCount: 134,
    bestRating: 5,
    worstRating: 1,
  },

  // === GOOGLE DISCOVER OPTIMIZATION ===
  discoverOptimized: true,
};
