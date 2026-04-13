import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Upload, Image, User, LogOut } from 'lucide-react';
import Overview      from './Overview';
import UploadArtwork from './UploadArtwork';
import MyArtworks    from './MyArtworks';
import Profile       from './Profile';

const TABS = [
  { id: 'overview',  label: 'Overview',       icon: LayoutDashboard },
  { id: 'upload',    label: 'Upload',         icon: Upload },
  { id: 'artworks',  label: 'My Artworks',    icon: Image },
  { id: 'profile',   label: 'Profile',        icon: User },
];

export default function ArtistDashboard() {
  const { profile, logout } = useAuth();
  const [tab, setTab] = useState('overview');

  const tabComponents = { 
    overview: <Overview />, 
    upload: <UploadArtwork />, 
    artworks: <MyArtworks />, 
    profile: <Profile /> 
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-16 bg-smoke">
      {/* Sidebar - Hidden on Mobile, Sticky on Desktop */}
      <aside className="hidden lg:flex w-64 bg-ink flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto flex-col">
        <div className="px-6 py-8 border-b border-white/5">
          <div className="font-serif text-lg text-white font-light truncate">{profile?.name}</div>
          <div className="text-[10px] text-stone mt-1 tracking-wide uppercase">
            Artist · {profile?.status === 'APPROVED' ? '✓ Approved' : profile?.status}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] rounded-sm mb-1 transition-colors text-left ${
                tab === id ? 'bg-white/10 text-white' : 'text-mist hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} className={tab === id ? 'opacity-100' : 'opacity-50'} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-stone hover:text-white transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header (Shows Profile Info briefly) */}
      <div className="lg:hidden bg-white px-6 py-4 border-b border-ash flex justify-between items-center">
        <div>
          <div className="font-serif text-base text-ink leading-none">{profile?.name}</div>
          <div className="text-[9px] text-stone tracking-widest uppercase mt-1">Dashboard</div>
        </div>
        <button onClick={logout} className="text-stone p-2">
          <LogOut size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 pb-24 lg:pb-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {tabComponents[tab]}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-ink border-t border-white/5 flex justify-around items-center px-2 py-3 z-40">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              tab === id ? 'text-white' : 'text-stone'
            }`}
          >
            <Icon size={20} />
            <span className="text-[9px] tracking-wide uppercase">{id === 'overview' ? 'Home' : label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}