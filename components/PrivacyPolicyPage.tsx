/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '../lib/icons';

interface PrivacySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const PrivacySectionAccordion: React.FC<{
  section: PrivacySection;
  isOpen: boolean;
  onToggle: () => void;
}> = memo(({ section, isOpen, onToggle }) => (
  <div className="border border-neutral/10 rounded-lg overflow-hidden mb-4 bg-dark-surface/30">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-300 hover:bg-primary-dark/20"
      aria-expanded={isOpen}
      aria-controls={`privacy-section-${section.id}`}
    >
      <h2 className="text-lg md:text-xl font-semibold text-light-text pr-4">{section.title}</h2>
      <ChevronDownIcon
        className={`w-6 h-6 text-primary-accent flex-shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
    <div
      id={`privacy-section-${section.id}`}
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

PrivacySectionAccordion.displayName = 'PrivacySectionAccordion';

const PrivacyPolicyPage: React.FC = () => {
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
  const lastUpdated = '24/12/2025';
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
    '@id': `${baseUrl}/${locale}/politica-privacidad#webpage`,
    url: `${baseUrl}/${locale}/politica-privacidad`,
    name: t('privacy_page_title'),
    description: t('privacy_page_description'),
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
    specialty: 'Privacy Policy',
  };

  const sections: PrivacySection[] = [
    {
      id: 'section-1',
      title: '1. ¿Quién es el responsable del tratamiento?',
      content: (
        <>
          <p className="mb-4">
            En Farray's Center conviven dos entidades distintas. Según el servicio, puede cambiar
            quién es el responsable del tratamiento:
          </p>

          <h3 className="text-lg font-semibold text-light-text/90 mt-6 mb-3">
            A) Responsable (Web, Merchandising y Servicios de la SL)
          </h3>
          <div className="bg-dark-surface/50 rounded-lg p-4 mb-4 border border-neutral/10">
            <p className="text-neutral/80 mb-2">
              <strong className="text-light-text">Farray's Dance & Fitness, S.L.</strong> ("la SL")
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
          <p className="text-neutral/70 mb-4">
            La SL es titular del sitio web y responsable de los datos tratados para:
          </p>
          <ul className="text-neutral/70 list-disc pl-6 space-y-1 mb-4">
            <li>Gestión del sitio web y formularios</li>
            <li>Venta/recogida de merchandising</li>
            <li>
              Servicios prestados por la SL (sesiones privadas, servicios para empresas, bodas,
              teambuilding, despedidas y similares)
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-light-text/90 mt-6 mb-3">
            B) Responsable (Actividades Deportivas para Socios del Club)
          </h3>
          <div className="bg-dark-surface/50 rounded-lg p-4 mb-4 border border-neutral/10">
            <p className="text-neutral/80 mb-2">
              <strong className="text-light-text">Club Esportiu Farray Barcelona</strong> ("el
              Club")
            </p>
            <ul className="text-neutral/70 space-y-1 list-none pl-0">
              <li>
                <strong>NIF:</strong> G67317701
              </li>
              <li>
                <strong>Registre d'Entitats Esportives:</strong> nº 18821
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
          <p className="text-neutral/70 mb-4">El Club es responsable de los datos tratados para:</p>
          <ul className="text-neutral/70 list-disc pl-6 space-y-1 mb-4">
            <li>Alta y gestión de socios/usuarios</li>
            <li>Gestión de membresías</li>
            <li>Reservas y participación en actividades deportivas</li>
            <li>Control de acceso y gestión administrativa asociada</li>
          </ul>

          <div className="bg-primary-dark/20 rounded-lg p-4 mt-6 border border-primary-accent/30">
            <h4 className="font-semibold text-light-text mb-2">Nota sobre la relación SL–Club:</h4>
            <p className="text-neutral/70">
              La SL puede prestar al Club servicios de soporte/marketing. En esos casos, la SL podrá
              tratar datos por cuenta del Club como "encargada del tratamiento", cuando sea
              necesario y con el acuerdo legal correspondiente.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'section-2',
      title: '2. Qué datos tratamos',
      content: (
        <>
          <p className="mb-4">Según cómo interactúes con nosotros, podemos tratar:</p>
          <ul className="text-neutral/70 space-y-3">
            <li>
              <strong className="text-light-text/90">Datos identificativos y de contacto:</strong>{' '}
              nombre, apellidos, email, teléfono, y otros datos necesarios para gestionar
              solicitudes.
            </li>
            <li>
              <strong className="text-light-text/90">Datos administrativos:</strong> DNI/NIE solo
              cuando sea necesario (ej. verificación, facturación, incidencias).
            </li>
            <li>
              <strong className="text-light-text/90">Datos de compra (SL):</strong> productos
              adquiridos, justificantes, comunicaciones, incidencias.
            </li>
            <li>
              <strong className="text-light-text/90">Datos de actividad (Club):</strong> estado de
              socio, reservas, asistencias, créditos, incidencias.
            </li>
            <li>
              <strong className="text-light-text/90">Datos de pago:</strong> no almacenamos el
              número completo de tu tarjeta. Los pagos se procesan mediante pasarelas seguras.
            </li>
            <li>
              <strong className="text-light-text/90">Datos técnicos:</strong> IP,
              navegador/dispositivo, y datos de cookies según tu configuración/consentimiento.
            </li>
            <li>
              <strong className="text-light-text/90">Imágenes y vídeos:</strong> solo si existe
              consentimiento para captación y uso, o si se informa y procede legalmente.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'section-3',
      title: '3. Cómo obtenemos tus datos',
      content: (
        <ul className="text-neutral/70 list-disc pl-6 space-y-2">
          <li>Formularios del sitio web (contacto, solicitudes, presupuestos, newsletter).</li>
          <li>Compras/reservas de merchandising (recogida en instalaciones).</li>
          <li>Contratación de servicios prestados por la SL.</li>
          <li>
            Registro y reservas del Club mediante plataforma de gestión (por ejemplo, Momence).
          </li>
          <li>
            Comunicaciones por email/teléfono/WhatsApp si lo utilizas para gestionar una solicitud o
            incidencia.
          </li>
        </ul>
      ),
    },
    {
      id: 'section-4',
      title: '4. Finalidades y base jurídica',
      content: (
        <>
          <p className="mb-4">
            Tratamos tus datos conforme al RGPD y la normativa española aplicable.
          </p>

          <h3 className="text-lg font-semibold text-light-text/90 mt-6 mb-3">A) Finalidades SL</h3>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-neutral/80">
                <strong>a) Atender solicitudes y contacto</strong> (formularios, consultas,
                presupuestos).
              </p>
              <p className="text-neutral/60 text-sm">
                Base jurídica: consentimiento y/o medidas precontractuales.
              </p>
            </div>
            <div>
              <p className="text-neutral/80">
                <strong>b) Venta y recogida de merchandising</strong> (gestión del pedido,
                facturación, incidencias).
              </p>
              <p className="text-neutral/60 text-sm">
                Base jurídica: ejecución del contrato y obligaciones legales.
              </p>
            </div>
            <div>
              <p className="text-neutral/80">
                <strong>c) Prestación de servicios SL</strong> (sesiones privadas, empresas, bodas,
                teambuilding, despedidas, etc.).
              </p>
              <p className="text-neutral/60 text-sm">
                Base jurídica: ejecución del contrato y obligaciones legales.
              </p>
            </div>
            <div>
              <p className="text-neutral/80">
                <strong>d) Comunicaciones comerciales</strong> (newsletter/promos), si lo autorizas.
              </p>
              <p className="text-neutral/60 text-sm">
                Base jurídica: consentimiento (revocable en cualquier momento).
              </p>
            </div>
            <div>
              <p className="text-neutral/80">
                <strong>e) Seguridad del sitio</strong>, prevención de fraude y gestión técnica.
              </p>
              <p className="text-neutral/60 text-sm">Base jurídica: interés legítimo.</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-light-text/90 mt-6 mb-3">
            B) Finalidades Club
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-neutral/80">
                <strong>a) Alta y gestión de la condición de socio</strong> y administración de
                reservas/participación.
              </p>
              <p className="text-neutral/60 text-sm">
                Base jurídica: relación asociativa/contractual y obligaciones legales.
              </p>
            </div>
            <div>
              <p className="text-neutral/80">
                <strong>b) Comunicaciones operativas</strong> (horarios, avisos de reservas,
                incidencias, normas).
              </p>
              <p className="text-neutral/60 text-sm">
                Base jurídica: ejecución de la relación e interés legítimo organizativo.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'section-5',
      title: '5. Destinatarios y proveedores (Encargados)',
      content: (
        <>
          <p className="mb-4">
            No vendemos tus datos. Solo los compartimos cuando es necesario para prestar el servicio
            o por obligación legal.
          </p>

          <h3 className="text-lg font-semibold text-light-text/90 mt-4 mb-3">
            Proveedores habituales:
          </h3>
          <ul className="text-neutral/70 list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Hosting y dominio (web):</strong> Arsys Internet S.L.U. (España).
            </li>
            <li>
              <strong>Plataforma web:</strong> Customizada y Desarrollada por Farray's Dance &
              Fitness SL.
            </li>
            <li>
              <strong>Pagos online:</strong> Stripe (procesamiento seguro de pagos).
            </li>
            <li>
              <strong>Plataforma de reservas/gestión del Club:</strong> Momence (reservas,
              asistencia, gestión de actividades).
            </li>
            <li>
              <strong>Email marketing:</strong> Momence Inc.
            </li>
            <li>
              <strong>Analítica/medición:</strong> Google Analytics (GA4).
            </li>
            <li>
              <strong>Publicidad/remarketing:</strong> Google Ads / Meta (Pixel).
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-light-text/90 mt-6 mb-3">
            También podremos comunicar datos a:
          </h3>
          <ul className="text-neutral/70 list-disc pl-6 space-y-2">
            <li>
              Administraciones públicas, jueces y tribunales, fuerzas y cuerpos de seguridad, cuando
              exista obligación legal.
            </li>
            <li>
              Asesoría/gestoría, auditoría o soporte legal/contable, cuando sea necesario y con
              confidencialidad.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'section-6',
      title: '6. Transferencias internacionales',
      content: (
        <>
          <p className="mb-4">
            Algunos proveedores pueden tratar datos fuera del EEE (por ejemplo, EE. UU.). Cuando
            ocurra, aplicaremos mecanismos legales adecuados:
          </p>
          <ul className="text-neutral/70 list-disc pl-6 space-y-2">
            <li>Decisiones de adecuación cuando proceda, o</li>
            <li>Cláusulas Contractuales Tipo (SCC) y medidas adicionales cuando sea necesario.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'section-7',
      title: '7. Plazos de conservación',
      content: (
        <>
          <p className="mb-4">
            Conservamos los datos solo el tiempo necesario para las finalidades indicadas y durante
            los plazos exigidos por normativa aplicable:
          </p>
          <ul className="text-neutral/70 list-disc pl-6 space-y-2">
            <li>
              <strong>Datos de solicitudes/contacto:</strong> mientras dure la gestión y, después,
              el tiempo necesario para atender reclamaciones.
            </li>
            <li>
              <strong>Datos de compras/servicios:</strong> durante la relación y los plazos legales
              aplicables (fiscales/contables).
            </li>
            <li>
              <strong>Newsletter:</strong> hasta que te des de baja o retires el consentimiento.
            </li>
            <li>
              <strong>Datos del Club:</strong> mientras dure la relación de socio/usuario y según
              plazos legales/organizativos y de defensa ante reclamaciones.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'section-8',
      title: '8. Derechos',
      content: (
        <>
          <p className="mb-4">
            Puedes ejercer:{' '}
            <strong>acceso, rectificación, supresión, oposición, limitación y portabilidad</strong>.
          </p>
          <div className="bg-dark-surface/50 rounded-lg p-4 mb-4 border border-neutral/10">
            <p className="text-neutral/70 mb-2">
              <strong className="text-light-text">Para ejercerlos:</strong>
            </p>
            <p className="text-neutral/70">
              Escribe a{' '}
              <a
                href="mailto:info@farrayscenter.com"
                className="text-primary-accent hover:underline"
              >
                info@farrayscenter.com
              </a>{' '}
              con asunto "Protección de datos – Derechos", indicando tu solicitud y, si fuera
              necesario, un medio de verificación de identidad.
            </p>
          </div>
          <p className="text-neutral/70">
            También puedes reclamar ante la{' '}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent hover:underline font-semibold"
            >
              Agencia Española de Protección de Datos (AEPD)
            </a>{' '}
            si consideras que el tratamiento no se ajusta a la normativa.
          </p>
        </>
      ),
    },
    {
      id: 'section-9',
      title: '9. Menores de edad',
      content: (
        <>
          <p className="mb-4">
            En España, el tratamiento basado en consentimiento de menores de 14 años solo es lícito
            si consta el consentimiento del titular de la patria potestad o tutela.
          </p>
          <p className="text-neutral/70">
            Si detectamos datos de menores sin consentimiento válido, podremos cancelar/limitar el
            registro y suprimir los datos cuando proceda.
          </p>
        </>
      ),
    },
    {
      id: 'section-10',
      title: '10. Imágenes y vídeos (Consentimiento)',
      content: (
        <>
          <p className="mb-4">
            En actividades y eventos pueden captarse imágenes/vídeos con fines informativos y/o
            promocionales.
          </p>
          <ul className="text-neutral/70 list-disc pl-6 space-y-2">
            <li>
              La base jurídica será el consentimiento cuando corresponda (y, en menores, el del
              representante legal).
            </li>
            <li>
              Puedes retirar el consentimiento en cualquier momento escribiendo a{' '}
              <a
                href="mailto:info@farrayscenter.com"
                className="text-primary-accent hover:underline"
              >
                info@farrayscenter.com
              </a>
              .
            </li>
            <li>
              La retirada no afecta a usos ya realizados de forma lícita, pero sí a usos futuros
              razonablemente evitables (ej. nuevas publicaciones).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'section-11',
      title: '11. Seguridad',
      content: (
        <p className="text-neutral/70">
          Aplicamos medidas técnicas y organizativas razonables para proteger los datos. Aun así,
          ningún sistema es 100% inexpugnable.
        </p>
      ),
    },
    {
      id: 'section-12',
      title: '12. Cookies',
      content: (
        <>
          <p className="mb-4">
            Usamos cookies técnicas y, si consientes, cookies de analítica y publicidad/remarketing.
          </p>
          <p className="text-neutral/70">
            Las cookies no esenciales solo se activan según tu configuración/consentimiento en el
            banner o panel de preferencias. Consulta la{' '}
            <a href={`/${locale}/politica-cookies`} className="text-primary-accent hover:underline">
              Política de Cookies
            </a>{' '}
            del sitio para más detalle.
          </p>
        </>
      ),
    },
    {
      id: 'section-13',
      title: '13. Cambios en la política',
      content: (
        <p className="text-neutral/70">
          Podemos actualizar esta Política por cambios legales u operativos. La fecha de "Última
          actualización" indica la versión vigente.
        </p>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('privacy_page_title')}</title>
        <meta name="description" content={t('privacy_page_description')} />
        <link rel="canonical" href={`${baseUrl}/${locale}/politica-privacidad`} />
        {/* hreflang alternates for all locales */}
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/politica-privacidad`} />
        <link rel="alternate" hrefLang="ca" href={`${baseUrl}/ca/politica-privacidad`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/politica-privacidad`} />
        <link rel="alternate" hrefLang="fr" href={`${baseUrl}/fr/politica-privacidad`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/es/politica-privacidad`} />
        <meta name="robots" content="index, follow" />
        {/* BreadcrumbList generated at build-time by prerender.mjs */}
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-black via-primary-dark/10 to-black">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1
                className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {t('privacy_hero_title')}
              </h1>
              <p className="text-lg text-neutral/70 mb-4">
                {t('privacy_last_updated')}: {lastUpdated}
              </p>
              <p className="text-neutral/60 max-w-2xl mx-auto">{t('privacy_hero_intro')}</p>
              {/* Prevalence Clause */}
              <div className="bg-primary-dark/30 border border-primary-accent/20 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
                <p className="text-sm text-neutral/80 italic">{t('privacy_prevalence_clause')}</p>
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
                {t('privacy_expand_all')}
              </button>
              <span className="text-neutral/30">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-primary-accent hover:text-primary-accent/80 transition-colors"
              >
                {t('privacy_collapse_all')}
              </button>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-2">
              {sections.map(section => (
                <PrivacySectionAccordion
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
                {t('privacy_back_to_top')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
