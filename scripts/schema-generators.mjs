/**
 * JSON-LD Schema Generators for Pre-rendering (Build Time)
 *
 * Pure functions that generate schema.org JSON-LD objects.
 * Used by prerender.mjs to inject structured data into static HTML.
 *
 * All translation keys come from pages.json (already loaded by prerender.mjs).
 * Reference implementation: components/SchemaMarkup.tsx
 */

const BASE_URL = 'https://www.farrayscenter.com';

/**
 * Strip HTML tags from a string, keeping only plain text.
 * Used to clean FAQ answers for JSON-LD schema (visual HTML stays in translations).
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')           // <br> → space
    .replace(/<\/?(p|div|li)>/gi, ' ')       // block elements → space
    .replace(/<[^>]+>/g, '')                 // strip remaining tags
    .replace(/\s{2,}/g, ' ')                 // collapse whitespace
    .trim();
}

const REVIEW_STATS = {
  ratingValue: '4.9',
  reviewCount: '509',
  bestRating: '5',
  worstRating: '1',
};

const OPENING_HOURS = [
  { dayOfWeek: 'Monday', opens: '10:30', closes: '13:00' },
  { dayOfWeek: 'Wednesday', opens: '10:30', closes: '13:00' },
  { dayOfWeek: 'Thursday', opens: '09:30', closes: '12:00' },
  { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '17:30', closes: '23:00' },
  { dayOfWeek: 'Friday', opens: '17:30', closes: '20:00' },
];

const SAME_AS = [
  'https://www.instagram.com/farrays_centerbcn/',
  'https://www.facebook.com/farrayscenter/',
  'https://www.youtube.com/@farraysinternationaldance',
  'https://www.tiktok.com/@farrays_centerbcn',
  'https://g.page/r/Ca9MFoK1mqdHEBM',
];

const LOCALE_TO_INLANGUAGE = {
  es: 'es-ES',
  ca: 'ca-ES',
  en: 'en-GB',
  fr: 'fr-FR',
};

/**
 * Organization Schema (@id: #organization)
 * Reference: SchemaMarkup.tsx line 45
 */
