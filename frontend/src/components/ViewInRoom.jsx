import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ViewInRoom({ artwork, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!artwork) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:right-8 text-white/60 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div onClick={(e) => e.stopPropagation()} className="w-full flex flex-col items-center">
        {/* Room scene */}
        <div
          className="relative w-[95vw] md:w-[80vw] max-w-4xl overflow-hidden shadow-2xl"
          style={{
            aspectRatio: '16/9',
            backgroundImage: 'url(/room-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          {/* Dark overlay to help artwork stand out against busy backgrounds */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Artwork hanging on wall — positioned upper-center */}
          <div className="absolute top-[8%] left-0 right-0 flex items-start justify-center">
            <div className="relative" style={{ animation: 'hangSettle .4s ease-out forwards' }}>
              {/* Wire */}
              <div className="absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2 w-px h-3 md:h-5 bg-black/40" />

              {/* Frame shadow + artwork */}
              <div
                className="relative"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.3), inset 0 0 0 6px #f5f0e8, inset 0 0 0 8px #c8b89a',
                  padding: 8,
                  background: '#f5f0e8',
                }}
              >
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="object-cover block"
                  style={{
                    width:  window.innerWidth < 768 ? 110 : 180,
                    height: window.innerWidth < 768 ? 140 : 230,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Label — bottom left */}
          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-xs font-sans shadow-sm">
            <span className="font-medium">{artwork.title}</span>
            {artwork.size && <span className="text-stone-400"> · {artwork.size}</span>}
          </div>
        </div>

        <p className="text-white/40 text-center mt-4 text-[10px] md:text-xs tracking-wide px-4">
          Preview — approximate scale in a standard room · Press Esc to close
        </p>
      </div>

      <style>{`
        @keyframes hangSettle {
          from { transform: rotate(-1.5deg) translateY(-4px); }
          to   { transform: rotate(0deg)   translateY(0); }
        }
      `}</style>
    </div>
  );
}