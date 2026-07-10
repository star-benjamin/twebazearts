import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { ROOM_SCENES, ROOM_FALLBACK_IMAGE } from '../../config/visualization';
import { useContainedImageBoxRef } from '../../hooks/useContainedImageBox';

// Used only while a scene has no `calibration` yet — a rough estimate so the
// page still looks reasonable before real measurements are added.
const ESTIMATE_SCENE_HEIGHT_CM = 300;

export default function RoomView({ artwork, imageUrl }) {
  const [sceneKey, setSceneKey] = useState(ROOM_SCENES[0].key);
  const [bgFailed, setBgFailed] = useState(false);
  const [imgStatus, setImgStatus] = useState('loading');

  const scene = ROOM_SCENES.find((s) => s.key === sceneKey) || ROOM_SCENES[0];
  const cal = scene.calibration;

  const [containerRef, box] = useContainedImageBoxRef(cal?.naturalWidth, cal?.naturalHeight);

  const hasRealDims = artwork.dimensions_h_cm > 0 && artwork.dimensions_w_cm > 0;
  const heightCm = hasRealDims ? artwork.dimensions_h_cm : 60;
  const widthCm = hasRealDims ? artwork.dimensions_w_cm : 80;

  // --- Calibrated path: photo has real measurements, position against it precisely ---
  let artworkStyle, doorStyle, scaleNote;

  if (cal && box.ready) {
    const pxPerCm = (box.height * (cal.referenceBottomPct - cal.referenceTopPct)) / scene.referenceHeightCm;
    const artHeightPx = heightCm * pxPerCm;
    const artWidthPx = widthCm * pxPerCm;
    const bottomPx = box.top + cal.hangBottomPct * box.height;
    const centerXPx = box.left + cal.hangCenterXPct * box.width;

    artworkStyle = {
      position: 'absolute',
      left: centerXPx - artWidthPx / 2,
      top: bottomPx - artHeightPx,
      width: artWidthPx,
      height: artHeightPx,
    };
    doorStyle = {
      position: 'absolute',
      left: box.left + 0.04 * box.width,
      top: box.top + cal.referenceTopPct * box.height,
      width: 0.1 * box.width,
      height: (cal.referenceBottomPct - cal.referenceTopPct) * box.height,
    };
    scaleNote = `Scaled precisely against this photo's ${scene.referenceLabel.toLowerCase()}`;
  } else {
    // --- Estimated fallback path (used until this scene is calibrated) ---
    const heightPercent = Math.min((heightCm / ESTIMATE_SCENE_HEIGHT_CM) * 100, 60);
    const doorHeightPercent = (scene.referenceHeightCm / ESTIMATE_SCENE_HEIGHT_CM) * 100;

    artworkStyle = {
      position: 'absolute',
      left: '50%',
      top: '12%',
      transform: 'translateX(-50%)',
      height: `${heightPercent}%`,
      aspectRatio: `${widthCm} / ${heightCm}`,
    };
    doorStyle = {
      position: 'absolute',
      left: '6%',
      bottom: 0,
      width: '12%',
      height: `${doorHeightPercent}%`,
    };
    scaleNote = hasRealDims
      ? `Approximate scale, against a typical ${scene.referenceLabel.toLowerCase()}`
      : 'Approximate scale — exact dimensions not available';
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 overflow-hidden bg-smoke"
      >
        <img
          src={bgFailed ? ROOM_FALLBACK_IMAGE : scene.image}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setBgFailed(true)}
        />

        {/* Reference object marker (e.g. doorway) so the scale reads as trustworthy */}
        <div className="bg-black/10 border border-black/20" style={doorStyle}>
          <span className="absolute -bottom-5 left-0 text-[9px] md:text-[10px] text-ink/40 whitespace-nowrap">
            {scene.referenceLabel}
          </span>
        </div>

        {/* Artwork on the wall */}
        <div className="bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,.35)]" style={artworkStyle}>
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

      {/* Room selector */}
      <div className="flex flex-wrap gap-2 justify-center pt-4">
        {ROOM_SCENES.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSceneKey(s.key); setBgFailed(false); }}
            aria-pressed={sceneKey === s.key}
            className={`text-[10px] md:text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
              sceneKey === s.key
                ? 'bg-ink text-white border-ink'
                : 'border-ash text-stone hover:border-ink hover:text-ink'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-center mt-3 text-[10px] md:text-xs text-mist">{scaleNote}</p>
    </div>
  );
}
