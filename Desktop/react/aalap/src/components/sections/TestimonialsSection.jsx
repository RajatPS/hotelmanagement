import SectionHeading from '../SectionHeading.jsx';

const defaultTestimonials = [
  { name: 'Guest review sample', quote: 'A peaceful place to slow down. The little details made the stay feel special.', stars: 5 },
  { name: 'Guest review sample', quote: 'Warm hospitality, a lovely room, and a genuinely relaxing experience.', stars: 5 },
  { name: 'Guest review sample', quote: 'A comfortable home away from home. I would be happy to return.', stars: 5 },
];

export default function TestimonialsSection({ reviews = defaultTestimonials } = {}) {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="Kind words" title="Guest Notes" description="Placeholder review cards for design purposes. Replace these examples with genuine guest feedback." />
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review, index) => (
            <article key={index} className="border border-[#eeeae1] bg-[#fbfaf7] p-7 sm:p-8">
              <div className="mb-5 tracking-[0.18em] text-[#b18f50]" aria-label={`${review.stars} out of 5 stars`}>{'★'.repeat(review.stars)}</div>
              <blockquote className="font-serif text-xl leading-8 text-[#39372f]">“{review.quote}”</blockquote>
              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b7242]">{review.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
