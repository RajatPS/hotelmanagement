import { useCallback, useEffect, useRef, useState } from 'react';

const transitionDuration = 850;

const activityDetails = [
  {
    id: 'elephant-riding',
    title: 'Elephant Riding',
    subtitle: 'A scenic journey through forest trails and open landscapes.',
  },
  {
    id: 'river-boating',
    title: 'River Boating',
    subtitle: 'Travel by boat along beautiful rivers framed by lush greenery.',
  },
  {
    id: 'jungle-safari',
    title: 'Jungle Safari',
    subtitle: "Discover wildlife and dense forests across the region's natural habitats.",
  },
  {
    id: 'paragliding',
    title: 'Paragliding',
    subtitle: 'Take in wide-open views from a fresh point of view.',
  },
  {
    id: 'outdoor-onsen',
    title: 'Outdoor Onsen',
    subtitle: 'A Tranquil Escape in Nature',
    description: 'Experience peaceful outdoor bathing surrounded by natural stone pools, lush greenery, and beautiful mountain scenery.',
  },
];

const discoveredImages = Object.entries(
  import.meta.glob('./assets/activities/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,avif,AVIF,gif,GIF}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .sort(([left], [right]) => left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' }));

const defaultActivities = activityDetails.map((activity) => {
  const images = discoveredImages
    .filter(([path]) => path.includes(`/activities/${activity.id}/`))
    .map(([path, src]) => {
      const fileName = path.split('/').pop().replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '');
      const caption = fileName
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());

      const imageCaption = caption || activity.title;
      return {
        src,
        caption: imageCaption,
        alt: `${activity.title}: ${imageCaption}.`,
      };
    });

  return {
    ...activity,
    images: images.length > 0
      ? images
      : Array.from({ length: 3 }, (_, index) => ({
          src: null,
          caption: `Add ${activity.title.toLowerCase()} photo ${index + 1}`,
        })),
  };
});

function getImagePlacement(index, count) {
  if (count === 4) {
    return [
      'md:col-start-1 md:col-span-4 md:row-start-1',
      'md:col-start-7 md:col-span-4 md:row-start-1',
      'md:col-start-1 md:col-span-4 md:row-start-2',
      'md:col-start-7 md:col-span-4 md:row-start-2',
    ][index];
  }

  if (count === 3 && index === 2) {
    return 'md:col-start-4 md:col-span-4 md:row-start-2';
  }

  if (count === 3) {
    return `${index === 0 ? 'md:col-start-1' : 'md:col-start-7'} md:col-span-4 md:row-start-1`;
  }

  if (count === 2) {
    return index === 0
      ? 'md:col-start-2 md:col-span-4 md:row-start-1'
      : 'md:col-start-6 md:col-span-4 md:row-start-2';
  }

  if (count === 1) return 'md:col-start-4 md:col-span-4 md:row-start-1';

  return '';
}

