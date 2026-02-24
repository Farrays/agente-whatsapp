import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHLSVideo } from '../hooks/useHLSVideo';
import { HERO_VIDEO_CONFIG } from '../constants/hero-video-config';
import LeadCaptureModal from './shared/LeadCaptureModal';

const Hero: React.FC = () => {
  const { t } = useTranslation([
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
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const { videoRef, containerRef, isVideoPlaying, shouldShowVideo } = useHLSVideo({
    hlsUrl: HERO_VIDEO_CONFIG.hlsUrl,
    mp4Url: HERO_VIDEO_CONFIG.mp4Url,
    loadDelay: 2500, // Defer video load after LCP for better PageSpeed
    respectReducedMotion: true,
    respectDataSaver: true,
  });

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-32 sm:pt-36 md:pt-40 lg:pt-32 xl:pt-36 pb-8"
      aria-label="Hero section"
    >
      {/* Background with Video */}
      <div ref={containerRef} className="absolute inset-0 bg-black" aria-hidden="true">
        {/* Poster Image - Always rendered for LCP */}
        <img
          src={HERO_VIDEO_CONFIG.posterUrl}
          alt={t('heroPosterAlt')}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isVideoPlaying ? 'opacity-0' : 'opacity-100'
          }`}
          fetchPriority="high"
          decoding="sync"
          loading="eager"
        />

        {/* Video - HLS streaming with lazy loading */}
        {shouldShowVideo && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        )}

        {/* Overlays for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/30 via-black/20 to-black/40" />
      </div>

      <div className="relative z-10 text-center text-neutral px-4 sm:px-6">
        <h1
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-8 sm:mb-10 md:mb-12 text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
        >
          {t('heroTitle1')}
        </h1>
        <p
          className="text-xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-10 text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)' }}
        >
          {t('heroTitle2')}
        </p>
        <p className="text-xl md:text-2xl font-semibold text-neutral/90 mb-8 md:mb-10 italic">
          {t('heroSubtitle')}
        </p>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-neutral/90 mb-12 md:mb-16">
          {t('heroValue')}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-accent text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent-glow animate-glow focus:outline-none focus:ring-4 focus:ring-primary-accent/50"
          >
            <span>{t('puertasAbiertasCTA')}</span>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
          <p className="text-sm text-neutral/80 mt-3 text-center max-w-md">
            {t('puertasAbiertasSubtext')}
          </p>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </section>
  );
};

export default Hero;