export function generateOrganizationSchema(t, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: "Farray's International Dance Center",
    alternateName: ['FIDC', "Farray's Dance Center", 'Farrays Center'],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/logo-fidc.png`,
      width: '512',
      height: '512',
    },
    image: `${BASE_URL}/images/og-home.jpg`,
    description: t['schema_org_description'] || '',
    foundingDate: '2017',
    founder: {
      '@type': 'Person',
      name: 'Yunaisy Farray',
      jobTitle: t['schema_founderJobTitle'] || '',
      url: `${BASE_URL}/${locale}/yunaisy-farray`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: t['schema_streetAddress'] || '',
      addressLocality: 'Barcelona',
      postalCode: '08015',
      addressRegion: t['schema_addressRegion'] || '',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '41.380421',
      longitude: '2.148014',
    },
    telephone: '+34622247085',
    email: 'info@farrayscenter.com',
    sameAs: SAME_AS,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34622247085',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'Catalan', 'English', 'French'],
      areaServed: 'ES',
    },
    areaServed: {
      '@type': 'City',
      name: 'Barcelona',
      '@id': 'https://www.wikidata.org/wiki/Q1492',
    },
    knowsAbout: [
      'Dancehall', 'Twerk', 'Afrobeats', 'Hip Hop', 'Reggaeton',
      'Heels Dance', 'Salsa Cubana', 'Ballet', 'Contemporary Dance', 'Modern Jazz',
    ],
    slogan: 'Dance Your Dreams',
    priceRange: '€€',
    openingHoursSpecification: OPENING_HOURS.map(h => ({
      '@type': 'OpeningHoursSpecification',
      ...h,
    })),
    memberOf: {
      '@type': 'Organization',
      name: 'CID - International Dance Council UNESCO',
      url: 'https://www.cid-world.org/',
      description: 'Official partner of UNESCO for dance',
    },
  };
}

/**
 * WebSite Schema (@id: #website)
 * Reference: SchemaMarkup.tsx line 174
 */
export function generateWebSiteSchema(t, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Farray's International Dance Center",
    description: t['schema_website_description'] || '',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: ['es-ES', 'ca-ES', 'en-GB', 'fr-FR'],
    datePublished: '2017-01-01',
    dateModified: '2026-01-25',
    copyrightYear: 2017,
    copyrightHolder: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${locale}/clases/baile-barcelona?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * LocalBusiness Schema with AggregateRating (@id: #danceschool)
 * Reference: SchemaMarkup.tsx line 942
 */
export function generateLocalBusinessSchema(t) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#danceschool`,
    name: "Farray's International Dance Center",
    alternateName: "Farray's Center",
    description: t['schema_danceschool_description'] || '',
    url: BASE_URL,
    telephone: '+34622247085',
    email: 'info@farrayscenter.com',
    priceRange: '€€',
    image: `${BASE_URL}/images/og-home.jpg`,
    logo: `${BASE_URL}/images/logo-fidc.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: t['schema_streetAddress'] || '',
      addressLocality: 'Barcelona',
      postalCode: '08015',
      addressRegion: t['schema_addressRegion'] || '',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '41.380421',
      longitude: '2.148014',
    },
    openingHoursSpecification: OPENING_HOURS.map(h => ({
      '@type': 'OpeningHoursSpecification',
      ...h,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: REVIEW_STATS.ratingValue,
      reviewCount: REVIEW_STATS.reviewCount,
      bestRating: REVIEW_STATS.bestRating,
      worstRating: REVIEW_STATS.worstRating,
    },
    sameAs: SAME_AS,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t['schema_catalog_danceClasses'] || 'Dance Classes',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: t['schema_catalog_latinDances'] || 'Latin Dances',
          itemListElement: [
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Salsa Cubana' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Bachata' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Salsa Lady Style' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: t['schema_catalog_urbanDances'] || 'Urban Dances',
          itemListElement: [
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Hip Hop' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Dancehall' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Twerk' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Afrobeats' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: t['schema_catalog_dance'] || 'Dance',
          itemListElement: [
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Contemporáneo' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Ballet' } },
            { '@type': 'Offer', price: '50', priceCurrency: 'EUR', itemOffered: { '@type': 'Course', name: 'Modern Jazz' } },
          ],
        },
      ],
    },
  };
}

/**
 * BreadcrumbList Schema (dynamic per page)
 * Reference: SchemaMarkup.tsx line 915
 *
 * @param {string} routePath - Full route path (e.g., 'es/clases/dancehall-barcelona')
 * @param {string} lang - Language code (es, ca, en, fr)
 * @param {object} meta - Page metadata with title
 * @param {object} t - Translation object (pages.json)
 */
export function generateBreadcrumbSchema(routePath, lang, meta, t) {
  const items = [
    { name: t['schema_nav_home'] || 'Home', url: `${BASE_URL}/${lang}` },
  ];

  // Parse route segments (skip the locale prefix)
  let pathWithoutLocale = routePath.startsWith(`${lang}/`)
    ? routePath.slice(lang.length + 1)
    : routePath;

  // Home page: routePath is just the locale (e.g., 'es') — treat as empty
  if (pathWithoutLocale === lang) {
    pathWithoutLocale = '';
  }

  if (pathWithoutLocale) {
    const segments = pathWithoutLocale.split('/');

    // Map known first-level segments to nav translation keys
    const sectionMap = {
      'clases': 'schema_nav_danceClasses',
      'blog': 'schema_nav_blog',
      'contacto': 'schema_nav_contact',
      'contact': 'schema_nav_contact',
      'horarios-clases-baile-barcelona': 'schema_nav_schedule',
      'precios': 'schema_nav_prices',
      'prices': 'schema_nav_prices',
      'servicios-baile-barcelona': 'schema_nav_services',
      'sobre-nosotros': 'schema_nav_aboutUs',
      'about-us': 'schema_nav_aboutUs',
    };

    if (segments.length >= 1) {
      const firstSegment = segments[0];
      const sectionKey = sectionMap[firstSegment];

      if (sectionKey && segments.length > 1) {
        // Multi-level: add section breadcrumb
        items.push({
          name: t[sectionKey] || firstSegment,
          url: `${BASE_URL}/${lang}/${firstSegment === 'clases' ? 'clases/baile-barcelona' : firstSegment}`,
        });
      }

      // Add current page as last breadcrumb (use meta title, trimmed)
      const pageTitle = meta.title ? meta.title.split('|')[0].split('-')[0].trim() : pathWithoutLocale;
      items.push({
        name: pageTitle,
        url: `${BASE_URL}/${routePath}`,
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQPage Schema (for GEO value — AI crawlers parse this)
 * Reference: SchemaMarkup.tsx line 821
 *
 * @param {string} styleKey - Translation prefix (e.g., 'dhV3', 'bachataV3')
 * @param {object} t - Translation object (pages.json)
 * @returns {object|null} FAQPage schema or null if no FAQs found
 */
export function generateFAQPageSchema(styleKey, t) {
  const faqs = [];

  for (let i = 1; i <= 18; i++) {
    const question = t[`${styleKey}FaqQ${i}`];
    const answer = t[`${styleKey}FaqA${i}`];
    if (question && answer) {
      faqs.push({
        '@type': 'Question',
        name: stripHtml(question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(answer),
        },
      });
    }
  }

  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  };
}

/**
 * Flexible FAQPage Schema — handles all translation key patterns in the codebase.
 * Used for pages NOT in STYLE_KEY_MAP (service pages, category pages, etc.)
 *
 * Supports 4 patterns:
 *   A: ${prefix}FaqQ${i} / ${prefix}FaqA${i}       (e.g., homeFaqQ1)
 *   B: ${prefix}Q${i} / ${prefix}A${i}              (e.g., particularesPage_faqQ1)
 *   C: ${prefix}_faq${i}_q / ${prefix}_faq${i}_a    (e.g., regalaBaile_faq1_q)
 *   D: ${prefix}_faq${i}_question / ${prefix}_faq${i}_answer (e.g., teamBuilding_faq1_question)
 *
 * @param {string} prefix - Translation key prefix
 * @param {object} t - Translation object
 * @returns {object|null} FAQPage schema or null if no FAQs found
 */
export function generateFlexibleFAQSchema(prefix, t) {
  const faqs = [];

  for (let i = 1; i <= 18; i++) {
    let question, answer;

    // Pattern A: ${prefix}FaqQ${i}
    question = t[`${prefix}FaqQ${i}`];
    answer = t[`${prefix}FaqA${i}`];

    // Pattern B: ${prefix}Q${i}
    if (!question) {
      question = t[`${prefix}Q${i}`];
      answer = t[`${prefix}A${i}`];
    }

    // Pattern C: ${prefix}_faq${i}_q
    if (!question) {
      question = t[`${prefix}_faq${i}_q`];
      answer = t[`${prefix}_faq${i}_a`];
    }

    // Pattern D: ${prefix}_faq${i}_question
    if (!question) {
      question = t[`${prefix}_faq${i}_question`];
      answer = t[`${prefix}_faq${i}_answer`];
    }

    if (question && answer) {
      faqs.push({
        '@type': 'Question',
        name: stripHtml(question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(answer),
        },
      });
    }
  }

  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  };
}

/**
 * Course Schema (basic — for Google carousel, without deprecated CourseInstance)
 * Reference: SchemaMarkup.tsx line 502
 *
 * @param {string} styleKey - Translation prefix (e.g., 'dhV3', 'bachataV3')
 * @param {object} t - Translation object (pages.json)
 * @param {string} pageUrl - Full page URL
 * @param {string} locale - Language code
 * @returns {object|null} Course schema or null if no course data found
 */
export function generateCourseSchema(styleKey, t, pageUrl, locale) {
  const name = t[`${styleKey}CourseSchemaName`];
  const description = t[`${styleKey}CourseSchemaDesc`];

  if (!name) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${pageUrl}#course`,
    name,
    description: description || '',
    inLanguage: LOCALE_TO_INLANGUAGE[locale] || 'es-ES',
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${BASE_URL}/#organization`,
      name: "Farray's International Dance Center",
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      category: 'Subscription',
      price: '50',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
  };
}

