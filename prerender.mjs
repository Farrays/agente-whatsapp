import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllJsonLd, BLOG_ARTICLE_DATA } from './scripts/schema-generators.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 
// ENTERPRISE LANDING CONFIGURATION
// 
// Single source of truth for all landing pages (Facebook Ads campaigns)
// To add a new landing: just add the slug here, everything else is auto-generated

const SUPPORTED_LOCALES = ['es', 'ca', 'en', 'fr'];

// Load pages.json translations for rich pre-rendered content (class pages)
// These are read at build time to generate semantic HTML for crawlers
const pagesTranslations = {};
for (const locale of SUPPORTED_LOCALES) {
  try {
    const filePath = path.join(__dirname, 'i18n', 'locales', locale, 'pages.json');
    pagesTranslations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Warning: Could not load pages.json for locale "${locale}":`, e.message);
    pagesTranslations[locale] = {};
  }
}

// Load blog.json translations for blog Article/FAQPage JSON-LD schemas
const blogTranslations = {};
for (const locale of SUPPORTED_LOCALES) {
  try {
    const filePath = path.join(__dirname, 'i18n', 'locales', locale, 'blog.json');
    blogTranslations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Warning: Could not load blog.json for locale "${locale}":`, e.message);
    blogTranslations[locale] = {};
  }
}

// Load home.json translations for DanceClassesPage FAQ schemas
const homeTranslations = {};
for (const locale of SUPPORTED_LOCALES) {
  try {
    const filePath = path.join(__dirname, 'i18n', 'locales', locale, 'home.json');
    homeTranslations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Warning: Could not load home.json for locale "${locale}":`, e.message);
    homeTranslations[locale] = {};
  }
}

// Load schedule.json translations for HorariosPageV2 FAQ schemas
const scheduleTranslations = {};
for (const locale of SUPPORTED_LOCALES) {
  try {
    const filePath = path.join(__dirname, 'i18n', 'locales', locale, 'schedule.json');
    scheduleTranslations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Warning: Could not load schedule.json for locale "${locale}":`, e.message);
    scheduleTranslations[locale] = {};
  }
}

const LANDING_SLUGS = [
  'dancehall',
  'twerk',
  'sexy-reggaeton',
  'sexy-style',
  'hip-hop-reggaeton',
  'contemporaneo',
  'femmology',
  'bachata',
  'bachata-curso', // Direct sale landing (Hormozi style)
  'salsa-curso',   // Direct sale landing (Hormozi style)
  'hip-hop',
  'afrobeats',
  'afro-jazz',
  'salsa-cubana',
  'ballet',
  'afro-contemporaneo',
  'clase-bienvenida',
  'profesor-reynier',
  'commercial-dance',
  'broadway-jazz',
];

// Helper: convert slug to page key (e.g., 'sexy-reggaeton' -> 'sexyReggaetonLanding')
const slugToPageKey = (slug) => {
  const camelCase = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return `${camelCase}Landing`;
};

// Auto-generate landing routes (14 slugs × 4 languages = 56 routes)
const generateLandingRoutes = () =>
  SUPPORTED_LOCALES.flatMap(lang =>
    LANDING_SLUGS.map(slug => ({
      path: `${lang}/${slug}`,
      lang,
      page: slugToPageKey(slug),
    }))
  );

// Landing metadata templates per language
const LANDING_META_TEMPLATES = {
  es: {
    titleTemplate: (name) => `Clase de ${name} en Barcelona | Farray's Center`,
    descTemplate: (name) => `Aprende ${name} en Barcelona con profesores expertos. +15.000 alumnos formados. Método Farray® CID-UNESCO. ¡Reserva!`,
  },
  ca: {
    titleTemplate: (name) => `Classe de ${name} a Barcelona | Farray's Center`,
    descTemplate: (name) => `Aprèn ${name} a Barcelona amb professors experts. +15.000 alumnes formats. Mètode Farray® CID-UNESCO. Reserva!`,
  },
  en: {
    titleTemplate: (name) => `${name} Class in Barcelona | Farray's Center`,
    descTemplate: (name) => `Learn ${name} in Barcelona with expert instructors. +15,000 students trained. Farray Method® CID-UNESCO. Book now!`,
  },
  fr: {
    titleTemplate: (name) => `Cours de ${name} à Barcelone | Farray's Center`,
    descTemplate: (name) => `Apprenez le ${name} à Barcelone avec professeurs experts. +15 000 élèves formés. Méthode Farray® CID-UNESCO. Réservez!`,
  },
};

// Display names for each style per language
const LANDING_DISPLAY_NAMES = {
  'dancehall': { es: 'Dancehall', ca: 'Dancehall', en: 'Dancehall', fr: 'Dancehall' },
  'twerk': { es: 'Twerk', ca: 'Twerk', en: 'Twerk', fr: 'Twerk' },
  'sexy-reggaeton': { es: 'Sexy Reggaeton', ca: 'Sexy Reggaeton', en: 'Sexy Reggaeton', fr: 'Sexy Reggaeton' },
  'sexy-style': { es: 'Sexy Style', ca: 'Sexy Style', en: 'Sexy Style', fr: 'Sexy Style' },
  'hip-hop-reggaeton': { es: 'Hip Hop Reggaeton', ca: 'Hip Hop Reggaeton', en: 'Hip Hop Reggaeton', fr: 'Hip Hop Reggaeton' },
  'contemporaneo': { es: 'Contemporáneo', ca: 'Contemporani', en: 'Contemporary Dance', fr: 'Danse Contemporaine' },
  'femmology': { es: 'Femmology', ca: 'Femmology', en: 'Femmology', fr: 'Femmology' },
  'bachata': { es: 'Bachata Sensual', ca: 'Bachata Sensual', en: 'Sensual Bachata', fr: 'Bachata Sensuelle' },
  'bachata-curso': { es: 'Curso de Bachata', ca: 'Curs de Bachata', en: 'Bachata Course', fr: 'Cours de Bachata' },
  'salsa-curso': { es: 'Curso de Salsa', ca: 'Curs de Salsa', en: 'Salsa Course', fr: 'Cours de Salsa' },
  'hip-hop': { es: 'Hip Hop', ca: 'Hip Hop', en: 'Hip Hop', fr: 'Hip Hop' },
  'afrobeats': { es: 'Afrobeats', ca: 'Afrobeats', en: 'Afrobeats', fr: 'Afrobeats' },
  'afro-jazz': { es: 'Afro Jazz', ca: 'Afro Jazz', en: 'Afro Jazz', fr: 'Afro Jazz' },
  'salsa-cubana': { es: 'Salsa Cubana', ca: 'Salsa Cubana', en: 'Cuban Salsa', fr: 'Salsa Cubaine' },
  'ballet': { es: 'Ballet Clásico', ca: 'Ballet Clàssic', en: 'Classical Ballet', fr: 'Ballet Classique' },
  'afro-contemporaneo': { es: 'Afro Contemporáneo', ca: 'Afro Contemporani', en: 'Afro Contemporary', fr: 'Afro Contemporain' },
  'clase-bienvenida': { es: 'Clase de Bienvenida', ca: 'Classe de Benvinguda', en: 'Welcome Class', fr: 'Cours de Bienvenue' },
  'profesor-reynier': { es: 'Broadway Jazz y Commercial Dance', ca: 'Broadway Jazz i Commercial Dance', en: 'Broadway Jazz & Commercial Dance', fr: 'Broadway Jazz et Commercial Dance' },
  'commercial-dance': { es: 'Commercial Dance', ca: 'Commercial Dance', en: 'Commercial Dance', fr: 'Commercial Dance' },
  'broadway-jazz': { es: 'Broadway Jazz', ca: 'Broadway Jazz', en: 'Broadway Jazz', fr: 'Broadway Jazz' },
};

// Auto-generate landing metadata for all languages
const generateLandingMetadata = () => {
  const result = {};
  SUPPORTED_LOCALES.forEach(lang => {
    result[lang] = {};
    LANDING_SLUGS.forEach(slug => {
      const pageKey = slugToPageKey(slug);
      const displayName = LANDING_DISPLAY_NAMES[slug][lang];
      const templates = LANDING_META_TEMPLATES[lang];
      result[lang][pageKey] = {
        title: templates.titleTemplate(displayName),
        description: templates.descTemplate(displayName),
        robots: 'noindex, nofollow',
      };
    });
  });
  return result;
};

// Auto-generate landing HTML content for SSG
// NOTE: Landing pages use empty content to avoid React hydration mismatch errors.
// GenericDanceLanding component renders the full content client-side.
// Only metadata (title, description, robots) is prerendered for SEO.
const generateLandingContent = () => {
  const result = {};
  SUPPORTED_LOCALES.forEach(lang => {
    result[lang] = {};
    LANDING_SLUGS.forEach(slug => {
      const pageKey = slugToPageKey(slug);
      // Empty content - React will render GenericDanceLanding from scratch
      // This avoids hydration mismatch errors (React error #418)
      result[lang][pageKey] = '';
    });
  });
  return result;
};

// Generate all landing data
const LANDING_ROUTES = generateLandingRoutes();
const LANDING_METADATA = generateLandingMetadata();
const LANDING_CONTENT = generateLandingContent();

// 
// OG IMAGE MAPPING - Mapeo inteligente de imágenes Open Graph por página
// 
// Cada pageKey se mapea a su imagen OG correspondiente.
// Las imágenes pueden estar en:
// - /images/og-{name}.jpg (imágenes OG dedicadas)
// - /images/{folder}/og.jpg (subcarpetas con og.jpg)
// - /images/classes/{style}/img/{image}_1920.jpg (hero de clases como fallback)
// Fallback final: og-home.jpg

const OG_IMAGE_MAP = {
  // === Páginas principales ===
  home: 'og-home.jpg',
  classesHub: 'og-classes.jpg',
  classes: 'og-classes.jpg',
  horariosPrecio: 'og-horarios-clases-baile.jpg',
  horariosClases: 'og-horarios-clases-baile.jpg',
  preciosClases: 'og-horarios-clases-baile.jpg',

  // === Páginas de información ===
  about: 'og-home.jpg', // Usa home como fallback
  yunaisy: 'og-yunaisy-farray.jpg',
  metodoFarray: 'og-home.jpg',
  facilities: 'og-home.jpg',
  contact: 'og-home.jpg',
  faq: 'og-home.jpg',
  profesores: 'og-home.jpg',
  merchandising: 'og-home.jpg',
  regalaBaile: 'og-home.jpg',
  reservas: 'og-home.jpg',
  miReserva: 'og-home.jpg',
  fichaje: 'og-home.jpg',
  adminFichajes: 'og-home.jpg',
  adminReservas: 'og-home.jpg',
  feedbackGracias: 'og-home.jpg',
  feedbackComentario: 'og-home.jpg',
  asistenciaConfirmada: 'og-home.jpg',
  calendario: 'og-horarios-clases-baile.jpg',
  serviciosBaile: 'og-classes.jpg',

  // === Categorías de clases ===
  danza: 'categories/hero/clases-de-danza-og.jpg',
  salsaBachata: 'og-salsaBachata.jpg',
  danzasUrbanas: 'og-dancehall.jpg',

  // === Estilos de baile - Salsa/Bachata ===
  bachataSensual: 'classes/Bachata/img/clases-bachata-sensual-barcelona_1920.jpg',
  salsaCubana: 'classes/salsa-cubana/img/salsa-cubana_1920.jpg',
  salsaLadyStyle: 'classes/Salsa-Lady-Style/img/clases-salsa-lady-style-barcelona_1920.jpg',
  folkloreCubano: 'classes/folklore-cubano/img/folklore-calle-habana_1920.jpg',
  timba: 'classes/timba/img/timba-cubana_1920.jpg',
  bachataLadyStyle: 'classes/bachata-lady-style/img/clases-bachata-lady-style-barcelona_1920.jpg',
  kizomba: 'og-salsaBachata.jpg', // Usa salsa/bachata como fallback

  // === Estilos de baile - Urbano ===
  dancehall: 'og-dancehall.jpg',
  twerk: 'classes/twerk/img/clases-twerk-barcelona_1920.jpg',
  afrobeat: 'og-afrobeat.jpg',
  kpop: 'og-dancehall.jpg', // Usa dancehall como fallback urbano
  commercial: 'og-dancehall.jpg',
  hipHopReggaeton: 'classes/hip-hop-reggaeton/img/clases-hip-hop-reaggaeton-barcelona_1920.jpg',
  sexyReggaeton: 'classes/sexy-reggaeton/img/clases-sexy-reggaeton-barcelona_1920.jpg',
  reggaetonCubano: 'classes/reggaeton-cubano/img/mgs_8884_1920.jpg',
  hipHop: 'classes/hip-hop/img/clases-hip-hop-barcelona_1920.jpg',

  // === Estilos de baile - Sexy/Femenino ===
  heelsBarcelona: 'classes/Heels/img/clases-heels-barcelona_1920.jpg',
  femmology: 'og-femmology.jpg',
  sexyStyle: 'og-sexy-style.jpg',

  // === Estilos de baile - Danza/Ballet ===
  modernJazz: 'og-modern-jazz.jpg',
  ballet: 'og-ballet.jpg',
  contemporaneo: 'classes/contemporaneo/img/mgs_5189_1920.jpg',
  afroContemporaneo: 'classes/afro-contemporaneo/img/mgs_5260_1920.jpg',
  afroJazz: 'classes/afro-jazz/img/afro-jazz_1920.jpg',

  // === Estilos de baile - Fitness/Cuerpo ===
  cuerpoFit: 'classes/cuerpo-fit/img/cuerpo-fit-entrenamiento-bailarines_1920.jpg',
  cuerpoFitPage: 'classes/cuerpo-fit/img/cuerpo-fit-entrenamiento-bailarines_1920.jpg',
  bumBum: 'og-ejercicios-gluteos-barcelona.jpg',
  stretching: 'og-stretching.jpg',
  entrenamientoBailarines: 'og-entrenamiento-bailarines.jpg',
  baileManananas: 'og-baileManananas.jpg',

  // === Servicios ===
  clasesParticulares: 'og-clasesParticulares.jpg',
  teamBuilding: 'og-classes.jpg',
  alquilerSalas: 'alquiler-salas/og.jpg',
  estudioGrabacion: 'estudio-grabacion/og.jpg',

  // === Blog - Hub y categorías ===
  blog: 'og-home.jpg',
  blogLifestyle: 'og-home.jpg',
  blogHistoria: 'og-home.jpg',
  blogTutoriales: 'og-home.jpg',
  blogTips: 'og-home.jpg',
  blogFitness: 'og-home.jpg',

  // === Blog - Artículos ===
  blogBeneficiosSalsa: 'blog/beneficios-salsa/og.jpg',
  blogClasesSalsaBarcelona: 'blog/hablemos-salsa/og.jpg',
  blogPerderMiedoBailar: 'blog/como-perder-miedo/og.jpg',
  blogHistoriaSalsa: 'blog/historia-salsa/og.jpg',
  blogHistoriaBachata: 'blog/historia-bachata/og.jpg',
  blogSalsaRitmo: 'blog/salsa-ritmo/og.jpg',
  blogSalsaVsBachata: 'blog/salsa-vs-bachata/og.jpg',
  blogClasesPrincipiantes: 'blog/clases-principiantes/og.jpg',
  blogAcademiaDanza: 'blog/academia-danza-barcelona/og.jpg',
  blogBalletAdultos: 'blog/ballet-adultos/og.jpg',
  blogDanzaContemporaneaVsJazzBallet: 'blog/danza-contemporanea-vs-jazz-ballet/og.jpg',
  blogBaileSaludMental: 'blog/beneficios-salsa/og.jpg', // Reutiliza beneficios
  blogDanzasUrbanas: 'blog/danzas-urbanas/og.jpg',
  blogModernJazz: 'blog/modern-jazz/og.jpg',

  // === Páginas legales ===
  termsConditions: 'og-home.jpg',
  legalNotice: 'og-home.jpg',
  privacyPolicy: 'og-home.jpg',
  cookiePolicy: 'og-home.jpg',

  // === Landing pages (Facebook Ads) - usan imagen del estilo ===
  dancehallLanding: 'og-dancehall.jpg',
  twerkLanding: 'classes/twerk/img/clases-twerk-barcelona_1920.jpg',
  sexyReggaetonLanding: 'classes/sexy-reggaeton/img/clases-sexy-reggaeton-barcelona_1920.jpg',
  sexyStyleLanding: 'og-sexy-style.jpg',
  hipHopReggaetonLanding: 'classes/hip-hop-reggaeton/img/clases-hip-hop-reaggaeton-barcelona_1920.jpg',
  contemporaneoLanding: 'classes/contemporaneo/img/mgs_5189_1920.jpg',
  femmologyLanding: 'og-femmologyLanding.jpg',
  bachataLanding: 'classes/Bachata/img/clases-bachata-sensual-barcelona_1920.jpg',
  hipHopLanding: 'classes/hip-hop/img/clases-hip-hop-barcelona_1920.jpg',
  afrobeatsLanding: 'og-afrobeat.jpg',
  afroJazzLanding: 'classes/afro-jazz/img/afro-jazz_1920.jpg',
  salsaCubanaLanding: 'classes/salsa-cubana/img/salsa-cubana_1920.jpg',
  balletLanding: 'og-ballet.jpg',
  afroContemporaneoLanding: 'classes/afro-contemporaneo/img/mgs_5260_1920.jpg',
  jornadaPuertasAbiertasLanding: 'og-home.jpg',

  // === Promociones ===
  promoClaseGratis: 'og-home.jpg',
  promoSexyReggaeton: 'classes/sexy-reggaeton/img/clases-sexy-reggaeton-barcelona_1920.jpg',

  // === 404 ===
  notFound: 'og-home.jpg',

  // === Y&R Project (Linktree) ===
  yrProject: 'artists/yr-project/hero.jpeg',
};

// Función helper para obtener la URL completa de la imagen OG
const getOgImageUrl = (pageKey) => {
  const imagePath = OG_IMAGE_MAP[pageKey] || 'og-home.jpg';
  return `https://www.farrayscenter.com/images/${imagePath}`;
};

// 
// AUTO-GENERATE INITIAL CONTENT FROM METADATA (SEO para LLMs)
// 
// Genera contenido HTML mínimo desde la metadata existente para que los LLMs
// que no ejecutan JavaScript puedan ver contenido básico de la página.
// Ref: ROADMAP_ENTERPRISE.md - Sección 11 (SEO para LLMs)
//
// NOTA: Este contenido será reemplazado por React al hidratar. El usuario
// no verá diferencia, pero los crawlers que no ejecutan JS verán:
// - <h1> con el título de la página
// - <p> con la descripción meta
//
// Páginas excluidas (mantienen '' vacío):
// - home: muy dinámica, contenido complejo
// - horariosPrecio: datos en tiempo real
// - landings: tienen su propio sistema (LANDING_CONTENT)
// - páginas legales: ya tienen contenido manual

const PAGES_TO_EXCLUDE_FROM_AUTO_CONTENT = [
  'home',           // Muy dinámica
  'horariosPrecio', // Datos en tiempo real
  'calendario',     // Datos dinámicos
  'reservas',       // Widget interactivo con APIs del navegador - causa hydration mismatch
  'miReserva',      // Página dinámica con datos de Redis
  'feedbackGracias', // Página de agradecimiento de feedback
  'asistenciaConfirmada', // Página de confirmación de asistencia
  'notFound',       // Ya tiene contenido
  // Páginas legales - ya tienen contenido manual
  'termsConditions',
  'legalNotice',
  'privacyPolicy',
  'cookiePolicy',
  'serviciosBaile',
];

// Map from pageKey (used in routes) to styleKey prefix (used in pages.json translation keys)
// Verified against actual translation keys in i18n/locales/*/pages.json
const STYLE_KEY_MAP = {
  bachataSensual: 'bachataV3',
  dancehall: 'dhV3',
  twerk: 'twerk',
  afrobeat: 'afro',
  hipHopReggaeton: 'hhr',
  commercial: 'commercial',
  cuerpoFit: 'cuerpofit',
  baileManananas: 'bailemanananas',
  sexyReggaeton: 'sxr',
  reggaetonCubano: 'rcb',
  femmology: 'fem',
  sexyStyle: 'sexystyle',
  modernJazz: 'modernjazz',
  ballet: 'ballet',
  salsaCubana: 'salsaCubana',
  folkloreCubano: 'folklore',
  timba: 'timba',
  salsaLadyStyle: 'salsaLady',
  bachataLadyStyle: 'bachataLady',
  afroContemporaneo: 'afrocontemporaneo',
  afroJazz: 'afrojazz',
  stretching: 'stretching',
  bumBum: 'bumbum',
  kpop: 'kpop',
  kizomba: 'kizomba',
  hipHop: 'hiphop',
  contemporaneo: 'contemporaneo',
};

// Map from blog page keys (used in routes) to blog.json translation key prefixes
// Verified against actual keys in i18n/locales/es/blog.json
const BLOG_ARTICLE_KEY_MAP = {
  blogBeneficiosSalsa: 'blogBeneficiosSalsa',
  blogHistoriaSalsa: 'blogHistoriaSalsa',
  blogClasesSalsaBarcelona: 'blogClasesSalsaBarcelona',
  blogSalsaVsBachata: 'blogSalsaVsBachata',
  blogBaileSaludMental: 'blogBaileSaludMental',
  blogHistoriaBachata: 'blogHistoriaBachata',
  blogSalsaRitmo: 'blogSalsaRitmo',
  blogAcademiaDanza: 'blogAcademiaDanza',
  blogBalletAdultos: 'blogBalletAdultos',
  blogClasesPrincipiantes: 'blogClasesPrincipiantes',
  blogPerderMiedoBailar: 'blogPerderMiedoBailar',
  blogDanzasUrbanas: 'blogDanzasUrbanas',
  blogModernJazz: 'blogModernJazz',
  blogDanzaContemporaneaVsJazzBallet: 'blog_danzaContemporaneaVsJazzBallet',
};

// Map from pageKey to FAQ translation prefix + namespace
// These are pages NOT in STYLE_KEY_MAP that have their own FAQ sections
// Used by generateFlexibleFAQSchema to generate FAQPage JSON-LD at build time
const FAQ_PAGE_MAP = {
  // Pattern A (pages.json) — ${prefix}FaqQ${i} / ${prefix}FaqA${i}
  home:                    { prefix: 'home', ns: 'pages' },
  entrenamientoBailarines: { prefix: 'prepFisica', ns: 'pages' },
  heelsBarcelona:          { prefix: 'heels', ns: 'pages' },
  danzaBarcelona:          { prefix: 'danza', ns: 'pages' },
  danzasUrbanas:           { prefix: 'urban', ns: 'pages' },
  salsaBachata:            { prefix: 'salsaBachata', ns: 'pages' },
  facilities:              { prefix: 'facilities', ns: 'pages' },
  // Pattern A (home.json)
  classes:                 { prefix: 'classes', ns: 'home' },
  // Pattern B (pages.json) — ${prefix}Q${i} / ${prefix}A${i}
  clasesParticulares:      { prefix: 'particularesPage_faq', ns: 'pages' },
  ubicacion:               { prefix: 'ubicacion_faq', ns: 'pages' },
  // Pattern C (pages.json) — ${prefix}_faq${i}_q / ${prefix}_faq${i}_a
  regalaBaile:             { prefix: 'regalaBaile', ns: 'pages' },
  estudioGrabacion:        { prefix: 'estudioGrabacion', ns: 'pages' },
  serviciosBaile:          { prefix: 'serviciosBaile', ns: 'pages' },
  alquilerSalas:           { prefix: 'roomRental', ns: 'pages' },
  preciosClases:           { prefix: 'pricing', ns: 'pages' },
  horariosPrecio:          { prefix: 'pricing', ns: 'pages' },
  // Pattern C (schedule.json)
  horariosClases:          { prefix: 'horariosV2', ns: 'schedule' },
  // Pattern D (pages.json) — ${prefix}_faq${i}_question / ${prefix}_faq${i}_answer
  teamBuilding:            { prefix: 'teamBuilding', ns: 'pages' },
};

/**
 * Converts basic Markdown formatting to HTML.
 * Handles: **bold**, *italic*, [links](url), paragraph breaks.
 */
const mdToHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, ' ');
};

/**
 * Generates rich HTML content for blog article pages using blog.json translations.
 * Extracts: title, summary bullets, intro, content sections (benefit/section patterns),
 * FAQ, and conclusion. Much richer than the fallback H1+description.
 *
 * @param {string} pageKey - Route page key (e.g., 'blogBeneficiosSalsa')
 * @param {string} lang - Language code (es, ca, en, fr)
 * @returns {string} Rich semantic HTML or '' if not a blog article
 */
