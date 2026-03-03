import { useState, memo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../constants/image-alt-texts';
import Breadcrumb from './shared/Breadcrumb';
import AnimateOnScroll from './AnimateOnScroll';
import LeadCaptureModal from './shared/LeadCaptureModal';

const ReviewsSection = lazy(() => import('./reviews/ReviewsSection'));

// ==========================================================================
// HERO IMAGE CONFIGURATION - Enterprise SEO/GEO/AIEO Optimized
// ==========================================================================
const HERO_IMAGE = {
  basePath: '/images/horarios/horarios-clases-baile-barcelona',
  ogImage: '/images/og-horarios-clases-baile.jpg', // Enterprise standard: OG in root images folder
  breakpoints: [320, 640, 768, 1024, 1440, 1920],
  formats: ['avif', 'webp', 'jpg'], // Enterprise format priority
  placeholder:
    'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAQBACdASoUAA4APtFYpEwoJKMhsAgBABoJYwC7ABIvv2gH8AGM/NRQvAD++A7/+fz/U9cIKf7mAAA/',
  dominantColor: '#1c0e09',
  altKey: 'pages.horarios.hero', // Reference to image-alt-texts.ts
  alt: {
    es: "Alumnas en clase de baile grupal consultando horarios de clases de salsa, bachata y danzas urbanas en Barcelona - Farray's International Dance Center con más de 100 clases semanales",
    en: "Students in group dance class checking salsa, bachata and urban dance class schedules in Barcelona - Farray's International Dance Center with over 100 weekly classes",
    ca: "Alumnes a classe de ball grupal consultant horaris de classes de salsa, bachata i danses urbanes a Barcelona - Farray's International Dance Center amb més de 100 classes setmanals",
    fr: "Élèves en cours de danse en groupe consultant les horaires de cours de salsa, bachata et danses urbaines à Barcelone - Farray's International Dance Center avec plus de 100 cours par semaine",
  } as Record<Locale, string>,
};
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
  SunIcon,
  MoonIcon,
  MusicalNoteIcon,
  FireIcon,
} from '../lib/icons';
import {
  SCHEDULE_BLOCK_CONFIGS,
  SCHEDULE_FAQ,
  getClassesByBlockConfig,
} from '../constants/horarios-page-data';

/**
 * HorariosPageV2 - Pagina de Horarios Premium
 * URL SEO: /horarios-clases-baile-barcelona
 *
 * Estrategia (igual que PreciosPage):
 * - Mostrar solo una muestra de horarios
 * - Captar email via modal para horarios completos
 * - Mismo diseno que PreciosPage para consistencia
 */

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Schedule Preview Card - Tarjeta de bloque horario
 */
