import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../../types';
import Breadcrumb from '../shared/Breadcrumb';
import { ANIMATION_DELAYS } from '../../constants/shared';
import AnimateOnScroll from '../AnimateOnScroll';
import CulturalHistorySection from '../CulturalHistorySection';
import ScheduleSection from '../ScheduleSection';
import FAQSection from '../FAQSection';
import LevelCardsSection, { type LevelConfig } from '../shared/LevelCardsSection';
import PrepareClassSection, { type PrepareConfig } from '../shared/PrepareClassSection';
import AnimatedCounter from '../AnimatedCounter';
import YouTubeEmbed from '../YouTubeEmbed';
import { AggregateReviewsSchema, CourseSchemaEnterprise } from '../SchemaMarkup';
import { StarRating, CheckIcon, CheckCircleIcon, CalendarDaysIcon } from '../../lib/icons';
import { UsersIcon, MapPinIcon } from '../shared/CommonIcons';
import type { Testimonial } from '../../types';
import type { FAQ } from './ClassPageTemplate';
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';
import { getStyleImage, getContextualAltKey } from '../../constants/style-images';
import LeadCaptureModal from '../shared/LeadCaptureModal';
import ReviewsSection from '../reviews/ReviewsSection';
import { useReviews, getReviewText } from '../../hooks/useReviews';

// ============= CONFIG TYPES =============

export interface TeacherConfig {
  name: string;
  specialty: string; // Translation key for specialty
  bio: string; // Translation key for bio
  image?: string;
  imageSrcSet?: string; // WebP srcSet for responsive images
  imageSrcSetAvif?: string; // AVIF srcSet for modern browsers
  objectPosition?: string; // Face focus position (default: 'center 20%')
}

export interface PillarConfig {
  id: string;
  icon: string;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  itemKeys: string[]; // 3 items
  resultKey: string;
}

export interface ComparisonRowConfig {
  labelKey: string;
  othersKey: string;
  methodKey: string;
}

export interface TransformRowConfig {
  id: string;
  labelKey: string;
  beforeKey: string;
  afterKey: string;
}

export interface WhyChooseConfig {
  titleKey: string;
  descKey: string;
}

export interface ScheduleItem {
  id: string;
  dayKey: string;
  classNameKey?: string; // Translation key for class name (preferred for i18n)
  className?: string; // Direct class name (deprecated - use classNameKey for i18n)
  time: string;
  teacher: string;
  levelKey: string;
}

export interface NearbyArea {
  name: string;
  time: string;
}

export interface StyleComparisonData {
  styles: { key: string; nameKey: string }[];
  rows: { rowKey: string; values: number[] }[];
}

export interface LogoConfig {
  src: string;
  alt: string;
  name: string;
}

export interface LadyStyleTemplateConfig {
  // SEO
  pageSlug: string; // e.g., 'salsa-lady-style-barcelona'
  pageTitleKey: string;
  metaDescriptionKey: string;
  ogImage: string;
  courseSchemaDescKey: string;

  // Breadcrumb keys
  breadcrumb: {
    homeKey: string;
    classesKey: string;
    parentKey: string;
    parentUrl: string;
    currentKey: string;
  };

  // Hero
  hero: {
    titleKey: string;
    subtitleKey: string;
    descKey: string;
    /** Single CTA key - opens lead capture modal (like home) */
    ctaKey: string;
    ctaSubtextKey: string;
    stats: {
      rating: string;
      reviewCountKey?: string; // Translation key (preferred for i18n)
      reviewCount?: string; // Direct value (deprecated - use reviewCountKey)
      studentsKey?: string; // Translation key (preferred for i18n)
      students?: string; // Direct value (deprecated - use studentsKey)
      yearsTextKey?: string; // Translation key (preferred for i18n)
      yearsText?: string; // Direct value (deprecated - use yearsTextKey)
    };
  };

  // Enterprise Image Configuration
  // styleKey maps to STYLE_IMAGES in constants/style-images.ts
  images: {
    styleKey: string; // e.g., 'salsa_lady_style' - used for hero and whatIs images
  };

  // Hero Visual Configuration (Enterprise-level customization)
  heroVisuals?: {
    /** Image opacity (0-100, default: 40) */
    imageOpacity?: number;
    /** Object position for hero image (default: 'center') */
    objectPosition?: string;
    /** Gradient overlay style: 'dark' (default), 'subtle', 'vibrant', 'none' */
    gradientStyle?: 'dark' | 'subtle' | 'vibrant' | 'none';
    /** Enable text shadow for better contrast (default: false) */
    textShadow?: boolean;
    /** Custom gradient (overrides gradientStyle) */
    customGradient?: string;
    /** Hero text style: 'holographic' (default neon effect) or 'simple' (clean like home) */
    heroTextStyle?: 'holographic' | 'simple';
  };

  // What is section
  whatIs: {
    titleKey: string;
    descKey: string;
    quoteKey: string;
    quoteAuthor: {
      name: string;
      credentialKey: string;
      image?: string;
      imageSrcSet?: string; // WebP srcSet for responsive images
      imageSrcSetAvif?: string; // AVIF srcSet for modern browsers
      objectPosition?: string;
    };
  };

  // Schedule
  schedules: ScheduleItem[];
  scheduleTitleKey: string;
  scheduleSubtitleKey: string;

  // Levels
  levels: LevelConfig[];
  levelsTitleKey: string;

  // Teachers
  teachers: TeacherConfig[];
  teachersTitleKey: string;
  teachersSubtitleKey: string;
  teachersClosingKey: string;

  // Prepare
  prepareConfig: PrepareConfig;
  prepareTitleKey: string;
  prepareSubtitleKey: string;

  // Identification/Pain points
  identify: {
    titleKey: string;
    count: number; // Number of pain points (e.g., 6)
    prefixKey: string; // e.g., 'salsaLadyIdentify' -> salsaLadyIdentify1, salsaLadyIdentify2...
    transitionKey: string;
    needTitleKey: string;
    solutionKey: string;
    closingKey: string;
  };

  // 6 Pillars
  pillars: PillarConfig[];
  pillarsSectionTitleKey: string;
  pillarsSectionSubtitleKey: string;

  // Comparison table (Method vs Others)
  comparison: {
    titleKey: string;
    aspectKey: string;
    othersColumnKey: string;
    methodColumnKey: string;
    rows: ComparisonRowConfig[];
  };

