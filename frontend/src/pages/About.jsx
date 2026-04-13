const VALUES = [
  { title: 'Curation over volume', desc: 'Every artist is hand-selected by our editorial team. Quality is the only metric.' },
  { title: 'Artist-first model',   desc: 'Artists keep 100% of their sale. We earn through optional premium listings.' },
  { title: 'Human transactions',   desc: 'No cart, no checkout. Every purchase begins with a conversation.' },
  { title: 'East African identity',desc: 'We are unapologetically local. Our aesthetic is our heritage.' },
];

export default function About() {
  return (
    <div className="pt-16">
      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 px-6 md:px-10 lg:px-16 py-12 lg:py-20 items-center">
        
        {/* Decorative Image Placeholder */}
        <div className="relative order-first lg:order-none px-4 lg:px-0">
          <div className="w-full aspect-[4/5] bg-gradient-to-br from-stone to-ink rounded-sm shadow-xl" />
          {/* Subtle background element - hidden on very small screens to avoid overflow */}
          <div className="absolute -bottom-4 -right-4 md:-bottom-5 md:-right-5 w-3/5 aspect-square bg-gold/10 -z-10" />
        </div>

        {/* Text Content */}
        <div>
          <p className="text-[10px] md:text-[11px] tracking-[.2em] uppercase text-gold mb-4 md:mb-5 text-center lg:text-left">
            Our Mission
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,48px)] font-light leading-tight mb-6 md:mb-7 text-center lg:text-left">
            A gallery without <em>walls</em>, with purpose
          </h2>
          
          <div className="space-y-5 mb-10 text-center lg:text-left">
            <p className="text-[14px] md:text-sm text-stone leading-[1.8]">
              TWEBAZEarts was founded with a simple belief: Ugandan art deserves a platform as refined as the work itself.
              We are a curated digital gallery connecting collectors and art lovers with the continent's most compelling visual artists.
            </p>
            <p className="text-[14px] md:text-sm text-stone leading-[1.8]">
              We don't process transactions. We create connections. Every inquiry travels through WhatsApp, keeping commerce
              warm and conversations human.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-10">
            {VALUES.map(v => (
              <div key={v.title} className="text-center lg:text-left">
                <div className="font-serif text-base md:text-lg mb-1.5">{v.title}</div>
                <div className="text-[12px] md:text-xs text-stone leading-relaxed max-w-xs mx-auto lg:mx-0">
                  {v.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}