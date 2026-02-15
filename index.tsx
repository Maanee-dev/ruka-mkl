
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Corrected imports for react-router-dom by using named imports to fix TypeScript resolution errors.
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import { 
  Menu, X, MapPin, Phone, Mail, 
  ChevronRight, Check, Star, 
  ArrowRight, Instagram, Facebook,
  ArrowUpRight, Globe
} from 'lucide-react';

import { ROOMS, COLORS } from './constants';
import { calculateBooking } from './utils/pricing';
import { RoomType } from './types';

// --- Global Scroll Restoration ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Shared Components ---

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'THE HOTEL', path: '/' },
    { name: 'SANCTUARIES', path: '/rooms' },
    { name: 'EXPERIENCES', path: '/experiences' },
    { name: 'OUR STORY', path: '/about' },
    { name: 'CONTACT', path: '/contact' }
  ];

  const isDark = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isDark ? 'bg-[#FCFAF8]/95 backdrop-blur-md py-5 border-b border-black/[0.03]' : 'bg-transparent py-14'}`}>
      <div className="container mx-auto px-10 md:px-20 flex justify-between items-center">
        <Link to="/" className="group">
          <div className="flex flex-col">
            <span className={`text-2xl font-serif font-light tracking-[0.4em] transition-colors duration-500 ${isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>
              RUKA
            </span>
            <span className="text-[6px] font-accent tracking-[1em] text-[#C5A059] mt-1 uppercase">Maldives</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-16">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-[9px] font-accent font-bold tracking-[0.6em] transition-all hover:text-[#C5A059] ${isDark ? 'text-[#1A1A1A]' : 'text-white/60'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/booking" 
            className={`px-12 py-4 text-[9px] font-accent font-bold tracking-[0.6em] transition-all duration-500 ${isDark ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' : 'border border-white/20 text-white hover:bg-white hover:text-[#1A1A1A]'}`}
          >
            BOOK
          </Link>
        </div>

        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} className={isDark ? 'text-[#1A1A1A]' : 'text-white'} />}
        </button>
      </div>

      {/* Magazine Slide Menu */}
      <div className={`lg:hidden fixed inset-0 bg-[#FCFAF8] z-50 transition-all duration-700 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-16 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-32">
              <span className="text-xl font-serif tracking-[0.3em]">RUKA</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={32} strokeWidth={1} /></button>
            </div>
            <div className="flex flex-col space-y-12">
              {navLinks.map((link, i) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="text-5xl font-serif font-light tracking-tighter flex justify-between items-center group overflow-hidden"
                >
                  <span className="transform transition-transform duration-700 hover:italic hover:translate-x-4">
                    {link.name}
                  </span>
                  <span className="text-xs text-[#C5A059] font-accent">0{i+1}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-12">
             <span className="text-[10px] font-accent tracking-widest text-gray-400">DHIFFUSHI, MALDIVES</span>
             <Instagram size={20} className="text-gray-300" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const Home: React.FC = () => {
  return (
    <main className="bg-[#FCFAF8] selection:bg-[#C5A059] selection:text-white">
      {/* Cover Page Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <img 
          src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 animate-[subtle-zoom_60s_linear_infinite]" 
          alt="Maldives Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-40"></div>
        
        <div className="relative z-20 text-center px-6 max-w-7xl">
          <div className="overflow-hidden mb-12">
             <span className="block text-white/50 text-[10px] font-accent font-bold tracking-[1.5em] uppercase animate-[reveal-up_1.2s_cubic-bezier(0.16,1,0.3,1)]">
               The Summer Issue
             </span>
          </div>
          <h1 className="text-[16vw] md:text-[11vw] text-white font-serif leading-[0.8] tracking-tighter mb-16 animate-[reveal-up_1.5s_cubic-bezier(0.16,1,0.3,1)]">
            Pure <br /> <span className="italic font-light text-white/40">Canvas</span>
          </h1>
          <div className="animate-[fade-in_2.5s_ease-out_0.5s_forwards] opacity-0 flex flex-col items-center">
             <Link to="/booking" className="group flex flex-col items-center space-y-6">
                <span className="text-white text-[10px] font-bold tracking-[0.8em] uppercase hover:text-[#C5A059] transition-colors">Begin Your Chapter</span>
                <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent group-hover:h-32 transition-all duration-700"></div>
             </Link>
          </div>
        </div>
      </section>

      {/* Page 01: The Vision */}
      <section className="py-64 px-10 md:px-32 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-24 items-start">
            <div className="md:col-span-4">
               <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[0.8em] uppercase block mb-12">01 — VISION</span>
               <h2 className="text-6xl font-serif font-light leading-[1.1] text-[#1A1A1A] mb-8">
                 A curated <br /> <span className="italic">silence.</span>
               </h2>
               <div className="w-12 h-[1px] bg-[#C5A059]"></div>
            </div>
            <div className="md:col-span-7 md:col-start-6">
               <p className="text-[#1A1A1A] font-light text-2xl md:text-3xl leading-[1.4] tracking-tight mb-16">
                 At Ruka, we define luxury by what is absent. No crowds, no digital clutter, only the rhythmic breath of the Indian Ocean and the soft sands of Dhiffushi.
               </p>
               <div className="grid grid-cols-2 gap-12 border-t border-black/5 pt-16">
                  <div>
                    <span className="text-[8px] font-accent font-bold tracking-[0.4em] text-gray-400 block mb-4 uppercase">Architecture</span>
                    <p className="text-sm font-light leading-relaxed">Minimalist geometry that honors the natural landscape.</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-accent font-bold tracking-[0.4em] text-gray-400 block mb-4 uppercase">Experience</span>
                    <p className="text-sm font-light leading-relaxed">Deeply personal service in a boutique 12-room sanctuary.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page 02: Lookbook spread */}
      <section className="pb-64 bg-white overflow-hidden">
        <div className="px-10 md:px-32 mb-40 text-center">
          <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[0.8em] uppercase block mb-6">02 — LOOKBOOK</span>
          <h2 className="text-4xl font-serif font-light italic">The Art of Repose</h2>
        </div>

        <div className="container mx-auto px-10">
          <div className="grid grid-cols-12 gap-y-64 md:gap-x-12 relative">
            {/* The Big Cover Image - Asymmetrical */}
            <div className="col-span-12 md:col-span-7 group">
              <div className="relative aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-[2s]">
                <img src={ROOMS[3].images[0]} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" alt="Suite" />
                <div className="absolute top-10 left-10 text-white mix-blend-difference">
                   <span className="text-6xl font-serif italic">01</span>
                </div>
              </div>
              <div className="mt-12 flex justify-between items-end max-w-2xl">
                <div>
                  <h3 className="text-4xl font-serif mb-4">{ROOMS[3].name}</h3>
                  <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">Refined Family Space</p>
                </div>
                <Link to="/rooms" className="text-[10px] font-bold tracking-[0.4em] uppercase border-b border-black/10 pb-2 hover:border-[#C5A059] transition-colors">Details</Link>
              </div>
            </div>

            {/* Floating Editorial Piece */}
            <div className="col-span-12 md:col-span-4 md:col-start-9 md:mt-48">
              <div className="relative aspect-[3/4] overflow-hidden mb-12 shadow-sm">
                <img src={ROOMS[0].images[0]} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]" alt="Room" />
              </div>
              <div className="pl-12 border-l border-[#C5A059]">
                 <h3 className="text-2xl font-serif mb-6 leading-tight">Essentials <br /> reimagined.</h3>
                 <p className="text-sm text-gray-400 font-light leading-relaxed mb-8">
                   Our Standard Queen rooms are a masterclass in functional minimalism. Every object serves a purpose, every shadow creates depth.
                 </p>
                 <span className="text-[9px] font-accent tracking-widest text-[#C5A059] uppercase">From $88 / Night</span>
              </div>
            </div>

            {/* Horizontal Break */}
            <div className="col-span-12 md:col-span-10 md:col-start-2 mt-40">
               <div className="relative aspect-[21/9] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000" 
                    className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-[2s]" 
                    alt="Interior"
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
               </div>
               <div className="mt-12 text-center max-w-xl mx-auto">
                  <blockquote className="text-3xl font-serif italic text-gray-400 leading-relaxed mb-8">
                    "Style is knowing who you are, what you want to say, and not giving a damn."
                  </blockquote>
                  <span className="text-[8px] font-accent tracking-[0.4em] uppercase text-gray-300">— The Ruka Philosophy</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page 03: Values */}
      <section className="py-48 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-10">
           <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-white/5 pb-16">
              <h2 className="text-7xl font-serif tracking-tighter mb-8 md:mb-0">Exceptional <br /> by <span className="italic font-light opacity-40">Default</span></h2>
              <div className="text-right">
                 <span className="text-[10px] font-accent tracking-[0.5em] text-[#C5A059] uppercase block mb-4">Dhiffushi, Maldives</span>
                 <p className="text-white/40 font-light text-xs tracking-widest uppercase">Kaafu Atoll | 04.28 N, 73.71 E</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-24">
              {[
                { val: '9.8', label: 'Guest Satisfaction', suffix: '/ 10' },
                { val: '12', label: 'Boutique Sanctuaries', suffix: '' },
                { val: '01', label: 'Hour from Male\'', suffix: '' },
                { val: '24', label: 'Concierge Care', suffix: '/ 7' }
              ].map((stat, i) => (
                <div key={i} className="group">
                  <div className="text-5xl md:text-7xl font-serif mb-6 group-hover:text-[#C5A059] transition-colors duration-500">
                    {stat.val}<span className="text-xl font-light opacity-30 ml-1">{stat.suffix}</span>
                  </div>
                  <span className="text-[8px] font-accent tracking-[0.4em] text-white/30 uppercase">{stat.label}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Editorial Contact / Subscription */}
      <section className="py-64 bg-[#FCFAF8]">
        <div className="container mx-auto px-10 max-w-4xl text-center">
          <span className="text-[#C5A059] text-[10px] font-accent tracking-[1em] uppercase mb-12 block">Final Thoughts</span>
          <h2 className="text-6xl md:text-[8vw] font-serif leading-[0.9] tracking-tighter mb-20 text-[#1A1A1A]">
            Reserved <br /> for the <br /> <span className="italic font-light">Inspired</span>
          </h2>
          <div className="flex flex-col items-center space-y-12">
            <Link to="/booking" className="px-20 py-6 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.6em] uppercase hover:bg-[#C5A059] transition-all duration-700 shadow-xl">
              Check Availability
            </Link>
            <div className="flex space-x-12 pt-20 border-t border-black/5 w-full justify-center">
               <a href="#" className="text-[9px] font-accent font-bold tracking-[0.3em] uppercase hover:text-[#C5A059]">Instagram</a>
               <a href="#" className="text-[9px] font-accent font-bold tracking-[0.3em] uppercase hover:text-[#C5A059]">Facebook</a>
               <a href="#" className="text-[9px] font-accent font-bold tracking-[0.3em] uppercase hover:text-[#C5A059]">Contact</a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
};

const Footer: React.FC = () => (
  <footer className="py-16 bg-white border-t border-black/[0.03] text-center">
    <div className="container mx-auto px-10">
       <div className="flex flex-col md:flex-row justify-between items-center opacity-30 text-[8px] font-accent tracking-[0.8em] uppercase space-y-6 md:space-y-0">
          <span>&copy; 2025 Ruka Maldives Boutique</span>
          <span>Designed with Intention</span>
          <span>Terms & Privacy</span>
       </div>
    </div>
  </footer>
);

// --- Booking Engine Page ---

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
    <div className="pt-48 pb-64 px-10 bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-32">
          {/* Reservation Column */}
          <div className="lg:w-7/12">
            <header className="mb-24">
              <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] uppercase mb-6 block">Reservation</span>
              <h1 className="text-7xl font-serif tracking-tighter leading-[0.8]">The Stay <br /> <span className="italic font-light">Inquiry</span></h1>
            </header>

            <div className="space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent font-bold tracking-[0.4em] text-gray-400 uppercase">Sanctuary</label>
                  <select 
                    className="bg-transparent border-b border-black/5 py-4 font-serif text-2xl focus:outline-none focus:border-[#C5A059] transition-all appearance-none cursor-pointer"
                    value={formData.roomType}
                    onChange={(e) => setFormData({...formData, roomType: e.target.value as RoomType})}
                  >
                    {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent font-bold tracking-[0.4em] text-gray-400 uppercase">Occupancy</label>
                  <div className="flex items-center space-x-12 py-4 border-b border-black/5">
                    <button onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})} className="text-2xl font-serif text-[#C5A059] hover:opacity-50 transition-opacity">-</button>
                    <span className="text-2xl font-serif">{formData.adults} Adults</span>
                    <button onClick={() => setFormData({...formData, adults: Math.min(3, formData.adults + 1)})} className="text-2xl font-serif text-[#C5A059] hover:opacity-50 transition-opacity">+</button>
                  </div>
                </div>
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent font-bold tracking-[0.4em] text-gray-400 uppercase">Arrival</label>
                  <input 
                    type="date" 
                    className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none focus:border-[#C5A059] cursor-pointer"
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                </div>
                <div className="flex flex-col space-y-4">
                  <label className="text-[9px] font-accent font-bold tracking-[0.4em] text-gray-400 uppercase">Departure</label>
                  <input 
                    type="date" 
                    className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none focus:border-[#C5A059] cursor-pointer"
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-16">
                 <button className="group flex items-center space-x-8 px-16 py-6 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.5em] uppercase hover:bg-[#C5A059] transition-all duration-700">
                   <span>Submit Reservation Request</span>
                   <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </button>
              </div>
            </div>
          </div>

          {/* Editorial Receipt Column */}
          <div className="lg:w-4/12">
            <div className="sticky top-48 bg-[#FCFAF8] border border-black/[0.03] p-16 shadow-sm">
              <header className="mb-16 border-b border-black/5 pb-8">
                 <h2 className="text-2xl font-serif font-light mb-2">Selected Stay</h2>
                 <p className="text-[8px] font-accent tracking-widest text-gray-400 uppercase">Editorial Summary</p>
              </header>
              
              {!calculation ? (
                <p className="text-gray-400 font-light text-sm italic leading-relaxed">
                  Please define your journey parameters on the left to generate an inquiry summary.
                </p>
              ) : (
                <div className="space-y-10">
                  <div className="flex justify-between items-end border-b border-black/[0.02] pb-4">
                    <span className="text-[9px] font-accent tracking-[0.2em] uppercase text-gray-400">Accomodation ({calculation.nights} Nights)</span>
                    <span className="font-serif text-lg text-[#1A1A1A]">${calculation.totalRoomCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-black/[0.02] pb-4">
                    <span className="text-[9px] font-accent tracking-[0.2em] uppercase text-gray-400">Green Tax (Gov.)</span>
                    <span className="font-serif text-lg text-[#1A1A1A]">${calculation.greenTaxTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-16">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold tracking-[0.6em] uppercase mb-4 text-[#C5A059]">Total Estimate</span>
                      <span className="text-7xl font-serif text-[#1A1A1A] leading-none tracking-tighter">${calculation.grandTotal.toFixed(0)}</span>
                      <span className="text-[8px] font-accent mt-4 text-gray-300">USD INCLUDING TAXES</span>
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
        {/* Simple redirects for other pages to Home for demo purposes */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
