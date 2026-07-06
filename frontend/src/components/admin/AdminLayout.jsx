import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart2, Image as ImageIcon, Users, Inbox, Wrench,
  ClipboardList, GraduationCap, MessageSquareQuote, Newspaper, Receipt,
  LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/admin.api';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: BarChart2 },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/artworks', label: 'Artworks', icon: ImageIcon },
      { to: '/admin/artists',  label: 'Artists',  icon: Users },
      { to: '/admin/blog',     label: 'Journal',  icon: Newspaper },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/inquiries',   label: 'Inquiries',   icon: Inbox, badgeKey: 'new' },
      { to: '/admin/commissions', label: 'Commissions', icon: Wrench },
      { to: '/admin/projects',    label: 'Projects',    icon: ClipboardList },
      { to: '/admin/classes',     label: 'Classes',     icon: GraduationCap },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { to: '/admin/payments',     label: 'Payments',     icon: Receipt },
    ],
  },
];

function NavItem({ to, label, icon: Icon, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 pl-3 pr-3 py-2 text-[13px] mb-0.5 transition-colors border-l-2 ${
          isActive
            ? 'border-gold bg-gold/10 text-white'
            : 'border-transparent text-mist hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={isActive ? 'text-gold' : 'opacity-50'} />
          <span className="flex-1">{label}</span>
          {badge > 0 && (
            <span className="text-[10px] leading-none bg-gold/15 text-gold px-1.5 py-1 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ badgeCounts, onNavigate, logout }) {
  return (
    <>
      <div className="px-6 py-7 border-b border-white/5">
        <div className="font-serif text-lg text-white font-light">Admin Panel</div>
        <div className="text-[11px] text-stone mt-0.5">TwebazeArtStudio</div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} className="mb-1">
            <div className="text-[10px] tracking-[.14em] uppercase text-stone/70 px-3 pt-3 pb-1.5">
              {label}
            </div>
            {items.map(({ to, label: itemLabel, icon, badgeKey }) => (
              <NavItem
                key={to}
                to={to}
                label={itemLabel}
                icon={icon}
                badge={badgeKey ? badgeCounts?.[badgeKey] : undefined}
                onClick={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gold/15 text-gold text-[11px] flex items-center justify-center flex-shrink-0">
          SA
        </div>
        <div className="flex-1 min-w-0 text-[12px] text-mist truncate">Studio admin</div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="text-stone hover:text-white transition-colors p-1"
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Shares the 'admin-dashboard' query key/cache with AdminDashboard —
  // this won't trigger a second network request if that page has already
  // fetched it, react-query just reuses the cached data.
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
  });

  const badgeCounts = { new: stats?.inquiries?.new };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-16 bg-smoke">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-60 bg-ink flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] flex-col">
        <SidebarContent badgeCounts={badgeCounts} logout={logout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden bg-white px-4 py-3 border-b border-ash flex justify-between items-center sticky top-16 z-30">
        <span className="font-serif text-base font-light text-ink">Admin Panel</span>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-ink"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-ink flex flex-col h-full">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute top-6 right-4 text-stone hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent
              badgeCounts={badgeCounts}
              onNavigate={() => setDrawerOpen(false)}
              logout={logout}
            />
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}