export default function Activities({ activities = defaultActivities } = {}) {
  const sectionRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchDirectionRef = useRef(0);
  const transitionLockRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const pinnedRef = useRef(false);
  const previousScrollYRef = useRef(0);
  const navigateRef = useRef(() => {});
  const [activeIndex, setActiveIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState(null);
  const [direction, setDirection] = useState(1);
  const [isPinned, setIsPinned] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [failedImages, setFailedImages] = useState(() => new Set());

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lastIndex = activities.length - 1;
  const activeActivity = activities[activeIndex];

  const finishTransition = useCallback(() => {
    if (!transitionLockRef.current) return;
    transitionLockRef.current = false;
    setIsTransitioning(false);
    setOutgoingIndex(null);
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const navigateTo = useCallback((targetIndex, nextDirection) => {
    const section = sectionRef.current;
    if (!section || targetIndex < 0 || targetIndex > lastIndex || transitionLockRef.current) return;

    if (!reducedMotion) {
      transitionLockRef.current = true;
      setIsTransitioning(true);
      setOutgoingIndex(activeIndexRef.current);
    }
    setDirection(nextDirection);
    activeIndexRef.current = targetIndex;
    setActiveIndex(targetIndex);

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const stepSize = section.offsetHeight / activities.length;
    window.scrollTo({
      top: sectionTop + stepSize * targetIndex,
      behavior: 'instant',
    });

    if (!reducedMotion) {
      transitionTimerRef.current = window.setTimeout(finishTransition, transitionDuration + 550);
    }
  }, [activities.length, finishTransition, lastIndex, reducedMotion]);

  useEffect(() => {
    navigateRef.current = navigateTo;
  }, [navigateTo]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const updateScrollState = () => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollProgress = window.scrollY - sectionTop;
      const stepSize = section.offsetHeight / activities.length;
      const maxScroll = stepSize * lastIndex;
      const pinned = scrollProgress >= -1 && scrollProgress <= maxScroll + 1;
      pinnedRef.current = pinned;
      setIsPinned(pinned);
      if (pinned) setHasEntered(true);

      if (!transitionLockRef.current) {
        const nextIndex = Math.max(0, Math.min(lastIndex, Math.round(scrollProgress / stepSize)));
        const previousScrollY = previousScrollYRef.current;
        if (nextIndex !== activeIndexRef.current) {
          setDirection(window.scrollY >= previousScrollY ? 1 : -1);
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }
      }

      previousScrollYRef.current = window.scrollY;
    };

    const handleWheel = (event) => {
      if (!pinnedRef.current || reducedMotion) return;
      const wheelDirection = Math.sign(event.deltaY);
      if (!wheelDirection) return;

      if (transitionLockRef.current) {
        event.preventDefault();
        return;
      }

      const targetIndex = activeIndexRef.current + wheelDirection;
      if (targetIndex < 0 || targetIndex > lastIndex) return;

      event.preventDefault();
      navigateRef.current(targetIndex, wheelDirection);
    };

    const handleTouchStart = (event) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
      touchDirectionRef.current = 0;
    };

    const handleTouchMove = (event) => {
      if (!pinnedRef.current || reducedMotion || touchStartYRef.current === null) return;
      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;

      const swipeDirection = currentY < touchStartYRef.current ? 1 : -1;
      touchDirectionRef.current = swipeDirection;
      const targetIndex = activeIndexRef.current + swipeDirection;
      if (transitionLockRef.current || (targetIndex >= 0 && targetIndex <= lastIndex)) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event) => {
      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY;
      touchStartYRef.current = null;
      if (startY === null || endY === undefined || Math.abs(endY - startY) < 45) return;
      const swipeDirection = touchDirectionRef.current;
      const targetIndex = activeIndexRef.current + swipeDirection;
      if (pinnedRef.current && !reducedMotion && targetIndex >= 0 && targetIndex <= lastIndex) {
        navigateRef.current(targetIndex, swipeDirection);
      }
    };

    const handleKeyDown = (event) => {
      if (!pinnedRef.current || reducedMotion || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(event.target.tagName)) return;

      const keyDirection = event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0;
      const targetIndex = activeIndexRef.current + keyDirection;
      if (keyDirection && targetIndex >= 0 && targetIndex <= lastIndex) {
        event.preventDefault();
        navigateRef.current(targetIndex, keyDirection);
      }
    };

    section.addEventListener('wheel', handleWheel, { passive: false });
    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });
    section.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    window.addEventListener('keydown', handleKeyDown);
    updateScrollState();

    return () => {
      section.removeEventListener('wheel', handleWheel);
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
      section.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      window.removeEventListener('keydown', handleKeyDown);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [activities.length, lastIndex, reducedMotion]);

  const sectionHeight = `${activities.length * 100}svh`;
  const activityHasDescription = Boolean(activeActivity.description);

  return (
    <section
      id="activities"
      ref={sectionRef}
      style={{ height: sectionHeight }}
      className="relative bg-[#20211f] text-white"
      aria-label="Hotel activities and experiences"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(93,79,54,0.22),transparent_58%)]" />
        <header className="absolute inset-x-5 top-[14%] z-20 mx-auto flex max-w-[1180px] items-end justify-between gap-5 sm:inset-x-8 sm:top-[13%]">
          <div className="max-w-2xl">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#d5b97f] sm:text-[10px]">Activities & Experiences</p>
            <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em] text-white transition-opacity duration-300 sm:text-5xl lg:text-6xl">{activeActivity.title}</h2>
            <p className="mt-3 max-w-xl text-xs leading-6 text-white/65 sm:text-sm">{activeActivity.subtitle}</p>
            {activeActivity.description && (
              <p className="mt-2 max-w-xl text-[11px] leading-5 text-white/50 sm:text-xs">
                {activeActivity.description}
              </p>
            )}
          </div>
          <p className="shrink-0 pb-1 font-serif text-lg tracking-[0.1em] text-white/80 sm:text-2xl" aria-live="polite" aria-label={`Activity ${activeIndex + 1} of ${activities.length}`}>
            {String(activeIndex + 1).padStart(2, '0')} <span className="text-white/35">/ {String(activities.length).padStart(2, '0')}</span>
          </p>
        </header>

        <div
          className={`absolute inset-x-5 bottom-[12%] grid grid-cols-2 grid-rows-2 gap-3 [perspective:1200px] sm:inset-x-8 sm:bottom-[10%] sm:gap-5 md:inset-x-[7%] md:bottom-[8%] md:grid-cols-10 ${activityHasDescription ? 'top-[46%] sm:top-[43%] md:top-[40%]' : 'top-[36%] sm:top-[34%] md:top-[33%]'}`}
          aria-live="off"
        >
          {activities.map((activity, activityIndex) => {
            const isActive = activityIndex === activeIndex;
            const isOutgoing = activityIndex === outgoingIndex && isTransitioning;
            const isVisible = isActive || isOutgoing;
            const photoOffset = isActive
              ? 'translate3d(0, 0, 0) scale(1)'
              : isOutgoing
                ? `translate3d(${direction > 0 ? '-110vw' : '110vw'}, 0, 0) scale(0.9)`
                : 'translate3d(0, 45px, -700px) scale(0.3)';
            const images = activity.images;

            return (
              <div
                key={activity.id}
                aria-hidden={!isActive}
                onTransitionEnd={(event) => {
                  if (isActive && event.target === event.currentTarget && event.propertyName === 'opacity') finishTransition();
                }}
                className={`absolute inset-0 grid gap-3 px-1 pt-1 md:gap-5 md:px-0 ${images.length > 4 ? 'grid-cols-2 auto-rows-fr md:grid-cols-4' : 'grid-cols-2 grid-rows-2 md:grid-cols-10'} ${reducedMotion ? 'transition-none' : 'transition-opacity duration-[1200ms] ease-out'}`}
                style={{
                  opacity: isActive && (hasEntered || reducedMotion) ? 1 : 0,
                  visibility: isVisible || (activityIndex === 0 && !hasEntered) ? 'visible' : 'hidden',
                  pointerEvents: isActive ? 'auto' : 'none',
                  transformStyle: 'preserve-3d',
                }}
              >
                {isActive && (
                  <h3 className="sr-only">{activity.title}</h3>
                )}
                {images.map((image, imageIndex) => (
                  <figure
                    key={`${activity.id}-${imageIndex}`}
                    className={`group relative min-h-0 overflow-hidden rounded-sm border border-white/15 bg-[#33332d] shadow-[0_20px_60px_rgba(0,0,0,0.32)] [backface-visibility:hidden] ${getImagePlacement(imageIndex, images.length)}`}
                    style={{
                      transform: photoOffset,
                      opacity: isActive && (hasEntered || reducedMotion) ? 1 : 0,
                      transition: reducedMotion
                        ? 'none'
                        : `transform ${transitionDuration}ms cubic-bezier(0.2,0.75,0.25,1) ${isActive ? Math.min(imageIndex, 4) * 65 : 0}ms, opacity ${transitionDuration}ms ease-out ${isActive ? Math.min(imageIndex, 4) * 65 : 0}ms`,
                    }}
                  >
                    {image.src && !failedImages.has(image.src) ? (
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        onError={() => setFailedImages((current) => new Set(current).add(image.src))}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(145deg,rgba(213,185,127,0.2),rgba(40,41,38,0.7)_55%,rgba(20,21,20,0.95))] px-3 text-center">
                        <span className="mb-3 font-serif text-3xl text-[#d5b97f]/80" aria-hidden="true">✦</span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-[10px]">{image.caption}</span>
                        <span className="mt-2 text-[9px] text-white/40">
                          {image.src ? 'Photo unavailable' : 'Add photos to this activity folder'}
                        </span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />
                  </figure>
                ))}
              </div>
            );
          })}
        </div>

        <div className="absolute inset-x-5 bottom-5 z-30 mx-auto flex max-w-[1180px] items-center justify-between sm:inset-x-8 sm:bottom-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">Scroll to explore</p>
          <nav className="flex items-center gap-2" aria-label="Activity slides">
            {activities.map((activity, index) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => navigateTo(index, index >= activeIndex ? 1 : -1)}
                disabled={isTransitioning || index === activeIndex}
                aria-label={`Show ${activity.title}`}
                aria-current={index === activeIndex ? 'step' : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b97f] disabled:cursor-default ${index === activeIndex ? 'w-8 bg-[#d5b97f]' : 'w-2 bg-white/35 hover:bg-white/70'}`}
              />
            ))}
          </nav>
          <p className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:block">
            {isPinned ? 'Use ↑ ↓ keys' : 'My Hotel'}
          </p>
        </div>
      </div>
    </section>
  );
}