  // For who / not for who
  forWho: {
    titleKey: string;
    yesTitle: string;
    yesPrefixKey: string; // e.g., 'salsaLadyV2ForYes' -> salsaLadyV2ForYes1...
    yesCount: number;
    noTitle: string;
    noPrefixKey: string;
    noCount: number;
    ctaTextKey: string;
  };

  // Transformation table
  transformation: {
    titleKey: string;
    aspectKey: string;
    beforeKey: string;
    afterKey: string;
    rows: TransformRowConfig[];
  };

  // Why choose section
  whyChoose: {
    titleKey: string;
    items: WhyChooseConfig[];
  };

  // Stats
  stats: {
    years: number;
    activeStudents: number;
    totalStudents: number;
  };

  // Logos section
  logos: {
    titleKey: string;
    items: LogoConfig[];
    festivalTextKey: string;
  };

  // Video (optional - shows placeholder if no id provided)
  video: {
    id?: string; // YouTube video ID - if empty/undefined, shows "Coming Soon" placeholder
    titleKey: string;
    descKey: string;
  };

  // Testimonials (deprecated - use googleReviewsSection for enterprise)
  testimonials?: Testimonial[];

  // Google Reviews Section (Enterprise - replaces testimonials)
  googleReviewsSection?: {
    enabled: boolean;
    /** Filter by dance category */
    category?: 'salsa-cubana' | 'heels-femmology' | 'bachata' | 'urbanas' | 'general';
    /** Filter by teacher name (case-insensitive) */
    teacher?: string;
    /** Curated list of author names - when provided, shows ONLY these reviews */
    selectedAuthors?: string[];
    /** Maximum number of reviews to display (default: 6) */
    limit?: number;
    /** Show Google rating badge (default: true) */
    showGoogleBadge?: boolean;
    /** Layout style (default: 'grid') */
    layout?: 'grid' | 'list';
  };

  // Style comparison table
  styleComparison: {
    titleKey: string;
    subtitleKey: string;
    featureKey: string;
    data: StyleComparisonData;
  };

  // Cultural history
  cultural: {
    titleKey: string;
    shortDescKey: string;
    fullHistoryKey: string;
  };

  // FAQs
  faqs: FAQ[];
  faqTitleKey: string;

  // Nearby areas
  nearby: {
    titleKey: string;
    descKey: string;
    searchTextKey: string;
    metroKey: string;
    areas: NearbyArea[];
  };

  // Final CTA
  finalCta: {
    titleKey: string;
    descKey: string;
    /** Single CTA key - opens lead capture modal (like home) */
    ctaKey: string;
    ctaSubtextKey: string;
  };
}

// ============= PILLAR ICONS =============
const PillarIcon: React.FC<{ type: string; className?: string }> = ({ type, className = '' }) => {
  const icons: Record<string, React.ReactElement> = {
    braceo: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
    caderas: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
    giros: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    ),
    tacones: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
        />
      </svg>
    ),
    musicalidad: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
        />
      </svg>
    ),
    presencia: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
    sensualidad: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
        />
      </svg>
    ),
    ondulacion: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  };
  return icons[type] || icons['braceo'];
};

// ============= MAIN TEMPLATE =============

interface LadyStyleTemplateProps {
  config: LadyStyleTemplateConfig;
}

// Hero gradient presets for enterprise-level visual customization
const HERO_GRADIENT_PRESETS = {
  dark: 'bg-gradient-to-br from-primary-dark/60 via-black/80 to-black',
  subtle: 'bg-gradient-to-br from-black/40 via-black/50 to-black/70',
  vibrant: 'bg-gradient-to-t from-black/90 via-black/40 to-transparent',
  none: '',
} as const;

