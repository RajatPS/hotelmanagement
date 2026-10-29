import SectionHeading from '../SectionHeading.jsx';

const defaultRooms = [
  {
    name: 'Deluxe Room',
    description: 'A serene retreat with considered details and room to unwind.',
    price: '$—',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85',
    amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast option'],
  },
  {
    name: 'Executive Suite',
    description: 'An inviting suite with a separate space to relax or work.',
    price: '$—',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85',
    amenities: ['Wi-Fi', 'Lounge area', 'Air conditioning'],
  },
  {
    name: 'Luxury Suite',
    description: 'A spacious stay made for slow mornings and special moments.',
    price: '$—',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85',
    amenities: ['Wi-Fi', 'Separate living area', 'Breakfast option'],
  },
];

export default function RoomsSection({ rooms = defaultRooms } = {}) {
  return (
    <section id="rooms" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="Stay your way" title="Rooms & Suites" description="Thoughtful spaces designed to make it easy to settle in, slow down, and feel at home." />
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <article key={room.name} className="group overflow-hidden border border-[#eeeae1] bg-white transition-shadow hover:shadow-[0_18px_45px_rgba(40,34,22,0.1)]">
              <div className="relative h-[260px] overflow-hidden">
                <img src={room.image} alt={`${room.name} interior`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute bottom-4 left-4 bg-white/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#62583f]">Illustrative rate: {room.price} / night</span>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-serif text-2xl text-[#292821]">{room.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#77746c]">{room.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => <span key={amenity} className="border border-[#ebe6da] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.08em] text-[#77746c]">{amenity}</span>)}
                </div>
                <a href="#booking" className="mt-7 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b7242] transition-colors hover:text-[#292821]">
                  View Details <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
