import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Image, BarChart2 } from 'lucide-react';
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
    const map = { APPROVED: 'bg-emerald-50 text-emerald-700', PENDING: 'bg-amber-50 text-amber-700', BANNED: 'bg-red-50 text-red-700' };
    return <span className={`px-2.5 py-0.5 text-[10px] tracking-wide uppercase ${map[status] || ''}`}>{status}</span>;
  };
 
  const TABS = [
    { id: 'artists',  label: 'Artists',    icon: Users },
    { id: 'artworks', label: 'Artworks',   icon: Image },
    { id: 'stats',    label: 'Statistics', icon: BarChart2 },
  ];
 
  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-56 bg-ink flex-shrink-0 sticky top-16 h-[calc(100vh-64px)]">
        <div className="px-6 py-8">
          <div className="font-serif text-lg text-white font-light">Admin Panel</div>
          <div className="text-[11px] text-stone mt-1">Full moderation access</div>
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
              {id === 'artists' && stats?.pendingArtists > 0 && (
                <span className="ml-auto bg-gold text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.pendingArtists}</span>
              )}
            </button>
          ))}
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-stone hover:text-white mt-4">
            Sign Out
          </button>
        </nav>
      </aside>
 
      {/* Main */}
      <main className="flex-1 bg-smoke p-12 overflow-y-auto">
 
        {/* ARTISTS TAB */}
        {tab === 'artists' && (
          <div>
            <h2 className="font-serif text-4xl font-light mb-1">Artist <em>Applications</em></h2>
            <p className="text-sm text-stone mb-8">Review and approve artist accounts.</p>
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr>{['Name','Email','Works','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-[10px] tracking-[.12em] uppercase text-stone px-5 py-4 text-left border-b-2 border-ash">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {artists.map(a => (
                  <tr key={a.id} className="hover:bg-smoke transition-colors">
                    <td className="px-5 py-4 font-serif text-base">{a.name}</td>
                    <td className="px-5 py-4 text-stone text-sm">{a.email}</td>
                    <td className="px-5 py-4 text-sm">{a.artworks?.[0]?.count || 0}</td>
                    <td className="px-5 py-4">{statusBadge(a.status)}</td>
                    <td className="px-5 py-4 text-stone text-sm">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {a.status !== 'APPROVED' && (
                          <button onClick={() => approveMutation.mutate(a.id)}
                            className="px-3 py-1.5 bg-ink text-white text-[10px] tracking-widest uppercase hover:bg-gold transition-colors">
                            Approve
                          </button>
                        )}
                        {a.status !== 'BANNED' && (
                          <button onClick={() => banMutation.mutate(a.id)}
                            className="px-3 py-1.5 border border-ash text-stone text-[10px] tracking-widest uppercase hover:bg-stone hover:text-white transition-colors">
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* ARTWORKS TAB */}
        {tab === 'artworks' && (
          <div>
            <h2 className="font-serif text-4xl font-light mb-1">All <em>Artworks</em></h2>
            <p className="text-sm text-stone mb-8">Manage all platform listings.</p>
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr>{['','Title','Artist','Price','Actions'].map(h => (
                  <th key={h} className="text-[10px] tracking-[.12em] uppercase text-stone px-5 py-4 text-left border-b-2 border-ash">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {artworksData?.items?.map(a => (
                  <tr key={a.id} className="hover:bg-smoke transition-colors">
                    <td className="px-5 py-3 w-12">
                      <img src={a.image_url} alt="" className="w-10 h-12 object-cover" />
                    </td>
                    <td className="px-5 py-3 font-serif">{a.title}</td>
                    <td className="px-5 py-3 text-stone text-sm">{a.artist?.name}</td>
                    <td className="px-5 py-3 text-sm">{a.currency} {Number(a.price).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => window.confirm('Delete this artwork?') && deleteArtworkMutation.mutate(a.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-400 text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* STATS TAB */}
        {tab === 'stats' && (
          <div>
            <h2 className="font-serif text-4xl font-light mb-8">Platform <em>Statistics</em></h2>
            <div className="grid grid-cols-3 gap-5">
              {[
                ['Approved Artists', stats?.totalArtists,  'border-gold'],
                ['Pending Review',   stats?.pendingArtists,'border-amber-400'],
                ['Active Artworks',  stats?.totalArtworks, 'border-emerald-500'],
              ].map(([label, val, accent]) => (
                <div key={label} className={`bg-white p-7 border-l-[3px] ${accent}`}>
                  <div className="font-serif text-5xl font-light leading-none">{val ?? '—'}</div>
                  <div className="text-[11px] tracking-widest uppercase text-stone mt-3">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}