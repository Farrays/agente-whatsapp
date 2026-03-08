import React, { useMemo, useState, memo, useId } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useImageAlt } from '../../hooks/useImageAlt';
import { useReviews, getReviewText } from '../../hooks/useReviews';
import type { ScheduleSession } from '../../hooks/useScheduleSessions';
import type { Locale } from '../../types';
import Breadcrumb from '../shared/Breadcrumb';
import {
  StarRating,
  CheckCircleIcon,
  ClockIcon,
  FlameIcon,
  StarIcon,
  PlayIcon,
  CalendarDaysIcon,
} from '../../lib/icons';
import { UsersIcon, MapPinIcon } from '../shared/CommonIcons';
import AnimateOnScroll from '../AnimateOnScroll';
import AnimatedCounter from '../AnimatedCounter';
import LazyImage from '../LazyImage';
import OptimizedImage from '../OptimizedImage';
import CulturalHistorySection from '../CulturalHistorySection';
import ScheduleSection from '../ScheduleSection';
import LazyDynamicScheduleSection from '../LazyDynamicScheduleSection';
import { getMomenceStyle } from '../../constants/style-mappings';
import FAQSection from '../FAQSection';
import { ReviewsSection } from '../reviews';
import LevelCardsSection, { type LevelConfig } from '../shared/LevelCardsSection';
import PrepareClassSection, { type PrepareConfig } from '../shared/PrepareClassSection';
import WhyUsComparisonSection, {
  type WhyUsComparisonConfig,
} from '../shared/WhyUsComparisonSection';
import LatinDanceComparisonTable, {
  type LatinDanceStyle,
} from '../shared/LatinDanceComparisonTable';
import ArtisticDanceComparisonTable, {
  type ArtisticDanceStyle,
} from '../shared/ArtisticDanceComparisonTable';
import YouTubeEmbed from '../YouTubeEmbed';
import BunnyEmbed from '../BunnyEmbed';
import {
  CourseSchemaEnterprise,
  AggregateReviewsSchema,
  HowToSchema,
  SpeakableSchema,
  DefinedTermSchema,
  EventSchema,
  // GEO & LLM Optimization Schemas
  WebPageSchema,
  LeadCaptureActionSchema,
  BrandSchema,
} from '../SchemaMarkup';
import {
  ANIMATION_DELAYS,
  BARCELONA_NEARBY_AREAS,
  FARRAYS_LOCATION,
  SOCIAL_PROOF,
} from '../../constants/shared';
import { getRelatedClassImageUrl } from '../../constants/style-images';
import type { Testimonial } from '../../types';
import type { FAQ } from './ClassPageTemplate';
import LeadCaptureModal from '../shared/LeadCaptureModal';

// ============================================================================
// TYPES - Comprehensive configuration for all dance class pages
// ============================================================================

export interface ScheduleItem {
  id: string;
  dayKey: string;
  classNameKey?: string; // Translation key for class name (enterprise i18n)
  className?: string; // Direct class name (fallback for legacy configs)
  time: string;
  teacher: string;
  levelKey: string;
  note?: string;
}

export interface TeacherInfo {
  name: string;
  specialtyKey: string;
  bioKey: string;
  /** Optional contextual bio prefix key - prepended to canonical bio */
  bioPrefixKey?: string;
  image?: string;
  imageSrcSet?: string;
  /** AVIF srcset for modern browsers (best compression) */
  imageSrcSetAvif?: string;
  tags?: string[];
  /** Object position for face focus (default: 'center 20%') */
  objectPosition?: string;
}

export interface BreadcrumbConfig {
  homeKey: string;
  classesKey: string;
  categoryKey: string;
  categoryUrl: string;
  currentKey: string;
}

export interface HeroConfig {
  // Stats shown in hero
  minutes?: number;
  calories?: number;
  funPercent?: number;
  // Third stat can be custom (e.g., "100% Cuban Technique")
  customThirdStat?: {
    value: string;
    labelKey: string;
    icon?: 'heart' | 'star' | 'check';
  };
  // Background gradient color (e.g., 'rose' for Ballet, 'primary' for default)
  gradientColor?: 'primary' | 'rose' | 'amber' | 'emerald' | 'violet';
  // Enterprise: Hero background image with OptimizedImage
  heroImage?: {
    basePath: string; // Path without size/format (e.g., '/images/classes/femmology/img/clases-de-femmology-barcelona')
    alt: string; // Fallback alt text
    altKey?: string; // i18n key for alt text (e.g., 'styleImages.femmology.hero')
    breakpoints?: number[]; // Default: [320, 640, 768, 1024, 1440, 1920]
    formats?: ('avif' | 'webp' | 'jpg')[]; // Default: ['avif', 'webp', 'jpg']
  };
  // Enterprise: Hero Visual Configuration (opacity, positioning, gradients)
  heroVisuals?: {
    /** Image opacity (0-100, default: 40) - higher values show more of the image */
    imageOpacity?: number;
    /** Object position for hero image (default: 'center') - e.g., 'center 30%' to focus on upper body */
    objectPosition?: string;
    /** Object fit for hero image (default: 'cover') - use 'contain' to show full image without cropping */
    objectFit?: 'cover' | 'contain';
    /** Gradient overlay style: 'dark' (default), 'subtle', 'vibrant', 'dramatic', 'none' */
    gradientStyle?: 'dark' | 'subtle' | 'vibrant' | 'dramatic' | 'none';
    /** Enable text shadow for better contrast against vibrant backgrounds (default: false) */
    textShadow?: boolean;
    /** Custom gradient (overrides gradientStyle) - e.g., 'from-black/90 via-black/50 to-transparent' */
    customGradient?: string;
  };
}

export interface WhatIsSection {
  enabled: boolean;
  paragraphCount?: number; // Number of paragraphs (default 4)
  hasQuestionAnswer?: boolean; // Show question/answer at end
  // Legacy image config (src + srcSet)
  image?: {
    src: string;
    srcSet?: string;
    alt: string;
    altKey?: string; // i18n key for alt text (e.g., 'classes.afro-contemporaneo.whatIs')
  };
  // Enterprise image config (OptimizedImage with multi-format srcset)
  optimizedImage?: {
    basePath: string; // Path without size/format (e.g., '/images/classes/afrobeat/img/clases-afrobeat-barcelona')
    alt: string; // Fallback alt text
    altKey?: string; // i18n key for alt text (enterprise i18n support)
    breakpoints: number[]; // e.g., [320, 640, 768, 1024, 1440, 1920]
    formats: ('avif' | 'webp' | 'jpg')[]; // e.g., ['avif', 'webp', 'jpg']
    /** Object fit for image (default: 'cover') - use 'contain' to show full image without cropping */
    objectFit?: 'cover' | 'contain';
  };
}

export interface IdentificationSection {
  enabled: boolean;
  itemCount?: number; // Number of identification items (default 6)
  hasTransition?: boolean; // Show transition text
  hasNeedEnroll?: boolean; // Show "Necesitas apuntarte" section
}

export interface TransformationSection {
  enabled: boolean;
  itemCount?: number; // Number of transformation items (default 6)
}

export interface WhyChooseSection {
  enabled: boolean;
  itemOrder?: number[]; // Custom order of items (default [1,7,2,3,4,5,6])
}

export interface WhyTodaySection {
  enabled: boolean;
  paragraphCount?: number; // Number of paragraphs (default 3)
}

export interface VideoSection {
  enabled: boolean;
  videos?: Array<{
    videoId: string;
    title: string;
    // Optional props for enhanced Schema VideoObject (GEO/AIEO)
    description?: string;
    uploadDate?: string; // ISO 8601 format: YYYY-MM-DD
    duration?: string; // ISO 8601 duration format: PT5M30S
  }>;
  placeholderCount?: number; // Number of "coming soon" placeholders
  // Bunny Stream video support
  bunnyVideo?: {
    videoId: string; // Bunny video GUID
    libraryId: string; // Bunny library ID
    title?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1'; // Default: 16:9
    thumbnailUrl?: string; // Custom thumbnail URL from Bunny dashboard
    // SEO fields for VideoObject schema (Google Video indexing)
    description?: string; // Video description for schema
    uploadDate?: string; // ISO 8601 date (e.g., '2024-06-15')
    duration?: string; // ISO 8601 duration (e.g., 'PT1M30S' = 1 min 30 sec)
  };
}

export interface LogosSection {
  enabled: boolean;
  logos?: Array<{
    src: string;
    alt: string;
    label: string;
  }>;
}

export interface ComparisonTableSection {
  enabled: boolean;
  columns: string[]; // e.g., ['Ballet', 'Cont. Lírico', 'Modern Jazz', 'Afro Cont.']
  rows: Array<{
    rowKey: string;
    values: number[]; // Stars for each column (1-5)
  }>;
  meaningCount?: number; // Number of meaning items (default 4)
}

export interface NearbyAreasConfig {
  enabled: boolean;
  areas?: ReadonlyArray<{ readonly name: string; readonly time: string }>;
  // Custom translation key prefix (defaults to styleKey)
  keyPrefix?: string;
}

