import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { debounce } from '../utils/debounce';
import { MenuIcon, XMarkIcon as CloseIcon, ChevronDownIcon, UserIcon } from '../lib/icons';
import MobileNavigation from './header/MobileNavigation';
import LanguageSelector from './header/LanguageSelector';
import LeadCaptureModal from './shared/LeadCaptureModal';
import type { Locale } from '../types';
import { SUPPORTED_LOCALES } from '../types';

// Main dropdown keys + sub-dropdown keys for nested menus
export type DropdownKey =
  | 'lang'
  | 'classes'
  | 'services'
  | 'aboutUs'
  // Sub-dropdown keys for Classes menu
  | 'danza'
  | 'urban'
  | 'salsa'
  | 'prepfisica'
  | 'heels';

const DROPDOWN_CLASS_MAP: Record<DropdownKey, string> = {
  lang: '.language-dropdown',
  classes: '.classes-dropdown',
  services: '.services-dropdown',
  aboutUs: '.aboutus-dropdown',
  // Sub-dropdowns
  danza: '.danza-dropdown',
  urban: '.urban-dropdown',
  salsa: '.salsa-dropdown',
  prepfisica: '.prepfisica-dropdown',
  heels: '.heels-dropdown',
};

const Header: React.FC = () => {
  // Only load 'common' namespace - all header translations are in common.json
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language;
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<DropdownKey>>(new Set());
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const toggleDropdown = useCallback((key: DropdownKey) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        // Close all other dropdowns when opening a new one
        newSet.clear();
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const closeDropdown = useCallback((key: DropdownKey) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdowns(new Set());
  }, []);

  const isDropdownOpen = useCallback((key: DropdownKey) => openDropdowns.has(key), [openDropdowns]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const debouncedScroll = debounce(handleScroll, 100);

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (openDropdowns.size > 0) {
        // Check if click is inside any open dropdown
        let isInsideAnyDropdown = false;
        openDropdowns.forEach(key => {
          const dropdownClass = DROPDOWN_CLASS_MAP[key];
          if (target.closest(dropdownClass)) {
            isInsideAnyDropdown = true;
          }
        });

        if (!isInsideAnyDropdown) {
          setOpenDropdowns(new Set());
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdowns]);

  const getCurrentPath = (): string => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (
      pathParts.length > 0 &&
      pathParts[0] &&
      (SUPPORTED_LOCALES as readonly string[]).includes(pathParts[0])
    ) {
      pathParts.shift();
    }
    const path = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
    const query = location.search;
    const hash = location.hash;
    return path + query + hash;
  };

  const handleLanguageChange = (lang: Locale) => {
    const currentPath = getCurrentPath();
    const newPath = `/${lang}${currentPath === '/' ? '' : currentPath}`;
    navigate(newPath);
    closeDropdown('lang');
  };

  const languageNames: Record<Locale, string> = {
    es: 'Español',
    ca: 'Català',
    en: 'English',
    fr: 'Français',
  };

  const menuStructure = {
    home: { path: `/${locale}`, textKey: 'navHome' },
    classes: {
      path: `/${locale}/clases/baile-barcelona`,
      textKey: 'navClasses',
      submenu: [
        {
          path: `/${locale}/clases/danza-barcelona`,
          textKey: 'navDanza',
          submenu: [
            {
              path: `/${locale}/clases/afro-contemporaneo-barcelona`,
              textKey: 'navAfroContemporaneo',
            },
            { path: `/${locale}/clases/afro-jazz`, textKey: 'navAfroJazz' },
            { path: `/${locale}/clases/ballet-barcelona`, textKey: 'navBallet' },
            { path: `/${locale}/clases/contemporaneo-barcelona`, textKey: 'navContemporaneo' },
            { path: `/${locale}/clases/modern-jazz-barcelona`, textKey: 'navModernJazz' },
          ],
        },
        {
          path: `/${locale}/clases/danzas-urbanas-barcelona`,
          textKey: 'navDanzasUrbanas',
          submenu: [
            // Ordenado alfabéticamente - Heels tiene submenú con Femmology y Sexy Style
            { path: `/${locale}/clases/afrobeats-barcelona`, textKey: 'navAfrobeat' },
            { path: `/${locale}/clases/commercial-dance-barcelona`, textKey: 'navCommercialDance' },
            { path: `/${locale}/clases/dancehall-barcelona`, textKey: 'navDancehall' },
            {
              path: `/${locale}/clases/heels-barcelona`,
              textKey: 'navHeels',
              submenu: [
                {
                  path: `/${locale}/clases/femmology`,
                  textKey: 'navFemmology',
                },
                { path: `/${locale}/clases/sexy-style-barcelona`, textKey: 'navSexyStyle' },
              ],
            },
            { path: `/${locale}/clases/hip-hop-barcelona`, textKey: 'navHipHop' },
            {
              path: `/${locale}/clases/hip-hop-reggaeton-barcelona`,
              textKey: 'navHipHopReggaeton',
            },
            { path: `/${locale}/clases/reggaeton-cubano-barcelona`, textKey: 'navReggaetonCubano' },
            { path: `/${locale}/clases/sexy-reggaeton-barcelona`, textKey: 'navSexyReggaeton' },
            { path: `/${locale}/clases/twerk-barcelona`, textKey: 'navTwerk' },
          ],
        },
        {
          path: `/${locale}/clases/salsa-bachata-barcelona`,
          textKey: 'navSalsaBachata',
          submenu: [
            { path: `/${locale}/clases/salsa-cubana-barcelona`, textKey: 'navSalsaCubana' },
            { path: `/${locale}/clases/salsa-lady-style-barcelona`, textKey: 'navSalsaLadyStyle' },
            { path: `/${locale}/clases/bachata-barcelona`, textKey: 'navBachataSensual' },
            {
              path: `/${locale}/clases/bachata-lady-style-barcelona`,
              textKey: 'navBachataLadyStyle',
            },
            { path: `/${locale}/clases/timba-barcelona`, textKey: 'navTimba' },
            { path: `/${locale}/clases/folklore-cubano`, textKey: 'navFolkloreCubano' },
          ],
        },
        {
          path: `/${locale}/clases/entrenamiento-bailarines-barcelona`,
          textKey: 'navPrepFisica',
          submenu: [
            {
              path: `/${locale}/clases/acondicionamiento-fisico-bailarines`,
              textKey: 'navBodyConditioning',
            },
            { path: `/${locale}/clases/cuerpo-fit`, textKey: 'navCuerpoFit' },
            { path: `/${locale}/clases/ejercicios-gluteos-barcelona`, textKey: 'navBumBum' },
            { path: `/${locale}/clases/stretching-barcelona`, textKey: 'navStretching' },
          ],
        },
        { path: `/${locale}/clases/baile-mananas`, textKey: 'navBaileMananas' },
        { path: `/${locale}/horarios-clases-baile-barcelona`, textKey: 'navSchedule' },
        { path: `/${locale}/precios-clases-baile-barcelona`, textKey: 'navPricing' },
      ],
    },
    services: {
      path: `/${locale}/servicios-baile-barcelona`,
      textKey: 'navServices',
      submenu: [
        { path: `/${locale}/clases-particulares-baile`, textKey: 'navClasesParticulares' },
        { path: `/${locale}/alquiler-salas-baile-barcelona`, textKey: 'navAlquilerSalas' },
        { path: `/${locale}/estudio-grabacion-barcelona`, textKey: 'navEstudioGrabacion' },
        { path: `/${locale}/regala-baile`, textKey: 'navRegalaBaile' },
        { path: `/${locale}/team-building-barcelona`, textKey: 'navTeamBuilding' },
      ],
    },
    aboutUs: {
      path: `/${locale}/sobre-nosotros`,
      textKey: 'navAboutUs',
      submenu: [
        { path: `/${locale}/yunaisy-farray`, textKey: 'navYunaisy' },
        { path: `/${locale}/metodo-farray`, textKey: 'navMetodoFarray' },
        { path: `/${locale}/profesores-baile-barcelona`, textKey: 'navProfesores' },
        { path: `/${locale}/instalaciones-escuela-baile-barcelona`, textKey: 'navInstalaciones' },
        { path: `/${locale}/preguntas-frecuentes`, textKey: 'navFAQ' },
      ],
    },
    blog: { path: `/${locale}/blog`, textKey: 'navBlog' },
  };

  return (
    <>
      {/* Skip to Content Link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-primary-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        {t('skipToMainContent')}
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMenuOpen ? 'hidden' : ''
        } ${
          isScrolled
            ? 'bg-black/95 md:backdrop-blur-xl shadow-xl shadow-primary-accent/20'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-8 lg:py-4">
          {/* Top Row: Logo + Nav + CTA */}
          <div className="flex items-center justify-between lg:justify-between">
            {/* Mobile: Menu button on left */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? (
                  <CloseIcon className="w-6 h-6 text-white" />
                ) : (
                  <MenuIcon className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {/* Logo - Centered on mobile, left on desktop */}
            <Link
              to={`/${locale}`}
              aria-label="FIDC Home"
              className="flex-shrink-0 group absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0"
            >
              <picture>
                <source
                  type="image/webp"
                  srcSet="/images/logo/img/logo-fidc_256.webp 1x, /images/logo/img/logo-fidc_512.webp 2x"
                />
                <img
                  src="/images/logo/img/logo-fidc_256.png"
                  srcSet="/images/logo/img/logo-fidc_256.png 1x, /images/logo/img/logo-fidc_512.png 2x"
                  alt={t('logo_alt')}
                  width="256"
                  height="256"
                  fetchPriority="high"
                  className="w-40 h-40 sm:w-44 sm:h-44 md:w-44 md:h-44 lg:w-28 lg:h-28 xl:w-32 xl:h-32 transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(200,34,96,0.3)]"
                />
              </picture>
            </Link>

            {/* Desktop Navigation - Enterprise styling */}
            <nav
              className="hidden lg:flex items-center gap-1 2xl:gap-2"
              aria-label="Main navigation"
            >
              {/* Inicio */}
              <Link
                to={`/${locale}`}
                className={`relative px-2.5 xl:px-3 2xl:px-4 py-2 text-sm 2xl:text-base font-semibold tracking-wide transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent group ${
                  location.pathname === `/${locale}` || location.pathname === `/${locale}/`
                    ? 'text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('navHome')}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-accent transition-all duration-300 rounded-full ${
                    location.pathname === `/${locale}` || location.pathname === `/${locale}/`
                      ? 'w-6'
                      : 'group-hover:w-6'
                  }`}
                />
              </Link>

              {/* Quiénes Somos - Dropdown */}
              <div className="relative aboutus-dropdown group/about">
                <button
                  onClick={() => toggleDropdown('aboutUs')}
                  className={`relative flex items-center gap-1 px-2.5 xl:px-3 2xl:px-4 py-2 text-sm 2xl:text-base font-semibold tracking-wide transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent ${
                    location.pathname.includes('/sobre-nosotros') ||
                    location.pathname.includes('/yunaisy-farray') ||
                    location.pathname.includes('/profesores-baile')
                      ? 'text-white bg-white/5'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  aria-expanded={isDropdownOpen('aboutUs')}
                >
                  {t('navAboutUs')}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen('aboutUs') ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDropdownOpen('aboutUs') && (
                  <div className="absolute top-full left-0 mt-3 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 min-w-[260px] py-2 z-50 animate-fadeIn overflow-hidden">
                    <Link
                      to={`/${locale}/sobre-nosotros`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('headerAbout')}
                    </Link>
                    <Link
                      to={`/${locale}/yunaisy-farray`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navYunaisy')}
                    </Link>
                    <Link
                      to={`/${locale}/metodo-farray`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navMetodoFarray')}
                    </Link>
                    <Link
                      to={`/${locale}/profesores-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navProfesores')}
                    </Link>
                    <Link
                      to={`/${locale}/instalaciones-escuela-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navFacilities')}
                    </Link>
                    <Link
                      to={`/${locale}/preguntas-frecuentes`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navFAQ')}
                    </Link>
                    <Link
                      to={`/${locale}/como-llegar-escuela-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('sitemapUbicacion')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Clases de Baile - Dropdown simplificado */}
              <div className="relative classes-dropdown">
                <button
                  onClick={() => toggleDropdown('classes')}
                  className={`relative flex items-center gap-1 px-2.5 xl:px-3 2xl:px-4 py-2 text-sm 2xl:text-base font-semibold tracking-wide transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent ${
                    location.pathname.includes('/clases')
                      ? 'text-white bg-white/5'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  aria-expanded={isDropdownOpen('classes')}
                >
                  {t('navClasses')}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen('classes') ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDropdownOpen('classes') && (
                  <div className="absolute top-full left-0 mt-3 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 min-w-[280px] py-2 z-50 animate-fadeIn">
                    {/* Ver Todas las Clases - primera opción en rojo */}
                    <Link
                      to={`/${locale}/clases/baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-primary-accent hover:bg-primary-accent/20 transition-all duration-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-accent" />
                      {t('navAllClasses')}
                    </Link>
                    <div className="border-t border-white/10 my-2 mx-4"></div>

                    {/* Categorías - links simples a hubs */}
                    <Link
                      to={`/${locale}/clases/danza-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navDanza')}
                    </Link>
                    <Link
                      to={`/${locale}/clases/danzas-urbanas-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navDanzasUrbanas')}
                    </Link>
                    <Link
                      to={`/${locale}/clases/salsa-bachata-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navSalsaBachata')}
                    </Link>
                    <Link
                      to={`/${locale}/clases/entrenamiento-bailarines-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navPrepFisica')}
                    </Link>

                    <div className="border-t border-white/10 my-2 mx-4"></div>

                    {/* Otros enlaces */}
                    <Link
                      to={`/${locale}/clases/baile-mananas`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navBaileMananas')}
                    </Link>
                    <Link
                      to={`/${locale}/horarios-clases-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navSchedule')}
                    </Link>
                    <Link
                      to={`/${locale}/precios-clases-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navPricing')}
                    </Link>
                    <Link
                      to={`/${locale}/calendario`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navCalendar')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Servicios - Dropdown */}
              <div className="relative services-dropdown">
                <button
                  onClick={() => toggleDropdown('services')}
                  className={`relative flex items-center gap-1 px-2.5 xl:px-3 2xl:px-4 py-2 text-sm 2xl:text-base font-semibold tracking-wide transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent ${
                    location.pathname.includes('/servicios-baile-barcelona') ||
                    location.pathname.includes('/alquiler-salas') ||
                    location.pathname.includes('/estudio-grabacion') ||
                    location.pathname.includes('/regala-baile') ||
                    location.pathname.includes('/clases-particulares') ||
                    location.pathname.includes('/team-building')
                      ? 'text-white bg-white/5'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  aria-expanded={isDropdownOpen('services')}
                >
                  {t('navServices')}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen('services') ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDropdownOpen('services') && (
                  <div className="absolute top-full left-0 mt-3 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 min-w-[260px] py-2 z-50 animate-fadeIn overflow-hidden">
                    <Link
                      to={`/${locale}/servicios-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-primary-accent hover:bg-primary-accent/20 transition-all duration-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-accent" />
                      {t('navAllServices')}
                    </Link>
                    <div className="border-t border-white/10 my-2 mx-4"></div>
                    <Link
                      to={`/${locale}/clases-particulares-baile`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navClasesParticulares')}
                    </Link>
                    <Link
                      to={`/${locale}/alquiler-salas-baile-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('headerRoomRental')}
                    </Link>
                    <Link
                      to={`/${locale}/estudio-grabacion-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('headerRecordingStudio')}
                    </Link>
                    <Link
                      to={`/${locale}/regala-baile`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('headerGiftDance')}
                    </Link>
                    <Link
                      to={`/${locale}/team-building-barcelona`}
                      onClick={closeAllDropdowns}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-primary-accent/20 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-accent/60" />
                      {t('navTeamBuilding')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Blog */}
              <Link
                to={`/${locale}/blog`}
                className={`relative px-2.5 xl:px-3 2xl:px-4 py-2 text-sm 2xl:text-base font-semibold tracking-wide transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent group ${
                  location.pathname.includes('/blog')
                    ? 'text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('navBlog')}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-accent transition-all duration-300 rounded-full ${
                    location.pathname.includes('/blog') ? 'w-6' : 'group-hover:w-6'
                  }`}
                />
              </Link>

              {/* Contacto */}
              <Link
                to={`/${locale}/contacto`}
                className={`relative px-2.5 xl:px-3 2xl:px-4 py-2 text-sm 2xl:text-base font-semibold tracking-wide transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent group ${
                  location.pathname.includes('/contacto')
                    ? 'text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('headerContact')}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-accent transition-all duration-300 rounded-full ${
                    location.pathname.includes('/contacto') ? 'w-6' : 'group-hover:w-6'
                  }`}
                />
              </Link>
            </nav>

            {/* Member Area + Language Selector + CTA Button */}
            <div className="hidden lg:flex items-center gap-5">
              {/* Área de Socio - icono discreto */}
              <a
                href="https://momence.com/sign-in?hostId=36148"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                title={t('header_member_area')}
                aria-label={t('header_member_area')}
              >
                <UserIcon className="w-6 h-6" />
              </a>
              <LanguageSelector
                locale={locale as Locale}
                isOpen={isDropdownOpen('lang')}
                onToggle={() => toggleDropdown('lang')}
                handleLanguageChange={handleLanguageChange}
                languageNames={languageNames}
              />
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="relative bg-gradient-to-r from-primary-accent to-brand-500 text-white font-bold text-sm 2xl:text-base py-2.5 2xl:py-3 px-4 xl:px-5 2xl:px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white overflow-hidden group"
              >
                <span className="relative z-10">{t('enrollNow')}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-primary-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Mobile CTA Button - Right side */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="bg-primary-accent text-white font-bold text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-full transition-all duration-300 shadow-lg whitespace-nowrap"
              >
                {t('ctaShort')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuStructure={menuStructure}
        locale={locale as Locale}
        handleLanguageChange={handleLanguageChange}
        onOpenLeadModal={() => setIsLeadModalOpen(true)}
        languageNames={languageNames}
      />

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </>
  );
};

export default Header;
