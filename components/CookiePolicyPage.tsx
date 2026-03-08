/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './shared/Breadcrumb';
import { ChevronDownIcon } from '../lib/icons';
import { CookieSettingsButton } from './shared/CookieBanner';

interface CookieSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const CookieSectionAccordion: React.FC<{
  section: CookieSection;
  isOpen: boolean;
  onToggle: () => void;
}> = memo(({ section, isOpen, onToggle }) => (
  <div className="border border-neutral/10 rounded-lg overflow-hidden mb-4 bg-dark-surface/30">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-300 hover:bg-primary-dark/20"
      aria-expanded={isOpen}
      aria-controls={`cookie-section-${section.id}`}
    >
      <h2 className="text-lg md:text-xl font-semibold text-light-text pr-4">{section.title}</h2>
      <ChevronDownIcon
        className={`w-6 h-6 text-primary-accent flex-shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
    <div
      id={`cookie-section-${section.id}`}
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-6 pb-6 text-neutral/80 leading-relaxed legal-content">
        {section.content}
      </div>
    </div>
  </div>
));

CookieSectionAccordion.displayName = 'CookieSectionAccordion';

// Cookie table component
const CookieTable: React.FC<{
  cookies: Array<{
    name: string;
    provider: string;
    purpose: string;
    duration: string;
  }>;
  t: (key: string) => string;
}> = ({ cookies, t }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-neutral/20">
          <th className="text-left py-3 px-4 text-light-text font-semibold">
            {t('cookies_table_cookie')}
          </th>
          <th className="text-left py-3 px-4 text-light-text font-semibold">
            {t('cookies_table_provider')}
          </th>
          <th className="text-left py-3 px-4 text-light-text font-semibold">
            {t('cookies_table_purpose')}
          </th>
          <th className="text-left py-3 px-4 text-light-text font-semibold">
            {t('cookies_table_duration')}
          </th>
        </tr>
      </thead>
      <tbody>
        {cookies.map((cookie, index) => (
          <tr key={index} className="border-b border-neutral/10">
            <td className="py-3 px-4 text-neutral/70 font-mono text-xs">{cookie.name}</td>
            <td className="py-3 px-4 text-neutral/70">{cookie.provider}</td>
            <td className="py-3 px-4 text-neutral/70">{cookie.purpose}</td>
            <td className="py-3 px-4 text-neutral/70">{cookie.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CookiePolicyPage: React.FC = () => {
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
  const lastUpdated = '25/12/2025';
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['section-1']));

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(
    () => {
      setOpenSections(new Set(sections.map(s => s.id)));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const collapseAll = useCallback(() => {
    setOpenSections(new Set());
  }, []);

  // Schema Markup - WebPage
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/${locale}/politica-cookies#webpage`,
    url: `${baseUrl}/${locale}/politica-cookies`,
    name: t('cookies_page_title'),
    description: t('cookies_page_description'),
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: "Farray's Center",
      publisher: {
        '@type': 'Organization',
        name: "Farray's Dance & Fitness, S.L.",
        url: baseUrl,
      },
    },
    inLanguage:
      locale === 'es' ? 'es-ES' : locale === 'ca' ? 'ca-ES' : locale === 'en' ? 'en-GB' : 'fr-FR',
    specialty: 'Cookie Policy',
  };

  const breadcrumbItems = [
    { name: t('breadcrumbHome'), url: `/${locale}` },
    { name: t('cookies_breadcrumb_current'), url: `/${locale}/politica-cookies`, isActive: true },
  ];

  const sections: CookieSection[] = [
    {
      id: 'section-1',
      title: t('cookies_section1_title'),
      content: (
        <>
          <p className="mb-4">{t('cookies_section1_text1')}</p>
          <p className="text-neutral/70">{t('cookies_section1_text2')}</p>
        </>
      ),
    },
    {
      id: 'section-2',
      title: t('cookies_section2_title'),
      content: (
        <>
          <p className="mb-4">{t('cookies_section2_intro')}</p>
          <ul className="text-neutral/70 list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong className="text-light-text/90">{t('cookies_section2_lssi_title')}</strong>{' '}
              {t('cookies_section2_lssi_text')}
            </li>
            <li>
              <strong className="text-light-text/90">{t('cookies_section2_rgpd_title')}</strong>{' '}
              {t('cookies_section2_rgpd_text')}
            </li>
            <li>
              <strong className="text-light-text/90">{t('cookies_section2_lopdgdd_title')}</strong>{' '}
              {t('cookies_section2_lopdgdd_text')}
            </li>
          </ul>
          <div className="bg-primary-dark/20 rounded-lg p-4 border border-primary-accent/30">
            <p className="text-neutral/70">
              <strong className="text-light-text">{t('cookies_section2_important')}</strong>{' '}
              {t('cookies_section2_important_text')}
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'section-3',
      title: t('cookies_section3_title'),
      content: (
        <>
          <h3 className="text-lg font-semibold text-light-text/90 mb-4">
            {t('cookies_section3_essential_title')}
          </h3>
          <p className="mb-4 text-neutral/70">{t('cookies_section3_essential_text')}</p>
          <CookieTable
            t={t}
            cookies={[
              {
                name: 'cookie-consent',
                provider: t('cookies_type_own'),
                purpose: t('cookies_purpose_consent_storage'),
                duration: t('cookies_duration_1_year'),
              },
              {
                name: 'fidc_locale',
                provider: t('cookies_type_own'),
                purpose: t('cookies_purpose_locale'),
                duration: t('cookies_duration_1_year'),
              },
            ]}
          />

          <h3 className="text-lg font-semibold text-light-text/90 mt-8 mb-4">
            {t('cookies_section3_analytics_title')}
          </h3>
          <p className="mb-4 text-neutral/70">{t('cookies_section3_analytics_text')}</p>
          <CookieTable
            t={t}
            cookies={[
              {
                name: '_ga',
                provider: 'Google Analytics',
                purpose: t('cookies_purpose_unique_users'),
                duration: t('cookies_duration_2_years'),
              },
              {
                name: '_ga_*',
                provider: 'Google Analytics',
                purpose: t('cookies_purpose_session_state'),
                duration: t('cookies_duration_2_years'),
              },
              {
                name: '_gid',
                provider: 'Google Analytics',
                purpose: t('cookies_purpose_distinguish_users'),
                duration: t('cookies_duration_24_hours'),
              },
            ]}
          />
          <p className="mt-4 text-sm text-neutral/60">
            {t('cookies_section3_more_info')}{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent hover:underline"
            >
              {t('cookies_section3_google_privacy')}
            </a>
          </p>

          <h3 className="text-lg font-semibold text-light-text/90 mt-8 mb-4">
            {t('cookies_section3_marketing_title')}
          </h3>
          <p className="mb-4 text-neutral/70">{t('cookies_section3_marketing_text')}</p>
          <CookieTable
            t={t}
            cookies={[
              {
                name: '_fbp',
                provider: 'Meta (Facebook)',
                purpose: t('cookies_purpose_conversion_tracking'),
                duration: t('cookies_duration_3_months'),
              },
              {
                name: 'fr',
                provider: 'Meta (Facebook)',
                purpose: t('cookies_purpose_personalized_ads'),
                duration: t('cookies_duration_3_months'),
              },
            ]}
          />
          <p className="mt-4 text-sm text-neutral/60">
            {t('cookies_section3_more_info')}{' '}
            <a
              href="https://www.facebook.com/privacy/policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent hover:underline"
            >
              {t('cookies_section3_meta_privacy')}
            </a>
          </p>

          <h3 className="text-lg font-semibold text-light-text/90 mt-8 mb-4">
            {t('cookies_section3_functional_title')}
          </h3>
          <p className="mb-4 text-neutral/70">{t('cookies_section3_functional_text')}</p>
          <CookieTable
            t={t}
            cookies={[
              {
                name: 'YSC',
                provider: 'YouTube',
                purpose: t('cookies_purpose_video_stats'),
                duration: t('cookies_duration_session'),
              },
              {
                name: 'VISITOR_INFO1_LIVE',
                provider: 'YouTube',
                purpose: t('cookies_purpose_bandwidth'),
                duration: t('cookies_duration_6_months'),
              },
            ]}
          />
          <p className="mt-4 text-sm text-neutral/60">
            {t('cookies_section3_more_info')}{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent hover:underline"
            >
              {t('cookies_section3_youtube_privacy')}
            </a>
          </p>

          <h3 className="text-lg font-semibold text-light-text/90 mt-8 mb-4">
            {t('cookies_section3_maps_title')}
          </h3>
          <p className="mb-4 text-neutral/70">{t('cookies_section3_maps_text')}</p>
          <CookieTable
            t={t}
            cookies={[
              {
                name: 'NID',
                provider: 'Google',
                purpose: t('cookies_purpose_maps_preferences'),
                duration: t('cookies_duration_6_months'),
              },
              {
                name: 'CONSENT',
                provider: 'Google',
                purpose: t('cookies_purpose_consent_status'),
                duration: t('cookies_duration_2_years'),
              },
              {
                name: '1P_JAR',
                provider: 'Google',
                purpose: t('cookies_purpose_site_stats'),
                duration: t('cookies_duration_1_month'),
              },
            ]}
          />
          <p className="mt-4 text-sm text-neutral/60">
            {t('cookies_section3_more_info')}{' '}
            <a
              href="https://policies.google.com/technologies/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent hover:underline"
            >
              {t('cookies_section3_google_cookies')}
            </a>
          </p>
        </>
      ),
    },
    {
      id: 'section-4',
      title: t('cookies_section4_title'),
      content: (
        <>
          <p className="mb-4">{t('cookies_section4_intro')}</p>

          <div className="bg-primary-dark/20 rounded-lg p-4 mb-6 border border-primary-accent/30">
            <p className="text-neutral/70">
              <strong className="text-light-text">{t('cookies_section4_duration_title')}</strong>{' '}
              {t('cookies_section4_duration_text')}
            </p>
          </div>

          <div className="bg-dark-surface/50 rounded-lg p-6 mb-6 border border-neutral/10">
            <h3 className="font-semibold text-light-text mb-3">
              {t('cookies_section4_option1_title')}
            </h3>
            <p className="text-neutral/70 mb-4">{t('cookies_section4_option1_text')}</p>
            <CookieSettingsButton className="inline-block px-6 py-3 bg-primary-accent text-white rounded-full font-semibold hover:bg-primary-accent/90 transition-colors" />
          </div>

          <div className="bg-dark-surface/50 rounded-lg p-6 mb-6 border border-neutral/10">
            <h3 className="font-semibold text-light-text mb-3">
              {t('cookies_section4_option2_title')}
            </h3>
            <p className="text-neutral/70 mb-4">{t('cookies_section4_option2_text')}</p>
            <ul className="text-neutral/70 space-y-2">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-accent hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-accent hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-accent hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-accent hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </div>
        </>
      ),
    },
    {
      id: 'section-5',
      title: t('cookies_section5_title'),
      content: (
        <>
          <p className="mb-4">{t('cookies_section5_intro')}</p>
          <div className="bg-dark-surface/50 rounded-lg p-4 mb-4 border border-neutral/10">
            <h3 className="font-semibold text-light-text mb-3">
              {t('cookies_section5_providers_title')}
            </h3>
            <ul className="text-neutral/70 space-y-3 list-none pl-0">
              <li>
                <strong className="text-light-text/90">Google LLC</strong> (Analytics, YouTube,
                Maps): {t('cookies_section5_google_text')}{' '}
                <a
                  href="https://policies.google.com/privacy/frameworks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-accent hover:underline"
                >
                  EU-U.S. Data Privacy Framework
                </a>
              </li>
              <li>
                <strong className="text-light-text/90">Meta Platforms, Inc.</strong> (Facebook
                Pixel): {t('cookies_section5_meta_text')}{' '}
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-accent hover:underline"
                >
                  SCCs
                </a>
              </li>
            </ul>
          </div>
          <p className="text-neutral/70">{t('cookies_section5_consent_note')}</p>
        </>
      ),
    },
    {
      id: 'section-6',
      title: t('cookies_section6_title'),
      content: (
        <>
          <div className="bg-dark-surface/50 rounded-lg p-4 mb-4 border border-neutral/10">
            <p className="text-neutral/80 mb-2">
              <strong className="text-light-text">Farray's Dance & Fitness, S.L.</strong>
            </p>
            <ul className="text-neutral/70 space-y-1 list-none pl-0">
              <li>
                <strong>NIF:</strong> B67004812
              </li>
              <li>
                <strong>Domicilio:</strong> Carrer d'Entença, 100, Local 1, 08015 Barcelona (España)
              </li>
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:info@farrayscenter.com"
                  className="text-primary-accent hover:underline"
                >
                  info@farrayscenter.com
                </a>
              </li>
            </ul>
          </div>
          <p className="text-neutral/70">
            {t('cookies_section6_more_info')}{' '}
            <a
              href={`/${locale}/politica-privacidad`}
              className="text-primary-accent hover:underline"
            >
              {t('cookies_section6_privacy_link')}
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: 'section-7',
      title: t('cookies_section7_title'),
      content: <p className="text-neutral/70">{t('cookies_section7_text')}</p>,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('cookies_page_title')}</title>
        <meta name="description" content={t('cookies_page_description')} />
        <link rel="canonical" href={`${baseUrl}/${locale}/politica-cookies`} />
        {/* hreflang alternates for all locales */}
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/politica-cookies`} />
        <link rel="alternate" hrefLang="ca" href={`${baseUrl}/ca/politica-cookies`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/politica-cookies`} />
        <link rel="alternate" hrefLang="fr" href={`${baseUrl}/fr/politica-cookies`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/es/politica-cookies`} />
        <meta name="robots" content="index, follow" />
        {/* BreadcrumbList generated at build-time by prerender.mjs */}
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-black pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-black via-primary-dark/10 to-black">
          <div className="container mx-auto px-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/70" />

            <div className="max-w-4xl mx-auto text-center mt-6">
              <h1
                className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {t('cookies_hero_title')}
              </h1>
              <p className="text-lg text-neutral/70 mb-4">
                {t('cookies_last_updated')}: {lastUpdated}
              </p>
              <p className="text-neutral/60 max-w-2xl mx-auto">{t('cookies_hero_intro')}</p>
              {/* Prevalence Clause */}
              <div className="bg-primary-dark/30 border border-primary-accent/20 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
                <p className="text-sm text-neutral/80 italic">{t('cookies_prevalence_clause')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Controls */}
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={expandAll}
                className="text-sm text-primary-accent hover:text-primary-accent/80 transition-colors"
              >
                {t('cookies_expand_all')}
              </button>
              <span className="text-neutral/30">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-primary-accent hover:text-primary-accent/80 transition-colors"
              >
                {t('cookies_collapse_all')}
              </button>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-2">
              {sections.map(section => (
                <CookieSectionAccordion
                  key={section.id}
                  section={section}
                  isOpen={openSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>

            {/* Back to top */}
            <div className="text-center mt-12 pt-8 border-t border-neutral/10">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-primary-accent hover:text-primary-accent/80 transition-colors text-sm"
              >
                {t('cookies_back_to_top')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CookiePolicyPage;
