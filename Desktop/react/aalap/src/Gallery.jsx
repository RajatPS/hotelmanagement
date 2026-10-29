import { useCallback, useEffect, useRef, useState } from 'react';

const transitionDuration = 700;
const supportedImageExtension = /\.(png|jpe?g|webp|avif|gif)$/i;

const galleryImages = Object.entries(
  import.meta.glob('./assets/gallery/*', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .filter(([path]) => supportedImageExtension.test(path))
  .sort(([left], [right]) => left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' }))
  .map(([path, src]) => {
    const fileName = path.split('/').pop().replace(/\.[^.]+$/, '');
    const caption = fileName
      .replace(/^\d+[\s._-]*/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());

    return { src, alt: caption || 'Hotel gallery image', caption: caption || 'Hotel Gallery' };
  });

export default function Gallery({ images = galleryImages } = {}) {
  const sectionRef = useRef(null);
  const transitionLockRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const touchStartYRef = useRef(null);
  const [slidePosition, setSlidePosition] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const stepSize = () => window.innerHeight * 0.85;

  const updateScrollPosition = useCallback(() => {
    const section = sectionRef.current;
    if (!section || images.length < 2) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const step = stepSize();
    const maxPosition = images.length - 1;
    const position = Math.max(0, Math.min(maxPosition, (window.scrollY - sectionTop) / step));

    setSlidePosition(position);
    setIsPinned(window.scrollY >= sectionTop - 1 && window.scrollY < sectionTop + step * maxPosition);
  }, [images.length]);

  const navigateTo = useCallback((targetIndex) => {
    const section = sectionRef.current;
    if (!section || images.length < 2 || transitionLockRef.current) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const target = Math.max(0, Math.min(images.length - 1, targetIndex));
    transitionLockRef.current = true;
    setIsTransitioning(true);
    window.scrollTo({
      top: sectionTop + stepSize() * target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });

    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      transitionLockRef.current = false;
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, transitionDuration + 180);
  }, [images.length]);

  useEffect(() => {
    updateScrollPosition();
    window.addEventListener('scroll', updateScrollPosition, { passive: true });
    window.addEventListener('resize', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
      window.removeEventListener('resize', updateScrollPosition);
      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    };
  }, [updateScrollPosition]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const handleWheel = (event) => {
      if (!isPinned) return;
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      const currentIndex = Math.round(slidePosition);
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= images.length) return;

      event.preventDefault();
      if (transitionLockRef.current) return;
      navigateTo(nextIndex);
    };

    section.addEventListener('wheel', handleWheel, { passive: false });
    return () => section.removeEventListener('wheel', handleWheel);
  }, [images.length, isPinned, navigateTo, slidePosition]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isPinned || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        navigateTo(Math.round(slidePosition) + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        navigateTo(Math.round(slidePosition) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinned, navigateTo, slidePosition]);

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event) => {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY;
    touchStartYRef.current = null;
    if (!isPinned || startY === null || endY === undefined || Math.abs(endY - startY) < 50) return;

    const direction = endY < startY ? 1 : -1;
    const nextIndex = Math.round(slidePosition) + direction;
    if (nextIndex >= 0 && nextIndex < images.length) navigateTo(nextIndex);
  };

  const position = Math.max(0, Math.min(images.length - 1, slidePosition));
  const activeIndex = Math.round(position);
  const sectionHeight = images.length < 2
    ? '100svh'
    : `calc(100svh + ${(images.length - 1) * 85}svh)`;
  const trackStyle = {
    width: `${images.length * 100}%`,
    transform: `translateX(-${(position * 100) / images.length}%)`,
    transition: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'none' : `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  };

  if (images.length === 0) {
    return (
      <section id="gallery" className="flex min-h-[50svh] scroll-mt-20 items-center justify-center bg-[#f7f5ef] px-5 py-20 sm:px-8" aria-label="Hotel photo gallery">
        <div className="text-center">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a88b53]">A glimpse inside</p>
          <h2 className="font-serif text-4xl text-[#292821]">The Gallery</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#77746c]">
            Add PNG, JPG, JPEG, WEBP, AVIF, or GIF images to <code className="text-[#66583b]">src/assets/gallery/</code> to display them here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{ height: sectionHeight }}
      className="relative bg-[#f7f5ef]"
      aria-label="Hotel photo gallery"
    >
      <div
        className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-5 pb-5 pt-[82px] sm:px-8 sm:pb-7 sm:pt-[92px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto flex w-full max-w-[1320px] shrink-0 items-end justify-between gap-5 pb-5 sm:pb-6">
          <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#a88b53] sm:text-[10px]">A glimpse inside</p>
            <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em] text-[#292821] sm:text-4xl">The Gallery</h2>
          </div>
          <p className="hidden max-w-[300px] pb-1 text-right text-xs leading-5 text-[#77746c] sm:block">
            Scroll to explore a few of the details that make a stay feel like your own.
          </p>
        </div>

        <div className="relative mx-auto min-h-0 w-full max-w-[1320px] flex-1 overflow-hidden bg-[#22231f]">
          <div className="flex h-full" style={trackStyle}>
            {images.map((image, index) => (
              <figure key={image.src} className="relative h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
              </figure>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 text-white sm:px-8 sm:pb-7">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#e3c990] sm:text-[10px]">My Hotel</p>
              <p className="mt-1 truncate font-serif text-xl sm:text-2xl">{images[activeIndex].caption}</p>
            </div>
            <p
              className="shrink-0 font-serif text-lg tracking-[0.08em] sm:text-xl"
              aria-live="polite"
              aria-label={`Gallery image ${activeIndex + 1} of ${images.length}`}
            >
              {String(activeIndex + 1).padStart(2, '0')} <span className="text-white/55">/ {String(images.length).padStart(2, '0')}</span>
            </p>
          </div>

          <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
            <button
              type="button"
              onClick={() => navigateTo(activeIndex - 1)}
              disabled={activeIndex === 0 || isTransitioning}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous gallery image"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo(activeIndex + 1)}
              disabled={activeIndex === images.length - 1 || isTransitioning}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next gallery image"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1320px] shrink-0 items-center justify-center gap-2 pt-4 sm:pt-5" aria-label="Gallery image navigation">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => navigateTo(index)}
              aria-label={`Show gallery image ${index + 1}: ${image.alt}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={`h-1 transition-all duration-300 ${index === activeIndex ? 'w-8 bg-[#a88b53]' : 'w-3 bg-[#d5d0c4] hover:bg-[#a88b53]'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
