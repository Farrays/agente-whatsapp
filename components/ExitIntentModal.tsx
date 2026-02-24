import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CountdownTimer from './shared/CountdownTimer';
import {
  trackLeadConversion,
  LEAD_VALUES,
  pushToDataLayer,
  getMetaCookies,
} from '../utils/analytics';

interface ExitIntentModalProps {
  /** Delay before enabling exit detection (ms) */
  delay?: number;
  /** LocalStorage key to track if already shown */
  cookieName?: string;
  /** Days before showing again */
  cookieExpiry?: number;
  /** Promotion end date for countdown */
  promoEndDate?: Date;
  /** Discount percentage to show */
  discountPercent?: number;
}

type ModalStatus = 'idle' | 'submitting' | 'success' | 'error';

// Window types for gtag and fbq are declared in types/web-vitals.d.ts

/**
 * Exit Intent Modal - Shows when user is about to leave the page
 *
 * Features:
 * - WCAG 2.1 AA Accessible (focus trap, ARIA, keyboard nav)
 * - i18n support (ES, EN, CA, FR)
 * - Countdown timer with promo end date
 * - GA4 + Meta Pixel tracking
 * - Motion preferences respected
 * - GDPR compliant (localStorage, not cookies)
 *
 * Triggers:
 * - Desktop: Mouse leaves viewport towards top
 * - Respects delay before enabling detection
 * - Shows once per cookieExpiry period
 */