export interface CourseSchemaConfig {
  teachesKey?: string;
  prerequisitesKey?: string;
  lessonsKey?: string;
  duration?: string;
}

export interface HowToSchemaConfig {
  enabled: boolean;
  supplyKeys?: string[];
  stepCount?: number;
}

export interface DefinedTermConfig {
  name: string;
  descriptionKey: string;
}

export interface EventSchemaConfig {
  enabled: boolean;
  performerName?: string;
}

export interface RelatedClassConfig {
  slug: string; // URL slug like 'salsa-cubana-barcelona'
  nameKey: string; // Translation key for class name
  descriptionKey: string; // Translation key for short description
  imageUrl?: string; // Optional custom image URL
}

export interface RelatedClassesSection {
  enabled: boolean;
  classes: RelatedClassConfig[];
}

// Main configuration interface
export interface FullDanceClassConfig {
  // === IDENTIFICATION ===
  styleKey: string; // Translation prefix: 'ballet', 'dancehall', 'twerk', etc.
  stylePath: string; // URL path: 'ballet-barcelona', 'dancehall-barcelona', etc.

  // === MOMENCE DYNAMIC SCHEDULES ===
  /** Momence style for filtering (e.g., 'bachata', 'salsa'). Auto-detected from styleKey if not set. */
  momenceStyle?: string;
  /** Enable dynamic schedule fetching from Momence API (default: true) */
  useDynamicSchedule?: boolean;
  /** Number of days ahead to fetch for dynamic schedule (default: 14) */
  scheduleDaysAhead?: number;
  /** Filter by start hour (inclusive, 0-23). For time-based pages like "morning classes" */
  scheduleStartHour?: number;
  /** Filter by end hour (exclusive, 0-23). For time-based pages like "morning classes" */
  scheduleEndHour?: number;

  // === REQUIRED DATA ===
  faqsConfig: FAQ[];
  testimonials: Testimonial[];
  scheduleKeys: ScheduleItem[];
  teachers: TeacherInfo[];
  breadcrumbConfig: BreadcrumbConfig;

  // === OPTIONAL DATA ===
  levels?: LevelConfig[];
  prepareConfig?: PrepareConfig;
  nearbyAreas?: ReadonlyArray<{ readonly name: string; readonly time: string }>;

  // === SECTION TOGGLES ===
  hero?: HeroConfig;
  whatIsSection?: WhatIsSection;
  identificationSection?: IdentificationSection;
  transformationSection?: TransformationSection;
  whyChooseSection?: WhyChooseSection;
  whyTodaySection?: WhyTodaySection;
  videoSection?: VideoSection;
  logosSection?: LogosSection;
  comparisonTable?: ComparisonTableSection;
  whyUsComparison?: WhyUsComparisonConfig;
  nearbySection?: NearbyAreasConfig;
  testimonialsSection?: { enabled: boolean; position?: 'default' | 'after-why-choose' };
  googleReviewsSection?: {
    enabled: boolean;
    category?:
      | 'salsa-cubana'
      | 'bachata'
      | 'heels-femmology'
      | 'urbanas'
      | 'contemporaneo'
      | 'afro'
      | 'fitness'
      | 'general';
    limit?: number;
    showGoogleBadge?: boolean;
    /** Curated list of author names to show (overrides category/limit) */
    selectedAuthors?: string[];
  };
  faqSection?: { enabled: boolean };

  // === LATIN DANCE COMPARISON TABLE (for Latin styles like Salsa, Bachata, etc.) ===
  latinDanceComparison?: {
    enabled: boolean;
    highlightedStyle: LatinDanceStyle;
  };

  // === ARTISTIC DANCE COMPARISON TABLE (for Contemporáneo, Jazz, Ballet, Afro Jazz, etc.) ===
  artisticDanceComparison?: {
    enabled: boolean;
    highlightedStyle: ArtisticDanceStyle;
  };

  // === CULTURAL HISTORY ===
  culturalHistory?: {
    enabled: boolean;
    titleKey?: string;
    shortDescKey?: string;
    fullHistoryKey?: string;
  };

  // === SCHEMA MARKUP ===
  courseConfig?: CourseSchemaConfig;
  howToSchema?: HowToSchemaConfig;
  definedTerms?: DefinedTermConfig[];
  eventSchema?: EventSchemaConfig;
  speakableSelectors?: string[];
  personSchemas?: Array<{
    name: string;
    jobTitleKey: string;
    descriptionKey: string;
    knowsAbout: string[];
  }>;

  // === VIDEO SCHEMA (separate from video section) ===
  videoSchema?: {
    titleKey: string;
    descKey: string;
    thumbnailUrl?: string;
    videoId?: string;
  };

  // === BUNNY VIDEO SCHEMA (for Bunny Stream videos) ===
  bunnyVideoSchema?: {
    titleKey: string;
    descKey: string;
    thumbnailUrl: string;
    videoId: string;
    libraryId: string;
    duration?: string; // ISO 8601 format, e.g., "PT1M30S"
    uploadDate?: string; // ISO 8601 date
  };

