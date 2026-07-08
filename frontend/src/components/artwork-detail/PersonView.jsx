import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import PersonSilhouette from '../ui/PersonSilhouette';
import { AVERAGE_PERSON_HEIGHT_CM } from '../../config/visualization';

// Total vertical span this scene represents.
const SCENE_HEIGHT_CM = 220;

export default function PersonView({ artwork, imageUrl }) {
  const [imgStatus, setImgStatus] = useState('loading');

  const hasRealDims = artwork.dimensions_h_cm > 0 && artwork.dimensions_w_cm > 0;
  const heightCm = hasRealDims ? artwork.dimensions_h_cm : 60;
  const widthCm = hasRealDims ? artwork.dimensions_w_cm : 80;

  const personHeightPercent = (AVERAGE_PERSON_HEIGHT_CM / SCENE_HEIGHT_CM) * 100;
  const artworkHeightPercent = Math.min((heightCm / SCENE_HEIGHT_CM) * 100, 60);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1 bg-smoke flex items-end justify-center gap-6 md:gap-10 px-6 pb-8">
        <div
          className="relative bg-white flex items-center justify-center shadow-[0_8px_28px_rgba(0,0,0,.25)]"
          style={{
            height: `min(${artworkHeightPercent}vh, 46vh)`,
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

        <div className="flex flex-col items-center">
          <PersonSilhouette
            className="text-stone/70"
            style={{ height: `min(${personHeightPercent}vh, 46vh)`, width: 'auto' }}
          />
          <span className="text-[9px] md:text-[10px] tracking-widest uppercase text-mist mt-2">
            {AVERAGE_PERSON_HEIGHT_CM}cm
          </span>
        </div>
      </div>

      <p className="text-center mt-3 text-[10px] md:text-xs text-mist">
        {hasRealDims
          ? `Shown next to an average ${AVERAGE_PERSON_HEIGHT_CM}cm adult`
          : 'Approximate scale — exact dimensions not available'}
      </p>
    </div>
  );
}