const SchedulePreviewCard = memo(
  ({
    title,
    subtitle,
    icon: Icon,
    classCount,
    examples,
    onCTAClick,
    t,
  }: {
    title: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
    classCount: number;
    examples: string[];
    onCTAClick: () => void;
    t: (key: string) => string;
  }) => {
    return (
      <div className="[perspective:1000px] h-full">
        <div className="relative h-full flex flex-col bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-primary-dark/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:border-primary-accent/50 hover:shadow-accent-glow">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-12 h-12 bg-primary-accent/20 rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-6 h-6 text-primary-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral">{title}</h3>
              <p className="text-sm text-neutral/60">{subtitle}</p>
            </div>
          </div>

          {/* Class count */}
          <div className="mb-4 pb-4 border-b border-white/10">
            <p className="text-3xl font-black text-neutral">
              {classCount}+
              <span className="text-base font-normal text-neutral/60 ml-2">
                {t('horariosV2_classes_available')}
              </span>
            </p>
          </div>

          {/* Examples */}
          <ul className="space-y-2 mb-6 flex-grow">
            {examples.map((example, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-neutral/80">
                <CheckIcon className="w-4 h-4 text-primary-accent flex-shrink-0 mt-0.5" />
                <span>{example}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={onCTAClick}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-full bg-white/10 text-neutral hover:bg-primary-accent hover:text-white transition-all duration-300"
          >
            {t('puertasAbiertasCTA')}
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

SchedulePreviewCard.displayName = 'SchedulePreviewCard';

/**
 * FAQ Item Component (mismo que PreciosPage)
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

const HorariosPageV2: React.FC = () => {
  // @ts-ignore - Known issue with react-i18next type inference with many namespaces
  const { t: tRaw, i18n } = useTranslation([
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
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const locale = i18n.language;
  const baseUrl = 'https://www.farrayscenter.com';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FAQ state
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  // Breadcrumb
  const breadcrumbItems = [
    { name: t('breadcrumb_home'), url: `/${locale}` },
    {
      name: t('horariosV2_breadcrumb'),
      url: `/${locale}/horarios-clases-baile-barcelona`,
      isActive: true,
    },
  ];

  // Get class counts per block (minimum 12 for display purposes)
  const blockData = SCHEDULE_BLOCK_CONFIGS.map(config => ({
    ...config,
    classCount: Math.max(12, getClassesByBlockConfig(config).length),
  }));

  // Block icons mapping
  const blockIcons: Record<string, React.FC<{ className?: string }>> = {
    'morning-block': SunIcon,
    'evening-danza-block': ClockIcon,
    'salsa-bachata-block': MusicalNoteIcon,
    'urbano-block': FireIcon,
  };

  // Schema Markup
  // Helper for inLanguage formatting per Google best practices
  const getInLanguage = () => {
    switch (locale) {
      case 'ca':
        return 'ca-ES';
      case 'en':
        return 'en-GB';
      case 'fr':
        return 'fr-FR';
      default:
        return 'es-ES';
    }
  };

  // FAQPage Schema removed — generated at build-time by prerender.mjs

  // Organization Schema removed — generated at build-time by prerender.mjs with @id /#organization
  // (was EducationalOrganization here, conflicting with build-time Organization same @id)

  // WebPage Schema - Enterprise GEO/AIEO optimized with full translations
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/${locale}/horarios-clases-baile-barcelona#webpage`,
    url: `${baseUrl}/${locale}/horarios-clases-baile-barcelona`,
    name: t('horariosV2_page_title'),
    headline: t('horariosV2_hero_title'), // H1 content for GEO
    description: t('horariosV2_page_description'),
    inLanguage: getInLanguage(),
    isPartOf: {
      '@id': `${baseUrl}/#website`,
    },
    about: {
      '@id': `${baseUrl}/#organization`,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: t('horariosV2_blocks_title'), // "Nuestros Bloques Horarios"
      description: t('horariosV2_blocks_subtitle'),
      numberOfItems: blockData.length,
      itemListElement: blockData.map((block, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: t(block.titleKey),
        description: t(block.subtitleKey),
      })),
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      '@id': `${baseUrl}/${locale}/horarios-clases-baile-barcelona#primaryimage`,
      url: `${baseUrl}${HERO_IMAGE.ogImage}`,
      contentUrl: `${baseUrl}${HERO_IMAGE.ogImage}`,
      width: 1200,
      height: 630,
      caption: HERO_IMAGE.alt[locale as Locale] || HERO_IMAGE.alt.es,
      inLanguage: getInLanguage(),
      representativeOfPage: true,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.holographic-text', '[data-speakable="true"]'],
    },
    keywords: t('horariosV2_schema_keywords'), // "horarios clases baile barcelona, schedule dance classes..."
    dateModified: new Date().toISOString().split('T')[0],
    datePublished: '2024-01-01',
  };

  // Handler para abrir modal
  const openModal = () => setIsModalOpen(true);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{t('horariosV2_page_title')} | Farray&apos;s Center</title>
        <meta name="description" content={t('horariosV2_page_description')} />
        <link rel="canonical" href={`${baseUrl}/${locale}/horarios-clases-baile-barcelona`} />
        {/* hreflang tags for multilingual SEO - Google recognition */}
        <link
          rel="alternate"
          hrefLang="es"
          href={`${baseUrl}/es/horarios-clases-baile-barcelona`}
        />
        <link
          rel="alternate"
          hrefLang="ca"
          href={`${baseUrl}/ca/horarios-clases-baile-barcelona`}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href={`${baseUrl}/en/horarios-clases-baile-barcelona`}
        />
        <link
          rel="alternate"
          hrefLang="fr"
          href={`${baseUrl}/fr/horarios-clases-baile-barcelona`}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${baseUrl}/es/horarios-clases-baile-barcelona`}
        />
        <meta property="og:title" content={t('horariosV2_page_title')} />
        <meta property="og:description" content={t('horariosV2_page_description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/${locale}/horarios-clases-baile-barcelona`} />
        <meta property="og:locale" content={getInLanguage().replace('-', '_')} />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="ca_ES" />
        <meta property="og:locale:alternate" content="en_GB" />
        <meta property="og:locale:alternate" content="fr_FR" />
        {/* OG Image - JPG for social crawlers compatibility */}
        <meta property="og:image" content={`${baseUrl}${HERO_IMAGE.ogImage}`} />
        <meta property="og:image:secure_url" content={`${baseUrl}${HERO_IMAGE.ogImage}`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content={HERO_IMAGE.alt[locale as Locale] || HERO_IMAGE.alt.es}
        />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${baseUrl}${HERO_IMAGE.ogImage}`} />
        <meta
          name="twitter:image:alt"
          content={HERO_IMAGE.alt[locale as Locale] || HERO_IMAGE.alt.es}
        />
        {/* BreadcrumbList + FAQPage + Organization generated at build-time by prerender.mjs */}
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      </Helmet>

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="min-h-screen bg-black pt-20 md:pt-24">
        {/* ================================================================
            SECTION 1: HERO - Enterprise Image Optimized
        ================================================================ */}
        <section className="relative text-center py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[500px] md:min-h-[600px]">
          {/* Hero Background Image - Responsive with LQIP */}
          <div className="absolute inset-0" style={{ backgroundColor: HERO_IMAGE.dominantColor }}>
            <picture>
              {/* AVIF - Best compression for modern browsers */}
              <source
                type="image/avif"
                srcSet={HERO_IMAGE.breakpoints
                  .map(w => `${HERO_IMAGE.basePath}_${w}.avif ${w}w`)
                  .join(', ')}
                sizes="100vw"
              />
              {/* WebP - Wide browser support */}
              <source
                type="image/webp"
                srcSet={HERO_IMAGE.breakpoints
                  .map(w => `${HERO_IMAGE.basePath}_${w}.webp ${w}w`)
                  .join(', ')}
                sizes="100vw"
              />
              {/* JPEG - Universal fallback */}
              <img
                src={`${HERO_IMAGE.basePath}_1920.jpg`}
                srcSet={HERO_IMAGE.breakpoints
                  .map(w => `${HERO_IMAGE.basePath}_${w}.jpg ${w}w`)
                  .join(', ')}
                sizes="100vw"
                alt={HERO_IMAGE.alt[locale as Locale] || HERO_IMAGE.alt.es}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  backgroundImage: `url(${HERO_IMAGE.placeholder})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </picture>
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6">
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/75" />

            <AnimateOnScroll>
              <h1
                className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6 text-white"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {t('horariosV2_hero_title')}
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-neutral/90 mb-2">
                {t('horariosV2_hero_subtitle')}
              </p>
              <p className="text-lg sm:text-xl text-neutral/70 mb-6">
                {t('horariosV2_hero_subtitle2')}
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
                  <span>+100 {t('horariosV2_weekly_classes')}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 bg-black/50 border border-primary-dark/50 px-4 py-2 rounded-full text-sm text-neutral/80">
                  <CheckCircleIcon className="w-4 h-4 text-primary-accent" />
                  {t('horariosV2_trust_noExperience')}
                </span>
                <span className="inline-flex items-center gap-2 bg-black/50 border border-primary-dark/50 px-4 py-2 rounded-full text-sm text-neutral/80">
                  <HeartIcon className="w-4 h-4 text-primary-accent" />
                  {t('horariosV2_trust_byLevel')}
                </span>
                <span className="inline-flex items-center gap-2 bg-black/50 border border-primary-dark/50 px-4 py-2 rounded-full text-sm text-neutral/80">
                  <SparklesIcon className="w-4 h-4 text-primary-accent" />
                  {t('horariosV2_trust_freeClass')}
                </span>
              </div>

              {/* Main CTA */}
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
            SECTION 2: AVISO IMPORTANTE - Solo mostramos una muestra
        ================================================================ */}
        <section className="py-8 md:py-12 bg-gradient-to-b from-black via-primary-dark/10 to-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto [perspective:1000px]">
                <div className="bg-black/50 backdrop-blur-md border border-primary-accent/30 rounded-2xl p-8 md:p-12 [transform-style:preserve-3d] transition-all duration-500 hover:[transform:translateY(-0.5rem)_rotateY(1deg)_rotateX(1deg)] hover:shadow-accent-glow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-accent/20 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-primary-accent" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral holographic-text">
                      {t('horariosV2_preview_title')}
                    </h2>
                  </div>

                  <p className="text-lg text-neutral/80 mb-6 leading-relaxed">
                    {t('horariosV2_preview_text1')}
                  </p>

                  <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                    <p className="text-neutral/70 mb-4">{t('horariosV2_preview_includes')}</p>
                    <ul className="grid grid-cols-2 gap-3">
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('horariosV2_preview_point1')}
                      </li>
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('horariosV2_preview_point2')}
                      </li>
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('horariosV2_preview_point3')}
                      </li>
                      <li className="flex items-center gap-2 text-neutral/80">
                        <CheckCircleIcon className="w-4 h-4 text-primary-accent flex-shrink-0" />
                        {t('horariosV2_preview_point4')}
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={openModal}
                      className="inline-flex items-center gap-2 bg-primary-accent text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
                    >
                      {t('puertasAbiertasCTA')}
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-neutral/60 mt-3">{t('puertasAbiertasSubtext')}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: COMO FUNCIONAN LOS HORARIOS
        ================================================================ */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                  {t('horariosV2_howItWorks_title')}
                </h2>
                <p className="text-lg text-neutral/80 mb-8">{t('horariosV2_howItWorks_text')}</p>

                {/* Reassurance Mini Cards 3D */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    { key: 'horariosV2_reassurance1', icon: SunIcon },
                    { key: 'horariosV2_reassurance2', icon: MoonIcon },
                    { key: 'horariosV2_reassurance3', icon: AcademicCapIcon },
                    { key: 'horariosV2_reassurance4', icon: HeartIcon },
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
            SECTION 4: BLOQUES DE HORARIOS (Preview Cards)
        ================================================================ */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('horariosV2_blocks_title')}
                </h2>
                <p className="text-lg text-neutral/70 max-w-2xl mx-auto">
                  {t('horariosV2_blocks_subtitle')}
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {blockData.map((block, index) => (
                <AnimateOnScroll key={block.id} delay={index * 100}>
                  <SchedulePreviewCard
                    title={t(block.titleKey)}
                    subtitle={t(block.subtitleKey)}
                    icon={blockIcons[block.id] || ClockIcon}
                    classCount={block.classCount}
                    examples={[
                      t(`horariosV2_block_${block.id.replace('-block', '')}_ex1`),
                      t(`horariosV2_block_${block.id.replace('-block', '')}_ex2`),
                      t(`horariosV2_block_${block.id.replace('-block', '')}_ex3`),
                    ]}
                    onCTAClick={openModal}
                    t={t}
                  />
                </AnimateOnScroll>
              ))}
            </div>

            {/* CTA after blocks */}
            <AnimateOnScroll delay={500}>
              <div className="text-center mt-12">
                <button
                  onClick={openModal}
                  className="inline-flex items-center gap-2 bg-primary-accent text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
                >
                  {t('puertasAbiertasCTA')}
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <p className="text-sm text-neutral/60 mt-3">{t('puertasAbiertasSubtext')}</p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 5: NIVELES DE BAILE
        ================================================================ */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-black to-primary-dark/10">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('horariosV2_levels_title')}
                </h2>
                <p className="text-lg text-neutral/70 max-w-2xl mx-auto">
                  {t('horariosV2_levels_subtitle')}
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {[
                { key: 'beginner', icon: SparklesIcon },
                { key: 'basic', icon: AcademicCapIcon },
                { key: 'intermediate', icon: StarIcon },
                { key: 'advanced', icon: FireIcon },
                { key: 'open', icon: HeartIcon },
              ].map((level, index) => (
                <AnimateOnScroll key={level.key} delay={index * 75}>
                  <div className="[perspective:1000px] h-full">
                    <div className="h-full bg-black/50 backdrop-blur-md border border-primary-dark/50 rounded-xl p-5 text-center hover:border-primary-accent/50 transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-0.5rem)_rotateY(3deg)_rotateX(2deg)] hover:shadow-accent-glow">
                      <level.icon className="w-8 h-8 text-primary-accent mx-auto mb-3" />
                      <h3 className="font-bold text-neutral mb-2">
                        {t(`horariosV2_level_${level.key}`)}
                      </h3>
                      <p className="text-xs text-neutral/70">
                        {t(`horariosV2_level_${level.key}_desc`)}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: POR QUE NO MOSTRAMOS TODOS LOS HORARIOS
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
                    {t('horariosV2_whyNotAll_title')}
                  </h2>

                  <p className="text-lg text-neutral/80 mb-6">{t('horariosV2_whyNotAll_text1')}</p>
                  <p className="text-neutral/70 mb-8">{t('horariosV2_whyNotAll_text2')}</p>

                  <button
                    onClick={openModal}
                    className="inline-flex items-center gap-2 bg-primary-accent text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow"
                  >
                    {t('puertasAbiertasCTA')}
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-neutral/60 mt-3">{t('puertasAbiertasSubtext')}</p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
            SECTION 7: RESEÑAS REALES
        ================================================================ */}
        <Suspense fallback={<div className="py-16 bg-black" />}>
          <ReviewsSection
            category="general"
            limit={6}
            showGoogleBadge={true}
            layout="grid"
            showCategory={false}
            selectedAuthors={[
              'Yosefin Cabeza Carrillo',
              'Michelle Lu',
              'Montse Solís Solís',
              'Micaela Llull (MicaPower)',
              'Irene Dabovic',
              'Karina Indytska',
            ]}
          />
        </Suspense>

        {/* ================================================================
            SECTION 8: FAQ
        ================================================================ */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-neutral mb-4 holographic-text">
                  {t('horariosV2_faq_title')}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="max-w-3xl mx-auto space-y-4">
              {SCHEDULE_FAQ.map((faq, index) => (
                <AnimateOnScroll key={faq.id} delay={index * 50}>
                  <FAQItem
                    question={t(faq.questionKey)}
                    answer={t(faq.answerKey)}
                    isOpen={openFAQ === faq.id}
                    onToggle={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                  />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 9: FINAL CTA
        ================================================================ */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-primary-dark/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/20 via-black/50 to-black"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-20">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral mb-6 holographic-text">
                  {t('horariosV2_cta_title')}
                </h2>

                {/* Emotional Copy */}
                <div className="mb-8 space-y-2 text-lg sm:text-xl text-neutral/80">
                  <p>{t('horariosV2_cta_emotional1')}</p>
                  <p>{t('horariosV2_cta_emotional2')}</p>
                </div>

                {/* Visual Separator */}
                <div className="w-24 h-px bg-primary-accent/50 mx-auto mb-8"></div>

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
              {t('horariosV2_footer_legal')}
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HorariosPageV2;