const generateRichBlogContent = (pageKey, lang) => {
  const articleKey = BLOG_ARTICLE_KEY_MAP[pageKey];
  if (!articleKey) return '';

  const t = blogTranslations[lang];
  if (!t) return '';

  const get = (key) => t[key] || '';
  const sections = [];

  // 1. Title + summary bullets
  const title = get(`${articleKey}_title`);
  if (!title) return '';

  let headerHtml = `<h1>${title}</h1>`;
  const summaryBullets = [];
  for (let i = 1; i <= 5; i++) {
    const bullet = get(`${articleKey}_summaryBullet${i}`);
    if (bullet) summaryBullets.push(bullet);
  }
  if (summaryBullets.length > 0) {
    headerHtml += `<ul id="article-summary">${summaryBullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
  }
  sections.push(`<header>${headerHtml}</header>`);

  // 2. Intro paragraph(s)
  const intro = get(`${articleKey}_intro`);
  if (intro) {
    let introHtml = `<p>${mdToHtml(intro)}</p>`;
    const intro2 = get(`${articleKey}_intro2`);
    if (intro2) introHtml += `<p>${mdToHtml(intro2)}</p>`;
    const introFarrays = get(`${articleKey}_introFarrays`);
    if (introFarrays) introHtml += `<p>${mdToHtml(introFarrays)}</p>`;
    sections.push(`<section id="intro">${introHtml}</section>`);
  }

  // 3. Content sections — try benefit{N} pattern, then section{N} pattern
  const contentParts = [];

  // benefit{N}Title / benefit{N}Content (e.g., blogBeneficiosSalsa)
  for (let i = 1; i <= 15; i++) {
    const bTitle = get(`${articleKey}_benefit${i}Title`);
    if (bTitle) {
      let html = `<h2>${bTitle}</h2>`;
      const bContent = get(`${articleKey}_benefit${i}Content`);
      if (bContent) html += `<p>${mdToHtml(bContent)}</p>`;
      contentParts.push(html);
    }
  }

  // section{N}Title / section{N}Content (e.g., blogDanzasUrbanas, blogModernJazz)
  if (contentParts.length === 0) {
    for (let i = 1; i <= 10; i++) {
      const sTitle = get(`${articleKey}_section${i}Title`);
      if (sTitle) {
        let html = `<h2>${sTitle}</h2>`;
        const sIntro = get(`${articleKey}_section${i}Intro`);
        if (sIntro) html += `<p>${mdToHtml(sIntro)}</p>`;
        const sContent = get(`${articleKey}_section${i}Content`);
        if (sContent) {
          html += `<p>${mdToHtml(sContent)}</p>`;
        } else {
          for (let j = 1; j <= 4; j++) {
            const sub = get(`${articleKey}_section${i}Content${j}`);
            if (sub) html += `<p>${mdToHtml(sub)}</p>`;
          }
        }
        contentParts.push(html);
      }
    }
  }

  if (contentParts.length > 0) {
    sections.push(`<section id="content">${contentParts.join('')}</section>`);
  }

  // 4. FAQ section (all articles have this)
  let faqHtml = '';
  let faqCount = 0;
  for (let i = 1; i <= 10; i++) {
    const q = get(`${articleKey}_faq${i}Question`);
    const a = get(`${articleKey}_faq${i}Answer`);
    if (q && a) {
      faqHtml += `<details><summary>${mdToHtml(q)}</summary><p>${mdToHtml(a)}</p></details>`;
      faqCount++;
    }
  }
  if (faqCount > 0) {
    const faqTitle = get(`${articleKey}_faqTitle`) || 'FAQ';
    sections.push(`<section id="faq"><h2>${faqTitle}</h2>${faqHtml}</section>`);
  }

  // 5. Conclusion
  const conclusionTitle = get(`${articleKey}_conclusionTitle`) || get(`${articleKey}_conclusionHeading`);
  if (conclusionTitle) {
    let concHtml = `<h2>${conclusionTitle}</h2>`;
    const conclusionContent = get(`${articleKey}_conclusionContent`);
    if (conclusionContent) concHtml += `<p>${mdToHtml(conclusionContent)}</p>`;
    const conclusionCTA = get(`${articleKey}_conclusionCTA`);
    if (conclusionCTA) concHtml += `<p>${mdToHtml(conclusionCTA)}</p>`;
    sections.push(`<section id="conclusion">${concHtml}</section>`);
  }

  if (sections.length <= 1) return ''; // Only header, no real content

  return `<article id="main-content">${sections.join('')}</article>`;
};

/**
 * Generates rich HTML content for class pages using pages.json translations.
 * This content is seen by crawlers (Google first-wave, AI bots like GPTBot, ClaudeBot).
 * React silently replaces it during hydration fallback - no risk of mismatch.
 *
 * @param {string} pageKey - Route page key (e.g., 'dancehall')
 * @param {string} lang - Language code (es, ca, en, fr)
 * @returns {string} Rich semantic HTML or '' if no translations found
 */
const generateRichClassContent = (pageKey, lang) => {
  const styleKey = STYLE_KEY_MAP[pageKey];
  if (!styleKey) return '';

  const t = pagesTranslations[lang];
  if (!t) return '';

  const get = (key) => t[key] || '';

  const sections = [];

  // Hero section - H1 title + subtitle + description
  const heroTitle = get(`${styleKey}HeroTitle`);
  if (!heroTitle) return ''; // No title means no translations for this style

  const heroSubtitle = get(`${styleKey}HeroSubtitle`);
  const heroDesc = get(`${styleKey}HeroDesc`);

  let heroHtml = `<h1>${heroTitle}</h1>`;
  if (heroSubtitle) heroHtml += `<p><strong>${heroSubtitle}</strong></p>`;
  if (heroDesc) heroHtml += `<p>${heroDesc}</p>`;
  sections.push(`<header id="hero">${heroHtml}</header>`);

  // "What is" section - educational content (critical for E-E-A-T)
  const whatIsTitle = get(`${styleKey}WhatIsTitle`);
  if (whatIsTitle) {
    let whatIsHtml = `<h2>${whatIsTitle}</h2>`;
    // Most styles use P1-P4 paragraphs
    let hasP = false;
    for (let i = 1; i <= 4; i++) {
      const p = get(`${styleKey}WhatIsP${i}`);
      if (p) { whatIsHtml += `<p>${p}</p>`; hasP = true; }
    }
    // Some styles use WhatIsDesc instead of P1-P4
    if (!hasP) {
      const desc = get(`${styleKey}WhatIsDesc`);
      if (desc) whatIsHtml += `<p>${desc}</p>`;
    }
    sections.push(`<section id="what-is">${whatIsHtml}</section>`);
  }

  // Teachers section
  const teachersTitle = get(`${styleKey}TeachersTitle`);
  if (teachersTitle) {
    let teachersHtml = `<h2>${teachersTitle}</h2>`;
    const teachersSubtitle = get(`${styleKey}TeachersSubtitle`);
    if (teachersSubtitle) teachersHtml += `<p>${teachersSubtitle}</p>`;
    const teachersClosing = get(`${styleKey}TeachersClosing`);
    if (teachersClosing) teachersHtml += `<p>${teachersClosing}</p>`;
    sections.push(`<section id="teachers">${teachersHtml}</section>`);
  }

  // FAQ section - up to 15 Q&A pairs (structured for featured snippets)
  const faqTitle = get(`${styleKey}FaqTitle`);
  if (faqTitle) {
    let faqHtml = `<h2>${faqTitle}</h2>`;
    let faqCount = 0;
    for (let i = 1; i <= 15; i++) {
      const q = get(`${styleKey}FaqQ${i}`);
      const a = get(`${styleKey}FaqA${i}`);
      if (q && a) {
        faqHtml += `<details><summary>${q}</summary><p>${a}</p></details>`;
        faqCount++;
      }
    }
    if (faqCount > 0) {
      sections.push(`<section id="faq">${faqHtml}</section>`);
    }
  }

  if (sections.length === 0) return '';

  return `<main id="main-content">${sections.join('')}</main>`;
};

/**
 * Genera HTML simple desde la metadata de una página.
 * @param {string} pageKey - Clave de la página (ej: 'dancehall')
 * @param {string} lang - Idioma (es, ca, en, fr)
 * @param {object} allMetadata - Objeto con toda la metadata por idioma
 * @returns {string} HTML string o '' si debe excluirse
 */
const generateContentFromMetadata = (pageKey, lang, allMetadata) => {
  // Si está en la lista de exclusión, retornar vacío
  if (PAGES_TO_EXCLUDE_FROM_AUTO_CONTENT.includes(pageKey)) {
    return '';
  }

  // Try rich content first (class pages with pages.json translations)
  const richContent = generateRichClassContent(pageKey, lang);
  if (richContent) return richContent;

  // Try rich blog content (blog articles with blog.json translations)
  const blogContent = generateRichBlogContent(pageKey, lang);
  if (blogContent) return blogContent;

  // Fallback: simple H1 + description for non-class pages
  const meta = allMetadata[lang]?.[pageKey];
  if (!meta || !meta.title || !meta.description) {
    return '';
  }

  // Extraer título limpio (quitar "| Farray's Center" y similares)
  const cleanTitle = meta.title.split('|')[0].trim();

  // Generar HTML simple y semántico
  return `<main id="main-content"><h1>${cleanTitle}</h1><p>${meta.description}</p></main>`;
};

// 

// All language/page combinations to prerender
const routes = [
  { path: '', lang: 'es', page: 'home' },
  { path: 'es', lang: 'es', page: 'home' },
  // YR Project (Linktree-style, no locale)
  { path: 'yr-project', lang: 'es', page: 'yrProject' },
  { path: 'es/clases', lang: 'es', page: 'classesHub' },
  { path: 'es/horarios-precios', lang: 'es', page: 'horariosPrecio' },
  { path: 'es/clases/baile-barcelona', lang: 'es', page: 'classes' },
  { path: 'es/clases/danza-barcelona', lang: 'es', page: 'danza' },
  { path: 'es/clases/salsa-bachata-barcelona', lang: 'es', page: 'salsaBachata' },
  { path: 'es/clases/bachata-barcelona', lang: 'es', page: 'bachataSensual' },
  { path: 'es/clases/salsa-cubana-barcelona', lang: 'es', page: 'salsaCubana' },
  { path: 'es/clases/salsa-lady-style-barcelona', lang: 'es', page: 'salsaLadyStyle' },
  { path: 'es/clases/folklore-cubano', lang: 'es', page: 'folkloreCubano' },
  { path: 'es/clases/timba-barcelona', lang: 'es', page: 'timba' },
  { path: 'es/clases/danzas-urbanas-barcelona', lang: 'es', page: 'danzasUrbanas' },
  { path: 'es/clases/dancehall-barcelona', lang: 'es', page: 'dancehall' },
  { path: 'es/clases/twerk-barcelona', lang: 'es', page: 'twerk' },
  { path: 'es/clases/afrobeats-barcelona', lang: 'es', page: 'afrobeat' },
  { path: 'es/clases/kpop-dance-barcelona', lang: 'es', page: 'kpop' },
  { path: 'es/clases/commercial-dance-barcelona', lang: 'es', page: 'commercial' },
  { path: 'es/clases/kizomba-barcelona', lang: 'es', page: 'kizomba' },
  { path: 'es/clases/hip-hop-reggaeton-barcelona', lang: 'es', page: 'hipHopReggaeton' },
  { path: 'es/clases/sexy-reggaeton-barcelona', lang: 'es', page: 'sexyReggaeton' },
  { path: 'es/clases/reggaeton-cubano-barcelona', lang: 'es', page: 'reggaetonCubano' },
  { path: 'es/clases/heels-barcelona', lang: 'es', page: 'heelsBarcelona' },
  { path: 'es/clases/femmology', lang: 'es', page: 'femmology' },
  { path: 'es/clases/sexy-style-barcelona', lang: 'es', page: 'sexyStyle' },
  { path: 'es/clases/modern-jazz-barcelona', lang: 'es', page: 'modernJazz' },
  { path: 'es/clases/ballet-barcelona', lang: 'es', page: 'ballet' },
  { path: 'es/clases/cuerpo-fit', lang: 'es', page: 'cuerpoFit' },
  { path: 'es/clases/baile-mananas', lang: 'es', page: 'baileManananas' },
  { path: 'es/clases-particulares-baile', lang: 'es', page: 'clasesParticulares' },
  { path: 'es/team-building-barcelona', lang: 'es', page: 'teamBuilding' },
  { path: 'es/sobre-nosotros', lang: 'es', page: 'about' },
  { path: 'es/yunaisy-farray', lang: 'es', page: 'yunaisy' },
  { path: 'es/metodo-farray', lang: 'es', page: 'metodoFarray' },
  { path: 'es/merchandising', lang: 'es', page: 'merchandising' },
  { path: 'es/regala-baile', lang: 'es', page: 'regalaBaile' },
  { path: 'es/contacto', lang: 'es', page: 'contact' },
  { path: 'es/reservas', lang: 'es', page: 'reservas' },

  { path: 'es/hazte-socio', lang: 'es', page: 'hazteSocio' },

  // Y&R Project - Linktree-style artist page (no locale prefix for short URL)
  { path: 'yr-project', lang: 'es', page: 'yrProject' },

  { path: 'es/mi-reserva', lang: 'es', page: 'miReserva' },
  { path: 'es/fichaje', lang: 'es', page: 'fichaje' },
  { path: 'es/fichaje/resumen', lang: 'es', page: 'fichajeResumen' },
  { path: 'es/admin/fichajes', lang: 'es', page: 'adminFichajes' },
  { path: 'es/admin/reservas', lang: 'es', page: 'adminReservas' },
  { path: 'es/feedback-gracias', lang: 'es', page: 'feedbackGracias' },
  { path: 'es/feedback-comentario', lang: 'es', page: 'feedbackComentario' },
  { path: 'es/asistencia-confirmada', lang: 'es', page: 'asistenciaConfirmada' },

  // Missing class pages
  { path: 'es/clases/afro-contemporaneo-barcelona', lang: 'es', page: 'afroContemporaneo' },
  { path: 'es/clases/afro-jazz', lang: 'es', page: 'afroJazz' },
  { path: 'es/clases/contemporaneo-barcelona', lang: 'es', page: 'contemporaneo' },
  { path: 'es/clases/stretching-barcelona', lang: 'es', page: 'stretching' },
  { path: 'es/clases/hip-hop-barcelona', lang: 'es', page: 'hipHop' },
  { path: 'es/clases/entrenamiento-bailarines-barcelona', lang: 'es', page: 'entrenamientoBailarines' },
  { path: 'es/clases/bachata-lady-style-barcelona', lang: 'es', page: 'bachataLadyStyle' },
  { path: 'es/clases/ejercicios-gluteos-barcelona', lang: 'es', page: 'bumBum' },
  { path: 'es/clases/acondicionamiento-fisico-bailarines', lang: 'es', page: 'cuerpoFitPage' },
  // Missing non-class pages
  { path: 'es/profesores-baile-barcelona', lang: 'es', page: 'profesores' },
  { path: 'es/preguntas-frecuentes', lang: 'es', page: 'faq' },
  { path: 'es/alquiler-salas-baile-barcelona', lang: 'es', page: 'alquilerSalas' },
  { path: 'es/estudio-grabacion-barcelona', lang: 'es', page: 'estudioGrabacion' },
  // Legal pages
  { path: 'es/terminos-y-condiciones', lang: 'es', page: 'termsConditions' },
  { path: 'es/aviso-legal', lang: 'es', page: 'legalNotice' },
  { path: 'es/politica-privacidad', lang: 'es', page: 'privacyPolicy' },
  { path: 'es/politica-cookies', lang: 'es', page: 'cookiePolicy' },
  // Additional pages
  { path: 'es/servicios-baile-barcelona', lang: 'es', page: 'serviciosBaile' },
  { path: 'es/como-llegar-escuela-baile-barcelona', lang: 'es', page: 'ubicacion' },
  { path: 'es/calendario', lang: 'es', page: 'calendario' },
  // URL aliases (same content, different URL for SEO)
  { path: 'es/instalaciones-escuela-baile-barcelona', lang: 'es', page: 'facilities' },
  { path: 'es/horarios-clases-baile-barcelona', lang: 'es', page: 'horariosClases' },
  { path: 'es/precios-clases-baile-barcelona', lang: 'es', page: 'preciosClases' },
  // 404 page
  { path: 'es/404', lang: 'es', page: 'notFound' },

  { path: 'ca', lang: 'ca', page: 'home' },
  { path: 'ca/clases', lang: 'ca', page: 'classesHub' },
  { path: 'ca/horarios-precios', lang: 'ca', page: 'horariosPrecio' },
  { path: 'ca/clases/baile-barcelona', lang: 'ca', page: 'classes' },
  { path: 'ca/clases/danza-barcelona', lang: 'ca', page: 'danza' },
  { path: 'ca/clases/salsa-bachata-barcelona', lang: 'ca', page: 'salsaBachata' },
  { path: 'ca/clases/bachata-barcelona', lang: 'ca', page: 'bachataSensual' },
  { path: 'ca/clases/salsa-cubana-barcelona', lang: 'ca', page: 'salsaCubana' },
  { path: 'ca/clases/salsa-lady-style-barcelona', lang: 'ca', page: 'salsaLadyStyle' },
  { path: 'ca/clases/folklore-cubano', lang: 'ca', page: 'folkloreCubano' },
  { path: 'ca/clases/timba-barcelona', lang: 'ca', page: 'timba' },
  { path: 'ca/clases/danzas-urbanas-barcelona', lang: 'ca', page: 'danzasUrbanas' },
  { path: 'ca/clases/dancehall-barcelona', lang: 'ca', page: 'dancehall' },
  { path: 'ca/clases/twerk-barcelona', lang: 'ca', page: 'twerk' },
  { path: 'ca/clases/afrobeats-barcelona', lang: 'ca', page: 'afrobeat' },
  { path: 'ca/clases/kpop-dance-barcelona', lang: 'ca', page: 'kpop' },
  { path: 'ca/clases/commercial-dance-barcelona', lang: 'ca', page: 'commercial' },
  { path: 'ca/clases/kizomba-barcelona', lang: 'ca', page: 'kizomba' },
  { path: 'ca/clases/hip-hop-reggaeton-barcelona', lang: 'ca', page: 'hipHopReggaeton' },
  { path: 'ca/clases/sexy-reggaeton-barcelona', lang: 'ca', page: 'sexyReggaeton' },
  { path: 'ca/clases/reggaeton-cubano-barcelona', lang: 'ca', page: 'reggaetonCubano' },
  { path: 'ca/clases/heels-barcelona', lang: 'ca', page: 'heelsBarcelona' },
  { path: 'ca/clases/femmology', lang: 'ca', page: 'femmology' },
  { path: 'ca/clases/sexy-style-barcelona', lang: 'ca', page: 'sexyStyle' },
  { path: 'ca/clases/modern-jazz-barcelona', lang: 'ca', page: 'modernJazz' },
  { path: 'ca/clases/ballet-barcelona', lang: 'ca', page: 'ballet' },
  { path: 'ca/clases/cuerpo-fit', lang: 'ca', page: 'cuerpoFit' },
  { path: 'ca/clases/baile-mananas', lang: 'ca', page: 'baileManananas' },
  { path: 'ca/clases-particulares-baile', lang: 'ca', page: 'clasesParticulares' },
  { path: 'ca/team-building-barcelona', lang: 'ca', page: 'teamBuilding' },
  { path: 'ca/sobre-nosotros', lang: 'ca', page: 'about' },
  { path: 'ca/yunaisy-farray', lang: 'ca', page: 'yunaisy' },
  { path: 'ca/metodo-farray', lang: 'ca', page: 'metodoFarray' },
  { path: 'ca/merchandising', lang: 'ca', page: 'merchandising' },
  { path: 'ca/regala-baile', lang: 'ca', page: 'regalaBaile' },
  { path: 'ca/contacto', lang: 'ca', page: 'contact' },
  { path: 'ca/reservas', lang: 'ca', page: 'reservas' },

  { path: 'ca/hazte-socio', lang: 'ca', page: 'hazteSocio' },

  { path: 'ca/mi-reserva', lang: 'ca', page: 'miReserva' },
  { path: 'ca/fichaje', lang: 'ca', page: 'fichaje' },
  { path: 'ca/fichaje/resumen', lang: 'ca', page: 'fichajeResumen' },
  { path: 'ca/admin/fichajes', lang: 'ca', page: 'adminFichajes' },
  { path: 'ca/admin/reservas', lang: 'ca', page: 'adminReservas' },
  { path: 'ca/feedback-gracias', lang: 'ca', page: 'feedbackGracias' },
  { path: 'ca/feedback-comentario', lang: 'ca', page: 'feedbackComentario' },
  { path: 'ca/asistencia-confirmada', lang: 'ca', page: 'asistenciaConfirmada' },

  // Missing class pages
  { path: 'ca/clases/afro-contemporaneo-barcelona', lang: 'ca', page: 'afroContemporaneo' },
  { path: 'ca/clases/afro-jazz', lang: 'ca', page: 'afroJazz' },
  { path: 'ca/clases/contemporaneo-barcelona', lang: 'ca', page: 'contemporaneo' },
  { path: 'ca/clases/stretching-barcelona', lang: 'ca', page: 'stretching' },
  { path: 'ca/clases/hip-hop-barcelona', lang: 'ca', page: 'hipHop' },
  { path: 'ca/clases/entrenamiento-bailarines-barcelona', lang: 'ca', page: 'entrenamientoBailarines' },
  { path: 'ca/clases/bachata-lady-style-barcelona', lang: 'ca', page: 'bachataLadyStyle' },
  { path: 'ca/clases/ejercicios-gluteos-barcelona', lang: 'ca', page: 'bumBum' },
  { path: 'ca/clases/acondicionamiento-fisico-bailarines', lang: 'ca', page: 'cuerpoFitPage' },
  // Missing non-class pages
  { path: 'ca/profesores-baile-barcelona', lang: 'ca', page: 'profesores' },
  { path: 'ca/preguntas-frecuentes', lang: 'ca', page: 'faq' },
  { path: 'ca/alquiler-salas-baile-barcelona', lang: 'ca', page: 'alquilerSalas' },
  { path: 'ca/estudio-grabacion-barcelona', lang: 'ca', page: 'estudioGrabacion' },
  // Legal pages
  { path: 'ca/terminos-y-condiciones', lang: 'ca', page: 'termsConditions' },
  { path: 'ca/aviso-legal', lang: 'ca', page: 'legalNotice' },
  { path: 'ca/politica-privacidad', lang: 'ca', page: 'privacyPolicy' },
  { path: 'ca/politica-cookies', lang: 'ca', page: 'cookiePolicy' },
  // Additional pages
  { path: 'ca/servicios-baile-barcelona', lang: 'ca', page: 'serviciosBaile' },
  { path: 'ca/como-llegar-escuela-baile-barcelona', lang: 'ca', page: 'ubicacion' },
  { path: 'ca/calendario', lang: 'ca', page: 'calendario' },
  // URL aliases (same content, different URL for SEO)
  { path: 'ca/instalaciones-escuela-baile-barcelona', lang: 'ca', page: 'facilities' },
  { path: 'ca/horarios-clases-baile-barcelona', lang: 'ca', page: 'horariosClases' },
  { path: 'ca/precios-clases-baile-barcelona', lang: 'ca', page: 'preciosClases' },
  // 404 page
  { path: 'ca/404', lang: 'ca', page: 'notFound' },

  { path: 'en', lang: 'en', page: 'home' },
  { path: 'en/clases', lang: 'en', page: 'classesHub' },
  { path: 'en/horarios-precios', lang: 'en', page: 'horariosPrecio' },
  { path: 'en/clases/baile-barcelona', lang: 'en', page: 'classes' },
  { path: 'en/clases/danza-barcelona', lang: 'en', page: 'danza' },
  { path: 'en/clases/salsa-bachata-barcelona', lang: 'en', page: 'salsaBachata' },
  { path: 'en/clases/bachata-barcelona', lang: 'en', page: 'bachataSensual' },
  { path: 'en/clases/salsa-cubana-barcelona', lang: 'en', page: 'salsaCubana' },
  { path: 'en/clases/salsa-lady-style-barcelona', lang: 'en', page: 'salsaLadyStyle' },
  { path: 'en/clases/folklore-cubano', lang: 'en', page: 'folkloreCubano' },
  { path: 'en/clases/timba-barcelona', lang: 'en', page: 'timba' },
  { path: 'en/clases/danzas-urbanas-barcelona', lang: 'en', page: 'danzasUrbanas' },
  { path: 'en/clases/dancehall-barcelona', lang: 'en', page: 'dancehall' },
  { path: 'en/clases/twerk-barcelona', lang: 'en', page: 'twerk' },
  { path: 'en/clases/afrobeats-barcelona', lang: 'en', page: 'afrobeat' },
  { path: 'en/clases/kpop-dance-barcelona', lang: 'en', page: 'kpop' },
  { path: 'en/clases/commercial-dance-barcelona', lang: 'en', page: 'commercial' },
  { path: 'en/clases/kizomba-barcelona', lang: 'en', page: 'kizomba' },
  { path: 'en/clases/hip-hop-reggaeton-barcelona', lang: 'en', page: 'hipHopReggaeton' },
  { path: 'en/clases/sexy-reggaeton-barcelona', lang: 'en', page: 'sexyReggaeton' },
  { path: 'en/clases/reggaeton-cubano-barcelona', lang: 'en', page: 'reggaetonCubano' },
  { path: 'en/clases/heels-barcelona', lang: 'en', page: 'heelsBarcelona' },
  { path: 'en/clases/femmology', lang: 'en', page: 'femmology' },
  { path: 'en/clases/sexy-style-barcelona', lang: 'en', page: 'sexyStyle' },
  { path: 'en/clases/modern-jazz-barcelona', lang: 'en', page: 'modernJazz' },
  { path: 'en/clases/ballet-barcelona', lang: 'en', page: 'ballet' },
  { path: 'en/clases/cuerpo-fit', lang: 'en', page: 'cuerpoFit' },
  { path: 'en/clases/baile-mananas', lang: 'en', page: 'baileManananas' },
  { path: 'en/clases-particulares-baile', lang: 'en', page: 'clasesParticulares' },
  { path: 'en/team-building-barcelona', lang: 'en', page: 'teamBuilding' },
  { path: 'en/sobre-nosotros', lang: 'en', page: 'about' },
  { path: 'en/yunaisy-farray', lang: 'en', page: 'yunaisy' },
  { path: 'en/metodo-farray', lang: 'en', page: 'metodoFarray' },
  { path: 'en/merchandising', lang: 'en', page: 'merchandising' },
  { path: 'en/regala-baile', lang: 'en', page: 'regalaBaile' },
  { path: 'en/contacto', lang: 'en', page: 'contact' },
  { path: 'en/reservas', lang: 'en', page: 'reservas' },

  { path: 'en/hazte-socio', lang: 'en', page: 'hazteSocio' },

  { path: 'en/mi-reserva', lang: 'en', page: 'miReserva' },
  { path: 'en/fichaje', lang: 'en', page: 'fichaje' },
  { path: 'en/fichaje/resumen', lang: 'en', page: 'fichajeResumen' },
  { path: 'en/admin/fichajes', lang: 'en', page: 'adminFichajes' },
  { path: 'en/admin/reservas', lang: 'en', page: 'adminReservas' },
  { path: 'en/feedback-gracias', lang: 'en', page: 'feedbackGracias' },
  { path: 'en/feedback-comentario', lang: 'en', page: 'feedbackComentario' },
  { path: 'en/asistencia-confirmada', lang: 'en', page: 'asistenciaConfirmada' },

  // Missing class pages
  { path: 'en/clases/afro-contemporaneo-barcelona', lang: 'en', page: 'afroContemporaneo' },
  { path: 'en/clases/afro-jazz', lang: 'en', page: 'afroJazz' },
  { path: 'en/clases/contemporaneo-barcelona', lang: 'en', page: 'contemporaneo' },
  { path: 'en/clases/stretching-barcelona', lang: 'en', page: 'stretching' },
  { path: 'en/clases/hip-hop-barcelona', lang: 'en', page: 'hipHop' },
  { path: 'en/clases/entrenamiento-bailarines-barcelona', lang: 'en', page: 'entrenamientoBailarines' },
  { path: 'en/clases/bachata-lady-style-barcelona', lang: 'en', page: 'bachataLadyStyle' },
  { path: 'en/clases/ejercicios-gluteos-barcelona', lang: 'en', page: 'bumBum' },
  { path: 'en/clases/acondicionamiento-fisico-bailarines', lang: 'en', page: 'cuerpoFitPage' },
  // Missing non-class pages
  { path: 'en/profesores-baile-barcelona', lang: 'en', page: 'profesores' },
  { path: 'en/preguntas-frecuentes', lang: 'en', page: 'faq' },
  { path: 'en/alquiler-salas-baile-barcelona', lang: 'en', page: 'alquilerSalas' },
  { path: 'en/estudio-grabacion-barcelona', lang: 'en', page: 'estudioGrabacion' },
  // Legal pages
  { path: 'en/terminos-y-condiciones', lang: 'en', page: 'termsConditions' },
  { path: 'en/aviso-legal', lang: 'en', page: 'legalNotice' },
  { path: 'en/politica-privacidad', lang: 'en', page: 'privacyPolicy' },
  { path: 'en/politica-cookies', lang: 'en', page: 'cookiePolicy' },
  // Additional pages
  { path: 'en/servicios-baile-barcelona', lang: 'en', page: 'serviciosBaile' },
  { path: 'en/como-llegar-escuela-baile-barcelona', lang: 'en', page: 'ubicacion' },
  { path: 'en/calendario', lang: 'en', page: 'calendario' },
  // URL aliases (same content, different URL for SEO)
  { path: 'en/instalaciones-escuela-baile-barcelona', lang: 'en', page: 'facilities' },
  { path: 'en/horarios-clases-baile-barcelona', lang: 'en', page: 'horariosClases' },
  { path: 'en/precios-clases-baile-barcelona', lang: 'en', page: 'preciosClases' },
  // 404 page
  { path: 'en/404', lang: 'en', page: 'notFound' },

  { path: 'fr', lang: 'fr', page: 'home' },
  { path: 'fr/clases', lang: 'fr', page: 'classesHub' },
  { path: 'fr/horarios-precios', lang: 'fr', page: 'horariosPrecio' },
  { path: 'fr/clases/baile-barcelona', lang: 'fr', page: 'classes' },
  { path: 'fr/clases/danza-barcelona', lang: 'fr', page: 'danza' },
  { path: 'fr/clases/salsa-bachata-barcelona', lang: 'fr', page: 'salsaBachata' },
  { path: 'fr/clases/bachata-barcelona', lang: 'fr', page: 'bachataSensual' },
  { path: 'fr/clases/salsa-cubana-barcelona', lang: 'fr', page: 'salsaCubana' },
  { path: 'fr/clases/salsa-lady-style-barcelona', lang: 'fr', page: 'salsaLadyStyle' },
  { path: 'fr/clases/folklore-cubano', lang: 'fr', page: 'folkloreCubano' },
  { path: 'fr/clases/timba-barcelona', lang: 'fr', page: 'timba' },
  { path: 'fr/clases/danzas-urbanas-barcelona', lang: 'fr', page: 'danzasUrbanas' },
  { path: 'fr/clases/dancehall-barcelona', lang: 'fr', page: 'dancehall' },
  { path: 'fr/clases/twerk-barcelona', lang: 'fr', page: 'twerk' },
  { path: 'fr/clases/afrobeats-barcelona', lang: 'fr', page: 'afrobeat' },
  { path: 'fr/clases/kpop-dance-barcelona', lang: 'fr', page: 'kpop' },
  { path: 'fr/clases/commercial-dance-barcelona', lang: 'fr', page: 'commercial' },
  { path: 'fr/clases/kizomba-barcelona', lang: 'fr', page: 'kizomba' },
  { path: 'fr/clases/hip-hop-reggaeton-barcelona', lang: 'fr', page: 'hipHopReggaeton' },
  { path: 'fr/clases/sexy-reggaeton-barcelona', lang: 'fr', page: 'sexyReggaeton' },
  { path: 'fr/clases/reggaeton-cubano-barcelona', lang: 'fr', page: 'reggaetonCubano' },
  { path: 'fr/clases/heels-barcelona', lang: 'fr', page: 'heelsBarcelona' },
  { path: 'fr/clases/femmology', lang: 'fr', page: 'femmology' },
  { path: 'fr/clases/sexy-style-barcelona', lang: 'fr', page: 'sexyStyle' },
  { path: 'fr/clases/modern-jazz-barcelona', lang: 'fr', page: 'modernJazz' },
  { path: 'fr/clases/ballet-barcelona', lang: 'fr', page: 'ballet' },
  { path: 'fr/clases/cuerpo-fit', lang: 'fr', page: 'cuerpoFit' },
  { path: 'fr/clases/baile-mananas', lang: 'fr', page: 'baileManananas' },
  { path: 'fr/clases-particulares-baile', lang: 'fr', page: 'clasesParticulares' },
  { path: 'fr/team-building-barcelona', lang: 'fr', page: 'teamBuilding' },
  { path: 'fr/sobre-nosotros', lang: 'fr', page: 'about' },
  { path: 'fr/yunaisy-farray', lang: 'fr', page: 'yunaisy' },
  { path: 'fr/metodo-farray', lang: 'fr', page: 'metodoFarray' },
  { path: 'fr/merchandising', lang: 'fr', page: 'merchandising' },
  { path: 'fr/regala-baile', lang: 'fr', page: 'regalaBaile' },
  { path: 'fr/contacto', lang: 'fr', page: 'contact' },
  { path: 'fr/reservas', lang: 'fr', page: 'reservas' },

  { path: 'fr/hazte-socio', lang: 'fr', page: 'hazteSocio' },

  { path: 'fr/mi-reserva', lang: 'fr', page: 'miReserva' },
  { path: 'fr/fichaje', lang: 'fr', page: 'fichaje' },
  { path: 'fr/fichaje/resumen', lang: 'fr', page: 'fichajeResumen' },
  { path: 'fr/admin/fichajes', lang: 'fr', page: 'adminFichajes' },
  { path: 'fr/admin/reservas', lang: 'fr', page: 'adminReservas' },
  { path: 'fr/feedback-gracias', lang: 'fr', page: 'feedbackGracias' },
  { path: 'fr/feedback-comentario', lang: 'fr', page: 'feedbackComentario' },
  { path: 'fr/asistencia-confirmada', lang: 'fr', page: 'asistenciaConfirmada' },

  // Missing class pages
  { path: 'fr/clases/afro-contemporaneo-barcelona', lang: 'fr', page: 'afroContemporaneo' },
  { path: 'fr/clases/afro-jazz', lang: 'fr', page: 'afroJazz' },
  { path: 'fr/clases/contemporaneo-barcelona', lang: 'fr', page: 'contemporaneo' },
  { path: 'fr/clases/stretching-barcelona', lang: 'fr', page: 'stretching' },
  { path: 'fr/clases/hip-hop-barcelona', lang: 'fr', page: 'hipHop' },
  { path: 'fr/clases/entrenamiento-bailarines-barcelona', lang: 'fr', page: 'entrenamientoBailarines' },
  { path: 'fr/clases/bachata-lady-style-barcelona', lang: 'fr', page: 'bachataLadyStyle' },
  { path: 'fr/clases/ejercicios-gluteos-barcelona', lang: 'fr', page: 'bumBum' },
  { path: 'fr/clases/acondicionamiento-fisico-bailarines', lang: 'fr', page: 'cuerpoFitPage' },
  // Missing non-class pages
  { path: 'fr/profesores-baile-barcelona', lang: 'fr', page: 'profesores' },
  { path: 'fr/preguntas-frecuentes', lang: 'fr', page: 'faq' },
  { path: 'fr/alquiler-salas-baile-barcelona', lang: 'fr', page: 'alquilerSalas' },
  { path: 'fr/estudio-grabacion-barcelona', lang: 'fr', page: 'estudioGrabacion' },
  // Legal pages
  { path: 'fr/terminos-y-condiciones', lang: 'fr', page: 'termsConditions' },
  { path: 'fr/aviso-legal', lang: 'fr', page: 'legalNotice' },
  { path: 'fr/politica-privacidad', lang: 'fr', page: 'privacyPolicy' },
  { path: 'fr/politica-cookies', lang: 'fr', page: 'cookiePolicy' },
  // Additional pages
  { path: 'fr/servicios-baile-barcelona', lang: 'fr', page: 'serviciosBaile' },
  { path: 'fr/como-llegar-escuela-baile-barcelona', lang: 'fr', page: 'ubicacion' },
  { path: 'fr/calendario', lang: 'fr', page: 'calendario' },
  // URL aliases (same content, different URL for SEO)
  { path: 'fr/instalaciones-escuela-baile-barcelona', lang: 'fr', page: 'facilities' },
  { path: 'fr/horarios-clases-baile-barcelona', lang: 'fr', page: 'horariosClases' },
  { path: 'fr/precios-clases-baile-barcelona', lang: 'fr', page: 'preciosClases' },
  // 404 page
  { path: 'fr/404', lang: 'fr', page: 'notFound' },

  // Blog routes
  { path: 'es/blog', lang: 'es', page: 'blog' },
  { path: 'es/blog/lifestyle', lang: 'es', page: 'blogLifestyle' },
  { path: 'es/blog/lifestyle/beneficios-bailar-salsa', lang: 'es', page: 'blogBeneficiosSalsa' },
  { path: 'es/blog/lifestyle/clases-de-salsa-barcelona', lang: 'es', page: 'blogClasesSalsaBarcelona' },
  { path: 'es/blog/lifestyle/como-perder-miedo-bailar', lang: 'es', page: 'blogPerderMiedoBailar' },
  { path: 'es/blog/historia', lang: 'es', page: 'blogHistoria' },
  { path: 'es/blog/historia/historia-salsa-barcelona', lang: 'es', page: 'blogHistoriaSalsa' },
  { path: 'es/blog/historia/historia-bachata-barcelona', lang: 'es', page: 'blogHistoriaBachata' },
  { path: 'es/blog/tutoriales', lang: 'es', page: 'blogTutoriales' },
  { path: 'es/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'es', page: 'blogSalsaRitmo' },
  { path: 'es/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'es', page: 'blogSalsaVsBachata' },
  { path: 'es/blog/tips', lang: 'es', page: 'blogTips' },
  { path: 'es/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'es', page: 'blogClasesPrincipiantes' },
  { path: 'es/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'es', page: 'blogAcademiaDanza' },
  { path: 'es/blog/tips/ballet-para-adultos-barcelona', lang: 'es', page: 'blogBalletAdultos' },
  { path: 'es/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'es', page: 'blogDanzaContemporaneaVsJazzBallet' },
  { path: 'es/blog/tips/danzas-urbanas-barcelona-guia-completa', lang: 'es', page: 'blogDanzasUrbanas' },
  { path: 'es/blog/tips/modern-jazz-barcelona-guia-completa', lang: 'es', page: 'blogModernJazz' },
  { path: 'es/blog/fitness', lang: 'es', page: 'blogFitness' },
  { path: 'es/blog/fitness/baile-salud-mental', lang: 'es', page: 'blogBaileSaludMental' },

  { path: 'ca/blog', lang: 'ca', page: 'blog' },
  { path: 'ca/blog/lifestyle', lang: 'ca', page: 'blogLifestyle' },
  { path: 'ca/blog/lifestyle/beneficios-bailar-salsa', lang: 'ca', page: 'blogBeneficiosSalsa' },
  { path: 'ca/blog/lifestyle/clases-de-salsa-barcelona', lang: 'ca', page: 'blogClasesSalsaBarcelona' },
  { path: 'ca/blog/lifestyle/como-perder-miedo-bailar', lang: 'ca', page: 'blogPerderMiedoBailar' },
  { path: 'ca/blog/historia', lang: 'ca', page: 'blogHistoria' },
  { path: 'ca/blog/historia/historia-salsa-barcelona', lang: 'ca', page: 'blogHistoriaSalsa' },
  { path: 'ca/blog/historia/historia-bachata-barcelona', lang: 'ca', page: 'blogHistoriaBachata' },
  { path: 'ca/blog/tutoriales', lang: 'ca', page: 'blogTutoriales' },
  { path: 'ca/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'ca', page: 'blogSalsaRitmo' },
  { path: 'ca/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'ca', page: 'blogSalsaVsBachata' },
  { path: 'ca/blog/tips', lang: 'ca', page: 'blogTips' },
  { path: 'ca/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'ca', page: 'blogClasesPrincipiantes' },
  { path: 'ca/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'ca', page: 'blogAcademiaDanza' },
  { path: 'ca/blog/tips/ballet-para-adultos-barcelona', lang: 'ca', page: 'blogBalletAdultos' },
  { path: 'ca/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'ca', page: 'blogDanzaContemporaneaVsJazzBallet' },
  { path: 'ca/blog/tips/danzas-urbanas-barcelona-guia-completa', lang: 'ca', page: 'blogDanzasUrbanas' },
  { path: 'ca/blog/tips/modern-jazz-barcelona-guia-completa', lang: 'ca', page: 'blogModernJazz' },
  { path: 'ca/blog/fitness', lang: 'ca', page: 'blogFitness' },
  { path: 'ca/blog/fitness/baile-salud-mental', lang: 'ca', page: 'blogBaileSaludMental' },

  { path: 'en/blog', lang: 'en', page: 'blog' },
  { path: 'en/blog/lifestyle', lang: 'en', page: 'blogLifestyle' },
  { path: 'en/blog/lifestyle/beneficios-bailar-salsa', lang: 'en', page: 'blogBeneficiosSalsa' },
  { path: 'en/blog/lifestyle/clases-de-salsa-barcelona', lang: 'en', page: 'blogClasesSalsaBarcelona' },
  { path: 'en/blog/lifestyle/como-perder-miedo-bailar', lang: 'en', page: 'blogPerderMiedoBailar' },
  { path: 'en/blog/historia', lang: 'en', page: 'blogHistoria' },
  { path: 'en/blog/historia/historia-salsa-barcelona', lang: 'en', page: 'blogHistoriaSalsa' },
  { path: 'en/blog/historia/historia-bachata-barcelona', lang: 'en', page: 'blogHistoriaBachata' },
  { path: 'en/blog/tutoriales', lang: 'en', page: 'blogTutoriales' },
  { path: 'en/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'en', page: 'blogSalsaRitmo' },
  { path: 'en/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'en', page: 'blogSalsaVsBachata' },
  { path: 'en/blog/tips', lang: 'en', page: 'blogTips' },
  { path: 'en/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'en', page: 'blogClasesPrincipiantes' },
  { path: 'en/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'en', page: 'blogAcademiaDanza' },
  { path: 'en/blog/tips/ballet-para-adultos-barcelona', lang: 'en', page: 'blogBalletAdultos' },
  { path: 'en/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'en', page: 'blogDanzaContemporaneaVsJazzBallet' },
  { path: 'en/blog/tips/danzas-urbanas-barcelona-guia-completa', lang: 'en', page: 'blogDanzasUrbanas' },
  { path: 'en/blog/tips/modern-jazz-barcelona-guia-completa', lang: 'en', page: 'blogModernJazz' },
  { path: 'en/blog/fitness', lang: 'en', page: 'blogFitness' },
  { path: 'en/blog/fitness/baile-salud-mental', lang: 'en', page: 'blogBaileSaludMental' },

  { path: 'fr/blog', lang: 'fr', page: 'blog' },
  { path: 'fr/blog/lifestyle', lang: 'fr', page: 'blogLifestyle' },
  { path: 'fr/blog/lifestyle/beneficios-bailar-salsa', lang: 'fr', page: 'blogBeneficiosSalsa' },
  { path: 'fr/blog/lifestyle/clases-de-salsa-barcelona', lang: 'fr', page: 'blogClasesSalsaBarcelona' },
  { path: 'fr/blog/lifestyle/como-perder-miedo-bailar', lang: 'fr', page: 'blogPerderMiedoBailar' },
  { path: 'fr/blog/historia', lang: 'fr', page: 'blogHistoria' },
  { path: 'fr/blog/historia/historia-salsa-barcelona', lang: 'fr', page: 'blogHistoriaSalsa' },
  { path: 'fr/blog/historia/historia-bachata-barcelona', lang: 'fr', page: 'blogHistoriaBachata' },
  { path: 'fr/blog/tutoriales', lang: 'fr', page: 'blogTutoriales' },
  { path: 'fr/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'fr', page: 'blogSalsaRitmo' },
  { path: 'fr/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'fr', page: 'blogSalsaVsBachata' },
  { path: 'fr/blog/tips', lang: 'fr', page: 'blogTips' },
  { path: 'fr/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'fr', page: 'blogClasesPrincipiantes' },
  { path: 'fr/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'fr', page: 'blogAcademiaDanza' },
  { path: 'fr/blog/tips/ballet-para-adultos-barcelona', lang: 'fr', page: 'blogBalletAdultos' },
  { path: 'fr/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'fr', page: 'blogDanzaContemporaneaVsJazzBallet' },
  { path: 'fr/blog/tips/danzas-urbanas-barcelona-guia-completa', lang: 'fr', page: 'blogDanzasUrbanas' },
  { path: 'fr/blog/tips/modern-jazz-barcelona-guia-completa', lang: 'fr', page: 'blogModernJazz' },
  { path: 'fr/blog/fitness', lang: 'fr', page: 'blogFitness' },
  { path: 'fr/blog/fitness/baile-salud-mental', lang: 'fr', page: 'blogBaileSaludMental' },

  // Facebook Ads Landing (promo)
  { path: 'es/promo/clase-gratis', lang: 'es', page: 'promoClaseGratis' },
  { path: 'ca/promo/clase-gratis', lang: 'ca', page: 'promoClaseGratis' },
  { path: 'en/promo/clase-gratis', lang: 'en', page: 'promoClaseGratis' },
  { path: 'fr/promo/clase-gratis', lang: 'fr', page: 'promoClaseGratis' },

  // Sexy Reggaeton Landing (FB Ads)
  { path: 'es/promo/sexy-reggaeton', lang: 'es', page: 'promoSexyReggaeton' },
  { path: 'ca/promo/sexy-reggaeton', lang: 'ca', page: 'promoSexyReggaeton' },
  { path: 'en/promo/sexy-reggaeton', lang: 'en', page: 'promoSexyReggaeton' },
  { path: 'fr/promo/sexy-reggaeton', lang: 'fr', page: 'promoSexyReggaeton' },

  // Generic Dance Landing Pages (auto-generated from LANDING_SLUGS)
  ...LANDING_ROUTES,
];

// Metadata for each page in each language
const metadata = {
  es: {
    home: {
      title: 'Farray\'s Center - Escuela de Baile Urbano en Barcelona',
      description: 'Descubre las mejores clases de baile urbano en Barcelona. Dancehall y más. Profesores experimentados y ambiente inclusivo.',
    },
    classes: {
      title: 'Clases de Baile - Farray\'s Center Barcelona',
      description: 'Dancehall y baile urbano Barcelona todos niveles. Horarios flexibles, profesores expertos. Academia CID-UNESCO. ¡Reserva clase!',
    },
    classesHub: {
      title: 'Todas las Clases de Baile en Barcelona | Farray\'s Center',
      description: 'Descubre +40 estilos de baile en Barcelona: Dancehall, Salsa, Bachata, Hip Hop, Twerk, Afrobeat y más. Academia CID-UNESCO. ¡Reserva clase!',
    },
    horariosPrecio: {
      title: 'Horarios y Precios | Clases de Baile Barcelona | Farray\'s Center',
      description: 'Consulta los horarios y precios de nuestras clases de baile en Barcelona. Bonos mensuales, clases sueltas y packs especiales. Escuela cerca Plaza España.',
      robots: 'noindex, nofollow',
    },
    horariosClases: {
      title: 'Horarios Clases de Baile Barcelona 2026 | Farray\'s Center',
      description: 'Horarios actualizados de clases de baile en Barcelona. Mañanas, tardes y fines de semana. Salsa, Bachata, Hip Hop, Dancehall y +40 estilos. Plaza España.',
    },
    preciosClases: {
      title: 'Precios Clases de Baile Barcelona | Bonos y Tarifas | Farray\'s Center',
      description: 'Precios y tarifas de clases de baile en Barcelona. Bonos mensuales desde 45€, clases sueltas y packs. Primera clase de prueba. Farray\'s Center Plaza España.',
    },
    danza: {
      title: 'Clases de Danza en Barcelona | Ballet, Contemporáneo y Jazz | Farray\'s Center',
      description: 'Clases de danza en Barcelona: Ballet Cubano, Contemporáneo, Modern Jazz, Afro Jazz. Academia CID-UNESCO. ¡¡Reserva tu clase!',
    },
    salsaBachata: {
      title: 'Clases de Salsa y Bachata en Barcelona | Salsa Cubana, Bachata Sensual y más | Farray\'s Center',
      description: 'Aprende Salsa Cubana y Bachata Sensual en Barcelona con maestros cubanos. Escuela CID-UNESCO con método exclusivo. ¡Reserva tu clase de prueba!',
    },
    bachataSensual: {
      title: 'Clases de Bachata Sensual en Barcelona | Aprende con Campeones Mundiales | Farray\'s Center',
      description: 'Bachata sensual Barcelona con Mathias Font y Eugenia Trujillo, campeones mundiales Salsa LA. Principiante a avanzado. Plaza España.',
    },
    salsaCubana: {
      title: 'Clases de Salsa Cubana en Barcelona | Casino, Rueda y Son | Farray\'s Center',
      description: 'Salsa Cubana auténtica en Barcelona con maestros cubanos. Casino, Rueda y Son. Método Farray® técnica La Habana. ¡Reserva clase!',
    },
    salsaLadyStyle: {
      title: 'Clases de Salsa Lady Style en Barcelona | Estilo Femenino y Elegancia | Farray\'s Center',
      description: 'Salsa Lady Style en Barcelona con Yunaisy Farray. Feminidad, elegancia y estilo bailando salsa. Método Farray® CID-UNESCO. ¡Reserva clase!',
    },
    folkloreCubano: {
      title: 'Clases de Folklore Cubano en Barcelona | Danzas a los Orishas | Farray\'s Center',
      description: 'Folklore Cubano auténtico en Barcelona: danzas Orishas, Yoruba, Rumba y más. Maestros cubanos especializados. Academia CID-UNESCO cerca Plaza España. ¡Reserva!',
    },
    timba: {
      title: 'Clases de Timba en Barcelona | Lady Timba y Timba en Pareja | Farray\'s Center',
      description: 'Timba Cubana en Barcelona con maestros cubanos. Lady Timba y Timba en Pareja. Despelote, improvisación y sabor cubano. ¡Reserva clase!',
    },
    danzasUrbanas: {
      title: 'Clases de Danzas Urbanas en Barcelona | Hip Hop, Dancehall, K-Pop y Reggaeton | Farray\'s Center',
      description: 'Danzas urbanas en Barcelona: Hip Hop, Dancehall, Reggaeton, Twerk, Afrobeat. Academia líder en estilos urbanos. ¡¡Reserva tu clase!',
    },
    dancehall: {
      title: 'Clases de Dancehall en Barcelona - Academia de Baile Urbano | Farray\'s Center',
      description: 'Aprende Dancehall auténtico en Barcelona con profesores expertos. Clases para todos los niveles. Descubre el ritmo jamaicano. Academia CID-UNESCO. ¡Reserva!',
    },
    twerk: {
      title: 'Clases de Twerk en Barcelona | Farray\'s Center',
      description: 'Aprende Twerk y Perreo en Barcelona con Sandra Gómez. Clases de baile urbano Todos niveles. ¡Libera tu energía y confianza!',
    },
    afrobeat: {
      title: 'Clases de Afrobeats y Afrodance en Barcelona | Farray\'s Center',
      description: 'Aprende Afrobeats y Afrodance en Barcelona con profesores nativos de África. Clases de Amapiano, Ntcham y danzas africanas modernas Todos niveles.',
    },
    kpop: {
      title: 'Clases de K-Pop Dance en Barcelona | Farray\'s Center',
      description: 'Clases de K-Pop Dance en Barcelona. Aprende coreografías de BTS, BLACKPINK, Stray Kids y más. Todos los niveles. Academia CID-UNESCO.',
    },
    commercial: {
      title: 'Clases de Commercial Dance en Barcelona | Farray\'s Center',
      description: 'Commercial Dance Barcelona. Coreografías estilo videoclip, técnica performance y presencia escénica. Todos niveles. Academia CID-UNESCO.',
    },
    kizomba: {
      title: 'Clases de Kizomba en Barcelona | Farray\'s Center',
      description: 'Clases de Kizomba en Barcelona. Aprende este sensual baile angoleño con conexión en pareja y musicalidad africana. Todos los niveles. Academia CID-UNESCO.',
    },
    hipHopReggaeton: {
      title: 'Clases de Hip Hop Reggaeton en Barcelona | Farray\'s Center',
      description: 'Hip Hop Reggaeton Barcelona con Charlie Breezy. Fusión hip-hop y reggaeton con flow. Todos niveles Plaza España. Academia CID-UNESCO. ¡Reserva!',
    },
    sexyReggaeton: {
      title: 'Clases de Sexy Reggaeton en Barcelona | Farray\'s Center',
      description: 'Sexy Reggaeton en Barcelona. Perreo, body roll y expresión corporal. Todos los niveles. Academia CID-UNESCO. ¡Reserva tu clase!',
    },
    reggaetonCubano: {
      title: 'Clases de Reggaeton Cubano en Barcelona | Farray\'s Center',
      description: 'Reggaeton Cubano auténtico en Barcelona. Reparto, Cubatón e improvisación. Ritmo y disociación corporal. CID-UNESCO. ¡Reserva tu clase!',
    },
    heelsBarcelona: {
      title: 'Clases de Heels en Barcelona | Farray\'s Center',
      description: 'Baile en tacones en Barcelona: Femmology y Sexy Style. Elegancia, expresión y confianza. Todos los niveles. Academia CID-UNESCO. ¡Reserva!',
    },
    femmology: {
      title: 'Clases de Femmology en Barcelona | Farray\'s Center',
      description: 'Femmology en Barcelona: danzaterapia en tacones. Feminidad, autoestima y empoderamiento. Método Farray® exclusivo. CID-UNESCO. ¡Reserva tu clase!',
    },
    sexyStyle: {
      title: 'Clases de Sexy Style en Barcelona | Farray\'s Center',
      description: 'Sexy Style en Barcelona. Expresa sensualidad, confianza y movimiento. Todos los niveles. Academia CID-UNESCO. ¡Reserva tu clase!',
    },
    modernJazz: {
      title: 'Clases de Modern Jazz en Barcelona | Técnica y Expresión con Alejandro Miñoso | Farray\'s Center',
      description: 'Modern Jazz Barcelona con Alejandro Miñoso. Técnica, musicalidad, expresión. Principiante a avanzado. Academia CID-UNESCO. ¡Reserva clase!',
    },
    ballet: {
      title: 'Clases de Ballet en Barcelona | Técnica Clásica y Elegancia | Farray\'s Center',
      description: 'Ballet clásico en Barcelona para adultos. Técnica, postura y elegancia con maestros formados en ENA. Academia acreditada CID-UNESCO. Plaza España. ¡Reserva!',
    },
    cuerpoFit: {
      title: 'Cuerpo-Fit Barcelona | Cardio Dance | Farray\'s Center',
      description: 'Cuerpo-Fit en Barcelona: quema 400-500 calorías bailando. Entrenamiento full body con danza, cardio y tonificación. CID-UNESCO. ¡Reserva tu clase!',
    },
    baileManananas: {
      title: 'Clases de Baile por las Mañanas en Barcelona | Farray\'s Center',
      description: 'Baile por las mañanas en Barcelona de 10h a 13h. Contemporáneo, Ballet, Jazz y más. Ideal para turnos tarde. Academia CID-UNESCO. ¡Reserva!',
    },
    clasesParticulares: {
      title: 'Clases Particulares de Baile en Barcelona | Farray\'s Center',
      description: 'Clases particulares de baile en Barcelona 100% personalizadas. Profesor exclusivo, horarios flexibles, +25 estilos. Academia CID-UNESCO. ¡Reserva!',
    },
    teamBuilding: {
      title: 'Team Building con Baile en Barcelona | Farray\'s Center',
      description: 'Team building con baile en Barcelona para empresas. +500 eventos realizados. Experiencia única, sin dinámicas vacías. Academia CID-UNESCO.',
    },
    about: {
      title: 'Sobre Nosotros | Farray\'s International Dance Center Barcelona',
      description: 'Conoce nuestra historia, valores y equipo. Academia de baile en Barcelona fundada en 2017 con método propio y profesores internacionales.',
    },
    yunaisy: {
      title: 'Yunaisy Farray | Fundadora y Directora | Farray\'s Center',
      description: 'Yunaisy Farray: bailarina cubana formada en ENA, fundadora de Farray\'s Center. Got Talent España, The Dancer. Creadora del Método Farray®. +20 años en danza.',
    },
    metodoFarray: {
      title: 'Método Farray® | Sistema Exclusivo de Danza | Farray\'s Center',
      description: 'Método Farray®: sistema pedagógico que fusiona técnica cubana, ritmo afrocaribeño e innovación. Certificado CID-UNESCO. Diseñado para adultos europeos.',
    },
    merchandising: {
      title: 'Merchandising Oficial | Farray\'s Center',
      description: 'Merchandising oficial de Farray\'s Center: camisetas, sudaderas y accesorios. Lleva tu pasión por el baile contigo. ¡Compra ahora!',
    },
    regalaBaile: {
      title: 'Regala Baile | Tarjetas Regalo | Farray\'s Center',
      description: 'Regala clases de baile en Barcelona. Tarjetas regalo para +25 estilos. El regalo perfecto para amantes del baile. Academia CID-UNESCO.',
    },
    facilities: {
      title: 'Instalaciones | Salas de Baile Barcelona | Farray\'s Center',
      description: '700m² con 4 salas de baile profesionales en Barcelona. Espejos, barras, suelo técnico y vestuarios. Eixample, cerca de Plaza España.',
    },
    contact: {
      title: 'Contacto | Farray\'s International Dance Center Barcelona',
      description: 'Contacta con Farray\'s Center Barcelona. Carrer d\'Entença 100. Tel: +34 622 24 70 85. Escuela baile CID-UNESCO. +40 estilos. Reserva clase!',
    },
    reservas: {
      title: 'Reserva tu Clase de Bienvenida | Farray\'s Center Barcelona',
      description: 'Reserva tu clase de bienvenida en Farray\'s Center Barcelona. +25 estilos de baile. Método Farray® exclusivo. Academia CID-UNESCO. ¡Primera clase!',
    },

    hazteSocio: {
      title: 'Hazte Socio | Clases de Baile Barcelona | Farray\'s Center',
      description: 'Únete a Farray\'s. Desde 50€/mes. +80 clases semanales, +25 estilos. Sin permanencia. App para reservar. ¡Empieza hoy!',
      robots: 'noindex, nofollow',
    },
    yrProject: {
      title: 'Y&R | Yunaisy & Reynier - Artistas de Baile',
      description: 'Contacta con Y&R (Yunaisy & Reynier). Artistas de baile, shows y clases en Barcelona. WhatsApp e Instagram.',
      robots: 'noindex, nofollow',
    },
    miReserva: {
      title: 'Mi Reserva | Farray\'s Center Barcelona',
      description: 'Gestiona tu reserva de clase en Farray\'s Center Barcelona. Reprograma o cancela tu clase.',
      robots: 'noindex, nofollow',
    },
    fichaje: {
      title: 'Fichaje Profesores | Farray\'s Center',
      description: 'Sistema de fichaje para profesores de Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    fichajeResumen: {
      title: 'Firma Resumen Mensual | Farray\'s Center',
      description: 'Revisa y firma tu resumen mensual de horas trabajadas en Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    adminFichajes: {
      title: 'Dashboard Fichajes | Farray\'s Center',
      description: 'Panel de administración de fichajes para Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    adminReservas: {
      title: 'Reservas de Prueba | Farray\'s Center',
      description: 'Panel de gestión de reservas de clases de prueba gratuitas.',
      robots: 'noindex, nofollow',
    },
    feedbackGracias: {
      title: 'Gracias por tu opinión | Farray\'s Center Barcelona',
      description: 'Tu opinión nos ayuda a mejorar. Gracias por compartir tu experiencia con nosotros.',
      robots: 'noindex, nofollow',
    },
    feedbackComentario: {
      title: 'Deja tu Comentario | Farray\'s Center Barcelona',
      description: 'Cuéntanos más sobre tu experiencia. Tu opinión nos ayuda a mejorar.',
      robots: 'noindex, nofollow',
    },
    asistenciaConfirmada: {
      title: 'Confirmación de Asistencia | Farray\'s Center Barcelona',
      description: 'Confirmación de asistencia a tu clase de baile en Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    blog: {
      title: 'Blog de Danza y Baile | Farray\'s Center Barcelona',
      description: 'Blog de baile con consejos, tutoriales e historia. Artículos de profesionales cubanos sobre salsa, bachata, hip hop, ballet y más. Academia CID-UNESCO.',
    },
    blogLifestyle: {
      title: 'Lifestyle y Baile | Bienestar y Estilo de Vida | Farray\'s Center Blog',
      description: 'Descubre cómo el baile transforma tu vida. Artículos sobre bienestar, felicidad, estilo de vida saludable y desarrollo personal a través del baile.',
    },
    blogBeneficiosSalsa: {
      title: '10 Beneficios de Bailar Salsa que Cambiarán Tu Vida | Farray\'s Center',
      description: '10 beneficios científicos de bailar salsa: 400 cal/h, mejora salud cardiovascular, reduce estrés, aumenta autoestima. Guía.',
    },
    blogHistoria: {
      title: 'Historia del Baile | Orígenes y Evolución | Farray\'s Center Blog',
      description: 'Descubre la fascinante historia del baile: orígenes, evolución y cómo llegó a Barcelona. Artículos sobre salsa, dancehall y más.',
    },
    blogHistoriaSalsa: {
      title: 'Historia de la Salsa: del Caribe a Barcelona | Farray\'s Center',
      description: 'Historia de la salsa: orígenes en Caribe y Nueva York, llegada a Barcelona. 60+ años de ritmo que cambiaron el mundo. Raíces africanas y cubanas.',
    },
    blogHistoriaBachata: {
      title: 'Historia de la Bachata: de RD a Barcelona | Farray\'s Center',
      description: 'Historia de la bachata: de República Dominicana a fenómeno mundial. Evolución, Romeo Santos, bachata sensual y llegada a Barcelona.',
    },
    blogTutoriales: {
      title: 'Tutoriales de Baile | Farray\'s Center Blog',
      description: 'Guías y tutoriales para aprender a bailar: técnicas, pasos básicos y consejos de profesionales para salsa, bachata, dancehall y más estilos.',
    },
    blogSalsaRitmo: {
      title: 'Salsa: El Ritmo que Conquistó el Mundo | Farray\'s Center',
      description: 'Descubre los diferentes estilos de salsa: cubana, rueda de casino, salsa en línea y más. Guía completa para entender y bailar salsa en Barcelona.',
    },
    blogSalsaVsBachata: {
      title: 'Salsa vs Bachata: ¿Cuál Elegir? Guía 2025 | Farray\'s Center',
      description: 'Salsa vs bachata: diferencias en ritmo, pasos y expresión. Guía completa para elegir tu estilo de baile latino. Clases en Barcelona.',
    },
    blogClasesSalsaBarcelona: {
      title: 'Hombres y mujeres, ¿hablamos salsa? | Farray\'s Center Blog',
      description: 'La salsa como lenguaje universal: reflexiones sobre la pista de baile como espacio de conexión entre hombres y mujeres. Por Mar Guerrero.',
    },
    blogTips: {
      title: 'Consejos para Bailar | Farray\'s Center Blog',
      description: 'Consejos prácticos y guías expertas para principiantes y bailarines avanzados en Barcelona. Tips de técnica, estilo y progresión en tu baile.',
    },
    blogClasesPrincipiantes: {
      title: 'Clases de baile para principiantes en Barcelona | Farray\'s Center',
      description: 'Guía completa para empezar a bailar desde cero en Barcelona. Desde 10€/clase, mensualidades desde 50€. +25 estilos, +15.000 alumnos.',
    },
    blogAcademiaDanza: {
      title: 'Academia de Danza en Barcelona: Cómo Elegir | Farray\'s Center',
      description: 'Te hablo como directora de una academia de danza en Barcelona: qué mirar, qué evitar y cómo elegir un lugar donde de verdad aprendas a bailar.',
    },
    blogBalletAdultos: {
      title: 'Ballet para Adultos Barcelona: Guía Honesta para Empezar | Farray\'s',
      description: 'Ballet para adultos en Barcelona con método seguro y progresivo. Descubre si puedes empezar de cero, beneficios reales y cómo elegir escuela en el Eixample.',
    },
    blogDanzaContemporaneaVsJazzBallet: {
      title: 'Contemporánea vs Jazz vs Ballet: Guía 2025 | Farray\'s Center',
      description: 'Descubre las diferencias entre danza contemporánea, modern jazz y ballet clásico. Comparativa técnica, beneficios y cómo elegir el estilo que mejor se adapta a ti.',
    },
    blogDanzasUrbanas: {
      title: 'Danzas Urbanas Barcelona: Guía Completa Hip-Hop 2026 | Farray\'s',
      description: '20 años enseñando danzas urbanas en Barcelona. Breaking, popping, locking y hip-hop con un profesor veterano. Guía definitiva para empezar.',
    },
    blogModernJazz: {
      title: 'Modern Jazz Barcelona: Guía Completa 2026 | Farray\'s Center',
      description: 'Descubre el Modern Jazz con Alejandro Miñoso, ex solista de Carlos Acosta. Historia, técnica, estilos y dónde aprender en Barcelona. Guía definitiva.',
    },
    blogPerderMiedoBailar: {
      title: 'Cómo Perder el Miedo a Bailar: Guía Práctica 2025 | Farray\'s Center',
      description: 'Descubre técnicas probadas para superar la vergüenza y el miedo a bailar. El 80% de adultos sienten ansiedad al bailar. Aprende cómo superarlo paso a paso.',
    },
    blogFitness: {
      title: 'Fitness y Salud - Blog de Baile | Farray\'s Center Barcelona',
      description: 'Artículos sobre los beneficios del baile para la salud física y mental. Consejos de fitness, bienestar y ejercicio a través del baile.',
    },
    blogBaileSaludMental: {
      title: 'Baile y Salud Mental: Beneficios Científicos | Farray\'s Center',
      description: 'Descubre los beneficios científicos del baile para la salud mental. Reduce ansiedad 47%, menos demencia 76%. Estudios de Harvard, NEJM y más.',
    },
    promoClaseGratis: {
      title: 'Tu Primera Clase de Baile | Farray\'s Center Barcelona',
      description: 'Reserva tu clase de prueba en la escuela de baile más completa de Barcelona. +15.000 alumnos, +40 estilos. CID-UNESCO. ¡Plazas limitadas!',
      robots: 'noindex, nofollow',
    },
    promoSexyReggaeton: {
      title: 'Clase de Sexy Reggaeton en Barcelona | Farray\'s Center',
      description: 'Aprende moverte al ritmo de reggaeton con sensualidad y confianza en Barcelona. +15.000 alumnos formados. Método Farray®. ¡Reserva clase!',
      robots: 'noindex, nofollow',
    },
    // New class pages
    afroContemporaneo: {
      title: 'Clases de Afro Contemporáneo en Barcelona | Fusión de Danza Africana y Contemporánea | Farray\'s Center',
      description: 'Afro Contemporáneo en Barcelona: fusión de danza africana con técnica contemporánea. Todos niveles. Academia CID-UNESCO. ¡Reserva clase!',
    },
    afroJazz: {
      title: 'Clases de Afro Jazz en Barcelona | Ritmo Africano y Técnica de Jazz | Farray\'s Center',
      description: 'Clases de Afro Jazz en Barcelona: combina ritmos africanos con técnica de jazz moderno. Expresión corporal, musicalidad y energía. Todos los niveles. ¡Reserva!',
    },
    contemporaneo: {
      title: 'Clases de Danza Contemporánea en Barcelona | Técnica y Expresión | Farray\'s Center',
      description: 'Clases de danza contemporánea en Barcelona para adultos. Desarrolla técnica, expresión corporal y creatividad. Academia CID-UNESCO. ¡Reserva tu clase de prueba!',
    },
    stretching: {
      title: 'Clases de Stretching para Bailarines en Barcelona | Flexibilidad y Movilidad | Farray\'s Center',
      description: 'Stretching para bailarines Barcelona. Mejora flexibilidad, movilidad y previene lesiones. Complemento perfecto cualquier estilo baile.',
    },
    hipHop: {
      title: 'Clases de Hip Hop en Barcelona | Aprende con Profesionales | Farray\'s Center',
      description: 'Aprende Hip Hop en Barcelona con profesores expertos. Clases desde principiante hasta avanzado. Estilos: Old School, New Style, House y más. ¡¡Reserva tu clase!',
    },
    entrenamientoBailarines: {
      title: 'Entrenamiento para Bailarines en Barcelona | Técnica y Condición Física | Farray\'s Center',
      description: 'Entrenamiento bailarines Barcelona. Mejora técnica, fuerza, resistencia y flexibilidad. Programa diseñado por profesionales danza CID-UNESCO.',
    },
    bachataLadyStyle: {
      title: 'Clases de Bachata Lady Style en Barcelona | Estilo Femenino y Sensualidad | Farray\'s Center',
      description: 'Bachata Lady Style Barcelona. Feminidad, elegancia y estilo personal bailando bachata. Movimientos sensuales y expresivos. ¡Reserva clase!',
    },
    bumBum: {
      title: 'Bum Bum - Ejercicios de Glúteos en Barcelona | Tonificación y Fitness | Farray\'s Center',
      description: 'Clases de Bum Bum en Barcelona: ejercicios especializados para glúteos y piernas. Tonifica, fortalece y moldea con música y energía. ¡¡Reserva tu clase!',
    },
    cuerpoFitPage: {
      title: 'Acondicionamiento Físico para Bailarines en Barcelona | Cuerpo Fit | Farray\'s Center',
      description: 'Acondicionamiento físico bailarines Barcelona. Mejora fuerza, flexibilidad y resistencia con Método Farray. Entrenamiento funcional especializado.',
    },
    // New non-class pages
    profesores: {
      title: 'Profesores de Baile en Barcelona | Equipo de Farray\'s Center',
      description: 'Conoce a nuestro equipo de profesores de baile en Barcelona. Bailarines profesionales de todo el mundo con años de experiencia. Formación CID-UNESCO.',
    },
    faq: {
      title: 'Preguntas Frecuentes | Farray\'s International Dance Center Barcelona',
      description: 'Resuelve tus dudas sobre nuestras clases de baile en Barcelona. Horarios, precios, niveles, inscripción y todo lo que necesitas saber antes de empezar.',
    },
    alquilerSalas: {
      title: 'Alquiler de Salas de Baile en Barcelona | 4 Espacios Profesionales | Farray\'s Center',
      description: 'Alquiler 4 salas baile Barcelona (40-120m²). Suelo danza, espejos, climatización, sonido. Desde 14€/h. Plaza España. CID-UNESCO.',
    },
    estudioGrabacion: {
      title: 'Estudio de Grabación de Baile en Barcelona | Producción Audiovisual | Farray\'s Center',
      description: 'Estudio grabación videos baile Barcelona. Equipamiento profesional, iluminación y sonido. Perfecto videoclips, tutoriales y redes sociales.',
    },
    // Legal pages
    termsConditions: {
      title: 'Términos y Condiciones | Farray\'s International Dance Center',
      description: 'Términos y condiciones de uso de los servicios de Farray\'s Center. Información legal sobre inscripciones, pagos y políticas de la academia.',
    },
    legalNotice: {
      title: 'Aviso Legal | Farray\'s International Dance Center',
      description: 'Aviso legal de Farray\'s Center. Información sobre la empresa, propiedad intelectual y condiciones de uso del sitio web.',
    },
    privacyPolicy: {
      title: 'Política de Privacidad | Farray\'s International Dance Center',
      description: 'Política de privacidad de Farray\'s Center. Información sobre el tratamiento de datos personales según el RGPD.',
    },
    cookiePolicy: {
      title: 'Política de Cookies | Farray\'s International Dance Center',
      description: 'Política de cookies de Farray\'s Center. Información sobre las cookies utilizadas en nuestro sitio web.',
    },
    // Additional pages
    serviciosBaile: {
      title: 'Servicios de Baile en Barcelona | Farray\'s Center',
      description: 'Servicios profesionales de baile en Barcelona: clases particulares, coreografías para eventos, shows y espectáculos. Contáctanos.',
    },
    ubicacion: {
      title: 'Cómo Llegar a Farray\'s Center | Escuela de Baile Barcelona',
      description: 'Cómo llegar a Farray\'s Center en Barcelona. Metro Rocafort (L1) a 4 min, Sants Estació a 8 min. Carrer d\'Entença 100. Perfectamente conectado.',
    },
    calendario: {
      title: 'Calendario de Eventos | Farray\'s International Dance Center',
      description: 'Calendario de eventos, workshops y actividades especiales en Farray\'s Center Barcelona. Mantente al día de todas las novedades.',
    },
    notFound: {
      title: 'Página No Encontrada | 404 | Farray\'s Center',
      description: 'La página que buscas no existe. Vuelve a la página principal o explora nuestras +40 clases de baile en Barcelona. Academia CID-UNESCO. ¡Descubre tu estilo!',
      robots: 'noindex, nofollow',
    },
    // Generic Dance Landing Pages (auto-generated from LANDING_METADATA)
    ...LANDING_METADATA.es,
  },
  ca: {
    home: {
      title: 'Farray\'s Center - Escola de Ball Urbà a Barcelona',
      description: 'Millors classes ball urbà Barcelona: Dancehall, Hip Hop, Reggaeton. Professors experimentats, ambient inclusiu. Acadèmia CID-UNESCO. Reserva!',
    },
    classes: {
      title: 'Classes de Ball - Farray\'s Center Barcelona',
      description: 'Classes de Dancehall i ball urbà Tots nivells. Horaris flexibles a Barcelona.',
    },
    classesHub: {
      title: 'Totes les Classes de Ball a Barcelona | Farray\'s Center',
      description: 'Descobreix +40 estils de ball a Barcelona: Dancehall, Salsa, Bachata, Hip Hop, Twerk, Afrobeat i més. Acadèmia CID-UNESCO. Reserva classe!',
    },
    horariosPrecio: {
      title: 'Horaris i Preus | Classes de Ball Barcelona | Farray\'s Center',
      description: 'Consulta els horaris i preus de les nostres classes de ball a Barcelona. Bonos mensuals, classes soltes i packs especials. Escola a prop de Plaça Espanya.',
      robots: 'noindex, nofollow',
    },
    horariosClases: {
      title: 'Horaris Classes de Ball Barcelona 2026 | Farray\'s Center',
      description: 'Horaris actualitzats de classes de ball a Barcelona. Matins, tardes i caps de setmana. Salsa, Bachata, Hip Hop, Dancehall i +40 estils. Plaça Espanya.',
    },
    preciosClases: {
      title: 'Preus Classes de Ball Barcelona | Bonos i Tarifes | Farray\'s Center',
      description: 'Preus i tarifes de classes de ball a Barcelona. Bonos mensuals des de 45€, classes soltes i packs. Primera classe de prova. Farray\'s Center Plaça Espanya.',
    },
    danza: {
      title: 'Classes de Dansa a Barcelona | Ballet, Contemporani i Jazz | Farray\'s Center',
      description: 'Classes de dansa a Barcelona: Ballet Cubà, Dansa Contemporània, Modern Jazz, Afro Jazz i més. Acadèmia acreditada CID-UNESCO. Tots els nivells. Reserva classe!',
    },
    salsaBachata: {
      title: 'Classes de Salsa i Bachata a Barcelona | Salsa Cubana, Bachata Sensual i més | Farray\'s Center',
      description: 'Aprèn Salsa Cubana i Bachata Sensual a Barcelona amb mestres cubans. Escola CID-UNESCO amb mètode exclusiu. Reserva la teva classe de prova!',
    },
    bachataSensual: {
      title: 'Classes de Bachata Sensual a Barcelona | Aprèn amb Campions Mundials | Farray\'s Center',
      description: 'Bachata sensual Barcelona amb Mathias Font i Eugenia Trujillo, campions mundials Salsa LA. Principiant a avançat. Plaça Espanya.',
    },
    salsaCubana: {
      title: 'Classes de Salsa Cubana a Barcelona | Casino, Rueda i Son | Farray\'s Center',
      description: 'Aprèn Salsa Cubana autèntica a Barcelona amb mestres cubans. Classes de Casino, Rueda de Casino i Son Cubà. Mètode Farray® amb tècnica de L\'Havana. Reserva la teva classe de prova!',
    },
    salsaLadyStyle: {
      title: 'Classes de Salsa Lady Style a Barcelona | Estil Femení i Elegància | Farray\'s Center',
      description: 'Classes de Salsa Lady Style a Barcelona amb Yunaisy Farray. Feminitat, elegància i estil ballant salsa. Mètode Farray® CID-UNESCO. Reserva la teva classe!',
    },
    folkloreCubano: {
      title: 'Classes de Folklore Cubà a Barcelona | Danses als Orixàs | Farray\'s Center',
      description: 'Aprèn Folklore Cubà autèntic a Barcelona. Danses als Orixàs, Yoruba, Rumba i més. Mestres cubans especialitzats. Entre Plaça Espanya i Sants. Reserva!',
    },
    timba: {
      title: 'Classes de Timba a Barcelona | Lady Timba i Timba en Parella | Farray\'s Center',
      description: 'Timba Cubana Barcelona amb mestres cubans. Lady Timba i Timba en Parella. Despelote, improvisació, sabor cubà. Reserva classe!',
    },
    danzasUrbanas: {
      title: 'Classes de Danses Urbanes a Barcelona | Hip Hop, Dancehall, K-Pop i Reggaeton | Farray\'s Center',
      description: 'Danses urbanes Barcelona: Hip Hop, Dancehall, Reggaeton, Twerk, Afrobeat. Acadèmia líder en estils urbans. CID-UNESCO. Reserva classe!',
    },
    dancehall: {
      title: 'Classes de Dancehall a Barcelona - Acadèmia de Ball Urbà | Farray\'s Center',
      description: 'Dancehall autèntic Barcelona amb professors experts. Tots nivells. Ritme jamaicà. Acadèmia CID-UNESCO. Reserva classe!',
    },
    twerk: {
      title: 'Classes de Twerk a Barcelona | Farray\'s Center',
      description: 'Twerk i Perreo Barcelona amb Sandra Gómez. Ball urbà tots nivells. Allibera energia i confiança. Acadèmia CID-UNESCO. Reserva classe!',
    },
    afrobeat: {
      title: 'Classes d\'Afrobeats i Afrodance a Barcelona | Farray\'s Center',
      description: 'Aprèn Afrobeats i Afrodance a Barcelona amb professors natius d\'Àfrica. Classes d\'Amapiano, Ntcham i danses africanes modernes Tots nivells.',
    },
    kpop: {
      title: 'Classes de K-Pop Dance a Barcelona | Farray\'s Center',
      description: 'Classes de K-Pop Dance a Barcelona. Aprèn coreografies de BTS, BLACKPINK, Stray Kids i més. Tots els nivells. Acadèmia CID-UNESCO.',
    },
    commercial: {
      title: 'Classes de Commercial Dance a Barcelona | Farray\'s Center',
      description: 'Classes de Commercial Dance a Barcelona. Aprèn coreografies estil videoclip, tècnica de performance i presència escènica. Tots els nivells. Acadèmia CID-UNESCO.',
    },
    kizomba: {
      title: 'Classes de Kizomba a Barcelona | Farray\'s Center',
      description: 'Classes de Kizomba a Barcelona. Aprèn aquest sensual ball angolès amb connexió en parella i musicalitat africana. Tots els nivells. Acadèmia CID-UNESCO.',
    },
    hipHopReggaeton: {
      title: 'Classes de Hip Hop Reggaeton a Barcelona | Farray\'s Center',
      description: 'Hip Hop Reggaeton Barcelona amb Charlie Breezy. Fusió única amb flow. Tots nivells prop Plaça Espanya. Acadèmia CID-UNESCO. Reserva!',
    },
    sexyReggaeton: {
      title: 'Classes de Sexy Reggaeton a Barcelona | Farray\'s Center',
      description: 'Sexy Reggaeton a Barcelona. Perreo, body roll i expressió corporal. Tots els nivells. Acadèmia CID-UNESCO. Reserva la teva classe!',
    },
    reggaetonCubano: {
      title: 'Classes de Reggaeton Cubà a Barcelona | Farray\'s Center',
      description: 'Reggaeton Cubà autèntic a Barcelona. Reparto, Cubatón i improvisació. Ritme i disociació corporal. CID-UNESCO. Reserva la teva classe!',
    },
    heelsBarcelona: {
      title: 'Classes de Heels a Barcelona | Farray\'s Center',
      description: 'Ball amb talons a Barcelona: Femmology i Sexy Style. Elegància, expressió i confiança. Tots els nivells. Acadèmia CID-UNESCO. Reserva!',
    },
    femmology: {
      title: 'Classes de Femmology a Barcelona | Farray\'s Center',
      description: 'Femmology a Barcelona: dansateràpia amb talons. Feminitat, autoestima i empoderament. Mètode Farray® exclusiu. CID-UNESCO. Reserva la teva classe!',
    },
    sexyStyle: {
      title: 'Classes de Sexy Style a Barcelona | Farray\'s Center',
      description: 'Sexy Style a Barcelona. Expressa sensualitat, confiança i moviment. Tots els nivells. Acadèmia CID-UNESCO. Reserva la teva classe!',
    },
    modernJazz: {
      title: 'Classes de Modern Jazz a Barcelona | Tècnica i Expressió amb Alejandro Miñoso | Farray\'s Center',
      description: 'Modern Jazz Barcelona amb Alejandro Miñoso. Tècnica, musicalitat i expressió. Principiant a avançat. Acadèmia CID-UNESCO. Reserva classe!',
    },
    ballet: {
      title: 'Classes de Ballet a Barcelona | Tècnica Clàssica i Elegància | Farray\'s Center',
      description: "Classes de ballet clàssic a Barcelona per a adults. Aprèn tècnica, postura i elegància amb mestres formats a l'ENA. Acadèmia CID-UNESCO entre Plaça Espanya i Sants.",
    },
    cuerpoFit: {
      title: 'Cuerpo-Fit Barcelona | Classes de Cardio Dance | Farray\'s Center',
      description: 'Cuerpo-Fit a Barcelona: crema 400-500 calories ballant. Entrenament full body amb dansa, cardio i tonificació. CID-UNESCO. Reserva la teva classe!',
    },
    baileManananas: {
      title: 'Classes de Ball pel Matí a Barcelona | Farray\'s Center',
      description: 'Ball pel matí a Barcelona de 10h a 13h. Contemporani, Ballet, Jazz i més. Ideal per a torns tarda. Acadèmia CID-UNESCO. Reserva!',
    },
    clasesParticulares: {
      title: 'Classes Particulars de Ball a Barcelona | Farray\'s Center',
      description: 'Classes particulars de ball a Barcelona 100% personalitzades. Professor exclusiu, horaris flexibles, +25 estils. Acadèmia CID-UNESCO. Reserva!',
    },
    teamBuilding: {
      title: 'Team Building amb Ball a Barcelona | Farray\'s Center',
      description: 'Team building amb ball a Barcelona per a empreses. +500 esdeveniments realitzats. Experiència única, sense dinàmiques buides. Acadèmia CID-UNESCO.',
    },
    about: {
      title: 'Sobre Nosaltres | Farray\'s International Dance Center Barcelona',
      description: 'Coneix la nostra història, valors i equip. Acadèmia de ball a Barcelona fundada el 2017 amb mètode propi i professors internacionals.',
    },
    yunaisy: {
      title: 'Yunaisy Farray | Fundadora i Directora | Farray\'s Center',
      description: 'Yunaisy Farray: ballarina cubana formada a ENA, fundadora de Farray\'s Center. Got Talent España, The Dancer. Creadora del Mètode Farray®. +20 anys en dansa.',
    },
    metodoFarray: {
      title: 'Mètode Farray® | Sistema Exclusiu de Dansa | Farray\'s Center',
      description: 'Mètode Farray®: sistema pedagògic que fusiona tècnica cubana, ritme afrocaribeny i innovació. Certificat CID-UNESCO. Dissenyat per a adults europeus.',
    },
    merchandising: {
      title: 'Merchandising Oficial | Farray\'s Center',
      description: 'Merchandising oficial de Farray\'s Center: samarretes, dessuadores i accessoris. Porta la teva passió pel ball amb tu. Compra ara!',
    },
    regalaBaile: {
      title: 'Regala Ball | Targetes Regal | Farray\'s Center',
      description: 'Regala classes de ball a Barcelona. Targetes regal per a +25 estils. El regal perfecte per amants del ball. Acadèmia CID-UNESCO.',
    },
    facilities: {
      title: 'Instal·lacions | Sales de Ball Barcelona | Farray\'s Center',
      description: '700m² amb 4 sales de ball professionals a Barcelona. Miralls, barres, terra tècnic i vestidors. Eixample, prop de Plaça Espanya.',
    },
    contact: {
      title: 'Contacte | Farray\'s International Dance Center Barcelona',
      description: 'Contacta amb nosaltres. Carrer d\'Entença 100, Barcelona. Tel: +34 622 24 70 85. Reserva la teva classe de prova gratuïta.',
    },
    reservas: {
      title: 'Reserva la teva Classe de Benvinguda | Farray\'s Center Barcelona',
      description: 'Reserva la teva classe de benvinguda a Farray\'s Center Barcelona. +25 estils de ball. Mètode Farray® exclusiu. Acadèmia CID-UNESCO. Primera classe!',
    },

    hazteSocio: {
      title: 'Fes-te Soci | Classes de Ball Barcelona | Farray\'s Center',
      description: 'Uneix-te a Farray\'s. Des de 50€/mes. +80 classes setmanals, +25 estils. Sense permanència. App per reservar. Comença avui!',
      robots: 'noindex, nofollow',
    },
    yrProject: {
      title: 'Y&R | Yunaisy & Reynier - Artistes de Ball',
      description: 'Contacta amb Y&R (Yunaisy & Reynier). Artistes de ball, shows i classes a Barcelona. WhatsApp i Instagram.',
      robots: 'noindex, nofollow',
    },
    miReserva: {
      title: 'La Meva Reserva | Farray\'s Center Barcelona',
      description: 'Gestiona la teva reserva de classe a Farray\'s Center Barcelona. Reprograma o cancel·la la teva classe.',
      robots: 'noindex, nofollow',
    },
    fichaje: {
      title: 'Fitxatge Professors | Farray\'s Center',
      description: 'Sistema de fitxatge per a professors de Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    fichajeResumen: {
      title: 'Signatura Resum Mensual | Farray\'s Center',
      description: 'Revisa i signa el teu resum mensual d\'hores treballades a Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    adminFichajes: {
      title: 'Dashboard Fitxatges | Farray\'s Center',
      description: 'Panell d\'administració de fitxatges per a Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    adminReservas: {
      title: 'Reserves de Prova | Farray\'s Center',
      description: 'Panell de gestió de reserves de classes de prova gratuïtes.',
      robots: 'noindex, nofollow',
    },
    feedbackGracias: {
      title: 'Gràcies per la teva opinió | Farray\'s Center Barcelona',
      description: 'La teva opinió ens ajuda a millorar. Gràcies per compartir la teva experiència amb nosaltres.',
      robots: 'noindex, nofollow',
    },
    feedbackComentario: {
      title: 'Deixa el teu Comentari | Farray\'s Center Barcelona',
      description: 'Explica\'ns més sobre la teva experiència. La teva opinió ens ajuda a millorar.',
      robots: 'noindex, nofollow',
    },
    asistenciaConfirmada: {
      title: 'Confirmació d\'Assistència | Farray\'s Center Barcelona',
      description: 'Confirmació d\'assistència a la teva classe de ball a Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    blog: {
      title: 'Blog de Dansa i Ball | Farray\'s Center Barcelona',
      description: 'Blog de ball amb consells, tutorials i història. Articles de professionals cubans sobre salsa, bachata, hip hop, ballet i més. Acadèmia CID-UNESCO.',
    },
    blogLifestyle: {
      title: 'Lifestyle i Ball | Benestar i Estil de Vida | Farray\'s Center Blog',
      description: 'Descobreix com el ball transforma la teva vida. Articles sobre benestar, felicitat i estil de vida a través del ball.',
    },
    blogBeneficiosSalsa: {
      title: '10 Beneficis de Ballar Salsa que Canviaran la Teva Vida | Farray\'s Center',
      description: 'Descobreix els 10 beneficis científicament demostrats de ballar salsa: crema 400 cal/hora, millora la salut cardiovascular, redueix l\'estrès i augmenta l\'autoestima. Guia completa.',
    },
    blogHistoria: {
      title: 'Història del Ball | Orígens i Evolució | Farray\'s Center Blog',
      description: 'Descobreix la fascinant història del ball: orígens, evolució i com va arribar a Barcelona. Articles sobre salsa, dancehall i més.',
    },
    blogHistoriaSalsa: {
      title: 'Història de la Salsa: del Carib a Barcelona | Farray\'s Center',
      description: 'Història de la salsa: orígens al Carib i Nova York, arribada a Barcelona. 60+ anys de ritme que van canviar el món. Arrels africanes i cubanes.',
    },
    blogHistoriaBachata: {
      title: 'Història de la Bachata: de RD a Barcelona | Farray\'s Center',
      description: 'Història de la bachata: de República Dominicana a fenomen mundial. Evolució, Romeo Santos, bachata sensual i arribada a Barcelona.',
    },
    blogTutoriales: {
      title: 'Tutorials de Ball | Farray\'s Center Blog',
      description: 'Guies i tutorials per aprendre a ballar: tècniques, passos bàsics i consells de professionals per a salsa, bachata, dancehall i més estils.',
    },
    blogSalsaRitmo: {
      title: 'Salsa: El Ritme que Va Conquistar el Món | Farray\'s Center',
      description: 'Descobreix els diferents estils de salsa: cubana, roda de casino, salsa en línia i més. Guia completa per entendre i ballar salsa a Barcelona.',
    },
    blogSalsaVsBachata: {
      title: 'Salsa vs Bachata: Quin Triar? Guia 2025 | Farray\'s Center',
      description: 'Salsa vs bachata: diferències en ritme, passos i expressió. Guia completa per triar el teu estil de ball llatí. Classes a Barcelona.',
    },
    blogClasesSalsaBarcelona: {
      title: 'Homes i dones, parlem salsa? | Farray\'s Center Blog',
      description: 'La salsa com a llenguatge universal: reflexions sobre la pista de ball com a espai de connexió entre homes i dones. Per Mar Guerrero.',
    },
    blogTips: {
      title: 'Consells per Ballar | Farray\'s Center Blog',
      description: 'Consells pràctics i guies expertes per a principiants i balladors avançats a Barcelona. Tips de tècnica, estil i progressió en el teu ball.',
    },
    blogClasesPrincipiantes: {
      title: 'Classes de ball per a principiants a Barcelona | Farray\'s Center',
      description: 'Guia completa per començar a ballar des de zero a Barcelona. Des de 10€/classe, mensualitats des de 50€. +25 estils, +15.000 alumnes.',
    },
    blogAcademiaDanza: {
      title: 'Acadèmia de Dansa a Barcelona: Com Triar | Farray\'s Center',
      description: 'Et parlo com a directora d\'una acadèmia de dansa a Barcelona: què mirar, què evitar i com triar un lloc on de veritat aprenguis a ballar.',
    },
    blogBalletAdultos: {
      title: 'Ballet per a Adults Barcelona: Guia Honesta per Començar | Farray\'s',
      description: 'Ballet per a adults a Barcelona amb mètode segur i progressiu. Descobreix si pots començar de zero, beneficis reals i com triar escola a l\'Eixample.',
    },
    blogDanzaContemporaneaVsJazzBallet: {
      title: 'Contemporània vs Jazz vs Ballet: Guia 2025 | Farray\'s Center',
      description: 'Descobreix les diferències entre dansa contemporània, modern jazz i ballet clàssic. Comparativa tècnica, beneficis i com triar l\'estil que millor s\'adapta a tu.',
    },
    blogDanzasUrbanas: {
      title: 'Danses Urbanes Barcelona: Guia Completa Hip-Hop 2026 | Farray\'s',
      description: '20 anys ensenyant danses urbanes a Barcelona. Breaking, popping, locking i hip-hop amb un professor veterà. Guia definitiva per començar.',
    },
    blogModernJazz: {
      title: 'Modern Jazz Barcelona: Guia Completa 2026 | Farray\'s Center',
      description: 'Descobreix el Modern Jazz amb Alejandro Miñoso, ex solista de Carlos Acosta. Història, tècnica, estils i on aprendre a Barcelona. Guia definitiva.',
    },
    blogPerderMiedoBailar: {
      title: 'Com Perdre la Por a Ballar: Guia Pràctica 2025 | Farray\'s Center',
      description: 'Descobreix tècniques provades per superar la vergonya i la por a ballar. El 80% dels adults senten ansietat en ballar. Aprèn com superar-ho pas a pas.',
    },
    blogFitness: {
      title: 'Fitness i Salut - Blog de Ball | Farray\'s Center Barcelona',
      description: 'Articles sobre els beneficis del ball per a la salut física i mental. Consells de fitness, benestar i exercici a través del ball.',
    },
    blogBaileSaludMental: {
      title: 'Ball i Salut Mental: Beneficis Científics | Farray\'s Center',
      description: 'Descobreix els beneficis científics del ball per a la salut mental. Redueix ansietat 47%, menys demència 76%. Estudis de Harvard, NEJM i més.',
    },
    promoClaseGratis: {
      title: 'La Teva Primera Classe de Ball | Farray\'s Center Barcelona',
      description: 'Reserva la teva classe de prova gratuïta a l\'escola de ball més completa de Barcelona. +15.000 alumnes, +40 estils. Places limitades!',
      robots: 'noindex, nofollow',
    },
    promoSexyReggaeton: {
      title: 'Classe de Sexy Reggaeton a Barcelona | Farray\'s Center',
      description: 'Aprèn a moure\'t al ritme del reggaeton amb sensualitat i confiança a Barcelona. +15.000 alumnes formats. Mètode Farray®. Reserva classe!',
      robots: 'noindex, nofollow',
    },
    // New class pages
    afroContemporaneo: {
      title: 'Classes d\'Afro Contemporani a Barcelona | Fusió de Dansa Africana i Contemporània | Farray\'s Center',
      description: 'Afro Contemporani Barcelona: fusió dansa africana amb tècnica contemporània. Tots nivells. Acadèmia CID-UNESCO.',
    },
    afroJazz: {
      title: 'Classes d\'Afro Jazz a Barcelona | Ritme Africà i Tècnica de Jazz | Farray\'s Center',
      description: 'Afro Jazz Barcelona: ritmes africans i tècnica jazz modern. Expressió corporal, musicalitat i energia. Tots nivells. CID-UNESCO. Reserva!',
    },
    contemporaneo: {
      title: 'Classes de Dansa Contemporània a Barcelona | Tècnica i Expressió | Farray\'s Center',
      description: 'Dansa contemporània Barcelona adults. Tècnica, expressió i creativitat. Acadèmia CID-UNESCO. Reserva classe!',
    },
    stretching: {
      title: 'Classes d\'Stretching per a Ballarins a Barcelona | Flexibilitat i Mobilitat | Farray\'s Center',
      description: 'Classes d\'stretching especialitzades per a ballarins a Barcelona. Millora la teva flexibilitat, mobilitat i preveu lesions. Complement perfecte per a qualsevol estil de ball.',
    },
    hipHop: {
      title: 'Classes de Hip Hop a Barcelona | Aprèn amb Professionals | Farray\'s Center',
      description: 'Aprèn Hip Hop a Barcelona amb professors experts. Classes des de principiant fins a avançat. Estils: Old School, New Style, House i més. Reserva classe!',
    },
    entrenamientoBailarines: {
      title: 'Entrenament per a Ballarins a Barcelona | Tècnica i Condició Física | Farray\'s Center',
      description: 'Entrenament ballarins Barcelona. Millora tècnica, força, resistència i flexibilitat. Programa dissenyat per professionals dansa CID-UNESCO.',
    },
    bachataLadyStyle: {
      title: 'Classes de Bachata Lady Style a Barcelona | Estil Femení i Sensualitat | Farray\'s Center',
      description: 'Bachata Lady Style Barcelona. Feminitat, elegància i estil personal ballant bachata. Moviments sensuels i expressius. Reserva classe!',
    },
    bumBum: {
      title: 'Bum Bum - Exercicis de Glutis a Barcelona | Tonificació i Fitness | Farray\'s Center',
      description: 'Classes de Bum Bum a Barcelona: exercicis especialitzats per a glutis i cames. Tonifica, enforteix i modela amb música i energia. Reserva classe!',
    },
    cuerpoFitPage: {
      title: 'Acondicionament Físic per a Ballarins a Barcelona | Cuerpo Fit | Farray\'s Center',
      description: 'Classes d\'acondicionament físic per a ballarins a Barcelona. Millora força, flexibilitat i resistència amb el Mètode Farray. Entrenament funcional especialitzat.',
    },
    // New non-class pages
    profesores: {
      title: 'Professors de Ball a Barcelona | Equip de Farray\'s Center',
      description: 'Coneix el nostre equip de professors de ball a Barcelona. Ballarins professionals de tot el món amb anys d\'experiència. Formació CID-UNESCO.',
    },
    faq: {
      title: 'Preguntes Freqüents | Farray\'s International Dance Center Barcelona',
      description: 'Resol els teus dubtes sobre les nostres classes de ball a Barcelona. Horaris, preus, nivells, inscripció i tot el que necessites saber abans de començar.',
    },
    alquilerSalas: {
      title: 'Lloguer de Sales de Ball a Barcelona | 4 Espais Professionals | Farray\'s Center',
      description: 'Lloga les nostres 4 sales de ball professionals a Barcelona (40-120m²). Sòl de dansa, miralls, climatització i so. Des de 14€/hora. Entre Plaça Espanya i Sants.',
    },
    estudioGrabacion: {
      title: 'Estudi de Gravació de Ball a Barcelona | Producció Audiovisual | Farray\'s Center',
      description: 'Estudi de gravació per a vídeos de ball a Barcelona. Equipament professional, il·luminació i so. Perfecte per a videoclips, tutorials i contingut per a xarxes.',
    },
    // Legal pages
    termsConditions: {
      title: 'Termes i Condicions | Farray\'s International Dance Center',
      description: 'Termes i condicions d\'ús dels serveis de Farray\'s Center. Informació legal sobre inscripcions, pagaments i polítiques de l\'acadèmia.',
    },
    legalNotice: {
      title: 'Avís Legal | Farray\'s International Dance Center',
      description: 'Avís legal de Farray\'s Center. Informació sobre l\'empresa, propietat intel·lectual i condicions d\'ús del lloc web.',
    },
    privacyPolicy: {
      title: 'Política de Privacitat | Farray\'s International Dance Center',
      description: 'Política de privacitat de Farray\'s Center. Informació sobre el tractament de dades personals segons el RGPD.',
    },
    cookiePolicy: {
      title: 'Política de Cookies | Farray\'s International Dance Center',
      description: 'Política de cookies de Farray\'s Center. Informació sobre les cookies utilitzades al nostre lloc web.',
    },
    // Additional pages
    serviciosBaile: {
      title: 'Serveis de Ball a Barcelona | Farray\'s Center',
      description: 'Serveis professionals de ball a Barcelona: classes particulars, coreografies per a esdeveniments, shows i espectacles.',
    },
    ubicacion: {
      title: 'Com Arribar a Farray\'s Center | Escola de Ball Barcelona',
      description: 'Com arribar a Farray\'s Center a Barcelona. Metro Rocafort (L1) a 4 min, Sants Estació a 8 min. Carrer d\'Entença 100. Perfectament connectat.',
    },
    calendario: {
      title: 'Calendari d\'Esdeveniments | Farray\'s International Dance Center',
      description: 'Calendari d\'esdeveniments, workshops i activitats especials a Farray\'s Center Barcelona.',
    },
    notFound: {
      title: 'Pàgina No Trobada | 404 | Farray\'s Center',
      description: 'La pàgina que busques no existeix. Torna a inici o explora +40 classes de ball a Barcelona. Acadèmia CID-UNESCO. Descobreix el teu estil!',
      robots: 'noindex, nofollow',
    },
    // Generic Dance Landing Pages (auto-generated from LANDING_METADATA)
    ...LANDING_METADATA.ca,
  },
  en: {
    home: {
      title: 'Farray\'s Center - Urban Dance School in Barcelona',
      description: 'Discover the best urban dance classes in Barcelona. Dancehall and more. Experienced teachers and inclusive atmosphere.',
    },
    classes: {
      title: 'Dance Classes - Farray\'s Center Barcelona',
      description: 'Dancehall and urban dance classes All levels. Flexible schedules in Barcelona.',
    },
    classesHub: {
      title: 'All Dance Classes in Barcelona | Farray\'s Center',
      description: 'Discover +40 dance styles in Barcelona: Dancehall, Salsa, Bachata, Hip Hop, Twerk, Afrobeat and more. CID-UNESCO Academy. Book your class!',
    },
    horariosPrecio: {
      title: 'Schedule & Prices | Dance Classes Barcelona | Farray\'s Center',
      description: 'Check our dance class schedules and prices in Barcelona. Monthly passes, single classes and special packs. School near Plaza España.',
      robots: 'noindex, nofollow',
    },
    horariosClases: {
      title: 'Dance Class Schedule Barcelona 2026 | Farray\'s Center',
      description: 'Updated dance class schedules in Barcelona. Mornings, evenings and weekends. Salsa, Bachata, Hip Hop, Dancehall and +40 styles. Plaza España.',
    },
    preciosClases: {
      title: 'Dance Class Prices Barcelona | Passes & Rates | Farray\'s Center',
      description: 'Dance class prices and rates in Barcelona. Monthly passes from €45, single classes and packs. First trial class available. Farray\'s Center Plaza España.',
    },
    danza: {
      title: 'Dance Classes in Barcelona | Ballet, Contemporary & Jazz | Farray\'s Center',
      description: 'Dance classes Barcelona: Cuban Ballet, Contemporary, Modern Jazz, Afro Jazz. CID-UNESCO accredited academy. +40 styles. Book your class!',
    },
    salsaBachata: {
      title: 'Salsa and Bachata Classes in Barcelona | Cuban Salsa, Sensual Bachata & more | Farray\'s Center',
      description: 'Learn to dance Cuban Salsa, Sensual and Dominican Bachata, Timba, Son and more in Barcelona. School founded by Cuban masters with experience in Havana\'s best academies. Book your trial class.',
    },
    bachataSensual: {
      title: 'Sensual Bachata Classes in Barcelona | Learn with World Champions | Farray\'s Center',
      description: 'Learn sensual bachata in Barcelona with Mathias Font and Eugenia Trujillo, world champions in Salsa LA. Classes from beginner to advanced near Plaza España.',
    },
    salsaCubana: {
      title: 'Cuban Salsa Classes in Barcelona | Casino, Rueda & Son | Farray\'s Center',
      description: 'Cuban Salsa Barcelona with Cuban masters. Casino, Rueda and Son Cubano. Farray Method® Havana technique. CID-UNESCO. Book your class!',
    },
    salsaLadyStyle: {
      title: 'Salsa Lady Style Classes in Barcelona | Feminine Style & Elegance | Farray\'s Center',
      description: 'Salsa Lady Style Barcelona with Yunaisy Farray. Femininity, elegance & style dancing salsa. Farray Method® CID-UNESCO.',
    },
    folkloreCubano: {
      title: 'Cuban Folklore Classes in Barcelona | Dances to the Orishas | Farray\'s Center',
      description: 'Learn authentic Cuban Folklore in Barcelona. Dances to the Orishas, Yoruba, Rumba and more. Specialized Cuban masters. Between Plaza España and Sants. Book now!',
    },
    timba: {
      title: 'Timba Classes in Barcelona | Lady Timba & Partner Timba | Farray\'s Center',
      description: 'Cuban Timba Barcelona with Cuban masters. Lady Timba & Partner Timba. Despelote, improvisation & Cuban flavor. Book!',
    },
    danzasUrbanas: {
      title: 'Urban Dance Classes in Barcelona | Hip Hop, Dancehall, K-Pop & Reggaeton | Farray\'s Center',
      description: 'Urban dance Barcelona: Hip Hop, Dancehall, Reggaeton, Twerk, Afrobeat. Leading academy for urban styles. CID-UNESCO. Book your class!',
    },
    dancehall: {
      title: 'Dancehall Classes in Barcelona - Urban Dance Academy | Farray\'s Center',
      description: 'Learn authentic Dancehall in Barcelona with expert teachers. Classes All levels. Discover the rhythm of Jamaica.',
    },
    twerk: {
      title: 'Twerk Classes in Barcelona | Farray\'s Center',
      description: 'Twerk and Perreo Barcelona with Sandra Gómez. Urban dance all levels. Unleash energy and confidence. CID-UNESCO Academy. Book class!',
    },
    afrobeat: {
      title: 'Afrobeats and Afrodance Classes in Barcelona | Farray\'s Center',
      description: 'Learn Afrobeats and Afrodance in Barcelona with native African instructors. Amapiano, Ntcham and modern African dance classes All levels.',
    },
    kpop: {
      title: 'K-Pop Dance Classes in Barcelona | Farray\'s Center',
      description: 'K-Pop Dance classes in Barcelona. Learn choreographies from BTS, BLACKPINK, Stray Kids and more. All levels. CID-UNESCO Academy.',
    },
    commercial: {
      title: 'Commercial Dance Classes in Barcelona | Farray\'s Center',
      description: 'Commercial Dance classes in Barcelona. Learn music video style choreography, performance technique and stage presence. All levels. CID-UNESCO Academy.',
    },
    kizomba: {
      title: 'Kizomba Classes in Barcelona | Farray\'s Center',
      description: 'Kizomba classes in Barcelona. Learn this sensual Angolan dance with partner connection and African musicality. All levels. CID-UNESCO Academy.',
    },
    hipHopReggaeton: {
      title: 'Hip Hop Reggaeton Classes in Barcelona | Farray\'s Center',
      description: 'Hip Hop Reggaeton Barcelona with Charlie Breezy. Unique fusion with flow. All levels near Plaza España. CID-UNESCO Academy. Book class!',
    },
    sexyReggaeton: {
      title: 'Sexy Reggaeton Classes in Barcelona | Farray\'s Center',
      description: 'Sexy Reggaeton in Barcelona. Perreo, body roll and body expression. All levels. CID-UNESCO Academy. Book your class!',
    },
    reggaetonCubano: {
      title: 'Cuban Reggaeton Classes in Barcelona | Farray\'s Center',
      description: 'Authentic Cuban Reggaeton in Barcelona. Reparto, Cubatón and improvisation. Rhythm and body isolation. CID-UNESCO. Book your class!',
    },
    heelsBarcelona: {
      title: 'Heels Dance Classes in Barcelona | Farray\'s Center',
      description: 'Dance in heels in Barcelona: Femmology and Sexy Style. Elegance, expression and confidence. All levels. CID-UNESCO Academy. Book now!',
    },
    femmology: {
      title: 'Femmology Classes in Barcelona | Farray\'s Center',
      description: 'Femmology in Barcelona: dance therapy in heels. Femininity, self-esteem and empowerment. Exclusive Farray Method®. CID-UNESCO. Book your class!',
    },
    sexyStyle: {
      title: 'Sexy Style Classes in Barcelona | Farray\'s Center',
      description: 'Sexy Style in Barcelona. Express sensuality, confidence and movement. All levels. CID-UNESCO Academy. Book your class!',
    },
    modernJazz: {
      title: 'Modern Jazz Classes in Barcelona | Technique and Expression with Alejandro Miñoso | Farray\'s Center',
      description: 'Modern Jazz classes in Barcelona with Alejandro Miñoso. Technique, musicality and body expression. From beginner to advanced. Book your trial class!',
    },
    ballet: {
      title: 'Ballet Classes in Barcelona | Classical Technique and Elegance | Farray\'s Center',
      description: 'Classical ballet Barcelona for adults. Technique, posture and elegance with ENA-trained masters. CID-UNESCO Academy. Plaza España. Book!',
    },
    cuerpoFit: {
      title: 'Cuerpo-Fit Barcelona | Cardio Dance Workout | Farray\'s Center',
      description: 'Cuerpo-Fit in Barcelona: burn 400-500 calories dancing. Full body workout with dance, cardio and toning. CID-UNESCO. Book your class!',
    },
    baileManananas: {
      title: 'Morning Dance Classes in Barcelona | Farray\'s Center',
      description: 'Morning dance classes in Barcelona from 10am to 1pm. Contemporary, Ballet, Jazz and more. Ideal for afternoon shifts. CID-UNESCO Academy. Book now!',
    },
    clasesParticulares: {
      title: 'Private Dance Classes in Barcelona | Farray\'s Center',
      description: 'Private dance classes in Barcelona 100% personalized. Dedicated instructor, flexible schedules, +25 styles. CID-UNESCO Academy. Book now!',
    },
    teamBuilding: {
      title: 'Dance Team Building in Barcelona | Farray\'s Center',
      description: 'Dance team building in Barcelona for companies. +500 events completed. Unique experience, no empty dynamics. CID-UNESCO Academy.',
    },
    about: {
      title: 'About Us | Farray\'s International Dance Center Barcelona',
      description: 'Learn about our history, values and team. Dance academy in Barcelona founded in 2017 with our own method and international teachers.',
    },
    yunaisy: {
      title: 'Yunaisy Farray | Founder and Director | Farray\'s Center',
      description: 'Yunaisy Farray: Cuban dancer trained at ENA, founder of Farray\'s Center. Got Talent España, The Dancer. Creator of Farray Method®. +20 years in dance.',
    },
    metodoFarray: {
      title: 'Farray Method® | Exclusive Dance System | Farray\'s Center',
      description: 'Farray Method®: pedagogical system combining Cuban technique, Afro-Caribbean rhythm & innovation. CID-UNESCO certified. Designed for European adults.',
    },
    merchandising: {
      title: 'Official Merchandising | Farray\'s Center',
      description: 'Official Farray\'s Center merchandise: t-shirts, hoodies and accessories. Take your passion for dance with you. Shop now!',
    },
    regalaBaile: {
      title: 'Gift Dance | Gift Cards | Farray\'s Center',
      description: 'Gift dance classes in Barcelona. Gift cards for +25 styles. The perfect gift for dance lovers. CID-UNESCO Academy.',
    },
    facilities: {
      title: 'Facilities | Dance Studios Barcelona | Farray\'s Center',
      description: '700m² with 4 professional dance studios in Barcelona. Mirrors, bars, technical flooring and dressing rooms. Eixample, near Plaza España.',
    },
    contact: {
      title: 'Contact | Farray\'s International Dance Center Barcelona',
      description: 'Contact Farray\'s Center Barcelona. Carrer d\'Entença 100. Tel: +34 622 24 70 85. CID-UNESCO dance school. +40 styles. Book class!',
    },
    reservas: {
      title: 'Book Your Welcome Class | Farray\'s Center Barcelona',
      description: 'Book your welcome class at Farray\'s Center Barcelona. +25 dance styles. Exclusive Farray Method®. CID-UNESCO Academy. First class!',
    },

    hazteSocio: {
      title: 'Become a Member | Dance Classes Barcelona | Farray\'s Center',
      description: 'Join Farray\'s. From 50€/month. +80 weekly classes, +25 styles. No commitment. App to book. Start today!',
      robots: 'noindex, nofollow',
    },
    yrProject: {
      title: 'Y&R | Yunaisy & Reynier - Dance Artists',
      description: 'Contact Y&R (Yunaisy & Reynier). Dance artists, shows and classes in Barcelona. WhatsApp and Instagram.',
      robots: 'noindex, nofollow',
    },
    miReserva: {
      title: 'My Booking | Farray\'s Center Barcelona',
      description: 'Manage your class booking at Farray\'s Center Barcelona. Reschedule or cancel your class.',
      robots: 'noindex, nofollow',
    },
    fichaje: {
      title: 'Teacher Clock-In | Farray\'s Center',
      description: 'Clock-in system for Farray\'s Center Barcelona teachers.',
      robots: 'noindex, nofollow',
    },
    fichajeResumen: {
      title: 'Sign Monthly Summary | Farray\'s Center',
      description: 'Review and sign your monthly work hours summary at Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    adminFichajes: {
      title: 'Clock-In Dashboard | Farray\'s Center',
      description: 'Clock-in administration panel for Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    adminReservas: {
      title: 'Trial Bookings | Farray\'s Center',
      description: 'Free trial class bookings management panel.',
      robots: 'noindex, nofollow',
    },
    feedbackGracias: {
      title: 'Thank You for Your Feedback | Farray\'s Center Barcelona',
      description: 'Your feedback helps us improve. Thank you for sharing your experience with us.',
      robots: 'noindex, nofollow',
    },
    feedbackComentario: {
      title: 'Leave a Comment | Farray\'s Center Barcelona',
      description: 'Tell us more about your experience. Your feedback helps us improve.',
      robots: 'noindex, nofollow',
    },
    asistenciaConfirmada: {
      title: 'Attendance Confirmation | Farray\'s Center Barcelona',
      description: 'Attendance confirmation for your dance class at Farray\'s Center Barcelona.',
      robots: 'noindex, nofollow',
    },
    blog: {
      title: 'Dance & Ballet Blog | Farray\'s Center Barcelona',
      description: 'Dance blog with tips, tutorials and history. Articles by Cuban professionals on salsa, bachata, hip hop, ballet and more. CID-UNESCO Academy.',
    },
    blogLifestyle: {
      title: 'Lifestyle & Dance | Wellbeing & Life Balance | Farray\'s Center Blog',
      description: 'Discover how dance transforms your life. Articles about wellbeing, happiness and lifestyle through dance.',
    },
    blogBeneficiosSalsa: {
      title: '10 Benefits of Dancing Salsa That Will Change Your Life | Farray\'s Center',
      description: '10 scientifically proven benefits of salsa: burn 400 cal/hour, improve heart health, reduce stress, boost self-esteem. Complete guide + studies.',
    },
    blogHistoria: {
      title: 'Dance History | Origins & Evolution | Farray\'s Center Blog',
      description: 'Fascinating dance history: origins, evolution in Barcelona. Articles on salsa, bachata, dancehall and more. Expert insights from professionals.',
    },
    blogHistoriaSalsa: {
      title: 'History of Salsa: From Caribbean to Barcelona | Farray\'s Center',
      description: 'History of salsa: origins in Caribbean and New York, arrival in Barcelona. 60+ years of rhythm that changed the world. African & Cuban roots.',
    },
    blogHistoriaBachata: {
      title: 'History of Bachata: From DR to Barcelona | Farray\'s Center',
      description: 'Discover the history of bachata: from its humble origins in the Dominican Republic to becoming a worldwide phenomenon. Romeo Santos, sensual bachata and more.',
    },
    blogTutoriales: {
      title: 'Dance Tutorials | Farray\'s Center Blog',
      description: 'Guides and tutorials to learn dancing: techniques, basic steps and professional tips for salsa, bachata, dancehall and more styles.',
    },
    blogSalsaRitmo: {
      title: 'Salsa: The Rhythm that Conquered the World | Farray\'s Center',
      description: 'Discover the different salsa styles: Cuban, rueda de casino, line salsa and more. Complete guide to understand and dance salsa in Barcelona.',
    },
    blogSalsaVsBachata: {
      title: 'Salsa vs Bachata: Which to Choose? 2025 Guide | Farray\'s Center',
      description: 'Salsa vs bachata: differences in rhythm, steps and expression. Complete guide to choose your Latin dance style. Classes in Barcelona.',
    },
    blogClasesSalsaBarcelona: {
      title: 'Men and Women, Shall We Speak Salsa? | Farray\'s Center Blog',
      description: 'Salsa as universal language: dance floor as space of connection between men and women. Deep insights on Latin dance culture. By Mar Guerrero.',
    },
    blogTips: {
      title: 'Dance Tips | Farray\'s Center Blog',
      description: 'Practical tips and guides for beginners and dancers of all levels in Barcelona.',
    },
    blogClasesPrincipiantes: {
      title: 'Beginner Dance Classes in Barcelona | Farray\'s Center',
      description: 'Complete guide to start dancing from scratch in Barcelona. From €10/class, monthly from €50. +25 styles, +15,000 students.',
    },
    blogAcademiaDanza: {
      title: 'Dance Academy in Barcelona: How to Choose | Farray\'s Center',
      description: 'As a dance academy director in Barcelona, I share what to look for, what to avoid, and how to choose a place where you truly learn to dance.',
    },
    blogBalletAdultos: {
      title: 'Adult Ballet Barcelona: Honest Guide to Getting Started | Farray\'s',
      description: 'Adult ballet in Barcelona with safe and progressive method. Discover if you can start from scratch, real benefits, and how to choose a school in Eixample.',
    },
    blogDanzaContemporaneaVsJazzBallet: {
      title: 'Contemporary vs Jazz vs Ballet: 2025 Guide | Farray\'s Center',
      description: 'Discover the differences between contemporary dance, modern jazz and classical ballet. Technical comparison, benefits and how to choose the style that suits you best.',
    },
    blogDanzasUrbanas: {
      title: 'Urban Dance Barcelona: Complete Hip-Hop Guide 2026 | Farray\'s',
      description: '20 years teaching urban dance in Barcelona. Breaking, popping, locking and hip-hop with a veteran teacher. The definitive guide to get started.',
    },
    blogModernJazz: {
      title: 'Modern Jazz Barcelona: Complete Guide 2026 | Farray\'s Center',
      description: 'Discover Modern Jazz with Alejandro Miñoso, former Carlos Acosta Company soloist. History, technique, styles and where to learn in Barcelona. Ultimate guide.',
    },
    blogPerderMiedoBailar: {
      title: 'How to Overcome Fear of Dancing: Practical Guide 2025 | Farray\'s Center',
      description: 'Discover proven techniques to overcome shyness and fear of dancing. 80% of adults feel anxiety when dancing. Learn how to overcome it step by step.',
    },
    blogFitness: {
      title: 'Fitness & Health - Dance Blog | Farray\'s Center Barcelona',
      description: 'Scientifically proven benefits of dancing for physical and mental health. Fitness tips, wellness strategies and exercise through dance. Expert advice.',
    },
    blogBaileSaludMental: {
      title: 'Dancing and Mental Health: Scientific Benefits | Farray\'s Center',
      description: 'Discover the scientific benefits of dancing for mental health. Reduces anxiety 47%, dementia risk 76% lower. Studies from Harvard, NEJM and more.',
    },
    promoClaseGratis: {
      title: 'Your First Dance Class | Farray\'s Center Barcelona',
      description: 'Book your trial class at Barcelona\'s most complete dance school. +15,000 students, +40 styles. CID-UNESCO certified. Limited spots!',
      robots: 'noindex, nofollow',
    },
    promoSexyReggaeton: {
      title: 'Sexy Reggaeton Class in Barcelona | Farray\'s Center',
      description: 'Learn to move to reggaeton with sensuality and confidence in Barcelona. +15,000 students trained. Farray Method®. Book your class!',
      robots: 'noindex, nofollow',
    },
    // New class pages
    afroContemporaneo: {
      title: 'Afro Contemporary Classes in Barcelona | African & Contemporary Dance Fusion | Farray\'s Center',
      description: 'Learn Afro Contemporary in Barcelona: fusion of traditional African dance with contemporary technique. Classes All levels. CID-UNESCO Academy. Book your class!',
    },
    afroJazz: {
      title: 'Afro Jazz Classes in Barcelona | African Rhythm & Jazz Technique | Farray\'s Center',
      description: 'Afro Jazz classes in Barcelona: combining African rhythms with modern jazz technique. Body expression, musicality and energy. All levels. Book now!',
    },
    contemporaneo: {
      title: 'Contemporary Dance Classes in Barcelona | Technique & Expression | Farray\'s Center',
      description: 'Contemporary dance classes in Barcelona for adults. Develop technique, body expression and creativity. CID-UNESCO accredited academy. Book your trial class!',
    },
    stretching: {
      title: 'Stretching Classes for Dancers in Barcelona | Flexibility & Mobility | Farray\'s Center',
      description: 'Specialized stretching classes for dancers in Barcelona. Improve your flexibility, mobility and prevent injuries. Perfect complement for any dance style.',
    },
    hipHop: {
      title: 'Hip Hop Classes in Barcelona | Learn with Professionals | Farray\'s Center',
      description: 'Learn Hip Hop in Barcelona with expert teachers. Classes from beginner to advanced. Styles: Old School, New Style, House and more. Book class!',
    },
    entrenamientoBailarines: {
      title: 'Training for Dancers in Barcelona | Technique & Fitness | Farray\'s Center',
      description: 'Specialized training for dancers in Barcelona. Improve your technique, strength, endurance and flexibility. Program designed by dance professionals.',
    },
    bachataLadyStyle: {
      title: 'Bachata Lady Style Classes in Barcelona | Feminine Style & Sensuality | Farray\'s Center',
      description: 'Bachata Lady Style Barcelona. Femininity, elegance & personal style dancing bachata. Sensual and expressive movements. Book your class!',
    },
    bumBum: {
      title: 'Bum Bum - Glute Exercises in Barcelona | Toning & Fitness | Farray\'s Center',
      description: 'Bum Bum classes in Barcelona: specialized exercises for glutes and legs. Tone, strengthen and sculpt with music and energy. Book class!',
    },
    cuerpoFitPage: {
      title: 'Body Conditioning for Dancers in Barcelona | Cuerpo Fit | Farray\'s Center',
      description: 'Body conditioning classes for dancers in Barcelona. Improve strength, flexibility and endurance with the Farray Method. Specialized functional training.',
    },
    // New non-class pages
    profesores: {
      title: 'Dance Teachers in Barcelona | Farray\'s Center Team',
      description: 'Meet our team of dance teachers in Barcelona. Professional dancers from around the world with years of experience. CID-UNESCO certified.',
    },
    faq: {
      title: 'Frequently Asked Questions | Farray\'s International Dance Center Barcelona',
      description: 'Get answers about our dance classes in Barcelona. Schedules, prices, levels, registration and everything you need to know before starting.',
    },
    alquilerSalas: {
      title: 'Dance Studio Rental in Barcelona | 4 Professional Spaces | Farray\'s Center',
      description: 'Rent our 4 professional dance studios in Barcelona (40-120m²). Dance floor, mirrors, AC and sound. From €14/hour. Between Plaza España and Sants.',
    },
    estudioGrabacion: {
      title: 'Dance Video Studio in Barcelona | Audiovisual Production | Farray\'s Center',
      description: 'Recording studio for dance videos in Barcelona. Professional equipment, lighting and sound. Perfect for music videos, tutorials and social media content.',
    },
    // Legal pages
    termsConditions: {
      title: 'Terms and Conditions | Farray\'s International Dance Center',
      description: 'Terms and conditions for Farray\'s Center services. Legal information about registration, payments and academy policies.',
    },
    legalNotice: {
      title: 'Legal Notice | Farray\'s International Dance Center',
      description: 'Legal notice for Farray\'s Center. Information about the company, intellectual property and website terms of use.',
    },
    privacyPolicy: {
      title: 'Privacy Policy | Farray\'s International Dance Center',
      description: 'Privacy policy for Farray\'s Center. Information about personal data processing according to GDPR.',
    },
    cookiePolicy: {
      title: 'Cookie Policy | Farray\'s International Dance Center',
      description: 'Cookie policy for Farray\'s Center. Information about the cookies used on our website.',
    },
    // Additional pages
    serviciosBaile: {
      title: 'Dance Services in Barcelona | Farray\'s Center',
      description: 'Professional dance services in Barcelona: private lessons, event choreography, shows and performances. Contact us.',
    },
    ubicacion: {
      title: 'How to Get to Farray\'s Center | Dance School Barcelona',
      description: 'How to get to Farray\'s Center in Barcelona. Metro Rocafort (L1) 4 min walk, Sants Station 8 min. Carrer d\'Entença 100. Perfectly connected.',
    },
    calendario: {
      title: 'Events Calendar | Farray\'s International Dance Center',
      description: 'Calendar of events, workshops and special activities at Farray\'s Center Barcelona. Stay up to date with all the news.',
    },
    notFound: {
      title: 'Page Not Found | 404 | Farray\'s Center',
      description: 'The page you are looking for does not exist. Go back to the home page or explore our dance classes in Barcelona.',
      robots: 'noindex, nofollow',
    },
    // Generic Dance Landing Pages (auto-generated from LANDING_METADATA)
    ...LANDING_METADATA.en,
  },
  fr: {
    home: {
      title: 'Farray\'s Center - École de Danse Urbaine à Barcelone',
      description: 'Meilleurs cours danse urbaine Barcelone : Dancehall, Hip Hop, Reggaeton. Professeurs expérimentés, ambiance inclusive. Académie CID-UNESCO. Réservez!',
    },
    classes: {
      title: 'Cours de Danse - Farray\'s Center Barcelone',
      description: 'Cours de Dancehall et danse urbaine Tous niveaux. Horaires flexibles à Barcelone.',
    },
    classesHub: {
      title: 'Tous les Cours de Danse à Barcelone | Farray\'s Center',
      description: 'Découvrez +40 styles de danse à Barcelone : Dancehall, Salsa, Bachata, Hip Hop, Twerk, Afrobeat et plus. Académie CID-UNESCO. Réservez cours!',
    },
    horariosPrecio: {
      title: 'Horaires et Tarifs | Cours de Danse Barcelone | Farray\'s Center',
      description: 'Consultez les horaires et tarifs de nos cours de danse à Barcelone. Abonnements mensuels, cours à l\'unité et packs spéciaux. École près Plaza España.',
      robots: 'noindex, nofollow',
    },
    horariosClases: {
      title: 'Horaires Cours de Danse Barcelone 2026 | Farray\'s Center',
      description: 'Horaires actualisés des cours de danse à Barcelone. Matins, après-midis et week-ends. Salsa, Bachata, Hip Hop, Dancehall et +40 styles. Plaza España.',
    },
    preciosClases: {
      title: 'Tarifs Cours de Danse Barcelone | Abonnements et Prix | Farray\'s Center',
      description: 'Tarifs et prix des cours de danse à Barcelone. Abonnements mensuels dès 45€, cours à l\'unité et packs. Premier cours d\'essai. Farray\'s Center Plaza España.',
    },
    danza: {
      title: 'Cours de Danse à Barcelone | Ballet, Contemporain et Jazz | Farray\'s Center',
      description: 'Danse Barcelone: Ballet Cubain, Contemporain, Modern Jazz, Afro Jazz. Académie CID-UNESCO. Réservez votre cours!',
    },
    salsaBachata: {
      title: 'Cours de Salsa et Bachata à Barcelone | Salsa Cubaine, Bachata Sensuelle et plus | Farray\'s Center',
      description: 'Apprenez la Salsa Cubaine et Bachata Sensuelle à Barcelone avec maîtres cubains. École CID-UNESCO avec méthode exclusive. Réservez votre cours d\'essai!',
    },
    bachataSensual: {
      title: 'Cours de Bachata Sensuelle à Barcelone | Apprenez avec des Champions du Monde | Farray\'s Center',
      description: 'Apprenez la bachata sensuelle à Barcelone avec Mathias Font et Eugenia Trujillo, champions du monde de Salsa LA. Cours du débutant à l\'avancé près Plaza España.',
    },
    salsaCubana: {
      title: 'Cours de Salsa Cubaine à Barcelone | Casino, Rueda et Son | Farray\'s Center',
      description: 'Salsa Cubaine authentique à Barcelone avec maîtres cubains. Casino, Rueda et Son Cubain. Méthode Farray® technique La Havane. Réservez cours!\'essai!',
    },
    salsaLadyStyle: {
      title: 'Cours de Salsa Lady Style à Barcelone | Style Féminin et Élégance | Farray\'s Center',
      description: 'Cours de Salsa Lady Style à Barcelone avec Yunaisy Farray. Féminité, élégance et style en dansant la salsa. Méthode Farray® CID-UNESCO. Réservez!',
    },
    folkloreCubano: {
      title: 'Cours de Folklore Cubain à Barcelone | Danses aux Orishas | Farray\'s Center',
      description: 'Folklore Cubain authentique Barcelone. Danses Orishas, Yoruba, Rumba. Maîtres cubains spécialisés. Plaza España. CID-UNESCO. Réservez!',
    },
    timba: {
      title: 'Cours de Timba à Barcelone | Lady Timba et Timba en Couple | Farray\'s Center',
      description: 'Apprenez la Timba Cubaine à Barcelone avec maîtres cubains. Lady Timba et Timba en Couple. Despelote, improvisation et saveur cubaine. Réservez!',
    },
    danzasUrbanas: {
      title: 'Cours de Danses Urbaines à Barcelone | Hip Hop, Dancehall, K-Pop et Reggaeton | Farray\'s Center',
      description: 'Danses urbaines Barcelone: Hip Hop, Dancehall, Reggaeton, Twerk, Afrobeat. Académie leader. Réservez cours!',
    },
    dancehall: {
      title: 'Cours de Dancehall à Barcelone - Académie de Danse Urbaine | Farray\'s Center',
      description: 'Dancehall authentique Barcelone avec professeurs experts. Tous niveaux. Rythme jamaïcain. Académie CID-UNESCO. Réservez cours!',
    },
    twerk: {
      title: 'Cours de Twerk à Barcelone | Farray\'s Center',
      description: 'Twerk et Perreo Barcelone avec Sandra Gómez. Danse urbaine tous niveaux. Libérez énergie et confiance! Académie CID-UNESCO. Réservez cours!',
    },
    afrobeat: {
      title: 'Cours d\'Afrobeats et Afrodance à Barcelone | Farray\'s Center',
      description: 'Apprenez l\'Afrobeats et l\'Afrodance à Barcelone avec des professeurs natifs d\'Afrique. Cours d\'Amapiano, Ntcham et danses africaines modernes Tous niveaux.',
    },
    kpop: {
      title: 'Cours de K-Pop Dance à Barcelone | Farray\'s Center',
      description: 'Cours de K-Pop Dance à Barcelone. Apprenez les chorégraphies de BTS, BLACKPINK, Stray Kids et plus. Tous niveaux. Académie CID-UNESCO.',
    },
    commercial: {
      title: 'Cours de Commercial Dance à Barcelone | Farray\'s Center',
      description: 'Commercial Dance Barcelone. Chorégraphies style clip, technique performance et présence scénique. Tous niveaux. Académie CID-UNESCO.',
    },
    kizomba: {
      title: 'Cours de Kizomba à Barcelone | Farray\'s Center',
      description: 'Cours de Kizomba à Barcelone. Apprenez cette danse angolaise sensuelle avec connexion en couple et musicalité africaine. Tous niveaux. Académie CID-UNESCO.',
    },
    hipHopReggaeton: {
      title: 'Cours de Hip Hop Reggaeton à Barcelone | Farray\'s Center',
      description: 'Hip Hop Reggaeton Barcelone avec Charlie Breezy. Fusion unique avec flow. Tous niveaux. Près Plaza España.',
    },
    sexyReggaeton: {
      title: 'Cours de Sexy Reggaeton à Barcelone | Farray\'s Center',
      description: 'Sexy Reggaeton à Barcelone. Perreo, body roll et expression corporelle. Tous niveaux. Académie CID-UNESCO. Réservez votre cours!',
    },
    reggaetonCubano: {
      title: 'Cours de Reggaeton Cubain à Barcelone | Farray\'s Center',
      description: 'Reggaeton Cubain authentique à Barcelone. Reparto, Cubatón et improvisation. Rythme et isolation corporelle. CID-UNESCO. Réservez votre cours!',
    },
    heelsBarcelona: {
      title: 'Cours de Heels à Barcelone | Farray\'s Center',
      description: 'Danse en talons à Barcelone : Femmology et Sexy Style. Élégance, expression et confiance. Tous niveaux. Académie CID-UNESCO. Réservez!',
    },
    femmology: {
      title: 'Cours de Femmology à Barcelone | Farray\'s Center',
      description: 'Femmology à Barcelone : danse-thérapie en talons. Féminité, estime de soi et empowerment. Méthode Farray® exclusive. CID-UNESCO. Réservez!',
    },
    sexyStyle: {
      title: 'Cours de Sexy Style à Barcelone | Farray\'s Center',
      description: 'Sexy Style à Barcelone. Exprimez sensualité, confiance et mouvement. Tous niveaux. Académie CID-UNESCO. Réservez votre cours!',
    },
    modernJazz: {
      title: 'Cours de Modern Jazz à Barcelone | Technique et Expression avec Alejandro Miñoso | Farray\'s Center',
      description: 'Cours de Modern Jazz à Barcelone avec Alejandro Miñoso. Technique, musicalité et expression corporelle. Du débutant à l\'avancé. Académie CID-UNESCO. Réservez cours!',
    },
    ballet: {
      title: 'Cours de Ballet à Barcelone | Technique Classique et Élégance | Farray\'s Center',
      description: "Cours de ballet classique à Barcelone pour adultes. Apprenez la technique, la posture et l'élégance avec des maîtres formés à l'ENA. Académie CID-UNESCO entre Plaza España et Sants.",
    },
    cuerpoFit: {
      title: 'Cuerpo-Fit Barcelone | Cardio Dance | Farray\'s Center',
      description: 'Cuerpo-Fit à Barcelone : brûlez 400-500 calories en dansant. Entraînement full body avec danse, cardio et tonification. CID-UNESCO. Réservez!',
    },
    baileManananas: {
      title: 'Cours de Danse le Matin à Barcelone | Farray\'s Center',
      description: 'Danse le matin à Barcelone de 10h à 13h. Contemporain, Ballet, Jazz et plus. Idéal pour équipes après-midi. Académie CID-UNESCO. Réservez!',
    },
    clasesParticulares: {
      title: 'Cours Particuliers de Danse à Barcelone | Farray\'s Center',
      description: 'Cours particuliers de danse à Barcelone 100% personnalisés. Professeur dédié, horaires flexibles, +25 styles. Académie CID-UNESCO. Réservez!',
    },
    teamBuilding: {
      title: 'Team Building Danse à Barcelone | Farray\'s Center',
      description: 'Team building danse à Barcelone pour entreprises. +500 événements réalisés. Expérience unique, sans dynamiques vides. Académie CID-UNESCO.',
    },
    about: {
      title: 'À Propos | Farray\'s International Dance Center Barcelone',
      description: 'Découvrez notre histoire, valeurs et équipe. Académie de danse à Barcelone fondée en 2017 avec méthode propre et professeurs internationaux.',
    },
    yunaisy: {
      title: 'Yunaisy Farray | Fondatrice et Directrice | Farray\'s Center',
      description: 'Yunaisy Farray : danseuse cubaine formée à l\'ENA, fondatrice de Farray\'s Center. Got Talent España, The Dancer. Créatrice de la Méthode Farray®. +20 ans de danse.',
    },
    metodoFarray: {
      title: 'Méthode Farray® | Système de Danse Exclusif | Farray\'s Center',
      description: 'Méthode Farray® : système pédagogique fusionnant technique cubaine, rythme afro-caribéen et innovation. Certifié CID-UNESCO. Conçu pour adultes européens.',
    },
    merchandising: {
      title: 'Merchandising Officiel | Farray\'s Center',
      description: 'Merchandising officiel de Farray\'s Center : t-shirts, sweats et accessoires. Portez votre passion pour la danse. Achetez maintenant!',
    },
    regalaBaile: {
      title: 'Offrez la Danse | Cartes Cadeaux | Farray\'s Center',
      description: 'Offrez des cours de danse à Barcelone. Cartes cadeaux pour +25 styles. Le cadeau parfait pour les amoureux de danse. Académie CID-UNESCO.',
    },
    facilities: {
      title: 'Installations | Studios de Danse Barcelone | Farray\'s Center',
      description: '700m² avec 4 studios de danse professionnels à Barcelone. Miroirs, barres, sol technique et vestiaires. Eixample, près de Plaza España.',
    },
    contact: {
      title: 'Contact | Farray\'s International Dance Center Barcelone',
      description: 'Contactez Farray\'s Center Barcelone. Carrer d\'Entença 100. Tél: +34 622 24 70 85. École danse CID-UNESCO. +40 styles. Réservez cours!',
    },
    reservas: {
      title: 'Réservez votre Cours de Bienvenue | Farray\'s Center Barcelone',
      description: 'Réservez votre cours de bienvenue au Farray\'s Center Barcelone. +25 styles de danse. Méthode Farray® exclusive. Académie CID-UNESCO. Premier cours!',
    },

    hazteSocio: {
      title: 'Devenez Membre | Cours de Danse Barcelone | Farray\'s Center',
      description: 'Rejoignez Farray\'s. À partir de 50€/mois. +80 cours par semaine, +25 styles. Sans engagement. App pour réserver. Commencez aujourd\'hui!',
      robots: 'noindex, nofollow',
    },
    yrProject: {
      title: 'Y&R | Yunaisy & Reynier - Artistes de Danse',
      description: 'Contactez Y&R (Yunaisy & Reynier). Artistes de danse, spectacles et cours à Barcelone. WhatsApp et Instagram.',
      robots: 'noindex, nofollow',
    },
    miReserva: {
      title: 'Ma Réservation | Farray\'s Center Barcelone',
      description: 'Gérez votre réservation de cours chez Farray\'s Center Barcelone. Reprogrammez ou annulez votre cours.',
      robots: 'noindex, nofollow',
    },
    fichaje: {
      title: 'Pointage Professeurs | Farray\'s Center',
      description: 'Système de pointage pour les professeurs de Farray\'s Center Barcelone.',
      robots: 'noindex, nofollow',
    },
    fichajeResumen: {
      title: 'Signature Résumé Mensuel | Farray\'s Center',
      description: 'Consultez et signez votre résumé mensuel d\'heures travaillées chez Farray\'s Center Barcelone.',
      robots: 'noindex, nofollow',
    },
    adminFichajes: {
      title: 'Tableau de Bord Pointages | Farray\'s Center',
      description: 'Panneau d\'administration des pointages pour Farray\'s Center Barcelone.',
      robots: 'noindex, nofollow',
    },
    adminReservas: {
      title: 'Réservations d\'Essai | Farray\'s Center',
      description: 'Panneau de gestion des réservations de cours d\'essai gratuits.',
      robots: 'noindex, nofollow',
    },
    feedbackGracias: {
      title: 'Merci pour Votre Avis | Farray\'s Center Barcelone',
      description: 'Votre avis nous aide à nous améliorer. Merci de partager votre expérience avec nous.',
      robots: 'noindex, nofollow',
    },
    feedbackComentario: {
      title: 'Laissez un Commentaire | Farray\'s Center Barcelone',
      description: 'Dites-nous plus sur votre expérience. Votre avis nous aide à nous améliorer.',
      robots: 'noindex, nofollow',
    },
    asistenciaConfirmada: {
      title: 'Confirmation de Présence | Farray\'s Center Barcelone',
      description: 'Confirmation de présence à votre cours de danse chez Farray\'s Center Barcelone.',
      robots: 'noindex, nofollow',
    },
    blog: {
      title: 'Blog de Danse et Ballet | Farray\'s Center Barcelona',
      description: 'Blog de danse avec conseils, tutoriels et histoire. Articles de professionnels cubains sur salsa, bachata, hip hop, ballet et plus. Académie CID-UNESCO.',
    },
    blogLifestyle: {
      title: 'Lifestyle et Danse | Bien-être et Art de Vivre | Farray\'s Center Blog',
      description: 'Découvrez comment la danse transforme votre vie. Articles sur le bien-être, bonheur, style de vie sain et développement personnel à travers la danse.',
    },
    blogBeneficiosSalsa: {
      title: '10 Bienfaits de Danser la Salsa qui Changeront Votre Vie | Farray\'s Center',
      description: '10 bienfaits scientifiques de la salsa : brûlez 400 cal/h, améliorez santé cardiovasculaire, réduisez stress, boostez estime de soi. Guide complet.',
    },
    blogHistoria: {
      title: 'Histoire de la Danse | Origines et Évolution | Farray\'s Center Blog',
      description: 'Découvrez la fascinante histoire de la danse : origines, évolution et comment elle est arrivée à Barcelone. Articles sur la salsa, le dancehall et plus.',
    },
    blogHistoriaSalsa: {
      title: 'Histoire de la Salsa : des Caraïbes à Barcelone | Farray\'s Center',
      description: 'Découvrez la fascinante histoire de la salsa : de ses origines caribéennes et new-yorkaises jusqu\'à son arrivée à Barcelone. Plus de 60 ans de rythme qui ont changé le monde.',
    },
    blogHistoriaBachata: {
      title: 'Histoire de la Bachata : de RD à Barcelone | Farray\'s Center',
      description: 'Découvrez l\'histoire de la bachata : de ses humbles origines en République Dominicaine jusqu\'à devenir un phénomène mondial. Romeo Santos, bachata sensuelle et plus.',
    },
    blogTutoriales: {
      title: 'Tutoriels de Danse | Farray\'s Center Blog',
      description: 'Guides et tutoriels pour apprendre à danser : techniques, pas de base et conseils de professionnels pour salsa, bachata, dancehall et plus de styles.',
    },
    blogSalsaRitmo: {
      title: 'Salsa : Le Rythme qui a Conquis le Monde | Farray\'s Center',
      description: 'Découvrez les différents styles de salsa : cubaine, rueda de casino, salsa en ligne et plus. Guide complet pour comprendre et danser la salsa à Barcelone.',
    },
    blogSalsaVsBachata: {
      title: 'Salsa vs Bachata : Lequel Choisir ? Guide 2025 | Farray\'s Center',
      description: 'Salsa vs bachata : différences de rythme, pas et expression. Guide complet pour choisir votre style de danse latine. Cours à Barcelone.',
    },
    blogClasesSalsaBarcelona: {
      title: 'Hommes et femmes, parlons salsa ? | Farray\'s Center Blog',
      description: 'La salsa comme langage universel : réflexions sur la piste de danse comme espace de connexion entre hommes et femmes. Par Mar Guerrero.',
    },
    blogTips: {
      title: 'Conseils de Danse | Farray\'s Center Blog',
      description: 'Conseils pratiques et guides experts pour débutants et danseurs avancés à Barcelone. Tips de technique, style et progression dans votre danse.',
    },
    blogClasesPrincipiantes: {
      title: 'Cours de danse pour débutants à Barcelone | Farray\'s Center',
      description: 'Guide complet pour commencer à danser à Barcelone. Dès 10€/cours, mensualités dès 50€. +25 styles, +15 000 élèves.',
    },
    blogAcademiaDanza: {
      title: 'Académie de Danse à Barcelone : Comment Choisir | Farray\'s Center',
      description: 'En tant que directrice d\'une académie de danse à Barcelone, je vous explique quoi regarder, quoi éviter et comment choisir un lieu où vous apprenez vraiment à danser.',
    },
    blogBalletAdultos: {
      title: 'Ballet pour Adultes Barcelone : Guide Honnête pour Commencer | Farray\'s',
      description: 'Ballet pour adultes à Barcelone avec méthode sûre et progressive. Découvrez si vous pouvez commencer de zéro, les vrais bénéfices et comment choisir une école.',
    },
    blogDanzaContemporaneaVsJazzBallet: {
      title: 'Contemporaine vs Jazz vs Ballet : Guide 2025 | Farray\'s Center',
      description: 'Découvrez les différences entre danse contemporaine, modern jazz et ballet classique. Comparaison technique, avantages et comment choisir le style qui vous convient le mieux.',
    },
    blogDanzasUrbanas: {
      title: 'Danses Urbaines Barcelone : Guide Complet Hip-Hop 2026 | Farray\'s',
      description: '20 ans d\'enseignement des danses urbaines à Barcelone. Breaking, popping, locking et hip-hop avec un professeur vétéran. Le guide définitif pour commencer.',
    },
    blogModernJazz: {
      title: 'Modern Jazz Barcelone : Guide Complet 2026 | Farray\'s Center',
      description: 'Découvrez le Modern Jazz avec Alejandro Miñoso, ancien soliste de la compagnie Carlos Acosta. Histoire, technique, styles et où apprendre à Barcelone. Guide ultime.',
    },
    blogPerderMiedoBailar: {
      title: 'Comment Vaincre la Peur de Danser : Guide Pratique 2025 | Farray\'s Center',
      description: 'Découvrez des techniques éprouvées pour surmonter la timidité et la peur de danser. 80% des adultes ressentent de l\'anxiété en dansant. Apprenez à la surmonter pas à pas.',
    },
    blogFitness: {
      title: 'Fitness et Santé - Blog de Danse | Farray\'s Center Barcelone',
      description: 'Articles sur les bienfaits de la danse pour la santé physique et mentale. Conseils de fitness, bien-être et exercice à travers la danse.',
    },
    blogBaileSaludMental: {
      title: 'Danse et Santé Mentale : Bienfaits Scientifiques | Farray\'s Center',
      description: 'Découvrez les bienfaits scientifiques de la danse pour la santé mentale. Réduit l\'anxiété 47%, risque de démence 76% moindre. Études de Harvard, NEJM et plus.',
    },
    promoClaseGratis: {
      title: 'Votre Premier Cours de Danse | Farray\'s Center Barcelone',
      description: 'Réservez votre cours d\'essai dans l\'école de danse la plus complète de Barcelone. +15 000 élèves, +40 styles. CID-UNESCO. Places limitées!',
      robots: 'noindex, nofollow',
    },
    promoSexyReggaeton: {
      title: 'Cours de Sexy Reggaeton à Barcelone | Farray\'s Center',
      description: 'Apprenez à bouger au rythme du reggaeton avec sensualité et confiance à Barcelone. +15 000 élèves formés. Méthode Farray®. Réservez cours!',
      robots: 'noindex, nofollow',
    },
    // New class pages
    afroContemporaneo: {
      title: 'Cours d\'Afro Contemporain à Barcelone | Fusion Danse Africaine et Contemporaine | Farray\'s Center',
      description: 'Apprenez l\'Afro Contemporain à Barcelone : fusion de danse africaine traditionnelle et technique contemporaine. Cours pour tous niveaux. Académie CID-UNESCO. Réservez votre cours !',
    },
    afroJazz: {
      title: 'Cours d\'Afro Jazz à Barcelone | Rythme Africain et Technique Jazz | Farray\'s Center',
      description: 'Afro Jazz Barcelone : rythmes africains et technique jazz moderne. Expression corporelle, musicalité et énergie. Tous niveaux. CID-UNESCO. Réservez!',
    },
    contemporaneo: {
      title: 'Cours de Danse Contemporaine à Barcelone | Technique et Expression | Farray\'s Center',
      description: 'Danse contemporaine Barcelone pour adultes. Technique, expression et créativité. Académie CID-UNESCO. Cours pour tous niveaux. Réservez!\'essai !',
    },
    stretching: {
      title: 'Cours de Stretching pour Danseurs à Barcelone | Flexibilité et Mobilité | Farray\'s Center',
      description: 'Stretching danseurs Barcelone. Améliorez flexibilité, mobilité et prévenez blessures. Complément parfait tout style danse. Réservez cours!',
    },
    hipHop: {
      title: 'Cours de Hip Hop à Barcelone | Apprenez avec des Professionnels | Farray\'s Center',
      description: 'Hip Hop Barcelone avec professeurs experts. Débutant à avancé. Styles : Old School, New Style, House. Académie CID-UNESCO. Réservez cours!',
    },
    entrenamientoBailarines: {
      title: 'Entraînement pour Danseurs à Barcelone | Technique et Condition Physique | Farray\'s Center',
      description: 'Entraînement danseurs Barcelone. Améliorez technique, force, endurance et flexibilité. Programme conçu par professionnels danse CID-UNESCO.',
    },
    bachataLadyStyle: {
      title: 'Cours de Bachata Lady Style à Barcelone | Style Féminin et Sensualité | Farray\'s Center',
      description: 'Bachata Lady Style Barcelone. Féminité, élégance et style personnel en bachata. Mouvements sensuels et expressifs. Réservez votre cours!',
    },
    bumBum: {
      title: 'Bum Bum - Exercices Fessiers à Barcelone | Tonification et Fitness | Farray\'s Center',
      description: 'Cours de Bum Bum à Barcelone : exercices spécialisés pour fessiers et jambes. Tonifiez, renforcez et sculptez avec musique et énergie. Réservez!',
    },
    cuerpoFitPage: {
      title: 'Conditionnement Physique pour Danseurs à Barcelone | Cuerpo Fit | Farray\'s Center',
      description: 'Conditionnement physique danseurs Barcelone. Améliorez force, flexibilité et endurance avec Méthode Farray. Entraînement fonctionnel spécialisé.',
    },
    // New non-class pages
    profesores: {
      title: 'Professeurs de Danse à Barcelone | Équipe de Farray\'s Center',
      description: 'Rencontrez notre équipe de professeurs de danse à Barcelone. Danseurs professionnels du monde entier avec des années d\'expérience. Certifiés CID-UNESCO.',
    },
    faq: {
      title: 'Questions Fréquentes | Farray\'s International Dance Center Barcelone',
      description: 'Obtenez des réponses sur nos cours de danse à Barcelone. Horaires, tarifs, niveaux, inscription et tout ce que vous devez savoir avant de commencer.',
    },
    alquilerSalas: {
      title: 'Location de Studios de Danse à Barcelone | 4 Espaces Professionnels | Farray\'s Center',
      description: 'Louez nos 4 studios de danse professionnels à Barcelone (40-120m²). Sol de danse, miroirs, climatisation et son. Dès 14€/heure. Entre Plaza España et Sants.',
    },
    estudioGrabacion: {
      title: 'Studio de Tournage Vidéo Danse à Barcelone | Production Audiovisuelle | Farray\'s Center',
      description: 'Studio d\'enregistrement pour vidéos de danse à Barcelone. Équipement professionnel, éclairage et son. Parfait pour clips, tutoriels et contenu réseaux sociaux.',
    },
    // Legal pages
    termsConditions: {
      title: 'Conditions Générales | Farray\'s International Dance Center',
      description: 'Conditions générales d\'utilisation des services de Farray\'s Center. Informations légales sur les inscriptions, paiements et politiques de l\'académie.',
    },
    legalNotice: {
      title: 'Mentions Légales | Farray\'s International Dance Center',
      description: 'Mentions légales de Farray\'s Center. Informations sur l\'entreprise, propriété intellectuelle et conditions d\'utilisation du site.',
    },
    privacyPolicy: {
      title: 'Politique de Confidentialité | Farray\'s International Dance Center',
      description: 'Politique de confidentialité de Farray\'s Center. Informations sur le traitement des données personnelles selon le RGPD.',
    },
    cookiePolicy: {
      title: 'Politique de Cookies | Farray\'s International Dance Center',
      description: 'Politique de cookies de Farray\'s Center. Informations sur les cookies utilisés sur notre site web.',
    },
    // Additional pages
    serviciosBaile: {
      title: 'Services de Danse à Barcelone | Farray\'s Center',
      description: 'Services danse Barcelone : cours particuliers personnalisés, chorégraphies événements, shows et performances. Académie CID-UNESCO. Contactez-nous!',
    },
    ubicacion: {
      title: 'Comment Venir à Farray\'s Center | École de Danse Barcelone',
      description: 'Comment venir à Farray\'s Center à Barcelone. Métro Rocafort (L1) à 4 min, Gare de Sants à 8 min. Carrer d\'Entença 100. Parfaitement connecté.',
    },
    calendario: {
      title: 'Calendrier des Événements | Farray\'s International Dance Center',
      description: 'Calendrier des événements, workshops et activités spéciales à Farray\'s Center Barcelone.',
    },
    notFound: {
      title: 'Page Non Trouvée | 404 | Farray\'s Center',
      description: 'La page que vous recherchez n\'existe pas. Retournez à la page d\'accueil ou explorez nos cours de danse à Barcelone.',
      robots: 'noindex, nofollow',
    },
    // Generic Dance Landing Pages (auto-generated from LANDING_METADATA)
    ...LANDING_METADATA.fr,
  },
};

// 
// INITIAL CONTENT GENERATION
// 
// Genera contenido pre-renderizado para cada página.
// - Páginas con metadata: genera automáticamente desde title/description
// - Páginas excluidas: mantienen '' vacío (home, horarios, etc.)
// - Páginas legales: tienen contenido manual específico (mejor calidad)
// - Landings: usan LANDING_CONTENT (su propio sistema)

/**
 * Genera el objeto initialContent completo para un idioma.
 * Combina: contenido auto-generado + overrides manuales + landings
 */
const generateInitialContentForLang = (lang, manualOverrides) => {
  const result = {};

  // 1. Generar contenido automático para todas las páginas con metadata
  const langMetadata = metadata[lang] || {};
  for (const pageKey of Object.keys(langMetadata)) {
    result[pageKey] = generateContentFromMetadata(pageKey, lang, metadata);
  }

  // 2. Aplicar overrides manuales (páginas legales, notFound, etc.)
  Object.assign(result, manualOverrides);

  // 3. Añadir landings
  Object.assign(result, LANDING_CONTENT[lang] || {});

  return result;
};

// Overrides manuales por idioma (páginas que necesitan contenido específico)
// NOTE: home uses createRoot (not hydrateRoot) so pre-rendered content is safely replaced by React
const manualOverrides = {
  es: {
    // Homepage pre-rendered content for crawlers — React replaces via createRoot (no hydration mismatch risk)
    // All text below comes from i18n/locales/es/home.json translations
    home: `<main id="main-content"><header id="hero"><h1>Tu Escuela de Baile en Barcelona</h1><p>Clases de Danza, Salsa, Bachata, Danza Urbana, y Más</p><p>No necesitas más clases de baile. Necesitas las clases correctas. Si buscas clases de baile en Barcelona donde por fin avances y no te sientas un número, estás en el sitio correcto. Con el Método Farray® aprendes bien, rápido y con estilo.</p></header><section id="classes"><h2>Clases de Baile para Adultos</h2><p>Descubre nuestras clases de baile para adultos y encuentra el estilo perfecto para ti. Calidad, profesionalidad y comunidad en el corazón de Barcelona, en una academia acreditada por CID-UNESCO.</p><h3>Clases de Salsa y Bachata</h3><p>Aprende a bailar en pareja con la auténtica técnica cubana. Desde salsa cubana y timba hasta bachata sensual.</p><h3>Clases de Danza Urbana y Hip Hop</h3><p>Siente la energía de la calle con Hip Hop, Dancehall, Reggaeton, Afrobeat, K-Pop y Commercial Dance.</p><h3>Ballet, Contemporáneo y Jazz</h3><p>Explora la técnica clásica y la expresión contemporánea con Ballet Clásico, Danza Contemporánea, Modern Jazz, Afro-Jazz y Afro-Contemporáneo.</p></section><section id="why"><h2>¿Por qué elegir nuestra Academia de danza en Barcelona?</h2><ul><li>Profesores de Clase Mundial</li><li>Exclusivo Método Farray®</li><li>700 m² de Instalaciones Premium</li><li>Centro acreditado CID-UNESCO</li><li>Ubicación privilegiada cerca de Plaza España y Sants</li></ul></section><section id="faq"><h2>Preguntas Frecuentes</h2><details><summary>¿Cuántos estilos de baile enseñan en Farray's Center?</summary><p>Ofrecemos formación en más de 25 estilos diferentes de baile incluyendo bailes latinos, danza urbana, estilos clásicos y preparación física para bailarines.</p></details><details><summary>¿Necesito experiencia previa para empezar?</summary><p>No, absolutamente no necesitas experiencia previa. Todos nuestros estilos de baile tienen clases para principiantes absolutos.</p></details><details><summary>¿Dónde está ubicado Farray's Center?</summary><p>Estamos en Carrer d'Entença 100, Barcelona 08015, a 5 minutos caminando de Plaza España y Estación de Sants.</p></details></section></main>`,
    yrProject: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Y&R | Yunaisy & Reynier</h1><p>Cuban International Dancers</p></main>`,
    termsConditions: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Términos y Condiciones</h1><p>Información legal sobre inscripciones, pagos y políticas de Farray's Center.</p></main>`,
    legalNotice: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Aviso Legal</h1><p>Información sobre la empresa, propiedad intelectual y condiciones de uso.</p></main>`,
    privacyPolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Política de Privacidad</h1><p>Información sobre el tratamiento de datos personales según el RGPD.</p></main>`,
    cookiePolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Política de Cookies</h1><p>Información sobre las cookies utilizadas en nuestro sitio web.</p></main>`,
    serviciosBaile: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Servicios de Baile</h1><p>Clases particulares, coreografías para eventos, shows y espectáculos profesionales.</p></main>`,
    ubicacion: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Cómo Llegar a Farray's Center</h1><p>Estamos en Carrer d'Entença 100, Barcelona. Metro Rocafort (L1) a 4 min, Sants Estació a 8 min. Perfectamente conectado con toda la ciudad.</p></main>`,
    calendario: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Calendario de Eventos</h1><p>Workshops, masterclasses y actividades especiales en Farray's Center Barcelona.</p></main>`,
    notFound: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Página No Encontrada</h1><p>La página que buscas no existe. Vuelve a la página principal o explora nuestras clases de baile.</p></main>`,
  },
  ca: {
    // Homepage pre-rendered content for crawlers — React replaces via createRoot (no hydration mismatch risk)
    home: `<main id="main-content"><header id="hero"><h1>La Teva Escola de Ball a Barcelona</h1><p>Classes de Dansa, Salsa, Bachata, Dansa Urbana, i Més</p><p>No necessites més classes de ball. Necessites les classes correctes. Si busques classes de ball a Barcelona on per fi avancis i no et sentis un número, estàs al lloc correcte. Amb el Mètode Farray® aprens bé, ràpid i amb estil.</p></header><section id="classes"><h2>Classes de Ball per a Adults</h2><p>Descobreix les nostres classes de ball per a adults i troba l'estil perfecte per a tu. Qualitat, professionalitat i comunitat al cor de Barcelona, en una acadèmia acreditada per CID-UNESCO.</p><h3>Classes de Salsa i Bachata</h3><p>Aprèn a ballar en parella amb l'autèntica tècnica cubana. Des de salsa cubana i timba fins a bachata sensual.</p><h3>Classes de Dansa Urbana i Hip Hop</h3><p>Sent l'energia del carrer amb Hip Hop, Dancehall, Reggaeton, Afrobeat, K-Pop i Commercial Dance.</p><h3>Ballet, Contemporani i Jazz</h3><p>Explora la tècnica clàssica i l'expressió contemporània amb Ballet Clàssic, Dansa Contemporània, Modern Jazz, Afro-Jazz i Afro-Contemporani.</p></section><section id="why"><h2>Per què escollir la nostra escola de ball a Barcelona?</h2><ul><li>Professors de Classe Mundial</li><li>Exclusiu Mètode Farray®</li><li>700 m² d'Instal·lacions Premium</li><li>Centre acreditat CID-UNESCO</li><li>Ubicació privilegiada prop de Plaça Espanya i Sants</li></ul></section><section id="faq"><h2>Preguntes Freqüents</h2><details><summary>Quants estils de ball ensenyen a Farray's Center?</summary><p>Oferim formació en més de 25 estils diferents de ball incloent balls llatins, dansa urbana, estils clàssics i preparació física per a ballarins.</p></details><details><summary>Necessito experiència prèvia per començar?</summary><p>No, absolutament no necessites experiència prèvia. Tots els nostres estils de ball tenen classes per a principiants absoluts.</p></details><details><summary>On està ubicat Farray's Center?</summary><p>Som al Carrer d'Entença 100, Barcelona 08015, a 5 minuts caminant de Plaça Espanya i Estació de Sants.</p></details></section></main>`,
    yrProject: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Y&R | Yunaisy & Reynier</h1><p>Cuban International Dancers</p></main>`,
    termsConditions: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Termes i Condicions</h1><p>Informació legal sobre inscripcions, pagaments i polítiques de Farray's Center.</p></main>`,
    legalNotice: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Avís Legal</h1><p>Informació sobre l'empresa, propietat intel·lectual i condicions d'ús.</p></main>`,
    privacyPolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Política de Privacitat</h1><p>Informació sobre el tractament de dades personals segons el RGPD.</p></main>`,
    cookiePolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Política de Cookies</h1><p>Informació sobre les cookies utilitzades al nostre lloc web.</p></main>`,
    serviciosBaile: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Serveis de Ball</h1><p>Classes particulars, coreografies per a esdeveniments, shows i espectacles professionals.</p></main>`,
    ubicacion: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Com Arribar a Farray's Center</h1><p>Som al Carrer d'Entença 100, Barcelona. Metro Rocafort (L1) a 4 min, Sants Estació a 8 min. Perfectament connectat amb tota la ciutat.</p></main>`,
    calendario: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Calendari d'Esdeveniments</h1><p>Workshops, masterclasses i activitats especials a Farray's Center Barcelona.</p></main>`,
    notFound: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Pàgina No Trobada</h1><p>La pàgina que busques no existeix. Torna a la pàgina principal o explora les nostres classes de ball.</p></main>`,
  },
  en: {
    // Homepage pre-rendered content for crawlers — React replaces via createRoot (no hydration mismatch risk)
    home: `<main id="main-content"><header id="hero"><h1>Your Dance School in Barcelona</h1><p>Classes for Dance, Salsa, Bachata, Urban Dance, and More</p><p>You don't need more dance classes. You need the right classes. If you're looking for dance classes in Barcelona where you finally make progress and don't feel like just a number, you're in the right place. With the Farray Method® you learn well, fast and with style.</p></header><section id="classes"><h2>Dance Classes for Adults</h2><p>Discover our dance classes for adults and find the perfect style for you. Quality, professionalism, and community in the heart of Barcelona, at an academy accredited by CID-UNESCO.</p><h3>Salsa and Bachata Classes</h3><p>Learn to dance in pairs with authentic Cuban technique. From Cuban salsa and timba to sensual bachata.</p><h3>Urban & Hip Hop Classes</h3><p>Feel the street energy with Hip Hop, Dancehall, Reggaeton, Afrobeat, K-Pop, and Commercial Dance.</p><h3>Ballet, Contemporary & Jazz</h3><p>Explore classical technique and contemporary expression with Classical Ballet, Contemporary Dance, Modern Jazz, Afro-Jazz, and Afro-Contemporary.</p></section><section id="why"><h2>Why choose our dance school in Barcelona?</h2><ul><li>World-Class Instructors</li><li>Exclusive Farray Method®</li><li>700 m² Premium Facilities</li><li>CID-UNESCO Accredited Center</li><li>Privileged location near Plaza España and Sants Station</li></ul></section><section id="faq"><h2>Frequently Asked Questions</h2><details><summary>How many dance styles do you teach at Farray's Center?</summary><p>We offer training in over 25 different dance styles including Latin dances, urban dance, classical styles, and physical preparation for dancers.</p></details><details><summary>Do I need previous experience to start?</summary><p>No, you absolutely don't need any previous experience. All our dance styles have classes for absolute beginners.</p></details><details><summary>Where is Farray's Center located?</summary><p>We are at Carrer d'Entença 100, Barcelona 08015, a 5-minute walk from Plaza España and Sants Station.</p></details></section></main>`,
    yrProject: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Y&R | Yunaisy & Reynier</h1><p>Cuban International Dancers</p></main>`,
    termsConditions: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Terms and Conditions</h1><p>Legal information about registration, payments and policies at Farray's Center.</p></main>`,
    legalNotice: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Legal Notice</h1><p>Information about the company, intellectual property and terms of use.</p></main>`,
    privacyPolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Privacy Policy</h1><p>Information about personal data processing in accordance with GDPR.</p></main>`,
    cookiePolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Cookie Policy</h1><p>Information about cookies used on our website.</p></main>`,
    serviciosBaile: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Dance Services</h1><p>Private lessons, event choreography, professional shows and performances.</p></main>`,
    ubicacion: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">How to Get to Farray's Center</h1><p>We're at Carrer d'Entença 100, Barcelona. Metro Rocafort (L1) 4 min walk, Sants Station 8 min. Perfectly connected with the entire city.</p></main>`,
    calendario: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Events Calendar</h1><p>Workshops, masterclasses and special activities at Farray's Center Barcelona.</p></main>`,
    notFound: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Page Not Found</h1><p>The page you are looking for does not exist. Go back to the home page or explore our dance classes.</p></main>`,
  },
  fr: {
    // Homepage pre-rendered content for crawlers — React replaces via createRoot (no hydration mismatch risk)
    home: `<main id="main-content"><header id="hero"><h1>Votre École de Danse à Barcelone</h1><p>Cours de Danse, Salsa, Bachata, Danse Urbaine, et Plus</p><p>Vous n'avez pas besoin de plus de cours de danse. Vous avez besoin des bons cours. Si vous cherchez des cours de danse à Barcelone où vous progressez enfin et ne vous sentez pas comme un simple numéro, vous êtes au bon endroit. Avec la Méthode Farray®, vous apprenez bien, vite et avec style.</p></header><section id="classes"><h2>Cours de Danse pour Adultes</h2><p>Découvrez nos cours de danse pour adultes et trouvez le style parfait pour vous. Qualité, professionnalisme et communauté au cœur de Barcelone, dans une académie accréditée par le CID-UNESCO.</p><h3>Cours de Salsa et Bachata</h3><p>Apprenez à danser en couple avec l'authentique technique cubaine. De la salsa cubaine et timba à la bachata sensuelle.</p><h3>Cours de Danse Urbaine et Hip Hop</h3><p>Ressentez l'énergie de la rue avec Hip Hop, Dancehall, Reggaeton, Afrobeat, K-Pop et Commercial Dance.</p><h3>Ballet, Contemporain et Jazz</h3><p>Explorez la technique classique et l'expression contemporaine avec Ballet Classique, Danse Contemporaine, Modern Jazz, Afro-Jazz et Afro-Contemporain.</p></section><section id="why"><h2>Pourquoi choisir notre école de danse à Barcelone ?</h2><ul><li>Professeurs de Classe Mondiale</li><li>Méthode Exclusive Farray®</li><li>Installations Premium de 700 m²</li><li>Centre accrédité CID-UNESCO</li><li>Emplacement privilégié près de Plaza España et gare de Sants</li></ul></section><section id="faq"><h2>Questions Fréquentes</h2><details><summary>Combien de styles de danse enseignez-vous au Farray's Center ?</summary><p>Nous offrons une formation dans plus de 25 styles de danse différents, incluant danses latines, danse urbaine, styles classiques et préparation physique pour danseurs.</p></details><details><summary>Ai-je besoin d'une expérience préalable pour commencer ?</summary><p>Non, vous n'avez absolument pas besoin d'expérience préalable. Tous nos styles de danse ont des cours pour débutants absolus.</p></details><details><summary>Où se trouve le Farray's Center ?</summary><p>Nous sommes au Carrer d'Entença 100, Barcelone 08015, à 5 minutes à pied de la Plaza España et de la gare de Sants.</p></details></section></main>`,
    yrProject: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Y&R | Yunaisy & Reynier</h1><p>Cuban International Dancers</p></main>`,
    termsConditions: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Conditions Générales</h1><p>Informations légales sur les inscriptions, paiements et politiques de Farray's Center.</p></main>`,
    legalNotice: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Mentions Légales</h1><p>Informations sur l'entreprise, propriété intellectuelle et conditions d'utilisation.</p></main>`,
    privacyPolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Politique de Confidentialité</h1><p>Informations sur le traitement des données personnelles conformément au RGPD.</p></main>`,
    cookiePolicy: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Politique de Cookies</h1><p>Informations sur les cookies utilisés sur notre site web.</p></main>`,
    serviciosBaile: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Services de Danse</h1><p>Cours particuliers, chorégraphies pour événements, shows et spectacles professionnels.</p></main>`,
    ubicacion: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Comment Venir à Farray's Center</h1><p>Nous sommes au Carrer d'Entença 100, Barcelone. Métro Rocafort (L1) à 4 min, Gare de Sants à 8 min. Parfaitement connecté avec toute la ville.</p></main>`,
    calendario: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Calendrier des Événements</h1><p>Workshops, masterclasses et activités spéciales à Farray's Center Barcelone.</p></main>`,
    notFound: `<main id="main-content"><h1 class="holographic-text text-4xl font-bold">Page Non Trouvée</h1><p>La page que vous recherchez n'existe pas. Retournez à la page d'accueil ou explorez nos cours de danse.</p></main>`,
  },
};