  // === RELATED CLASSES (internal linking) ===
  relatedClasses?: RelatedClassesSection;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TeacherCard: React.FC<{
  teacher: TeacherInfo;
  index: number;
  t: (key: string) => string;
}> = ({ teacher, index, t }) => {
  // Object position for face focus (default centers on face)
  const objectPosition = teacher.objectPosition || 'center 20%';

  // Generate descriptive alt text for SEO & accessibility
  const altText = `${teacher.name} - ${t(teacher.specialtyKey)} en Farray's Center Barcelona`;

  return (
    <AnimateOnScroll
      delay={(index + 1) * ANIMATION_DELAYS.STAGGER_SMALL}
      className="[perspective:1000px]"
    >
      <article
        className="group h-full bg-black/70 backdrop-blur-md border border-primary-dark/50 hover:border-primary-accent rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.05)_rotateY(5deg)] hover:shadow-accent-glow"
        aria-labelledby={`teacher-${index}-name`}
      >
        <div className="flex flex-col items-center text-center">
          {teacher.image ? (
            <figure className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary-accent/50 group-hover:border-primary-accent transition-colors duration-300 mb-4 sm:mb-6">
              <picture>
                {/* AVIF: Best compression, modern browsers */}
                {teacher.imageSrcSetAvif && (
                  <source type="image/avif" srcSet={teacher.imageSrcSetAvif} sizes="160px" />
                )}
                {/* WebP: Good compression, wide support */}
                {teacher.imageSrcSet && (
                  <source type="image/webp" srcSet={teacher.imageSrcSet} sizes="160px" />
                )}
                <img
                  src={teacher.image}
                  alt={altText}
                  width="160"
                  height="160"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ objectPosition }}
                />
              </picture>
            </figure>
          ) : (
            <div
              role="img"
              aria-label={`Avatar de ${teacher.name}`}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary-accent/50 group-hover:border-primary-accent transition-colors duration-300 mb-4 sm:mb-6 bg-gradient-to-br from-primary-accent/30 to-primary-dark/50 flex items-center justify-center"
            >
              <span className="text-3xl font-black text-primary-accent/60" aria-hidden="true">
                {teacher.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </span>
            </div>
          )}
          <h3
            id={`teacher-${index}-name`}
            className="text-xl sm:text-2xl font-bold text-neutral mb-2"
          >
            {teacher.name}
          </h3>
          <p className="text-primary-accent font-semibold mb-3 sm:mb-4">
            {t(teacher.specialtyKey)}
          </p>
          <p className="text-neutral/90 leading-relaxed text-sm">
            {/* Contextual prefix (if exists) + canonical bio */}
            {teacher.bioPrefixKey && t(teacher.bioPrefixKey) !== teacher.bioPrefixKey && (
              <>{t(teacher.bioPrefixKey)} </>
            )}
            {t(teacher.bioKey)}
          </p>
          {teacher.tags && teacher.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 justify-center mt-4" aria-label="Especialidades">
              {teacher.tags.map(tag => (
                <li
                  key={tag}
                  className="px-3 py-1 bg-primary-accent/20 text-primary-accent text-xs rounded-full"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </AnimateOnScroll>
  );
};

// ============================================================================
// RELATED CLASSES - CONSTANTS & COMPONENTS
// ============================================================================

/** Image dimensions for consistent layout and CLS prevention */
const RELATED_CLASS_IMAGE_DIMENSIONS = {
  width: 480,
  height: 320,
} as const;

// ============================================================================
// RELATED CLASS IMAGES - Now using centralized style-images.ts system
// ============================================================================
// Images are now managed via getRelatedClassImageUrl() from style-images.ts
// This eliminates duplication and ensures consistency with all image assets.
// See: constants/style-images.ts -> SLUG_TO_STYLE_KEY mapping
// ============================================================================

/**
 * Decorative arrow icon for CTA buttons.
 * Marked as aria-hidden since it's purely decorative.
 */
const RelatedClassArrowIcon: React.FC = memo(() => (
  <svg
    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
));
RelatedClassArrowIcon.displayName = 'RelatedClassArrowIcon';

/**
 * Schema.org ItemList for related classes section.
 * Improves SEO and GEO by providing structured data for AI crawlers.
 */
const RelatedClassesSchema: React.FC<{
  classes: RelatedClassConfig[];
  locale: string;
  t: (key: string) => string;
  currentStyleName: string;
}> = memo(({ classes, locale, t, currentStyleName }) => {
  const baseUrl = 'https://www.farrayscenter.com';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${t('relatedClassesTitle')} - ${currentStyleName}`,
    description: t('relatedClassesSubtitle'),
    numberOfItems: classes.length,
    itemListElement: classes.map((classInfo, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        '@id': `${baseUrl}/${locale}/clases/${classInfo.slug}`,
        name: t(classInfo.nameKey),
        description: t(classInfo.descriptionKey),
        url: `${baseUrl}/${locale}/clases/${classInfo.slug}`,
        image: `${baseUrl}${classInfo.imageUrl || getRelatedClassImageUrl(classInfo.slug)}`,
        provider: {
          '@type': 'EducationalOrganization',
          name: "Farray's International Dance Center",
          url: baseUrl,
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'onsite',
          location: {
            '@type': 'Place',
            name: "Farray's International Dance Center",
            address: {
              '@type': 'PostalAddress',
              streetAddress: t('schema_streetAddress'),
              addressLocality: 'Barcelona',
              postalCode: '08015',
              addressRegion: t('schema_addressRegion'),
              addressCountry: 'ES',
            },
          },
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
});
RelatedClassesSchema.displayName = 'RelatedClassesSchema';

/**
 * Individual related class card with optimized accessibility,
 * performance, and UX.
 *
 * @accessibility
 * - Descriptive aria-label for screen readers
 * - Visible focus ring for keyboard navigation
 * - Article semantics with aria-labelledby
 *
 * @performance
 * - Memoized component
 * - LazyImage with explicit dimensions (prevents CLS)
 * - Optimized local WebP images
 *
 * @ux
 * - Smooth hover animations with 3D transform
 * - Visual feedback on interaction
 * - Clear call-to-action
 */
const RelatedClassCard: React.FC<{
  classInfo: RelatedClassConfig;
  index: number;
  locale: string;
  t: (key: string) => string;
}> = memo(({ classInfo, index, locale, t }) => {
  // Generate unique ID for accessibility
  const headingId = useId();

  // Get image URL from centralized style-images system
  const imageUrl = classInfo.imageUrl || getRelatedClassImageUrl(classInfo.slug);

  // Get translated texts
  const className = t(classInfo.nameKey);
  const classDescription = t(classInfo.descriptionKey);
  const ctaText = t('relatedClassesViewClass');

  return (
    <AnimateOnScroll
      delay={(index + 1) * ANIMATION_DELAYS.STAGGER_SMALL}
      className="[perspective:1000px]"
    >
      <article className="h-full" aria-labelledby={headingId}>
        <Link
          to={`/${locale}/clases/${classInfo.slug}`}
          className="group block h-full bg-black/70 backdrop-blur-md
                     border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                     transition-all duration-500
                     [transform-style:preserve-3d]
                     hover:border-primary-accent hover:shadow-accent-glow
                     hover:[transform:translateY(-0.5rem)_scale(1.02)]
                     focus:outline-none focus:ring-2 focus:ring-primary-accent
                     focus:ring-offset-2 focus:ring-offset-black"
          aria-label={`${className} - ${ctaText}`}
        >
          {/* Image Container with fixed aspect ratio */}
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: `${RELATED_CLASS_IMAGE_DIMENSIONS.width}/${RELATED_CLASS_IMAGE_DIMENSIONS.height}`,
            }}
          >
            <LazyImage
              src={imageUrl}
              alt={`Clase de ${className} en Barcelona - Farray's Dance Center`}
              className="w-full h-full object-cover transition-transform duration-500
                         group-hover:scale-110"
              width={RELATED_CLASS_IMAGE_DIMENSIONS.width}
              height={RELATED_CLASS_IMAGE_DIMENSIONS.height}
            />

            {/* Overlay gradient */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <h3
              id={headingId}
              className="text-lg sm:text-xl font-bold text-neutral mb-2
                         group-hover:text-primary-accent transition-colors duration-300"
            >
              {className}
            </h3>
            <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
              {classDescription}
            </p>

            {/* CTA Button - aria-hidden since Link already has aria-label */}
            <div
              className="flex items-center gap-2 text-primary-accent font-semibold text-sm
                         group-hover:gap-3 transition-all duration-300"
              aria-hidden="true"
            >
              <span>{ctaText}</span>
              <RelatedClassArrowIcon />
            </div>
          </div>
        </Link>
      </article>
    </AnimateOnScroll>
  );
});
RelatedClassCard.displayName = 'RelatedClassCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FullDanceClassTemplate: React.FC<{ config: FullDanceClassConfig }> = ({ config }) => {
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
  const { getAlt } = useImageAlt();
  const baseUrl = 'https://www.farrayscenter.com';
  const pageUrl = `${baseUrl}/${locale}/clases/${config.stylePath}`;
  const currentDate = new Date().toISOString().split('T')[0] as string;

  // ===== REAL GOOGLE REVIEWS FOR SCHEMA =====
  // Get real Google reviews filtered by category for Schema.org markup
  const googleReviewsCategory = config.googleReviewsSection?.category || 'general';
  const { reviews: realGoogleReviews } = useReviews({
    category: googleReviewsCategory,
    limit: 10, // Top 10 reviews for schema
    minTextLength: 50, // Only meaningful reviews
  });

  // Defaults
  const hero = config.hero || { minutes: 60, calories: 400, funPercent: 100 };
  const nearbyAreas = config.nearbyAreas || BARCELONA_NEARBY_AREAS;
  const gradientColor = hero.gradientColor || 'primary';

  const gradientClasses: Record<string, string> = {
    primary: 'from-primary-dark/30 via-black to-black',
    rose: 'from-rose-900/30 via-black to-black',
    amber: 'from-amber-900/30 via-black to-black',
    emerald: 'from-emerald-900/30 via-black to-black',
    violet: 'from-violet-900/30 via-black to-black',
  };

  // ===== ENTERPRISE HERO VISUALS =====
  const heroVisuals = hero.heroVisuals || {};
  const imageOpacity = heroVisuals.imageOpacity ?? 40;
  const objectPosition = heroVisuals.objectPosition || 'center';
  const objectFit = heroVisuals.objectFit || 'cover';
  const gradientStyle = heroVisuals.gradientStyle || 'dark';
  const textShadow = heroVisuals.textShadow || false;

  // Enterprise gradient styles for hero overlay (bottom-to-top for text readability)
  const heroGradientStyles: Record<string, string> = {
    dark: 'bg-gradient-to-t from-black via-black/70 to-black/40',
    subtle: 'bg-gradient-to-t from-black/90 via-black/40 to-transparent',
    vibrant: 'bg-gradient-to-t from-black/80 via-black/30 to-transparent',
    dramatic: 'bg-gradient-to-t from-black via-black/60 to-black/20',
    none: '',
  };

  // Calculate overlay opacity inverse of image opacity (higher image opacity = lower overlay)
  const overlayOpacity = Math.max(0, Math.min(100, 100 - imageOpacity));

  // Text shadow class for vibrant backgrounds (matches Home Hero styling)
  const textShadowClass = textShadow
    ? '[text-shadow:0_2px_8px_rgba(0,0,0,0.8),0_4px_24px_rgba(0,0,0,0.6)]'
    : '';

  // Lead capture modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // ===== DYNAMIC SCHEDULE FROM MOMENCE =====
  // Determine if we should use dynamic schedules (default: true)
  const useDynamicSchedule = config.useDynamicSchedule !== false;
  // Get Momence style for filtering (from config or auto-detect from styleKey)
  // Use undefined check so that momenceStyle='' explicitly means "no style filter"
  const momenceStyle =
    config.momenceStyle !== undefined ? config.momenceStyle : getMomenceStyle(config.styleKey);
  // Days ahead for schedule (default: 14)
  const scheduleDaysAhead = config.scheduleDaysAhead || 14;

  // Create static fallback data from config.scheduleKeys
  const staticFallbackData = useMemo((): ScheduleSession[] => {
    // Convert static schedule to ScheduleSession format for fallback
    // Note: This creates "fake" sessions with current week dates
    const now = new Date();
    return config.scheduleKeys.map((schedule, index) => {
      const dayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };
      const targetDay = dayMap[schedule.dayKey] ?? 1;
      const currentDay = now.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;

      const classDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
      const [hours, minutes] = schedule.time.split(':').map(Number);
      classDate.setHours(hours || 19, minutes || 0, 0, 0);

      return {
        id: 10000 + index,
        name: schedule.classNameKey ? t(schedule.classNameKey) : schedule.className || '',
        style: momenceStyle,
        level: schedule.levelKey.replace('Level', '').toLowerCase(),
        instructor: schedule.teacher,
        dateFormatted: classDate.toLocaleDateString(locale === 'ca' ? 'ca-ES' : `${locale}-ES`, {
          day: 'numeric',
          month: 'short',
        }),
        dayKey: schedule.dayKey,
        dayOfWeek: t(schedule.dayKey),
        time: schedule.time,
        endTime: '',
        spotsAvailable: 10,
        isFull: false,
        capacity: 15,
        rawStartsAt: classDate.toISOString(),
        duration: 60,
        category: 'urbano',
        pageSlug: config.stylePath,
      };
    });
  }, [config.scheduleKeys, config.stylePath, momenceStyle, locale, t]);

  // Dynamic schedule is now handled by LazyDynamicScheduleSection with lazy loading

  // ===== MEMOIZED DATA =====
  // Static schedules for backward compatibility (used when dynamic is disabled)
  const schedules = useMemo(
    () =>
      config.scheduleKeys.map(schedule => ({
        id: schedule.id,
        day: t(schedule.dayKey),
        className: schedule.classNameKey ? t(schedule.classNameKey) : schedule.className || '',
        time: schedule.time,
        teacher: schedule.teacher,
        level: t(schedule.levelKey),
        note: schedule.note,
      })),
    [config.scheduleKeys, t]
  );

  // Schedule data for CourseSchemaEnterprise
  const courseSchedules = useMemo(
    () =>
      config.scheduleKeys.map(schedule => ({
        className: schedule.classNameKey ? t(schedule.classNameKey) : schedule.className || '',
        dayKey: schedule.dayKey,
        time: schedule.time,
        teacher: schedule.teacher,
      })),
    [config.scheduleKeys, t]
  );

  const faqs = useMemo(
    () =>
      config.faqsConfig.map(faq => ({
        id: faq.id,
        question: t(faq.questionKey),
        answer: t(faq.answerKey),
      })),
    [config.faqsConfig, t]
  );

  // Enterprise: Use REAL Google reviews for Schema.org markup (SEO)
  // Falls back to testimonials if no Google reviews available
  const reviewsSchemaData = useMemo(() => {
    // Prefer real Google reviews for Schema.org
    if (realGoogleReviews.length > 0) {
      return realGoogleReviews.map(review => ({
        author: review.author,
        reviewRating: { ratingValue: '5', bestRating: '5' },
        reviewBody: getReviewText(review, locale as Locale),
        datePublished: review.dateISO || currentDate,
      }));
    }
    // Fallback to static testimonials if no Google reviews
    return config.testimonials.map(testimonial => ({
      author: testimonial.name,
      reviewRating: { ratingValue: testimonial.rating.toString(), bestRating: '5' },
      reviewBody: testimonial.quote[locale as Locale],
      datePublished: currentDate,
    }));
  }, [realGoogleReviews, config.testimonials, locale, currentDate]);

  const breadcrumbItems = useMemo(
    () => [
      { name: t(config.breadcrumbConfig.homeKey), url: `/${locale}` },
      { name: t(config.breadcrumbConfig.classesKey), url: `/${locale}/clases/baile-barcelona` },
      {
        name: t(config.breadcrumbConfig.categoryKey),
        url: `/${locale}${config.breadcrumbConfig.categoryUrl}`,
      },
      {
        name: t(config.breadcrumbConfig.currentKey),
        url: `/${locale}/clases/${config.stylePath}`,
        isActive: true,
      },
    ],
    [config.breadcrumbConfig, locale, config.stylePath, t]
  );

  // VideoObject schemas removed: class pages are not "video watch pages" per Google's Dec 2023 policy.
  // Videos are supplementary content on class pages, so VideoObject schema triggers
  // "video is not on a watch page" errors in GSC. Schema kept in blog pages where
  // video can be the main content. See: https://support.google.com/webmasters/answer/9495631

  return (
    <>
      {/* ===== HEAD / META ===== */}
      <Helmet>
        <title>{t(`${config.styleKey}PageTitle`)} | Farray&apos;s Center</title>
        <meta name="description" content={t(`${config.styleKey}MetaDescription`)} />
        <link rel="canonical" href={pageUrl} />
        {/* Hreflang */}
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/clases/${config.stylePath}`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/clases/${config.stylePath}`} />
        <link rel="alternate" hrefLang="ca" href={`${baseUrl}/ca/clases/${config.stylePath}`} />
        <link rel="alternate" hrefLang="fr" href={`${baseUrl}/fr/clases/${config.stylePath}`} />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${baseUrl}/es/clases/${config.stylePath}`}
        />
        {/* Open Graph */}
        <meta
          property="og:title"
          content={`${t(`${config.styleKey}PageTitle`)} | Farray's Center`}
        />
        <meta property="og:description" content={t(`${config.styleKey}MetaDescription`)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/images/og-${config.stylePath}.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={t(`${config.styleKey}PageTitle`)} />
        <meta property="og:site_name" content="Farray's International Dance Center" />
        {/* og:video and twitter:player removed - class pages are not video watch pages */}
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${t(`${config.styleKey}PageTitle`)} | Farray's Center`}
        />
        <meta name="twitter:description" content={t(`${config.styleKey}MetaDescription`)} />
        <meta name="twitter:image" content={`${baseUrl}/images/og-${config.stylePath}.jpg`} />
        <meta name="twitter:image:alt" content={t(`${config.styleKey}PageTitle`)} />
        {/* Additional SEO */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        {/* GEO Meta Tags for Local SEO */}
        <meta name="geo.region" content="ES-CT" />
        <meta name="geo.placename" content="Barcelona" />
        <meta
          name="geo.position"
          content={`${FARRAYS_LOCATION.geo.latitude};${FARRAYS_LOCATION.geo.longitude}`}
        />
        <meta
          name="ICBM"
          content={`${FARRAYS_LOCATION.geo.latitude}, ${FARRAYS_LOCATION.geo.longitude}`}
        />
        {/* Language and Locale */}
        <meta httpEquiv="content-language" content={locale} />
        <meta
          property="og:locale"
          content={
            locale === 'es'
              ? 'es_ES'
              : locale === 'ca'
                ? 'ca_ES'
                : locale === 'fr'
                  ? 'fr_FR'
                  : 'en_GB'
          }
        />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="en_GB" />
        <meta property="og:locale:alternate" content="ca_ES" />
        <meta property="og:locale:alternate" content="fr_FR" />
        {/* Author and Publisher */}
        <meta name="author" content="Farray's International Dance Center" />
        <meta name="publisher" content="Farray's International Dance Center" />
        {/* Mobile optimization */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="theme-color" content="#000000" />
      </Helmet>

      {/* ===== SCHEMA MARKUP ===== */}
      {/* BreadcrumbList generated at build-time by prerender.mjs */}
      {/* VideoObject schemas removed - class pages are not video watch pages */}
      {config.personSchemas?.map((person, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: person.name,
              jobTitle: t(person.jobTitleKey),
              description: t(person.descriptionKey),
              worksFor: {
                '@type': 'EducationalOrganization',
                name: "Farray's International Dance Center",
                url: baseUrl,
              },
              knowsAbout: person.knowsAbout,
            }),
          }}
        />
      ))}

      {/* LocalBusiness Schema removed - already injected at build-time by prerender.mjs */}

      {/* Enterprise Course Schema — only when NOT using DynamicScheduleSchema (which generates its own Course) */}
      {!useDynamicSchedule && (
        <CourseSchemaEnterprise
          name={t(`${config.styleKey}CourseSchemaName`)}
          description={t(`${config.styleKey}CourseSchemaDesc`)}
          pageUrl={pageUrl}
          baseUrl={baseUrl}
          schedules={courseSchedules}
        />
      )}

      <AggregateReviewsSchema
        reviews={reviewsSchemaData}
        itemName={`${t(`${config.styleKey}PageTitle`)} - Farray's Center`}
        itemType="Course"
      />

      {/* FAQPage Schema is rendered by FAQSection component - no need for duplicate */}

      {config.howToSchema?.enabled && (
        <HowToSchema
          name={t(`${config.styleKey}HowToName`)}
          description={t(`${config.styleKey}HowToDesc`)}
          totalTime="PT60M"
          estimatedCost={{ currency: 'EUR', value: '15' }}
          supply={(config.howToSchema.supplyKeys || []).map(key => t(key))}
          steps={Array.from({ length: config.howToSchema.stepCount || 5 }, (_, i) => ({
            name: t(`${config.styleKey}HowToStep${i + 1}Name`),
            text: t(`${config.styleKey}HowToStep${i + 1}Text`),
            url: i < 2 ? `${pageUrl}#schedule` : undefined,
          }))}
        />
      )}

      {config.speakableSelectors && (
        <SpeakableSchema
          name={t(`${config.styleKey}PageTitle`)}
          description={t(`${config.styleKey}MetaDescription`)}
          url={pageUrl}
          speakableSelectors={config.speakableSelectors}
        />
      )}

      {config.definedTerms && config.definedTerms.length > 0 && (
        <DefinedTermSchema
          terms={config.definedTerms.map(term => ({
            name: term.name,
            description: t(term.descriptionKey),
            url: pageUrl,
          }))}
        />
      )}

      {config.eventSchema?.enabled && (
        <EventSchema
          name={t(`${config.styleKey}EventName`)}
          description={t(`${config.styleKey}EventDesc`)}
          startDate={`${currentDate}T20:00:00+01:00`}
          location={{
            name: FARRAYS_LOCATION.name,
            address: `${FARRAYS_LOCATION.streetAddress}, ${FARRAYS_LOCATION.postalCode} ${FARRAYS_LOCATION.addressLocality}`,
          }}
          organizer={{
            name: FARRAYS_LOCATION.name,
            url: baseUrl,
          }}
          offers={{
            price: '15',
            priceCurrency: 'EUR',
            availability: 'InStock',
            url: `${pageUrl}#schedule`,
          }}
          performer={
            config.eventSchema.performerName
              ? {
                  name: config.eventSchema.performerName,
                  description: t(`${config.styleKey}Teacher1Bio`),
                }
              : undefined
          }
        />
      )}

      {/* ===== GEO & LLM OPTIMIZATION SCHEMAS ===== */}
      {/* WebPage Schema - Enhanced for search engines and LLMs */}
      <WebPageSchema
        url={pageUrl}
        name={t(`${config.styleKey}PageTitle`)}
        description={t(`${config.styleKey}MetaDescription`)}
        inLanguage={{ es: 'es-ES', ca: 'ca-ES', en: 'en-GB', fr: 'fr-FR' }[locale] || 'es-ES'}
        mainEntityId={`${pageUrl}#course`}
        primaryImageUrl={
          config.hero?.heroImage
            ? `${baseUrl}${config.hero.heroImage.basePath}_1200.jpg`
            : `${baseUrl}/images/og-${config.stylePath}.jpg`
        }
        breadcrumb={breadcrumbItems.map(item => ({
          name: item.name,
          url: `${baseUrl}${item.url}`,
        }))}
      />

      {/* Lead Capture Action - Models the "Descubre cómo empezar" flow */}
      <LeadCaptureActionSchema
        pageUrl={pageUrl}
        courseName={t(`${config.styleKey}PageTitle`)}
        actionDescription={t('puertasAbiertasSubtext')}
      />

      {/* Brand Schema - For Método Farray methodology */}
      <BrandSchema
        name="Método Farray"
        description="Metodología de enseñanza única desarrollada por Yunaisy Farray, avalada por CID-UNESCO. Combina técnica profesional con un enfoque inclusivo y divertido que ha formado a más de 15.000 alumnos en Barcelona."
        url={`${baseUrl}/${locale}/metodo-farray`}
        slogan="Dance Your Dreams"
      />

      {/* ===== SKIP LINKS ===== */}
      <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:bg-primary-accent focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {t('skipToMainContent')}
        </a>
        <a
          href="#schedule"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-48 focus-visible:z-[100] focus-visible:bg-primary-accent focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {t('skipToSchedule')}
        </a>
      </nav>

      <main id="main-content" className="pt-20 md:pt-24" role="main">
        {/* ===== 1. HERO SECTION ===== */}
        <section
          id={`${config.styleKey}-hero`}
          aria-labelledby="hero-title"
          className="relative text-center py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[600px]"
        >
          {/* Background - Enterprise OptimizedImage with heroVisuals config or Gradient fallback */}
          <div className="absolute inset-0 bg-black">
            {config.hero?.heroImage ? (
              <>
                {/* Enterprise: OptimizedImage with configurable opacity and positioning */}
                <div className="absolute inset-0" style={{ opacity: imageOpacity / 100 }}>
                  <OptimizedImage
                    src={config.hero.heroImage.basePath}
                    altKey={config.hero.heroImage.altKey}
                    altFallback={config.hero.heroImage.alt}
                    priority="high"
                    sizes="100vw"
                    aspectRatio="16/9"
                    className="w-full h-full"
                    objectFit={objectFit}
                    style={{ objectPosition }}
                    placeholder="color"
                    placeholderColor="#111"
                    breakpoints={
                      config.hero.heroImage.breakpoints || [320, 640, 768, 1024, 1440, 1920]
                    }
                    formats={config.hero.heroImage.formats || ['avif', 'webp', 'jpg']}
                  />
                </div>
                {/* Enterprise: Gradient overlay with configurable style */}
                {gradientStyle !== 'none' && (
                  <div
                    className={`absolute inset-0 ${heroVisuals.customGradient || heroGradientStyles[gradientStyle]}`}
                    style={{ opacity: overlayOpacity / 100 }}
                  ></div>
                )}
              </>
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradientColor]}`}
              ></div>
            )}
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6">
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/75" />

            <AnimateOnScroll>
              <h1
                id="hero-title"
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-4 sm:mb-6 text-white"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {t(`${config.styleKey}HeroTitle`)}
              </h1>
              <p
                className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 holographic-text ${textShadowClass}`}
              >
                {t(`${config.styleKey}HeroSubtitle`)}
              </p>
              <p
                className={`max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-neutral/90 mt-6 sm:mt-8 mb-4 sm:mb-6 leading-relaxed ${textShadowClass}`}
              >
                {t(`${config.styleKey}HeroDesc`)}
              </p>
              <p
                className={`text-base sm:text-lg md:text-xl text-neutral/90 italic mb-6 ${textShadowClass}`}
              >
                {t(`${config.styleKey}HeroLocation`)}
              </p>