// ============================================================
// BLOG ARTICLE SCHEMAS
// ============================================================

/**
 * Static metadata for blog articles.
 * Extracted from constants/blog/articles/*.ts (TypeScript configs not importable from .mjs).
 * Maps prerender page keys to article schema data.
 *
 * When adding a new blog article, add its entry here.
 */
export const BLOG_ARTICLE_DATA = {
  blogBeneficiosSalsa: {
    articleKey: 'blogBeneficiosSalsa',
    slug: 'beneficios-bailar-salsa',
    category: 'lifestyle',
    datePublished: '2025-01-15',
    dateModified: '2026-01-24',
    wordCount: 2500,
    image: { src: '/images/blog/beneficios-salsa/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogHistoriaSalsa: {
    articleKey: 'blogHistoriaSalsa',
    slug: 'historia-salsa-barcelona',
    category: 'historia',
    datePublished: '2025-01-20',
    dateModified: '2026-01-24',
    wordCount: 3000,
    image: { src: '/images/blog/historia-salsa/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogClasesSalsaBarcelona: {
    articleKey: 'blogClasesSalsaBarcelona',
    slug: 'clases-de-salsa-barcelona',
    category: 'lifestyle',
    datePublished: '2019-04-24',
    dateModified: '2026-01-24',
    wordCount: 850,
    image: { src: '/images/blog/hablemos-salsa/hero.webp', width: 1200, height: 630 },
    faqCount: 6,
  },
  blogSalsaVsBachata: {
    articleKey: 'blogSalsaVsBachata',
    slug: 'salsa-vs-bachata-que-estilo-elegir',
    category: 'tips',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    wordCount: 2800,
    image: { src: '/images/blog/salsa-vs-bachata/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogBaileSaludMental: {
    articleKey: 'blogBaileSaludMental',
    slug: 'baile-salud-mental',
    category: 'fitness',
    datePublished: '2026-01-17',
    dateModified: '2026-01-17',
    wordCount: 2800,
    image: { src: '/images/blog/beneficios-salsa/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogHistoriaBachata: {
    articleKey: 'blogHistoriaBachata',
    slug: 'historia-bachata-barcelona',
    category: 'historia',
    datePublished: '2025-01-20',
    dateModified: '2026-01-24',
    wordCount: 3200,
    image: { src: '/images/blog/historia-bachata/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogSalsaRitmo: {
    articleKey: 'blogSalsaRitmo',
    slug: 'salsa-ritmo-conquisto-mundo',
    category: 'historia',
    datePublished: '2025-01-20',
    dateModified: '2026-01-16',
    wordCount: 2400,
    image: { src: '/images/blog/salsa-ritmo/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogAcademiaDanza: {
    articleKey: 'blogAcademiaDanza',
    slug: 'academia-de-danza-barcelona-guia-completa',
    category: 'tips',
    datePublished: '2026-01-29',
    dateModified: '2026-01-29',
    wordCount: 2600,
    image: { src: '/images/blog/academia-danza-barcelona/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogBalletAdultos: {
    articleKey: 'blogBalletAdultos',
    slug: 'ballet-para-adultos-barcelona',
    category: 'tips',
    datePublished: '2026-01-29',
    dateModified: '2026-01-29',
    wordCount: 2600,
    image: { src: '/images/blog/ballet-adultos/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogClasesPrincipiantes: {
    articleKey: 'blogClasesPrincipiantes',
    slug: 'clases-baile-principiantes-barcelona-farrays',
    category: 'tips',
    datePublished: '2025-01-15',
    dateModified: '2026-01-24',
    wordCount: 1500,
    image: { src: '/images/blog/clases-principiantes/hero.webp', width: 1200, height: 630 },
    faqCount: 5,
  },
  blogPerderMiedoBailar: {
    articleKey: 'blogPerderMiedoBailar',
    slug: 'como-perder-miedo-bailar',
    category: 'lifestyle',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    wordCount: 2400,
    image: { src: '/images/blog/como-perder-miedo/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogDanzasUrbanas: {
    articleKey: 'blogDanzasUrbanas',
    slug: 'danzas-urbanas-barcelona-guia-completa',
    category: 'tips',
    datePublished: '2026-02-04',
    dateModified: '2026-02-04',
    wordCount: 3100,
    image: { src: '/images/blog/danzas-urbanas/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
  blogModernJazz: {
    articleKey: 'blogModernJazz',
    slug: 'modern-jazz-barcelona-guia-completa',
    category: 'tips',
    datePublished: '2026-02-11',
    dateModified: '2026-02-11',
    wordCount: 4500,
    image: { src: '/images/blog/modern-jazz/hero.webp', width: 1200, height: 630 },
    faqCount: 10,
  },
  blogDanzaContemporaneaVsJazzBallet: {
    articleKey: 'blog_danzaContemporaneaVsJazzBallet',
    slug: 'danza-contemporanea-vs-modern-jazz-vs-ballet',
    category: 'tips',
    datePublished: '2026-01-29',
    dateModified: '2026-01-29',
    wordCount: 3200,
    image: { src: '/images/blog/danza-contemporanea-vs-jazz-ballet/hero.webp', width: 1200, height: 630 },
    faqCount: 8,
  },
};

/**
 * Default author for all blog articles (Yunaisy Farray).
 * Data from constants/blog/author.ts
 */
const DEFAULT_BLOG_AUTHOR = {
  name: 'Yunaisy Farray',
  image: '/images/teachers/yunaisy-farray.webp',
  profilePath: '/yunaisy-farray',
  sameAs: [
    'https://www.instagram.com/farrays_centerbcn/',
    'https://www.facebook.com/farrayscenter/',
  ],
};

/**
 * Article Schema (BlogPosting) for blog pages.
 * Reference: BlogSchemas.tsx lines 56-100
 *
 * @param {object} articleData - Entry from BLOG_ARTICLE_DATA
 * @param {object} blogT - blog.json translations for this locale
 * @param {string} pageUrl - Full page URL
 * @param {string} locale - Language code
 * @returns {object} Article schema
 */
export function generateArticleSchema(articleData, blogT, pageUrl, locale) {
  const { articleKey } = articleData;
  const headline = blogT[`${articleKey}_title`] || '';
  const description = blogT[`${articleKey}_metaDescription`] || '';
  const authorRoleKey = blogT['blog_authorRole'] || 'Directora y Fundadora';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline,
    description,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}${articleData.image.src}`,
      width: articleData.image.width,
      height: articleData.image.height,
    },
    datePublished: articleData.datePublished,
    dateModified: articleData.dateModified,
    wordCount: articleData.wordCount,
    inLanguage: LOCALE_TO_INLANGUAGE[locale] || 'es-ES',
    articleSection: articleData.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    author: {
      '@type': 'Person',
      name: DEFAULT_BLOG_AUTHOR.name,
      url: `${BASE_URL}/${locale}${DEFAULT_BLOG_AUTHOR.profilePath}`,
      image: `${BASE_URL}${DEFAULT_BLOG_AUTHOR.image}`,
      jobTitle: authorRoleKey,
      sameAs: DEFAULT_BLOG_AUTHOR.sameAs,
      worksFor: {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: "Farray's International Dance Center",
      },
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: "Farray's International Dance Center",
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo-fidc.png`,
        width: 512,
        height: 512,
      },
    },
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
  };
}

/**
 * FAQPage Schema for blog articles.
 * Uses blog.json translation keys: ${articleKey}_faq${n}Question / ${articleKey}_faq${n}Answer
 *
 * @param {object} articleData - Entry from BLOG_ARTICLE_DATA
 * @param {object} blogT - blog.json translations for this locale
 * @returns {object|null} FAQPage schema or null if no FAQs found
 */
export function generateBlogFAQSchema(articleData, blogT) {
  const { articleKey, faqCount } = articleData;
  const faqs = [];

  for (let i = 1; i <= faqCount; i++) {
    const question = blogT[`${articleKey}_faq${i}Question`];
    const answer = blogT[`${articleKey}_faq${i}Answer`];
    if (question && answer) {
      faqs.push({
        '@type': 'Question',
        name: stripHtml(question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(answer),
        },
      });
    }
  }

  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  };
}

/**
 * Generate all JSON-LD script tags for a given page.
 *
 * @param {object} options
 * @param {string} options.routePath - Full route path (e.g., 'es/clases/dancehall-barcelona')
 * @param {string} options.lang - Language code (es, ca, en, fr)
 * @param {string} options.page - Page key (e.g., 'dancehall', 'home')
 * @param {object} options.meta - Page metadata { title, description }
 * @param {object} options.translations - pages.json translations for this locale
 * @param {object} options.blogTranslations - blog.json translations for this locale
 * @param {object} options.homeTranslations - home.json translations for this locale
 * @param {object} options.scheduleTranslations - schedule.json translations for this locale
 * @param {object} options.styleKeyMap - STYLE_KEY_MAP from prerender.mjs
 * @param {object} options.faqPageMap - FAQ_PAGE_MAP from prerender.mjs
 * @returns {string} HTML string with <script type="application/ld+json"> tags
 */
export function generateAllJsonLd({ routePath, lang, page, meta, translations, blogTranslations, homeTranslations, scheduleTranslations, styleKeyMap, faqPageMap }) {
  const t = translations;
  const schemas = [];

  // 1. Global schemas (all pages)
  schemas.push(generateOrganizationSchema(t, lang));
  schemas.push(generateWebSiteSchema(t, lang));
  schemas.push(generateLocalBusinessSchema(t));
  schemas.push(generateBreadcrumbSchema(routePath, lang, meta, t));

  // 2. Class page schemas (only if page has a style key mapping)
  const styleKey = styleKeyMap[page];
  if (styleKey) {
    const faqSchema = generateFAQPageSchema(styleKey, t);
    if (faqSchema) schemas.push(faqSchema);

    // Note: Course schema is NOT generated here — React's CourseSchemaEnterprise
    // (with hasCourseInstance + schedules) is the authoritative Course schema.
    // Generating a basic Course here would create a duplicate entity.
  }

  // 3. Blog article schemas (Article + FAQPage)
  const blogData = BLOG_ARTICLE_DATA[page];
  if (blogData && blogTranslations) {
    const pageUrl = `${BASE_URL}/${routePath}`;

    schemas.push(generateArticleSchema(blogData, blogTranslations, pageUrl, lang));

    const blogFaqSchema = generateBlogFAQSchema(blogData, blogTranslations);
    if (blogFaqSchema) schemas.push(blogFaqSchema);
  }

  // 4. Standalone page FAQs (pages not in STYLE_KEY_MAP that have their own FAQ sections)
  const faqEntry = faqPageMap && faqPageMap[page];
  if (faqEntry) {
    // Select the correct translation namespace
    const nsMap = { pages: translations, home: homeTranslations, schedule: scheduleTranslations };
    const faqTranslations = nsMap[faqEntry.ns] || translations;
    const faqSchema = generateFlexibleFAQSchema(faqEntry.prefix, faqTranslations);
    if (faqSchema) schemas.push(faqSchema);
  }

  // Generate HTML
  return schemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n    ');
}
