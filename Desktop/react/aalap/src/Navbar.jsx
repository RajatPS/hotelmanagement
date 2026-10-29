import { useEffect, useState } from 'react';

const navigationLinks = [
  ['Home', '/#home'],
  ['About', '/#about'],
  ['Rooms', '/#rooms'],
  ['Services', '/#services'],
  ['Gallery', '/#gallery'],
  ['Book Now', '/booking'],
  ['Contact', '/#contact'],
];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'WhatsApp', href: 'https://www.whatsapp.com/' },
];

function SocialIcon({ label }) {
  if (label === 'Facebook') {
    return <span aria-hidden="true" className="font-serif text-lg font-bold">f</span>;
  }
  if (label === 'Instagram') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M12.04 2a9.87 9.87 0 0 0-8.42 15.03L2.3 22l5.1-1.34A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.14 8.14 0 0 1-4.15-1.13l-.3-.18-3.03.8.81-2.95-.2-.31a8.12 8.12 0 1 1 6.87 3.77Zm4.46-6.08c-.25-.12-1.47-.73-1.7-.81-.22-.08-.4-.12-.56.12-.17.25-.64.81-.78.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-.1-.74-.74-1.24-1.66-1.38-1.94-.14-.25-.01-.39.1-.52.11-.1.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.4-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.12.17 1.75 2.67 4.24 3.74.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolledHeader : ''}`}>
      <div className={styles.navbar}>
        <a href="/#home" className={styles.brand} onClick={closeMenu} aria-label="My Hotel home">
          <span>My</span> <span className={styles.brandAccent}>Hotel</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navigationLinks.map(([label, href]) => (
            <a key={href} href={href} className={label === 'Book Now' ? styles.bookLink : styles.navLink}>
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.socials} aria-label="Social media">
          {socialLinks.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className={styles.socialLink}>
              <SocialIcon label={label} />
            </a>
          ))}
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={menuOpen ? styles.menuLineOpenTop : styles.menuLine} />
          <span className={menuOpen ? styles.menuLineHidden : styles.menuLine} />
          <span className={menuOpen ? styles.menuLineOpenBottom : styles.menuLine} />
        </button>
      </div>

      <nav id="mobile-navigation" className={`${styles.mobileNav} ${menuOpen ? 'flex' : 'hidden'}`} aria-label="Mobile navigation">
        {navigationLinks.map(([label, href]) => (
          <a key={href} href={href} onClick={closeMenu} className={label === 'Book Now' ? styles.mobileBookLink : styles.mobileNavLink}>
            {label}
          </a>
        ))}
        <div className={styles.mobileSocials}>
          {socialLinks.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className={styles.mobileSocialLink}>
              <SocialIcon label={label} />
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

const styles = {
  header: 'fixed inset-x-0 top-0 z-[1000] text-white transition-colors duration-300',
  scrolledHeader: 'bg-[#20211d] shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md',
  navbar: 'mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12',
  brand: 'shrink-0 text-[22px] font-semibold tracking-[0.04em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]',
  brandAccent: 'font-serif font-normal italic text-[#d9bd82]',
  desktopNav: 'hidden flex-1 items-center justify-center gap-5 xl:flex',
  navLink: 'whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-[#e3c990] after:mx-auto after:mt-1 after:block after:h-px after:w-0 after:bg-[#d9bd82] after:transition-all hover:after:w-full',
  bookLink: 'whitespace-nowrap border border-[#d9bd82]/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f4e8cc] transition-colors hover:bg-[#d9bd82] hover:text-[#201d18]',
  socials: 'hidden items-center gap-4 border-l border-white/30 pl-5 xl:flex',
  socialLink: 'flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-[#e3c990]',
  menuButton: 'flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-white/40 bg-black/10 xl:hidden',
  menuLine: 'h-px w-5 bg-white transition-all',
  menuLineOpenTop: 'h-px w-5 translate-y-[6px] rotate-45 bg-white transition-all',
  menuLineHidden: 'h-px w-5 scale-x-0 bg-white transition-all',
  menuLineOpenBottom: 'h-px w-5 -translate-y-[6px] -rotate-45 bg-white transition-all',
  mobileNav: 'absolute left-0 right-0 top-[76px] max-h-[calc(100vh-76px)] flex-col overflow-y-auto border-t border-white/10 bg-[#211f1a]/95 px-6 pb-7 pt-3 backdrop-blur-xl xl:hidden',
  mobileNavLink: 'border-b border-white/10 py-4 text-sm uppercase tracking-[0.14em] text-white/90',
  mobileBookLink: 'my-4 border border-[#d9bd82] px-4 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#e7d3a9]',
  mobileSocials: 'flex items-center gap-3 pt-2',
  mobileSocialLink: 'flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/90 transition-colors hover:border-[#d9bd82] hover:text-[#e3c990]',
};
