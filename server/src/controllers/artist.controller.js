const { supabaseAdmin } = require('../config/supabase');

// Artists are now a reference table the admin curates — not login accounts.
// See gap analysis section 1 for why this replaced the old artist-account model.

// LIST — public directory shows only Active + Verified (FR-AST-005);
// admin view (?admin=1) sees everything for management purposes.
exports.list = async (req, res) => {
  const isAdminView = req.profile?.role === 'ADMIN' && req.query.admin === '1';

  let query = supabaseAdmin
    .from('artists')
    .select('*, artworks(count)')
    .order('full_name');

  if (!isAdminView) query = query.eq('status', 'ACTIVE');

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// DETAIL — public portfolio page (FR-AST-002)
exports.detail = async (req, res) => {
  const { data: artist, error } = await supabaseAdmin
    .from('artists').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });

  const { data: artworks } = await supabaseAdmin
    .from('artworks')
    .select('*, images:artwork_images(url, is_primary)')
    .eq('artist_ref_id', req.params.id)
    .eq('visibility', 'PUBLISHED');

  res.json({ ...artist, artworks: artworks || [] });
};

// CREATE — admin only (FR-AST-001)
exports.create = async (req, res) => {
  const { full_name, biography, profile_image_url, contact_email, contact_phone, specializations } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name is required' });

  const { data, error } = await supabaseAdmin
    .from('artists')
    .insert({ full_name, biography, profile_image_url, contact_email, contact_phone, specializations })
    .select()
    .single();

  if (error) {
    // unique index on lower(full_name) — VR-AST-001
    if (error.code === '23505') return res.status(409).json({ error: 'An artist with this name already exists' });
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json(data);
};

// UPDATE — admin only (FR-AST-003 verified badge, FR-AST-004 status)
exports.update = async (req, res) => {
  const {
    full_name, biography, profile_image_url, contact_email,
    contact_phone, specializations, verified, status,
  } = req.body;

  const update = { full_name, biography, profile_image_url, contact_email, contact_phone, specializations, verified, status };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('artists').update(update).eq('id', req.params.id).select().single();

  if (error) return res.status(400).json({ error: error.message });
  // Note: the SUSPENDED/ARCHIVED -> unpublish-artworks cascade (BR-AST-001)
  // runs automatically via the trg_cascade_artist_status DB trigger.
  res.json(data);
};

// DELETE — admin only. Blocked if the artist still has artwork attached,
// to avoid silently orphaning inventory records.
exports.remove = async (req, res) => {
  const { count } = await supabaseAdmin
    .from('artworks').select('*', { count: 'exact', head: true }).eq('artist_ref_id', req.params.id);

  if (count > 0) {
    return res.status(409).json({
      error: `Cannot delete: ${count} artwork(s) are still linked to this artist. Reassign or archive them first.`,
    });
  }

  const { error } = await supabaseAdmin.from('artists').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