              {/* Social Proof */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-8 text-neutral/80">
                <div className="flex items-center gap-2">
                  <StarRating size="sm" />
                  <span className="font-semibold">{SOCIAL_PROOF.rating}/5</span>
                  <span className="text-sm">
                    ({SOCIAL_PROOF.reviewCount} {t('reviews')})
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary-accent" />
                  <span className="text-sm">
                    {t(`${config.styleKey}HeroStudents`) || '+15.000 alumnos formados'}
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-primary-accent" />
                  <span className="text-sm">8 {t('years_in_barcelona')}</span>
                </div>
              </div>

              {/* CTA Button - Puertas Abiertas */}
              <div className="flex flex-col items-center justify-center mt-8 sm:mt-10">
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="w-full sm:w-auto sm:min-w-[320px] min-h-[48px] bg-primary-accent text-white font-bold text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {t('puertasAbiertasCTA')}
                </button>
                <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
                  {t('puertasAbiertasSubtext')}
                </p>
              </div>

              {/* Hero Stats */}
              <div className="mt-12 sm:mt-16">
                <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-12 max-w-4xl mx-auto">
                  <AnimateOnScroll delay={0}>
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <ClockIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-accent" />
                      </div>
                      <AnimatedCounter
                        target={hero.minutes || 60}
                        className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 holographic-text"
                      />
                      <div className="text-xs sm:text-sm md:text-base text-neutral/90 font-semibold">
                        {t('classMinutes')}
                      </div>
                    </div>
                  </AnimateOnScroll>

                  <AnimateOnScroll delay={ANIMATION_DELAYS.STAGGER_SMALL}>
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <FlameIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-accent" />
                      </div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 holographic-text">
                        ~<AnimatedCounter target={hero.calories || 400} className="inline" />
                      </div>
                      <div className="text-xs sm:text-sm md:text-base text-neutral/90 font-semibold">
                        {t('caloriesBurned')}
                      </div>
                    </div>
                  </AnimateOnScroll>

                  <AnimateOnScroll delay={2 * ANIMATION_DELAYS.STAGGER_SMALL}>
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-accent" />
                      </div>
                      {hero.customThirdStat ? (
                        <>
                          <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 holographic-text">
                            {hero.customThirdStat.value}
                          </div>
                          <div className="text-xs sm:text-sm md:text-base text-neutral/90 font-semibold">
                            {t(hero.customThirdStat.labelKey)}
                          </div>
                        </>
                      ) : (
                        <>
                          <AnimatedCounter
                            target={hero.funPercent || 100}
                            suffix="%"
                            className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 holographic-text"
                          />
                          <div className="text-xs sm:text-sm md:text-base text-neutral/90 font-semibold">
                            {t('funGuaranteed')}
                          </div>
                        </>
                      )}
                    </div>
                  </AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ===== 2. WHAT IS X SECTION ===== */}
        {config.whatIsSection?.enabled && (
          <section
            aria-labelledby="what-is-title"
            className="section-after-hero pb-12 md:pb-16 bg-primary-dark/10"
          >
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <div className="max-w-4xl mx-auto">
                  <h2
                    id="what-is-title"
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-6 sm:mb-8 text-center holographic-text"
                  >
                    {t(`${config.styleKey}WhatIsTitle`)}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                    {/* Imagen - Izquierda en desktop (Enterprise OptimizedImage or Legacy) */}
                    {config.whatIsSection.optimizedImage ? (
                      <div className="order-1 rounded-2xl overflow-hidden shadow-lg">
                        <OptimizedImage
                          src={config.whatIsSection.optimizedImage.basePath}
                          altKey={config.whatIsSection.optimizedImage.altKey}
                          altFallback={config.whatIsSection.optimizedImage.alt}
                          aspectRatio="4/3"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority="high"
                          breakpoints={config.whatIsSection.optimizedImage.breakpoints}
                          formats={config.whatIsSection.optimizedImage.formats}
                          className="w-full h-full"
                          objectFit={config.whatIsSection.optimizedImage.objectFit || 'cover'}
                          placeholder="color"
                          placeholderColor="#111"
                        />
                      </div>
                    ) : config.whatIsSection.image ? (
                      <div className="order-1 rounded-2xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-auto">
                        <picture>
                          {config.whatIsSection.image.srcSet && (
                            <source
                              type="image/webp"
                              srcSet={config.whatIsSection.image.srcSet}
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          )}
                          <img
                            src={config.whatIsSection.image.src}
                            alt={
                              config.whatIsSection.image.altKey
                                ? getAlt(config.whatIsSection.image.altKey)
                                : config.whatIsSection.image.alt
                            }
                            width="960"
                            height="720"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </picture>
                      </div>
                    ) : null}
                    {/* Texto - Derecha en desktop */}
                    <div className="order-2 space-y-4 sm:space-y-6 text-base sm:text-lg text-neutral/90 leading-relaxed">
                      <p className="text-lg sm:text-xl font-semibold holographic-text">
                        {t(`${config.styleKey}WhatIsP1`)}
                      </p>
                      <p>{t(`${config.styleKey}WhatIsP2`)}</p>
                      <p className="italic font-medium text-neutral">
                        {t(`${config.styleKey}WhatIsP3`)}
                      </p>
                      <p>{t(`${config.styleKey}WhatIsP4`)}</p>
                      {(config.whatIsSection.paragraphCount || 4) >= 5 && (
                        <p>{t(`${config.styleKey}WhatIsP5`)}</p>
                      )}
                      {config.whatIsSection.hasQuestionAnswer !== false && (
                        <>
                          <p className="text-center text-xl sm:text-2xl font-bold mt-6 sm:mt-8 holographic-text">
                            {t(`${config.styleKey}WhatIsQuestionTitle`)}
                          </p>
                          <p className="text-center text-lg sm:text-xl font-semibold">
                            {t(`${config.styleKey}WhatIsQuestionAnswer`)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </section>
        )}

        {/* ===== 3. SCHEDULE SECTION ===== */}
        {useDynamicSchedule ? (
          <LazyDynamicScheduleSection
            id="schedule"
            t={t}
            style={momenceStyle || undefined}
            days={scheduleDaysAhead}
            startHour={config.scheduleStartHour}
            endHour={config.scheduleEndHour}
            locale={locale}
            courseName={t(`${config.styleKey}Title`)}
            courseUrl={pageUrl}
            courseDescription={t(`${config.styleKey}MetaDescription`)}
            fallbackData={staticFallbackData}
            titleKey={`${config.styleKey}ScheduleTitle`}
            subtitleKey={`${config.styleKey}ScheduleSubtitle`}
            showAvailability={false}
            onNotifyMe={() => setIsLeadModalOpen(true)}
            prefetch={true}
            eager={false}
            eventImage={
              config.hero?.heroImage
                ? `https://www.farrayscenter.com${config.hero.heroImage.basePath}_1200.jpg`
                : `https://www.farrayscenter.com/images/og-${config.stylePath}.jpg`
            }
          />
        ) : (
          <ScheduleSection
            titleKey={`${config.styleKey}ScheduleTitle`}
            subtitleKey={`${config.styleKey}ScheduleSubtitle`}
            schedules={schedules}
            t={t}
          />
        )}

        {/* ===== 3b. LEVELS SECTION ===== */}
        {config.levels && config.levels.length > 0 && (
          <LevelCardsSection titleKey={`${config.styleKey}LevelsTitle`} levels={config.levels} />
        )}

        {/* ===== 4. TEACHERS SECTION ===== */}
        <section
          id="teachers"
          aria-labelledby="teachers-title"
          className="py-12 md:py-16 bg-primary-dark/10"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto">
                <h2
                  id="teachers-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral holographic-text"
                >
                  {t(`${config.styleKey}TeachersTitle`)}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/70 mt-4">
                  {t(`${config.styleKey}TeachersSubtitle`)}
                </p>
              </div>
            </AnimateOnScroll>

            <div
              className={`grid ${config.teachers.length === 1 ? '' : config.teachers.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 sm:gap-8 max-w-5xl mx-auto`}
            >
              {config.teachers.map((teacher, index) => (
                <TeacherCard key={teacher.name} teacher={teacher} index={index} t={t} />
              ))}
            </div>

            <AnimateOnScroll>
              <p className="text-center text-base sm:text-lg text-neutral/90 mt-8 sm:mt-10 max-w-2xl mx-auto">
                {t(`${config.styleKey}TeachersClosing`)}
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ===== 4b. PREPARE CLASS SECTION ===== */}
        {config.prepareConfig && (
          <PrepareClassSection
            titleKey={`${config.styleKey}PrepareTitle`}
            subtitleKey={`${config.styleKey}PrepareSubtitle`}
            config={config.prepareConfig}
          />
        )}

        {/* ===== 5. IDENTIFICATION SECTION (V2 Design) ===== */}
        {config.identificationSection?.enabled &&
          (() => {
            return (
              <section
                aria-labelledby="identify-title"
                className="py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/20"
              >
                <div className="container mx-auto px-4 sm:px-6">
                  <AnimateOnScroll>
                    <div className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto">
                      <h2
                        id="identify-title"
                        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text"
                      >
                        {t(`${config.styleKey}IdentifyTitle`)}
                      </h2>
                      <p className="text-lg text-neutral/70">
                        Si alguno de estos te suena, estás en el lugar correcto
                      </p>
                    </div>
                  </AnimateOnScroll>

                  {/* Grid de identificación con checks del tema */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
                    {Array.from(
                      { length: config.identificationSection.itemCount || 6 },
                      (_, i) => i + 1
                    ).map((num, index) => {
                      const itemCount = config.identificationSection?.itemCount || 6;
                      const isLastItem = index === itemCount - 1;
                      const shouldCenter = isLastItem && itemCount % 3 === 1;
                      return (
                        <AnimateOnScroll
                          key={num}
                          delay={index * ANIMATION_DELAYS.STAGGER_SMALL * 1.5}
                          className={`[perspective:1000px] ${shouldCenter ? 'lg:col-start-2' : ''}`}
                        >
                          <div className="group relative h-full bg-gradient-to-br from-primary-dark/40 to-black/60 backdrop-blur-sm rounded-2xl border border-primary-accent/20 hover:border-primary-accent p-6 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.02)] hover:shadow-accent-glow cursor-pointer">
                            {/* Check del tema */}
                            <div className="w-14 h-14 rounded-xl bg-primary-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary-accent/40 group-hover:scale-110 transition-all duration-300">
                              <CheckCircleIcon className="w-7 h-7 text-primary-accent" />
                            </div>
                            {/* Texto del item */}
                            <p className="text-lg font-medium text-neutral leading-relaxed">
                              {t(`${config.styleKey}Identify${num}`)}
                            </p>
                          </div>
                        </AnimateOnScroll>
                      );
                    })}
                  </div>

                  {/* Sección de transición y CTA */}
                  <AnimateOnScroll>
                    <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-r from-primary-accent/10 via-primary-dark/30 to-primary-accent/10 rounded-2xl p-8 border border-primary-accent/20">
                      {config.identificationSection.hasTransition !== false && (
                        <p className="text-neutral/80 italic">
                          {t(`${config.styleKey}IdentifyTransition`)}
                        </p>
                      )}
                      {config.identificationSection.hasNeedEnroll !== false && (
                        <>
                          <h3 className="text-2xl sm:text-3xl font-black text-neutral holographic-text">
                            {t(`${config.styleKey}NeedEnrollTitle`)}
                          </h3>
                          <p className="text-lg text-neutral/90">
                            {t(`${config.styleKey}IdentifySolution`)}
                          </p>
                          {/* CTA Button - Puertas Abiertas */}
                          <div className="flex flex-col items-center mt-4">
                            <button
                              onClick={() => setIsLeadModalOpen(true)}
                              className="w-full sm:w-auto sm:min-w-[320px] min-h-[48px] bg-primary-accent text-white font-bold text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
                            >
                              {t('puertasAbiertasCTA')}
                            </button>
                            <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
                              {t('puertasAbiertasSubtext')}
                            </p>
                          </div>
                          {/* Closing text after CTA */}
                          <p className="text-lg text-neutral/90 mt-6 italic">
                            {t(`${config.styleKey}IdentifyClosing`)}
                          </p>
                        </>
                      )}
                    </div>
                  </AnimateOnScroll>
                </div>
              </section>
            );
          })()}

        {/* ===== 6. TRANSFORMATION SECTION ===== */}
        {config.transformationSection?.enabled && (
          <section aria-labelledby="transform-title" className="py-12 md:py-16 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <div className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto">
                  <h2
                    id="transform-title"
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text"
                  >
                    {t(`${config.styleKey}TransformTitle`)}
                  </h2>
                </div>
              </AnimateOnScroll>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
                {Array.from(
                  { length: config.transformationSection.itemCount || 6 },
                  (_, i) => i + 1
                ).map((num, index) => (
                  <AnimateOnScroll
                    key={num}
                    delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                    className="[perspective:1000px]"
                  >
                    <div className="group h-full min-h-[200px] sm:min-h-[220px] p-5 sm:p-8 bg-black/50 backdrop-blur-md border border-primary-dark/50 hover:border-primary-accent rounded-2xl transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.05)_rotateY(5deg)] hover:shadow-accent-glow">
                      <div className="text-5xl sm:text-6xl font-black text-primary-accent mb-3 sm:mb-4 holographic-text">
                        {num}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-neutral mb-2 sm:mb-3">
                        {t(`${config.styleKey}Transform${num}Title`)}
                      </h3>
                      <p className="text-neutral/90 leading-relaxed text-sm sm:text-base">
                        {t(`${config.styleKey}Transform${num}Desc`)}
                      </p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== 7. WHY CHOOSE SECTION ===== */}
        {config.whyChooseSection?.enabled && (
          <section className="py-12 md:py-16 bg-primary-dark/10">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <div className="text-center mb-8 sm:mb-10 max-w-4xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                    {t(`${config.styleKey}TransformCTA`)}
                  </h2>
                </div>
              </AnimateOnScroll>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-10 sm:mb-12">
                {(config.whyChooseSection.itemOrder || [1, 7, 2, 3, 4, 5, 6]).map((num, index) => (
                  <AnimateOnScroll
                    key={num}
                    delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                    className={`[perspective:1000px] ${index === 6 ? 'lg:col-start-2' : ''}`}
                  >
                    <div className="group h-full min-h-[140px] sm:min-h-[160px] p-4 sm:p-6 bg-black/30 rounded-xl border border-primary-dark/50 hover:border-primary-accent transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.05)_rotateY(5deg)] hover:shadow-accent-glow">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-accent/20 flex items-center justify-center group-hover:bg-primary-accent/40 transition-colors duration-300">
                          <CheckCircleIcon className="w-6 h-6 text-primary-accent" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-neutral mb-2">
                            {t(`${config.styleKey}WhyChoose${num}Title`)}
                          </h3>
                          <p className="text-neutral/90 text-sm leading-relaxed">
                            {t(`${config.styleKey}WhyChoose${num}Desc`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>

              {/* Trust Bar - Stats */}
              <AnimateOnScroll>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-16 max-w-5xl mx-auto mb-10 sm:mb-12">
                  <div className="text-center">
                    <AnimatedCounter
                      target={8}
                      suffix="+"
                      className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                    />
                    <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                      {t('yearsExperience')}
                    </p>
                  </div>
                  <div className="text-center">
                    <AnimatedCounter
                      target={1500}
                      suffix="+"
                      className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                    />
                    <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                      {t('activeStudents')}
                    </p>
                  </div>
                  <div className="text-center">
                    <AnimatedCounter
                      target={15000}
                      suffix="+"
                      className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                    />
                    <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                      {t('satisfiedStudents')}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Logos Section */}
              {config.logosSection?.enabled && (
                <AnimateOnScroll>
                  <div className="text-center max-w-4xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-6 sm:mb-8 holographic-text">
                      {t(`${config.styleKey}LogosTitle`)}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto items-center mb-4 sm:mb-6">
                      {(
                        config.logosSection.logos || [
                          {
                            src: '/images/cid-unesco-logo.webp',
                            alt: 'CID UNESCO',
                            label: 'CID UNESCO',
                          },
                          {
                            src: '/images/Street-Dance-2.webp',
                            alt: 'Street Dance 2',
                            label: 'Street Dance 2',
                          },
                          {
                            src: '/images/the-dancer-espectaculo-baile-cuadrada.webp',
                            alt: 'The Dancer',
                            label: 'The Dancer',
                          },
                          { src: '/images/telecinco-logo.webp', alt: 'Telecinco', label: 'TV 5' },
                        ]
                      ).map((logo, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-primary-accent/20 hover:border-primary-accent transition-all duration-300 hover:scale-105"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden rounded-lg">
                            <img
                              src={logo.src}
                              alt={logo.alt}
                              width="64"
                              height="64"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-neutral/90 font-bold text-xs sm:text-sm text-center">
                            {logo.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter holographic-text">
                      {t(`${config.styleKey}LogosIntlFestivalsText`)}
                    </p>
                  </div>
                </AnimateOnScroll>
              )}
            </div>
          </section>
        )}

        {/* ===== 8. WHY TODAY SECTION (Single Card Design) ===== */}
        {config.whyTodaySection?.enabled && (
          <section className="py-12 md:py-16 bg-gradient-to-b from-primary-dark/20 to-black">
            <div className="container mx-auto px-4 sm:px-6">
              {/* Card único con todo el contenido */}
              <AnimateOnScroll>
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-dark/40 to-black/60 backdrop-blur-sm rounded-2xl border border-primary-accent/20 p-8 sm:p-10 transition-all duration-500 hover:border-primary-accent hover:shadow-accent-glow">
                  {/* Icono decorativo */}
                  <div className="w-16 h-16 rounded-xl bg-primary-accent/20 flex items-center justify-center mb-6 mx-auto">
                    <svg
                      className="w-8 h-8 text-primary-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* Título */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-8 text-center holographic-text">
                    {t(`${config.styleKey}WhyTodayFullTitle`)}
                  </h2>

                  {/* Contenido de los párrafos */}
                  <div className="space-y-6 text-center">
                    {Array.from(
                      { length: config.whyTodaySection.paragraphCount || 3 },
                      (_, i) => i + 1
                    ).map(num => (
                      <p key={num} className="text-lg sm:text-xl text-neutral/90 leading-relaxed">
                        {t(`${config.styleKey}WhyToday${num}`)}
                      </p>
                    ))}
                  </div>

                  {/* Cierre y CTA */}
                  <div className="mt-8 pt-8 border-t border-primary-accent/20 text-center space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-neutral holographic-text">
                      {t(`${config.styleKey}WhyTodayClosing1`)}
                    </h3>
                    <p className="text-lg text-neutral/80 italic">
                      {t(`${config.styleKey}WhyTodayClosing2`)}
                    </p>
                    {/* CTA Button - Puertas Abiertas */}
                    <div className="flex flex-col items-center mt-4">
                      <button
                        onClick={() => setIsLeadModalOpen(true)}
                        className="w-full sm:w-auto sm:min-w-[320px] min-h-[48px] bg-primary-accent text-white font-bold text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        {t('puertasAbiertasCTA')}
                      </button>
                      <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
                        {t('puertasAbiertasSubtext')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </section>
        )}

        {/* ===== 8b. WHY US COMPARISON SECTION ===== */}
        {config.whyUsComparison?.enabled && (
          <WhyUsComparisonSection styleKey={config.styleKey} config={config.whyUsComparison} />
        )}

        {/* ===== 9. VIDEO SECTION ===== */}
        {config.videoSection?.enabled && (
          <section id="video" className="py-12 md:py-16 bg-primary-dark/10">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <div className="text-center mb-8 sm:mb-12 max-w-4xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                    {t(`${config.styleKey}VideoTitle`)}
                  </h2>
                  <p className="text-base sm:text-lg text-neutral/70">
                    {t(`${config.styleKey}VideoDesc`)}
                  </p>
                </div>
              </AnimateOnScroll>

              {/* Bunny Stream Video (supports vertical/horizontal) - Enterprise optimized */}
              {config.videoSection.bunnyVideo && (
                <AnimateOnScroll>
                  <BunnyEmbed
                    videoId={config.videoSection.bunnyVideo.videoId}
                    libraryId={config.videoSection.bunnyVideo.libraryId}
                    title={
                      config.videoSection.bunnyVideo.title || t(`${config.styleKey}VideoTitle`)
                    }
                    aspectRatio={config.videoSection.bunnyVideo.aspectRatio}
                    thumbnailUrl={config.videoSection.bunnyVideo.thumbnailUrl}
                    priority={true}
                  />
                </AnimateOnScroll>
              )}

              {/* YouTube Videos Grid */}
              {config.videoSection.videos && config.videoSection.videos.length > 0 && (
                <div
                  className={`grid grid-cols-1 ${config.videoSection.videos.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-4xl mx-auto'} gap-4 sm:gap-6 max-w-7xl mx-auto ${config.videoSection.bunnyVideo ? 'mt-8' : ''}`}
                >
                  {config.videoSection.videos.map((video, index) => (
                    <AnimateOnScroll
                      key={video.videoId}
                      delay={(index + 1) * ANIMATION_DELAYS.STAGGER_SMALL}
                    >
                      <YouTubeEmbed
                        videoId={video.videoId}
                        title={video.title}
                        description={video.description}
                        uploadDate={video.uploadDate}
                        duration={video.duration}
                        disableSchema
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              )}

              {/* Video Coming Soon Placeholder - Enterprise */}
              {/* Shows automatically when no videos are configured */}
              {!config.videoSection.bunnyVideo &&
                (!config.videoSection.videos || config.videoSection.videos.length === 0) &&
                (config.videoSection.placeholderCount ?? 0) === 0 && (
                  <AnimateOnScroll>
                    <div className="max-w-2xl mx-auto">
                      <div className="relative aspect-video bg-gradient-to-br from-primary-dark/40 via-black/60 to-primary-dark/30 rounded-2xl border border-primary-accent/20 overflow-hidden shadow-xl pointer-events-none select-none">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-accent/20 border-2 border-primary-accent/40 flex items-center justify-center mb-4 backdrop-blur-sm">
                            <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-accent/60" />
                          </div>
                          <p className="text-lg sm:text-xl font-bold text-neutral/90 mb-1">
                            {t('videoComingSoon')}
                          </p>
                          <p className="text-sm text-neutral/70">{t('videoComingSoonDesc')}</p>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                )}

              {/* Multiple Placeholders (legacy grid support) */}
              {(config.videoSection.placeholderCount ?? 0) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto mt-8">
                  {Array.from({ length: config.videoSection.placeholderCount || 0 }, (_, i) => (
                    <AnimateOnScroll
                      key={`placeholder-${i}`}
                      delay={
                        ((config.videoSection?.videos?.length ?? 0) + i + 1) *
                        ANIMATION_DELAYS.STAGGER_SMALL
                      }
                    >
                      <div className="aspect-video rounded-2xl overflow-hidden border-2 border-primary-accent/50 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none select-none">
                        <div className="text-center p-4 sm:p-6">
                          <PlayIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-primary-accent/50" />
                          <p className="text-sm sm:text-base text-neutral/70 font-semibold">
                            {t('videoComingSoon')}
                          </p>
                        </div>
                      </div>
                    </AnimateOnScroll>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== 10. TESTIMONIALS SECTION (Real Google Reviews) ===== */}
        {config.googleReviewsSection?.enabled && (
          <ReviewsSection
            category={config.googleReviewsSection.category}
            limit={config.googleReviewsSection.limit || 4}
            showGoogleBadge={config.googleReviewsSection.showGoogleBadge ?? true}
            layout="grid"
            showCategory={false}
            selectedAuthors={config.googleReviewsSection.selectedAuthors}
          />
        )}

        {/* ===== 11. CULTURAL HISTORY SECTION (SEO content) ===== */}
        {config.culturalHistory?.enabled && (
          <CulturalHistorySection
            titleKey={config.culturalHistory.titleKey || `${config.styleKey}CulturalHistoryTitle`}
            shortDescKey={config.culturalHistory.shortDescKey || `${config.styleKey}CulturalShort`}
            fullHistoryKey={
              config.culturalHistory.fullHistoryKey || `${config.styleKey}CulturalFull`
            }
            readMoreText={t('readMore')}
            readLessText={t('readLess')}
            t={t}
          />
        )}

        {/* ===== 11b. LATIN DANCE COMPARISON TABLE (for Latin styles) ===== */}
        {config.latinDanceComparison?.enabled && (
          <section className="py-12 md:py-16 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <LatinDanceComparisonTable
                  highlightedStyle={config.latinDanceComparison.highlightedStyle}
                />
              </AnimateOnScroll>
            </div>
          </section>
        )}

        {/* ===== 11c. ARTISTIC DANCE COMPARISON TABLE (for Contemporary, Jazz, Ballet, etc.) ===== */}
        {config.artisticDanceComparison?.enabled && (
          <section className="py-12 md:py-16 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <ArtisticDanceComparisonTable
                  highlightedStyle={config.artisticDanceComparison.highlightedStyle}
                />
              </AnimateOnScroll>
            </div>
          </section>
        )}

        {/* ===== 12. FAQ SECTION (resolve objections) ===== */}
        {config.faqSection?.enabled !== false && (
          <FAQSection title={t(`${config.styleKey}FaqTitle`)} faqs={faqs} />
        )}

        {/* ===== 14. LOCAL SEO / NEARBY AREAS SECTION ===== */}
        {config.nearbySection?.enabled !== false &&
          (() => {
            const nearbyKeyPrefix = config.nearbySection?.keyPrefix || config.styleKey;
            return (
              <section className="py-12 md:py-16 bg-black" aria-labelledby="nearby-title">
                <div className="container mx-auto px-4 sm:px-6">
                  <AnimateOnScroll>
                    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-black/30 rounded-2xl border border-neutral/20">
                      <h3
                        id="nearby-title"
                        className="text-xl sm:text-2xl font-bold text-neutral mb-4"
                      >
                        {t(`${nearbyKeyPrefix}NearbyTitle`)}
                      </h3>
                      <p className="text-neutral/80 mb-4 sm:mb-6 text-sm sm:text-base">
                        {t(`${nearbyKeyPrefix}NearbyDesc`)}
                      </p>
                      <p className="text-neutral/90 font-semibold mb-4 text-sm sm:text-base">
                        {t(`${nearbyKeyPrefix}NearbySearchText`)}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        {(config.nearbySection?.areas || nearbyAreas).map((area, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                          >
                            <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary-accent flex-shrink-0" />
                            <span className="text-neutral/80">
                              {area.name}: <span className="text-primary-accent">{area.time}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-neutral/70 text-xs sm:text-sm mt-4">
                        {t(`${nearbyKeyPrefix}NearbyMetro`)}
                      </p>
                    </div>
                  </AnimateOnScroll>
                </div>
              </section>
            );
          })()}

        {/* ===== 15. FINAL CTA SECTION (last chance to convert) ===== */}
        <section id="final-cta" className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-black">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradientColor]}`}
            ></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-20">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t(`${config.styleKey}FinalCTATitle`)}
                </h2>
                <p className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 holographic-text">
                  {t(`${config.styleKey}FinalCTASubtitle`)}
                </p>
                <p className="text-lg sm:text-xl text-neutral/90 mb-5 sm:mb-6 leading-relaxed">
                  {t(`${config.styleKey}FinalCTADesc`)}
                </p>
                <p className="text-base sm:text-lg text-neutral/90 mb-6 sm:mb-8 italic">
                  {t(`${config.styleKey}FinalCTAFunny`)}
                </p>

                {/* CTA Button - Puertas Abiertas */}
                <div className="flex flex-col items-center justify-center">
                  <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full sm:w-auto sm:min-w-[320px] min-h-[48px] bg-primary-accent text-white font-bold text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {t('puertasAbiertasCTA')}
                  </button>
                  <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
                    {t('puertasAbiertasSubtext')}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ===== 16. RELATED CLASSES SECTION (internal linking) ===== */}
        {config.relatedClasses?.enabled && config.relatedClasses.classes.length > 0 && (
          <>
            {/* Schema.org ItemList for SEO/GEO */}
            <RelatedClassesSchema
              classes={config.relatedClasses.classes}
              locale={locale}
              t={t}
              currentStyleName={t(`${config.styleKey}PageTitle`)}
            />

            <section
              id="related-classes"
              aria-labelledby="related-classes-title"
              className="py-12 md:py-16"
            >
              <div className="container mx-auto px-4 sm:px-6">
                {/* Section Header - z-10 to stay above cards on hover */}
                <AnimateOnScroll>
                  <header className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto relative z-10">
                    <h2
                      id="related-classes-title"
                      className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text"
                    >
                      {t('relatedClassesTitle')}
                    </h2>
                    <p className="text-lg sm:text-xl text-neutral/70">
                      {t('relatedClassesSubtitle')}
                    </p>
                  </header>
                </AnimateOnScroll>

                {/* Classes Grid with ARIA list role - z-0 to stay below header */}
                <div
                  className={`grid grid-cols-1 relative z-0 ${
                    config.relatedClasses.classes.length === 2
                      ? 'sm:grid-cols-2 max-w-3xl'
                      : config.relatedClasses.classes.length === 3
                        ? 'sm:grid-cols-2 lg:grid-cols-3 max-w-5xl'
                        : 'sm:grid-cols-2 lg:grid-cols-4 max-w-6xl'
                  } gap-6 sm:gap-8 mx-auto`}
                  role="list"
                  aria-label={t('relatedClassesTitle')}
                >
                  {config.relatedClasses.classes.map((classInfo, index) => (
                    <div key={classInfo.slug} role="listitem">
                      <RelatedClassCard classInfo={classInfo} index={index} locale={locale} t={t} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </>
  );
};

export default FullDanceClassTemplate;
