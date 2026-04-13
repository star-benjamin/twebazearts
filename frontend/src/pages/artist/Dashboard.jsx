import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Upload, Image, Briefcase, User } from 'lucide-react';
import Overview      from './Overview';
import UploadArtwork from './UploadArtwork';
import MyArtworks    from './MyArtworks';
import Profile       from './Profile';
 
const TABS = [
  { id: 'overview',  label: 'Overview',       icon: LayoutDashboard },
  { id: 'upload',    label: 'Upload Artwork',  icon: Upload },
  { id: 'artworks',  label: 'My Artworks',     icon: Image },
  { id: 'profile',   label: 'Profile',         icon: User },
];
 
export default function ArtistDashboard() {
  const { profile, logout } = useAuth();
  const [tab, setTab] = useState('overview');
 
  const tabComponents = { overview: <Overview />, upload: <UploadArtwork />, artworks: <MyArtworks />, profile: <Profile /> };
 
  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-56 bg-ink flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="px-6 py-8">
          <div className="font-serif text-lg text-white font-light">{profile?.name}</div>
          <div className="text-[11px] text-stone mt-1 tracking-wide">
            Artist · {profile?.status === 'APPROVED' ? '✓ Approved' : profile?.status}
          </div>
        </div>
 
        <nav className="px-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-sm mb-0.5 transition-colors text-left ${
                tab === id ? 'bg-white/10 text-white' : 'text-mist hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={15} className="opacity-60" /> {label}
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-stone hover:text-white transition-colors mt-4"
          >
            Sign Out
          </button>
        </nav>
      </aside>
 
      {/* Main */}
      <main className="flex-1 bg-smoke p-12 overflow-y-auto">
        {tabComponents[tab]}
      </main>
    </div>
  );
}