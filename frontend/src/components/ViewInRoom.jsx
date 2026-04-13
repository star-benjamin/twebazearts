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
      className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-white/60 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>
 
      <div onClick={(e) => e.stopPropagation()}>
        {/* Room scene */}
        <div
          className="relative w-[80vw] max-w-4xl overflow-hidden"
          style={{
            aspectRatio: '16/9',
            background: 'linear-gradient(180deg, #d4c9bb 0%, #e8ddd0 60%, #8b7d6b 60%, #6b5e4e 100%)',
          }}
        >
          {/* Wall area */}
          <div className="absolute top-0 left-0 right-0 h-[60%] flex items-center justify-center">
            <div className="relative" style={{ animation: 'hangSettle .4s ease-out' }}>
              {/* Wire */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-px h-5 bg-black/25" />
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="object-cover shadow-[0_20px_60px_rgba(0,0,0,.4)]"
                style={{ width: 200, height: 260 }}
              />
            </div>
          </div>
 
          {/* Floor furniture */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] flex items-end justify-center gap-16 pb-0">
            <div style={{ width: 24, height: 56, background: '#5a7a4a', borderRadius: '2px 2px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: -16, width: 56, height: 10, background: '#4a5a3a', borderRadius: '50%' }} />
            </div>
            <div style={{ width: 200, height: 72, background: '#8b7d6b', borderRadius: '4px 4px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -14, left: 0, right: 0, height: 14, background: '#7a6d5e', borderRadius: '3px 3px 0 0' }} />
            </div>
            <div style={{ width: 24, height: 56, background: '#5a7a4a', borderRadius: '2px 2px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: -16, width: 56, height: 10, background: '#4a5a3a', borderRadius: '50%' }} />
            </div>
          </div>
 
          {/* Label */}
          <div className="absolute bottom-5 left-5 bg-white/90 px-3 py-2 text-xs font-sans">
            {artwork.title} · {artwork.size}
          </div>
        </div>
 
        <p className="text-white/40 text-center mt-4 text-xs tracking-wide">
          Preview — approximate scale in a standard room · Press Esc to close
        </p>
      </div>
 
      <style>{`@keyframes hangSettle { from { transform: rotate(-1.5deg); } to { transform: rotate(0deg); } }`}</style>
    </div>
  );
}