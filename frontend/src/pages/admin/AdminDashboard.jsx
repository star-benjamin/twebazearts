import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Image as ImageIcon, BarChart2, LogOut, Check, Ban, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('artists');
  const qc = useQueryClient();

  const { data: artists = [] } = useQuery({
    queryKey: ['admin-artists'],
    queryFn: () => client.get('/admin/artists').then(r => r.data),
  });

  const { data: artworksData } = useQuery({
    queryKey: ['admin-artworks'],
    queryFn: () => client.get('/artworks').then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => client.get('/admin/stats').then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => client.patch(`/admin/artists/${id}/approve`),
    onSuccess: () => qc.invalidateQueries(['admin-artists', 'admin-stats']),
  });

  const banMutation = useMutation({
    mutationFn: (id) => client.patch(`/admin/artists/${id}/ban`),
    onSuccess: () => qc.invalidateQueries(['admin-artists']),
  });

  const deleteArtworkMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/artworks/${id}`),
    onSuccess: () => qc.invalidateQueries(['admin-artworks']),
  });

  const statusBadge = (status) => {
    const map = { 
      APPROVED: 'bg-emerald-50 text-emerald-700', 
      PENDING: 'bg-amber-50 text-amber-700', 
      BANNED: 'bg-red-50 text-red-700' 
    };
    return <span className={`px-2 py-0.5 text-[9px] md:text-[10px] tracking-wide uppercase font-medium ${map[status] || ''}`}>{status}</span>;
  };

  const TABS = [
    { id: 'artists',  label: 'Artists',    icon: Users },
    { id: 'artworks', label: 'Artworks',   icon: ImageIcon },
    { id: 'stats',    label: 'Statistics', icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-16 bg-smoke">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-ink flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] flex-col">
        <div className="px-6 py-8 border-b border-white/5">
          <div className="font-serif text-lg text-white font-light">Admin Panel</div>
          <div className="text-[11px] text-stone mt-1">Full moderation access</div>
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
              <Icon size={16} className="opacity-60" /> 
              <span className="flex-1">{label}</span>
              {id === 'artists' && stats?.pendingArtists > 0 && (
                <span className="bg-gold text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.pendingArtists}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-stone hover:text-white transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white px-6 py-4 border-b border-ash flex justify-between items-center sticky top-16 z-30">
        <h1 className="font-serif text-xl">Admin Panel</h1>
        <button onClick={logout} className="text-stone"><LogOut size={20}/></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* ARTISTS TAB */}
          {tab === 'artists' && (
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-3xl md:text-4xl font-light mb-1">Artist <em>Applications</em></h2>
                <p className="text-sm text-stone">Review and approve artist accounts.</p>
              </div>

              {/* Mobile View: Cards */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {artists.map(a => (
                  <div key={a.id} className="bg-white p-5 border border-ash shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-serif text-lg">{a.name}</div>
                        <div className="text-xs text-stone">{a.email}</div>
                      </div>
                      {statusBadge(a.status)}
                    </div>
                    <div className="text-[11px] text-stone mb-4 uppercase tracking-wider">
                      Works: {a.artworks?.[0]?.count || 0} • Joined: {new Date(a.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {a.status !== 'APPROVED' && (
                        <button onClick={() => approveMutation.mutate(a.id)} className="flex-1 bg-ink text-white py-2.5 text-[10px] uppercase tracking-widest">Approve</button>
                      )}
                      {a.status !== 'BANNED' && (
                        <button onClick={() => banMutation.mutate(a.id)} className="flex-1 border border-ash text-stone py-2.5 text-[10px] uppercase tracking-widest">Ban</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden lg:block overflow-x-auto bg-white border border-ash">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-smoke/50">
                      {['Name','Email','Works','Status','Joined','Actions'].map(h => (
                        <th key={h} className="text-[10px] tracking-widest uppercase text-stone px-6 py-4 text-left border-b border-ash">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ash">
                    {artists.map(a => (
                      <tr key={a.id} className="hover:bg-smoke/30 transition-colors">
                        <td className="px-6 py-4 font-serif text-base">{a.name}</td>
                        <td className="px-6 py-4 text-stone text-sm">{a.email}</td>
                        <td className="px-6 py-4 text-sm">{a.artworks?.[0]?.count || 0}</td>
                        <td className="px-6 py-4">{statusBadge(a.status)}</td>
                        <td className="px-6 py-4 text-stone text-sm">{new Date(a.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {a.status !== 'APPROVED' && (
                              <button onClick={() => approveMutation.mutate(a.id)} className="p-2 bg-ink text-white hover:bg-gold transition-colors" title="Approve"><Check size={14}/></button>
                            )}
                            {a.status !== 'BANNED' && (
                              <button onClick={() => banMutation.mutate(a.id)} className="p-2 border border-ash text-stone hover:bg-red-50 hover:text-red-600 transition-colors" title="Ban"><Ban size={14}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ARTWORKS TAB (Card-style for mobile, table for desktop) */}
          {tab === 'artworks' && (
             <div>
                <h2 className="font-serif text-3xl md:text-4xl font-light mb-8 text-center md:text-left">All <em>Artworks</em></h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {artworksData?.items?.map(a => (
                    <div key={a.id} className="bg-white border border-ash p-3 flex flex-col">
                      <img src={a.image_url} alt="" className="w-full aspect-square object-cover mb-3" />
                      <div className="font-serif text-sm mb-1 truncate">{a.title}</div>
                      <div className="text-[11px] text-stone mb-3 italic">By {a.artist?.name}</div>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-xs font-medium">{a.currency} {Number(a.price).toLocaleString()}</span>
                        <button 
                          onClick={() => window.confirm('Delete?') && deleteArtworkMutation.mutate(a.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* STATS TAB */}
          {tab === 'stats' && (
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Platform <em>Stats</em></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  ['Approved Artists', stats?.totalArtists,  'border-gold'],
                  ['Pending Review',   stats?.pendingArtists,'border-amber-400'],
                  ['Active Artworks',  stats?.totalArtworks, 'border-emerald-500'],
                ].map(([label, val, accent]) => (
                  <div key={label} className={`bg-white p-6 md:p-8 border-l-[4px] shadow-sm ${accent}`}>
                    <div className="font-serif text-4xl md:text-5xl font-light leading-none mb-3">{val ?? '—'}</div>
                    <div className="text-[10px] md:text-[11px] tracking-[.2em] uppercase text-stone">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-ink border-t border-white/5 flex justify-around items-center px-2 py-3 z-40">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 flex-1 transition-colors relative ${
              tab === id ? 'text-white' : 'text-stone'
            }`}
          >
            <Icon size={20} />
            <span className="text-[9px] tracking-wide uppercase">{label}</span>
            {id === 'artists' && stats?.pendingArtists > 0 && (
                <span className="absolute top-0 right-1/4 bg-gold text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-ink">
                  {stats.pendingArtists}
                </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}