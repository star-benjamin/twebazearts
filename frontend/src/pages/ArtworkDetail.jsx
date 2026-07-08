import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { artworkApi } from '../api/artwork.api';
import ArtworkPreview from '../components/artwork-detail/ArtworkPreview';
import SizeBadge from '../components/ui/SizeBadge';
import InquiryForm from '../components/InquiryForm';

export default function ArtworkDetail() {
  const { id } = useParams();
  const [showInquiry, setShowInquiry] = useState(false);

  const { data: artwork, isLoading } = useQuery({
    queryKey: ['artwork', id],
    queryFn: () => artworkApi.detail(id),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <span className="font-serif text-2xl md:text-3xl text-mist animate-pulse">Loading…</span>
    </div>
  );

  if (!artwork) return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-6 text-center">
      <p className="font-serif text-xl text-stone">Artwork not found.</p>
    </div>
  );

  const primaryImage = artwork.images?.find((i) => i.is_primary) || artwork.images?.[0];
  const dims = [artwork.dimensions_h_cm, artwork.dimensions_w_cm, artwork.dimensions_d_cm]
    .filter(Boolean).join(' x ');

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen pt-16">
        {/* Left — Preview: swaps between Artwork / Room / Furniture / Person without navigating away */}
        <ArtworkPreview artwork={artwork} imageUrl={primaryImage?.webp_url || primaryImage?.url} />

        {/* Right — Info */}
        <div className="px-6 md:px-10 lg:px-14 py-10 md:py-16">
          <Link to="/" className="flex items-center gap-2 text-[10px] md:text-[11px] tracking-widest uppercase text-stone hover:text-ink transition-colors mb-8 md:mb-12">
            <ArrowLeft size={14} /> Back to Gallery
          </Link>

          {artwork.artist && (
            <Link to={`/artists/${artwork.artist.id}`} className="flex items-center gap-3 mb-6 md:mb-7 w-fit">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-ash overflow-hidden">
                {artwork.artist.profile_image_url && (
                  <img src={artwork.artist.profile_image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-[10px] md:text-[11px] tracking-[.1em] uppercase text-stone">
                {artwork.artist.full_name}{artwork.artist.verified && ' · Verified'}
              </span>
            </Link>
          )}

          <div className="flex items-center gap-3 mb-5">
            <h1 className="font-serif text-[clamp(24px,4vw,44px)] font-light leading-tight">{artwork.title}</h1>
            <SizeBadge artwork={artwork} />
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 py-6 border-y border-ash mb-8">
            {[
              ['Medium', artwork.medium],
              ['Style', artwork.style],
              ['Dimensions', dims ? `${dims} cm` : null],
              ['Category', artwork.category?.name],
            ].map(([label, val]) => val && (
              <div key={label} className="min-w-[80px]">
                <div className="text-[9px] md:text-[10px] tracking-[.12em] uppercase text-stone mb-1">{label}</div>
                <div className="font-serif text-base md:text-lg">{val}</div>
              </div>
            ))}
          </div>

          <div className="font-serif text-3xl md:text-4xl font-light mb-2">
            {artwork.price != null ? `${artwork.currency || 'UGX'} ${Number(artwork.price).toLocaleString()}` : 'Price on request'}
          </div>
          <p className="text-[10px] md:text-[11px] tracking-wide text-stone mb-8">
            {artwork.tracking_status === 'AVAILABLE' ? 'Available' : artwork.tracking_status}
          </p>

          {artwork.story && (
            <div className="mb-10 max-w-prose">
              <div className="text-[9px] md:text-[10px] tracking-[.12em] uppercase text-stone mb-2">The Story</div>
              <p className="text-sm text-stone leading-[1.9]">{artwork.story}</p>
            </div>
          )}

          {/* Action Buttons — structured inquiry replaces direct WhatsApp linking
              so every lead flows through the Module 3 pipeline (FR-INQ-002) */}
          <div className="flex flex-col gap-3 sm:max-w-md">
            {!showInquiry ? (
              <button
                onClick={() => setShowInquiry(true)}
                className="flex items-center justify-center gap-2.5 bg-ink text-white py-4 text-[11px] md:text-[12px] tracking-widest uppercase hover:bg-gold transition-colors"
              >
                Inquire About This Piece
              </button>
            ) : (
              <InquiryForm artworkId={artwork.id} defaultClassification="ARTWORK_PURCHASE" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
