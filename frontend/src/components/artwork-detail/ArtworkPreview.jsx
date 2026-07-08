import { useState } from 'react';
import VisualizationTabs from './VisualizationTabs';
import OriginalView from './OriginalView';
import RoomView from './RoomView';
import FurnitureView from './FurnitureView';
import PersonView from './PersonView';

export default function ArtworkPreview({ artwork, imageUrl }) {
  const [mode, setMode] = useState('artwork');

  return (
    <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] bg-smoke flex flex-col">
      {/* Fixed-position preview area — only the content inside changes */}
      <div className="relative flex-1 min-h-0">
        {mode === 'artwork' && <OriginalView artwork={artwork} imageUrl={imageUrl} />}
        {mode === 'room' && <RoomView artwork={artwork} imageUrl={imageUrl} />}
        {mode === 'furniture' && <FurnitureView artwork={artwork} imageUrl={imageUrl} />}
        {mode === 'person' && <PersonView artwork={artwork} imageUrl={imageUrl} />}
      </div>

      {/* Mode switcher stays anchored under the preview, page layout never shifts */}
      <div className="flex justify-center py-4 md:py-5 border-t border-ash bg-smoke">
        <VisualizationTabs active={mode} onChange={setMode} />
      </div>
    </div>
  );
}
