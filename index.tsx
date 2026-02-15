
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Use named imports for react-router-dom to resolve property existence errors
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  Menu, X, Instagram, Facebook, ArrowUpRight, ArrowRight, 
  Search, Users, Calendar, Utensils, Coffee, CreditCard, 
  MessageSquare, Send, CheckCircle2, ChevronDown, MapPin
} from 'lucide-react';
// Fix: Import GoogleGenAI for intelligent concierge functionality
import { GoogleGenAI } from "@google/genai";
import { ROOMS, EXCURSIONS } from './constants';
import { calculateBooking } from './utils/pricing';
import { RoomType } from './types';

// --- Components ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Bot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Maruhaba! I am your Ruka Concierge. How can I assist you today?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fix: Integrated Google Gemini AI for sophisticated, real-time guest assistance
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Initialize Gemini API client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMsg].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: 'You are Ruka Concierge, a sophisticated AI host for Ruka Maldives, a boutique guesthouse on Dhiffushi island. Provide information about our 12 sanctuaries (Standard Queen, Deluxe Double, Premium Suite, Family Suite), the Epicurean dining experience, and local atoll experiences. Your tone is minimalist, elegant, welcoming, and helpful. Keep responses concise and focused on guest comfort.',
        }
      });

      const botText = response.text || 'I apologize, I am experiencing a moment of silence. How else may I assist you?';
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error('Concierge Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Our concierge is momentarily unavailable. Please contact our island hosts directly at hello@rukamaldives.com.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {isOpen ? (
        <div className="bg-white w-80 h-[450px] shadow-2xl flex flex-col border border-black/5 animate-reveal origin-bottom-right">
          <div className="bg-[#1A1A1A] p-6 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white text-xs font-accent font-bold tracking-widest">CONCIERGE</span>
              <span className="text-white/40 text-[8px] font-accent uppercase">Online — Ruka Maldives</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} className="text-white" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FCFAF8]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 text-xs leading-relaxed ${m.role === 'user' ? 'bg-[#C5A059] text-white' : 'bg-white border border-black/5 text-[#1A1A1A]'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-black/5 p-4 text-[10px] text-gray-400 italic">
                  Concierge is typing...
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-black/5 flex space-x-2 bg-white">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="flex-1 text-xs focus:outline-none" 
              disabled={isTyping}
            />
            <button 
              onClick={handleSend} 
              className={`text-[#C5A059] ${isTyping ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 transition-transform'}`}
              disabled={isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#1A1A1A] text-white flex items-center justify-center shadow-xl hover:bg-[#C5A059] transition-all duration-500 group"
        >
          <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'HOTEL', path: '/' },
    { name: 'SANCTUARIES', path: '/rooms' },
    { name: 'DINING', path: '/dining' },
    { name: 'EXPERIENCES', path: '/experiences' }
  ];

  const isDark = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${isDark ? 'bg-[#FCFAF8]/90 backdrop-blur-md py-6 border-b border-black/[0.03]' : 'bg-transparent py-12'}`}>
      <div className="container mx-auto px-8 md:px-16 flex justify-between items-center">
        <Link to="/" className="group flex flex-col">
          <span className={`text-2xl font-serif tracking-[0.4em] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>RUKA</span>
          <span className="text-[6px] font-accent text-[#C5A059] mt-1 tracking-[1em]">MALDIVES</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-12">
          {links.map(link => (
            <Link key={link.path} to={link.path} className={`text-[9px] font-accent font-bold tracking-[0.5em] hover:text-[#C5A059] transition-colors ${isDark ? 'text-[#1A1A1A]' : 'text-white/70'}`}>
              {link.name}
            </Link>
          ))}
          <Link to="/booking" className={`px-10 py-4 text-[9px] font-accent font-bold tracking-[0.5em] transition-all ${isDark ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059]' : 'border border-white/20 text-white hover:bg-white hover:text-[#1A1A1A]'}`}>
            BOOK
          </Link>
        </div>
      </div>
    </nav>
  );
};

// --- Page Sections ---

