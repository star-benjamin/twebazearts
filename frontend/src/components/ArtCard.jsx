import { Link } from 'react-router-dom';
import { MessageCircle, Expand } from 'lucide-react';
import { generateWhatsAppLink } from '../utils/whatsapp';
 
export default function ArtCard({ artwork, onViewInRoom }) {
  const waLink = generateWhatsAppLink(artwork.artist?.whatsapp_number, artwork);
 
  return (
    <div className="group relative bg-white overflow-hidden cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-smoke">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-6">
          <Link
            to={`/artwork/${artwork.id}`}
            className="w-full text-center py-2.5 bg-white text-ink text-[11px] tracking-widest uppercase hover:bg-gold hover:text-white transition-colors"
          >
            View Work
          </Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25d366] text-white text-[11px] tracking-widest uppercase"
            >
              <MessageCircle size={13} /> Inquire
            </a>
          )}
          <button
            onClick={() => onViewInRoom?.(artwork)}
            className="flex items-center gap-2 text-white/60 text-[10px] tracking-widest uppercase mt-1 hover:text-white transition-colors"
          >
            <Expand size={11} /> View in Room
          </button>
        </div>
      </div>
 
      {/* Info */}
      <div className="p-5 pb-6">
        <p className="text-[10px] tracking-[.12em] uppercase text-stone mb-1">{artwork.artist?.name}</p>
        <h3 className="font-serif text-lg leading-tight mb-2">{artwork.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {artwork.currency} {Number(artwork.price).toLocaleString()}
          </span>
          <span className="text-xs text-mist">{artwork.size}</span>
        </div>
      </div>
    </div>
  );
}