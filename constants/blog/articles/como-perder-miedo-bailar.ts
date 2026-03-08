/**
 * Article Configuration: Cómo Perder el Miedo a Bailar
 *
 * Enterprise SEO/GEO optimized article following Template V2.0
 * Target: Featured Snippet + AI Citation optimization
 *
 * Category: Lifestyle
 * Target Keywords:
 *   - Primary: "cómo perder el miedo a bailar" (720/mes, competencia baja)
 *   - Secondary: "clases de baile para tímidos" (260/mes)
 *   - Related: "aprender a bailar desde cero" (1,600/mes)
 *
 * GEO Features:
 *   - 3 Answer Capsules (72% AI citation rate)
 *   - ~12 Statistics with citations
 *   - 2 Definitions for LLM extraction
 *   - 8 FAQs for schema
 *   - Testimonial with Review schema
 */

import type { BlogArticleConfig } from '../types';

export const COMO_PERDER_MIEDO_BAILAR_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogPerderMiedoBailar',
  slug: 'como-perder-miedo-bailar',
  category: 'lifestyle',

  // === AUTHOR (E-E-A-T) ===
  authorId: 'yunaisy',

  // === CONTENT TYPE (Standalone - not pillar/cluster) ===
  contentType: 'standalone',

  // === DATES ===
  datePublished: '2026-01-16',
  dateModified: '2026-01-16',

  // === READING METRICS ===
  readingTime: 10,
  wordCount: 2400,

  // === SUMMARY (GEO Optimized) ===
  summaryBullets: [
    'blogPerderMiedoBailar_summaryBullet1',
    'blogPerderMiedoBailar_summaryBullet2',
    'blogPerderMiedoBailar_summaryBullet3',
    'blogPerderMiedoBailar_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards with GEO Citations) ===
  summaryStats: [
    {
      value: '80%',
      labelKey: 'blogPerderMiedoBailar_statAnsiedadLabel',
      citation: {
        source: 'Psychology Today',
        url: 'https://www.psychologytoday.com/us/basics/social-anxiety',
        year: '2024',
        authors: 'Psychology Today Editorial',
      },
    },
    {
      value: '3-6',
      labelKey: 'blogPerderMiedoBailar_statClasesLabel',
      citation: {
        source: "Farray's Dance Center",
        year: '2025',
        authors: 'Equipo pedagógico',
      },
    },
    {
      value: '90%',
      labelKey: 'blogPerderMiedoBailar_statExitoLabel',
      citation: {
        source: "Farray's Dance Center",
        year: '2025',
        authors: 'Datos internos',
      },
    },
    {
      value: '+21%',
      labelKey: 'blogPerderMiedoBailar_statEndorfinasLabel',
      citation: {
        source: 'Evolution and Human Behavior',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S1090513816300113',
        year: '2016',
        authors: 'Tarr et al.',
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
      contentKey: 'blogPerderMiedoBailar_intro',
    },
    {
      id: 'intro-2',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_intro2',
    },

    // =====================================================
    // ANSWER CAPSULE 1: ¿Cómo perder el miedo? (72% AI Citation)
    // =====================================================
    {
      id: 'answer-como-perder',
      type: 'answer-capsule',
      contentKey: 'blogPerderMiedoBailar_answerComoPerder',
      answerCapsule: {
        questionKey: 'blogPerderMiedoBailar_answerComoPerderQ',
        answerKey: 'blogPerderMiedoBailar_answerComoPerderA',
        sourcePublisherKey: 'blogPerderMiedoBailar_sourcePublisherBehavioral',
        confidence: 'verified',
        icon: 'star',
      },
    },

    // =====================================================
    // SECTION 1: POR QUÉ SENTIMOS MIEDO A BAILAR
    // =====================================================
    {
      id: 'por-que-miedo',
      type: 'heading',
      level: 2,
      contentKey: 'blogPerderMiedoBailar_porQueMiedoTitle',
    },

    // === DEFINITION: Miedo escénico (LLM Extraction) ===
    {
      id: 'definition-miedo-escenico',
      type: 'definition',
      contentKey: 'blogPerderMiedoBailar_defMiedoEscenico',
      definitionTermKey: 'blogPerderMiedoBailar_defMiedoEscenicoTerm',
    },

    {
      id: 'por-que-miedo-content',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_porQueMiedoContent',
    },

    // === STATISTIC: Ansiedad social ===
    {
      id: 'stat-ansiedad',
      type: 'statistic',
      contentKey: 'blogPerderMiedoBailar_statAnsiedadContent',
      statisticValue: '80%',
      statisticSource: 'Psychology Today, 2024',
    },

    // === DEFINITION: Ansiedad social (LLM Extraction) ===
    {
      id: 'definition-ansiedad-social',
      type: 'definition',
      contentKey: 'blogPerderMiedoBailar_defAnsiedadSocial',
      definitionTermKey: 'blogPerderMiedoBailar_defAnsiedadSocialTerm',
    },

    {
      id: 'por-que-miedo-content-2',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_porQueMiedoContent2',
    },

    // =====================================================
    // SECTION 2: LOS 5 MIEDOS MÁS COMUNES
    // =====================================================
    {
      id: 'miedos-comunes',
      type: 'heading',
      level: 2,
      contentKey: 'blogPerderMiedoBailar_miedosComunesTitle',
    },
    {
      id: 'miedos-comunes-intro',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_miedosComunesIntro',
    },
    {
      id: 'miedos-lista',
      type: 'numbered-list',
      contentKey: 'blogPerderMiedoBailar_miedosListaTitle',
      listItems: [
        'blogPerderMiedoBailar_miedo1',
        'blogPerderMiedoBailar_miedo2',
        'blogPerderMiedoBailar_miedo3',
        'blogPerderMiedoBailar_miedo4',
        'blogPerderMiedoBailar_miedo5',
      ],
    },

    // === ANSWER CAPSULE 2: ¿Es normal? (72% AI Citation) ===
    {
      id: 'answer-es-normal',
      type: 'answer-capsule',
      contentKey: 'blogPerderMiedoBailar_answerEsNormal',
      answerCapsule: {
        questionKey: 'blogPerderMiedoBailar_answerEsNormalQ',
        answerKey: 'blogPerderMiedoBailar_answerEsNormalA',
        sourceUrl: 'https://www.psychologytoday.com/us/basics/social-anxiety',
        sourcePublisher: 'Psychology Today',
        sourceYear: '2024',
        confidence: 'verified',
        icon: 'check',
      },
    },

    // =====================================================
    // SECTION 3: TÉCNICAS CIENTÍFICAS PARA SUPERAR EL MIEDO
    // =====================================================
    {
      id: 'tecnicas',
      type: 'heading',
      level: 2,
      contentKey: 'blogPerderMiedoBailar_tecnicasTitle',
    },
    {
      id: 'tecnicas-intro',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_tecnicasIntro',
    },

    // === STATISTIC: Exposición gradual ===
    {
      id: 'stat-exposicion',
      type: 'statistic',
      contentKey: 'blogPerderMiedoBailar_statExposicionContent',
      statisticValue: '85%',
      statisticSource: 'Journal of Anxiety Disorders, 2019',
    },

    {
      id: 'tecnicas-lista',
      type: 'numbered-list',
      contentKey: 'blogPerderMiedoBailar_tecnicasListaTitle',
      listItems: [
        'blogPerderMiedoBailar_tecnica1',
        'blogPerderMiedoBailar_tecnica2',
        'blogPerderMiedoBailar_tecnica3',
        'blogPerderMiedoBailar_tecnica4',
      ],
    },

    // === STATISTIC: Endorfinas ===
    {
      id: 'stat-endorfinas',
      type: 'statistic',
      contentKey: 'blogPerderMiedoBailar_statEndorfinasContent',
      statisticValue: '+21%',
      statisticSource: 'Evolution and Human Behavior, 2016',
    },

    // =====================================================
    // SECTION 4: PRIMER PASO - CLASES PARA PRINCIPIANTES
    // =====================================================
    {
      id: 'primer-paso',
      type: 'heading',
      level: 2,
      contentKey: 'blogPerderMiedoBailar_primerPasoTitle',
    },
    {
      id: 'primer-paso-content',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_primerPasoContent',
    },

    // === ANSWER CAPSULE 3: ¿Cuánto tiempo? (72% AI Citation) ===
    {
      id: 'answer-cuanto-tiempo',
      type: 'answer-capsule',
      contentKey: 'blogPerderMiedoBailar_answerCuantoTiempo',
      answerCapsule: {
        questionKey: 'blogPerderMiedoBailar_answerCuantoTiempoQ',
        answerKey: 'blogPerderMiedoBailar_answerCuantoTiempoA',
        sourcePublisher: "Farray's Dance Center",
        sourceYear: '2025',
        confidence: 'high',
        icon: 'lightbulb',
      },
    },

    // === CALLOUT TIP: Primera clase ===
    {
      id: 'callout-tip',
      type: 'callout',
      contentKey: 'blogPerderMiedoBailar_calloutTip',
      calloutType: 'tip',
    },

    // === STATISTIC: Éxito en primera clase ===
    {
      id: 'stat-exito',
      type: 'statistic',
      contentKey: 'blogPerderMiedoBailar_statExitoContent',
      statisticValue: '90%',
      statisticSource: "Farray's Dance Center, 2025",
    },

    {
      id: 'primer-paso-content-2',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_primerPasoContent2',
    },

    // =====================================================
    // TESTIMONIAL SECTION
    // =====================================================
    {
      id: 'testimonial-alumno',
      type: 'testimonial',
      contentKey: 'blogPerderMiedoBailar_testimonial',
      testimonial: {
        authorName: 'Carlos Martín',
        authorLocation: 'Barcelona',
        textKey: 'blogPerderMiedoBailar_testimonialText',
        rating: 5,
        datePublished: '2026-01-16',
        reviewOf: 'course',
      },
    },

    // =====================================================
    // SECTION 5: AMBIENTE SEGURO - CÓMO ELEGIR ESCUELA
    // =====================================================
    {
      id: 'ambiente-seguro',
      type: 'heading',
      level: 2,
      contentKey: 'blogPerderMiedoBailar_ambienteSeguroTitle',
    },
    {
      id: 'ambiente-seguro-intro',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_ambienteSeguroIntro',
    },
    {
      id: 'checklist-escuela',
      type: 'list',
      contentKey: 'blogPerderMiedoBailar_checklistTitle',
      listItems: [
        'blogPerderMiedoBailar_check1',
        'blogPerderMiedoBailar_check2',
        'blogPerderMiedoBailar_check3',
        'blogPerderMiedoBailar_check4',
        'blogPerderMiedoBailar_check5',
      ],
    },

    // === STATISTIC: Satisfacción alumnos ===
    {
      id: 'stat-satisfaccion',
      type: 'statistic',
      contentKey: 'blogPerderMiedoBailar_statSatisfaccionContent',
      statisticValue: '4.9/5',
      statisticSource: 'Google Reviews, 509 reseñas',
    },

    // =====================================================
    // SECTION 6: CONCLUSIÓN
    // =====================================================
    {
      id: 'conclusion',
      type: 'heading',
      level: 2,
      contentKey: 'blogPerderMiedoBailar_conclusionTitle',
    },
    {
      id: 'conclusion-content',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_conclusionContent',
    },

    // === STATISTIC: Beneficio cognitivo ===
    {
      id: 'stat-demencia',
      type: 'statistic',
      contentKey: 'blogPerderMiedoBailar_statDemenciaContent',
      statisticValue: '76%',
      statisticSource: 'New England Journal of Medicine, 2003',
    },

    {
      id: 'conclusion-cta',
      type: 'paragraph',
      contentKey: 'blogPerderMiedoBailar_conclusionCTA',
    },

    // === CALLOUT CTA: Reserva ===
    {
      id: 'callout-cta',
      type: 'callout',
      contentKey: 'blogPerderMiedoBailar_calloutCTA',
      calloutType: 'cta',
    },

    // =====================================================
    // REFERENCES SECTION (E-E-A-T)
    // =====================================================
    {
      id: 'references-section',
      type: 'references',
      contentKey: 'blogPerderMiedoBailar_referencesIntro',
      references: [
        {
          id: 'psychology-today',
          titleKey: 'blogPerderMiedoBailar_refPsychologyTodayTitle',
          url: 'https://www.psychologytoday.com/us/basics/anxiety',
          publisher: 'Psychology Today',
          year: '2024',
          descriptionKey: 'blogPerderMiedoBailar_refPsychologyTodayDesc',
        },
        {
          id: 'exposure-therapy',
          titleKey: 'blogPerderMiedoBailar_refExposureTitle',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9901528/',
          publisher: 'PMC / National Library of Medicine',
          year: '2023',
          descriptionKey: 'blogPerderMiedoBailar_refExposureDesc',
        },
        {
          id: 'dance-psychology',
          titleKey: 'blogPerderMiedoBailar_refDancePsychTitle',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11127814/',
          publisher: 'PMC / National Library of Medicine',
          year: '2024',
          descriptionKey: 'blogPerderMiedoBailar_refDancePsychDesc',
        },
        {
          id: 'endorphins-sync',
          titleKey: 'blogPerderMiedoBailar_refEndorphinsSyncTitle',
          url: 'https://pubmed.ncbi.nlm.nih.gov/27540276/',
          publisher: 'PubMed',
          year: '2016',
          descriptionKey: 'blogPerderMiedoBailar_refEndorphinsSyncDesc',
        },
        {
          id: 'nejm-dementia',
          titleKey: 'blogPerderMiedoBailar_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogPerderMiedoBailar_refNEJMDesc',
        },
        {
          id: 'frontiers-wellbeing',
          titleKey: 'blogPerderMiedoBailar_refFrontiersTitle',
          url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
          publisher: 'Frontiers in Psychology',
          year: '2019',
          descriptionKey: 'blogPerderMiedoBailar_refFrontiersDesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/como-perder-miedo/hero.webp',
    srcSet:
      '/images/blog/como-perder-miedo/hero-480.webp 480w, /images/blog/como-perder-miedo/hero-960.webp 960w, /images/blog/como-perder-miedo/hero.webp 1200w',
    alt: 'Alumnos que fueron principiantes y superaron la ansiedad y el miedo escénico, guiados por los profesores de nuestra academia de baile en Barcelona',
    altKey: 'blogPerderMiedoBailar_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/como-perder-miedo/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_lifestyle',
    categoryUrl: '/blog/lifestyle',
    currentKey: 'blogPerderMiedoBailar_breadcrumbCurrent',
  },

  // === FAQ SECTION (8 FAQs for Schema) ===
  faqSection: {
    enabled: true,
    titleKey: 'blogPerderMiedoBailar_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogPerderMiedoBailar_faq1Question',
        answerKey: 'blogPerderMiedoBailar_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogPerderMiedoBailar_faq2Question',
        answerKey: 'blogPerderMiedoBailar_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogPerderMiedoBailar_faq3Question',
        answerKey: 'blogPerderMiedoBailar_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogPerderMiedoBailar_faq4Question',
        answerKey: 'blogPerderMiedoBailar_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogPerderMiedoBailar_faq5Question',
        answerKey: 'blogPerderMiedoBailar_faq5Answer',
      },
      {
        id: '6',
        questionKey: 'blogPerderMiedoBailar_faq6Question',
        answerKey: 'blogPerderMiedoBailar_faq6Answer',
      },
      {
        id: '7',
        questionKey: 'blogPerderMiedoBailar_faq7Question',
        answerKey: 'blogPerderMiedoBailar_faq7Answer',
      },
      {
        id: '8',
        questionKey: 'blogPerderMiedoBailar_faq8Question',
        answerKey: 'blogPerderMiedoBailar_faq8Answer',
      },
    ],
  },

  // === RELATED ARTICLES ===
  relatedArticles: [
    {
      slug: 'clases-baile-principiantes-barcelona-farrays',
      category: 'tips',
      titleKey: 'blogClasesPrincipiantes_title',
      excerptKey: 'blogClasesPrincipiantes_excerpt',
      image: '/images/blog/clases-principiantes/hero.webp',
    },
    {
      slug: 'salsa-vs-bachata',
      category: 'tips',
      titleKey: 'blogSalsaVsBachata_title',
      excerptKey: 'blogSalsaVsBachata_excerpt',
      image: '/images/blog/salsa-vs-bachata/hero.webp',
    },
  ],

  // === RELATED CLASSES (internal linking) ===
  relatedClasses: [
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

  // === SPEAKABLE (Voice Search GEO) ===
  speakableSelectors: [
    '#article-summary',
    '[data-answer-capsule="true"]',
    '#answer-como-perder',
    '#answer-es-normal',
    '#answer-cuanto-tiempo',
    '#intro',
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
    reviewCount: 509,
    bestRating: 5,
    worstRating: 1,
  },

  // === GOOGLE DISCOVER OPTIMIZATION ===
  discoverOptimized: true,
};
