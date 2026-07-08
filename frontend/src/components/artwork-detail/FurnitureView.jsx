import { useState } from 'react';
import { ImageOff, Sofa } from 'lucide-react';
import { FURNITURE_ITEMS } from '../../config/visualization';

// Total vertical span this scene represents. Kept smaller than the room
// scene since furniture comparisons are a tighter, close-up shot.
const SCENE_HEIGHT_CM = 220;

export default function FurnitureView({ artwork, imageUrl }) {
  const [itemKey, setItemKey] = useState(FURNITURE_ITEMS[0].key);
  const [furnitureFailed, setFurnitureFailed] = useState(false);
  const [imgStatus, setImgStatus] = useState('loading');

  const item = FURNITURE_ITEMS.find((f) => f.key === itemKey) || FURNITURE_ITEMS[0];

  const hasRealDims = artwork.dimensions_h_cm > 0 && artwork.dimensions_w_cm > 0;
  const heightCm = hasRealDims ? artwork.dimensions_h_cm : 60;
  const widthCm = hasRealDims ? artwork.dimensions_w_cm : 80;

  const furnitureHeightPercent = (item.referenceHeightCm / SCENE_HEIGHT_CM) * 100;
  const gapPercent = (item.hangGapCm / SCENE_HEIGHT_CM) * 100;
  const artworkHeightPercent = Math.min((heightCm / SCENE_HEIGHT_CM) * 100, 55);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1 overflow-hidden bg-smoke flex items-end justify-center">
        {/* Wall backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-smoke to-ash/60" />

        {/* Artwork, positioned to sit `gap` above the furniture's real height */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{ bottom: `${furnitureHeightPercent + gapPercent}%` }}
        >
          <div
            className="relative bg-white flex items-center justify-center shadow-[0_8px_28px_rgba(0,0,0,.3)]"
            style={{
              height: `min(${artworkHeightPercent}vh, 40vh)`,
              aspectRatio: `${widthCm} / ${heightCm}`,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={artwork.title}
                className="w-full h-full object-cover block"
                onLoad={() => setImgStatus('loaded')}
                onError={() => setImgStatus('error')}
                style={{ opacity: imgStatus === 'loaded' ? 1 : 0, transition: 'opacity .2s' }}
              />
            ) : (
              <ImageOff size={20} className="text-mist" />
            )}
          </div>
        </div>

        {/* Furniture photo, anchored to the bottom of the scene */}
        <div className="relative w-full flex justify-center" style={{ height: `${furnitureHeightPercent}%` }}>
          {!furnitureFailed ? (
            <img
              src={item.image}
              alt={item.label}
              className="h-full w-auto max-w-[85%] object-contain"
              onError={() => setFurnitureFailed(true)}
            />
          ) : (
            <div className="h-full aspect-[16/9] flex flex-col items-center justify-center text-mist border border-dashed border-mist bg-white/50">
              <Sofa size={22} />
              <span className="text-[10px] uppercase tracking-widest mt-1">Add {item.label} photo</span>
            </div>
          )}
        </div>
      </div>

      {/* Furniture selector */}
      <div className="flex flex-wrap gap-2 justify-center pt-4">
        {FURNITURE_ITEMS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setItemKey(f.key); setFurnitureFailed(false); }}
            aria-pressed={itemKey === f.key}
            className={`text-[10px] md:text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
              itemKey === f.key
                ? 'bg-ink text-white border-ink'
                : 'border-ash text-stone hover:border-ink hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-center mt-3 text-[10px] md:text-xs text-mist">
        {hasRealDims ? `Scaled against a typical ${item.referenceLabel.toLowerCase()}` : 'Approximate scale — exact dimensions not available'}
      </p>
    </div>
  );
}
