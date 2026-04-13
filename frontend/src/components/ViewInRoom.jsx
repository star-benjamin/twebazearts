import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ViewInRoom({ artwork, onClose }) {
  // Close on Escape key
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
            background: 'linear-gradient(180deg, #d4c9bb 0%, #e8ddd0 60%, #8b7d6b 60%, #6b5e4e 100%)',
          }}
        >
          {/* Wall area */}
          <div className="absolute top-0 left-0 right-0 h-[60%] flex items-center justify-center">
            <div className="relative" style={{ animation: 'hangSettle .4s ease-out' }}>
              {/* Wire */}
              <div className="absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2 w-px h-3 md:h-5 bg-black/25" />
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="object-cover shadow-[0_10px_30px_rgba(0,0,0,.4)] md:shadow-[0_20px_60px_rgba(0,0,0,.4)]"
                // Responsive image sizing: smaller on mobile, standard on desktop
                style={{ 
                  width: window.innerWidth < 768 ? 120 : 200, 
                  height: window.innerWidth < 768 ? 156 : 260 
                }}
              />
            </div>
          </div>

          {/* Floor furniture - Hidden or scaled on very small screens */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] flex items-end justify-center gap-6 md:gap-16 pb-0 overflow-hidden">
            {/* Small Plant Left */}
            <div className="hidden sm:block" style={{ width: 18, height: 40, background: '#5a7a4a', borderRadius: '2px 2px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: -12, width: 42, height: 8, background: '#4a5a3a', borderRadius: '50%' }} />
            </div>
            
            {/* Console Table */}
            <div className="w-32 md:w-[200px]" style={{ height: 45, background: '#8b7d6b', borderRadius: '4px 4px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 0, right: 0, height: 10, background: '#7a6d5e', borderRadius: '3px 3px 0 0' }} />
            </div>

            {/* Small Plant Right */}
            <div className="hidden sm:block" style={{ width: 18, height: 40, background: '#5a7a4a', borderRadius: '2px 2px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: -12, width: 42, height: 8, background: '#4a5a3a', borderRadius: '50%' }} />
            </div>
          </div>

          {/* Label - Smaller on mobile */}
          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 bg-white/90 px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-xs font-sans">
            <span className="font-medium">{artwork.title}</span> · {artwork.size}
          </div>
        </div>

        <p className="text-white/40 text-center mt-6 text-[10px] md:text-xs tracking-wide px-4">
          Preview — approximate scale in a standard room · Press Esc to close
        </p>
      </div>

      <style>{`@keyframes hangSettle { from { transform: rotate(-1.5deg); } to { transform: rotate(0deg); } }`}</style>
    </div>
  );
}