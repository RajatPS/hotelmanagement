export default function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <div className={`mx-auto mb-12 max-w-[650px] text-center ${light ? 'text-white' : 'text-[#292821]'}`}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a88b53]">{eyebrow}</p>
      <h2 className="font-serif text-4xl font-normal leading-tight tracking-[-0.025em] sm:text-5xl">{title}</h2>
      {description && <p className={`mx-auto mt-4 max-w-[560px] text-sm leading-7 ${light ? 'text-white/65' : 'text-[#77746c]'}`}>{description}</p>}
    </div>
  );
}
