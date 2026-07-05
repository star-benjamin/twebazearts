import { NavLink } from 'react-router-dom';
import {
  BarChart2, Image as ImageIcon, Users, Inbox, Wrench,
  ClipboardList, GraduationCap, MessageSquareQuote, Newspaper, Receipt, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',              label: 'Dashboard',    icon: BarChart2 },
  { to: '/admin/artworks',     label: 'Artworks',     icon: ImageIcon },
  { to: '/admin/artists',      label: 'Artists',      icon: Users },
  { to: '/admin/inquiries',    label: 'Inquiries',    icon: Inbox },
  { to: '/admin/commissions',  label: 'Commissions',  icon: Wrench },
  { to: '/admin/projects',     label: 'Projects',     icon: ClipboardList },
  { to: '/admin/classes',      label: 'Classes',      icon: GraduationCap },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/blog',         label: 'Journal',      icon: Newspaper },
  { to: '/admin/payments',     label: 'Payments',     icon: Receipt },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-16 bg-smoke">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-60 bg-ink flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] flex-col">
        <div className="px-6 py-8 border-b border-white/5">
          <div className="font-serif text-lg text-white font-light">Admin Panel</div>
          <div className="text-[11px] text-stone mt-1">Single-admin access</div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-sm mb-1 transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-mist hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={16} className="opacity-60" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-stone hover:text-white transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden bg-white px-6 py-4 border-b border-ash flex justify-between items-center sticky top-16 z-30 overflow-x-auto gap-4">
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            className={({ isActive }) => `text-[11px] uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-ink font-medium' : 'text-stone'}`}>
            {label}
          </NavLink>
        ))}
      </div>

      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
