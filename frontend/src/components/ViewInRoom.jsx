import { useEffect, useRef, useState } from 'react';
import { X, ImageOff } from 'lucide-react';

// Reference points used to size the artwork realistically against the room.
// WALL_HEIGHT_CM is the total visible wall height the scene represents
// (a typical floor-to-ceiling span); DOOR_HEIGHT_CM anchors the doorway
// graphic so users have something familiar to judge scale against.
const WALL_HEIGHT_CM = 260;
const DOOR_HEIGHT_CM = 210;

const FRAME_STYLES = {
  black: { label: 'Black frame', border: '#1c1a17', mat: '#f5f0e8' },
  oak:   { label: 'Oak frame',   border: '#8a6a48', mat: '#f5f0e8' },
  none:  { label: 'No frame',    border: 'transparent', mat: 'transparent' },
};

export default function ViewInRoom({ artwork, onClose }) {
  const [frameStyle, setFrameStyle] = useState('black');
  const [imgStatus, setImgStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const closeButtonRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => previouslyFocused.current?.focus?.();
  }, []);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!artwork) return null;

  const primaryImage = artwork.images?.find((i) => i.is_primary) || artwork.images?.[0];
  const imageUrl = primaryImage?.webp_url || primaryImage?.url || artwork.image_url;
  const dims = [artwork.dimensions_h_cm, artwork.dimensions_w_cm].filter(Boolean).join(' x ');

  const hasRealDims = artwork.dimensions_h_cm > 0 && artwork.dimensions_w_cm > 0;
  const heightCm = hasRealDims ? artwork.dimensions_h_cm : 60; // sensible fallback
  const widthCm  = hasRealDims ? artwork.dimensions_w_cm : 80;

  // Cap so an unusually large piece never overruns the visible scene.
  const heightPercent = Math.min((heightCm / WALL_HEIGHT_CM) * 100, 78);
  const doorHeightPercent = (DOOR_HEIGHT_CM / WALL_HEIGHT_CM) * 100;
  const frame = FRAME_STYLES[frameStyle];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`View ${artwork.title} in a room`}
    >
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close preview"
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
          <div className="absolute inset-0 bg-black/10" />

          {/* Doorway — fixed real-world reference so scale reads as trustworthy */}
          <div
            className="absolute left-[6%] bottom-0 bg-black/10 border border-black/20"
            style={{ width: '14%', height: `${doorHeightPercent}%` }}
          >
            <span className="absolute -bottom-5 left-0 text-[10px] text-white/50 whitespace-nowrap">
              {DOOR_HEIGHT_CM}cm door
            </span>
          </div>

          {/* Artwork hanging on wall */}
          <div className="absolute top-[10%] left-0 right-0 flex items-start justify-center">
            <div className="relative" style={{ animation: 'hangSettle .4s ease-out forwards' }}>
              <div className="absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2 w-px h-3 md:h-5 bg-black/40" />

              <div
                className="relative"
                style={{
                  boxShadow: frameStyle === 'none' ? 'none' : '0 8px 32px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.3)',
                  padding: frameStyle === 'none' ? 0 : 8,
                  background: frame.mat,
                  border: frameStyle === 'none' ? 'none' : `6px solid ${frame.border}`,
                }}
              >
                <div
                  className="relative bg-stone-200 flex items-center justify-center"
                  style={{
                    height: `min(${heightPercent}vh, 42vh)`,
                    aspectRatio: `${widthCm} / ${heightCm}`,
                  }}
                >
                  {imgStatus !== 'error' ? (
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover block"
                      onLoad={() => setImgStatus('loaded')}
                      onError={() => setImgStatus('error')}
                      style={{ opacity: imgStatus === 'loaded' ? 1 : 0, transition: 'opacity .2s' }}
                    />
                  ) : (
                    <ImageOff size={20} className="text-stone-400" />
                  )}
                  {imgStatus === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scale badge */}
          {hasRealDims && (
            <div className="absolute top-3 left-3 md:top-5 md:left-5 bg-teal/90 text-white text-[10px] md:text-xs px-2 py-1 rounded-full">
              True to scale
            </div>
          )}

          {/* Label */}
          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-xs font-sans shadow-sm">
            <span className="font-medium">{artwork.title}</span>
            {dims && <span className="text-stone-400"> · {dims} cm</span>}
          </div>
        </div>

        {/* Frame style picker */}
        <div className="flex gap-2 mt-4">
          {Object.entries(FRAME_STYLES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setFrameStyle(key)}
              aria-pressed={frameStyle === key}
              className={`text-[11px] md:text-xs px-3 py-1.5 rounded-full border transition-colors ${
                frameStyle === key
                  ? 'bg-white/15 border-white/40 text-white'
                  : 'border-white/15 text-white/50 hover:text-white/80 hover:border-white/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-white/40 text-center mt-3 text-[10px] md:text-xs tracking-wide px-4">
          {hasRealDims ? 'Scaled against a standard 210cm doorway' : 'Approximate scale — exact dimensions not available'} · Press Esc to close
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