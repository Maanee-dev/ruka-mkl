
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Use namespace import for react-router-dom to resolve missing exported member errors
import * as Router from 'react-router-dom';
const { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } = Router;

import { 
  Menu, X, Instagram, Facebook, ArrowUpRight, ArrowRight, 
  Search, Users, Calendar, Utensils, Coffee, CreditCard, 
  MessageSquare, Send, CheckCircle2, ChevronDown, MapPin,
  Wind, Waves, Sunrise
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
      // Correctly initialize GoogleGenAI with the API key from environment variables
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Gemini expects conversation to start with 'user' role
      const chatContents = newMessages
        .filter((m, i) => !(i === 0 && m.role === 'bot'))
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Use ai.models.generateContent directly with model name and prompt history
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: chatContents,
        config: {
          systemInstruction: 'You are Ruka Concierge, an elegant AI host for Ruka Maldives on Dhiffushi island. Provide details on our 12 sanctuaries, local dining, and excursions. Tone: Minimalist, sophisticated, warm, editorial. Keep responses under 60 words.',
        }
      });
      // Correctly extract text output using the .text property
      setMessages(prev => [...prev, { role: 'bot', text: response.text || 'I apologize, my signal is as fleeting as a Maldivian breeze. How else can I help?' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Our concierge is momentarily away. Reach us at hello@rukamaldives.com.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {isOpen ? (
        <div className="bg-white w-[350px] h-[500px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] flex flex-col border border-black/5 animate-reveal origin-bottom-right">
          <div className="bg-[#1A1A1A] p-6 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white text-[10px] font-accent font-bold tracking-[0.3em]">CONCIERGE</span>
              <span className="text-white/40 text-[8px] font-accent uppercase tracking-widest">Est. 2025</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={18} className="text-white/60 hover:text-white transition-colors" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FCFAF8] scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 text-[11px] leading-relaxed tracking-tight ${m.role === 'user' ? 'bg-[#C5A059] text-white shadow-lg' : 'bg-white border border-black/5 text-[#1A1A1A]'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-gray-400 italic animate-pulse">Drafting response...</div>}
          </div>
          <div className="p-4 bg-white border-t border-black/5 flex space-x-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire about Ruka..." 
              className="flex-1 text-[11px] font-light bg-[#FCFAF8] px-4 py-3 focus:outline-none" 
            />
            <button onClick={handleSend} className="bg-[#1A1A1A] text-white px-4 hover:bg-[#C5A059] transition-colors"><Send size={14} /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-[#1A1A1A] text-white flex items-center justify-center shadow-2xl hover:bg-[#C5A059] transition-all duration-500 rounded-full border border-white/5">
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
};

// --- Global Components ---

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'THE HOTEL', path: '/' },
    { name: 'SANCTUARIES', path: '/rooms' },
    { name: 'EPICUREAN', path: '/dining' },
    { name: 'JOURNEYS', path: '/experiences' }
  ];

  const isDark = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isDark ? 'bg-[#FCFAF8]/95 backdrop-blur-md py-6 border-b border-black/[0.03]' : 'bg-transparent py-14'}`}>
      <div className="container mx-auto px-10 md:px-20 flex justify-between items-center">
        <Link to="/" className="group flex flex-col">
          <span className={`text-2xl font-serif font-light tracking-[0.4em] transition-colors duration-500 ${isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>RUKA</span>
          <span className="text-[6px] font-accent text-[#C5A059] mt-1 tracking-[1.2em] uppercase">Maldives</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-14">
          {links.map(link => (
            <Link key={link.path} to={link.path} className={`text-[9px] font-accent font-bold tracking-[0.5em] hover:text-[#C5A059] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white/60'}`}>
              {link.name}
            </Link>
          ))}
          <Link to="/booking" className={`px-12 py-4 text-[9px] font-accent font-bold tracking-[0.5em] transition-all duration-500 ${isDark ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' : 'border border-white/20 text-white hover:bg-white hover:text-[#1A1A1A]'}`}>
            BOOK
          </Link>
        </div>
        <button className="lg:hidden">
          <Menu size={24} className={isDark ? 'text-[#1A1A1A]' : 'text-white'} />
        </button>
      </div>
    </nav>
  );
};

// --- Home Sections ---

const HeroForm: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-7xl z-[50]">
      <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.12)] p-10 md:p-14 grid grid-cols-1 md:grid-cols-4 gap-12 items-center border border-black/[0.03]">
        <div className="flex flex-col space-y-4 md:border-r border-black/5 pr-8">
          <span className="text-[9px] font-accent font-bold text-[#C5A059] tracking-widest uppercase">Arrival</span>
          <div className="flex items-center space-x-4">
            <Calendar size={14} className="text-black/30" />
            <input type="date" className="text-sm font-serif focus:outline-none w-full cursor-pointer bg-transparent uppercase tracking-tighter" />
          </div>
        </div>
        <div className="flex flex-col space-y-4 md:border-r border-black/5 pr-8">
          <span className="text-[9px] font-accent font-bold text-[#C5A059] tracking-widest uppercase">Departure</span>
          <div className="flex items-center space-x-4">
            <Calendar size={14} className="text-black/30" />
            <input type="date" className="text-sm font-serif focus:outline-none w-full cursor-pointer bg-transparent uppercase tracking-tighter" />
          </div>
        </div>
        <div className="flex flex-col space-y-4 md:border-r border-black/5 pr-8">
          <span className="text-[9px] font-accent font-bold text-[#C5A059] tracking-widest uppercase">Guests</span>
          <div className="flex items-center space-x-4">
            <Users size={14} className="text-black/30" />
            <select className="text-sm font-serif focus:outline-none w-full bg-transparent appearance-none">
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => navigate('/booking')}
          className="bg-[#1A1A1A] text-white text-[10px] font-accent font-bold py-6 tracking-[0.5em] hover:bg-[#C5A059] transition-all duration-700 shadow-xl shadow-black/10 uppercase"
        >
          Check Anthology
        </button>
      </div>
    </div>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="relative h-[95vh] flex items-center justify-center bg-[#1A1A1A] z-10">
      <img 
        src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2400&auto=format&fit=crop" 
        className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105" 
        alt="Ruka Cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FCFAF8]/10"></div>
      <div className="relative z-10 text-center px-6 mb-24">
        <div className="overflow-hidden mb-8">
          <span className="block text-white/40 text-[10px] font-accent tracking-[1.5em] animate-fade uppercase">Dhiffusshi — Kaafu Atoll</span>
        </div>
        <h1 className="text-[16vw] md:text-[11vw] text-white font-serif leading-[0.8] tracking-tighter mb-16 animate-reveal">
          Quiet <br /> <span className="italic font-light opacity-50">Luxury</span>
        </h1>
        <div className="animate-fade hidden md:block" style={{ animationDelay: '1s' }}>
          <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent mx-auto"></div>
        </div>
      </div>
      {/* Moved outside the clipped area by adjusting hero height and using translate-y */}
      <HeroForm />
    </section>
  );
};

