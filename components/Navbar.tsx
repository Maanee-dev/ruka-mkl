
import React, { useState, useEffect } from 'react';
// Fix: Use named imports from react-router-dom as the property-based namespace access is not working.
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { COLORS } from '../constants';

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
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'Experiences', path: '/experiences' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isDark = isScrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isDark ? 'glass py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif text-xl font-bold" style={{ backgroundColor: COLORS.turquoise }}>R</div>
          <span className={`text-2xl font-serif font-bold ${isDark ? 'text-[#006B6B]' : 'text-white'}`}>Ruka Maldives</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`font-medium hover:text-[#40E0D0] transition-colors ${isDark ? 'text-[#2C3E50]' : 'text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/booking" 
            className="px-6 py-2 rounded-full font-accent font-semibold transition-all hover:scale-105 active:scale-95 text-white shadow-lg"
            style={{ backgroundColor: COLORS.coral }}
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-[#2C3E50]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {/* Fix: COLORS.deepOcean was not defined in constants.tsx; using COLORS.deepDark instead. */}
          {isMenuOpen ? <X size={28} /> : <Menu size={28} color={isDark ? COLORS.deepDark : 'white'} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="p-6 flex flex-col space-y-4 shadow-xl">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-[#2C3E50] text-lg font-medium">
              {link.name}
            </Link>
          ))}
          <Link 
            to="/booking" 
            onClick={() => setIsMenuOpen(false)}
            className="w-full py-3 rounded-lg text-center text-white font-bold" 
            style={{ backgroundColor: COLORS.coral }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
