const MODES = [
  { key: 'artwork', label: 'Artwork' },
  { key: 'room', label: 'Room' },
  { key: 'furniture', label: 'Furniture' },
  { key: 'person', label: 'Person' },
];

export default function VisualizationTabs({ active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Artwork preview mode"
      className="inline-flex border border-ash bg-white self-center lg:self-start"
    >
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={`px-4 md:px-5 py-2.5 text-[10px] md:text-[11px] tracking-widest uppercase transition-colors ${
            active === key
              ? 'bg-ink text-white'
              : 'text-stone hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