const Narrative: React.FC = () => {
  return (
    <section className="pt-96 pb-64 px-10 md:px-24 bg-[#FCFAF8]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
          <div className="lg:col-span-5 relative">
            <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-12 block uppercase">01 / PERSPECTIVE</span>
            <h2 className="text-7xl md:text-8xl font-serif leading-[0.95] tracking-tighter mb-16 text-[#1A1A1A]">
              The Art of <br /> <span className="italic">Silence.</span>
            </h2>
            <div className="w-24 h-[1px] bg-[#C5A059] opacity-30"></div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 pt-12">
            <p className="text-2xl md:text-4xl font-light text-[#1A1A1A] leading-relaxed tracking-tight mb-20 opacity-80 italic font-serif">
              "We curation twelve sanctuaries where architecture meets the Indian Ocean's breath. A canvas for tranquility."
            </p>
            <p className="text-lg font-light text-gray-500 leading-relaxed mb-16 max-w-lg">
              Ruka Maldives is more than a boutique guest house; it is an editorial expression of Maldivian hospitality. Located step-to-beach, we prioritize natural light, raw textures, and the luxury of unhurried time.
            </p>
            <div className="grid grid-cols-2 gap-16 pt-20 border-t border-black/[0.06]">
              <div className="space-y-6">
                <span className="text-[10px] font-accent font-bold tracking-widest block uppercase text-[#C5A059]">Design</span>
                <p className="text-xs text-gray-500 font-light leading-relaxed">Minimalist geometry crafted with sand tones, turquoise highlights, and coral accents.</p>
              </div>
              <div className="space-y-6">
                <span className="text-[10px] font-accent font-bold tracking-widest block uppercase text-[#C5A059]">Service</span>
                <p className="text-xs text-gray-500 font-light leading-relaxed">24-hour host presence, concierge-led excursions, and curated island experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SanctuaryCard: React.FC<{ room: typeof ROOMS[0], index: number }> = ({ room, index }) => (
  <div className={`group cursor-pointer ${index % 2 === 1 ? 'lg:mt-40' : ''}`}>
    <div className="aspect-[4/5] overflow-hidden mb-12 relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
      <img 
        src={room.images[0]} 
        className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110 grayscale group-hover:grayscale-0" 
        alt={room.name} 
      />
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      <div className="absolute top-12 left-12">
        <span className="text-white text-6xl font-serif italic opacity-30 group-hover:opacity-100 transition-opacity duration-1000">0{index + 1}</span>
      </div>
      <div className="absolute bottom-12 right-0 bg-[#1A1A1A] text-white py-5 px-10 transform translate-x-6 group-hover:translate-x-0 transition-transform duration-1000">
        <span className="text-[10px] font-accent tracking-[0.4em] font-bold uppercase">Discover</span>
      </div>
    </div>
    <div className="space-y-6">
      <div className="flex justify-between items-baseline">
        <h3 className="text-3xl font-serif text-[#1A1A1A] tracking-tighter">{room.name}</h3>
        <span className="text-[11px] font-accent text-[#C5A059] font-bold tracking-widest">${room.basePrice}</span>
      </div>
      <p className="text-[10px] font-accent text-gray-400 tracking-widest uppercase">{room.size} SQM — {room.bedConfig}</p>
      <div className="w-12 h-[1px] bg-black/10 group-hover:w-24 group-hover:bg-[#C5A059] transition-all duration-1000"></div>
    </div>
  </div>
);

const Sanctuaries: React.FC = () => {
  return (
    <section className="py-64 bg-white overflow-hidden">
      <div className="container mx-auto px-10 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-40 pb-20 border-b border-black/[0.04]">
          <div className="max-w-2xl">
            <span className="text-[#C5A059] text-[10px] font-accent font-bold tracking-[1em] mb-10 block uppercase">02 / THE ARCHIVE</span>
            <h2 className="text-7xl font-serif text-[#1A1A1A] tracking-tighter">Island <br /><span className="italic">Sanctuaries.</span></h2>
          </div>
          <p className="max-w-xs text-[10px] text-gray-400 font-accent font-bold leading-relaxed md:text-right mt-16 md:mt-0 tracking-[0.4em] uppercase">
            Curated narratives. <br /> Infinite horizons.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {ROOMS.map((room, i) => (
            <SanctuaryCard key={room.id} room={room} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Epicurean: React.FC = () => {
  return (
    <section className="py-64 bg-[#FCFAF8] overflow-hidden">
      <div className="container mx-auto px-10 md:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-40 items-center">
          <div className="lg:col-span-6 relative">
            <div className="aspect-[5/6] overflow-hidden grayscale hover:grayscale-0 transition-all duration-[3s] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1400" className="w-full h-full object-cover" alt="Dining" />
            </div>
            <div className="absolute -bottom-16 -right-16 hidden lg:block bg-white p-20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.15)] w-[400px]">
              <span className="text-[10px] font-accent text-[#C5A059] block mb-10 tracking-[0.5em] font-bold uppercase">DHIFUSSHI CULINARY</span>
              <h4 className="text-3xl font-serif mb-8 leading-tight tracking-tighter">Harvest of the Indian Ocean</h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed italic border-l-2 border-[#C5A059] pl-10">
                A curation of freshly caught reef fish grilled with local spices, served steps from the starlit tide.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <span className="text-[#C5A059] text-[10px] font-accent mb-12 block tracking-[1em] uppercase">03 / EPICUREAN</span>
            <h2 className="text-8xl md:text-[7vw] font-serif leading-[0.85] tracking-tighter mb-16 text-[#1A1A1A]">Rare <br /> <span className="italic">Flavors.</span></h2>
            <p className="text-2xl font-light text-gray-500 leading-relaxed mb-20 opacity-80 font-serif italic">
              "We celebrate the bounty of the reef. Simple ingredients, extraordinary atmosphere."
            </p>
            <div className="space-y-20">
              <div className="flex items-start space-x-14 pb-14 border-b border-black/[0.04]">
                <Sunrise size={32} className="text-[#C5A059] mt-1 opacity-40" />
                <div>
                  <h4 className="text-[11px] font-accent font-bold tracking-widest uppercase mb-5">Sunrise Anthology</h4>
                  <p className="text-[13px] text-gray-400 font-light leading-relaxed">Daily continental curation. Tropical harvest and artisanal pastries served steps from the white sand.</p>
                </div>
              </div>
              <div className="flex items-start space-x-14">
                <Coffee size={32} className="text-[#C5A059] mt-1 opacity-40" />
                <div>
                  <h4 className="text-[11px] font-accent font-bold tracking-widest uppercase mb-5">Island Atelier</h4>
                  <p className="text-[13px] text-gray-400 font-light leading-relaxed">A tranquil garden lounge for hand-crafted brews and mid-day contemplation under the palms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Gallery: React.FC = () => {
  const images = [
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506953823976-52e1bdc0149a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516108317508-6788f6a160e6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1573843225103-bc89955e8c11?auto=format&fit=crop&q=80&w=800"
  ];
  return (
    <section className="py-64 bg-white">
      <div className="container mx-auto px-10 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-black/[0.04] pb-16">
          <div>
            <span className="text-[10px] font-accent text-[#C5A059] mb-5 block tracking-[1em] uppercase">04 / THE JOURNAL</span>
            <h2 className="text-6xl font-serif text-[#1A1A1A] tracking-tighter">Island <br /><span className="italic">Fragments.</span></h2>
          </div>
          <a href="#" className="text-[10px] font-accent font-bold tracking-[0.4em] border-b-2 border-[#C5A059] pb-3 hover:text-[#C5A059] transition-colors uppercase">View Lookbook</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {images.map((src, i) => (
            <div key={src} className={`aspect-[3/4] overflow-hidden group relative shadow-lg ${i % 2 === 1 ? 'lg:mt-24' : 'lg:-mt-24'}`}>
              <img src={src} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 grayscale hover:grayscale-0" alt="Island Moment" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram size={28} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-48 bg-[#1A1A1A] text-white overflow-hidden">
      <div className="container mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 border-b border-white/[0.05] pb-32">
          <div className="lg:col-span-5">
            <Link to="/" className="text-5xl font-serif tracking-[0.4em] mb-14 block">RUKA</Link>
            <p className="text-white/30 font-light max-w-sm leading-relaxed text-sm italic font-serif">
              "A curated island retreat in the heart of Kaafu Atoll. 
              Focused on the essentials of peace, natural light, and Maldivian heritage."
            </p>
            <div className="mt-20 flex space-x-16 items-center">
              <a href="#" className="text-white/20 hover:text-[#C5A059] transition-colors duration-500"><Instagram size={22} /></a>
              <a href="#" className="text-white/20 hover:text-[#C5A059] transition-colors duration-500"><Facebook size={22} /></a>
            </div>
          </div>
          <div className="lg:col-span-3 lg:col-start-7 space-y-12">
            <span className="text-[11px] font-accent font-bold tracking-[0.5em] text-[#C5A059] uppercase">Explore</span>
            <ul className="space-y-8 text-[11px] font-accent font-light text-white/40 tracking-[0.4em]">
              <li><Link to="/rooms" className="hover:text-white transition-colors uppercase">SANCTUARIES</Link></li>
              <li><Link to="/dining" className="hover:text-white transition-colors uppercase">EPICUREAN</Link></li>
              <li><Link to="/experiences" className="hover:text-white transition-colors uppercase">JOURNEYS</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors uppercase">CONNECT</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-3 space-y-12">
            <span className="text-[11px] font-accent font-bold tracking-[0.5em] text-[#C5A059] uppercase">Contact</span>
            <ul className="space-y-8 text-[11px] font-accent font-light text-white/40 tracking-[0.4em]">
              <li className="uppercase">Dhiffusshi, Maldives</li>
              <li className="uppercase">Hello@rukamaldives.com</li>
              <li>+960 777 0000</li>
            </ul>
          </div>
        </div>
        <div className="pt-20 flex flex-col md:flex-row justify-between items-center text-[9px] font-accent text-white/10 tracking-[1.2em] uppercase space-y-10 md:space-y-0 font-bold">
          <span>&copy; 2025 RUKA MALDIVES ANTHOLOGY</span>
          <div className="flex space-x-16">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Legal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Booking Flow ---

const BookingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    roomType: 'standard_queen' as RoomType,
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    transfer: 'shared_speedboat'
  });

  const calculation = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return null;
    return calculateBooking({
      roomType: formData.roomType,
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      adults: formData.adults,
      children: formData.children,
      infants: 0,
      mealPlan: 'breakfast',
      transferType: formData.transfer,
      excursions: []
    });
  }, [formData]);

  return (
    <div className="pt-64 pb-80 px-10 bg-[#FCFAF8] min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-48 text-center max-w-5xl mx-auto">
          <span className="text-[#C5A059] text-[10px] font-accent mb-12 block tracking-[1em] uppercase font-bold">RESERVATION ANTHOLOGY</span>
          <h1 className="text-8xl md:text-[9vw] font-serif tracking-tighter leading-[0.8] mb-24 text-[#1A1A1A]">Secure <br /> <span className="italic font-light opacity-60">Identity.</span></h1>
          
          <div className="flex justify-between items-center max-w-xl mx-auto border-t border-b border-black/[0.05] py-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center space-y-5">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-[11px] font-bold transition-all duration-1000 shadow-sm ${step >= i ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl' : 'border-black/5 text-gray-300'}`}>
                  {step > i ? <CheckCircle2 size={20} /> : i}
                </div>
                <span className={`text-[9px] font-accent font-bold tracking-[0.4em] ${step >= i ? 'text-[#1A1A1A]' : 'text-gray-300'} uppercase`}>
                  {i === 1 ? 'Selection' : i === 2 ? 'Details' : 'Attest'}
                </span>
              </div>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
          <div className="lg:col-span-7 bg-white p-14 md:p-28 shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/[0.02]">
            {step === 1 && (
              <div className="animate-reveal space-y-28">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                  <div className="flex flex-col space-y-8">
                    <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Sanctuary Type</label>
                    <select 
                      className="bg-transparent border-b border-black/10 py-6 font-serif text-3xl focus:outline-none focus:border-[#C5A059] appearance-none"
                      value={formData.roomType}
                      onChange={e => setFormData({...formData, roomType: e.target.value as RoomType})}
                    >
                      {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-8">
                    <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Sanctuary For</label>
                    <div className="flex items-center justify-between border-b border-black/10 py-6">
                      <button onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults-1)})} className="text-3xl font-serif text-[#C5A059] transition-transform active:scale-75">—</button>
                      <span className="text-3xl font-serif">{formData.adults}</span>
                      <button onClick={() => setFormData({...formData, adults: Math.min(3, formData.adults+1)})} className="text-3xl font-serif text-[#C5A059] transition-transform active:scale-75">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-8">
                    <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Arrival Date</label>
                    <input type="date" className="bg-transparent border-b border-black/10 py-6 font-serif text-2xl focus:outline-none uppercase tracking-tighter" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                  </div>
                  <div className="flex flex-col space-y-8">
                    <label className="text-[11px] font-accent font-bold text-[#C5A059] tracking-[0.5em] uppercase">Departure Date</label>
                    <input type="date" className="bg-transparent border-b border-black/10 py-6 font-serif text-2xl focus:outline-none uppercase tracking-tighter" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!formData.checkIn || !formData.checkOut}
                  className="w-full bg-[#1A1A1A] text-white text-[11px] font-accent font-bold py-10 tracking-[0.6em] hover:bg-[#C5A059] transition-all duration-700 disabled:opacity-5 mt-16 shadow-2xl shadow-black/20 uppercase"
                >
                  Confirm Parameters
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-reveal space-y-24">
                <div className="grid grid-cols-2 gap-20">
                  <input placeholder="GIVEN NAME" className="bg-transparent border-b border-black/10 py-8 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase tracking-tighter" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  <input placeholder="FAMILY NAME" className="bg-transparent border-b border-black/10 py-8 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase tracking-tighter" onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 gap-20">
                  <input placeholder="EMAIL ADDRESS" className="bg-transparent border-b border-black/10 py-8 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase tracking-tighter" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input placeholder="WHATSAPP / MOBILE" className="bg-transparent border-b border-black/10 py-8 font-serif text-3xl focus:outline-none focus:border-[#C5A059] uppercase tracking-tighter" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex space-x-10 pt-16">
                  <button onClick={() => setStep(1)} className="flex-1 border border-black/10 text-[10px] font-accent font-bold tracking-[0.5em] py-8 uppercase hover:bg-black hover:text-white transition-all duration-500">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-[#1A1A1A] text-white text-[10px] font-accent font-bold tracking-[0.5em] py-8 uppercase hover:bg-[#C5A059] transition-all duration-500 shadow-xl">Confirm Identity</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-reveal space-y-24">
                <div className="p-20 border-2 border-[#C5A059]/10 bg-[#FCFAF8] shadow-sm">
                  <h4 className="text-[12px] font-accent font-bold tracking-[0.6em] uppercase mb-16 text-[#C5A059]">PAYMENT ATTESTATION</h4>
                  <div className="space-y-10">
                    <button className="w-full p-12 bg-white border border-black/[0.03] flex items-center justify-between hover:border-[#C5A059] transition-all group shadow-sm">
                      <div className="flex items-center space-x-10">
                        <CreditCard size={32} className="text-[#C5A059] opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-2xl font-serif">Secure Card Transaction</span>
                      </div>
                      <ChevronDown size={14} className="opacity-10 group-hover:opacity-40" />
                    </button>
                    <button className="w-full p-12 bg-white border border-black/[0.03] flex items-center justify-between hover:border-[#C5A059] transition-all group opacity-40">
                      <div className="flex items-center space-x-10">
                        <Waves size={32} className="text-[#C5A059] opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-2xl font-serif">Direct Atoll Transfer</span>
                      </div>
                      <ChevronDown size={14} className="opacity-10 group-hover:opacity-40" />
                    </button>
                  </div>
                </div>
                <div className="flex space-x-10">
                  <button onClick={() => setStep(2)} className="flex-1 border border-black/10 text-[10px] font-accent font-bold tracking-[0.5em] py-8 uppercase hover:bg-black hover:text-white transition-all duration-500">Identity</button>
                  <button onClick={() => alert('Reservation Anthology Recorded.')} className="flex-1 bg-[#C5A059] text-white text-[11px] font-accent font-bold py-10 tracking-[0.6em] hover:bg-[#1A1A1A] transition-all duration-1000 shadow-2xl shadow-[#C5A059]/40 uppercase">Finalize Attestation</button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-48 bg-[#1A1A1A] p-20 text-white border border-white/5 shadow-3xl">
              <h3 className="text-3xl font-serif mb-20 border-b border-white/10 pb-10 italic opacity-40">Stay Anthology</h3>
              {calculation ? (
                <div className="space-y-12">
                  <div className="flex justify-between items-end border-b border-white/[0.03] pb-8">
                    <span className="text-[10px] font-accent text-white/30 tracking-[0.5em] uppercase">selection</span>
                    <span className="font-serif text-2xl">{ROOMS.find(r => r.type === formData.roomType)?.name}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.03] pb-8">
                    <span className="text-[10px] font-accent text-white/30 tracking-[0.5em] uppercase">chronology</span>
                    <span className="font-serif text-2xl">{calculation.nights} Island Nights</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.03] pb-8">
                    <span className="text-[10px] font-accent text-white/30 tracking-[0.5em] uppercase">levies (green tax)</span>
                    <span className="font-serif text-2xl">${calculation.greenTaxTotal}</span>
                  </div>
                  <div className="pt-24 flex flex-col items-end">
                    <span className="text-[11px] font-accent text-[#C5A059] tracking-[1em] mb-10 uppercase font-bold">total estimate</span>
                    <span className="text-[7vw] lg:text-[6vw] font-serif leading-none tracking-tighter">${calculation.grandTotal.toFixed(0)}</span>
                    <span className="text-[9px] font-accent text-white/20 mt-10 tracking-[0.6em] uppercase italic">inclusive of all atoll taxes</span>
                  </div>
                </div>
              ) : (
                <div className="py-32 text-center">
                  <div className="w-20 h-[1px] bg-white/10 mx-auto mb-10"></div>
                  <p className="text-white/20 font-light text-sm italic tracking-[0.4em] leading-loose uppercase">Inquire your sanctuary <br /> parameters to see stay details.</p>
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

const Main: React.FC = () => (
  <main>
    <Hero />
    <Narrative />
    <Sanctuaries />
    <Epicurean />
    <Gallery />
    <Footer />
    <Bot />
  </main>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/rooms" element={<Sanctuaries />} />
        <Route path="/dining" element={<Epicurean />} />
        <Route path="/booking" element={<BookingFlow />} />
        <Route path="*" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
