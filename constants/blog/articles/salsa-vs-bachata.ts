/**
 * Article Configuration: Salsa vs Bachata - ¿Qué Estilo Elegir?
 *
 * Enterprise SEO/GEO optimized article with comparison table,
 * internal links, verified references, and comprehensive FAQs.
 *
 * Category: Tips
 * Target Keywords: salsa vs bachata, diferencias salsa bachata,
 *                  elegir estilo baile, comparativa bailes latinos,
 *                  aprender salsa o bachata barcelona
 */

import type { BlogArticleConfig } from '../types';

export const SALSA_VS_BACHATA_CONFIG: BlogArticleConfig = {
  // === IDENTIFICATION ===
  articleKey: 'blogSalsaVsBachata',
  slug: 'salsa-vs-bachata-que-estilo-elegir',
  category: 'tips',

  // === AUTHOR (E-E-A-T) ===
  authorId: 'yunaisy',

  // === PILLAR/CLUSTER STRATEGY (2026 SEO) ===
  contentType: 'pillar',
  clusterSlugs: [
    'salsa-ritmo-conquisto-mundo',
    'historia-bachata-barcelona',
    'beneficios-bailar-salsa',
  ],

  // === DATES ===
  datePublished: '2026-01-16',
  dateModified: '2026-01-16',

  // === READING METRICS ===
  readingTime: 12,
  wordCount: 2800,

  // === SUMMARY (GEO Optimized) ===
  summaryBullets: [
    'blogSalsaVsBachata_summaryBullet1',
    'blogSalsaVsBachata_summaryBullet2',
    'blogSalsaVsBachata_summaryBullet3',
    'blogSalsaVsBachata_summaryBullet4',
  ],

  // === KEY STATISTICS (Holographic Cards with GEO Citations) ===
  summaryStats: [
    {
      value: '1960s',
      labelKey: 'blogSalsaVsBachata_statSalsaOrigenLabel',
      citation: {
        source: 'Mucho Más Que Baile',
        url: 'https://www.muchomasquebaile.es/wp-content/uploads/2021/11/Historia-de-la-salsa-desde-las-raices-hasta-el-1975.pdf',
        year: '2023',
        authors: 'Ramos Gandía',
      },
    },
    {
      value: '1960s',
      labelKey: 'blogSalsaVsBachata_statBachataOrigenLabel',
      citation: {
        source: 'Temple University Press',
        url: 'https://archive.org/details/bachatasocialhist00paci',
        year: '1995',
        authors: 'Pacini Hernández',
      },
    },
    {
      value: '2019',
      labelKey: 'blogSalsaVsBachata_statUNESCOLabel',
      citation: {
        source: 'UNESCO Patrimonio Cultural Inmaterial',
        url: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
        year: '2019',
        authors: 'UNESCO',
      },
    },
    {
      value: '76%',
      labelKey: 'blogSalsaVsBachata_statDemenciaLabel',
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
      contentKey: 'blogSalsaVsBachata_intro',
    },
    {
      id: 'intro-2',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_intro2',
    },

    // =====================================================
    // ANSWER CAPSULE 1: ¿Cuál elegir? (72% AI Citation Rate)
    // =====================================================
    {
      id: 'answer-cual-elegir',
      type: 'answer-capsule',
      contentKey: 'blogSalsaVsBachata_answerCualElegir',
      answerCapsule: {
        questionKey: 'blogSalsaVsBachata_answerCualElegirQ',
        answerKey: 'blogSalsaVsBachata_answerCualElegirA',
        sourcePublisher: "Farray's Dance Center",
        confidence: 'verified',
        icon: 'star',
      },
    },

    // =====================================================
    // SECTION 1: ORÍGENES - DOS HISTORIAS PARALELAS
    // =====================================================
    {
      id: 'origenes',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_origenesTitle',
    },

    // === DEFINITION: Salsa (LLM Extraction) ===
    {
      id: 'definition-salsa',
      type: 'definition',
      contentKey: 'blogSalsaVsBachata_defSalsa',
      definitionTermKey: 'blogSalsaVsBachata_defSalsaTerm',
    },

    {
      id: 'origenes-salsa',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_origenesSalsa',
    },

    // === DEFINITION: Bachata (LLM Extraction) ===
    {
      id: 'definition-bachata',
      type: 'definition',
      contentKey: 'blogSalsaVsBachata_defBachata',
      definitionTermKey: 'blogSalsaVsBachata_defBachataTerm',
    },

    {
      id: 'origenes-bachata',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_origenesBachata',
    },

    // === STATISTIC: UNESCO Recognition ===
    {
      id: 'stat-unesco',
      type: 'statistic',
      contentKey: 'blogSalsaVsBachata_statUNESCOContent',
      statisticValue: '2019',
      statisticSource: 'UNESCO Patrimonio Cultural Inmaterial',
    },

    // =====================================================
    // SECTION 2: LA MÚSICA - RITMOS QUE HABLAN
    // =====================================================
    {
      id: 'musica',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_musicaTitle',
    },
    {
      id: 'musica-salsa',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_musicaSalsa',
    },
    {
      id: 'musica-bachata',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_musicaBachata',
    },

    // =====================================================
    // SECTION 3: EL BAILE - MOVIMIENTO Y EXPRESIÓN
    // =====================================================
    {
      id: 'baile',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_baileTitle',
    },
    {
      id: 'baile-salsa',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_baileSalsa',
    },
    {
      id: 'baile-bachata',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_baileBachata',
    },

    // === COMPARISON TABLE ===
    {
      id: 'tabla-comparativa',
      type: 'comparison-table',
      contentKey: 'blogSalsaVsBachata_tablaTitle',
      tableConfig: {
        headers: [
          'blogSalsaVsBachata_tablaHeader1',
          'blogSalsaVsBachata_tablaHeader2',
          'blogSalsaVsBachata_tablaHeader3',
        ],
        rows: [
          [
            'blogSalsaVsBachata_tablaRow1Col1',
            'blogSalsaVsBachata_tablaRow1Col2',
            'blogSalsaVsBachata_tablaRow1Col3',
          ],
          [
            'blogSalsaVsBachata_tablaRow2Col1',
            'blogSalsaVsBachata_tablaRow2Col2',
            'blogSalsaVsBachata_tablaRow2Col3',
          ],
          [
            'blogSalsaVsBachata_tablaRow3Col1',
            'blogSalsaVsBachata_tablaRow3Col2',
            'blogSalsaVsBachata_tablaRow3Col3',
          ],
          [
            'blogSalsaVsBachata_tablaRow4Col1',
            'blogSalsaVsBachata_tablaRow4Col2',
            'blogSalsaVsBachata_tablaRow4Col3',
          ],
          [
            'blogSalsaVsBachata_tablaRow5Col1',
            'blogSalsaVsBachata_tablaRow5Col2',
            'blogSalsaVsBachata_tablaRow5Col3',
          ],
        ],
      },
    },

    // =====================================================
    // SECTION 4: ¿CUÁL ES MÁS FÁCIL APRENDER?
    // =====================================================
    {
      id: 'aprendizaje',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_aprendizajeTitle',
    },

    // === ANSWER CAPSULE 2: ¿Cuál es más fácil? (72% AI Citation) ===
    {
      id: 'answer-mas-facil',
      type: 'answer-capsule',
      contentKey: 'blogSalsaVsBachata_answerMasFacil',
      answerCapsule: {
        questionKey: 'blogSalsaVsBachata_answerMasFacilQ',
        answerKey: 'blogSalsaVsBachata_answerMasFacilA',
        sourcePublisher: "Experiencia docente Farray's Dance Center",
        confidence: 'high',
        icon: 'lightbulb',
      },
    },

    {
      id: 'aprendizaje-intro',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_aprendizajeIntro',
    },
    {
      id: 'aprendizaje-bachata',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_aprendizajeBachata',
    },
    {
      id: 'aprendizaje-salsa',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_aprendizajeSalsa',
    },

    // === CALLOUT TIP: Consejo para principiantes ===
    {
      id: 'callout-tip-principiantes',
      type: 'callout',
      contentKey: 'blogSalsaVsBachata_calloutTip',
      calloutType: 'tip',
    },

    // =====================================================
    // SECTION 5: BENEFICIOS PARA LA SALUD
    // =====================================================
    {
      id: 'beneficios',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_beneficiosTitle',
    },

    // === ANSWER CAPSULE 3: Beneficios científicos (72% AI Citation) ===
    {
      id: 'answer-beneficios',
      type: 'answer-capsule',
      contentKey: 'blogSalsaVsBachata_answerBeneficios',
      answerCapsule: {
        questionKey: 'blogSalsaVsBachata_answerBeneficiosQ',
        answerKey: 'blogSalsaVsBachata_answerBeneficiosA',
        sourceUrl: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
        sourcePublisher: 'New England Journal of Medicine',
        sourceYear: '2003',
        confidence: 'verified',
        icon: 'check',
      },
    },

    {
      id: 'beneficios-intro',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_beneficiosIntro',
    },

    // === STATISTIC: Calorías quemadas ===
    {
      id: 'stat-calorias',
      type: 'statistic',
      contentKey: 'blogSalsaVsBachata_statCaloriasContent',
      statisticValue: '400-600',
      statisticSource: 'Harvard Health Publishing, 2021',
    },

    // === STATISTIC: Reducción demencia ===
    {
      id: 'stat-demencia',
      type: 'statistic',
      contentKey: 'blogSalsaVsBachata_statDemenciaContent',
      statisticValue: '76%',
      statisticSource: 'New England Journal of Medicine, 2003',
    },

    {
      id: 'beneficios-lista',
      type: 'list',
      contentKey: 'blogSalsaVsBachata_beneficiosListaTitle',
      listItems: [
        'blogSalsaVsBachata_beneficioCardio',
        'blogSalsaVsBachata_beneficioCognitivo',
        'blogSalsaVsBachata_beneficioEmocional',
        'blogSalsaVsBachata_beneficioSocial',
      ],
    },

    // === STATISTIC: Liberación de endorfinas ===
    {
      id: 'stat-endorfinas',
      type: 'statistic',
      contentKey: 'blogSalsaVsBachata_statEndorfinasContent',
      statisticValue: '+21%',
      statisticSource: 'Evolution and Human Behavior, 2016',
    },

    // =====================================================
    // SECTION 6: ¿POR QUÉ NO APRENDER AMBOS?
    // =====================================================
    {
      id: 'ambos',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_ambosTitle',
    },
    {
      id: 'ambos-content',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_ambosContent',
    },
    {
      id: 'ambos-farrays',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_ambosFarrays',
    },

    // =====================================================
    // TESTIMONIAL SECTION (Social Proof with Schema)
    // =====================================================
    {
      id: 'testimonial-alumno',
      type: 'testimonial',
      contentKey: 'blogSalsaVsBachata_testimonial',
      testimonial: {
        authorName: 'María González',
        authorLocation: 'Barcelona',
        textKey: 'blogSalsaVsBachata_testimonialText',
        rating: 5,
        datePublished: '2026-01-15',
        reviewOf: 'course',
      },
    },

    // =====================================================
    // SECTION 7: CONCLUSIÓN
    // =====================================================
    {
      id: 'conclusion',
      type: 'heading',
      level: 2,
      contentKey: 'blogSalsaVsBachata_conclusionTitle',
    },
    {
      id: 'conclusion-content',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_conclusionContent',
    },
    {
      id: 'conclusion-cta',
      type: 'paragraph',
      contentKey: 'blogSalsaVsBachata_conclusionCTA',
    },

    // === CALLOUT CTA: Reserva tu clase ===
    {
      id: 'callout-cta-clases',
      type: 'callout',
      contentKey: 'blogSalsaVsBachata_calloutCTA',
      calloutType: 'cta',
    },

    // =====================================================
    // REFERENCES SECTION (E-E-A-T)
    // =====================================================
    {
      id: 'references-section',
      type: 'references',
      contentKey: 'blogSalsaVsBachata_referencesIntro',
      references: [
        {
          id: 'ramos-gandia',
          titleKey: 'blogSalsaVsBachata_refRamosTitle',
          url: 'https://www.muchomasquebaile.es/wp-content/uploads/2021/11/Historia-de-la-salsa-desde-las-raices-hasta-el-1975.pdf',
          publisher: 'Mucho Más Que Baile',
          year: '2023',
          descriptionKey: 'blogSalsaVsBachata_refRamosDesc',
        },
        {
          id: 'pacini-hernandez',
          titleKey: 'blogSalsaVsBachata_refPaciniTitle',
          url: 'https://archive.org/details/bachatasocialhist00paci',
          publisher: 'Temple University Press',
          year: '1995',
          descriptionKey: 'blogSalsaVsBachata_refPaciniDesc',
        },
        {
          id: 'unesco-bachata',
          titleKey: 'blogSalsaVsBachata_refUNESCOTitle',
          url: 'https://ich.unesco.org/es/RL/la-bachata-dominicana-01514',
          publisher: 'UNESCO',
          year: '2019',
          descriptionKey: 'blogSalsaVsBachata_refUNESCODesc',
        },
        {
          id: 'nejm-dementia',
          titleKey: 'blogSalsaVsBachata_refNEJMTitle',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa022252',
          publisher: 'New England Journal of Medicine',
          year: '2003',
          descriptionKey: 'blogSalsaVsBachata_refNEJMDesc',
        },
        {
          id: 'harvard-calories',
          titleKey: 'blogSalsaVsBachata_refHarvardTitle',
          url: 'https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-for-people-of-three-different-weights',
          publisher: 'Harvard Health Publishing',
          year: '2021',
          descriptionKey: 'blogSalsaVsBachata_refHarvardDesc',
        },
        {
          id: 'frontiers-wellbeing',
          titleKey: 'blogSalsaVsBachata_refFrontiersTitle',
          url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01221/full',
          publisher: 'Frontiers in Psychology',
          year: '2019',
          descriptionKey: 'blogSalsaVsBachata_refFrontiersDesc',
        },
        {
          id: 'sciencedirect-endorphins',
          titleKey: 'blogSalsaVsBachata_refEndorphinsTitle',
          url: 'https://www.sciencedirect.com/science/article/abs/pii/S1090513816300113',
          publisher: 'Evolution and Human Behavior',
          year: '2016',
          descriptionKey: 'blogSalsaVsBachata_refEndorphinsDesc',
        },
      ],
    },
  ],

  // === FEATURED IMAGE ===
  featuredImage: {
    src: '/images/blog/salsa-vs-bachata/hero.webp',
    srcSet:
      '/images/blog/salsa-vs-bachata/hero-480.webp 480w, /images/blog/salsa-vs-bachata/hero-960.webp 960w, /images/blog/salsa-vs-bachata/hero.webp 1200w',
    alt: 'Parejas bailando estilos latinos en nuestra academia de baile de Barcelona, mostrando elegancia y conexión entre salsa y bachata',
    altKey: 'blogSalsaVsBachata_heroAlt',
    width: 1200,
    height: 630,
  },
  ogImage: '/images/blog/salsa-vs-bachata/og.jpg',

  // === NAVIGATION ===
  breadcrumbConfig: {
    homeKey: 'blog_breadcrumbHome',
    blogKey: 'blog_breadcrumbBlog',
    categoryKey: 'blog_category_tips',
    categoryUrl: '/blog/tips',
    currentKey: 'blogSalsaVsBachata_breadcrumbCurrent',
  },

  // === FAQ SECTION (8 FAQs for SEO Schema) ===
  faqSection: {
    enabled: true,
    titleKey: 'blogSalsaVsBachata_faqTitle',
    faqs: [
      {
        id: '1',
        questionKey: 'blogSalsaVsBachata_faq1Question',
        answerKey: 'blogSalsaVsBachata_faq1Answer',
      },
      {
        id: '2',
        questionKey: 'blogSalsaVsBachata_faq2Question',
        answerKey: 'blogSalsaVsBachata_faq2Answer',
      },
      {
        id: '3',
        questionKey: 'blogSalsaVsBachata_faq3Question',
        answerKey: 'blogSalsaVsBachata_faq3Answer',
      },
      {
        id: '4',
        questionKey: 'blogSalsaVsBachata_faq4Question',
        answerKey: 'blogSalsaVsBachata_faq4Answer',
      },
      {
        id: '5',
        questionKey: 'blogSalsaVsBachata_faq5Question',
        answerKey: 'blogSalsaVsBachata_faq5Answer',
      },
      {
        id: '6',
        questionKey: 'blogSalsaVsBachata_faq6Question',
        answerKey: 'blogSalsaVsBachata_faq6Answer',
      },
      {
        id: '7',
        questionKey: 'blogSalsaVsBachata_faq7Question',
        answerKey: 'blogSalsaVsBachata_faq7Answer',
      },
      {
        id: '8',
        questionKey: 'blogSalsaVsBachata_faq8Question',
        answerKey: 'blogSalsaVsBachata_faq8Answer',
      },
    ],
  },

  // === RELATED ARTICLES ===
  relatedArticles: [
    {
      slug: 'salsa-ritmo-conquisto-mundo',
      category: 'historia',
      titleKey: 'blogSalsaRitmo_title',
      excerptKey: 'blogSalsaRitmo_excerpt',
      image: '/images/blog/salsa-ritmo/hero.webp',
    },
    {
      slug: 'historia-bachata-barcelona',
      category: 'historia',
      titleKey: 'blogHistoriaBachata_title',
      excerptKey: 'blogHistoriaBachata_excerpt',
      image: '/images/blog/historia-bachata/hero.webp',
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

  // === SPEAKABLE (Voice Search GEO) ===
  speakableSelectors: [
    '#article-summary',
    '#intro',
    '#origenes',
    '#musica',
    '#baile',
    '#aprendizaje',
    '#beneficios',
    '#ambos',
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
    reviewCount: 127,
    bestRating: 5,
    worstRating: 1,
  },

  // === GOOGLE DISCOVER OPTIMIZATION ===
  discoverOptimized: true,
};
