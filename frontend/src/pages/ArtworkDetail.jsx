import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home } from 'lucide-react';
import client from '../api/client';
import ViewInRoom from '../components/ViewInRoom';
import { generateWhatsAppLink } from '../utils/whatsapp';
 
export default function ArtworkDetail() {
  const { id } = useParams();
  const [showRoom, setShowRoom] = useState(false);
 
  const { data: artwork, isLoading } = useQuery({
    queryKey: ['artwork', id],
    queryFn: () => client.get(`/artworks/${id}`).then(r => r.data),
  });
 
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <span className="font-serif text-3xl text-mist animate-pulse">Loading…</span>
    </div>
  );
 
  if (!artwork) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="font-serif text-xl text-stone">Artwork not found.</p>
    </div>
  );
 
  const waLink = generateWhatsAppLink(artwork.artist?.whatsapp_number, artwork);
 
  return (
    <>
      <div className="grid grid-cols-2 min-h-screen pt-16">
        {/* Left — Image */}
        <div className="sticky top-16 h-[calc(100vh-64px)] bg-smoke flex items-center justify-center p-12">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="max-w-full max-h-full object-contain shadow-[0_40px_80px_rgba(0,0,0,.15)]"
          />
        </div>
 
        {/* Right — Info */}
        <div className="px-14 py-16 overflow-y-auto">
          <Link to="/" className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-stone hover:text-ink transition-colors mb-12">
            ← Back to Gallery
          </Link>
 
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-full bg-ash overflow-hidden">
              {artwork.artist?.profile_image_url && (
                <img src={artwork.artist.profile_image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <span className="text-[11px] tracking-[.1em] uppercase text-stone">{artwork.artist?.name}</span>
          </div>
 
          <h1 className="font-serif text-[clamp(28px,3vw,44px)] font-light leading-tight mb-5">{artwork.title}</h1>
 
          <div className="flex gap-8 py-6 border-y border-ash mb-8">
            {[['Medium', artwork.medium], ['Size', artwork.size], ['Year', artwork.year]].map(([label, val]) => val && (
              <div key={label}>
                <div className="text-[10px] tracking-[.12em] uppercase text-stone mb-1">{label}</div>
                <div className="font-serif text-lg">{val}</div>
              </div>
            ))}
          </div>
 
          <div className="font-serif text-4xl font-light mb-2">
            {artwork.currency} {Number(artwork.price).toLocaleString()}
          </div>
          <p className="text-[11px] tracking-wide text-stone mb-8">Price does not include framing or delivery</p>
 
          {artwork.description && (
            <p className="text-sm text-stone leading-[1.9] mb-10">{artwork.description}</p>
          )}
 
          <div className="flex flex-col gap-3">
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 bg-[#25d366] text-white py-4 text-[12px] tracking-widest uppercase hover:bg-[#128c7e] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Inquire via WhatsApp
              </a>
            ) : (
              <p className="text-sm text-stone italic">Contact not available for this artist.</p>
            )}
            <button
              onClick={() => setShowRoom(true)}
              className="flex items-center justify-center gap-2.5 border border-ink text-ink py-4 text-[12px] tracking-widest uppercase hover:bg-ink hover:text-white transition-colors"
            >
              <Home size={15} /> View in Room
            </button>
          </div>
        </div>
      </div>
 
      {showRoom && <ViewInRoom artwork={artwork} onClose={() => setShowRoom(false)} />}
    </>
  );
}