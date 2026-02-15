
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Use wildcard import for react-router-dom to handle environments where named exports are not detected correctly
import * as ReactRouterDOM from 'react-router-dom';
const { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } = ReactRouterDOM;

import { 
  Menu, X, Instagram, Facebook, ArrowUpRight, ArrowRight, 
  Users, Calendar as CalendarIcon, Utensils, Coffee, CreditCard, 
  MessageSquare, Send, CheckCircle2, ChevronDown, MapPin,
  Wind, Waves, Sunrise, ChevronLeft, ChevronRight,
  Maximize2, Star, ShieldCheck, Ship, Anchor, Leaf, 
  ShieldAlert, Landmark, Sparkles, Monitor
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ROOMS, EXCURSIONS } from './constants';
import { calculateBooking } from './utils/pricing';
import { RoomType } from './types';

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
    <div className={`bg-white p-4 md:p-8 shadow-2xl border border-black/5 animate-reveal ${className}`}>
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
              type="button"
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
          systemInstruction: 'You are Ruka Concierge, an elegant AI host for Ruka Maldives on Dhiffushi island. Provide details on sanctuaries, local life, and sustainability. Tone: Minimalist, sophisticated, editorial. Keep responses under 50 words.',
        }
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || 'My apologies, the ocean signal is drifting.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Concierge is currently on island leave. Contact hello@rukamaldives.com.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] md:bottom-10 md:right-10">
      {isOpen ? (
        <div className="bg-white w-[300px] h-[450px] md:w-[380px] md:h-[550px] shadow-2xl flex flex-col border border-black/5 animate-reveal origin-bottom-right rounded-sm overflow-hidden">
          <div className="bg-[#1A1A1A] p-6 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white text-[10px] font-accent font-bold tracking-[0.3em]">RUKA CONCIERGE</span>
              <span className="text-white/40 text-[7px] font-accent uppercase tracking-[0.5em] mt-1">Direct from Dhiffushi</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={18} className="text-white/60 hover:text-white transition-colors" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FCFAF8] scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 text-[11px] leading-relaxed ${m.role === 'user' ? 'bg-[#C5A059] text-white' : 'bg-white border border-black/5 text-[#1A1A1A]'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[9px] text-gray-300 font-accent animate-pulse tracking-widest">TRANSMITTING...</div>}
          </div>
          <div className="p-4 bg-white border-t border-black/5 flex space-x-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire about Ruka..." 
              className="flex-1 text-[11px] bg-[#FCFAF8] px-5 py-3 focus:outline-none font-light" 
            />
            <button onClick={handleSend} className="bg-[#1A1A1A] text-white px-5 hover:bg-[#C5A059] transition-colors"><Send size={14} /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 md:w-16 md:h-16 bg-[#1A1A1A] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-[#C5A059] transition-all rounded-full border border-white/5 group">
          <MessageSquare size={22} className="group-hover:scale-110 transition-transform" />
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
    { name: 'THE HOTEL', path: '/' },
    { name: 'SANCTUARIES', path: '/rooms' },
    { name: 'DINING', path: '/dining' },
    { name: 'JOURNEYS', path: '/experiences' }
  ];

  const isDark = isScrolled || location.pathname !== '/' || isMenuOpen;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isDark ? 'bg-[#FCFAF8]/95 backdrop-blur-xl py-6 border-b border-black/[0.03]' : 'bg-transparent py-12'}`}>
      <div className="container mx-auto px-8 md:px-16 flex justify-between items-center">
        <Link to="/" className="group flex flex-col">
          <span className={`text-2xl lg:text-3xl font-serif font-light tracking-[0.4em] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>RUKA</span>
          <span className="text-[6px] lg:text-[7px] font-accent text-[#C5A059] mt-1 tracking-[1.4em] uppercase font-bold">Maldives</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-14">
          {links.map(link => (
            <Link key={link.path} to={link.path} className={`text-[9px] font-accent font-bold tracking-[0.4em] hover:text-[#C5A059] transition-all ${isDark ? 'text-[#1A1A1A]' : 'text-white/60'}`}>
              {link.name}
            </Link>
          ))}
          <Link to="/booking" className={`px-10 py-3 text-[9px] font-accent font-bold tracking-[0.5em] transition-all ${isDark ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' : 'border border-white/20 text-white hover:bg-white hover:text-[#1A1A1A]'}`}>
            BOOK
          </Link>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2">
          {isMenuOpen ? <X size={24} className="text-[#1A1A1A]" /> : <Menu size={24} className={isDark ? 'text-[#1A1A1A]' : 'text-white'} />}
        </button>
      </div>
      
      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 top-0 h-screen bg-[#FCFAF8] z-40 transition-transform duration-700 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex flex-col h-full pt-32 px-12 space-y-12">
          {links.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-4xl font-serif text-[#1A1A1A] tracking-tighter hover:italic transition-all">
              {link.name}
            </Link>
          ))}
          <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="bg-[#1A1A1A] text-white py-6 text-center font-accent font-bold tracking-[0.4em] text-xs">
            START RESERVATION
          </Link>
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

const Home: React.FC = () => {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center bg-[#1A1A1A] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105" 
          alt="Ruka Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#FCFAF8]/20"></div>
        <div className="relative z-10 text-center px-6">
          <span className="block text-white/30 text-[10px] font-accent tracking-[2em] mb-12 uppercase animate-fade">Kaafu Atoll — Dhiffushi</span>
          <h1 className="text-[16vw] lg:text-[11vw] text-white font-serif leading-[0.75] tracking-tighter mb-16 animate-reveal">
            Quiet <br /> <span className="italic font-light opacity-50">Luxury</span>
          </h1>
          <div className="animate-fade" style={{ animationDelay: '1s' }}>
            <Link to="/rooms" className="text-white text-[9px] font-accent font-bold border-b border-white/20 pb-2 hover:border-[#C5A059] transition-colors tracking-[0.5em]">DISCOVER THE ARCHIVE</Link>
          </div>
        </div>
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown size={24} className="text-white" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-48 md:py-72 px-8 md:px-24 bg-[#FCFAF8]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32 items-center">
            <div className="lg:col-span-5 relative">
              <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-12 block uppercase">01 / PERSPECTIVE</span>
              <h2 className="text-7xl lg:text-9xl font-serif leading-[0.85] tracking-tighter mb-16 text-[#1A1A1A]">Rare <br /> <span className="italic">Simplicity.</span></h2>
              <div className="w-32 h-[1px] bg-[#C5A059] opacity-40"></div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-3xl lg:text-5xl font-serif italic text-gray-800 leading-[1.2] mb-16 opacity-80 font-light">
                "We curate twelve sanctuaries on Dhiffushi, where architecture meets the Indian Ocean’s silent rhythm."
              </p>
              <p className="text-lg text-gray-500 font-light leading-relaxed mb-16 max-w-lg">
                Ruka Maldives is an editorial expression of Maldivian hospitality. Step away from the crowds into a community where slow living is the only protocol.
              </p>
              <div className="flex space-x-12 pt-16 border-t border-black/[0.05]">
                <div className="flex flex-col space-y-4">
                  <span className="text-[9px] font-accent font-bold tracking-widest text-[#C5A059] uppercase">Architecture</span>
                  <p className="text-xs text-gray-400 font-light italic">Sand tones and coral fragments.</p>
                </div>
                <div className="flex flex-col space-y-4">
                  <span className="text-[9px] font-accent font-bold tracking-widest text-[#C5A059] uppercase">Community</span>
                  <p className="text-xs text-gray-400 font-light italic">A local island heartbeat.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-48 bg-[#1A1A1A] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
          <Leaf size={400} />
        </div>
        <div className="container mx-auto px-8 md:px-24 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 border-b border-white/[0.05] pb-12">
            <div>
              <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-6 block uppercase">02 / ETHOS</span>
              <h2 className="text-6xl font-serif tracking-tighter">Circular <br /><span className="italic">Legacy.</span></h2>
            </div>
            <p className="text-[9px] font-accent tracking-[0.5em] text-white/30 uppercase mt-8 md:mt-0 font-bold">Conserving the Atoll.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-[#C5A059]">
                <Waves size={24} />
              </div>
              <h4 className="text-xl font-serif italic">Pure Water Narrative</h4>
              <p className="text-sm text-white/40 font-light leading-relaxed">Eliminating single-use plastics via our island-sourced glass bottling system. Pure, local, respectful.</p>
            </div>
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-[#C5A059]">
                <Leaf size={24} />
              </div>
              <h4 className="text-xl font-serif italic">Zero-Waste Atelier</h4>
              <p className="text-sm text-white/40 font-light leading-relaxed">Collaborating with local Dhiffushi artisans to create upcycled decor and organic island amenities.</p>
            </div>
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-[#C5A059]">
                <Anchor size={24} />
              </div>
              <h4 className="text-xl font-serif italic">Reef Guardianship</h4>
              <p className="text-sm text-white/40 font-light leading-relaxed">Our journeys contribute directly to the North Malé Atoll coral restoration programs led by local biologists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Fragments */}
      <section className="py-64 bg-white">
        <div className="container mx-auto px-8 md:px-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-[3s] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[3/4] overflow-hidden lg:mt-32 grayscale hover:grayscale-0 transition-all duration-[3s] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-[3s] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1506953823976-52e1bdc0149a?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[3/4] overflow-hidden lg:mt-32 grayscale hover:grayscale-0 transition-all duration-[3s] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1516108317508-6788f6a160e6?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
            </div>
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

  if (!room) return <div className="pt-64 text-center font-serif text-3xl">Sanctuary not found in archive.</div>;

  return (
    <main className="pt-48 pb-64 bg-[#FCFAF8]">
      <div className="container mx-auto px-8 lg:px-24">
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="flex items-center space-x-4 text-[9px] font-accent font-bold tracking-[0.5em] mb-16 opacity-30 hover:opacity-100 transition-all uppercase">
          <ChevronLeft size={16} /> <span>Return to the archive</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-start">
          {/* Gallery Sidebar */}
          <div className="lg:col-span-7 space-y-8">
            <div className="aspect-[4/5] lg:aspect-[16/9] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] bg-black/5">
              <img src={room.images[0]} className="w-full h-full object-cover" alt={room.name} />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="aspect-square bg-white shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573843225103-bc89955e8c11?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="aspect-square bg-white shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
            
            {/* Features Detail */}
            <div className="pt-24 space-y-16">
              <div className="border-t border-black/[0.05] pt-12">
                <h4 className="text-[10px] font-accent font-bold tracking-[0.8em] text-[#C5A059] mb-12 uppercase">SANCTUARY AMENITIES</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-[11px] font-light text-gray-500 font-accent uppercase tracking-widest">
                  {room.amenities.map(a => (
                    <div key={a} className="flex items-center space-x-3">
                      <div className="w-1 h-1 rounded-full bg-[#C5A059]" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-black/[0.05] pt-12">
                <h4 className="text-[10px] font-accent font-bold tracking-[0.8em] text-[#C5A059] mb-12 uppercase">POLICIES & DETAILS</h4>
                <div className="space-y-6 text-sm text-gray-400 font-light leading-relaxed">
                  <div className="flex justify-between border-b border-black/[0.03] pb-4">
                    <span>Check-in</span>
                    <span className="text-[#1A1A1A] font-serif italic">After 14:00 (2:00 PM)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/[0.03] pb-4">
                    <span>Check-out</span>
                    <span className="text-[#1A1A1A] font-serif italic">Before 12:00 (12:00 PM)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/[0.03] pb-4">
                    <span>Green Tax</span>
                    <span className="text-[#1A1A1A] font-serif italic">$6.00 Per person / night</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pets</span>
                    <span className="text-[#1A1A1A] font-serif italic">Not permitted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Booking Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-48">
            <div className="flex flex-col">
              <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-6 block uppercase">COLLECTION</span>
              <h1 className="text-6xl lg:text-8xl font-serif tracking-tighter leading-[0.85] mb-12 text-[#1A1A1A]">{room.name}</h1>
              <p className="text-xl text-gray-500 font-light leading-relaxed mb-16 italic font-serif">
                "{room.description}"
              </p>

              <div className="grid grid-cols-2 gap-12 mb-20">
                <div className="flex items-center space-x-6">
                  <Maximize2 size={18} className="text-[#C5A059] opacity-40" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-accent text-gray-300 tracking-widest uppercase">AREA</span>
                    <span className="text-sm font-serif">{room.size} SQM</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <Star size={18} className="text-[#C5A059] opacity-40" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-accent text-gray-300 tracking-widest uppercase">BEDDING</span>
                    <span className="text-sm font-serif">{room.bedConfig}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-black/5">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-[9px] font-accent text-[#C5A059] block mb-2 tracking-widest font-bold">FROM</span>
                    <span className="text-6xl font-serif tracking-tighter leading-none">${room.basePrice}</span>
                  </div>
                  <span className="text-[10px] font-accent text-gray-400 font-bold tracking-widest mb-2">PER NIGHT</span>
                </div>
                <Link to="/booking" className="w-full bg-[#1A1A1A] text-white py-8 text-center text-[10px] font-accent font-bold tracking-[0.6em] block hover:bg-[#C5A059] transition-all shadow-xl uppercase">
                  Reserve Sanctuary
                </Link>
                <div className="mt-8 flex items-center justify-center space-x-4 opacity-30">
                  <ShieldCheck size={14} />
                  <span className="text-[8px] font-accent font-bold tracking-widest uppercase">Best rate guaranteed</span>
                </div>
              </div>
              
              {/* Additional Context */}
              <div className="mt-16 space-y-10">
                <div className="flex items-start space-x-6 border-b border-black/[0.03] pb-10">
                  <Ship size={20} className="text-[#C5A059] mt-1" />
                  <div>
                    <h5 className="text-[10px] font-accent font-bold tracking-widest uppercase mb-2">TRANSFER LOGISTICS</h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light">60-minute speedboat from Velana International Airport (MLE) to Dhiffushi Island. Coordination included with every stay.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <Monitor size={20} className="text-[#C5A059] mt-1" />
                  <div>
                    <h5 className="text-[10px] font-accent font-bold tracking-widest uppercase mb-2">ISLAND BUSINESS</h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light">High-speed fiber connectivity, dedicated desks, and printer access for the modern nomadic sanctuary.</p>
                  </div>
                </div>
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
    transfer: 'shared_speedboat',
    paymentMethod: 'card' as 'card' | 'bml'
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
    <main className="pt-48 pb-80 bg-[#FCFAF8] min-h-screen px-8">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-32 text-center max-w-3xl mx-auto">
          <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-8 block uppercase">RESERVATION ANTHOLOGY</span>
          <h1 className="text-7xl lg:text-[10vw] font-serif tracking-tighter leading-[0.75] mb-16 text-[#1A1A1A]">Secure <br /><span className="italic font-light opacity-40">Identity.</span></h1>
          
          <div className="flex justify-between items-center max-w-xl mx-auto border-y border-black/[0.05] py-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center space-y-4">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-[11px] font-bold transition-all duration-1000 ${step >= i ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl' : 'border-black/5 text-gray-300'}`}>
                  {step > i ? <CheckCircle2 size={20} /> : i}
                </div>
                <span className={`text-[9px] font-accent font-bold tracking-[0.4em] ${step >= i ? 'text-[#1A1A1A]' : 'text-gray-300'} uppercase`}>
                  {i === 1 ? 'Parameters' : i === 2 ? 'Identity' : 'Attest'}
                </span>
              </div>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-start">
          <div className="lg:col-span-7 bg-white p-12 lg:p-24 shadow-[0_60px_120px_rgba(0,0,0,0.05)] border border-black/[0.02]">
            {step === 1 && (
              <div className="animate-reveal space-y-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="flex flex-col space-y-6">
                    <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Sanctuary Archive</label>
                    <select 
                      className="bg-transparent border-b border-black/10 py-6 font-serif text-3xl focus:outline-none focus:border-[#C5A059] appearance-none"
                      value={formData.roomType}
                      onChange={e => setFormData({...formData, roomType: e.target.value as RoomType})}
                    >
                      {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-6">
                    <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Sanctuary For</label>
                    <div className="flex items-center justify-between border-b border-black/10 py-6">
                      <button onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})} className="text-3xl font-serif text-[#C5A059]">—</button>
                      <span className="text-3xl font-serif">{formData.adults} Adults</span>
                      <button onClick={() => setFormData({...formData, adults: Math.min(3, formData.adults + 1)})} className="text-3xl font-serif text-[#C5A059]">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-8">
                  <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Stay Chronology</label>
                  <CustomCalendar selectedIn={dates.checkIn} selectedOut={dates.checkOut} onSelect={setDates} />
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!dates.checkIn || !dates.checkOut}
                  className="w-full bg-[#1A1A1A] text-white py-10 text-[11px] font-accent font-bold tracking-[0.8em] hover:bg-[#C5A059] transition-all disabled:opacity-5 shadow-2xl uppercase"
                >
                  Confirm parameters
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-reveal space-y-20">
                <div className="grid grid-cols-2 gap-12">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-accent font-bold text-[#C5A059] mb-4 tracking-widest uppercase">GIVEN NAME</label>
                    <input className="bg-transparent border-b border-black/10 py-6 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] font-accent font-bold text-[#C5A059] mb-4 tracking-widest uppercase">FAMILY NAME</label>
                    <input className="bg-transparent border-b border-black/10 py-6 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase" onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-accent font-bold text-[#C5A059] mb-4 tracking-widest uppercase">ELECTRONIC MAIL</label>
                  <input className="bg-transparent border-b border-black/10 py-6 font-serif text-3xl focus:outline-none focus:border-[#C5A059] lowercase" onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-accent font-bold text-[#C5A059] mb-4 tracking-widest uppercase">WHATSAPP / MOBILE</label>
                  <input className="bg-transparent border-b border-black/10 py-6 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                
                <div className="flex space-x-8 pt-16">
                  <button onClick={() => setStep(1)} className="flex-1 border border-black/10 text-[10px] font-accent font-bold tracking-[0.5em] py-8 uppercase hover:bg-black hover:text-white transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-[#1A1A1A] text-white text-[10px] font-accent font-bold tracking-[0.5em] py-8 uppercase hover:bg-[#C5A059] transition-all shadow-xl">Identity confirmed</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-reveal space-y-24">
                <div className="space-y-12">
                  <h4 className="text-[12px] font-accent font-bold tracking-[1em] text-[#C5A059] mb-12 uppercase">ATTESTATION METHOD</h4>
                  
                  <button 
                    onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                    className={`w-full p-10 border transition-all flex items-center justify-between group ${formData.paymentMethod === 'card' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-black/[0.05]'}`}
                  >
                    <div className="flex items-center space-x-8">
                      <CreditCard className={`transition-colors ${formData.paymentMethod === 'card' ? 'text-[#C5A059]' : 'text-gray-300'}`} />
                      <div className="text-left">
                        <span className="text-xl font-serif block">Secure Card Transaction</span>
                        <span className="text-[9px] font-accent text-gray-400 font-bold uppercase tracking-widest">Visa, Mastercard, Amex</span>
                      </div>
                    </div>
                    {formData.paymentMethod === 'card' && <CheckCircle2 size={24} className="text-[#C5A059]" />}
                  </button>

                  <button 
                    onClick={() => setFormData({...formData, paymentMethod: 'bml'})}
                    className={`w-full p-10 border transition-all flex items-center justify-between group ${formData.paymentMethod === 'bml' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-black/[0.05]'}`}
                  >
                    <div className="flex items-center space-x-8">
                      <Landmark className={`transition-colors ${formData.paymentMethod === 'bml' ? 'text-[#C5A059]' : 'text-gray-300'}`} />
                      <div className="text-left">
                        <span className="text-xl font-serif block">BML Transfer (Local)</span>
                        <span className="text-[9px] font-accent text-gray-400 font-bold uppercase tracking-widest">Bank of Maldives — Instant</span>
                      </div>
                    </div>
                    {formData.paymentMethod === 'bml' && <CheckCircle2 size={24} className="text-[#C5A059]" />}
                  </button>
                </div>

                {formData.paymentMethod === 'bml' && (
                  <div className="p-12 bg-[#FCFAF8] border border-black/[0.03] space-y-8 animate-reveal">
                    <span className="text-[10px] font-accent font-bold tracking-[0.5em] text-[#C5A059] uppercase block mb-6">BML TRANSFER REQUISITES</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[11px] font-accent tracking-widest text-gray-400">
                      <div className="flex flex-col space-y-2">
                        <span className="text-black/20 font-bold">ACCOUNT NAME</span>
                        <span className="text-black/80">RUKA MALDIVES PVT LTD</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className="text-black/20 font-bold">ACCOUNT NUMBER (MVR)</span>
                        <span className="text-black/80">7730000123456</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className="text-black/20 font-bold">ACCOUNT NUMBER (USD)</span>
                        <span className="text-black/80">7730000654321</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className="text-black/20 font-bold">SWIFT CODE</span>
                        <span className="text-black/80">MALBMVXX</span>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-black/[0.03] flex items-start space-x-4">
                      <ShieldAlert size={16} className="text-[#C5A059] mt-1" />
                      <p className="text-[10px] font-light leading-relaxed italic">Upon completion, please relay the transaction anthology to our WhatsApp concierge for instant confirmation.</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-8">
                  <button onClick={() => setStep(2)} className="flex-1 border border-black/10 text-[10px] font-accent font-bold tracking-[0.5em] py-8 uppercase hover:bg-black hover:text-white transition-all">Identity</button>
                  <button onClick={() => alert('RESERVATION ANTHOLOGY RECORDED')} className="flex-1 bg-[#C5A059] text-white text-[11px] font-accent font-bold py-10 tracking-[0.8em] hover:bg-[#1A1A1A] transition-all shadow-2xl uppercase">Complete Stay Record</button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-48 bg-[#1A1A1A] p-12 lg:p-16 text-white shadow-[0_50px_150px_rgba(0,0,0,0.4)] border border-white/5">
              <h3 className="text-4xl font-serif mb-16 border-b border-white/10 pb-10 italic opacity-40">Stay Anthology</h3>
              {calculation ? (
                <div className="space-y-10">
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-6">
                    <span className="text-[10px] font-accent text-white/30 tracking-[0.5em] uppercase">Sanctuary Type</span>
                    <span className="font-serif text-2xl">{ROOMS.find(r => r.type === formData.roomType)?.name}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-6">
                    <span className="text-[10px] font-accent text-white/30 tracking-[0.5em] uppercase">Stay Duration</span>
                    <span className="font-serif text-2xl">{calculation.nights} Island Nights</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-6">
                    <span className="text-[10px] font-accent text-white/30 tracking-[0.5em] uppercase">Government Levy</span>
                    <span className="font-serif text-2xl">${calculation.greenTaxTotal}</span>
                  </div>
                  <div className="pt-24 flex flex-col items-end">
                    <span className="text-[11px] font-accent text-[#C5A059] tracking-[1em] mb-8 uppercase font-bold">TOTAL ESTIMATE</span>
                    <span className="text-8xl md:text-[6vw] font-serif leading-none tracking-tighter">${calculation.grandTotal.toFixed(0)}</span>
                    <div className="mt-10 flex items-center space-x-4 text-white/20">
                      <Sparkles size={14} />
                      <span className="text-[9px] font-accent tracking-[0.6em] uppercase italic">Inclusive of island taxes</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-32 text-center opacity-10">
                  <p className="text-sm italic tracking-[0.5em] uppercase font-light leading-loose">Define stay chronology <br /> to review anthology.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// --- Shared Components ---

// Implementation of the missing Footer component
const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A1A] py-32 px-8 md:px-24 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-32">
          <div>
            <Link to="/" className="group flex flex-col mb-12">
              <span className="text-2xl lg:text-3xl font-serif font-light tracking-[0.4em] text-white">RUKA</span>
              <span className="text-[6px] lg:text-[7px] font-accent text-[#C5A059] mt-1 tracking-[1.4em] uppercase font-bold">Maldives</span>
            </Link>
            <p className="text-white/30 text-[10px] font-accent tracking-[0.3em] leading-relaxed uppercase font-bold">
              Kaafu Atoll <br /> Dhiffushi Island <br /> Republic of Maldives
            </p>
          </div>
          <div className="space-y-8">
            <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[0.5em] uppercase block">EXPLORE</span>
            <div className="flex flex-col space-y-4">
              <Link to="/rooms" className="text-white/50 hover:text-white text-[10px] font-accent tracking-widest transition-colors uppercase font-bold">The Archive</Link>
              <Link to="/dining" className="text-white/50 hover:text-white text-[10px] font-accent tracking-widest transition-colors uppercase font-bold">Dining</Link>
              <Link to="/experiences" className="text-white/50 hover:text-white text-[10px] font-accent tracking-widest transition-colors uppercase font-bold">Journeys</Link>
              <Link to="/booking" className="text-white/50 hover:text-white text-[10px] font-accent tracking-widest transition-colors uppercase font-bold">Reservations</Link>
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-[#C5A059] text-[9px] font-accent font-bold tracking-[0.5em] uppercase block">CONTACT</span>
            <div className="flex flex-col space-y-4">
              <a href="mailto:hello@rukamaldives.com" className="text-white/50 hover:text-white text-[10px] font-accent tracking-widest transition-colors uppercase font-bold">hello@rukamaldives.com</a>
              <span className="text-white/50 text-[10px] font-accent tracking-widest uppercase font-bold">+960 777 0000</span>
            </div>
          </div>
        </div>
        <div className="pt-12 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center text-white/20 text-[8px] font-accent tracking-[0.4em] uppercase font-bold">
          <span>© 2025 RUKA MALDIVES PVT LTD</span>
          <div className="flex space-x-12 mt-8 md:mt-0">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- App Orchestration ---

const Main: React.FC = () => (
  <>
    <Home />
    <Bot />
  </>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/rooms" element={
          <main className="pt-64 pb-96 px-8 md:px-24 bg-[#FCFAF8]">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-black/[0.05] pb-16">
                <div>
                  <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1.5em] mb-6 block uppercase">COLLECTION</span>
                  <h2 className="text-8xl font-serif tracking-tighter">The <span className="italic">Archive.</span></h2>
                </div>
                <p className="max-w-xs text-[10px] font-accent tracking-widest text-gray-400 uppercase font-bold text-right mb-4">Twelve curated sanctuaries steps from the Indian Ocean.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12">
                {ROOMS.map((r, i) => (
                  <Link key={r.id} to={`/rooms/${r.id}`} className={`group ${i % 2 === 1 ? 'lg:mt-32' : ''}`}>
                    <div className="aspect-[3/4] overflow-hidden mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:-translate-y-4 bg-black/5">
                      <img src={r.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[3s] group-hover:scale-110" />
                      <div className="absolute top-8 left-8">
                        <span className="text-white text-6xl font-serif italic opacity-30 group-hover:opacity-100 transition-opacity duration-1000">0{i+1}</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-serif mb-3 tracking-tighter">{r.name}</h3>
                    <div className="flex justify-between items-center text-[10px] font-accent text-gray-400 font-bold tracking-widest uppercase">
                      <span>{r.size}m² Sanctuary</span>
                      <span className="text-[#C5A059]">${r.basePrice} NIGHT</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        } />
        <Route path="/rooms/:roomId" element={<RoomDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="*" element={<Main />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