// Generar initialContent automáticamente para cada idioma
const initialContent = {
  es: generateInitialContentForLang('es', manualOverrides.es),
  ca: generateInitialContentForLang('ca', manualOverrides.ca),
  en: generateInitialContentForLang('en', manualOverrides.en),
  fr: generateInitialContentForLang('fr', manualOverrides.fr),
};

// Log de páginas con contenido generado (para debug)
const pagesWithContent = Object.keys(initialContent.es).filter(k => initialContent.es[k] !== '');
console.log(`📝 SEO para LLMs: ${pagesWithContent.length} páginas con contenido pre-renderizado`);

console.log('🚀 Starting prerendering process...\n');

// Read base HTML
const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

// Find critical asset files for preloading
const assetsPath = path.join(distPath, 'assets');
const assetFiles = fs.readdirSync(assetsPath);

// Find the main chunks that should be preloaded
const criticalChunks = {
  index: assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js')),
  reactVendor: assetFiles.find(f => f.startsWith('react-vendor-') && f.endsWith('.js')),
  routerVendor: assetFiles.find(f => f.startsWith('router-vendor-') && f.endsWith('.js')),
  mainCss: assetFiles.find(f => f.startsWith('style-') && f.endsWith('.css')),
  // Locale-specific i18n chunks (named i18n-{locale}-*.js by vite.config.ts)
  es: assetFiles.find(f => f.startsWith('i18n-es-') && f.endsWith('.js')),
  ca: assetFiles.find(f => f.startsWith('i18n-ca-') && f.endsWith('.js')),
  en: assetFiles.find(f => f.startsWith('i18n-en-') && f.endsWith('.js')),
  fr: assetFiles.find(f => f.startsWith('i18n-fr-') && f.endsWith('.js')),
};