const ExitIntentModal: React.FC<ExitIntentModalProps> = ({
  delay = 5000,
  cookieName = 'exit_intent_shown',
  cookieExpiry = 7,
  promoEndDate = new Date('2025-01-31T23:59:59'),
  discountPercent = 50,
}) => {
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
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Check if already shown within expiry period
  const hasBeenShown = useCallback(() => {
    // SSR guard - localStorage not available during pre-rendering
    if (typeof window === 'undefined') return false;
    try {
      const shown = localStorage.getItem(cookieName);
      if (!shown) return false;
      const shownDate = new Date(shown);
      const now = new Date();
      const daysDiff = (now.getTime() - shownDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < cookieExpiry;
    } catch {
      return false;
    }
  }, [cookieName, cookieExpiry]);

  // Mark as shown
  const markAsShown = useCallback(() => {
    // SSR guard - localStorage not available during pre-rendering
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(cookieName, new Date().toISOString());
    } catch {
      // localStorage not available
    }
  }, [cookieName]);

  // Track analytics event (for non-conversion events like shown/dismissed)
  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    // Push to dataLayer for GTM
    pushToDataLayer({
      event: eventName,
      ...params,
    });

    // GA4 tracking directly
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  }, []);

  // Open modal handler
  const openModal = useCallback(() => {
    if (isOpen) return;

    // Store current focus to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    setIsOpen(true);
    markAsShown();

    // Track shown event
    trackEvent('exit_intent_shown', {
      event_category: 'Engagement',
      page_path: window.location.pathname,
      discount_percent: discountPercent,
    });
  }, [isOpen, markAsShown, trackEvent, discountPercent]);

  // Close modal handler
  const closeModal = useCallback(
    (converted = false) => {
      setIsOpen(false);

      // Track dismissed event (only if not converted)
      if (!converted && status !== 'success') {
        trackEvent('exit_intent_dismissed', {
          event_category: 'Engagement',
          page_path: window.location.pathname,
          discount_percent: discountPercent,
        });
      }

      // Restore focus to previous element
      setTimeout(() => {
        previousActiveElement.current?.focus();
      }, 100);
    },
    [status, trackEvent, discountPercent]
  );

  // Handle mouse leave (desktop exit intent)
  useEffect(() => {
    if (!isEnabled || hasBeenShown() || isOpen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if leaving from top of viewport
      if (e.clientY <= 0) {
        openModal();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isEnabled, isOpen, hasBeenShown, openModal]);

  // Enable after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEnabled(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'submitting') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, status, closeModal]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement | undefined;
      const lastElement = focusableElements[focusableElements.length - 1] as
        | HTMLElement
        | undefined;

      if (!firstElement || !lastElement) return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus email input when modal opens
  useEffect(() => {
    if (isOpen && status === 'idle') {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, status]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const { fbc, fbp } = getMetaCookies();
      const response = await fetch('/api/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          page: window.location.pathname,
          promo: `${discountPercent}_matricula`,
          locale,
          fbc,
          fbp,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');

        // Check if this is a new lead or existing (duplicate)
        const isNewLead = data.status === 'new';

        if (isNewLead) {
          // Track NEW lead conversion with full dataLayer + GA4 + Meta Pixel
          trackLeadConversion({
            leadSource: 'exit_intent',
            formName: `Exit Intent - ${discountPercent}% Descuento Matricula`,
            leadValue: LEAD_VALUES.EXIT_INTENT,
            discountCode: `${discountPercent}_matricula`,
            pagePath: window.location.pathname,
            eventId: data.eventId,
          });

          // Push specific exit_intent_converted event for GTM triggers
          // _meta_pixel_handled prevents GTM from firing a duplicate Lead pixel without eventID
          pushToDataLayer({
            event: 'exit_intent_converted',
            event_category: 'Lead',
            event_label: `Exit Intent - ${discountPercent}% Discount`,
            lead_value: LEAD_VALUES.EXIT_INTENT,
            lead_status: 'new',
            currency: 'EUR',
            discount_percent: discountPercent,
            page_path: window.location.pathname,
            event_id: data.eventId,
            _meta_pixel_handled: true,
          });
        } else {
          // Track EXISTING lead (duplicate) - no value, just for analytics
          pushToDataLayer({
            event: 'exit_intent_duplicate',
            event_category: 'Lead',
            event_label: `Exit Intent - Returning Visitor`,
            lead_status: 'existing',
            discount_percent: discountPercent,
            page_path: window.location.pathname,
          });
        }
      } else {
        throw new Error('API error');
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        t('exitIntent_error') || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
      );
    }
  };

  // Email validation
  const isValidEmail = (emailValue: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      aria-describedby="exit-intent-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        onClick={() => status !== 'submitting' && closeModal()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-gradient-to-br from-primary-dark to-black border border-primary-accent/30 rounded-2xl shadow-2xl shadow-primary-accent/20 p-4 md:p-6 animate-fade-in motion-reduce:animate-none max-h-[95vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={() => closeModal()}
          disabled={status === 'submitting'}
          className="absolute top-4 right-4 text-neutral/60 hover:text-neutral transition-colors motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('exitIntent_close') || 'Cerrar'}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {status !== 'success' ? (
          <>
            {/* Header with badge */}
            <div className="text-center mb-4 md:mb-6">
              {/* Exclusive offer badge */}
              <span className="inline-block px-3 py-1 mb-3 md:mb-4 text-xs font-bold tracking-wider uppercase bg-primary-accent text-white rounded-full">
                {t('exitIntent_badge') || 'OFERTA EXCLUSIVA'}
              </span>

              {/* Gift icon */}
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-primary-accent/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-primary-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2
                id="exit-intent-title"
                className="text-xl md:text-2xl font-black text-neutral mb-2"
              >
                {t('exitIntent_title') || `${discountPercent}% de descuento en tu matrícula`}
              </h2>

              {/* Subtitle */}
              <p id="exit-intent-description" className="text-neutral/80">
                {t('exitIntent_subtitle') || 'Solo para nuevos alumnos'}
              </p>
            </div>

            {/* Countdown */}
            <div className="flex flex-col items-center mb-4 md:mb-6 p-2 md:p-3 bg-black/50 rounded-xl border border-primary-accent/20">
              <span className="text-xs text-neutral/60 uppercase tracking-wider mb-2">
                {t('exitIntent_countdown_label') || 'Termina en:'}
              </span>
              <CountdownTimer targetDate={promoEndDate} compact className="justify-center" />
            </div>

            {/* Benefits */}
            <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6" role="list">
              {[
                t('exitIntent_benefit1') || 'Primera clase de prueba GRATIS',
                t('exitIntent_benefit2') || 'Válido para cualquier estilo de baile',
                t('exitIntent_benefit3') || 'Reserva tu plaza antes de que se agoten',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-neutral/90">
                  <svg
                    className="w-5 h-5 text-primary-accent flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4" noValidate>
              <div>
                <label htmlFor="exit-intent-email" className="sr-only">
                  {t('exitIntent_email_label') || 'Tu email'}
                </label>
                <input
                  ref={emailInputRef}
                  id="exit-intent-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('exitIntent_email_placeholder') || 'tu@email.com'}
                  required
                  disabled={status === 'submitting'}
                  aria-invalid={status === 'error' ? 'true' : 'false'}
                  aria-describedby={status === 'error' ? 'exit-intent-error' : undefined}
                  className="w-full px-4 py-3 bg-black/50 border border-primary-accent/30 rounded-xl text-neutral placeholder:text-neutral/70 focus:outline-none focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/30 transition-all motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error message */}
              {status === 'error' && errorMessage && (
                <p
                  id="exit-intent-error"
                  className="text-red-400 text-sm"
                  role="alert"
                  aria-live="polite"
                >
                  {errorMessage}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'submitting' || !isValidEmail(email)}
                aria-busy={status === 'submitting'}
                className="w-full py-3 md:py-4 bg-primary-accent text-white font-bold text-base md:text-lg rounded-xl hover:bg-primary-accent/90 transition-all motion-reduce:transition-none transform hover:scale-[1.02] motion-reduce:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-primary-accent/30"
              >
                {status === 'submitting'
                  ? t('exitIntent_sending') || 'Reservando...'
                  : t('exitIntent_cta') || 'QUIERO MI DESCUENTO'}
              </button>
            </form>

            {/* Privacy text */}
            <p className="text-center text-xs text-neutral/70 mt-4">
              {t('exitIntent_privacy') ||
                'Sin spam. Solo te contactaremos para activar tu descuento.'}
            </p>
          </>
        ) : (
          /* Success state */
          <div
            className="min-h-[40vh] flex flex-col items-center justify-center text-center py-4 md:py-8"
            role="status"
            aria-live="polite"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral mb-2">
              {t('exitIntent_success_title') || '¡Descuento reservado!'}
            </h2>
            <p className="text-neutral/80 mb-4 md:mb-6 text-sm md:text-base">
              {t('exitIntent_success_message') ||
                `Te contactaremos pronto para activar tu ${discountPercent}% de descuento en la matrícula.`}
            </p>
            <button
              onClick={() => closeModal(true)}
              className="px-5 py-2.5 md:px-6 md:py-3 bg-primary-accent/20 text-primary-accent font-semibold rounded-xl hover:bg-primary-accent/30 transition-colors motion-reduce:transition-none"
            >
              {t('exitIntent_success_cta') || 'Continuar navegando'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitIntentModal;
