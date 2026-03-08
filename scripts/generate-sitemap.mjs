/**
 * Enterprise Sitemap Generator for Farray's Center
 *
 * Generates a complete sitemap ecosystem:
 * - sitemap_index.xml (master index)
 * - sitemap-pages.xml (all pages with hreflang)
 * - sitemap-news.xml (blog articles for Google News)
 * - sitemap-images.xml (key images for Google Images)
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = 'https://www.farrayscenter.com';
const SUPPORTED_LOCALES = ['es', 'ca', 'en', 'fr'];
const OUTPUT_DIR = path.join(ROOT_DIR, 'public');

// Get current date in ISO format for lastmod
const getCurrentDate = () => new Date().toISOString().split('T')[0];

// Pages to EXCLUDE from sitemap (noindex)
const EXCLUDED_PAGES = [
  'horariosPrecio',  // Lead-gated content
  'notFound',        // 404 pages
];

// Landing pages to exclude (noindex, nofollow - Facebook Ads only)
const LANDING_SLUGS = [
  'dancehall',
  'twerk',
  'sexy-reggaeton',
  'sexy-style',
  'hip-hop-reggaeton',
  'contemporaneo',
  'femmology',
  'bachata',
  'hip-hop',
  'afrobeats',
  'afro-jazz',
  'salsa-cubana',
  'ballet',
  'afro-contemporaneo',
  'jornada-puertas-abiertas',
  'profesor-reynier',
];

// =============================================================================
// BLOG ARTICLES (for News Sitemap)
// =============================================================================

const BLOG_ARTICLES = [
  // === LIFESTYLE ===
  {
    slug: 'beneficios-bailar-salsa',
    category: 'lifestyle',
    datePublished: '2026-01-24',
    titleKey: '10 Beneficios de Bailar Salsa para tu Salud',
    image: '/images/blog/beneficios-salsa/og.jpg',
  },
  {
    slug: 'clases-de-salsa-barcelona',
    category: 'lifestyle',
    datePublished: '2026-01-24',
    titleKey: 'Clases de Salsa en Barcelona',
    image: '/images/blog/clases-salsa/og.jpg',
  },
  {
    slug: 'como-perder-miedo-bailar',
    category: 'lifestyle',
    datePublished: '2026-01-16',
    titleKey: 'Cómo Perder el Miedo a Bailar',
    image: '/images/blog/como-perder-miedo/og.jpg',
  },
  // === HISTORIA ===
  {
    slug: 'historia-salsa-barcelona',
    category: 'historia',
    datePublished: '2026-01-24',
    titleKey: 'Historia de la Salsa en Barcelona',
    image: '/images/blog/historia-salsa/og.jpg',
  },
  {
    slug: 'historia-bachata-barcelona',
    category: 'historia',
    datePublished: '2026-01-24',
    titleKey: 'Historia de la Bachata en Barcelona',
    image: '/images/blog/historia-bachata/og.jpg',
  },
  // === TUTORIALES ===
  {
    slug: 'salsa-ritmo-conquisto-mundo',
    category: 'historia',
    datePublished: '2026-01-16',
    titleKey: 'Salsa: El Ritmo que Conquistó el Mundo',
    image: '/images/blog/salsa-ritmo/og.jpg',
  },
  {
    slug: 'salsa-vs-bachata-que-estilo-elegir',
    category: 'tips',
    datePublished: '2026-01-16',
    titleKey: 'Salsa vs Bachata: Diferencias y Cuál Elegir',
    image: '/images/blog/salsa-vs-bachata/og.jpg',
  },
  // === TIPS ===
  {
    slug: 'clases-baile-principiantes-barcelona-farrays',
    category: 'tips',
    datePublished: '2026-01-24',
    titleKey: 'Clases de Baile para Principiantes en Barcelona',
    image: '/images/blog/clases-principiantes/og.jpg',
  },
  {
    slug: 'academia-de-danza-barcelona-guia-completa',
    category: 'tips',
    datePublished: '2026-01-29',
    titleKey: 'Academia de Danza en Barcelona',
    image: '/images/blog/academia-danza/og.jpg',
  },
  {
    slug: 'ballet-para-adultos-barcelona',
    category: 'tips',
    datePublished: '2026-01-20',
    titleKey: 'Ballet para Adultos en Barcelona',
    image: '/images/blog/ballet-adultos/og.jpg',
  },
  {
    slug: 'danza-contemporanea-vs-modern-jazz-vs-ballet',
    category: 'tips',
    datePublished: '2026-01-22',
    titleKey: 'Danza Contemporánea vs Modern Jazz vs Ballet',
    image: '/images/blog/danza-comparativa/og.jpg',
  },
  // === FITNESS ===
  {
    slug: 'baile-salud-mental',
    category: 'fitness',
    datePublished: '2026-01-17',
    titleKey: 'Baile y Salud Mental: Beneficios Científicos',
    image: '/images/blog/baile-salud-mental/og.jpg',
  },
];

// =============================================================================
// KEY IMAGES (for Image Sitemap)
// =============================================================================

const KEY_IMAGES = [
  // Class hero images (pagePath = the page where this image appears)
  { url: '/images/classes/Bachata/img/clases-bachata-sensual-barcelona_1920.jpg', caption: 'Clases de Bachata Sensual en Barcelona', title: 'Bachata Sensual Barcelona', pagePath: 'clases/bachata-barcelona' },
  { url: '/images/classes/salsa-cubana/img/salsa-cubana_1920.jpg', caption: 'Clases de Salsa Cubana en Barcelona', title: 'Salsa Cubana Barcelona', pagePath: 'clases/salsa-cubana-barcelona' },
  { url: '/images/classes/dancehall/img/dancehall-classes-barcelona-01_1920.jpg', caption: 'Clases de Dancehall en Barcelona', title: 'Dancehall Barcelona', pagePath: 'clases/dancehall-barcelona' },
  { url: '/images/classes/twerk/img/clases-twerk-barcelona_1920.jpg', caption: 'Clases de Twerk en Barcelona', title: 'Twerk Barcelona', pagePath: 'clases/twerk-barcelona' },
  { url: '/images/classes/heels/img/clases-heels-barcelona_1920.jpg', caption: 'Clases de Heels en Barcelona', title: 'Heels Barcelona', pagePath: 'clases/heels-barcelona' },
  { url: '/images/classes/femmology/img/clases-de-femmology-barcelona_1920.jpg', caption: 'Clases de Femmology en Barcelona', title: 'Femmology Barcelona', pagePath: 'clases/femmology' },
  { url: '/images/classes/afrobeat/img/clases-afrobeat-barcelona_1920.jpg', caption: 'Clases de Afrobeat en Barcelona', title: 'Afrobeat Barcelona', pagePath: 'clases/afrobeats-barcelona' },
  { url: '/images/classes/hip-hop-reggaeton/img/clases-hip-hop-reaggaeton-barcelona_1920.jpg', caption: 'Clases de Hip Hop y Reggaeton en Barcelona', title: 'Hip Hop Reggaeton Barcelona', pagePath: 'clases/hip-hop-reggaeton-barcelona' },
  { url: '/images/classes/ballet/img/clases-ballet-barcelona_1920.jpg', caption: 'Clases de Ballet en Barcelona', title: 'Ballet Barcelona', pagePath: 'clases/ballet-barcelona' },
  { url: '/images/classes/contemporaneo/img/mgs_5189_1920.jpg', caption: 'Clases de Contemporáneo en Barcelona', title: 'Contemporáneo Barcelona', pagePath: 'clases/contemporaneo-barcelona' },
  { url: '/images/classes/modern-jazz/img/clases-modern-jazz-barcelona_1920.jpg', caption: 'Clases de Modern Jazz en Barcelona', title: 'Modern Jazz Barcelona', pagePath: 'clases/modern-jazz-barcelona' },
  { url: '/images/classes/afro-jazz/img/afro-jazz_1920.jpg', caption: 'Clases de Afro Jazz en Barcelona', title: 'Afro Jazz Barcelona', pagePath: 'clases/afro-jazz' },
  { url: '/images/classes/afro-contemporaneo/img/mgs_5260_1920.jpg', caption: 'Clases de Afro Contemporáneo en Barcelona', title: 'Afro Contemporáneo Barcelona', pagePath: 'clases/afro-contemporaneo-barcelona' },
  // Facilities
  { url: '/images/salas/img/salaa-1_1920.jpg', caption: 'Sala principal de baile Farray Center Barcelona', title: 'Sala Principal Farray Center', pagePath: 'instalaciones-escuela-baile-barcelona' },
  { url: '/images/estudio-grabacion/hero.jpg', caption: 'Estudio de grabación Farray Center Barcelona', title: 'Estudio Grabación Barcelona', pagePath: 'estudio-grabacion-barcelona' },
  // Team
  { url: '/images/yunaisy/img/yunaisy-artistica-1_1440.jpg', caption: 'Yunaisy Farray - Fundadora y Directora', title: 'Yunaisy Farray', pagePath: 'yunaisy-farray' },
];

// =============================================================================
// PRIORITY STRATEGY
// =============================================================================

const getPriority = (path, page, lang) => {
  if (page === 'home' && lang === 'es') return 1.0;
  if (page === 'home') return 0.9;

  const mainHubs = ['classesHub', 'danza', 'danzasUrbanas', 'salsaBachata'];
  if (mainHubs.includes(page)) return 0.9;

  const topClasses = ['bachataSensual', 'salsaCubana', 'dancehall', 'twerk', 'femmology', 'heelsBarcelona', 'hipHopReggaeton'];
  if (topClasses.includes(page)) return 0.8;

  if (path.includes('/clases/')) return 0.7;

  const servicePages = ['profesores', 'about', 'clasesParticulares', 'teamBuilding', 'alquilerSalas', 'estudioGrabacion', 'yunaisy', 'metodoFarray'];
  if (servicePages.includes(page)) return 0.7;

  // Blog articles
  if (path.includes('/blog/')) return 0.7;

  const secondaryPages = ['facilities', 'contact', 'faq', 'regalaBaile', 'merchandising', 'serviciosBaile'];
  if (secondaryPages.includes(page)) return 0.6;

  const legalPages = ['termsConditions', 'legalNotice', 'privacyPolicy', 'cookiePolicy'];
  if (legalPages.includes(page)) return 0.5;

  return 0.6;
};

const getChangeFreq = (page) => {
  if (['home', 'classesHub', 'calendario'].includes(page)) return 'weekly';
  if (page.includes('blog')) return 'weekly';
  if (page.includes('clases') || page.includes('baile')) return 'monthly';
  if (['termsConditions', 'legalNotice', 'privacyPolicy', 'cookiePolicy'].includes(page)) return 'yearly';
  return 'monthly';
};

// =============================================================================
// ROUTES (excluding noindex pages)
// =============================================================================

const routes = [
  // ===== ESPAÑOL (ES) =====
  { path: '', lang: 'es', page: 'home' },
  { path: 'es', lang: 'es', page: 'home' },
  { path: 'es/clases', lang: 'es', page: 'classesHub' },
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
  { path: 'es/clases/afro-contemporaneo-barcelona', lang: 'es', page: 'afroContemporaneo' },
  { path: 'es/clases/afro-jazz', lang: 'es', page: 'afroJazz' },
  { path: 'es/clases/contemporaneo-barcelona', lang: 'es', page: 'contemporaneo' },
  { path: 'es/clases/stretching-barcelona', lang: 'es', page: 'stretching' },
  { path: 'es/clases/hip-hop-barcelona', lang: 'es', page: 'hipHop' },
  { path: 'es/clases/entrenamiento-bailarines-barcelona', lang: 'es', page: 'entrenamientoBailarines' },
  { path: 'es/clases/bachata-lady-style-barcelona', lang: 'es', page: 'bachataLadyStyle' },
  { path: 'es/clases/ejercicios-gluteos-barcelona', lang: 'es', page: 'bumBum' },
  { path: 'es/clases/acondicionamiento-fisico-bailarines', lang: 'es', page: 'cuerpoFitPage' },
  { path: 'es/profesores-baile-barcelona', lang: 'es', page: 'profesores' },
  { path: 'es/preguntas-frecuentes', lang: 'es', page: 'faq' },
  { path: 'es/alquiler-salas-baile-barcelona', lang: 'es', page: 'alquilerSalas' },
  { path: 'es/estudio-grabacion-barcelona', lang: 'es', page: 'estudioGrabacion' },
  { path: 'es/terminos-y-condiciones', lang: 'es', page: 'termsConditions' },
  { path: 'es/aviso-legal', lang: 'es', page: 'legalNotice' },
  { path: 'es/politica-privacidad', lang: 'es', page: 'privacyPolicy' },
  { path: 'es/politica-cookies', lang: 'es', page: 'cookiePolicy' },
  { path: 'es/servicios-baile-barcelona', lang: 'es', page: 'serviciosBaile' },
  { path: 'es/como-llegar-escuela-baile-barcelona', lang: 'es', page: 'ubicacion' },
  { path: 'es/calendario', lang: 'es', page: 'calendario' },
  { path: 'es/instalaciones-escuela-baile-barcelona', lang: 'es', page: 'facilities' },
  { path: 'es/blog', lang: 'es', page: 'blog' },
  // Blog categories
  { path: 'es/blog/lifestyle', lang: 'es', page: 'blogLifestyle' },
  { path: 'es/blog/historia', lang: 'es', page: 'blogHistoria' },
  { path: 'es/blog/tutoriales', lang: 'es', page: 'blogTutoriales' },
  { path: 'es/blog/tips', lang: 'es', page: 'blogTips' },
  { path: 'es/blog/fitness', lang: 'es', page: 'blogFitness' },
  // Blog articles - lifestyle
  { path: 'es/blog/lifestyle/beneficios-bailar-salsa', lang: 'es', page: 'blogBeneficiosSalsa' },
  { path: 'es/blog/lifestyle/clases-de-salsa-barcelona', lang: 'es', page: 'blogClasesSalsaBarcelona' },
  { path: 'es/blog/lifestyle/como-perder-miedo-bailar', lang: 'es', page: 'blogPerderMiedoBailar' },
  // Blog articles - historia
  { path: 'es/blog/historia/historia-salsa-barcelona', lang: 'es', page: 'blogHistoriaSalsa' },
  { path: 'es/blog/historia/historia-bachata-barcelona', lang: 'es', page: 'blogHistoriaBachata' },
  // Blog articles - tutoriales
  { path: 'es/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'es', page: 'blogSalsaRitmo' },
  { path: 'es/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'es', page: 'blogSalsaVsBachata' },
  // Blog articles - tips
  { path: 'es/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'es', page: 'blogClasesPrincipiantes' },
  { path: 'es/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'es', page: 'blogAcademiaDanza' },
  { path: 'es/blog/tips/ballet-para-adultos-barcelona', lang: 'es', page: 'blogBalletAdultos' },
  { path: 'es/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'es', page: 'blogDanzaContemporaneaVsJazzBallet' },
  // Blog articles - fitness
  { path: 'es/blog/fitness/baile-salud-mental', lang: 'es', page: 'blogBaileSaludMental' },

  // ===== CATALÁN (CA) =====
  { path: 'ca', lang: 'ca', page: 'home' },
  { path: 'ca/clases', lang: 'ca', page: 'classesHub' },
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
  { path: 'ca/clases/afro-contemporaneo-barcelona', lang: 'ca', page: 'afroContemporaneo' },
  { path: 'ca/clases/afro-jazz', lang: 'ca', page: 'afroJazz' },
  { path: 'ca/clases/contemporaneo-barcelona', lang: 'ca', page: 'contemporaneo' },
  { path: 'ca/clases/stretching-barcelona', lang: 'ca', page: 'stretching' },
  { path: 'ca/clases/hip-hop-barcelona', lang: 'ca', page: 'hipHop' },
  { path: 'ca/clases/entrenamiento-bailarines-barcelona', lang: 'ca', page: 'entrenamientoBailarines' },
  { path: 'ca/clases/bachata-lady-style-barcelona', lang: 'ca', page: 'bachataLadyStyle' },
  { path: 'ca/clases/ejercicios-gluteos-barcelona', lang: 'ca', page: 'bumBum' },
  { path: 'ca/clases/acondicionamiento-fisico-bailarines', lang: 'ca', page: 'cuerpoFitPage' },
  { path: 'ca/profesores-baile-barcelona', lang: 'ca', page: 'profesores' },
  { path: 'ca/preguntas-frecuentes', lang: 'ca', page: 'faq' },
  { path: 'ca/alquiler-salas-baile-barcelona', lang: 'ca', page: 'alquilerSalas' },
  { path: 'ca/estudio-grabacion-barcelona', lang: 'ca', page: 'estudioGrabacion' },
  { path: 'ca/terminos-y-condiciones', lang: 'ca', page: 'termsConditions' },
  { path: 'ca/aviso-legal', lang: 'ca', page: 'legalNotice' },
  { path: 'ca/politica-privacidad', lang: 'ca', page: 'privacyPolicy' },
  { path: 'ca/politica-cookies', lang: 'ca', page: 'cookiePolicy' },
  { path: 'ca/servicios-baile-barcelona', lang: 'ca', page: 'serviciosBaile' },
  { path: 'ca/como-llegar-escuela-baile-barcelona', lang: 'ca', page: 'ubicacion' },
  { path: 'ca/calendario', lang: 'ca', page: 'calendario' },
  { path: 'ca/instalaciones-escuela-baile-barcelona', lang: 'ca', page: 'facilities' },
  { path: 'ca/blog', lang: 'ca', page: 'blog' },
  // Blog categories
  { path: 'ca/blog/lifestyle', lang: 'ca', page: 'blogLifestyle' },
  { path: 'ca/blog/historia', lang: 'ca', page: 'blogHistoria' },
  { path: 'ca/blog/tutoriales', lang: 'ca', page: 'blogTutoriales' },
  { path: 'ca/blog/tips', lang: 'ca', page: 'blogTips' },
  { path: 'ca/blog/fitness', lang: 'ca', page: 'blogFitness' },
  // Blog articles - lifestyle
  { path: 'ca/blog/lifestyle/beneficios-bailar-salsa', lang: 'ca', page: 'blogBeneficiosSalsa' },
  { path: 'ca/blog/lifestyle/clases-de-salsa-barcelona', lang: 'ca', page: 'blogClasesSalsaBarcelona' },
  { path: 'ca/blog/lifestyle/como-perder-miedo-bailar', lang: 'ca', page: 'blogPerderMiedoBailar' },
  // Blog articles - historia
  { path: 'ca/blog/historia/historia-salsa-barcelona', lang: 'ca', page: 'blogHistoriaSalsa' },
  { path: 'ca/blog/historia/historia-bachata-barcelona', lang: 'ca', page: 'blogHistoriaBachata' },
  // Blog articles - tutoriales
  { path: 'ca/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'ca', page: 'blogSalsaRitmo' },
  { path: 'ca/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'ca', page: 'blogSalsaVsBachata' },
  // Blog articles - tips
  { path: 'ca/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'ca', page: 'blogClasesPrincipiantes' },
  { path: 'ca/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'ca', page: 'blogAcademiaDanza' },
  { path: 'ca/blog/tips/ballet-para-adultos-barcelona', lang: 'ca', page: 'blogBalletAdultos' },
  { path: 'ca/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'ca', page: 'blogDanzaContemporaneaVsJazzBallet' },
  // Blog articles - fitness
  { path: 'ca/blog/fitness/baile-salud-mental', lang: 'ca', page: 'blogBaileSaludMental' },

  // ===== ENGLISH (EN) =====
  { path: 'en', lang: 'en', page: 'home' },
  { path: 'en/clases', lang: 'en', page: 'classesHub' },
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
  { path: 'en/clases/afro-contemporaneo-barcelona', lang: 'en', page: 'afroContemporaneo' },
  { path: 'en/clases/afro-jazz', lang: 'en', page: 'afroJazz' },
  { path: 'en/clases/contemporaneo-barcelona', lang: 'en', page: 'contemporaneo' },
  { path: 'en/clases/stretching-barcelona', lang: 'en', page: 'stretching' },
  { path: 'en/clases/hip-hop-barcelona', lang: 'en', page: 'hipHop' },
  { path: 'en/clases/entrenamiento-bailarines-barcelona', lang: 'en', page: 'entrenamientoBailarines' },
  { path: 'en/clases/bachata-lady-style-barcelona', lang: 'en', page: 'bachataLadyStyle' },
  { path: 'en/clases/ejercicios-gluteos-barcelona', lang: 'en', page: 'bumBum' },
  { path: 'en/clases/acondicionamiento-fisico-bailarines', lang: 'en', page: 'cuerpoFitPage' },
  { path: 'en/profesores-baile-barcelona', lang: 'en', page: 'profesores' },
  { path: 'en/preguntas-frecuentes', lang: 'en', page: 'faq' },
  { path: 'en/alquiler-salas-baile-barcelona', lang: 'en', page: 'alquilerSalas' },
  { path: 'en/estudio-grabacion-barcelona', lang: 'en', page: 'estudioGrabacion' },
  { path: 'en/terminos-y-condiciones', lang: 'en', page: 'termsConditions' },
  { path: 'en/aviso-legal', lang: 'en', page: 'legalNotice' },
  { path: 'en/politica-privacidad', lang: 'en', page: 'privacyPolicy' },
  { path: 'en/politica-cookies', lang: 'en', page: 'cookiePolicy' },
  { path: 'en/servicios-baile-barcelona', lang: 'en', page: 'serviciosBaile' },
  { path: 'en/como-llegar-escuela-baile-barcelona', lang: 'en', page: 'ubicacion' },
  { path: 'en/calendario', lang: 'en', page: 'calendario' },
  { path: 'en/instalaciones-escuela-baile-barcelona', lang: 'en', page: 'facilities' },
  { path: 'en/blog', lang: 'en', page: 'blog' },
  // Blog categories
  { path: 'en/blog/lifestyle', lang: 'en', page: 'blogLifestyle' },
  { path: 'en/blog/historia', lang: 'en', page: 'blogHistoria' },
  { path: 'en/blog/tutoriales', lang: 'en', page: 'blogTutoriales' },
  { path: 'en/blog/tips', lang: 'en', page: 'blogTips' },
  { path: 'en/blog/fitness', lang: 'en', page: 'blogFitness' },
  // Blog articles - lifestyle
  { path: 'en/blog/lifestyle/beneficios-bailar-salsa', lang: 'en', page: 'blogBeneficiosSalsa' },
  { path: 'en/blog/lifestyle/clases-de-salsa-barcelona', lang: 'en', page: 'blogClasesSalsaBarcelona' },
  { path: 'en/blog/lifestyle/como-perder-miedo-bailar', lang: 'en', page: 'blogPerderMiedoBailar' },
  // Blog articles - historia
  { path: 'en/blog/historia/historia-salsa-barcelona', lang: 'en', page: 'blogHistoriaSalsa' },
  { path: 'en/blog/historia/historia-bachata-barcelona', lang: 'en', page: 'blogHistoriaBachata' },
  // Blog articles - tutoriales
  { path: 'en/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'en', page: 'blogSalsaRitmo' },
  { path: 'en/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'en', page: 'blogSalsaVsBachata' },
  // Blog articles - tips
  { path: 'en/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'en', page: 'blogClasesPrincipiantes' },
  { path: 'en/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'en', page: 'blogAcademiaDanza' },
  { path: 'en/blog/tips/ballet-para-adultos-barcelona', lang: 'en', page: 'blogBalletAdultos' },
  { path: 'en/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'en', page: 'blogDanzaContemporaneaVsJazzBallet' },
  // Blog articles - fitness
  { path: 'en/blog/fitness/baile-salud-mental', lang: 'en', page: 'blogBaileSaludMental' },

  // ===== FRENCH (FR) =====
  { path: 'fr', lang: 'fr', page: 'home' },
  { path: 'fr/clases', lang: 'fr', page: 'classesHub' },
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
  { path: 'fr/clases/afro-contemporaneo-barcelona', lang: 'fr', page: 'afroContemporaneo' },
  { path: 'fr/clases/afro-jazz', lang: 'fr', page: 'afroJazz' },
  { path: 'fr/clases/contemporaneo-barcelona', lang: 'fr', page: 'contemporaneo' },
  { path: 'fr/clases/stretching-barcelona', lang: 'fr', page: 'stretching' },
  { path: 'fr/clases/hip-hop-barcelona', lang: 'fr', page: 'hipHop' },
  { path: 'fr/clases/entrenamiento-bailarines-barcelona', lang: 'fr', page: 'entrenamientoBailarines' },
  { path: 'fr/clases/bachata-lady-style-barcelona', lang: 'fr', page: 'bachataLadyStyle' },
  { path: 'fr/clases/ejercicios-gluteos-barcelona', lang: 'fr', page: 'bumBum' },
  { path: 'fr/clases/acondicionamiento-fisico-bailarines', lang: 'fr', page: 'cuerpoFitPage' },
  { path: 'fr/profesores-baile-barcelona', lang: 'fr', page: 'profesores' },
  { path: 'fr/preguntas-frecuentes', lang: 'fr', page: 'faq' },
  { path: 'fr/alquiler-salas-baile-barcelona', lang: 'fr', page: 'alquilerSalas' },
  { path: 'fr/estudio-grabacion-barcelona', lang: 'fr', page: 'estudioGrabacion' },
  { path: 'fr/terminos-y-condiciones', lang: 'fr', page: 'termsConditions' },
  { path: 'fr/aviso-legal', lang: 'fr', page: 'legalNotice' },
  { path: 'fr/politica-privacidad', lang: 'fr', page: 'privacyPolicy' },
  { path: 'fr/politica-cookies', lang: 'fr', page: 'cookiePolicy' },
  { path: 'fr/servicios-baile-barcelona', lang: 'fr', page: 'serviciosBaile' },
  { path: 'fr/como-llegar-escuela-baile-barcelona', lang: 'fr', page: 'ubicacion' },
  { path: 'fr/calendario', lang: 'fr', page: 'calendario' },
  { path: 'fr/instalaciones-escuela-baile-barcelona', lang: 'fr', page: 'facilities' },
  { path: 'fr/blog', lang: 'fr', page: 'blog' },
  // Blog categories
  { path: 'fr/blog/lifestyle', lang: 'fr', page: 'blogLifestyle' },
  { path: 'fr/blog/historia', lang: 'fr', page: 'blogHistoria' },
  { path: 'fr/blog/tutoriales', lang: 'fr', page: 'blogTutoriales' },
  { path: 'fr/blog/tips', lang: 'fr', page: 'blogTips' },
  { path: 'fr/blog/fitness', lang: 'fr', page: 'blogFitness' },
  // Blog articles - lifestyle
  { path: 'fr/blog/lifestyle/beneficios-bailar-salsa', lang: 'fr', page: 'blogBeneficiosSalsa' },
  { path: 'fr/blog/lifestyle/clases-de-salsa-barcelona', lang: 'fr', page: 'blogClasesSalsaBarcelona' },
  { path: 'fr/blog/lifestyle/como-perder-miedo-bailar', lang: 'fr', page: 'blogPerderMiedoBailar' },
  // Blog articles - historia
  { path: 'fr/blog/historia/historia-salsa-barcelona', lang: 'fr', page: 'blogHistoriaSalsa' },
  { path: 'fr/blog/historia/historia-bachata-barcelona', lang: 'fr', page: 'blogHistoriaBachata' },
  // Blog articles - tutoriales
  { path: 'fr/blog/historia/salsa-ritmo-conquisto-mundo', lang: 'fr', page: 'blogSalsaRitmo' },
  { path: 'fr/blog/tips/salsa-vs-bachata-que-estilo-elegir', lang: 'fr', page: 'blogSalsaVsBachata' },
  // Blog articles - tips
  { path: 'fr/blog/tips/clases-baile-principiantes-barcelona-farrays', lang: 'fr', page: 'blogClasesPrincipiantes' },
  { path: 'fr/blog/tips/academia-de-danza-barcelona-guia-completa', lang: 'fr', page: 'blogAcademiaDanza' },
  { path: 'fr/blog/tips/ballet-para-adultos-barcelona', lang: 'fr', page: 'blogBalletAdultos' },
  { path: 'fr/blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', lang: 'fr', page: 'blogDanzaContemporaneaVsJazzBallet' },
  // Blog articles - fitness
  { path: 'fr/blog/fitness/baile-salud-mental', lang: 'fr', page: 'blogBaileSaludMental' },
];

// =============================================================================
// SITEMAP GENERATORS
// =============================================================================

const generateHreflangLinks = (path) => {
  let cleanPath = path.replace(/^(es|ca|en|fr)\//, '');
  if (SUPPORTED_LOCALES.includes(cleanPath)) cleanPath = '';

  let links = '';
  SUPPORTED_LOCALES.forEach(locale => {
    const url = cleanPath ? `${BASE_URL}/${locale}/${cleanPath}` : `${BASE_URL}/${locale}`;
    links += `    <xhtml:link rel="alternate" hreflang="${locale}" href="${url}"/>\n`;
  });

  const defaultUrl = cleanPath ? `${BASE_URL}/es/${cleanPath}` : `${BASE_URL}/es`;
  links += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>`;

  return links;
};

const generateUrlEntry = (route) => {
  const url = route.path ? `${BASE_URL}/${route.path}` : BASE_URL;
  const priority = getPriority(route.path, route.page, route.lang);
  const changefreq = getChangeFreq(route.page);
  const lastmod = getCurrentDate();
  const hreflangLinks = generateHreflangLinks(route.path);

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
${hreflangLinks}
  </url>`;
};

// 1. PAGES SITEMAP
const generatePagesSitemap = () => {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
  const footer = `</urlset>`;
  const urls = routes.map(route => generateUrlEntry(route)).join('\n\n');
  return `${header}\n${urls}\n${footer}\n`;
};

// 2. NEWS SITEMAP (for Google News)
const generateNewsSitemap = () => {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
  const footer = `</urlset>`;

  const entries = [];

  BLOG_ARTICLES.forEach(article => {
    SUPPORTED_LOCALES.forEach(locale => {
      const url = `${BASE_URL}/${locale}/blog/${article.category}/${article.slug}`;
      const langCode = locale === 'es' ? 'es' : locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'fr';

      entries.push(`  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>Farray's International Dance Center</news:name>
        <news:language>${langCode}</news:language>
      </news:publication>
      <news:publication_date>${article.datePublished}</news:publication_date>
      <news:title>${article.titleKey}</news:title>
      <news:keywords>baile, danza, barcelona, ${article.category}</news:keywords>
    </news:news>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE_URL}/es/blog/${article.category}/${article.slug}"/>
    <xhtml:link rel="alternate" hreflang="ca" href="${BASE_URL}/ca/blog/${article.category}/${article.slug}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/blog/${article.category}/${article.slug}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE_URL}/fr/blog/${article.category}/${article.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/es/blog/${article.category}/${article.slug}"/>
  </url>`);
    });
  });

  return `${header}\n${entries.join('\n\n')}\n${footer}\n`;
};

// 3. IMAGES SITEMAP
const generateImagesSitemap = () => {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
  const footer = `</urlset>`;

  const entries = KEY_IMAGES.map(img => `  <url>
    <loc>${BASE_URL}/es/${img.pagePath}</loc>
    <image:image>
      <image:loc>${BASE_URL}${img.url}</image:loc>
      <image:caption>${img.caption}</image:caption>
      <image:title>${img.title}</image:title>
      <image:license>https://creativecommons.org/licenses/by-nc-nd/4.0/</image:license>
    </image:image>
  </url>`);

  return `${header}\n${entries.join('\n\n')}\n${footer}\n`;
};

// 4. SITEMAP INDEX
const generateSitemapIndex = () => {
  const lastmod = getCurrentDate();

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-news.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-images.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>
`;
};

// =============================================================================
// MAIN EXECUTION
// =============================================================================

console.log('🗺️  Generating Enterprise Sitemap Ecosystem for Farray\'s Center...\n');

// Generate all sitemaps
const pagesSitemap = generatePagesSitemap();
const newsSitemap = generateNewsSitemap();
const imagesSitemap = generateImagesSitemap();
const sitemapIndex = generateSitemapIndex();

// Write files
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-pages.xml'), pagesSitemap, 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-news.xml'), newsSitemap, 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-images.xml'), imagesSitemap, 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemapIndex, 'utf8');

// Stats
const totalPages = routes.length;
const totalNews = BLOG_ARTICLES.length * SUPPORTED_LOCALES.length;
const totalImages = KEY_IMAGES.length;

console.log('✅ Enterprise Sitemap Ecosystem generated!\n');
console.log('📊 Statistics:');
console.log(`   - sitemap.xml (index): 3 sitemaps referenced`);
console.log(`   - sitemap-pages.xml: ${totalPages} URLs with hreflang`);
console.log(`   - sitemap-news.xml: ${totalNews} news articles (${BLOG_ARTICLES.length} × 4 languages)`);
console.log(`   - sitemap-images.xml: ${totalImages} key images`);
console.log(`   - Excluded: horarios-precios (lead-gated)`);
console.log(`   - Excluded: ${LANDING_SLUGS.length} landing slugs (noindex)`);
console.log('\n📁 Output files:');
console.log(`   - ${path.join(OUTPUT_DIR, 'sitemap.xml')} (INDEX)`);
console.log(`   - ${path.join(OUTPUT_DIR, 'sitemap-pages.xml')}`);
console.log(`   - ${path.join(OUTPUT_DIR, 'sitemap-news.xml')}`);
console.log(`   - ${path.join(OUTPUT_DIR, 'sitemap-images.xml')}`);
console.log('\n🔍 Next steps:');
console.log('   1. Update robots.txt: Sitemap: https://www.farrayscenter.com/sitemap.xml');
console.log('   2. Submit sitemap.xml to Google Search Console');
console.log('   3. Submit to Bing Webmaster Tools\n');
