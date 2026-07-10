import { useState } from 'react';
import { ImageOff, Sofa } from 'lucide-react';
import { FURNITURE_ITEMS } from '../../config/visualization';
import { useContainedImageBoxRef } from '../../hooks/useContainedImageBox';

// Used only while an item has no `calibration` yet.
const ESTIMATE_SCENE_HEIGHT_CM = 220;

export default function FurnitureView({ artwork, imageUrl }) {
  const [itemKey, setItemKey] = useState(FURNITURE_ITEMS[0].key);
  const [furnitureFailed, setFurnitureFailed] = useState(false);
  const [imgStatus, setImgStatus] = useState('loading');

  const item = FURNITURE_ITEMS.find((f) => f.key === itemKey) || FURNITURE_ITEMS[0];
  const cal = item.calibration;

  const [containerRef, box] = useContainedImageBoxRef(cal?.naturalWidth, cal?.naturalHeight);

  const hasRealDims = artwork.dimensions_h_cm > 0 && artwork.dimensions_w_cm > 0;
  const heightCm = hasRealDims ? artwork.dimensions_h_cm : 60;
  const widthCm = hasRealDims ? artwork.dimensions_w_cm : 80;

  let artworkStyle, refStyle, scaleNote;

  if (cal && box.ready) {
    const pxPerCm = (box.height * (cal.referenceBottomPct - cal.referenceTopPct)) / item.referenceHeightCm;
    let artHeightPx = heightCm * pxPerCm;
    let artWidthPx = widthCm * pxPerCm;
    const bottomPx = box.top + cal.hangBottomPct * box.height;
    const centerXPx = box.left + cal.hangCenterXPct * box.width;

    // Don't let oversized pieces clip above the frame — scale both
    // dimensions down together (preserving aspect ratio) to fit the space
    // actually available above the hang point.
    const availableHeightPx = bottomPx - box.top - 8; // small margin
    let scaledDown = false;
    if (artHeightPx > availableHeightPx) {
      const scale = availableHeightPx / artHeightPx;
      artHeightPx *= scale;
      artWidthPx *= scale;
      scaledDown = true;
    }

    artworkStyle = {
      position: 'absolute',
      left: centerXPx - artWidthPx / 2,
      top: bottomPx - artHeightPx,
      width: artWidthPx,
      height: artHeightPx,
    };
    refStyle = {
      position: 'absolute',
      left: box.left + 0.04 * box.width,
      top: box.top + cal.referenceTopPct * box.height,
      width: 0.10 * box.width,
      height: (cal.referenceBottomPct - cal.referenceTopPct) * box.height,
    };
    scaleNote = scaledDown
      ? `Shown smaller than true scale to fit this photo's frame — actual size is ${Math.round(heightCm)}×${Math.round(widthCm)}cm`
      : `Scaled precisely against this photo's ${item.referenceLabel.toLowerCase()}`;
  } else {
    // Estimated fallback for any item not yet calibrated
    const heightPercent = Math.min((heightCm / ESTIMATE_SCENE_HEIGHT_CM) * 100, 55);
    const furnitureHeightPercent = (item.referenceHeightCm / ESTIMATE_SCENE_HEIGHT_CM) * 100;
    const gapPercent = (item.hangGapCm / ESTIMATE_SCENE_HEIGHT_CM) * 100;

    artworkStyle = {
      position: 'absolute',
      left: '50%',
      bottom: `${furnitureHeightPercent + gapPercent}%`,
      transform: 'translateX(-50%)',
      height: `${heightPercent}%`,
      aspectRatio: `${widthCm} / ${heightCm}`,
    };
    refStyle = null;
    scaleNote = hasRealDims
      ? `Approximate scale, against a typical ${item.referenceLabel.toLowerCase()}`
      : 'Approximate scale — exact dimensions not available';
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden bg-smoke">
        {!furnitureFailed ? (
          <img
            src={item.image}
            alt={item.label}
            className="absolute inset-0 w-full h-full object-contain"
            onError={() => setFurnitureFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-mist border border-dashed border-mist bg-white/50 m-6">
            <Sofa size={22} />
            <span className="text-[10px] uppercase tracking-widest mt-1">Add {item.label} photo</span>
          </div>
        )}

        {refStyle && (
          <div className="bg-black/10 border border-black/20" style={refStyle}>
            <span className="absolute -bottom-5 left-0 text-[9px] md:text-[10px] text-ink/40 whitespace-nowrap">
              {item.referenceLabel}
            </span>
          </div>
        )}

        <div className="bg-white flex items-center justify-center shadow-[0_8px_28px_rgba(0,0,0,.3)]" style={artworkStyle}>
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

      <p className="text-center mt-3 text-[10px] md:text-xs text-mist">{scaleNote}</p>
    </div>
  );
}