// Generate preload hints for critical assets (common to all pages)
const commonPreloadHints = [];
if (criticalChunks.index) {
  commonPreloadHints.push(`<link rel="modulepreload" href="/assets/${criticalChunks.index}" />`);
}
if (criticalChunks.reactVendor) {
  commonPreloadHints.push(`<link rel="modulepreload" href="/assets/${criticalChunks.reactVendor}" />`);
}
if (criticalChunks.routerVendor) {
  commonPreloadHints.push(`<link rel="modulepreload" href="/assets/${criticalChunks.routerVendor}" />`);
}
// Note: CSS preload removed - it causes "preloaded but not used" warnings because
// the CSS is loaded via Vite's JS module system, not a direct <link rel="stylesheet">.
// By the time JS requests the CSS, the browser has already timed out the preload.

console.log(`📦 Found critical chunks:`);
console.log(`   - Main bundle: ${criticalChunks.index || 'not found'}`);
console.log(`   - React vendor: ${criticalChunks.reactVendor || 'not found'}`);
console.log(`   - Router vendor: ${criticalChunks.routerVendor || 'not found'}`);
console.log(`   - Main CSS: ${criticalChunks.mainCss || 'not found'}`);
console.log(`   - i18n chunks: es=${criticalChunks.es ? '✓' : '✗'}, ca=${criticalChunks.ca ? '✓' : '✗'}, en=${criticalChunks.en ? '✓' : '✗'}, fr=${criticalChunks.fr ? '✓' : '✗'}\n`);

