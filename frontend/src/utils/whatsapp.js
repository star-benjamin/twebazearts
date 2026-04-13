export function generateWhatsAppLink(whatsappNumber, artwork) {
  if (!whatsappNumber) return null;
  const message = encodeURIComponent(
    `Hello! I'm interested in your artwork:\n\n` +
    `🎨 *${artwork.title}*\n` +
    `📐 Size: ${artwork.size || 'N/A'}\n` +
    `💰 ${artwork.currency || 'UGX'} ${Number(artwork.price).toLocaleString()}\n\n` +
    `Could you please share more details?`
  );
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}
