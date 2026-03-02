/**
 * BlogSchemas Component
 *
 * Runtime schema.org structured data for blog articles.
 * Only generates schemas NOT already handled at build-time by prerender.mjs.
 *
 * Build-time (prerender.mjs / schema-generators.mjs) handles:
 * - Organization, WebSite, LocalBusiness, BreadcrumbList
 * - Article (BlogPosting) with full author/publisher
 * - FAQPage with all FAQ items
 *
 * This component handles (runtime-only schemas):
 * - Person (standalone author E-E-A-T with bio, knowsAbout)
 * - SpeakableSpecification (voice search)
 * - VideoObject, HowTo (conditional)
 * - ItemList for key facts with citations (GEO)
 * - DefinedTerm for definitions (GEO)
 * - Review for testimonials (E-E-A-T)
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { DEFAULT_AUTHOR } from '../../constants/blog/author';
import type {
  BlogArticleConfig,
  AuthorConfig,
  SummaryStatConfig,
} from '../../constants/blog/types';

interface BlogSchemasProps {
  /** Article configuration */
  config: BlogArticleConfig;
  /** Author configuration (defaults to Yunaisy if not provided) */
  author?: AuthorConfig;
}

const BlogSchemas: React.FC<BlogSchemasProps> = ({ config, author: authorProp }) => {
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
  const author = authorProp || DEFAULT_AUTHOR;
  const articleUrl = `${baseUrl}/${locale}/blog/${config.category}/${config.slug}`;

  // Article Schema — generated at build time by prerender.mjs (generateArticleSchema)
  // Do NOT generate here to avoid duplicate @type:Article with same @id

  // Person Schema (Author - E-E-A-T)
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/${locale}${author.profileUrl}#person`,
    name: author.name,
    url: `${baseUrl}/${locale}${author.profileUrl}`,
    image: author.image.startsWith('/') ? `${baseUrl}${author.image}` : author.image,
    jobTitle: t(author.roleKey),
    description: t(author.bioKey),
    sameAs: author.sameAs,
    worksFor: {
      '@type': 'EducationalOrganization',
      name: "Farray's International Dance Center",
      url: baseUrl,
    },
    knowsAbout: [
      'Dance',
      'Salsa',
      'Dancehall',
      'Afrobeat',
      'Hip Hop',
      'Reggaeton',
      'Contemporary Dance',
      'Ballet',
    ],
  };

  // FAQPage Schema removed — already generated at build time by prerender.mjs (generateBlogFAQSchema)

  // SpeakableSpecification Schema (for voice search)
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': articleUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: config.speakableSelectors || [
        '#article-summary',
        'article h2',
        'article p:first-of-type',
      ],
    },
  };

  // VideoObject Schema (if video is present)
  const videoSchema = config.videoSchema?.enabled
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: t(config.videoSchema.titleKey),
        description: t(config.videoSchema.descriptionKey),
        thumbnailUrl:
          config.videoSchema.thumbnailUrl ||
          `https://img.youtube.com/vi/${config.videoSchema.videoId}/maxresdefault.jpg`,
        uploadDate: config.videoSchema.uploadDate || config.datePublished,
        duration: config.videoSchema.duration,
        contentUrl: `https://www.youtube.com/watch?v=${config.videoSchema.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${config.videoSchema.videoId}`,
        publisher: {
          '@type': 'Organization',
          name: "Farray's International Dance Center",
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/logo-fidc.png`,
          },
        },
      }
    : null;

  // HowTo Schema (for tutorial articles)
  const howToSchema = config.howToSchema?.enabled
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: t(config.howToSchema.nameKey),
        description: t(config.howToSchema.descriptionKey),
        totalTime: config.howToSchema.totalTime,
        estimatedCost: config.howToSchema.estimatedCost,
        supply: config.howToSchema.supplies?.map(key => ({
          '@type': 'HowToSupply',
          name: t(key),
        })),
        tool: config.howToSchema.tools?.map(key => ({
          '@type': 'HowToTool',
          name: t(key),
        })),
        step: config.howToSchema.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: t(step.nameKey),
          text: t(step.textKey),
          image: step.image,
        })),
      }
    : null;

  // ============================================================================
  // GEO-OPTIMIZED SCHEMAS (For AI Search Engines)
  // ============================================================================

  /**
   * Citation Schema for Statistics
   * Helps LLMs attribute data correctly when citing statistics
   */
  const buildCitationSchema = (stat: SummaryStatConfig) => {
    if (!stat.citation) return null;
    return {
      '@type': 'Claim',
      claimReviewed: `${stat.value} - ${t(stat.labelKey)}`,
      appearance: {
        '@type': 'ScholarlyArticle',
        name: stat.citation.source,
        url: stat.citation.url,
        datePublished: stat.citation.year,
        author: stat.citation.authors
          ? {
              '@type': 'Person',
              name: stat.citation.authors,
            }
          : undefined,
        identifier: stat.citation.doi
          ? {
              '@type': 'PropertyValue',
              propertyID: 'DOI',
              value: stat.citation.doi,
            }
          : undefined,
      },
    };
  };

  // ItemList Schema for key facts (GEO - helps LLMs extract key information)
  const keyFactsSchema =
    config.summaryStats && config.summaryStats.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          '@id': `${articleUrl}#key-facts`,
          name: t('schema_keyFacts'),
          description: t(`${config.articleKey}_metaDescription`),
          numberOfItems: config.summaryStats.length,
          itemListElement: config.summaryStats.map((stat, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: t(stat.labelKey),
            description: stat.value,
            ...(stat.citation && {
              citation: buildCitationSchema(stat),
            }),
          })),
        }
      : null;

  /**
   * DefinedTerm Schema for definitions in content
   * Enhanced with @id, url, inLanguage, and sameAs for better GEO
   */
  const definitionSections = config.sections.filter(s => s.type === 'definition');
  const definedTermSchemas =
    definitionSections.length > 0
      ? definitionSections.map(section => ({
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          '@id': `${articleUrl}#${section.id}`,
          name: section.definitionTermKey ? t(section.definitionTermKey) : '',
          description: t(section.contentKey),
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            name: t('schema_danceTerminology'),
            '@id': `${baseUrl}/${locale}/glosario`,
          },
          inLanguage:
            locale === 'es'
              ? 'es-ES'
              : locale === 'ca'
                ? 'ca-ES'
                : locale === 'fr'
                  ? 'fr-FR'
                  : 'en-GB',
          url: `${articleUrl}#${section.id}`,
        }))
      : [];

  // Answer Capsule standalone Question schemas removed — standalone @type:Question
  // with acceptedAnswer mirrors FAQPage item structure and causes Google to report
  // "FAQPage is duplicated". GEO value is preserved via HTML data-answer-capsule
  // attributes and speakable selectors targeting [data-answer-capsule="true"].

  /**
   * Review Schema for testimonials
   * Enhances E-E-A-T with real user experiences
   */
  const testimonialSections = config.sections.filter(s => s.type === 'testimonial');
  const reviewSchemas =
    testimonialSections.length > 0
      ? testimonialSections
          .filter(section => section.testimonial)
          .map(section => {
            const testimonial = section.testimonial;
            if (!testimonial) return null;
            return {
              '@context': 'https://schema.org',
              '@type': 'Review',
              '@id': `${articleUrl}#${section.id}`,
              reviewBody: t(testimonial.textKey),
              reviewRating: {
                '@type': 'Rating',
                ratingValue: testimonial.rating,
                bestRating: 5,
              },
              author: {
                '@type': 'Person',
                name: testimonial.authorName,
                ...(testimonial.authorLocation && {
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: testimonial.authorLocation,
                  },
                }),
              },
              itemReviewed: {
                '@type': 'LocalBusiness',
                name: "Farray's International Dance Center",
                '@id': `${baseUrl}/#danceschool`,
              },
              datePublished: testimonial.datePublished || config.datePublished,
            };
          })
          .filter(Boolean)
      : [];

  return (
    <Helmet>
      {/* OG Article Tags — handled by BlogArticleTemplate.tsx Helmet, not duplicated here */}

      {/* Article Schema — generated at build time by prerender.mjs (generateArticleSchema) */}
      {/* BreadcrumbList — generated at build time by prerender.mjs */}
      {/* FAQPage — generated at build time by prerender.mjs (generateBlogFAQSchema) */}

      {/* Person Schema (runtime — includes bio, knowsAbout not in build-time) */}
      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>

      {/* Speakable Schema */}
      <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>

      {/* Video Schema */}
      {videoSchema && <script type="application/ld+json">{JSON.stringify(videoSchema)}</script>}

      {/* HowTo Schema */}
      {howToSchema && <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>}

      {/* ============================================================ */}
      {/* GEO-OPTIMIZED SCHEMAS (For AI Search Engines) */}
      {/* ============================================================ */}

      {/* Key Facts ItemList Schema */}
      {keyFactsSchema && (
        <script type="application/ld+json">{JSON.stringify(keyFactsSchema)}</script>
      )}

      {/* DefinedTerm Schemas */}
      {definedTermSchemas.map((schema, index) => (
        <script key={`defined-term-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Answer Capsule standalone Question schemas removed — see comment above */}

      {/* Review/Testimonial Schemas */}
      {reviewSchemas.map((schema, index) => (
        <script key={`review-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default BlogSchemas;
