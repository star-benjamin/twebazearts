const { supabaseAdmin } = require('../config/supabase');
 
exports.listArtists = async (_, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, artworks(count)')
    .eq('role', 'ARTIST')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
 
exports.approveArtist = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles').update({ status: 'APPROVED' }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
 
exports.banArtist = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles').update({ status: 'BANNED' }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
 
exports.deleteArtist = async (req, res) => {
  // Deleting from auth.users cascades to profiles and artworks
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
 
exports.deleteArtwork = async (req, res) => {
  const { error } = await supabaseAdmin.from('artworks').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
 
exports.stats = async (_, res) => {
  const [
    { count: totalArtists },
    { count: pendingArtists },
    { count: totalArtworks }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role','ARTIST').eq('status','APPROVED'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role','ARTIST').eq('status','PENDING'),
    supabaseAdmin.from('artworks').select('*', { count: 'exact', head: true }).eq('status','ACTIVE'),
  ]);
  res.json({ totalArtists, pendingArtists, totalArtworks });
};