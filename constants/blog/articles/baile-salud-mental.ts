/**
 * Article Configuration: Baile y Salud Mental
 *
 * Artículo sobre los beneficios científicamente respaldados del baile
 * para la salud mental: ansiedad, depresión, estrés y función cognitiva.
 *
 * Category: Fitness (Salud y Bienestar)
 * Type: Listicle/Informativo con enfoque científico
 *
 * Referencias principales:
 * - PMC (PubMed Central) - Múltiples meta-análisis
 * - Frontiers in Psychology
 * - New England Journal of Medicine
 * - Harvard Medical School
 * - University of Sydney
 */

import type { BlogArticleConfig } from '../types';

export const BAILE_SALUD_MENTAL_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogBaileSaludMental',
  slug: 'baile-salud-mental',
  category: 'fitness',

  // === DATES ===
  datePublished: '2026-01-17',
  dateModified: '2026-01-17',

  // === READING METRICS ===
  readingTime: 12,
  wordCount: 2800,

  // === AUTHOR (E-E-A-T) ===
  authorId: 'yunaisy',

  // === PILLAR/CLUSTER CONFIG ===
  contentType: 'cluster',
  pillarSlug: 'beneficios-bailar-salsa',

  // === SUMMARY BOX (GEO Critical) ===
  summaryBullets: [
    'blogBaileSaludMental_summaryBullet1',
    'blogBaileSaludMental_summaryBullet2',
    'blogBaileSaludMental_summaryBullet3',
    'blogBaileSaludMental_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards) ===
  summaryStats: [
    {
      value: '76%',
      labelKey: 'blogBaileSaludMental_statDementiaLabel',
      source: 'New England Journal of Medicine, 2003',
      citation: {
        source: 'New England Journal of Medicine',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
        year: '2003',
        authors: 'Verghese et al.',
        doi: '10.1056/NEJMoa022252',
      },
    },
    {
      value: '↓47%',
      labelKey: 'blogBaileSaludMental_statAnxietyLabel',
      source: 'Frontiers in Psychology, 2019',
      citation: {
        source: 'Frontiers in Psychology',
        url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01806/full',
        year: '2019',
        authors: 'Koch et al.',
      },
    },
  ],

  // === CONTENT SECTIONS ===
  sections: [
    // --- INTRO ---
    {
      id: 'intro',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_intro',
    },
    {
      id: 'intro-2',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_intro2',
    },

    // --- SECTION 1: Beneficios del baile para la salud mental ---
    {
      id: 'beneficios-salud-mental',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section1Title',
    },
    {
      id: 'beneficios-salud-mental-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section1Content',
    },
    {
      id: 'beneficios-lista',
      type: 'list',
      contentKey: 'blogBaileSaludMental_beneficiosListaTitle',
      listItems: [
        'blogBaileSaludMental_beneficiosItem1',
        'blogBaileSaludMental_beneficiosItem2',
        'blogBaileSaludMental_beneficiosItem3',
        'blogBaileSaludMental_beneficiosItem4',
      ],
    },

    // --- ESTADÍSTICA 1 ---
    {
      id: 'stat-1',
      type: 'statistic',
      contentKey: 'blogBaileSaludMental_stat1Label',
      statisticValue: '3.2x',
      statisticSource: 'PMC Meta-Analysis, 2023',
    },

    // --- SECTION 2: Baile y Ansiedad ---
    {
      id: 'baile-ansiedad',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section2Title',
    },
    {
      id: 'baile-ansiedad-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section2Content',
    },
    {
      id: 'baile-ansiedad-content-2',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section2Content2',
    },

    // --- ESTADÍSTICA 2 ---
    {
      id: 'stat-2',
      type: 'statistic',
      contentKey: 'blogBaileSaludMental_stat2Label',
      statisticValue: '↓47%',
      statisticSource: 'Frontiers in Psychology, 2019',
    },

    // --- ANSWER CAPSULE 1: Ansiedad ---
    {
      id: 'answer-capsule-1',
      type: 'answer-capsule',
      contentKey: 'blogBaileSaludMental_answerCapsule1',
      answerCapsule: {
        questionKey: 'blogBaileSaludMental_answerQuestion1',
        answerKey: 'blogBaileSaludMental_answerText1',
        sourcePublisher: 'Frontiers in Psychology',
        sourceYear: '2019',
        sourceUrl:
          'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01806/full',
        confidence: 'high',
        icon: 'check',
      },
    },

    // --- SECTION 3: Baile y Depresión ---
    {
      id: 'baile-depresion',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section3Title',
    },
    {
      id: 'baile-depresion-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section3Content',
    },
    {
      id: 'baile-depresion-lista',
      type: 'list',
      contentKey: 'blogBaileSaludMental_depresionListaTitle',
      listItems: [
        'blogBaileSaludMental_depresionItem1',
        'blogBaileSaludMental_depresionItem2',
        'blogBaileSaludMental_depresionItem3',
      ],
    },

    // --- ESTADÍSTICA 3 ---
    {
      id: 'stat-3',
      type: 'statistic',
      contentKey: 'blogBaileSaludMental_stat3Label',
      statisticValue: '↓36%',
      statisticSource: 'PMC Meta-Analysis, 2024',
    },

    // --- SECTION 4: Baile y Estrés ---
    {
      id: 'baile-estres',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section4Title',
    },
    {
      id: 'baile-estres-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section4Content',
    },
    {
      id: 'baile-estres-content-2',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section4Content2',
    },

    // --- ESTADÍSTICA 4 ---
    {
      id: 'stat-4',
      type: 'statistic',
      contentKey: 'blogBaileSaludMental_stat4Label',
      statisticValue: '+22%',
      statisticSource: 'University of Sydney, 2024',
    },

    // --- ANSWER CAPSULE 2: Estrés ---
    {
      id: 'answer-capsule-2',
      type: 'answer-capsule',
      contentKey: 'blogBaileSaludMental_answerCapsule2',
      answerCapsule: {
        questionKey: 'blogBaileSaludMental_answerQuestion2',
        answerKey: 'blogBaileSaludMental_answerText2',
        sourcePublisher: 'University of Sydney',
        sourceYear: '2024',
        sourceUrl:
          'https://www.sydney.edu.au/news-opinion/news/2024/02/12/dancing-may-be-better-than-other-exercise-for-improving-mental-h.html',
        confidence: 'high',
        icon: 'lightbulb',
      },
    },

    // --- SECTION 5: Baile, Memoria y Cerebro ---
    {
      id: 'baile-cerebro',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section5Title',
    },
    {
      id: 'baile-cerebro-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section5Content',
    },
    {
      id: 'baile-cerebro-content-2',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section5Content2',
    },

    // --- ESTADÍSTICA 5 ---
    {
      id: 'stat-5',
      type: 'statistic',
      contentKey: 'blogBaileSaludMental_stat5Label',
      statisticValue: '76%',
      statisticSource: 'NEJM (Verghese et al.), 2003',
    },

    // --- QUOTE DE EXPERTO ---
    {
      id: 'quote-experto',
      type: 'quote',
      contentKey: 'blogBaileSaludMental_quoteContent',
      quoteAuthor: 'Harvard Medical School - Dancing and the Brain',
    },

    // --- SECTION 6: ¿Qué tipo de baile es mejor? ---
    {
      id: 'tipo-baile',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section6Title',
    },
    {
      id: 'tipo-baile-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section6Content',
    },
    {
      id: 'tipo-baile-lista',
      type: 'list',
      contentKey: 'blogBaileSaludMental_tipoBaileListaTitle',
      listItems: [
        'blogBaileSaludMental_tipoBaileItem1',
        'blogBaileSaludMental_tipoBaileItem2',
        'blogBaileSaludMental_tipoBaileItem3',
      ],
    },

    // --- DEFINITION (Featured Snippet) ---
    {
      id: 'definicion',
      type: 'definition',
      definitionTermKey: 'blogBaileSaludMental_defTerm',
      contentKey: 'blogBaileSaludMental_defContent',
    },

    // --- ANSWER CAPSULE 3: Mejor tipo de baile ---
    {
      id: 'answer-capsule-3',
      type: 'answer-capsule',
      contentKey: 'blogBaileSaludMental_answerCapsule3',
      answerCapsule: {
        questionKey: 'blogBaileSaludMental_answerQuestion3',
        answerKey: 'blogBaileSaludMental_answerText3',
        sourcePublisher: 'PMC Systematic Review',
        sourceYear: '2024',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11127814/',
        confidence: 'high',
        icon: 'star',
      },
    },

    // --- SECTION 7: Bailar en Barcelona ---
    {
      id: 'bailar-barcelona',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_section7Title',
    },
    {
      id: 'bailar-barcelona-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_section7Content',
    },
    {
      id: 'bailar-barcelona-lista',
      type: 'numbered-list',
      contentKey: 'blogBaileSaludMental_barcelonaListaTitle',
      listItems: ['blogBaileSaludMental_barcelonaItem1', 'blogBaileSaludMental_barcelonaItem2'],
    },

    // --- TESTIMONIAL ---
    {
      id: 'testimonial-1',
      type: 'testimonial',
      contentKey: 'blogBaileSaludMental_testimonial1',
      testimonial: {
        authorName: 'Laura M.',
        authorLocation: 'Barcelona',
        textKey: 'blogBaileSaludMental_testimonialText1',
        rating: 5,
        datePublished: '2026-01-17',
        reviewOf: 'school',
      },
    },

    // --- TIP CALLOUT ---
    {
      id: 'tip-experto',
      type: 'callout',
      calloutType: 'tip',
      contentKey: 'blogBaileSaludMental_tipExperto',
    },

    // --- CTA CALLOUT ---
    {
      id: 'cta-clases',
      type: 'callout',
      calloutType: 'cta',
      contentKey: 'blogBaileSaludMental_ctaClases',
    },

    // --- CONCLUSIÓN ---
    {
      id: 'conclusion',
      type: 'heading',
      level: 2,
      contentKey: 'blogBaileSaludMental_conclusionTitle',
    },
    {
      id: 'conclusion-content',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_conclusionContent',
    },
    {
      id: 'conclusion-cta',
      type: 'paragraph',
      contentKey: 'blogBaileSaludMental_conclusionCTA',
    },

    // --- REFERENCIAS (E-E-A-T) ---
    {
      id: 'referencias',
      type: 'references',
      contentKey: 'blogBaileSaludMental_referencesIntro',
      references: [
        {
          id: 'ref-frontiers',
          titleKey: 'blogBaileSaludMental_refFrontiersTitle',
          url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01806/full',
          publisher: 'Frontiers in Psychology',
          year: '2019',
          descriptionKey: 'blogBaileSaludMental_refFrontiersDesc',
        },
        {
          id: 'ref-pmc-2024',
          titleKey: 'blogBaileSaludMental_refPMC2024Title',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11127814/',
          publisher: 'Sports Medicine (PMC)',
          year: '2024',
          descriptionKey: 'blogBaileSaludMental_refPMC2024Desc',
        },
        {
          id: 'ref-pmc-depression',
          titleKey: 'blogBaileSaludMental_refPMCDepTitle',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10813489/',
          publisher: 'PMC Meta-Analysis',
          year: '2024',
          descriptionKey: 'blogBaileSaludMental_refPMCDepDesc',
        },
        {
          id: 'ref-sydney',
          titleKey: 'blogBaileSaludMental_refSydneyTitle',
          url: 'https://www.sydney.edu.au/news-opinion/news/2024/02/12/dancing-may-be-better-than-other-exercise-for-improving-mental-h.html',
          publisher: 'University of Sydney',
          year: '2024',
          descriptionKey: 'blogBaileSaludMental_refSydneyDesc',
        },
        {
          id: 'ref-nejm',
          titleKey: 'blogBaileSaludMental_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogBaileSaludMental_refNEJMDesc',
        },
        {
          id: 'ref-harvard',
          titleKey: 'blogBaileSaludMental_refHarvardTitle',
          url: 'https://hms.harvard.edu/news-events/publications-archive/brain/dancing-brain',
          publisher: 'Harvard Medical School',
          year: '2025',
          descriptionKey: 'blogBaileSaludMental_refHarvardDesc',
        },
        {
          id: 'ref-pmc-scoping',
          titleKey: 'blogBaileSaludMental_refPMCScopingTitle',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10035338/',
          publisher: 'Frontiers in Psychology (PMC)',
          year: '2023',
          descriptionKey: 'blogBaileSaludMental_refPMCScopingDesc',
        },
        {
          id: 'ref-sync',
          titleKey: 'blogBaileSaludMental_refSyncTitle',
          url: 'https://pubmed.ncbi.nlm.nih.gov/27540276/',
          publisher: 'Evolution and Human Behavior',
          year: '2016',
          descriptionKey: 'blogBaileSaludMental_refSyncDesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/beneficios-salsa/hero.webp',
    srcSet:
      '/images/blog/beneficios-salsa/hero-480.webp 480w, /images/blog/beneficios-salsa/hero-960.webp 960w, /images/blog/beneficios-salsa/hero.webp 1200w',
    alt: 'Personas bailando salsa con expresión de alegría, ilustrando los beneficios científicos del baile para la salud mental: reducción de ansiedad, estrés y mejora cognitiva',
    altKey: 'blogBaileSaludMental_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/beneficios-salsa/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_fitness',
    categoryUrl: '/blog/fitness',
    currentKey: 'blogBaileSaludMental_breadcrumbCurrent',
  },

  // === FAQ SECTION ===
  faqSection: {
    enabled: true,
    titleKey: 'blogBaileSaludMental_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogBaileSaludMental_faq1Question',
        answerKey: 'blogBaileSaludMental_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogBaileSaludMental_faq2Question',
        answerKey: 'blogBaileSaludMental_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogBaileSaludMental_faq3Question',
        answerKey: 'blogBaileSaludMental_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogBaileSaludMental_faq4Question',
        answerKey: 'blogBaileSaludMental_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogBaileSaludMental_faq5Question',
        answerKey: 'blogBaileSaludMental_faq5Answer',
      },
      {
        id: '6',
        questionKey: 'blogBaileSaludMental_faq6Question',
        answerKey: 'blogBaileSaludMental_faq6Answer',
      },
      {
        id: '7',
        questionKey: 'blogBaileSaludMental_faq7Question',
        answerKey: 'blogBaileSaludMental_faq7Answer',
      },
      {
        id: '8',
        questionKey: 'blogBaileSaludMental_faq8Question',
        answerKey: 'blogBaileSaludMental_faq8Answer',
      },
    ],
  },

  // === RELATED ARTICLES ===
  relatedArticles: [
    {
      slug: 'beneficios-bailar-salsa',
      category: 'lifestyle',
      titleKey: 'blogBeneficiosSalsa_title',
      excerptKey: 'blogBeneficiosSalsa_excerpt',
      image: '/images/blog/beneficios-salsa/hero.webp',
    },
    {
      slug: 'como-perder-miedo-bailar',
      category: 'lifestyle',
      titleKey: 'blogPerderMiedoBailar_title',
      excerptKey: 'blogPerderMiedoBailar_excerpt',
      image: '/images/blog/como-perder-miedo/hero.webp',
    },
  ],

  // === RELATED CLASSES ===
  relatedClasses: [
    'salsa-cubana-barcelona',
    'bachata-barcelona',
    'salsa-bachata-barcelona',
    'clases-baile-principiantes-barcelona',
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

  // === SCHEMAS ===
  localBusinessSchema: {
    enabled: true,
  },
  aggregateRatingSchema: {
    enabled: true,
    ratingValue: 4.9,
    reviewCount: 127,
    bestRating: 5,
    worstRating: 1,
  },

  // === SPEAKABLE (Voice Search) ===
  speakableSelectors: [
    '#article-summary',
    '[data-answer-capsule="true"]',
    '#definicion',
    '[data-statistic="true"]',
    '#intro',
    '#conclusion',
  ],

  // === GOOGLE DISCOVER ===
  discoverOptimized: true,
};
