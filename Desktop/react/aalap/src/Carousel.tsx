import { useCallback, useEffect, useRef, useState, type TransitionEvent } from 'react';
import type { ReactNode } from 'react';

type CarouselProps = {
  slides: string[];
  eyebrow?: string;
  heading?: ReactNode;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export default function HeroCarousel({
  slides,
  eyebrow = 'Welcome to My Hotel',
  heading = <>Experience Comfort.<br className="hidden sm:block" /> Discover Luxury.</>,
  description = 'Relax in thoughtfully designed rooms, enjoy exceptional hospitality, and make every stay memorable.',
  primaryAction = { label: 'Book Your Stay', href: '/booking' },
  secondaryAction = { label: 'Explore Our Rooms', href: '#rooms' },
}: CarouselProps) {
  const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const trackIndexRef = useRef(1);
  const isAnimatingRef = useRef(false);
  const pendingTimeoutsRef = useRef<number[]>([]);
  const transitionFallbackRef = useRef<number | null>(null);
  const completeTransitionRef = useRef<(finishedIndex: number) => void>(() => {});

  const currentIndex =
    trackIndex === 0
      ? slides.length - 1
      : trackIndex === slides.length + 1
        ? 0
        : trackIndex - 1;

  const scheduleTimeout = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter((id) => id !== timer);
      callback();
    }, delay);

    pendingTimeoutsRef.current.push(timer);
  };

  const completeTransition = (finishedIndex: number) => {
    if (!isAnimatingRef.current || trackIndexRef.current !== finishedIndex) return;

    if (transitionFallbackRef.current !== null) {
      window.clearTimeout(transitionFallbackRef.current);
      transitionFallbackRef.current = null;
    }

    if (finishedIndex === 0 || finishedIndex === slides.length + 1) {
      const realIndex = finishedIndex === 0 ? slides.length : 1;

      setTransitionEnabled(false);
      trackIndexRef.current = realIndex;
      setTrackIndex(realIndex);

      scheduleTimeout(() => {
        setTransitionEnabled(true);
        scheduleTimeout(() => {
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }, 20);
      }, 20);

      return;
    }

    isAnimatingRef.current = false;
    setIsAnimating(false);
  };

  completeTransitionRef.current = completeTransition;

  // Ignore every new request while a slide transition is running.
  const moveImage = useCallback((direction: number) => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);

    const nextIndex = trackIndexRef.current + direction;
    trackIndexRef.current = nextIndex;
    setTrackIndex(nextIndex);
    transitionFallbackRef.current = window.setTimeout(() => {
      transitionFallbackRef.current = null;
      completeTransitionRef.current(nextIndex);
    }, 900);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => moveImage(1), 5000);
    return () => window.clearTimeout(timer);
  }, [currentIndex, moveImage]);

  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
      pendingTimeoutsRef.current = [];
      if (transitionFallbackRef.current !== null) {
        window.clearTimeout(transitionFallbackRef.current);
        transitionFallbackRef.current = null;
      }
    };
  }, []);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;

    completeTransitionRef.current(trackIndexRef.current);
  };

  return (
    <section id="home" className={carouselStyles.carouselContainer} aria-label="Welcome to My Hotel">
      <div
        className={`${carouselStyles.slideTrack} ${transitionEnabled ? '' : 'transition-none'}`}
        style={{ transform: `translateX(-${trackIndex * 100}%)`, transition: transitionEnabled ? undefined : 'none' }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, index) => (
          <div key={`${slide}-${index}`} className={carouselStyles.slide}>
            <img src={slide} alt="" aria-hidden="true" className={carouselStyles.image} />
            <div className={carouselStyles.imageShade} />
          </div>
        ))}
      </div>

      <div className={carouselStyles.heroContent}>
        <p className={carouselStyles.eyebrow}>{eyebrow}</p>
        <h1 className={carouselStyles.heading}>{heading}</h1>
        <p className={carouselStyles.description}>{description}</p>
        <div className={carouselStyles.actions}>
          <a href={primaryAction.href} className={carouselStyles.primaryAction}>{primaryAction.label}</a>
          <a href={secondaryAction.href} className={carouselStyles.secondaryAction}>{secondaryAction.label}</a>
        </div>
      </div>

      <button type="button" onClick={() => moveImage(-1)} disabled={isAnimating} className={carouselStyles.leftArrow} aria-label="Previous image">&#10094;</button>
      <button type="button" onClick={() => moveImage(1)} disabled={isAnimating} className={carouselStyles.rightArrow} aria-label="Next image">&#10095;</button>

      <div className={carouselStyles.counter} aria-live="polite">{currentIndex + 1} / {slides.length}</div>
    </section>
  );
}

const carouselStyles = {
  carouselContainer: 'relative h-[82svh] min-h-[620px] max-h-[900px] w-full overflow-hidden bg-[#22231f] text-white sm:h-[86svh]',
  slideTrack: 'flex w-full h-full transition-transform duration-700 ease-in-out',
  slide: 'relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden',
  image: 'absolute inset-0 h-full w-full object-cover',
  imageShade: 'absolute inset-0 bg-[linear-gradient(90deg,rgba(18,20,19,0.66),rgba(18,20,19,0.26)_58%,rgba(18,20,19,0.36)),linear-gradient(0deg,rgba(14,15,14,0.35),transparent_55%)]',
  heroContent: 'absolute inset-0 z-[1] mx-auto flex max-w-[1000px] flex-col items-center justify-center px-6 pb-8 pt-20 text-center sm:px-12',
  eyebrow: 'mb-5 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#e3c990] sm:text-xs',
  heading: 'max-w-[900px] font-serif text-[clamp(2.75rem,7vw,6.4rem)] font-normal leading-[1.02] tracking-[-0.045em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.24)]',
  description: 'mt-6 max-w-[600px] text-sm leading-7 text-white/85 sm:text-base',
  actions: 'mt-9 flex flex-col items-center gap-3 sm:flex-row',
  primaryAction: 'min-w-[180px] bg-[#d5b97f] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#201e19] transition-colors hover:bg-[#ead6a9]',
  secondaryAction: 'min-w-[180px] border border-white/75 px-7 py-[15px] text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/15',
  leftArrow: 'absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xl text-white transition hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-40 sm:left-7 sm:px-4 sm:py-3 sm:text-2xl',
  rightArrow: 'absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xl text-white transition hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-40 sm:right-7 sm:px-4 sm:py-3 sm:text-2xl',
  counter: 'absolute bottom-5 left-1/2 z-[2] -translate-x-1/2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs tracking-[0.1em] text-white/90',
};