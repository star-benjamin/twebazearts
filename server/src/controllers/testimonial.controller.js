const { supabaseAdmin } = require('../config/supabase');

// LIST — public shows only published; admin (?admin=1) sees everything
exports.list = async (req, res) => {
  const isAdminView = req.profile?.role === 'ADMIN' && req.query.admin === '1';

  let query = supabaseAdmin
    .from('testimonials')
    .select('*, related_artwork:artworks(id, title), related_project:projects(id, title)')
    .order('created_at', { ascending: false });

  if (!isAdminView) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// CREATE — admin logs a testimonial (FR-ADM-002)
exports.create = async (req, res) => {
  const { customer_name, content, related_artwork_id, related_project_id } = req.body;
  if (!customer_name || !content) return res.status(400).json({ error: 'customer_name and content are required' });

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({ customer_name, content, related_artwork_id: related_artwork_id || null, related_project_id: related_project_id || null })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const { customer_name, content, related_artwork_id, related_project_id, published } = req.body;
  const update = { customer_name, content, related_artwork_id, related_project_id, published };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('testimonials').update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.remove = async (req, res) => {
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
