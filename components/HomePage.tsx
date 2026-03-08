import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { HOMEPAGE_V2_CONFIG } from '../constants/homepage-v2-config';
import Hero from './Hero';
import TrustBarHero from './TrustBarHero';
import AsSeenInBar from './AsSeenInBar';
import HappinessStory from './HappinessStory';
import About from './About';
// import Classes from './Classes'; // Componente no encontrado - usando ClassesPreview en su lugar
import ClassesPreview from './homev2/ClassesPreview';
import WhyFIDC from './WhyFIDC';
import FinalCTA from './FinalCTA';
import ManifestoBanner from './shared/ManifestoBanner';
import {
  SpeakableSchema,
  BrandSchema,
  CredentialSchema,
  WebPageSchema,
  BreadcrumbListSchema,
} from './SchemaMarkup';

// Lazy load components below the fold for better initial page load performance
const NovedadesCarousel = lazy(() => import('./novedades/NovedadesCarousel'));
const Services = lazy(() => import('./Services'));
const Teachers = lazy(() => import('./Teachers'));
const ReviewsSection = lazy(() => import('./reviews/ReviewsSection'));
const FAQSection = lazy(() => import('./FAQSection'));
const HowToGetHere = lazy(() => import('./HowToGetHere'));
const ComparisonSection = lazy(() => import('./homev2/ComparisonSection'));

// Skeleton loaders for better UX during lazy loading
const CarouselSkeleton = () => (
  <div className="py-12 bg-black" aria-busy="true" aria-label="Cargando novedades...">
    <div className="container mx-auto px-6">
      <div className="h-8 w-48 bg-primary-dark/30 rounded-lg mx-auto mb-8 animate-pulse" />
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-shrink-0 w-80 h-48 bg-primary-dark/20 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    </div>
  </div>
);

