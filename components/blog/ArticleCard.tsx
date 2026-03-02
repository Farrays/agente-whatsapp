/**
 * ArticleCard Component
 *
 * Card component for displaying article previews in blog list pages.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryMeta } from '../../constants/blog/categories';
import type { ArticleCardData } from '../../constants/blog/types';
import LazyImage from '../LazyImage';
import { ClockIcon, CalendarDaysIcon } from '../../lib/icons';
import AnimateOnScroll from '../AnimateOnScroll';

interface ArticleCardProps {
  /** Article data for the card */
  article: ArticleCardData;
  /** Animation delay in ms */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, delay = 0, className = '' }) => {
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
  const categoryMeta = getCategoryMeta(article.category);
  const articleUrl = `/${locale}/blog/${article.category}/${article.slug}`;

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AnimateOnScroll delay={delay} className="[perspective:1000px]">
      <Link
        to={articleUrl}
        className={`group block h-full bg-black/50 backdrop-blur-md
                   border border-primary-dark/50 rounded-2xl overflow-hidden
                   transition-all duration-500 [transform-style:preserve-3d]
                   hover:[transform:translateY(-0.75rem)_scale(1.02)_rotateY(5deg)_rotateX(2deg)]
                   hover:border-primary-accent hover:shadow-accent-glow ${className}`}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <LazyImage
            src={article.image}
            alt={t(article.titleKey)}
            width={800}
            height={450}
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-110"
          />
          {/* Category badge */}
          <span
            className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase
                       tracking-wider rounded-full bg-gradient-to-r ${categoryMeta.gradient}
                       text-white shadow-lg`}
          >
            {t(categoryMeta.nameKey)}
          </span>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-neutral/60 mb-3">
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{formatDate(article.datePublished)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{article.readingTime} min</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-xl font-bold text-neutral mb-3 line-clamp-2
                       group-hover:text-primary-accent transition-colors duration-300"
          >
            {t(article.titleKey)}
          </h3>

          {/* Excerpt */}
          <p className="text-neutral/70 text-sm line-clamp-3 mb-4">{t(article.excerptKey)}</p>

          {/* Read more */}
          <div className="flex items-center text-primary-accent font-medium text-sm">
            <span>{t('blog_readMore')}</span>
            <svg
              className="w-4 h-4 ml-2 transition-transform duration-300
                         group-hover:translate-x-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </AnimateOnScroll>
  );
};

export default ArticleCard;
