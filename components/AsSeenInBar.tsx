/**
 * AsSeenInBar - Visual logo bar showing media appearances and credentials
 * Placed after TrustBarHero for instant authority reinforcement
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

const LOGOS = [
  { src: '/images/cid-unesco-logo.webp', alt: 'CID UNESCO', label: 'CID UNESCO' },
  { src: '/images/Street-Dance-2.webp', alt: 'Street Dance 2', label: 'Street Dance 2' },
  {
    src: '/images/got-talent-espana-show-cuadrada.webp',
    alt: 'Got Talent España',
    label: 'Got Talent',
  },
  {
    src: '/images/the-dancer-espectaculo-baile-cuadrada.webp',
    alt: 'The Dancer',
    label: 'The Dancer',
  },
];

const AsSeenInBar: React.FC = () => {
  const { t } = useTranslation('home');

  return (
    <section className="bg-black/40 py-5 border-y border-primary-accent/10">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm uppercase tracking-widest text-neutral/50 mb-4">
          {t('asSeenIn_title')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto items-center">
          {LOGOS.map(logo => (
            <div
              key={logo.label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-neutral/90 font-bold text-xs text-center">{logo.label}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-lg text-neutral/90 mt-3">{t('asSeenIn_subtitle')}</p>
      </div>
    </section>
  );
};

export default AsSeenInBar;
