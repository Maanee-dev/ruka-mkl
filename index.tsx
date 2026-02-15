
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Use named imports for react-router-dom as named exports are required for proper type recognition in this environment.
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useParams,
  useNavigate
} from 'react-router-dom';

const Router = BrowserRouter;

import { 
  Menu, X, Calendar, Users, MapPin, Phone, Mail, 
  Waves, Sunrise, Camera, Coffee, ChevronRight, 
  ShieldCheck, CreditCard, ChevronDown, Check, 
  TrendingUp, Package, MessageSquare, Settings, LogOut,
  Star, Clock, Trash2, Edit3, BedDouble, Search, Award
} from 'lucide-react';

import { ROOMS, EXCURSIONS, COLORS, GREEN_TAX_PER_NIGHT } from './constants';
import { calculateBooking } from './utils/pricing';
import { RoomType, Room, Booking } from './types';

// --- Shared Components ---

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'ROOMS', path: '/rooms' },
    { name: 'PAGES', path: '/pages' },
    { name: 'BLOG', path: '/blog' },
    { name: 'CONTACT', path: '/contact' }
  ];

  const isDark = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isDark ? 'bg-white shadow-md py-4' : 'bg-transparent py-8'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className={`text-2xl font-serif font-bold tracking-widest ${isDark ? 'text-[#1C1C1C]' : 'text-white'}`}>
            RUKA <span className="text-[#C5A059]">MALDIVES</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-[10px] font-accent font-bold tracking-[0.3em] transition-colors hover:text-[#C5A059] ${isDark ? 'text-[#1C1C1C]' : 'text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/booking" 
            className={`px-8 py-3 text-[10px] font-accent font-bold tracking-[0.3em] transition-all border ${isDark ? 'border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white' : 'border-white text-white hover:bg-white hover:text-[#1C1C1C]'}`}
          >
            BOOKING ONLINE
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} className={isDark ? 'text-[#1C1C1C]' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="p-10 flex flex-col space-y-6 shadow-2xl">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-[#1C1C1C] text-sm font-bold tracking-widest border-b border-gray-100 pb-2">
              {link.name}
            </Link>
          ))}
          <Link 
            to="/booking" 
            onClick={() => setIsMenuOpen(false)}
            className="w-full py-4 text-center text-white font-bold tracking-widest" 
            style={{ backgroundColor: COLORS.gold }}
          >
            BOOK NOW
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="pt-24 pb-12 px-6 text-white" style={{ backgroundColor: COLORS.deepDark }}>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1">
          <h3 className="text-2xl font-serif font-bold tracking-widest mb-8">RUKA <span className="text-[#C5A059]">MALDIVES</span></h3>
          <p className="text-gray-400 mb-8 leading-relaxed font-light">
            Experience the finest boutique hospitality on Dhiffushi Island. We blend local charm with luxury comfort to create unforgettable memories.
          </p>
          <div className="flex space-x-4">
            {[MessageSquare, Camera, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 hover:bg-[#C5A059] hover:border-transparent transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-accent font-bold tracking-[0.3em] mb-10 text-white uppercase">Menu</h4>
          <ul className="space-y-4 text-gray-400 text-xs tracking-widest">
            {['Home', 'Rooms', 'Dining', 'Spa', 'Contact'].map(item => (
              <li key={item}><a href="#" className="hover:text-[#C5A059] transition-colors uppercase">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-accent font-bold tracking-[0.3em] mb-10 text-white uppercase">Contact info</h4>
          <ul className="space-y-6 text-gray-400 text-xs">
            <li className="flex items-start space-x-4">
              <MapPin className="text-[#C5A059] mt-1 shrink-0" size={18} />
              <span className="leading-relaxed">Dhiffushi Island, Kaafu Atoll,<br />North Male', Maldives</span>
            </li>
            <li className="flex items-center space-x-4">
              <Phone className="text-[#C5A059] shrink-0" size={18} />
              <span>+960 777 0000</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-accent font-bold tracking-[0.3em] mb-10 text-white uppercase">Newsletter</h4>
          <p className="text-gray-400 mb-6 text-xs font-light">Subscribe to get the latest news and luxury offers.</p>
          <div className="flex">
            <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 px-5 py-3 w-full text-xs focus:outline-none focus:border-[#C5A059]" />
            <button className="bg-[#C5A059] px-6 py-3 transition-all hover:bg-[#B28E47]">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-24 pt-8 border-t border-white/10 text-center text-gray-500 text-[10px] tracking-[0.3em] uppercase">
        &copy; 2025 Ruka Maldives Boutique Guest House. All rights reserved.
      </div>
    </footer>
  );
};

// --- Page Components ---

const Home: React.FC = () => {
  return (
    <main className="bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[850px] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Luxury Resort Interior" 
        />
        <div className="relative z-20 max-w-5xl">
          <div className="flex items-center justify-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-[#C5A059] text-[#C5A059]" />)}
          </div>
          <span className="text-white text-[10px] font-accent font-bold tracking-[0.6em] mb-4 block uppercase">LUXURY HOTEL AND RESORT</span>
          <h1 className="text-5xl md:text-[84px] text-white font-serif mb-10 leading-[1] tracking-tight">
            THE BEST LUXURY HOTEL<br />IN <span className="italic text-[#C5A059]">DHIFFUSHI</span>
          </h1>
          <Link 
            to="/rooms" 
            className="inline-block px-12 py-5 bg-[#C5A059] text-white font-accent font-bold text-[10px] tracking-[0.4em] transition-all hover:bg-[#B28E47] shadow-2xl uppercase"
          >
            The Rooms
          </Link>
        </div>

        {/* Booking Bar */}
        <div className="absolute bottom-0 left-0 w-full z-40 transform translate-y-1/2">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="bg-[#1C1C1C] shadow-2xl flex flex-col md:flex-row items-stretch border-b border-[#C5A059]/30">
              <div className="flex-1 border-r border-white/10 p-8 group cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mb-3 block uppercase">Check In</span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-serif text-lg">09/08/2022</span>
                  <Calendar size={18} className="text-[#C5A059]" />
                </div>
              </div>
              <div className="flex-1 border-r border-white/10 p-8 group cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mb-3 block uppercase">Check Out</span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-serif text-lg">09/08/2022</span>
                  <Calendar size={18} className="text-[#C5A059]" />
                </div>
              </div>
              <div className="flex-1 border-r border-white/10 p-8 group cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mb-3 block uppercase">Rooms</span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-serif text-lg">01 Rooms</span>
                  <ChevronDown size={18} className="text-[#C5A059]" />
                </div>
              </div>
              <div className="flex-1 border-r border-white/10 p-8 group cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mb-3 block uppercase">Guests</span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-serif text-lg">01 Adult, 0 Child</span>
                  <ChevronDown size={18} className="text-[#C5A059]" />
                </div>
              </div>
              <div className="flex items-center justify-center p-8 bg-[#C5A059] hover:bg-[#B28E47] transition-all cursor-pointer">
                <span className="text-[10px] text-white font-accent font-bold tracking-[0.3em] uppercase">Book Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms & Suites Section */}
      <section className="py-48 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 uppercase tracking-tight">
              RUKA'S ROOMS & SUITES
            </h2>
            <div className="w-20 h-[1px] bg-[#C5A059] mx-auto mb-6"></div>
            <p className="text-gray-500 font-light text-sm leading-relaxed tracking-wide">
              Proactively morph optimal infomediaries rather than inclusive expertise. 
              Seamlessly foster cross-platform services rather than resource-leveling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {ROOMS.slice(0, 3).map((room, i) => (
              <div key={room.id} className="group cursor-pointer">
                <div className="relative overflow-hidden aspect-[4/5] mb-8 shadow-lg">
                  <img src={room.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={room.name} />
                  <div className="absolute top-6 left-6 bg-[#C5A059] text-white text-[10px] font-accent font-bold px-4 py-2 tracking-widest uppercase">
                    ${room.basePrice} / NIGHT
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[0.4em] mb-3 block uppercase">Luxury Rooms</span>
                  <h3 className="text-2xl font-serif mb-4 hover:text-[#C5A059] transition-colors">{room.name}</h3>
                  <div className="flex items-center justify-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-[#C5A059] text-[#C5A059]" />)}
                  </div>
                  <div className="flex items-center justify-center space-x-4 border-t border-gray-100 pt-6">
                    <span className="flex items-center text-[10px] text-gray-400 tracking-widest uppercase">
                      <BedDouble size={14} className="mr-2 text-[#C5A059]" /> {room.bedConfig}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 flex justify-center">
             <div className="flex items-center space-x-3">
               <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Luxury Best Hotel Intro Section */}
      <section className="py-32 px-6 bg-[#FAF9F6] overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 relative">
              <div className="relative z-10 aspect-[3/4] max-w-md mx-auto shadow-2xl border-l-[15px] border-b-[15px] border-[#C5A059]">
                <img 
                  src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover" 
                  alt="Hotel interior" 
                />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C5A059] rounded-full border-[10px] border-white flex items-center justify-center">
                  <Award size={40} className="text-white" />
                </div>
              </div>
              {/* Gold outline decorative box */}
              <div className="absolute -bottom-10 -left-10 w-full h-full border border-[#C5A059]/30 -z-10"></div>
            </div>

            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[0.4em] uppercase block">Luxury Hotel and Resort</span>
                <h2 className="text-4xl md:text-5xl font-serif leading-tight uppercase">
                  LUXURY BEST HOTEL IN CITY<br />DHIFFUSHI, MALDIVES
                </h2>
                <div className="w-20 h-[1px] bg-[#C5A059]"></div>
              </div>
              
              <p className="text-gray-500 font-light text-sm leading-relaxed tracking-wide max-w-xl">
                Significantly transition cost effective platforms without vertical metrics model. Appropriately create interactive infrastructure after maintainable and distance facilitate standout outcomes. Compellingly restore powder spare through community.
              </p>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2 border-l border-gray-200 pl-6">
                  <h4 className="text-4xl font-serif text-[#C5A059]">12+</h4>
                  <span className="text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 uppercase">Luxury Rooms</span>
                </div>
                <div className="space-y-2 border-l border-gray-200 pl-6">
                  <h4 className="text-4xl font-serif text-[#C5A059]">4.9</h4>
                  <span className="text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 uppercase">Customer Ratings</span>
                </div>
              </div>

              <button className="px-12 py-5 bg-[#C5A059] text-white font-accent font-bold text-[10px] tracking-[0.4em] transition-all hover:bg-[#B28E47] uppercase">
                Read More
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// --- Booking Components ---

const BookingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    roomType: 'standard_queen' as RoomType,
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    infants: 0,
    mealPlan: 'breakfast' as any,
    transferType: 'shared_speedboat' as any,
    excursions: [] as string[],
    promoCode: '',
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
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

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="pt-48 pb-32 px-6 min-h-screen bg-[#FAF9F6]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[0.4em] uppercase block mb-4">Reservation</span>
          <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-tight">Book Your Stay</h1>
          <div className="w-20 h-[1px] bg-[#C5A059] mx-auto mt-6"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center w-full max-w-md">
            {[1, 2, 3].map(i => (
              <React.Fragment key={i}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all border ${step >= i ? 'bg-[#C5A059] border-[#C5A059] text-white shadow-xl' : 'bg-white border-gray-200 text-gray-400'}`}>
                  {i}
                </div>
                {i < 3 && <div className={`flex-1 h-[1px] mx-2 transition-all ${step > i ? 'bg-[#C5A059]' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="bg-white p-10 shadow-2xl border-t-4 border-[#C5A059]">
              {step === 1 && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <h2 className="text-xl font-serif uppercase tracking-wider">Select Room & Dates</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 mb-3 uppercase">Room Type</label>
                      <select 
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-[#C5A059] outline-none font-light"
                        value={formData.roomType}
                        onChange={(e) => setFormData({...formData, roomType: e.target.value as RoomType})}
                      >
                        {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 mb-3 uppercase">Adults</label>
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                        <button onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})} className="text-[#C5A059] font-bold">-</button>
                        <span className="font-serif">{formData.adults}</span>
                        <button onClick={() => setFormData({...formData, adults: Math.min(3, formData.adults + 1)})} className="text-[#C5A059] font-bold">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 mb-3 uppercase">Check-In</label>
                      <input 
                        type="date" 
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-[#C5A059] outline-none font-light"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 mb-3 uppercase">Check-Out</label>
                      <input 
                        type="date" 
                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-[#C5A059] outline-none font-light"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.checkIn || !formData.checkOut}
                    className="w-full py-5 bg-[#C5A059] text-white font-accent font-bold text-[10px] tracking-[0.4em] shadow-lg transition-all hover:bg-[#B28E47] disabled:opacity-50 uppercase"
                  >
                    Select Add-ons
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-10 animate-in slide-in-from-right duration-500">
                  <h2 className="text-xl font-serif uppercase tracking-wider">Personalize Your Stay</h2>
                  <div>
                    <h3 className="text-[10px] font-accent font-bold tracking-[0.2em] text-gray-400 mb-4 uppercase">Meal Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['breakfast', 'half_board', 'full_board'].map(mp => (
                        <div 
                          key={mp}
                          onClick={() => setFormData({...formData, mealPlan: mp as any})}
                          className={`p-5 border transition-all cursor-pointer ${formData.mealPlan === mp ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="capitalize font-serif">{mp.replace('_', ' ')}</span>
                            {formData.mealPlan === mp && <Check size={16} className="text-[#C5A059]" />}
                          </div>
                          <p className="text-[9px] text-gray-400 tracking-widest uppercase">
                            {mp === 'breakfast' ? 'Included' : mp === 'half_board' ? '+$25/PP' : '+$45/PP'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-10 border-t border-gray-100">
                    <button onClick={prevStep} className="flex-1 py-4 border border-gray-200 text-[10px] font-accent font-bold tracking-[0.3em] uppercase">Back</button>
                    <button onClick={nextStep} className="flex-[2] py-4 bg-[#C5A059] text-white text-[10px] font-accent font-bold tracking-[0.3em] uppercase">Guest Details</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-10 animate-in slide-in-from-right duration-500">
                  <h2 className="text-xl font-serif uppercase tracking-wider">Guest Information</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <input 
                      placeholder="First Name"
                      className="p-4 bg-gray-50 border border-gray-100 focus:border-[#C5A059] outline-none font-light"
                      onChange={(e) => setFormData({...formData, customer: {...formData.customer, firstName: e.target.value}})}
                    />
                    <input 
                      placeholder="Last Name"
                      className="p-4 bg-gray-50 border border-gray-100 focus:border-[#C5A059] outline-none font-light"
                      onChange={(e) => setFormData({...formData, customer: {...formData.customer, lastName: e.target.value}})}
                    />
                    <input 
                      placeholder="Email Address"
                      className="col-span-2 p-4 bg-gray-50 border border-gray-100 focus:border-[#C5A059] outline-none font-light"
                      onChange={(e) => setFormData({...formData, customer: {...formData.customer, email: e.target.value}})}
                    />
                  </div>
                  <button 
                    onClick={() => alert("Booking Sent!")} 
                    className="w-full py-5 bg-[#C5A059] text-white text-[10px] font-accent font-bold tracking-[0.4em] uppercase"
                  >
                    Confirm & Book Now
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-[#1C1C1C] p-10 shadow-2xl sticky top-32 text-white">
              <h2 className="text-xl font-serif mb-10 border-b border-white/10 pb-6 uppercase tracking-widest">Summary</h2>
              {!calculation ? (
                <div className="text-center py-10 opacity-30">
                  <Calendar className="mx-auto mb-4" size={40} />
                  <p className="text-[10px] font-accent tracking-widest uppercase">Select dates</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between text-[10px] tracking-widest uppercase">
                    <span className="text-gray-400">Stay ({calculation.nights} nights)</span>
                    <span className="font-serif text-sm">${calculation.totalRoomCost.toFixed(2)}</span>
                  </div>
                  {calculation.totalMealCost > 0 && (
                    <div className="flex justify-between text-[10px] tracking-widest uppercase">
                      <span className="text-gray-400">Meal Plan</span>
                      <span className="font-serif text-sm">${calculation.totalMealCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] tracking-widest uppercase">
                    <span className="text-gray-400">Green Tax</span>
                    <span className="font-serif text-sm">${calculation.greenTaxTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-10 border-t border-white/10 mt-10">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-accent font-bold tracking-[0.3em] uppercase">Total</span>
                      <span className="text-4xl font-serif text-[#C5A059] leading-none">${calculation.grandTotal.toFixed(2)}</span>
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

// --- App Root ---

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<div className="pt-32"><Home /></div>} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </Router>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