const SectionsSkeleton = () => (
  <div className="space-y-16 py-12 bg-black" aria-busy="true" aria-label="Cargando contenido...">
    {/* Services Skeleton */}
    <div className="container mx-auto px-6">
      <div className="h-10 w-64 bg-primary-dark/30 rounded-lg mx-auto mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-8 bg-primary-dark/20 rounded-2xl animate-pulse">
            <div className="w-16 h-16 bg-primary-dark/30 rounded-xl mb-6" />
            <div className="h-6 w-3/4 bg-primary-dark/30 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-primary-dark/20 rounded" />
              <div className="h-4 w-5/6 bg-primary-dark/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Teachers Skeleton */}
    <div className="container mx-auto px-6">
      <div className="h-10 w-48 bg-primary-dark/30 rounded-lg mx-auto mb-8 animate-pulse" />
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {[1, 2].map(i => (
          <div
            key={i}
            className="flex items-center gap-8 p-8 bg-primary-dark/20 rounded-2xl animate-pulse"
          >
            <div className="w-32 h-32 bg-primary-dark/30 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-1/3 bg-primary-dark/30 rounded" />
              <div className="h-4 w-1/4 bg-primary-dark/20 rounded" />
              <div className="h-4 w-full bg-primary-dark/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Reviews Skeleton */}
    <div className="container mx-auto px-6">
      <div className="h-10 w-56 bg-primary-dark/30 rounded-lg mx-auto mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 bg-primary-dark/20 rounded-2xl animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-dark/30 rounded-full" />
              <div className="h-4 w-24 bg-primary-dark/30 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-primary-dark/20 rounded" />
              <div className="h-3 w-4/5 bg-primary-dark/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation([
    'common',
    'booking',
    'schedule',
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

  const homeFaqs = [
    // GEO Answer Capsules - Preguntas clave para citabilidad AI
    { id: 'about-1', question: t('aboutQ1'), answer: t('aboutA1') },
    { id: 'about-2', question: t('aboutQ2'), answer: t('aboutA2') },
    { id: 'about-3', question: t('aboutQ3'), answer: t('aboutA3') },
    // Preguntas prácticas
    { id: 'home-1', question: t('homeFaqQ1'), answer: t('homeFaqA1') },
    { id: 'home-2', question: t('homeFaqQ2'), answer: t('homeFaqA2') },
    { id: 'home-3', question: t('homeFaqQ3'), answer: t('homeFaqA3') },
    { id: 'home-4', question: t('homeFaqQ4'), answer: t('homeFaqA4') },
    { id: 'home-5', question: t('homeFaqQ5'), answer: t('homeFaqA5') },
    { id: 'home-6', question: t('homeFaqQ6'), answer: t('homeFaqA6') },
    { id: 'home-7', question: t('homeFaqQ7'), answer: t('homeFaqA7') },
    { id: 'home-8', question: t('homeFaqQ8'), answer: t('homeFaqA8') },
  ];

  return (
    <>
      <Helmet>
        <title>{t('pageTitle')}</title>
        <meta name="description" content={t('metaDescription')} />
        <link rel="canonical" href={`${baseUrl}/${locale}`} />
        <meta property="og:title" content={t('pageTitle')} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="og:url" content={`${baseUrl}/${locale}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/images/og-home.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('pageTitle')} />
        <meta name="twitter:description" content={t('metaDescription')} />
        <meta name="twitter:image" content={`${baseUrl}/images/og-home.jpg`} />
        {/* GEO: PersonSchema for Yunaisy Farray - Enterprise Level E-E-A-T */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            '@id': `${baseUrl}/${locale}/yunaisy-farray#person`,
            name: 'Yunaisy Farray',
            givenName: 'Yunaisy',
            familyName: 'Farray',
            jobTitle: t('schema_founderJobTitle') || 'Directora y Fundadora',
            description: (t('aboutBio') || '').split('\n\n')[0] || '',
            image: `${baseUrl}/images/yunaisy/img/yunaisy-artistica-4_1024.webp`,
            url: `${baseUrl}/${locale}/yunaisy-farray`,
            sameAs: [
              'https://www.instagram.com/yunaisyfarray/',
              'https://www.facebook.com/yunaisyfarray',
              'https://www.youtube.com/@farraysinternationaldance',
              'https://www.tiktok.com/@yunaisyfarray',
              'https://www.imdb.com/name/nm4533322/',
            ],
            worksFor: {
              '@type': 'EducationalOrganization',
              '@id': `${baseUrl}/#organization`,
              name: "Farray's International Dance Center",
            },
            alumniOf: {
              '@type': 'EducationalOrganization',
              name: 'Escuela Nacional de Arte de Cuba (ENA)',
              address: { '@type': 'PostalAddress', addressCountry: 'CU' },
            },
            knowsAbout: [
              'Cuban Dance',
              'Salsa Cubana',
              'Afro-Cuban Dance',
              'Latin Dance',
              'Dance Education',
              'Choreography',
              'Método Farray®',
            ],
            nationality: { '@type': 'Country', name: 'Cuba' },
            award: ['Got Talent España Finalist', 'CID-UNESCO Member'],
            hasCredential: {
              '@type': 'EducationalOccupationalCredential',
              name: 'CID-UNESCO Dance Educator',
              credentialCategory: 'Professional Certification',
              recognizedBy: {
                '@type': 'Organization',
                name: 'CID-UNESCO (International Dance Council)',
                url: 'https://www.cid-portal.org/',
              },
            },
          })}
        </script>
      </Helmet>

      {/* GEO Schemas for About Section - Enterprise Level */}
      {/* GEO Speakable Schema - Expanded for voice search optimization */}
      <SpeakableSchema
        name={t('aboutTitle') || 'Yunaisy Farray'}
        description={(t('aboutBio') || '').split('\n\n')[0] || ''}
        speakableSelectors={[
          // Hero section
          '#hero h1',
          // About section
          '#about-title',
          '#about-subtitle',
          '#about-bio-para-1',
          '#about-bio-para-2',
          '#metodo-farray-title',
          // Answer Capsules (GEO)
          '[data-answer-capsule="true"] h4',
          '[data-answer-capsule="true"] p',
          // Services section
          '#services-title',
          '#services-intro',
          // Teachers section
          '#teachers-title',
          '#teachers-intro',
          // Why FIDC section
          '#why-fidc-title',
          // Reviews section
          '#reviews-title',
          // FAQ section
          '#faq-section-title',
        ]}
        url={`${baseUrl}/${locale}#about`}
      />
      <BrandSchema
        name="Método Farray®"
        description={t('schema_metodoFarray_description') || 'Exclusive dance teaching methodology'}
        url={`${baseUrl}/${locale}/metodo-farray`}
        slogan={t('aboutSubtitle')}
      />
      <CredentialSchema
        courseUrl={`${baseUrl}/${locale}`}
        credentialName="CID-UNESCO Accredited Dance Education"
        credentialCategory="Professional Certification"
        recognizedBy={{
          name: 'CID-UNESCO (International Dance Council)',
          url: 'https://www.cid-portal.org/',
        }}
      />

      {/* WebPageSchema - Enterprise Level SEO for homepage */}
      <WebPageSchema
        url={`${baseUrl}/${locale}`}
        name={t('pageTitle')}
        description={t('metaDescription')}
        inLanguage={{ es: 'es-ES', ca: 'ca-ES', en: 'en-GB', fr: 'fr-FR' }[locale] || 'es-ES'}
        mainEntityId={`${baseUrl}/#organization`}
        primaryImageUrl={`${baseUrl}/images/og-home.jpg`}
        breadcrumb={[{ name: t('breadcrumbHome'), url: `${baseUrl}/${locale}` }]}
      />

      {/* BreadcrumbListSchema - Standalone for better indexing */}
      <BreadcrumbListSchema items={[{ name: t('breadcrumbHome'), url: `${baseUrl}/${locale}` }]} />

      <Hero />
      <TrustBarHero />
      <AsSeenInBar />
      <Suspense fallback={<CarouselSkeleton />}>
        <NovedadesCarousel />
      </Suspense>
      <HappinessStory />
      <About />
      <ClassesPreview />
      <WhyFIDC />
      <Suspense fallback={<SectionsSkeleton />}>
        <ComparisonSection config={HOMEPAGE_V2_CONFIG.comparison} />
        <Services />
        <Teachers />
        <ReviewsSection
          category="general"
          limit={6}
          showGoogleBadge={true}
          layout="grid"
          showCategory={true}
          selectedAuthors={[
            'Karina Indytska',
            'Yosefin Cabeza Carrillo',
            'Micaela Llull (MicaPower)',
            'Michelle Lu',
            'garcia lam',
            'Montse Solís Solís',
          ]}
        />
        <FAQSection title={t('faqTitle')} faqs={homeFaqs} />
        <FinalCTA />
        <HowToGetHere />
        <ManifestoBanner />
      </Suspense>
    </>
  );
};

export default HomePage;
