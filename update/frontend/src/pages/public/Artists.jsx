import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { artistApi } from '../../api/artist.api';

export default function Artists() {
  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists', 'directory'],
    queryFn: () => artistApi.list(),
  });

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20">
      <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-12">
        Our <em>Artists</em>
      </h1>

      {isLoading ? (
        <p className="text-stone text-sm">Loading…</p>
      ) : artists.length === 0 ? (
        <p className="text-stone text-sm">No verified artists to show yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Link key={artist.id} to={`/artists/${artist.id}`} className="group">
              <div className="aspect-square bg-smoke overflow-hidden mb-4">
                {artist.profile_image_url && (
                  <img src={artist.profile_image_url} alt={artist.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <h3 className="font-serif text-lg mb-1">
                {artist.full_name} {artist.verified && <span className="text-gold text-xs align-middle">· Verified</span>}
              </h3>
              <p className="text-xs text-stone line-clamp-2">{artist.biography}</p>
              <p className="text-[10px] text-mist uppercase tracking-widest mt-2">
                {artist.artworks?.[0]?.count || 0} works
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
