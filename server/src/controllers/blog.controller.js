const { supabaseAdmin } = require('../config/supabase');
const PDFDocument = require('pdfkit');

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Flattens the join-table shape Supabase returns
// (blog_post_artworks: [{ artwork: {...} }]) into a plain array of artworks,
// so the frontend never has to know the join table exists.
function flattenTags(post) {
  if (!post) return post;
  const tagged_artworks = (post.blog_post_artworks || [])
    .map((j) => j.artwork)
    .filter(Boolean);
  const { blog_post_artworks, ...rest } = post;
  return { ...rest, tagged_artworks };
}

const TAGGED_SELECT = `
  *,
  blog_post_artworks (
    artwork:artworks (
      id, title, price, currency,
      images:artwork_images (url, webp_url, is_primary)
    )
  )
`;

// Replaces a post's tag set with the given artwork_ids. Called after both
// create and update — safe to call with an empty array (just clears tags).
async function syncTags(postId, artworkIds) {
  await supabaseAdmin.from('blog_post_artworks').delete().eq('blog_post_id', postId);
  if (artworkIds?.length) {
    const rows = artworkIds.map((artwork_id) => ({ blog_post_id: postId, artwork_id }));
    const { error } = await supabaseAdmin.from('blog_post_artworks').insert(rows);
    if (error) throw error;
  }
}

// LIST — public shows only published; admin (?admin=1) sees drafts too
exports.list = async (req, res) => {
  const isAdminView = req.profile?.role === 'ADMIN' && req.query.admin === '1';

  let query = supabaseAdmin.from('blog_posts').select(TAGGED_SELECT).order('created_at', { ascending: false });
  if (!isAdminView) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json((data || []).map(flattenTags));
};

exports.detailBySlug = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('blog_posts').select(TAGGED_SELECT).eq('slug', req.params.slug).eq('published', true).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(flattenTags(data));
};

// Used internally by exportPdf, and handy for the admin edit view — includes
// drafts (no published filter), unlike detailBySlug.
async function fetchPostById(id) {
  const { data, error } = await supabaseAdmin.from('blog_posts').select(TAGGED_SELECT).eq('id', id).single();
  if (error) throw error;
  return flattenTags(data);
}

// CREATE — admin markdown editor (FR-ADM-003), now with artwork tagging
exports.create = async (req, res) => {
  const { title, content_markdown, published, artwork_ids } = req.body;
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

  try {
    await syncTags(data.id, artwork_ids);
  } catch (tagErr) {
    return res.status(400).json({ error: `Post created but tagging failed: ${tagErr.message}` });
  }

  res.status(201).json(await fetchPostById(data.id));
};

exports.update = async (req, res) => {
  const { title, content_markdown, published, artwork_ids } = req.body;
  const update = { title, content_markdown, published };
  if (title) update.slug = slugify(title);
  if (published === true) update.published_at = new Date().toISOString();
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { error } = await supabaseAdmin.from('blog_posts').update(update).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });

  // Only touch tags if artwork_ids was actually included in the request —
  // omitting the field leaves existing tags untouched rather than wiping them.
  if (artwork_ids !== undefined) {
    try {
      await syncTags(req.params.id, artwork_ids);
    } catch (tagErr) {
      return res.status(400).json({ error: `Post updated but tagging failed: ${tagErr.message}` });
    }
  }

  res.json(await fetchPostById(req.params.id));
};

exports.remove = async (req, res) => {
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};

// ---------------------------------------------------------------------------
// EXPORT PDF — admin bundles the journal entry + tagged artworks into a
// shareable PDF (post text + each tagged artwork's image, title, and price).
// ---------------------------------------------------------------------------

// Minimal markdown-to-plain-text cleanup — good enough for a PDF export,
// not a full renderer. Strips heading/emphasis/link syntax, drops images
// (tagged artworks are embedded separately, in full, further down the PDF).
function stripMarkdown(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^>\s?/gm, '')
    .trim();
}

exports.exportPdf = async (req, res) => {
  let post;
  try {
    post = await fetchPostById(req.params.id);
  } catch {
    return res.status(404).json({ error: 'Post not found' });
  }

  try {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${post.slug}.pdf"`);
    doc.pipe(res);

    doc.fontSize(9).fillColor('#7a7268')
      .text('TWEBAZE ART STUDIO — JOURNAL', { characterSpacing: 1 })
      .moveDown(0.3);
    doc.fontSize(22).fillColor('#0a0a0a').font('Helvetica-Bold').text(post.title);
    doc.fontSize(9).fillColor('#7a7268').font('Helvetica')
      .text(new Date(post.published_at || post.created_at).toLocaleDateString())
      .moveDown(1);

    doc.fontSize(11).fillColor('#0a0a0a').text(stripMarkdown(post.content_markdown), {
      lineGap: 4,
    });

    if (post.tagged_artworks?.length) {
      doc.moveDown(1.5);
      doc.fontSize(13).font('Helvetica-Bold').text('Featured Pieces').moveDown(0.5);
      doc.font('Helvetica');

      for (const artwork of post.tagged_artworks) {
        const primaryImage = artwork.images?.find((i) => i.is_primary) || artwork.images?.[0];
        if (primaryImage?.url) {
          try {
            const imgResp = await fetch(primaryImage.url);
            const imgBuffer = Buffer.from(await imgResp.arrayBuffer());
            if (doc.y > 600) doc.addPage();
            doc.image(imgBuffer, { fit: [200, 200] }).moveDown(0.3);
          } catch {
            // Image fetch failed (e.g. broken URL) — skip the image, still
            // list the artwork's text details below so export doesn't fail.
          }
        }
        doc.fontSize(12).font('Helvetica-Bold').text(artwork.title);
        doc.fontSize(10).font('Helvetica').fillColor('#7a7268')
          .text(artwork.price != null ? `${artwork.currency || 'UGX'} ${Number(artwork.price).toLocaleString()}` : 'Price on request')
          .fillColor('#0a0a0a')
          .moveDown(1);
      }
    }

    doc.end();
  } catch (err) {
    // Headers may already be sent if pdfkit started streaming — guard before
    // trying to send a JSON error on top of a partially-written PDF.
    if (!res.headersSent) res.status(500).json({ error: `PDF export failed: ${err.message}` });
    else res.end();
  }
};