const AvailabilityForm: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl z-20">
      <div className="bg-white shadow-2xl p-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-center border border-black/5">
        <div className="flex flex-col space-y-2 border-r border-black/5 pr-8">
          <span className="text-[8px] font-accent font-bold text-gray-400">CHECK-IN</span>
          <div className="flex items-center space-x-3">
            <Calendar size={14} className="text-[#C5A059]" />
            <input type="date" className="text-sm font-serif focus:outline-none w-full cursor-pointer" />
          </div>
        </div>
        <div className="flex flex-col space-y-2 border-r border-black/5 pr-8">
          <span className="text-[8px] font-accent font-bold text-gray-400">CHECK-OUT</span>
          <div className="flex items-center space-x-3">
            <Calendar size={14} className="text-[#C5A059]" />
            <input type="date" className="text-sm font-serif focus:outline-none w-full cursor-pointer" />
          </div>
        </div>
        <div className="flex flex-col space-y-2 border-r border-black/5 pr-8">
          <span className="text-[8px] font-accent font-bold text-gray-400">GUESTS</span>
          <div className="flex items-center space-x-3">
            <Users size={14} className="text-[#C5A059]" />
            <select className="text-sm font-serif focus:outline-none w-full bg-transparent appearance-none">
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => navigate('/booking')}
          className="bg-[#1A1A1A] text-white text-[10px] font-accent font-bold py-5 tracking-[0.3em] hover:bg-[#C5A059] transition-all duration-500"
        >
          CHECK AVAILABILITY
        </button>
      </div>
    </div>
  );
};

