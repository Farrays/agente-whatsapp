#!/usr/bin/env node

/**
 * Generate sitemap-pages.xml with all routes from App.tsx
 * Also updates the sitemap index (sitemap.xml) with current date
 * Run this script during build process to keep sitemap up to date
 */

import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const sitemapPagesPath = join(publicDir, 'sitemap-pages.xml');
const sitemapIndexPath = join(publicDir, 'sitemap.xml');

// All routes from App.tsx (excluding redirects and 404)
const routes = [
  // Home
  { path: '', priority: '1.0', changefreq: 'weekly' },

  // Hub Pages (categorías principales)
  { path: 'clases', priority: '0.8', changefreq: 'weekly' },
  { path: 'clases/baile-barcelona', priority: '0.9', changefreq: 'weekly' },
  { path: 'clases/danzas-urbanas-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/salsa-bachata-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/danza-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/heels-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/entrenamiento-bailarines-barcelona', priority: '0.8', changefreq: 'monthly' },

  // Danzas Urbanas
  { path: 'clases/dancehall-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/twerk-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/afrobeats-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/hip-hop-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/hip-hop-reggaeton-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/sexy-reggaeton-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/reggaeton-cubano-barcelona', priority: '0.8', changefreq: 'monthly' },

  // Salsa y Bachata
  { path: 'clases/salsa-cubana-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/salsa-lady-style-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/bachata-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/bachata-lady-style-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/timba-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/folklore-cubano', priority: '0.7', changefreq: 'monthly' },

  // Danza Clásica y Contemporánea
  { path: 'clases/ballet-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/contemporaneo-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/modern-jazz-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/afro-contemporaneo-barcelona', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/afro-jazz', priority: '0.8', changefreq: 'monthly' },

  // Heels y Estilos Sensuales
  { path: 'clases/femmology', priority: '0.8', changefreq: 'monthly' },
  { path: 'clases/sexy-style-barcelona', priority: '0.8', changefreq: 'monthly' },

  // Fitness y Preparación Física
  { path: 'clases/stretching-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/ejercicios-gluteos-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/acondicionamiento-fisico-bailarines', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/cuerpo-fit', priority: '0.7', changefreq: 'monthly' },

  // Otros estilos
  { path: 'clases/commercial-dance-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/kizomba-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/kpop-dance-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'clases/baile-mananas', priority: '0.6', changefreq: 'monthly' },

  // Páginas de Alto Valor Transaccional
  { path: 'precios-clases-baile-barcelona', priority: '0.9', changefreq: 'weekly' },
  { path: 'horarios-clases-baile-barcelona', priority: '0.9', changefreq: 'weekly' },
  { path: 'clases-particulares-baile', priority: '0.8', changefreq: 'monthly' },

  // Servicios
  { path: 'alquiler-salas-baile-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'estudio-grabacion-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'servicios-baile-barcelona', priority: '0.6', changefreq: 'monthly' },
  { path: 'regala-baile', priority: '0.6', changefreq: 'monthly' },

  // Información
  { path: 'sobre-nosotros', priority: '0.7', changefreq: 'monthly' },
  { path: 'yunaisy-farray', priority: '0.7', changefreq: 'monthly' },
  { path: 'profesores-baile-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'instalaciones-escuela-baile-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'como-llegar-escuela-baile-barcelona', priority: '0.7', changefreq: 'monthly' },
  { path: 'contacto', priority: '0.7', changefreq: 'monthly' },
  { path: 'preguntas-frecuentes', priority: '0.6', changefreq: 'monthly' },
  { path: 'calendario', priority: '0.6', changefreq: 'monthly' },
  { path: 'merchandising', priority: '0.5', changefreq: 'monthly' },
  { path: 'metodo-farray', priority: '0.7', changefreq: 'monthly' },
  { path: 'team-building-barcelona', priority: '0.6', changefreq: 'monthly' },

  // Blog - Índice y Categorías (solo con contenido)
  { path: 'blog', priority: '0.7', changefreq: 'weekly' },
  // blog/tutoriales excluido - no tiene artículos
  { path: 'blog/tips', priority: '0.6', changefreq: 'weekly' },
  { path: 'blog/historia', priority: '0.6', changefreq: 'weekly' },
  { path: 'blog/fitness', priority: '0.6', changefreq: 'weekly' },
  { path: 'blog/lifestyle', priority: '0.6', changefreq: 'weekly' },

  // Blog - Artículos Lifestyle
  { path: 'blog/lifestyle/beneficios-bailar-salsa', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/lifestyle/clases-de-salsa-barcelona', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/lifestyle/como-perder-miedo-bailar', priority: '0.6', changefreq: 'monthly' },

  // Blog - Artículos Historia
  { path: 'blog/historia/historia-salsa-barcelona', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/historia/historia-bachata-barcelona', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/historia/salsa-ritmo-conquisto-mundo', priority: '0.6', changefreq: 'monthly' },

  // Blog - Artículos Tips
  { path: 'blog/tips/academia-de-danza-barcelona-guia-completa', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/tips/clases-baile-principiantes-barcelona-farrays', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/tips/danza-contemporanea-vs-modern-jazz-vs-ballet', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/tips/danzas-urbanas-barcelona-guia-completa', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog/tips/ballet-para-adultos-barcelona', priority: '0.6', changefreq: 'monthly' },

  // Blog - Artículos Tutoriales
  { path: 'blog/tips/salsa-vs-bachata-que-estilo-elegir', priority: '0.6', changefreq: 'monthly' },

  // Blog - Artículos Fitness
  { path: 'blog/fitness/baile-salud-mental', priority: '0.6', changefreq: 'monthly' },
];

const locales = ['es', 'ca', 'en', 'fr'];
const baseUrl = 'https://www.farrayscenter.com';
const currentDate = new Date().toISOString().split('T')[0];

function generateHreflangLinks(routePath) {
  return locales.map(lang => {
    const fullPath = routePath ? `${lang}/${routePath}` : lang;
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${fullPath}"/>`;
  }).join('\n');
}

function generateUrlEntry(locale, route) {
  const fullPath = route.path ? `${locale}/${route.path}` : locale;
  return `  <url>
    <loc>${baseUrl}/${fullPath}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${generateHreflangLinks(route.path)}
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/es${route.path ? '/' + route.path : ''}"/>
  </url>`;
}

try {
  console.log('📝 Generating sitemap-pages.xml...');

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Generate entries for each locale and route
  routes.forEach(route => {
    locales.forEach(locale => {
      sitemap += generateUrlEntry(locale, route) + '\n';
    });
  });

  sitemap += '</urlset>\n';

  // Write sitemap-pages.xml
  writeFileSync(sitemapPagesPath, sitemap, 'utf-8');

  // Update sitemap index with current date
  // Note: sitemap-news.xml removed (site is not a Google News publisher)
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.farrayscenter.com/sitemap-pages.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.farrayscenter.com/sitemap-images.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>
`;
  writeFileSync(sitemapIndexPath, sitemapIndex, 'utf-8');

  const totalUrls = routes.length * locales.length;
  console.log(`✅ Generated sitemap-pages.xml with ${totalUrls} URLs (${routes.length} routes × ${locales.length} languages)`);
  console.log(`✅ Updated sitemap.xml index with date: ${currentDate}`);
  console.log(`📍 Location: ${publicDir}/`);
} catch (error) {
  console.error('❌ Failed to generate sitemap:', error.message);
  process.exit(1);
}
