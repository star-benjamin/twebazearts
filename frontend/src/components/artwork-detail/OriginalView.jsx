export default function OriginalView({ artwork, imageUrl }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={artwork.title}
          className="max-w-full max-h-full object-contain shadow-[0_40px_80px_rgba(0,0,0,.15)]"
        />
      ) : (
        <div className="text-mist text-xs uppercase tracking-widest">No image available</div>
      )}
    </div>
  );
}
