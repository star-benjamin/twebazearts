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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <span className="font-serif text-2xl text-mist animate-pulse">Loading collection…</span>
    </div>
  );

  return (
    <div>
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-1">My <em>Collection</em></h2>
        <p className="text-[11px] md:text-sm text-stone uppercase tracking-widest">{artworks.length} active works</p>
      </div>

      {artworks.length === 0 ? (
        <div className="bg-white p-8 md:p-12 text-center border border-ash">
          <p className="font-serif text-xl text-stone">No artworks yet.</p>
          <p className="text-sm text-mist mt-2">Use the Upload tab to add your first piece.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {artworks.map(a => (
            <div key={a.id} className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[3/4] bg-smoke overflow-hidden">
                <img 
                  src={a.image_url} 
                  alt={a.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                />
              </div>
              <div className="p-5">
                <div className="font-serif text-base mb-1 truncate">{a.title}</div>
                <div className="text-xs text-stone mb-4">
                  {a.currency} {Number(a.price).toLocaleString()} · {a.size}
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 border border-ash py-2.5 text-[10px] tracking-widest uppercase hover:bg-ink hover:text-white hover:border-ink transition-colors">
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => window.confirm('Are you sure you want to delete this artwork?') && deleteMutation.mutate(a.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-100 text-red-500 py-2.5 text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={12} /> Delete
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