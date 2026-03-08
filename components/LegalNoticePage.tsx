/* eslint-disable react/no-unescaped-entities */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './shared/Breadcrumb';
import AnimateOnScroll from './AnimateOnScroll';

interface LegalSection {
  id: string;
  title: string;
  shortTitle: string;
  content: React.ReactNode;
}

// Last update date - update this when modifying legal content
const LAST_UPDATED = '2026-01-15';

const LegalNoticePage: React.FC = () => {
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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Legal sections content (Spanish - official legal language)
  const legalSections: LegalSection[] = [
    {
      id: 'datos-identificativos',
      title: '1. DATOS IDENTIFICATIVOS (INFORMACIÓN GENERAL)',
      shortTitle: 'Datos identificativos',
      content: (
        <>
          <p className="mb-4">
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:
          </p>

          <h4 className="text-lg font-bold text-neutral mt-6 mb-3">
            1.1. Titular del sitio web (prestador de servicios de la sociedad de la información)
          </h4>
          <ul className="list-none space-y-1 mb-4">
            <li>
              <strong>Denominación social:</strong> Farray's Dance & Fitness, S.L. (en adelante, la
              "SL")
            </li>
            <li>
              <strong>Nombre comercial:</strong> Farray's Center / Farray's International Dance
              Center
            </li>
            <li>
              <strong>NIF:</strong> B67004812
            </li>
            <li>
              <strong>Domicilio:</strong> Carrer d'Entença, 100, Local 1, 08015 Barcelona
              (Barcelona, España)
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
            <li>
              <strong>Teléfono:</strong>{' '}
              <a href="tel:+34662221614" className="text-primary-accent hover:underline">
                (+34) 662 221 614
              </a>
            </li>
            <li>
              <strong>Sitio web:</strong>{' '}
              <a
                href="https://www.farrayscenter.com"
                className="text-primary-accent hover:underline"
              >
                https://www.farrayscenter.com
              </a>
            </li>
          </ul>
          <p className="mb-4">
            La SL es titular y responsable del Sitio Web, su contenido informativo y la
            comercialización/gestión de productos y servicios propios ofrecidos en el Sitio Web.
          </p>

          <h4 className="text-lg font-bold text-neutral mt-6 mb-3">
            1.2. Entidad deportiva (actividades para personas socias)
          </h4>
          <ul className="list-none space-y-1 mb-4">
            <li>
              <strong>Denominación:</strong> Club Esportiu Farray Barcelona (en adelante, el "Club")
            </li>
            <li>
              <strong>Nombre comercial:</strong> Farray's Center / Farray's International Dance
              Center
            </li>
            <li>
              <strong>NIF:</strong> G67317701
            </li>
            <li>
              <strong>Registro:</strong> Registre d'Entitats Esportives nº 18821
            </li>
            <li>
              <strong>Domicilio:</strong> Carrer d'Entença, 100, Local 1, 08015 Barcelona
              (Barcelona, España)
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

          <div className="bg-primary-dark/20 border border-primary-accent/30 rounded-lg p-4 mt-4">
            <p className="font-bold text-neutral mb-2">IMPORTANTE:</p>
            <ul className="list-disc list-inside space-y-2 text-neutral/90">
              <li>
                El Club es una entidad distinta a la SL y es la responsable de las actividades
                deportivas ofrecidas exclusivamente a personas socias del Club, así como de sus
                membresías y reservas en la plataforma habilitada (por ejemplo, Momence).
              </li>
              <li>
                La SL presta al Club servicios de soporte y marketing (incluida la gestión del Sitio
                Web y comunicación). Esto no altera quién es la parte contratante en cada caso: se
                identificará en el proceso de compra/reserva ("Vendido/Prestado por").
              </li>
            </ul>
          </div>
        </>
      ),
    },
    {
      id: 'objeto-ambito',
      title: '2. OBJETO Y ÁMBITO',
      shortTitle: 'Objeto y ámbito',
      content: (
        <>
          <p className="mb-4">
            El presente Aviso Legal regula el acceso, navegación y uso del Sitio Web.
          </p>
          <p className="mb-4">A través del Sitio Web se puede:</p>
          <ol className="list-inside space-y-2 mb-4" style={{ listStyleType: 'upper-alpha' }}>
            <li>
              Informarse sobre servicios, productos y actividades vinculadas a Farray's Center.
            </li>
            <li>
              Contratar/solicitar determinados productos/servicios prestados por la SL (por ejemplo,
              merchandising y servicios propios como sesiones privadas, servicios para empresas,
              bodas, teambuilding, despedidas, etc., si aparecen disponibles).
            </li>
            <li>
              Acceder a enlaces y/o plataformas externas para gestión de reservas y contratación de
              actividades deportivas del Club (por ejemplo, Momence), cuando proceda.
            </li>
          </ol>
          <p className="mb-4">Para la contratación online aplican, además:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Las "Condiciones Generales de Contratación" (si hay compra/contratación desde la web),
              y
            </li>
            <li>
              Los "Términos y condiciones" específicos del Club y/o de la plataforma de reservas
              cuando la contratación se realice con el Club.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'condicion-usuario',
      title: '3. CONDICIÓN DE USUARIO Y ACEPTACIÓN',
      shortTitle: 'Condición de usuario',
      content: (
        <>
          <p className="mb-4">
            La navegación por el Sitio Web atribuye la condición de usuario e implica la aceptación
            plena y sin reservas del presente Aviso Legal.
          </p>
          <p>
            Si el usuario no está de acuerdo con estas condiciones, debe abstenerse de utilizar el
            Sitio Web.
          </p>
        </>
      ),
    },
    {
      id: 'normas-uso',
      title: '4. NORMAS DE USO',
      shortTitle: 'Normas de uso',
      content: (
        <>
          <p className="mb-4">El usuario se compromete a:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              Utilizar el Sitio Web de forma lícita, diligente y conforme a la buena fe, el orden
              público y la normativa aplicable.
            </li>
            <li>
              No realizar acciones que puedan dañar, inutilizar o sobrecargar el Sitio Web o impedir
              su normal funcionamiento.
            </li>
            <li>
              No introducir o difundir virus, código malicioso o cualquier sistema susceptible de
              provocar daños.
            </li>
            <li>No utilizar el Sitio Web para enviar comunicaciones no solicitadas o ilícitas.</li>
          </ul>
          <p>
            El titular se reserva el derecho a denegar o retirar el acceso al Sitio Web, sin
            necesidad de preaviso, a los usuarios que incumplan estas condiciones.
          </p>
        </>
      ),
    },
    {
      id: 'contenidos-responsabilidad',
      title: '5. CONTENIDOS, RESPONSABILIDAD Y ENLACES',
      shortTitle: 'Contenidos y responsabilidad',
      content: (
        <>
          <h4 className="text-lg font-bold text-neutral mt-4 mb-3">5.1. Contenidos propios</h4>
          <p className="mb-4">
            La SL y/o el Club (según corresponda) realizan esfuerzos razonables para que la
            información del Sitio Web sea veraz y esté actualizada. No obstante, la información
            puede estar sujeta a cambios, disponibilidad o actualización.
          </p>

          <h4 className="text-lg font-bold text-neutral mt-6 mb-3">5.2. Responsabilidad</h4>
          <p className="mb-4">El titular no se hace responsable de:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Errores u omisiones en los contenidos.</li>
            <li>
              Daños derivados del uso del Sitio Web, incluidos los causados por virus o incidencias
              técnicas.
            </li>
            <li>Interrupciones del servicio o fallos de red ajenos al titular.</li>
          </ul>

          <h4 className="text-lg font-bold text-neutral mt-6 mb-3">5.3. Enlaces a terceros</h4>
          <p className="mb-4">
            El Sitio Web puede incluir enlaces a páginas o servicios de terceros. El titular no
            controla sus contenidos y no asume responsabilidad por dichos contenidos, políticas o
            prácticas.
          </p>
          <p>La presencia de enlaces no implica relación, aprobación o recomendación.</p>
        </>
      ),
    },
    {
      id: 'propiedad-intelectual',
      title: '6. PROPIEDAD INTELECTUAL E INDUSTRIAL',
      shortTitle: 'Propiedad intelectual',
      content: (
        <>
          <p className="mb-4">
            El Sitio Web, incluyendo a título enunciativo y no limitativo su programación, diseños,
            textos, imágenes, logotipos, marcas, estructura y demás elementos, son titularidad de la
            SL y/o del Club o de terceros con licencia, y están protegidos por la normativa de
            propiedad intelectual e industrial.
          </p>
          <p className="mb-4">
            Queda prohibida la reproducción, distribución, comunicación pública o transformación,
            total o parcial, sin autorización expresa del titular de los derechos, salvo en los
            casos permitidos por ley.
          </p>
          <p>
            Para comunicar posibles infracciones:{' '}
            <a href="mailto:info@farrayscenter.com" className="text-primary-accent hover:underline">
              info@farrayscenter.com
            </a>
          </p>
        </>
      ),
    },
    {
      id: 'proteccion-datos',
      title: '7. PROTECCIÓN DE DATOS PERSONALES',
      shortTitle: 'Protección de datos',
      content: (
        <>
          <p className="mb-4">
            El tratamiento de datos personales se rige por la Política de Privacidad del Sitio Web,
            donde se informa de:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>responsables del tratamiento (SL y/o Club según el servicio),</li>
            <li>finalidades,</li>
            <li>bases jurídicas,</li>
            <li>destinatarios,</li>
            <li>plazos de conservación,</li>
            <li>y derechos de los interesados.</li>
          </ul>
          <p>
            La Política de Privacidad está disponible en{' '}
            <Link
              to={`/${locale}/politica-privacidad`}
              className="text-primary-accent hover:underline font-medium"
            >
              este enlace
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: '8. COOKIES',
      shortTitle: 'Cookies',
      content: (
        <p>
          El Sitio Web puede utilizar cookies y tecnologías similares. El usuario puede configurar o
          rechazar cookies no esenciales mediante el panel de configuración/consentimiento
          habilitado y consultar información detallada en la{' '}
          <Link
            to={`/${locale}/politica-cookies`}
            className="text-primary-accent hover:underline font-medium"
          >
            Política de Cookies
          </Link>
          .
        </p>
      ),
    },
    {
      id: 'comunicaciones-comerciales',
      title: '9. COMUNICACIONES COMERCIALES',
      shortTitle: 'Comunicaciones comerciales',
      content: (
        <p>
          En caso de que existan comunicaciones comerciales electrónicas, se realizarán conforme a
          la normativa aplicable y, cuando sea exigible, sobre la base del consentimiento del
          usuario o de la relación previa permitida por la ley. El usuario podrá oponerse o darse de
          baja en cualquier momento siguiendo las instrucciones incluidas en la propia comunicación
          o contactando con{' '}
          <a href="mailto:info@farrayscenter.com" className="text-primary-accent hover:underline">
            info@farrayscenter.com
          </a>
          .
        </p>
      ),
    },
    {
      id: 'modificaciones',
      title: '10. MODIFICACIONES',
      shortTitle: 'Modificaciones',
      content: (
        <p>
          El titular se reserva el derecho a modificar, en cualquier momento y sin previo aviso, la
          presentación, configuración y contenidos del Sitio Web, así como el presente Aviso Legal.
          La fecha de "Última actualización" indica la versión vigente.
        </p>
      ),
    },
    {
      id: 'ley-aplicable',
      title: '11. LEY APLICABLE Y JURISDICCIÓN',
      shortTitle: 'Ley aplicable',
      content: (
        <>
          <p className="mb-4">El presente Aviso Legal se rige por la legislación española.</p>
          <p className="mb-4">En caso de controversia:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Si el usuario actúa como consumidor, se aplicarán las normas imperativas de
              competencia territorial que resulten de aplicación.
            </li>
            <li>
              En otros casos, las partes se someten a los Juzgados y Tribunales de Barcelona, salvo
              que la ley establezca otra cosa.
            </li>
          </ul>
        </>
      ),
    },
  ];

  // Schema Markup - WebPage
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/${locale}/aviso-legal#webpage`,
    url: `${baseUrl}/${locale}/aviso-legal`,
    name: t('legalNotice_page_title'),
    description: t('legalNotice_page_description'),
    inLanguage: { es: 'es-ES', ca: 'ca-ES', en: 'en-GB', fr: 'fr-FR' }[locale] || 'es-ES',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: "Farray's Center",
    },
    publisher: {
      '@type': 'Organization',
      name: "Farray's Dance & Fitness, S.L.",
      url: baseUrl,
    },
  };

  // Breadcrumb items for visual navigation
  const breadcrumbItems = [
    { name: t('home'), url: `/${locale}` },
    { name: t('legalNotice_breadcrumb_current'), url: `/${locale}/aviso-legal`, isActive: true },
  ];

  return (
    <>
      <Helmet>
        <title>{t('legalNotice_page_title')} | Farray's Center</title>
        <meta name="description" content={t('legalNotice_page_description')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${baseUrl}/${locale}/aviso-legal`} />
        {/* BreadcrumbList generated at build-time by prerender.mjs */}
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-black pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-black via-primary-dark/10 to-black">
          <div className="container mx-auto px-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} textColor="text-neutral/70" />

            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <h1
                  className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
                >
                  {t('legalNotice_hero_title')}
                </h1>
                <p className="text-lg text-neutral/70">
                  {t('legalNotice_last_updated')}: {formatDate(LAST_UPDATED)}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-8 bg-primary-dark/5">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <AnimateOnScroll>
                {/* Prevalence Clause */}
                <div className="bg-primary-dark/30 border border-primary-accent/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-neutral/80 italic mb-2">
                    <strong>{t('legalNotice_prevalence_clause').split('.')[0]}.</strong>
                  </p>
                  <p className="text-sm text-neutral/80 italic">
                    <strong>Nota:</strong> {t('legalNotice_language_note')}
                  </p>
                </div>

                {/* TOC */}
                <h2 className="text-lg font-bold text-neutral mb-4">
                  {t('legalNotice_index_title')}
                </h2>
                <nav aria-label="Índice del documento">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {legalSections.map(section => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-neutral/70 hover:text-primary-accent transition-colors text-sm flex items-center gap-2"
                        >
                          <span className="text-primary-accent">→</span>
                          {section.shortTitle}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Legal Content Section */}
        <section className="py-12 md:py-16 bg-black">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {legalSections.map((section, index) => (
                <AnimateOnScroll key={section.id} delay={index * 50}>
                  <div id={section.id} className="mb-12 last:mb-0 scroll-mt-24">
                    <h2 className="text-xl md:text-2xl font-bold text-neutral mb-4 border-b border-primary-dark/30 pb-2">
                      {section.title}
                    </h2>
                    <div className="text-neutral/90 leading-relaxed prose prose-invert max-w-none">
                      {section.content}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LegalNoticePage;
