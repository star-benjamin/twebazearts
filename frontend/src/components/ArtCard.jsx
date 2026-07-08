import { Link } from 'react-router-dom';
import SizeBadge from './ui/SizeBadge';

export default function ArtCard({ artwork }) {
  const primaryImage = artwork.images?.find((i) => i.is_primary) || artwork.images?.[0];
  const imageUrl = primaryImage?.webp_url || primaryImage?.url;

  return (
    <Link
      to={`/artwork/${artwork.id}`}
      className="group relative bg-white overflow-hidden border border-transparent hover:border-ash transition-colors block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-smoke">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artwork.title}
            className="w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={{ maxHeight: '420px', minHeight: '200px' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mist text-xs uppercase tracking-widest">
            No image
          </div>
        )}

        {artwork.tracking_status && artwork.tracking_status !== 'AVAILABLE' && (
          <span className="absolute top-3 left-3 bg-ink text-white text-[9px] tracking-widest uppercase px-2 py-1">
            {artwork.tracking_status}
          </span>
        )}

        <span className="absolute top-3 right-3">
          <SizeBadge artwork={artwork} className="bg-white/90 border-transparent" />
        </span>
      </div>

      <div className="p-4 md:p-5 pb-6">
        <p className="text-[9px] md:text-[10px] tracking-[.12em] uppercase text-stone mb-1">
          {artwork.artist?.full_name || 'Twebaze Art Studio'}
        </p>
        <h3 className="font-serif text-base md:text-lg leading-tight mb-2 truncate group-hover:text-gold transition-colors">
          {artwork.title}
        </h3>
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs md:text-sm font-medium whitespace-nowrap">
            {artwork.price != null ? `${artwork.currency || 'UGX'} ${Number(artwork.price).toLocaleString()}` : 'Price on request'}
          </span>
          <span className="text-[10px] md:text-xs text-mist truncate">
            {[artwork.dimensions_h_cm, artwork.dimensions_w_cm].filter(Boolean).join(' x ')}
            {artwork.dimensions_h_cm ? ' cm' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
