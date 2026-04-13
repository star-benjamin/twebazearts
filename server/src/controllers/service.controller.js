// server/src/controllers/service.controller.js

const { supabaseAdmin } = require('../config/supabase');

// LIST — all active services (public)
exports.list = async (req, res) => {
  const { artist_id } = req.query;

  let query = supabaseAdmin
    .from('services')
    .select('*, artist:profiles(id, name, whatsapp_number, profile_image_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (artist_id) query = query.eq('artist_id', artist_id);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// DETAIL — single service (public)
exports.detail = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*, artist:profiles(id, name, whatsapp_number, profile_image_url, bio)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

// CREATE — ARTIST only
exports.create = async (req, res) => {
  if (req.profile.status !== 'APPROVED')
    return res.status(403).json({ error: 'Account pending approval' });

  const { name, description, price_min, price_max, currency, image_url } = req.body;

  const { data, error } = await supabaseAdmin
    .from('services')
    .insert({
      name,
      description,
      price_min:  price_min  ? +price_min  : null,
      price_max:  price_max  ? +price_max  : null,
      currency:   currency || 'UGX',
      image_url,
      artist_id:  req.user.id,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// UPDATE — owner or ADMIN
exports.update = async (req, res) => {
  const { data: existing } = await supabaseAdmin
    .from('services')
    .select('artist_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.artist_id !== req.user.id && req.profile.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' });

  const { name, description, price_min, price_max, currency, image_url, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from('services')
    .update({ name, description, price_min, price_max, currency, image_url, is_active })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// DELETE — owner or ADMIN
exports.remove = async (req, res) => {
  const { data: existing } = await supabaseAdmin
    .from('services')
    .select('artist_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.artist_id !== req.user.id && req.profile.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' });

  await supabaseAdmin.from('services').delete().eq('id', req.params.id);
  res.status(204).send();
};