import { Link } from 'react-router-dom';
import kitengeTile from '/kitenge-tile.png'; // adjust path to where you saved it

export default function Footer() {
  return (
    <footer className="relative bg-ink text-white pt-16 pb-8 px-6 md:px-10 overflow-hidden">
      {/* real fabric texture, tiled, blended into the dark bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${kitengeTile})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '340px 340px',
          opacity: 0.16,
          mixBlendMode: 'luminosity',
        }}
      />
      {/* fade the texture toward the edges so it reads as a hint, not a wallpaper */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 0%, transparent 30%, var(--ink, #0a0a0a) 90%)',
        }}
      />

      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 mb-16 lg:mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-serif text-2xl font-light mb-3">
              TWEBAZE<span className="text-gold">Art</span>Studio
            </div>
            <p className="text-xs text-mist leading-relaxed max-w-sm">
              A curated marketplace for Ugandan visual artists.
            </p>
          </div>

          {[
            { title: 'Navigate', links: [['/', 'Gallery'], ['/about', 'About']] },
            { title: 'Contact', links: [['#', 'hello@twebaze.art'], ['#', 'Kampala, Uganda'], ['#', '+256 751482035']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div className="text-[10px] tracking-[.18em] uppercase text-stone mb-4">{title}</div>
              <div className="flex flex-col gap-2.5">
                {links.map(([to, label]) => (
                  <Link key={label} to={to} className="text-sm text-mist hover:text-white transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-stone text-center md:text-left">
          <span>© {new Date().getFullYear()} TwebazeArtStudio. All rights reserved.</span>
          <span className="italic">Built with Love.</span>
        </div>
      </div>
    </footer>
  );
}