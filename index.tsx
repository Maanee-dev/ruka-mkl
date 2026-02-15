
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Directly use named imports for react-router-dom components and hooks
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { 
  Menu, X, Instagram, Facebook, ArrowUpRight, ArrowRight, 
  Search, Users, Calendar as CalendarIcon, Utensils, Coffee, CreditCard, 
  MessageSquare, Send, CheckCircle2, ChevronDown, MapPin,
  Wind, Waves, Sunrise, ChevronLeft, ChevronRight, Monitor, Printer, Info,
  Maximize2, Star, ShieldCheck, Ship, Anchor
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ROOMS, EXCURSIONS } from './constants';
import { calculateBooking } from './utils/pricing';
import { RoomType, Room } from './types';

// --- Global UI Utilities ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Custom Minimalist Calendar ---

const CustomCalendar: React.FC<{
  selectedIn: string;
  selectedOut: string;
  onSelect: (dates: { checkIn: string; checkOut: string }) => void;
  className?: string;
}> = ({ selectedIn, selectedOut, onSelect, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selecting, setSelecting] = useState<'in' | 'out'>('in');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    if (selecting === 'in') {
      onSelect({ checkIn: dateStr, checkOut: selectedOut });
      setSelecting('out');
    } else {
      if (dateStr <= selectedIn) {
        onSelect({ checkIn: dateStr, checkOut: '' });
        setSelecting('out');
      } else {
        onSelect({ checkIn: selectedIn, checkOut: dateStr });
        setSelecting('in');
      }
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = Array.from({ length: daysInMonth(year, currentDate.getMonth()) }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth(year, currentDate.getMonth()) }, (_, i) => null);

  return (
    <div className={`bg-white p-6 shadow-2xl border border-black/5 animate-reveal ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="hover:text-[#C5A059] transition-colors"><ChevronLeft size={18} /></button>
        <span className="text-[10px] font-accent font-bold tracking-[0.4em] uppercase">{monthName} {year}</span>
        <button onClick={nextMonth} className="hover:text-[#C5A059] transition-colors"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <span key={d} className="text-[8px] font-accent text-gray-300 font-bold">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {padding.map((_, i) => <div key={`p-${i}`} />)}
        {days.map(d => {
          const date = new Date(year, currentDate.getMonth(), d).toISOString().split('T')[0];
          const isSelected = date === selectedIn || date === selectedOut;
          const isInRange = selectedIn && selectedOut && date > selectedIn && date < selectedOut;
          const isPast = new Date(year, currentDate.getMonth(), d) < new Date(new Date().setHours(0,0,0,0));

          return (
            <button
              key={d}
              disabled={isPast}
              onClick={() => handleDateClick(d)}
              className={`
                aspect-square flex items-center justify-center text-[10px] transition-all
                ${isSelected ? 'bg-[#1A1A1A] text-white' : ''}
                ${isInRange ? 'bg-[#C5A059]/10 text-[#C5A059]' : ''}
                ${isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}
              `}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex justify-between text-[8px] font-accent tracking-widest text-gray-400">
        <span className={selecting === 'in' ? 'text-[#C5A059] font-bold' : ''}>SELECT ARRIVAL</span>
        <span className={selecting === 'out' ? 'text-[#C5A059] font-bold' : ''}>SELECT DEPARTURE</span>
      </div>
    </div>
  );
};

// --- AI Concierge ---

const Bot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Maruhaba! I am your Ruka Concierge. How may I assist your island journey today?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = { role: 'user', text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Fix: Initialize GoogleGenAI with apiKey property in the config object
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chatContents = newMessages
        .filter((m, i) => !(i === 0 && m.role === 'bot'))
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: chatContents,
        config: {
          systemInstruction: 'You are Ruka Concierge, an elegant AI host for Ruka Maldives on Dhiffushi island. Tone: Minimalist, sophisticated, warm, editorial. Keep responses under 60 words.',
        }
      });
      // Fix: Access .text property directly from response
      setMessages(prev => [...prev, { role: 'bot', text: response.text || 'I apologize, my signal is as fleeting as a Maldivian breeze.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Our concierge is momentarily away. Contact hello@rukamaldives.com.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] md:bottom-8 md:right-8">
      {isOpen ? (
        <div className="bg-white w-[300px] h-[450px] md:w-[350px] md:h-[500px] shadow-2xl flex flex-col border border-black/5 animate-reveal origin-bottom-right">
          <div className="bg-[#1A1A1A] p-5 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white text-[9px] font-accent font-bold tracking-[0.3em]">CONCIERGE</span>
              <span className="text-white/40 text-[7px] font-accent uppercase tracking-widest">Est. 2025</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={16} className="text-white/60 hover:text-white" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FCFAF8] scrollbar-hide text-[11px] leading-relaxed">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 ${m.role === 'user' ? 'bg-[#C5A059] text-white shadow-lg' : 'bg-white border border-black/5 text-[#1A1A1A]'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[9px] text-gray-400 italic">Curating...</div>}
          </div>
          <div className="p-4 bg-white border-t border-black/5 flex space-x-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire..." 
              className="flex-1 text-[10px] bg-[#FCFAF8] px-4 py-2 focus:outline-none" 
            />
            <button onClick={handleSend} className="bg-[#1A1A1A] text-white px-3 hover:bg-[#C5A059] transition-colors"><Send size={12} /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-12 h-12 md:w-14 md:h-14 bg-[#1A1A1A] text-white flex items-center justify-center shadow-2xl hover:bg-[#C5A059] transition-all rounded-full border border-white/5">
          <MessageSquare size={18} />
        </button>
      )}
    </div>
  );
};

// --- Shared Components ---

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
    { name: 'DINING', path: '/dining' },
    { name: 'JOURNEYS', path: '/experiences' }
  ];

  const isDark = isScrolled || location.pathname !== '/' || isMenuOpen;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${isDark ? 'bg-[#FCFAF8]/95 backdrop-blur-md py-6 border-b border-black/[0.03]' : 'bg-transparent py-10'}`}>
      <div className="container mx-auto px-8 lg:px-16 flex justify-between items-center">
        <Link to="/" className="group flex flex-col">
          <span className={`text-xl lg:text-2xl font-serif font-light tracking-[0.4em] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>RUKA</span>
          <span className="text-[5px] lg:text-[6px] font-accent text-[#C5A059] mt-1 tracking-[1.2em] uppercase">Maldives</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-12">
          {links.map(link => (
            <Link key={link.path} to={link.path} className={`text-[8px] font-accent font-bold tracking-[0.4em] hover:text-[#C5A059] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white/70'}`}>
              {link.name}
            </Link>
          ))}
          <Link to="/booking" className={`px-8 py-3 text-[8px] font-accent font-bold tracking-[0.4em] transition-all ${isDark ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' : 'border border-white/20 text-white hover:bg-white hover:text-[#1A1A1A]'}`}>
            BOOK
          </Link>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
          {isMenuOpen ? <X size={20} className="text-[#1A1A1A]" /> : <Menu size={20} className={isDark ? 'text-[#1A1A1A]' : 'text-white'} />}
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 top-[80px] bg-[#FCFAF8] z-40 transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-10 space-y-10">
          {links.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-[#1A1A1A] hover:italic hover:pl-4 transition-all duration-300">
              {link.name}
            </Link>
          ))}
          <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="bg-[#1A1A1A] text-white py-5 text-center font-accent font-bold tracking-[0.4em]">
            BOOK NOW
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="py-24 md:py-48 bg-[#1A1A1A] text-white overflow-hidden">
    <div className="container mx-auto px-8 lg:px-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 md:gap-24 border-b border-white/[0.05] pb-24 md:pb-32">
        <div className="lg:col-span-5">
          <Link to="/" className="text-4xl font-serif tracking-[0.4em] mb-10 block">RUKA</Link>
          <p className="text-white/40 font-light max-w-sm leading-relaxed text-sm italic font-serif">
            "A sanctuary of twelve private narratives on Dhiffushi Island. Curated for the quiet seeker."
          </p>
          <div className="mt-16 flex space-x-12 items-center">
            <a href="#" className="text-white/20 hover:text-[#C5A059] transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-white/20 hover:text-[#C5A059] transition-colors"><Facebook size={20} /></a>
          </div>
        </div>
        <div className="lg:col-span-3 lg:col-start-7 space-y-8">
          <span className="text-[10px] font-accent font-bold tracking-[0.5em] text-[#C5A059] uppercase">Explore</span>
          <ul className="space-y-6 text-[10px] font-accent font-light text-white/40 tracking-[0.4em]">
            <li><Link to="/rooms" className="hover:text-white transition-colors">SANCTUARIES</Link></li>
            <li><Link to="/dining" className="hover:text-white transition-colors">EPICUREAN</Link></li>
            <li><Link to="/experiences" className="hover:text-white transition-colors">EXPERIENCES</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">CONNECT</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-3 space-y-8">
          <span className="text-[10px] font-accent font-bold tracking-[0.5em] text-[#C5A059] uppercase">Contact</span>
          <ul className="space-y-6 text-[10px] font-accent font-light text-white/40 tracking-[0.4em]">
            <li className="uppercase">Dhiffushi, Maldives</li>
            <li className="uppercase">Hello@rukamaldives.com</li>
            <li>+960 777 0000</li>
          </ul>
        </div>
      </div>
      <div className="pt-16 flex flex-col md:flex-row justify-between items-center text-[8px] font-accent text-white/10 tracking-[1em] uppercase font-bold space-y-8 md:space-y-0 text-center md:text-left">
        <span>&copy; 2025 RUKA MALDIVES ANTHOLOGY</span>
        <div className="flex space-x-12">
          <span>Privacy</span>
          <span>Legal</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const Home: React.FC = () => {
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-[#1A1A1A] overflow-visible">
        <img 
          src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-50" 
          alt="Ruka Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FCFAF8]/20"></div>
        <div className="relative z-10 text-center px-6 mb-24 md:mb-32">
          <span className="block text-white/40 text-[9px] font-accent tracking-[1.5em] mb-10 uppercase animate-fade">Dhiffushi — North Malé Atoll</span>
          <h1 className="text-[14vw] md:text-[10vw] text-white font-serif leading-[0.8] tracking-tighter mb-12 animate-reveal">
            Quiet <br /> <span className="italic font-light opacity-60">Luxury</span>
          </h1>
          <div className="w-[1px] h-20 md:h-32 bg-gradient-to-b from-white/20 to-transparent mx-auto hidden md:block"></div>
        </div>

        {/* Quick Search */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-6xl z-40 px-4">
          <div className="bg-white shadow-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 items-center border border-black/[0.03]">
            <div className="relative cursor-pointer" onClick={() => setShowCalendar(true)}>
              <span className="text-[8px] font-accent font-bold text-[#C5A059] tracking-widest block mb-2">DATES</span>
              <div className="flex items-center space-x-3">
                <CalendarIcon size={14} className="text-black/30" />
                <span className="text-xs font-serif uppercase tracking-tighter">
                  {dates.checkIn ? `${dates.checkIn} — ${dates.checkOut || '...'}` : 'SELECT STAY'}
                </span>
              </div>
              {showCalendar && (
                <div ref={calendarRef} className="absolute bottom-full left-0 mb-4 z-50 w-[300px]">
                  <CustomCalendar selectedIn={dates.checkIn} selectedOut={dates.checkOut} onSelect={setDates} />
                </div>
              )}
            </div>
            <div className="md:border-l border-black/5 md:pl-8">
              <span className="text-[8px] font-accent font-bold text-[#C5A059] tracking-widest block mb-2">TRAVELERS</span>
              <div className="flex items-center space-x-3">
                <Users size={14} className="text-black/30" />
                <select className="text-xs font-serif bg-transparent focus:outline-none w-full appearance-none">
                  <option>2 ADULTS</option>
                  <option>1 ADULT</option>
                  <option>3 ADULTS</option>
                </select>
              </div>
            </div>
            <div className="md:border-l border-black/5 md:pl-8">
              <span className="text-[8px] font-accent font-bold text-[#C5A059] tracking-widest block mb-2">CURRENCY</span>
              <div className="flex items-center space-x-3">
                <CreditCard size={14} className="text-black/30" />
                <select className="text-xs font-serif bg-transparent focus:outline-none w-full appearance-none">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>
            <Link to="/booking" className="bg-[#1A1A1A] text-white text-[9px] font-accent font-bold py-5 tracking-[0.5em] hover:bg-[#C5A059] transition-all text-center">
              INQUIRE
            </Link>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="pt-64 md:pt-96 pb-32 md:pb-64 px-8 md:px-24">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32 items-start">
            <div className="lg:col-span-5">
              <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[1em] mb-10 block uppercase">01 / CONCEPT</span>
              <h2 className="text-6xl md:text-8xl font-serif leading-[0.9] tracking-tighter mb-12">The Luxury of <br /> <span className="italic">Omission.</span></h2>
              <div className="w-20 h-[1px] bg-[#C5A059] opacity-30"></div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-2xl md:text-4xl font-serif italic text-gray-800 leading-relaxed mb-16 opacity-90">
                "We focus on the essentials. Raw textures, natural light, and the rhythm of the tide."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-black/[0.05]">
                <div className="space-y-4">
                  <span className="text-[9px] font-accent font-bold tracking-widest text-[#C5A059] block">SANCTUARIES</span>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">Twelve boutique guestrooms steps from Dhiffushi Beach, designed with minimalist island warmth.</p>
                </div>
                <div className="space-y-4">
                  <span className="text-[9px] font-accent font-bold tracking-widest text-[#C5A059] block">LOCATION</span>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">A 60-minute speedboat journey from Malé, nestled in a community of kite-surfers and reef seekers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sanctuaries Preview */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-8 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-black/[0.03] pb-12">
            <div>
              <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[1em] mb-4 block uppercase">02 / ARCHIVE</span>
              <h2 className="text-6xl font-serif tracking-tighter">Private <br /><span className="italic">Spaces.</span></h2>
            </div>
            <Link to="/rooms" className="text-[8px] font-accent font-bold tracking-[0.5em] border-b-2 border-[#C5A059] pb-2 uppercase hover:text-[#C5A059] transition-colors mt-12 md:mt-0">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {ROOMS.slice(0, 4).map((room, i) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className={`group ${i % 2 === 1 ? 'lg:mt-32' : ''}`}>
                <div className="aspect-[3/4] overflow-hidden mb-8 relative shadow-2xl transition-transform duration-700 group-hover:-translate-y-4">
                  <img src={room.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[3s] group-hover:scale-110" alt={room.name} />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-8 right-0 bg-[#1A1A1A] text-white py-4 px-8 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-700">
                    <span className="text-[8px] font-accent font-bold tracking-[0.3em]">STARTING ${room.basePrice}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-serif mb-2 tracking-tight group-hover:italic transition-all">{room.name}</h3>
                <p className="text-[8px] font-accent text-gray-400 tracking-widest uppercase">{room.size}m² — {room.bedConfig}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const RoomDetails: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const room = ROOMS.find(r => r.id === roomId);

  if (!room) return <div className="pt-64 text-center">Sanctuary not found.</div>;

  return (
    <main className="pt-40 md:pt-64 pb-32 md:pb-64 bg-[#FCFAF8]">
      <div className="container mx-auto px-8 lg:px-20">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-4 text-[9px] font-accent font-bold tracking-[0.4em] mb-16 uppercase opacity-50 hover:opacity-100 transition-all">
          <ChevronLeft size={16} /> <span>THE ARCHIVE</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32 items-start">
          <div className="lg:col-span-7">
            <div className="aspect-[4/5] md:aspect-[16/9] overflow-hidden shadow-2xl mb-12">
              <img src={room.images[0]} className="w-full h-full object-cover" alt={room.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-white shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573843225103-bc89955e8c11?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="aspect-square bg-white shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-48">
            <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[1em] mb-6 block uppercase">SANCTUARY TYPE</span>
            <h1 className="text-6xl md:text-7xl font-serif tracking-tighter mb-8">{room.name}</h1>
            <p className="text-lg text-gray-500 font-light leading-relaxed mb-12">{room.description}</p>
            
            <div className="space-y-10 border-t border-black/[0.05] pt-12 mb-12">
              <div className="grid grid-cols-2 gap-8 text-[10px] font-accent font-bold tracking-[0.3em] uppercase">
                <div className="flex items-center space-x-4"><Maximize2 size={16} className="text-[#C5A059]" /> <span>{room.size} SQM</span></div>
                <div className="flex items-center space-x-4"><Users size={16} className="text-[#C5A059]" /> <span>UP TO {room.maxAdults}</span></div>
                <div className="flex items-center space-x-4"><Anchor size={16} className="text-[#C5A059]" /> <span>FLOOR {room.floor}</span></div>
                <div className="flex items-center space-x-4"><Star size={16} className="text-[#C5A059]" /> <span>{room.bedConfig}</span></div>
              </div>
            </div>

            <div className="bg-white p-10 shadow-xl border border-black/5">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[8px] font-accent text-gray-400 block mb-2">STARTING FROM</span>
                  <span className="text-5xl font-serif tracking-tighter">${room.basePrice}</span>
                </div>
                <span className="text-[10px] font-accent text-gray-400 mb-1">PER NIGHT</span>
              </div>
              <Link to="/booking" className="w-full bg-[#1A1A1A] text-white py-6 text-center text-[10px] font-accent font-bold tracking-[0.5em] block hover:bg-[#C5A059] transition-all uppercase">
                Reserve sanctuary
              </Link>
            </div>
            
            <div className="mt-12 space-y-4">
              <div className="flex items-center space-x-4 text-[9px] font-accent tracking-widest text-gray-400 uppercase">
                <ShieldCheck size={14} className="text-[#C5A059]" /> <span>GOVT. TAX INCLUDED AT CHECKOUT</span>
              </div>
              <div className="flex items-center space-x-4 text-[9px] font-accent tracking-widest text-gray-400 uppercase">
                <Ship size={14} className="text-[#C5A059]" /> <span>60-MIN SPEEDBOAT TRANSFER AVAIL.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const Booking: React.FC = () => {
  const [step, setStep] = useState(1);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [formData, setFormData] = useState({
    roomType: 'standard_queen' as RoomType,
    adults: 2,
    children: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    transfer: 'shared_speedboat'
  });

  const calculation = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return null;
    return calculateBooking({
      roomType: formData.roomType,
      checkIn: new Date(dates.checkIn),
      checkOut: new Date(dates.checkOut),
      adults: formData.adults,
      children: formData.children,
      infants: 0,
      mealPlan: 'breakfast',
      transferType: formData.transfer,
      excursions: []
    });
  }, [formData, dates]);

  return (
    <main className="pt-40 md:pt-64 pb-32 md:pb-64 bg-[#FCFAF8] min-h-screen px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-24 text-center">
          <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-6 block uppercase">RESERVATION</span>
          <h1 className="text-7xl md:text-8xl font-serif tracking-tighter leading-[0.8] mb-12">Secure <br /><span className="italic">Identity.</span></h1>
          
          <div className="flex justify-between items-center max-w-lg mx-auto border-y border-black/[0.05] py-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center space-y-3">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-700 ${step >= i ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-lg' : 'border-black/5 text-gray-300'}`}>
                  {step > i ? <CheckCircle2 size={16} /> : i}
                </div>
                <span className={`text-[8px] font-accent font-bold tracking-[0.4em] ${step >= i ? 'text-[#1A1A1A]' : 'text-gray-300'} uppercase`}>
                  {i === 1 ? 'Stay' : i === 2 ? 'Details' : 'Done'}
                </span>
              </div>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32">
          <div className="lg:col-span-7 bg-white p-8 md:p-16 shadow-2xl border border-black/[0.02]">
            {step === 1 && (
              <div className="animate-reveal space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex flex-col space-y-6">
                    <label className="text-[10px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Sanctuary</label>
                    <select 
                      className="bg-transparent border-b border-black/10 py-4 font-serif text-2xl focus:outline-none focus:border-[#C5A059] appearance-none"
                      value={formData.roomType}
                      onChange={e => setFormData({...formData, roomType: e.target.value as RoomType})}
                    >
                      {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-6">
                    <label className="text-[10px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Occupants</label>
                    <div className="flex items-center justify-between border-b border-black/10 py-4">
                      <button onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})} className="text-2xl font-serif text-[#C5A059]">—</button>
                      <span className="text-2xl font-serif">{formData.adults}</span>
                      <button onClick={() => setFormData({...formData, adults: Math.min(3, formData.adults + 1)})} className="text-2xl font-serif text-[#C5A059]">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-6">
                  <label className="text-[10px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Dates of Stay</label>
                  <CustomCalendar selectedIn={dates.checkIn} selectedOut={dates.checkOut} onSelect={setDates} />
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!dates.checkIn || !dates.checkOut}
                  className="w-full bg-[#1A1A1A] text-white py-7 text-[10px] font-accent font-bold tracking-[0.5em] hover:bg-[#C5A059] transition-all disabled:opacity-10 shadow-2xl uppercase"
                >
                  NEXT STEP
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-reveal space-y-12">
                <div className="grid grid-cols-2 gap-8">
                  <input placeholder="FIRST NAME" className="bg-transparent border-b border-black/10 py-6 font-serif text-2xl focus:outline-none focus:border-[#C5A059] uppercase" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  <input placeholder="LAST NAME" className="bg-transparent border-b border-black/10 py-6 font-serif text-2xl focus:outline-none focus:border-[#C5A059] uppercase" onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <input placeholder="EMAIL ADDRESS" className="bg-transparent border-b border-black/10 py-6 font-serif text-2xl focus:outline-none focus:border-[#C5A059] uppercase w-full" onChange={e => setFormData({...formData, email: e.target.value})} />
                <input placeholder="MOBILE / WHATSAPP" className="bg-transparent border-b border-black/10 py-6 font-serif text-2xl focus:outline-none focus:border-[#C5A059] uppercase w-full" onChange={e => setFormData({...formData, phone: e.target.value})} />
                
                <div className="flex space-x-6 pt-12">
                  <button onClick={() => setStep(1)} className="flex-1 border border-black/10 text-[9px] font-accent font-bold tracking-[0.4em] py-6 uppercase hover:bg-black hover:text-white transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-[#1A1A1A] text-white text-[9px] font-accent font-bold tracking-[0.4em] py-6 uppercase hover:bg-[#C5A059] transition-all shadow-xl">Review</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-reveal space-y-16">
                <div className="p-10 border border-[#C5A059]/10 bg-[#FCFAF8] shadow-sm italic font-serif text-xl opacity-70">
                  "Confirming these details records your intent for a sanctuary reservation. Our hosts will reach out within 12 hours for verification."
                </div>
                <div className="flex space-x-6">
                  <button onClick={() => setStep(2)} className="flex-1 border border-black/10 text-[9px] font-accent font-bold tracking-[0.4em] py-6 uppercase hover:bg-black hover:text-white transition-all">Details</button>
                  <button onClick={() => alert('RESERVATION REQUEST SENT')} className="flex-1 bg-[#C5A059] text-white text-[10px] font-accent font-bold py-7 tracking-[0.5em] hover:bg-[#1A1A1A] transition-all shadow-2xl uppercase">Complete Request</button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-48 bg-[#1A1A1A] p-10 md:p-14 text-white shadow-3xl">
              <h3 className="text-3xl font-serif mb-12 border-b border-white/10 pb-6 italic opacity-50">Stay Anthology</h3>
              {calculation ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-4">
                    <span className="text-[9px] font-accent text-white/30 tracking-[0.4em] uppercase">Sanctuary</span>
                    <span className="font-serif text-xl">{ROOMS.find(r => r.type === formData.roomType)?.name}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-4">
                    <span className="text-[9px] font-accent text-white/30 tracking-[0.4em] uppercase">Chronology</span>
                    <span className="font-serif text-xl">{calculation.nights} Island Nights</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-4">
                    <span className="text-[9px] font-accent text-white/30 tracking-[0.4em] uppercase">Levies (Green Tax)</span>
                    <span className="font-serif text-xl">${calculation.greenTaxTotal}</span>
                  </div>
                  <div className="pt-16 flex flex-col items-end">
                    <span className="text-[10px] font-accent text-[#C5A059] tracking-[0.8em] mb-6 uppercase font-bold">Grand Estimate</span>
                    <span className="text-7xl md:text-8xl font-serif leading-none tracking-tighter">${calculation.grandTotal.toFixed(0)}</span>
                    <span className="text-[8px] font-accent text-white/20 mt-8 tracking-[0.5em] uppercase italic">Incl. all island taxes</span>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center opacity-20">
                  <p className="text-xs italic tracking-[0.5em] uppercase">Define parameters <br /> to see anthology.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
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
        <Route path="/rooms" element={<main className="pt-64 px-10"><h2 className="text-6xl font-serif mb-16">All Sanctuaries</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-64">{ROOMS.map(r => <Link key={r.id} to={`/rooms/${r.id}`} className="group"><div className="aspect-[3/4] overflow-hidden mb-6"><img src={r.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" /></div><h3 className="text-2xl font-serif mb-2">{r.name}</h3><span className="text-[8px] font-accent text-gray-400 tracking-widest uppercase">${r.basePrice} / NIGHT</span></Link>)}</div></main>} />
        <Route path="/rooms/:roomId" element={<RoomDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <Bot />
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
