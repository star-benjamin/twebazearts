import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Trash2, Edit } from 'lucide-react';
 
export default function MyArtworks() {
  const { user } = useAuth();
  const qc = useQueryClient();
 
  const { data, isLoading } = useQuery({
    queryKey: ['my-artworks', user?.id],
    queryFn: () => client.get('/artworks', { params: { artist_id: user.id, status: 'ACTIVE' } }).then(r => r.data),
    enabled: !!user,
  });
 
  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/artworks/${id}`),
    onSuccess: () => qc.invalidateQueries(['my-artworks']),
  });
 
  const artworks = data?.items || [];
 
  if (isLoading) return <div className="font-serif text-2xl text-mist animate-pulse">Loading…</div>;
 
  return (
    <div>
      <h2 className="font-serif text-4xl font-light mb-1">My <em>Collection</em></h2>
      <p className="text-sm text-stone mb-8">{artworks.length} active works</p>
 
      {artworks.length === 0 ? (
        <div className="bg-white p-12 text-center">
          <p className="font-serif text-xl text-stone">No artworks yet.</p>
          <p className="text-sm text-mist mt-2">Use the Upload tab to add your first piece.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {artworks.map(a => (
            <div key={a.id} className="bg-white overflow-hidden">
              <img src={a.image_url} alt={a.title} className="w-full aspect-[3/4] object-cover" />
              <div className="p-4">
                <div className="font-serif text-sm mb-1">{a.title}</div>
                <div className="text-xs text-stone mb-3">{a.currency} {Number(a.price).toLocaleString()} · {a.size}</div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 border border-ash py-1.5 text-[10px] tracking-widest uppercase hover:bg-ink hover:text-white hover:border-ink transition-colors">
                    <Edit size={11} /> Edit
                  </button>
                  <button
                    onClick={() => window.confirm('Delete this artwork?') && deleteMutation.mutate(a.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-transparent text-red-400 py-1.5 text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}