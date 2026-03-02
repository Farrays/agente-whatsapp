/**
 * RAG Knowledge Chunks
 *
 * Defines all factual knowledge chunks for Laura's RAG system.
 * Each chunk is a self-contained unit of information (~150-250 tokens).
 *
 * Pricing chunks are generated programmatically from pricing-data.ts
 * to maintain a single source of truth.
 */

import {
  MONTHLY_PLANS_REGULAR,
  MONTHLY_PLANS_PREMIUM,
  UNLIMITED_PLAN,
  FLEXIBLE_PLANS_REGULAR,
  FLEXIBLE_PLANS_PREMIUM,
  DROP_IN_PRICES,
  PERSONAL_TRAINING_PACKS,
  CHOREOGRAPHY_PRICES,
  ENROLLMENT_FEE,
} from '../../../../constants/pricing-data.js';

// ============================================================================
// TYPES
// ============================================================================

export interface KnowledgeChunk {
  id: string;
  section: string;
  keywords: string[];
  content: string;
  tokenEstimate: number;
}

export const CHUNK_VERSION = '1.0.0';

// ============================================================================
// PRICING CHUNK GENERATORS (from pricing-data.ts — single source of truth)
// ============================================================================

function generatePricesMonthlyContent(): string {
  const regularRows = MONTHLY_PLANS_REGULAR.map(
    p =>
      `${p.hoursPerWeek}h/semana: ${p.price}euro/mes (${p.pricePerActivity}euro/actividad)${p.isPopular ? ' - MAS POPULAR' : ''}`
  ).join('\n');

  const premiumRows = MONTHLY_PLANS_PREMIUM.map(
    p =>
      `${p.hoursPerWeek}h/semana: ${p.price}euro/mes (${p.pricePerActivity}euro/actividad)${p.isPopular ? ' - MAS POPULAR' : ''}`
  ).join('\n');

  return `PRECIOS OFICIALES - CUOTAS MENSUALES

Cuota de inscripcion: ${ENROLLMENT_FEE.price}euro (incluye acceso, plaza fija, seguro, beneficios socio). ACTUALMENTE GRATIS. Renovacion anual: 20euro (1 agosto).

CUOTAS MENSUALES - CURSOS REGULARES:
${regularRows}
Ilimitada: ${UNLIMITED_PLAN.price}euro/mes

CUOTAS MENSUALES - CURSOS PREMIUM (con Yunaisy Farray):
${premiumRows}
Ilimitada: ${UNLIMITED_PLAN.price}euro/mes

NOTA: Cursos Premium = impartidos por Yunaisy Farray (directora-fundadora, maestra UNESCO, bailarina en Street Dance 2)`;
}

function generatePricesPackagesContent(): string {
  const flexRegular = FLEXIBLE_PLANS_REGULAR.map(
    p => `${p.activities} clases (${p.duration}): ${p.price}euro, validez ${p.validityMonths} meses`
  ).join('\n');

  const flexPremium = FLEXIBLE_PLANS_PREMIUM.map(
    p => `${p.activities} clases (${p.duration}): ${p.price}euro, validez ${p.validityMonths} meses`
  ).join('\n');

  const dropinLines = DROP_IN_PRICES.map(
    p => `${p.type === 'premium' ? 'Premium' : 'Regular'} ${p.duration}: ${p.price}euro`
  ).join(', ');

  const ptLines = PERSONAL_TRAINING_PACKS.map(
    p =>
      `${p.sessions} sesion${p.sessions > 1 ? 'es' : ''}: ${p.price}euro (${p.pricePerSession}euro/sesion${p.savingsPercent ? `, -${p.savingsPercent}%` : ''})`
  ).join('\n');

  return `PRECIOS OFICIALES - BONOS, CLASES SUELTAS Y PRIVADAS

BONOS FLEXIBLES - REGULARES:
${flexRegular}

BONOS FLEXIBLES - PREMIUM:
${flexPremium}

CLASES SUELTAS (sin inscripcion):
${dropinLines}

CLASES PRIVADAS (entrenamientos personalizados):
${ptLines}

CURSOS DE COREOGRAFIA:
Estudiantes: 1.5h=${CHOREOGRAPHY_PRICES.students['1.5h']}euro, 3h=${CHOREOGRAPHY_PRICES.students['3h']}euro
Externos: 1.5h=${CHOREOGRAPHY_PRICES.external['1.5h']}euro, 3h=${CHOREOGRAPHY_PRICES.external['3h']}euro`;
}

