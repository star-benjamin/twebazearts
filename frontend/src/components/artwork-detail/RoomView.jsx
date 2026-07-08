import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { ROOM_SCENES, ROOM_FALLBACK_IMAGE } from '../../config/visualization';

// Total vertical span the illustration represents (floor to ceiling-ish).
// Every scene's reference object (usually a doorway) is measured against
// this so the artwork's real cm height lands at a believable size.
const SCENE_HEIGHT_CM = 300;

export default function RoomView({ artwork, imageUrl }) {
  const [sceneKey, setSceneKey] = useState(ROOM_SCENES[0].key);
  const [bgFailed, setBgFailed] = useState(false);
  const [imgStatus, setImgStatus] = useState('loading');

  const scene = ROOM_SCENES.find((s) => s.key === sceneKey) || ROOM_SCENES[0];

  const hasRealDims = artwork.dimensions_h_cm > 0 && artwork.dimensions_w_cm > 0;
  const heightCm = hasRealDims ? artwork.dimensions_h_cm : 60;
  const widthCm = hasRealDims ? artwork.dimensions_w_cm : 80;

  const heightPercent = Math.min((heightCm / SCENE_HEIGHT_CM) * 100, 60);
  const doorHeightPercent = (scene.referenceHeightCm / SCENE_HEIGHT_CM) * 100;

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="relative flex-1 overflow-hidden bg-smoke"
        style={{
          backgroundImage: `url(${bgFailed ? ROOM_FALLBACK_IMAGE : scene.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Hidden probe image so we can fall back gracefully if the real photo hasn't been added yet */}
        <img src={scene.image} alt="" className="hidden" onError={() => setBgFailed(true)} />

        <div className="absolute inset-0 bg-black/5" />

        {/* Reference object marker (e.g. doorway) so the scale reads as trustworthy */}
        <div
          className="absolute left-[6%] bottom-0 bg-black/10 border border-black/20"
          style={{ width: '12%', height: `${doorHeightPercent}%` }}
        >
          <span className="absolute -bottom-5 left-0 text-[9px] md:text-[10px] text-ink/40 whitespace-nowrap">
            {scene.referenceLabel}
          </span>
        </div>

        {/* Artwork on the wall */}
        <div className="absolute top-[12%] left-0 right-0 flex items-start justify-center">
          <div
            className="relative bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,.35)]"
            style={{
              height: `min(${heightPercent}vh, 46vh)`,
              aspectRatio: `${widthCm} / ${heightCm}`,
            }}
          >
            {imgUrlOrFallback(imageUrl) ? (
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

      <p className="text-center mt-3 text-[10px] md:text-xs text-mist">
        {hasRealDims ? `Scaled against a ${scene.referenceLabel.toLowerCase()}` : 'Approximate scale — exact dimensions not available'}
      </p>
    </div>
  );
}

function imgUrlOrFallback(url) {
  return !!url;
}
