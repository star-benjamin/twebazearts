import { useRef, useState } from 'react';
import { Share2, Download, Users } from 'lucide-react';
import { generatePosterVariant, splitTitle } from '../utils/posterGenerator';

const VB_W = 680;
const VB_H = 920;
const PANEL = { x: 40, y: 40, w: 600, h: 560 };

function formatDate(dt) {
  const d = new Date(dt);
  return {
    day: d.toLocaleDateString(undefined, { day: '2-digit' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
  };
}

// Rough width estimate so long titles don't overflow the poster — Cormorant
// Garamond averages ~0.56 * fontSize per uppercase character.
function fitFontSize(text, maxWidth, baseSize) {
  const estWidth = text.length * baseSize * 0.56;
  if (estWidth <= maxWidth) return baseSize;
  return Math.max(30, Math.floor(baseSize * (maxWidth / estWidth)));
}

export default function ClassPoster({ cls, onBook }) {
  const svgRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const v = generatePosterVariant(cls.id);
  const { palette, frameStyle, textureStyle, badgeShape, titleLayout, panelCorner, frameOffset, frameRotation } = v;
  const { main, accent } = splitTitle(cls.course_title);
  const { day, month } = formatDate(cls.session_datetime);
  const full = cls.seats_available <= 0;

  const { x: px, y: py, w: pw, h: ph } = PANEL;
  const overlay = titleLayout === 'overlay-panel';

  // Layout positions shift depending on whether the title sits below the
  // panel or overlaid on it, so the poster doesn't end up with a huge dead
  // gap in either mode.
  const titleMainY   = overlay ? py + ph - 90 : 700;
  const titleAccentY = overlay ? py + ph - 40 : 758;
  const badgeY        = overlay ? py + ph + 30 : 790;
  const infoY1        = badgeY + 20;
  const infoY2        = badgeY + 43;
  const infoY3         = badgeY + 66; // venue line
  const footerLineY   = overlay ? badgeY + 105 : 890;
  const footerTextY   = footerLineY + 23;

  const titleFill = overlay ? palette.bg : palette.text;
  const mainSize = fitFontSize(main.toUpperCase(), pw - 40, 58);

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
      const scale = 2;
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
        await navigator.share({ files: [file], title: cls.course_title, text: `${cls.course_title} at Twebaze Art Studio — ${day} ${month}` });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Poster export failed:', err);
        alert('Could not export the poster image. Try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  const clipId = `panel-clip-${cls.id}`;

  return (
    <div className="relative group">
      <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width={VB_W} height={VB_H} fill={palette.bg} />

        <defs>
          <clipPath id={clipId}>
            <rect x={px} y={py} width={pw} height={ph} rx={panelCorner} />
          </clipPath>
        </defs>

        {/* Panel — rotated slightly only in the double-offset frame style, since
            brackets/thick-border read cleaner square */}
        <g transform={frameStyle === 'double-offset' ? `rotate(${frameRotation} ${VB_W / 2} ${py + ph / 2})` : undefined}>
          <rect x={px} y={py} width={pw} height={ph} rx={panelCorner} fill={palette.panel} />
        </g>

        {/* Texture — one of three procedural treatments, clipped to the panel */}
        <g clipPath={`url(#${clipId})`} opacity="0.6">
          {textureStyle === 'scatter-dots' && v.dots.map((d, i) => (
            <circle key={i} cx={px + d.x * pw} cy={py + d.y * ph} r={d.r} fill={d.accent ? palette.accent : palette.light} />
          ))}
          {textureStyle === 'diagonal-lines' && v.diagonalLines.map((l, i) => (
            <line
              key={i}
              x1={px + l.offset * pw + 200} y1={py}
              x2={px + l.offset * pw - 200} y2={py + ph}
              stroke={l.accent ? palette.accent : palette.light}
              strokeWidth="1"
            />
          ))}
          {textureStyle === 'brush-swoosh' && v.swooshes.map((s, i) => (
            <path
              key={i}
              d={`M ${px} ${py + s.y1 * ph} Q ${px + pw / 2} ${py + s.cy * ph} ${px + pw} ${py + s.y2 * ph}`}
              stroke={s.accent ? palette.accent : palette.light}
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </g>

        {/* Frame */}
        {frameStyle === 'double-offset' && (
          <>
            <rect x={px - frameOffset} y={py - frameOffset} width={pw} height={ph} rx={panelCorner} fill="none" stroke={palette.text} strokeWidth="1" />
            <rect x={px + frameOffset} y={py + frameOffset} width={pw} height={ph} rx={panelCorner} fill="none" stroke={palette.accent} strokeWidth="1" />
          </>
        )}
        {frameStyle === 'single-thick' && (
          <rect x={px - 10} y={py - 10} width={pw + 20} height={ph + 20} rx={panelCorner} fill="none" stroke={palette.text} strokeWidth="4" />
        )}
        {frameStyle === 'corner-brackets' && (
          <g stroke={palette.accent} strokeWidth="2" fill="none">
            <path d={`M ${px - 14} ${py - 14 + 40} L ${px - 14} ${py - 14} L ${px - 14 + 40} ${py - 14}`} />
            <path d={`M ${px + pw + 14 - 40} ${py - 14} L ${px + pw + 14} ${py - 14} L ${px + pw + 14} ${py - 14 + 40}`} />
            <path d={`M ${px - 14} ${py + ph + 14 - 40} L ${px - 14} ${py + ph + 14} L ${px - 14 + 40} ${py + ph + 14}`} />
            <path d={`M ${px + pw + 14 - 40} ${py + ph + 14} L ${px + pw + 14} ${py + ph + 14} L ${px + pw + 14} ${py + ph + 14 - 40}`} />
          </g>
        )}

        {/* Title */}
        <text x={VB_W / 2} y={titleMainY} textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize={mainSize} fontWeight="600" letterSpacing="4" fill={titleFill}>
          {main.toUpperCase()}
        </text>
        {accent && (
          <text x={VB_W / 2} y={titleAccentY} textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="50" fill={palette.accent}>
            {accent}
          </text>
        )}

        {/* Date badge — square / circle / ribbon, same footprint regardless */}
        {badgeShape === 'square' && (
          <>
            <rect x="40" y={badgeY} width="150" height="66" rx={panelCorner ? 10 : 0} fill={palette.panel} />
            <text x="115" y={badgeY + 27} textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill={palette.bg} letterSpacing="2">{day}</text>
            <text x="115" y={badgeY + 50} textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill={palette.bg} letterSpacing="2">{month}</text>
          </>
        )}
        {badgeShape === 'circle' && (
          <>
            <circle cx="115" cy={badgeY + 33} r="42" fill={palette.panel} />
            <text x="115" y={badgeY + 28} textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill={palette.bg} letterSpacing="1">{day}</text>
            <text x="115" y={badgeY + 46} textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" fill={palette.bg} letterSpacing="1">{month}</text>
          </>
        )}
        {badgeShape === 'ribbon' && (
          <>
            <polygon points={`40,${badgeY} 170,${badgeY} 190,${badgeY + 33} 170,${badgeY + 66} 40,${badgeY + 66}`} fill={palette.accent} />
            <text x="105" y={badgeY + 38} textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill={palette.panel} letterSpacing="1">{day} {month}</text>
          </>
        )}

        <text x="215" y={infoY1} fontFamily="Georgia, serif" fontSize="15" fill={palette.text}>Instructor: {cls.instructor}</text>
        <text x="215" y={infoY2} fontFamily="Georgia, serif" fontSize="15" fill="#7a7268">
          UGX {Number(cls.registration_fee).toLocaleString()} &#183; {full ? 'Fully booked' : `${cls.seats_available} of ${cls.capacity} seats left`}
        </text>
        {cls.venue && (
          <text x="215" y={infoY3} fontFamily="Georgia, serif" fontSize="13" fill="#7a7268">Venue: {cls.venue}</text>
        )}

        <line x1="40" y1={footerLineY} x2="640" y2={footerLineY} stroke="#c8c3bb" strokeWidth="0.5" />
        <text x="40" y={footerTextY} fontFamily="Georgia, serif" fontSize="12" letterSpacing="3" fill={palette.text}>TWEBAZE ART STUDIO</text>
        <text x="640" y={footerTextY} textAnchor="end" fontFamily="Georgia, serif" fontSize="12" fill={palette.accent}>twebazearts.online/classes</text>
      </svg>

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
