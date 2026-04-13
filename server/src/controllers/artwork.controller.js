const { supabase, supabaseAdmin } = require('../config/supabase');
 
// LIST — public gallery
exports.list = async (req, res) => {
  const { artist_id, status = 'ACTIVE', page = 1, limit = 20 } = req.query;
 
  let query = supabaseAdmin
    .from('artworks')
    .select('*, artist:profiles(id, name, profile_image_url, whatsapp_number)', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
 
  if (artist_id) query = query.eq('artist_id', artist_id);
 
  const { data, error, count } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ items: data, total: count, page: +page, pages: Math.ceil(count / limit) });
};
 
// DETAIL
exports.detail = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('artworks')
    .select('*, artist:profiles(id, name, bio, whatsapp_number, profile_image_url, location)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};
 
// CREATE
// Image upload goes directly from the React frontend to Supabase Storage
// using the user's JWT — no file passing through Express needed.
// This endpoint just saves the metadata after the upload.
exports.create = async (req, res) => {
  const { title, description, price, size, medium, year, currency, image_url } = req.body;
 
  // Only APPROVED artists can publish
  if (req.profile.status !== 'APPROVED')
    return res.status(403).json({ error: 'Account pending approval' });
 
  const { data, error } = await supabaseAdmin
    .from('artworks')
    .insert({ title, description, price, size, medium, year, currency, image_url, artist_id: req.user.id })
    .select()
    .single();
 
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};
 
// UPDATE
exports.update = async (req, res) => {
  const { data: existing } = await supabaseAdmin.from('artworks').select('artist_id').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.artist_id !== req.user.id && req.profile.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' });
 
  const { title, description, price, size, medium, year, currency, image_url, status } = req.body;
  const { data, error } = await supabaseAdmin
    .from('artworks')
    .update({ title, description, price, size, medium, year, currency, image_url, status })
    .eq('id', req.params.id)
    .select()
    .single();
 
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
 
// DELETE
exports.remove = async (req, res) => {
  const { data: existing } = await supabaseAdmin.from('artworks').select('artist_id').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.artist_id !== req.user.id && req.profile.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' });
 
  await supabaseAdmin.from('artworks').delete().eq('id', req.params.id);
  res.status(204).send();
};