import SectionHeading from '../SectionHeading.jsx';

const defaultServices = [
  { title: 'Free Wi-Fi', description: 'Stay connected throughout your visit.', icon: 'wifi' },
  { title: 'Restaurant & Dining', description: 'A welcoming setting for memorable meals.', icon: 'dining' },
  { title: 'Room Service', description: 'Thoughtful comforts delivered to your room.', icon: 'service' },
  { title: 'Swimming Pool', description: 'Take a refreshing pause during your stay.', icon: 'pool' },
  { title: 'Fitness Center', description: 'Make space for movement in your routine.', icon: 'fitness' },
  { title: 'Airport Transfers', description: 'Ask us about convenient travel options.', icon: 'transfer' },
];

function ServiceIcon({ name }) {
  const paths = {
    wifi: <><path d="M5 9.5a11 11 0 0 1 14 0" /><path d="M8 12.5a6.5 6.5 0 0 1 8 0" /><path d="M10.5 15.5a2.5 2.5 0 0 1 3 0" /><path d="M12 19h.01" /></>,
    dining: <><path d="M4 3v7a3 3 0 0 0 6 0V3" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M17 3c2 2 3 5 3 8h-3" /></>,
    service: <><path d="M4 13h16l-2 7H6l-2-7Z" /><path d="M7 13a5 5 0 0 1 10 0" /><path d="M12 4v2" /></>,
    pool: <><path d="M3 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 3-2" /><path d="M3 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 3-2" /><path d="M8 12V5a2 2 0 0 1 4 0v7" /><path d="M12 8h4" /></>,
    fitness: <><path d="M6 9v6M3 10v4M18 9v6M21 10v4M6 12h12" /></>,
    transfer: <><path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      {paths[name]}
    </svg>
  );
}

export default function ServicesSection({ services = defaultServices } = {}) {
  return (
    <section id="services" className="scroll-mt-20 bg-[#25251f] px-5 py-20 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="The little comforts" title="Services & Amenities" description="A selection of sample offerings for this website design. Please update these details to reflect the amenities available at your property." light />
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="group bg-[#25251f] px-7 py-8 transition-colors hover:bg-[#302f27] sm:px-9 sm:py-10">
              <div className="mb-5 text-[#d5b97f] transition-transform group-hover:-translate-y-1"><ServiceIcon name={service.icon} /></div>
              <h3 className="font-serif text-xl">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
