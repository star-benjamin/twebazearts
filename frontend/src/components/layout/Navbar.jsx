import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const active = (path) =>
    location.pathname === path ? 'text-ink border-b border-ink' : 'text-stone hover:text-ink';

  const NavLinks = () => (
    <>
      <Link 
        to="/" 
        onClick={() => setIsOpen(false)}
        className={`text-xs tracking-widest uppercase transition-colors ${active('/')}`}
      >
        Gallery
      </Link>
      <Link 
        to="/services" 
        onClick={() => setIsOpen(false)}
        className={`text-xs tracking-widest uppercase transition-colors ${active('/services')}`}
      >
        Services
      </Link>
      <Link 
        to="/about" 
        onClick={() => setIsOpen(false)}
        className={`text-xs tracking-widest uppercase transition-colors ${active('/about')}`}
      >
        About
      </Link>

      {user ? (
        <>
          {profile?.role === 'ARTIST' && (
            <Link 
              to="/dashboard" 
              onClick={() => setIsOpen(false)}
              className={`text-xs tracking-widest uppercase transition-colors ${active('/dashboard')}`}
            >
              Dashboard
            </Link>
          )}
          {profile?.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              onClick={() => setIsOpen(false)}
              className="text-xs tracking-widest uppercase bg-ink text-white px-4 py-2 hover:bg-gold transition-colors text-center"
            >
              Admin
            </Link>
          )}
          <button 
            onClick={() => { logout(); setIsOpen(false); }} 
            className="text-xs tracking-widest uppercase text-stone hover:text-ink transition-colors text-left"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link 
            to="/login" 
            onClick={() => setIsOpen(false)}
            className={`text-xs tracking-widest uppercase transition-colors ${active('/login')}`}
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            onClick={() => setIsOpen(false)}
            className="text-xs tracking-widest uppercase bg-ink text-white px-4 py-2 hover:bg-gold transition-colors text-center"
          >
            Join as Artist
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-ash h-16">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 md:px-10">
        <Link to="/" className="font-serif text-xl font-light tracking-wide">
          TWEBAZE<span className="text-gold">arts</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-ink p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-px bg-ink mb-1.5 transition-all"></div>
          <div className="w-6 h-px bg-ink mb-1.5 transition-all"></div>
          <div className="w-6 h-px bg-ink transition-all"></div>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-ash flex flex-col p-6 gap-6 shadow-xl">
          <NavLinks />
        </div>
      )}
    </nav>
  );
}