const LadyStyleTemplate: React.FC<LadyStyleTemplateProps> = ({ config }) => {
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
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const baseUrl = 'https://www.farrayscenter.com';
  const pageUrl = `${baseUrl}/${locale}/clases/${config.pageSlug}`;

  // Hero visual configuration with defaults
  const heroVisuals = {
    imageOpacity: config.heroVisuals?.imageOpacity ?? 40,
    objectPosition: config.heroVisuals?.objectPosition ?? 'center',
    gradientStyle: config.heroVisuals?.gradientStyle ?? 'dark',
    textShadow: config.heroVisuals?.textShadow ?? false,
    customGradient: config.heroVisuals?.customGradient,
    heroTextStyle: config.heroVisuals?.heroTextStyle ?? 'holographic',
  };

  // Compute hero gradient class
  const heroGradientClass = heroVisuals.customGradient
    ? heroVisuals.customGradient
    : HERO_GRADIENT_PRESETS[heroVisuals.gradientStyle];

  // Text shadow style for better contrast on vibrant backgrounds
  const heroTextShadowStyle = heroVisuals.textShadow
    ? { textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }
    : {};

  // Schedule data
  const schedules = config.schedules.map(schedule => ({
    ...schedule,
    day: t(schedule.dayKey),
    className: schedule.classNameKey ? t(schedule.classNameKey) : (schedule.className ?? ''),
    level: t(schedule.levelKey),
  }));

  // FAQs
  const faqs = config.faqs.map(faq => ({
    id: faq.id,
    question: t(faq.questionKey),
    answer: t(faq.answerKey),
  }));

  // Google Reviews hook for enterprise mode
  const googleReviewsConfig = config.googleReviewsSection;
  const { reviews: googleReviews } = useReviews({
    category: googleReviewsConfig?.category,
    teacher: googleReviewsConfig?.teacher,
    selectedAuthors: googleReviewsConfig?.selectedAuthors,
    limit: googleReviewsConfig?.enabled ? (googleReviewsConfig.limit ?? 6) : 0,
  });

  // Schema Markup data for reviews - Enterprise: use Google Reviews when enabled
  const reviewsSchemaData = googleReviewsConfig?.enabled
    ? googleReviews.map(review => ({
        author: review.author,
        reviewRating: { ratingValue: review.rating.toString(), bestRating: '5' },
        reviewBody: getReviewText(review, locale as Locale),
        datePublished: review.dateISO,
      }))
    : (config.testimonials ?? []).map(testimonial => ({
        author: testimonial.name,
        reviewRating: { ratingValue: testimonial.rating.toString(), bestRating: '5' },
        reviewBody: testimonial.quote[locale as Locale],
        datePublished: new Date().toISOString(),
      }));

  // VideoObject schema removed: class pages are not "video watch pages" per Google's Dec 2023 policy.
  // See: https://support.google.com/webmasters/answer/9495631

  // Schedule data for CourseSchemaEnterprise
  const courseSchedules = config.schedules.map(schedule => ({
    className: schedule.classNameKey ? t(schedule.classNameKey) : '',
    dayKey: schedule.dayKey,
    time: schedule.time,
    teacher: schedule.teacher,
  }));

  // Breadcrumb items for visual navigation
  const breadcrumbItems = [
    { name: t(config.breadcrumb.homeKey), url: `/${locale}` },
    { name: t(config.breadcrumb.classesKey), url: `/${locale}/clases/baile-barcelona` },
    {
      name: t(config.breadcrumb.parentKey),
      url: `/${locale}${config.breadcrumb.parentUrl}`,
    },
    {
      name: t(config.breadcrumb.currentKey),
      url: `/${locale}/clases/${config.pageSlug}`,
      isActive: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t(config.pageTitleKey)} | Farray&apos;s Center</title>
        <meta name="description" content={t(config.metaDescriptionKey)} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${t(config.pageTitleKey)} | Farray&apos;s Center`} />
        <meta property="og:description" content={t(config.metaDescriptionKey)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}${config.ogImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t(config.pageTitleKey)} | Farray's Center`} />
        <meta name="twitter:description" content={t(config.metaDescriptionKey)} />
        <meta name="twitter:image" content={`${baseUrl}${config.ogImage}`} />
      </Helmet>

      {/* VideoObject schema removed - class pages are not video watch pages */}

      {/* BreadcrumbList generated at build-time by prerender.mjs */}

      {/* LocalBusiness Schema removed - already injected at build-time by prerender.mjs */}
      {/* Enterprise Course Schema with CourseInstance for each schedule */}
      <CourseSchemaEnterprise
        name={`${t(config.pageTitleKey)} - Método Farray`}
        description={t(config.courseSchemaDescKey)}
        pageUrl={pageUrl}
        baseUrl={baseUrl}
        schedules={courseSchedules}
      />
      <AggregateReviewsSchema
        itemName={`${t(config.pageTitleKey)} - Farray's Center`}
        itemType="Course"
        reviews={reviewsSchemaData}
      />

      <main className="bg-black text-neutral min-h-screen pt-20 md:pt-24">
        {/* 1. Hero Section - Enterprise with OptimizedImage */}
        <section
          id="hero"
          aria-labelledby="hero-title"
          className="relative min-h-[90vh] sm:min-h-[600px] flex items-center justify-center overflow-hidden py-16 sm:py-24 md:py-32"
        >
          {/* Enterprise Background Image with OptimizedImage */}
          <div className="absolute inset-0">
            <OptimizedImage
              src={getStyleImage(config.images.styleKey).basePath}
              altKey={getContextualAltKey(config.images.styleKey, 'hero')}
              altFallback={getStyleImage(config.images.styleKey).fallbackAlt}
              aspectRatio="16/9"
              sizes="100vw"
              priority="high"
              breakpoints={getStyleImage(config.images.styleKey).breakpoints}
              formats={getStyleImage(config.images.styleKey).formats}
              className={`w-full h-full object-cover`}
              style={{
                opacity: heroVisuals.imageOpacity / 100,
                objectPosition: heroVisuals.objectPosition,
              }}
              placeholder="color"
              placeholderColor="#000"
            />
            {heroGradientClass && <div className={`absolute inset-0 ${heroGradientClass}`}></div>}
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center">
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/75" />

            <AnimateOnScroll>
              <h1
                id="hero-title"
                className={`text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-4 sm:mb-6 ${heroVisuals.heroTextStyle === 'simple' ? 'text-white' : 'holographic-text'}`}
                style={
                  heroVisuals.heroTextStyle === 'simple'
                    ? { textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }
                    : heroTextShadowStyle
                }
              >
                {t(config.hero.titleKey)}
              </h1>
              <p
                className={`text-xl sm:text-3xl md:text-4xl font-bold mb-4 ${heroVisuals.heroTextStyle === 'simple' ? 'text-white' : 'holographic-text'}`}
                style={
                  heroVisuals.heroTextStyle === 'simple'
                    ? { textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }
                    : heroTextShadowStyle
                }
              >
                {t(config.hero.subtitleKey)}
              </p>
              <p
                className="max-w-4xl mx-auto text-base sm:text-xl md:text-2xl text-neutral/90 mt-4 sm:mt-8 mb-6 leading-relaxed px-2"
                style={heroTextShadowStyle}
              >
                {t(config.hero.descKey)}
              </p>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-8 mb-6 sm:mb-8 text-neutral/80">
                <div className="flex items-center gap-2">
                  <StarRating size="sm" />
                  <span className="font-semibold">{config.hero.stats.rating}</span>
                  <span className="text-sm">
                    (
                    {config.hero.stats.reviewCountKey
                      ? t(config.hero.stats.reviewCountKey)
                      : config.hero.stats.reviewCount}
                    )
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary-accent" />
                  <span className="text-sm sm:text-base">
                    {config.hero.stats.studentsKey
                      ? t(config.hero.stats.studentsKey)
                      : config.hero.stats.students}
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-primary-accent" />
                  <span className="text-sm sm:text-base">
                    {config.hero.stats.yearsTextKey
                      ? t(config.hero.stats.yearsTextKey)
                      : config.hero.stats.yearsText}
                  </span>
                </div>
              </div>

              {/* CTA Button - Single button like home */}
              <div className="flex flex-col items-center justify-center mt-8 sm:mt-10">
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="w-full sm:w-auto bg-primary-accent text-white font-bold text-sm xl:text-base py-2.5 xl:py-3 px-5 xl:px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow focus:outline-none focus:ring-4 focus:ring-primary-accent/50"
                >
                  {t(config.hero.ctaKey)}
                  <svg
                    className="w-4 h-4 ml-1.5 inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
                <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
                  {t(config.hero.ctaSubtextKey)}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 2. What is Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-primary-dark/20 via-black to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-accent/10 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-dark/15 via-transparent to-transparent"></div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                  {t(config.whatIs.titleKey)}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/90 leading-relaxed mb-12">
                  {t(config.whatIs.descKey)}
                </p>

                {/* Premium 3D Quote Card */}
                <div className="[perspective:1200px] max-w-3xl mx-auto">
                  <div className="group relative p-8 sm:p-10 bg-gradient-to-br from-primary-accent/20 via-black/80 to-primary-dark/25 backdrop-blur-xl rounded-3xl border border-primary-accent/50 shadow-2xl shadow-primary-accent/20 transition-all duration-700 [transform-style:preserve-3d] hover:[transform:rotateY(-3deg)_rotateX(2deg)_translateY(-8px)] hover:shadow-accent-glow hover:border-primary-accent/70">
                    <div className="absolute -top-4 -left-4 w-10 h-10 border-t-3 border-l-3 border-primary-accent/70 rounded-tl-xl"></div>
                    <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-3 border-r-3 border-primary-accent/70 rounded-br-xl"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="text-6xl text-primary-accent/50">&ldquo;</span>
                    </div>

                    <blockquote className="relative z-10">
                      <p className="text-neutral text-lg sm:text-xl md:text-2xl italic leading-relaxed font-light">
                        {t(config.whatIs.quoteKey)}
                      </p>
                    </blockquote>

                    <div className="mt-8 pt-6 border-t border-primary-accent/30 flex items-center justify-center gap-4">
                      <figure className="w-14 h-14 rounded-full overflow-hidden border-3 border-primary-accent/60 shadow-lg shadow-primary-accent/20">
                        {config.whatIs.quoteAuthor.image ? (
                          <picture>
                            {/* AVIF: Best compression, modern browsers */}
                            {config.whatIs.quoteAuthor.imageSrcSetAvif && (
                              <source
                                type="image/avif"
                                srcSet={config.whatIs.quoteAuthor.imageSrcSetAvif}
                                sizes="56px"
                              />
                            )}
                            {/* WebP: Good compression, wide support */}
                            {config.whatIs.quoteAuthor.imageSrcSet && (
                              <source
                                type="image/webp"
                                srcSet={config.whatIs.quoteAuthor.imageSrcSet}
                                sizes="56px"
                              />
                            )}
                            <img
                              src={config.whatIs.quoteAuthor.image}
                              alt={config.whatIs.quoteAuthor.name}
                              width="56"
                              height="56"
                              className="w-full h-full object-cover"
                              style={{
                                objectPosition:
                                  config.whatIs.quoteAuthor.objectPosition || 'center 20%',
                              }}
                              loading="lazy"
                            />
                          </picture>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-accent/30 to-primary-dark/50 flex items-center justify-center">
                            <span className="text-lg font-black text-primary-accent/60">
                              {config.whatIs.quoteAuthor.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </span>
                          </div>
                        )}
                      </figure>
                      <div className="text-left">
                        <cite className="not-italic font-bold text-neutral text-lg">
                          {config.whatIs.quoteAuthor.name}
                        </cite>
                        <p className="text-primary-accent text-sm font-medium">
                          {t(config.whatIs.quoteAuthor.credentialKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 3. Schedule Section */}
        <ScheduleSection
          id="schedule"
          titleKey={config.scheduleTitleKey}
          subtitleKey={config.scheduleSubtitleKey}
          schedules={schedules}
          t={t}
        />

        {/* 4. Level Cards Section */}
        <LevelCardsSection titleKey={config.levelsTitleKey} levels={config.levels} />

        {/* 5. Teachers Section */}
        <section
          id="teachers"
          aria-labelledby="teachers-title"
          className="py-12 md:py-16 bg-primary-dark/10 relative overflow-hidden"
        >
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto">
                <h2
                  id="teachers-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral holographic-text"
                >
                  {t(config.teachersTitleKey)}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/70 mt-4">
                  {t(config.teachersSubtitleKey)}
                </p>
              </div>
            </AnimateOnScroll>

            <div
              className={`grid gap-4 sm:gap-6 max-w-5xl mx-auto ${
                config.teachers.length === 1
                  ? 'max-w-md mx-auto'
                  : config.teachers.length === 2
                    ? 'sm:grid-cols-2 max-w-3xl'
                    : 'sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {config.teachers.map((teacher, index) => (
                <AnimateOnScroll
                  key={teacher.name}
                  delay={(index + 1) * ANIMATION_DELAYS.STAGGER_SMALL}
                  className="[perspective:1000px]"
                >
                  <div className="group h-full bg-black/70 backdrop-blur-md border border-primary-dark/50 hover:border-primary-accent rounded-2xl shadow-lg p-5 sm:p-6 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.02)_rotateY(3deg)] hover:shadow-accent-glow">
                    <div className="flex flex-col items-center text-center">
                      <figure className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary-accent/50 group-hover:border-primary-accent transition-colors duration-300 mb-3 sm:mb-4">
                        {teacher.image ? (
                          <picture>
                            {/* AVIF: Best compression, modern browsers */}
                            {teacher.imageSrcSetAvif && (
                              <source
                                type="image/avif"
                                srcSet={teacher.imageSrcSetAvif}
                                sizes="128px"
                              />
                            )}
                            {/* WebP: Good compression, wide support */}
                            {teacher.imageSrcSet && (
                              <source
                                type="image/webp"
                                srcSet={teacher.imageSrcSet}
                                sizes="128px"
                              />
                            )}
                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              width="128"
                              height="128"
                              className="w-full h-full object-cover"
                              style={{ objectPosition: teacher.objectPosition || 'center 20%' }}
                              loading="lazy"
                            />
                          </picture>
                        ) : (
                          <div className="w-full h-full bg-primary-dark/30 flex items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-black text-primary-accent/50">
                              {teacher.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </span>
                          </div>
                        )}
                      </figure>
                      <h3 className="text-lg sm:text-xl font-bold text-neutral mb-1 sm:mb-2">
                        {teacher.name}
                      </h3>
                      <p className="text-primary-accent font-semibold text-sm sm:text-base mb-2 sm:mb-3">
                        {t(teacher.specialty)}
                      </p>
                      <p className="text-neutral/90 leading-relaxed text-xs sm:text-sm">
                        {t(teacher.bio)}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll>
              <p className="text-center text-base sm:text-lg text-neutral/90 mt-8 sm:mt-10 max-w-2xl mx-auto">
                {t(config.teachersClosingKey)}
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 6. Prepare Section */}
        <PrepareClassSection
          titleKey={config.prepareTitleKey}
          subtitleKey={config.prepareSubtitleKey}
          config={config.prepareConfig}
        />

        {/* 7. Identification Section - Pain Points */}
        <section aria-labelledby="identify-title" className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto">
                <h2
                  id="identify-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-6 sm:mb-8 holographic-text"
                >
                  {t(config.identify.titleKey)}
                </h2>
              </div>
            </AnimateOnScroll>

            <ul
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-8 sm:mb-10 list-none"
              role="list"
            >
              {Array.from({ length: config.identify.count }, (_, i) => i + 1).map((num, index) => (
                <AnimateOnScroll
                  key={num}
                  as="li"
                  delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                  className="[perspective:1000px]"
                >
                  <div className="group relative h-full min-h-[100px] flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-primary-dark/20 rounded-xl border border-primary-dark/50 hover:border-primary-accent transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.05)_rotateY(5deg)] hover:shadow-accent-glow">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center group-hover:bg-primary-accent/40 transition-colors duration-300"
                      aria-hidden="true"
                    >
                      <CheckIcon className="text-primary-accent" size="sm" />
                    </div>
                    <p className="text-neutral/90 leading-relaxed">
                      {t(`${config.identify.prefixKey}${num}`)}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </ul>

            <AnimateOnScroll>
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-sm text-neutral/75 italic max-w-2xl mx-auto">
                  {t(config.identify.transitionKey)}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <div className="text-center mb-6 sm:mb-8 max-w-4xl mx-auto">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 sm:mb-6 holographic-text">
                  {t(config.identify.needTitleKey)}
                </h3>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <div className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg text-neutral/90">
                  {t(config.identify.solutionKey)}
                </p>
                <p className="text-lg sm:text-xl text-neutral/90 italic">
                  {t(config.identify.closingKey)}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 8. 6 Pillars Section */}
        <section
          id="pillars"
          aria-labelledby="pillars-title"
          className="py-12 md:py-16 bg-primary-dark/10"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-8 sm:mb-12">
                <h2
                  id="pillars-title"
                  className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-3 sm:mb-4 holographic-text"
                >
                  {t(config.pillarsSectionTitleKey)}
                </h2>
                <p className="text-sm sm:text-lg text-neutral/70 max-w-2xl mx-auto">
                  {t(config.pillarsSectionSubtitleKey)}
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {config.pillars.map((pillar, index) => (
                <AnimateOnScroll
                  key={pillar.id}
                  delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                  className="[perspective:1000px]"
                >
                  <div className="group h-full p-5 sm:p-6 bg-black/50 backdrop-blur-md border border-primary-dark/50 hover:border-primary-accent rounded-2xl transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.75rem)_rotateY(5deg)_rotateX(2deg)] hover:shadow-accent-glow relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl bg-primary-accent/20"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-accent/20 flex items-center justify-center group-hover:bg-primary-accent/40 transition-colors">
                          <PillarIcon
                            type={pillar.icon}
                            className="w-5 h-5 sm:w-6 sm:h-6 text-primary-accent"
                          />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-primary-accent/50">
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-neutral mb-1 sm:mb-2">
                        {t(pillar.titleKey)}
                      </h3>
                      <p className="text-xs sm:text-sm text-primary-accent italic mb-2 sm:mb-3">
                        {t(pillar.subtitleKey)}
                      </p>
                      <p className="text-neutral/80 text-xs sm:text-sm mb-3 sm:mb-4">
                        {t(pillar.descKey)}
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {pillar.itemKeys.map((itemKey, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="flex items-start gap-2 text-xs sm:text-sm text-neutral/70"
                          >
                            <span className="text-primary-accent mt-0.5">-</span>
                            {t(itemKey)}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-primary-accent italic">
                        {t(pillar.resultKey)}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Comparison Table - Method vs Others */}
        <section className="py-12 md:py-16 bg-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-3 sm:mb-4 holographic-text">
                  {t(config.comparison.titleKey)}
                </h2>
              </div>

              <div className="w-full flex justify-center">
                <div className="w-full max-w-5xl overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[500px] mx-auto">
                    <thead>
                      <tr className="border-b border-neutral/20">
                        <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-neutral/70 font-semibold">
                          {t(config.comparison.aspectKey)}
                        </th>
                        <th className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-400 font-semibold">
                          {t(config.comparison.othersColumnKey)}
                        </th>
                        <th className="text-center py-3 sm:py-4 px-3 sm:px-4 text-primary-accent font-semibold">
                          {t(config.comparison.methodColumnKey)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.comparison.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-neutral/10 ${idx % 2 === 0 ? 'bg-black/20' : ''}`}
                        >
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-neutral/90 font-medium">
                            {t(row.labelKey)}
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-red-400/70">
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              <span className="hidden sm:inline">{t(row.othersKey)}</span>
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-center bg-primary-accent/10">
                            <span className="inline-flex items-center gap-1 text-primary-accent">
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="hidden sm:inline">{t(row.methodKey)}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 10. For Who / Not For Who */}
        <section className="py-12 md:py-16 bg-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-dark/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-10 sm:mb-14">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral holographic-text">
                  {t(config.forWho.titleKey)}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-10 max-w-5xl mx-auto [perspective:1200px]">
                {/* YES */}
                <div className="relative group [perspective:1000px]">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-accent/30 to-primary-accent/10 rounded-2xl blur opacity-50 group-hover:opacity-90 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl bg-primary-accent/20"></div>
                  <div className="relative p-6 sm:p-8 bg-black/90 backdrop-blur-sm rounded-2xl border border-primary-accent/20 [transform-style:preserve-3d] transition-all duration-500 group-hover:[transform:translateY(-0.75rem)_rotateX(2deg)_rotateY(5deg)] group-hover:border-primary-accent/50 group-hover:shadow-accent-glow">
                    <h3 className="text-xl sm:text-2xl font-bold text-primary-accent mb-6 sm:mb-8 tracking-tight [transform:translateZ(25px)]">
                      {t(config.forWho.yesTitle)}
                    </h3>
                    <ul className="space-y-3 sm:space-y-4 [transform:translateZ(15px)]">
                      {Array.from({ length: config.forWho.yesCount }, (_, i) => i + 1).map(num => (
                        <li key={num} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-accent/20 flex items-center justify-center mt-0.5">
                            <CheckIcon className="text-primary-accent" size="sm" />
                          </span>
                          <span className="text-neutral/80 text-sm sm:text-base leading-relaxed">
                            {t(`${config.forWho.yesPrefixKey}${num}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* NO */}
                <div className="relative group [perspective:1000px]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-md bg-neutral/15"></div>
                  <div className="relative p-6 sm:p-8 bg-neutral/5 backdrop-blur-sm rounded-2xl border border-neutral/10 [transform-style:preserve-3d] transition-all duration-500 group-hover:[transform:translateY(-0.75rem)_rotateX(2deg)_rotateY(-5deg)] group-hover:border-neutral/30 group-hover:shadow-lg">
                    <h3 className="text-xl sm:text-2xl font-bold text-neutral/70 mb-6 sm:mb-8 tracking-tight">
                      {t(config.forWho.noTitle)}
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {Array.from({ length: config.forWho.noCount }, (_, i) => i + 1).map(num => (
                        <li key={num} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral/10 flex items-center justify-center mt-0.5">
                            <svg
                              className="w-3 h-3 text-neutral/40"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </span>
                          <span className="text-neutral/70 text-sm sm:text-base leading-relaxed">
                            {t(`${config.forWho.noPrefixKey}${num}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mt-12 sm:mt-16">
                <p className="text-base sm:text-lg text-neutral/70 mb-6 sm:mb-8 max-w-xl mx-auto">
                  {t(config.forWho.ctaTextKey)}
                </p>
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="inline-block bg-primary-accent text-white font-bold text-base sm:text-lg py-4 px-10 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
                >
                  {t(config.hero.ctaKey)}
                </button>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 11. Transformation Table */}
        <section className="py-12 md:py-16 bg-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-3 sm:mb-4 holographic-text">
                  {t(config.transformation.titleKey)}
                </h2>
              </div>

              <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[400px] mx-auto">
                    <thead>
                      <tr className="border-b border-neutral/20">
                        <th className="text-left py-3 px-3 sm:px-4 text-neutral/70 font-semibold">
                          {t(config.transformation.aspectKey)}
                        </th>
                        <th className="text-center py-3 px-3 sm:px-4 text-red-400/70 font-semibold">
                          {t(config.transformation.beforeKey)}
                        </th>
                        <th className="text-center py-3 px-3 sm:px-4 text-primary-accent font-semibold">
                          {t(config.transformation.afterKey)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.transformation.rows.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`border-b border-neutral/10 ${idx % 2 === 0 ? 'bg-black/20' : ''}`}
                        >
                          <td className="py-3 px-3 sm:px-4 text-neutral/90 font-medium capitalize">
                            {t(row.labelKey)}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center text-red-400/60 text-xs sm:text-sm">
                            {t(row.beforeKey)}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center text-primary-accent bg-primary-accent/10 text-xs sm:text-sm">
                            {t(row.afterKey)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 12. Why Choose + Stats + Logos */}
        <section className="py-12 md:py-16 bg-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-8 sm:mb-10 max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t(config.whyChoose.titleKey)}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-10 sm:mb-12">
              {config.whyChoose.items.map((item, index) => (
                <AnimateOnScroll
                  key={index}
                  delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                  className={`[perspective:1000px] ${
                    index === config.whyChoose.items.length - 1 &&
                    config.whyChoose.items.length % 3 !== 0
                      ? 'lg:col-start-2'
                      : ''
                  }`}
                >
                  <div className="group h-full min-h-[140px] sm:min-h-[160px] p-4 sm:p-6 bg-black/30 rounded-xl border border-primary-dark/50 hover:border-primary-accent transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_scale(1.05)_rotateY(5deg)] hover:shadow-accent-glow">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-accent/20 flex items-center justify-center group-hover:bg-primary-accent/40 transition-colors duration-300">
                        <CheckCircleIcon className="w-6 h-6 text-primary-accent" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-neutral mb-2">
                          {t(item.titleKey)}
                        </h3>
                        <p className="text-neutral/90 text-sm leading-relaxed">{t(item.descKey)}</p>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Stats */}
            <AnimateOnScroll>
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-16 max-w-5xl mx-auto mb-10 sm:mb-12">
                <div className="text-center">
                  <AnimatedCounter
                    target={config.stats.years}
                    suffix="+"
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                  />
                  <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                    {t('yearsExperience')}
                  </p>
                </div>
                <div className="text-center">
                  <AnimatedCounter
                    target={config.stats.activeStudents}
                    suffix="+"
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                  />
                  <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                    {t('activeStudents')}
                  </p>
                </div>
                <div className="text-center">
                  <AnimatedCounter
                    target={config.stats.totalStudents}
                    suffix="+"
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 holographic-text"
                  />
                  <p className="text-sm sm:text-base text-neutral/80 font-semibold uppercase tracking-wide">
                    {t('satisfiedStudents')}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Logos */}
            <AnimateOnScroll>
              <div className="text-center max-w-4xl mx-auto">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-6 sm:mb-8 holographic-text">
                  {t(config.logos.titleKey)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto items-center mb-4 sm:mb-6">
                  {config.logos.items.map((logo, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-primary-accent/20 hover:border-primary-accent transition-all duration-300 hover:scale-105"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden rounded-lg">
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-neutral/90 font-bold text-xs sm:text-sm text-center">
                        {logo.name}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter holographic-text">
                  {t(config.logos.festivalTextKey)}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 13. Video Section */}
        <section className="py-12 md:py-16 bg-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t(config.video.titleKey)}
                </h2>
                <p className="text-lg text-neutral/70 max-w-2xl mx-auto">
                  {t(config.video.descKey)}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll>
              {config.video.id ? (
                /* Video disponible - mostrar YouTubeEmbed */
                <div className="max-w-4xl mx-auto">
                  <YouTubeEmbed
                    videoId={config.video.id}
                    title={t(config.video.titleKey)}
                    disableSchema
                  />
                </div>
              ) : (
                /* Video Coming Soon Placeholder - Enterprise (Not clickable) */
                <div className="max-w-2xl mx-auto">
                  <div className="relative aspect-video bg-gradient-to-br from-primary-dark/40 via-black/60 to-primary-dark/30 rounded-2xl border border-primary-accent/20 overflow-hidden shadow-xl pointer-events-none select-none">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                      {/* Play icon placeholder */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-accent/20 border-2 border-primary-accent/40 flex items-center justify-center mb-4 backdrop-blur-sm">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-primary-accent/60"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>

                      {/* Text */}
                      <p className="text-lg sm:text-xl font-bold text-neutral/90 mb-1">
                        {t('videoComingSoon')}
                      </p>
                      <p className="text-sm text-neutral/70">{t('videoComingSoonDesc')}</p>
                    </div>
                  </div>
                </div>
              )}
            </AnimateOnScroll>
          </div>
        </section>

        {/* 14. Reviews/Testimonials - Enterprise: Google Reviews System */}
        {config.googleReviewsSection?.enabled ? (
          <ReviewsSection
            id="reviews"
            category={config.googleReviewsSection.category}
            teacher={config.googleReviewsSection.teacher}
            selectedAuthors={config.googleReviewsSection.selectedAuthors}
            limit={config.googleReviewsSection.limit ?? 6}
            showGoogleBadge={config.googleReviewsSection.showGoogleBadge ?? true}
            layout={config.googleReviewsSection.layout ?? 'grid'}
            title={t('testimonialsNotRequested')}
          />
        ) : config.testimonials && config.testimonials.length > 0 ? (
          <section aria-labelledby="testimonials-title" className="py-12 md:py-16 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <AnimateOnScroll>
                <div className="text-center mb-8 sm:mb-10 max-w-4xl mx-auto">
                  <h2
                    id="testimonials-title"
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 sm:mb-6 holographic-text"
                  >
                    {t('testimonialsNotRequested')}
                  </h2>
                  <div className="inline-block">
                    <div className="mb-2 sm:mb-3 text-2xl sm:text-3xl font-black text-neutral">
                      {t('excellent')}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <StarRating size="lg" />
                    </div>
                    <div className="text-xs sm:text-sm text-neutral/70">
                      {t('pages:basedOnReviews', { count: 509 })}
                    </div>
                    <div className="mt-2 text-xs text-neutral/70">Google</div>
                  </div>
                </div>
              </AnimateOnScroll>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {config.testimonials.map((testimonial, index) => (
                  <AnimateOnScroll
                    key={testimonial.id}
                    delay={index * ANIMATION_DELAYS.STAGGER_SMALL}
                  >
                    <div className="flex flex-col h-full min-h-[180px] sm:min-h-[200px] p-4 sm:p-6 bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl shadow-lg transition-all duration-300 hover:border-primary-accent hover:shadow-accent-glow hover:-translate-y-2">
                      <div className="mb-2 sm:mb-3">
                        <StarRating size="sm" label="5 estrellas" />
                      </div>
                      <blockquote className="flex-grow text-neutral/90 mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm leading-relaxed">
                          &ldquo;{testimonial.quote[locale as Locale]}&rdquo;
                        </p>
                      </blockquote>
                      <div className="flex items-center gap-3 mt-auto pt-3 sm:pt-4 border-t border-primary-dark/30">
                        <div>
                          <cite className="font-bold text-neutral not-italic text-xs sm:text-sm">
                            {testimonial.name}
                          </cite>
                          <p className="text-xs text-neutral/75">
                            {testimonial.city[locale as Locale]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* 15. Style Comparison */}
        <section className="py-12 md:py-16 bg-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-5xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tighter text-neutral mb-2 text-center holographic-text">
                  {t(config.styleComparison.titleKey)}
                </h3>
                <p className="text-base text-neutral/70 mb-6 text-center">
                  {t(config.styleComparison.subtitleKey)}
                </p>

                {/* Mobile: Cards view */}
                <div className="block lg:hidden space-y-4">
                  {config.styleComparison.data.rows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="p-4 bg-black/30 rounded-xl border border-neutral/20"
                    >
                      <h4 className="font-bold text-neutral mb-3 text-sm">{t(row.rowKey)}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {config.styleComparison.data.styles.map((style, styleIdx) => (
                          <div
                            key={style.key}
                            className={`flex justify-between items-center p-2 rounded-lg ${
                              styleIdx === 1
                                ? 'bg-primary-accent/15 border border-primary-accent/30'
                                : 'bg-neutral/10'
                            }`}
                          >
                            <span
                              className={
                                styleIdx === 1
                                  ? 'text-primary-accent font-semibold'
                                  : 'text-neutral/70'
                              }
                            >
                              {t(style.nameKey)}
                            </span>
                            <span
                              className={
                                styleIdx === 1 ? 'text-primary-accent/80' : 'text-neutral/60'
                              }
                            >
                              {'★'.repeat(row.values[styleIdx] ?? 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table view */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral/20">
                        <th className="text-left py-3 px-2 text-neutral/70 font-semibold">
                          {t(config.styleComparison.featureKey)}
                        </th>
                        {config.styleComparison.data.styles.map((style, idx) => (
                          <th
                            key={style.key}
                            className={`text-center py-3 px-2 font-semibold ${
                              idx === 1 ? 'text-primary-accent' : 'text-neutral/70'
                            }`}
                          >
                            {t(style.nameKey)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {config.styleComparison.data.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={`border-b border-neutral/10 ${rowIdx % 2 === 0 ? 'bg-black/20' : ''}`}
                        >
                          <td className="py-3 px-2 text-neutral/80">{t(row.rowKey)}</td>
                          {row.values.map((value, styleIdx) => (
                            <td
                              key={styleIdx}
                              className={`py-3 px-2 text-center ${
                                styleIdx === 1
                                  ? 'bg-primary-accent/10 text-primary-accent/80'
                                  : 'text-neutral/60'
                              }`}
                            >
                              {'★'.repeat(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 16. Cultural History */}
        <CulturalHistorySection
          titleKey={config.cultural.titleKey}
          shortDescKey={config.cultural.shortDescKey}
          fullHistoryKey={config.cultural.fullHistoryKey}
          readMoreText={t('readMore')}
          readLessText={t('readLess')}
          t={t}
        />

        {/* 17. FAQ Section */}
        <FAQSection title={t(config.faqTitleKey)} faqs={faqs} />

        {/* 18. Local SEO Section */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto p-6 bg-black/30 rounded-2xl border border-neutral/20">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral mb-4">
                  {t(config.nearby.titleKey)}
                </h3>
                <p className="text-neutral/80 mb-6">{t(config.nearby.descKey)}</p>
                <p className="text-neutral/90 font-semibold mb-4">
                  {t(config.nearby.searchTextKey)}
                </p>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {config.nearby.areas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="w-4 h-4 text-primary-accent" />
                      <span className="text-neutral/80">
                        {area.name}: <span className="text-primary-accent">{area.time}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-neutral/70 text-sm mt-4">{t(config.nearby.metroKey)}</p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 19. Final CTA */}
        <section
          id="contact"
          className="py-12 md:py-16 bg-gradient-to-br from-primary-accent/20 via-black to-primary-dark/20"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                  {t(config.finalCta.titleKey)}
                </h2>
                <p className="text-xl text-neutral/80 mb-8 leading-relaxed whitespace-pre-line">
                  {t(config.finalCta.descKey)}
                </p>

                {/* Single CTA Button - like home */}
                <div className="flex flex-col items-center justify-center mt-8">
                  <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full sm:w-auto bg-primary-accent text-white font-bold text-sm xl:text-base py-2.5 xl:py-3 px-5 xl:px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow focus:outline-none focus:ring-4 focus:ring-primary-accent/50"
                  >
                    {t(config.finalCta.ctaKey)}
                    <svg
                      className="w-4 h-4 ml-1.5 inline-block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                  <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
                    {t(config.finalCta.ctaSubtextKey)}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 20. Related Classes Section (Internal Linking) */}
        <section
          id="related-classes"
          aria-labelledby="related-classes-title"
          className="py-12 md:py-16"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <header className="text-center mb-8 sm:mb-12 relative z-10">
                <h2
                  id="related-classes-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-4 holographic-text"
                >
                  {t('relatedClassesTitle')}
                </h2>
                <p className="text-lg sm:text-xl text-neutral/70">{t('relatedClassesSubtitle')}</p>
              </header>
            </AnimateOnScroll>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto relative z-0"
              role="list"
              aria-label={t('relatedClassesTitle')}
            >
              {/* Sexy Style */}
              <div role="listitem">
                <AnimateOnScroll
                  delay={ANIMATION_DELAYS.STAGGER_SMALL}
                  className="[perspective:1000px]"
                >
                  <article className="h-full" aria-labelledby="related-sexystyle-title">
                    <Link
                      to={`/${locale}/clases/sexy-style-barcelona`}
                      className="group block h-full bg-black/70 backdrop-blur-md
                                 border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                                 transition-all duration-500
                                 [transform-style:preserve-3d]
                                 hover:border-primary-accent hover:shadow-accent-glow
                                 hover:[transform:translateY(-0.5rem)_scale(1.02)]
                                 focus:outline-none focus:ring-2 focus:ring-primary-accent
                                 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={`${t('relatedSexyStyleName')} - ${t('relatedClassesViewClass')}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '480/320' }}>
                        <OptimizedImage
                          src={getStyleImage('sexy_style').basePath}
                          altKey={getContextualAltKey('sexy_style', 'latin')}
                          altFallback={getStyleImage('sexy_style').fallbackAlt}
                          aspectRatio="3/2"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority="low"
                          breakpoints={getStyleImage('sexy_style').breakpoints}
                          formats={getStyleImage('sexy_style').formats}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          placeholder="color"
                          placeholderColor="#111"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3
                          id="related-sexystyle-title"
                          className="text-lg sm:text-xl font-bold text-neutral mb-2 group-hover:text-primary-accent transition-colors duration-300"
                        >
                          {t('relatedSexyStyleName')}
                        </h3>
                        <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
                          {t('relatedSexyStyleDesc')}
                        </p>
                        <div
                          className="flex items-center gap-2 text-primary-accent font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                          aria-hidden="true"
                        >
                          <span>{t('relatedClassesViewClass')}</span>
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                </AnimateOnScroll>
              </div>

              {/* Femmology */}
              <div role="listitem">
                <AnimateOnScroll
                  delay={ANIMATION_DELAYS.STAGGER_SMALL * 2}
                  className="[perspective:1000px]"
                >
                  <article className="h-full" aria-labelledby="related-femmology-title">
                    <Link
                      to={`/${locale}/clases/femmology`}
                      className="group block h-full bg-black/70 backdrop-blur-md
                                 border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                                 transition-all duration-500
                                 [transform-style:preserve-3d]
                                 hover:border-primary-accent hover:shadow-accent-glow
                                 hover:[transform:translateY(-0.5rem)_scale(1.02)]
                                 focus:outline-none focus:ring-2 focus:ring-primary-accent
                                 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={`${t('relatedFemmologyName')} - ${t('relatedClassesViewClass')}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '480/320' }}>
                        <OptimizedImage
                          src={getStyleImage('femmology_heels').basePath}
                          altKey={getContextualAltKey('femmology_heels', 'latin')}
                          altFallback={getStyleImage('femmology_heels').fallbackAlt}
                          aspectRatio="3/2"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority="low"
                          breakpoints={getStyleImage('femmology_heels').breakpoints}
                          formats={getStyleImage('femmology_heels').formats}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          placeholder="color"
                          placeholderColor="#111"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3
                          id="related-femmology-title"
                          className="text-lg sm:text-xl font-bold text-neutral mb-2 group-hover:text-primary-accent transition-colors duration-300"
                        >
                          {t('relatedFemmologyName')}
                        </h3>
                        <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
                          {t('relatedFemmologyDesc')}
                        </p>
                        <div
                          className="flex items-center gap-2 text-primary-accent font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                          aria-hidden="true"
                        >
                          <span>{t('relatedClassesViewClass')}</span>
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                </AnimateOnScroll>
              </div>

              {/* Heels */}
              <div role="listitem">
                <AnimateOnScroll
                  delay={ANIMATION_DELAYS.STAGGER_SMALL * 3}
                  className="[perspective:1000px]"
                >
                  <article className="h-full" aria-labelledby="related-heels-title">
                    <Link
                      to={`/${locale}/clases/heels-barcelona`}
                      className="group block h-full bg-black/70 backdrop-blur-md
                                 border border-primary-dark/50 rounded-2xl shadow-lg overflow-hidden
                                 transition-all duration-500
                                 [transform-style:preserve-3d]
                                 hover:border-primary-accent hover:shadow-accent-glow
                                 hover:[transform:translateY(-0.5rem)_scale(1.02)]
                                 focus:outline-none focus:ring-2 focus:ring-primary-accent
                                 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={`${t('relatedHeelsName')} - ${t('relatedClassesViewClass')}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '480/320' }}>
                        <OptimizedImage
                          src={getStyleImage('heels_barcelona').basePath}
                          altKey={getContextualAltKey('heels_barcelona', 'latin')}
                          altFallback={getStyleImage('heels_barcelona').fallbackAlt}
                          aspectRatio="3/2"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority="low"
                          breakpoints={getStyleImage('heels_barcelona').breakpoints}
                          formats={getStyleImage('heels_barcelona').formats}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          placeholder="color"
                          placeholderColor="#111"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3
                          id="related-heels-title"
                          className="text-lg sm:text-xl font-bold text-neutral mb-2 group-hover:text-primary-accent transition-colors duration-300"
                        >
                          {t('relatedHeelsName')}
                        </h3>
                        <p className="text-sm text-neutral/80 leading-relaxed mb-4 line-clamp-2">
                          {t('relatedHeelsDesc')}
                        </p>
                        <div
                          className="flex items-center gap-2 text-primary-accent font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                          aria-hidden="true"
                        >
                          <span>{t('relatedClassesViewClass')}</span>
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                </AnimateOnScroll>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </>
  );
};

export default LadyStyleTemplate;
