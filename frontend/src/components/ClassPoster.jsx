import { useRef, useState } from 'react';
import { Share2, Download, Users } from 'lucide-react';
import { generatePosterVariant, splitTitle } from '../utils/posterGenerator';

const VB_W = 680;
const VB_H = 920;

function formatDate(dt) {
  const d = new Date(dt);
  return {
    day: d.toLocaleDateString(undefined, { day: '2-digit' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
  };
}

// Rough width estimate so long titles don't overflow the poster — Cormorant
// Garamond at 58px averages ~0.55 * fontSize per uppercase character.
function fitFontSize(text, maxWidth, baseSize) {
  const estWidth = text.length * baseSize * 0.56;
  if (estWidth <= maxWidth) return baseSize;
  return Math.max(30, Math.floor(baseSize * (maxWidth / estWidth)));
}

export default function ClassPoster({ cls, onBook }) {
  const svgRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const variant = generatePosterVariant(cls.id);
  const { palette, frameOffset, frameRotation, dots } = variant;
  const { main, accent } = splitTitle(cls.course_title, cls.instructor);
  const { day, month } = formatDate(cls.session_datetime);

  const panelX = 40, panelY = 40, panelW = VB_W - 80, panelH = 560;
  const mainSize = fitFontSize(main.toUpperCase(), panelW - 40, 58);
  const full = cls.seats_available <= 0;

  const exportPng = async () => {
    setExporting(true);
    try {
      const svgEl = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      const canvas = document.createElement('canvas');
      const scale = 2; // export at 2x for crisper sharing/printing
      canvas.width = VB_W * scale;
      canvas.height = VB_H * scale;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, VB_W, VB_H);
      URL.revokeObjectURL(url);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const fileName = `${cls.course_title.replace(/\s+/g, '-').toLowerCase()}-twebaze.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: cls.course_title,
          text: `${cls.course_title} at Twebaze Art Studio — ${day} ${month}`,
        });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      // AbortError fires when the user just cancels the native share sheet —
      // not a real failure, so don't surface it as one.
      if (err?.name !== 'AbortError') {
        console.error('Poster export failed:', err);
        alert('Could not export the poster image. Try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative group">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="0" width={VB_W} height={VB_H} fill={palette.bg} />

        <g transform={`rotate(${frameRotation} ${VB_W / 2} ${panelY + panelH / 2})`}>
          <rect x={panelX} y={panelY} width={panelW} height={panelH} fill={palette.panel} />
        </g>

        <g opacity="0.6">
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={panelX + d.x * panelW}
              cy={panelY + d.y * panelH}
              r={d.r}
              fill={d.accent ? palette.accent : palette.light}
            />
          ))}
        </g>

        <rect x={panelX - frameOffset} y={panelY - frameOffset} width={panelW} height={panelH} fill="none" stroke={palette.text} strokeWidth="1" />
        <rect x={panelX + frameOffset} y={panelY + frameOffset} width={panelW} height={panelH} fill="none" stroke={palette.accent} strokeWidth="1" />

        <text x={VB_W / 2} y="700" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize={mainSize} fontWeight="600" letterSpacing="4" fill={palette.text}>
          {main.toUpperCase()}
        </text>
        {accent && (
          <text x={VB_W / 2} y="758" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="50" fill={palette.accent}>
            {accent}
          </text>
        )}

        <rect x="40" y="790" width="150" height="66" fill={palette.panel} />
        <text x="115" y="817" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill={palette.bg} letterSpacing="2">{day}</text>
        <text x="115" y="840" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill={palette.bg} letterSpacing="2">{month}</text>

        <text x="215" y="810" fontFamily="Georgia, serif" fontSize="15" fill={palette.text}>Instructor: {cls.instructor}</text>
        <text x="215" y="835" fontFamily="Georgia, serif" fontSize="15" fill="#7a7268">
          UGX {Number(cls.registration_fee).toLocaleString()} &#183; {full ? 'Fully booked' : `${cls.seats_available} of ${cls.capacity} seats left`}
        </text>

        <line x1="40" y1="875" x2="640" y2="875" stroke="#c8c3bb" strokeWidth="0.5" />
        <text x="40" y="898" fontFamily="Georgia, serif" fontSize="12" letterSpacing="3" fill={palette.text}>TWEBAZE ART STUDIO</text>
        <text x="640" y="898" textAnchor="end" fontFamily="Georgia, serif" fontSize="14" fill={palette.accent}>twebazearts.online/classes</text>
      </svg>

      {/* Overlay actions — outside the SVG so they're normal clickable DOM */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={exportPng}
          disabled={exporting}
          title="Share or download poster"
          className="w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white text-ink rounded-full shadow-sm disabled:opacity-50"
        >
          {typeof navigator !== 'undefined' && navigator.share ? <Share2 size={15} /> : <Download size={15} />}
        </button>
      </div>

      <button
        onClick={() => !full && onBook(cls)}
        disabled={full}
        className="w-full flex items-center justify-center gap-2 bg-ink text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-40 disabled:hover:bg-ink mt-3"
      >
        <Users size={13} /> {full ? 'Fully Booked' : 'Book a Seat'}
      </button>
    </div>
  );
}
