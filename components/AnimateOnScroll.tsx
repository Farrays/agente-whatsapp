import { useEffect, useState, type ReactNode, type ElementType } from 'react';
import {
  useSharedIntersectionObserver,
  OBSERVER_CONFIGS,
} from '../hooks/useSharedIntersectionObserver';

/**
 * Props for the AnimateOnScroll component.
 */
interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number; // in ms
  style?: React.CSSProperties;
  as?: ElementType;
}

/**
 * Animates elements when they enter the viewport using a fade-up effect.
 * Uses a singleton IntersectionObserver for optimal performance.
 * Respects user's reduced motion preferences.
 *
 * @param children - Elements to animate
 * @param className - Additional CSS classes
 * @param delay - Delay in ms before starting animation (default: 0)
 * @param style - Inline styles to apply
 * @param as - HTML element type to render (default: 'div')
 *
 * @example
 * ```tsx
 * <AnimateOnScroll delay={200}>
 *   <Card>Content appears with fade-up animation</Card>
 * </AnimateOnScroll>
 *
 * <AnimateOnScroll as="section" className="my-section">
 *   <h2>Section Title</h2>
 * </AnimateOnScroll>
 * ```
 */
const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  className = '',
  delay = 0,
  style,
  as: Component = 'div',
}) => {
  const [ref, isVisible] = useSharedIntersectionObserver<HTMLElement>(OBSERVER_CONFIGS.animation);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent): void => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // If reduced motion, render without animation classes
  if (prefersReducedMotion) {
    return (
      <Component ref={ref as React.RefObject<never>} className={className} style={style}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={ref as React.RefObject<never>}
      className={`transition-all duration-700 ease-out ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
};

export default AnimateOnScroll;
