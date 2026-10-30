import { Route, Routes } from 'react-router';
import Activities from './Activities.jsx';
import HeroCarousel from './Carousel.tsx';
import Gallery from './Gallery.jsx';
import AboutSection from './components/sections/AboutSection.jsx';
import BookingSearch from './components/sections/BookingSearch.jsx';
import ContactSection from './components/sections/ContactSection.jsx';
import RoomsSection from './components/sections/RoomsSection.jsx';
import ServicesSection from './components/sections/ServicesSection.jsx';
import SiteFooter from './components/sections/SiteFooter.jsx';
import TestimonialsSection from './components/sections/TestimonialsSection.jsx';
import BookingPage from './pages/BookingPage.jsx';
import CheckBookingPage from './pages/CheckBookingPage.jsx';
import CancelBookingPage from './pages/CancelBookingPage.jsx';
import VerifyBookingPage from './pages/VerifyBookingPage.jsx';

const heroSlides = Object.entries(
  import.meta.glob('./assets/carousel/*', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .filter(([path]) => /\/img\d+\.(png|jpe?g|webp|avif|gif)$/i.test(path))
  .sort(([left], [right]) => left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' }))
  .map(([, src]) => src);

function HomePage() {
  return (
    <main>
      <HeroCarousel slides={heroSlides} />
      <BookingSearch />
      <AboutSection />
      <RoomsSection />
      <ServicesSection />
      <Gallery />
      <Activities />
      <TestimonialsSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/check-booking" element={<CheckBookingPage />} />
      <Route path="/cancel-booking" element={<CancelBookingPage />} />
      <Route path="/verify-booking" element={<VerifyBookingPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