// ============================================================================
// KNOWLEDGE CHUNKS
// ============================================================================

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'center-info',
    section: 'centro',
    keywords: [
      'direccion',
      'address',
      'donde',
      'where',
      'como llegar',
      'metro',
      'transporte',
      'telefono',
      'phone',
      'email',
      'contacto',
      'contact',
      'instalaciones',
      'facilities',
      'horario apertura',
      'opening hours',
      'abierto',
      'cerrado',
      'salas',
    ],
    tokenEstimate: 180,
    content: `DATOS DEL CENTRO

Nombre: Farray's International Dance Center
Direccion: Carrer d'Entenca 100, Local 1, 08015 Barcelona
Telefono: +34 622 247 085
WhatsApp: 34622247085
Email: info@farrayscenter.com
Web: www.farrayscenter.com

Como llegar: Metro L1 Rocafort (4 min), L5 Entenca (5 min), Tren Sants (8 min), Bus 41/54/H8.

Horario de apertura:
Lunes: 10:30-12:30 y 17:30-23:00
Martes: 10:30-13:30 y 17:30-23:00
Miercoles: 17:30-23:00
Jueves: 09:30-11:30 y 17:30-23:00
Viernes: 17:30-20:30
Sabado-Domingo: Cerrado

Instalaciones: 700m2, 4 salas con espejos profesionales, barras de ballet, suelo profesional, vestuarios, aire acondicionado.`,
  },

  {
    id: 'prices-monthly',
    section: 'precios',
    keywords: [
      'precio',
      'cuanto',
      'cuesta',
      'coste',
      'mensual',
      'monthly',
      'cuota',
      'inscripcion',
      'matricula',
      'premium',
      'yunaisy',
      'price',
      'cost',
      'how much',
      'prix',
      'tarifa',
      'pagar',
    ],
    tokenEstimate: 200,
    content: generatePricesMonthlyContent(),
  },

  {
    id: 'prices-packages',
    section: 'precios',
    keywords: [
      'bono',
      'bonos',
      'flexible',
      'clase suelta',
      'drop-in',
      'privada',
      'private',
      'coreografia',
      'choreography',
      'pack',
      'paquete',
      'participacion',
      'puntual',
    ],
    tokenEstimate: 200,
    content: generatePricesPackagesContent(),
  },

  {
    id: 'dance-styles',
    section: 'estilos',
    keywords: [
      'estilo',
      'style',
      'salsa',
      'bachata',
      'kizomba',
      'hip hop',
      'twerk',
      'dancehall',
      'ballet',
      'contemporaneo',
      'heels',
      'femmology',
      'sexy style',
      'afrobeats',
      'kpop',
      'k-pop',
      'reggaeton',
      'stretching',
      'jazz',
      'folklore',
      'timba',
      'afro',
    ],
    tokenEstimate: 200,
    content: `ESTILOS DE BAILE (25+ estilos)

Latinos: Salsa Cubana (en pareja), Salsa Lady Style (solo work), Bachata (sensual/moderna/tradicional), Bachata Lady Style, Timba Cubana, Folklore Cubano, Kizomba.

Urbanos: Hip Hop, Dancehall, Twerk, Afrobeats, K-Pop, Commercial Dance, Sexy Reggaeton/Reparto Cubano, Hip Hop Reggaeton.

Heels/Femenino: Heels/Stiletto, Femmology (creado por Yunaisy Farray), Sexy Style.

Clasica/Contemporanea: Ballet Clasico, Danza Contemporanea, Modern Jazz, Afro Jazz, Afro Contemporaneo.

Fitness: Stretching, Bum Bum/Cuerpo Fit, Body Conditioning.

DIFERENCIAS CLAVE:
Femmology vs Sexy Style: Femmology es un METODO EXCLUSIVO de Yunaisy, tacones OBLIGATORIOS (10cm+), enfoque en empoderamiento y tecnica. Sexy Style (Yasmina) es mas libre, tacones OPCIONALES, enfoque en sensualidad y expresion.
Dancehall vs Twerk vs Dancehall Twerk: Dancehall = urbano jamaicano, todo el cuerpo, steps tradicionales. Twerk = aislamiento de gluteos, cultura afroamericana, muy intenso. Dancehall Twerk (Isa Lopez) = fusion de ambos.`,
  },

  {
    id: 'teachers',
    section: 'profesores',
    keywords: [
      'profesor',
      'profesora',
      'profe',
      'teacher',
      'yunaisy',
      'mathias',
      'eugenia',
      'sandra',
      'marcos',
      'charlie',
      'daniel',
      'alejandro',
      'lia',
      'iroel',
      'yasmina',
      'crisag',
      'grechen',
      'quien da',
      'who teaches',
      'professeur',
    ],
    tokenEstimate: 200,
    content: `PROFESORES PRINCIPALES

Yunaisy Farray (directora): Maestra UNESCO, ENA Cuba, Street Dance 2, Got Talent. Afro Jazz, Salsa Lady Style, Femmology, Afro Contemporaneo. 25 anos de experiencia.
Mathias Font y Eugenia Trujillo: Campeones Mundiales Salsa LA. Bachata.
Sandra Gomez: Dancehall, Twerk.
Isabel Lopez: Dancehall, Twerk.
Marcos Martinez: Hip Hop, Breaking. Juez internacional.
Charlie Breezy: Afro Contemporaneo, Hip Hop Reggaeton, Afrobeats. ENA Cuba.
Daniel Sene: Ballet, Contemporaneo, Stretching. ENB Cuba.
Alejandro Minoso: Ballet, Modern Jazz, Afro Jazz. ENA Cuba, Cia Carlos Acosta.
Lia Valdes: Salsa Cubana, Salsa Lady Style. ENA Cuba.
Iroel Bastarreche: Salsa Cubana. Ballet Folklorico Camaguey.
Yasmina Fernandez: Salsa Lady Style, Sexy Style, Sexy Reggaeton.
CrisAg: Body Conditioning, Stretching, Bum Bum.
Grechen Mendez: Folklore Cubano, Rumba, Timba. ISA Cuba.`,
  },

  {
    id: 'levels',
    section: 'niveles',
    keywords: [
      'nivel',
      'level',
      'principiante',
      'beginner',
      'basico',
      'basic',
      'intermedio',
      'intermediate',
      'avanzado',
      'advanced',
      'open level',
      'experiencia',
      'experience',
      'nunca he bailado',
      'never danced',
      'niveau',
      'debutant',
    ],
    tokenEstimate: 180,
    content: `NIVELES

Principiante (Iniciacion): Para quienes NUNCA han bailado. Pasos basicos, ritmo fundamental, postura correcta (aprox. 0-2 meses de experiencia).
Basico (I, II, III): Consolida fundamentos, introduce figuras, mejora fluidez y tecnica de guia/seguimiento (aprox. 2-12 meses).
Intermedio: Figuras complejas, variaciones musicales, improvisacion y desarrollo de estilo propio (aprox. 12-24 meses).
Avanzado: Dominio tecnico completo, coreografias de alta complejidad, musicalidad avanzada, preparacion para performances (+24 meses).
Open Level (Nivel Abierto): Clases multinivel donde cada alumno trabaja a su propio ritmo con adaptaciones del profesor.

IMPORTANTE para recomendar nivel:
"Nunca he bailado" / "No tengo experiencia" -> Principiantes (Iniciacion). NUNCA recomiendes Basico.
"Llevo poco tiempo" / "He ido a algunas clases" -> Basico I
"Llevo 6 meses bailando" -> Basico I o II (NO intermedio)
"Llevo 1-2 anos" -> Intermedio
"Llevo mas de 2 anos" -> Avanzado

Salsa Cubana (niveles especificos): Principiantes (desde cero), Basico I (3-5 meses), Basico II (6-9), Basico III (9-12), Intermedio I (12-15), Intermedio II (15-18), Avanzado (18+ meses).`,
  },

  {
    id: 'trial-classes',
    section: 'prueba',
    keywords: [
      'prueba',
      'probar',
      'trial',
      'gratis',
      'free',
      'primera clase',
      'first class',
      'turista',
      'tourist',
      'residentes',
      '24 horas',
      'essai',
      'gratuit',
    ],
    tokenEstimate: 180,
    content: `CLASES DE PRUEBA

Condiciones:
- UNA clase de prueba gratuita por persona (no una por estilo)
- Solo para residentes de Barcelona o cercanias
- Turistas/visitantes: deben comprar clase suelta (compartir class_url)
- Minimo 24h de antelacion para reservar gratis (campo is_within_24h en search_upcoming_classes)
- Si is_within_24h = true: informar al usuario y ofrecer la siguiente clase del mismo estilo gratis (booking_url) o ir a esta de pago (class_url)
- Reservar desde el booking_url que devuelve search_upcoming_classes
- Si se apunta el dia de la prueba, promocion especial matricula gratis
- Para cancelar/reprogramar: enlaces del email de confirmacion

CLASES SUELTAS (sin inscripcion):
1. Entrar en www.farrayscenter.com/hazte-socio
2. Buscar la clase y pulsar para ir a Momence
3. Bajar al final de la pagina para pagar solo esa clase`,
  },

  {
    id: 'policies',
    section: 'politicas',
    keywords: [
      'cancelar',
      'cancel',
      'baja',
      'pause',
      'pausa',
      'reserva',
      'booking',
      'politica',
      'policy',
      'momence',
      'app',
      'recuperar',
      'creditos',
      'credits',
      'pago',
      'payment',
    ],
    tokenEstimate: 200,
    content: `POLITICAS Y FUNCIONAMIENTO

Reservas: Obligatorio por app Momence o web. NO por WhatsApp/telefono/email. Check-in obligatorio. Web: www.farrayscenter.com/es/horarios-clases-baile-barcelona. App: buscar "Momence" en Apple Store o Google Play.

Cancelaciones: Minimo 2 HORAS de antelacion. Si cancelas tarde = clase asistida. Creditos NO se acumulan. Recuperacion: 30 DIAS. Solo con membresia/abono activo.

Bajas: Avisar 15 DIAS antes a info@farrayscenter.com. Si no, se cobra siguiente recibo.

Pausas: Coste mantenimiento 15euro/mes. Avisar 15 DIAS antes.

Bonos: Validez 6 meses desde primera reserva. Flexibles (puedes cambiar de cursos). Se activan con primera reserva.

Membresia mensual: Mismas clases siempre (mismo dia/hora). Solo cambiar para recuperar faltadas.

Pagos (sept 2025): Cuotas mensuales por adeudo directo. Bonos/trimestres/semestres en efectivo.`,
  },

  {
    id: 'faqs',
    section: 'faqs',
    keywords: [
      'pregunta',
      'faq',
      'nunca bailado',
      'never danced',
      'presencial',
      'in-person',
      'curso',
      'course',
      'temporada',
      'season',
      'servicios',
      'services',
      'alquiler',
      'rental',
      'bodas',
      'wedding',
      'team building',
      'app',
      'momence',
    ],
    tokenEstimate: 150,
    content: `PREGUNTAS FRECUENTES

Nunca he bailado: Mas del 30% de clases son de nivel Principiante (Iniciacion), pensadas para gente sin experiencia.

Modalidad: Cursos presenciales L-V, mananas y tardes, 25+ estilos, 100+ horas/semana, clases de 1h (algunas 1,5h).

Curso 2025-2026: 1 septiembre 2025 - 28 julio 2026.

App Momence: iPhone apps.apple.com/us/app/momence/id1577856009, Android play.google.com/store/apps/details?id=com.ribbon.mobileApp, Web momence.com/sign-in?hostId=36148

Alta (hacerse socio): www.farrayscenter.com/es/hazte-socio

Servicios adicionales (alquiler salas, eventos, bodas, team building): contactar en www.farrayscenter.com/es/contacto`,
  },

  {
    id: 'urls-links',
    section: 'enlaces',
    keywords: [
      'url',
      'enlace',
      'link',
      'web',
      'pagina',
      'page',
      'app',
      'momence',
      'aplicacion',
      'download',
      'descargar',
    ],
    tokenEstimate: 250,
    content: `ENLACES Y URLS

IMPORTANTE: Para reservar clases, SIEMPRE usa los enlaces devueltos por las herramientas (booking_url, class_url, purchase_url). NUNCA construyas URLs de Momence manualmente.

ENLACES DINAMICOS DE HERRAMIENTAS (prioridad):
- search_upcoming_classes devuelve: booking_url (prueba gratis) y class_url (pago) para CADA clase
- get_membership_options devuelve: purchase_url para cada membresia/bono
- Estos son enlaces directos a Momence que abren la accion correspondiente

PAGINAS INFORMATIVAS DE LA WEB (usar solo como referencia o fallback):
Precios: www.farrayscenter.com/es/precios-clases-baile-barcelona
Horarios y reservas: www.farrayscenter.com/es/horarios-clases-baile-barcelona
Calendario: www.farrayscenter.com/es/calendario
Hazte socio (alta): www.farrayscenter.com/es/hazte-socio
Contacto: www.farrayscenter.com/es/contacto
Profesores: www.farrayscenter.com/es/profesores-baile-barcelona
Clase de prueba (widget reserva): www.farrayscenter.com/es/reservas
Alquiler salas: www.farrayscenter.com/es/alquiler-salas-baile-barcelona
Team building: www.farrayscenter.com/es/team-building-barcelona
Tarjetas regalo: www.farrayscenter.com/es/regala-baile
FAQs: www.farrayscenter.com/es/preguntas-frecuentes
Como llegar: www.farrayscenter.com/es/como-llegar-escuela-baile-barcelona

App Momence: iPhone apps.apple.com/us/app/momence/id1577856009, Android play.google.com/store/apps/details?id=com.ribbon.mobileApp`,
  },
];