let generatedCount = 0;

// Auto-build page → pagePath map from routes array (replaces manual if/else chain)
// Uses first 'es' route for each page key, strips 'es/' prefix to get the shared path
const pageToPathMap = {};
for (const r of [...routes, ...LANDING_ROUTES]) {
  if (r.lang === 'es' && !Object.prototype.hasOwnProperty.call(pageToPathMap, r.page)) {
    if (r.path === '' || r.path === 'es') {
      pageToPathMap[r.page] = '';
    } else if (r.path.startsWith('es/')) {
      pageToPathMap[r.page] = r.path.slice(3);
    }
    // else: skip pages without locale prefix (e.g., yr-project)
  }
}

routes.forEach(route => {
  const { path: routePath, lang, page } = route;

  // Get metadata and content
  const meta = metadata[lang][page];
  const content = initialContent[lang]?.[page] || '';

  // Build preload hints for this specific page (common + locale-specific i18n)
  const pagePreloadHints = [...commonPreloadHints];
  if (criticalChunks[lang]) {
    pagePreloadHints.push(`<link rel="modulepreload" href="/assets/${criticalChunks[lang]}" />`);
  }
  
  const preloadHintsHtml = pagePreloadHints.length > 0 
    ? `\n    <!-- Preload critical chunks for faster LCP -->\n    ${pagePreloadHints.join('\n    ')}\n`
    : '';

  // Generate hreflang alternates (auto-lookup from routes array)
  const pagePath = pageToPathMap[page];

  // Only generate hreflang for pages with locale-based paths
  const hreflangLinks = pagePath !== undefined ? [
    `<link rel="alternate" hreflang="es" href="https://www.farrayscenter.com/es${pagePath ? `/${pagePath}` : ''}" />`,
    `<link rel="alternate" hreflang="ca" href="https://www.farrayscenter.com/ca${pagePath ? `/${pagePath}` : ''}" />`,
    `<link rel="alternate" hreflang="en" href="https://www.farrayscenter.com/en${pagePath ? `/${pagePath}` : ''}" />`,
    `<link rel="alternate" hreflang="fr" href="https://www.farrayscenter.com/fr${pagePath ? `/${pagePath}` : ''}" />`,
    `<link rel="alternate" hreflang="x-default" href="https://www.farrayscenter.com/es${pagePath ? `/${pagePath}` : ''}" />`,
  ].join('\n    ') : '';

  const currentUrl = `https://www.farrayscenter.com/${routePath}`;

  // Locale persistence script - runs before React mounts
  // NOTE: This script is STATIC (same for all pages) to avoid CSP hash issues
  // It reads the locale from the HTML lang attribute which is set during prerendering
  const localeScript = `
    <script>
      (function(){var l=document.documentElement.lang||'es';localStorage.setItem('fidc_preferred_locale',l);document.cookie='fidc_locale='+l+';max-age=31536000;path=/;SameSite=Lax';})();
    </script>
  `;

  // Create prerendered HTML
  let html = baseHtml;

  // Update lang attribute
  html = html.replace(/<html([^>]*)lang="[^"]*"/, `<html$1lang="${lang}"`);
  html = html.replace(/<html(?![^>]*lang=)/, `<html lang="${lang}"`);

  // Remove existing SEO meta tags to prevent duplicates
  // Remove title tags (after the first one from charset/viewport section)
  html = html.replace(/<title>.*?<\/title>/g, '');
  // Remove description meta tags
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  // Remove canonical links
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  // Remove hreflang links
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, '');
  // Remove Open Graph tags
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  // Remove Twitter Card tags
  html = html.replace(/<meta\s+(?:name|property)="twitter:[^"]*"[^>]*>/gi, '');
  // Remove robots meta tag (will be replaced with page-specific value)
  html = html.replace(/<meta\s+name="robots"[^>]*>/gi, '');

  // Remove hero-video-poster preload for non-home pages (only home uses the hero video)
  // This prevents "resource was preloaded but not used" warnings
  if (page !== 'home') {
    html = html.replace(/<link[^>]*hero-video-poster\.webp[^>]*>/gi, '');
  }

  // Inject metadata in <head>
  const robotsContent = meta.robots || 'index, follow';

  // Generate JSON-LD structured data for SEO + GEO (AI crawlers)
  const jsonLdHtml = generateAllJsonLd({
    routePath,
    lang,
    page,
    meta,
    translations: pagesTranslations[lang] || {},
    blogTranslations: blogTranslations[lang] || {},
    homeTranslations: homeTranslations[lang] || {},
    scheduleTranslations: scheduleTranslations[lang] || {},
    styleKeyMap: STYLE_KEY_MAP,
    faqPageMap: FAQ_PAGE_MAP,
  });

  html = html.replace('</head>', `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta name="robots" content="${robotsContent}" />
    <link rel="canonical" href="${currentUrl}" />
    ${hreflangLinks}

    <!-- Open Graph -->
    <meta property="og:type" content="${BLOG_ARTICLE_DATA[page] ? 'article' : 'website'}" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${getOgImageUrl(page)}" />
    <meta property="og:locale" content="${{ es: 'es_ES', ca: 'ca_ES', en: 'en_GB', fr: 'fr_FR' }[lang]}" />
    <meta property="og:site_name" content="Farray's International Dance Center" />${BLOG_ARTICLE_DATA[page] ? `
    <meta property="article:published_time" content="${BLOG_ARTICLE_DATA[page].datePublished}" />
    <meta property="article:modified_time" content="${BLOG_ARTICLE_DATA[page].dateModified}" />
    <meta property="article:author" content="Yunaisy Farray" />
    <meta property="article:section" content="${BLOG_ARTICLE_DATA[page].category}" />` : ''}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${currentUrl}" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${getOgImageUrl(page)}" />
${preloadHintsHtml}
    ${localeScript}
    ${jsonLdHtml}
  </head>`);

  // Inject prerendered content in <div id="root">
  // Content MUST be inside the div for SSG to work (not as HTML comment)
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="true">${content}</div>`
  );

  // Determine file path
  const filePath = routePath === ''
    ? path.join(distPath, 'index.html')
    : path.join(distPath, routePath, 'index.html');

  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // NOTE: Non-blocking CSS pattern removed - CSP hashes don't work for inline event handlers (onload)
  // Critical CSS is already inline, so render-blocking impact is minimal

  // Save file
  fs.writeFileSync(filePath, html);
  generatedCount++;

  console.log(`✅ Generated: /${routePath || '(root)'} [${lang}] → ${filePath}`);
});

console.log(`\n🎉 Prerendering complete! Generated ${generatedCount} pages.`);

// ============================================================================
// COPY 404.html TO ROOT FOR VERCEL (SEO: Real HTTP 404)
// ============================================================================
// Vercel automatically serves 404.html with HTTP 404 status for unmatched routes
// This ensures search engines correctly identify 404 pages
const source404 = path.join(distPath, 'es/404/index.html');
const dest404 = path.join(distPath, '404.html');

if (fs.existsSync(source404)) {
  fs.copyFileSync(source404, dest404);
  console.log(`\n✅ Created 404.html for Vercel (HTTP 404 real)`);
} else {
  console.log(`\n⚠️  Warning: es/404/index.html not found, skipping 404.html creation`);
}

// ============================================================================
// AUTO-GENERATE SITEMAP (sync with pre-rendered routes)
// ============================================================================
const BASE_URL = 'https://www.farrayscenter.com';
const TODAY = new Date().toISOString().split('T')[0];
const sitemapUrls = [];

for (const route of routes) {
  const { path: routePath, lang, page } = route;

  // Skip root redirect ('' → /es)
  if (routePath === '') continue;

  // Skip noindex pages (404, legal, promo landings)
  const robotsValue = metadata[lang]?.[page]?.robots || 'index, follow';
  if (robotsValue.includes('noindex')) continue;

  const url = `${BASE_URL}/${routePath}`;

  // Determine lastmod: blog articles use their dateModified, rest use build date
  const blogData = BLOG_ARTICLE_DATA[page];
  const lastmod = blogData ? blogData.dateModified : TODAY;

  // Determine priority
  let priority = '0.5';
  if (page === 'home') priority = '1.0';
  else if (STYLE_KEY_MAP[page]) priority = '0.8';
  else if (blogData) priority = '0.7';
  else if (['classes', 'classesHub', 'horariosPrecio', 'horarios', 'precios'].includes(page)) priority = '0.8';

  // Build hreflang alternates using pageToPathMap
  const pagePath = pageToPathMap[page];
  const hreflangLinks = pagePath !== undefined ? [
    `      <xhtml:link rel="alternate" hreflang="es" href="${BASE_URL}/es${pagePath ? `/${pagePath}` : ''}"/>`,
    `      <xhtml:link rel="alternate" hreflang="ca" href="${BASE_URL}/ca${pagePath ? `/${pagePath}` : ''}"/>`,
    `      <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en${pagePath ? `/${pagePath}` : ''}"/>`,
    `      <xhtml:link rel="alternate" hreflang="fr" href="${BASE_URL}/fr${pagePath ? `/${pagePath}` : ''}"/>`,
    `      <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/es${pagePath ? `/${pagePath}` : ''}"/>`,
  ].join('\n') : '';

  sitemapUrls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page === 'home' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks}
  </url>`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(distPath, 'sitemap-pages.xml'), sitemapXml);
console.log(`\n🗺️  Sitemap: Generated ${sitemapUrls.length} URLs in sitemap-pages.xml`);

console.log('\n📊 Summary:');
console.log(`   - Total pages: ${generatedCount}`);
console.log(`   - Sitemap: ${sitemapUrls.length} indexable URLs`);
console.log(`   - Languages: es, ca, en, fr (4)`);
console.log(`   - SEO: ✅ Metadata, ✅ hreflang, ✅ Canonical, ✅ Open Graph, ✅ Sitemap`);
console.log(`   - Locale: ✅ Pre-set via localStorage + cookie before React hydration`);
console.log(`   - 404: ✅ Real HTTP 404 (dist/404.html)`);
console.log('\n🔍 Verify: Run "npm run preview" and view page source to see prerendered content\n');
