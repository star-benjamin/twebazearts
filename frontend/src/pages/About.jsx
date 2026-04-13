const VALUES = [
  { title: 'Curation over volume', desc: 'Every artist is hand-selected by our editorial team. Quality is the only metric.' },
  { title: 'Artist-first model',   desc: 'Artists keep 100% of their sale. We earn through optional premium listings.' },
  { title: 'Human transactions',   desc: 'No cart, no checkout. Every purchase begins with a conversation.' },
  { title: 'East African identity',desc: 'We are unapologetically local. Our aesthetic is our heritage.' },
];
 
export default function About() {
  return (
    <div className="pt-16">
      <div className="grid grid-cols-2 gap-20 px-10 py-20 items-center">
        <div className="relative">
          <div className="w-full aspect-[4/5] bg-gradient-to-br from-stone to-ink rounded-sm" />
          <div className="absolute -bottom-5 -right-5 w-3/5 aspect-square bg-gold/10 -z-10" />
        </div>
 
        <div>
          <p className="text-[11px] tracking-[.2em] uppercase text-gold mb-5">Our Mission</p>
          <h2 className="font-serif text-[clamp(32px,3vw,48px)] font-light leading-tight mb-7">
            A gallery without <em>walls</em>, with purpose
          </h2>
          <p className="text-sm text-stone leading-[1.9] mb-5">
            TWEBAZEarts was founded with a simple belief: Ugandan art deserves a platform as refined as the work itself.
            We are a curated digital gallery connecting collectors and art lovers with the continent's most compelling visual artists.
          </p>
          <p className="text-sm text-stone leading-[1.9] mb-10">
            We don't process transactions. We create connections. Every inquiry travels through WhatsApp, keeping commerce
            warm and conversations human.
          </p>
 
          <div className="grid grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title}>
                <div className="font-serif text-base mb-1.5">{v.title}</div>
                <div className="text-xs text-stone leading-relaxed">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}