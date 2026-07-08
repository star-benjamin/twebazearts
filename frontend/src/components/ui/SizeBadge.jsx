import { getSizeCategory } from '../../utils/artworkSize';

export default function SizeBadge({ artwork, className = '' }) {
  const tier = getSizeCategory(artwork);
  if (!tier) return null;

  return (
    <span
      className={`inline-flex items-center text-[9px] md:text-[10px] tracking-[.12em] uppercase text-stone border border-ash px-2 py-1 ${className}`}
    >
      {tier.label}
    </span>
  );
}
