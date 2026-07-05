import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { artistApi } from '../../api/artist.api';

export default function ArtistProfile() {
  const { id } = useParams();
  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistApi.detail(id),
  });

  if (isLoading) return <div className="min-h-screen pt-16 flex items-center justify-center text-stone">Loading…</div>;
  if (!artist) return <div className="min-h-screen pt-16 flex items-center justify-center text-stone">Artist not found.</div>;

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20">
      <Link to="/artists" className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-stone hover:text-ink mb-10">
        <ArrowLeft size={14} /> All Artists
      </Link>

      <div className="flex flex-col md:flex-row gap-10 mb-16">
        <div className="w-40 h-40 rounded-full bg-smoke overflow-hidden flex-shrink-0">
          {artist.profile_image_url && <img src={artist.profile_image_url} alt={artist.full_name} className="w-full h-full object-cover" />}
        </div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-light mb-2">
            {artist.full_name} {artist.verified && <span className="text-gold text-sm align-middle">· Verified</span>}
          </h1>
          {artist.specializations?.length > 0 && (
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">{artist.specializations.join(' · ')}</p>
          )}
          <p className="text-sm text-stone leading-relaxed max-w-2xl">{artist.biography}</p>
        </div>
      </div>

      <h2 className="font-serif text-2xl font-light mb-6">Works</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(artist.artworks || []).map((a) => {
          const img = a.images?.find((i) => i.is_primary) || a.images?.[0];
          return (
            <Link key={a.id} to={`/artwork/${a.id}`} className="group">
              <div className="aspect-[3/4] bg-smoke overflow-hidden mb-2">
                {img && <img src={img.url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
              </div>
              <p className="text-sm font-serif truncate">{a.title}</p>
            </Link>
          );
        })}
        {(!artist.artworks || artist.artworks.length === 0) && (
          <p className="text-sm text-stone col-span-full">No published works yet.</p>
        )}
      </div>
    </div>
  );
}
