/**
 * RelatedArticles Component
 *
 * Displays a grid of related article cards at the end of blog posts.
 * Encourages further reading and improves internal linking for SEO.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryMeta } from '../../constants/blog/categories';
import type { RelatedArticle } from '../../constants/blog/types';
import AnimateOnScroll from '../AnimateOnScroll';
import LazyImage from '../LazyImage';

interface RelatedArticlesProps {
  /** Array of related articles to display */
  articles: RelatedArticle[];
  /** Additional CSS classes */
  className?: string;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles, className = '' }) => {
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

  if (!articles || articles.length === 0) return null;

  return (
    <section className={`mt-16 pt-12 border-t border-primary-dark/50 ${className}`}>
      <AnimateOnScroll>
        <h2 className="text-3xl md:text-4xl font-black text-neutral mb-8 text-center">
          {t('blog_relatedArticles')}
        </h2>
      </AnimateOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => {
          const categoryMeta = getCategoryMeta(article.category);
          const articleUrl = `/${locale}/blog/${article.category}/${article.slug}`;

          return (
            <AnimateOnScroll
              key={article.slug}
              delay={index * 100}
              className="[perspective:1000px]"
            >
              <Link
                to={articleUrl}
                className="group block h-full bg-black/50 backdrop-blur-md
                           border border-primary-dark/50 rounded-2xl overflow-hidden
                           transition-all duration-500 [transform-style:preserve-3d]
                           hover:[transform:translateY(-0.5rem)_scale(1.02)_rotateY(5deg)_rotateX(2deg)]
                           hover:border-primary-accent hover:shadow-accent-glow"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-neutral mb-3 line-clamp-2
                               group-hover:text-primary-accent transition-colors duration-300"
                  >
                    {t(article.titleKey)}
                  </h3>
                  <p className="text-neutral/70 text-sm line-clamp-3">{t(article.excerptKey)}</p>

                  {/* Read more arrow */}
                  <div className="mt-4 flex items-center text-primary-accent font-medium text-sm">
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
        })}
      </div>
    </section>
  );
};

export default RelatedArticles;
