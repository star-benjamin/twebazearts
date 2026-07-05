const { supabaseAdmin } = require('../config/supabase');

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// LIST — public shows only published; admin (?admin=1) sees drafts too
exports.list = async (req, res) => {
  const isAdminView = req.profile?.role === 'ADMIN' && req.query.admin === '1';

  let query = supabaseAdmin.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (!isAdminView) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.detailBySlug = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('blog_posts').select('*').eq('slug', req.params.slug).eq('published', true).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

// CREATE — admin markdown editor (FR-ADM-003)
exports.create = async (req, res) => {
  const { title, content_markdown, published } = req.body;
  if (!title || !content_markdown) return res.status(400).json({ error: 'title and content_markdown are required' });

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      title, content_markdown, slug: slugify(title),
      published: !!published,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'A post with this title/slug already exists' });
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const { title, content_markdown, published } = req.body;
  const update = { title, content_markdown, published };
  if (title) update.slug = slugify(title);
  if (published === true) update.published_at = new Date().toISOString();
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('blog_posts').update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.remove = async (req, res) => {
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
