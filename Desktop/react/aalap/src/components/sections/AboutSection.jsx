const aboutImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85';

export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-[#f7f5ef] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="relative pb-7 pr-7">
          <img src={aboutImage} alt="Welcoming hotel exterior with a landscaped pool" loading="lazy" className="h-[390px] w-full object-cover sm:h-[500px]" />
          <div className="absolute bottom-0 right-0 flex h-[112px] w-[150px] flex-col items-center justify-center bg-[#d5b97f] text-center text-[#292821]">
            <span className="font-serif text-3xl">A place</span><span className="mt-1 text-[9px] uppercase tracking-[0.18em]">to feel at ease</span>
          </div>
        </div>
        <div className="max-w-[510px]">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a88b53]">A thoughtful welcome</p>
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.025em] text-[#292821] sm:text-5xl">A Stay Beyond Expectations</h2>
          <p className="mt-6 text-sm leading-7 text-[#77746c]">At My Hotel, every stay begins with a warm welcome. Find room to unwind, enjoy the little comforts, and make the experience your own, whether you are here for a quiet escape or a change of scene.</p>
          <p className="mt-4 text-sm leading-7 text-[#77746c]">Our approach is simple: thoughtful spaces, attentive hospitality, and time well spent.</p>
          <a href="#services" className="mt-8 inline-flex border-b border-[#a88b53] pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#66583b] transition-colors hover:text-[#292821]">Discover More <span className="ml-3" aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}
