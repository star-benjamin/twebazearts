// A plain, gender-neutral standing silhouette. Kept as a single-color SVG so
// it never competes with the artwork for attention — it's a ruler, not an
// illustration.
export default function PersonSilhouette({ className = '', style }) {
  return (
    <svg
      viewBox="0 0 100 300"
      className={className}
      style={style}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <g fill="currentColor">
        {/* head */}
        <circle cx="50" cy="24" r="20" />
        {/* neck */}
        <rect x="42" y="42" width="16" height="10" />
        {/* torso + hips */}
        <path d="M50 50 C20 50 14 78 16 118 L20 190 L38 190 L42 140 L50 140 L58 140 L62 190 L80 190 L84 118 C86 78 80 50 50 50 Z" />
        {/* legs */}
        <path d="M38 190 L34 292 L48 292 L54 200 L60 200 L66 292 L80 292 L76 190 Z" />
      </g>
    </svg>
  );
}
