'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import type { IconName } from '@/config/icons';

/* ============================================================================
 * 1. ScrollProgressBar
 * Top viewport scroll progress bar with Meta Astryx Ocean Aqua -> Cyan -> Leaf gradient
 * ============================================================================ */
export interface ScrollProgressBarProps {
  className?: string;
}

export function ScrollProgressBar({ className = '' }: ScrollProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    const updateProgress = () => {
      if (!barRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-coastal-mist/60 ${className}`}
    >
      <div
        ref={barRef}
        style={{ transform: 'scaleX(0)', transformOrigin: '0% 50%' }}
        className="h-full w-full bg-gradient-to-r from-coastal-kelp via-coastal-gold to-coastal-rust transition-transform duration-75 ease-out will-change-transform"
      />
    </div>
  );
}

/* ============================================================================
 * 2. ScrollRevealText
 * Staggered word / line reveal with blur & opacity transition on scroll
 * ============================================================================ */
export interface ScrollRevealTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
  mode?: 'words' | 'lines';
  staggerMs?: number;
  delayMs?: number;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
}

export function ScrollRevealText({
  text,
  as: Tag = 'div',
  mode = 'words',
  staggerMs = 42,
  delayMs = 0,
  className = '',
  highlightWords = [],
  highlightClassName = 'text-coastal-kelp',
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tokens =
    mode === 'lines' ? text.split('\n').filter(Boolean) : text.split(' ');
  const normalizedHighlights = highlightWords.map((w) =>
    w.toLowerCase().replace(/[.,!?;:]/g, '')
  );

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className}>
      {tokens.map((token, idx) => {
        const cleanToken = token.toLowerCase().replace(/[.,!?;:]/g, '');
        const isHighlighted = normalizedHighlights.includes(cleanToken);
        const totalDelay = delayMs + idx * staggerMs;

        return (
          <span
            key={`${token}-${idx}`}
            className={`inline-block transition-all duration-700 ease-out will-change-transform ${
              mode === 'lines' ? 'block' : 'mr-[0.28em]'
            } ${isHighlighted ? highlightClassName : ''}`}
            style={{
              transitionDelay: `${totalDelay}ms`,
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translate3d(0, 0px, 0) scale(1)'
                : 'translate3d(0, 22px, 0) scale(0.97)',
              filter: visible ? 'blur(0px)' : 'blur(6px)',
            }}
          >
            {token}
          </span>
        );
      })}
    </Tag>
  );
}

/* ============================================================================
 * 3. ScrollParallaxBox
 * 60fps Parallax container driven by scroll position + optional scale & 3D tilt
 * ============================================================================ */
export interface ScrollParallaxBoxProps {
  children: React.ReactNode;
  speed?: number;
  scaleOnScroll?: boolean;
  tiltOnHover?: boolean;
  className?: string;
}

export function ScrollParallaxBox({
  children,
  speed = 0.16,
  scaleOnScroll = false,
  tiltOnHover = false,
  className = '',
}: ScrollParallaxBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ rotateX: 0, rotateY: 0 });
  const scrollOffsetRef = useRef({ y: 0, scale: 1 });

  const applyTransform = () => {
    if (!innerRef.current) return;
    const { y, scale } = scrollOffsetRef.current;
    const { rotateX, rotateY } = tiltRef.current;
    if (tiltOnHover && (rotateX !== 0 || rotateY !== 0)) {
      innerRef.current.style.transform = `perspective(1000px) translate3d(0, ${y.toFixed(
        1
      )}px, 0) scale(${scale.toFixed(3)}) rotateX(${rotateX.toFixed(
        2
      )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    } else {
      innerRef.current.style.transform = `translate3d(0, ${y.toFixed(
        1
      )}px, 0) scale(${scale.toFixed(3)})`;
    }
  };

  useEffect(() => {
    let rafId = 0;

    const updatePosition = () => {
      if (!boxRef.current) return;
      const rect = boxRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.5;
      const elementCenter = rect.top + rect.height * 0.5;
      const deltaFromCenter = elementCenter - viewportCenter;

      const offsetY = Math.max(-90, Math.min(90, -deltaFromCenter * speed));
      let scaleVal = 1;
      if (scaleOnScroll) {
        const distanceRatio = Math.min(
          1,
          Math.abs(deltaFromCenter) / (window.innerHeight * 0.85)
        );
        scaleVal = 1 + (1 - distanceRatio) * 0.045;
      }

      scrollOffsetRef.current = { y: offsetY, scale: scaleVal };
      applyTransform();
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed, scaleOnScroll, tiltOnHover]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltOnHover || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current = {
      rotateX: -relY * 8,
      rotateY: relX * 8,
    };
    applyTransform();
  };

  const handleMouseLeave = () => {
    if (!tiltOnHover) return;
    tiltRef.current = { rotateX: 0, rotateY: 0 };
    applyTransform();
  };

  return (
    <div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      <div
        ref={innerRef}
        className="h-full w-full transition-transform duration-150 ease-out will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. ScrollStickyShowcase
 * Meta Astryx Sticky Bento Scrollytelling Showcase:
 * Ocean -> Fishing Nets -> Artisan Weaving -> Finished Mesh Bag & 3D Shells
 * ============================================================================ */
export interface StickyShowcaseStep {
  id: string;
  stepNumber: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  metricLabel: string;
  metricValue: string;
  icon: IconName;
  accentTone?: 'aqua' | 'leaf';
}

export interface ScrollStickyShowcaseProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  steps: StickyShowcaseStep[];
  className?: string;
}

export function ScrollStickyShowcase({
  eyebrow,
  heading,
  subheading,
  steps,
  className = '',
}: ScrollStickyShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((stepEl, idx) => {
      if (!stepEl) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(idx);
            }
          });
        },
        {
          rootMargin: '-28% 0px -38% 0px',
          threshold: 0.25,
        }
      );
      observer.observe(stepEl);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [steps.length]);

  const activeStep = steps[activeIndex] || steps[0];

  if (!activeStep) return null;

  return (
    <section className={`relative py-16 lg:py-24 ${className}`}>
      {(eyebrow || heading || subheading) && (
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-coastal-line bg-coastal-mist px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-coastal-kelp shadow-coastal">
              <AppIcon name="waves" className="h-3.5 w-3.5 text-coastal-rust" />
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-coastal-ink sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-3 text-base leading-relaxed text-coastal-slate sm:text-lg">
              {subheading}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Sticky Astryx Bento Viewport (Left / Top on mobile) */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-coastal-line bg-coastal-card p-3 shadow-coastal-lg">
            {/* Concentric Inner Stage (outer rounded-3xl minus p-3 = inner rounded-2xl) */}
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-coastal-deep">
              {steps.map((step, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <div
                    key={step.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      isCurrent
                        ? 'z-10 scale-100 opacity-100'
                        : 'z-0 scale-105 opacity-0'
                    }`}
                  >
                    <img
                      src={step.imageUrl}
                      alt={step.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-coastal-ink/80 via-coastal-ink/20 to-transparent" />
                  </div>
                );
              })}

              {/* Top Floating Astryx Step Pill & Segmented Progress Dots */}
              <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-coastal-line/60 bg-coastal-card/90 px-3.5 py-1.5 text-xs font-semibold text-coastal-ink shadow-coastal backdrop-blur-xl">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coastal-kelp font-mono text-[11px] font-bold text-coastal-card">
                    {activeStep.stepNumber}
                  </span>
                  <span>{activeStep.badge}</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-coastal-card/20 bg-coastal-ink/55 px-3 py-1.5 backdrop-blur-xl">
                  {steps.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        stepRefs.current[idx]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }}
                      aria-label={s.title}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === activeIndex
                          ? 'w-7 bg-coastal-gold-light'
                          : 'w-2 bg-coastal-card/50 hover:bg-coastal-card'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Astryx Glassmorphism HUD Card */}
              <div className="absolute inset-x-4 bottom-4 z-20 flex flex-col justify-between gap-4 rounded-2xl border border-coastal-line/60 bg-coastal-card/90 p-5 shadow-coastal backdrop-blur-xl sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-coastal-kelp">
                    <AppIcon
                      name={activeStep.icon}
                      className="h-4 w-4 text-coastal-rust"
                    />
                    <span>{activeStep.subtitle}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-coastal-ink sm:text-2xl">
                    {activeStep.title}
                  </h3>
                </div>

                <div className="shrink-0 rounded-xl border border-coastal-border bg-coastal-stone/80 px-4 py-2.5 text-left sm:text-right">
                  <p className="font-mono text-xl font-bold text-coastal-deep">
                    {activeStep.metricValue}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-coastal-slate">
                    {activeStep.metricLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling Astryx Narrative Cards (Right column) */}
        <div className="space-y-6 lg:col-span-5 lg:py-4">
          {steps.map((step, idx) => {
            const isCurrent = idx === activeIndex;
            const isLeaf = step.accentTone === 'leaf';

            return (
              <div
                key={step.id}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                onClick={() => setActiveIndex(idx)}
                className={`cursor-pointer rounded-3xl border p-6 transition-all duration-300 sm:p-7 ${
                  isCurrent
                    ? isLeaf
                      ? 'scale-[1.01] border-coastal-rust bg-coastal-card shadow-coastal-lg ring-2 ring-coastal-rust/20'
                      : 'scale-[1.01] border-coastal-kelp bg-coastal-card shadow-coastal-lg ring-2 ring-coastal-kelp/20'
                    : 'border-coastal-line/80 bg-coastal-card/70 opacity-70 hover:opacity-100 hover:shadow-coastal'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${
                      isLeaf
                        ? 'border-coastal-border bg-coastal-stone text-coastal-deep'
                        : 'border-coastal-line bg-coastal-mist text-coastal-forest'
                    }`}
                  >
                    <AppIcon name={step.icon} className="h-3.5 w-3.5" />
                    {step.badge}
                  </span>
                  <span className="rounded-full bg-coastal-bg px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-widest text-coastal-muted">
                    {step.stepNumber} / 0{steps.length}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-bold text-coastal-ink">
                  {step.title}
                </h3>
                <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-wider text-coastal-kelp">
                  {step.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-coastal-slate sm:text-base">
                  {step.description}
                </p>

                {/* Mobile inline preview image */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-coastal-line lg:hidden">
                  <img
                    src={step.imageUrl}
                    alt={step.title}
                    className="h-48 w-full object-cover"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-coastal-line/60 pt-4">
                  <span className="text-xs font-medium text-coastal-muted">
                    {step.metricLabel}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 font-mono text-xs font-bold ${
                      isLeaf
                        ? 'bg-coastal-stone text-coastal-deep'
                        : 'bg-coastal-mist text-coastal-kelp'
                    }`}
                  >
                    {step.metricValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 5. ScrollMarquee
 * Meta Astryx Kinetic Pill Ticker that accelerates smoothly with scroll velocity
 * ============================================================================ */
export interface ScrollMarqueeItem {
  label: string;
  icon?: IconName;
  accent?: 'aqua' | 'leaf';
}

export interface ScrollMarqueeProps {
  items: ScrollMarqueeItem[];
  baseSpeed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function ScrollMarquee({
  items,
  baseSpeed = 0.035,
  direction = 'left',
  className = '',
}: ScrollMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY;
    let offsetPercent = 0;
    let velocityBoost = 0;

    const dirMultiplier = direction === 'left' ? -1 : 1;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      velocityBoost = Math.min(0.22, velocityBoost + delta * 0.0025);
    };

    const tick = (now: number) => {
      const dt = Math.min(50, now - lastTime);
      lastTime = now;

      velocityBoost *= 0.92;
      const speed = baseSpeed + velocityBoost;
      offsetPercent += dirMultiplier * speed * (dt * 0.06);

      if (offsetPercent <= -50) {
        offsetPercent += 50;
      } else if (offsetPercent >= 0) {
        offsetPercent -= 50;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetPercent.toFixed(
          3
        )}%, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [baseSpeed, direction]);

  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div
      className={`relative overflow-hidden border-y border-coastal-line bg-gradient-to-r from-coastal-mist via-coastal-card to-coastal-stone/60 py-3.5 ${className}`}
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-4 will-change-transform"
      >
        {repeatedItems.map((item, idx) => {
          const isLeaf = item.accent === 'leaf' || idx % 2 === 1;
          return (
            <div
              key={`${item.label}-${idx}`}
              className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 shadow-2xs ${
                isLeaf
                  ? 'border-coastal-border bg-coastal-stone/70 text-coastal-deep'
                  : 'border-coastal-line bg-coastal-card text-coastal-ink'
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                  isLeaf
                    ? 'bg-coastal-rust text-coastal-card'
                    : 'bg-coastal-kelp text-coastal-card'
                }`}
              >
                <AppIcon
                  name={item.icon || (isLeaf ? 'recycle' : 'waves')}
                  className="h-3.5 w-3.5"
                />
              </span>
              <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wider sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * 6. AnimatedCounter
 * Smooth easeOutExpo number counter triggered when scrolled into view
 * ============================================================================ */
export interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  durationMs = 1600,
  className = '',
}: AnimatedCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let rafId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(value * eased);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [hasStarted, value, durationMs]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('en-US');

  return (
    <span ref={spanRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
