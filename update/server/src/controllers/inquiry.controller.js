const { supabaseAdmin } = require('../config/supabase');
const PDFDocument = require('pdfkit');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // VR-INQ-001
const VALID_CLASSIFICATIONS = [
  'ARTWORK_PURCHASE', 'CUSTOM_COMMISSION', 'MURAL_PROJECT',
  'SCULPTURE_INSTALLATION', 'ART_CLASS_BOOKING', 'GENERAL_INFO',
]; // BR-INQ-001

async function findOrCreateCustomer({ name, email, phone }) {
  const { data: existing } = await supabaseAdmin
    .from('customers').select('*').ilike('email', email).maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('customers').insert({ name, email, phone }).select().single();
  if (error) throw error;
  return data;
}

// CREATE — public inquiry form (FR-INQ-001, FR-INQ-002, FR-INQ-003)
exports.create = async (req, res) => {
  const { name, email, phone, classification, message, artwork_id } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!VALID_CLASSIFICATIONS.includes(classification)) {
    return res.status(400).json({ error: 'Invalid inquiry classification' });
  }

  try {
    const customer = await findOrCreateCustomer({ name, email, phone });

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .insert({
        customer_id: customer.id,
        artwork_id: artwork_id || null,
        classification,
        message,
        status: 'NEW',
      })
      .select('*, customer:customers(*), artwork:artworks(id, title)')
      .single();

    if (error) throw error;

    // TODO: wire up the email/WhatsApp notification gateway here (section 4.2
    // "Communication Links"). Kept out of this controller so notification
    // provider choice doesn't block the core inquiry flow from working.

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// LIST — admin queue with sort/filter/search (FR-INQ-004)
exports.list = async (req, res) => {
  const { status, classification, q, page = 1, limit = 20 } = req.query;

  let query = supabaseAdmin
    .from('inquiries')
    .select('*, customer:customers(*), artwork:artworks(id, title)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq('status', status);
  if (classification) query = query.eq('classification', classification);
  if (q) query = query.ilike('message', `%${q}%`);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ items: data, total: count, page: +page, pages: Math.ceil(count / limit) });
};

exports.detail = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*, customer:customers(*), artwork:artworks(id, title)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

// UPDATE STATUS / NOTES — admin (FR-INQ-005, FR-INQ-006)
exports.update = async (req, res) => {
  const { status, internal_notes } = req.body;
  const update = { status, internal_notes };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('inquiries').update(update).eq('id', req.params.id)
    .select('*, customer:customers(*), artwork:artworks(id, title)').single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// GENERATE PDF QUOTE — admin (FR-INQ-007)
// Builds a simple itemized quotation PDF, uploads it to the `quotes` bucket
// in Supabase Storage, and links it on the inquiry record.
exports.generateQuote = async (req, res) => {
  const { line_items = [], notes } = req.body; // [{ description, amount }]

  const { data: inquiry, error: fetchErr } = await supabaseAdmin
    .from('inquiries').select('*, customer:customers(*)').eq('id', req.params.id).single();
  if (fetchErr || !inquiry) return res.status(404).json({ error: 'Inquiry not found' });

  try {
    const buffer = await buildQuotePdf(inquiry, line_items, notes);
    const path = `quotes/${inquiry.id}-${Date.now()}.pdf`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('documents')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true });
    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('documents').getPublicUrl(path);

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .update({ quote_pdf_url: publicUrl, status: 'QUOTED' })
      .eq('id', inquiry.id)
      .select('*, customer:customers(*), artwork:artworks(id, title)')
      .single();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to generate quote: ${err.message}` });
  }
};

function buildQuotePdf(inquiry, lineItems, notes) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Twebaze Art Studio — Quotation', { align: 'center' }).moveDown();
    doc.fontSize(10)
      .text(`Quote Date: ${new Date().toLocaleDateString()}`)
      .text(`Prepared for: ${inquiry.customer?.name || ''} (${inquiry.customer?.email || ''})`)
      .text(`Reference Inquiry: ${inquiry.id}`)
      .moveDown();

    doc.fontSize(12).text('Itemized Charges', { underline: true }).moveDown(0.5);
    let total = 0;
    lineItems.forEach((item) => {
      const amount = Number(item.amount) || 0;
      total += amount;
      doc.fontSize(10).text(`${item.description}`, { continued: true })
        .text(`  UGX ${amount.toLocaleString()}`, { align: 'right' });
    });
    doc.moveDown().fontSize(12).text(`Total: UGX ${total.toLocaleString()}`, { align: 'right' });

    if (notes) doc.moveDown().fontSize(10).text(`Notes: ${notes}`);

    doc.end();
  });
}