const InstagramGallery: React.FC = () => {
  const photos = [
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1506953823976-52e1bdc0149a?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1516108317508-6788f6a160e6?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1573843225103-bc89955e8c11?auto=format&fit=crop&q=80&w=600"
  ];

  return (
    <section className="py-32 px-8 bg-white overflow-hidden">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="text-[10px] font-accent text-[#C5A059] mb-4 block">@RUKAMALDIVES</span>
            <h2 className="text-4xl font-serif">Island <span className="italic">Perspective</span></h2>
          </div>
          <a href="#" className="text-[9px] font-accent border-b border-black/10 pb-2 hover:text-[#C5A059] transition-colors">FOLLOW US</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {photos.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden group relative">
              <img src={src} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram size={20} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DiningSection: React.FC = () => {
  return (
    <section className="py-64 bg-[#FCFAF8]">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="aspect-[3/4] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Dining" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
            <span className="text-[#C5A059] text-[10px] font-accent mb-12 block">THE GASTRONOMY</span>
            <h2 className="text-6xl md:text-8xl font-serif tracking-tighter leading-none mb-12">Epicurean <br /> <span className="italic">Dhiffushi</span></h2>
            <p className="text-xl font-light text-gray-500 leading-relaxed mb-16">
              Our on-site restaurant celebrates the harvest of the Indian Ocean. From traditional Maldivian mas huni to international boutique classics, our chefs curate a daily selection of seasonal flavors.
            </p>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-4"><Utensils size={18} className="text-[#C5A059]" /> <span className="text-xs font-accent tracking-widest">LOCAL CATCH</span></div>
                <p className="text-xs font-light text-gray-400">Freshly caught reef fish grilled to perfection under the stars.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4"><Coffee size={18} className="text-[#C5A059]" /> <span className="text-xs font-accent tracking-widest">CAFE CULTURE</span></div>
                <p className="text-xs font-light text-gray-400">Artisan brews and light pastries available daily in our garden lounge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const RoomsPreview: React.FC = () => {
  return (
    <section className="py-64 bg-white">
      <div className="container mx-auto px-8">
        <div className="mb-32 max-w-2xl">
          <span className="text-[#C5A059] text-[10px] font-accent mb-8 block">THE SANCTUARIES</span>
          <h2 className="text-6xl font-serif tracking-tighter mb-8">Minimalist <span className="italic">Luxury</span></h2>
          <p className="text-gray-400 font-light leading-relaxed">Twelve thoughtfully designed guestrooms that offer a respite from the world outside. Pure lines, natural textures, and island light.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ROOMS.map(room => (
            <div key={room.id} className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden mb-8 relative">
                <img src={room.images[0]} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                <div className="absolute bottom-6 right-6">
                  <span className="bg-white/90 backdrop-blur px-6 py-2 text-[9px] font-accent font-bold tracking-widest">FROM ${room.basePrice}</span>
                </div>
              </div>
              <h3 className="text-xl font-serif mb-2">{room.name}</h3>
              <p className="text-[10px] font-accent text-gray-400 tracking-widest uppercase mb-4">{room.size}m² Sanctuary</p>
              <Link to={`/rooms/${room.id}`} className="text-[9px] font-accent border-b border-black/10 pb-1 group-hover:text-[#C5A059] group-hover:border-[#C5A059] transition-all">DISCOVER SPACE</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Multi-Step Booking Flow ---

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
    paymentMethod: 'credit_card'
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
      transferType: 'shared_speedboat',
      excursions: []
    });
  }, [formData]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="pt-48 pb-64 px-8 min-h-screen bg-[#FCFAF8]">
      <div className="container mx-auto max-w-6xl">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-24 max-w-2xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center space-y-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-500 ${step >= i ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'border-black/5 text-gray-300'}`}>
                {step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              <span className={`text-[8px] font-accent font-bold tracking-widest ${step >= i ? 'text-[#C5A059]' : 'text-gray-300'}`}>
                {i === 1 ? 'SELECTION' : i === 2 ? 'GUEST DETAILS' : 'PAYMENT'}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 bg-white p-12 shadow-sm border border-black/5">
            {step === 1 && (
              <div className="animate-reveal">
                <h2 className="text-4xl font-serif mb-12 italic leading-none">Your Sanctuary Selection</h2>
                <div className="space-y-12">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col space-y-4">
                         <label className="text-[9px] font-accent text-gray-400">ROOM TYPE</label>
                         <select 
                           value={formData.roomType} 
                           onChange={e => setFormData({...formData, roomType: e.target.value as RoomType})}
                           className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none"
                         >
                            {ROOMS.map(r => <option key={r.id} value={r.type}>{r.name}</option>)}
                         </select>
                      </div>
                      <div className="flex flex-col space-y-4">
                         <label className="text-[9px] font-accent text-gray-400">ADULTS</label>
                         <input type="number" min="1" max="3" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col space-y-4">
                         <label className="text-[9px] font-accent text-gray-400">ARRIVAL</label>
                         <input type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      </div>
                      <div className="flex flex-col space-y-4">
                         <label className="text-[9px] font-accent text-gray-400">DEPARTURE</label>
                         <input type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      </div>
                   </div>
                   <button onClick={nextStep} disabled={!formData.checkIn || !formData.checkOut} className="w-full bg-[#1A1A1A] text-white text-[10px] font-accent font-bold py-6 tracking-[0.4em] hover:bg-[#C5A059] transition-all disabled:opacity-20 mt-12">CONTINUE TO DETAILS</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-reveal">
                <h2 className="text-4xl font-serif mb-12 italic leading-none">Guest Information</h2>
                <div className="space-y-10">
                   <div className="grid grid-cols-2 gap-8">
                      <input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      <input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                   </div>
                   <div className="grid grid-cols-1 gap-8">
                      <input placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      <input placeholder="Phone / WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                   </div>
                   <textarea placeholder="Special Requests (Allergies, Transfers, etc.)" className="w-full bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none min-h-[100px]" />
                   <div className="flex space-x-4 pt-12">
                      <button onClick={prevStep} className="flex-1 border border-black/10 text-[9px] font-accent font-bold py-6 tracking-[0.4em] hover:bg-[#1A1A1A] hover:text-white transition-all">BACK</button>
                      <button onClick={nextStep} className="flex-1 bg-[#1A1A1A] text-white text-[10px] font-accent font-bold py-6 tracking-[0.4em] hover:bg-[#C5A059] transition-all">PAYMENT DETAILS</button>
                   </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-reveal">
                <h2 className="text-4xl font-serif mb-12 italic leading-none">Payment Secure</h2>
                <div className="space-y-10">
                   <div className="p-8 border border-[#C5A059]/20 bg-[#FCFAF8] rounded-xl flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-6">
                         <CreditCard size={32} className="text-[#C5A059]" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-accent font-bold tracking-widest">VISA / MASTERCARD / AMEX</span>
                            <span className="text-[8px] font-accent text-gray-400">SSL SECURED TRANSACTIONS</span>
                         </div>
                      </div>
                      <div className="flex space-x-2">
                         <div className="w-8 h-5 bg-gray-200 rounded"></div>
                         <div className="w-8 h-5 bg-gray-300 rounded"></div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 gap-8">
                      <input placeholder="Cardholder Name" className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      <input placeholder="Card Number" className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <input placeholder="Expiry MM/YY" className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                      <input placeholder="CVV" className="bg-transparent border-b border-black/5 py-4 font-serif text-xl focus:outline-none" />
                   </div>
                   <div className="flex space-x-4 pt-12">
                      <button onClick={prevStep} className="flex-1 border border-black/10 text-[9px] font-accent font-bold py-6 tracking-[0.4em] hover:bg-[#1A1A1A] hover:text-white transition-all">BACK</button>
                      <button onClick={() => alert('Reservation Submitted!')} className="flex-1 bg-[#C5A059] text-white text-[10px] font-accent font-bold py-6 tracking-[0.4em] hover:bg-[#1A1A1A] transition-all shadow-xl shadow-[#C5A059]/20">CONFIRM BOOKING</button>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-48 bg-[#1A1A1A] p-12 text-white border border-white/5">
               <h3 className="text-2xl font-serif mb-12 border-b border-white/5 pb-6">Summary</h3>
               {calculation ? (
                 <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-accent text-white/40 uppercase tracking-widest">Santuary</span>
                      <span className="font-serif text-lg">{ROOMS.find(r => r.type === formData.roomType)?.name}</span>
                   </div>
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-accent text-white/40 uppercase tracking-widest">Nights</span>
                      <span className="font-serif text-lg">{calculation.nights}</span>
                   </div>
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-accent text-white/40 uppercase tracking-widest">Green Tax</span>
                      <span className="font-serif text-lg">${calculation.greenTaxTotal}</span>
                   </div>
                   <div className="pt-12 border-t border-white/10 flex flex-col items-end">
                      <span className="text-[10px] font-accent text-[#C5A059] mb-4">GRAND TOTAL</span>
                      <span className="text-7xl font-serif leading-none">${calculation.grandTotal.toFixed(0)}</span>
                      <span className="text-[8px] font-accent text-white/20 mt-4">INCLUDES TAXES AND FEES</span>
                   </div>
                 </div>
               ) : (
                 <p className="text-white/20 font-light italic text-sm">Define your selection to see the reservation summary.</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Home Component ---

const Home: React.FC = () => {
  return (
    <main className="bg-[#FCFAF8] selection:bg-[#C5A059] selection:text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <img 
          src="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 blur-sm" 
          alt="Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/80 via-transparent to-[#1A1A1A]/90"></div>
        <div className="relative z-10 text-center px-6 mb-24">
          <span className="block text-white/60 text-[10px] font-accent mb-12 animate-fade tracking-[1.5em]">DHIFUSSHI — MALDIVES</span>
          <h1 className="text-[16vw] md:text-[10vw] text-white font-serif leading-[0.8] tracking-tighter mb-16 animate-reveal">
            Quiet <br /> <span className="italic font-light opacity-50 text-white">Luxury</span>
          </h1>
        </div>
        <AvailabilityForm />
      </section>

      {/* Narrative Section */}
      <section className="py-64 bg-white">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
            <div className="lg:col-span-5">
              <span className="text-[#C5A059] text-[10px] font-accent mb-12 block">OUR PHILOSOPHY</span>
              <h2 className="text-6xl md:text-8xl font-serif leading-none tracking-tighter">Pure <br /> <span className="italic">Perspective.</span></h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 pt-12">
               <p className="text-2xl font-light leading-relaxed text-[#1A1A1A] mb-16">
                 Ruka Maldives is more than a boutique guest house; it is a canvas of tranquility. Located on the local island of Dhiffushi, we offer twelve sanctuaries where architecture meets the ocean's breath.
               </p>
               <div className="w-24 h-[1px] bg-[#C5A059]"></div>
            </div>
          </div>
        </div>
      </section>

      <RoomsPreview />
      <DiningSection />
      <InstagramGallery />
      
      {/* Footer Content */}
      <section className="py-48 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-16 border-b border-white/5 pb-24">
              <div className="md:col-span-2">
                 <span className="text-3xl font-serif tracking-[0.4em] mb-8 block">RUKA</span>
                 <p className="text-white/40 font-light max-w-sm leading-relaxed text-sm">
                   A curated island retreat in the heart of Kaafu Atoll. 
                   Focused on the essentials of peace, light, and Maldivian hospitality.
                 </p>
              </div>
              <div className="space-y-6">
                 <span className="text-[10px] font-accent font-bold tracking-widest text-[#C5A059] uppercase">Navigation</span>
                 <ul className="space-y-4 text-xs font-light text-white/60">
                    <li><Link to="/rooms" className="hover:text-white transition-colors">Sanctuaries</Link></li>
                    <li><Link to="/dining" className="hover:text-white transition-colors">Epicurean</Link></li>
                    <li><Link to="/experiences" className="hover:text-white transition-colors">Experiences</Link></li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <span className="text-[10px] font-accent font-bold tracking-widest text-[#C5A059] uppercase">Contact</span>
                 <ul className="space-y-4 text-xs font-light text-white/60">
                    <li>Dhiffushi, Maldives</li>
                    <li>hello@rukamaldives.com</li>
                    <li>+960 777 0000</li>
                 </ul>
              </div>
           </div>
           <div className="pt-12 flex justify-between items-center text-[8px] font-accent text-white/20 uppercase tracking-[0.5em]">
              <span>&copy; 2025 Ruka Boutique</span>
              <div className="flex space-x-8">
                 <a href="#"><Instagram size={14} /></a>
                 <a href="#"><Facebook size={14} /></a>
              </div>
           </div>
        </div>
      </section>
      <Bot />
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
        <Route path="/rooms" element={<RoomsPreview />} />
        <Route path="/dining" element={<DiningSection />} />
        <Route path="/booking" element={<BookingFlow />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
