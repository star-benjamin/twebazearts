import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
 
export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const active = (path) => location.pathname === path ? 'text-ink border-b border-ink' : 'text-stone hover:text-ink';
 
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-ash h-16 flex items-center justify-between px-10">
      <Link to="/" className="font-serif text-xl font-light tracking-wide">
        TWEBAZE<span className="text-gold">arts</span>
      </Link>
 
      <div className="flex items-center gap-8">
        <Link to="/"         className={`text-xs tracking-widest uppercase transition-colors ${active('/')}`}>Gallery</Link>
        <Link to="/services" className={`text-xs tracking-widest uppercase transition-colors ${active('/services')}`}>Services</Link>
        <Link to="/about"    className={`text-xs tracking-widest uppercase transition-colors ${active('/about')}`}>About</Link>
 
        {user ? (
          <>
            {profile?.role === 'ARTIST' && (
              <Link to="/dashboard" className={`text-xs tracking-widest uppercase transition-colors ${active('/dashboard')}`}>Dashboard</Link>
            )}
            {profile?.role === 'ADMIN' && (
              <Link to="/admin" className="text-xs tracking-widest uppercase bg-ink text-white px-4 py-2 hover:bg-gold transition-colors">Admin</Link>
            )}
            <button onClick={logout} className="text-xs tracking-widest uppercase text-stone hover:text-ink transition-colors">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className={`text-xs tracking-widest uppercase transition-colors ${active('/login')}`}>Sign In</Link>
            <Link to="/register" className="text-xs tracking-widest uppercase bg-ink text-white px-4 py-2 hover:bg-gold transition-colors">
              Join as Artist
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}