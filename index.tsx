
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
// Use namespace import to resolve issues with named exports in certain environments
import * as ReactRouterDOM from 'react-router-dom';
import { Menu, X, Instagram, Facebook, ArrowUpRight, ArrowRight } from 'lucide-react';
import { ROOMS } from './constants';
import { calculateBooking } from './utils/pricing';
import { RoomType } from './types';

// Extract components from the namespace to maintain existing code structure
const { BrowserRouter, Routes, Route, Link, useLocation } = ReactRouterDOM;

// --- Scroll Restoration ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Navbar Component ---
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'HOTEL', path: '/' },
    { name: 'ROOMS', path: '/rooms' },
    { name: 'EXPERIENCES', path: '/experiences' },
    { name: 'CONTACT', path: '/contact' }
  ];

  const isDark = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${isDark ? 'bg-[#FCFAF8]/90 backdrop-blur-md py-6 border-b border-black/[0.03]' : 'bg-transparent py-12'}`}>
      <div className="container mx-auto px-8 md:px-16 flex justify-between items-center">
        <Link to="/" className="group flex flex-col">
          <span className={`text-2xl font-serif tracking-[0.4em] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>RUKA</span>
          <span className="text-[6px] font-accent text-[#C5A059] mt-1 tracking-[1em]">MALDIVES</span>
        </Link>

        <div className="hidden lg:flex items-center space-x-16">
          {links.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-[9px] font-accent font-bold tracking-[0.5em] transition-all hover:text-[#C5A059] ${isDark ? 'text-[#1A1A1A]' : 'text-white/70'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/booking" 
            className={`px-10 py-4 text-[9px] font-accent font-bold tracking-[0.5em] transition-all ${isDark ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' : 'border border-white/20 text-white hover:bg-white hover:text-[#1A1A1A]'}`}
          >
            BOOK
          </Link>
        </div>

        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} className={isDark ? 'text-[#1A1A1A]' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#FCFAF8] z-[60] transition-transform duration-700 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-16 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-24">
              <span className="text-xl font-serif tracking-widest">RUKA</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={32} strokeWidth={1} /></button>
            </div>
            <div className="flex flex-col space-y-10">
              {links.map((link, i) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="text-5xl font-serif font-light tracking-tighter hover:italic hover:translate-x-4 transition-all"
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="text-5xl font-serif font-light text-[#C5A059]">RESERVE</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Home Component ---
const Home: React.FC = () => {
  return (
    <main className="bg-[#FCFAF8]">
      {/* Editorial Cover Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <img 
          src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110" 
          alt="Cover" 
        />
        <div className="relative z-10 text-center px-6">
          <span className="block text-white/60 text-[10px] font-accent mb-12 animate-fade">THE LUXURY OF SILENCE</span>
          <h1 className="text-[18vw] md:text-[12vw] text-white font-serif leading-[0.8] tracking-tighter mb-16 animate-reveal">
            Pure <br /> <span className="italic font-light opacity-50 text-white">Light</span>
          </h1>
          <div className="flex justify-center animate-fade" style={{ animationDelay: '1s' }}>
            <Link to="/booking" className="group flex flex-col items-center">
              <span className="text-white text-[9px] font-accent tracking-[1em] mb-6">EXPLORE</span>
              <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent group-hover:h-32 transition-all duration-700"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Page 01: The Philosophy */}
      <section className="py-64 px-8 md:px-24 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
            <div className="lg:col-span-5">
              <span className="text-[#C5A059] text-[10px] font-accent mb-12 block">01 / CONCEPT</span>
              <h2 className="text-6xl md:text-8xl font-serif leading-none tracking-tighter mb-12">
                Curated <br /> <span className="italic">Simplicity.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 pt-12">
              <p className="text-2xl md:text-3xl font-light text-[#1A1A1A] leading-relaxed tracking-tight mb-16">
                Ruka Maldives is an architectural dialogue between the Indian Ocean and contemporary minimalism. A boutique sanctuary of twelve rooms on Dhiffushi Island.
              </p>
              <div className="w-16 h-[1px] bg-[#C5A059]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Page 02: Asymmetrical Lookbook */}
      <section className="pb-64 bg-white">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-64 lg:gap-x-12 relative">
            
            {/* Main Feature */}
            <div className="lg:col-span-7">
              <div className="aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                <img src={ROOMS[3].images[0]} className="w-full h-full object-cover" alt="Suite" />
              </div>
              <div className="mt-12">
                <h3 className="text-4xl font-serif mb-4">The Family Sanctuary</h3>
                <span className="text-[10px] font-accent text-gray-400">LUXURY REDEFINED</span>
              </div>
            </div>

            {/* Offset Floating Element */}
            <div className="lg:col-span-4 lg:col-start-9 lg:mt-64">
              <div className="aspect-[3/4] overflow-hidden shadow-2xl mb-12">
                <img src={ROOMS[0].images[0]} className="w-full h-full object-cover" alt="Standard" />
              </div>
              <div className="pl-12 border-l border-[#C5A059]">
                <p className="text-sm font-light leading-loose text-gray-500 mb-8">
                  Every sanctuary is designed with intention. A focus on texture, light, and the rhythmic sound of the waves.
                </p>
                <Link to="/rooms" className="text-[10px] font-accent text-[#C5A059] flex items-center hover:translate-x-2 transition-transform">
                  VIEW ALL ROOMS <ArrowRight size={14} className="ml-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-64 bg-[#1A1A1A] text-white text-center">
        <div className="container mx-auto px-8 max-w-4xl">
          <span className="text-[#C5A059] text-[10px] font-accent mb-12 block tracking-[1em]">RESERVATIONS</span>
          <h2 className="text-6xl md:text-8xl font-serif tracking-tighter mb-20">Your Chapter <br /> <span className="italic font-light opacity-30">Begins</span></h2>
          <Link 
            to="/booking" 
            className="inline-block px-16 py-6 bg-white text-[#1A1A1A] text-[10px] font-accent font-bold hover:bg-[#C5A059] hover:text-white transition-all duration-500"
          >
            BOOK YOUR STAY
          </Link>
        </div>
      </section>

      <footer className="py-12 bg-white text-center border-t border-black/[0.03]">
        <span className="text-[9px] font-accent text-gray-300">© 2025 RUKA MALDIVES — ALL RIGHTS RESERVED</span>
      </footer>
    </main>
  );
};

// --- Booking Component ---
const BookingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    roomType: 'standard_queen' as RoomType,
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    infants: 0,
    mealPlan: 'breakfast' as any,
    transferType: 'shared_speedboat' as any,
    excursions: [] as string[]
  });

  const calculation = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return null;
    return calculateBooking({
      roomType: formData.roomType,
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants,
      mealPlan: formData.mealPlan,
      transferType: formData.transferType,
      excursions: formData.excursions
    });
  }, [formData]);

  return (
    <div className="pt-48 pb-64 px-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-24">
          <div className="lg:w-7/12">
            <header className="mb-24">
              <span className="text-[#C5A059] text-[10px] font-accent mb-4 block">RESERVATION</span>
              <h1 className="text-7xl font-serif tracking-tighter">Stay <span className="italic">Details</span></h1>
            </header>

            <div className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent text-gray-400">THE ROOM</label>
                  <select 
                    className="bg-transparent border-b border-black/5 py-4 font-serif text-2xl focus:outline-none focus:border-[#C5A059] appearance-none"
                    value={formData.roomType}
                    onChange={(e) => setFormData({...formData, roomType: e.target.value as RoomType})}
                  >
                    {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent text-gray-400">GUESTS</label>
                  <div className="flex items-center space-x-12 py-4 border-b border-black/5">
                    <button onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})} className="text-2xl font-serif text-[#C5A059]">-</button>
                    <span className="text-2xl font-serif">{formData.adults} ADULTS</span>
                    <button onClick={() => setFormData({...formData, adults: Math.min(3, formData.adults + 1)})} className="text-2xl font-serif text-[#C5A059]">+</button>
                  </div>
                </div>
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent text-gray-400">ARRIVAL</label>
                  <input 
                    type="date" 
                    className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none focus:border-[#C5A059]"
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                </div>
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent text-gray-400">DEPARTURE</label>
                  <input 
                    type="date" 
                    className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none focus:border-[#C5A059]"
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                </div>
              </div>
              <button className="px-16 py-6 bg-[#1A1A1A] text-white text-[10px] font-accent hover:bg-[#C5A059] transition-all duration-700">
                SUBMIT REQUEST
              </button>
            </div>
          </div>

          <div className="lg:w-4/12">
            <div className="sticky top-48 bg-[#FCFAF8] p-12 border border-black/[0.03]">
              <h2 className="text-2xl font-serif mb-12 border-b border-black/5 pb-6">Your Stay</h2>
              {!calculation ? (
                <p className="text-gray-400 text-sm font-light italic">Select your dates to generate a summary.</p>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-accent text-gray-400">ROOM RATE ({calculation.nights} NIGHTS)</span>
                    <span className="font-serif text-xl">${calculation.totalRoomCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-accent text-gray-400">GREEN TAX</span>
                    <span className="font-serif text-xl">${calculation.greenTaxTotal.toFixed(0)}</span>
                  </div>
                  <div className="pt-8 border-t border-black/5">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-accent text-[#C5A059] mb-4">TOTAL ESTIMATE</span>
                      <span className="text-7xl font-serif leading-none">${calculation.grandTotal.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Orchestration ---
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
