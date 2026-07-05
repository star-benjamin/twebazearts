const { supabaseAdmin } = require('../config/supabase');

const ARTWORK_SELECT = `
  *,
  artist:artists(id, full_name, profile_image_url, verified),
  category:artwork_categories(id, name, slug),
  images:artwork_images(id, url, webp_url, is_primary, sort_order)
`;

// LIST — public showcase (FR-ART-008, FR-ART-009)
// Only PUBLISHED artwork is ever returned to unauthenticated callers.
// Pass ?admin=1 with a valid session to see everything (used by the admin UI).
exports.list = async (req, res) => {
  const {
    q, category_id, style, medium, availability,
    price_min, price_max, page = 1, limit = 20,
  } = req.query;

  const isAdminView = req.profile?.role === 'ADMIN' && req.query.admin === '1';

  let query = supabaseAdmin
    .from('artworks')
    .select(ARTWORK_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (!isAdminView) query = query.eq('visibility', 'PUBLISHED');
  if (category_id)  query = query.eq('category_id', category_id);
  if (style)        query = query.eq('style', style);
  if (medium)       query = query.eq('medium', medium);
  if (availability) query = query.eq('tracking_status', availability);
  if (price_min)    query = query.gte('price', price_min);
  if (price_max)    query = query.lte('price', price_max);
  // FR-ART-008: free-text search across title, style, medium, story
  if (q) query = query.or(`title.ilike.%${q}%,style.ilike.%${q}%,medium.ilike.%${q}%,story.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ items: data, total: count, page: +page, pages: Math.ceil(count / limit) });
};

// DETAIL — public (FR-ART-010)
exports.detail = async (req, res) => {
  const isAdmin = req.profile?.role === 'ADMIN';
  let query = supabaseAdmin.from('artworks').select(ARTWORK_SELECT).eq('id', req.params.id);
  if (!isAdmin) query = query.eq('visibility', 'PUBLISHED');

  const { data, error } = await query.single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

// CREATE — admin only (FR-ART-001, FR-ART-002, FR-ART-003)
exports.create = async (req, res) => {
  const {
    title, medium, style, story, artist_ref_id, category_id,
    dimensions_h_cm, dimensions_w_cm, dimensions_d_cm,
    creation_date, valuation, cost_basis, price, currency,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (price != null && price < 0) return res.status(400).json({ error: 'Price must be >= 0' });

  const { data, error } = await supabaseAdmin
    .from('artworks')
    .insert({
      title, medium, style, story, artist_ref_id, category_id,
      dimensions_h_cm, dimensions_w_cm, dimensions_d_cm,
      creation_date, valuation, cost_basis, price,
      currency: currency || 'UGX',
      tracking_status: 'AVAILABLE',
      visibility: 'UNPUBLISHED',
    })
    .select(ARTWORK_SELECT)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// UPDATE — admin only (FR-ART-005, FR-ART-006, FR-ART-007)
exports.update = async (req, res) => {
  const { data: existing } = await supabaseAdmin
    .from('artworks').select('*, images:artwork_images(id)').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const {
    title, medium, style, story, artist_ref_id, category_id,
    dimensions_h_cm, dimensions_w_cm, dimensions_d_cm,
    creation_date, valuation, cost_basis, price, currency,
    tracking_status, visibility, featured,
  } = req.body;

  // BR-ART-001: can't publish without >=1 image and a populated story
  if (visibility === 'PUBLISHED') {
    const hasImage = existing.images?.length > 0;
    const hasStory = (story ?? existing.story)?.trim().length > 0;
    if (!hasImage || !hasStory) {
      return res.status(400).json({
        error: 'Cannot publish: artwork needs at least one image and a completed story field',
      });
    }
  }

  if (price != null && price < 0) return res.status(400).json({ error: 'Price must be >= 0' });

  const update = {
    title, medium, style, story, artist_ref_id, category_id,
    dimensions_h_cm, dimensions_w_cm, dimensions_d_cm,
    creation_date, valuation, cost_basis, price, currency,
    tracking_status, visibility, featured,
  };
  // strip undefined so a partial PATCH doesn't null out untouched columns
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('artworks').update(update).eq('id', req.params.id).select(ARTWORK_SELECT).single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// DELETE — admin only
exports.remove = async (req, res) => {
  const { error } = await supabaseAdmin.from('artworks').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};

// ---------------------------------------------------------------------------
// IMAGES — FR-ART-004. Files are uploaded client-side straight to Supabase
// Storage (same pattern as the original app); this just records metadata
// after the browser confirms the upload succeeded.
// ---------------------------------------------------------------------------

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 15 * 1024 * 1024; // VR-ART-001

exports.addImage = async (req, res) => {
  const { url, webp_url, is_primary, mime_type, size_bytes } = req.body;

  if (mime_type && !ALLOWED_MIME.includes(mime_type)) {
    return res.status(400).json({ error: 'Unsupported image format. Use JPG, PNG, or WebP.' });
  }
  if (size_bytes && size_bytes > MAX_BYTES) {
    return res.status(400).json({ error: 'Image exceeds the 15MB upload limit.' });
  }

  if (is_primary) {
    await supabaseAdmin.from('artwork_images')
      .update({ is_primary: false }).eq('artwork_id', req.params.id);
  }

  const { data, error } = await supabaseAdmin
    .from('artwork_images')
    .insert({ artwork_id: req.params.id, url, webp_url, is_primary: !!is_primary })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.removeImage = async (req, res) => {
  const { error } = await supabaseAdmin
    .from('artwork_images')
    .delete()
    .eq('id', req.params.imageId)
    .eq('artwork_id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};

// ---------------------------------------------------------------------------
// CATEGORIES — FR-ART-002
// ---------------------------------------------------------------------------
exports.listCategories = async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('artwork_categories').select('*').order('name');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.createCategory = async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
  const { data, error } = await supabaseAdmin
    .from('artwork_categories').insert({ name, slug }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.deleteCategory = async (req, res) => {
  const { error } = await supabaseAdmin.from('artwork_categories').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
