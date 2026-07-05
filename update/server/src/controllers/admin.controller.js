const { supabaseAdmin } = require('../config/supabase');

// FR-ADM-004: Monthly Sales Values, Volume of Inquiries, Active Class
// Registrations, Artwork view counts.
//
// NOTE on "Artwork view counts": no view-tracking table exists yet. Wire this
// up by incrementing a `view_count` column on `artworks` from the public
// detail endpoint (artwork.controller.js -> detail) once you're ready; for
// now this returns 0 rather than fabricating numbers. Everything else below
// is computed from real data already captured elsewhere in this migration.
exports.dashboard = async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: monthPayments },
    { count: newInquiries },
    { count: inProgressInquiries },
    { count: activeClassCount },
    { data: upcomingClasses },
    { count: totalArtworks },
    { count: publishedArtworks },
  ] = await Promise.all([
    supabaseAdmin.from('payments').select('amount').gte('payment_date', startOfMonth.toISOString().slice(0, 10)),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'NEW'),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS'),
    supabaseAdmin.from('art_classes').select('*', { count: 'exact', head: true }).gte('session_datetime', new Date().toISOString()),
    supabaseAdmin.from('art_classes').select('id, bookings(count)').gte('session_datetime', new Date().toISOString()),
    supabaseAdmin.from('artworks').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('artworks').select('*', { count: 'exact', head: true }).eq('visibility', 'PUBLISHED'),
  ]);

  const monthlySales = (monthPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const activeClassRegistrations = (upcomingClasses || []).reduce((sum, c) => sum + (c.bookings?.[0]?.count || 0), 0);

  res.json({
    monthlySalesValue: monthlySales,
    inquiries: { new: newInquiries || 0, inProgress: inProgressInquiries || 0 },
    upcomingClassCount: activeClassCount || 0,
    activeClassRegistrations,
    artworks: { total: totalArtworks || 0, published: publishedArtworks || 0 },
    artworkViewCounts: null, // see note above
  });
};
