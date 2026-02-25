/**
 * ArticleContent Component
 *
 * Renders article content sections with markdown parsing.
 * Supports headings, paragraphs, lists, images, quotes, definitions, and statistics.
 */

import React from 'react';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';
import type { ArticleSection } from '../../constants/blog/types';
import AnimateOnScroll from '../AnimateOnScroll';
import LazyImage from '../LazyImage';
import YouTubeEmbed from '../YouTubeEmbed';
import StatisticHighlight from './StatisticHighlight';
import DefinitionBox from './DefinitionBox';

interface ArticleContentProps {
  /** Content sections to render */
  sections: ArticleSection[];
  /** Additional CSS classes */
  className?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ sections, className = '' }) => {
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

  /**
   * Parse markdown-like content to HTML
   * Supports: **bold**, *italic*, [links](url), lists
   */
  const parseMarkdown = (text: string): string => {
    let parsed = text;

    // Bold: **text**
    parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    parsed = parsed.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links: [text](url)
    parsed = parsed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary-accent hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Line breaks
    parsed = parsed.replace(/\n\n/g, '</p><p class="mt-4">');
    parsed = parsed.replace(/\n/g, '<br />');

    return DOMPurify.sanitize(parsed);
  };

  /**
   * Render a single section based on its type
   */
  const renderSection = (section: ArticleSection, index: number) => {
    const delay = index * 50;

    switch (section.type) {
      case 'heading': {
        const HeadingTag = section.level === 2 ? 'h2' : 'h3';
        const headingStyles =
          section.level === 2
            ? 'text-3xl md:text-4xl font-black text-neutral mt-12 mb-6'
            : 'text-2xl md:text-3xl font-bold text-neutral mt-8 mb-4';

        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <HeadingTag id={section.id} className={headingStyles}>
              {t(section.contentKey)}
            </HeadingTag>
          </AnimateOnScroll>
        );
      }

      case 'paragraph':
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div
              id={section.id}
              className="text-lg text-neutral/90 leading-relaxed mb-6"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(t(section.contentKey)) }}
            />
          </AnimateOnScroll>
        );

      case 'list':
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <ul id={section.id} className="space-y-3 mb-6 ml-4">
              {section.listItems?.map((itemKey, idx) => (
                <li key={idx} className="flex items-start gap-3 text-lg text-neutral/90">
                  <span className="flex-shrink-0 w-2 h-2 mt-2.5 bg-primary-accent rounded-full" />
                  <span dangerouslySetInnerHTML={{ __html: parseMarkdown(t(itemKey)) }} />
                </li>
              ))}
            </ul>
          </AnimateOnScroll>
        );

      case 'image':
        if (!section.image) return null;
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <figure id={section.id} className="my-8">
              <LazyImage
                src={section.image.src}
                srcSet={section.image.srcSet}
                alt={section.image.alt}
                width={section.image.width}
                height={section.image.height}
                className="w-full rounded-xl"
              />
              {section.image.caption && (
                <figcaption className="mt-3 text-center text-sm text-neutral/60 italic">
                  {t(section.image.caption)}
                </figcaption>
              )}
            </figure>
          </AnimateOnScroll>
        );

      case 'video':
        if (!section.videoId) return null;
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div id={section.id} className="my-8">
              <YouTubeEmbed
                videoId={section.videoId}
                title={section.videoTitleKey ? t(section.videoTitleKey) : 'Video'}
              />
            </div>
          </AnimateOnScroll>
        );

      case 'quote':
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <blockquote id={section.id} className="my-8 pl-6 border-l-4 border-primary-accent">
              <p className="text-xl md:text-2xl text-neutral/90 italic leading-relaxed">
                &ldquo;{t(section.contentKey)}&rdquo;
              </p>
              {section.quoteAuthor && (
                <cite className="block mt-4 text-primary-accent font-medium not-italic">
                  — {section.quoteAuthor}
                </cite>
              )}
            </blockquote>
          </AnimateOnScroll>
        );

      case 'definition':
        return (
          <DefinitionBox
            key={section.id}
            term={section.definitionTermKey ? t(section.definitionTermKey) : ''}
            definition={t(section.contentKey)}
            delay={delay}
          />
        );

      case 'statistic':
        return (
          <StatisticHighlight
            key={section.id}
            value={section.statisticValue || ''}
            label={t(section.contentKey)}
            source={section.statisticSource}
            delay={delay}
          />
        );

      case 'callout': {
        const calloutStyles: Record<string, string> = {
          info: 'bg-blue-500/10 border-blue-500',
          tip: 'bg-emerald-500/10 border-emerald-500',
          warning: 'bg-amber-500/10 border-amber-500',
          cta: 'bg-primary-accent/10 border-primary-accent',
        };
        const calloutType = section.calloutType || 'info';

        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div
              id={section.id}
              className={`my-8 p-6 rounded-xl border-l-4 ${calloutStyles[calloutType]}`}
            >
              <div
                className="text-lg text-neutral/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(t(section.contentKey)) }}
              />
            </div>
          </AnimateOnScroll>
        );
      }

      case 'comparison-table': {
        if (!section.tableConfig) return null;
        const { headers, rows, highlightColumn } = section.tableConfig;

        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div id={section.id} className="my-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {headers.map((headerKey, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-left font-bold border-b border-primary-dark/50
                                   ${highlightColumn === idx ? 'text-primary-accent bg-primary-accent/10' : 'text-neutral'}`}
                      >
                        {t(headerKey)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-primary-dark/30">
                      {row.map((cellKey, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-4 py-3
                                     ${highlightColumn === cellIdx ? 'text-primary-accent bg-primary-accent/5' : 'text-neutral/80'}`}
                        >
                          {t(cellKey)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        );
      }

      case 'numbered-list':
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <ol id={section.id} className="space-y-4 mb-6 ml-4 counter-reset-list">
              {section.listItems?.map((itemKey, idx) => (
                <li key={idx} className="flex items-start gap-4 text-lg text-neutral/90">
                  <span
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                               bg-primary-accent/20 text-primary-accent rounded-full
                               font-bold text-sm"
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="flex-1 pt-1"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(t(itemKey)) }}
                  />
                </li>
              ))}
            </ol>
          </AnimateOnScroll>
        );

      case 'answer-capsule': {
        if (!section.answerCapsule) return null;
        const {
          questionKey,
          answerKey,
          sourcePublisher,
          sourcePublisherKey,
          sourceYear,
          sourceUrl,
          confidence,
          icon,
        } = section.answerCapsule;
        // Use translated key if available, otherwise fall back to static string
        const displayPublisher = sourcePublisherKey ? t(sourcePublisherKey) : sourcePublisher;

        const iconMap: Record<string, React.ReactNode> = {
          info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          check: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          star: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ),
          lightbulb: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          ),
        };

        const confidenceBadge = {
          high: { label: 'Alta fiabilidad', color: 'bg-emerald-500/20 text-emerald-400' },
          medium: { label: 'Fiabilidad media', color: 'bg-amber-500/20 text-amber-400' },
          verified: { label: 'Verificado', color: 'bg-blue-500/20 text-blue-400' },
        };

        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div
              id={section.id}
              className="my-8 relative overflow-hidden rounded-2xl
                         bg-gradient-to-br from-primary-dark/60 to-black/80
                         border border-primary-accent/30"
              data-answer-capsule="true"
            >
              {/* Header with question */}
              <div className="px-6 py-4 bg-primary-accent/10 border-b border-primary-accent/20">
                <div className="flex items-center gap-3">
                  <span className="text-primary-accent">{iconMap[icon || 'info']}</span>
                  <h4 className="font-bold text-neutral text-lg">{t(questionKey)}</h4>
                </div>
              </div>

              {/* Answer body */}
              <div className="p-6">
                <p
                  className="text-xl text-neutral/90 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(t(answerKey)) }}
                />

                {/* Source citation */}
                {displayPublisher && (
                  <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-neutral/60">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      {sourceUrl ? (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-accent transition-colors"
                        >
                          {displayPublisher}
                          {sourceYear && ` (${sourceYear})`}
                        </a>
                      ) : (
                        <span>
                          {displayPublisher}
                          {sourceYear && ` (${sourceYear})`}
                        </span>
                      )}
                    </div>
                    {confidence && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${confidenceBadge[confidence].color}`}
                      >
                        {confidenceBadge[confidence].label}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AnimateOnScroll>
        );
      }

      case 'testimonial': {
        if (!section.testimonial) return null;
        const { authorName, authorLocation, textKey, rating, avatar } = section.testimonial;

        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div
              id={section.id}
              className="my-8 p-6 rounded-2xl bg-gradient-to-br from-primary-dark/40 to-black/60
                         border border-primary-accent/20"
              itemScope
              itemType="https://schema.org/Review"
            >
              {/* itemReviewed (required by Google for Review snippets) */}
              <div
                itemProp="itemReviewed"
                itemScope
                itemType="https://schema.org/LocalBusiness"
                className="hidden"
              >
                <meta itemProp="name" content="Farray's International Dance Center" />
              </div>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={authorName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary-accent/30"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-accent/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-accent">
                        {authorName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Stars */}
                  <div
                    className="flex items-center gap-1 mb-2"
                    itemProp="reviewRating"
                    itemScope
                    itemType="https://schema.org/Rating"
                  >
                    <meta itemProp="ratingValue" content={String(rating)} />
                    <meta itemProp="bestRating" content="5" />
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-neutral/30'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p
                    className="text-lg text-neutral/90 italic leading-relaxed mb-3"
                    itemProp="reviewBody"
                    dangerouslySetInnerHTML={{ __html: `"${parseMarkdown(t(textKey))}"` }}
                  />

                  {/* Author */}
                  <div
                    className="flex items-center gap-2 text-sm"
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <span className="font-medium text-neutral" itemProp="name">
                      {authorName}
                    </span>
                    {authorLocation && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-neutral/40" />
                        <span className="text-neutral/60">{authorLocation}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        );
      }

      case 'references':
        if (!section.references || section.references.length === 0) return null;
        return (
          <AnimateOnScroll key={section.id} delay={delay}>
            <div id={section.id} className="my-12">
              {section.contentKey && (
                <p className="text-neutral/70 mb-8 text-base text-center max-w-2xl mx-auto">
                  {t(section.contentKey)}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.references.map(ref => (
                  <a
                    key={ref.id}
                    href={ref.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-gradient-to-br from-primary-dark/40 to-black/60
                               border border-primary-accent/20 rounded-2xl overflow-hidden
                               hover:border-primary-accent/50 hover:shadow-lg hover:shadow-primary-accent/10
                               transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div className="relative h-40 bg-gradient-to-br from-primary-dark/60 to-black/80 overflow-hidden">
                      {ref.image ? (
                        <img
                          src={ref.image}
                          alt={ref.publisher || ''}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100
                                     group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div
                            className="text-5xl font-black text-primary-accent/30 group-hover:text-primary-accent/50
                                          transition-colors duration-300"
                          >
                            {ref.publisher?.charAt(0) || '?'}
                          </div>
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {/* External link icon */}
                      <div
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50
                                      flex items-center justify-center opacity-0 group-hover:opacity-100
                                      transition-opacity duration-300"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h4
                        className="font-bold text-neutral group-hover:text-primary-accent
                                     transition-colors duration-300 mb-2 line-clamp-2"
                      >
                        {t(ref.titleKey)}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-neutral/60">
                        <span className="font-medium">{ref.publisher}</span>
                        {ref.year && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-neutral/40" />
                            <span>{ref.year}</span>
                          </>
                        )}
                      </div>
                      {ref.descriptionKey && (
                        <p className="mt-3 text-sm text-neutral/70 line-clamp-2">
                          {t(ref.descriptionKey)}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`prose-content ${className}`}>
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default ArticleContent;
