const quickLinks = [
  ['Home', '/#home'],
  ['About', '/#about'],
  ['Rooms', '/#rooms'],
  ['Services', '/#services'],
  ['Gallery', '/#gallery'],
  ['Book Now', '/booking'],
  ['Check Booking', '/check-booking'],
  ['Contact', '/#contact'],
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#20211d] px-5 pb-7 pt-14 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <a href="#home" className="font-serif text-3xl tracking-[0.02em]">My <span className="italic text-[#d5b97f]">Hotel</span></a>
          <p className="mt-4 max-w-[320px] text-sm leading-6 text-white/55">A thoughtful stay, made personal. Create a welcoming experience for every guest.</p>
        </div>
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5b97f]">Explore</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
            {quickLinks.map(([label, href]) => <a key={href} href={href} className="text-sm text-white/65 transition-colors hover:text-white">{label}</a>)}
          </div>
        </div>
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5b97f]">Contact</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/65">
            <p>Address: Add your hotel address</p>
            <p>Phone: Add your contact number</p>
            <p>Email: Add your contact email</p>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-3 pt-6 text-[10px] uppercase tracking-[0.1em] text-white/40 sm:flex-row">
        <p>© {new Date().getFullYear()} My Hotel. All rights reserved.</p>
        <p>Illustrative website content — update with verified hotel information.</p>
      </div>
    </footer>
  );
}
