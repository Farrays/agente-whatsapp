import { useState, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './shared/Breadcrumb';
import AnimateOnScroll from './AnimateOnScroll';
import LeadCaptureModal from './shared/LeadCaptureModal';
import { ReviewsSection } from './reviews';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
  StarIcon,
  UserIcon,
  ClockIcon,
  HeartIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  KeyIcon,
} from '../lib/icons';
import { ENROLLMENT_FEE, formatPrice } from '../constants/pricing-data';

/**
 * PreciosPage - Página de Precios con captura de leads
 * URL SEO: /precios-clases-baile-barcelona
 *
 * Estrategia:
 * - No mostrar precios detallados directamente
 * - Captar email via modal antes de revelar informacion completa
 * - Precios "desde" orientativos para SEO
 * - Tres formas de participacion simplificadas
 * - Mantener beneficios, testimonios y FAQ de la V1
 */

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Participation Card - Tarjeta de modalidad de participacion
 */
const ParticipationCard = memo(
  ({
    title,
    description,
    icon: Icon,
    includes,
    priceFrom,
    priceUnit,
    ctaText,
    onCTAClick,
    isHighlighted = false,
    t,
  }: {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    includes: string[];
    priceFrom: string;
    priceUnit?: string;
    ctaText: string;
    onCTAClick: () => void;
    isHighlighted?: boolean;
    t: (key: string) => string;
  }) => (
    <div className="[perspective:1000px] h-full">
      <div
        className={`relative h-full flex flex-col bg-black/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:shadow-accent-glow ${
          isHighlighted
            ? 'border-2 border-primary-accent shadow-accent-glow'
            : 'border border-primary-dark/50 hover:border-primary-accent/50'
        }`}
      >
        {isHighlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-accent text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            {t('pricing_popular')}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-primary-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral">{title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-neutral/70 text-sm mb-4">{description}</p>

        {/* Includes */}
        <ul className="space-y-2 mb-6 flex-grow">
          {includes.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-neutral/80">
              <CheckIcon className="w-4 h-4 text-primary-accent flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-white/10">
          <p className="text-sm text-neutral/60 mb-1">{t('pricingV2_price_indicative')}</p>
          <p className="text-2xl font-black text-neutral">
            {t('pricingV2_price_from')} {priceFrom}
            {priceUnit && (
              <span className="text-base font-normal text-neutral/60">{priceUnit}</span>
            )}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onCTAClick}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-full transition-all duration-300 ${
            isHighlighted
              ? 'bg-primary-accent text-white hover:shadow-accent-glow'
              : 'bg-white/10 text-neutral hover:bg-primary-accent hover:text-white'
          }`}
        >
          {ctaText}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
);

ParticipationCard.displayName = 'ParticipationCard';

/**
 * FAQ Item Component
 */
const FAQItem = memo(
  ({
    question,
    answer,
    isOpen,
    onToggle,
  }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div className="[perspective:1000px]">
      <div className="bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl overflow-hidden transition-all duration-500 hover:border-primary-accent [transform-style:preserve-3d] hover:[transform:translateY(-0.25rem)_rotateX(1deg)] hover:shadow-accent-glow">
        <button
          onClick={onToggle}
          className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-300 hover:bg-primary-dark/20"
          aria-expanded={isOpen}
        >
          <h3 className="text-lg font-bold text-neutral pr-4">{question}</h3>
          <ChevronDownIcon
            className={`w-5 h-5 text-primary-accent flex-shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="px-6 pb-4 text-neutral/90 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
);

FAQItem.displayName = 'FAQItem';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PreciosPage: React.FC = () => {
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FAQ state
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  // Breadcrumb
  const breadcrumbItems = [
    { name: t('pricing_breadcrumb_home'), url: `/${locale}` },
    {
      name: t('pricing_breadcrumb_current'),
      url: `/${locale}/precios-clases-baile-barcelona`,
      isActive: true,
    },
  ];

  // ============================================================================
  // ENTERPRISE SCHEMA MARKUP - GEO/AIEO/AIO Optimized
  // ============================================================================

  const pageUrl = `${baseUrl}/${locale}/precios-clases-baile-barcelona`;
  const heroImageUrl = `${baseUrl}/images/precios/img/precios-clases-baile-barcelona-hero_1920.jpg`;
  const ogImageUrl = `${baseUrl}/images/og-precios-clases-baile.jpg`;

  // Language mapping for schema
  const languageMap: Record<string, string> = {
    es: 'es-ES',
    ca: 'ca-ES',
    en: 'en-GB',
    fr: 'fr-FR',
  };

  // WebPage Schema with Speakable (Voice Search / GEO)
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: t('pricingV2_page_title'),
    description: t('pricingV2_page_description'),
    inLanguage: languageMap[locale] || 'es-ES',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: "Farray's International Dance Center",
      url: baseUrl,
    },
    about: {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      '@id': `${pageUrl}#primaryimage`,
      url: heroImageUrl,
      contentUrl: heroImageUrl,
      width: 1920,
      height: 1280,
      caption: t('precios_hero_image_alt'),
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: [
        '#pricing-hero h1',
        '#pricing-context',
        '#pricing-cards',
        '.faq-section [aria-expanded="true"]',
      ],
    },
    // BreadcrumbList generated as standalone schema at build-time by prerender.mjs
  };

  // Service Schema (más apropiado que Product para clases de baile)
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    name: t('pricing_schema_name'),
    description: t('pricing_schema_description'),
    url: pageUrl,
    image: {
      '@type': 'ImageObject',
      url: ogImageUrl,
      width: 1200,
      height: 630,
    },
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${baseUrl}/#organization`,
      name: "Farray's International Dance Center",
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo-fidc.png`,
        width: 512,
        height: 512,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: "Carrer d'Entença, 100",
        addressLocality: 'Barcelona',
        postalCode: '08015',
        addressRegion: 'Cataluña',
        addressCountry: 'ES',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 41.3784,
        longitude: 2.1426,
      },
      telephone: '+34931255891',
      priceRange: '€€',
    },
    serviceType: t('pricing_schema_serviceType'),
    areaServed: {
      '@type': 'City',
      name: 'Barcelona',
      '@id': 'https://www.wikidata.org/wiki/Q1492',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t('pricing_schema_catalog_name'),
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('pricingV2_card_regular_title'),
            description: t('pricingV2_card_regular_desc'),
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'EUR',
            price: 50,
            unitText: t('pricing_schema_perMonth'),
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('pricingV2_card_flexible_title'),
            description: t('pricingV2_card_flexible_desc'),
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'EUR',
            price: 145,
            unitText: t('pricing_schema_bono10'),
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('pricingV2_card_puntual_title'),
            description: t('pricingV2_card_puntual_desc'),
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'EUR',
            price: 20,
            unitText: t('pricing_schema_perClass'),
          },
        },
      ],
    },
    // aggregateRating removed - already in build-time LocalBusiness #danceschool schema
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: 17,
      highPrice: 300,
      offerCount: 25,
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
  };

  // FAQ data - ordenados por relevancia SEO y frecuencia de consulta
  const pricingFAQs = [
    { id: 'faq13', question: t('pricing_faq13_q'), answer: t('pricing_faq13_a') }, // ¿Cuánto cuestan? (SEO)
    { id: 'faq16', question: t('pricing_faq16_q'), answer: t('pricing_faq16_a') }, // ¿Qué estilos? (SEO)
    { id: 'faq14', question: t('pricing_faq14_q'), answer: t('pricing_faq14_a') }, // ¿Puedo ir solo/a?
    { id: 'faq2', question: t('pricing_faq2_q'), answer: t('pricing_faq2_a') }, // ¿Puedo probar?
    { id: 'faq15', question: t('pricing_faq15_q'), answer: t('pricing_faq15_a') }, // ¿Tengo que apuntarme al mes?
    { id: 'faq8', question: t('pricing_faq8_q'), answer: t('pricing_faq8_a') }, // ¿Clases sueltas?
    { id: 'faq3', question: t('pricing_faq3_q'), answer: t('pricing_faq3_a') }, // ¿Hay permanencia?
    { id: 'faq1', question: t('pricing_faq1_q'), answer: t('pricing_faq1_a') }, // Cuota inscripción
  ];

  // FAQPage Schema removed — generated at build-time by prerender.mjs

  // Handler para abrir modal
  const openModal = () => setIsModalOpen(true);

  return (
    <>
      <Helmet>
        <title>{t('pricingV2_page_title')} | Farray&apos;s Center</title>
        <meta name="description" content={t('pricingV2_page_description')} />
        <link rel="canonical" href={`${baseUrl}/${locale}/precios-clases-baile-barcelona`} />
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={t('pricingV2_page_title')} />
        <meta property="og:description" content={t('pricingV2_page_description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/${locale}/precios-clases-baile-barcelona`} />
        <meta property="og:image" content={`${baseUrl}/images/og-precios-clases-baile.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={t('precios_hero_image_alt')} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('pricingV2_page_title')} />
        <meta name="twitter:description" content={t('pricingV2_page_description')} />
        <meta name="twitter:image" content={`${baseUrl}/images/og-precios-clases-baile.jpg`} />
        {/* Enterprise Schema Markup - GEO/AIEO/AIO Optimized */}
        {/* BreadcrumbList + FAQPage generated at build-time by prerender.mjs */}
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="min-h-screen bg-black pt-20 md:pt-24">
        {/* ================================================================
            SECTION 1: HERO (mismo diseno que V1)
        ================================================================ */}
        <section
          id="pricing-hero"
          className="relative text-center py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[500px]"
        >
          {/* Background - Enterprise pattern with responsive images */}
          <div className="absolute inset-0 bg-black">
            {/* Hero background image with configurable opacity - Enterprise optimized */}
            <div className="absolute inset-0" style={{ opacity: 0.45 }}>
              <picture>
                {/* AVIF - Best compression for modern browsers */}
                <source
                  type="image/avif"
                  srcSet="/images/precios/img/precios-clases-baile-barcelona-hero_320.avif 320w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_640.avif 640w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_768.avif 768w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_1024.avif 1024w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_1440.avif 1440w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_1920.avif 1920w"
                  sizes="100vw"
                />
                {/* WebP - Universal modern browser support */}
                <source
                  type="image/webp"
                  srcSet="/images/precios/img/precios-clases-baile-barcelona-hero_320.webp 320w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_640.webp 640w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_768.webp 768w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_1024.webp 1024w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_1440.webp 1440w,
                          /images/precios/img/precios-clases-baile-barcelona-hero_1920.webp 1920w"
                  sizes="100vw"
                />
                {/* JPG fallback for older browsers */}
                <img
                  src="/images/precios/img/precios-clases-baile-barcelona-hero_1024.jpg"
                  srcSet="/images/precios/img/precios-clases-baile-barcelona-hero_320.jpg 320w,
                         /images/precios/img/precios-clases-baile-barcelona-hero_640.jpg 640w,
                         /images/precios/img/precios-clases-baile-barcelona-hero_768.jpg 768w,
                         /images/precios/img/precios-clases-baile-barcelona-hero_1024.jpg 1024w,
                         /images/precios/img/precios-clases-baile-barcelona-hero_1440.jpg 1440w,
                         /images/precios/img/precios-clases-baile-barcelona-hero_1920.jpg 1920w"
                  sizes="100vw"
                  alt={t('precios_hero_image_alt')}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 35%' }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={1920}
                  height={1280}
                />
              </picture>
            </div>
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/20 via-transparent to-black/50"></div>
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6">
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/75" />

            <AnimateOnScroll>
              <h1
                className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6 text-white"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {t('pricingV2_hero_title')}
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-neutral/90 mb-2">
                {t('pricingV2_hero_subtitle')}
              </p>
              <p className="text-lg sm:text-xl text-neutral/70 mb-6">
                {t('pricingV2_hero_subtitle2')}
              </p>

              {/* Social Proof */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-8 text-neutral/80">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-sm">(509+ {t('reviews')})</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary-accent" />
                  <span>+15.000 {t('members')}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-neutral/30"></div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary-accent" />
                  <span>8 {t('years_in_barcelona')}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 bg-black/50 border border-primary-dark/50 px-4 py-2 rounded-full text-sm text-neutral/80">
                  <CheckCircleIcon className="w-4 h-4 text-primary-accent" />
                  {t('pricing_badge_no_permanence')}
                </span>
                <span className="inline-flex items-center gap-2 bg-black/50 border border-primary-dark/50 px-4 py-2 rounded-full text-sm text-neutral/80">
                  <HeartIcon className="w-4 h-4 text-primary-accent" />
                  {t('pricing_badge_cancel_anytime')}
                </span>
                <span className="inline-flex items-center gap-2 bg-black/50 border border-primary-dark/50 px-4 py-2 rounded-full text-sm text-neutral/80">
                  <SparklesIcon className="w-4 h-4 text-primary-accent" />
                  {t('pricing_badge_first_class_free')}
                </span>
              </div>

              {/* Main CTA - abre modal en lugar de scroll */}
              <button
                onClick={openModal}
                className="inline-block bg-primary-accent text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
              >
                {t('puertasAbiertasCTA')}
              </button>
              <p className="text-sm text-neutral/60 mt-3">{t('puertasAbiertasSubtext')}</p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: PRICE CONTEXT - SEO Authority Section
        ================================================================ */}
        <section
          id="pricing-context"
          className="py-8 md:py-12 bg-gradient-to-b from-black via-primary-dark/10 to-black"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto [perspective:1000px]">
                <div className="bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-2xl p-8 md:p-12 [transform-style:preserve-3d] transition-all duration-500 hover:[transform:translateY(-0.5rem)_rotateY(1deg)_rotateX(1deg)] hover:border-primary-accent/50 hover:shadow-accent-glow">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-6 text-center holographic-text">
                    {t('pricingV2_priceContext_title')}
                  </h2>

                  <p className="text-lg text-neutral/80 mb-6 leading-relaxed">
                    {t('pricingV2_priceContext_text1')}
                  </p>

                  <p className="text-lg text-neutral/90 mb-8 leading-relaxed">
                    {t('pricingV2_priceContext_text2')}
                  </p>

                  {/* Authority Badges */}
                  <div className="flex flex-wrap justify-center gap-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 bg-primary-accent/10 border border-primary-accent/30 px-4 py-2 rounded-full">
                      <ClockIcon className="w-4 h-4 text-primary-accent" />
                      <span className="text-sm text-neutral font-medium">Desde 2017</span>
                    </div>
                    <div className="flex items-center gap-2 bg-primary-accent/10 border border-primary-accent/30 px-4 py-2 rounded-full">
                      <AcademicCapIcon className="w-4 h-4 text-primary-accent" />
                      <span className="text-sm text-neutral font-medium">CID-UNESCO</span>
                    </div>
                    <div className="flex items-center gap-2 bg-primary-accent/10 border border-primary-accent/30 px-4 py-2 rounded-full">
                      <SparklesIcon className="w-4 h-4 text-primary-accent" />
                      <span className="text-sm text-neutral font-medium">+25 estilos</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: COMO FUNCIONAN LOS PRECIOS
        ================================================================ */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                  {t('pricingV2_howItWorks_title')}
                </h2>
                <p className="text-lg text-neutral/80 mb-8">{t('pricingV2_howItWorks_text')}</p>

                {/* Reassurance Mini Cards 3D */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    { key: 'pricingV2_reassurance1', icon: SparklesIcon },
                    { key: 'pricingV2_reassurance2', icon: UserIcon },
                    { key: 'pricingV2_reassurance3', icon: KeyIcon },
                    { key: 'pricingV2_reassurance4', icon: HeartIcon },
                  ].map((item, index) => (
                    <div
                      key={item.key}
                      className="[perspective:800px] group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-center h-full [transform-style:preserve-3d] transition-all duration-500 hover:[transform:translateY(-4px)_rotateX(5deg)_rotateY(-5deg)] hover:border-primary-accent/50 hover:bg-white/10 hover:shadow-lg hover:shadow-primary-accent/20 group-hover:scale-[1.02]">
                        <item.icon className="w-8 h-8 text-primary-accent mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
                        <p className="text-sm text-neutral/90 font-medium leading-tight">
                          {t(item.key)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: LAS 3 FORMAS DE PARTICIPAR
        ================================================================ */}
        <section id="pricing-cards" className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('pricingV2_participate_title')}
                </h2>
                <p className="text-lg text-neutral/70 max-w-2xl mx-auto">
                  {t('pricingV2_participate_subtitle')}
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Card 1: Regular */}
              <AnimateOnScroll delay={100}>
                <ParticipationCard
                  title={t('pricingV2_card_regular_title')}
                  description={t('pricingV2_card_regular_desc')}
                  icon={UserIcon}
                  includes={[
                    t('pricingV2_card_regular_include1'),
                    t('pricingV2_card_regular_include2'),
                    t('pricingV2_card_regular_include3'),
                    t('pricingV2_card_regular_include4'),
                  ]}
                  priceFrom="50 €"
                  priceUnit=" /mes"
                  ctaText={t('pricingV2_hero_cta')}
                  onCTAClick={openModal}
                  isHighlighted={true}
                  t={t}
                />
              </AnimateOnScroll>

              {/* Card 2: Flexible */}
              <AnimateOnScroll delay={200}>
                <ParticipationCard
                  title={t('pricingV2_card_flexible_title')}
                  description={t('pricingV2_card_flexible_desc')}
                  icon={ClockIcon}
                  includes={[
                    t('pricingV2_card_flexible_include1'),
                    t('pricingV2_card_flexible_include2'),
                    t('pricingV2_card_flexible_include3'),
                  ]}
                  priceFrom="145 €"
                  ctaText={t('pricingV2_hero_cta')}
                  onCTAClick={openModal}
                  t={t}
                />
              </AnimateOnScroll>

              {/* Card 3: Puntual */}
              <AnimateOnScroll delay={300}>
                <ParticipationCard
                  title={t('pricingV2_card_puntual_title')}
                  description={t('pricingV2_card_puntual_desc')}
                  icon={CalendarDaysIcon}
                  includes={[
                    t('pricingV2_card_puntual_include1'),
                    t('pricingV2_card_puntual_include2'),
                  ]}
                  priceFrom="20 €"
                  ctaText={t('pricingV2_hero_cta')}
                  onCTAClick={openModal}
                  t={t}
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4: CUOTA DE INSCRIPCION
        ================================================================ */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto [perspective:1000px]">
                <div className="bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-2xl p-8 md:p-10 [transform-style:preserve-3d] transition-all duration-500 hover:[transform:translateY(-0.5rem)_rotateY(1deg)_rotateX(1deg)] hover:shadow-accent-glow">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-accent/20 rounded-xl flex items-center justify-center">
                          <KeyIcon className="w-5 h-5 text-primary-accent" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-neutral">
                          {t('pricingV2_enrollment_title')}
                        </h2>
                      </div>
                      <p className="text-neutral/80 mb-6">{t('pricingV2_enrollment_desc')}</p>
                      <ul className="space-y-3">
                        {ENROLLMENT_FEE.includes.map((includeKey, index) => (
                          <li key={index} className="flex items-center gap-3 text-neutral/90">
                            <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0" />
                            {t(includeKey)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-5xl md:text-6xl font-black holographic-text">
                        {formatPrice(ENROLLMENT_FEE.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 5: POR QUE NO MOSTRAMOS TODOS LOS PRECIOS
        ================================================================ */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-3xl mx-auto [perspective:1000px]">
                <div className="bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-2xl p-8 md:p-10 text-center [transform-style:preserve-3d] transition-all duration-500 hover:[transform:translateY(-0.5rem)_rotateY(2deg)_rotateX(2deg)] hover:border-primary-accent/50 hover:shadow-accent-glow">
                  <div className="w-16 h-16 bg-primary-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AcademicCapIcon className="w-8 h-8 text-primary-accent" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                    {t('pricingV2_whyNotAll_title')}
                  </h2>

                  <p className="text-lg text-neutral/80 mb-6">{t('pricingV2_whyNotAll_text1')}</p>

                  <div className="bg-white/5 rounded-xl p-6 mb-8 text-left border border-white/10">
                    <p className="text-neutral/70 mb-4">{t('pricingV2_whyNotAll_depends')}</p>
                    <ul className="grid grid-cols-2 gap-3">
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('pricingV2_whyNotAll_dep1')}
                      </li>
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('pricingV2_whyNotAll_dep2')}
                      </li>
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('pricingV2_whyNotAll_dep3')}
                      </li>
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('pricingV2_whyNotAll_dep4')}
                      </li>
                    </ul>
                  </div>

                  <p className="text-neutral/70 mb-8">{t('pricingV2_whyNotAll_text2')}</p>

                  <button
                    onClick={openModal}
                    className="inline-flex items-center gap-2 bg-primary-accent text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
                  >
                    {t('pricingV2_hero_cta')}
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-neutral/70 mt-3">{t('pricingV2_hero_cta_subtext')}</p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: BENEFICIOS / POR QUE NUESTROS SOCIOS SE QUEDAN
        ================================================================ */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-primary-dark/10 to-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('pricingV2_benefits_title')}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: AcademicCapIcon, key: 'benefit1' },
                { icon: UserIcon, key: 'benefit2' },
                { icon: SparklesIcon, key: 'benefit3' },
                { icon: HeartIcon, key: 'benefit4' },
                { icon: CheckCircleIcon, key: 'benefit5' },
                { icon: StarIcon, key: 'benefit6' },
              ].map((benefit, index) => (
                <AnimateOnScroll key={benefit.key} delay={index * 100}>
                  <div className="[perspective:1000px] h-full">
                    <div className="h-full flex flex-col bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl p-6 hover:border-primary-accent/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(2deg)_rotateX(2deg)] hover:shadow-accent-glow">
                      <benefit.icon className="w-10 h-10 text-primary-accent mb-4 flex-shrink-0" />
                      <h3 className="text-lg font-bold text-neutral mb-2">
                        {t(`pricing_${benefit.key}_title`)}
                      </h3>
                      <p className="text-neutral/80 text-sm flex-grow">
                        {t(`pricing_${benefit.key}_desc`)}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 7: EXCLUSIVE MEMBER BENEFITS (Premium)
        ================================================================ */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/10">
          <div className="container mx-auto px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('pricing_exclusive_title')}
                </h2>
                <p className="text-lg text-neutral/90 max-w-2xl mx-auto">
                  {t('pricing_exclusive_subtitle')}
                </p>
              </div>
            </AnimateOnScroll>

            <div className="max-w-5xl mx-auto">
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Community Group */}
                <AnimateOnScroll delay={100}>
                  <div className="[perspective:1000px] h-full">
                    <div className="h-full bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl p-6 hover:border-primary-accent/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:shadow-accent-glow">
                      <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary-accent" />
                        {t('pricing_exclusive_community')}
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_community_1')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_community_2')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_community_3')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AnimateOnScroll>

                {/* Condiciones Especiales Group */}
                <AnimateOnScroll delay={150}>
                  <div className="[perspective:1000px] h-full">
                    <div className="h-full bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl p-6 hover:border-primary-accent/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:shadow-accent-glow">
                      <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                        <StarIcon className="w-5 h-5 text-primary-accent" />
                        {t('pricing_exclusive_conditions')}
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_conditions_1')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_conditions_2')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_conditions_3')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AnimateOnScroll>

                {/* Discounts Group */}
                <AnimateOnScroll delay={200}>
                  <div className="[perspective:1000px] h-full">
                    <div className="h-full bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl p-6 hover:border-primary-accent/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:shadow-accent-glow">
                      <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                        <HeartIcon className="w-5 h-5 text-primary-accent" />
                        {t('pricing_exclusive_discounts')}
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_discounts_1')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_discounts_2')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_discounts_3')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AnimateOnScroll>

                {/* Opportunities Group */}
                <AnimateOnScroll delay={250}>
                  <div className="[perspective:1000px] h-full">
                    <div className="h-full bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl p-6 hover:border-primary-accent/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:shadow-accent-glow">
                      <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                        <AcademicCapIcon className="w-5 h-5 text-primary-accent" />
                        {t('pricing_exclusive_opportunities')}
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_opportunities_1')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_opportunities_2')}</span>
                        </li>
                        <li className="flex items-start gap-3 text-neutral/90">
                          <CheckIcon className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                          <span>{t('pricing_exclusive_opportunities_3')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>

              {/* Referral Program Highlight */}
              <AnimateOnScroll delay={500}>
                <div className="mt-8 [perspective:1000px]">
                  <div className="relative bg-gradient-to-r from-primary-accent/20 via-primary-dark/30 to-primary-accent/20 border-2 border-primary-accent rounded-2xl p-8 text-center [transform-style:preserve-3d] transition-all duration-500 hover:[transform:translateY(-0.5rem)_rotateY(2deg)_rotateX(2deg)] hover:shadow-accent-glow">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-accent text-white text-sm font-bold px-6 py-1 rounded-full">
                      {t('pricing_exclusive_referral_badge')}
                    </div>
                    <h3 className="text-2xl font-bold text-neutral mb-2">
                      {t('pricing_exclusive_referral_title')}
                    </h3>
                    <p className="text-3xl md:text-4xl font-black holographic-text mb-1">
                      {t('pricing_exclusive_referral_credits')}
                    </p>
                    <p className="text-lg text-neutral/80 mb-3">
                      {t('pricing_exclusive_referral_value')}
                    </p>
                    <p className="text-neutral/90">{t('pricing_exclusive_referral_desc')}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION: RESEÑAS REALES
        ================================================================ */}
        <ReviewsSection
          category="general"
          limit={6}
          showGoogleBadge={true}
          layout="grid"
          showCategory={false}
          selectedAuthors={[
            'Karina Indytska',
            'Yosefin Cabeza Carrillo',
            'Micaela Llull (MicaPower)',
            'Michelle Lu',
            'garcia lam',
            'Montse Solís Solís',
          ]}
        />

        {/* ================================================================
            SECTION 8: FAQ
        ================================================================ */}
        <section className="faq-section py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('pricing_faq_title')}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="max-w-3xl mx-auto space-y-4">
              {pricingFAQs.map((faq, index) => (
                <AnimateOnScroll key={faq.id} delay={index * 50}>
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === faq.id}
                    onToggle={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                  />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 10: FINAL CTA (Premium - con emotional copy)
        ================================================================ */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/10 to-black">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/20 via-black/50 to-black"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-20">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                  {t('pricing_cta_title')}
                </h2>

                {/* Emotional Copy */}
                <div className="mb-8 space-y-2 text-lg sm:text-xl text-neutral/80">
                  <p>{t('pricing_cta_emotional1')}</p>
                  <p>{t('pricing_cta_emotional2')}</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold mb-8 holographic-text">
                  {t('pricing_cta_emotional_close')}
                </p>

                {/* Visual Separator */}
                <div className="w-24 h-px bg-primary-accent/50 mx-auto mb-8"></div>

                {/* Technical Copy */}
                <p className="text-lg sm:text-xl text-neutral/90 mb-3">
                  {t('pricing_cta_technical1')}
                </p>
                <p className="text-base sm:text-lg text-neutral/80 mb-6 sm:mb-8 italic">
                  {t('pricing_cta_technical2')}
                </p>

                {/* Final CTA */}
                <div className="flex flex-col items-center justify-center">
                  <button
                    onClick={openModal}
                    className="bg-primary-accent text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
                  >
                    {t('puertasAbiertasCTA')}
                  </button>
                  <p className="text-sm text-neutral/60 mt-3 text-center max-w-md mx-auto">
                    {t('puertasAbiertasSubtext')}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            FOOTER LEGAL
        ================================================================ */}
        <section className="py-8 bg-black border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6">
            <p className="text-xs text-center text-neutral/60 max-w-3xl mx-auto leading-relaxed">
              {t('pricingV2_footer_legal')}
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default PreciosPage;
